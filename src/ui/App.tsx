import { useEffect, useState } from 'react';
import { ShelterScreen } from './ShelterScreen';
import { InventoryScreen } from './InventoryScreen';
import { useGame } from '../app/useGame';
import { getItem, locations, skillNames } from '../domain/catalog';
import { expeditionRules, renameHero, selectLocation, startExpedition, settleExpedition } from '../domain/game';
import { kits, preparationError, prepareExpedition, quantity } from '../domain/preparation';
import type { GameRepository, GameState, ResourceAmount } from '../domain/types';

const screens = [
  { id: 'shelter', label: 'Kryjówka', mark: '01' },
  { id: 'map', label: 'Mapa', mark: '02' },
  { id: 'expeditions', label: 'Wyprawy', mark: '03' },
  { id: 'inventory', label: 'Ekwipunek', mark: '04' },
  { id: 'hero', label: 'Bohater', mark: '05' },
] as const;
type Screen = typeof screens[number]['id'];
type Update = (change: (previous: GameState) => GameState) => Promise<boolean>;

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

function ResourceList({ resources }: { resources: readonly ResourceAmount[] }) {
  return <>{resources.map((entry) => `${getItem(entry.itemId)?.name} ×${entry.quantity}`).join(', ')}</>;
}

function PreparationPanel({ state, update, saving }: { state: GameState; update: Update; saving: boolean }) {
  const problem = preparationError(state);
  return <fieldset disabled={saving || !!state.activeExpedition} className="preparation">
    <legend>Przygotowanie</legend>
    <label htmlFor="supply-kit">Zestaw zapasów</label>
    <select id="supply-kit" value={state.preparation.kit} onChange={(event) => {
      const kit = event.target.value as keyof typeof kits;
      void update((previous) => prepareExpedition(previous, { ...previous.preparation, kit }));
    }}>{Object.entries(kits).map(([id, kit]) => <option key={id} value={id}>{kit.name}: woda ×{kit.water}, racja ×{kit.ration}</option>)}</select>
    <label htmlFor="equipment">Wyposażenie</label>
    <select id="equipment" value={state.preparation.equipmentId ?? ''} onChange={(event) => {
      const equipmentId = event.target.value || null;
      void update((previous) => prepareExpedition(previous, { ...previous.preparation, equipmentId }));
    }}><option value="">Bez sprzętu</option>{state.inventory.filter((entry) => getItem(entry.itemId)?.category === 'equipment').map((entry) => <option key={entry.id} value={entry.id} disabled={entry.condition === 0}>{getItem(entry.itemId)?.name} ({entry.condition}%)</option>)}</select>
    <p>W magazynie: woda ×{quantity(state.inventory, 'water')}, racja ×{quantity(state.inventory, 'ration')}.</p>
    <p className="muted">Zapasy na całą drogę, również powrotną, zużywane raz przy starcie. Wariant z zapasem zużywa więcej, bez dodatkowej nagrody. Sprzęt pozostaje Twoją własnością i wraca bez uszkodzeń; plecak nie daje jeszcze premii.</p>
    {problem && <p role="status">{problem}</p>}
  </fieldset>;
}

function ExpeditionsScreen({ state, update, saving }: { state: GameState; update: Update; saving: boolean }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const active = state.activeExpedition;
  const locationId = active?.plan.locationId ?? state.selectedLocationId;
  const location = locations.find((entry) => entry.id === locationId);
  const rule = expeditionRules[locationId as keyof typeof expeditionRules];
  const remaining = active ? Math.max(0, Math.ceil((active.expectedReturnAt - now) / 1000)) : 0;
  const report = state.lastReport;
  return <>
    <article className="card"><span className="eyebrow">{active ? 'Aktywna wyprawa' : 'Plan wyprawy'}</span>
      <h2>{location?.name}</h2>
      {active ? <>
        <p>{remaining > 0 ? `Powrót za ${Math.floor(remaining / 60)} min ${remaining % 60} s` : 'Bohater wrócił. Raport gotowy do odbioru.'}</p>
        <p>Zapasy pobrane przy starcie: woda ×{active.cargo.water}, racja ×{active.cargo.ration}. Sprzęt: {active.cargo.equipmentId ? 'zarezerwowany, wróci bez zmian' : 'bez sprzętu'}.</p>
        <p>Planowany powrót: <time dateTime={new Date(active.expectedReturnAt).toISOString()}>{new Date(active.expectedReturnAt).toLocaleTimeString('pl-PL')}</time></p>
        <button disabled={saving || remaining > 0} onClick={() => { void update((previous) => settleExpedition(previous, active.id)); }}>Odbierz raport i nagrodę</button>
      </> : <>
        <p>Cel wybierzesz na Mapie. Strategia: zrównoważona.</p>
        <dl><div><dt>Czas</dt><dd>{rule.durationMs / 60_000} min</dd></div><div><dt>Nagroda</dt><dd>Złom ×{rule.scrap}</dd></div></dl>
        <PreparationPanel state={state} update={update} saving={saving} />
        <p>Łupy oprócz złomu: woda do uzdatnienia ×2, składniki żywnościowe ×2, czysta tkanina ×1.</p>
        <button disabled={saving || !!preparationError(state)} onClick={() => { void update((previous) => startExpedition(previous)); }}>Rozpocznij wyprawę</button>
      </>}
      <p className="muted">Wyprawa upływa także po zamknięciu gry. Jedna wyprawa naraz; odbierz raport przed kolejną. Prototyp: stałe łupy, bez walki i pasków głodu lub pragnienia. Czas i nagrody są demonstracyjne; strategie nie mają jeszcze odrębnego działania.</p>
    </article>
    {report && <article className="card" aria-label="Ostatni raport"><span className="eyebrow">Ostatni raport / rozliczony</span>
      <h2>Bezpieczny powrót</h2><p>{locations.find((entry) => entry.id === report.locationId)?.name}</p>
      <p>Dodano do ekwipunku: <ResourceList resources={report.cargo.loot} />. Zdrowie i wyposażenie bez zmian.</p>
      <p>Zużyto przy starcie: woda ×{report.cargo.water}, racja ×{report.cargo.ration}. Wyposażenie jest znowu dostępne.</p>
      <p>Powrót: {new Date(report.returnedAt).toLocaleString('pl-PL')}</p>
    </article>}
  </>;
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
          {screen === 'shelter' && <ShelterScreen state={state} navigate={setScreen} />}
          {screen === 'map' && <MapScreen state={state} update={update} saving={saving} />}
          {screen === 'expeditions' && <ExpeditionsScreen state={state} update={update} saving={saving} />}
          {screen === 'inventory' && <InventoryScreen state={state} update={update} saving={saving} />}
          {screen === 'hero' && <HeroScreen state={state} update={update} saving={saving} />}
        </>}
        <footer className="page-footer">Wersja robocza. Postęp jest zapisywany tylko w tej przeglądarce.</footer>
      </main></div>
  </div>;
}
