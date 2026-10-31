import { expect, it } from 'vitest';
import { createInitialState, startExpedition } from './game';
import { arrange, moveItem, splitStack } from './inventory';
import { quantity } from './preparation';
import { isGameState, validateSave } from './validation';

it.each(['water', 'ration', 'bandage', 'scrap'])('rozdziela %s bez zmiany sumy, stanu ani innych pozycji', (itemId) => {
  const state = createInitialState(0);
  const original = structuredClone(state);
  const entry = state.inventory.find((item) => item.itemId === itemId)!;
  const next = splitStack(state, entry.id, 1, 1000);
  expect(next.inventory.find((item) => item.id === entry.id)!.quantity).toBe(entry.quantity - 1);
  const separated = next.inventory.find((item) => !state.inventory.some((old) => old.id === item.id))!;
  expect(separated).toMatchObject({ itemId, quantity: 1, condition: entry.condition });
  expect(quantity(next.inventory, itemId)).toBe(quantity(state.inventory, itemId));
  expect(next.positions[entry.id]).toEqual(state.positions[entry.id]);
  expect(next.inventory).toHaveLength(state.inventory.length + 1);
  expect(next.stash).toEqual(state.stash); expect(next.overflow).toEqual(state.overflow);
  expect(next.updatedAt).toBe(1000); expect(isGameState(next)).toBe(true);
  expect(validateSave(JSON.parse(JSON.stringify(next)))).toEqual(next);
  expect(state).toEqual(original);
});

it('dzieli w skrytce i zostawia obie części w skrytce', () => {
  const state = moveItem(createInitialState(0), 'starter-water', 0, undefined, 100);
  const next = splitStack(state, 'starter-water', 2, 200);
  expect(next.inventory).toEqual(state.inventory);
  expect(next.stash.map((entry) => entry.quantity)).toEqual([1, 2]);
  expect(next.stash.every((entry) => next.positions[entry.id].page === 0)).toBe(true);
  expect(isGameState(next)).toBe(true);
});

it.each([-1, 0, 3, 4, .5, NaN, Infinity])('odrzuca niedozwoloną liczbę %s bez zmiany stanu', (amount) => {
  const state = createInitialState(0);
  expect(() => splitStack(state, 'starter-water', amount)).toThrow();
  expect(quantity(state.inventory, 'water')).toBe(3);
});

it('nie rozdziela pojedynczej sztuki, plecaka, brakującej rzeczy ani odbioru nadmiaru', () => {
  const state = createInitialState(0); state.inventory[0].quantity = 1;
  for (const id of ['starter-water', state.backpack.id, 'missing']) expect(() => splitStack(state, id, 1)).toThrow();
  state.overflow = [{ id: 'overflow', itemId: 'water', quantity: 4, condition: null }];
  expect(() => splitStack(state, 'overflow', 1)).toThrow();
});

it.each([-1, 0])('brak miejsca na stronie %s nie przenosi stosu do innego kontenera i nie gubi sztuk', (page) => {
  const count = page === -1 ? 45 : 72;
  const entries = Array.from({ length: count }, (_, i) => ({ id: `b-${i}`, itemId: 'bandage', quantity: 2, condition: null }));
  const state = arrange({ ...createInitialState(0), inventory: page === -1 ? entries : [], stash: page === 0 ? entries : [], positions: {} });
  expect(splitStack(state, 'b-0', 1, 1000)).toBe(state);
});

it('szuka całego wolnego prostokąta, także dla przedmiotu 1x2', () => {
  const entries = Array.from({ length: 43 }, (_, i) => ({ id: `b-${i}`, itemId: 'bandage', quantity: 1, condition: null }));
  const water = { id: 'water', itemId: 'water', quantity: 2, condition: null };
  const state = arrange({ ...createInitialState(0), inventory: [water, ...entries], positions: {} });
  // Wolne dwie kratki są rozłączne, więc woda 1x2 nadal się nie mieści.
  const first = moveItem(state, 'b-0', 0, undefined, 100);
  const fragmented = moveItem(first, 'b-42', 0, undefined, 100);
  expect(splitStack(fragmented, 'water', 1, 200)).toBe(fragmented);
});

it('kolejne podziały nadają unikalne ID i nie łączą oddzielonych stosów', () => {
  const initial = createInitialState(0);
  initial.backpack.id = 'starter-water-split';
  const once = splitStack(initial, 'starter-water', 1, 100);
  const twice = splitStack(once, 'starter-water', 1, 200);
  const ids = [...twice.inventory, ...twice.stash, ...twice.overflow, twice.backpack].map((entry) => entry.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(twice.inventory.filter((entry) => entry.itemId === 'water').map((entry) => entry.quantity)).toEqual([1, 1, 1]);
  expect(isGameState(twice)).toBe(true);
});

it('blokuje podział w drodze, udostępnia go po powrocie', () => {
  const running = startExpedition(createInitialState(0), 1000);
  expect(() => splitStack(running, 'starter-water', 1, 2000)).toThrow('powrocie');
  expect(isGameState(splitStack(running, 'starter-water', 1, 61000))).toBe(true);
});
