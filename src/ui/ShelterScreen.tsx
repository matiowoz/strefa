import { useEffect, useState } from 'react';
import { locations } from '../domain/catalog';
import { quantity } from '../domain/preparation';
import type { GameState } from '../domain/types';
import { ItemArt } from './ItemArt';
import './shelter.css';

type Destination = 'hero' | 'expeditions' | 'inventory' | 'map' | 'storage';
type Props = { state: GameState; navigate: (screen: Destination) => void };

export function ShelterScreen({ state, navigate }: Props) {
  const [panel, setPanel] = useState(true);
  const [now, setNow] = useState(Date.now());
  const active = state.activeExpedition;
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [active]);
  const remaining = active ? Math.max(0, Math.ceil((active.expectedReturnAt - now) / 1000)) : 0;
  const returned = !!active && remaining === 0;
  const location = locations.find((entry) => entry.id === (active?.plan.locationId ?? state.selectedLocationId));
  const water = quantity(state.stash, 'water');
  const ration = quantity(state.stash, 'ration');
  const progress = active ? Math.min(100, Math.max(0, (now - active.startedAt) / Math.max(1, active.expectedReturnAt - active.startedAt) * 100)) : 0;
  const action = active ? returned ? 'Przejdź do raportu' : 'Sprawdź wyprawę' : 'Przygotuj wyprawę';

  return <div className="shelter-home">
    <section className="shelter-illustration" aria-labelledby="shelter-title">
      <img className="shelter-background" src="/art/shelter.webp" width="1672" height="941" alt="Zużyte wnętrze schronienia: posłanie pod oknem, półki z zapasami i łatanym plecakiem, stół z radiem oraz ciepła lampa na popękanej ścianie." fetchPriority="high" />
      <span className="shelter-scene-tag"><i aria-hidden="true" />Twoje schronienie</span>
      <div className="shelter-welcome"><span className="eyebrow">Mały kawałek własnego świata</span><h2 id="shelter-title">Tutaj wracasz.</h2><p>Za drzwiami zostały ruiny.<br />Tutaj jest miejsce na następny dzień.</p></div>
      <span className="shelter-art-caption">Ilustracja poglądowa</span>
    </section>
    <div className="shelter-departure"><p><span className="eyebrow">Następny krok</span>{active ? returned ? 'Bohater wrócił. Czeka na Ciebie raport.' : `W drodze: ${location?.name}.` : 'Sprawdź zapasy, wybierz cel i ruszaj w drogę.'}</p>
      <div><button className="shelter-primary" onClick={() => navigate('expeditions')}>{action}<span aria-hidden="true"> →</span></button><button className="shelter-secondary" onClick={() => navigate('map')}>Mapa okolicy</button></div>
    </div>

    <div className="shelter-panel-heading"><div><span className="eyebrow">Zanim znów wyruszysz</span><h2>Wszystko na swoim miejscu</h2></div><button className="text-button" aria-expanded={panel} aria-controls="shelter-panel" onClick={() => setPanel(!panel)}>{panel ? 'Zwiń panel' : 'Rozwiń panel'}</button></div>
    <div id="shelter-panel" hidden={!panel}>
      <div className="shelter-dashboard">
        <article className="shelter-card shelter-survivor"><span className="shelter-card-index" aria-hidden="true">01</span><span className="eyebrow">Twój ocalały</span><h3>{state.hero.name}</h3><p className="shelter-card-subtitle">Poziom {state.hero.level} · {active && !returned ? 'Na wyprawie' : 'W kryjówce'}</p>
          <div className="shelter-health"><label htmlFor="shelter-health">Zdrowie <span>{state.hero.health} / {state.hero.maxHealth}</span></label><progress id="shelter-health" value={state.hero.health} max={state.hero.maxHealth} /></div>
          <button className="shelter-card-link" onClick={() => navigate('hero')}>Zobacz bohatera <span aria-hidden="true">→</span></button>
        </article>
        <article className={`shelter-card shelter-expedition ${returned ? 'report-ready' : ''}`}><span className="shelter-card-index" aria-hidden="true">02</span><span className="eyebrow">Wyprawa</span><h3>{active ? returned ? 'Raport czeka' : 'W drodze' : 'Nowy dzień. Nowy cel.'}</h3><p className="shelter-card-subtitle">{active ? location?.name : `Wybrany cel: ${location?.name}`}</p>
          {active ? <div className="shelter-trip-progress"><span role="timer" aria-live="off">{returned ? 'Powrót zakończony' : `Powrót za ${Math.floor(remaining / 60)} min ${remaining % 60} s`}</span><progress aria-label="Postęp wyprawy" value={progress} max={100} /><small>{returned ? 'Odbierz raport i nagrodę na ekranie Wyprawy.' : 'Wyprawa trwa także po zamknięciu gry.'}</small></div>
            : <p className="shelter-trip-note">Jedna wyprawa naraz.<br />Przygotuj zapasy na całą drogę.</p>}
          <button className="shelter-card-link" onClick={() => navigate('expeditions')}>{active ? 'Zobacz wyprawę' : 'Zaplanuj wyprawę'} <span aria-hidden="true">→</span></button>
        </article>
        <article className="shelter-card shelter-supplies"><span className="shelter-card-index" aria-hidden="true">03</span><span className="eyebrow">Magazyn kryjówki</span><h3>Zapasy na drogę</h3><p className="shelter-card-subtitle">Przenieś potrzebne zapasy do ekwipunku postaci.</p>
          <div className="shelter-supply-counts"><div><ItemArt itemId="water" /><span>Woda<strong>×{water}</strong></span></div><div><ItemArt itemId="ration" /><span>Racje<strong>×{ration}</strong></span></div></div>
          <button className="shelter-card-link" onClick={() => navigate('storage')}>Otwórz skrytkę <span aria-hidden="true">→</span></button>
        </article>
      </div>
      <div className="shelter-corners">
        <article><span className="shelter-corner-mark" aria-hidden="true">◇</span><div><span className="eyebrow">Stół roboczy</span><h3>Małe przygotowania. Dłuższa droga.</h3><p>Wodę, racje i bandaże przygotujesz w Ekwipunku. Każda receptura pokazuje koszt i wynik.</p><button className="shelter-card-link" onClick={() => navigate('inventory')}>Przygotuj zapasy <span aria-hidden="true">→</span></button></div></article>
        <article><span className="shelter-corner-mark" aria-hidden="true">⌁</span><div><span className="eyebrow">Radio</span><h3>Na razie tylko szum.</h3><p>Transmisje i zadania pojawią się w kolejnych etapach. Dziś czeka na Ciebie znana okolica.</p><span className="shelter-future-note">Nasłuch — w przygotowaniu</span></div></article>
      </div>
    </div>
  </div>;
}
