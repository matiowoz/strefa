import type { GameState } from './types';

export const illnessRules = { durationMs: 30 * 60_000, expeditionMultiplier: 1.5 } as const;
export function isSick(state: GameState, now = Date.now()): boolean {
  return state.illness !== null && now >= state.illness.startedAt && now < state.illness.endsAt;
}
export function expeditionDuration(state: GameState, baseDuration: number, now = Date.now()): number {
  return Math.ceil(baseDuration * (isSick(state, now) ? illnessRules.expeditionMultiplier : 1));
}
