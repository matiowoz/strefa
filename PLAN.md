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

## Karta Bohatera i wspólne tło postapo

Osobno zlecony wygląd Bohatera oraz tła strony: wygenerowana tekstura betonu z rdzą i pęknięciami, przygaszone światło, dopasowane tło nagłówka i nawigacji. Nieprzezroczyste panele utrzymują czytelność. Karta postaci korzysta z istniejącej ilustracji, pokazuje poziom, zdrowie i faktyczne wartości ośmiu specjalizacji. Jasno oznaczono brak rozwoju i premii; bez pasków fikcyjnego doświadczenia. Zachowano zapis pseudonimu, podgląd wybranego/rezerwowanego plecaka i przejście do ekwipunku. Grafika ubioru poglądowa. Bez zmiany domeny, schematu i zależności.

44/44 testy i build zaliczone; Chromium: wspólne tło ładuje się, wszystkie pięć ekranów bez poziomego przewijania przy 320/390/768/1440 px, osiem umiejętności, nawigacja nie zmienia danych, zmiana pseudonimu zachowuje się po odświeżeniu i nie rusza ekwipunku, wybór plecaka w Ekwipunku jest odzwierciedlony na karcie Bohatera. Zrzut ekranu sprawdzony wizualnie. Bez fizycznego telefonu.

## Menu aktualizacji launchera Windows

Po zatrzymaniu własnego serwera przez Ctrl+C launcher pozostaje w tym samym oknie z opcjami U (aktualizacja i ponowne uruchomienie) oraz Z (zamknięcie), wybieranymi z Enter. Błąd cyklu pokazuje komunikat i to samo menu. Sprawdzenia czystego main, tylko fast-forward, wersji Node przy starcie, zajętego portu i lockfile zachowane; walidacja repozytorium i portu wykonywana w każdym cyklu. Blokada równoległej sesji trwa także podczas menu. Serwer uruchamiany bezpośrednio przez Node z przekierowanym stdin, pozostawionym stdout/stderr; launcher przechwytuje Ctrl+C jako klawisz i kończy tylko własny PID oraz jego drzewo. Przy zakończeniu przywraca tryb konsoli i zwalnia uchwyty. Brak globalnych zmian polityki PowerShell i zmian w grze.

W środowisku Linux nie ma Windows PowerShell ani taskkill: sprawdzono kod i dokumentację, nie wykonano menu ani przechwycenia Ctrl+C na Windows. Pierwszy start wymaga kontroli na komputerze użytkownika: Ctrl+C → U → kolejny start, Ctrl+C → Z, błędna odpowiedź w menu, zajęty port i lokalne zmiany. Testy aplikacji i build są osobną weryfikacją, nie testem launchera.

## Siatki ekwipunku, schowek i nawigacja

Na zlecenie użytkownika: kolejność Postać, Ekwipunek, Kryjówka, Wyprawy, Mapa; bez formularza zmiany nazwy, ale zachowane wcześniej zapisane nazwy. Ekwipunek 5×9. Po doprecyzowaniu ostatniej odpowiedzi: dwie strony schowka po 10×10. Dodatkowe strony za prawdziwe pieniądze pozostają wyłącznie przyszłym zakresem — brak mechanizmu płatności i zakupów.

Robocze rozmiary: plecak 2×3, butelki 1×2, racja i bandaż 1×1, złom i składniki 2×2, tkanina 2×1. Wielkość dotyczy stosu; nie wprowadzono nowych limitów ilości stosu ani obracania przedmiotów. Przeciąganie lub wybór i wskazanie wolnego pola, automatyczne znalezienie miejsca przy transferze. Kolizje i wystawanie blokowane w domenie. Transfery tylko w kryjówce; sprzęt aktywnej wyprawy zwalniany dopiero przy rozliczeniu raportu. Surowce do startu i receptur muszą być przy postaci.

Schemat v4 zachowuje układ, obie strony schowka i bezpieczny odbiór dla nadmiarowych przedmiotów z migracji/wyjść domeny. Odbiór nie jest miejscem do odkładania rzeczy. Wyniki nie mieszczące się przy postaci trafiają do schowka, a po jego zapełnieniu czekają bez utraty. Migracja poprawnych v1–v3 zachowuje rzeczy i ich ilości, nazwę, czas i wynik wyprawy; zarezerwowany/wybrany sprzęt ma pierwszeństwo przy rozmieszczaniu. Nieprawidłowe położenia, nakładanie lub powielone ID w v4 są odrzucane. IndexedDB nadal zapisuje całą zmianę atomowo z kontrolą poprzedniego stanu.

55/55 testów oraz build. Testy: granice, kolizje, transfer między kontenerami/stronami, pełne siatki, zachowanie łupów, migracja przepełnionego zapisu z aktywną wyprawą, przerwany zapis i konflikt dwóch kart. Chromium: nowa kolejność, brak edycji nazwy, dokładnie 45/100 pól, obie strony, transfery i położenie po odświeżeniu, błędne położenie bez utraty, migracja v3 i zachowana nazwa; 320/390/768/1440 px bez przewijania całej strony w poziomie (schowek ma własny scroll).

## Korekta przeciągania i jeden schowek

Na najnowsze polecenie: po chwyceniu podgląd jest centrowany pod kursorem (bez zachowania punktu chwytu) i ma dokładnie rozmiar przedmiotu w siatce. Jednakowe kratki 52×52 px i odstępy 2 px w ekwipunku i schowku; bez dopasowywania grafiki do szerokości panelu. Zdarzenia wskaźnika obsługuje cała powierzchnia, z zaokrągleniem początku prostokąta do najbliższego pola. Linie i szczeliny nie są już obszarem wyłączonym z upuszczania. Podgląd miejsca pokazuje dozwoloną lub kolidującą pozycję; kolizje nadal odrzucane w domenie. Podgląd realizowany lokalnie zamiast natywnego obrazu drag-and-drop, bez jego powiększania.

Jeden schowek 10×10, bez kart. W przyszłości kolejne budowane skrytki zamiast płatnych stron. Schemat v5 sprawdza poprawność starego v4 z obiema stronami przed migracją; zachowuje pierwszą stronę i przenosi zawartość drugiej na wolne miejsca albo do odbioru, nigdy nie usuwając rzeczy. Nazwa, wyposażenie i aktywna wyprawa bez zmian.

62/62 testy i build. Przypadki testowe: środek 1×2 i 2×3, szczeliny, granice, kolizje, pełna stara druga strona i kontrola poprzedniego stanu przy zapisie po migracji. Chromium: rzeczywiste ruchy myszą, chwyt za brzeg i centrowanie pod kursorem, zachowane rozmiary ramki i grafiki podczas przeciągania, transfer między siatkami, kolizja bez zmiany zapisu, odświeżenie i identyczne kratki przy 320/390/768/1440 px. Bez fizycznego telefonu.

Dodatkowo sprawdzono w Chromium odkładanie 1×1 w środek pola i transfer emulowanym dotykiem, z zachowaniem wymiarów i położenia.

## Schowek 8×9 i ciche odrzucanie niedozwolonej pozycji

Schowek zmniejszony do 8 kolumn i 9 rzędów, ekwipunek nadal 5×9. Limit rozmiaru przedmiotu 2×3 sprawdzany w domenie. Niezgodna pozycja lub brak miejsca nie uruchamiają zapisu i nie pokazują komunikatu o awarii danych; podgląd kolizji i pozostanie przedmiotu w źródle wystarczają. Rzeczywiste błędy IndexedDB i konflikt z inną kartą pozostają widoczne. Wyposażenie aktywnej wyprawy nie może rozpocząć gestu przenoszenia ani transferu.

