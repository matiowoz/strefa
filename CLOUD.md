# STREFA — praca z telefonu

## Stan projektu

Etap 1 jest zakończony: pięć ekranów, typy, czyste funkcje i lokalny zapis IndexedDB. Weryfikacja etapu 2 w chmurze: 32 testy zaliczone, poprawna kompilacja i przepływ wyprawy w Chromium przy szerokości telefonu. Etap 2 dodaje jedną prostą wyprawę, raport i jednokrotną nagrodę; bez walki. Etap 3 wymaga osobnego zlecenia właściciela.

Przeczytaj AGENTS.md, PLAN.md oraz docs/GDD.md. Źródłowy dokument jest w docs/GDD.pdf. Nie zakładaj, że nowa rozmowa zna wywiad lub poprzedni czat.

## Konfiguracja środowiska chmurowego

- Repozytorium prywatne, katalog roboczy: główny katalog repozytorium.
- Node.js 24 (plik .nvmrc); jeśli dostępne nvm: `nvm install && nvm use`.
- Instalacja: `npm ci`.
- Kontrola: `npm test` oraz `npm run build`.
- Do instalacji potrzebny dostęp do registry.npmjs.org i archiwum Node, jeśli środowisko nie zawiera Node 24.
- Projekt nie wymaga sekretów, kluczy API, backendu ani logowania do gry.
- Nie zapisuj w repozytorium node_modules, dist, tokenów lub danych przeglądarki.

Wynik lokalnych testów nie oznacza, że testy w chmurze już wykonano. Przed pracą z telefonu uruchom kontrolę w faktycznie utworzonym środowisku.

## Początek każdej sesji z telefonu

1. Otwórz Codex i wybierz opublikowane środowisko chmurowe STREFY, nie zdalny domowy komputer.
2. Upewnij się, że pracujesz na aktualnej gałęzi repozytorium.
3. Zleć jeden mały etap z PLAN.md. Nie rozszerzaj zakresu bez uzgodnienia.
4. Przed zakończeniem poproś o testy, kompilację, opis zmian i zapis zmian jako commit lub pull request. Zmiany w samym roboczym środowisku nie są kopią w repozytorium.

Sam link do prywatnego repozytorium nie uruchamia aplikacji. Podgląd graficzny wymaga funkcji podglądu danego środowiska albo osobnego hostingu. Lokalny localhost z domowego komputera nie będzie dostępny po jego wyłączeniu. Nie publikuj kodu ani aplikacji publicznie bez polecenia właściciela.

## Przekazanie do kolejnej sesji

STREFA to mobilny idle survival RPG. Zachowaj rozdzielenie domain/persistence/app/ui, małą liczbę zależności i reguły GDD. Ukończono fundament i minimalną wyprawę etapu 2. Kolejny jest etap 3: zapasy wyprawowe, prosty zestaw, bezpieczny powrót i niewielka liczba receptur. Nie zaczynaj go bez nowego zlecenia.

Lokalny zapis gry jest zależny od adresu i urządzenia. Repozytorium przenosi kod oraz dokumentację, ale nie postęp zapisany w IndexedDB komputera.
