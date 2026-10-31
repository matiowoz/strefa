import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PointerEvent, ReactNode } from 'react';
import type { GameState, InventoryEntry } from '../domain/types';
import { getItem } from '../domain/catalog';
import { fits, gridSize, itemSizes } from '../domain/inventory';
import { ItemPopover } from './ItemPopover';
import { ItemArt } from './ItemArt';
import { snapDrop } from './gridDrag';

type Props = { state: GameState; page: number; selectedId: string | null; disabled: boolean; select: (id: string) => void; place: (id: string, page: number, point: { x: number; y: number }) => void; moving: boolean; actions: (entry: InventoryEntry) => ReactNode };
type Drag = { entry: InventoryEntry; grab: { x: number; y: number }; start: { x: number; y: number }; width: number; height: number; active: boolean };
type Target = { page: number; point: { x: number; y: number }; valid: boolean; left: number; top: number };
function contents(entry: InventoryEntry) {
  return <><span className="bag-quantity">×{entry.quantity}</span><ItemArt itemId={entry.itemId} /></>;
}
export function InventoryGrid({ state, page, selectedId, disabled, select, place, moving, actions }: Props) {
  const size = gridSize(page);
  const popoverId = useId();
  const [hover, setHover] = useState<{ id: string; anchor: DOMRect } | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keep = () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  const close = () => { keep(); setHover(null); };
  const leave = () => { keep(); hideTimer.current = setTimeout(() => setHover(null), 250); };
  const open = (id: string, element: HTMLElement) => { keep(); if (!drag.current?.active) setHover({ id, anchor: element.getBoundingClientRect() }); };
  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);
  const drag = useRef<Drag | null>(null);
  const cleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanup.current?.(), []);
  const [preview, setPreview] = useState<{ drag: Drag; left: number; top: number; target: Target | null } | null>(null);
  const entries = (page === -1 ? state.inventory : state.stash).filter((entry) => state.positions[entry.id].page === page);
  function targetAt(x: number, y: number, current: Drag): Target | null {
    for (const grid of document.querySelectorAll<HTMLElement>('[data-bag-page]')) {
      const rect = grid.getBoundingClientRect();
      const clip = grid.parentElement!.getBoundingClientRect();
      if (x < clip.left || x > clip.right || y < clip.top || y > clip.bottom) continue;
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) continue;
      const cell = grid.querySelector('.bag-cell')!.getBoundingClientRect();
      const styles = getComputedStyle(grid);
      const point = snapDrop({ x, y }, { x: cell.left, y: cell.top }, current.grab, { x: cell.width + parseFloat(styles.columnGap), y: cell.height + parseFloat(styles.rowGap) });
      const destination = Number(grid.dataset.bagPage);
      return { page: destination, point, valid: fits([...state.inventory, ...state.stash], state.positions, current.entry, { ...point, page: destination }), left: cell.left + point.x * (cell.width + parseFloat(styles.columnGap)), top: cell.top + point.y * (cell.height + parseFloat(styles.rowGap)) };
    }
    return null;
  }
  function begin(event: PointerEvent<HTMLButtonElement>, entry: InventoryEntry) {
    if (disabled || !event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    close();
    cleanup.current?.();
    const rect = event.currentTarget.getBoundingClientRect();
    drag.current = { entry, grab: { x: rect.width / 2, y: rect.height / 2 }, start: { x: event.clientX, y: event.clientY }, width: rect.width, height: rect.height, active: false };
    const pointerId = event.pointerId;
    const onMove = (e: globalThis.PointerEvent) => { if (e.pointerId === pointerId) move(e); };
    const onUp = (e: globalThis.PointerEvent) => { if (e.pointerId === pointerId) finish(e); };
    const cancel = () => { drag.current = null; setPreview(null); cleanup.current?.(); };
    const onCancel = (e: globalThis.PointerEvent) => {
      if (e.pointerId === pointerId) cancel();
    };
    window.addEventListener('pointermove', onMove, { passive: false, capture: true });
    window.addEventListener('pointerup', onUp, true);
    window.addEventListener('pointercancel', onCancel, true);
    window.addEventListener('blur', cancel);
    cleanup.current = () => {
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onCancel, true);
      window.removeEventListener('blur', cancel);
      cleanup.current = null;
    };
    select(entry.id);
  }
  function move(event: Pick<globalThis.PointerEvent, 'clientX' | 'clientY' | 'preventDefault'>) {
    const current = drag.current;
    if (!current) return;
    if (!current.active && Math.hypot(event.clientX - current.start.x, event.clientY - current.start.y) < 5) return;
    current.active = true;
    event.preventDefault();
    setPreview({ drag: current, left: event.clientX - current.grab.x, top: event.clientY - current.grab.y, target: targetAt(event.clientX, event.clientY, current) });
  }
  function finish(event: Pick<globalThis.PointerEvent, 'clientX' | 'clientY'>) {
    const current = drag.current;
    drag.current = null; setPreview(null); cleanup.current?.();
    if (current?.active && !disabled) {
      const target = targetAt(event.clientX, event.clientY, current);
      if (target?.valid) place(current.entry.id, target.page, target.point);
    }
  }
  return <div className="container-scroll"><div data-bag-page={page} className={`bag-grid ${page === -1 ? 'carried-grid' : 'hideout-grid'}`} style={{ gridTemplateColumns: `repeat(${size.columns}, var(--bag-cell-size))`, gridTemplateRows: `repeat(${size.rows}, var(--bag-cell-size))` }} role="group" aria-label={page === -1 ? 'Ekwipunek 5 na 9' : 'Schowek 8 na 9'}>
    {Array.from({ length: size.columns * size.rows }, (_, index) => {
      const point = { x: index % size.columns, y: Math.floor(index / size.columns) };
      return <button className="bag-cell" key={`cell-${index}`} style={{ gridColumn: point.x + 1, gridRow: point.y + 1 }} disabled={disabled || !moving || !selectedId} aria-label={`Umieść wybrany przedmiot: kolumna ${point.x + 1}, rząd ${point.y + 1}`} onClick={() => { if (selectedId) place(selectedId, page, point); }} />;
    })}
    {entries.map((entry) => {
      const position = state.positions[entry.id]; const dimensions = itemSizes[entry.itemId];
      return <button key={entry.id} className={`bag-item ${selectedId === entry.id ? 'is-selected' : ''} ${preview?.drag.entry.id === entry.id ? 'drag-origin' : ''}`} style={{ gridColumn: `${position.x + 1} / span ${dimensions.width}`, gridRow: `${position.y + 1} / span ${dimensions.height}` }} aria-label={`${getItem(entry.itemId)?.name}, ilość ${entry.quantity}, rozmiar ${dimensions.width} na ${dimensions.height}`} aria-pressed={selectedId === entry.id} aria-controls={hover?.id === entry.id ? popoverId : undefined} aria-expanded={hover?.id === entry.id} onPointerEnter={(event) => { if (event.pointerType !== 'touch') open(entry.id, event.currentTarget); }} onPointerLeave={leave} onFocus={(event) => open(entry.id, event.currentTarget)} onBlur={leave} aria-disabled={disabled || state.activeExpedition?.cargo.equipmentId === entry.id} onPointerDown={(event) => { if (state.activeExpedition?.cargo.equipmentId !== entry.id) begin(event, entry); }} onClick={(event) => { select(entry.id); open(entry.id, event.currentTarget); }}>
        {contents(entry)}
      </button>;
    })}
  </div>{hover && !preview && entries.some((entry) => entry.id === hover.id) && <ItemPopover id={popoverId} entry={entries.find((entry) => entry.id === hover.id)!} anchor={hover.anchor} keep={keep} leave={leave} close={close}>{actions(entries.find((entry) => entry.id === hover.id)!)}</ItemPopover>}{preview && createPortal(<div className="bag-drag-layer" aria-hidden="true">{preview.target && <div className={`bag-drop-preview ${preview.target.valid ? 'valid' : 'invalid'}`} style={{ left: preview.target.left, top: preview.target.top, width: preview.drag.width, height: preview.drag.height }} />}<div className="bag-item bag-drag-preview" style={{ left: preview.left, top: preview.top, width: preview.drag.width, height: preview.drag.height }}>{contents(preview.drag.entry)}</div></div>, document.body)}</div>;
}
