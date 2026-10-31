import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { getItem } from '../domain/catalog';
import type { InventoryEntry } from '../domain/types';

type Props = { id: string; entry: InventoryEntry; anchor: DOMRect; children: ReactNode; keep: () => void; leave: () => void; close: () => void };
export function ItemPopover({ id, entry, anchor, children, keep, leave, close }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(220);
  useLayoutEffect(() => { if (ref.current) setHeight(ref.current.offsetHeight); }, [entry.id, children]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    const outside = (event: globalThis.PointerEvent) => { if (!ref.current?.contains(event.target as Node)) close(); };
    window.addEventListener('keydown', escape); window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true); document.addEventListener('pointerdown', outside);
    return () => { window.removeEventListener('keydown', escape); window.removeEventListener('resize', close); window.removeEventListener('scroll', close, true); document.removeEventListener('pointerdown', outside); };
  }, [close]);
  const item = getItem(entry.itemId)!;
  const right = anchor.right + 288 <= window.innerWidth;
  const leftSide = anchor.left >= 288;
  const left = right ? anchor.right + 8 : leftSide ? anchor.left - 288 : Math.max(8, Math.min(anchor.left, window.innerWidth - 288));
  const top = right || leftSide ? Math.max(8, Math.min(anchor.top, window.innerHeight - height - 8))
    : anchor.bottom + height + 16 <= window.innerHeight ? anchor.bottom + 8 : Math.max(8, anchor.top - height - 8);
  return createPortal(<div ref={ref} id={id} className="item-popover" role="dialog" aria-label={item.name} style={{ left, top }} onPointerEnter={keep} onPointerLeave={leave} onFocus={keep} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) leave(); }}>
    <button className="item-popover-close" aria-label="Zamknij opis przedmiotu" onClick={close}>×</button><h3>{item.name}</h3><p>{item.description}</p><div className="item-popover-actions">{children}</div>
  </div>, document.body);
}
