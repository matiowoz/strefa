import { expect, it, vi } from 'vitest';
import { createInitialState, settleExpedition, startExpedition } from './game';
import { arrange } from './inventory';
import { useItem, consumableIds } from './useItem';
import { isGameState, validateSave } from './validation';

it.each(['outskirts', 'workshop'])('wyprawa do %s nie losuje choroby i ma podstawowy czas', (location) => {
  const random = vi.fn(() => 0); // Only the blocked-road event requires a draw.
  const state = { ...createInitialState(0), selectedLocationId: location };
  const trip = startExpedition(state, 1000, random);
  expect(random).toHaveBeenCalledTimes(1);
  expect(trip.activeExpedition!.expectedReturnAt).toBe(location === 'outskirts' ? 61000 : 121000);
  expect(trip.illness).toBeNull();expect(trip.activeExpedition!.health).toBeNull();
  expect(isGameState(trip)).toBe(true);
});

it.each([10, 11])('migracja v%s usuwa chorobę i karę czasu, zachowując rzeczy i cele', (schemaVersion) => {
  const state = arrange({ ...createInitialState(0), inventory: [...createInitialState(0).inventory, { id: 'medicine', itemId: 'antibiotic', quantity: 2, condition: null }] });
  const trip = startExpedition(state, 1000, () => .5);
  const old = { ...trip, schemaVersion, illness: { startedAt: 0, endsAt: 100000 },
    activeExpedition: { ...trip.activeExpedition!, expectedReturnAt: 91000, health: { jacketWorn: false, sickAtStart: true, contracted: false } } };
  const next = validateSave(old);
  expect(next.schemaVersion).toBe(12);expect(next.illness).toBeNull();
  expect(next.activeExpedition).toEqual({ ...trip.activeExpedition!, health: null });
  expect(next.inventory).toEqual(state.inventory);expect(next.quests).toEqual(state.quests);
  const returned = settleExpedition(next, next.activeExpedition!.id, 61000);
  expect(returned.lastReport!.health).toBeNull();expect(returned.illness).toBeNull();
  expect(settleExpedition(returned, next.activeExpedition!.id, 100000)).toBe(returned);
});

it('usuwa zaplanowane zachorowanie i stary opis raportu, bez zmiany łupów i odebranych nagród', () => {
  const trip = startExpedition(createInitialState(0), 1000, () => .5);
  const returned = settleExpedition(trip, trip.activeExpedition!.id, 61000);
  const old = { ...returned, schemaVersion: 11, illness: { startedAt: 61000, endsAt: 2000000 },
    quests: { completed: ['workbench'], claimed: ['workbench'] },
    lastReport: { ...returned.lastReport!, health: { jacketWorn: false, sickAtStart: false, contracted: true } } };
  const next = validateSave(old);
  expect(next.lastReport!.health).toBeNull();expect(next.lastReport!.cargo).toEqual(returned.lastReport!.cargo);
  expect(next.quests.claimed).toEqual(['workbench']);
  const active = validateSave({ ...trip, schemaVersion: 11, illness: { startedAt: 61000, endsAt: 2000000 }, activeExpedition: { ...trip.activeExpedition!, health: old.lastReport.health } });
  expect(active.illness).toBeNull();expect(active.activeExpedition!.expectedReturnAt).toBe(61000);
});

it('nie zużywa zachowanego antybiotyku i nie znajduje nowych antybiotyków', () => {
  const state = arrange({ ...createInitialState(0), inventory: [{ id: 'med', itemId: 'antibiotic', quantity: 2, condition: null }] });
  expect(consumableIds.has('antibiotic')).toBe(false);
  expect(() => useItem(state, 'med', 1000)).toThrow('nie można użyć');
  for (const value of [.2, .5, .9]) {
    const trip = startExpedition(state, 1000, () => value);
    expect(trip.activeExpedition!.cargo.loot.some((e) => e.itemId === 'antibiotic')).toBe(false);
  }
});

it('odrzuca błędny starszy zapis i ponowne wprowadzenie choroby w v12', () => {
  const state = createInitialState(0);
  expect(() => validateSave({ ...state, schemaVersion: 11, illness: { startedAt: 2, endsAt: 1 } })).toThrow();
  expect(isGameState({ ...state, illness: { startedAt: 0, endsAt: 1000 } })).toBe(false);
});
