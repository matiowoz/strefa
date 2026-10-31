import { useEffect, useState } from 'react';
import { getItem, locations } from '../domain/catalog';
import { expeditionRules, startExpedition, settleExpedition } from '../domain/game';
import { kits, preparationError, prepareExpedition, quantity } from '../domain/preparation';
import type { GameState } from '../domain/types';
import { ItemArt } from './ItemArt';
import './expeditions.css';

type Update = (change: (previous: GameState) => GameState) => Promise<boolean>;
type Props = { state: GameState; update: Update; saving: boolean; navigate: (screen: 'map' | 'inventory') => void };
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
    <p className="muted">Zapasy na całą drogę, również powrotną, zużywane raz przy starcie. Wariant z zapasem zużywa więcej, bez dodatkowych korzyści. Sprzęt pozostaje Twoją własnością i wraca bez uszkodzeń; plecak nie daje jeszcze premii.</p>
    {problem && <p role="status">{problem}</p>}
  </fieldset>;
}

export function ExpeditionsScreen({ state, update, saving, navigate }: Props) {
  const [now, setNow] = useState(Date.now());
  const active = state.activeExpedition;
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [active]);
  const location = locations.find((entry) => entry.id === (active?.plan.locationId ?? state.selectedLocationId))!;
  const rule = expeditionRules[location.id];
  const kit = kits[state.preparation.kit];
  const remaining = active ? Math.max(0, Math.ceil((active.expectedReturnAt - now) / 1000)) : 0;
  const progress = active ? Math.max(0, Math.min(100, (now - active.startedAt) / Math.max(1, active.expectedReturnAt - active.startedAt) * 100)) : 0;
  const report = state.lastReport;
  const equipmentId = active ? active.cargo.equipmentId : state.preparation.equipmentId;
  const equipment = state.inventory.find((entry) => entry.id === equipmentId);

  return <div className="expedition-page">
    <div className="expedition-heading"><div><span className="eyebrow">Jedna droga. Jeden ocalały.</span><h2>{active ? remaining ? 'Gdzieś wśród ruin' : 'Droga do domu zakończona' : 'Zanim otworzysz drzwi'}</h2></div><span className="expedition-phase">{active ? remaining ? 'W toku' : 'Raport gotowy' : 'Przygotowanie'}</span></div>
    <div className="expedition-layout">
      <section className="expedition-destination" aria-labelledby="destination-name"><div className="expedition-landscape"><img src={`/art/${location.id}.webp`} alt={`Ilustracja celu wyprawy: ${location.name}.`} width="1672" height="941" /><span>{active ? 'Cel aktywnej wyprawy' : 'Wybrany cel'}</span></div><div className="destination-copy"><span className="eyebrow">{location.discovery === 'visited' ? 'Odwiedzone' : 'Znane z informacji'}</span><h2 id="destination-name">{location.name}</h2><p>{location.description}</p><div className="unknown-findings"><span aria-hidden="true">?</span><p>Co przyniesie ta wyprawa?<small>Zdobycze poznasz dopiero po powrocie.</small></p></div>{!active && <button className="text-button" disabled={saving} onClick={() => navigate('map')}>Zmień cel na mapie →</button>}</div></section>
      <section className="expedition-plan" aria-labelledby="expedition-plan-title"><span className="eyebrow">{active ? 'Zapisany plan' : 'Sprawdź przed startem'}</span><h2 id="expedition-plan-title">{active ? 'Wyprawa w toku' : 'Przygotowanie wyprawy'}</h2>
        {active ? <>
          <p className="expedition-countdown" role="timer" aria-live="off">{remaining ? `Powrót za ${Math.floor(remaining / 60)} min ${remaining % 60} s` : 'Bohater wrócił. Raport gotowy do odbioru.'}</p>
          <progress className="expedition-progress" aria-label="Postęp wyprawy" max={100} value={progress} />
          <p className="expedition-clock">Planowany powrót: <time dateTime={new Date(active.expectedReturnAt).toISOString()}>{new Date(active.expectedReturnAt).toLocaleTimeString('pl-PL')}</time></p>
          <dl><div><dt>Woda pobrana</dt><dd>×{active.cargo.water}</dd></div><div><dt>Racje pobrane</dt><dd>×{active.cargo.ration}</dd></div><div><dt>Wyposażenie</dt><dd>{equipment ? getItem(equipment.itemId)?.name : 'Bez sprzętu'}</dd></div></dl>
          <p>Plan i zapasy są już zapisane. Możesz zamknąć grę i wrócić później.</p>
          <button className="expedition-primary" disabled={saving || remaining > 0} onClick={() => { void update((previous) => settleExpedition(previous, active.id)); }}>Odbierz raport i nagrodę</button>
          <p className="expedition-small">Następną wyprawę rozpoczniesz po odebraniu tego raportu.</p>
        </> : <>
          <div className="expedition-duration"><span>Planowany czas</span><strong>{rule.durationMs / 60000} <small>min</small></strong></div>
          <PreparationPanel state={state} update={update} saving={saving} />
          <div className="departure-cost"><span className="eyebrow">Zostanie pobrane przy starcie</span><p>Woda ×{kit.water} · Racje ×{kit.ration}</p><small>Wyposażenie: {equipment ? getItem(equipment.itemId)?.name : 'Bez sprzętu'}</small></div>
          <button className="expedition-primary" disabled={saving || !!preparationError(state)} onClick={() => { void update((previous) => startExpedition(previous)); }}>Rozpocznij wyprawę</button>
          <button className="expedition-stock-link" onClick={() => navigate('inventory')}>Przygotuj brakujące zapasy →</button>
        </>}
      </section>
    </div>
    {report && <section className="expedition-report" aria-labelledby="report-heading"><div className="report-header"><div><span className="eyebrow">Ostatni raport / rozliczony</span><h2 id="report-heading">Bezpieczny powrót</h2><p>{locations.find((entry) => entry.id === report.locationId)?.name}</p></div><span>Powrót: <time dateTime={new Date(report.returnedAt).toISOString()}>{new Date(report.returnedAt).toLocaleString('pl-PL')}</time></span></div>
      <h3>Przyniesione znaleziska</h3><ul className="report-findings">{report.cargo.loot.map((entry) => <li key={entry.itemId}><ItemArt itemId={entry.itemId} /><span>{getItem(entry.itemId)?.name}<strong>×{entry.quantity}</strong></span></li>)}</ul>
      <div className="report-accounting"><p><span className="eyebrow">Zużyte zapasy</span>Woda ×{report.cargo.water} · Racje ×{report.cargo.ration}<small>Pobrane raz, przy starcie.</small></p><p><span className="eyebrow">Stan po powrocie</span>Zdrowie i wyposażenie bez zmian.<small>Sprzęt jest znowu dostępny.</small></p></div>
      <div className="report-footer"><p>Znaleziska zapisano. Sprawdź ekwipunek, schowek i ewentualny odbiór. Raport jest już rozliczony.</p><button className="text-button" onClick={() => navigate('inventory')}>Zobacz ekwipunek →</button></div>
    </section>}
    <p className="expedition-footnote">Prototyp: lokalny zegar, bez walki i symulacji zdarzeń. Strategia zrównoważona nie ma jeszcze odrębnego działania.</p>
  </div>;
}
