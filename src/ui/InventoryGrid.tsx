import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { GameState, InventoryEntry } from '../domain/types';
import { getItem } from '../domain/catalog';
import { gridSize, itemSizes } from '../domain/inventory';
import { ItemPopover } from './ItemPopover';
import { ItemArt } from './ItemArt';
import type { InventoryDrag } from './useInventoryDrag';

type Props = { state: GameState; page: number; selectedId: string | null; disabled: boolean; select: (id: string) => void; place: (id: string, page: number, point: { x: number; y: number }) => void; moving: boolean; drag: InventoryDrag; actions: (entry: InventoryEntry) => ReactNode };
function contents(entry: InventoryEntry) {
  return <>{getItem(entry.itemId)?.category !== 'equipment' && <span className="bag-quantity">×{entry.quantity}</span>}<ItemArt itemId={entry.itemId} /></>;
}
export function InventoryGrid({ state, page, selectedId, disabled, select, place, moving, drag, actions }: Props) {
  const size = gridSize(page);
  const popoverId = useId();
  const [hover, setHover] = useState<{ id: string; anchor: DOMRect } | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keep = () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  const close = () => { keep(); setHover(null); };
  const leave = () => { keep(); hideTimer.current = setTimeout(() => setHover(null), 250); };
  const open = (id: string, element: HTMLElement) => { keep(); if (!drag.active) setHover({ id, anchor: element.getBoundingClientRect() }); };
  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);
  const entries = (page === -1 ? state.inventory : state.stash).filter((entry) => state.positions[entry.id].page === page);
  return <div className="container-scroll"><div data-bag-page={page} className={`bag-grid ${page === -1 ? 'carried-grid' : 'hideout-grid'}`} style={{ gridTemplateColumns: `repeat(${size.columns}, var(--bag-cell-size))`, gridTemplateRows: `repeat(${size.rows}, var(--bag-cell-size))` }} role="group" aria-label={page === -1 ? 'Ekwipunek 5 na 9' : 'Schowek 8 na 9'}>
    {Array.from({ length: size.columns * size.rows }, (_, index) => {
      const point = { x: index % size.columns, y: Math.floor(index / size.columns) };
      return <button className="bag-cell" key={`cell-${index}`} style={{ gridColumn: point.x + 1, gridRow: point.y + 1 }} disabled={disabled || !moving || !selectedId} aria-label={`Umieść wybrany przedmiot: kolumna ${point.x + 1}, rząd ${point.y + 1}`} onClick={() => { if (selectedId) place(selectedId, page, point); }} />;
    })}
    {entries.map((entry) => {
      const position = state.positions[entry.id]; const dimensions = itemSizes[entry.itemId];
      return <button key={entry.id} data-item-id={entry.id} className={`bag-item ${selectedId === entry.id ? 'is-selected' : ''} ${drag.draggingId === entry.id ? 'drag-origin' : ''}`} style={{ gridColumn: `${position.x + 1} / span ${dimensions.width}`, gridRow: `${position.y + 1} / span ${dimensions.height}` }} aria-label={`${getItem(entry.itemId)?.name}, ilość ${entry.quantity}, rozmiar ${dimensions.width} na ${dimensions.height}`} aria-pressed={selectedId === entry.id} aria-controls={hover?.id === entry.id ? popoverId : undefined} aria-expanded={hover?.id === entry.id} onPointerEnter={(event) => { if (event.pointerType !== 'touch') open(entry.id, event.currentTarget); }} onPointerLeave={leave} onFocus={(event) => open(entry.id, event.currentTarget)} onBlur={leave} aria-disabled={disabled || state.activeExpedition?.cargo.equipmentId === entry.id} onPointerDown={(event) => { close(); drag.begin(event, entry); }} onClick={(event) => { select(entry.id); open(entry.id, event.currentTarget); }}>
        {contents(entry)}
      </button>;
    })}
  </div>{hover && !drag.active && entries.some((entry) => entry.id === hover.id) && <ItemPopover id={popoverId} entry={entries.find((entry) => entry.id === hover.id)!} anchor={hover.anchor} keep={keep} leave={leave} close={close}>{actions(entries.find((entry) => entry.id === hover.id)!)}</ItemPopover>}</div>;
}