Schemat v6 sprawdza starsze v4/v5 według ich pierwotnych granic 10×10 przed migracją. Rzeczy poza nowymi granicami układa w wolnych miejscach albo zachowuje w odbiorze. Nie naprawia automatycznie uszkodzonych zapisów. 65/65 testów i build; testy pełnego schowka v5, nadmiaru przy migracji, maksymalnego rozmiaru i cichego braku zmiany przy kolizji. Chromium: rzeczywiste przeciąganie, brak alertu po niedozwolonym upuszczeniu, jednakowe rozmiary grafiki, 320/390/768/1440 px i emulowany dotyk.

## Opis na hover, skrytka jako osobny widok, Użyj

Usunięto podpisy z ikon siatki i podglądu przeciągania. Interaktywne okienko pokazuje nazwę, opis i działania; można wejść na nie myszą bez znikania, zamknąć poza nim, Escape lub krzyżykiem. Na telefonie otwiera się dotknięciem. Nazwy pozostają w etykietach dostępności. Skrytka jest osobnym ekranem otwieranym z Kryjówki i pokazuje obie siatki. Pięć pozycji nawigacji bez zmian, w Ekwipunku nie ma siatki skrytki ani przycisku „Do skrytki”. W skrytce transfer jest obok Użyj, w przeciwną stronę jako „Do ekwipunku”.

Na doprecyzowane polecenie użytkownika Użyj zużywa jedną wodę, rację albo bandaż; bez dodawania efektów zdrowia, głodu i pragnienia. Dostępne po powrocie, ze stosu w ekwipunku lub otwartej skrytce. Wynik zapisywany atomowo, ostatnia sztuka zwalnia pola; blokada powtórzenia podczas zapisu i konfliktu kart zachowana. Nie zmieniono schematu zapisu.

72/72 testy i build. Nowe testy zużycia trzech rodzajów, ostatniej sztuki, użycia ze skrytki, blokad w drodze i nieużywalnych rzeczy, konfliktu dwóch kart i przerwanej transakcji. Chromium: realna mysz przechodzi z ikony na okienko i klika Użyj/transfer, ilości zapisane po odświeżeniu, brak Użyj na materiałach, brak podpisów, brak transferu w Ekwipunku, oddzielny widok skrytki, okienko mieści się w 320/390/768/1440 px. Ponownie sprawdzono przeciąganie z centrowaniem bez zmiany wielkości, kolizje i emulowany dotyk. Bez fizycznego telefonu.


## Etap 4 — pierwszy ciąg celów i zmiana zasad wypraw (31 października 2026)

- [x] Wyprawa do starego warsztatu, odbiór raportu, zebranie materiałów i jednokrotna naprawa stołu w kryjówce.
- [x] Koszt naprawy: roboczo 6 złomu i 2 tkaniny, pobierane atomowo z ekwipunku, potem skrytki. Odbiór nadmiaru nie służy jako magazyn materiałów.
- [x] Naprawa zmienia ilustrację kryjówki i odblokowuje recepturę „Zestaw opatrunków”: 2 tkaniny + 1 woda → 3 bandaże. Pozostałe receptury pozostają dostępne wcześniej.
- [x] Nowe wyprawy biorą pod uwagę obecny ekwipunek. Usunięto wybór zestawu i sprzętu; start nie pobiera wody ani racji. Przedmioty skrytki pozostają w domu.
- [x] Podstawowy plecak jest oddzielnym, stale założonym wyposażeniem poza siatką 5×9. Nie można go przenosić ani używać. Większe plecaki i ich wymiana pozostają na przyszłość.
- [x] Zmienne ilości łupu, losowanie raz przy starcie i trwały wynik; brak prognozy nagród w interfejsie. Roboczo jednostajny rozkład: złom 0–4 na osiedlu / 0–6 w warsztacie, woda do uzdatnienia 0–3, żywność 0–3, tkanina 0–2. Zero pomija dany przedmiot; możliwy pusty powrót. Kolejne wyniki mogą przypadkowo się powtórzyć. Brak zależności od umiejętności/sprzętu — to nadal prototyp balansu.
- [x] Schemat v7. Migracja poprawnych v1–v6 zachowuje rzeczy, położenia pozostałych przedmiotów, trwającą wyprawę, termin, dawne koszty i wynik. Jeden dotychczasowy plecak przenosi do wyposażenia (pozostałe zachowuje); przy braku plecaka dodaje podstawowy. Nie nadpisuje błędnych ani nowszych danych. Dawny raport warsztatu zalicza odwiedziny; naprawa wymaga osobnej akcji.
- [x] Drugi wariant ilustracji `/art/shelter-repaired.webp` powstał przez wygenerowaną edycję własnego obrazu kryjówki; bez materiałów z cudzych gier.

Zakres nie obejmuje walki, backendu, płatności ani rozbudowanego silnika zdarzeń. Nowe reguły zastępują wcześniejsze demonstracyjne zestawy i stałe nagrody, zgodnie z bieżącym zleceniem.

Weryfikacja tego etapu: 81/81 testów Vitest, kompilacja TypeScript strict i Vite. Chromium: pełny ciąg wyprawa → raport → naprawa → nowa receptura, wynik i postęp po odświeżeniu, założony plecak poza siatką, brak wyboru zestawów i zużycia przy starcie; szerokości 320, 390, 768 i 1440 px bez poziomego przepełnienia strony. Materiały naprawy w izolowanym profilu przeglądarki dodano do testu; losowe i puste wyniki sprawdzono testami domeny. Testy adaptera obejmują przerwanie naprawy, dwie karty i migrację plecaka v6 przy zapisie.

## Rozdzielanie stosów

Na polecenie użytkownika dodano „Rozdziel” dla stosów większych niż 1 w siatkach ekwipunku i skrytki oraz panelu szczegółów. Okienko pozwala wybrać całkowitą ilość od 1 do ilości stosu minus 1; domyślnie połowa. Zatwierdzenie tworzy drugi stos tego samego przedmiotu i stanu w pierwszym wolnym prostokącie tego samego kontenera. Brak miejsca jest cichym brakiem zmiany, bez zapisu i bez przenoszenia do skrytki/odbioru. Pojedyncza sztuka i założony plecak nie mają tej akcji. Nie można rozdzielać podczas wyprawy ani bezpośrednio z odbioru nadmiaru. Brak automatycznego scalania rozdzielonych stosów i zmiany schematu v7.

Weryfikacja: 101/101 testów Vitest i build. Nowe przypadki sprawdzają sumę sztuk, osobne ID i pozycje, podział w obu kontenerach, niepoprawne ilości, brak całego prostokąta, pełne siatki bez przenoszenia do innej, blokadę w drodze, trwałość, konflikt kart i przerwanie transakcji.

Chromium: rzeczywista mysz od ikony do przycisku, podział w ekwipunku i skrytce, brak akcji dla 1 sztuki, walidacja ilości, Enter/Escape, anulowanie bez zapisu, trwałość po odświeżeniu, pełny kontener bez podziału i bez błędu danych. Okienko mieści się w szerokościach 320/390/768/1440 px.

## Postać połączona z ekwipunkiem — 1 listopada 2026

