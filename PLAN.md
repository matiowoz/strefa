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

- Jedna kryjówka, 2 poglądowe punkty mapy i 8 definicji przedmiotów; to dane testowe, nie finalny scenariusz ani balans.
- Widok kryjówki jest lokalną, wygenerowaną ilustracją poglądową. Nie odwzorowuje dynamicznie urządzenia pokoju ani liczby zapasów.
- Brak fabuły, walki, kolejek produkcji, badań, energii, x4 i transportu. Nie zmienia to ich ustalonej wizji.
- Lokalny zapis zamiast serwera jest świadomym ograniczeniem zlecenia. Nie zapewnia synchronizacji ani ochrony przed edycją danych i zmianą zegara.
- Adapter zapisuje snapshot z atomowym sprawdzeniem oczekiwanego stanu. Nieaktualna karta nie może nadpisać nowszego zapisu; przy konflikcie odśwież stronę. Brak scalania zmian i synchronizacji urządzeń.
- Nie dodajemy resetu zapisu, automatycznego kasowania błędnych danych, kont ani płatności.
- Ekran startowy i rozwinięcie panelu są ustawieniami interfejsu, nie elementem trwałego stanu gry.
- Schemat v3: poprawne v1 i v2 migrują w pamięci bez utraty postępu; zapis v3 następuje przy udanej zmianie. Nieznana wersja, uszkodzone dane lub nieznane ID zatrzymują odczyt bez nadpisania.
- Późniejszy adapter HTTP implementuje port GameRepository. Komendy i reguły gospodarki trzeba wówczas przenieść na serwer; sama zmiana adaptera nie zapewnia bezpieczeństwa.

Etapy 2 i 3 zostały zlecone osobno. Po etapie 3 zatrzymujemy prace; etap 4 wymaga osobnego zlecenia.

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

## Realizacja etapu 3 — przygotowanie

- [x] Trwały wybór zestawu: lekki (1 woda + 1 racja), z zapasem (2 + 2); opcjonalnie jeden własny plecak.
- [x] Koszt całej wyprawy wraz z powrotem pobierany atomowo przy starcie. Brak zapasów lub niesprawny sprzęt blokuje start. Nie ma pasków głodu/pragnienia.
- [x] Sprzęt pozostaje w ewidencji i jest zarezerwowany do odbioru raportu, nie jest zużywany ani usuwany. Zestawu nie można zmieniać w trakcie.
- [x] Łupy i zużycie utrwalone przy starcie, pokazane w raporcie. Receptury nie korzystają ze sprzętu ani zapasów już pobranych na wyprawę.
- [x] Trzy deterministyczne receptury w Ekwipunku, z podglądem kosztów, stanu magazynu, wyniku i czasu. Koszty i wynik zapisywane w jednej transakcji. Równoległa nieaktualna karta jest odrzucana.
- [x] Migracja v1/v2 → v3: dotychczasowa wyprawa zachowuje czas i nagrodę, bez nowych kosztów ani dodatkowych łupów; stary raport pozostaje dostępny.

Robocze uproszczenia i balans, nie nowe ustalone reguły GDD:
- Nowe wyprawy oprócz dotychczasowego złomu dają 2 wody do uzdatnienia, 2 składniki żywnościowe i 1 czystą tkaninę. Pozwala to odtwarzać zapasy bez bezpłatnego przyznawania gotowych racji.
- Receptury: 1 woda do uzdatnienia → 1 woda; 1 składnik żywnościowy → 1 racja; 2 czyste tkaniny → 1 bandaż. Wykonanie natychmiastowe, bez paliwa, stanowisk, losowej jakości, doświadczenia, kolejek i x4. Bandaż nadal nie leczy.
- Wariant z zapasem zużywa cały podany koszt, bez premii do łupu lub czasu; to test wyboru i pobierania zapasów, bez symulacji nadwyżek. Plecak nie dodaje jeszcze udźwigu ani premii. Nie wdrażamy napraw, modułów i zużycia sprzętu.
- Brak odwrotu i porażek; bezpieczny powrót oznacza ukończenie po terminie bez strat własnego wyposażenia. Zegar nadal lokalny.

