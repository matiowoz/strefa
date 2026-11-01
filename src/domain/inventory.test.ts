import { describe, expect, it } from 'vitest';
import { arrange, fits, gridSize, itemSizes, moveItem } from './inventory';
import { createInitialState, settleExpedition, startExpedition } from './game';
import { preparationError, quantity } from './preparation';
import { isGameState, validateSave } from './validation';

const filled = (count: number) => arrange({ ...createInitialState(0), inventory: Array.from({ length: count }, (_, index) => ({ id: `b-${index}`, itemId: 'bandage', quantity: 1, condition: null })), positions: {} });
const totals = (state: ReturnType<typeof createInitialState>) => [...state.inventory, ...state.stash, ...state.overflow].map((entry) => entry.id).sort();

describe('siatki i schowek', () => {
  it('ma 5x9 przy postaci i jeden schowek 8x9', () => {
    const state = createInitialState(0);
    expect(gridSize(-1)).toEqual({ columns: 5, rows: 9 });
    expect(gridSize(0)).toEqual({ columns: 8, rows: 9 });
    expect(itemSizes.backpack).toEqual({ width: 2, height: 3 });
    expect(isGameState(state)).toBe(true);
    expect(state.stash).toEqual([]);
  });
  it('przenosi między kontenerami, zmienia położenie i zachowuje ilości, stan oraz identyfikatory', () => {
    const initial = createInitialState(0); const entry = initial.inventory[0];
    const first = moveItem(initial, entry.id, 0, { x: 6, y: 6 }, 1000);
    expect(first.stash).toContainEqual(entry); expect(first.inventory).not.toContainEqual(entry);
    const second = moveItem(first, entry.id, 0, { x: 0, y: 0 }, 2000);
    expect(second.positions[entry.id]).toEqual({ x: 0, y: 0, page: 0 });
    const returned = moveItem(second, entry.id, -1, undefined, 3000);
    expect(totals(returned)).toEqual(totals(initial)); expect(returned.inventory).toContainEqual(entry);
    expect(isGameState(returned)).toBe(true); expect(initial.stash).toEqual([]);
  });
  it('blokuje wystawanie, nakładanie i nieistniejące strony bez zmiany danych', () => {
    const state = createInitialState(0); const id = state.inventory[0].id;
    const other = state.positions[state.inventory[1].id];
    expect(() => moveItem(state, id, -1, { x: other.x, y: other.y })).toThrow('Brak miejsca');
    expect(() => moveItem(state, id, -1, { x: 4, y: 8 })).toThrow('Brak miejsca');
    expect(() => moveItem(state, id, 2)).toThrow();
    expect(() => moveItem(state, id, -1, { x: .5, y: 0 })).toThrow();
    expect(isGameState(state)).toBe(true);
  });
  it('pełne siatki nie gubią rzeczy; odbiór nie jest dodatkowym magazynem użytkowym', () => {
    const state = filled(250);
    expect(state.inventory).toHaveLength(45); expect(state.stash).toHaveLength(72); expect(state.overflow).toHaveLength(133);
    expect(isGameState(state)).toBe(true);
    expect(() => moveItem(state, state.overflow[0].id, -1)).toThrow('Brak miejsca');
    expect(totals(state)).toHaveLength(250);
  });
  it('rozmieszcza wynik wyprawy bez utraty łupów, nawet przy pełnych kontenerach', () => {
    const started = startExpedition(createInitialState(0), 1000, () => 0.5);
    const crowded = filled(117);
    const state = { ...crowded, activeExpedition: started.activeExpedition };
    const result = settleExpedition(state, started.activeExpedition!.id, 61000);
    expect(result.overflow).toHaveLength(4);
    expect(quantity(result.overflow, 'scrap')).toBe(2);
    expect(isGameState(result)).toBe(true);
    expect(settleExpedition(result, started.activeExpedition!.id, 999999)).toBe(result);
  });
  it('nie pozwala odłożyć założonego plecaka, a brak wody nie blokuje startu', () => {
    const initial = createInitialState(0);
    expect(() => moveItem(initial, initial.backpack.id, 0)).toThrow();
    const noWater = moveItem(initial, 'starter-water', 0);
    expect(preparationError(noWater)).toBeNull();
    expect(startExpedition(noWater).backpack).toEqual(initial.backpack);
  });
  it('transfer jest zablokowany w drodze', () => {
    const running = startExpedition(createInitialState(0), 1000);
    expect(() => moveItem(running, running.inventory[1].id, 0, undefined, 2000)).toThrow('po powrocie');
  });
});

