import type { GameState } from './types';

export const settlement = {
  name: 'Przystań',
  building: 'Dawny dom kultury',
  pin: { x: 62, y: 75 },
  residents: [
    { id: 'trader', name: 'Handlarz', role: 'Lada z zapasami', description: 'Za drewnianą ladą układa zapasy i ogląda przyniesiony sprzęt.', dialogue: 'Podejdź do lady. Pokaż, co przyniosłeś, a powiem, co mogę dać w zamian.' },
    { id: 'radio', name: 'Mira', role: 'Operatorka radia', description: 'Siedzi przy odbiorniku, między mapami i zapisanymi kartkami.', dialogue: 'Czasem przez godzinę słychać tylko szum. A potem jedno zdanie mówi o okolicy więcej niż cała mapa.' },
    { id: 'keeper', name: 'Dozorca', role: 'Gospodarz budynku', description: 'Pilnuje wejścia i dogląda pieca w głównym holu.', dialogue: 'Za tymi drzwiami każdy szuka chwili spokoju. Otrzep buty i usiądź, jeśli jesteś zmęczony. To wspólny dach.' },
  ],
} as const;
export function canVisitSettlement(state: Pick<GameState, 'activeExpedition'>): boolean {
  return state.activeExpedition === null;
}
