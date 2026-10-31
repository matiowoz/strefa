import type { GameState, InventoryEntry, Placement } from './types';

export const GRID_COLUMNS = 5;
export const GRID_ROWS = 9;
export const STASH_PAGES = 1;
export const gridSize = (page: number) => page === -1 ? { columns: GRID_COLUMNS, rows: GRID_ROWS } : { columns: 10, rows: 10 };
// Demonstracyjne rozmiary jednego stosu (ilości zachowują dotychczasowy model).
export const itemSizes: Record<string, { width: number; height: number }> = {
  backpack: { width: 2, height: 3 }, water: { width: 1, height: 2 },
  ration: { width: 1, height: 1 }, bandage: { width: 1, height: 1 },
  scrap: { width: 2, height: 2 }, 'raw-water': { width: 1, height: 2 },
  food: { width: 2, height: 2 }, cloth: { width: 2, height: 1 },
};

export function fits(entries: InventoryEntry[], positions: Record<string, Placement>, entry: InventoryEntry, point: Placement, pageCount = STASH_PAGES): boolean {
  const size = itemSizes[entry.itemId];
  const bounds = gridSize(point.page);
  if (!size || !Number.isInteger(point.x) || !Number.isInteger(point.y) || !Number.isInteger(point.page)
    || point.page < -1 || point.page >= pageCount || point.x < 0 || point.y < 0
    || point.x + size.width > bounds.columns || point.y + size.height > bounds.rows) return false;
  return entries.every((other) => {
    if (other.id === entry.id) return true;
    const p = positions[other.id];
    if (!p || p.page !== point.page) return true;
    const s = itemSizes[other.itemId];
    return point.x + size.width <= p.x || p.x + s.width <= point.x || point.y + size.height <= p.y || p.y + s.height <= point.y;
  });
}

function firstFree(entries: InventoryEntry[], positions: Record<string, Placement>, entry: InventoryEntry, page: number): Placement | null {
  const bounds = gridSize(page);
  for (let y = 0; y < bounds.rows; y++) for (let x = 0; x < bounds.columns; x++) {
    const point = { x, y, page };
    if (fits(entries, positions, entry, point)) return point;
  }
  return null;
}

// Used only for migration and domain outputs. Valid existing positions survive.
// New items that do not fit are preserved for collection, never deleted.
export function arrange(state: GameState, inventory = state.inventory): GameState {
  const positions: Record<string, Placement> = Object.create(null);
  const carried: InventoryEntry[] = [];
  const stash: InventoryEntry[] = [];
  const overflow = [...state.overflow];
  const usedIds = new Set([...state.stash, ...state.overflow].map((entry) => entry.id));
  const entries = inventory.map((entry) => {
    let id = entry.id;
    while (usedIds.has(id)) id += '-new';
    usedIds.add(id);
    return id === entry.id ? entry : { ...entry, id };
  });
  const all = [...entries, ...state.stash];
  for (const entry of all) {
    const old = state.positions[entry.id];
    if (old && fits(all, positions, entry, old)) {
      positions[entry.id] = { ...old };
      (old.page === -1 ? carried : stash).push(entry);
    }
  }
  for (const entry of all) {
    if (positions[entry.id]) continue;
    const preferred = state.stash.some((other) => other.id === entry.id) ? [0] : [-1, 0];
    const point = preferred.map((page) => firstFree(all, positions, entry, page)).find((point) => point !== null);
    if (point) { positions[entry.id] = point; (point.page === -1 ? carried : stash).push(entry); }
    else overflow.push(entry);
  }
  return { ...state, inventory: carried, stash, overflow, positions };
}

export function atShelter(state: GameState, now = Date.now()): boolean {
  return !state.activeExpedition || now >= state.activeExpedition.expectedReturnAt;
}

export function moveItem(state: GameState, id: string, page: number, point?: { x: number; y: number }, now = Date.now()): GameState {
  if (!atShelter(state, now)) throw new Error('Przenoszenie rzeczy jest dostępne po powrocie do kryjówki.');
  if (state.activeExpedition?.cargo.equipmentId === id) throw new Error('Odbierz raport, aby zwolnić wyposażenie wyprawy.');
  if (!Number.isInteger(page) || page < -1 || page >= STASH_PAGES) throw new Error('Nieprawidłowa strona schowka.');
  const all = [...state.inventory, ...state.stash];
  const entry = [...all, ...state.overflow].find((entry) => entry.id === id);
  if (!entry) throw new Error('Nie znaleziono przedmiotu.');
  const target = point ? { ...point, page } : firstFree(all, state.positions, entry, page);
  if (!target || !fits(all, state.positions, entry, target)) throw new Error('Brak miejsca: przedmiot nie mieści się w wybranym miejscu.');
  const inventory = state.inventory.filter((entry) => entry.id !== id);
  const stash = state.stash.filter((entry) => entry.id !== id);
  (page === -1 ? inventory : stash).push(entry);
  return { ...state, inventory, stash, overflow: state.overflow.filter((entry) => entry.id !== id), positions: { ...state.positions, [id]: target },
    preparation: page !== -1 && state.preparation.equipmentId === id ? { ...state.preparation, equipmentId: null } : state.preparation, updatedAt: now };
}
