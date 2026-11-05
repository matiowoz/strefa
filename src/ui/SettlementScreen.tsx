import { useState } from 'react';
import { canVisitSettlement, settlement } from '../domain/settlement';
import type { GameState } from '../domain/types';
import './settlement.css';

type Props = { state: GameState; navigate: (screen: 'map' | 'trader' | 'expeditions') => void };
export function SettlementScreen({ state, navigate }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const resident = settlement.residents.find((entry) => entry.id === selected);
  if (!canVisitSettlement(state)) return <section className="settlement-dialogue"><h2>Przystań poczeka</h2><p>Najpierw zakończ wyprawę i odbierz raport.</p><button onClick={() => navigate('expeditions')}>Zobacz wyprawę</button></section>;
  return <div className="settlement-page">
    <section className="settlement-scene" aria-labelledby="settlement-title"><img src="/art/przystan-interior.webp" alt="Wnętrze dużego dawnego domu kultury: handlarz za ladą po lewej, operatorka radia przy stole, dozorca przy zamkniętych drzwiach i podróżni na ławkach. Ciepłe lampy oświetlają stary hol z balkonem." width="1672" height="941" fetchPriority="high" /><div className="settlement-scene-heading"><span className="eyebrow">Bezpieczna lokalizacja · {settlement.building}</span><h2 id="settlement-title">{settlement.name}</h2><p>Wspólny dach pośród ruin.</p></div></section>
    <div className="settlement-arrival"><p>W głównym holu pachnie dymem z pieca. Ktoś rozmawia przy ladzie, radio cicho trzaska. Tutaj spotykają się mieszkańcy i ludzie wracający z drogi.</p><button onClick={() => navigate('map')}>Wyjdź na mapę</button></div>
    <section aria-labelledby="residents-title"><span className="eyebrow">Wewnątrz budynku</span><h2 id="residents-title">Mieszkańcy Przystani</h2><div className="settlement-residents">{settlement.residents.map((entry) => <button key={entry.id} className="resident-card" aria-pressed={selected === entry.id} aria-controls="resident-dialogue" onClick={() => setSelected(entry.id)}><span className="eyebrow">{entry.role}</span><strong>{entry.name}</strong><span>{entry.description}</span><span className="resident-talk">Porozmawiaj →</span></button>)}</div></section>
    <section id="resident-dialogue" className="settlement-dialogue" aria-live="polite">{resident ? <><span className="eyebrow">{resident.role}</span><h3>{resident.name}</h3><p>„{resident.dialogue}”</p>{resident.id === 'trader' && <button onClick={() => navigate('trader')}>Pokaż ofertę</button>}</> : <p>Wybierz osobę, do której chcesz podejść.</p>}</section>
  </div>;
}
