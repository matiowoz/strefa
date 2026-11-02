import { isSick } from './illness';
import type { GameState } from './types';
import { arrange, atShelter } from './inventory';

export const consumableIds = new Set(['water', 'ration', 'bandage', 'antibiotic']);

// Antibiotics cure illness. Other supplies still only consume one unit.
export function useItem(state: GameState, id: string, now = Date.now()): GameState {
  if (!atShelter(state, now)) throw new Error('Używanie jest dostępne po powrocie do kryjówki.');
  const entry = [...state.inventory, ...state.stash].find((entry) => entry.id === id);
  if (!entry || !consumableIds.has(entry.itemId) || entry.quantity < 1) throw new Error('Tego przedmiotu nie można użyć.');
  if (entry.itemId === 'antibiotic' && !isSick(state, now)) return state;
  const removeOne = (entries: GameState['inventory']) => entries.map((item) => item.id === id ? { ...item, quantity: item.quantity - 1 } : item).filter((item) => item.quantity > 0);
  return arrange({ ...state, illness: entry.itemId === 'antibiotic' ? null : state.illness, updatedAt: now, inventory: removeOne(state.inventory), stash: removeOne(state.stash) });
}
