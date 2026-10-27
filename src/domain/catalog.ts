import type { ItemDefinition, Location, SkillId } from './types';

// Minimalne dane demonstracyjne, nie zatwierdzony balans ani scenariusz.
export const items = [
  { id: 'backpack', name: 'Plecak podróżny', category: 'equipment', weightKg: 1.2, description: 'Podstawowe wyposażenie ocalałego.' },
  { id: 'water', name: 'Woda', category: 'supply', weightKg: 1, description: 'Zapas wyprawowy. Bez stale opadającego paska pragnienia.' },
  { id: 'ration', name: 'Racja żywnościowa', category: 'supply', weightKg: 0.4, description: 'Zapas na drogę.' },
  { id: 'bandage', name: 'Bandaż', category: 'supply', weightKg: 0.1, description: 'Środek medyczny. Leczenie nie jest jeszcze wdrożone.' },
  { id: 'scrap', name: 'Złom', category: 'material', weightKg: 0.5, description: 'Materiał do przyszłych receptur.' },
  { id: 'raw-water', name: 'Woda do uzdatnienia', category: 'material', weightKg: 1, description: 'Surowiec do przygotowania czystej wody.' },
  { id: 'food', name: 'Składniki żywnościowe', category: 'material', weightKg: 0.4, description: 'Surowiec do przygotowania racji.' },
  { id: 'cloth', name: 'Czysta tkanina', category: 'material', weightKg: 0.1, description: 'Materiał na bandaże.' },
] as const satisfies readonly ItemDefinition[];

export const locations = [
  { id: 'outskirts', name: 'Opuszczone osiedle', description: 'Budynki na obrzeżach. Znany punkt do przyszłych wypraw.', discovery: 'visited' },
  { id: 'workshop', name: 'Stary warsztat', description: 'Miejsce znane z informacji. Zagrożenia pozostają nierozpoznane.', discovery: 'known' },
] as const satisfies readonly Location[];

export const skillNames: Record<SkillId, string> = {
  combat: 'Walka', scouting: 'Zwiad', survival: 'Przetrwanie', medicine: 'Medycyna',
  crafting: 'Rzemiosło', electronics: 'Elektronika', trade: 'Handel', transport: 'Transport',
};

export function getItem(id: string): ItemDefinition | undefined {
  return items.find((item) => item.id === id);
}
