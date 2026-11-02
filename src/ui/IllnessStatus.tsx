import type { GameState } from '../domain/types';
import { isSick } from '../domain/illness';
import { ItemArt } from './ItemArt';
import { useNow } from './useNow';
export function IllnessStatus({ state }: { state: GameState }) {
  const now = useNow(!!state.illness && Date.now() < state.illness.endsAt);
  if (!isSick(state, now)) return null;
  const seconds = Math.max(0, Math.ceil((state.illness!.endsAt - now) / 1000));
  return <aside className="illness-status" aria-label="Stan postaci: choroba"><div className="illness-art"><ItemArt itemId="antibiotic" /></div><div><strong>Postać jest chora</strong><p>Nowa wyprawa potrwa o 50% dłużej. Użyj antybiotyku albo poczekaj na wyzdrowienie.</p><span aria-live="off">Do wyzdrowienia: {Math.floor(seconds / 60)} min {seconds % 60} s</span></div></aside>;
}
