# STREFA

Prototyp mobilnego idle survival RPG: wyprawy ze zdarzeniami, ekwipunek, skrytka, naprawa stołu i proste receptury. Lokalny zapis, bez walki.

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

Plik wymaga gałęzi `main` i czystego katalogu (także bez dodatkowych nieignorowanych plików). Pobiera `origin/main` i aktualizuje tylko przez fast-forward; nie usuwa Twoich zmian ani lokalnych commitów. Po udanej aktualizacji wykonuje `npm ci --include=optional`, a następnie uruchamia Vite dla komputera i urządzeń w tej samej sieci (`--host 0.0.0.0`, stały port 5173) i otwiera na komputerze **http://localhost:5173**. W oknie pokazuje instrukcję oraz adresy **Network** dla telefonu. Błąd na dowolnym kroku zatrzymuje dalszą pracę; okno pozostaje z komunikatem. Nie omija weryfikacji TLS. Skrypt PowerShell uruchamia się z polityką ustawioną tylko dla tego procesu, bez zmiany ustawień systemu.

W nowej wersji **Ctrl+C** zatrzymuje serwer i pokazuje menu w tym samym oknie:

- **U + Enter** — sprawdź aktualizacje, zainstaluj zależności i uruchom grę ponownie.
- **Z + Enter** — zamknij program.

Przy błędzie aktualizacji lub instalacji menu również pozostaje dostępne; kolejne kroki nie są wykonywane. Inne odpowiedzi ponawiają pytanie. Serwer działa jako własny proces Node, a jego wejście jest odłączone od klawiatury; Ctrl+C obsługuje launcher, zatrzymując tylko ten proces i jego potomków. Nie ma pytania CMD o zakończenie całego pliku wsadowego. Kontrola lokalnych zmian i zajętego portu powtarza się przed każdym U. Blokada drugiego launchera obejmuje całą sesję, także menu.

**Pierwsze wczytanie menu:** pobierz aktualizację dotychczasowym plikiem, zamknij go i otwórz ponownie — kod PowerShell jest wczytywany do pamięci na początku. Dotyczy to również przyszłych zmian samego launchera. Zwykłe aktualizacje gry wymagają już tylko Ctrl+C, U i Enter.

Zanim uruchomisz osobne okno programu, zakończ poprzednią sesję przez Ctrl+C, a następnie Z. Drugie uruchomienie tego samego pliku jest blokowane, dopóki pierwsze działa. Serwer uruchomiony ręcznie trzeba zatrzymać samodzielnie. Zajęty port 5173 powoduje błąd zamiast przełączenia portu i otwarcia innego zapisu gry. Wcześniejszy zapis spod `127.0.0.1:5173` nie jest tym samym zapisem co `localhost:5173`.

Plik trzeba pobrać jednorazowo poleceniem `git pull --ff-only` z folderu `strefa-aktualna`. Później wystarczy dwuklik po każdym wysłaniu zmian na GitHub. Sam plik nie publikuje gry w Internecie.

## Telefon w tej samej sieci

1. Połącz komputer i telefon z tą samą zaufaną siecią Wi-Fi.
2. Uruchom **Uruchom STREFĘ.cmd**. Po pierwszej aktualizacji do wersji z obsługą Wi-Fi zamknij launcher i otwórz go ponownie. Alternatywnie w folderze projektu uruchom `npm.cmd run dev:lan`.
3. Otwórz na telefonie adres **Network** wypisany przez Vite, np. `http://192.168.1.10:5173`. Nie wpisuj localhost na telefonie. Launcher zawsze używa portu 5173; ręczne `dev:lan` może wybrać inny, jeśli port jest zajęty.
4. Jeśli Windows zapyta o zaporę, zezwól Node.js na dostęp tylko w zaufanej sieci prywatnej. W razie braku połączenia sprawdź profil sieci, VPN i izolację urządzeń w routerze. Nie wyłączaj całej zapory i nie przekierowuj portów routera.

Komputer musi być włączony, a okno serwera otwarte. Telefon ma osobny zapis gry; zmiana adresu IP komputera również zmienia adres zapisu na telefonie.

