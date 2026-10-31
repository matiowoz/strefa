# STREFA

Fundament prototypu mobilnego idle survival RPG. Etap 3: przygotowanie wyprawy, lokalny zapis, zapasy i proste receptury; bez walki.

Praca z telefonu przy wyłączonym komputerze: zobacz CLOUD.md. Dokumentacja projektu: docs/GDD.pdf i tekst pomocniczy docs/GDD.md.

## Windows

Zainstaluj Node.js **22.12 lub nowszy** (polecana linia 24 LTS). Otwórz PowerShell w tym folderze:

```powershell
npm.cmd ci
npm.cmd run dev
```

Otwórz adres wypisany przez Vite, zwykle http://localhost:5173. `npm.cmd` omija ewentualną blokadę skryptu npm.ps1 bez zmieniania polityki PowerShell. Nie uruchamiaj index.html dwuklikiem.

## Windows — aktualizacja i start dwuklikiem

W folderze projektu otwórz **Uruchom STREFĘ.cmd**. Potrzebujesz Git for Windows, Node.js (polecany 24 LTS), Internetu i dostępu do prywatnego repozytorium GitHub. Przy pierwszym logowaniu Git może otworzyć przeglądarkę.

Plik wymaga gałęzi `main` i czystego katalogu (także bez dodatkowych nieignorowanych plików). Pobiera `origin/main` i aktualizuje tylko przez fast-forward; nie usuwa Twoich zmian ani lokalnych commitów. Po udanej aktualizacji wykonuje `npm ci --include=optional`, a następnie uruchamia Vite i otwiera **http://localhost:5173**. Błąd na dowolnym kroku zatrzymuje dalszą pracę; okno pozostaje z komunikatem. Nie omija weryfikacji TLS. Skrypt PowerShell uruchamia się z polityką ustawioną tylko dla tego procesu, bez zmiany ustawień systemu.

W nowej wersji **Ctrl+C** zatrzymuje serwer i pokazuje menu w tym samym oknie:

- **U + Enter** — sprawdź aktualizacje, zainstaluj zależności i uruchom grę ponownie.
- **Z + Enter** — zamknij program.

Przy błędzie aktualizacji lub instalacji menu również pozostaje dostępne; kolejne kroki nie są wykonywane. Inne odpowiedzi ponawiają pytanie. Serwer działa jako własny proces Node, a jego wejście jest odłączone od klawiatury; Ctrl+C obsługuje launcher, zatrzymując tylko ten proces i jego potomków. Nie ma pytania CMD o zakończenie całego pliku wsadowego. Kontrola lokalnych zmian i zajętego portu powtarza się przed każdym U. Blokada drugiego launchera obejmuje całą sesję, także menu.

**Pierwsze wczytanie menu:** pobierz aktualizację dotychczasowym plikiem, zamknij go i otwórz ponownie — kod PowerShell jest wczytywany do pamięci na początku. Dotyczy to również przyszłych zmian samego launchera. Zwykłe aktualizacje gry wymagają już tylko Ctrl+C, U i Enter.

Zanim uruchomisz osobne okno programu, zakończ poprzednią sesję przez Ctrl+C, a następnie Z. Drugie uruchomienie tego samego pliku jest blokowane, dopóki pierwsze działa. Serwer uruchomiony ręcznie trzeba zatrzymać samodzielnie. Zajęty port 5173 powoduje błąd zamiast przełączenia portu i otwarcia innego zapisu gry. Wcześniejszy zapis spod `127.0.0.1:5173` nie jest tym samym zapisem co `localhost:5173`.

Plik trzeba pobrać jednorazowo poleceniem `git pull --ff-only` z folderu `strefa-aktualna`. Później wystarczy dwuklik po każdym wysłaniu zmian na GitHub. Sam plik nie publikuje gry w Internecie.

## Telefon w tej samej sieci

