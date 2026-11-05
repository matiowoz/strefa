import { useNow } from './useNow';
import { getItem, locations } from '../domain/catalog';
import { expeditionRules, startExpedition, settleExpedition } from '../domain/game';
import { eventDefinitions } from '../domain/expeditionEvents';
import { preparationError } from '../domain/preparation';
import type { GameState } from '../domain/types';
import { ItemArt } from './ItemArt';
import './expeditions.css';

type Update = (change: (previous: GameState) => GameState) => Promise<boolean>;
type Props = { state: GameState; update: Update; saving: boolean; navigate: (screen: 'map' | 'inventory') => void };
export function ExpeditionsScreen({ state, update, saving, navigate }: Props) {
  const active = state.activeExpedition;
  const now = useNow(!!active);
  const location = locations.find((entry) => entry.id === (active?.plan.locationId ?? state.selectedLocationId))!;
  const rule = expeditionRules[location.id];
  const remaining = active ? Math.max(0, Math.ceil((active.expectedReturnAt - now) / 1000)) : 0;
  const progress = active ? Math.max(0, Math.min(100, (now - active.startedAt) / Math.max(1, active.expectedReturnAt - active.startedAt) * 100)) : 0;
  const report = state.lastReport;
  const equipment = state.backpack;

  return <div className="expedition-page">
    <div className="expedition-heading"><div><span className="eyebrow">Jedna droga. Jeden ocalały.</span><h2>{active ? remaining ? 'Gdzieś wśród ruin' : 'Droga do domu zakończona' : 'Zanim otworzysz drzwi'}</h2></div><span className="expedition-phase">{active ? remaining ? 'W toku' : 'Raport gotowy' : 'Przygotowanie'}</span></div>
    <div className="expedition-layout">
      <section className="expedition-destination" aria-labelledby="destination-name"><div className="expedition-landscape"><img src={`/art/${location.id}.webp`} alt={`Ilustracja celu wyprawy: ${location.name}.`} width="1672" height="941" /><span>{active ? 'Cel aktywnej wyprawy' : 'Wybrany cel'}</span></div><div className="destination-copy"><span className="eyebrow">{location.discovery === 'visited' ? 'Odwiedzone' : 'Znane z informacji'}</span><h2 id="destination-name">{location.name}</h2><p>{location.description}</p><div className="unknown-findings"><span aria-hidden="true">?</span><p>Co przyniesie ta wyprawa?<small>Zdobycze poznasz dopiero po powrocie.</small></p></div>{!active && <button className="text-button" disabled={saving} onClick={() => navigate('map')}>Zmień cel na mapie →</button>}</div></section>
      <section className="expedition-plan" aria-labelledby="expedition-plan-title"><span className="eyebrow">{active ? 'Zapisany plan' : 'Sprawdź przed startem'}</span><h2 id="expedition-plan-title">{active ? 'Wyprawa w toku' : 'Przygotowanie wyprawy'}</h2>
        {active ? <>
          <p className="expedition-countdown" role="timer" aria-live="off">{remaining ? `Powrót za ${Math.floor(remaining / 60)} min ${remaining % 60} s` : 'Bohater wrócił. Raport gotowy do odbioru.'}</p>
          <progress className="expedition-progress" aria-label="Postęp wyprawy" max={100} value={progress} />
          <p className="expedition-clock">Planowany powrót: <time dateTime={new Date(active.expectedReturnAt).toISOString()}>{new Date(active.expectedReturnAt).toLocaleTimeString('pl-PL')}</time></p>
          <p>Postać wyruszyła ze swoim ekwipunkiem i założonym plecakiem. Możesz zamknąć grę i wrócić później.</p>
          <button className="expedition-primary" disabled={saving || remaining > 0} onClick={() => { void update((previous) => settleExpedition(previous, active.id)); }}>Odbierz raport i nagrodę</button>
          <p className="expedition-small">Następną wyprawę rozpoczniesz po odebraniu tego raportu.</p>
        </> : <>
          <div className="expedition-duration"><span>Planowany czas</span><strong>{(rule.durationMs / 60000).toLocaleString('pl-PL')} <small>min</small></strong></div>
          <div className="departure-cost"><span className="eyebrow">Obecny ekwipunek</span><p>Zabierasz wszystko, co masz przy postaci. Zawartość skrytki zostaje w kryjówce.</p><small>Założony: {getItem(equipment.itemId)?.name}. Start nie zużywa zapasów.</small></div>
          <button className="expedition-primary" disabled={saving || !!preparationError(state)} onClick={() => { void update((previous) => startExpedition(previous)); }}>Rozpocznij wyprawę</button>
          <button className="expedition-stock-link" onClick={() => navigate('inventory')}>Sprawdź ekwipunek →</button>
        </>}
      </section>
    </div>
    {report && <section className="expedition-report" aria-labelledby="report-heading"><div className="report-header"><div><span className="eyebrow">Ostatni raport / rozliczony</span><h2 id="report-heading">Bezpieczny powrót</h2><p>{locations.find((entry) => entry.id === report.locationId)?.name}</p></div><span>Powrót: <time dateTime={new Date(report.returnedAt).toISOString()}>{new Date(report.returnedAt).toLocaleString('pl-PL')}</time></span></div>
      <section className="report-journey" aria-labelledby="journey-heading"><span className="eyebrow">Ślady wyprawy</span><h3 id="journey-heading">Co wydarzyło się po drodze</h3>
        {report.events === null ? <p>Ta wyprawa rozpoczęła się przed wprowadzeniem dziennika. Zachowano jej pierwotny wynik.</p> : <ol>{report.events.map((event, index) => <li key={`${index}-${event.id}`}><span className="journey-step" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><h4>{eventDefinitions[event.id].title}</h4><p>{event.cacheResult === 'opened' ? 'Łom podważył wieko. W środku ocalały materiały, które zabrano ze sobą.' : event.cacheResult === 'jammed' ? 'Mimo użycia łomu zamek nie ustąpił. Skrzynia została na miejscu.' : event.cacheResult === 'no-tool' ? 'Bez zabranego łomu nie udało się otworzyć skrzyni. Postać ruszyła dalej.' : eventDefinitions[event.id].description}</p><p className="journey-findings">{event.loot.length ? `Znaleziono: ${event.loot.map((entry) => `${getItem(entry.itemId)?.name} ×${entry.quantity}`).join(', ')}.` : event.id === 'blocked-road' ? 'Powrót bez znalezisk.' : event.id === 'locked-cache' ? 'Ze skrzyni niczego nie zabrano.' : 'Nie znaleziono niczego przydatnego.'}</p></div></li>)}</ol>}
      </section>
      <h3>Przyniesione znaleziska</h3>{report.cargo.loot.length === 0 && <p>Tym razem nie znaleziono niczego wartego zabrania.</p>}<ul className="report-findings">{report.cargo.loot.map((entry) => <li key={entry.itemId}><ItemArt itemId={entry.itemId} /><span>{getItem(entry.itemId)?.name}<strong>×{entry.quantity}</strong></span></li>)}</ul>
      <div className="report-accounting"><p><span className="eyebrow">Zużyte zapasy</span>Woda ×{report.cargo.water} · Racje ×{report.cargo.ration}<small>{report.cargo.water || report.cargo.ration ? "Koszt wcześniejszej wyprawy." : "Start nie zużywa zapasów."}</small></p><p><span className="eyebrow">Stan po powrocie</span>Punkty zdrowia i stan sprzętu bez zmian.<small>Sprzęt jest znowu dostępny.</small></p></div>
      <div className="report-footer"><p>Znaleziska zapisano. Sprawdź ekwipunek, schowek i ewentualny odbiór. Raport jest już rozliczony.</p><button className="text-button" onClick={() => navigate('inventory')}>Zobacz ekwipunek →</button></div>
    </section>}
    <p className="expedition-footnote">Prototyp: lokalny zegar, bez walki i ręcznych decyzji podczas wyprawy. Strategia zrównoważona nie ma jeszcze odrębnego działania.</p>
  </div>;
}
