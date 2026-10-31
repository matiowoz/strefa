import { useEffect, useState } from 'react';
import { getItem } from '../domain/catalog';
import { inventoryWeight } from '../domain/game';
import { atShelter, itemSizes, moveItem } from '../domain/inventory';
import { craft, prepareExpedition, quantity, recipes } from '../domain/preparation';
import type { GameState } from '../domain/types';
import { ItemArt } from './ItemArt';
import { InventoryGrid } from './InventoryGrid';
import './inventory.css';
import './inventory-grid.css';

type Props = { state: GameState; saving: boolean; update: (change: (state: GameState) => GameState) => Promise<boolean> };
export function InventoryScreen({ state, update, saving }: Props) {
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
  const selected = [...state.inventory, ...state.stash, ...state.overflow].find((entry) => entry.id === selectedId);
  const item = selected && getItem(selected.itemId);
  const home = atShelter(state, now);
  const disabled = saving || !home;
  const carried = selected && state.inventory.some((entry) => entry.id === selected.id);
  function place(id: string, target: number, point?: { x: number; y: number }) {
    setNotice(''); void update((previous) => moveItem(previous, id, target, point)).then((ok) => { if (ok) { setMoving(false); setNotice('Przedmiot przeniesiony i zapisany.'); } });
  }
  return <div className="inventory-workbench">
    <div className="inventory-intro"><div><span className="eyebrow">To, co niesiesz. To, co zostawiasz.</span><p>Ekwipunek i schowek</p></div><span className="pack-weight">Przy postaci <strong>{inventoryWeight(state).toLocaleString('pl-PL', { maximumFractionDigits: 1 })} <small>kg</small></strong></span></div>
    {!home && <p className="storage-warning">Postać jest na wyprawie. Przenoszenie przedmiotów będzie możliwe po powrocie do kryjówki.</p>}
    <div className="storage-columns">
      <section className="stash-panel"><div className="stash-heading"><h2>Ekwipunek postaci</h2><span>5 × 9</span></div><p className="stash-note">Zapasy na wyprawę są pobierane tylko stąd.</p><InventoryGrid state={state} page={-1} selectedId={selectedId} disabled={disabled} select={setSelectedId} place={place} moving={moving} /></section>
      <section className="stash-panel"><div className="stash-heading"><h2>Schowek w kryjówce</h2><span>10 × 10</span></div><p className="stash-note">Jeden schowek. Kolejne skrytki będzie można budować w przyszłości.</p><InventoryGrid state={state} page={page} selectedId={selectedId} disabled={disabled} select={setSelectedId} place={place} moving={moving} /></section>
    </div>
    <p className="stash-note">Przeciągnij przedmiot na puste pole lub wybierz go, kliknij „Zmień położenie” i wskaż pole. Na telefonie schowek można przewijać poziomo. Ilości pozostają stosami; rozmiar dotyczy całego stosu.</p>
    <p className="inventory-notice" role="status">{notice}</p>
    <section id="item-details" className="stash-panel storage-details" aria-label="Szczegóły przedmiotu">{selected && item ? <><div className="detail-top"><div className="detail-art"><ItemArt itemId={item.id} /></div><div><span className="eyebrow">{carried ? 'Przy postaci' : state.stash.some((entry) => entry.id === selected.id) ? 'Schowek' : 'Odbiór'}</span><h3>{item.name}</h3><p>{item.description}</p></div></div>
      <dl><div><dt>Ilość</dt><dd>{selected.quantity}</dd></div><div><dt>Rozmiar</dt><dd>{itemSizes[item.id].width} × {itemSizes[item.id].height}</dd></div><div><dt>Masa sztuki</dt><dd>{item.weightKg} kg</dd></div>{selected.condition !== null && <div><dt>Stan</dt><dd>{selected.condition}%</dd></div>}</dl>
      <div className="storage-actions"><button disabled={disabled} onClick={() => place(selected.id, carried ? page : -1)}>{carried ? 'Do schowka' : 'Do ekwipunku'}</button>{!carried && <button disabled={disabled} onClick={() => place(selected.id, page)}>Do schowka</button>}<button disabled={disabled} aria-pressed={moving} onClick={() => setMoving(!moving)}>{moving ? 'Anuluj przenoszenie' : 'Zmień położenie'}</button>
      {item.category === 'equipment' && carried && <button disabled={saving || !!state.activeExpedition || selected.condition === 0} onClick={() => { void update((previous) => prepareExpedition(previous, { ...previous.preparation, equipmentId: previous.preparation.equipmentId === selected.id ? null : selected.id })); }}>{state.preparation.equipmentId === selected.id ? 'Odłóż plecak' : 'Wybierz na wyprawę'}</button>}</div>{moving && <p>Wskaż puste pole w wybranej siatce. Nakładające się lub wystające przedmioty nie zostaną przeniesione.</p>}
    </> : <p>Wybierz przedmiot w siatce, aby przenieść go lub zobaczyć szczegóły.</p>}</section>
    {state.overflow.length > 0 && <section className="stash-panel storage-recovery"><h2>Przedmioty do odebrania</h2><p>Nie zmieściły się w siatkach. Są bezpieczne — zwolnij miejsce i przenieś je do ekwipunku lub schowka. Nie są to dodatkowe pola użytkowe.</p>{state.overflow.map((entry) => <button key={entry.id} onClick={() => setSelectedId(entry.id)}>{getItem(entry.itemId)?.name} ×{entry.quantity}</button>)}</section>}
    <section className="inventory-crafting"><div className="crafting-heading"><h2>Przygotowanie zapasów</h2><p>Surowce muszą być w ekwipunku postaci. Wynik bez miejsca trafi do schowka lub odbioru.</p></div><div className="crafting-grid">{recipes.map((recipe) => {
      const available = recipe.costs.every((cost) => quantity(state.inventory, cost.itemId) >= cost.quantity);
      return <article className="recipe-card" key={recipe.id}><div className="recipe-title"><ItemArt itemId={recipe.output[0].itemId} /><h3>{recipe.name}</h3></div><p>Koszt: {recipe.costs.map((cost) => `${getItem(cost.itemId)?.name} ×${cost.quantity}`).join(', ')}</p><p>Wynik: {recipe.output.map((entry) => `${getItem(entry.itemId)?.name} ×${entry.quantity}`).join(', ')} · natychmiast</p><button disabled={saving || !home || !available} onClick={() => { void update((previous) => craft(previous, recipe.id)); }}>{available ? recipe.name : 'Brak surowców w ekwipunku'}</button></article>;
    })}</div></section>
  </div>;
}
