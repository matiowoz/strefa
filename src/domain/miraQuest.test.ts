import { expect, it, vi } from 'vitest';
import { createInitialState, selectLocation, startExpedition, settleExpedition } from './game';
import { acceptMiraQuest, completeMiraQuest, miraDialogue } from './miraQuest';
import { arrange, moveItem } from './inventory';
import { quantity } from './preparation';
import { isGameState, validateSave } from './validation';

const active = () => acceptMiraQuest(selectLocation(createInitialState(0), 'workshop', 0), 1000);
const withParts = () => arrange({ ...active(), inventory: [...active().inventory, { id: 'parts', itemId: 'electronic-parts', quantity: 2, condition: null }] });
it('przyjmuje zadanie raz, po odebraniu raportu', () => {
  const state = active();expect(state.miraQuest).toBe('active');expect(acceptMiraQuest(state, 2000)).toBe(state);
  const trip = startExpedition(createInitialState(0), 1000, () => .5);
  expect(() => acceptMiraQuest(trip, 61000)).toThrow('raport');
});
it('dwie wyprawy, odbiór raportów, dostarczenie części i jednorazowa nagroda', () => {
  let state = active();
  for (const start of [2000, 124000]) {
    const trip = startExpedition(state, start, () => .5);
    expect(trip.activeExpedition!.cargo.loot).toContainEqual({ itemId: 'electronic-parts', quantity: 1 });
    state = settleExpedition(validateSave(trip), trip.activeExpedition!.id, start + 120000);
  }
  const water = quantity(state.inventory, 'water');const ration = quantity(state.inventory, 'ration');const bandage = quantity(state.inventory, 'bandage');
  const next = completeMiraQuest(state, 250000);
  expect(next.miraQuest).toBe('completed');expect(quantity(next.inventory, 'electronic-parts')).toBe(0);
  expect(next.positions['resource-electronic-parts']).toBeUndefined();
  expect(quantity(next.inventory, 'water')).toBe(water + 2);expect(quantity(next.inventory, 'ration')).toBe(ration + 2);expect(quantity(next.inventory, 'bandage')).toBe(bandage + 1);
  expect(completeMiraQuest(next, 251000)).toBe(next);expect(acceptMiraQuest(next)).toBe(next);
  expect(miraDialogue(next)).toContain('stabilny');expect(next.trader).toEqual(state.trader);expect(isGameState(next)).toBe(true);
  expect(startExpedition(next, 252000, () => .5).activeExpedition!.cargo.loot.some((entry) => entry.itemId === 'electronic-parts')).toBe(false);
});
it.each([.599999, .6])('znalezisko ma próg 60%% i nie losuje ponownie przy odczycie', (chance) => {
  let i = 0;const random = vi.fn(() => i++ < 8 ? .5 : chance);
  const trip = startExpedition(active(), 2000, random);
  expect(trip.activeExpedition!.cargo.loot.some((entry) => entry.itemId === 'electronic-parts')).toBe(chance < .6);
  const calls = random.mock.calls.length;
  expect(validateSave(JSON.parse(JSON.stringify(trip))).activeExpedition).toEqual(trip.activeExpedition);
  expect(random).toHaveBeenCalledTimes(calls);
});
it('nie daje części przed przyjęciem, na osiedlu ani po zawróceniu', () => {
  const states = [selectLocation(createInitialState(0), 'workshop', 0), selectLocation(active(), 'outskirts', 0)];
  for (const state of states) expect(startExpedition(state, 2000, () => .5).activeExpedition!.cargo.loot.some((e) => e.itemId === 'electronic-parts')).toBe(false);
  expect(startExpedition(active(), 2000, () => 0).activeExpedition!.cargo.loot).toEqual([]);
});
it('nie oddaje części ze skrytki ani przed przyjęciem lub podczas wyprawy', () => {
  const state = withParts();const stored = moveItem(state, 'parts', 0, undefined, 2000);
  expect(() => completeMiraQuest(stored, 3000)).toThrow('plecaku');
  expect(() => completeMiraQuest({ ...state, miraQuest: 'available' }, 3000)).toThrow('przyjmij');
  const trip = startExpedition(state, 3000, () => .5);
  expect(() => completeMiraQuest(trip, 123000)).toThrow('raport');
});
it('sumuje oddawane części z rozdzielonych stosów, zachowując nadmiar', () => {
  const state = arrange({ ...active(), inventory: [...active().inventory, { id: 'p1', itemId: 'electronic-parts', quantity: 1, condition: null }, { id: 'p2', itemId: 'electronic-parts', quantity: 2, condition: null }] });
  const next = completeMiraQuest(state, 3000);expect(quantity(next.inventory, 'electronic-parts')).toBe(1);expect(next.inventory.some((entry) => entry.id === 'p1')).toBe(false);expect(isGameState(next)).toBe(true);
});
it('nie gubi nagrody przy pełnych siatkach', () => {
  const entries = Array.from({ length: 117 }, (_, i) => ({ id: `f${i}`, itemId: i === 0 ? 'electronic-parts' : 'ration', quantity: i === 0 ? 2 : 1, condition: null }));
  const state = arrange({ ...active(), inventory: entries, positions: {} });
  expect(state.overflow).toHaveLength(0);
  const next = completeMiraQuest(state, 2000);
  expect(quantity([...next.inventory, ...next.stash, ...next.overflow], 'electronic-parts')).toBe(0);
  expect(quantity([...next.inventory, ...next.stash, ...next.overflow], 'water')).toBe(2);
  expect(next.overflow.some((entry) => entry.itemId === 'water')).toBe(true);expect(isGameState(next)).toBe(true);
});
it('migruje v13 bez dopisywania części do trwającej wyprawy i bez resetu handlarza', () => {
  const initial = createInitialState(0);initial.trader.stock.water = 1;
  const trip = startExpedition(initial, 1000, () => .5);const { miraQuest: _, ...old } = trip;
  const next = validateSave({ ...old, schemaVersion: 13 });
  expect(next.miraQuest).toBe('available');expect(next.activeExpedition).toEqual(trip.activeExpedition);expect(next.trader.stock.water).toBe(1);expect(next.inventory).toEqual(trip.inventory);
});
it('odrzuca błędny stan zadania i części w złym zdarzeniu lub ilości', () => {
  expect(() => validateSave({ ...active(), miraQuest: 'claimed-twice' })).toThrow();
  const trip = startExpedition(active(), 2000, () => .5);
  const events = trip.activeExpedition!.events!;events[0].loot.find((entry) => entry.itemId === 'electronic-parts')!.quantity = 2;
  trip.activeExpedition!.cargo.loot.find((entry) => entry.itemId === 'electronic-parts')!.quantity = 2;
  expect(isGameState(trip)).toBe(false);
  const wrongSite = startExpedition(selectLocation(active(), 'outskirts', 0), 2000, () => .5);
  wrongSite.activeExpedition!.events![0].loot.push({ itemId: 'electronic-parts', quantity: 1 });
  wrongSite.activeExpedition!.cargo.loot.push({ itemId: 'electronic-parts', quantity: 1 });
  expect(isGameState(wrongSite)).toBe(false);
});
