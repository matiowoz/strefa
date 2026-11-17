import { useEffect, useRef, useState } from 'react';
import { startBlinking } from './blinking';
import { getItem } from '../domain/catalog';
import type { GameState } from '../domain/types';
import './survivor-figure.css';

type Props = { equipped: GameState['equipped'] };
// Body and equipment share a fixed canvas; only the masked chest region breathes.
export function SurvivorFigure({ equipped }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [eyesClosed, setEyesClosed] = useState(false);
  useEffect(() => {
    if (!visible) return;
    return startBlinking(setEyesClosed);
  }, [visible]);
  useEffect(() => {
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); });
    if (ref.current) observer.observe(ref.current);
    document.addEventListener('visibilitychange', update);
    update();
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);
  const jacketWorn = equipped.body?.itemId === 'jacket';
  const layers = [
    { slot: 'body', item: 'jacket' }, { slot: 'feet', item: 'boots' },
    { slot: 'head', item: 'helmet' }, { slot: 'weapon', item: 'crowbar' },
  ] as const;
  const worn = layers.filter(({ slot, item }) => equipped[slot]?.itemId === item);
  const description = worn.length ? `Założone: ${worn.map(({ item }) => getItem(item)!.name).join(', ')}.` : 'Bez założonej kurtki, hełmu, butów i broni.';
  return <div ref={ref} className="survivor-figure" data-boots={equipped.feet?.itemId === 'boots'} data-armed={equipped.weapon?.itemId === 'crowbar'}>
    <div className="survivor-image" role="img" aria-label={`Ocalały w krótkiej, zużytej koszulce i bieliźnie. ${description} Podstawowy plecak na plecach.`}>
    <div className="survivor-shadow" />
    <div className="survivor-idle">
      <span className="survivor-layer figure-backpack" aria-hidden="true" />
      <span className={`survivor-layer figure-body-source ${jacketWorn ? 'figure-dressed' : 'figure-base'}`} data-figure-item={jacketWorn ? 'jacket' : undefined} aria-hidden="true" />
      <div className="survivor-chest" aria-hidden="true"><div className="survivor-chest-breath" style={{ animationPlayState: visible ? 'running' : 'paused' }}><span className={`survivor-layer figure-body-source ${jacketWorn ? 'figure-dressed' : 'figure-base'}`} /></div></div>
      <span className={`survivor-layer figure-eyes ${jacketWorn ? 'figure-dressed' : 'figure-base'}`} data-eyes-closed={visible && eyesClosed} aria-hidden="true" />
      {worn.filter(({ item }) => item !== 'jacket').map(({ item }) => <span key={item} className={`survivor-layer figure-${item}`} data-figure-item={item} aria-hidden="true" />)}
    </div>
    </div>
  </div>;
}