Na polecenie użytkownika zakładka Ekwipunek pokazuje jedną wspólną kartę z postacią po lewej i siatką 5×9 po prawej. Wspólny komponent HeroPortrait zapewnia tę samą ilustrację, nazwę, poziom i zdrowie co w Postaci. Założony plecak znajduje się pod portretem. Na wąskim ekranie części są ułożone pionowo. To podstawa późniejszego zakładania odzieży i uzbrojenia; sam mechanizm wyposażania nie jest częścią tej zmiany. Skrytka zachowuje dotychczasowe dwie siatki. Brak zmian w regułach, wymiarach kratek, danych i schemacie zapisu.

Weryfikacja: 101/101 istniejących testów i build. Chromium: zgodność portretu, nazwy i zdrowia między zakładkami, jeden plecak, połączenie paneli, układ poziomy/pionowy i kratki 52 px przy szerokościach 320, 390, 768, 1024 i 1440 px bez przepełnienia strony. Sprawdzono rzeczywistą myszą Rozdziel, Użyj, przeciąganie bez zmiany wielkości, transfer w skrytce i trwałość po odświeżeniu. Nawigacja i nowy widok nie zmieniają stanu zapisu.

## Łączenie stosów przeciąganiem — 1 listopada 2026

Na polecenie użytkownika upuszczenie stosu na drugi zgodny stos łączy ich ilości. Działa w ekwipunku, skrytce i między nimi, po powrocie do kryjówki. Cel zachowuje ID, stan i położenie; źródło i jego pozycja są usuwane w tej samej transakcji. Podświetlenie „Połącz” wskazuje cały docelowy prostokąt pod kursorem, niezależnie od przyciągania do pustych pól. Podgląd przeciągania nadal ma pierwotny rozmiar i środek pod kursorem.

Istniejące `id` oznacza stos/egzemplarz wyposażenia, a `itemId` jego definicję. Nie wprowadzamy numerów seryjnych każdej sztuki zapasów. Łączyć można zgodne zapasy i materiały, również pojedyncze sztuki; sprzęt, różny typ/stan i przepełnienie ilości są cichym brakiem zmiany. Brak zmian schematu v7, limitów stosów lub automatycznego scalania wszystkich rzeczy w kontenerze.

Weryfikacja: 114/114 testów i build. Testy sumy ilości, zachowania docelowego ID i pozycji, zwolnienia źródła, powtórzenia komendy, obu kierunków transferu, pełnej siatki, niezgodności, przepełnienia, blokady w drodze, trwałości, równoległych kart i przerwanej transakcji. Chromium: rzeczywista mysz i emulowany dotyk, łączenie po najechaniu narożnika wielopolowych przedmiotów 1×2 i 2×2, oba kontenery i kierunki, niewłaściwy cel bez zmiany i bez błędu zapisu, pełna siatka, zachowany rozmiar i centrowanie podglądu, odtworzenie po odświeżeniu, bez błędów JS.

## Launcher do testowania przez Wi-Fi — 1 listopada 2026

Plik „Uruchom STREFĘ.cmd” korzysta z poprawionego scripts/Start-Strefa.ps1: Vite nasłuchuje na 0.0.0.0:5173, komputer nadal otwiera http://localhost:5173, a okno instruuje o adresie Network dla telefonu. Kontrola zajętego portu obejmuje teraz IPv4 Any i IPv6 localhost. Zachowane menu U/Z, bezpieczne aktualizacje, blokada drugiej sesji i zatrzymywanie wyłącznie własnego serwera. Launcher nie zmienia zapory ani routera. Zmieniony skrypt trzeba po pierwszej aktualizacji zamknąć i uruchomić ponownie, bo PowerShell wczytuje go na początku sesji.

Start wyprawy nie korzysta już z crypto.randomUUID, niedostępnego pod zwykłym adresem HTTP w LAN. ID ma 128 losowych bitów z crypto.getRandomValues, które działa również w takim kontekście. Nie zmienia to schematu ani dotychczasowych ID zapisanych wypraw.

Weryfikacja: 115/115 testów i build; nowy test startu, odczytu i rozliczenia bez randomUUID. Vite uruchomiony na 0.0.0.0 (port testowy 5180), wyświetla Local i Network; nasłuch potwierdzony przez ss. Chromium w widoku telefonu: start, odświeżenie i odbiór raportu bez randomUUID. Weryfikację przeglądarki wykonano przez localhost z zasymulowanym brakiem tej funkcji, ponieważ proxy środowiska blokuje dostęp przeglądarki do lokalnego adresu sieciowego. Brak Windows/PowerShell i fizycznego telefonu w środowisku — samego launchera na Windows i połączenia przez domowe Wi-Fi nie uruchamiano.

## Zdarzenia i dziennik wypraw — 1 listopada 2026

Na zaakceptowane zlecenie dodano krótkie zdarzenia bez walki i ręcznych wyborów. Nowe wyprawy zapisują przy starcie całą kolejność zdarzeń, ich znaleziska i sumaryczny łup. Rozliczenie tylko odczytuje ten wynik; odświeżenie i późniejszy odbiór nie losują niczego ponownie. Przed odebraniem raportu interfejs nie ujawnia zdarzeń ani znalezisk. Ostatni raport nadal jest widoczny podczas kolejnej wyprawy jako rozliczona historia.

Robocze reguły prototypu: 15% szansy na zatarasowaną drogę — jedno zdarzenie, brak dotarcia do celu i pusty powrót. W przeciwnym razie przeszukanie dwóch miejsc: na osiedlu mieszkanie (woda do uzdatnienia 0–3, żywność 0–3, tkanina 0–2) i podwórze (złom 0–4); w warsztacie zaplecze (złom 0–6, tkanina 0–2) i magazyn (woda do uzdatnienia 0–3, żywność 0–3). Pomiędzy nimi 30% szansy na zamkniętą skrzynię, z której na razie niczego nie można zabrać. Zera pomijają dany zasób, więc także odwiedzone miejsca mogą być puste. Nie zmieniono terminów powrotu, zdrowia, wyposażenia ani zużycia zapasów. Zawrócenie przed warsztatem nie zalicza celu naprawy stołu; faktyczne dotarcie zalicza go po odbiorze, nawet bez łupów. Bez zależności od narzędzi/umiejętności na tym etapie.

Schemat v8: poprawne v1–v7 migrują bez utraty rzeczy, położeń, postępu, terminów, wyników i dawnych kosztów. Aktywna wyprawa i raport sprzed zmiany dostają events:null (brak historycznych danych), bez generowania zdarzeń. W v8 aktywny i rozliczony dziennik muszą mieć znane zdarzenia właściwe dla lokacji, dozwoloną kolejność, zasoby/ilości i sumę zgodną z łupem. Błędny lub nowszy zapis nie jest nadpisywany ani cicho naprawiany.

Weryfikacja: 133/133 testy i build. Nowe testy obejmują zdarzenia, pusty powrót, zamkniętą skrzynię, źródła i sumę łupów, dotarcie do warsztatu, brak dodatkowego losowania, nieprawidłowy los, błędne dzienniki oraz migrację v7. Adapter sprawdza migrację wraz z kontrolą współbieżności i ochronę niezgodnego dziennika przed nadpisaniem; dotychczasowe testy transakcji obejmują nowe zdarzenia. Chromium: start bez ujawnienia zdarzeń, odświeżenie bez zmiany wyniku, odbiór dziennika, stary raport podczas następnej wyprawy, zatarasowana droga bez łupu i bez zaliczenia warsztatu, migracja aktywnej wyprawy i raportu v7 z zachowaniem nagrody; szerokości 320/390/768/1440 px, bez przepełnienia i błędów JS.

## Karta wyposażenia z miejscami przy sylwetce — 1 listopada 2026

