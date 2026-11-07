import { acceptMiraQuest, completeMiraQuest, miraTask } from '../domain/miraQuest';
import { quantity } from '../domain/preparation';
import { canVisitSettlement } from '../domain/settlement';
import type { GameState } from '../domain/types';
import { ResourceIcons } from './ResourceIcons';
import './mira-quest.css';

type Props = { state: GameState; saving: boolean; update?: (change: (state: GameState) => GameState) => Promise<boolean>; journal?: boolean; onVisit?: () => void; onMap?: () => void };
export function MiraQuestPanel({ state, saving, update, journal = false, onVisit, onMap }: Props) {
  const completed = state.miraQuest === 'completed';
  const active = state.miraQuest === 'active';
  const carried = quantity(state.inventory, miraTask.itemId);
  const elsewhere = quantity([...state.stash, ...state.overflow], miraTask.itemId);
  const ready = carried >= miraTask.required;
  return <section className="mira-quest" aria-label="Zlecenie Miry"><span className="eyebrow">Mira · {completed ? 'Zakończone' : active ? 'W toku' : 'Do przyjęcia w Przystani'}</span><h3>{miraTask.name}</h3>
    <p>{completed ? 'Przekazano części, Mira naprawiła zasilanie radiostacji. Nagroda została odebrana.' : 'Przynieś Mirze dwa zestawy części elektronicznych z zaplecza starego warsztatu. Po powrocie zabierz je w plecaku do Przystani.'}</p>
    {!completed && <><ResourceIcons items={[{ itemId: miraTask.itemId, quantity: miraTask.required }]} owned={(id) => quantity(state.inventory, id)} label="Części do przekazania Mirze" /><p>{active ? ready ? 'Masz komplet w plecaku. Możesz przekazać go Mirze.' : `W plecaku: ${Math.min(carried, miraTask.required)} / ${miraTask.required}` : 'Najpierw przyjmij zlecenie podczas rozmowy z Mirą.'}</p>{elsewhere > 0 && <p>Części poza plecakiem: {elsewhere}. Przenieś je do plecaka przed rozmową.</p>}</>}
    <span className="eyebrow">{completed ? 'Odebrana nagroda' : 'Nagroda za dostarczenie części'}</span><ResourceIcons items={miraTask.rewards} label="Nagroda za zlecenie Miry" />
    {!completed && <div className="mira-actions">{journal ? <button disabled={!canVisitSettlement(state)} onClick={onVisit}>Idź do Miry w Przystani</button> : state.miraQuest === 'available' ? <button disabled={saving} onClick={() => { void update?.((previous) => acceptMiraQuest(previous)); }}>Przyjmij zlecenie</button> : <><button disabled={saving || !ready} onClick={() => { void update?.((previous) => completeMiraQuest(previous)); }}>Przekaż części i odbierz nagrodę</button>{!ready && <button onClick={onMap}>Sprawdź warsztat na mapie</button>}</>}</div>}
    {journal && !canVisitSettlement(state) && !completed && <p>Wróć z wyprawy i odbierz raport przed wizytą w Przystani.</p>}
  </section>;
}
