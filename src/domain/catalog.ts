import type { ItemDefinition, Location, SkillId } from './types';

// Minimalne dane demonstracyjne, nie zatwierdzony balans ani scenariusz.
export const items = [
  { id: 'backpack', name: 'Plecak podróżny', category: 'equipment', weightKg: 1.2, description: 'Podstawowe wyposażenie ocalałego.' },
  { id: 'helmet', name: 'Zniszczony hełm', category: 'equipment', slot: 'head', weightKg: 1.4, description: 'Wgnieciony stalowy hełm. Łuszcząca się farba, rdza i postrzępiony pasek. Wciąż trzyma się na głowie.' },
  { id: 'jacket', name: 'Łatana kurtka', category: 'equipment', slot: 'body', weightKg: 1.8, description: 'Ciężka kurtka zszywana różnymi nićmi. Przetarte mankiety i plamy po wielu wyprawach.' },
  { id: 'boots', name: 'Znoszone buty', category: 'equipment', slot: 'feet', weightKg: 1.2, description: 'Popękana skóra, błoto i niedopasowane sznurowadła. Para butów, która przeszła już sporo.' },
  { id: 'crowbar', name: 'Zardzewiały łom', category: 'equipment', slot: 'weapon', weightKg: 2.5, description: 'Stalowy łom z resztkami czerwonej farby. Zabrany w plecaku lub założony jako broń główna pozwala spróbować otworzyć zamkniętą skrzynię.' },
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