Na polecenie użytkownika usunięto z widoku Ekwipunek „Kartę ocalałego”, nazwę bohatera, poziom i powtarzające się nagłówki „Ekwipunek postaci”. Lewą część zastępuje sylwetka w przyciemnionej ramie, z sześcioma metalowymi miejscami na hełm, ubranie, rękawice, buty, broń główną i boczną. Własne proste ikony SVG, ślady zużycia, nity i linie łączące ramki z sylwetką; ilustracja ocalałego pozostaje dotychczasowa. Siódmy slot pokazuje rzeczywiście założony plecak, z opisem na hover/focus/dotyk i bez zdejmowania.

To przygotowanie wyglądu pod przyszłe zakładanie odzieży i uzbrojenia: sześć miejsc jest statycznych i nie przyjmuje przedmiotów; informacja o przygotowaniu jest widoczna. Brak nowych przedmiotów, mechanik lub zmian zapisu. Prawa część zachowuje siatkę 5×9 i kratki 52 px, nad nią tylko wymiary i masa. Pomoc przenoszenia przeniesiono do zwijanego panelu. Na telefonie sylwetka i siatka układają się pionowo, z miejscami w obrębie sylwetki. Zakładka Postać oraz układ skrytki zachowane.

Weryfikacja: 133/133 istniejące testy i build. Chromium: brak wskazanych nazw i nagłówków, sześć miejsc przyszłego wyposażenia i jeden założony plecak, opis plecaka bez działań zdejmowania, brak zmiany zapisu przy nawigacji i upuszczeniu na przyszły slot. Sprawdzono rozmiar podglądu przeciągania, Rozdziel, transfer do skrytki, odświeżenie i zachowany widok Postać. Szerokości 320/390/768/1024/1440 px, wszystkie miejsca wewnątrz ilustracji, kratki 52 px i brak poziomego przepełnienia. Kontrola wizualna w Chromium na szerokim i wąskim ekranie, bez błędów JS.

## Zakładanie, zdejmowanie i wymiana wyposażenia — 1 listopada 2026

Zrealizowany zaakceptowany zakres: cztery przedmioty (zniszczony hełm, łatana kurtka, znoszone buty, zardzewiały łom), aktywne sloty głowy, tułowia, stóp i broni głównej. Rozmiary odpowiednio 2×2, 2×3, 2×2, 1×3; maksymalny rozmiar nadal 2×3. Każdy egzemplarz ma własne ID, ilość 1 i stan. Bez łączenia i rozdzielania sprzętu. Rękawice i broń boczna pozostają poglądowymi miejscami, plecaka nie można zdjąć ani wymienić w tym etapie.

Przeciąganie z plecaka do pasującego slotu, ze slotu na wolny prostokąt plecaka, wymiana przez upuszczenie nowego egzemplarza na zajęty slot. Alternatywnie „Załóż” i „Zdejmij” w interaktywnych opisach, także na telefonie i z klawiatury. Przy wymianie stary egzemplarz trafia najpierw w zwolnione pola nowego, a jeśli nie pasuje, do pierwszego wolnego miejsca. Brak miejsca, niewłaściwy slot lub ponowienie tej samej operacji to brak zmiany; nie przenosimy zdejmowanej rzeczy do schowka/odbioru. Pełny plecak nadal może pozwolić na wymianę, gdy mieści się ona w zwalnianych polach. Ekwipunek zmieniamy po powrocie zgodnie z dotychczasową regułą.

Wspólny mechanizm przeciągania siatki i wyposażenia zachowuje pod kursorem pierwotne wymiary ramki i grafiki. Podświetlenie wskazuje pasujący slot lub pełny prostokąt docelowy w siatce; niezgodny cel jest odrzucany. Po zdjęciu do siatki rzecz zajmuje swój rozmiar w kratkach, niezależnie od rozmiaru ramki slotu. Stosowanie, transfer i łączenie zapasów pozostają dostępne.

Źródło przedmiotów: roboczo 25% szansy na dodatkowy egzemplarz za każde przeszukane miejsce. Mieszkanie — kurtka lub buty; podwórze — hełm; zaplecze warsztatu — hełm lub łom; magazyn — kurtka lub buty. Stan znaleziska roboczo 60%; nie jest losowany na nowo przy odbiorze. Cały wynik zapisany przy starcie, ID odbieranego sprzętu deterministyczne względem wyprawy i z kontrolą kolizji w całym stanie. Nie ma darmowego zestawu startowego ani dopisywania sprzętu do wcześniejszych wypraw. Wyniki bez miejsca przechodzą przez dotychczasowy bezpieczny schowek/odbiór. Łom nie zmienia jeszcze zamkniętej skrzyni ani zdarzeń. Premie, zużycie, wpływ na zdrowie/wyprawy i zmiana ilustracji ubioru to późniejszy etap.

Schemat v9: migracja poprawnego v8 i starszych dodaje pustą mapę sześciu miejsc, zachowując rzeczy, położenia, postęp, wyprawę, raport i wyniki. Walidacja sprawdza właściwy slot, kategorię, ilość 1, stan 0–100, unikalność ID między noszonymi rzeczami, plecakiem, siatkami i odbiorem; sprzęt nie ma wpisów w pozycjach siatki. Starsze schematy nadal nie dopuszczają nowych typów wyposażenia. W nowych dziennikach sprzęt musi odpowiadać miejscu i ilości 1. Niepoprawny lub nowszy zapis pozostaje chroniony.

Grafiki: własny wygenerowany atlas 2×2 `/art/equipment-worn.webp`, przezroczyste, zniszczone przedmioty pasujące do poprzednich ilustracji; bez materiałów z cudzych gier.

Weryfikacja: 149/149 testów i build. Domena: cztery sloty, zdejmowanie, wymiana dwóch stanów i ID, pełny plecak, wskazany prostokąt/kolizje, niewłaściwy przedmiot, zakaz zdejmowania plecaka, brak zmian w drodze i premii, walidacja sprzętu i zdarzeń, migracja v8, przyznanie sprzętu raz i zachowanie nadmiaru. Adapter: przerwana wymiana i zdejmowanie, dwie karty i odtworzenie, zapis po migracji. Chromium: wszystkie cztery przedmioty przeciągane do slotów, zdejmowanie, wymiana, zły slot i pełny plecak bez utraty, zachowany rozmiar grafiki/ramki i centrowanie, emulowany dotyk, „Załóż”/„Zdejmij”, odświeżenie, raport z nowym sprzętem oraz migracja aktywnej wyprawy v8. Ponownie sprawdzono łączenie i rozdzielanie stosów myszą/dotykiem, anulowanie, walidację ilości i trwałość. Szerokości 320/390/768/1024/1440 px, kratki 52 px, brak przepełnienia i błędów JS. Bez fizycznego telefonu.

## Łom założony lub zabrany w plecaku — otwieranie skrzyń

Na doprecyzowane polecenie łom działa zarówno w slocie wyposażenia, jak i w inventory przy starcie wyprawy. Skrytka i overflow nie są zabierane; przedmiot znaleziony dopiero w drodze nie wpływa na tę próbę. Zdarzenie skrzyni zapisuje wynik no-tool/opened/jammed i łup w tym samym snapshotcie co reszta wyprawy. Rozliczenie i odświeżenie nie sprawdzają ponownie narzędzia ani nie losują.

Roboczo 70% szans otwarcia, przy sukcesie 1–3 złomu i 1–2 tkaniny. Brak zużycia narzędzia, zmian czasu, zdrowia i pozostałych premii. Raport rozróżnia brak łomu, nieudaną próbę i sukces. Opcjonalne pole cacheResult zachowuje zgodność schematu v9: wcześniejsze zamknięte skrzynie bez pola pozostają bez zmian. Walidacja sprawdza wynik i zgodność nagrody; poza skrzynią to pole jest niedozwolone.

