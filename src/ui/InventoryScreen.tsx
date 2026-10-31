import { useState } from 'react';
import { getItem } from '../domain/catalog';
import { inventoryWeight } from '../domain/game';
import { craft, prepareExpedition, quantity, recipes } from '../domain/preparation';
import type { GameState, ItemCategory, ResourceAmount } from '../domain/types';
import { ItemArt } from './ItemArt';
import './inventory.css';

type Props = { state: GameState; saving: boolean; update: (change: (state: GameState) => GameState) => Promise<boolean> };
const categories: Record<ItemCategory, string> = { equipment: 'Wyposażenie', supply: 'Zapasy', material: 'Materiały' };
const filters = [{ id: 'all', name: 'Wszystko' }, ...Object.entries(categories).map(([id, name]) => ({ id, name }))];
const formatWeight = (weight: number) => weight.toLocaleString('pl-PL', { maximumFractionDigits: 1 });
function Amounts({ values }: { values: readonly ResourceAmount[] }) {
  return <>{values.map((value) => `${getItem(value.itemId)?.name} ×${value.quantity}`).join(', ')}</>;
}

export function InventoryScreen({ state, update, saving }: Props) {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const visible = state.inventory.filter((entry) => filter === 'all' || getItem(entry.itemId)?.category === filter);
  const selected = visible.find((entry) => entry.id === selectedId) ?? visible[0];
  const item = selected && getItem(selected.itemId);
  const chosenId = state.activeExpedition ? state.activeExpedition.cargo.equipmentId : state.preparation.equipmentId;
  const backpack = state.inventory.find((entry) => entry.id === chosenId);
  const reserved = !!selected && state.activeExpedition?.cargo.equipmentId === selected.id;
  const chosen = !!selected && state.preparation.equipmentId === selected.id;
  const status = state.activeExpedition ? 'Na wyprawie' : 'W kryjówce';

  return <div className="inventory-workbench">
    <div className="inventory-intro"><div><span className="eyebrow">Przygotuj się na to, co za drzwiami</span><p>Każda rzecz ma swoje miejsce.</p></div><span className="pack-weight">Masa zapasów <strong>{formatWeight(inventoryWeight(state))} <small>kg</small></strong></span></div>
    <div className="inventory-layout">
      <section className="survivor-panel" aria-labelledby="survivor-heading">
          <div className="survivor-name"><span className="eyebrow">Twój ocalały / poziom {state.hero.level}</span><h2 id="survivor-heading">{state.hero.name}</h2><span className="survivor-status"><i />{status}</span></div>
        <div className="survivor-art"><img src="/art/survivor.png" alt="Ilustracja ocalałego w oliwkowym płaszczu, stojącego w świetle lampy w schronieniu." width="1024" height="1536" />

          <div className="future-slots" aria-label="Planowane miejsca wyposażenia"><span>Głowa <small>Wkrótce</small></span><span>Tułów <small>Wkrótce</small></span><span>Obuwie <small>Wkrótce</small></span></div>
          <span className="portrait-caption">Ilustracja poglądowa</span>
        </div>
        <div className="equipment-slot"><div className="slot-art"><ItemArt itemId="backpack" /></div><div><span className="eyebrow">Plecak na wyprawę</span><strong>{backpack ? getItem(backpack.itemId)?.name : 'Nie wybrano plecaka'}</strong><small>{state.activeExpedition && backpack ? 'Zarezerwowany do powrotu' : 'Wybierz plecak z magazynu'}</small></div></div>
        <div className="hero-health"><span>Zdrowie <b>{state.hero.health} / {state.hero.maxHealth}</b></span><progress aria-label="Zdrowie bohatera" value={state.hero.health} max={state.hero.maxHealth} /></div>
      </section>

      <section className="stash-panel" aria-labelledby="stash-heading">
        <div className="stash-heading"><div><span className="eyebrow">Twoja kryjówka</span><h2 id="stash-heading">Magazyn</h2></div><span>{state.inventory.length} stosów</span></div>
        <div className="inventory-filters" role="group" aria-label="Filtr przedmiotów">{filters.map((category) => <button key={category.id} aria-pressed={category.id === filter} onClick={() => { setFilter(category.id); setSelectedId(null); }}>{category.name}</button>)}</div>
        <ul className="stash-grid" aria-label="Przedmioty w magazynie">{visible.map((entry) => {
          const definition = getItem(entry.itemId)!;
          const locked = state.activeExpedition?.cargo.equipmentId === entry.id;
          return <li key={entry.id}><button className={`item-tile ${selected?.id === entry.id ? 'is-selected' : ''}`} aria-pressed={selected?.id === entry.id} aria-controls="item-details" onClick={() => setSelectedId(entry.id)}>
            <span className="tile-quantity">×{entry.quantity}</span><ItemArt itemId={entry.itemId} /><span className="tile-name">{definition.name}</span>
            {entry.condition !== null && <span className="condition-line" aria-label={`Stan ${entry.condition}%`}><span style={{ width: `${entry.condition}%` }} /></span>}
            {locked && <span className="tile-label">Na wyprawie</span>}
          </button></li>;
        })}</ul>
        {visible.length === 0 && <div className="stash-empty"><span aria-hidden="true">◇</span><h3>Jeszcze tu pusto</h3><p>Przedmioty z tej kategorii pojawią się po zdobyciu ich na wyprawie.</p></div>}
        <p className="stash-note">Wybierz przedmiot, aby zobaczyć szczegóły. Zapasy pobrane na wyprawę są już odjęte z magazynu.</p>
        <section id="item-details" className="item-details" aria-label="Szczegóły przedmiotu">
          {selected && item ? <><div className="detail-top"><div className="detail-art"><ItemArt itemId={selected.itemId} /></div><div><span className="eyebrow">{categories[item.category]}</span><h3>{item.name}</h3><p>{item.description}</p></div></div>
            <dl><div><dt>Ilość</dt><dd>{selected.quantity}</dd></div><div><dt>Masa sztuki</dt><dd>{formatWeight(item.weightKg)} kg</dd></div><div><dt>Łącznie</dt><dd>{formatWeight(item.weightKg * selected.quantity)} kg</dd></div>{selected.condition !== null && <div><dt>Stan</dt><dd>{selected.condition}%</dd></div>}</dl>
            {item.category === 'equipment' ? <><button className="inventory-action" disabled={saving || !!state.activeExpedition || selected.condition === 0} onClick={() => {
              const equipmentId = chosen ? null : selected.id;
              setNotice(''); void update((previous) => prepareExpedition(previous, { ...previous.preparation, equipmentId })).then((ok) => { if (ok) setNotice(equipmentId ? 'Plecak wybrany na następną wyprawę.' : 'Plecak odłożony do magazynu.'); });
            }}>{reserved ? 'Zarezerwowany na wyprawę' : chosen ? 'Odłóż plecak' : 'Wybierz na wyprawę'}</button><p className="detail-help">{state.activeExpedition ? 'Zmiana wyposażenia będzie dostępna po odebraniu raportu.' : selected.condition === 0 ? 'Ten egzemplarz jest niesprawny.' : 'Plecak wraca bez uszkodzeń. Premia do udźwigu nie jest jeszcze dostępna.'}</p></>
              : <p className="detail-help">{item.category === 'material' ? 'Surowiec do przygotowania zapasów w warsztacie poniżej.' : selected.itemId === 'bandage' ? 'Leczenie będzie dostępne w kolejnych etapach.' : 'Zestaw wody i racji wybierzesz na ekranie Wyprawy.'}</p>}
          </> : <p>Wybierz kategorię z przedmiotami, aby zobaczyć ich szczegóły.</p>}
        </section>
      </section>
    </div>
    <section className="inventory-crafting" aria-labelledby="crafting-heading"><div className="crafting-heading"><div><span className="eyebrow">Chwila przed drogą</span><h2 id="crafting-heading">Przygotowanie zapasów</h2></div><p>Proste receptury. Pewny rezultat.</p></div>
      <div className="crafting-grid">{recipes.map((recipe) => {
        const available = recipe.costs.every((cost) => quantity(state.inventory, cost.itemId) >= cost.quantity);
        return <article className="recipe-card" key={recipe.id}><div className="recipe-title"><ItemArt itemId={recipe.output[0].itemId} /><h3>{recipe.name}</h3></div>
          <p>Koszt: <Amounts values={recipe.costs} /></p><p className="recipe-stock">Masz: {recipe.costs.map((cost) => `${quantity(state.inventory, cost.itemId)} × ${getItem(cost.itemId)?.name}`).join(', ')}</p>
          <div className="recipe-result"><Amounts values={recipe.output} /><small>Natychmiast</small></div>
          <button disabled={saving || !available} onClick={() => { setNotice(''); void update((previous) => craft(previous, recipe.id)).then((ok) => { if (ok) setNotice(`${recipe.name}: wykonano i zapisano.`); }); }}>{available ? recipe.name : 'Brak surowców'}</button>
        </article>;
      })}</div>
      <p className="inventory-notice" role="status">{notice}</p>
    </section>
  </div>;
}