Zatrzymanie serwera: Ctrl+C (w launcherze otwiera menu U/Z). Jest to podgląd deweloperski w sieci lokalnej, bez tunelu ani publicznej publikacji. IndexedDB działa w nowoczesnej przeglądarce także przy takim podglądzie HTTP, lecz nie dodano PWA ani instalacji offline aplikacji.

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
4. W Wyprawach sprawdź cel i czas, następnie rozpocznij wyprawę z obecnym ekwipunkiem. Osiedle trwa minutę, warsztat dwie; to parametry demonstracyjne.
5. Odśwież lub zamknij grę i wróć po terminie. W Wyprawach odbierz raport i nagrodę. Znaleziska w Ekwipunku pojawią się raz; raport pozostanie po odświeżeniu. Następna wyprawa jest dostępna po odbiorze poprzedniej.
6. Sprawdź, że start nie zużył wody ani racji, a plecak pozostaje założony. W raporcie przeczytaj zdarzenia i sprawdź znaleziska. Gdy znajdziesz surowce, w Ekwipunku uzdatnij wodę, przygotuj rację lub bandaż. Widać koszt i wynik każdej receptury. Brak zasobów blokuje operację.
7. Przy błędzie zapisu zmiana nie zostaje zastosowana; ponów odbiór. Przy konflikcie z inną kartą odśwież stronę.

Zapis: IndexedDB, baza `strefa-prototype`, magazyn `saves`, klucz `main`, schemat stanu v12 (migracja poprawnych v1–v11 bez utraty postępu, bez nowych kosztów dla już rozpoczętych wypraw). Sukces zapisu jest ogłaszany po zatwierdzeniu transakcji. Nieprawidłowe dane i nieobsługiwane wersje pozostają nietknięte; aplikacja pokazuje błąd zamiast cicho tworzyć nową grę. Odmowa dostępu do IndexedDB również daje widoczny błąd.

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

Zakładka Ekwipunek pokazuje postać ze slotami przy sylwetce i siatkę przedmiotów po prawej, we wspólnej ramie. Bez powtórzonej nazwy postaci, „Karty ocalałego” i nagłówków „Ekwipunek postaci”. Na hełm, ubranie, buty i broń główną można zakładać pasujące przedmioty znalezione podczas nowych wypraw. Przeciągnij sprzęt z plecaka do slotu albo użyj „Załóż” w opisie. Zdejmij go na puste pola plecaka albo przyciskiem „Zdejmij”. Przy wymianie poprzedni egzemplarz wraca do zwolnionych pól lub innego wolnego miejsca; gdy się nie mieści, zmiana nie jest stosowana. Pełny plecak nie przenosi zdejmowanych rzeczy automatycznie do skrytki ani odbioru. Rękawice i broń boczna pozostają w przygotowaniu. Plecak jest nadal założony na stałe. Na wąskich ekranach siatka znajduje się pod postacią. Pomoc przenoszenia jest zwijana; zakładka Postać zachowuje dane bohatera.

Ekwipunek postaci ma 5 kolumn i 9 rzędów. Schowek w kryjówce ma jedną siatkę 8×9. Obie siatki mają identyczne kratki 52 px. Przedmioty zajmują prostokąty różnych rozmiarów; szczegóły pokazują ich wymiary i ilość. Maksymalny rozmiar przedmiotu to 2×3. Zapasy i materiały pozostają stosami (bez nowych limitów stosowania), a sprzęt to osobne egzemplarze z własnym ID i stanem.

Przeciągnij rzecz na siatkę: podgląd centruje się pod kursorem bez zmiany wymiarów, a upuszczanie działa też na liniach i między kratkami. Alternatywnie wybierz rzecz, kliknij „Zmień położenie” i wskaż pole. Przyciski pod szczegółami przenoszą do ekwipunku lub schowka, szukając pierwszego wolnego miejsca. Za mało miejsca lub kolizja pozostawia przedmiot na miejscu bez komunikatu o błędzie. Błędy rzeczywistego zapisu lub odczytu nadal są zgłaszane. Na małych ekranach schowek przewija się poziomo. Przenoszenie wymaga powrotu do kryjówki. Założony plecak nie jest przedmiotem do przenoszenia.

Receptury korzystają wyłącznie z rzeczy przy postaci; surowce ze schowka trzeba najpierw przenieść. Znaleziska i wyniki receptur najpierw trafiają do ekwipunku, następnie do wolnych miejsc schowka, a przy braku miejsca do bezpiecznego odbioru. Odbiór służy wyłącznie zabezpieczeniu wyników i migracji — nie można odkładać tam rzeczy. Stare zapisy zachowują całą zawartość, nazwę i aktywną wyprawę. Wyprawy nadal nie pokazują przyszłych zdobyczy.

