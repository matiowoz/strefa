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

`shelter.webp`: wygenerowana na potrzeby STREFY ilustracja wnętrza schronienia
z posłaniem, zapasami, łatanym plecakiem, stołem i radiem pod ciepłą lampą.
Wersja WebP źródłowego PNG. Ilustracja jest poglądowa, bez dynamicznych zmian
wyposażenia pokoju i bez powiązania liczby narysowanych zapasów ze stanem magazynu.

`neighborhood-map.webp`, `outskirts.webp`, `workshop.webp`: wygenerowane lokalne
ilustracje planu okolicy, opuszczonego osiedla i starego warsztatu. Wersje WebP
źródłowych PNG. Znaczniki i nazwy są renderowane jako przyciski HTML, nie są
częścią ilustracji. Tło planu jest poglądowe: budynki i drogi nie tworzą
dodatkowych lokacji ani symulacji podróży.

`bunker-wall.webp`: wygenerowana na potrzeby STREFY tekstura zużytego betonu
z pęknięciami i śladami rdzy, tło wspólne dla wszystkich ekranów. WebP
źródłowego PNG, wyłącznie dekoracja; przy braku obrazu pozostaje ciemne tło CSS.

`przystan-interior.webp` — własna wygenerowana ilustracja wnętrza dawnego domu kultury zamienionego we wspólne bezpieczne miejsce ocalałych, z ladą handlarza, radiostacją i mieszkańcami.
