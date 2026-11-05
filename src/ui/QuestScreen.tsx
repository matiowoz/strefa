import { useState } from 'react';
import { getItem } from '../domain/catalog';
import { atShelter } from '../domain/inventory';
import { claimQuest, questDetails, quests, syncQuestProgress } from '../domain/quests';
import type { GameState } from '../domain/types';
import { ItemArt } from './ItemArt';
import { useNow } from './useNow';
import './quests.css';

type Props = { state: GameState; saving: boolean; update: (change: (state: GameState) => GameState) => Promise<boolean>; navigate: (screen: 'shelter' | 'expeditions' | 'inventory' | 'storage') => void };
export function QuestScreen({ state, saving, update, navigate }: Props) {
  const progress = syncQuestProgress(state);
  const now = useNow(!!state.activeExpedition);
  const [notice, setNotice] = useState('');
  return <div className="quest-journal">
    <div className="quest-intro"><span className="eyebrow">Notatnik ocalałego</span><h2>Jutro zaczyna się dzisiaj.</h2><p>Małe cele pomagają przetrwać. Możesz realizować je w dowolnej kolejności. Nagrody odbierzesz po powrocie do kryjówki.</p><strong>Odebrane nagrody: {progress.quests.claimed.length} / {quests.length}</strong><button onClick={() => navigate('shelter')}>Wróć do kryjówki</button></div>
    <p role="status">{notice}</p>
    <div className="quest-list">{quests.map((quest, index) => {
      const complete = progress.quests.completed.includes(quest.id);
      const claimed = progress.quests.claimed.includes(quest.id);
      return <article className={`quest-card ${claimed ? 'quest-claimed' : ''}`} key={quest.id}>
        <header><span className="quest-number" aria-hidden="true">0{index + 1}</span><div><span className="eyebrow">{claimed ? 'Nagroda odebrana' : complete ? 'Gotowe do odbioru' : 'W toku'}</span><h2>{quest.name}</h2></div></header>
        <p>{quest.description}</p><p className="quest-progress">{questDetails(progress, quest.id)}</p>
        <div className="quest-rewards" aria-label="Nagroda">{quest.rewards.map((reward) => <span key={reward.itemId}><ItemArt itemId={reward.itemId} />{getItem(reward.itemId)!.name} ×{reward.quantity}</span>)}</div>
        <div className="quest-actions"><button disabled={saving || !complete || claimed || !atShelter(state, now)} onClick={() => { void (async () => { const ok = await update((previous) => claimQuest(previous, quest.id)); if (ok) setNotice(`Odebrano nagrodę: ${quest.name}. Sprawdź ekwipunek; nadmiar trafi do skrytki lub odbioru.`); })(); }}>{claimed ? 'Odebrano ✓' : 'Odbierz nagrodę'}</button>
          {!complete && <button onClick={() => navigate(quest.id === 'supplies' ? 'expeditions' : quest.id === 'workbench' ? 'shelter' : quest.id === 'jacket' ? 'inventory' : 'storage')}>{quest.id === 'supplies' ? 'Zaplanuj wyprawę' : quest.id === 'workbench' ? 'Do stołu roboczego' : quest.id === 'jacket' ? 'Otwórz ekwipunek' : 'Otwórz skrytkę'}</button>}</div>
      </article>;
    })}</div>
  </div>;
}
