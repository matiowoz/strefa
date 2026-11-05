import { startStances } from './stances';
import type { Stance } from './stances';
import { useEffect, useRef, useState } from 'react';
import { startBlinking } from './blinking';
import { getItem } from '../domain/catalog';
import type { GameState } from '../domain/types';
import './survivor-figure.css';

type Props = { equipped: GameState['equipped'] };
// Drawn footstep frames replace leg deformation; chest and eyelids animate separately.
export function SurvivorFigure({ equipped }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [motion, setMotion] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(true);
  const [eyesClosed, setEyesClosed] = useState(false);
  const [stance, setStance] = useState<Stance>('even');
  useEffect(() => {
    if (!motion || !visible) return;
    return startStances(setStance);
  }, [motion, visible]);
  useEffect(() => {
    if (!motion || !visible) return;
    return startBlinking(setEyesClosed);
  }, [motion, visible]);
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
  return <div ref={ref} className="survivor-figure" data-visible={visible} data-stance={stance} data-boots={equipped.feet?.itemId === 'boots'} data-armed={equipped.weapon?.itemId === 'crowbar'} data-motion={motion ? 'on' : 'off'}>
    <button className="survivor-motion" aria-pressed={motion} onClick={() => setMotion(!motion)}>Ruch: {motion ? 'włączony' : 'wyłączony'}</button>
    <div className="survivor-image" role="img" aria-label={`Ocalały w krótkiej, zużytej koszulce i bieliźnie. ${description} Podstawowy plecak na plecach.`}>
    <div className="survivor-shadow" />
    <div className="survivor-idle">
      <div className="survivor-steps" data-figure-item={equipped.feet?.itemId === 'boots' ? 'boots' : undefined} aria-hidden="true">
        {(['even', 'lift-left', 'left', 'lift-right', 'right'] as const).map((frame) => <span key={frame} className={`survivor-step step-${frame}`} />)}
      </div>
      <div className="survivor-upper"><div className="survivor-torso">
      <span className="survivor-layer figure-backpack" aria-hidden="true" />
      <span className={`survivor-layer figure-body-source ${jacketWorn ? 'figure-dressed' : 'figure-base'}`} data-figure-item={jacketWorn ? 'jacket' : undefined} aria-hidden="true" />
      <div className="survivor-chest" style={{ animationPlayState: visible ? 'running' : 'paused' }} aria-hidden="true"><span className={`survivor-layer figure-body-source ${jacketWorn ? 'figure-dressed' : 'figure-base'}`} /></div>
      <span className={`survivor-layer figure-eyes ${jacketWorn ? 'figure-dressed' : 'figure-base'}`} data-eyes-closed={motion && visible && eyesClosed} aria-hidden="true" />
      {worn.filter(({ item }) => item !== 'jacket' && item !== 'boots' && item !== 'crowbar').map(({ item }) => <span key={item} className={`survivor-layer figure-${item}`} data-figure-item={item} aria-hidden="true" />)}
      </div>
      {equipped.weapon?.itemId === 'crowbar' && <span className="survivor-layer figure-crowbar" data-figure-item="crowbar" aria-hidden="true" />}
      </div>
    </div>
    </div>
  </div>;
}
