import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getItem } from '../domain/catalog';
import type { InventoryEntry } from '../domain/types';

type Props = { entry: InventoryEntry; disabled: boolean; close: () => void; submit: (amount: number) => void };
export function SplitStackDialog({ entry, disabled, close, submit }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const headingId = useId();
  const inputId = useId();
  const [value, setValue] = useState(String(Math.floor(entry.quantity / 2)));
  const amount = Number(value);
  const valid = Number.isSafeInteger(amount) && amount >= 1 && amount < entry.quantity;
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    input.current?.focus(); input.current?.select();
    return () => element.close();
  }, []);
  return createPortal(<dialog ref={dialog} className="split-stack-dialog" aria-labelledby={headingId} onCancel={(event) => { event.preventDefault(); if (!disabled) close(); }}>
    <form onSubmit={(event) => { event.preventDefault(); if (valid && !disabled) submit(amount); }}>
      <h2 id={headingId}>Rozdziel stos</h2><p>{getItem(entry.itemId)?.name} · {entry.quantity} szt.</p>
      <label htmlFor={inputId}>Liczba sztuk do oddzielenia</label>
      <input ref={input} id={inputId} type="number" inputMode="numeric" min={1} max={entry.quantity - 1} step={1} required value={value} disabled={disabled} onChange={(event) => setValue(event.target.value)} />
      <p>{valid ? `Oddzielisz ${amount} szt. W obecnym stosie zostanie ${entry.quantity - amount} szt.` : `Wpisz liczbę całkowitą od 1 do ${entry.quantity - 1}.`}</p>
      <p className="stash-note">Nowy stos zajmie wolne miejsce w tej samej siatce.</p>
      <div className="storage-actions"><button type="submit" disabled={disabled || !valid}>Rozdziel</button><button type="button" disabled={disabled} onClick={close}>Anuluj</button></div>
    </form>
  </dialog>, document.body);
}