158 testów i build: oba miejsca narzędzia, skrytka/odbiór/brak narzędzia, łom znaleziony w drodze, nieudana próba, utrwalony wynik po odłożeniu łomu po powrocie, brak zużycia i ponownych nagród, starszy dziennik oraz trwałość i równoległy odbiór.

Chromium: raporty dla łomu w plecaku i w slocie, brak łomu ze skrytki, nieudane otwarcie oraz trwałość wyniku i nagrody po odświeżeniu; brak błędów JS.

## Choroba bez kurtki i antybiotyk — etap historyczny, wycofany poniżej

Nowa wyprawa bez założonej kurtki ma 50% szans na zachorowanie przy planowanym powrocie. Kurtka w plecaku i skrytce nie chroni. Wynik jest utrwalony przy starcie; wcześniejsze wyprawy nie otrzymują nowego losowania. Robocze wartości przedstawione użytkownikowi: 30 minut choroby, +50% czasu wyprawy rozpoczętej podczas choroby. Opcjonalne pytanie o inne wartości pozostało bez odpowiedzi; przyjęto zakomunikowane domyślne.

Choroba ustępuje także offline, nie odnawia się przy kolejnych wyprawach podczas jej trwania i nie odbiera HP. Termin wyprawy jest stały mimo wyzdrowienia w drodze. Stan zawiera startedAt/endsAt, przyszły początek choroby nie jest pokazywany przed powrotem. Leczenie przed odbiorem raportu nie może powodować powtórnego zachorowania przy rozliczeniu. Bez skaleczeń, trudnego terenu i zmian mapy.

Antybiotyk: nowy zapas 1×1, masa 0,05 kg, własna wygenerowana grafika /art/antibiotic.webp. Mieszkanie lub magazyn: 20% szans na dodatkową sztukę przy nowej wyprawie. Użyj zużywa jedną dawkę i leczy, po powrocie z plecaka lub skrytki; zdrowa postać nie traci dawki. Pozostałe zapasy bez nowych efektów.

Schemat v10: illness oraz health w wyprawie i raporcie. Migracja poprawnych v1–v9 zachowuje rzeczy, wyposażenie, terminy, zdarzenia i nagrody; dodaje illness:null i health:null dla starej historii. Nie nadpisuje błędnych ani nowszych zapisów. Stan i odliczanie widoczne we wszystkich zakładkach; mapa i przygotowanie uwzględniają dłuższy czas. Status wyliczany z czasu bez zapisów co sekundę, zegary zatrzymywane po wyzdrowieniu.

Weryfikacja: 178 testów i build. Progi ryzyka, ochrona kurtki, terminy i granice wyzdrowienia, leczenie i brak zużycia zdrowej postaci, ostatnia dawka, leczenie przed raportem, walidacja, migracja, przerwane transakcje i konflikt kart. Chromium: ukryty przyszły wynik, choroba po powrocie, raport/status, podgląd mapy i rzeczywista wyprawa 90 s, leczenie przez Użyj i trwałość, naturalne wyzdrowienie bez zapisu, kurtka, aktywna migracja v9; 320/390/768/1440 px bez przepełnienia i błędów JS. Bez fizycznego telefonu.

## Dziennik czterech celów

Dodatkowy widok otwierany z Kryjówki, bez zmiany pięciu głównych zakładek. Pierwsze zapasy (odbiór niepustego raportu), Miejsce do pracy (naprawa stołu po warsztacie), Przygotowany ocalały (założona kurtka), Rezerwa na jutro (jednocześnie 3 wody, 3 racje, 2 bandaże w skrytce). Kolejność dowolna, postęp trwały, bez dodatkowego losowania i bez kosztu oddawania zapasów. Robocze nagrody: 2 tkaniny / 1 antybiotyk / 2 racje / 4 złomu. Odbiór po powrocie, niezależny od poprzednich celów; nie wymaga pustego plecaka — zwykłe układanie do skrytki i overflow.

Schemat v11: quests.completed i quests.claimed, walidowane unikalne znane ID; nagroda wymaga zaliczonego celu. Centralny applyGameChange sprawdza osiągnięcia przed i po każdej komendzie gracza, dzięki czemu zużycie zapasów, zdjęcie kurtki lub zastąpienie raportu nie cofa celu. Znacznik odbioru i przedmioty zapisują się w jednej transakcji; konflikt kart nie powiela nagrody. Migracja v1–v10 rozpoznaje tylko dowody obecne w stanie: naprawę, założoną kurtkę, obecne zapasy oraz niepusty ostatni raport. Nie zgaduje wcześniejszych wypraw ani nie dopisuje nagród automatycznie. Nie zmienia terminów, choroby ani rzeczy.

Weryfikacja: 190 testów i build, w tym nowe przypadki zaliczenia, utrzymania osiągnięć, rozdzielonych stosów, pełnych siatek, migracji, błędnych ID, ponownego odbioru, konfliktu kart i przerwanej transakcji. Chromium: nowy dziennik, migracja v10, odbiór i trwałość nagrody po odświeżeniu, 320/390/768/1440 px bez przepełnienia i wyjątków JS. Bez fizycznego telefonu. Dalszy kierunek: rozbudowa kryjówki i receptury, następnie rozwój umiejętności — poza tym zleceniem.

## Usunięcie zwykłej choroby — aktualne ustalenie

Na polecenie użytkownika usunięto zwykłą chorobę: losowanie 50/50, ochronę kurtki, status i odliczanie, opisy w raporcie, leczenie oraz mnożnik czasu wypraw. Choroba popromienna ma być osobnym przyszłym etapem, bez implementacji teraz. Kurtka nadal jest wyposażeniem i zalicza cel dziennika.

Schemat v12: dawne pola illness i health mają wartość null; ich wcześniejszy kształt jest obsługiwany wyłącznie przy walidacji i migracji zapisów v10/v11. Aktywne lub zaplanowane zachorowanie jest usuwane, stara informacja zdrowotna raportu znika. Trwająca wyprawa rozpoczęta podczas choroby ma usunięte wydłużenie: powrót najpóźniej po bazowej minucie/dwóch od pierwotnego startu; terminy historycznych raportów nie zmieniają się. Łupy nie są losowane ponownie, zapasy, sprzęt, cele i odebrane nagrody pozostają.

Antybiotyk ze starego zapisu zostaje zachowany jako nieaktywny przedmiot, bez Użyj i nowych losowań. Walidacja nadal akceptuje go w już zapisanym łupie. Nagroda Miejsce do pracy zmieniona na 2 bandaże; odebrany wcześniej antybiotyk nie jest odbierany ani zamieniany i nie daje prawa do drugiego odbioru. Pozostałe trzy nagrody bez zmian.

Weryfikacja wycofania: 179 testów i build. Zastąpiono testy usuniętego leczenia regresjami braku ryzyka i migracji v10/v11; sprawdzono brak nowego antybiotyku, blokadę użycia, zachowanie rzeczy i nagród oraz pierwszy zapis po migracji i konflikt kart. Chromium: chora postać v11, usunięcie kary czasu i odbiór raportu, brak dawnych komunikatów, bazowy czas na mapie, zachowane antybiotyki bez Użyj, odświeżenie v12, szerokości 390/1440 px bez przepełnienia i wyjątków JS.

## Postać z widocznym wyposażeniem i animacją bezczynności

