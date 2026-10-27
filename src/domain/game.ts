import { getItem, locations } from './catalog';
import type { GameState } from './types';

export function createInitialState(now = Date.now()): GameState {
  return {
    schemaVersion: 2, lastReport: null, updatedAt: now,
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

// Demonstracyjne parametry etapu 2, bez walki, zużycia zapasów i losowości.
export const expeditionRules = {
  outskirts: { durationMs: 60_000, scrap: 2 },
  workshop: { durationMs: 120_000, scrap: 4 },
} as const;

export function startExpedition(state: GameState, now = Date.now()): GameState {
  if (state.activeExpedition) throw new Error('Najpierw zakończ i rozlicz aktywną wyprawę.');
  const rule = expeditionRules[state.selectedLocationId as keyof typeof expeditionRules];
  if (!rule || !Number.isSafeInteger(now) || now < 0 || !Number.isSafeInteger(now + rule.durationMs)) {
    throw new Error('Nieprawidłowy cel lub czas wyprawy.');
  }
  return { ...state, updatedAt: now, activeExpedition: {
    id: crypto.randomUUID(), plan: { locationId: state.selectedLocationId, strategy: 'balanced' },
    status: 'running', startedAt: now, expectedReturnAt: now + rule.durationMs,
  } };
}

export function settleExpedition(state: GameState, id: string, now = Date.now()): GameState {
  const expedition = state.activeExpedition;
  // Powtórzenie tej samej komendy po sukcesie niczego nie przyznaje.
  if (!expedition || expedition.id !== id) return state;
  if (!Number.isSafeInteger(now) || now < expedition.expectedReturnAt) throw new Error('Wyprawa jeszcze trwa.');
  const scrap = expeditionRules[expedition.plan.locationId as keyof typeof expeditionRules].scrap;
  const existing = state.inventory.find((entry) => entry.itemId === 'scrap');
  if (existing && !Number.isSafeInteger(existing.quantity + scrap)) throw new Error('Brak miejsca na nagrodę.');
  const inventory = existing
    ? state.inventory.map((entry) => entry.id === existing.id ? { ...entry, quantity: entry.quantity + scrap } : entry)
    : [...state.inventory, { id: `reward-${id}`, itemId: 'scrap', quantity: scrap, condition: null }];
  return { ...state, inventory, updatedAt: now, activeExpedition: null,
    lastReport: { expeditionId: id, locationId: expedition.plan.locationId, returnedAt: expedition.expectedReturnAt, scrap } };
}
