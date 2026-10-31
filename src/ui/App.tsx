import { useEffect, useState } from 'react';
import { ExpeditionsScreen } from './ExpeditionsScreen';
import { MapScreen } from './MapScreen';
import { ShelterScreen } from './ShelterScreen';
import { InventoryScreen } from './InventoryScreen';
import { useGame } from '../app/useGame';
import { skillNames } from '../domain/catalog';
import { renameHero } from '../domain/game';
import type { GameRepository, GameState } from '../domain/types';

const screens = [
  { id: 'shelter', label: 'Kryjówka', mark: '01' },
  { id: 'map', label: 'Mapa', mark: '02' },
  { id: 'expeditions', label: 'Wyprawy', mark: '03' },
  { id: 'inventory', label: 'Ekwipunek', mark: '04' },
  { id: 'hero', label: 'Bohater', mark: '05' },
] as const;
type Screen = typeof screens[number]['id'];
type Update = (change: (previous: GameState) => GameState) => Promise<boolean>;

function HeroScreen({ state, update, saving }: { state: GameState; update: Update; saving: boolean }) {
  const [name, setName] = useState(state.hero.name);
  const [notice, setNotice] = useState('');
  return <div className="hero-layout"><article className="card"><span className="eyebrow">Jeden ocalały</span><h2>{state.hero.name}</h2>
    <dl><div><dt>Poziom</dt><dd>{state.hero.level}</dd></div><div><dt>Zdrowie</dt><dd>{state.hero.health} / {state.hero.maxHealth}</dd></div></dl>
    <form onSubmit={(event) => { event.preventDefault(); setNotice(''); void update((previous) => renameHero(previous, name)).then((ok) => { if (ok) setNotice('Pseudonim zapisany.'); }); }}>
      <label htmlFor="hero-name">Pseudonim</label><input id="hero-name" value={name} minLength={2} maxLength={24} required autoComplete="off" onChange={(event) => { setName(event.target.value); setNotice(''); }} />
      <p className="field-help">Od 2 do 24 znaków. Zmiana nie wpływa na umiejętności.</p>
      <button disabled={saving} type="submit">{saving ? 'Zapisywanie…' : 'Zapisz pseudonim'}</button>
      <p className="form-notice" role="status">{notice}</p>
    </form></article><article className="card"><h2>Umiejętności</h2><p className="muted">Rozwój przez praktykę zostanie dodany później.</p>
      <dl className="skill-list">{(Object.keys(skillNames) as Array<keyof typeof skillNames>).map((skill) => <div key={skill}><dt>{skillNames[skill]}</dt><dd>{state.hero.skills[skill]}</dd></div>)}</dl>
    </article></div>;
}

export function App({ repository }: { repository: GameRepository }) {
  const { state, saving, error, update, retry } = useGame(repository);
  const [screen, setScreen] = useState<Screen>('shelter');
  const currentScreen = screens.find((entry) => entry.id === screen)!;
  useEffect(() => { document.title = `STREFA — ${currentScreen.label}`; }, [currentScreen.label]);

  return <div className="app-shell"><a className="skip-link" href="#main">Przejdź do treści</a>
    <header className="app-header"><a href="#main" className="wordmark" onClick={() => setScreen('shelter')}>STREFA<span>Idle survival RPG</span></a><span className="prototype">Prototyp / 0.1</span></header>
    <div className="app-body"><nav className="navigation" aria-label="Ekrany gry">{screens.map((entry) => <button key={entry.id} aria-current={entry.id === screen ? 'page' : undefined} onClick={() => setScreen(entry.id)}><span aria-hidden="true">{entry.mark}</span>{entry.label}</button>)}</nav>
      <main id="main" tabIndex={-1}><div className="page-heading"><div><span className="eyebrow">Twoja droga po upadku</span><h1>{currentScreen.label}</h1></div><span className="save-state" role="status">{saving ? 'Zapisywanie…' : state && !error ? 'Zapis lokalny gotowy' : 'Zapis niedostępny'}</span></div>
        {error && <div className="error" role="alert"><strong>Nie udało się zapisać lub odczytać danych.</strong><p>{error}</p>{!state ? <button onClick={retry}>Ponów odczyt</button> : <p>Zmiana nie została zastosowana. Możesz spróbować ponownie.</p>}</div>}
        {!state && !error && <p role="status">Otwieranie kryjówki…</p>}
        {state && <>
          {screen === 'shelter' && <ShelterScreen state={state} navigate={setScreen} />}
          {screen === 'map' && <MapScreen state={state} update={update} saving={saving} navigate={setScreen} />}
          {screen === 'expeditions' && <ExpeditionsScreen state={state} update={update} saving={saving} navigate={setScreen} />}
          {screen === 'inventory' && <InventoryScreen state={state} update={update} saving={saving} />}
          {screen === 'hero' && <HeroScreen state={state} update={update} saving={saving} />}
        </>}
        <footer className="page-footer">Wersja robocza. Postęp jest zapisywany tylko w tej przeglądarce.</footer>
      </main></div>
  </div>;
}
