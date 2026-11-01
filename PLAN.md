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
