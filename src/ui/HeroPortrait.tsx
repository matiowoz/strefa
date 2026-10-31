import { useId } from 'react';
import type { ReactNode } from 'react';
import type { Hero } from '../domain/types';
import './hero.css';

export function HeroPortrait({ hero, children }: { hero: Hero; children?: ReactNode }) {
  const identityId = useId();
  const healthId = useId();
  return <section className="hero-portrait" aria-labelledby={identityId}>
    <div className="hero-identity"><span className="eyebrow">Karta ocalałego</span><h2 id={identityId}>{hero.name}</h2><span>Poziom {hero.level}</span></div>
    <div className="hero-portrait-image"><img src="/art/survivor.png" alt="Ilustracja ocalałego w zużytym płaszczu, z plecakiem, w świetle lampy schronienia." width="1024" height="1536" /><small>Ilustracja poglądowa — ubiór nie zmienia się wraz ze sprzętem.</small></div>
    <div className="hero-vitals"><label htmlFor={healthId}>Zdrowie <span>{hero.health} / {hero.maxHealth}</span></label><progress id={healthId} value={hero.health} max={hero.maxHealth} /></div>
    {children}
  </section>;
}
