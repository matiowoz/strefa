import { useId, useRef, useState, useEffect } from 'react';
import { getItem } from '../domain/catalog';
import type { ResourceAmount } from '../domain/types';
import { ItemArt } from './ItemArt';
import { ItemPopover } from './ItemPopover';
import './resource-icons.css';

type Props = { items: readonly ResourceAmount[]; owned?: (id: string) => number; label: string };
export function ResourceIcons({ items, owned, label }: Props) {
  const id = useId();
  const [hover, setHover] = useState<{ itemId: string; anchor: DOMRect } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keep = () => { if (timer.current) clearTimeout(timer.current); };
  const close = () => { keep(); setHover(null); };
  const leave = () => { keep(); timer.current = setTimeout(() => setHover(null), 250); };
  const open = (itemId: string, element: HTMLElement) => { keep(); setHover({ itemId, anchor: element.getBoundingClientRect() }); };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return <div className="resource-icons" role="group" aria-label={label}>{items.map((item) => {
    const count = owned?.(item.itemId);
    const name = getItem(item.itemId)!.name;
    return <button type="button" className={`resource-icon ${count !== undefined && count < item.quantity ? 'resource-missing' : ''}`} key={item.itemId} aria-label={`${name}: ${count !== undefined ? `masz ${count}, potrzeba ` : ''}${item.quantity}`} aria-expanded={hover?.itemId === item.itemId} aria-controls={hover?.itemId === item.itemId ? id : undefined} onPointerEnter={(event) => { if (event.pointerType !== 'touch') open(item.itemId, event.currentTarget); }} onPointerLeave={leave} onFocus={(event) => open(item.itemId, event.currentTarget)} onBlur={leave} onClick={(event) => open(item.itemId, event.currentTarget)}><ItemArt itemId={item.itemId} /><span>{count !== undefined ? `${count} / ${item.quantity}` : `×${item.quantity}`}</span></button>;
  })}{hover && <ItemPopover id={id} entry={{ id: `preview-${hover.itemId}`, itemId: hover.itemId, quantity: 1, condition: null }} anchor={hover.anchor} keep={keep} leave={leave} close={close}>{owned && <p>{`W plecaku: ${owned(hover.itemId)} · wymagane: ${items.find((item) => item.itemId === hover.itemId)!.quantity}`}</p>}</ItemPopover>}</div>;
}