Zaakceptowany zakres: nowa dorosła sylwetka w nieprzezroczystych bokserkach i krótkiej, zużytej koszulce; warstwowe odwzorowanie czterech obecnych przedmiotów (hełm, kurtka, buty, łom) i podstawowego plecaka. Własny wygenerowany atlas 3×2 z przezroczystością, 1254×1254, około 188 KiB WebP; dopasowanie i kompozycja warstw w CSS. SurvivorFigure jest wspólnym komponentem Postaci i Ekwipunku, czyta wyłącznie faktyczne equipped, bez zmiany danych ani mechaniki zakładania. Plecak jest warstwą tylną, założoną na stałe. Rękawice i broń boczna nadal czekają na osobny etap. Przyszłe ubrania potrzebują nowych warstw; nie są automatycznie tworzone z ikon.

Spokojna animacja oddechu całej kompozycji (5,6 s), bez ruchu ramek, slotów i ikon. Obecny zakres nie obejmuje animacji szkieletowej, mrugania ani spacerowania. IntersectionObserver i visibilitychange zatrzymują animację poza widokiem i w ukrytej karcie; prefers-reduced-motion wyłącza ją całkowicie. Warstwy dekoracyjne ukryte przed czytnikiem, wspólny opis dostępności zawiera faktycznie widoczny sprzęt. Bez nowych zależności, zmian domeny ani schematu v12.

Weryfikacja: 179 testów i build. Chromium: obie zakładki, pełne wyposażenie, zdejmowanie wszystkich czterech rzeczy przyciskami, bazowa sylwetka na telefonie, ponowne zakładanie i odświeżenie z zachowaniem widocznego ubioru, ograniczenie ruchu, szerokości 320/390/768/1440 px bez przepełnienia i wyjątków JS. Obejrzano zrzuty bazowej i ubranej sylwetki; poprawiono dopasowanie kołnierza, hełmu i ręki z łomem. Bez fizycznego telefonu.

## Korekta dopasowania kurtki i widoczności oddechu

Po zgłoszeniu użytkownika zastąpiono warstwę pustej kurtki dopasowanym wariantem całej sylwetki z założoną kurtką (własna wygenerowana grafika survivor-jacket-worn.webp). Kołnierz dotyka szyi, rękawy i barki są narysowane na postaci. Pozostały sprzęt nadal nakłada się osobno. Przy butach dolna część bosego wariantu jest ukryta, aby palce nie wystawały poza obuwie. Bez zmiany wyposażenia lub zapisu gry.

Poprzedni oddech był zbyt subtelny (0,8% skali, 5,6 s). Zwiększono ruch do 2% pionowo, 0,8% poziomo i lekkiego kołysania, cykl 3,8 s. Przycisk Ruch jawnie steruje animacją w bieżącym widoku, początkowo uwzględnia systemowe ograniczenie ruchu. Zatrzymanie poza ekranem i ukrytą kartą zachowane. Przycisk jest poza rolą img i nie zasłania sylwetki ani slotów.

Weryfikacja: 179 testów i build; Chromium — rzeczywista zmiana macierzy transformacji w czasie, zatrzymanie/wznowienie przyciskiem, cztery elementy wyposażenia w obu widokach, zdjęcie i ponowne założenie, trwałość po odświeżeniu, szerokości 320/390/768/1440 px, brak wyjątków JS. Obejrzano poprawiony ubiór w zrzucie ekranu.

## Cywilna kurtka, rozluźnione dłonie i oddech bez rośnięcia

Na korektę użytkownika zastąpiono wojskowy wygląd kurtki cywilną, brązową kurtką na zamek, z dwoma bocznymi kieszeniami i łatą. Nowy własny atlas dwóch sylwetek (koszulka / kurtka), obie z rozluźnionymi dłońmi; nowa dopasowana ikona kurtki i warstwa chwytu łomu. Identyfikatory, stan, pozycje, rozmiary sprzętu oraz postęp gry bez zmian. Stary sprzęt zachowuje funkcje. Dłoń jest maskowana i zastępowana chwytem wyłącznie z założonym łomem.

Usunięto animację skalującą całą kompozycję. Głowa, nogi, stopy, dłonie i wyposażenie pozostają nieruchome. Oddycha wyłącznie osobna, płynnie maskowana warstwa klatki piersiowej z tym samym ubraniem: uniesienie do 0,45% wysokości i rozszerzenie klatki do 1,4%, cykl 4,2 s. Brak zmiany globalnego rozmiaru lub położenia postaci. Przycisk Ruch, uwzględnienie ustawień systemowych na wejściu i zatrzymanie poza ekranem zachowane.

Weryfikacja: 179 testów i build. Chromium: macierz transformacji klatki zmienia się w czasie, prostokąt całej sylwetki pozostaje identyczny; przycisk zatrzymuje i wznawia ruch. Obie zakładki, zdejmowanie i zakładanie wszystkich czterech rzeczy, powrót luźnej dłoni po zdjęciu łomu, odświeżenie, 320/390/768/1440 px bez przepełnienia i wyjątków JS. Obejrzano zrzuty cywilnej kurtki, chwytu i sylwetki bez wyposażenia. Bez fizycznego telefonu.

## Mruganie oczu — pierwszy etap mimiki

Zaakceptowany etap: mruganie, bez spojrzeń na boki ani obrotów głowy. Własny wygenerowany atlas survivor-blink.webp z zamkniętymi oczami w obu wariantach ubioru. Nad statyczną sylwetką pojawia się tylko mały, maskowany pasek powiek; ułożenie głowy, reszta twarzy, oddech i sprzęt bez zmian. Warstwa oczu jest pod hełmem — nie maluje powiek na jego daszku. Przy nisko położonym daszku oczy pozostają zasłonięte.

Jeden aktywny timeout: losowa przerwa 2800–7000 ms i zamknięcie 130 ms. Zatrzymanie/odmontowanie, wyłączenie Ruchu, zniknięcie z widoku lub ukrycie karty usuwa timeout i otwiera oczy. Brak zapisów gry, zmian schematu i zależności. Brak interwału działającego w tle.

Weryfikacja: 181 testów i build; dwa nowe testy schedulerów z kontrolowanym zegarem sprawdzają nieregularne przerwy, czas zamknięcia, pojedynczy timer i cleanup. Chromium: rzeczywiste mrugnięcie i otwarcie, identyczny prostokąt całej sylwetki, zatrzymanie ruchem, obie zakładki, 320/390/768/1440 px, bez wyjątków JS. Obejrzano powiększone powieki bez hełmu i warstwowanie z kurtką/hełmem. Bez fizycznego telefonu.

## Korekta maski mrugnięcia przy skroni

Po zgłoszeniu ruchu fragmentu twarzy przy lewym uchu zastąpiono szeroki poziomy pasek dwiema osobnymi, miękko wygaszanymi maskami eliptycznymi wokół powiek. Obszary skroni, uszu, nosa pomiędzy oczami i dolnej twarzy nie są już podmieniane. Grafika, scheduler, zapis gry i geometria postaci bez zmian.

Weryfikacja: 181 testów i build. Chromium: klatki z otwartymi i zamkniętymi oczami przy wyłączonym oddechu, oględziny powiększenia i analiza różnicy pikseli. Zmiana ograniczona do obszaru oczu (prostokąt 149,101–283,135 w zrzucie 412×320); obie skronie, uszy i dolna twarz są identyczne piksel po pikselu. Bez wyjątków JS.

## Zmiana podparcia — lewa noga / obie / prawa

