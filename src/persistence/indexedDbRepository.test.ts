import { IDBFactory, IDBDatabase } from 'fake-indexeddb';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
  it('wczytuje v1 i zapisuje v2 dopiero przy udanej zmianie', async () => {
    const factory = new IDBFactory();
    const { lastReport: _, ...legacy } = createInitialState(0);
    await writeRaw(factory, { ...legacy, schemaVersion: 1 });
    const repository = new IndexedDbRepository(factory, 'test');
    const loaded = (await repository.load())!;
    expect(loaded.schemaVersion).toBe(2);
    await repository.save(renameHero(loaded, 'Kruk', 1000), loaded);
    expect((await repository.load())!.hero.name).toBe('Kruk');
  });
});
