import { useState } from 'react';
import { getItem, skillNames } from '../domain/catalog';
import { renameHero } from '../domain/game';
import type { GameState, SkillId } from '../domain/types';
import { ItemArt } from './ItemArt';
import './hero.css';

type Props = { state: GameState; saving: boolean; update: (change: (state: GameState) => GameState) => Promise<boolean>; navigate: (screen: 'inventory') => void };
const descriptions: Record<SkillId, string> = {
  combat: 'Starcia i taktyka. Walka jest jeszcze w przygotowaniu.',
  scouting: 'Poznawanie okolicy i obserwacja terenu.',
  survival: 'Przygotowanie do drogi w trudnych warunkach.',
  medicine: 'Opatrunki i pomoc medyczna. Leczenie w przygotowaniu.',
  crafting: 'Praca z materiałami i przygotowanie wyposażenia.',
  electronics: 'Urządzenia i naprawy elektroniki.',
  trade: 'Wymiana i negocjacje. Handel w przygotowaniu.',
  transport: 'Planowanie przewozu zapasów i sprzętu.',
};

export function HeroScreen({ state, update, saving, navigate }: Props) {
  const [name, setName] = useState(state.hero.name);
  const [notice, setNotice] = useState('');
  const equipmentId = state.activeExpedition ? state.activeExpedition.cargo.equipmentId : state.preparation.equipmentId;
  const equipment = state.inventory.find((entry) => entry.id === equipmentId);
  return <div className="hero-page">
    <div className="hero-intro"><span className="eyebrow">Nie legenda. Człowiek, który przetrwał.</span><p>To, co umiesz, zabierasz ze sobą.</p></div>
    <div className="hero-sheet">
      <section className="hero-portrait" aria-labelledby="hero-identity"><div className="hero-identity"><span className="eyebrow">Karta ocalałego</span><h2 id="hero-identity">{state.hero.name}</h2><span>Poziom {state.hero.level}</span></div>
        <div className="hero-portrait-image"><img src="/art/survivor.png" alt="Ilustracja ocalałego w zużytym płaszczu, z plecakiem, w świetle lampy schronienia." width="1024" height="1536" /><small>Ilustracja poglądowa — ubiór nie zmienia się wraz ze sprzętem.</small></div>
        <div className="hero-vitals"><label htmlFor="hero-vitals">Zdrowie <span>{state.hero.health} / {state.hero.maxHealth}</span></label><progress id="hero-vitals" value={state.hero.health} max={state.hero.maxHealth} /></div>
      </section>
      <div className="hero-record">
        <section className="hero-name-card" aria-labelledby="hero-name-heading"><span className="eyebrow">Jak mają Cię zapamiętać?</span><h2 id="hero-name-heading">Twoje imię w Strefie</h2><form onSubmit={(event) => { event.preventDefault(); setNotice(''); void update((previous) => renameHero(previous, name)).then((ok) => { if (ok) setNotice('Pseudonim zapisany.'); }); }}>
          <label htmlFor="hero-name">Pseudonim</label><input id="hero-name" value={name} minLength={2} maxLength={24} required autoComplete="off" onChange={(event) => { setName(event.target.value); setNotice(''); }} />
          <p className="field-help">Od 2 do 24 znaków. Zmiana nie wpływa na umiejętności.</p><button disabled={saving} type="submit">{saving ? 'Zapisywanie…' : 'Zapisz pseudonim'}</button><p className="form-notice" role="status">{notice}</p>
        </form></section>
        <section className="hero-equipment" aria-label="Wyposażenie na wyprawę"><div className="hero-equipment-art"><ItemArt itemId="backpack" /></div><div><span className="eyebrow">{state.activeExpedition ? 'Wyposażenie aktywnej wyprawy' : 'Wyposażenie na następną wyprawę'}</span><h2>{equipment ? getItem(equipment.itemId)?.name : 'Nie wybrano plecaka'}</h2><p>{equipment ? `Stan: ${equipment.condition}% · ${state.activeExpedition ? 'Zarezerwowany do powrotu' : 'Wybrany do zabrania'}` : 'Plecak wybierzesz w Ekwipunku.'}</p><button className="text-button" onClick={() => navigate('inventory')}>Przejdź do ekwipunku →</button></div></section>
        <section className="hero-skills" aria-labelledby="hero-skills-heading"><span className="eyebrow">Wiedza i praktyka</span><h2 id="hero-skills-heading">Umiejętności ocalałego</h2><p>To dziedziny rozwoju postaci. Ich automatyczny rozwój i premie nie są jeszcze wdrożone.</p>
          <ul>{(Object.keys(skillNames) as SkillId[]).map((skill, index) => <li key={skill}><span className="skill-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><h3>{skillNames[skill]}</h3><p>{descriptions[skill]}</p></div><span className="skill-value"><small>Wartość</small>{state.hero.skills[skill]}</span></li>)}</ul>
        </section>
      </div>
    </div>
  </div>;
}
