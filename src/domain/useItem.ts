import type { GameState } from './types';
import { arrange, atShelter } from './inventory';

export const consumableIds = new Set(['water', 'ration', 'bandage']);

// Active consumables use one unit; old medicine remains stored for a future stage.
export function useItem(state: GameState, id: string, now = Date.now()): GameState {
  if (!atShelter(state, now)) throw new Error('Używanie jest dostępne po powrocie do kryjówki.');
  const entry = [...state.inventory, ...state.stash].find((entry) => entry.id === id);
  if (!entry || !consumableIds.has(entry.itemId) || entry.quantity < 1) throw new Error('Tego przedmiotu nie można użyć.');
  const removeOne = (entries: GameState['inventory']) => entries.map((item) => item.id === id ? { ...item, quantity: item.quantity - 1 } : item).filter((item) => item.quantity > 0);
  return arrange({ ...state, updatedAt: now, inventory: removeOne(state.inventory), stash: removeOne(state.stash) });
}
