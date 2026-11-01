import { useEffect, useState } from 'react';
import { getItem } from '../domain/catalog';
import { equipItem, equipmentSlot, unequipItem, wornItems } from '../domain/equipment';
import { useInventoryDrag } from './useInventoryDrag';
import { inventoryWeight } from '../domain/game';
import { consumableIds, useItem } from '../domain/useItem';
import { atShelter, itemSizes, mergeStacks, splitStack, tryMoveItem } from '../domain/inventory';
import { craft, quantity, recipes } from '../domain/preparation';
import type { EquipmentSlot, GameState, InventoryEntry } from '../domain/types';
import { EquipmentDoll } from './EquipmentDoll';
import { ItemArt } from './ItemArt';
import { SplitStackDialog } from './SplitStackDialog';
import { InventoryGrid } from './InventoryGrid';
import './inventory.css';
import './inventory-grid.css';

type Props = { state: GameState; saving: boolean; storage: boolean; update: (change: (state: GameState) => GameState) => Promise<boolean> };
export function InventoryScreen({ state, update, saving, storage }: Props) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!state.activeExpedition) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [state.activeExpedition]);
  const page = 0;
  const [selectedId, setSelectedId] = useState<string | null>(state.inventory[0]?.id ?? null);
  const [moving, setMoving] = useState(false);
  const [notice, setNotice] = useState('');
  const [splitId, setSplitId] = useState<string | null>(null);
  const splitEntry = [...state.inventory, ...state.stash].find((entry) => entry.id === splitId);
  const selected = [...state.inventory, ...state.stash, ...state.overflow].find((entry) => entry.id === selectedId);
  const item = selected && getItem(selected.itemId);
  const home = atShelter(state, now);
  const disabled = saving || !home;
  const carried = selected && state.inventory.some((entry) => entry.id === selected.id);
  function place(id: string, target: number, point?: { x: number; y: number }) {
    setNotice(''); let moved = false; void update((previous) => { const next = wornItems(previous).some((entry) => entry.id === id) ? target === -1 ? unequipItem(previous, id, point) : previous : tryMoveItem(previous, id, target, point); moved = next !== previous; return next; }).then((ok) => { if (ok && moved) { setMoving(false); setNotice('Przedmiot przeniesiony i zapisany.'); } });
  }
  function equip(id: string, slot: EquipmentSlot) {
    let changed = false; setNotice('');
    void update((previous) => { const next = equipItem(previous, id, slot); changed = next !== previous; return next; }).then((ok) => {
      if (ok && changed) { setSelectedId(null); setMoving(false); setNotice('Wyposażenie założone i zapisane.'); }
    });
  }
  function unequip(id: string) {
    let changed = false; setNotice('');
    void update((previous) => { const next = unequipItem(previous, id); changed = next !== previous; return next; }).then((ok) => {
      if (ok && changed) { setSelectedId(id); setMoving(false); setNotice('Przedmiot zdjęty do plecaka i zapisany.'); }
    });
  }
  function merge(sourceId: string, targetId: string) {
    setNotice(''); let changed = false;
    void update((previous) => {
      const next = mergeStacks(previous, sourceId, targetId);
      changed = next !== previous; return next;
    }).then((ok) => {
      if (ok && changed) { setSelectedId(targetId); setMoving(false); setNotice('Stosy połączone i zapisane.'); }
    });
  }
  function useThis(entry: InventoryEntry) {
    setNotice('');
    void update((previous) => useItem(previous, entry.id)).then((ok) => {
      if (ok) setNotice(entry.itemId === 'water' ? 'Wypito wodę.' : entry.itemId === 'ration' ? 'Zjedzono rację.' : 'Zużyto bandaż.');
    });
  }
  function openSplit(entry: InventoryEntry) {
    setMoving(false); setSelectedId(entry.id); setNotice(''); setSplitId(entry.id);
  }
  function divide(amount: number) {
    if (!splitEntry) return;
    let changed = false;
    void update((previous) => {
      const next = splitStack(previous, splitEntry.id, amount);
      changed = next !== previous; return next;
    }).then((ok) => {
      if (ok) { setSplitId(null); if (changed) setNotice('Stos rozdzielony i zapisany.'); }
    });
  }
  const drag = useInventoryDrag({ state, disabled, select: setSelectedId, place, merge, equip });
  function actions(entry: InventoryEntry) {
    const isCarried = state.inventory.some((item) => item.id === entry.id);
    const locked = disabled || state.activeExpedition?.cargo.equipmentId === entry.id;
    return <>
      {consumableIds.has(entry.itemId) && <button disabled={locked} title="Zużyj 1 sztukę; na razie bez zmiany statystyk" onClick={() => useThis(entry)}>Użyj</button>}
      {storage && isCarried && <button disabled={locked} onClick={() => place(entry.id, 0)}>Do skrytki</button>}
      {storage && !isCarried && <button disabled={locked} onClick={() => place(entry.id, -1)}>Do ekwipunku</button>}
      {isCarried && equipmentSlot(entry) && <button disabled={locked} onClick={() => equip(entry.id, equipmentSlot(entry)!)}>Załóż</button>}
      {entry.quantity > 1 && <button disabled={locked} onClick={() => openSplit(entry)}>Rozdziel</button>}
    </>;
  }
  const backpackCard = <section className="stash-panel equipped-backpack"><ItemArt itemId="backpack" /><div><span className="eyebrow">Założony na stałe</span><h2>{getItem(state.backpack.itemId)?.name}</h2><p>Podstawowy plecak · 5 × 9 pól. W przyszłości wymienisz go na większy.</p></div></section>;
  return <div className="inventory-workbench">
    {drag.layer}
    {splitEntry && <SplitStackDialog entry={splitEntry} disabled={disabled} close={() => setSplitId(null)} submit={divide} />}
    {storage && <div className="inventory-intro"><div><span className="eyebrow">To, co niesiesz. To, co zostawiasz.</span><p>Ekwipunek i skrytka</p></div><span className="pack-weight">Przy postaci <strong>{inventoryWeight(state).toLocaleString('pl-PL', { maximumFractionDigits: 1 })} <small>kg</small></strong></span></div>}
    {storage && backpackCard}
    {!home && <p className="storage-warning">Postać jest na wyprawie. Przenoszenie przedmiotów będzie możliwe po powrocie do kryjówki.</p>}
    <div className={storage ? 'storage-columns' : 'inventory-character-sheet'}>
      {!storage && <EquipmentDoll state={state} disabled={disabled} selectedId={selectedId} drag={drag} equip={equip} unequip={unequip} />}
      <section className="stash-panel" aria-label="Przedmioty w plecaku">{storage ? <><div className="stash-heading"><h2>Ekwipunek postaci</h2><span>5 × 9</span></div><p className="stash-note">Z tymi przedmiotami wyruszasz na wyprawę.</p></> : <div className="inventory-pack-top"><span aria-label="Pojemność plecaka: 5 na 9">5 × 9</span><span className="inventory-pack-weight" title="Masa zawartości plecaka">{inventoryWeight(state).toLocaleString('pl-PL', { maximumFractionDigits: 1 })} <small>kg</small></span></div>}<InventoryGrid state={state} page={-1} selectedId={selectedId} disabled={disabled} select={setSelectedId} place={place} moving={moving} drag={drag} actions={actions} /></section>
      {storage && <section className="stash-panel"><div className="stash-heading"><h2>Skrytka w kryjówce</h2><span>8 × 9</span></div><p className="stash-note">Jeden schowek. Kolejne skrytki będzie można budować w przyszłości.</p><InventoryGrid state={state} page={page} selectedId={selectedId} disabled={disabled} select={setSelectedId} place={place} moving={moving} drag={drag} actions={actions} /></section>}
    </div>
    <details className="inventory-help"><summary>Jak przenosić przedmioty</summary><p className="stash-note">Przeciągnij przedmiot na taki sam, aby połączyć stosy. Aby zmienić położenie, upuść go na puste pole lub wybierz go, kliknij „Zmień położenie” i wskaż pole. Na telefonie schowek można przewijać poziomo. Ilości pozostają stosami; rozmiar dotyczy całego stosu.</p></details>
    <p className="inventory-notice" role="status">{notice}</p>
    <details className="selected-item-details"><summary>Szczegóły i układanie zaznaczonego przedmiotu</summary><section id="item-details" className="stash-panel storage-details" aria-label="Szczegóły przedmiotu">{selected && item ? <><div className="detail-top"><div className="detail-art"><ItemArt itemId={item.id} /></div><div><span className="eyebrow">{carried ? 'Przy postaci' : state.stash.some((entry) => entry.id === selected.id) ? 'Schowek' : 'Odbiór'}</span><h3>{item.name}</h3><p>{item.description}</p></div></div>
      <dl><div><dt>Ilość</dt><dd>{selected.quantity}</dd></div><div><dt>Rozmiar</dt><dd>{itemSizes[item.id].width} × {itemSizes[item.id].height}</dd></div><div><dt>Masa sztuki</dt><dd>{item.weightKg} kg</dd></div>{selected.condition !== null && <div><dt>Stan</dt><dd>{selected.condition}%</dd></div>}</dl>
      <div className="storage-actions">{carried && equipmentSlot(selected) && <button disabled={disabled} onClick={() => equip(selected.id, equipmentSlot(selected)!)}>Załóż</button>}{selected.quantity > 1 && !state.overflow.some((entry) => entry.id === selected.id) && <button disabled={disabled} onClick={() => openSplit(selected)}>Rozdziel</button>}{consumableIds.has(selected.itemId) && <button disabled={disabled} onClick={() => useThis(selected)}>Użyj</button>}{storage && <button disabled={disabled || state.activeExpedition?.cargo.equipmentId === selected.id} onClick={() => place(selected.id, carried ? page : -1)}>{carried ? 'Do skrytki' : 'Do ekwipunku'}</button>}{storage && !carried && <button disabled={disabled || state.activeExpedition?.cargo.equipmentId === selected.id} onClick={() => place(selected.id, page)}>Do skrytki</button>}<button disabled={disabled || state.activeExpedition?.cargo.equipmentId === selected.id} aria-pressed={moving} onClick={() => setMoving(!moving)}>{moving ? 'Anuluj przenoszenie' : 'Zmień położenie'}</button>
      </div>{moving && <p>Wskaż puste pole w wybranej siatce.</p>}
    </> : <p>Wybierz przedmiot w siatce, aby przenieść go lub zobaczyć szczegóły.</p>}</section></details>
    {state.overflow.length > 0 && <section className="stash-panel storage-recovery"><h2>Przedmioty do odebrania</h2><p>Nie zmieściły się w siatkach. Są bezpieczne — zwolnij miejsce i przenieś je do ekwipunku lub schowka. Nie są to dodatkowe pola użytkowe.</p>{state.overflow.map((entry) => <button key={entry.id} onClick={() => setSelectedId(entry.id)}>{getItem(entry.itemId)?.name} ×{entry.quantity}</button>)}</section>}
    <section className="inventory-crafting"><div className="crafting-heading"><h2>Przygotowanie zapasów</h2><p>Surowce muszą być w ekwipunku postaci. Wynik bez miejsca trafi do schowka lub odbioru.</p></div><div className="crafting-grid">{recipes.filter((recipe) => recipe.id !== 'dressings' || state.progress.workbenchRepaired).map((recipe) => {
      const available = recipe.costs.every((cost) => quantity(state.inventory, cost.itemId) >= cost.quantity);
      return <article className="recipe-card" key={recipe.id}><div className="recipe-title"><ItemArt itemId={recipe.output[0].itemId} /><h3>{recipe.name}</h3></div><p>Koszt: {recipe.costs.map((cost) => `${getItem(cost.itemId)?.name} ×${cost.quantity}`).join(', ')}</p><p>Wynik: {recipe.output.map((entry) => `${getItem(entry.itemId)?.name} ×${entry.quantity}`).join(', ')} · natychmiast</p><button disabled={saving || !home || !available} onClick={() => { void update((previous) => craft(previous, recipe.id)); }}>{available ? recipe.name : 'Brak surowców w ekwipunku'}</button></article>;
    })}</div></section>
  </div>;
}
