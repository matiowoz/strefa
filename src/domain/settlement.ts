import type { GameState } from './types';

export const settlement = {
  name: 'Przystań',
  building: 'Dawny dom kultury',
  pin: { x: 62, y: 75 },
  residents: [
    { id: 'trader', name: 'Handlarz', role: 'Lada z zapasami', description: 'W wytartej kurtce outdoorowej i rękawicach układa zapasy za metalową ladą. Przy pasie ma ładownice i kaburę.', dialogue: 'Podejdź do lady. Pokaż, co przyniosłeś, a powiem, co mogę dać w zamian.' },
    { id: 'radio', name: 'Mira', role: 'Operatorka radia', description: 'W połatanej kurtce pracuje przy radiostacji i laptopie. Maskę z filtrami podniosła na głowę.', dialogue: 'Czasem przez godzinę słychać tylko szum. A potem jedno zdanie mówi o okolicy więcej niż cała mapa.' },
    { id: 'keeper', name: 'Dozorca', role: 'Gospodarz budynku', description: 'Pilnuje wzmocnionych drzwi. Na odzieży taktycznej nosi kamizelkę, a karabinek ma przewieszony na pasie.', dialogue: 'Za tymi drzwiami każdy szuka chwili spokoju. Otrzep buty i usiądź, jeśli jesteś zmęczony. To wspólny dach.' },
  ],
} as const;
export function canVisitSettlement(state: Pick<GameState, 'activeExpedition'>): boolean {
  return state.activeExpedition === null;
}