Zaakceptowano spokojne przenoszenie ciężaru ciała pomiędzy trzema pozycjami. Wykorzystano rig 2D z aktualnej grafiki, bez nowych obrazów i bez skalowania całej postaci: osobne maskowane uda, łydki i stopy, tułów z niewielkim przesunięciem bioder i pochyleniem. Stopa podpierająca pozostaje zakotwiczona; noga odciążona lekko zmienia kąt w kolanie. Hełm, plecak, powieki, ubranie i cały łom z dłonią są we wspólnym układzie tułowia; buty i sloty pozostają nieruchome. Oddychanie i mruganie zachowane.

Jeden timeout zmienia pozycję po 5,5–9,5 s. Z pozycji jednostronnej następuje powrót na obie nogi, następny wybór lewej/prawej losowy. Transformacje fragmentów interpolowane przez 1,6 s. Wyłączenie Ruchu przywraca równą postawę bez przejścia; cleanup po ukryciu/odmontowaniu usuwa timeout, ukryta postać nie wykonuje przejść. Ustawienie systemowe ograniczenia ruchu nadal wyłącza całość na wejściu. Pozycja nie jest zapisywana i nie zmienia mechaniki, schematu ani zależności. Ruch spojrzeń pozostaje na przyszły etap.

Weryfikacja: 183 testy i build, w tym dwa nowe testy przejść przez pozycję równą i cleanup timera. Chromium: faktyczna zmiana po czasie, powrót po wyłączeniu, obie zakładki, trzy zrzuty pozycji, 320/390/768/1440 px bez przepełnienia i wyjątków JS. Buty mają identyczny prostokąt w każdej pozycji; analiza porównawcza potwierdziła identyczne piksele w obszarze stóp (z wyłączeniem otaczających kontrolek). Obejrzano stawy nóg i wyposażenie w trzech pozycjach. Bez fizycznego telefonu.

## Korekta podparcia — przestawianie stopy i narysowane klatki nóg

Poprzednia deformacja statycznych ud i łydek została wycofana po uwagach użytkownika o nienaturalnym wyglądzie i nieruchomych stopach. Nowy własny atlas survivor-steps.webp: pięć klatek (równo, uniesienie przed lewym podparciem, lewe podparcie, uniesienie przed prawym, prawe podparcie), osobny rząd z butami i bez butów. Tylko dolna część nowych klatek jest używana; twarz, powieki, ręce, cywilna kurtka i pozostały sprzęt zachowują dotychczasowy wygląd. Rejestrację klatek dopasowano indywidualnie do tułowia; maski usuwają ręce narysowane w dolnym atlasie. Nie ma już skew ani skalowania poszczególnych nóg.

Sekwencja: odpoczynek 5,5–9,5 s → uniesienie odciążonej stopy przez 600 ms → ustawienie w nowym miejscu i odpoczynek. Powrót do równomiernego podparcia również przez klatkę uniesienia. Krótkie przenikanie klatek 180 ms i dopasowany ruch tułowia 600 ms. To prototypowa animacja klatkowa 2D, nie ciągły model fizyczny ani animacja 3D. Wyłączenie ruchu, niewidoczność i odmontowanie przerywają oczekujący krok i wracają do pozycji równej. Bez zmian danych i zasad gry.

Weryfikacja: 183 testy i build. Zaktualizowane testy sekwencji sprawdzają uniesienie przed postawieniem stopy i przed powrotem, obie strony oraz przerwanie w środku kroku bez pozostawiania timerów. Chromium: pięć klatek, zmiana po rzeczywistym czasie, wyłączenie, obie zakładki, 320/390/768/1440 px bez przepełnienia i wyjątków JS. Obejrzano pozycje z butami i bez oraz połączenie z tułowiem. Bez fizycznego telefonu.

## Wycofanie nieudanej animacji zmiany podparcia

Po zgłoszeniu użytkownika, że grafika się rozjechała, wycofano oba eksperymenty z ruchem nóg: deformowanie fragmentów i podmianę dolnej części ilustracji klatkami. Wcześniejsza weryfikacja techniczna nie potwierdzała spójności animacji wizualnej; pozytywne testy nie były wystarczającym kryterium jej akceptacji. Przywrócono SurvivorFigure i CSS z 6f9dec6, czyli spójną sylwetkę sprzed ruchu nóg, z cywilną kurtką, luźnymi dłońmi, widocznym wyposażeniem, oddechem klatki i poprawioną maską mrugania. Usunięto nieużywany scheduler, jego testy i atlas kroków. Żadne dane gry nie są zmieniane.

Naturalne przestawianie stóp pozostaje niezrealizowanym celem. Wymaga jednej spójnej animowanej sylwetki z dopasowanym wyposażeniem, a nie łączenia niezgodnych części różnych klatek. Nie oznaczać tego celu jako ukończonego na podstawie samych testów technicznych.

Weryfikacja wycofania: 181 testów i build. Chromium: oba widoki, pełne wyposażenie, zdejmowanie i ponowne zakładanie, odświeżenie, ruch klatki bez zmiany rozmiaru całej postaci, przycisk Ruch, 320/390/768/1440 px bez wyjątków JS i przepełnienia. Obejrzano przywróconą sylwetkę. Testy dotyczą przywróconej funkcjonalności, nie realizacji naturalnego ruchu nóg.

## Receptury bandaży i zakres skrytki — korekta użytkownika

Na razie pozostaje jedna skrytka 8×9. Nie dodawać teraz kolejnej; przyszłe skrytki nie będą budowane z tkaniny. Ich materiałów i kosztów jeszcze nie ustalono. Nie dotyczy to obecnej naprawy stołu, której koszt pozostaje bez zmian.

Bandaże nie wymagają wody. Podstawowa receptura już używała wyłącznie 2 tkanin na 1 bandaż. Usunięto 1 wodę z receptury zestawu opatrunków po naprawie stołu: teraz 2 tkaniny → 3 bandaże. Dotychczasowe ilości tkanin i wyników zachowane jako parametry prototypu; wyższa wydajność po naprawie stołu bez dodatkowej mechaniki sterylizacji. Widok kosztów i opis w kryjówce zgodne z recepturą. Zapis i dotychczasowe przedmioty bez zmian.

Weryfikacja korekty receptur: 184 testy i build. Nowe regresje obejmują obie receptury bez posiadania wody oraz zachowanie całego zapasu wody podczas przygotowania zestawu opatrunków. Istniejące blokady naprawy stołu i używania surowców z ekwipunku pozostają aktywne.

## Pierwszy handlarz i ikonki składników

Użytkownik zaakceptował propozycję pierwszego handlarza oraz doprecyzował, że składniki receptur mają być ikonami zamiast wypisanych nazw. ResourceIcons pokazuje posiadane/wymagane i wynik, braki wyróżnione; nazwa i opis dostępne na hover/focus/dotyk w istniejącym popoverze. Ilości liczone z plecaka. Bez zmian kosztów i wyników, bez wody w bandażach.

Handlarz otwierany z Kryjówki jako widok pomocniczy, bez zmiany pięciu zakładek. Lokalny barter wybranej ilości jednego stosu/egzemplarza na wodę, rację lub bandaż, dokładna oferta przed kliknięciem. Wyłącznie rzeczy w inventory; wyposażenie, stały plecak, stash, overflow i nieaktywny antybiotyk wyłączone. Dostęp po powrocie. Wynik układany normalnie, z zabezpieczeniem w skrytce i overflow. Operacja i zapas NPC zapisywane atomowo przez istniejący port z kontrolą konfliktu kart.

