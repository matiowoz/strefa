import { IDBFactory, IDBDatabase } from 'fake-indexeddb';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { arrange } from '../domain/inventory';
import { createInitialState, renameHero } from '../domain/game';
import { IndexedDbRepository } from './indexedDbRepository';

afterEach(() => vi.restoreAllMocks());

async function writeRaw(factory: IDBFactory, value: unknown): Promise<void> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = factory.open('test', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('saves');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('saves', 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error);
      tx.objectStore('saves').put(value, 'main');
    });
  } finally { db.close(); }
}

describe('adapter IndexedDB', () => {
  it('zwraca null tylko gdy zapisu jeszcze nie ma', async () => {
    expect(await new IndexedDbRepository(new IDBFactory(), 'test').load()).toBeNull();
  });
  it('odtwarza stan po utworzeniu nowego adaptera i nadpisuje poprawną nowszą zmianą', async () => {
    const factory = new IDBFactory();
    const state = createInitialState(1000);
    const repository = new IndexedDbRepository(factory, 'test');
    await repository.save(state);
    const reopened = new IndexedDbRepository(factory, 'test');
    expect(await reopened.load()).toEqual(state);
    const changed = renameHero(state, 'Kruk', 2000);
    await reopened.save(changed);
    expect(await repository.load()).toEqual(changed);
  });
  it('nie traktuje nowszej wersji jako pustej gry i nie usuwa surowych danych', async () => {
    const factory = new IDBFactory();
    await writeRaw(factory, { schemaVersion: 9, marker: 'keep' });
    const repository = new IndexedDbRepository(factory, 'test');
    await expect(repository.load()).rejects.toThrow('wersja');
    await expect(repository.load()).rejects.toThrow('wersja');
  });
  it('odrzuca błędny zapis przed zmianą poprzedniej poprawnej kopii', async () => {
    const repository = new IndexedDbRepository(new IDBFactory(), 'test');
    const state = createInitialState(1000);
    await repository.save(state);
    await expect(repository.save({ ...state, updatedAt: -1 })).rejects.toThrow();
    expect(await repository.load()).toEqual(state);
  });
  it('nie raportuje sukcesu po przerwaniu transakcji i zachowuje poprzedni stan', async () => {
    const repository = new IndexedDbRepository(new IDBFactory(), 'test');
    const state = createInitialState(1000);
    await repository.save(state);
    const original = IDBDatabase.prototype.transaction;
    const spy = vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementation(function (this: IDBDatabase, ...args: Parameters<typeof original>) {
      const transaction = original.apply(this, args);
      queueMicrotask(() => transaction.abort());
      return transaction;
    });
    await expect(repository.save(renameHero(state, 'Kruk', 2000))).rejects.toThrow();
    spy.mockRestore();
    expect(await repository.load()).toEqual(state);
  });
});