Stosy większe niż 1 sztuka mają przycisk „Rozdziel” w opisie po najechaniu i w szczegółach. Wybierz ilość od 1 do liczby sztuk pomniejszonej o 1. Nowy stos zajmuje osobny prostokąt w tej samej siatce; przy braku miejsca stan pozostaje bez zmian. Podział jest dostępny po powrocie do kryjówki i zachowuje łączną liczbę przedmiotów.

Przeciągnij stos na drugi stos tego samego przedmiotu, aby je połączyć. Podświetlenie „Połącz” obejmuje cały przedmiot docelowy, także wielopolowy. Działa wewnątrz ekwipunku, skrytki i między nimi w otwartej skrytce. Cel zachowuje swoje ID i położenie; źródło znika, a jego pola są zwalniane. Łączą się tylko zapasy i materiały o zgodnym stanie. Inny typ, sprzęt lub za duża suma pozostawiają oba stosy bez zmian.

`id` identyfikuje konkretny stos, `itemId` — rodzaj przedmiotu. Rozdzielone stosy mają różne `id`, ale to samo `itemId`. Pojedyncze sztuki w stosie nie mają osobnych numerów seryjnych.

W przyszłości będzie możliwość budowania kolejnych skrytek. Obecnie jest jedna; nie ma stron, zakupów ani płatności. Rzeczy z dawnej drugiej strony są przenoszone do wolnych miejsc schowka, a jeśli się nie mieszczą, pozostają w bezpiecznym odbiorze.

## Ilustrowana kryjówka

Główny ekran przedstawia schronienie postapo. Pod ilustracją przejdziesz do przygotowania wyprawy lub mapy. Zwijany panel pokazuje bohatera i zdrowie, stan wyprawy oraz rzeczywiste ilości wody i racji w magazynie. Odliczanie zmienia się w „Raport czeka” po terminie; odbiór nadal następuje na ekranie Wyprawy. Po powrocie z warsztatu i odbiorze raportu naprawisz stół za 6 złomu i 2 tkaniny z ekwipunku lub skrytki. Naprawa zmienia ilustrację pokoju i odblokowuje recepturę zestawu opatrunków w Ekwipunku. Radio jest dekoracją oznaczoną jako funkcja w przygotowaniu. Ilustracja pokoju jest poglądowa; widoczne przedmioty nie oznaczają dodatkowych zasobów ani aktywnych pomieszczeń.

## Mapa okolicy

Na papierowym planie wybierz osiedle lub warsztat, albo użyj listy pod mapą. Wybór zapisuje się od razu; panel pokazuje ilustrację miejsca, czas oraz informację o zabieranym ekwipunku. Przycisk „Przygotuj wyprawę” przenosi do istniejącego planowania, nie rozpoczyna podróży. Znacznik kryjówki wraca do głównego ekranu. Podczas aktywnej wyprawy mapa wybiera tylko następny cel, bez zmiany trwającej wyprawy i bez pobierania zapasów.

## Pierwsze wyposażenie

Zniszczony hełm (2×2), łatana kurtka (2×3), znoszone buty (2×2) i zardzewiały łom (1×3) mogą wypaść przy przeszukiwaniu miejsc. Każdy znaleziony egzemplarz ma własne ID, ilość 1 i roboczy stan 60%. Przedmioty nie łączą się w stosy. Zmiana wyposażenia wymaga powrotu do kryjówki. Sprzęt w skrytce trzeba najpierw przenieść do plecaka.

Założony sprzęt przetrwa odświeżenie i wyprawę. Ubranie nie daje jeszcze premii liczbowych, a sprzęt się nie zużywa; sylwetka pokazuje obecnie założony hełm, kurtkę, buty i łom. Stare zapisy otrzymują puste nowe sloty bez zmiany rzeczy i rozpoczętych wypraw. Nowe grafiki wyposażenia są własnym wygenerowanym atlasem `/art/equipment-worn.webp`.

## Wyprawa i raport

