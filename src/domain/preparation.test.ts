import { moveItem } from './inventory';
import { describe, expect, it } from 'vitest';
import { createInitialState, startExpedition, settleExpedition } from './game';
import { addResources, consume, craft, quantity, recipes } from './preparation';
import { isGameState, validateSave } from './validation';

function returned() {
  const started = startExpedition(createInitialState(0), 1000, () => 0.6);
  return settleExpedition(started, started.activeExpedition!.id, 61000);
}

describe('przygotowanie i bezpieczny powrót', () => {
  it('wyrusza z obecnym ekwipunkiem i nie zużywa zapasów przy starcie', () => {
    const initial = createInitialState(0);
    const started = startExpedition(initial, 1000, () => 0.6);
    expect(started.inventory).toEqual(initial.inventory);
    expect(started.backpack).toEqual(initial.backpack);
    expect(started.inventory.some((entry) => entry.id === started.backpack.id)).toBe(false);
    expect(() => startExpedition(started, 2000)).toThrow();
    const loaded = validateSave(JSON.parse(JSON.stringify(started)));
    const result = settleExpedition(loaded, loaded.activeExpedition!.id, 61000);
    expect(result.backpack).toEqual(initial.backpack);
    expect(quantity(result.inventory, 'water')).toBe(3);
    expect(result.lastReport?.cargo).toEqual(started.activeExpedition?.cargo);
    expect(settleExpedition(result, started.activeExpedition!.id, 100000)).toBe(result);
  });
  it('pozwala wyruszyć z pustym plecakiem bez pobierania czegokolwiek ze skrytki', () => {
    const initial = createInitialState(0);
    const empty = initial.inventory.reduce((state, entry) => moveItem(state, entry.id, 0, undefined, 0), initial);
    const result = startExpedition(empty, 100, () => 0);
    expect(result.inventory).toEqual([]);
    expect(result.stash).toEqual(initial.inventory);
    expect(result.activeExpedition?.cargo).toMatchObject({ water: 0, ration: 0, equipmentId: initial.backpack.id });
  });
  it('zużywa zapasy rozłożone między stosami bez ujemnych ilości', () => {
    const entries = [{ id: 'a', itemId: 'water', quantity: 1, condition: null }, { id: 'b', itemId: 'water', quantity: 2, condition: null }];
    expect(consume(entries, [{ itemId: 'water', quantity: 2 }])).toEqual([{ ...entries[1], quantity: 1 }]);
    expect(() => consume(entries, [{ itemId: 'water', quantity: 4 }])).toThrow();
    expect(quantity(entries, 'water')).toBe(3);
  });
});

describe('receptury', () => {
  it.each(recipes)('ma deterministyczny koszt i wynik: $id', (recipe) => {
    const initial = createInitialState(0);
    const state = { ...initial, progress: { workshopVisited: true, workbenchRepaired: true }, inventory: addResources([], recipe.costs), positions: {} };
    const result = craft(state, recipe.id, 1000);
    expect(result).toEqual(craft(state, recipe.id, 1000));
    for (const cost of recipe.costs) expect(quantity(result.inventory, cost.itemId)).toBe(quantity(state.inventory, cost.itemId) - cost.quantity);
    for (const output of recipe.output) expect(quantity(result.inventory, output.itemId)).toBe(quantity(state.inventory, output.itemId) + output.quantity);
    expect(() => craft(result, recipe.id)).toThrow('Brakuje');
    expect(isGameState(result)).toBe(true);
  });
  it('pozwala przygotować znalezione zasoby przed następną wyprawą', () => {
    const result = returned();
    const next = craft(craft(result, 'water', 62000), 'ration', 62000);
    expect(startExpedition(next, 63000).activeExpedition).not.toBeNull();
    expect(() => craft(result, 'missing')).toThrow();
  });
  it('odrzuca przepełnienie wyniku bez pobrania materiałów', () => {
    const initial = returned();
    initial.inventory.find((entry) => entry.itemId === 'water')!.quantity = Number.MAX_SAFE_INTEGER;
    expect(() => craft(initial, 'water')).toThrow();
    expect(quantity(initial.inventory, 'raw-water')).toBe(2);
  });
});

describe('migracja etapu 2', () => {
  it('nie obciąża aktywnej starej wyprawy kosztami i zachowuje stary raport', () => {
    const initial = createInitialState(0);
    const old = { ...initial, schemaVersion: 2, activeExpedition: { id: 'old', plan: { locationId: 'workshop', strategy: 'balanced' }, status: 'running', startedAt: 0, expectedReturnAt: 120000 }, lastReport: { expeditionId: 'previous', locationId: 'outskirts', returnedAt: 0, scrap: 2 } };
    const loaded = validateSave(old);
    expect(loaded.inventory).toEqual(initial.inventory);
    expect(loaded.lastReport?.cargo.water).toBe(0);
    const result = settleExpedition(loaded, 'old', 120000);
    expect(quantity(result.inventory, 'water')).toBe(3);
    expect(quantity(result.inventory, 'scrap')).toBe(8);
    expect(quantity(result.inventory, 'food')).toBe(0);
  });
  it('odrzuca niepełny v3 i uszkodzony v2, zamiast naprawiać je domyślnymi danymi', () => {
    const current = createInitialState(0);
    expect(() => validateSave({ ...current, preparation: null })).toThrow();
    expect(() => validateSave({ ...current, schemaVersion: 2, lastReport: {} })).toThrow();
    const started = startExpedition(current, 1000);
    started.activeExpedition!.cargo.water = -1;
    expect(isGameState(started)).toBe(false);
  });
});
