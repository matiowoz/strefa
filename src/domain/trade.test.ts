import { expect, it } from 'vitest';
import { createInitialState, startExpedition } from './game';
import { arrange, moveItem } from './inventory';
import { quantity } from './preparation';
import { tradeItem, tradeQuote } from './trade';
import { isGameState, validateSave } from './validation';

const packed = () => arrange({ ...createInitialState(0), inventory: [...createInitialState(0).inventory, { id: 'helmet', itemId: 'helmet', quantity: 1, condition: 60 }] });
it('wymienia konkretny egzemplarz raz, zachowuje resztę i pomniejsza zapas NPC', () => {
  const state = packed();const next = tradeItem(state, 'helmet', 1, 'ration', 1000);
  expect(next.inventory.some((entry) => entry.id === 'helmet')).toBe(false);
  expect(quantity(next.inventory, 'ration')).toBe(3);expect(next.trader.stock.ration).toBe(3);
  expect(next.backpack).toEqual(state.backpack);expect(next.positions.helmet).toBeUndefined();
  expect(() => tradeItem(next, 'helmet', 1, 'ration', 2000)).toThrow();expect(isGameState(next)).toBe(true);
  expect(state.trader.stock.ration).toBe(4);
});
it('wycenia stan sprzętu i zużywa wybraną liczbę ze stosu', () => {
  const state = packed();expect(tradeQuote(state, 'helmet', 1, 'water')).toBe(1);
  const better = { ...state, inventory: state.inventory.map((entry) => entry.id === 'helmet' ? { ...entry, condition: 100 } : entry) };
  expect(tradeQuote(better, 'helmet', 1, 'water')).toBe(2);
  const next = tradeItem(state, 'starter-scrap', 3, 'water', 1000);
  expect(quantity(next.inventory, 'scrap')).toBe(1);expect(quantity(next.inventory, 'water')).toBe(4);expect(next.trader.stock.water).toBe(5);
});
it.each([0, -1, .5, NaN, Infinity, Number.MAX_SAFE_INTEGER])('odrzuca nieprawidłową ilość %s', (amount) => {
  expect(() => tradeItem(packed(), 'helmet', amount, 'water', 1000)).toThrow();
});
it('chroni przedmioty w skrytce, założone, plecak i towar spoza oferty', () => {
  const state = packed();const helmet = state.inventory.find((e) => e.id === 'helmet')!;
  const worn = arrange({ ...state, inventory: state.inventory.filter((e) => e.id !== 'helmet'), equipped: { ...state.equipped, head: helmet } });
  expect(() => tradeItem(worn, 'helmet', 1, 'water', 1000)).toThrow();
  const stored = moveItem(state, 'helmet', 0, undefined, 100);
  expect(() => tradeItem(stored, 'helmet', 1, 'water', 1000)).toThrow();
  expect(() => tradeItem(state, state.backpack.id, 1, 'water', 1000)).toThrow();
  expect(() => tradeItem(state, 'helmet', 1, 'jacket', 1000)).toThrow();
});
it('blokuje handel w drodze i nie przekracza ograniczonego zapasu', () => {
  const state = packed();const trip = startExpedition(state, 1000, () => 0);
  expect(() => tradeItem(trip, 'helmet', 1, 'water', 1001)).toThrow('powrocie');
  const empty = { ...state, trader: { stock: { ...state.trader.stock, water: 0 } } };
  expect(() => tradeItem(empty, 'helmet', 1, 'water', 1000)).toThrow('zapasów');
  expect(validateSave(empty).trader.stock.water).toBe(0);
});
it('pełne siatki nie gubią zapłaty: wynik trafia do bezpiecznego odbioru', () => {
  const entries = Array.from({ length: 117 }, (_, i) => ({ id: `full-${i}`, itemId: 'ration', quantity: 4, condition: null }));
  const state = arrange({ ...createInitialState(0), inventory: entries, positions: {} });
  // Every cell is occupied; selling part of a stack does not free its cell.
  const id = state.inventory[0].id;const next = tradeItem(state, id, 2, 'water', 1000);
  expect(quantity([...next.inventory, ...next.stash, ...next.overflow], 'water')).toBe(1);
  expect(quantity([...next.inventory, ...next.stash, ...next.overflow], 'ration')).toBe(466);
  expect(next.overflow.some((entry) => entry.itemId === 'water')).toBe(true);
  expect(isGameState(next)).toBe(true);
});
it('migruje v12 bez utraty rzeczy i odrzuca uszkodzony zapas w v13', () => {
  const state = packed();const { trader: _, ...old } = state;
  expect(validateSave({ ...old, schemaVersion: 12 })).toEqual(state);
  for (const water of [-1, 7, .5, NaN]) expect(() => validateSave({ ...state, trader: { stock: { water, ration: 4, bandage: 4 } } })).toThrow();
  expect(() => validateSave({ ...state, trader: null })).toThrow();
});
