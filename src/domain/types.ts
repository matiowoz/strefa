export type SkillId = 'combat' | 'scouting' | 'survival' | 'medicine' | 'crafting' | 'electronics' | 'trade' | 'transport';
export interface Hero {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  skills: Record<SkillId, number>;
}

export type ItemCategory = 'equipment' | 'supply' | 'material';
export interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  weightKg: number;
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
export interface Expedition {
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
  expeditionId: string;
  locationId: string;
  returnedAt: number;
  scrap: number;
}

export interface GameState {
  schemaVersion: 2;
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
