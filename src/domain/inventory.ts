import { getItem } from './catalog';
import type { GameState, InventoryEntry, Placement } from './types';

export const GRID_COLUMNS = 5;
export const GRID_ROWS = 9;
export const STASH_PAGES = 1;
export const MAX_ITEM_WIDTH = 2;
export const MAX_ITEM_HEIGHT = 3;
export const STASH_SIZE = { columns: 8, rows: 9 };
export const gridSize = (page: number) => page === -1 ? { columns: GRID_COLUMNS, rows: GRID_ROWS } : STASH_SIZE;
// Demonstracyjne rozmiary jednego stosu (ilości zachowują dotychczasowy model).
export const itemSizes: Record<string, { width: number; height: number }> = {
  antibiotic: { width: 1, height: 1 },
  helmet: { width: 2, height: 2 }, jacket: { width: 2, height: 3 }, boots: { width: 2, height: 2 }, crowbar: { width: 1, height: 3 },
  'electronic-parts': { width: 1, height: 1 },
  backpack: { width: 2, height: 3 }, water: { width: 1, height: 2 },
  ration: { width: 1, height: 1 }, bandage: { width: 1, height: 1 },
  scrap: { width: 2, height: 2 }, 'raw-water': { width: 1, height: 2 },
  food: { width: 2, height: 2 }, cloth: { width: 2, height: 1 },
};

export function fits(entries: InventoryEntry[], positions: Record<string, Placement>, entry: InventoryEntry, point: Placement, pageCount = STASH_PAGES, stashSize = STASH_SIZE): boolean {
  const size = itemSizes[entry.itemId];
  const bounds = point.page === -1 ? gridSize(-1) : stashSize;
  if (!size || size.width > MAX_ITEM_WIDTH || size.height > MAX_ITEM_HEIGHT || !Number.isInteger(point.x) || !Number.isInteger(point.y) || !Number.isInteger(point.page)
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

export function firstFree(entries: InventoryEntry[], positions: Record<string, Placement>, entry: InventoryEntry, page: number): Placement | null {
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

export class InventorySpaceError extends Error {}

export function moveItem(state: GameState, id: string, page: number, point?: { x: number; y: number }, now = Date.now()): GameState {
  if (!atShelter(state, now)) throw new Error('Przenoszenie rzeczy jest dostępne po powrocie do kryjówki.');
  if (state.activeExpedition?.cargo.equipmentId === id) throw new Error('Odbierz raport, aby zwolnić wyposażenie wyprawy.');
  if (!Number.isInteger(page) || page < -1 || page >= STASH_PAGES) throw new Error('Nieprawidłowa strona schowka.');
  const all = [...state.inventory, ...state.stash];
  const entry = [...all, ...state.overflow].find((entry) => entry.id === id);
  if (!entry) throw new Error('Nie znaleziono przedmiotu.');
  const target = point ? { ...point, page } : firstFree(all, state.positions, entry, page);
  if (!target || !fits(all, state.positions, entry, target)) throw new InventorySpaceError('Brak miejsca: przedmiot nie mieści się w wybranym miejscu.');
  const inventory = state.inventory.filter((entry) => entry.id !== id);
  const stash = state.stash.filter((entry) => entry.id !== id);
  (page === -1 ? inventory : stash).push(entry);
  return { ...state, inventory, stash, overflow: state.overflow.filter((entry) => entry.id !== id), positions: { ...state.positions, [id]: target },
    preparation: page !== -1 && state.preparation.equipmentId === id ? { ...state.preparation, equipmentId: null } : state.preparation, updatedAt: now };
}

export function tryMoveItem(...args: Parameters<typeof moveItem>): GameState {
  try { return moveItem(...args); }
  catch (error) { if (error instanceof InventorySpaceError) return args[0]; throw error; }
}

// A split stays in its source container. Lack of room is a silent no-op.
export function splitStack(state: GameState, id: string, amount: number, now = Date.now()): GameState {
  if (!atShelter(state, now)) throw new Error('Rozdzielanie jest dostępne po powrocie do kryjówki.');
  const carried = state.inventory.some((entry) => entry.id === id);
  const source = carried ? state.inventory : state.stash;
  const entry = source.find((entry) => entry.id === id);
  if (!entry) throw new Error('Nie znaleziono stosu w siatce.');
  if (!Number.isSafeInteger(amount) || amount < 1 || amount >= entry.quantity) throw new Error('Wybierz liczbę mniejszą od całego stosu.');
  const all = [...state.inventory, ...state.stash, ...state.overflow, state.backpack, ...Object.values(state.equipped).filter((entry): entry is InventoryEntry => entry !== null)];
  let newId = `${id}-split`;
  while (all.some((item) => item.id === newId)) newId += '-new';
  const separated = { ...entry, id: newId, quantity: amount };
  const target = firstFree([...state.inventory, ...state.stash], state.positions, separated, carried ? -1 : 0);
  if (!target) return state;
  const next = [...source.map((item) => item.id === id ? { ...item, quantity: item.quantity - amount } : item), separated];
  return { ...state, inventory: carried ? next : state.inventory, stash: carried ? state.stash : next,
    positions: { ...state.positions, [newId]: target }, updatedAt: now };
}

export function canMergeStacks(source: InventoryEntry, target: InventoryEntry): boolean {
  return source.id !== target.id && source.itemId === target.itemId && source.condition === target.condition
    && ['supply', 'material'].includes(getItem(source.itemId)?.category ?? '')
    && Number.isSafeInteger(source.quantity) && source.quantity > 0
    && Number.isSafeInteger(target.quantity) && target.quantity > 0
    && Number.isSafeInteger(source.quantity + target.quantity);
}

// Keep the destination's identity and placement, free the source's cells.
export function mergeStacks(state: GameState, sourceId: string, targetId: string, now = Date.now()): GameState {
  if (!atShelter(state, now)) throw new Error('Łączenie jest dostępne po powrocie do kryjówki.');
  const all = [...state.inventory, ...state.stash];
  const source = all.find((entry) => entry.id === sourceId);
  const target = all.find((entry) => entry.id === targetId);
  if (!source || !target || !canMergeStacks(source, target)) return state;
  const merged = { ...target, quantity: target.quantity + source.quantity };
  const combine = (entries: InventoryEntry[]) => entries.filter((entry) => entry.id !== sourceId).map((entry) => entry.id === targetId ? merged : entry);
  const positions = { ...state.positions }; delete positions[sourceId];
  return { ...state, inventory: combine(state.inventory), stash: combine(state.stash), positions, updatedAt: now };
}