1. Połącz komputer i telefon z tą samą zaufaną siecią Wi-Fi.
2. W folderze projektu uruchom `npm.cmd run dev:lan`.
3. Otwórz na telefonie adres **Network** wypisany przez Vite, np. `http://192.168.1.10:5173`. Nie wpisuj localhost na telefonie. Port może być inny, jeśli domyślny jest zajęty.
4. Jeśli Windows zapyta o zaporę, zezwól Node.js na dostęp tylko w zaufanej sieci prywatnej. W razie braku połączenia sprawdź profil sieci, VPN i izolację urządzeń w routerze. Nie wyłączaj całej zapory i nie przekierowuj portów routera.

Zatrzymanie serwera: Ctrl+C. Jest to podgląd deweloperski w sieci lokalnej, bez tunelu ani publicznej publikacji. IndexedDB działa w nowoczesnej przeglądarce także przy takim podglądzie HTTP, lecz nie dodano PWA ani instalacji offline aplikacji.

## Sprawdzenie

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

`build` sprawdza TypeScript i tworzy dist/. `preview` służy wyłącznie do lokalnej kontroli kompilacji.

## Zapis i szybki test ręczny

1. Domyślnie otwiera się Kryjówka. Można zwinąć jej panel i przejść do pozostałych ekranów.
2. W Postaci sprawdź zachowaną nazwę i zdrowie. Zmiana nazwy jest wyłączona.
3. Na Mapie wybierz drugi punkt i odśwież stronę. Aplikacja wróci do Kryjówki, ale nazwa i wybrany cel pozostaną.
4. W Wyprawach sprawdź cel i czas, a wybierz zestaw zapasów i opcjonalnie plecak, następnie rozpocznij wyprawę. Osiedle trwa minutę, warsztat dwie; to parametry demonstracyjne.
5. Odśwież lub zamknij grę i wróć po terminie. W Wyprawach odbierz raport i nagrodę. Znaleziska w Ekwipunku pojawią się raz; raport pozostanie po odświeżeniu. Następna wyprawa jest dostępna po odbiorze poprzedniej.
6. Sprawdź, że woda i racje zostały pobrane raz przy starcie; plecak pozostaje bez zmian. W Ekwipunku z surowców z wyprawy uzdatnij wodę i przygotuj rację. Po dwóch wyprawach wystarczy tkaniny na bandaż. Widać koszt i wynik każdej receptury. Brak zasobów blokuje operację.
7. Przy błędzie zapisu zmiana nie zostaje zastosowana; ponów odbiór. Przy konflikcie z inną kartą odśwież stronę.

Zapis: IndexedDB, baza `strefa-prototype`, magazyn `saves`, klucz `main`, schemat stanu v7 (migracja poprawnych v1, v2, v3, v4, v5 i v6 bez utraty postępu, bez nowych kosztów dla już rozpoczętych wypraw). Sukces zapisu jest ogłaszany po zatwierdzeniu transakcji. Nieprawidłowe dane i nieobsługiwane wersje pozostają nietknięte; aplikacja pokazuje błąd zamiast cicho tworzyć nową grę. Odmowa dostępu do IndexedDB również daje widoczny błąd.

Zapis jest osobny dla urządzenia, przeglądarki i adresu z portem. localhost i adres LAN mają różne zapisy; telefon nie współdzieli zapisu komputera. Czyszczenie danych witryny lub tryb prywatny może usunąć postęp. Brak synchronizacji, eksportu i kopii chmurowej. Nieaktualny zapis z drugiej karty jest odrzucany atomowo; odśwież ją przed kolejną zmianą. Czas wypraw opiera się na zegarze urządzenia, bez zabezpieczeń serwerowych.

## Struktura i zależności

```text
src/
  domain/       typy, minimalny katalog, czyste reguły, walidacja
  persistence/  adapter IndexedDB implementujący GameRepository
  app/          odczyt i polecenia zapisu dla Reacta
  ui/           pięć widoków i CSS
  main.tsx      punkt połączenia adaptera i aplikacji
```