describe('transakcje wyprawy', () => {
  it('odtwarza aktywną wyprawę i zachowuje rozliczenie po ponownym otwarciu', async () => {
    const { startExpedition, settleExpedition } = await import('../domain/game');
    const factory = new IDBFactory();
    const repository = new IndexedDbRepository(factory, 'test');
    const started = startExpedition(createInitialState(0), 1000);
    await repository.save(started, null);
    const reopened = new IndexedDbRepository(factory, 'test');
    const loaded = (await reopened.load())!;
    expect(loaded).toEqual(started);
    const settled = settleExpedition(loaded, loaded.activeExpedition!.id, 61000);
    const outcomes = await Promise.allSettled([repository.save(settled, loaded), reopened.save(settled, loaded)]);
    expect(outcomes.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(outcomes.filter((result) => result.status === 'rejected')).toHaveLength(1);
    expect(await reopened.load()).toEqual(settled);
    const after = (await repository.load())!;
    expect(settleExpedition(after, loaded.activeExpedition!.id, 999999)).toBe(after);
    await expect(repository.save(renameHero(loaded, 'Kruk'), loaded)).rejects.toThrow('innej karcie');
    expect(await repository.load()).toEqual(settled);
  });
  it('przerwany odbiór pozostawia aktywną wyprawę bez częściowej nagrody', async () => {
    const { startExpedition, settleExpedition } = await import('../domain/game');
    const repository = new IndexedDbRepository(new IDBFactory(), 'test');
    const started = startExpedition(createInitialState(0), 1000);
    await repository.save(started, null);
    const original = IDBDatabase.prototype.transaction;
    const spy = vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementation(function (this: IDBDatabase, ...args: Parameters<typeof original>) {
      const tx = original.apply(this, args);
      queueMicrotask(() => tx.abort());
      return tx;
    });
    const result = settleExpedition(started, started.activeExpedition!.id, 61000);
    await expect(repository.save(result, started)).rejects.toThrow();
    spy.mockRestore();
    expect(await repository.load()).toEqual(started);
    await repository.save(result, started);
    expect(await repository.load()).toEqual(result);
  });
  it('wczytuje v1 i zapisuje v7 dopiero przy udanej zmianie', async () => {
    const factory = new IDBFactory();
    const { lastReport: _, ...legacy } = createInitialState(0);
    await writeRaw(factory, { ...legacy, schemaVersion: 1 });
    const repository = new IndexedDbRepository(factory, 'test');
    const loaded = (await repository.load())!;
    expect(loaded.schemaVersion).toBe(7);
    await repository.save(renameHero(loaded, 'Kruk', 1000), loaded);
    expect((await repository.load())!.hero.name).toBe('Kruk');
  });
});

describe('atomowe przygotowanie', () => {
  it('równoległe wytwarzanie nie powiela wyniku i przetrwa ponowne otwarcie', async () => {
    const { addResources, craft, quantity } = await import('../domain/preparation');
    const factory = new IDBFactory();
    const repository = new IndexedDbRepository(factory, 'test');
    const initial = createInitialState(0);
    const state = arrange({ ...initial, inventory: addResources(initial.inventory, [{ itemId: 'cloth', quantity: 2 }]) });
    await repository.save(state, null);
    const result = craft(state, 'bandage', 1000);
    const outcomes = await Promise.allSettled([repository.save(result, state), repository.save(result, state)]);
    expect(outcomes.filter((entry) => entry.status === 'fulfilled')).toHaveLength(1);
    const loaded = (await new IndexedDbRepository(factory, 'test').load())!;
    expect(quantity(loaded.inventory, 'bandage')).toBe(3);
    expect(quantity(loaded.inventory, 'cloth')).toBe(0);
  });
  it('przerwany start nie zmienia ekwipunku; ponowienie zapisuje wyprawę tylko raz', async () => {
    const { startExpedition } = await import('../domain/game');
    const { quantity } = await import('../domain/preparation');
    const repository = new IndexedDbRepository(new IDBFactory(), 'test');
    const initial = createInitialState(0);
    await repository.save(initial, null);
    const original = IDBDatabase.prototype.transaction;
    const spy = vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementation(function (this: IDBDatabase, ...args: Parameters<typeof original>) {
      const tx = original.apply(this, args); queueMicrotask(() => tx.abort()); return tx;
    });
    const started = startExpedition(initial, 1000);
    await expect(repository.save(started, initial)).rejects.toThrow();
    spy.mockRestore();
    expect(await repository.load()).toEqual(initial);
    await repository.save(started, initial);
    await expect(repository.save(started, initial)).rejects.toThrow();
    expect(quantity((await repository.load())!.inventory, 'water')).toBe(3);
  });
});

describe('atomowy transfer między siatkami', () => {
  it('nie przenosi rzeczy przy przerwanej transakcji, a dwie karty nie duplikują transferu', async () => {
    const { moveItem } = await import('../domain/inventory');
    const factory = new IDBFactory();
    const repository = new IndexedDbRepository(factory, 'test');
    const initial = createInitialState(0);
    await repository.save(initial, null);
    const moved = moveItem(initial, initial.inventory[0].id, 0, undefined, 1000);
    const original = IDBDatabase.prototype.transaction;
    const spy = vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementation(function (this: IDBDatabase, ...args: Parameters<typeof original>) {
      const tx = original.apply(this, args); queueMicrotask(() => tx.abort()); return tx;
    });
    await expect(repository.save(moved, initial)).rejects.toThrow(); spy.mockRestore();
    expect(await repository.load()).toEqual(initial);
    const outcomes = await Promise.allSettled([repository.save(moved, initial), repository.save(moved, initial)]);
    expect(outcomes.filter((entry) => entry.status === 'fulfilled')).toHaveLength(1);
    expect(await new IndexedDbRepository(factory, 'test').load()).toEqual(moved);
  });
});

it('migruje starą drugą stronę schowka i zachowuje kontrolę poprzedniego stanu przy zapisie', async () => {
  const { moveItem } = await import('../domain/inventory');
  const factory = new IDBFactory();
  const state = moveItem(createInitialState(0), 'starter-water', 0, undefined, 1000);
  await writeRaw(factory, { ...state, schemaVersion: 4, positions: { ...state.positions, 'starter-water': { x: 9, y: 5, page: 1 } } });
  const repository = new IndexedDbRepository(factory, 'test');
  const loaded = (await repository.load())!;
  expect(loaded.schemaVersion).toBe(7);
  expect(loaded.positions['starter-water'].page).toBe(0);
  const moved = moveItem(loaded, 'starter-water', -1, undefined, 2000);
  await repository.save(moved, loaded);
  expect(await repository.load()).toEqual(moved);
});

it('dwie karty nie zużywają tej samej sztuki i nie duplikują skutku', async () => {
  const { useItem } = await import('../domain/useItem');
  const repository = new IndexedDbRepository(new IDBFactory(), 'test');
  const initial = createInitialState(0);await repository.save(initial, null);
  const next = useItem(initial, 'starter-water', 1000);
  const outcomes = await Promise.allSettled([repository.save(next, initial), repository.save(next, initial)]);
  expect(outcomes.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  expect((await repository.load())!.inventory.find((item) => item.id === 'starter-water')!.quantity).toBe(2);
});

it('przerwany zapis ostatniej użytej sztuki zachowuje przedmiot i jego pola', async () => {
  const { useItem } = await import('../domain/useItem');
  const repository = new IndexedDbRepository(new IDBFactory(), 'test');
  const state = createInitialState(0); state.inventory.find((entry) => entry.id === 'starter-water')!.quantity = 1;
  await repository.save(state, null);
  const next = useItem(state, 'starter-water', 1000);
  const original = IDBDatabase.prototype.transaction;
  const spy = vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementation(function (this: IDBDatabase, ...args: Parameters<typeof original>) {
    const tx = original.apply(this, args);queueMicrotask(() => tx.abort());return tx;
  });
  await expect(repository.save(next, state)).rejects.toThrow();spy.mockRestore();
  expect(await repository.load()).toEqual(state);
});

it('naprawa stołu jest atomowa i nie pobiera materiałów po przerwaniu lub ponowieniu w drugiej karcie', async () => {
  const { addResources, quantity, repairWorkbench } = await import('../domain/preparation');
  const factory = new IDBFactory();
  const repository = new IndexedDbRepository(factory, 'test');
  const initial = createInitialState(0);
  const state = arrange({ ...initial, progress: { workshopVisited: true, workbenchRepaired: false }, inventory: addResources(initial.inventory, [{ itemId: 'scrap', quantity: 2 }, { itemId: 'cloth', quantity: 2 }]) });
  await repository.save(state, null);
  const repaired = repairWorkbench(state, 1000);
  const original = IDBDatabase.prototype.transaction;
  const spy = vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementation(function (this: IDBDatabase, ...args: Parameters<typeof original>) {
    const tx = original.apply(this, args); queueMicrotask(() => tx.abort()); return tx;
  });
  await expect(repository.save(repaired, state)).rejects.toThrow(); spy.mockRestore();
  expect(await repository.load()).toEqual(state);
  const results = await Promise.allSettled([repository.save(repaired, state), repository.save(repaired, state)]);
  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  const loaded = (await new IndexedDbRepository(factory, 'test').load())!;
  expect(loaded.progress.workbenchRepaired).toBe(true);
  expect(quantity(loaded.inventory, 'scrap')).toBe(0);
  expect(quantity(loaded.inventory, 'cloth')).toBe(0);
  expect(repairWorkbench(loaded)).toBe(loaded);
});

it('migruje v6 z plecakiem poza siatkę i zapisuje nowy stan z kontrolą współbieżności', async () => {
  const initial = createInitialState(0);
  const old = arrange({ ...initial, inventory: [initial.backpack, ...initial.inventory], positions: {} });
  const factory = new IDBFactory();
  await writeRaw(factory, { ...old, schemaVersion: 6 });
  const repository = new IndexedDbRepository(factory, 'test');
  const loaded = (await repository.load())!;
  expect(loaded.backpack).toEqual(initial.backpack);
  expect(loaded.inventory.some((entry) => entry.itemId === 'backpack')).toBe(false);
  await repository.save(renameHero(loaded, 'Kruk', 1000), loaded);
  const reopened = (await new IndexedDbRepository(factory, 'test').load())!;
  expect(reopened.hero.name).toBe('Kruk');
  expect(reopened.backpack).toEqual(initial.backpack);
  expect(reopened.inventory).toEqual(initial.inventory);
});

it('rozdzielenie stosu przetrwa ponowne otwarcie, a dwie karty nie powielą sztuk', async () => {
  const { splitStack } = await import('../domain/inventory');
  const { quantity } = await import('../domain/preparation');
  const factory = new IDBFactory();
  const repository = new IndexedDbRepository(factory, 'test');
  const initial = createInitialState(0); await repository.save(initial, null);
  const next = splitStack(initial, 'starter-water', 1, 1000);
  const results = await Promise.allSettled([repository.save(next, initial), repository.save(next, initial)]);
  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  const loaded = (await new IndexedDbRepository(factory, 'test').load())!;
  expect(loaded).toEqual(next);
  expect(quantity(loaded.inventory, 'water')).toBe(3);
  expect(loaded.inventory.filter((entry) => entry.itemId === 'water')).toHaveLength(2);
});

it('przerwany podział nie zmniejsza źródła i nie dodaje nowego stosu ani pozycji', async () => {
  const { splitStack } = await import('../domain/inventory');
  const repository = new IndexedDbRepository(new IDBFactory(), 'test');
  const initial = createInitialState(0); await repository.save(initial, null);
  const next = splitStack(initial, 'starter-water', 1, 1000);
  const original = IDBDatabase.prototype.transaction;
  const spy = vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementation(function (this: IDBDatabase, ...args: Parameters<typeof original>) {
    const tx = original.apply(this, args); queueMicrotask(() => tx.abort()); return tx;
  });
  await expect(repository.save(next, initial)).rejects.toThrow(); spy.mockRestore();
  expect(await repository.load()).toEqual(initial);
});
