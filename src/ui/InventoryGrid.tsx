import type { GameState } from '../domain/types';
import { getItem } from '../domain/catalog';
import { gridSize, itemSizes } from '../domain/inventory';
import { ItemArt } from './ItemArt';

type Props = { state: GameState; page: number; selectedId: string | null; disabled: boolean; select: (id: string) => void; place: (id: string, page: number, point: { x: number; y: number }) => void; moving: boolean };
export function InventoryGrid({ state, page, selectedId, disabled, select, place, moving }: Props) {
  const size = gridSize(page);
  const entries = (page === -1 ? state.inventory : state.stash).filter((entry) => state.positions[entry.id].page === page);
  return <div className="container-scroll"><div className={`bag-grid ${page === -1 ? 'carried-grid' : 'hideout-grid'}`} style={{ gridTemplateColumns: `repeat(${size.columns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${size.rows}, minmax(0, 1fr))`, aspectRatio: `${size.columns}/${size.rows}` }} role="group" aria-label={page === -1 ? 'Ekwipunek 5 na 9' : `Schowek strona ${page + 1}, 10 na 10`}>
    {Array.from({ length: size.columns * size.rows }, (_, index) => {
      const point = { x: index % size.columns, y: Math.floor(index / size.columns) };
      return <button className="bag-cell" key={`cell-${index}`} style={{ gridColumn: point.x + 1, gridRow: point.y + 1 }} disabled={disabled || !moving || !selectedId} aria-label={`Umieść wybrany przedmiot: kolumna ${point.x + 1}, rząd ${point.y + 1}`} onClick={() => { if (selectedId) place(selectedId, page, point); }} onDragOver={(event) => { if (!disabled) event.preventDefault(); }} onDrop={(event) => { event.preventDefault(); const id = event.dataTransfer.getData('text/plain'); if (id && !disabled) place(id, page, point); }} />;
    })}
    {entries.map((entry) => {
      const position = state.positions[entry.id]; const dimensions = itemSizes[entry.itemId];
      return <button key={entry.id} className={`bag-item ${selectedId === entry.id ? 'is-selected' : ''}`} style={{ gridColumn: `${position.x + 1} / span ${dimensions.width}`, gridRow: `${position.y + 1} / span ${dimensions.height}` }} aria-label={`${getItem(entry.itemId)?.name}, ilość ${entry.quantity}, rozmiar ${dimensions.width} na ${dimensions.height}`} aria-pressed={selectedId === entry.id} aria-controls="item-details" title={getItem(entry.itemId)?.name} draggable={!disabled} onDragStart={(event) => { event.dataTransfer.setData('text/plain', entry.id); select(entry.id); }} onClick={() => select(entry.id)}>
        <span className="bag-quantity">×{entry.quantity}</span><ItemArt itemId={entry.itemId} /><span className="bag-item-name">{getItem(entry.itemId)?.name}</span>
      </button>;
    })}
  </div></div>;
}
