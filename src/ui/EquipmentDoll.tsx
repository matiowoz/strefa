import { useEffect, useId, useRef, useState } from 'react';
import type { InventoryEntry } from '../domain/types';
import { getItem } from '../domain/catalog';
import { ItemArt } from './ItemArt';
import { ItemPopover } from './ItemPopover';
import './equipment-doll.css';

type SlotKind = 'head' | 'body' | 'hands' | 'feet' | 'weapon' | 'sidearm';
const slots: { kind: SlotKind; label: string }[] = [
  { kind: 'head', label: 'Hełm' }, { kind: 'body', label: 'Ubranie' },
  { kind: 'hands', label: 'Rękawice' }, { kind: 'feet', label: 'Buty' },
  { kind: 'weapon', label: 'Broń główna' }, { kind: 'sidearm', label: 'Broń boczna' },
];
const outlines: Record<SlotKind, string> = {
  head: 'M8 30V23a16 16 0 0 1 32 0v7M6 30h36v6H6zM13 36v5m22-5v5M24 7v13',
  body: 'M16 7l8 5 8-5 11 10-7 9-4-4v19H16V22l-4 4-7-9zM24 12v29M19 28h10',
  hands: 'M15 40l-5-16 4-3 5 8V11a3 3 0 0 1 6 0v12-15a3 3 0 0 1 6 0v15-12a3 3 0 0 1 6 0v15-7a3 3 0 0 1 6 0v15l-7 10H17z',
  feet: 'M13 7h15v19l12 7v8H7V29h6zM13 12h15M13 18h15M7 35h33M28 26l-7 5',
  weapon: 'M5 32l9-9h6l5-5h14v-3h5v9H28l-4 4 6 8h-7l-5-7-7 9zM30 18v-5h6v5M8 28l5 5',
  sidearm: 'M6 14h35v11H27l-5 16H12l6-16H6zM33 14v11M8 19h25M26 25v6h-5',
};
function SlotIcon({ kind }: { kind: SlotKind }) {
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true"><path d={outlines[kind]} /></svg>;
}

export function EquipmentDoll({ backpack }: { backpack: InventoryEntry }) {
  const popoverId = useId();
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keep = () => { if (timer.current) clearTimeout(timer.current); };
  const close = () => { keep(); setAnchor(null); };
  const leave = () => { keep(); timer.current = setTimeout(() => setAnchor(null), 250); };
  const open = (element: HTMLElement) => { keep(); setAnchor(element.getBoundingClientRect()); };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return <section className="equipment-doll" aria-label="Wyposażenie postaci">
    <div className="equipment-stage">
      <img className="equipment-survivor" src="/art/survivor.png" alt="Ocalały w zużytym płaszczu. Miejsca na wyposażenie znajdują się przy sylwetce." width="1024" height="1536" />
      <span className="equipment-crosshair" aria-hidden="true" />
      {slots.map(({ kind, label }) => <div className={`wear-slot slot-${kind}`} key={kind} role="img" aria-label={`${label} — puste miejsce, zakładanie w przygotowaniu`} title={`${label} — zakładanie w przygotowaniu`}><SlotIcon kind={kind} /><span>{label}</span></div>)}
      <button className="wear-slot slot-backpack is-equipped" aria-label={`Założony plecak: ${getItem(backpack.itemId)?.name}`} aria-controls={anchor ? popoverId : undefined} aria-expanded={!!anchor} onPointerEnter={(event) => { if (event.pointerType !== 'touch') open(event.currentTarget); }} onPointerLeave={leave} onFocus={(event) => open(event.currentTarget)} onBlur={leave} onClick={(event) => open(event.currentTarget)}>
        <ItemArt itemId={backpack.itemId} /><span>Plecak</span><i aria-hidden="true" />
      </button>
      <span className="equipment-stencil" aria-hidden="true">STREFA / OSOBISTE</span>
    </div>
    <p className="equipment-future">Sloty odzieży i broni — w przygotowaniu.</p>
    {anchor && <ItemPopover id={popoverId} entry={backpack} anchor={anchor} keep={keep} leave={leave} close={close}><p>Założony na stałe · 5 × 9 pól.</p></ItemPopover>}
  </section>;
}