Bez routera, globalnego store, biblioteki CSS, ikon ani wrappera IndexedDB. Pięć widoków nie wymaga jeszcze tras URL. React i ReactDOM to zależności aplikacji. Vite, TypeScript i typy służą kompilacji. Vitest oraz fake-indexeddb są wyłącznie do testów; emulacja nie zastępuje testu przeglądarki.

PLAN.md określa dalsze etapy i ograniczenia względem GDD 1.1. AGENTS.md zawiera reguły pracy. Lista dokładnych wersji jest w package.json i package-lock.json.

## Uproszczenia przygotowania

Postać wyrusza ze wszystkimi przedmiotami z obecnego ekwipunku. Nie wybiera zestawu ani ilości zapasów, a start niczego nie zużywa. Zawartość skrytki zostaje w kryjówce. Brak głodu i pragnienia upływającego podczas nieobecności. Podstawowy plecak jest założony na stałe poza siatką i nie można go zdjąć; wymiana na większy to przyszły etap. Receptury wykonują się od razu: 1 woda do uzdatnienia → 1 woda, 1 składnik żywnościowy → 1 racja, 2 czyste tkaniny → 1 bandaż. Naprawiony stół odblokowuje zestaw opatrunków: 2 tkaniny + 1 woda → 3 bandaże. Są to robocze parametry opisane w PLAN.md.

## Ekwipunek i schowek

Ekwipunek postaci ma 5 kolumn i 9 rzędów. Schowek w kryjówce ma jedną siatkę 8×9. Obie siatki mają identyczne kratki 52 px. Przedmioty zajmują prostokąty różnych rozmiarów; szczegóły pokazują ich wymiary i ilość. Maksymalny rozmiar przedmiotu to 2×3. Ilość pozostaje stosem (bez nowych limitów stosowania).

Przeciągnij rzecz na siatkę: podgląd centruje się pod kursorem bez zmiany wymiarów, a upuszczanie działa też na liniach i między kratkami. Alternatywnie wybierz rzecz, kliknij „Zmień położenie” i wskaż pole. Przyciski pod szczegółami przenoszą do ekwipunku lub schowka, szukając pierwszego wolnego miejsca. Za mało miejsca lub kolizja pozostawia przedmiot na miejscu bez komunikatu o błędzie. Błędy rzeczywistego zapisu lub odczytu nadal są zgłaszane. Na małych ekranach schowek przewija się poziomo. Przenoszenie wymaga powrotu do kryjówki. Założony plecak nie jest przedmiotem do przenoszenia.

Receptury korzystają wyłącznie z rzeczy przy postaci; surowce ze schowka trzeba najpierw przenieść. Znaleziska i wyniki receptur najpierw trafiają do ekwipunku, następnie do wolnych miejsc schowka, a przy braku miejsca do bezpiecznego odbioru. Odbiór służy wyłącznie zabezpieczeniu wyników i migracji — nie można odkładać tam rzeczy. Stare zapisy zachowują całą zawartość, nazwę i aktywną wyprawę. Wyprawy nadal nie pokazują przyszłych zdobyczy.

Stosy większe niż 1 sztuka mają przycisk „Rozdziel” w opisie po najechaniu i w szczegółach. Wybierz ilość od 1 do liczby sztuk pomniejszonej o 1. Nowy stos zajmuje osobny prostokąt w tej samej siatce; przy braku miejsca stan pozostaje bez zmian. Podział jest dostępny po powrocie do kryjówki i zachowuje łączną liczbę przedmiotów.

W przyszłości będzie możliwość budowania kolejnych skrytek. Obecnie jest jedna; nie ma stron, zakupów ani płatności. Rzeczy z dawnej drugiej strony są przenoszone do wolnych miejsc schowka, a jeśli się nie mieszczą, pozostają w bezpiecznym odbiorze.

## Ilustrowana kryjówka

