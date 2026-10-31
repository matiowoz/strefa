import { expect, it } from 'vitest';
import { createInitialState, startExpedition } from './game';
import { moveItem } from './inventory';
import { useItem } from './useItem';
import { isGameState } from './validation';

it.each(['water', 'ration', 'bandage'])('zużywa jedną sztukę %s bez zmiany statystyk', (itemId) => {
  const state = createInitialState(0); const entry = state.inventory.find((entry) => entry.itemId === itemId)!;
  const next = useItem(state, entry.id, 1000);
  expect(next.inventory.find((item) => item.id === entry.id)?.quantity).toBe(entry.quantity - 1);
  expect(next.hero).toEqual(state.hero); expect(isGameState(next)).toBe(true);
  expect(state.inventory.find((item) => item.id === entry.id)?.quantity).toBe(entry.quantity);
});
it('ostatnia sztuka zwalnia pola; brakującej nie można użyć ponownie', () => {
  const state = createInitialState(0);const entry = state.inventory.find((entry) => entry.itemId === 'bandage')!;entry.quantity = 1;
  const next = useItem(state, entry.id, 1000);
  expect(next.inventory.some((item) => item.id === entry.id)).toBe(false);expect(next.positions[entry.id]).toBeUndefined();
  expect(() => useItem(next, entry.id)).toThrow();expect(isGameState(next)).toBe(true);
});
it('używa ze skrytki, ale odrzuca materiały, sprzęt i używanie w drodze', () => {
  const state = createInitialState(0);const water = state.inventory.find((entry) => entry.itemId === 'water')!;
  const stored = moveItem(state, water.id, 0, undefined, 100);
  expect(useItem(stored, water.id, 200).stash[0].quantity).toBe(2);
  expect(() => useItem(state, state.backpack.id)).toThrow();
  const running = startExpedition(state, 1000);expect(() => useItem(running, water.id, 2000)).toThrow();
});
