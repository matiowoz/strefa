import { getItem, locations, skillNames } from './catalog';
import type { Cargo, GameState } from './types';

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const integer = (value: unknown): value is number => number(value) && Number.isSafeInteger(value);
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const timestamp = (value: unknown): value is number => integer(value) && value >= 0;

function validStructure(value: unknown): boolean {
  if (!record(value) || (value.schemaVersion !== 1 && value.schemaVersion !== 2 && value.schemaVersion !== 3) || !timestamp(value.updatedAt)) return false;
  const { hero, inventory, activeExpedition } = value;
  if (!record(hero) || !nonempty(hero.id) || !nonempty(hero.name)
    || hero.name.trim() !== hero.name || hero.name.length < 2 || hero.name.length > 24
    || /[\u0000-\u001f\u007f]/u.test(hero.name)
    || !integer(hero.level) || hero.level < 1 || !number(hero.health)
    || !number(hero.maxHealth) || hero.maxHealth <= 0 || hero.health < 0 || hero.health > hero.maxHealth
    || !record(hero.skills)) return false;
  const skills = hero.skills;
  if (!Object.keys(skillNames).every((key) => integer(skills[key]) && skills[key] >= 1)) return false;
  if (!Array.isArray(inventory)) return false;
  const ids = new Set<string>();
  for (const entry of inventory) {
    if (!record(entry) || !nonempty(entry.id) || ids.has(entry.id) || !nonempty(entry.itemId)
      || !integer(entry.quantity) || entry.quantity < 1) return false;
    const item = getItem(entry.itemId);
    if (!item) return false;
    if (item.category === 'equipment') {
      if (entry.quantity !== 1 || !number(entry.condition) || entry.condition < 0 || entry.condition > 100) return false;
    } else if (entry.condition !== null) return false;
    ids.add(entry.id);
  }
  if (!locations.some((location) => location.id === value.selectedLocationId)) return false;
  if (activeExpedition !== null) {
    if (!record(activeExpedition) || !nonempty(activeExpedition.id) || !record(activeExpedition.plan)
    ) return false;
    const plan = activeExpedition.plan;
    if (!locations.some((location) => location.id === plan.locationId)
      || !['cautious', 'balanced', 'aggressive'].includes(String(plan.strategy))
      || !['running', 'returning'].includes(String(activeExpedition.status))
      || !timestamp(activeExpedition.startedAt) || !timestamp(activeExpedition.expectedReturnAt)
      || activeExpedition.expectedReturnAt < activeExpedition.startedAt) return false;
  }
  return true;
}

function isV2(value: unknown): boolean {
  if (!record(value) || value.schemaVersion !== 2 || !validStructure(value)) return false;
  const report = value.lastReport;
  return report === null || (record(report) && nonempty(report.expeditionId)
    && locations.some((location) => location.id === report.locationId)
    && timestamp(report.returnedAt) && integer(report.scrap) && report.scrap > 0
    && (!record(value.activeExpedition) || value.activeExpedition.id !== report.expeditionId));
}

function validCargo(value: unknown, inventory: unknown, requireEquipment: boolean): value is Cargo {
  if (!record(value) || !(value.equipmentId === null || nonempty(value.equipmentId))
    || !integer(value.water) || value.water < 0 || !integer(value.ration) || value.ration < 0
    || !Array.isArray(value.loot) || value.loot.length === 0) return false;
  if (requireEquipment && value.equipmentId !== null && (!Array.isArray(inventory) || !inventory.some((entry: unknown) => record(entry) && entry.id === value.equipmentId && typeof entry.itemId === 'string' && getItem(entry.itemId)?.category === 'equipment'))) return false;
  const ids = new Set();
  return value.loot.every((entry: unknown) => {
    if (!record(entry) || typeof entry.itemId !== 'string' || !getItem(entry.itemId)
      || getItem(entry.itemId)?.category === 'equipment' || ids.has(entry.itemId)
      || !integer(entry.quantity) || entry.quantity < 1) return false;
    ids.add(entry.itemId); return true;
  }) && value.loot.some((entry: unknown) => record(entry) && entry.itemId === 'scrap');
}

export function isGameState(value: unknown): value is GameState {
  if (!record(value) || value.schemaVersion !== 3 || !validStructure(value)
    || !record(value.preparation) || !['light', 'stocked'].includes(String(value.preparation.kit))) return false;
  const equipmentId = value.preparation.equipmentId;
  if (equipmentId !== null && (!nonempty(equipmentId) || !Array.isArray(value.inventory)
    || !value.inventory.some((entry: unknown) => record(entry) && entry.id === equipmentId && typeof entry.itemId === 'string' && getItem(entry.itemId)?.category === 'equipment'))) return false;
  if (record(value.activeExpedition) && !validCargo(value.activeExpedition.cargo, value.inventory, true)) return false;
  // Reuse the v2 report checks without mutating the source.
  if (!isV2({ ...value, schemaVersion: 2 })) return false;
  const report = value.lastReport;
  if (report === null) return true;
  return record(report) && validCargo(report.cargo, value.inventory, false)
    && report.cargo.loot.some((entry) => entry.itemId === 'scrap' && entry.quantity === report.scrap);
}

export function validateSave(value: unknown): GameState {
  if (record(value) && ![1, 2, 3].includes(Number(value.schemaVersion))) {
    throw new Error('Nieobsługiwana wersja zapisu. Dane pozostawiono bez zmian.');
  }
  if (record(value) && value.schemaVersion === 1 && validStructure(value)) {
    return validateSave({ ...value, schemaVersion: 2, lastReport: null });
  }
  if (record(value) && value.schemaVersion === 2 && isV2(value)) {
    const legacyCargo = (scrap: number) => ({ equipmentId: null, water: 0, ration: 0, loot: [{ itemId: 'scrap', quantity: scrap }] });
    const active = value.activeExpedition;
    const report = value.lastReport;
    // Started trips keep their old costs (zero) and old rewards; never charge retroactively.
    return validateSave({ ...value, schemaVersion: 3, preparation: { kit: 'light', equipmentId: null },
      activeExpedition: record(active) && record(active.plan) ? { ...active, cargo: legacyCargo(active.plan.locationId === 'workshop' ? 4 : 2) } : null,
      lastReport: record(report) ? { ...report, cargo: legacyCargo(report.scrap as number) } : null });
  }
  if (!isGameState(value)) throw new Error('Zapis jest nieprawidłowy. Dane pozostawiono bez zmian.');
  return value;
}
