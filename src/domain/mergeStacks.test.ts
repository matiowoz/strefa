import { expect, it } from 'vitest';
import { createInitialState, startExpedition } from './game';
import { arrange, canMergeStacks, mergeStacks, moveItem, splitStack } from './inventory';
import { quantity } from './preparation';
import { isGameState } from './validation';

it.each(['water', 'ration', 'bandage', 'scrap'])('łączy %s w jeden stos, zachowuje docelowe ID i położenie oraz sumę sztuk', (itemId) => {
  const initial = createInitialState(0);
  const target = initial.inventory.find((entry) => entry.itemId === itemId)!;
  const state = splitStack(initial, target.id, 1, 100);
  const original = structuredClone(state);
  const source = state.inventory.find((entry) => entry.itemId === itemId && entry.id !== target.id)!;
  const result = mergeStacks(state, source.id, target.id, 200);
  expect(result.inventory.find((entry) => entry.id === target.id)).toEqual(target);
  expect(result.inventory.some((entry) => entry.id === source.id)).toBe(false);
  expect(result.positions[source.id]).toBeUndefined();
  expect(result.positions[target.id]).toEqual(state.positions[target.id]);
  expect(quantity(result.inventory, itemId)).toBe(quantity(state.inventory, itemId));
  expect(result.updatedAt).toBe(200); expect(isGameState(result)).toBe(true);
  expect(state).toEqual(original);
  expect(mergeStacks(result, source.id, target.id, 300)).toBe(result);
});

it.each(['carried-stash', 'stash-carried', 'stash-stash'])('łączy między kontenerami: %s', (direction) => {
  const split = splitStack(createInitialState(0), 'starter-water', 1, 100);
  const sourceId = split.inventory.find((entry) => entry.itemId === 'water' && entry.id !== 'starter-water')!.id;
  let state = direction === 'stash-carried' || direction === 'stash-stash' ? moveItem(split, sourceId, 0, undefined, 200) : split;
  if (direction !== 'stash-carried') state = moveItem(state, 'starter-water', 0, undefined, 200);
  const result = mergeStacks(state, sourceId, 'starter-water', 300);
  const destination = direction === 'stash-carried' ? result.inventory : result.stash;
  expect(destination.find((entry) => entry.id === 'starter-water')!.quantity).toBe(3);
  expect([...result.inventory, ...result.stash].some((entry) => entry.id === sourceId)).toBe(false);
  expect(result.positions['starter-water']).toEqual(state.positions['starter-water']);
  expect(isGameState(result)).toBe(true);
});

it('odrzuca własny stos, inny typ, sprzęt, inny stan, nadmiar i brakujący stos bez zmiany danych', () => {
  const state = createInitialState(0);
  expect(mergeStacks(state, 'starter-water', 'starter-water')).toBe(state);
  expect(mergeStacks(state, 'starter-water', 'starter-ration')).toBe(state);
  expect(mergeStacks(state, 'missing', 'starter-water')).toBe(state);
  expect(mergeStacks(state, state.backpack.id, 'starter-water')).toBe(state);
  expect(canMergeStacks(state.backpack, { ...state.backpack, id: 'spare' })).toBe(false);
  expect(canMergeStacks(state.inventory[0], { ...state.inventory[0], id: 'other', condition: 20 })).toBe(false);
  state.overflow.push({ id: 'overflow', itemId: 'water', quantity: 2, condition: null });
  expect(mergeStacks(state, 'overflow', 'starter-water')).toBe(state);
});

it('przepełnienie ilości nie usuwa źródła ani nie zmienia celu', () => {
  const split = splitStack(createInitialState(0), 'starter-water', 1, 100);
  const source = split.inventory.find((entry) => entry.itemId === 'water' && entry.id !== 'starter-water')!;
  split.inventory.find((entry) => entry.id === 'starter-water')!.quantity = Number.MAX_SAFE_INTEGER;
  expect(mergeStacks(split, source.id, 'starter-water')).toBe(split);
  expect(isGameState(split)).toBe(true);
});

it('łączy bez wolnego pola, zwalniając miejsce po źródle', () => {
  const state = arrange({ ...createInitialState(0), inventory: Array.from({ length: 45 }, (_, i) => ({ id: `b-${i}`, itemId: 'bandage', quantity: 1, condition: null })), positions: {} });
  const result = mergeStacks(state, 'b-0', 'b-1', 100);
  expect(result.inventory).toHaveLength(44);
  expect(quantity(result.inventory, 'bandage')).toBe(45);
  expect(result.inventory.find((entry) => entry.id === 'b-1')!.quantity).toBe(2);
  expect(isGameState(result)).toBe(true);
});

it('w drodze blokuje łączenie, po powrocie pozwala połączyć stosy', () => {
  const split = splitStack(createInitialState(0), 'starter-water', 1, 100);
  const source = split.inventory.find((entry) => entry.itemId === 'water' && entry.id !== 'starter-water')!;
  const trip = startExpedition(split, 1000);
  expect(() => mergeStacks(trip, source.id, 'starter-water', 2000)).toThrow('powrocie');
  expect(isGameState(mergeStacks(trip, source.id, 'starter-water', 61000))).toBe(true);
});
