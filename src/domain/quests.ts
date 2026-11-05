import { getItem } from './catalog';
import { arrange, atShelter } from './inventory';
import { addResources, quantity } from './preparation';
import type { GameState, ResourceAmount } from './types';

export const questIds = ['supplies', 'workbench', 'jacket', 'reserve'] as const;
export type QuestId = typeof questIds[number];
export interface QuestProgress { completed: QuestId[]; claimed: QuestId[] }
export const reserveCosts = [{ itemId: 'water', quantity: 3 }, { itemId: 'ration', quantity: 3 }, { itemId: 'bandage', quantity: 2 }] as const;
export const quests: { id: QuestId; name: string; description: string; rewards: ResourceAmount[] }[] = [
  { id: 'supplies', name: 'Pierwsze zapasy', description: 'Wróć z wyprawy ze znaleziskami i odbierz raport.', rewards: [{ itemId: 'cloth', quantity: 2 }] },
  { id: 'workbench', name: 'Miejsce do pracy', description: 'Odwiedź stary warsztat, odbierz raport i napraw stół roboczy w kryjówce.', rewards: [{ itemId: 'bandage', quantity: 2 }] },
  { id: 'jacket', name: 'Przygotowany ocalały', description: 'Znajdź kurtkę i załóż ją w Ekwipunku.', rewards: [{ itemId: 'ration', quantity: 2 }] },
  { id: 'reserve', name: 'Rezerwa na jutro', description: 'Odłóż w skrytce 3 wody, 3 racje i 2 bandaże. Zapasy zostają Twoje.', rewards: [{ itemId: 'scrap', quantity: 4 }] },
];

// Called around every player command: milestones survive consuming supplies or taking gear off.
export function syncQuestProgress(state: GameState): GameState {
  const achieved: Record<QuestId, boolean> = {
    supplies: !!state.lastReport?.cargo.loot.length,
    workbench: state.progress.workbenchRepaired,
    jacket: state.equipped.body?.itemId === 'jacket',
    reserve: reserveCosts.every((cost) => quantity(state.stash, cost.itemId) >= cost.quantity),
  };
  const completed = questIds.filter((id) => state.quests.completed.includes(id) || achieved[id]);
  if (completed.length === state.quests.completed.length) return state;
  return { ...state, quests: { ...state.quests, completed } };
}

export function claimQuest(state: GameState, id: QuestId, now = Date.now()): GameState {
  const next = syncQuestProgress(state);
  const quest = quests.find((entry) => entry.id === id);
  if (!quest || !atShelter(next, now) || !next.quests.completed.includes(id) || next.quests.claimed.includes(id)) return state;
  // Marking the reward and adding items are saved in one transaction by the application.
  return arrange({ ...next, updatedAt: now, quests: { ...next.quests, claimed: [...next.quests.claimed, id] }, inventory: addResources(next.inventory, quest.rewards) });
}

export function questDetails(state: GameState, id: QuestId): string {
  if (state.quests.completed.includes(id)) return 'Cel zaliczony — postęp zachowany.';
  if (id === 'supplies') return 'Odebrane wyprawy ze znaleziskami: 0 / 1';
  if (id === 'jacket') return 'Założona kurtka: 0 / 1';
  if (id === 'reserve') return reserveCosts.map((cost) => `${getItem(cost.itemId)!.name}: ${Math.min(cost.quantity, quantity(state.stash, cost.itemId))} / ${cost.quantity}`).join(' · ');
  return `${state.progress.workshopVisited ? '✓' : '○'} Powrót z warsztatu · ○ Naprawa stołu`;
}

export function applyGameChange(state: GameState, change: (previous: GameState) => GameState): GameState {
  return syncQuestProgress(change(syncQuestProgress(state)));
}
