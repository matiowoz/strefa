import { useId } from 'react';
import type { ReactNode } from 'react';
import { SurvivorFigure } from './SurvivorFigure';
import type { Hero, GameState } from '../domain/types';
import './hero.css';

export function HeroPortrait({ hero, equipped, children }: { hero: Hero; equipped: GameState['equipped']; children?: ReactNode }) {
  const identityId = useId();
  const healthId = useId();
  return <section className="hero-portrait" aria-labelledby={identityId}>
    <div className="hero-identity"><span className="eyebrow">Karta ocalałego</span><h2 id={identityId}>{hero.name}</h2><span>Poziom {hero.level}</span></div>
    <div className="hero-portrait-image"><SurvivorFigure equipped={equipped} /></div>
    <div className="hero-vitals"><label htmlFor={healthId}>Zdrowie <span>{hero.health} / {hero.maxHealth}</span></label><progress id={healthId} value={hero.health} max={hero.maxHealth} /></div>
    {children}
  </section>;
}
