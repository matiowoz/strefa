import type { GameRepository, GameState } from '../domain/types';
import { validateSave } from '../domain/validation';

const STORE = 'saves';
const KEY = 'main';

export class IndexedDbRepository implements GameRepository {
  constructor(private readonly factory: IDBFactory, private readonly name = 'strefa-prototype') {}

  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = this.factory.open(this.name, 1);
      let blocked = false;
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
      };
      request.onerror = () => reject(request.error ?? new Error('Nie można otworzyć zapisu.'));
      request.onblocked = () => {
        blocked = true;
        reject(new Error('Zamknij inne karty STREFY i spróbuj ponownie.'));
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => db.close();
        if (blocked) db.close(); else resolve(db);
      };
    });
  }

  async load(): Promise<GameState | null> {
    const db = await this.open();
    try {
      const raw = await new Promise<unknown>((resolve, reject) => {
        const transaction = db.transaction(STORE, 'readonly');
        const request = transaction.objectStore(STORE).get(KEY);
        transaction.oncomplete = () => resolve(request.result);
        transaction.onabort = () => reject(transaction.error ?? new Error('Odczyt został przerwany.'));
        transaction.onerror = () => reject(transaction.error ?? new Error('Nie można odczytać zapisu.'));
      });
      return raw === undefined ? null : validateSave(raw);
    } finally { db.close(); }
  }

  async save(state: GameState): Promise<void> {
    const snapshot = validateSave(structuredClone(state));
    const db = await this.open();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE, 'readwrite');
        transaction.oncomplete = () => resolve();
        transaction.onabort = () => reject(transaction.error ?? new Error('Zapis został przerwany.'));
        transaction.onerror = () => reject(transaction.error ?? new Error('Nie udało się zapisać danych.'));
        transaction.objectStore(STORE).put(snapshot, KEY);
      });
    } finally { db.close(); }
  }
}
