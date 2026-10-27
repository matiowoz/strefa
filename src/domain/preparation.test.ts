import { describe, expect, it } from 'vitest';
import { createInitialState, startExpedition, settleExpedition } from './game';
import { addResources, consume, craft, prepareExpedition, quantity, recipes } from './preparation';
import { isGameState, validateSave } from './validation';

function returned() {
  const started = startExpedition(createInitialState(0), 1000);
  return settleExpedition(started, started.activeExpedition!.id, 61000);
}

describe('przygotowanie i bezpieczny powrót', () => {
  it('odejmuje pełne koszty raz i zachowuje sprzęt z jego stanem', () => {
    const initial = createInitialState(0);
    const prepared = prepareExpedition(initial, { kit: 'stocked', equipmentId: initial.inventory[0].id }, 100);
    const started = startExpedition(prepared, 1000);
    expect(quantity(started.inventory, 'water')).toBe(1);
    expect(quantity(started.inventory, 'ration')).toBe(0);
    expect(started.inventory).not.toContainEqual(expect.objectContaining({ quantity: 0 }));
    expect(() => startExpedition(started, 2000)).toThrow();
    expect(() => prepareExpedition(started, { kit: 'light', equipmentId: null })).toThrow();
    const loaded = validateSave(JSON.parse(JSON.stringify(started)));
    const result = settleExpedition(loaded, loaded.activeExpedition!.id, 61000);
    expect(result.inventory.find((entry) => entry.id === initial.inventory[0].id)).toEqual(initial.inventory[0]);
    expect(quantity(result.inventory, 'water')).toBe(1);
    expect(result.lastReport?.cargo).toEqual(started.activeExpedition?.cargo);
    expect(settleExpedition(result, started.activeExpedition!.id, 100000)).toBe(result);
    expect(initial.inventory).toEqual(createInitialState(0).inventory);
  });
  it('odrzuca brak zapasów, nieznany i niesprawny sprzęt bez modyfikacji', () => {
    const empty = { ...createInitialState(0), inventory: [] };
    expect(() => startExpedition(empty, 100)).toThrow('Brakuje');
    expect(() => prepareExpedition(empty, { kit: 'light', equipmentId: 'unknown' })).toThrow();
    const broken = createInitialState(0); broken.inventory[0].condition = 0;
    expect(() => prepareExpedition(broken, { kit: 'light', equipmentId: broken.inventory[0].id })).toThrow();
    expect(empty.inventory).toEqual([]);
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
    const state = { ...initial, inventory: addResources(initial.inventory, recipe.costs) };
    const result = craft(state, recipe.id, 1000);
    expect(result).toEqual(craft(state, recipe.id, 1000));
    for (const cost of recipe.costs) expect(quantity(result.inventory, cost.itemId)).toBe(quantity(state.inventory, cost.itemId) - cost.quantity);
    for (const output of recipe.output) expect(quantity(result.inventory, output.itemId)).toBe(quantity(state.inventory, output.itemId) + output.quantity);
    expect(() => craft(result, recipe.id)).toThrow('Brakuje');
    expect(isGameState(result)).toBe(true);
  });
  it('zamyka pętlę kolejnych wypraw bez losowych lub bezpłatnych zapasów', () => {
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
