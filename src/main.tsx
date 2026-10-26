import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import { IndexedDbRepository } from './persistence/indexedDbRepository';
import type { GameRepository } from './domain/types';
import './ui/styles.css';

const unavailable = async (): Promise<never> => { throw new Error('Ta przeglądarka nie udostępnia zapisu IndexedDB. Sprawdź jej ustawienia prywatności.'); };
let repository: GameRepository;
try {
  repository = globalThis.indexedDB
    ? new IndexedDbRepository(globalThis.indexedDB)
    : { load: unavailable, save: unavailable };
} catch {
  repository = { load: unavailable, save: unavailable };
}
createRoot(document.getElementById('root')!).render(<App repository={repository} />);
