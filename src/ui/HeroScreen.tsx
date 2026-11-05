import { getItem, skillNames } from '../domain/catalog';
import type { GameState, SkillId } from '../domain/types';
import { HeroPortrait } from './HeroPortrait';
import { ItemArt } from './ItemArt';
import './hero.css';

type Props = { state: GameState; navigate: (screen: 'inventory') => void };
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

export function HeroScreen({ state, navigate }: Props) {
  const equipment = state.backpack;
  return <div className="hero-page">
    <div className="hero-intro"><span className="eyebrow">Nie legenda. Człowiek, który przetrwał.</span><p>To, co umiesz, zabierasz ze sobą.</p></div>
    <div className="hero-sheet">
      <HeroPortrait hero={state.hero} equipped={state.equipped} />
      <div className="hero-record">
        <section className="hero-equipment" aria-label="Wyposażenie na wyprawę"><div className="hero-equipment-art"><ItemArt itemId="backpack" /></div><div><span className="eyebrow">{state.activeExpedition ? 'Wyposażenie aktywnej wyprawy' : 'Założony plecak'}</span><h2>{getItem(equipment.itemId)?.name}</h2><p>{`Stan: ${equipment.condition}% · Założony na stałe · 5 × 9 pól`}</p><button className="text-button" onClick={() => navigate('inventory')}>Przejdź do ekwipunku →</button></div></section>
        <section className="hero-skills" aria-labelledby="hero-skills-heading"><span className="eyebrow">Wiedza i praktyka</span><h2 id="hero-skills-heading">Umiejętności ocalałego</h2><p>To dziedziny rozwoju postaci. Ich automatyczny rozwój i premie nie są jeszcze wdrożone.</p>
          <ul>{(Object.keys(skillNames) as SkillId[]).map((skill, index) => <li key={skill}><span className="skill-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><h3>{skillNames[skill]}</h3><p>{descriptions[skill]}</p></div><span className="skill-value"><small>Wartość</small>{state.hero.skills[skill]}</span></li>)}</ul>
        </section>
      </div>
    </div>
  </div>;
}
