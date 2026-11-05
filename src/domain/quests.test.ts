import { describe, expect, it } from 'vitest';
import { createInitialState, settleExpedition, startExpedition } from './game';
import { applyGameChange, claimQuest, quests, syncQuestProgress } from './quests';
import { arrange, moveItem } from './inventory';
import { equipItem, unequipItem } from './equipment';
import { useItem } from './useItem';
import { quantity } from './preparation';
import { isGameState, validateSave } from './validation';
import type { GameState } from './types';

const initial = () => createInitialState(1000);
function reserve(): GameState {
  return arrange({ ...initial(), inventory: [], stash: [
    { id: 'w', itemId: 'water', quantity: 3, condition: null },
    { id: 'r', itemId: 'ration', quantity: 3, condition: null },
    { id: 'b', itemId: 'bandage', quantity: 2, condition: null },
  ], positions: {} });
}
describe('dziennik zadań', () => {
  it('nie zalicza zapasów startowych ani trwającej wyprawy', () => {
    expect(syncQuestProgress(initial()).quests.completed).toEqual([]);
    expect(syncQuestProgress(startExpedition(initial(), 1000, () => .6)).quests.completed).toEqual([]);
    expect(claimQuest(initial(), 'supplies')).toEqual(initial());
  });
  it('zalicza dopiero odebrany raport ze znaleziskami', () => {
    const trip = startExpedition(initial(), 1000, () => .6);
    const returned = applyGameChange(trip, (state) => settleExpedition(state, state.activeExpedition!.id, 200000));
    expect(returned.quests.completed).toContain('supplies');
    const empty = { ...returned, quests: { completed: [], claimed: [] }, lastReport: { ...returned.lastReport!, cargo: { ...returned.lastReport!.cargo, loot: [] } } } satisfies GameState;
    expect(syncQuestProgress(empty).quests.completed).not.toContain('supplies');
  });
  it('zalicza naprawę i nie samo odwiedzenie warsztatu', () => {
    expect(syncQuestProgress({ ...initial(), progress: { workshopVisited: true, workbenchRepaired: false } }).quests.completed).toEqual([]);
    expect(syncQuestProgress({ ...initial(), progress: { workshopVisited: true, workbenchRepaired: true } }).quests.completed).toContain('workbench');
  });
  it('pamięta założenie kurtki po zdjęciu', () => {
    let state = arrange({ ...initial(), inventory: [...initial().inventory, { id: 'j', itemId: 'jacket', quantity: 1, condition: 60 }] });
    expect(syncQuestProgress(state).quests.completed).not.toContain('jacket');
    state = applyGameChange(state, (previous) => equipItem(previous, 'j', 'body', 2000));
    state = applyGameChange(state, (previous) => unequipItem(previous, 'j', undefined, 3000));
    expect(state.equipped.body).toBeNull();
    expect(state.quests.completed).toContain('jacket');
  });
  it('sumuje rozdzielone stosy wyłącznie ze skrytki i zachowuje cel po użyciu', () => {
    const state = reserve();
    const split = arrange({ ...state, stash: [...state.stash.filter((e) => e.id !== 'w'), { id: 'w1', itemId: 'water', quantity: 1, condition: null }, { id: 'w2', itemId: 'water', quantity: 2, condition: null }], positions: {} });
    expect(syncQuestProgress(split).quests.completed).toContain('reserve');
    const used = applyGameChange(split, (previous) => useItem(previous, 'w1', 2000));
    expect(used.quests.completed).toContain('reserve');
    const moved = moveItem(state, 'w', -1, { x: 0, y: 0 }, 2000);
    expect(syncQuestProgress(moved).quests.completed).not.toContain('reserve');
  });
  it('odbiera niezależnie od kolejności i tylko raz, bez zużywania wymaganych zapasów', () => {
    const state = syncQuestProgress(reserve());
    const claimed = claimQuest(state, 'reserve', 2000);
    expect(quantity(claimed.stash, 'water')).toBe(3);
    expect(quantity(claimed.inventory, 'scrap')).toBe(4);
    expect(claimQuest(claimed, 'reserve', 3000)).toBe(claimed);
    expect(validateSave(claimed)).toEqual(claimed);
  });
  it('nie pozwala odebrać nagrody podczas wyprawy', () => {
    const state = { ...reserve(), quests: { completed: ['reserve'], claimed: [] } } satisfies GameState;
    const trip = startExpedition(state, 1000, () => .6);
    expect(claimQuest(trip, 'reserve', 1001)).toBe(trip);
  });
  it('nie gubi nagrody przy pełnym plecaku i skrytce', () => {
    const entries = Array.from({ length: 117 }, (_, i) => ({ id: `full-${i}`, itemId: 'bandage', quantity: 1, condition: null }));
    const state = arrange({ ...initial(), inventory: entries, positions: {}, quests: { completed: ['workbench'], claimed: [] } });
    expect(state.overflow).toHaveLength(0);
    const claimed = claimQuest(state, 'workbench', 2000);
    expect(claimed.overflow.some((e) => e.itemId === 'antibiotic')).toBe(true);
    expect(isGameState(claimed)).toBe(true);
  });
  it('migruje v10 z widocznymi osiągnięciami bez przyznawania nagród', () => {
    const state = reserve(); state.progress = { workshopVisited: true, workbenchRepaired: true };
    state.equipped.body = { id: 'j', itemId: 'jacket', quantity: 1, condition: 50 };
    const { quests: _, ...old } = state;
    const migrated = validateSave({ ...old, schemaVersion: 10 });
    expect(migrated.quests).toEqual({ completed: ['workbench', 'jacket', 'reserve'], claimed: [] });
    expect(migrated.stash).toEqual(state.stash);
    expect(migrated.updatedAt).toBe(state.updatedAt);
  });
  it('odrzuca obce, powielone lub niezaliczone identyfikatory nagród', () => {
    for (const progress of [{ completed: ['alien'], claimed: [] }, { completed: ['reserve', 'reserve'], claimed: [] }, { completed: [], claimed: ['reserve'] }]) {
      expect(() => validateSave({ ...initial(), quests: progress })).toThrow();
    }
    expect(quests).toHaveLength(4);
  });
});
