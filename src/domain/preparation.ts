import { getItem } from './catalog';
import type { GameState, InventoryEntry, Preparation, ResourceAmount } from './types';

export const kits = {
  light: { name: 'Lekki', water: 1, ration: 1 },
  stocked: { name: 'Z zapasem', water: 2, ration: 2 },
} as const;
export const recipes = [
  { id: 'water', name: 'Uzdatnij wodę', costs: [{ itemId: 'raw-water', quantity: 1 }], output: [{ itemId: 'water', quantity: 1 }] },
  { id: 'ration', name: 'Przygotuj rację', costs: [{ itemId: 'food', quantity: 1 }], output: [{ itemId: 'ration', quantity: 1 }] },
  { id: 'bandage', name: 'Przygotuj bandaż', costs: [{ itemId: 'cloth', quantity: 2 }], output: [{ itemId: 'bandage', quantity: 1 }] },
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
  const kit = kits[state.preparation.kit];
  if (!kit) return 'Nieznany zestaw.';
  if (state.preparation.equipmentId !== null && !state.inventory.some((entry) => entry.id === state.preparation.equipmentId && getItem(entry.itemId)?.category === 'equipment' && (entry.condition ?? 0) > 0)) return 'Wybrany sprzęt jest niedostępny lub niesprawny.';
  if (quantity(state.inventory, 'water') < kit.water || quantity(state.inventory, 'ration') < kit.ration) return 'Brakuje wody lub racji. Przygotuj je w Ekwipunku albo wybierz lżejszy zestaw.';
  return null;
}

export function prepareExpedition(state: GameState, preparation: Preparation, now = Date.now()): GameState {
  if (state.activeExpedition) throw new Error('Nie można zmieniać zestawu podczas wyprawy.');
  const next = { ...state, preparation: { ...preparation }, updatedAt: now };
  // Niedobór zapasów nie blokuje zapisania planu, ale blokuje start.
  if (!kits[preparation.kit] || (preparation.equipmentId !== null && !state.inventory.some((entry) => entry.id === preparation.equipmentId && getItem(entry.itemId)?.category === 'equipment' && (entry.condition ?? 0) > 0))) throw new Error('Nieprawidłowy zestaw lub sprzęt.');
  return next;
}

export function craft(state: GameState, recipeId: string, now = Date.now()): GameState {
  const recipe = recipes.find((entry) => entry.id === recipeId);
  if (!recipe) throw new Error('Nieznana receptura.');
  return { ...state, updatedAt: now, inventory: addResources(consume(state.inventory, recipe.costs), recipe.output) };
}
