import { useCallback, useEffect, useRef, useState } from 'react';
import { applyGameChange } from '../domain/quests';
import { createInitialState } from '../domain/game';
import type { GameRepository, GameState } from '../domain/types';

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'Nie udało się uzyskać dostępu do zapisu.';
}

export function useGame(repository: GameRepository) {
  const [state, setState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const busy = useRef(false);
  const current = useRef<GameState | null>(null);

  useEffect(() => {
    let alive = true;
    setError(null);
    void (async () => {
      try {
        const loaded = await repository.load();
        const next = loaded ?? createInitialState();
        if (!alive) return;
        if (loaded === null) await repository.save(next, loaded);
        if (alive) { current.current = next; setState(next); }
      } catch (cause) { if (alive) setError(message(cause)); }
    })();
    return () => { alive = false; };
  }, [repository, attempt]);

  const update = useCallback(async (change: (previous: GameState) => GameState): Promise<boolean> => {
    if (busy.current || !current.current) return false;
    busy.current = true;
    setSaving(true);
    setError(null);
    try {
      const next = applyGameChange(current.current, change);
      if (next === current.current) return true;
      await repository.save(next, current.current);
      current.current = next;
      setState(next);
      return true;
    } catch (cause) { setError(message(cause)); return false; }
    finally { busy.current = false; setSaving(false); }
  }, [repository]);

  return { state, error, saving, update, retry: () => setAttempt((previous) => previous + 1) };
}