Weryfikacja: 44/44 testy, TypeScript i Vite build zaliczone. Chromium przy szerokości 390 px: zapis zestawu i sprzętu, odświeżenie, start, odtworzenie wyprawy, odbiór, blokada braku zapasów, wytworzenie wody i racji, odświeżenie i kolejny start. Brak poziomego przewijania. Czas przesunięty tylko w izolowanym profilu testowym. Bez fizycznego telefonu i Safari.

## Przebudowa wyglądu — wzorzec ekwipunku

Osobno zlecony ilustrowany ekran ekwipunku przed etapem 4. Panel ocalałego ma lokalną wygenerowaną ilustrację poglądową (nie odzwierciedla dynamicznego ubioru). Osiem lokalnych ilustracji przedmiotów, siatka z ilościami i stanem, filtry oraz szczegóły po wybraniu. Plecak można wybrać lub odłożyć bezpośrednio w tym ekranie za pomocą istniejących reguł przygotowania; miejsca głowy, tułowia i obuwia są wyraźnie oznaczonymi, nieaktywnymi propozycjami. Crafting zachowuje koszty i wyniki. Pozostałe ekrany czekają na akceptację kierunku graficznego; nie rozszerzamy etapu 4 ani schematu zapisu.

Weryfikacja: 44/44 testy i build zaliczone; Chromium 320/390/768/1440 px bez poziomego przewijania, ilustracja ładuje się lokalnie, wybór klawiaturą, filtry, szczegóły, zapamiętanie i odłożenie plecaka po odświeżeniu, blokada sprzętu na aktywnej wyprawie, odbiór i crafting. Bez testu fizycznego telefonu.

## Uruchamianie Windows jednym kliknięciem

Dodano `Uruchom STREFĘ.cmd` i skrypt PowerShell: weryfikacja narzędzi i wersji Node, blokada równoległych uruchomień, kontrola czystości `main`, fetch i tylko fast-forward, instalacja z lockfile, Vite na stałym localhost:5173 i otwarcie przeglądarki. Zajęty port blokuje instalację przed zmianą node_modules. Brak resetu, usuwania plików użytkownika i wyłączania TLS; błąd zatrzymuje kolejne kroki i pozostawia komunikat. Nie zmienia mechanik gry ani globalnej polityki wykonywania skryptów.

44/44 testy i kompilacja gry przechodzą. W środowisku Linux brak Windows/PowerShell — uruchomienie samego pliku CMD i ścieżki logowania GitHub wymaga sprawdzenia na komputerze użytkownika.

## Korekta ilustracji przedmiotów — zużycie postapo

Zastąpiono gładkie wektory wspólnym, wygenerowanym atlasem malowanych ilustracji: łatany i przetarty plecak, porysowana manierka, pognieciona racja z taśmą, bandaż w zużytym opakowaniu, skorodowany złom, ponownie użyta butelka z wodą do uzdatnienia, puszka z workiem składników i cerowana tkanina. Warstwa opatrunkowa pozostaje czysta. Wizualne zużycie nie zmienia zapisanej kondycji ani użyteczności przedmiotów. Atlas WebP z przezroczystością (około 493 KiB) obsługuje siatkę, szczegóły, plecak i crafting, bez osobnych pobrań dla każdego przedmiotu. Reguły, katalog ID, zapis i zależności bez zmian.

Weryfikacja: 44/44 testy, build i kontrola Chromium 320/390/768/1440 px — filtry, klawiatura, szczegóły, rezerwacja sprzętu, wyprawa i crafting; bez poziomego przewijania i wyjątków JS. Sprawdzono wygląd w zrzucie ekranu.

## Ilustrowana kryjówka — przebudowa wyglądu

