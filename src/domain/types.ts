export type SkillId = 'combat' | 'scouting' | 'survival' | 'medicine' | 'crafting' | 'electronics' | 'trade' | 'transport';
export interface Hero {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  skills: Record<SkillId, number>;
}

export type EquipmentSlot = 'head' | 'body' | 'hands' | 'feet' | 'weapon' | 'sidearm';
export type ItemCategory = 'equipment' | 'supply' | 'material';
export interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  weightKg: number;
  slot?: EquipmentSlot;
  description: string;
}
export interface InventoryEntry {
  id: string;
  itemId: string;
  quantity: number;
  condition: number | null;
}

export type Strategy = 'cautious' | 'balanced' | 'aggressive';
export interface ExpeditionPlan {
  locationId: string;
  strategy: Strategy;
}
export interface ResourceAmount { itemId: string; quantity: number }
export interface Preparation { kit: 'light' | 'stocked'; equipmentId: string | null }
export interface Cargo {
  equipmentId: string | null;
  water: number;
  ration: number;
  loot: ResourceAmount[];
}
export type ExpeditionEventId = 'apartment' | 'courtyard' | 'workshop-floor' | 'storeroom' | 'locked-cache' | 'blocked-road';
export interface ExpeditionEvent { id: ExpeditionEventId; loot: ResourceAmount[]; cacheResult?: 'no-tool' | 'opened' | 'jammed' }
export interface ExpeditionHealth { jacketWorn: boolean; sickAtStart: boolean; contracted: boolean }
export interface Expedition {
  health: ExpeditionHealth | null;
  events: ExpeditionEvent[] | null;
  cargo: Cargo;
  id: string;
  plan: ExpeditionPlan;
  status: 'running' | 'returning';
  startedAt: number;
  expectedReturnAt: number;
}
export interface Location {
  id: string;
  name: string;
  description: string;
  discovery: 'known' | 'visited';
}

export interface ExpeditionReport {
  health: ExpeditionHealth | null;
  events: ExpeditionEvent[] | null;
  cargo: Cargo;
  expeditionId: string;
  locationId: string;
  returnedAt: number;
  scrap: number;
}

export interface Placement { x: number; y: number; page: number } // -1 = ekwipunek, 0 = schowek
export interface GameState {
  schemaVersion: 14;
  miraQuest: 'available' | 'active' | 'completed';
  trader: { stock: Record<import('./trade').TradeGood, number> };
  quests: import('./quests').QuestProgress;
  illness: { startedAt: number; endsAt: number } | null; // Legacy shape for migration; v14 requires null.
  equipped: Record<EquipmentSlot, InventoryEntry | null>;
  backpack: InventoryEntry;
  progress: { workshopVisited: boolean; workbenchRepaired: boolean };
  positions: Record<string, Placement>;
  stash: InventoryEntry[];
  overflow: InventoryEntry[];
  preparation: Preparation; // Metadane dawnych zapisów; nowe wyprawy korzystają z inventory i backpack.
  lastReport: ExpeditionReport | null;
  updatedAt: number;
  hero: Hero;
  inventory: InventoryEntry[];
  selectedLocationId: string;
  activeExpedition: Expedition | null;
}

// Port zależy wyłącznie od domeny. Adapter HTTP może później zastąpić IndexedDB.
export interface GameRepository {
  load(): Promise<GameState | null>;
  save(state: GameState, expected?: GameState | null): Promise<void>;
}