Przygotowanie pokazuje cel, czas oraz informację o zabraniu obecnego ekwipunku. Mapa, plan oraz trwająca wyprawa nie pokazują przyszłych zdobyczy. Odbiór po terminie zapisuje znaleziska i rozliczony raport z ilustracjami przedmiotów oraz zestawieniem zużycia. Ostatni rozliczony raport pozostaje dostępny jako historia, również podczas kolejnej wyprawy; nie jest prognozą nowych nagród. Zdarzenia i ich wynik są losowane i zapisywane raz przy starcie: ilości znalezisk są zmienne, a powrót może być pusty. Odświeżanie i późniejszy odbiór nie zmieniają wyniku. Wcześniej rozpoczęte wyprawy zachowują dawne łupy i koszty. Raport zawiera dziennik z opisem zdarzeń i znaleziskami z każdego miejsca. Osiedle obejmuje mieszkanie i podwórze, warsztat — zaplecze i magazyn. Można natrafić na zamkniętą skrzynię lub zatarasowaną drogę. Zabrany łom, założony lub niesiony w plecaku, daje szansę otwarcia skrzyni; zawrócenie przed celem oznacza pusty powrót i nie zalicza odwiedzenia warsztatu. Czas wyprawy pozostaje bez zmian. Nie ma walki ani ręcznych decyzji. Stare wyprawy pokazują informację o braku dziennika, zamiast otrzymywać wymyśloną historię.

## Bohater i tło strony

Karta Bohatera pokazuje postać z aktualnym wyposażeniem, faktyczne zdrowie, poziom, pseudonim i osiem zapisanych wartości umiejętności. Rozwój i premie nie są jeszcze aktywne. Zmiana pseudonimu jest wyłączona; dotychczasowa nazwa pozostaje. Podgląd plecaka odzwierciedla wybór na następną lub wyposażenie aktywnej wyprawy; przycisk prowadzi do Ekwipunku. Wszystkie ekrany mają wspólne tło zużytego betonu, bez zmiany danych gry.

## Kolejność nawigacji

Postać → Ekwipunek → Kryjówka → Wyprawy → Mapa. Kryjówka pozostaje ekranem początkowym. W kryjówce przycisk „Otwórz schowek” przechodzi do widoku z obiema siatkami.

## Opisy po najechaniu i używanie

Siatki nie pokazują nazw pod ilustracjami — nazwa i opis pojawiają się w interaktywnym okienku po najechaniu, ustawieniu fokusu lub dotknięciu przedmiotu. Woda, racje i bandaże mają przycisk „Użyj”: na tym etapie zużywa on jedną sztukę, bez zmiany zdrowia ani innych statystyk. Po ostatniej sztuce pola zostają zwolnione. Używanie jest dostępne po powrocie do kryjówki.

„Ekwipunek” w nawigacji pokazuje wyłącznie rzeczy przy postaci, bez przycisku „Do skrytki”. Skrytkę otworzysz z Kryjówki przyciskiem „Otwórz skrytkę”; w jej widoku widać obie siatki, a obok „Użyj” dostępny jest transfer „Do skrytki” (dla rzeczy przy postaci) lub „Do ekwipunku” (dla rzeczy w skrytce). Przenoszenie i centrowany podgląd zachowują dotychczasowe rozmiary. Szczegóły z układaniem klawiaturą pozostały w zwijanej sekcji.

Łom liczy się według stanu przy starcie wyprawy: slot broni i plecak działają tak samo; skrytka, odbiór nadmiaru i łom znaleziony dopiero w drodze nie pomagają. Wynik próby i dodatkowy łup zapisują się przy starcie. Roboczo próba ma 70% szans powodzenia; sukces daje 1–3 złomu i 1–2 tkaniny. Łom nie jest zużywany. Wcześniej zapisane wyprawy zachowują swój wynik.

## Zdrowie — obecny zakres

Zwykła choroba została usunięta: brak losowania zachorowania, ochrony kurtki, leczenia i kary czasu wyprawy. Osiedle trwa 1 minutę, warsztat 2 minuty. Migracja usuwa także aktywne i zaplanowane zachorowania oraz skraca rozpoczęte wyprawy wydłużone przez dawną chorobę do ich podstawowego czasu, liczonego od pierwotnego startu. Łupy, ekwipunek i postęp zadań pozostają zachowane.

Antybiotyki ze starszych zapisów pozostają w posiadaniu gracza, ale nie można ich używać i nie pojawiają się w nowych losowaniach. Za naprawę stołu dziennik przyznaje teraz 2 bandaże; wcześniej odebrana nagroda nie jest przyznawana ponownie ani zamieniana. Choroba popromienna jest planowana na przyszłość, obecnie nie działa.