Zastąpiono scenę z prostych kształtów lokalną ilustracją WebP: popękane ściany, przetarte posłanie, zapasy, łatany plecak, zużyty stół, radio i ciepła lampa. Spójna z nowym ekwipunkiem kolorystyka oliwki, rdzy i mosiądzu. Pod ilustracją skróty do wyprawy i mapy; zwijany panel zawiera zdrowie i poziom bohatera, stan wyprawy z odliczaniem i informacją o gotowym raporcie oraz liczbę wody i racji. Stół prowadzi do istniejących receptur; radio pozostaje wyraźnie oznaczoną dekoracją, bez nowych zadań, produkcji, mechanik i migracji zapisu. Ilustracja nie zmienia się wraz z zapasami.

44/44 testy i kompilacja przechodzą. Chromium: 320/390/768/1440 px bez poziomego przewijania, obraz załadowany, zwijanie klawiaturą z aria-expanded, nawigacja do bohatera, mapy i ekwipunku, brak zapisu stanu przy samej nawigacji; pusty magazyn, długi pseudonim, odtworzenie aktywnej wyprawy po odświeżeniu, aktualizacja odliczania, przejście po gotowy raport i odbiór. Czas przesunięty tylko w izolowanej przeglądarce testowej. Bez fizycznego telefonu.

## Ilustrowana mapa okolicy

Papierowy, zniszczony plan zastępuje schemat CSS. Kryjówka prowadzi do ekranu schronienia, a dwa przyciski celów zapisują wybór istniejącą komendą selectLocation. Lista poniżej zapewnia alternatywę dla znaczników i klawiatury. Panel wybranego miejsca zawiera lokalną ilustrację, dotychczasowy opis i poziom poznania, czas z istniejących reguł, złom oraz zestaw zapasów. Przejście do Wypraw nie rozpoczyna zadania. Zmiana celu podczas aktywnej wyprawy dotyczy wyłącznie następnej; pokazano komunikat z nazwą aktywnego celu. Brak nowych lokacji, reguł, zagrożeń, tras i zmian w schemacie zapisu.

Weryfikacja: 44/44 testy i build; Chromium 320/390/768/1440 px bez poziomego przewijania, załadowane obrazy, wybór klawiaturą i listą, zachowanie celu po odświeżeniu, nawigacja do kryjówki i planowania. Symulowana przerwana transakcja zachowuje poprzedni cel w interfejsie i bazie; poprawna próba ponowna działa. Wybór następnego celu zachowuje plan, czasy i zapasy aktywnej wyprawy. Zrzuty ekranu sprawdzone wizualnie. Bez testu fizycznego telefonu.

## Wyprawa i raport — wygląd oraz brak podglądu zdobyczy

Na polecenie użytkownika usunięto zapowiedź konkretnych łupów z mapy, przygotowania i aktywnej wyprawy. Przed startem widoczne są cel, czas, sprzęt i koszty. Wynik ujawnia dopiero rozliczony raport po powrocie: ilustracje znalezisk, ilości i zużyte zapasy. Ostatni raport jest wyraźnie oznaczoną historią; może pozostawać widoczny podczas kolejnej wyprawy. Ilustrowany ekran używa istniejących grafik lokacji, a licznik nie udaje walki lub zdarzeń. Model nagród nadal demonstracyjny i deterministyczny — nie dodano losowości, nowych kosztów, migracji ani mechanik.

Weryfikacja: 44/44 testy i build; Chromium 320/390/768/1440 px bez poziomego przewijania w przygotowaniu i raporcie. Brak nazw przyszłych znalezisk w mapie, planie, aktywnej i zakończonej, lecz nieodebranej wyprawie. Wcześniejszy odbiór zablokowany; przerwana transakcja nie ujawnia raportu ani nie przyznaje łupów. Ponowienie odbioru działa, raport zachowuje się po odświeżeniu bez powtórnych nagród; nawigacja do ekwipunku działa. Czas przesunięto wyłącznie w izolowanej przeglądarce testowej.
