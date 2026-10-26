import { useEffect, useState } from 'react';
import { useGame } from '../app/useGame';
import { getItem, locations, skillNames } from '../domain/catalog';
import { inventoryWeight, renameHero, selectLocation } from '../domain/game';
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

function Shelter({ state, navigate }: { state: GameState; navigate: (screen: Screen) => void }) {
  const [panel, setPanel] = useState(true);
  return <>
    <div className="shelter-scene">
      <div className="scene-grain" aria-hidden="true" />
      <div className="scene-copy"><span className="eyebrow">Schronienie / 01</span>
        <h2>Za tymi drzwiami<br />jest bezpiecznie.</h2>
        <p>Twoje miejsce w świecie po upadku.</p>
        <span className="scene-note">Roboczy widok kryjówki</span>
      </div>
      <div className="scene-window" aria-hidden="true"><i /><i /></div>
      <div className="scene-table" aria-hidden="true" />
    </div>
    <div className="section-heading"><h2>Panel informacji</h2>
      <button className="text-button" aria-expanded={panel} aria-controls="shelter-panel" onClick={() => setPanel(!panel)}>{panel ? 'Zwiń panel' : 'Rozwiń panel'}</button>
    </div>
    {panel && <div className="card-grid" id="shelter-panel">
      <article className="card"><span className="eyebrow">Ocalały</span><h3>{state.hero.name}</h3><p>Zdrowie {state.hero.health} / {state.hero.maxHealth}</p><button onClick={() => navigate('hero')}>Zobacz bohatera</button></article>
      <article className="card"><span className="eyebrow">Ekspedycja</span><h3>{state.activeExpedition ? 'W toku' : 'W kryjówce'}</h3><p>Planowanie wypraw to następny etap prototypu.</p><button onClick={() => navigate('expeditions')}>Zobacz wyprawy</button></article>
      <article className="card"><span className="eyebrow">Warsztat</span><h3>Brak aktywnej produkcji</h3><p>Stanowiska i receptury pojawią się w kolejnych etapach.</p></article>
      <article className="card"><span className="eyebrow">Radio i zadania</span><h3>Cisza w eterze</h3><p>Na razie poznaj kryjówkę, mapę i zapasy. Fabuła nie została uruchomiona.</p></article>
    </div>}
  </>;
}

function MapScreen({ state, update, saving }: { state: GameState; update: Update; saving: boolean }) {
  return <><p className="intro">Znana okolica. Wybierz punkt, do którego wrócisz podczas planowania wyprawy.</p>
    <div className="map-preview" role="img" aria-label="Schemat okolicy: kryjówka, opuszczone osiedle i stary warsztat. Pełna lista punktów znajduje się poniżej.">
      <span className="map-grid" aria-hidden="true" />
      <span className="map-base">Kryjówka</span><span className="map-point one">Osiedle</span><span className="map-point two">Warsztat</span>
      <span className="map-caption">Mapa poglądowa / bez symulacji podróży</span>
    </div>
    <div className="card-grid">{locations.map((location) => <article className={`card ${state.selectedLocationId === location.id ? 'selected' : ''}`} key={location.id}>
      <span className="eyebrow">{location.discovery === 'visited' ? 'Odwiedzone' : 'Znane z informacji'}</span><h2>{location.name}</h2><p>{location.description}</p>
      <button disabled={saving} aria-pressed={state.selectedLocationId === location.id} onClick={() => { void update((previous) => selectLocation(previous, location.id)); }}>
        {state.selectedLocationId === location.id ? 'Wybrana lokacja' : 'Wybierz lokację'}
      </button>
    </article>)}</div></>;
}

function ExpeditionsScreen({ state }: { state: GameState }) {
  const location = locations.find((entry) => entry.id === state.selectedLocationId);
  return <article className="card empty-state"><span className="eyebrow">Plan wyprawy</span><h2>Najpierw przygotowanie.</h2>
    <p>Wybrany cel: <strong>{location?.name}</strong></p>
    <p>W tym etapie możesz wybrać lokację na mapie. Uruchamianie wypraw, upływ czasu i raporty nie są jeszcze dostępne.</p>
    <dl><div><dt>Bohater</dt><dd>{state.hero.name}</dd></div><div><dt>Aktywna wyprawa</dt><dd>{state.activeExpedition ? 'W toku' : 'Brak'}</dd></div></dl>
    <p className="muted">Jedna postać. Jedna wyprawa naraz. Bez obowiązku stałego nadzoru.</p>
  </article>;
}

function InventoryScreen({ state }: { state: GameState }) {
  return <><div className="section-heading"><p className="intro">Zapasy w kryjówce</p><span className="badge">Masa: {inventoryWeight(state).toLocaleString('pl-PL', { maximumFractionDigits: 1 })} kg</span></div>
    <ul className="inventory-list">{state.inventory.map((entry) => {
      const item = getItem(entry.itemId);
      return <li className="inventory-item" key={entry.id}><span className="item-mark" aria-hidden="true">{item?.category === 'equipment' ? 'E' : item?.category === 'material' ? 'M' : 'Z'}</span>
        <div><h2>{item?.name}</h2><p>{item?.description}</p>{entry.condition !== null && <small>Stan: {entry.condition}%</small>}</div><span className="quantity">×{entry.quantity}</span>
      </li>;
    })}</ul><p className="muted">Minimalny zestaw demonstracyjny. Przedmioty nie są zużywane ani sprzedawane w tym etapie.</p></>;
}

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
          {screen === 'shelter' && <Shelter state={state} navigate={setScreen} />}
          {screen === 'map' && <MapScreen state={state} update={update} saving={saving} />}
          {screen === 'expeditions' && <ExpeditionsScreen state={state} />}
          {screen === 'inventory' && <InventoryScreen state={state} />}
          {screen === 'hero' && <HeroScreen state={state} update={update} saving={saving} />}
        </>}
        <footer className="page-footer">Wersja robocza. Postęp jest zapisywany tylko w tej przeglądarce.</footer>
      </main></div>
  </div>;
}
