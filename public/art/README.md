# Ilustracje lokalne

`survivor.png`: wygenerowana ilustracja poglądowa bohatera w schronieniu.

`items-worn.webp`: wygenerowany na potrzeby STREFY atlas o przezroczystym tle,
4 kolumny × 2 rzędy; wersja WebP źródłowego PNG, bez zmiany kompozycji.
Kolejność: plecak, woda, racja, bandaż / złom, woda do uzdatnienia,
składniki żywnościowe, czysta tkanina.
Mapowanie znajduje się w `src/ui/ItemArt.tsx`, a rozmiar i pozycjonowanie w
`src/ui/inventory.css`. Przy zmianie kolejności atlasu zaktualizuj mapowanie.
Ilustracje zużycia są dekoracyjne i nie wyznaczają mechanicznego stanu przedmiotu.

Butelka wody do uzdatnienia ma dodaną przez edycję AI wyblakłą, podartą etykietę
z czerwonym paskiem, bez czytelnych napisów i znaków towarowych.
