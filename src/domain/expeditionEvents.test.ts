import { describe, expect, it } from 'vitest';
import { eventLoot, resolveExpeditionEvents } from './expeditionEvents';
import { createInitialState, selectLocation, settleExpedition, startExpedition } from './game';
import type { ExpeditionEvent } from './types';
import { isGameState, validateSave } from './validation';

const sequence = (...values: number[]) => { let index = 0; return () => { if (index >= values.length) throw new Error('Losowanie po utrwaleniu wyniku.'); return values[index++]; }; };

describe('krótkie historie wypraw', () => {
  it.each(['outskirts', 'workshop'])('zatarasowana droga do %s kończy poszukiwania przed celem', (location) => {
    const initial = selectLocation(createInitialState(0), location, 0);
    const trip = startExpedition(initial, 1000, sequence(0, .99));
    expect(trip.activeExpedition!.events).toEqual([{ id: 'blocked-road', loot: [] }]);
    expect(trip.activeExpedition!.cargo.loot).toEqual([]);
    const result = settleExpedition(trip, trip.activeExpedition!.id, trip.activeExpedition!.expectedReturnAt);
    expect(result.inventory).toEqual(initial.inventory);
    expect(result.hero).toEqual(initial.hero);
    expect(result.backpack).toEqual(initial.backpack);
    expect(result.progress.workshopVisited).toBe(false);
    expect(isGameState(result)).toBe(true);
  });
  it('przeszukanie mieszkania, zamknięta skrzynia i podwórze wyjaśniają każde znalezisko', () => {
    const trip = startExpedition(createInitialState(0), 1000, sequence(.5, .99, .5, .99, .1, .99, .99, .99, .99, .99));
    expect(trip.activeExpedition!.events).toEqual([
      { id: 'apartment', loot: [{ itemId: 'raw-water', quantity: 3 }, { itemId: 'food', quantity: 2 }, { itemId: 'cloth', quantity: 2 }] },
      { id: 'locked-cache', loot: [], cacheResult: 'no-tool' },
      { id: 'courtyard', loot: [{ itemId: 'scrap', quantity: 4 }] },
    ]);
    expect(trip.activeExpedition!.cargo.loot).toEqual(eventLoot(trip.activeExpedition!.events!));
    const loaded = validateSave(JSON.parse(JSON.stringify(trip)));
    const result = settleExpedition(loaded, loaded.activeExpedition!.id, 999999);
    expect(result.lastReport!.events).toEqual(trip.activeExpedition!.events);
    expect(result.lastReport!.cargo).toEqual(trip.activeExpedition!.cargo);
    expect(settleExpedition(result, trip.activeExpedition!.id, 999999)).toBe(result);
  });
  it('pozwala przeszukać miejsca i wrócić bez łupów, ale zalicza dotarcie do warsztatu', () => {
    const events = resolveExpeditionEvents('workshop', sequence(.5, 0, 0, .99, 0, 0, .99, .99, .99, .99));
    expect(events.map((event) => event.id)).toEqual(['workshop-floor', 'storeroom']);
    expect(eventLoot(events)).toEqual([]);
    const trip = startExpedition(selectLocation(createInitialState(0), 'workshop', 0), 1000, sequence(.5, 0, 0, .99, 0, 0, .99, .99, .99, .99));
    expect(settleExpedition(trip, trip.activeExpedition!.id, 121000).progress.workshopVisited).toBe(true);
  });
  it('warsztat ma własne miejsca i zapisany wynik nie zmienia się po wyborze innego celu', () => {
    const trip = startExpedition(selectLocation(createInitialState(0), 'workshop', 0), 1000, () => .99);
    expect(trip.activeExpedition!.events!.map((event) => event.id)).toEqual(['workshop-floor', 'storeroom']);
    const changed = selectLocation(trip, 'outskirts', 2000);
    const result = settleExpedition(changed, trip.activeExpedition!.id, 121000);
    expect(result.lastReport!.events).toEqual(trip.activeExpedition!.events);
    expect(result.lastReport!.locationId).toBe('workshop');
  });
  it('odrzuca błędny los na każdym etapie i nieznaną trasę', () => {
    expect(() => resolveExpeditionEvents('unknown', () => .5)).toThrow();
    for (let i = 0; i < 8; i++) expect(() => resolveExpeditionEvents('outskirts', sequence(...Array(i).fill(.5), NaN))).toThrow('losowanie');
  });
});

