import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties, PointerEvent } from 'react';
import { getItem } from '../domain/catalog';
import { canMergeStacks, fits, itemSizes } from '../domain/inventory';
import { equipItem, equipmentSlots, unequipItem, wornItems } from '../domain/equipment';
import type { EquipmentSlot, GameState, InventoryEntry } from '../domain/types';
import { snapDrop } from './gridDrag';
import { ItemArt } from './ItemArt';

type Drag = { entry: InventoryEntry; start: { x: number; y: number }; width: number; height: number; artWidth: number; artHeight: number; active: boolean };
type Box = { left: number; top: number; width: number; height: number };
type Target = Box & { valid: boolean } & ({ kind: 'slot'; slot: EquipmentSlot } | { kind: 'grid'; page: number; point: { x: number; y: number }; mergeId?: string });
type Props = { state: GameState; disabled: boolean; select: (id: string) => void; place: (id: string, page: number, point: { x: number; y: number }) => void; merge: (source: string, target: string) => void; equip: (id: string, slot: EquipmentSlot) => void };

export function useInventoryDrag({ state, disabled, select, place, merge, equip }: Props) {
  const drag = useRef<Drag | null>(null);
  const cleanup = useRef<(() => void) | null>(null);
  const [preview, setPreview] = useState<{ drag: Drag; left: number; top: number; target: Target | null } | null>(null);
  useEffect(() => () => cleanup.current?.(), []);
  function targetAt(x: number, y: number, current: Drag): Target | null {
    for (const element of document.querySelectorAll<HTMLElement>('[data-equipment-slot]')) {
      const box = element.getBoundingClientRect();
      if (x < box.left || x > box.right || y < box.top || y > box.bottom) continue;
      const slot = element.dataset.equipmentSlot as EquipmentSlot;
      return { kind: 'slot', slot, ...box.toJSON(), valid: equipmentSlots.includes(slot) && equipItem(state, current.entry.id, slot) !== state };
    }
    for (const grid of document.querySelectorAll<HTMLElement>('[data-bag-page]')) {
      const rect = grid.getBoundingClientRect(), clip = grid.parentElement!.getBoundingClientRect();
      if (x < clip.left || x > clip.right || y < clip.top || y > clip.bottom || x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) continue;
      const page = Number(grid.dataset.bagPage);
      for (const element of grid.querySelectorAll<HTMLElement>('[data-item-id]')) {
        const box = element.getBoundingClientRect();
        if (x < box.left || x > box.right || y < box.top || y > box.bottom) continue;
        const candidate = [...state.inventory, ...state.stash].find((entry) => entry.id === element.dataset.itemId);
        if (candidate && canMergeStacks(current.entry, candidate)) return { kind: 'grid', page, point: state.positions[candidate.id], valid: true, mergeId: candidate.id, ...box.toJSON() };
      }
      const cell = grid.querySelector('.bag-cell')!.getBoundingClientRect(), styles = getComputedStyle(grid);
      const pitch = { x: cell.width + parseFloat(styles.columnGap), y: cell.height + parseFloat(styles.rowGap) };
      const size = itemSizes[current.entry.itemId];
      const width = size.width * pitch.x - parseFloat(styles.columnGap), height = size.height * pitch.y - parseFloat(styles.rowGap);
      const point = snapDrop({ x, y }, { x: cell.left, y: cell.top }, { x: width / 2, y: height / 2 }, pitch);
      const worn = wornItems(state).some((entry) => entry.id === current.entry.id);
      const valid = worn ? page === -1 && unequipItem(state, current.entry.id, point) !== state : fits([...state.inventory, ...state.stash], state.positions, current.entry, { ...point, page });
      return { kind: 'grid', page, point, valid, left: cell.left + point.x * pitch.x, top: cell.top + point.y * pitch.y, width, height };
    }
    return null;
  }
  function begin(event: PointerEvent<HTMLElement>, entry: InventoryEntry) {
    if (disabled || !event.isPrimary || event.button !== 0 || state.activeExpedition?.cargo.equipmentId === entry.id) return;
    event.preventDefault(); cleanup.current?.();
    const rect = event.currentTarget.getBoundingClientRect();
    const art = event.currentTarget.querySelector('.item-art')!.getBoundingClientRect();
    drag.current = { entry, start: { x: event.clientX, y: event.clientY }, width: rect.width, height: rect.height, artWidth: art.width, artHeight: art.height, active: false };
    const pointerId = event.pointerId;
    const cancel = () => { drag.current = null; setPreview(null); cleanup.current?.(); };
    const move = (e: globalThis.PointerEvent) => {
      const current = drag.current;
      if (!current || e.pointerId !== pointerId) return;
      if (!current.active && Math.hypot(e.clientX - current.start.x, e.clientY - current.start.y) < 5) return;
      current.active = true; e.preventDefault();
      setPreview({ drag: current, left: e.clientX - current.width / 2, top: e.clientY - current.height / 2, target: targetAt(e.clientX, e.clientY, current) });
    };
    const finish = (e: globalThis.PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const current = drag.current; cancel();
      if (!current?.active || disabled) return;
      const target = targetAt(e.clientX, e.clientY, current);
      if (!target?.valid) return;
      if (target.kind === 'slot') equip(current.entry.id, target.slot);
      else if (target.mergeId) merge(current.entry.id, target.mergeId);
      else place(current.entry.id, target.page, target.point);
    };
    const onCancel = (e: globalThis.PointerEvent) => { if (e.pointerId === pointerId) cancel(); };
    window.addEventListener('pointermove', move, { passive: false, capture: true });
    window.addEventListener('pointerup', finish, true); window.addEventListener('pointercancel', onCancel, true); window.addEventListener('blur', cancel);
    cleanup.current = () => { window.removeEventListener('pointermove', move, true); window.removeEventListener('pointerup', finish, true); window.removeEventListener('pointercancel', onCancel, true); window.removeEventListener('blur', cancel); cleanup.current = null; };
    select(entry.id);
  }
  const target = preview?.target;
  const layer = preview ? createPortal(<div className="bag-drag-layer" aria-hidden="true">{target && <div className={`bag-drop-preview ${target.valid ? 'valid' : 'invalid'} ${target.kind === 'slot' ? 'equip' : target.mergeId ? 'merge' : ''}`} style={{ left: target.left, top: target.top, width: target.width, height: target.height }} />}
    <div className="bag-item bag-drag-preview" style={{ left: preview.left, top: preview.top, width: preview.drag.width, height: preview.drag.height, '--drag-art-width': `${preview.drag.artWidth}px`, '--drag-art-height': `${preview.drag.artHeight}px` } as CSSProperties}>{getItem(preview.drag.entry.itemId)?.category !== 'equipment' && <span className="bag-quantity">×{preview.drag.entry.quantity}</span>}<ItemArt itemId={preview.drag.entry.itemId} /></div>
  </div>, document.body) : null;
  return { begin, active: !!preview, draggingId: preview?.drag.entry.id, layer };
}
export type InventoryDrag = ReturnType<typeof useInventoryDrag>;
