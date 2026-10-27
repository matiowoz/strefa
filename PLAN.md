# STREFA — plan prototypu

Źródło: GDD 1.1, rozdziały 1, 4–7, 11–14, 20, 22, 24. Nazwa STREFA jest nazwą projektu przyjętą w bieżącym zleceniu.

## Etap 1 — fundament obecnego zlecenia

- [x] Oddzielny projekt React, TypeScript strict, Vite i CSS mobile-first.
- [x] Kryjówka jako ekran startowy, zwijany panel informacji i pięć ekranów.
- [x] Typy bohatera, przedmiotów, lokacji i jednej aktywnej wyprawy.
- [x] Czyste funkcje domenowe oraz port GameRepository.
- [x] Adapter IndexedDB, wersjonowanie i walidacja danych bez nadpisywania uszkodzonego zapisu.
- [x] Pseudonim i wybór celu jako minimalne operacje sprawdzające trwały zapis.
- [x] Testy domeny oraz odczytu, zapisu i przerwania transakcji.
- [x] Weryfikacja: npm test (25/25), npm run build oraz sprawdzenie pięciu ekranów i zapisu po odświeżeniu w przeglądarce.

Kryterium ukończenia: aplikacja startuje w Kryjówce, wszystkie ekrany są dostępne na telefonie, zmiany przetrwają odświeżenie, testy i kompilacja przechodzą. Nie uruchamiamy jeszcze wypraw.

## Etap 2 — minimalna wyprawa

Plan, start jednej automatycznej wyprawy, czas zakończenia i jednokrotne rozliczenie prostego raportu. Bez walki i losowego zaawansowanego silnika.

Kryteria: druga wyprawa nie wystartuje równolegle; zamknięcie i ponowne otwarcie nie zmienia wyniku; nagrody nie są przyznawane dwa razy. Lokalny zegar jest tylko rozwiązaniem prototypowym, a nie autorytetem przyszłej gospodarki.

## Etap 3 — podstawowa pętla przygotowania

Zapasy wyprawowe, wybór prostego zestawu, bezpieczny powrót i niewielka liczba receptur. Zakres każdorazowo zatwierdzany przed rozpoczęciem.

Kryteria: brak ujemnych zasobów, deterministyczne receptury, własny sprzęt nie przepada, brak stale opadających pasków głodu i pragnienia.

## Etap 4 — pionowy wycinek

Szczegółowe wnętrze, jedna dopracowana lokacja i krótki ciąg celów; dalsze reguły tylko po uzgodnieniu. Backend i autorytatywny czas mają osobny przyszły etap przed gospodarką graczy.

## Ograniczenia i propozycje względem GDD

- Jedna kryjówka, 2 poglądowe punkty mapy i 5 definicji przedmiotów; to dane testowe, nie finalny scenariusz ani balans.
- Widok kryjówki jest kompozycją CSS. Nie udaje docelowej szczegółowej grafiki.
- Brak fabuły, walki, craftingu, produkcji, badań, energii, x4 i transportu. Nie zmienia to ich ustalonej wizji.
- Lokalny zapis zamiast serwera jest świadomym ograniczeniem zlecenia. Nie zapewnia synchronizacji ani ochrony przed edycją danych i zmianą zegara.
- Adapter zapisuje snapshot z atomowym sprawdzeniem oczekiwanego stanu. Nieaktualna karta nie może nadpisać nowszego zapisu; przy konflikcie odśwież stronę. Brak scalania zmian i synchronizacji urządzeń.
- Nie dodajemy resetu zapisu, automatycznego kasowania błędnych danych, kont ani płatności.
- Ekran startowy i rozwinięcie panelu są ustawieniami interfejsu, nie elementem trwałego stanu gry.
- Schemat v2: poprawny v1 migruje w pamięci bez utraty postępu; zapis v2 następuje przy udanej zmianie. Nieznana wersja, uszkodzone dane lub nieznane ID zatrzymują odczyt bez nadpisania.
- Późniejszy adapter HTTP implementuje port GameRepository. Komendy i reguły gospodarki trzeba wówczas przenieść na serwer; sama zmiana adaptera nie zapewnia bezpieczeństwa.

Etap 2 został zlecony osobno. Po nim zatrzymujemy prace; etap 3 wymaga osobnego zlecenia.

## Wyniki weryfikacji 26 października 2026

- Node 24.22.1; dokładne wersje pakietów przypięte w package-lock.json.
- Vitest: 2 pliki testowe, 25 testów zaliczonych. Adapter sprawdzony przez fake-indexeddb, również przerwana transakcja i ochrona poprzedniego zapisu.
- TypeScript strict i Vite build: kod wyjścia 0. Wynik w dist/; JS 234,63 kB (73,70 kB gzip), CSS 6,69 kB (2,42 kB gzip).
- Przeglądarka: pięć ekranów, zwijanie panelu, zmiana pseudonimu, wybór warsztatu i odtworzenie obu zmian po odświeżeniu; po odświeżeniu ekranem startowym pozostaje Kryjówka.
- Kontrola wizualna w wąskim oknie przeglądarki. Nie testowano fizycznego telefonu, połączenia LAN, Safari ani instalacji PWA.
- Instalacja zależności: 0 zgłoszonych podatności w audycie npm w chwili instalacji.
- Środowisko pracy: użyto dostarczonego Node 24 i zapisywalnego cache npm w work/, ponieważ systemowy Node 20.12 i domyślny cache miały ograniczenia. Nie zmieniano ustawień systemowych. Użytkownik powinien użyć Node 22.12+ zgodnie z README.

## Realizacja etapu 2

- [x] Jedna aktywna wyprawa, trwały cel i termin powrotu, działanie podczas nieobecności.
- [x] Odbiór po terminie: nagroda, raport i usunięcie aktywnej wyprawy w jednej transakcji; ponowiona komenda niczego nie przyznaje.
- [x] Ochrona przed nieaktualną kartą i migracja v1 → v2.
- [x] Testy regresji: termin, ponowny odbiór, nieobecność, zmiana celu na mapie, konflikt kart i przerwana transakcja.

Roboczy balans do sprawdzenia pętli, nie finalne reguły GDD: osiedle 1 minuta / 2 złomu, warsztat 2 minuty / 4 złomu. Jedyna strategia startu to zrównoważona; bez symulacji taktyk, walki, urazów, zużycia zapasów, doświadczenia, wyczerpywania lokacji i automatycznych serii. Przechowywany jest tylko ostatni rozliczony raport. Odebranie raportu przyznaje łup; do tego czasu wyprawa blokuje następny start. Zegar urządzenia jest prototypowy i nie zabezpiecza gospodarki przed manipulacją. Przyszłe zmiany balansu wymagają wersjonowania wyniku aktywnej wyprawy.

Weryfikacja etapu 2: `npm test` — 32/32, `npm run build` — sukces. Chromium headless, szerokość 390 px: start, odtworzenie aktywnej wyprawy po odświeżeniu, odbiór po terminie, raport po ponownym odświeżeniu i ekwipunek +2 złomu; brak poziomego przewijania. Upływ czasu zasymulowany przesunięciem zegara tylko w izolowanym profilu testowym. Bez testu fizycznego telefonu i Safari.
