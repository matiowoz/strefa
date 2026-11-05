import { useEffect, useId, useRef, useState } from 'react';
import type { EquipmentSlot, GameState } from '../domain/types';
import { unequipItem, wornItems } from '../domain/equipment';
import type { InventoryDrag } from './useInventoryDrag';
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

type Props = { state: GameState; disabled: boolean; selectedId: string | null; drag: InventoryDrag; equip: (id: string, slot: EquipmentSlot) => void; unequip: (id: string) => void };
export function EquipmentDoll({ state, disabled, selectedId, drag, equip, unequip }: Props) {
  const backpack = state.backpack;
  const popoverId = useId();
  const [hover, setHover] = useState<{ id: string; anchor: DOMRect } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keep = () => { if (timer.current) clearTimeout(timer.current); };
  const close = () => { keep(); setHover(null); };
  const leave = () => { keep(); timer.current = setTimeout(() => setHover(null), 250); };
  const open = (id: string, element: HTMLElement) => { keep(); if (!drag.active) setHover({ id, anchor: element.getBoundingClientRect() }); };
  const viewed = [backpack, ...wornItems(state)].find((entry) => entry.id === hover?.id);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return <section className="equipment-doll" aria-label="Wyposażenie postaci">
    <div className="equipment-stage">
      <img className="equipment-survivor" src="/art/survivor.png" alt="Ocalały w zużytym płaszczu. Założone przedmioty pokazują miejsca przy sylwetce." width="1024" height="1536" />
      <span className="equipment-crosshair" aria-hidden="true" />
      {slots.map(({ kind, label }) => {
        const entry = state.equipped[kind];
        const available = kind !== 'hands' && kind !== 'sidearm';
        if (!available) return <div className={`wear-slot slot-${kind}`} key={kind} role="img" aria-label={`${label} — w przygotowaniu`} title={`${label} — w przygotowaniu`}><SlotIcon kind={kind} /><span>{label}</span></div>;
        return <button key={kind} data-equipment-slot={kind} data-worn-id={entry?.id} className={`wear-slot slot-${kind} ${entry ? 'is-equipped' : ''} ${drag.draggingId === entry?.id && entry ? 'drag-origin' : ''}`} aria-label={entry ? `${label}: ${getItem(entry.itemId)?.name}` : `${label} — puste miejsce`} aria-disabled={disabled} aria-expanded={!!entry && hover?.id === entry.id} aria-controls={entry && hover?.id === entry.id ? popoverId : undefined}
          title={entry ? getItem(entry.itemId)?.name : `Upuść przedmiot: ${label}`}
          onPointerEnter={(event) => { if (entry && event.pointerType !== 'touch') open(entry.id, event.currentTarget); }} onPointerLeave={leave} onFocus={(event) => { if (entry) open(entry.id, event.currentTarget); }} onBlur={leave}
          onPointerDown={(event) => { if (entry) { close(); drag.begin(event, entry); } }} onClick={(event) => { if (entry) open(entry.id, event.currentTarget); else if (selectedId && !disabled) equip(selectedId, kind); }}>
          {entry ? <ItemArt itemId={entry.itemId} /> : <SlotIcon kind={kind} />}<span>{label}</span>{entry && <i aria-hidden="true" />}
        </button>;
      })}
      <button className="wear-slot slot-backpack is-equipped" aria-label={`Założony plecak: ${getItem(backpack.itemId)?.name}`} aria-controls={hover?.id === backpack.id ? popoverId : undefined} aria-expanded={hover?.id === backpack.id} onPointerEnter={(event) => { if (event.pointerType !== 'touch') open(backpack.id, event.currentTarget); }} onPointerLeave={leave} onFocus={(event) => open(backpack.id, event.currentTarget)} onBlur={leave} onClick={(event) => open(backpack.id, event.currentTarget)}>
        <ItemArt itemId={backpack.itemId} /><span>Plecak</span><i aria-hidden="true" />
      </button>
      <span className="equipment-stencil" aria-hidden="true">STREFA / OSOBISTE</span>
    </div>
    <p className="equipment-future">Sylwetka poglądowa · wygląd postaci nie zmienia się jeszcze wraz z wyposażeniem.</p>
    {hover && viewed && !drag.active && <ItemPopover id={popoverId} entry={viewed} anchor={hover.anchor} keep={keep} leave={leave} close={close}>{viewed.id === backpack.id ? <p>Założony na stałe · 5 × 9 pól.</p> : <><p>Stan: {viewed.condition}%</p><button disabled={disabled || unequipItem(state, viewed.id) === state} title="Zdejmij do wolnego miejsca w plecaku" onClick={() => { close(); unequip(viewed.id); }}>Zdejmij</button></>}</ItemPopover>}
  </section>;
}
