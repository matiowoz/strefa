import { describe, expect, it } from 'vitest';
import { arrange, fits, gridSize, itemSizes, moveItem } from './inventory';
import { createInitialState, settleExpedition, startExpedition } from './game';
import { preparationError, prepareExpedition, quantity } from './preparation';
import { isGameState, validateSave } from './validation';

const filled = (count: number) => arrange({ ...createInitialState(0), inventory: Array.from({ length: count }, (_, index) => ({ id: `b-${index}`, itemId: 'bandage', quantity: 1, condition: null })), positions: {} });
const totals = (state: ReturnType<typeof createInitialState>) => [...state.inventory, ...state.stash, ...state.overflow].map((entry) => entry.id).sort();

describe('siatki i schowek', () => {
  it('ma 5x9 przy postaci i jeden schowek 10x10', () => {
    const state = createInitialState(0);
    expect(gridSize(-1)).toEqual({ columns: 5, rows: 9 });
    expect(gridSize(0)).toEqual({ columns: 10, rows: 10 });
    expect(itemSizes.backpack).toEqual({ width: 2, height: 3 });
    expect(isGameState(state)).toBe(true);
    expect(state.stash).toEqual([]);
  });
  it('przenosi między kontenerami, zmienia położenie i zachowuje ilości, stan oraz identyfikatory', () => {
    const initial = createInitialState(0); const entry = initial.inventory[0];
    const first = moveItem(initial, entry.id, 0, { x: 8, y: 7 }, 1000);
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
    expect(state.inventory).toHaveLength(45); expect(state.stash).toHaveLength(100); expect(state.overflow).toHaveLength(105);
    expect(isGameState(state)).toBe(true);
    expect(() => moveItem(state, state.overflow[0].id, -1)).toThrow('Brak miejsca');
    expect(totals(state)).toHaveLength(250);
  });
  it('rozmieszcza wynik wyprawy bez utraty łupów, nawet przy pełnych kontenerach', () => {
    const started = startExpedition(createInitialState(0), 1000);
    const crowded = filled(145);
    const state = { ...crowded, activeExpedition: started.activeExpedition };
    const result = settleExpedition(state, started.activeExpedition!.id, 61000);
    expect(result.overflow).toHaveLength(4);
    expect(quantity(result.overflow, 'scrap')).toBe(2);
    expect(isGameState(result)).toBe(true);
    expect(settleExpedition(result, started.activeExpedition!.id, 999999)).toBe(result);
  });
  it('zapasy w schowku nie wystarczają do startu; wybrany plecak jest odznaczany przy odłożeniu', () => {
    const initial = createInitialState(0);
    const prepared = prepareExpedition(initial, { kit: 'light', equipmentId: initial.inventory[0].id }, 100);
    const moved = moveItem(prepared, initial.inventory[0].id, 0);
    expect(moved.preparation.equipmentId).toBeNull();
    const noWater = moveItem(moved, initial.inventory.find((entry) => entry.itemId === 'water')!.id, 0);
    expect(preparationError(noWater)).toContain('Brakuje');
    expect(() => startExpedition(noWater)).toThrow();
  });
  it('transfer jest zablokowany w drodze, a sprzęt do odbioru raportu', () => {
    const initial = createInitialState(0);
    const equipped = prepareExpedition(initial, { kit: 'light', equipmentId: initial.inventory[0].id }, 0);
    const running = startExpedition(equipped, 1000);
    expect(() => moveItem(running, running.inventory[1].id, 0, undefined, 2000)).toThrow('po powrocie');
    expect(() => moveItem(running, initial.inventory[0].id, 0, undefined, 61000)).toThrow('raport');
  });
});

describe('migracja i walidacja siatki', () => {
  it('migruje v3, zachowując pełną zawartość i nazwę postaci', () => {
    const state = filled(250);
    const old = { ...state, schemaVersion: 3, inventory: [...state.inventory, ...state.stash, ...state.overflow], hero: { ...state.hero, name: 'Kruk' } };
    const migrated = validateSave(old);
    expect(totals(migrated)).toEqual(totals(state)); expect(migrated.hero.name).toBe('Kruk');
    expect(migrated.schemaVersion).toBe(5); expect(isGameState(migrated)).toBe(true);
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
  const equipped = prepareExpedition(initial, { kit: 'light', equipmentId: initial.inventory[0].id }, 0);
  const running = startExpedition(equipped, 1000);
  const old = { ...running, schemaVersion: 3, inventory: [...filled(250).inventory, ...filled(250).stash, ...filled(250).overflow, ...running.inventory] };
  const migrated = validateSave(old);
  expect(migrated.activeExpedition).toEqual(running.activeExpedition);
  expect(migrated.inventory.some((entry) => entry.id === initial.inventory[0].id)).toBe(true);
  expect(migrated.preparation.equipmentId).toBe(initial.inventory[0].id);
  expect(migrated.inventory.length + migrated.stash.length + migrated.overflow.length).toBe(old.inventory.length);
});

it('migruje drugą stronę v4 do jedynego schowka, bez utraty przy pełnej pierwszej stronie', () => {
  const state = filled(245);
  const old = { ...state, schemaVersion: 4, stash: [...state.stash, ...state.overflow], overflow: [], positions: { ...state.positions } };
  state.overflow.forEach((entry, index) => { old.positions[entry.id] = { page: 1, x: index % 10, y: Math.floor(index / 10) }; });
  const result = validateSave(old);
  expect(totals(result)).toEqual(totals(state)); expect(result.stash).toHaveLength(100);
  expect(result.overflow).toHaveLength(100); expect(result.schemaVersion).toBe(5);
  expect(Object.values(result.positions).every((point) => point.page <= 0)).toBe(true);
  expect(() => moveItem(result, result.inventory[0].id, 1)).toThrow();
});

it('przenosi przedmiot z dawnej drugiej strony na wolne miejsce, ale nie naprawia uszkodzonego zapisu v4', () => {
  const state = moveItem(createInitialState(0), 'starter-water', 0);
  const old = { ...state, schemaVersion: 4, positions: { ...state.positions, 'starter-water': { x: 5, y: 5, page: 1 } } };
  const result = validateSave(old);
  expect(result.stash.find((entry) => entry.id === 'starter-water')?.quantity).toBe(3);
  expect(result.positions['starter-water'].page).toBe(0);
  expect(() => validateSave({ ...old, positions: { ...old.positions, 'starter-water': { x: 10, y: 10, page: 1 } } })).toThrow();
});
