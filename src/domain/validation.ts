import { getItem, locations, skillNames } from './catalog';
import type { GameState } from './types';

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const integer = (value: unknown): value is number => number(value) && Number.isSafeInteger(value);
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const timestamp = (value: unknown): value is number => integer(value) && value >= 0;

function validStructure(value: unknown): boolean {
  if (!record(value) || (value.schemaVersion !== 1 && value.schemaVersion !== 2) || !timestamp(value.updatedAt)) return false;
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

export function isGameState(value: unknown): value is GameState {
  if (!record(value) || value.schemaVersion !== 2 || !validStructure(value)) return false;
  const report = value.lastReport;
  return report === null || (record(report) && nonempty(report.expeditionId)
    && locations.some((location) => location.id === report.locationId)
    && timestamp(report.returnedAt) && integer(report.scrap) && report.scrap > 0
    && (!record(value.activeExpedition) || value.activeExpedition.id !== report.expeditionId));
}

export function validateSave(value: unknown): GameState {
  if (record(value) && value.schemaVersion !== 1 && value.schemaVersion !== 2) {
    throw new Error('Nieobsługiwana wersja zapisu. Dane pozostawiono bez zmian.');
  }
  if (record(value) && value.schemaVersion === 1 && validStructure(value)) {
    return validateSave({ ...value, schemaVersion: 2, lastReport: null });
  }
  if (!isGameState(value)) throw new Error('Zapis jest nieprawidłowy. Dane pozostawiono bez zmian.');
  return value;
}
