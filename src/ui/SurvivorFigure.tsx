import { useEffect, useRef, useState } from 'react';
import { getItem } from '../domain/catalog';
import type { GameState } from '../domain/types';
import './survivor-figure.css';

type Props = { equipped: GameState['equipped'] };
// Each layer shares one portrait canvas. Gear follows the figure's idle movement.
export function SurvivorFigure({ equipped }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); });
    if (ref.current) observer.observe(ref.current);
    document.addEventListener('visibilitychange', update);
    update();
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);
  const layers = [
    { slot: 'body', item: 'jacket' }, { slot: 'feet', item: 'boots' },
    { slot: 'head', item: 'helmet' }, { slot: 'weapon', item: 'crowbar' },
  ] as const;
  const worn = layers.filter(({ slot, item }) => equipped[slot]?.itemId === item);
  const description = worn.length ? `Założone: ${worn.map(({ item }) => getItem(item)!.name).join(', ')}.` : 'Bez założonej kurtki, hełmu, butów i broni.';
  return <div ref={ref} className="survivor-figure" role="img" aria-label={`Ocalały w krótkiej, zużytej koszulce i bieliźnie. ${description} Podstawowy plecak na plecach.`}>
    <div className="survivor-shadow" />
    <div className="survivor-idle" style={{ animationPlayState: visible ? 'running' : 'paused' }}>
      <span className="survivor-layer figure-backpack" aria-hidden="true" />
      <span className="survivor-layer figure-base" aria-hidden="true" />
      {worn.map(({ item }) => <span key={item} className={`survivor-layer figure-${item}`} data-figure-item={item} aria-hidden="true" />)}
    </div>
  </div>;
}
