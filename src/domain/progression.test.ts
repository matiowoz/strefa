import { describe, expect, it } from 'vitest';
import { arrange, moveItem } from './inventory';
import { createInitialState, selectLocation, settleExpedition, startExpedition } from './game';
import { addResources, craft, quantity, repairWorkbench } from './preparation';
import { isGameState, validateSave } from './validation';

const workshopReturn = () => {
  const initial = createInitialState(0);
  const trip = startExpedition(selectLocation(initial, 'workshop', 0), 1000, () => 0.99);
  return settleExpedition(trip, trip.activeExpedition!.id, 121000);
};

describe('zmienne znaleziska', () => {
  it('dopuszcza pusty powrót i różne ilości, utrwalone przed rozliczeniem', () => {
    const initial = createInitialState(0);
    const empty = startExpedition(initial, 1000, () => 0);
    const full = startExpedition(initial, 1000, () => 0.99);
    expect(empty.activeExpedition!.cargo.loot).toEqual([]);
    expect(full.activeExpedition!.cargo.loot).toEqual([{ itemId: 'scrap', quantity: 4 }, { itemId: 'raw-water', quantity: 3 }, { itemId: 'food', quantity: 3 }, { itemId: 'cloth', quantity: 2 }]);
    const loaded = validateSave(JSON.parse(JSON.stringify(empty)));
    const result = settleExpedition(loaded, loaded.activeExpedition!.id, 61000);
    expect(result.inventory).toEqual(initial.inventory);
    expect(result.lastReport!.scrap).toBe(0);
    expect(isGameState(result)).toBe(true);
    expect(validateSave(JSON.parse(JSON.stringify(full))).activeExpedition).toEqual(full.activeExpedition);
  });
  it('waliduje łupy bez złomu i odrzuca ujemne ilości, duplikaty oraz błędny raport', () => {
    const trip = startExpedition(createInitialState(0), 1000, () => 0);
    trip.activeExpedition!.cargo.loot = [{ itemId: 'cloth', quantity: 1 }];
    expect(isGameState(trip)).toBe(true);
    const report = settleExpedition(trip, trip.activeExpedition!.id, 61000);
    expect(isGameState(report)).toBe(true);
    expect(isGameState({ ...report, lastReport: { ...report.lastReport!, scrap: 1 } })).toBe(false);
    trip.activeExpedition!.cargo.loot.push({ itemId: 'cloth', quantity: 1 });
    expect(isGameState(trip)).toBe(false);
    trip.activeExpedition!.cargo.loot = [{ itemId: 'scrap', quantity: -1 }];
    expect(isGameState(trip)).toBe(false);
    expect(() => startExpedition(createInitialState(0), 1000, () => 1)).toThrow();
  });
});

describe('stół roboczy', () => {
  it('wymaga powrotu z warsztatu i kompletu materiałów, potem odblokowuje recepturę', () => {
    const initial = createInitialState(0);
    expect(() => repairWorkbench(initial, 1000)).toThrow();
    expect(() => craft(initial, 'dressings', 1000)).toThrow('napraw');
    const returned = workshopReturn();
    expect(returned.progress.workshopVisited).toBe(true);
    const stored = moveItem(returned, returned.inventory.find((entry) => entry.itemId === 'cloth')!.id, 0, undefined, 122000);
    const repaired = repairWorkbench(stored, 123000);
    expect(repaired.progress.workbenchRepaired).toBe(true);
    expect(quantity([...repaired.inventory, ...repaired.stash], 'scrap')).toBe(4);
    expect(quantity([...repaired.inventory, ...repaired.stash], 'cloth')).toBe(0);
    expect(repairWorkbench(repaired, 124000)).toBe(repaired);
    expect(isGameState(repaired)).toBe(true);
    const ready = arrange({ ...repaired, inventory: addResources(repaired.inventory, [{ itemId: 'cloth', quantity: 2 }]) });
    expect(quantity(craft(ready, 'dressings', 124000).inventory, 'bandage')).toBe(5);
    expect(stored.progress.workbenchRepaired).toBe(false);
    expect(() => repairWorkbench({ ...initial, progress: { workshopVisited: true, workbenchRepaired: false } }, 1000)).toThrow('Brakuje');
  });
  it('nie zalicza warsztatu przed odbiorem ani po innej wyprawie', () => {
    const started = startExpedition(selectLocation(createInitialState(0), 'workshop', 0), 1000);
    expect(started.progress.workshopVisited).toBe(false);
    expect(() => repairWorkbench(started, 200000)).toThrow();
    const outskirts = startExpedition(createInitialState(0), 1000);
    expect(settleExpedition(outskirts, outskirts.activeExpedition!.id, 61000).progress.workshopVisited).toBe(false);
  });
});

it('migruje rzeczywisty v6 z aktywną wyprawą i zachowuje sprzęt, koszty, łupy i położenia', () => {
  const initial = createInitialState(0);
  const legacy = arrange({ ...initial, inventory: [initial.backpack, ...initial.inventory], positions: {}, preparation: { kit: 'stocked', equipmentId: initial.backpack.id } });
  const cargo = { equipmentId: initial.backpack.id, water: 2, ration: 2, loot: [{ itemId: 'scrap', quantity: 4 }] };
  const old = { ...legacy, schemaVersion: 6, activeExpedition: { id: 'legacy-trip', cargo, plan: { locationId: 'workshop', strategy: 'balanced' }, status: 'running', startedAt: 1000, expectedReturnAt: 121000 } };
  const result = validateSave(old);
  expect(result.backpack).toEqual(initial.backpack);
  expect(result.inventory).toEqual(initial.inventory);
  expect(result.activeExpedition).toEqual(old.activeExpedition);
  expect(result.positions['starter-water']).toEqual(old.positions['starter-water']);
  expect(result.positions[initial.backpack.id]).toBeUndefined();
  expect(isGameState(result)).toBe(true);
  expect(settleExpedition(result, 'legacy-trip', 121000).lastReport!.cargo).toEqual(cargo);
  expect(() => validateSave({ ...old, positions: {} })).toThrow();
});

it('waliduje osobny plecak i postęp bez cichego naprawiania aktualnego zapisu', () => {
  const state = createInitialState(0);
  expect(isGameState({ ...state, backpack: null })).toBe(false);
  expect(isGameState({ ...state, backpack: { ...state.backpack, id: state.inventory[0].id } })).toBe(false);
  expect(isGameState({ ...state, progress: { workshopVisited: false, workbenchRepaired: true } })).toBe(false);
  expect(isGameState({ ...state, backpack: { ...state.backpack, condition: 101 } })).toBe(false);
});
