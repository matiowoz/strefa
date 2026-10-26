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
