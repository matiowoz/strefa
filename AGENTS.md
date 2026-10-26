# Zasady pracy

- Najpierw przeczytaj PLAN.md i README.md. Realizuj tylko bieżący etap zlecenia.
- React + TypeScript w trybie strict; CSS mobile-first. Nie dodawaj zależności bez potrzeby.
- Reguły i typy gry w src/domain, trwały zapis w src/persistence, integracja w src/app, widoki w src/ui.
- Komponenty nie używają IndexedDB bezpośrednio. Przyszły backend implementuje port GameRepository; nie buduj go teraz.
- GDD 1.1 jest źródłem reguł. Ograniczenia prototypu i propozycje odnotuj w PLAN.md; nie zmieniaj reguł ukradkiem.
- Nigdy nie nadpisuj błędnego ani nowszego zapisu stanem początkowym. Sukces zapisu oznacza zakończenie transakcji.
- Zapisz test regresji dla istotnej zmiany logiki lub zapisu. Uruchom npm test i npm run build; raportuj faktyczne wyniki.
- Nie implementuj walki, multiplayera, płatności i pełnego silnika wypraw w etapie 1.
- Przy trwałej przeszkodzie podaj błąd i zakończ pracę zamiast wielokrotnych kosztownych prób.