GDD §14 zakłada rynek graczy, NPC jako pośrednika i ograniczony budżet, nie nieskończonego kupca. Zatwierdzony teraz pierwszy handlarz jest ograniczonym prototypem barteru, a nie implementacją docelowego rynku. Zapas jednorazowy: woda6, racja4, bandaż4, bez automatycznego odnawiania. Bez waluty i serwera. Robocza jednostka wyceny wyłącznie wewnętrzna: złom1, tkanina2, składniki/raw-water1, woda1, racja/bandaż2, hełm/buty8, kurtka/łom10; sprzęt mnożony przez stan i zaokrąglony w dół. Koszt jednostki zapasu: woda3/racja4/bandaż5. Wynik floor(wartość ilości/koszt), brak reszty; gracz widzi konkretne przedmioty i ilości. Te liczby są balansem prototypowym, nie ustalonymi cenami rynku.

Schemat v13 dodaje trader.stock. Walidacja wymaga znanych trzech kluczy i bezpiecznych całkowitych ilości 0..początkowy zapas. Migracja v1–v12 zachowuje rzeczy, questy, wyposażenie i trwające wyprawy. Odczyt v13 nie resetuje wyczerpanego zapasu; błędny/nowszy zapis nadal nie jest nadpisywany.

Weryfikacja: 198 testów i build. Nowe testy: konkretny egzemplarz, ilość części stosu, stan sprzętu, zły koszt/ilość/towar, wyposażenie/skrytka/plecak, podróż, pusty zapas, pełne siatki i overflow, migracja i uszkodzone dane, konflikt dwóch kart i przerwanie transakcji. Chromium: ikony receptur i otwarcie opisu, migracja v12 i realna wymiana 3 złomu na 1 wodę, zapis ilości i zapasu po odświeżeniu, receptury i handlarz 320/390/768/1440 px bez przepełnienia i wyjątków JS. Obejrzano oba nowe widoki. Bez fizycznego telefonu.

## Przeniesienie NPC do osobnej bezpiecznej lokalizacji

Korekta użytkownika: handlarz nie przebywa w prywatnej Kryjówce. Osobny duży bezpieczny budynek na mapie, usługi i mieszkańcy wewnątrz; docelowo wiele różnych NPC. Roboczo Przystań, dawny dom kultury w południowo-wschodniej części dzielnicy, punkt mapy x62%/y75%. Własna wygenerowana ilustracja zamieszkanego holu, bez kopiowania lokacji lub postaci ze Stalkera. Wewnątrz Handlarz z istniejącym barterem, Mira przy radiu i Dozorca przy wejściu z krótkimi rozmowami. Pozostałe funkcje NPC nie są wdrożone; struktura mieszkańców rozszerzalna.

Usunięto kartę i odnośnik handlarza z Kryjówki. Wejście: Mapa → Przystań → osoba → oferta/rozmowa. Pomocnicze widoki Przystani i handlu podświetlają Mapę, pięć głównych zakładek bez zmian. Oferta również pokazuje wnętrze budynku i wraca do wspólnego holu. Brak bezpośredniego otwierania prywatnej skrytki z oferty NPC. Przystań nie jest trzecim celem automatycznej wyprawy ani źródłem łupu; wybrana wyprawa pozostaje zachowana. Na tym etapie wejście nawigacyjne, bez osobnego czasu podróży i bez zapisywania fizycznej pozycji bohatera. Nie dodano depozytów regionalnych, obecne reguły układania nagród z barteru pozostają.

Wstęp do budynku i barter wymagają zakończenia aktywnej wyprawy oraz odbioru raportu. Zablokowano także przypadek, kiedy termin już minął, ale raport nadal czeka. Zapasy istniejącego handlarza, ceny, rzeczy i zapis v13 pozostają bez zmian — NPC jest przenoszony, nie tworzony ponownie z pełnym zapasem.

Weryfikacja: 199 testów i build. Nowa regresja dostępu po odbiorze raportu. Chromium: brak handlarza w Kryjówce, wejście z mapy, trzy rozmowy, oferta wewnątrz budynku bez dostępu do skrytki, rzeczywista wymiana i trwałość wcześniej uszczuplonego zapasu po odświeżeniu, zachowanie celu wyprawy. Blokada wejścia przy nieodebranym raporcie, nawet po terminie. Mapa i Przystań: 320/390/768/1440 px bez przepełnienia i wyjątków JS; obejrzano wnętrze na telefonowym widoku. Bez fizycznego telefonu.

## Surowszy wygląd Przystani i mieszkańców

Na korektę użytkownika przerobiono własną ilustrację wnętrza: usunięto przytulne dywany, rośliny dekoracyjne i nadmiernie schludny ubiór. Dodano łatane, przetarte ubrania, pasy i ładownice, zużyte buty, rękawice, maski podniesione na głowę z widocznymi twarzami, broń noszoną na pasach/kaburze. Wnętrze: błoto, popękane płytki, sadza, rdza, prowizoryczna instalacja i akumulatory, worki z piaskiem i wzmocnione drzwi. Chłodniejsze, przygaszone światło z lokalnym ciepłem pieca i lamp roboczych. Zachowano duży budynek, układ trzech NPC i bezpieczny charakter miejsca; to scena wewnątrz, nie targ na zewnątrz.

Zaktualizowano opisy NPC, tekst przy wejściu i teksty alternatywne. Ilustracja wspólna dla holu i widoku oferty. Wyłącznie zmiana wyglądu i opisów, bez funkcji walki/skażenia, nowych przedmiotów, zmian barteru, zapasów lub zapisu.

Doprecyzowanie użytkownika w trakcie korekty: to współczesny świat po apokalipsie. Aktualna, ostateczna wersja sceny zastępuje historycznie wyglądające ubrania i rekwizyty współczesną odzieżą outdoorową/taktyczną, nylonowymi pasami i klamrami, nowoczesną bronią z tworzyw, maskami przemysłowymi z wymiennymi filtrami podniesionymi na głowę, cyfrową radiostacją, laptopem, krótkofalówką, przetwornicą, modułami akumulatorów i lampami LED. Stare mury i mural mogą pozostać architekturą; bohaterowie mają współczesny, zużyty ekwipunek. Stosować tę zasadę do kolejnych grafik świata i postaci, nie postarzać epoki przedmiotów wraz ze śladami użytkowania. Opisy NPC dostosowane.

Weryfikacja korekty wyglądu: 199 testów i build; Chromium — wejście do holu, trzy rozmowy, oferta i działający barter, trwałość zapasu, blokada przed odbiorem raportu, 320/390/768/1440 px bez przepełnienia i wyjątków JS. Obejrzano ostateczną współczesną ilustrację w aplikacji. Bez fizycznego telefonu.

## Ograniczenie oddechu do środka klatki piersiowej

Po zgłoszeniu powiększania rąk przy oddychaniu zastąpiono maskę pełnej szerokości poziomego pasa maską eliptyczną, skupioną na środku tułowia (promienie 12,5% szerokości i 15% wysokości). Kopia animowanej grafiki nie obejmuje już ramion ani dłoni. Parametry oddechu, ubranie, chwyt łomu, mruganie i zapis gry pozostają bez zmian.

Weryfikacja: 199 testów i build. Chromium: zatrzymanie animacji w fazach 0 i 2100 ms, osobno koszulka oraz kurtka z łomem. Porównano piksele zrzutów: różnice tylko w środkowym obszarze klatki, ramiona/dłonie, głowa i dół postaci identyczne. Obejrzano klatkę maksymalnego wdechu, brak animacji całej sylwetki i wyjątków JS. Bez fizycznego telefonu.
