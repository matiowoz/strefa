import type { ExpeditionEvent, ExpeditionEventId, ResourceAmount } from './types';

// Prototype encounters: no combat, equipment checks or player decisions yet.
export const eventDefinitions = {
  apartment: { title: 'Opuszczone mieszkanie', description: 'Przeszukano szafki, przewrócone meble i resztki kuchennych zapasów.', locations: ['outskirts'], drops: [{ itemId: 'raw-water', maximum: 3 }, { itemId: 'food', maximum: 3 }, { itemId: 'cloth', maximum: 2 }] },
  courtyard: { title: 'Podwórze za blokami', description: 'Wśród porzuconych sprzętów i gruzu szukano rzeczy nadających się do odzysku.', locations: ['outskirts'], drops: [{ itemId: 'scrap', maximum: 4 }] },
  'workshop-floor': { title: 'Zaplecze warsztatu', description: 'Przeszukano stare stanowiska pracy, szuflady i skrzynki pod stołami.', locations: ['workshop'], drops: [{ itemId: 'scrap', maximum: 6 }, { itemId: 'cloth', maximum: 2 }] },
  storeroom: { title: 'Magazyn przy warsztacie', description: 'Między pustymi regałami sprawdzono pozostawione pojemniki i zapasy.', locations: ['workshop'], drops: [{ itemId: 'raw-water', maximum: 3 }, { itemId: 'food', maximum: 3 }] },
  'locked-cache': { title: 'Zamknięta skrzynia', description: 'Zardzewiały zamek nie ustąpił. Skrzynia została na miejscu, a postać ruszyła dalej.', locations: ['outskirts', 'workshop'], drops: [] },
  'blocked-road': { title: 'Zatarasowana droga', description: 'Zawalone przejście odcięło drogę do celu. Postać zawróciła, nie docierając do miejsca poszukiwań.', locations: ['outskirts', 'workshop'], drops: [] },
} as const;
const routes: Record<string, readonly [ExpeditionEventId, ExpeditionEventId]> = {
  outskirts: ['apartment', 'courtyard'], workshop: ['workshop-floor', 'storeroom'],
};
const resourceOrder = ['scrap', 'raw-water', 'food', 'cloth'];
function roll(random: () => number): number {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Nieprawidłowe losowanie.');
  return value;
}

export function eventLoot(events: readonly ExpeditionEvent[]): ResourceAmount[] {
  return resourceOrder.map((itemId) => ({ itemId, quantity: events.reduce((sum, event) => sum + event.loot.filter((entry) => entry.itemId === itemId).reduce((total, entry) => total + entry.quantity, 0), 0) })).filter((entry) => entry.quantity > 0);
}

export function resolveExpeditionEvents(locationId: string, random: () => number): ExpeditionEvent[] {
  const route = routes[locationId];
  if (!route) throw new Error('Nieznana trasa wyprawy.');
  if (roll(random) < 0.15) return [{ id: 'blocked-road', loot: [] }];
  const search = (id: ExpeditionEventId): ExpeditionEvent => ({ id, loot: eventDefinitions[id].drops.map(({ itemId, maximum }) => ({ itemId, quantity: Math.floor(roll(random) * (maximum + 1)) })).filter((entry) => entry.quantity > 0) });
  const first = search(route[0]);
  const cache: ExpeditionEvent[] = roll(random) < 0.30 ? [{ id: 'locked-cache', loot: [] }] : [];
  return [first, ...cache, search(route[1])];
}

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
export function validExpeditionEvents(value: unknown, locationId: string, loot: readonly ResourceAmount[]): boolean {
  if (value === null) return true; // Migrated trips have no invented history.
  if (!Array.isArray(value) || value.length < 1 || value.length > 3 || !routes[locationId]) return false;
  for (const event of value) {
    if (!record(event) || typeof event.id !== 'string' || !Object.hasOwn(eventDefinitions, event.id) || !Array.isArray(event.loot)) return false;
    const definition = eventDefinitions[event.id as ExpeditionEventId];
    if (!(definition.locations as readonly string[]).includes(locationId)) return false;
    const ids = new Set<string>();
    for (const resource of event.loot) {
      if (!record(resource) || typeof resource.itemId !== 'string' || typeof resource.quantity !== 'number' || !Number.isSafeInteger(resource.quantity) || resource.quantity < 1 || ids.has(resource.itemId)) return false;
      const drop = definition.drops.find((entry) => entry.itemId === resource.itemId);
      if (!drop || resource.quantity > drop.maximum) return false;
      ids.add(resource.itemId);
    }
  }
  const events = value as ExpeditionEvent[];
  const route = routes[locationId];
  const ids = events.map((event) => event.id);
  const blocked = ids.length === 1 && ids[0] === 'blocked-road';
  const searched = ids.length === 2 && ids[0] === route[0] && ids[1] === route[1];
  const searchedWithCache = ids.length === 3 && ids[0] === route[0] && ids[1] === 'locked-cache' && ids[2] === route[1];
  if (!blocked && !searched && !searchedWithCache) return false;
  const expected = eventLoot(events);
  return expected.length === loot.length && loot.every((entry) => expected.some((resource) => resource.itemId === entry.itemId && resource.quantity === entry.quantity));
}
