import { arrange, atShelter } from './inventory';
import { getItem } from './catalog';
import type { GameState, InventoryEntry, ResourceAmount } from './types';

export const recipes = [
  { id: 'water', name: 'Uzdatnij wodę', costs: [{ itemId: 'raw-water', quantity: 1 }], output: [{ itemId: 'water', quantity: 1 }] },
  { id: 'ration', name: 'Przygotuj rację', costs: [{ itemId: 'food', quantity: 1 }], output: [{ itemId: 'ration', quantity: 1 }] },
  { id: 'bandage', name: 'Przygotuj bandaż', costs: [{ itemId: 'cloth', quantity: 2 }], output: [{ itemId: 'bandage', quantity: 1 }] },
  { id: 'dressings', name: 'Zestaw opatrunków', costs: [{ itemId: 'cloth', quantity: 2 }], output: [{ itemId: 'bandage', quantity: 3 }] },
] as const;

export function quantity(inventory: InventoryEntry[], itemId: string): number {
  return inventory.filter((entry) => entry.itemId === itemId).reduce((sum, entry) => sum + entry.quantity, 0);
}

export function consume(inventory: InventoryEntry[], costs: readonly ResourceAmount[]): InventoryEntry[] {
  let next = inventory.map((entry) => ({ ...entry }));
  for (const cost of costs) {
    if (getItem(cost.itemId)?.category === 'equipment' || !Number.isSafeInteger(cost.quantity) || cost.quantity < 1
      || quantity(next, cost.itemId) < cost.quantity) throw new Error('Brakuje zasobów. Sprawdź koszty i zapasy.');
    let remaining = cost.quantity;
    next = next.map((entry) => {
      if (entry.itemId !== cost.itemId) return entry;
      const used = Math.min(entry.quantity, remaining);
      remaining -= used;
      return { ...entry, quantity: entry.quantity - used };
    }).filter((entry) => entry.quantity > 0);
  }
  return next;
}

export function addResources(inventory: InventoryEntry[], rewards: readonly ResourceAmount[]): InventoryEntry[] {
  const next = inventory.map((entry) => ({ ...entry }));
  for (const reward of rewards) {
    const item = getItem(reward.itemId);
    if (!item || item.category === 'equipment' || !Number.isSafeInteger(reward.quantity) || reward.quantity < 1) throw new Error('Nieprawidłowy wynik.');
    const existing = next.find((entry) => entry.itemId === reward.itemId);
    if (existing) {
      if (!Number.isSafeInteger(existing.quantity + reward.quantity)) throw new Error('Brak miejsca na wynik.');
      existing.quantity += reward.quantity;
    } else {
      let id = `resource-${reward.itemId}`;
      while (next.some((entry) => entry.id === id)) id += '-new';
      next.push({ id, ...reward, condition: null });
    }
  }
  return next;
}

export function preparationError(state: GameState): string | null {
  if (state.activeExpedition) return 'Najpierw odbierz raport aktywnej wyprawy.';
  return null;
}

export function craft(state: GameState, recipeId: string, now = Date.now()): GameState {
  if (!atShelter(state, now)) throw new Error('Przygotuj zapasy po powrocie do kryjówki.');
  const recipe = recipes.find((entry) => entry.id === recipeId);
  if (recipeId === 'dressings' && !state.progress.workbenchRepaired) throw new Error('Najpierw napraw stół roboczy.');
  if (!recipe) throw new Error('Nieznana receptura.');
  return arrange({ ...state, updatedAt: now, inventory: addResources(consume(state.inventory, recipe.costs), recipe.output) });
}

export const workbenchCosts = [{ itemId: 'scrap', quantity: 6 }, { itemId: 'cloth', quantity: 2 }] as const;
export function repairWorkbench(state: GameState, now = Date.now()): GameState {
  if (state.progress.workbenchRepaired) return state;
  if (state.activeExpedition || !state.progress.workshopVisited) throw new Error('Najpierw wróć z warsztatu i odbierz raport.');
  const inventoryIds = new Set(state.inventory.map((entry) => entry.id));
  const remaining = consume([...state.inventory, ...state.stash], workbenchCosts);
  return arrange({ ...state, updatedAt: now, progress: { ...state.progress, workbenchRepaired: true },
    inventory: remaining.filter((entry) => inventoryIds.has(entry.id)), stash: remaining.filter((entry) => !inventoryIds.has(entry.id)) });
}
