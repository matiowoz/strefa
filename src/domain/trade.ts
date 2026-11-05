import { arrange, atShelter } from './inventory';
import { addResources } from './preparation';
import type { GameState, InventoryEntry } from './types';

export const tradeGoods = ['water', 'ration', 'bandage'] as const;
export type TradeGood = typeof tradeGoods[number];
export const initialTraderStock = () => ({ water: 6, ration: 4, bandage: 4 });
const buyCost = { water: 3, ration: 4, bandage: 5 };
const values: Record<string, number> = { scrap: 1, cloth: 2, food: 1, 'raw-water': 1, water: 1, ration: 2, bandage: 2, helmet: 8, jacket: 10, boots: 8, crowbar: 10 };
export function tradeValue(entry: InventoryEntry): number {
  const value = values[entry.itemId] ?? 0;
  return entry.condition === null ? value : Math.floor(value * entry.condition / 100);
}
export function tradeQuote(state: GameState, id: string, amount: number, good: string): number {
  const entry = state.inventory.find((item) => item.id === id);
  if (!entry || !Number.isSafeInteger(amount) || amount < 1 || amount > entry.quantity || !tradeGoods.some((item) => item === good)) return 0;
  const total = tradeValue(entry) * amount;
  if (!Number.isSafeInteger(total)) return 0;
  return Math.floor(total / buyCost[good as TradeGood]);
}
export function tradeItem(state: GameState, id: string, amount: number, good: string, now = Date.now()): GameState {
  if (!atShelter(state, now)) throw new Error('Wymiana jest dostępna po powrocie do kryjówki.');
  const output = tradeQuote(state, id, amount, good);
  if (output < 1) throw new Error('Nieprawidłowa wymiana lub za mała wartość przedmiotów.');
  const itemId = good as TradeGood;
  if (output > state.trader.stock[itemId]) throw new Error('Handlarz nie ma tylu zapasów.');
  const remaining = state.inventory.map((entry) => entry.id === id ? { ...entry, quantity: entry.quantity - amount } : entry).filter((entry) => entry.quantity > 0);
  return arrange({ ...state, updatedAt: now, inventory: addResources(remaining, [{ itemId, quantity: output }]), trader: { stock: { ...state.trader.stock, [itemId]: state.trader.stock[itemId] - output } } });
}
