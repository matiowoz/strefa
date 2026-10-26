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

## Etap 2 — minimalna wyprawa po osobnym zleceniu

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
- Pierwszy adapter zastępuje cały snapshot. Bez rozstrzygania konfliktów między kilkoma kartami: pracuj w jednej karcie. Przed dodaniem silnika zaprojektuj kontrolę wersji zmian.
- Nie dodajemy resetu zapisu, automatycznego kasowania błędnych danych, kont ani płatności.
- Ekran startowy i rozwinięcie panelu są ustawieniami interfejsu, nie elementem trwałego stanu gry.
- Schemat v1: nieznana wersja lub nieznane ID danych zatrzymują odczyt. Przed zmianą katalogu dodaj migrację; nie usuwaj używanych ID.
- Późniejszy adapter HTTP implementuje port GameRepository. Komendy i reguły gospodarki trzeba wówczas przenieść na serwer; sama zmiana adaptera nie zapewnia bezpieczeństwa.

Po etapie 1 zatrzymujemy prace. Dalsze etapy nie są automatycznie autoryzowane.

## Wyniki weryfikacji 26 października 2026

- Node 24.22.1; dokładne wersje pakietów przypięte w package-lock.json.
- Vitest: 2 pliki testowe, 25 testów zaliczonych. Adapter sprawdzony przez fake-indexeddb, również przerwana transakcja i ochrona poprzedniego zapisu.
- TypeScript strict i Vite build: kod wyjścia 0. Wynik w dist/; JS 234,63 kB (73,70 kB gzip), CSS 6,69 kB (2,42 kB gzip).
- Przeglądarka: pięć ekranów, zwijanie panelu, zmiana pseudonimu, wybór warsztatu i odtworzenie obu zmian po odświeżeniu; po odświeżeniu ekranem startowym pozostaje Kryjówka.
- Kontrola wizualna w wąskim oknie przeglądarki. Nie testowano fizycznego telefonu, połączenia LAN, Safari ani instalacji PWA.
- Instalacja zależności: 0 zgłoszonych podatności w audycie npm w chwili instalacji.
- Środowisko pracy: użyto dostarczonego Node 24 i zapisywalnego cache npm w work/, ponieważ systemowy Node 20.12 i domyślny cache miały ograniczenia. Nie zmieniano ustawień systemowych. Użytkownik powinien użyć Node 22.12+ zgodnie z README.
