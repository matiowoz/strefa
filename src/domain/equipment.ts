import { getItem } from './catalog';
import { atShelter, firstFree, fits } from './inventory';
import type { EquipmentSlot, GameState, InventoryEntry } from './types';

export const equipmentSlots = ['head', 'body', 'hands', 'feet', 'weapon', 'sidearm'] as const;
export const emptyEquipment = (): GameState['equipped'] => ({ head: null, body: null, hands: null, feet: null, weapon: null, sidearm: null });
export const equipmentSlot = (entry: InventoryEntry): EquipmentSlot | undefined => getItem(entry.itemId)?.slot;
export const wornItems = (state: GameState): InventoryEntry[] => Object.values(state.equipped).filter((entry): entry is InventoryEntry => entry !== null);

export function equipItem(state: GameState, id: string, slot: EquipmentSlot, now = Date.now()): GameState {
  if (!atShelter(state, now)) throw new Error('Zmień wyposażenie po powrocie do kryjówki.');
  const entry = state.inventory.find((item) => item.id === id);
  if (!entry || !equipmentSlots.includes(slot) || equipmentSlot(entry) !== slot || entry.quantity !== 1) return state;
  const previous = state.equipped[slot];
  const inventory = state.inventory.filter((item) => item.id !== id);
  const positions = { ...state.positions }; delete positions[id];
  if (previous) {
    const all = [...inventory, ...state.stash];
    const original = state.positions[id];
    const target = fits(all, positions, previous, original) ? original : firstFree(all, positions, previous, -1);
    if (!target) return state;
    inventory.push(previous); positions[previous.id] = target;
  }
  return { ...state, inventory, positions, equipped: { ...state.equipped, [slot]: entry }, updatedAt: now };
}

export function unequipItem(state: GameState, id: string, point?: { x: number; y: number }, now = Date.now()): GameState {
  if (!atShelter(state, now)) throw new Error('Zmień wyposażenie po powrocie do kryjówki.');
  const slot = equipmentSlots.find((key) => state.equipped[key]?.id === id);
  if (!slot) return state;
  const entry = state.equipped[slot]!;
  const all = [...state.inventory, ...state.stash];
  const target = point ? { ...point, page: -1 } : firstFree(all, state.positions, entry, -1);
  if (!target || !fits(all, state.positions, entry, target)) return state;
  return { ...state, inventory: [...state.inventory, entry], positions: { ...state.positions, [id]: target }, equipped: { ...state.equipped, [slot]: null }, updatedAt: now };
}
