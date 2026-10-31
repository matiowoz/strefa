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
2. W Bohaterze zmień pseudonim, poczekaj na potwierdzenie zapisu.
3. Na Mapie wybierz drugi punkt i odśwież stronę. Aplikacja wróci do Kryjówki, ale pseudonim i wybrany cel pozostaną.
4. W Wyprawach sprawdź cel, czas i nagrodę, a wybierz zestaw zapasów i opcjonalnie plecak, następnie rozpocznij wyprawę. Osiedle trwa minutę (2 złomu), warsztat dwie (4 złomu); to parametry demonstracyjne.
5. Odśwież lub zamknij grę i wróć po terminie. W Wyprawach odbierz raport i nagrodę. Ilość złomu w Ekwipunku zwiększy się raz; raport pozostanie po odświeżeniu. Następna wyprawa jest dostępna po odbiorze poprzedniej.
6. Sprawdź, że woda i racje zostały pobrane raz przy starcie; plecak pozostaje bez zmian. W Ekwipunku z surowców z wyprawy uzdatnij wodę i przygotuj rację. Po dwóch wyprawach wystarczy tkaniny na bandaż. Widać koszt i wynik każdej receptury. Brak zasobów blokuje operację.
7. Przy błędzie zapisu zmiana nie zostaje zastosowana; ponów odbiór. Przy konflikcie z inną kartą odśwież stronę.

Zapis: IndexedDB, baza `strefa-prototype`, magazyn `saves`, klucz `main`, schemat stanu v3 (migracja poprawnych v1 i v2 bez utraty postępu, bez nowych kosztów dla już rozpoczętych wypraw). Sukces zapisu jest ogłaszany po zatwierdzeniu transakcji. Nieprawidłowe dane i nieobsługiwane wersje pozostają nietknięte; aplikacja pokazuje błąd zamiast cicho tworzyć nową grę. Odmowa dostępu do IndexedDB również daje widoczny błąd.

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

Lekki zestaw kosztuje 1 wodę i 1 rację, z zapasem 2 i 2. Koszt obejmuje całą drogę i jest pobierany przy starcie. Wariant z zapasem nie daje jeszcze dodatkowej korzyści. Nie ma głodu ani pragnienia upływającego podczas nieobecności. Plecak jest rezerwowany do powrotu, bez premii i zużycia. Receptury wykonują się od razu: 1 woda do uzdatnienia → 1 woda, 1 składnik żywnościowy → 1 racja, 2 czyste tkaniny → 1 bandaż. Są to robocze parametry opisane w PLAN.md.

## Ilustrowany ekwipunek

Ekran Ekwipunek jest wzorcem nowego wyglądu: wybierz filtr i kliknij przedmiot, aby zobaczyć ilość, masę, stan i dostępne działanie. Plecak można wybrać na następną wyprawę lub odłożyć; w trakcie wyprawy zmiana jest zablokowana. Receptury znajdują się poniżej magazynu. Ilustracja bohatera jest poglądowa; miejsca na głowę, tułów i obuwie są planowane. Grafiki są lokalne, bez zewnętrznych serwisów.
