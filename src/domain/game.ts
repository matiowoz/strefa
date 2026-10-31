import { arrange } from './inventory';
import { getItem, locations } from './catalog';
import { addResources, preparationError } from './preparation';
import type { GameState } from './types';

export function createInitialState(now = Date.now()): GameState {
  return arrange({
    schemaVersion: 7, backpack: { id: 'starter-backpack', itemId: 'backpack', quantity: 1, condition: 100 }, progress: { workshopVisited: false, workbenchRepaired: false }, positions: {}, stash: [], overflow: [], preparation: { kit: 'light', equipmentId: null }, lastReport: null, updatedAt: now,
    hero: {
      id: 'survivor', name: 'Ocalały', level: 1, health: 100, maxHealth: 100,
      skills: { combat: 1, scouting: 1, survival: 1, medicine: 1, crafting: 1, electronics: 1, trade: 1, transport: 1 },
    },
    inventory: [
      { id: 'starter-water', itemId: 'water', quantity: 3, condition: null },
      { id: 'starter-ration', itemId: 'ration', quantity: 2, condition: null },
      { id: 'starter-bandage', itemId: 'bandage', quantity: 2, condition: null },
      { id: 'starter-scrap', itemId: 'scrap', quantity: 4, condition: null },
    ],
    selectedLocationId: locations[0].id, activeExpedition: null,
  });
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

// Demonstracyjne parametry; wynik jest utrwalany przy starcie.
export const expeditionRules = {
  outskirts: { durationMs: 60_000 },
  workshop: { durationMs: 120_000 },
} as const;

export function startExpedition(state: GameState, now = Date.now(), random: () => number = () => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32): GameState {
  if (state.activeExpedition) throw new Error('Najpierw zakończ i rozlicz aktywną wyprawę.');
  const rule = expeditionRules[state.selectedLocationId as keyof typeof expeditionRules];
  if (!rule || !Number.isSafeInteger(now) || now < 0 || !Number.isSafeInteger(now + rule.durationMs)) {
    throw new Error('Nieprawidłowy cel lub czas wyprawy.');
  }
  const problem = preparationError(state);
  if (problem) throw new Error(problem);
  const loot = [
    { itemId: 'scrap', maximum: state.selectedLocationId === 'workshop' ? 6 : 4 },
    { itemId: 'raw-water', maximum: 3 }, { itemId: 'food', maximum: 3 }, { itemId: 'cloth', maximum: 2 },
  ].map(({ itemId, maximum }) => {
    const roll = random();
    if (!Number.isFinite(roll) || roll < 0 || roll >= 1) throw new Error('Nieprawidłowe losowanie.');
    return { itemId, quantity: Math.floor(roll * (maximum + 1)) };
  }).filter((entry) => entry.quantity > 0);
  return arrange({ ...state, updatedAt: now, activeExpedition: {
    cargo: { equipmentId: state.backpack.id, water: 0, ration: 0, loot },
    id: crypto.randomUUID(), plan: { locationId: state.selectedLocationId, strategy: 'balanced' },
    status: 'running', startedAt: now, expectedReturnAt: now + rule.durationMs,
  } });
}

export function settleExpedition(state: GameState, id: string, now = Date.now()): GameState {
  const expedition = state.activeExpedition;
  // Powtórzenie tej samej komendy po sukcesie niczego nie przyznaje.
  if (!expedition || expedition.id !== id) return state;
  if (!Number.isSafeInteger(now) || now < expedition.expectedReturnAt) throw new Error('Wyprawa jeszcze trwa.');
  const scrap = expedition.cargo.loot.find((entry) => entry.itemId === 'scrap')?.quantity ?? 0;
  const inventory = addResources(state.inventory, expedition.cargo.loot);
  return arrange({ ...state, inventory, updatedAt: now, activeExpedition: null,
    progress: { ...state.progress, workshopVisited: state.progress.workshopVisited || expedition.plan.locationId === 'workshop' },
    lastReport: { cargo: structuredClone(expedition.cargo), expeditionId: id, locationId: expedition.plan.locationId, returnedAt: expedition.expectedReturnAt, scrap } });
}