describe('migracja i walidacja siatki', () => {
  it('migruje v3, zachowując pełną zawartość i nazwę postaci', () => {
    const state = filled(250);
    const old = { ...state, schemaVersion: 3, inventory: [...state.inventory, ...state.stash, ...state.overflow], hero: { ...state.hero, name: 'Kruk' } };
    const migrated = validateSave(old);
    expect(totals(migrated)).toEqual(totals(state)); expect(migrated.hero.name).toBe('Kruk');
    expect(migrated.schemaVersion).toBe(9); expect(isGameState(migrated)).toBe(true);
  });
  it('odrzuca uszkodzone położenia i powielony ID między kontenerami', () => {
    const state = createInitialState(0); const id = state.inventory[0].id;
    expect(isGameState({ ...state, positions: {} })).toBe(false);
    expect(isGameState({ ...state, positions: { ...state.positions, [id]: { page: -1, x: 4, y: 8 } } })).toBe(false);
    expect(isGameState({ ...state, stash: [state.inventory[0]] })).toBe(false);
    expect(fits(state.inventory, state.positions, state.inventory[0], { page: 3, x: 0, y: 0 })).toBe(false);
  });
});

it('migracja pełnego zapisu zachowuje aktywną wyprawę i jej zarezerwowany plecak', () => {
  const initial = createInitialState(0);
  const running = startExpedition(initial, 1000, () => 0.5);
  const old = { ...running, schemaVersion: 3, preparation: { kit: 'light', equipmentId: initial.backpack.id }, inventory: [...filled(250).inventory, ...filled(250).stash, ...filled(250).overflow, initial.backpack, ...running.inventory] };
  const migrated = validateSave(old);
  expect(migrated.activeExpedition).toEqual({ ...running.activeExpedition, events: null });
  expect(migrated.backpack).toEqual(initial.backpack);
  expect(migrated.preparation.equipmentId).toBeNull();
  expect(migrated.inventory.length + migrated.stash.length + migrated.overflow.length + 1).toBe(old.inventory.length);
});

it('migruje pełne dwie strony v4 do mniejszego schowka bez utraty rzeczy', () => {
  const seed = createInitialState(0);
  const entries = Array.from({ length: 245 }, (_, i) => ({ id: `b-${i}`, itemId: 'bandage', quantity: 1, condition: null }));
  const positions = Object.fromEntries(entries.map((entry, i) => [entry.id, i < 45 ? { page: -1, x: i % 5, y: Math.floor(i / 5) } : { page: i < 145 ? 0 : 1, x: (i - 45) % 10, y: Math.floor((i - 45) % 100 / 10) }]));
  const old = { ...seed, schemaVersion: 4, inventory: entries.slice(0,45), stash: entries.slice(45), overflow: [], positions };
  const result = validateSave(old);
  expect(totals(result)).toEqual(entries.map((entry) => entry.id).sort());
  expect(result.stash).toHaveLength(72); expect(result.overflow).toHaveLength(128);
  expect(result.schemaVersion).toBe(9);
});

it('przenosi przedmiot z dawnej drugiej strony na wolne miejsce, ale nie naprawia uszkodzonego zapisu v4', () => {
  const state = moveItem(createInitialState(0), 'starter-water', 0);
  const old = { ...state, schemaVersion: 4, positions: { ...state.positions, 'starter-water': { x: 5, y: 5, page: 1 } } };
  const result = validateSave(old);
  expect(result.stash.find((entry) => entry.id === 'starter-water')?.quantity).toBe(3);
  expect(result.positions['starter-water'].page).toBe(0);
  expect(() => validateSave({ ...old, positions: { ...old.positions, 'starter-water': { x: 10, y: 10, page: 1 } } })).toThrow();
});

it('zmniejsza pełny schowek v5 z 10x10 do 8x9 i zachowuje nadmiar', () => {
  const entries = Array.from({ length: 100 }, (_, i) => ({ id: `old-${i}`, itemId: 'bandage', quantity: 1, condition: null }));
  const old = { ...createInitialState(0), schemaVersion: 5, inventory: [], stash: entries, overflow: [], positions: Object.fromEntries(entries.map((entry, i) => [entry.id, { page: 0, x: i % 10, y: Math.floor(i / 10) }])) };
  const result = validateSave(old);
  expect(result.stash).toHaveLength(72); expect(result.overflow).toHaveLength(28);
  expect(totals(result)).toEqual(entries.map((entry) => entry.id).sort());
});

it('nieudane ułożenie jest cichym brakiem zmiany, ale inne błędy nie są ukrywane', async () => {
  const { tryMoveItem } = await import('./inventory');
  const state = createInitialState(0);
  expect(tryMoveItem(state, state.inventory[0].id, -1, { x: 4, y: 8 })).toBe(state);
  expect(() => tryMoveItem(state, 'missing', 0)).toThrow();
});

it('ogranicza rozmiar przedmiotu do 2x3 także przy walidacji ułożenia', () => {
  const original = itemSizes.backpack;
  try {
    itemSizes.backpack = { width: 3, height: 3 };
    const entry = { id: 'large', itemId: 'backpack', quantity: 1, condition: 100 };
    expect(fits([], {}, entry, { page: 0, x: 0, y: 0 })).toBe(false);
  } finally { itemSizes.backpack = original; }
});
