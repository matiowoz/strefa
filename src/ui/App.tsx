import { useEffect, useState } from 'react';
import { HeroScreen } from './HeroScreen';
import { ExpeditionsScreen } from './ExpeditionsScreen';
import { MapScreen } from './MapScreen';
import { ShelterScreen } from './ShelterScreen';
import { InventoryScreen } from './InventoryScreen';
import { useGame } from '../app/useGame';
import type { GameRepository } from '../domain/types';

const screens = [
  { id: 'hero', label: 'Postać', mark: '01' },
  { id: 'inventory', label: 'Ekwipunek', mark: '02' },
  { id: 'shelter', label: 'Kryjówka', mark: '03' },
  { id: 'expeditions', label: 'Wyprawy', mark: '04' },
  { id: 'map', label: 'Mapa', mark: '05' },
] as const;
type Screen = typeof screens[number]['id'] | 'storage';
export function App({ repository }: { repository: GameRepository }) {
  const { state, saving, error, update, retry } = useGame(repository);
  const [screen, setScreen] = useState<Screen>('shelter');
  const currentScreen = screen === 'storage' ? { id: 'storage', label: 'Skrytka' } : screens.find((entry) => entry.id === screen)!;
  useEffect(() => { document.title = `STREFA — ${currentScreen.label}`; }, [currentScreen.label]);

  return <div className="app-shell"><a className="skip-link" href="#main">Przejdź do treści</a>
    <header className="app-header"><a href="#main" className="wordmark" onClick={() => setScreen('shelter')}>STREFA<span>Idle survival RPG</span></a><span className="prototype">Prototyp / 0.1</span></header>
    <div className="app-body"><nav className="navigation" aria-label="Ekrany gry">{screens.map((entry) => <button key={entry.id} aria-current={entry.id === screen || (screen === 'storage' && entry.id === 'shelter') ? 'page' : undefined} onClick={() => setScreen(entry.id)}><span aria-hidden="true">{entry.mark}</span>{entry.label}</button>)}</nav>
      <main id="main" tabIndex={-1}><div className="page-heading"><div><span className="eyebrow">Twoja droga po upadku</span><h1>{currentScreen.label}</h1></div><span className="save-state" role="status">{saving ? 'Zapisywanie…' : state && !error ? 'Zapis lokalny gotowy' : 'Zapis niedostępny'}</span></div>
        {error && <div className="error" role="alert"><strong>Nie udało się zapisać lub odczytać danych.</strong><p>{error}</p>{!state ? <button onClick={retry}>Ponów odczyt</button> : <p>Zmiana nie została zastosowana. Możesz spróbować ponownie.</p>}</div>}
        {!state && !error && <p role="status">Otwieranie kryjówki…</p>}
        {state && <>
          {screen === 'shelter' && <ShelterScreen saving={saving} update={update} state={state} navigate={setScreen} />}
          {screen === 'map' && <MapScreen state={state} update={update} saving={saving} navigate={setScreen} />}
          {screen === 'expeditions' && <ExpeditionsScreen state={state} update={update} saving={saving} navigate={setScreen} />}
          {(screen === 'inventory' || screen === 'storage') && <InventoryScreen key={screen} state={state} update={update} saving={saving} storage={screen === 'storage'} />}
          {screen === 'hero' && <HeroScreen state={state} navigate={setScreen} />}
        </>}
        <footer className="page-footer">Wersja robocza. Postęp jest zapisywany tylko w tej przeglądarce.</footer>
      </main></div>
  </div>;
}
