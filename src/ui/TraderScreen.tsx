import { useState } from 'react';
import { getItem } from '../domain/catalog';
import { atShelter } from '../domain/inventory';
import { tradeGoods, tradeItem, tradeQuote, tradeValue } from '../domain/trade';
import type { GameState } from '../domain/types';
import { ResourceIcons } from './ResourceIcons';
import { useNow } from './useNow';
import './trader.css';

type Props = { state: GameState; saving: boolean; update: (change: (state: GameState) => GameState) => Promise<boolean>; navigate: (screen: 'shelter' | 'inventory' | 'storage') => void };
export function TraderScreen({ state, saving, update, navigate }: Props) {
  const entries = state.inventory.filter((entry) => tradeValue(entry) > 0);
  const [selectedId, setSelectedId] = useState('');
  const [amount, setAmount] = useState('1');
  const [notice, setNotice] = useState('');
  const now = useNow(!!state.activeExpedition);
  const selected = entries.find((entry) => entry.id === selectedId) ?? entries[0];
  const count = Number(amount);
  const home = atShelter(state, now);
  return <div className="trader-page">
    <section className="trader-intro"><span className="eyebrow">Barter przy kryjówce</span><h2>Wędrowny handlarz</h2><p>„Masz coś na wymianę? Zapasy nie są za darmo.”</p><p>Przyjmuje rzeczy z plecaka. Założone wyposażenie i podstawowy plecak zostają przy Tobie. Przedmioty ze skrytki najpierw przenieś do ekwipunku.</p><div className="trader-actions"><button onClick={() => navigate('shelter')}>Wróć do kryjówki</button><button onClick={() => navigate('storage')}>Otwórz skrytkę</button></div></section>
    <section className="trader-panel"><h2>Co oddajesz?</h2>{entries.length ? <><label htmlFor="trade-item">Przedmiot z plecaka</label><select id="trade-item" value={selected?.id ?? ''} disabled={saving} onChange={(event) => { setSelectedId(event.target.value); setAmount('1'); setNotice(''); }}>{entries.map((entry) => <option value={entry.id} key={entry.id}>{getItem(entry.itemId)!.name} ×{entry.quantity}{entry.condition !== null ? ` · stan ${entry.condition}%` : ''}</option>)}</select><label htmlFor="trade-amount">Liczba sztuk</label><input id="trade-amount" type="number" min="1" max={selected?.quantity} step="1" value={amount} disabled={saving} onChange={(event) => { setAmount(event.target.value); setNotice(''); }} />{selected && Number.isSafeInteger(count) && count > 0 && <ResourceIcons items={[{ itemId: selected.itemId, quantity: count }]} label="Oddawane przedmioty" />}</> : <p>Nie masz w plecaku przedmiotów, które handlarz może przyjąć.</p>}</section>
    {!home && <p role="status">Wymiana będzie dostępna po powrocie z wyprawy.</p>}
    <p role="status">{notice}</p>
    <div className="trader-offers">{tradeGoods.map((good) => {
      const output = selected ? tradeQuote(state, selected.id, count, good) : 0;
      const stock = state.trader.stock[good];
      return <article className="trader-panel" key={good}><h3>{getItem(good)!.name}</h3><p>U handlarza: {stock} szt.</p><ResourceIcons items={[{ itemId: good, quantity: output || 1 }]} label={output ? 'Otrzymasz za wybrane przedmioty' : 'Towar handlarza'} />{output ? <p>Oddajesz {count} × {getItem(selected!.itemId)!.name}. Otrzymujesz {output} szt.</p> : <p>Wybierz większą ilość lub cenniejszy przedmiot.</p>}{output > stock && <p>Handlarz nie ma tylu sztuk. Zmniejsz ilość wymiany.</p>}<button disabled={saving || !home || !output || output > stock} onClick={() => { if (!selected) return; void update((previous) => tradeItem(previous, selected.id, count, good)).then((ok) => { if (ok) setNotice(`Wymiana zapisana. Otrzymano: ${getItem(good)!.name} ×${output}. Sprawdź plecak, skrytkę lub odbiór nadmiaru.`); }); }}>{stock === 0 ? 'Brak towaru' : `Wymień na ${output || '…'} szt.`}</button></article>;
    })}</div><p className="trader-note">Oferta dotyczy całej wybranej ilości. Barter bez wydawania reszty. Zapas handlarza jest ograniczony.</p>
  </div>;
}
