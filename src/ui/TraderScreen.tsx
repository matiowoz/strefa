import { useState } from 'react';
import { getItem } from '../domain/catalog';
import { canVisitSettlement } from '../domain/settlement';
import { tradeGoods, tradeItem, tradeQuote, tradeValue } from '../domain/trade';
import type { GameState } from '../domain/types';
import { ResourceIcons } from './ResourceIcons';
import './trader.css';

type Props = { state: GameState; saving: boolean; update: (change: (state: GameState) => GameState) => Promise<boolean>; navigate: (screen: 'settlement' | 'inventory' | 'map') => void };
export function TraderScreen({ state, saving, update, navigate }: Props) {
  const entries = state.inventory.filter((entry) => tradeValue(entry) > 0);
  const [selectedId, setSelectedId] = useState('');
  const [amount, setAmount] = useState('1');
  const [notice, setNotice] = useState('');
  const selected = entries.find((entry) => entry.id === selectedId) ?? entries[0];
  const count = Number(amount);
  const home = canVisitSettlement(state);
  return <div className="trader-page">
    <div className="trader-room"><img src="/art/przystan-interior.webp" alt="Lada handlarza i zamieszkany hol wewnątrz dawnego domu kultury." width="1672" height="941" /><span>Przystań · przy ladzie</span></div>
    <section className="trader-intro"><span className="eyebrow">Przystań · wewnątrz domu kultury</span><h2>Handlarz przy ladzie</h2><p>„Masz coś na wymianę? Zapasy nie są za darmo.”</p><p>Przyjmuje rzeczy z plecaka. Założone wyposażenie i podstawowy plecak zostają przy Tobie. Zabierz na handel rzeczy w plecaku.</p><div className="trader-actions"><button onClick={() => navigate('settlement')}>Wróć do holu Przystani</button><button onClick={() => navigate('inventory')}>Sprawdź plecak</button></div></section>
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