describe('walidacja dziennika i migracja', () => {
  const trip = () => startExpedition(createInitialState(0), 1000, () => .5);
  it.each([
    undefined, [], {}, [{ id: 'unknown', loot: [] }], [{ id: 'storeroom', loot: [] }],
    [{ id: 'blocked-road', loot: [{ itemId: 'scrap', quantity: 1 }] }],
    [{ id: '__proto__', loot: [] }],
  ])('odrzuca niepełny lub nieprawidłowy dziennik %#', (events) => {
    const started = trip();
    expect(() => validateSave({ ...started, activeExpedition: { ...started.activeExpedition, events } })).toThrow();
  });
  it('odrzuca zmienioną ilość, typ, kolejność, przekroczony limit i rozbieżność z łącznym łupem', () => {
    const started = trip();
    const check = (events: unknown) => expect(isGameState({ ...started, activeExpedition: { ...started.activeExpedition, events } })).toBe(false);
    const events = started.activeExpedition!.events!;
    check([...events].reverse());
    check([{ id: 'apartment', loot: [{ itemId: 'backpack', quantity: 1 }] }, events[1]]);
    check([{ id: 'apartment', loot: [{ itemId: 'food', quantity: -1 }] }, events[1]]);
    check([{ id: 'apartment', loot: [{ itemId: 'food', quantity: 4 }] }, events[1]]);
    check([{ id: 'apartment', loot: [{ itemId: 'food', quantity: 1 }, { itemId: 'food', quantity: 1 }] }, events[1]]);
    check([{ ...events[0], loot: [] }, events[1]]);
    const report = settleExpedition(started, started.activeExpedition!.id, 61000);
    expect(isGameState({ ...report, lastReport: { ...report.lastReport, events: [] } })).toBe(false);
  });
  it('sumuje łupy zdarzeń bez zmiany ich danych', () => {
    const events: ExpeditionEvent[] = [{ id: 'apartment', loot: [{ itemId: 'cloth', quantity: 1 }] }, { id: 'courtyard', loot: [{ itemId: 'cloth', quantity: 2 }] }];
    const original = structuredClone(events);
    expect(eventLoot(events)).toEqual([{ itemId: 'cloth', quantity: 3 }]);
    expect(events).toEqual(original);
  });
  it('migruje v7 z aktywną wyprawą i raportem bez dopisywania zdarzeń lub zmiany łupów', () => {
    const started = trip();
    const settled = settleExpedition(started, started.activeExpedition!.id, 61000);
    const next = startExpedition(settled, 62000, () => .99);
    const { events: _events, ...active } = next.activeExpedition!;
    const { events: _reportEvents, ...report } = next.lastReport!;
    const old = { ...next, schemaVersion: 7, activeExpedition: active, lastReport: report };
    const loaded = validateSave(old);
    expect(loaded.schemaVersion).toBe(14);
    expect(loaded.activeExpedition).toEqual({ ...active, events: null, health: null });
    expect(loaded.lastReport).toEqual({ ...report, events: null, health: null });
    expect(loaded.inventory).toEqual(old.inventory);
    expect(loaded.positions).toEqual(old.positions);
    const result = settleExpedition(loaded, active.id, active.expectedReturnAt);
    expect(result.lastReport!.events).toBeNull();
    expect(result.lastReport!.cargo).toEqual(active.cargo);
    expect(() => validateSave({ ...old, positions: {} })).toThrow();
  });
});
