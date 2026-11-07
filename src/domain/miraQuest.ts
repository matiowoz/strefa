import { arrange } from './inventory';
import { addResources, consume, quantity } from './preparation';
import { canVisitSettlement } from './settlement';
import type { GameState, ResourceAmount } from './types';

export const miraTask = {
  name: 'Przerwany sygnał',
  required: 2,
  itemId: 'electronic-parts',
  rewards: [{ itemId: 'water', quantity: 2 }, { itemId: 'ration', quantity: 2 }, { itemId: 'bandage', quantity: 1 }] as readonly ResourceAmount[],
};
export function acceptMiraQuest(state: GameState, now = Date.now()): GameState {
  if (state.miraQuest !== 'available') return state;
  if (!canVisitSettlement(state)) throw new Error('Odbierz raport i porozmawiaj z Mirą w Przystani.');
  return { ...state, updatedAt: now, miraQuest: 'active' };
}
export function completeMiraQuest(state: GameState, now = Date.now()): GameState {
  if (state.miraQuest === 'completed') return state;
  if (state.miraQuest !== 'active') throw new Error('Najpierw przyjmij zlecenie Miry.');
  if (!canVisitSettlement(state)) throw new Error('Odbierz raport i wróć do Miry w Przystani.');
  if (quantity(state.inventory, miraTask.itemId) < miraTask.required) throw new Error('Przynieś dwa zestawy części w plecaku.');
  return arrange({ ...state, updatedAt: now, miraQuest: 'completed', inventory: addResources(consume(state.inventory, [{ itemId: miraTask.itemId, quantity: miraTask.required }]), miraTask.rewards) });
}
export function miraDialogue(state: GameState): string {
  if (state.miraQuest === 'completed') return 'Te części rozwiązały problem z zasilaniem. Odbiór jest stabilny. Dzięki — teraz znowu mogę nasłuchiwać ludzi w okolicy.';
  if (state.miraQuest === 'active') return quantity(state.inventory, miraTask.itemId) >= miraTask.required
    ? 'Masz już potrzebne części? Pokaż je. Za naprawę odłożę dla ciebie zapasy.'
    : 'Nadal potrzebuję dwóch zestawów części. Rozejrzyj się na zapleczu starego warsztatu. Przynieś je tutaj, gdy wrócisz.';
  return 'Radiostacja co chwilę traci zasilanie. Potrzebuję dwóch zestawów części elektronicznych. Na zapleczu starego warsztatu może jeszcze coś zostało. Przyniesiesz je? Odwdzięczę się zapasami.';
}