## Dziennik zadań

Kryjówka → „Otwórz dziennik zadań”: cztery cele z postępem i jednorazowym odbiorem nagrody. Można je realizować w dowolnej kolejności. Pierwsze zapasy wymagają odebranego raportu ze znaleziskami; Miejsce do pracy — naprawy stołu po powrocie z warsztatu; Przygotowany ocalały — założenia kurtki; Rezerwa na jutro — 3 wód, 3 racji i 2 bandaży jednocześnie w skrytce. Zapasy nie są pobierane przez zadanie. Po zaliczeniu postęp pozostaje, nawet jeśli zużyjesz rzeczy lub zdejmiesz kurtkę.

Nagrody: kolejno 2 tkaniny, 2 bandaże, 2 racje i 4 złomu. Odbiór po powrocie dodaje rzeczy do plecaka; nadmiar trafia do skrytki lub odbioru nadmiaru. Starsze zapisy zachowują wyposażenie i postęp: dziennik rozpoznaje naprawiony stół, obecnie założoną kurtkę, obecne zapasy skrytki oraz znaleziska z ostatniego raportu. Nie odtwarza historii, której poprzedni zapis nie przechowywał.

## Widoczny ubiór i ruch postaci

Postać i Ekwipunek korzystają ze wspólnej sylwetki 2D. Bazowy ubiór to zużyta krótka koszulka i bokserki, bose stopy. Hełm, kurtka, buty i łom pojawiają się dopiero po założeniu w odpowiednim slocie; rzeczy w plecaku lub skrytce nie zmieniają wyglądu. Podstawowy plecak jest stale widoczny za plecami. Zakładanie i zdejmowanie aktualizuje obraz od razu, a zapis wyposażenia zachowuje go po odświeżeniu.

Oddech porusza wyłącznie zamaskowanym obszarem klatki piersiowej; głowa, nogi, dłonie i założona broń nie zmieniają położenia ani rozmiaru. Animacja nie porusza slotów ani siatek, zatrzymuje się poza widokiem i w ukrytej karcie. Ustawienie systemowe „ogranicz ruch” domyślnie wyłącza animację; przycisk „Ruch” przy sylwetce pozwala ją jawnie włączyć lub zatrzymać. Własny atlas bazowej i ubranej sylwetki `/art/survivor-civilian.webp`, warstwy sprzętu oraz oddzielna ikona cywilnej kurtki, bez nowych bibliotek i bez zmiany schematu zapisu. Kolejne rodzaje sprzętu będą wymagały własnych dopasowanych warstw.

Kurtka ma teraz cywilny brązowy krój z zamkiem, dwoma bocznymi kieszeniami i łatą, bez pagonów ani wojskowych kieszeni na piersi. Bez łomu obie dłonie są rozluźnione. Założenie łomu podmienia samą dłoń na chwyt narzędzia; jego zdjęcie przywraca otwartą dłoń. Ikona kurtki odpowiada ubraniu na postaci.

Postać mruga w nieregularnych odstępach (około 2,8–7 s przerwy, 0,13 s zamknięcia powiek). Osobna grafika zmienia tylko obszar oczu; głowa i reszta twarzy nie poruszają się. Hełm pozostaje przed twarzą, więc jego daszek może zasłaniać oczy. Przycisk Ruch zatrzymuje także mruganie; wyłączenie ruchu lub ukrycie postaci otwiera powieki i usuwa oczekujący timer. Spojrzenia na boki nie są jeszcze wdrożone.

Postać zmienia także podparcie: ciężar na lewej nodze, równo na obu, na prawej. Co około 5,5–9,5 s wykonuje niewielką korektę ustawienia. Odciążona stopa unosi się, jest przestawiana i opiera się w nowym położeniu; powrót na obie nogi również przechodzi przez klatkę uniesienia. Nogi i buty korzystają z narysowanych klatek zamiast odkształcania statycznej ilustracji. Osobne warianty bosych stóp i obuwia. Tułów, ubranie, hełm i łom podążają za przesunięciem ciężaru, a sloty ekwipunku pozostają nieruchome. Wyłączenie Ruchu przywraca równą pozycję i zatrzymuje sekwencję. Pozycja nie wpływa na statystyki i zapis gry. Spojrzenia na boki nadal czekają na osobny etap.