Główny ekran przedstawia schronienie postapo. Pod ilustracją przejdziesz do przygotowania wyprawy lub mapy. Zwijany panel pokazuje bohatera i zdrowie, stan wyprawy oraz rzeczywiste ilości wody i racji w magazynie. Odliczanie zmienia się w „Raport czeka” po terminie; odbiór nadal następuje na ekranie Wyprawy. Po powrocie z warsztatu i odbiorze raportu naprawisz stół za 6 złomu i 2 tkaniny z ekwipunku lub skrytki. Naprawa zmienia ilustrację pokoju i odblokowuje recepturę zestawu opatrunków w Ekwipunku. Radio jest dekoracją oznaczoną jako funkcja w przygotowaniu. Ilustracja pokoju jest poglądowa; widoczne przedmioty nie oznaczają dodatkowych zasobów ani aktywnych pomieszczeń.

## Mapa okolicy

Na papierowym planie wybierz osiedle lub warsztat, albo użyj listy pod mapą. Wybór zapisuje się od razu; panel pokazuje ilustrację miejsca, czas oraz informację o zabieranym ekwipunku. Przycisk „Przygotuj wyprawę” przenosi do istniejącego planowania, nie rozpoczyna podróży. Znacznik kryjówki wraca do głównego ekranu. Podczas aktywnej wyprawy mapa wybiera tylko następny cel, bez zmiany trwającej wyprawy i bez pobierania zapasów.

## Wyprawa i raport

Przygotowanie pokazuje cel, czas oraz informację o zabraniu obecnego ekwipunku. Mapa, plan oraz trwająca wyprawa nie pokazują przyszłych zdobyczy. Odbiór po terminie zapisuje znaleziska i rozliczony raport z ilustracjami przedmiotów oraz zestawieniem zużycia. Ostatni rozliczony raport pozostaje dostępny jako historia, również podczas kolejnej wyprawy; nie jest prognozą nowych nagród. Wynik jest losowany i zapisywany raz przy starcie: ilości znalezisk są zmienne, a powrót może być pusty. Odświeżanie i późniejszy odbiór nie zmieniają wyniku. Wcześniej rozpoczęte wyprawy zachowują dawne łupy i koszty.

## Bohater i tło strony

Karta Bohatera pokazuje ilustrację poglądową, faktyczne zdrowie, poziom, pseudonim i osiem zapisanych wartości umiejętności. Rozwój i premie nie są jeszcze aktywne. Zmiana pseudonimu jest wyłączona; dotychczasowa nazwa pozostaje. Podgląd plecaka odzwierciedla wybór na następną lub wyposażenie aktywnej wyprawy; przycisk prowadzi do Ekwipunku. Wszystkie ekrany mają wspólne tło zużytego betonu, bez zmiany danych gry.

## Kolejność nawigacji

Postać → Ekwipunek → Kryjówka → Wyprawy → Mapa. Kryjówka pozostaje ekranem początkowym. W kryjówce przycisk „Otwórz schowek” przechodzi do widoku z obiema siatkami.

## Opisy po najechaniu i używanie

Siatki nie pokazują nazw pod ilustracjami — nazwa i opis pojawiają się w interaktywnym okienku po najechaniu, ustawieniu fokusu lub dotknięciu przedmiotu. Woda, racje i bandaże mają przycisk „Użyj”: na tym etapie zużywa on jedną sztukę, bez zmiany zdrowia ani innych statystyk. Po ostatniej sztuce pola zostają zwolnione. Używanie jest dostępne po powrocie do kryjówki.

„Ekwipunek” w nawigacji pokazuje wyłącznie rzeczy przy postaci, bez przycisku „Do skrytki”. Skrytkę otworzysz z Kryjówki przyciskiem „Otwórz skrytkę”; w jej widoku widać obie siatki, a obok „Użyj” dostępny jest transfer „Do skrytki” (dla rzeczy przy postaci) lub „Do ekwipunku” (dla rzeczy w skrytce). Przenoszenie i centrowany podgląd zachowują dotychczasowe rozmiary. Szczegóły z układaniem klawiaturą pozostały w zwijanej sekcji.
