import { locations } from '../domain/catalog';
import { expeditionRules, selectLocation } from '../domain/game';
import { kits } from '../domain/preparation';
import type { GameState } from '../domain/types';
import './map.css';

type Props = {
  state: GameState;
  update: (change: (state: GameState) => GameState) => Promise<boolean>;
  saving: boolean;
  navigate: (screen: 'shelter' | 'expeditions') => void;
};
const pins: Record<string, { x: number; y: number; label: string }> = {
  outskirts: { x: 43, y: 28, label: 'Osiedle' },
  workshop: { x: 79, y: 42, label: 'Warsztat' },
};

export function MapScreen({ state, update, saving, navigate }: Props) {
  const selected = locations.find((location) => location.id === state.selectedLocationId)!;
  const rule = expeditionRules[selected.id];
  const kit = kits[state.preparation.kit];
  const activeLocation = locations.find((location) => location.id === state.activeExpedition?.plan.locationId);
  function choose(id: string) {
    if (id !== state.selectedLocationId) void update((previous) => selectLocation(previous, id));
  }

  return <div className="neighborhood">
    <div className="map-introduction"><div><span className="eyebrow">Ślady na papierze. Drogi wśród ruin.</span><h2>Znana okolica</h2></div><p>Wybierz oznaczone miejsce<br />i przygotuj następną wyprawę.</p></div>
    <div className="neighborhood-layout">
      <section className="field-map-panel" aria-labelledby="field-map-title">
        <div className="field-map-heading"><h3 id="field-map-title">Plan okolicy</h3><span>Dwa znane cele</span></div>
        <div className="field-map">
          <img src="/art/neighborhood-map.webp" alt="Zniszczony papierowy plan dzielnicy: kryjówka na dole po lewej, osiedle w górnej części, warsztat po prawej. Miejsca wybierzesz przyciskami na planie lub z listy poniżej." width="1448" height="1086" fetchPriority="high" />
          <span className="map-compass" aria-hidden="true">N<br /><b>↑</b></span>
          <button className="field-marker shelter-marker" style={{ left: '17%', top: '73%' }} onClick={() => navigate('shelter')} aria-label="Wróć do kryjówki"><span className="pin-symbol" aria-hidden="true">⌂</span><span className="pin-caption">Kryjówka</span></button>
          {locations.map((location, index) => <button key={location.id} className={`field-marker ${location.discovery === 'known' ? 'known-marker' : ''} ${selected.id === location.id ? 'chosen-marker' : ''}`} style={{ left: `${pins[location.id].x}%`, top: `${pins[location.id].y}%` }} disabled={saving} aria-label={`Wybierz cel: ${location.name}`} aria-pressed={selected.id === location.id} aria-controls="location-details" onClick={() => choose(location.id)}>
            <span className="pin-symbol" aria-hidden="true">0{index + 1}</span><span className="pin-caption">{pins[location.id].label}</span>
          </button>)}
          <span className="field-map-stamp" aria-hidden="true">Plan poglądowy</span>
        </div>
        <div className="map-legend" aria-label="Legenda mapy"><span><i className="legend-base" />Kryjówka</span><span><i className="legend-visited" />Odwiedzone</span><span><i className="legend-known" />Znane z informacji</span></div>
        <p className="map-instruction">Wybór zapisuje cel następnej wyprawy. Plan nie pokazuje rzeczywistego ruchu bohatera ani rozpoznania zagrożeń.</p>
        <div className="map-location-list" role="group" aria-label="Lista celów wyprawy">{locations.map((location, index) => <button key={location.id} disabled={saving} aria-pressed={selected.id === location.id} aria-controls="location-details" onClick={() => choose(location.id)}>
          <img src={`/art/${location.id}.webp`} alt="" width="100" height="70" loading="lazy" /><span><small>0{index + 1} / {location.discovery === 'visited' ? 'Odwiedzone' : 'Znane z informacji'}</small><strong>{location.name}</strong><small className="location-choice">{selected.id === location.id ? 'Wybrany cel' : 'Wybierz cel'}</small></span><span className="location-choice-mark" aria-hidden="true">{selected.id === location.id ? '●' : '→'}</span>
        </button>)}</div>
      </section>

      <section className="location-details" id="location-details" aria-labelledby="location-heading">
        <div className="location-image"><img src={`/art/${selected.id}.webp`} alt={selected.id === 'outskirts' ? 'Opuszczone bloki wokół zarośniętego podwórka, zardzewiałe auto i pusty plac zabaw.' : 'Stary warsztat z cegły i blachy, skorodowana brama, stare opony i zarośnięty dziedziniec.'} width="1672" height="941" /><span>{selected.discovery === 'visited' ? 'Odwiedzone' : 'Znane z informacji'}</span></div>
        <div className="location-description"><span className="eyebrow">Cel następnej wyprawy</span><h2 id="location-heading">{selected.name}</h2><p>{selected.description}</p>
          <dl><div><dt>Czas wyprawy</dt><dd>{rule.durationMs / 60000} min</dd></div></dl>
          <p className="location-loot-note">Nie wiesz, co znajdziesz na miejscu. Zdobycze poznasz dopiero z raportu po powrocie.</p>
          <div className="map-kit-note"><span className="eyebrow">Wybrany zestaw: {kit.name}</span><p>Woda ×{kit.water} · Racje ×{kit.ration}</p><small>Zapasy pobierane dopiero przy rozpoczęciu wyprawy.</small></div>
          {state.activeExpedition && <p className="map-active-note">Trwa już wyprawa do: <strong>{activeLocation?.name}</strong>. Zmiana celu na mapie nie zmieni jej planu.</p>}
          <button className="map-prepare" disabled={saving} onClick={() => navigate('expeditions')}>{state.activeExpedition ? 'Zobacz aktywną wyprawę' : 'Przygotuj wyprawę'} <span aria-hidden="true">→</span></button>
          <p className="map-save-note" role="status">{saving ? 'Zapisywanie celu…' : `Wybrany cel: ${selected.name}`}</p>
        </div>
      </section>
    </div>
  </div>;
}
