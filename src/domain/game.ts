import { getItem, locations } from './catalog';
import type { GameState } from './types';

export function createInitialState(now = Date.now()): GameState {
  return {
    schemaVersion: 1, updatedAt: now,
    hero: {
      id: 'survivor', name: 'Ocalały', level: 1, health: 100, maxHealth: 100,
      skills: { combat: 1, scouting: 1, survival: 1, medicine: 1, crafting: 1, electronics: 1, trade: 1, transport: 1 },
    },
    inventory: [
      { id: 'starter-backpack', itemId: 'backpack', quantity: 1, condition: 100 },
      { id: 'starter-water', itemId: 'water', quantity: 3, condition: null },
      { id: 'starter-ration', itemId: 'ration', quantity: 2, condition: null },
      { id: 'starter-bandage', itemId: 'bandage', quantity: 2, condition: null },
      { id: 'starter-scrap', itemId: 'scrap', quantity: 4, condition: null },
    ],
    selectedLocationId: locations[0].id, activeExpedition: null,
  };
}

export function renameHero(state: GameState, input: string, now = Date.now()): GameState {
  const name = input.trim();
  if (name.length < 2 || name.length > 24 || /[\u0000-\u001f\u007f]/u.test(name)) {
    throw new Error('Pseudonim musi mieć od 2 do 24 znaków i nie może zawierać znaków sterujących.');
  }
  return { ...state, updatedAt: now, hero: { ...state.hero, name } };
}

export function selectLocation(state: GameState, id: string, now = Date.now()): GameState {
  if (!locations.some((location) => location.id === id)) throw new Error('Nieznana lokacja.');
  return { ...state, updatedAt: now, selectedLocationId: id };
}

export function inventoryWeight(state: GameState): number {
  return state.inventory.reduce((total, entry) => total + (getItem(entry.itemId)?.weightKg ?? 0) * entry.quantity, 0);
}
