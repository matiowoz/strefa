import { describe, expect, it } from 'vitest';
import { createInitialState, inventoryWeight, renameHero, selectLocation } from './game';
import { isGameState, validateSave } from './validation';

describe('reguły podstawowego stanu', () => {
  it('tworzy niezależne stany bez aktywnej wyprawy', () => {
    const first = createInitialState(1000);
    const second = createInitialState(1000);
    first.hero.skills.crafting = 7;
    expect(second.hero.skills.crafting).toBe(1);
    expect(first.activeExpedition).toBeNull();
    expect(isGameState(second)).toBe(true);
  });
  it('zmienia pseudonim bez przenoszenia doświadczenia i mutacji oryginału', () => {
    const state = createInitialState(1000);
    const next = renameHero(state, '  Kruk  ', 2000);
    expect(next.hero.name).toBe('Kruk');
    expect(next.hero.skills).toEqual(state.hero.skills);
    expect(state.hero.name).toBe('Ocalały');
    expect(next.updatedAt).toBe(2000);
  });
  it.each([' ', 'X', 'x'.repeat(25), 'Kr\nuk'])('odrzuca błędny pseudonim %j', (name) => {
    expect(() => renameHero(createInitialState(), name)).toThrow();
  });
  it('wybiera tylko istniejący punkt i nie uruchamia wyprawy', () => {
    const state = createInitialState(1000);
    const next = selectLocation(state, 'workshop', 2000);
    expect(next.selectedLocationId).toBe('workshop');
    expect(next.activeExpedition).toBeNull();
    expect(state.selectedLocationId).toBe('outskirts');
    expect(() => selectLocation(state, 'missing')).toThrow();
  });
  it('liczy rzeczywistą masę przedmiotów z ilościami', () => {
    const state = createInitialState();
    expect(inventoryWeight(state)).toBeCloseTo(7.2);
    expect(inventoryWeight({ ...state, inventory: [] })).toBe(0);
  });
});

describe('walidacja wersjonowanego zapisu', () => {
  it('odrzuca nowszą wersję zamiast tworzyć nowy stan', () => {
    expect(() => validateSave({ ...createInitialState(), schemaVersion: 4 })).toThrow('wersja');
  });
  it.each([
    null,
    {},
    { ...createInitialState(), updatedAt: NaN },
    { ...createInitialState(), selectedLocationId: 'missing' },
    { ...createInitialState(), hero: { ...createInitialState().hero, health: 101 } },
    { ...createInitialState(), inventory: [{ id: 'x', itemId: 'missing', quantity: 1, condition: null }] },
    { ...createInitialState(), inventory: [{ id: 'x', itemId: 'water', quantity: -1, condition: null }] },
    { ...createInitialState(), inventory: [{ id: 'x', itemId: 'backpack', quantity: 1, condition: 101 }] },
    { ...createInitialState(), activeExpedition: {} },
  ])('odrzuca uszkodzoną strukturę %#', (raw) => {
    expect(isGameState(raw)).toBe(false);
  });
  it('odrzuca powielony identyfikator egzemplarza', () => {
    const state = createInitialState();
    state.inventory.push({ ...state.inventory[0] });
    expect(isGameState(state)).toBe(false);
  });
  it('sprawdza również zapis planu i czasu przyszłej wyprawy', () => {
    const state = createInitialState();
    state.activeExpedition = { cargo: { equipmentId: null, water: 0, ration: 0, loot: [{ itemId: 'scrap', quantity: 4 }] }, id: 'e1', plan: { locationId: 'workshop', strategy: 'cautious' }, status: 'running', startedAt: 1000, expectedReturnAt: 2000 };
    expect(isGameState(state)).toBe(true);
    state.activeExpedition.expectedReturnAt = 500;
    expect(isGameState(state)).toBe(false);
  });
});
