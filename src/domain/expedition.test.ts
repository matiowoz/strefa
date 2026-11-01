import { describe, expect, it, vi } from 'vitest';
import { createInitialState, selectLocation, startExpedition, settleExpedition } from './game';
import { validateSave } from './validation';

const scrap = (state: ReturnType<typeof createInitialState>) => state.inventory.find((entry) => entry.itemId === 'scrap')!.quantity;

describe('minimalna wyprawa', () => {
  it('blokuje drugą wyprawę i odbiór przed terminem', () => {
    const state = startExpedition(createInitialState(0), 1000);
    expect(state.activeExpedition?.expectedReturnAt).toBe(61000);
    expect(() => startExpedition(state, 2000)).toThrow();
    expect(() => settleExpedition(state, state.activeExpedition!.id, 60999)).toThrow();
    expect(scrap(state)).toBe(4);
  });
  it('zachowuje cel mimo zmiany mapy i rozlicza dokładnie na granicy czasu', () => {
    const initial = createInitialState(0);
    const started = startExpedition(initial, 1000, () => 0.5);
    const changed = selectLocation(started, 'workshop', 2000);
    const settled = settleExpedition(changed, started.activeExpedition!.id, 61000);
    expect(settled.lastReport).toMatchObject({ locationId: 'outskirts', returnedAt: 61000, scrap: 2 });
    expect(scrap(settled)).toBe(6);
    expect(settled.activeExpedition).toBeNull();
    expect(settled.hero).toEqual(initial.hero);
    expect(scrap(initial)).toBe(4);
    expect(settleExpedition(settled, started.activeExpedition!.id, 100000)).toBe(settled);
    const second = startExpedition(settled, 100000);
    expect(settleExpedition(second, started.activeExpedition!.id, 300000)).toBe(second);
  });
  it('ma ten sam wynik po nieobecności i nie nalicza wielu cykli', () => {
    const started = startExpedition(selectLocation(createInitialState(0), 'workshop', 0), 1000, () => 0.6);
    const reopened = validateSave(JSON.parse(JSON.stringify(started)));
    const immediate = settleExpedition(started, started.activeExpedition!.id, 121000);
    const later = settleExpedition(reopened, reopened.activeExpedition!.id, 9000000);
    expect(later.inventory).toEqual(immediate.inventory);
    expect(later.lastReport).toEqual(immediate.lastReport);
    expect(scrap(later)).toBe(8);
  });
  it('migruje poprawny v1 bez utraty postępu i odrzuca uszkodzone raporty', () => {
    const current = createInitialState(1000);
    const { lastReport: _, ...legacy } = current;
    expect(validateSave({ ...legacy, schemaVersion: 1, inventory: [current.backpack, ...current.inventory] })).toMatchObject({ inventory: current.inventory, backpack: current.backpack, hero: current.hero });
    expect(() => validateSave({ ...legacy, schemaVersion: 1, inventory: [] , hero: null })).toThrow();
    expect(() => validateSave({ ...current, lastReport: { expeditionId: 'e', locationId: 'workshop', returnedAt: 100, scrap: -1 } })).toThrow();
  });
});

it('uruchamia wyprawę przez HTTP w LAN bez crypto.randomUUID i nadaje niezależne ID', () => {
  const getRandomValues = crypto.getRandomValues.bind(crypto);
  vi.stubGlobal('crypto', { getRandomValues });
  try {
    const state = createInitialState(0);
    const first = startExpedition(state, 1000, () => 0.5);
    const second = startExpedition(state, 1000, () => 0.5);
    expect(first.activeExpedition!.id).toMatch(/^[a-f0-9]{32}$/);
    expect(second.activeExpedition!.id).not.toBe(first.activeExpedition!.id);
    expect(validateSave(JSON.parse(JSON.stringify(first)))).toEqual(first);
    expect(settleExpedition(first, first.activeExpedition!.id, 61000).lastReport!.expeditionId).toBe(first.activeExpedition!.id);
  } finally { vi.unstubAllGlobals(); }
});
