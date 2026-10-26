# GDD 1.1 tekst pomocniczy

Ekstrakcja z GDD.pdf. W razie roznic ukladu sprawdz PDF. Statusy USTALONE PROPOZYCJA i OTWARTE zachowuja znaczenie ze zrodla.

## Strona 1

GDD 1.1  |  1
Mobilna gra idle survival RPG
Game Design Document
Wersja 1.1 • 25 października 2026
Specyfikacja docelowej gry oraz proponowany plan MVP
Obietnica doświadczenia
Jesteś jednym ocalałym w świecie, który niedawno utracił cywilizację. Przygotowujesz zapasy,
trasę i taktykę, a bohater rusza na automatyczną wyprawę. Wracasz do szczegółowej,
własnoręcznie urządzonej kryjówki z łupem, obrażeniami i nową wiedzą. Samodzielnie
poznajesz tę samą niezmienną historię, którą przejdą inni gracze, a handel i współpraca
pozwalają uczestniczyć w życiu większej społeczności bez ryzyka napadu na własny dom.
Jak korzystać z dokumentu
USTALONE oznacza wybraną regułę gry. PROPOZYCJA oznacza sposób implementacji,
parametr, plan produkcji albo nowy kompromis do zatwierdzenia. OTWARTE oznacza
nierozstrzygniętą kwestię. Jeżeli w wywiadzie późniejsza odpowiedź zmienia wcześniejszą,
obowiązuje późniejsze jednoznaczne rozstrzygnięcie. Przykłady nazw, scen i wartości nie stają
się decyzją tylko dlatego, że występują w opisie.
Najważniejszy wniosek produkcyjny: docelowy zakres jest znacznie większy od pierwszego
prototypu. Proponowany MVP sprawdza wyprawę, walkę, zasoby i kryjówkę. Systemy rynku,
frakcji i odbudowy mają własne późniejsze bramki. Ograniczenie etapu nie usuwa
zatwierdzonych mechanik z docelowej wizji.
Nawigacja
1 Priorytety • 2 Świat • 3 Bohater • 4 Progresja • 5 Mapa • 6 Wyprawa • 7 Walka • 8 Przedmioty •
9 Crafting • 10 Badania • 11 Kryjówki • 12 Energia • 13 Wiedza • 14 Gospodarka • 15 Logistyka •
16 Frakcje • 17 Odbudowa • 18 Fabuła • 19 Społeczność • 20 UX • 21 Oprawa • 22 Serwery • 23
Monetyzacja • 24 MVP • 25 Produkcja • 26 Ryzyka • 27 Otwarte pytania • Załączniki A i B


## Strona 2

GDD 1.1  |  2
1 Priorytety projektu i mapa systemów
USTALONE: samotny bohater, prawdziwa automatyzacja, niezależność osobistej eksploracji,
wspólna gospodarka i brak ingerencji innych graczy w prywatny dorobek. Przerwa od gry nie
odbiera przedmiotów, umiejętności, kryjówek ani historii. Trudność wynika z przygotowania i
ryzyka wyprawy, nie z konieczności ciągłego logowania.
System
Przekazuje
Do systemu
Kryjówka
Sprzęt zapasy leczenie
Przygotowanie
Mapa i katalog
Trasę oraz poznane ryzyko
Wyprawa
Wyprawa i walka
Łup zużycie urazy obserwacje
Raport powrotu
Raport
Materiały wiedzę i nowe cele
Crafting badania fabuła
Crafting i produkcja
Użyteczne towary i wyposażenie
Wyprawy oraz rynek
Rynek i transport
Brakujące towary w konkretnej lokalizacji
Rozwój baz
Frakcja i społeczność
Wkład oraz dodatkowe cele
Projekty i kronika
Osobista fabuła
Stały etap i dostęp do kluczowych scen
Dalsza eksploracja
Pętla podstawowa
Sprawdź bohatera i cel → oceń informacje o trasie → przygotuj wyposażenie i zapasy → wybierz
strategię → uruchom wyprawę → opcjonalnie obserwuj lub interweniuj → przeczytaj
podsumowanie → rozlicz leczenie, naprawy, odkrycia i łup → zainwestuj w kolejny cel.
Długoterminowo rozwijasz technologie, sieć kryjówek, relacje, kolekcje oraz udział w
gospodarce.
Reguła rozstrzygania konfliktów
PROPOZYCJA: bezpieczeństwo prywatnej własności oraz dostęp do całej osobistej fabuły mają
pierwszeństwo przed wygodą wspólnego wydarzenia. Zasada idle ma pierwszeństwo przed
nową mechaniką wymagającą reakcji o konkretnej godzinie. Każdy nowy bonus trzeba
sprawdzić względem gospodarki, x4 i automatyzacji.
2 Świat regiony pogoda i katastrofa
USTALONE: świat niedługo po upadku, z pamięcią dawnego porządku i nadal działającymi
instalacjami. Codzienność jest przyziemna: woda, materiały, lekarstwa, paliwo, ludzie i
zwierzęta. Rzadkie niewyjaśnione zagrożenia mają budzić niepokój, a nie tworzyć codzienną
paradę potworów.
Prawda świata
USTALONE: katastrofa ma jedną konkretną przyczynę, a jej fundamentem jest nieznane
zjawisko związane z zakłóceniami technologii. Zjawisko nadal sporadycznie występuje, można je
badać i częściowo prognozować. Jego zasady oraz rzeczywista przyczyna muszą być spójne.
Nie jest pretekstem do losowego wyłączania kryjówki ani niszczenia zasobów.
OTWARTE: ostateczna nazwa zjawiska, geografia, data katastrofy i pełne wyjaśnienie.
PROPOZYCJA: przed pisaniem rozdziałów stworzyć poufną biblię świata z chronologią,
regułami zjawiska i zakresem wiedzy każdej ważnej postaci. „STREFA”, „ECHO”, „Zanik” oraz


## Strona 3

GDD 1.1  |  3
nazwy wczesnych regionów pozostają historycznymi przykładami, nie zatwierdzonymi nazwami
gry.
Różnorodność zamiast drabiny poziomów
USTALONE: regiony różnią się charakterem, zasobami i zagrożeniami; w każdym mogą istnieć
łatwe i trudne lokacje. Nowy region jest udostępniany aktualizacją, natomiast osobiste
odkrywanie i dostęp fabularny nadal wymagają działań bohatera. Przeciwnicy nie skalują
automatycznie statystyk do postaci.
Pogoda i cztery pory roku
USTALONE: pogoda i temperatura wpływają na wyposażenie, wodę, widoczność, podróż i
dostępność części miejsc. Obowiązuje pełny cykl czterech pór roku, po korekcie wcześniejszego
wyboru klimatu wyłącznie regionalnego. Regiony zachowują własne warunki. PROPOZYCJA z
wywiadu: 3 tygodnie rzeczywiste na porę roku x1 i 5 dni 6 godzin na x4. Te długości wymagają
testu, nie są zamkniętym balansem.
3 Bohater przeszłość i prolog
USTALONE: jeden ocalały, wybierany pseudonim, wygląd i dawny zawód, ale częściowo
ustalona przeszłość. Bohater pamięta swoje życie; nie ma amnezji. Gracz stopniowo poznaje
wspomnienia i dawne relacje. Zawód daje niewielką przewagę startową oraz kontekst wybranych
rozmów, lecz nie zamyka umiejętności ani historii.
Kreator
USTALONE: prosty kreator na początek, podstawowe opcje darmowe, wyposażenie widoczne
na bohaterze. PROPOZYCJA: wybór kilku spójnych sylwetek, twarzy, fryzur i zarostu, zamiast
pełnego edytora morfologii. Każdy zawód musi mieć porównywalną wartość startową; liczba
poziomów i lista zawodów pozostają OTWARTE.
Prolog i utrata dawnej kryjówki
USTALONE: początek pokazuje dawną kryjówkę i życie przed jej utratą. Pierwsza wyprawa oraz
tajemnicza transmisja prowadzą do zdarzenia zmuszającego bohatera do odejścia. Późniejszy
powrót do tego miejsca jest ważnym momentem fabularnym. Prolog może zapamiętywać
działania i późniejsze poboczne konsekwencje, ale nie zmienia niezmiennej głównej kampanii.
PROPOZYCJA: docelowy prolog trwa 20–30 minut zgodnie z koncepcją wywiadu, lecz daje
możliwość odłożenia telefonu. Nie musi być ukończony w jednej sesji. Zniszczenie dawnej
kryjówki jest przygotowanym wydarzeniem scenariusza; nie ustanawia losowego ryzyka utraty
rozwijanych baz. Dawna lokacja nie jest szóstą aktywną kryjówką.
Obecność postaci
USTALONE: ocalały jest widoczny we wnętrzach, wykonując krótkie animacje odpoczynku, radia
lub pracy. Nie sterujemy nim bezpośrednio. PROPOZYCJA: w czasie wyprawy wnętrze pokazuje
pustą przestrzeń i pracujące automaty, co zapobiega wrażeniu równoczesnej obecności
bohatera w dwóch miejscach.


## Strona 4

GDD 1.1  |  4
4 Umiejętności atuty i doświadczenie
USTALONE: ogólny poziom oraz umiejętności przez praktykę. Wszystkie dziedziny można
ostatecznie opanować, każda ma limit, a zdobyte doświadczenie nie spada. Po maksimum
dalsze mistrzostwo może zapewniać prestiż i kosmetykę, bez nieskończonej przewagi. Pierwsze
postępy są szybkie, dojście do mistrzostwa długie.
Robocza
dziedzina
Przykładowa praktyka
Odblokowania
Walka
Starcia i taktyka
Skuteczniejsze użycie sprzętu
Zwiad
Rozpoznanie i obserwacja
Ocena zagrożeń i tras
Przetrwanie
Wyprawy w trudnych warunkach
Gospodarowanie zapasami
Medycyna
Leczenie i leki
Lepsze wykorzystanie środków
Rzemiosło
Wytwarzanie i naprawy
Receptury i modyfikacje
Elektronika
Radio i analiza urządzeń
Sygnały i czujniki
Handel
Rzeczywiste transakcje
Możliwości kupieckie
Transport
Podróże i przewozy
Logistyka i ekonomia paliwa
Lista ośmiu dziedzin i limit 100 z wywiadu są strukturą roboczą. USTALONE jest użycie kilku
rozbudowanych dziedzin zamiast dziesiątek oddzielnych pasków. Trudniejsze czynności dają
więcej doświadczenia, ale bezpieczne nadal pozwalają rozwijać się wolniej. Automatyzacja daje
pełne doświadczenie za te same rzeczywiste działania.
Rozdzielenie kompetencji
USTALONE: punkty specjalizacji i poziomy są przypisane do dziedziny. Zmiana atutów walki nie
zamienia 50 poziomów walki w 50 poziomów rzemiosła. Zmiany w kryjówce są bezpłatne i nie
kasują doświadczenia. PROPOZYCJA: zestaw aktywnych atutów przypisywać do rozpoczętej
wyprawy lub zadania, aby zmiana tuż przed rozliczeniem nie przyznawała podwójnych korzyści.
To zabezpieczenie wdrożeniowe, nie dodatkowa decyzja właściciela.
5 Mapa lokacje i osobiste zasoby
USTALONE: mapa odkrywa się stopniowo. Odróżnia miejsce znane z informacji, odwiedzone i
dokładnie zbadane. Raport, notatka lub sygnał mogą wskazać obszar, ale nie zaliczają
osobistego odkrycia ani nie omijają fabuły. Mapę taktyczną uzupełniają ilustracje ważnych
wydarzeń.
Planowanie
Gracz wybiera trasę i punkty pośrednie. Widzimy szacowany czas, zapasy i tylko znane
zagrożenia. Można zapisać trasę, zdać wybór na automatykę i określić, czy wolno jej szukać
obejścia. PROPOZYCJA: stan planowania pokazuje różnicę między brakiem zagrożenia a
brakiem danych. Osobne ostrzeżenie wyjaśnia, że stary raport może nie opisywać obecnej
aktywności.


## Strona 5

GDD 1.1  |  5
Pula łupów
USTALONE: zasoby są indywidualne. Inni nie opróżniają lokacji przed graczem. Zwykłe
materiały odnawiają się, a częste wizyty czasowo wyczerpują osobistą pulę. Rzadkie rzeczy są
ponawialne według reguł dostępności, natomiast kluczowe dokumenty i odkrycia fabularne
zdobywa się raz. Stany bogate, przeciętne i wyczerpane wyjaśniają opłacalność kolejnej
wyprawy.
Miejsca stałe i czasowe
USTALONE: stałe lokacje pozostają po odkryciu, a rzadkie tymczasowe pojawiają się w związku
ze zdarzeniami regionu. Nie wymagają logowania o określonej minucie i nie zawierają jedynej
drogi do głównej historii. Inteligentny planer może wybierać spośród już znanych lokacji, ale nie
posiada wiedzy o nieodkrytych łupach.
Model wdrożenia
PROPOZYCJA: osobna definicja lokacji, osobisty stan odkrycia i zasobów oraz wspólny
modyfikator wydarzenia. Pozwala to zachować równą bazową trudność kampanii, a
jednocześnie zmieniać dodatkowe wyprawy całego serwera. Czas odnowienia, ilości łupu i
zakres rozpoznania wymagają osobnego balansu.
6 Wyprawa od planu do raportu
USTALONE: jedna aktywna wyprawa, serie na czas nieobecności, pełne doświadczenie i
rutynowe decyzje według strategii. Najtrudniejsza ekspedycja również pozostaje pojedynczym
długim zadaniem. Gracz nie musi ręcznie zatwierdzać kolejnych pięter kompleksu.
Stan
Wymagany rezultat
Przygotowanie
Trasa cel zapasy sprzęt taktyka i przewidywane koszty
Start
Rezerwacja rzeczy i zapis konfiguracji
Podróż i eksploracja
Przeszukiwanie wybór znalezisk rozpoznanie i zdarzenia
Starcie lub obejście
Rozstrzygnięcie zgodne z wiedzą i taktyką
Powrót
Koniec planu odwrót lub porażka
Rozliczenie
Jeden raport łup zużycie urazy doświadczenie oraz odkrycia
Kolejna wyprawa
Start tylko po spełnieniu reguł bezpieczeństwa serii
Bezpieczna automatyzacja
USTALONE: zatrzymanie przy poważnej porażce, niewystarczających zapasach lub
przekroczeniu ustawionych progów. Priorytety łupu nie pozwalają wyrzucić oznaczonego sprzętu
ani środków potrzebnych do powrotu. PROPOZYCJA: pełny magazyn kończy serię, a rozliczony
łup czeka w bezpiecznym odbiorze. System podaje konkretną przyczynę zatrzymania i działanie
naprawcze.
Opcjonalna interwencja
USTALONE: obserwacja nie jest obowiązkiem, a nieodwracalne wybory fabularne czekają na
świadomą decyzję gracza. Odkryte drzwi zostają tropem do następnej wyprawy; po powrocie nie
można zmienić zakończonej walki. PROPOZYCJA: polecenie interwencji dotyczy wyłącznie
przyszłych zdarzeń i ma potwierdzenie przyjęcia przez serwer. Brak odpowiedzi uruchamia
zapisane reguły, nigdy domyślną decyzję fabularną.


## Strona 6

GDD 1.1  |  6
Raport
USTALONE: na górze wynik, stan, łup, zużycie i rozwój; poniżej chronologiczny zapis.
Powtarzalne czynności są grupowane, a odkrycia i przyczyny porażki wyróżnione.
PROPOZYCJA: każdy koszt ma kategorię „zużyto”, „pozostawiono”, „utracono” lub
„zabezpieczono”, aby gracz nie mylił wydanej amunicji z utratą wyposażenia.
7 Walka obrażenia i powrót
USTALONE: automatyczna walka, bez bezpośredniego sterowania. Przygotowanie, teren,
wiedza i zachowanie wroga wpływają na wynik. Raport pokazuje starcie, ale nie wymaga
symulacji każdego naboju i przeładowania. Hałas nie tworzy osobnej mechaniki alarmu.
Zachowania
Ludzie wykorzystują osłony, zasadzki, wycofanie i współpracę. Zwierzęta bronią terytorium lub
polują według własnych reguł. Rzadkie nieznane zagrożenia wymagają obserwacji. Bohater
może ominąć, obserwować, negocjować w wybranych spotkaniach lub uciec. Przeciwnik nie zna
magicznie niewidocznej postaci. Część ludzi może się poddać; brak rozbudowanego więzienia.
Broń i koszty
USTALONE: logiczny automatyczny wybór broni według dystansu, zagrożenia, amunicji, stanu i
strategii. Nawet początkujący bohater podejmuje rozsądne podstawowe działania. Niski stan
sprzętu obniża skuteczność w przewidywalny sposób. Nie ma losowych zacięć. Kalibry i rodzaje
amunicji pozostają, a koszt jest powiązany z faktycznym rozstrzygnięciem starcia.
Leczenie
USTALONE: punkty zdrowia i konkretne urazy. W kryjówce właściwe środki leczą natychmiast.
Brak leków pozostawia uraz, lecz nie narzuca odrębnego wielogodzinnego licznika. Medycyna i
wyposażenie pomagają oszczędniej korzystać ze środków. Podczas wypraw działają posiadane
zapasy oraz ustalone progi automatycznego użycia.
Porażka i ochrona dorobku
USTALONE: automatyczny powrót, obrażenia, zatrzymanie serii i możliwość straty
niezabezpieczonych znalezisk. Własny sprzęt zostaje, poziomy nie spadają, trwała śmierć i
kalectwo są wykluczone. Późniejszy zapis mówi o możliwości częściowej utraty łupu,
wcześniejszy dopuszczał całość. OTWARTE: dokładny zakres i wzór straty, szansa odzyskania
oraz koszt awaryjnego powrotu. PROPOZYCJA: darmowa minimalna droga wyjścia z braku
leków zapobiega ekonomicznemu utknięciu.
8 Wyposażenie historia i trofea
USTALONE: wyposażenie ma model, masę, stan i moduły. Broń, hełm, kamizelka, ubranie,
rękawice, obuwie, plecak oraz akcesoria mają konkretne zastosowania. Przeciążenie stopniowo
utrudnia wyprawę. Zestawy wyposażenia i automatyczne uzupełnianie zapasów zmniejszają
liczbę powtarzalnych czynności.


## Strona 7

GDD 1.1  |  7
Przewidywalne parametry
USTALONE: po późniejszych decyzjach podstawowe statystyki modelu są stałe. Różnice
wynikają ze stanu, znanych wariantów materiału i modułów, nie losowego „+7% obrażeń”. Po
naprawie i ujednoliceniu konfiguracji dwa egzemplarze działają tak samo. Najlepsze
wyposażenie można wytworzyć; część dokumentacji, unikalnych znalezisk i pamiątek wymaga
eksploracji.
Wartość historyczna
USTALONE: wartościowe egzemplarze mają automatycznie zapisywaną historię twórcy, zmian i
istotnych wydarzeń. Można je nazywać, zachowując oryginalny model i poprzednie nazwy.
Wyjątkowe osiągnięcia nadają sławę i miejsce w archiwum serwera, bez zmiany statystyk.
Własność nie przepada po długiej nieaktywności.
Trofeum nie jest towarem
USTALONE: osobiste trofea zdobywa odkrywca. Nie można ich kupić, sprzedać, podarować ani
stracić na wyprawie. Po odkryciu trafiają do kolekcji wyposażenia kryjówki; niewystawione nie
zajmują zwykłego magazynu. Gracz sam wybiera, czy wystawić pamiątkę i ujawnić ją
odwiedzającym. Kolekcja nie publikuje się automatycznie na profilu.
Trofea różnią się trudnością zdobycia: zwykłe znalezisko, dokładne przeszukanie, specjalny
sprzęt lub rozwiązana zagadka. Dają historię, dekorację i prestiż, bez premii bojowej i
ekonomicznej. Zwykłe dekoracje są odrębną klasą; ewentualna odsprzedaż kosmetyków
kupionych za pieniądze nie może umożliwiać kupna waluty rozgrywki.
9 Crafting naprawy i materiały
USTALONE: crafting, naprawy i modyfikacje są pełnoprawną drogą rozwoju. Najlepszy sprzęt
nie musi być wyłącznie łupem. Rzadkie schematy i materiały utrzymują wartość eksploracji.
Amunicja i inne środki eksploatacyjne pochodzą również z produkcji oraz handlu.
Wynik znany przed startem
USTALONE: podstawowe materiały eksploatacyjne mają stałe receptury. Dla zaawansowanego
wyposażenia można wybrać materiał o jawnych konsekwencjach, np. większa masa i ochrona
albo mniejsza masa kosztem odporności. Identyczny schemat i materiały dają identyczny
rezultat. Wcześniejszy pomysł losowej jakości zależnej od rzemieślnika został zastąpiony.
PROPOZYCJA: umiejętność odblokowuje receptury, materiały i operacje oraz wpływa na czas
lub zużycie, lecz nie losuje ukrytych statystyk. Konkretne korzyści wymagają balansu. Podgląd
zawiera lokalne zasoby, efekt materiału, czas x1/x4 oraz stan końcowy. Materiału nie można
podmienić po zatwierdzeniu zadania bez anulowania i nowego rozliczenia.
Naprawa bez degradacji maksymalnej
USTALONE: sprzęt można naprawiać bez końca. Naprawa nie obniża stale maksymalnej
trwałości i nie niszczy ukochanego egzemplarza. Koszt oraz zużycie podczas wypraw tworzą
popyt na materiały. Wolny handel używanym sprzętem pozwala na działalność renowacyjną.


## Strona 8

GDD 1.1  |  8
Kolejka i demontaż
PROPOZYCJA: start rezerwuje koszty w konkretnej kryjówce; wynik ma unikalne rozliczenie.
Pełny magazyn zatrzymuje produkcję zamiast usuwać przedmioty. Anulowanie pokazuje zakres
zwrotu. Demontaż oddaje mniej niż produkcja kosztuje, a powtarzanie produkcji i rozbiórki nie
staje się bezkosztową farmą doświadczenia. Limit kolejki, liczba stanowisk i czasy nie są jeszcze
zatwierdzone.
10 Badania schematy i technologie
USTALONE: technologie zdobywa się z eksploracji, schematów i własnych badań. Drzewko jest
rozgałęzione. Badania mają określony cel, działają podczas nieobecności i nie polegają na
samym losowaniu rezultatu. Maksymalnie dwa projekty jednocześnie, bez płatnego zwiększania
limitu.
Schemat jako wiedza
USTALONE: zbywalny schemat jest jednorazowym przedmiotem do poznania technologii. Po
użyciu wiedza pozostaje i pozwala wielokrotnie wytwarzać rzecz. Nie ma potrzeby wielu
identycznych schematów na każdą sztukę. Znanej wiedzy nie można bezkosztowo skopiować
jako nieskończonej podaży schematów. Badanie pozostaje alternatywą wobec zakupu.
Gałęzie
PROPOZYCJA z wywiadu: rusznikarstwo, energetyka, medycyna, transport i technologie
przetrwania, uzupełnione badaniami zakłóceń. Zaawansowany projekt może wymagać kilku
dziedzin i dokumentacji z wyprawy. Czujniki, ekranowanie, odbiorniki i analizatory mają
technologiczne uzasadnienie, a nie magiczne działanie.
Obecność bohatera i limit globalny
USTALONE: pięć baz nie mnoży osobistych czynności ani postępów. PROPOZYCJA: limit
dwóch badań jest globalny na postać na danym serwerze, niezależnie od liczby laboratoriów.
Zadanie wymagające osobistej pracy zajmuje ocalałego; obliczenie urządzenia działa w tle i nie
daje dodatkowego osobistego doświadczenia co sekundę. Szczegóły przyznawania
doświadczenia wymagają zatwierdzenia.
Badanie frakcyjne
USTALONE: członkowie mogą łączyć dokumentację w projekcie, bez wspólnego magazynu
prywatnego sprzętu. Samotny gracz może odkryć te same technologie samodzielnie.
OTWARTE: czy ukończenie nadaje osobistą wiedzę wszystkim członkom, uczestnikom czy tylko
udostępnia usługę frakcji; co pozostaje po odejściu. Nie wolno wdrożyć utraty już poznanej
wiedzy jako domyślnej kary.
11 Kryjówki pomieszczenia i własność
USTALONE: do pięciu aktywnych prywatnych kryjówek w instancjach. Wybór lokalizacji i
konstrukcji daje różne zalety, ale każda baza zapewnia podstawowe funkcje. Wyznaczenie
głównej bazy jest darmowe i nie resetuje remontów, historii ani wyposażenia. Przeprowadzka nie
teleportuje mienia.


## Strona 9

GDD 1.1  |  9
Przestrzeń i funkcje
USTALONE: odkrywanie i remontowanie istniejących pomieszczeń, wybór ich przeznaczenia,
moduły oraz urządzenia. Gracz przesuwa meble, regały i ozdoby bez kosztu samego ruchu;
duże instalacje wymagają właściwej przestrzeni. Funkcja urządzenia i jego koszt są niezależne
od ustawienia dekoracji. Podstawowa użyteczność nie wymaga rozwiązania tajemnicy
schronienia.
Przestrzeń
proponowana
Funkcja
Widoczne elementy
Mieszkalna
Bohater i pamiątki
Łóżko światło przedmioty osobiste
Warsztat
Produkcja i konserwacja
Stół elektronika narzędzia
Medyczna
Natychmiastowe leczenie za środki
Stanowisko i szafka leków
Badawcza i radio
Schematy sygnały wiedza
Terminal odbiornik analizator
Magazyn
Lokalny limit zasobów
Regały szafy chłodnia
Techniczna
Energia i zaplecze
Generator baterie instalacje
Widoki i odnotowane napięcie
USTALONE końcowe: szczegółowe osobne wnętrza oraz widok ogólny opisany jako przekrój.
Wcześniej wybrano wnętrza z boku bez przekroju podobnego do Fallout Shelter. PROPOZYCJA
interpretacji: główny ekran pokazuje wybrane wnętrze, a uproszczony przegląd przestrzeni służy
nawigacji. Ostateczną kompozycję widoku ogólnego należy zatwierdzić makietą; nie należy
przyjmować kopii ekranu innej gry.
Sprzedaż i odwiedziny
USTALONE: sprzedaż NPC zwalnia miejsce limitu; handel kryjówkami graczy dopiero później.
Przed sprzedażą wyraźne rozliczenie pozostawionego wyposażenia. Odwiedziny w świecie i
oglądanie przez profil mają ustawienia prywatności, nie wymagają równoczesnej obecności i nie
dają prawa zmiany ani zabierania rzeczy.
12 Energia produkcja i automatyzacja baz
USTALONE: wszystkie aktywne bazy mogą prowadzić automatyczne procesy równocześnie.
Każda korzysta wyłącznie z własnych zasobów, miejsca i energii. Nie ma wspólnego
magicznego magazynu. Remont lub praca wymagająca rąk bohatera odbywa się na miejscu.
Energia
Generatory zapewniają przewidywalne zasilanie za paliwo; panele zależą od dnia i pogody;
akumulatory magazynują nadwyżki. Priorytety ustalają, co pracuje przy niedoborze. Nie
prowadzimy ręcznie przewodów. USTALONE: urządzenia nie psują się samoczynnie i
zakłócenia nie wyłączają losowo produkcji. Koszty wejść i eksploatacji nie są tym samym co
losowa awaria.
Reguły automatyzacji
USTALONE: minimalny zapas wody, amunicji i leków, produkcja braków, przygotowanie
ekwipunku, naprawy i sortowanie. Automatyka nie tworzy zasobów, nie korzysta z mienia w
odległym regionie bez transportu i nie wyrzuca chronionych materiałów projektu. Zdalna zmiana
kolejek i priorytetów wymaga rozwiniętej łączności.


## Strona 10

GDD 1.1  |  10
PROPOZYCJA: porządek wykonania to ochrona zdrowia i powrotu → rezerwacja materiałów
aktywnych zadań → priorytet energii → uzupełnianie minimum → produkcja nadwyżek →
logistyka i sprzedaż. Użytkownik widzi konflikt reguł oraz przyczynę zatrzymania. Na początku
dostępne gotowe profile; edytor warunków w późniejszym etapie.
Rozliczanie czasu
PROPOZYCJA: serwer przeskakuje między istotnymi zdarzeniami, np. końcem paliwa,
zapełnieniem zbiornika lub zakończeniem receptury, zamiast symulować każdą sekundę.
Kolejność zdarzeń musi być identyczna przy otwartej i zamkniętej aplikacji. Nie wdrażamy
arbitralnego limitu naliczania offline jako ustalonej reguły; wcześniejszy wywiad mówi o pracy do
wyczerpania zasobów lub miejsca.
13 Wywiad radio raporty i katalog
USTALONE: wiedza pochodzi ze zwiadu, NPC, dokumentów, radia, obserwacji i zakupionych
raportów. Na mapie używamy poznanych przesłanek zamiast sztucznego „poziomu lokacji 8”.
Katalog Zagrożeń obejmuje zachowania, występowanie i słabości. Zdobytą wiedzę bohater
może wykorzystywać automatycznie.
Rodzaj informacji
Wiarygodność
Skutek
Własna obserwacja
Rzeczywiste dane z datą
Aktualizacja wiedzy osobistej
Raport systemowy gracza
Prawdziwy zapis obserwacji; może się
zestarzeć
Określone wpisy katalogu bez osiągnięcia
fabularnego
Znacznik społeczności
Źródło i niezależne potwierdzenia
Wskazówka o ograniczonej pewności
Swobodna notatka
Może być błędna lub celowo fałszywa
Wyłącznie niezweryfikowany trop
Dowód fabularny
Autentyczność nadana przez grę
Trop zgodny z etapem kampanii
Teoria na tablicy
Opinia graczy, nie kanon
Dyskusja i powiązanie dowodów
Sprzedaż wiedzy
USTALONE: sprzedawca nie zapomina, a informację można sprzedawać wielokrotnie. Stała
geografia pozostaje aktualna, aktywność patroli lub zasobów może się zmienić. Raport pokazuje
datę, źródło, zakres i pewność. Zakup nie przyznaje osobistego odkrycia ani trofeum. Późniejsze
GDD nie może narzucić limitowanej liczby kopii jako zatwierdzonej reguły.
Radio
USTALONE: wiadomości regionu i polityki, automatyczne skanowanie oraz opcjonalne ręczne
strojenie. Ważne nagrania zostają zapisane podczas nieobecności. Lepszy odbiornik i analizator
mogą ujawnić rzadkie sygnały i lokacje. PROPOZYCJA: wszystkie istotne wiadomości mają
tekstową wersję oraz filtr nowości, aby nie wymagać słuchania audycji w konkretnym momencie.
14 Rynek waluta i transakcje
USTALONE: gracze ustalają ceny i naturalną podaż. NPC jest pośrednikiem z prowizją, nie
nieskończonym automatycznym kupcem. Regiony mają osobne oferty i depozyty, ale wspólną
walutę danego serwera. x1 i x4 nie wymieniają wartości. Bezpośrednia wymiana i tablica
ogłoszeń uzupełniają targowisko.


## Strona 11

GDD 1.1  |  11
Reguły handlu
USTALONE: oferty ważne 1, 3 lub 7 dni. Wystawienie jest darmowe; opłata tylko po sprzedaży.
Wygaśnięcie prowadzi do bezpiecznego odbioru, nie do straty. Liczba ofert rośnie przez
reputację kupiecką, nie zakup za pieniądze. Możliwe negocjacje, kontroferty i zlecenia kupna z
częściowym wykonaniem oraz rezerwacją środków. PROPOZYCJE z wywiadu: prowizja 5% i
ważność negocjacji 24 godziny, do weryfikacji w balansie.
USTALONE: przeglądać ceny można w podróży, lecz wystawianie, tworzenie zleceń i odbiór
wymagają kryjówki lub osady. Już aktywne oferty działają podczas nieobecności. Zakup w innym
regionie pozostaje w jego depozycie do odbioru lub przewozu.
Bezpieczna wymiana
PROPOZYCJA: obie strony potwierdzają ten sam zestaw przedmiotów i waluty; każda zmiana
unieważnia potwierdzenia. Serwer atomowo przenosi własność. Oferta i bezpośrednia wymiana
nie mogą jednocześnie sprzedać tego samego egzemplarza. Ponowienie po błędzie sieci
zwraca wynik tej samej operacji, nie duplikuje transferu.
Obieg wartości
Źródła materiałów to wyprawy i produkcja; zużycie tworzą amunicja, filtry, paliwo, leki, naprawy i
projekty. Waluta powstaje z kontrolowanych nagród i zleceń NPC; handel graczy głównie ją
przenosi, prowizja usuwa. Dynamiczny popyt osad ma ograniczony budżet. Statystyki rynku
pokazują rzeczywiste transakcje, wolumen i historię, bez sugerowania gwarantowanej wartości
przedmiotu.
15 Pojazdy transport i gospodarka regionalna
USTALONE: pojazdy można odnaleźć, naprawić, ulepszyć i personalizować. Zużywają paliwo i
środki eksploatacyjne. Rodzaj pojazdu wpływa na podróż, ładowność oraz dostępność tras.
Własny pojazd użyty do przewozu nie jest równocześnie dostępny na wyprawie.
Oddzielone ryzyka
USTALONE: podróż bohatera i eksploracja mogą wiązać się z zagrożeniami, ale transport
prywatnego mienia i przewóz handlowy są bezpieczne. Ładunek zawsze dociera; logistyka
kosztuje czas, paliwo lub usługę. Gracz wybiera przewoźnika NPC albo własny konwój. Nie
trzeba pilnować konwoju ani rozgrywać walk podczas snu.
Regionalny arbitraż
USTALONE: różnice cen wynikają z podaży graczy i potrzeb regionu. Informacje porównawcze
wymagają łączności. Towaru nie przenosi sam zakup, a koszt przewozu zależy od odległości i
masy. PROPOZYCJA: podgląd rentowności pokazuje cenę zakupu, prowizję, transport i
niepewność przyszłej ceny sprzedaży; nie gwarantuje zysku.
Automatyzacja handlu
USTALONE: ograniczone polecenia kupna, wystawiania i wysyłki działają z budżetem oraz
posiadanym towarem, także offline. Nie mają tworzyć giełdowego bota. PROPOZYCJA: brak
automatycznego agresywnego podbijania cen co sekundę; reguła ma limit ilości, budżetu i
czasu. Szczegółowe limity oraz częstotliwość sprawdzania wymagają testów.


## Strona 12

GDD 1.1  |  12
Zależności gospodarcze
PROPOZYCJA: naprawa drogi zmniejsza jawny składnik kosztu przewozu, bez
natychmiastowego zniesienia różnic regionalnych. Tabela transportu musi uwzględniać x4 oraz
rezerwację konkretnego pojazdu. Przy przeprowadzce gracz otrzymuje listę pozostawionych
urządzeń, zasobów i zaplanowanych zleceń, aby sprzedaż bazy nie usunęła aktywnego ładunku.
16 Frakcje graczy i kontrakty
USTALONE: frakcje do 50 osób. Każdy nadal prowadzi jednego samowystarczalnego bohatera.
Brak wspólnego magazynu; wkłady są dobrowolnie przekazywane na siedzibę, projekty lub
badania. Wyrzucenie lub odejście nie odbiera prywatnego ekwipunku ani postępów. Wpłacone,
wykorzystane materiały pozostają w projekcie.
Współpraca bez obowiązku
USTALONE: asynchroniczny udział, prywatny czat, cele i rankingi. Samotny gracz może zdobyć
najlepszy sprzęt, całą osobistą fabułę i technologie. Nie musi czekać na medyka lub członka
frakcji. PROPOZYCJA: dostępne rodzaje wkładu obejmują dostawy, zwiad, dokumentację i
samodzielne kontrakty zliczane do celu. Nie wdrażać wspólnej drużyny bohaterów bez
dodatkowego projektu zasad.
Projekty i bonusy
USTALONE: rozwój siedziby oraz badania. Dokładne bonusy z wywiadu były przykładami, np.
usługi warsztatu i informacje. PROPOZYCJA: każdy projekt ma jawny koszt, cel, wkład, rezultat i
historię zmian. Pasywny bonus nie może stać się obowiązkiem do przejścia fabuły. OTWARTE:
zakres korzyści po odejściu, los niewykorzystanej wpłaty i zasady anulowania.
Uprawnienia i komunikacja
PROPOZYCJA: lider, oficer i członek; dziennik wpłat i działań; procedura zmiany nieaktywnego
lidera; brak wypłacania projektu na prywatne konto. Rozwijany limit 10–20–35–50 był
propozycją, zatwierdzono maksimum 50. Kontrakty mają czytelne cele i postęp, bez
obowiązkowej codziennej obecności. Czat i nazwy wymagają zgłaszania, blokowania i narzędzi
moderacji przed publicznym uruchomieniem.
17 Osobista odbudowa i projekty serwera
USTALONE po korekcie właściciela: nowy gracz ma doświadczyć całej gry od początku.
Osobista odbudowa osady i jej historia nie mogą być pominięte dlatego, że społeczność
ukończyła projekt rok wcześniej. Wspólne projekty mają odrębną rolę: dodatkowa infrastruktura,
usługi, odkrycia i kronika.
Warstwa
Właściciel postępu
Co widzi późniejszy gracz
Kampania i osobista odbudowa
Postać
Pełny początek zniszczoną osadę i własne
zadania
Dodatkowa infrastruktura
Serwer
Aktualny ukończony stan i historię wkładu
Rozwój siedziby
Frakcja
Stan organizacji według członkostwa
Trofeum uczestnictwa
Rzeczywisty uczestnik
Brak przypisania nagrody za niewykonaną pracę


## Strona 13

GDD 1.1  |  13
Reguły wspólnych projektów
USTALONE: przygotowana kolejność, wiele form pomocy, brak terminu utraty postępu.
Ukończone obiekty i bazowe usługi zostają; społeczność może wykonywać dodatkowe prace za
wynagrodzenie i doświadczenie. Okresowy bonus może wygasnąć tylko do trwałego poziomu
bazowego. Odbudowa zmienia też wygląd osady i otoczenia, a późniejsze projekty mają
sensowny cel i zakończenie.
Nagrody i uczciwość
USTALONE: wynagrodzenie za rzeczywiście wykonaną pracę, odpowiednie doświadczenie,
osobiste niezbywalne trofea i kronika zasłużonych. Nie tylko wartość pieniędzy mierzy wkład.
PROPOZYCJA: zadania mają zatwierdzony limit wynagrodzeń, aby projekt nie emitował
nieskończonej waluty. Status uczestnika wynika z dziennika pracy, nie ostatniej wpłaty przed
ukończeniem.
Spójne sceny
PROPOZYCJA: osobista misja działa w odpowiedniej instancji etapu, a usługa wspólnego
projektu ma osobną nazwę i punkt dostępu. Przykład: odbudowa lokalnej elektrowni w historii
bohatera nie jest tym samym obiektem co uruchomienie regionalnej sieci przekaźników.
Rozdzielenie zapobiega sprzecznym dialogom i obrazom.
18 Kampania dialogi i tajemnice
USTALONE: jedna niezmienna główna historia, kluczowe wydarzenia w określonej kolejności i
nowe rozdziały jako kontynuacja. Wcześniejsze odkrycie wejścia nie daje prawa ominąć etapu.
Każdy nowy gracz zaczyna od prologu, bez sezonowego resetu fabuły. Zmienne relacje i
poboczne losy NPC nie zmieniają kanonu kampanii.
Dialogi i zaufanie
USTALONE: rozmowy są wcześniej zaprojektowane, bez generowania na żywo. Gracz widzi
dokładne brzmienie odpowiedzi. Umiejętności, wiedza, zawód i relacje mogą dodawać opcje;
niedostępne odpowiedzi pozostają ukryte. Ważne trwałe decyzje mają świadome potwierdzenie,
a brak opcji specjalistycznej nie może odbierać podstawowych usług.
NPC i polityka
USTALONE: wybrane osoby pamiętają działania bohatera, odwiedzają schronienie jako goście i
mają zaplanowane sekrety. Reputacja jest lokalna oraz odbudowywalna działaniami. Frakcje
NPC mają odmienne wizje odbudowy, dynamiczną dyplomację i strefy wpływu. Gracz może
uczestniczyć, lecz nie decyduje o wyniku całej polityki. Prywatne bazy, infrastruktura i dostęp do
kampanii pozostają bezpieczne.
Dziennik i zagadki
USTALONE: zakładki zadań, historii, ludzi i miejsc oraz własne opcjonalne notatki. Główne
wskazówki są porządkowane automatycznie. Dodatkowe sekrety mogą wymagać
samodzielnego łączenia informacji, powrotu ze sprzętem albo nie mieć znacznika zadania.
Najtrudniejsze są opcjonalne i nie wymagają absurdalnie niskiej szansy losowej. PROPOZYCJA:
rozdzielić poziom automatycznego śledztwa od osobnej tablicy teorii, aby nie rozwiązywać za
gracza dobrowolnych zagadek.


## Strona 14

GDD 1.1  |  14
Zawartość po aktualnej kampanii
USTALONE: wymagające wyprawy, rzadkie transmisje, badania, kolekcje, technologie, handel i
współpraca. Trudność ma wymagać wiedzy i przygotowania, a nie tylko dziesięciokrotnie
większych punktów zdrowia przeciwnika.
19 Ślady graczy archiwum i moderacja
USTALONE: notatki, ślady i odkrycia pozwalają czuć obecność innych bez walki o osobiste
zasoby. Wiadomości mogą być anonimowe publicznie, lecz system zna autora. Mają
ograniczenia liczby i trwałości oraz możliwość zgłaszania. Mogą prowadzić do
niezweryfikowanych znaczników; nie zastępują rzetelnego raportu systemowego.
Wspólna tablica śledcza
USTALONE: potwierdzone dowody oraz teorie, z możliwością łączenia i dyskusji. Popularna
hipoteza nie jest prawdą. Gracz dobrowolnie publikuje dowód lub notatkę; prywatne teorie nie
wyciekają automatycznie. Dodatkowe zagadki społeczności mogą trwale zmieniać świat, ale nie
blokują pełnej osobistej kampanii.
Kronika i nazwy
USTALONE: pierwszy udokumentowany odkrywca wybranej nienazwanej lokacji może nadać jej
moderowaną nazwę. Ważne miejsca fabularne zachowują nazwy autorów. Osiągnięcie jest
trwałe i nie daje własności ani wyłącznego łupu. Archiwum słynnych przedmiotów przechowuje
prawdziwą historię, a sława nie podnosi parametrów.
Minimalny zakres ochrony społeczności
PROPOZYCJA: zgłoszenie, blokada użytkownika, filtr widoczności i panel moderacyjny dla
czatu, nazw, notatek oraz teorii. Usunięcie obraźliwej nazwy zachowuje techniczny identyfikator
lokacji i nie odbiera odkrywcy prawidłowego osiągnięcia. Ranking nie zlicza handlu między
powiązanymi kontami jako samodzielnego sukcesu. Polityka prywatności zapisów oraz zasady
retencji wymagają osobnego przygotowania przed premierą.
20 UX i przepływy na telefonie
USTALONE: główny ekran to kryjówka z panelem wyprawy, produkcji, radia, wyposażenia i
zadań. Panel się zwija. Gracz zarządza stanowiskami również przez szybki interfejs, bez
obowiązkowego odwiedzania pięciu pomieszczeń. Mapa wyprawy dominuje na ekranie
ekspedycji, szczegóły są w panelach.


## Strona 15

GDD 1.1  |  15
Przepływ
Informacja przed decyzją
Stan po działaniu
Start wyprawy
Trasa czas koszty ryzyko taktyka
Potwierdzona jedna aktywna wyprawa
Interwencja
Co jeszcze można zmienić
Przyjęte polecenie lub wyjaśnienie
opóźnienia
Powrót
Wynik i najważniejsze przyczyny
Łup rozliczony jeden raz
Produkcja
Materiały efekt czas i lokalny magazyn
Kolejka oraz przyczyna postoju
Zakup
Cena region stan i transport
Lokalny depozyt lub przewóz
Sprzedaż bazy
Co zostaje i co wywieziono
Zwolniony limit bez utraty historii
Publikacja notatki
Odbiorcy i zakres ujawnienia
Treść publiczna tylko po świadomym
wyborze
Proponowane standardy użyteczności
Cele dotykowe 44–48 jednostek logicznych, skalowalny tekst, czytelny kontrast oraz sygnały
inne niż sam kolor. Alternatywny dostęp listą do małych obiektów wnętrza. Ograniczenie
animacji, osobne suwaki dźwięku i wszystkie istotne wiadomości w tekście. Orientację ekranu
zatwierdzić po makiecie; nie przyjmować jej jako ustalonej.
Nieobecność i błąd sieci
PROPOZYCJA: jedno zbiorcze podsumowanie powrotu, bez lawiny nagród do ręcznego
klikania. Powiadomienia domyślnie dotyczą zakończenia lub zatrzymania procesu, nie
rutynowego każdego zdarzenia. Polecenie oczekujące jest oznaczone, a po błędzie zachowuje
się plan i można bezpiecznie sprawdzić jego stan. Czas telefonu nigdy nie rozstrzyga produkcji.
21 Kierunek artystyczny i dźwięk
USTALONE: stylizowany realizm z wybranego porównania graficznego. Wiarygodne proporcje,
ilustracyjna forma, mrok, rdza, brud i charakterystyczne światło. Kolor może być wyrazisty, lecz
nie bajkowy. Ten sam język wizualny obowiązuje mapę, wnętrza, ilustracje i portrety. Podstawę
zagrożeń stanowią ludzie i zwierzęta, nie wielkie fantastyczne mutanty.
Wnętrza jako znak rozpoznawczy
USTALONE: osobne szczegółowe sceny, widoczne ustawione obiekty i trofea, animacje świateł,
urządzeń oraz bohatera. Pogoda i pora dnia zmieniają atmosferę. Kurz lub ślady czasu są tylko
wizualne, bez opłaty za sprzątanie. PROPOZYCJA: przygotować wzorcowy pokój i bibliotekę
modułów przed produkcją wielu baz. Wybór 2D, 2.5D albo 3D pozostaje technicznym pytaniem.
Dźwięk
USTALONE: charakterystyczne brzmienie typów schronienia, reakcja na pogodę i urządzenia,
oszczędna muzyka oraz Radio Ocalałych. Osobne regulacje muzyki, efektów i radia. Wszystkie
ważne informacje także jako tekst. Aplikacja nie odtwarza stale rozbudowanego świata w tle.
Pakiet do zatwierdzenia
PROPOZYCJA: plansza stylu zawiera bohatera w trzech zestawach, człowieka i zwierzę jako
przeciwników, szczegółowy warsztat, przegląd kryjówki, mapę i jedną ilustrację wyprawy. Test
na telefonie weryfikuje czytelność ikon, przedmiotów i stanu urządzeń. Obraz referencyjny z
wywiadu jest kierunkiem, nie licencją do kopiowania rozpoznawalnych postaci i świata innych
gier.


## Strona 16

GDD 1.1  |  16
22 Serwery czas zapis i odporność
USTALONE: x1 i x4 mają oddzielne postacie, gospodarki, frakcje, zasoby i rankingi. Na x4
wyprawy, produkcja i badania są czterokrotnie szybsze. Jedno konto może rozwijać niezależne
postacie w obu światach. Żadne przenoszenie wartości z x4 nie może zasilać rynku x1.
Tabela tempa
Proces
x1
x4
Ta sama wyprawa
T
T ÷ 4
Produkcja badania podróż
T
T ÷ 4
Leczenie w kryjówce z lekami
Natychmiast
Natychmiast
Zapasy jednej identycznej wyprawy
Koszt bazowy
Ten sam koszt całkowity
Materiały receptury i rezultat
Koszt i wynik bazowy
Te same na jedno
wykonanie
Pora roku
Długość do balansu
Czterokrotnie krócej według
propozycji
Oferty 1 3 7 dni i moderacja
Zegar rzeczywisty
proponowany
Zegar rzeczywisty
proponowany
PROPOZYCJA: szybszy cykl daje większy obrót na godzinę, bez dodatkowego mnożenia
nagrody za działanie. Czasy ofert, zgłoszeń, płatności i komunikacji pozostają rzeczywiste;
długość wydarzeń trzeba zatwierdzić oddzielnie. Nie narzucamy limitu 24 godzin świata na
naliczanie offline jako potwierdzonego ustalenia.
Wymagania implementacyjne proponowane
Serwer rozstrzyga czas, własność, transakcje i nagrody. Każde zadanie ma identyfikator, wersję
reguł, zapis losowania i wynik odporny na ponowne wysłanie. Klient jest prezentacją oraz
źródłem poleceń. Obowiązkowe testy: dwa urządzenia, przerwane połączenie, podwójne
odebranie, aktualizacja parametrów w czasie wyprawy i odtworzenie kopii zapasowej. Baza
danych oddziela stan postaci, serwera i konta.
23 Monetyzacja i trwałość projektu
USTALONE: tylko kosmetyka. Nie sprzedajemy waluty rozgrywki, siły, punktów, badań,
przyspieszeń, przewagi handlowej ani dodatkowych slotów ofert. Kosmetyk nie zwiększa
pojemności, ochrony, dostępu do wiedzy czy szybkości. Gra ma utrzymywać serwery i rozwój,
ale żadna wcześniejsza przykładowa kwota nie jest prognozą przychodów.
Proponowany katalog
Wygląd ubioru i wyposażenia, warianty wnętrz, światła, zwykłe dekoracje, ramy i emblematy.
Wyraźnie oddzielamy je od osobistych trofeów potwierdzających osiągnięcia. Płatny przedmiot
nie może być zamieniany na walutę rozgrywki przez rynek. Karnet wyłącznie kosmetyczny był
pomysłem na później, nie wymaganiem premiery.


## Strona 17

GDD 1.1  |  17
Otwarte warunki biznesowe
OTWARTE: darmowy dostęp czy inny model bazowy, ostateczna oferta, ceny, rotacja, waluta
kosmetyczna i ewentualny abonament wizualny. PROPOZYCJA: zacząć od małego sklepu
zakupów bezpośrednich z podglądem, przywracaniem zakupów i poprawnym rozliczaniem
zwrotów. Zatwierdzenie modelu kosmetycznego nie oznacza zatwierdzenia losowych skrzynek
ani konieczności reklam.
Proponowany model oceny
Miesięczny przychód brutto = aktywne konta × udział kupujących × średni zakup. Wynik
pomniejsza się o prowizje, zwroty, podatki, infrastrukturę, moderację i tworzenie treści. Wartości
należy zebrać w testach, nie wpisać jako gwarancji. Płynność regionalnych rynków, obsługa
społeczności i produkcja szczegółowych wnętrz mogą kosztować więcej niż sam serwer
symulacji.
24 MVP i kolejne wydania
Cały podział etapów w tym rozdziale jest PROPOZYCJĄ do zatwierdzenia. MVP to zamknięty
test podstawowej pętli, nie obietnica wydania pełnej gry z pominiętymi funkcjami. Docelowe
reguły pozostają zapisane w rejestrze.
Obszar
MVP zamknięte
Późniejszy etap
Bohater
Jeden prosty kreator i podstawowa progresja
Pełne dziedziny atuty zawody
Fabuła
Krótki wycinek prologu i jeden stały ciąg celów
Docelowy prolog kampania i powrót
Wyprawy
Jeden region 6 lokacji serie i trzy taktyki
Rozwinięte trasy regiony wydarzenia
Walka
3 zachowania wrogów podstawowe urazy
Poddanie negocjacje pełna wiedza
Crafting
12 receptur naprawa bez degradacji
Materiały moduły i pełne technologie
Badania
Prosta ścieżka i limit dwóch zadań
Rozgałęzienia dokumentacja frakcji
Kryjówka
Jedna baza i 3 funkcje szczegółowy warsztat
Pięć baz energia transport dekorowanie
Informacje
Katalog i dziennik wyprawy
Raporty radio znaczniki i reputacja
Sieć
Zapis i czas autorytatywny x1
Rynek frakcje i osobny x4
Sklep
Bez płatności test wyglądu
Mały zweryfikowany sklep kosmetyczny
Kolejność po MVP
PROPOZYCJA: A rozwija treść, energię, wnętrza i badania; B uruchamia logistyki oraz rynek po
testach własności; C frakcje, moderację i projekty; D x4, szerszą kampanię, wspólną odbudowę i
sklep. Większe zagadki społeczności, archiwum sławnych przedmiotów i handel kryjówkami
mogą wejść po premierze. Kolejność podlega estymacji zespołu.
Warunki uznania MVP
PROPOZYCJA: pełna pętla na telefonie; identyczne rozliczenie online i offline; brak duplikacji
oraz utraty własności w testach powtórzeń; sensowny wybór trasy i zapasów; czytelna przyczyna
porażki; szybka naprawa i natychmiastowe leczenie; co najmniej 8 z 10 nowych testerów
samodzielnie kończy pierwszą pętlę. To test użyteczności, nie dowód popytu rynkowego.


## Strona 18

GDD 1.1  |  18
25 Harmonogram zależności i testy
PROPOZYCJA: 24–32 tygodnie do zamkniętego MVP przy zespole 4–6 osób obejmującym
klienta, serwer, projektowanie, grafikę i QA. To założenie planistyczne, nie termin zobowiązania.
Pełna premiera wymaga osobnej estymacji po wycinku. Jedna osoba pracująca po godzinach
potrzebuje innego zakresu i harmonogramu.
Etap
Tygodnie
Rezultat
Preprodukcja
1–3
Domknięcie pytań reguły danych makiety i biblia świata
Prototyp
4–7
Wyprawa automatyczna walka i deterministyczny crafting
Pionowy wycinek
8–12
Pełna pętla na telefonie szczegółowe wnętrze i zapis
Produkcja MVP
13–20
Uzgodniony pakiet treści progresja serie i podstawowe badania
Integracja QA
21–24
Nieobecność konflikty komend wydajność migracje i użyteczność
Bufor test zamknięty
25–32
Naprawy balans pomiar i decyzja o dalszym budżecie
Pakiety do przygotowania
PROPOZYCJA: słownik przedmiotów i receptur, graf mapy, modele stanów wyprawy, taktyki
przeciwników, tabele urazów, drzewo badań, definicje modułów, biblia fabuły i ekranów, schemat
własności oraz plan telemetrii. Każdy ma wersję i właściciela. Zmiana receptury musi przejść
analizę gospodarki, x4 i automatyzacji.
Testy przed systemami społecznymi
PROPOZYCJA: powtórzone i równoległe żądania, przerwane zakupy, częściowe zlecenia,
depozyt pełnego magazynu, transport zajętego pojazdu, odejście z frakcji w trakcie projektu i
zmiana wersji w aktywnej wyprawie. Odtworzenie kopii zapasowej i dziennika gospodarki jest
warunkiem uruchomienia rynku. Oddzielnie testować dostępną od początku osobistą odbudowę
na starym serwerze.
Pomiar
PROPOZYCJA: ukończenie pierwszej pętli, zrozumienie ryzyka, powody zatrzymania serii,
tempo zużycia, inflacja, czas sprzedaży i płynność regionów. Cele retencji, przychodu i liczby
graczy należy ustalić po określeniu odbiorców oraz testach. Nie zakładamy, że ambitna liczba
systemów sama zapewni sukces.


## Strona 19

GDD 1.1  |  19
26 Ryzyka i decyzje wymagające kontroli
Ryzyko
Konsekwencja
Proponowane działanie
Zakres i koszt treści
Brak ukończonej pętli
MVP oraz wzorcowe wnętrze przed masową produkcją
Automatyzacja zbyt słaba
Obowiązek sprawdzania
telefonu
Test tych samych działań przy otwartej i zamkniętej
aplikacji
Nieskończony sprzęt na
rynku
Nadpodaż wyposażenia
Popyt na materiały moduły oraz środki eksploatacyjne
bez niszczenia dorobku
Regionalny pusty rynek
Blokada rozwoju przy małej
populacji
Samowystarczalność i kontrolowane kontrakty NPC
Duplikacja i konta
pomocnicze
Inflacja i fałszywe rankingi
Autorytet serwera dziennik oraz analiza powiązań
Sprzeczne etapy świata
Nowy gracz traci fabułę
Oddzielne osobiste scenariusze i projekty serwera
x4 i sezonowość
Presja częstych powrotów
Test zużycia zapasów magazynów i długości
wydarzeń
Dane graczy i moderacja
Nadużycia nazw notatek
czatu
Panel zgłoszeń blokady oraz uprawnienia
Kosmetyka o małym
popycie
Brak finansowania rozwoju
Test stylu i kosztów przed skalowaniem treści
Spójność najważniejszych zmian
USTALONE: materiały dają jawny rezultat, leczenie jest natychmiastowe, jedzenie i woda nie
tworzą stałych pasków, trofea nie są towarem, kampania nie zmienia się od działań
społeczności. Te zasady mają pierwszeństwo przed wcześniejszymi pomysłami sprzecznymi z
późniejszym wyborem. Załącznik B dokumentuje rozstrzygnięcia, aby nie wracały przypadkowo
podczas programowania.
Techniczne kompromisy do akceptacji
PROPOZYCJA: zamrożenie reguł aktywnego zadania, osobny limit badań na postać, brak
osobistego doświadczenia z pięciu automatów, bezpieczny bufor odbioru oraz oddzielny zegar
ofert. Żaden z tych kompromisów nie powinien być przedstawiany jako już wybrany przez
właściciela. Ich akceptacja jest częścią przeglądu specyfikacji wdrożeniowej.


## Strona 20

GDD 1.1  |  20
27 Otwarte pytania i dalsze decyzje
Kiedy
Pytanie
Dlaczego jest potrzebne
Przed prototypem
Platforma startowa i orientacja ekranu
Końcowe wcześniejsze podsumowanie
mówi Android potem iOS lecz wymaga
potwierdzenia właściciela
Przed prototypem
Budżet zespół dostępność i technologia
Warunkuje wiarygodny zakres i terminy
Przed prototypem
Makieta widoku ogólnego kryjówki
Wyjaśnia napięcie między wcześniejszym
brakiem przekroju a końcowym przekrojem
Przed balansem
Ile niezabezpieczonego łupu można stracić i jak
odzyskać
Wywiad zmieniał opis od całości do części
Przed balansem
Progi odwrotu przeciążenia zużycie i długości
działań
Większość wartości w wywiadzie była
przykładem
Przed badaniami
Globalny limit dwóch i praca osobista kontra
urządzenia
Zapobiega mnożeniu badań oraz
doświadczenia przez pięć baz
Przed treścią
Prawdziwa przyczyna katastrofy nazwy i
scenariusz
Kierunek ustalony lecz brak kompletnej
biblii i dialogów
Przed rynkiem
Dokładne prowizje negocjacje i reguły
odsprzedaży raportu
Kopie wielokrotne ustalone mechanika
egzemplarza nie
Przed frakcjami
Dziedziczenie lidera anulowanie i wiedza po
odejściu
Własność wiedzy i wkład muszą być
jednoznaczne
Przed x4
Zegary ofert wydarzeń sezonów i limitów
komunikacji
Nie każdy czas powinien skracać się
czterokrotnie
Przed sklepem
Model dostępu ceny i zakres kosmetyki
Ustalono uczciwą granicę lecz nie ofertę
biznesową
Przed premierą
Populacja regionów moderacja prywatność i
utrzymanie
Warunkuje gotowość usług społecznych
Kontrola zmian
PROPOZYCJA: każda nowa decyzja ma ID, datę, autora, status, uzasadnienie oraz zależne
systemy. Dopiero akceptacja właściciela zmienia PROPOZYCJĘ w USTALONE. Zmiana
zakresu premiery nie usuwa elementu docelowego bez osobnej decyzji. Wersja GDD jest
aktualizowana razem z listą zastąpionych reguł i kryteriami testu.


## Strona 21

GDD 1.1  |  21
Załącznik A Rejestr ustaleń z wywiadu
Rejestr porządkuje wybrane reguły z całego wywiadu o grze. Nie jest licznikiem oryginalnych
pytań. M oznacza kolejność wiadomości użytkownika w indeksie udostępnionej rozmowy;
obejmuje on 303 pozycje, także niezwiązane z projektem, przerwy i prośby o pliki. Zakres M
wskazuje fragment, w którym należy czytać pytanie, odpowiedź i dalsze doprecyzowanie łącznie.
Powtórzenia scalono, a jednoznaczne późniejsze korekty mają pierwszeństwo.
Źródło: Gra na telefon • https://chatgpt.com/share/6ade5c7a-ee30-83eb-87ec-71a7bdedb5bb •
odczyt 25 października 2026. Treści wcześniejszego asystenta są dowodem przedstawionych
opcji, nie automatyczną zgodą właściciela na każdy dodatkowy przykład lub liczbę.
A Fundamenty
Źródło porównawcze: M28–M71. Status reguł w tej grupie: USTALONE; robocze liczby
wskazano w treści.
D001 Mobilna gra idle survival RPG w autorskim świecie postapokaliptycznym.
D002 Jeden samotny ocalały zamiast zarządzania drużyną lub mieszkańcami.
D003 Inni gracze nie niszczą kryjówek, nie kradną majątku i nie przeszkadzają w osobistej
eksploracji.
D004 Handel, czat i frakcje budują obecność społeczności bez obowiązkowego PvP.
D005 Świat przyziemny i brutalny; większość przeciwników to ludzie i zwierzęta, a nieznane
zagrożenia są rzadkie.
D006 Własne nazwy, historia i reguły świata; brak kopiowania charakterystycznych elementów
innych gier.
D007 Wiele osobnych regionów odkrywanych stopniowo; każdy ma własne zasoby i historię.
D008 Gracz wybiera miejsce zamieszkania i może przenosić się do kolejnych schronień.
D009 Jedna wyprawa ocalałego naraz, z możliwością zaplanowania kolejnych automatycznych
wypraw na czas nieobecności.
D010 Wymagający survival przez przygotowanie i koszty, bez kar za samą nieobecność.
D011 Rankingi pozostają częścią gry; PvP odłożone poza premierę.
D012 Serwery x1 i x4 jako osobne światy rozgrywki, a nie przełącznik przewagi na wspólnym
rynku.
B Wyprawy i przetrwanie
Źródło porównawcze: M58–M75 oraz M186–M199 i M267–M295. Status reguł w tej grupie:
USTALONE; robocze liczby wskazano w treści.
D013 Własne wyposażenie zabrane z kryjówki nie przepada po porażce; może się zużyć.
D014 Ryzyko dotyczy niezabezpieczonego łupu aktualnej wyprawy i obrażeń bohatera.
D015 Brak permanentnej śmierci, utraty poziomów i trwałego kalectwa.
D016 Możliwość zabezpieczania łupów oraz wyprawy po porzucone znaleziska.


## Strona 22

GDD 1.1  |  22
D017 Po przegranej automatyczny powrót do ostatniej bezpiecznej kryjówki i zatrzymanie serii
wypraw.
D018 Podróże między regionami wymagają czasu, zapasów i przygotowania; działają w tle.
D019 Wyprawa działa automatycznie również przy zamkniętej aplikacji; obserwacja i interwencja
są opcjonalne.
D020 Aktywna obecność nie daje sztucznego mnożnika doświadczenia ani systematycznej
przewagi nad dobrze ustawioną automatyką.
D021 Gotowe strategie ostrożna, zrównoważona i agresywna oraz zapisywane konfiguracje
zaawansowane.
D022 Reguły leczenia, odwrotu, użycia amunicji, doboru celów i korzystania z broni zapasowej.
D023 Priorytety zbierania i zastępowanie mniej potrzebnych znalezisk; ochrona zapasów
powrotnych i oznaczonych przedmiotów.
D024 Stopniowe przeciążenie plecaka wpływa na zmęczenie, tempo i sprawność; progi liczbowe
pozostają robocze.
D025 Inteligentny wybór znanych lokacji przez automatykę zależnie od zasobów i strategii.
D026 Najtrudniejsze wyprawy są pojedynczymi długimi ekspedycjami, bez obowiązkowego
zatwierdzania kolejnych etapów.
D027 Podgląd wyprawy pokazuje mapę, pozycję, trasę, stan bohatera, zapasy, łupy i dziennik.
D028 Raport zawiera krótkie podsumowanie i rozwijany chronologiczny dziennik z wyróżnionymi
odkryciami.
D029 Nieodwracalne decyzje fabularne wymagają gracza; odkrycie prowadzi do późniejszego
działania, nie cofania zdarzeń.
D030 Gracz planuje trasę i punkty pośrednie, zapisuje trasy i może dopuścić automatyczne
obejście zagrożeń.
D031 Jedzenie i woda są zapasami wyprawowymi; brak osobnych stale opadających pasków
głodu i pragnienia.
C Walka i leczenie
Źródło porównawcze: M83–M85 oraz M270–M289. Status reguł w tej grupie: USTALONE;
robocze liczby wskazano w treści.
D032 Walka automatyczna przedstawiana ilustracją i rozbudowanym raportem, bez ręcznego
sterowania pojedynkiem.
D033 Ludzie korzystają z osłon, zasadzek i odwrotu; zwierzęta działają zgodnie z instynktem;
nieznane zagrożenia wymagają wiedzy.
D034 Unikanie starć przez zwiad, skradanie, zmianę trasy, odwrót i wybrane negocjacje.
D035 Hałas buduje atmosferę; nie ma osobnego wskaźnika alarmu ani przyciągania kolejnych
przeciwników przez strzały.
D036 Zdrowie oraz konkretne urazy: krwawienie, złamanie, zakażenie, napromieniowanie i
zatrucie.


## Strona 23

GDD 1.1  |  23
D037 Leczenie w kryjówce jest natychmiastowe przy posiadaniu właściwych środków; brak
wielogodzinnej rekonwalescencji.
D038 Medycyna i zaplecze medyczne poprawiają wykorzystanie środków, a nie nakładają
dodatkowy obowiązkowy licznik.
D039 Automatyczny dobór broni według dystansu, przeciwnika, amunicji, stanu sprzętu i
strategii.
D040 Amunicja liczona jako rzeczywisty koszt starcia; kalibry pozostają, ale bez symulacji
każdego przeładowania.
D041 Stan broni wpływa przewidywalnie na skuteczność; brak losowych zacięć i trwałego
zniszczenia.
D042 Część ludzkich przeciwników może uciec lub się poddać; brak systemu więzienia.
D043 Reputacja dotyczy konkretnych NPC i frakcji; brak uniwersalnego wskaźnika dobra i zła.
D044 Lokacje mają własne zagrożenia, nie automatyczne skalowanie do poziomu bohatera.
D045 Główne wyzwania fabularne są stałe dla tego samego etapu; zmienne wydarzenia serwera
nie blokują kampanii.
D Rozwój i wytwarzanie
Źródło porównawcze: M41–M43 M76–M84 M104–M126 oraz M188–M198 i M290–M292. Status
reguł w tej grupie: USTALONE; robocze liczby wskazano w treści.
D046 Ogólny poziom doświadczenia oraz poszczególne umiejętności rozwijane przez
wykonywane czynności.
D047 Każda umiejętność ma limit; jedna postać może docelowo osiągnąć mistrzostwo we
wszystkich dziedzinach.
D048 Poziomy umiejętności nigdy nie maleją przez nieobecność ani zmianę specjalizacji.
D049 Kilka rozbudowanych dziedzin zamiast osobnego paska dla każdej broni; lista ośmiu
dziedzin jest roboczą strukturą.
D050 Rozwój odblokowuje praktyczne możliwości i punkty specjalizacji; kolejność zdolności
wybiera gracz.
D051 Bezpłatna zmiana atutów w kryjówce nie przenosi doświadczenia ani punktów między
umiejętnościami.
D052 Szybki początek i długoterminowe mistrzostwo; trudne czynności dają więcej
doświadczenia, łatwe nadal rozwijają wolniej.
D053 Pełne doświadczenie podczas automatyzacji, wyłącznie za rzeczywiście wykonane
czynności.
D054 Najlepsze wyposażenie można wytwarzać; eksploracja dostarcza rzadkich schematów i
materiałów.
D055 Broń, pancerze i narzędzia można naprawiać bez końca, bez trwałej utraty maksymalnej
wytrzymałości.
D056 Nowy i używany sprzęt można odsprzedawać; trofea są osobnym niezbywalnym
wyjątkiem.


## Strona 24

GDD 1.1  |  24
D057 Realistyczna broń i nieliczne wiarygodne konstrukcje eksperymentalne bez magicznych
efektów.
D058 Modułowe modyfikacje broni oraz handel częściami; zalety mają koszty i ograniczenia.
D059 Stałe podstawowe parametry modelu; stan, jawne materiały i modyfikacje wyjaśniają
różnice egzemplarzy.
D060 Brak losowej jakości wykonania; ten sam schemat i materiały dają identyczny rezultat.
D061 Dla zaawansowanego wyposażenia wybór materiału zmienia znane wcześniej parametry;
proste zużywalne rzeczy mają stałe receptury.
D062 Amunicję można znajdować, wytwarzać i kupować.
D063 Sloty wyposażenia obejmują broń, hełm, kamizelkę, odzież, rękawice, obuwie, plecak i
akcesoria; możliwe zestawy.
D064 Rzadkie nieznane znaleziska podlegają identyfikacji w kryjówce; można nimi handlować
przed identyfikacją.
D065 Rzadkość wynika z właściwości, pochodzenia i dostępności, bez typowej drabinki
epicki–legendarny.
D066 Historia wartościowych egzemplarzy zapisywana przez grę; własne nazwy z zachowaniem
modelu i poprzednich nazw.
D067 Słynne egzemplarze w publicznym archiwum serwera; sława wynika z osiągnięć i nie
zwiększa statystyk.
D068 Dorobek, własność i historyczne osiągnięcia nie przepadają z powodu nieaktywności.
E Badania wiedza i radio
Źródło porównawcze: M108–M117 M150–M167 M176–M187 oraz M283–M286. Status reguł w
tej grupie: USTALONE; robocze liczby wskazano w treści.
D069 Odkrywanie technologii przez wyprawy i własne badania; drzewko rozgałęzione, nie jedna
narzucona kolejność.
D070 Maksymalnie dwa równoczesne projekty badawcze; brak płatnego zwiększania limitu.
D071 Badania działają podczas nieobecności; cel i korzyści są określone, bez czysto losowego
wyniku.
D072 Handel schematami; odczyt zużywa egzemplarz, poznana wiedza zostaje, jeden schemat
wystarcza do wielokrotnej produkcji.
D073 Osobista mapa eksploracji oraz handel rzeczywistymi informacjami o lokalizacjach.
D074 Informację można sprzedawać wielokrotnie i nie traci się jej ze swojego katalogu.
D075 Raport ma zakres, datę, źródło i stopień pewności; dane stałe i zmienne są odróżnione.
D076 Informacje zmienne dezaktualizują się; stary raport pozostaje, lecz pokazuje niepewność.
D077 Systemowe raporty nie zawierają danych wymyślonych przez sprzedawcę; osobiste
notatki graczy są inną kategorią.
D078 Prywatne, frakcyjne i publiczne znaczniki mapy, z datą i niezależnym potwierdzaniem.


## Strona 25

GDD 1.1  |  25
D079 Reputacja zwiadowcza opiera się na potwierdzonej trafności, nie samych ocenach lub
spamie.
D080 Radio Ocalałych przekazuje wiadomości, sytuację regionów i rzadkie sygnały tajemnic.
D081 Automatyczne skanowanie oraz opcjonalne ręczne strojenie; ważne transmisje są
zapisywane.
D082 Niektóre sygnały wymagają lepszego sprzętu i prowadzą do ukrytych lokacji.
D083 Katalog Zagrożeń rozwija się przez obserwacje, starcia, dokumenty, nagrania i rozmowy,
również bez zabijania.
D084 Raport uzupełnia określoną wiedzę katalogu, ale nie zalicza osobistego odkrycia ani
osiągnięcia fabularnego.
F Kryjówki energia i kolekcje
Źródło porównawcze: M51–M63 M95–M107 oraz M214–M237 i M298–M299. Status reguł w tej
grupie: USTALONE; robocze liczby wskazano w treści.
D085 Kryjówki prywatne w instancjach; ten sam budynek może być schronieniem różnych
graczy bez rywalizacji o własność.
D086 Maksymalnie pięć aktywnych kryjówek, odblokowywanych stopniowo.
D087 Wybór głównej bazy jest darmowy; transport mienia pozostaje fizycznym procesem.
D088 Każda kryjówka ma lokalny magazyn o ograniczonej pojemności oraz własne zasoby i
zasilanie.
D089 Wszystkie kryjówki mogą automatycznie pracować równocześnie, ale bohater nie
wykonuje osobistych czynności w kilku miejscach.
D090 Nie wolno mnożyć doświadczenia postaci przez liczbę działających warsztatów.
D091 Zdalne zarządzanie po zbudowaniu radia i terminali; remonty wymagające postaci są
lokalne.
D092 Bezpieczny transport prywatnego mienia; koszt i czas pozostają, ładunek nie ginie losowo.
D093 Moduły funkcjonalne, instalacje i wybór przeznaczenia odkrywanych oraz remontowanych
pomieszczeń.
D094 Swobodne przesuwanie mebli i dekoracji; duże urządzenia wymagają przestrzeni,
przesunięcie nie kosztuje zasobów.
D095 Rozmieszczenie dekoracji nie daje optymalizacji parametrów produkcji.
D096 Własne historie i sekrety kryjówek; zagadki nie blokują ich podstawowych funkcji.
D097 Specjalizacje schronień zależą od lokalizacji i konstrukcji; żadna nie blokuje
podstawowych możliwości.
D098 Własna produkcja jedzenia i wody uzupełnia wyprawy i handel, lecz nie zastępuje ich
całkowicie.
D099 Produkcja działa offline do wyczerpania wejść, energii lub miejsca; brak samoczynnych
losowych awarii urządzeń.


## Strona 26

GDD 1.1  |  26
D100 Automatyzacja minimalnych zapasów, produkcji, napraw i uzupełniania ekwipunku
korzysta wyłącznie z lokalnych zasobów.
D101 Generatory, panele słoneczne, akumulatory i priorytety zasilania; bez ręcznego
prowadzenia przewodów.
D102 Sprzedaż kryjówek NPC; handel między graczami jako późniejszy kierunek.
D103 Wirtualne oglądanie kryjówki przez profil oraz odwiedziny w świecie, bez kradzieży i
ingerencji.
D104 Prywatność całej bazy i wybranych pomieszczeń; odwiedziny bez jednoczesnej obecności
graczy.
D105 Trofea są niezbywalne, zdobywane osobiście i nie przepadają na wyprawie.
D106 Trofea trafiają do kolekcji wyposażenia kryjówki, nie zajmują zwykłego magazynu i nie
muszą być wystawiane.
D107 Trofea mają różną trudność zdobycia, pochodzenie i historię; nie zapewniają siły ani
przewagi ekonomicznej.
D108 Widoczny bohater i subtelne animacje aktywności, pogody, światła oraz urządzeń; bez
pełnej symulacji chodzenia.
D109 Kryjówka jako ekran główny ze zwijanym panelem wyprawy, produkcji, radia, ekwipunku i
zadań.
D110 Szczegółowe widoki pomieszczeń oraz widok ogólny; późniejsze ustalenie opisuje ogólny
widok jako przekrój.
G Handel i logistyka
Źródło porównawcze: M53–M57 M78–M80 oraz M131–M150. Status reguł w tej grupie:
USTALONE; robocze liczby wskazano w treści.
D111 Ceny ustalają gracze; NPC pośredniczy w rynku i pobiera prowizję.
D112 Bezpośrednia bezpieczna wymiana oraz tablica ogłoszeń obok targowiska.
D113 Osobne regionalne rynki i depozyty; jedna waluta rozgrywki w całym serwerze.
D114 Gospodarki, postacie, rynki i rankingi x1 oraz x4 pozostają oddzielne; brak transferów
wartości.
D115 Oferty sprzedaży ważne 1, 3 lub 7 dni; wygaśnięcie zwraca przedmiot do bezpiecznego
depozytu.
D116 Wystawianie darmowe, prowizja tylko od udanej sprzedaży; procent jest parametrem do
balansu.
D117 Rozwijany przez reputację kupiecką limit ofert; brak zakupu miejsc za prawdziwe
pieniądze.
D118 Negocjacje cen oraz kontroferty; zabezpieczenie pokrycia i terminu propozycji.
D119 Zlecenia kupna z rezerwacją środków i możliwością częściowej realizacji.
D120 Przegląd rynku zdalnie; wystawianie, zlecanie i odbiór w bezpiecznym miejscu.


## Strona 27

GDD 1.1  |  27
D121 Łączność umożliwia zdalne porównanie regionów; towar pozostaje w depozycie
właściwego regionu.
D122 Bezpieczny transport handlowy przez usługę NPC albo własny konwój; bez losowego
zniszczenia ładunku.
D123 Własny pojazd zajęty transportem nie służy równocześnie do eksploracji.
D124 Pojazdy można odnajdywać, naprawiać, ulepszać i personalizować; wymagają paliwa i
konserwacji.
D125 Ograniczona automatyzacja kupna, sprzedaży i wysyłki z limitem budżetu oraz pokryciem
w towarze.
D126 Statystyki rzeczywistych transakcji, historia cen, wolumen i porównanie regionów; bez
narzucania cen.
D127 Popyt osad reaguje na wydarzenia; NPC mają ograniczony budżet i zapotrzebowanie.
D128 Waluty rozgrywki nie można kupować za prawdziwe pieniądze.
H Świat fabuła i NPC
Źródło porównawcze: M72–M74 M85–M94 M159–M183 oraz M201–M205 i M252–M269. Status
reguł w tej grupie: USTALONE; robocze liczby wskazano w treści.
D129 Świat niedługo po upadku cywilizacji; część ludzi pamięta dawny porządek i część
infrastruktury nadal działa.
D130 Katastrofa ma jedną konkretną prawdę znaną autorom, ujawnianą stopniowo graczowi.
D131 Nieznane zjawisko objawia się zakłóceniami technologicznymi; jest sporadycznie nadal
aktywne i ma logiczne reguły.
D132 Zjawisko nie niszczy losowo majątku, wyposażenia ani produkcji w kryjówce.
D133 Można badać, prognozować i wykorzystywać wiedzę o zakłóceniach do technologii;
prognoza ma niepewność.
D134 Technologie związane ze zjawiskiem są zbywalne; posiadanie urządzenia nie zastępuje
umiejętności jego obsługi.
D135 NPC mają fragmentaryczną wiedzę, mogą się mylić i ukrywać zaplanowane sekrety.
D136 Frakcje NPC reprezentują różne wizje odbudowy; bohater pozostaje niezależny i
współpracuje z wieloma.
D137 Reputację nawet po poważnym konflikcie można odbudować działaniami; brak trwałej
blokady głównej gry.
D138 Konflikty, strefy wpływów i dyplomacja NPC są dynamiczne, logicznie uzasadnione i nie
niszczą prywatnego dorobku.
D139 Gracz uczestniczy w konfliktach, lecz nie rozstrzyga wyniku wielkiej polityki świata.
D140 Wybrani NPC pamiętają pomoc, mają rozwinięte relacje i mogą odwiedzać kryjówkę jako
goście, nie pracownicy.
D141 Decyzje poboczne mogą zmieniać historie NPC i relacje; ważne decyzje są trwałe i
wymagają świadomego wyboru.


## Strona 28

GDD 1.1  |  28
D142 Dialogi zaprojektowane wcześniej, bez generowania rozmów na żywo przez AI.
D143 Pełne wypowiedzi bohatera przed wyborem; dodatkowe opcje zależą od wiedzy,
umiejętności i relacji; niedostępne odpowiedzi są ukryte.
D144 Bohater ma wybierany wygląd, pseudonim i zawód, ale częściowo ustaloną przeszłość,
wspomnienia i znajomości; brak amnezji.
D145 Zawód daje niewielki startowy bonus i kontekst dialogowy, nie klasę ani osobną kampanię.
D146 Prosty darmowy kreator na początek; wyposażenie jest widoczne na postaci.
D147 Prolog w dawnej kryjówce prowadzi do jej utraty; późniejszy powrót jest ważnym
momentem historii.
D148 Dawna kryjówka prologu jest lokacją scenariusza, nie dodatkową aktywną bazą poza
limitem pięciu.
D149 Decyzje prologu wracają w relacjach i pobocznych konsekwencjach, bez zmiany głównej
kampanii.
D150 Główna historia jest niezmienna, w ustalonej kolejności; eksploracja nie omija jej etapów.
D151 Nowe rozdziały kontynuują kampanię; każdy późniejszy gracz zaczyna od początku; brak
sezonowych resetów fabuły.
D152 Osobista odbudowa i osobiste scenariusze pozostają dostępne niezależnie od
ukończonych projektów serwera.
D153 Dziennik ocalałego łączy zadania, osobistą historię, ludzi i miejsca; zapamiętuje
rzeczywiste decyzje.
D154 Własne prywatne notatki z wyszukiwaniem i powiązaniami; publikacja tylko dobrowolna.
D155 Wskazówki fabularne są porządkowane automatycznie, lecz część dodatkowych zagadek
wymaga samodzielnego myślenia.
D156 Powroty do dawnych lokacji z nową wiedzą; część sekretów nie jest oznaczana jako
zadanie.
D157 Najtrudniejsze zagadki są opcjonalne, logiczne i nie opierają się wyłącznie na skrajnie
rzadkim losowaniu.
D158 Zawartość po kampanii obejmuje wyprawy, badania, tajemnice, trofea, handel i
współpracę.
I Społeczność i rozwój świata
Źródło porównawcze: M54–M58 M88–M94 M144–M158 oraz M234–M253. Status reguł w tej
grupie: USTALONE; robocze liczby wskazano w treści.
D159 Frakcje graczy do 50 członków, z czatem, siedzibą, projektami i badaniami.
D160 Brak wspólnego magazynu; dobrowolne wkłady idą bezpośrednio na rozwój i projekty.
D161 Prywatny majątek pozostaje u gracza po odejściu; wykorzystane wpłaty pozostają we
frakcji.
D162 Samotny gracz może poznać całą fabułę, świat i technologie oraz zdobyć najlepszy sprzęt.


## Strona 29

GDD 1.1  |  29
D163 Współpraca asynchroniczna; brak obowiązkowej jednoczesnej obecności i codziennych
wpłat.
D164 Kontrakty indywidualne i frakcyjne mają czytelne cele; nie wymagają fabularnych zwrotów
przy każdym zleceniu.
D165 Dodatkowe wydarzenia serwerowe dotyczą wszystkich uprawnionych; nie zastępują stałej
kampanii.
D166 Stałe oraz rzadkie tymczasowe lokacje; główna fabuła nie znika z powodu nieobecności.
D167 Łupy i wyczerpanie zasobów są osobiste; inni gracze nie opróżniają lokacji gracza.
D168 Zasoby odnawiają się, a częste wyprawy chwilowo zmniejszają ich dostępność;
dokumenty fabularne są jednokrotne.
D169 Nowe regiony są udostępniane w aktualizacjach, a nie blokowane ukończeniem projektu
społeczności.
D170 Wspólna odbudowa według przygotowanej kolejności, z widoczną zmianą osad i
otoczenia.
D171 Ukończone obiekty działają stale; brak aktywności nie niszczy ich ani nie cofa bazowej
usługi.
D172 Dodatkowe prace mogą czasowo poprawiać wydajność ponad trwały poziom podstawowy.
D173 Wspólne projekty odbudowy bez terminu utraty postępów; wkład może obejmować
zadania, zwiad, dokumentację i transport.
D174 Nagrody obejmują wynagrodzenie za pracę, doświadczenie, osobiste trofea i kronikę; bez
nagrody uczestnika za cudzy wkład.
D175 Dodatkowe wspólne tajemnice, archiwum potwierdzonych dowodów i teorii oraz
interaktywna tablica śledcza.
D176 Teoria społeczności nie jest dowodem, a popularność nie oznacza prawdziwości;
udostępnianie własnych dowodów dobrowolne.
D177 Ślady i wiadomości innych graczy w świecie; możliwość anonimowości, ale autor znany
moderacji.
D178 Swobodne wiadomości mogą być błędne lub fałszywe; ich znaczniki są niezweryfikowane i
nie odkrywają automatycznie lokacji.
D179 Pierwsi odkrywcy i ważne osiągnięcia trafiają do kroniki; wybrane nienazwane lokacje
mogą dostać moderowaną nazwę odkrywcy.
D180 Nazwanie miejsca nie daje własności ani wyłącznych łupów; osiągnięcia nie wygasają
przez nieaktywność.
J Oprawa i model biznesowy
Źródło porównawcze: M64–M65 oraz M232–M233 i M296–M299. Status reguł w tej grupie:
USTALONE; robocze liczby wskazano w treści.
D181 Stylizowany realizm z ilustracyjną formą, wiarygodnymi proporcjami i mrocznym światem;
bez kreskówkowości.


## Strona 30

GDD 1.1  |  30
D182 Wzorzec stanowi wybrana prawa część porównania graficznego; wyraziste światło bez
dominacji fantastycznych mutantów.
D183 Atmosfera wnętrz reaguje na pogodę, porę dnia i pracę urządzeń; kurz i podobne ślady są
wyłącznie wizualne.
D184 Charakterystyczne dźwięki kryjówek, oszczędna muzyka i osobne ustawienia efektów,
muzyki oraz radia.
D185 Informacje nie wymagają słuchania; opcja ograniczenia animacji i brak ciągłego
odtwarzania dźwięków w tle.
D186 Wyłącznie kosmetyczna monetyzacja; brak sprzedaży siły, doświadczenia, waluty, slotów
rynku i przyspieszeń.
D187 Płatne dekoracje nie mogą udawać osobistych trofeów zdobytych przez eksplorację.
D188 Gra ma docelowo finansować utrzymanie i dalszy rozwój; ceny oraz rentowność nie
zostały zatwierdzone.


## Strona 31

GDD 1.1  |  31
Załącznik B Korekty i pierwszeństwo decyzji
Temat
Wcześniej
Obowiązuje w GDD 1.1
Pory roku
Klimat tylko regionalny po odpowiedzi
B
Po korekcie właściciela pełne cztery pory roku;
długości do balansu
Najlepszy sprzęt
Wyłącznie znajdowany lub hybryda
Można wytwarzać; w wywiadzie sprostowanie Tzn A
Jakość craftingu
Zależna od umiejętności i częściowo
losowa
Identyczne materiały i schemat dają identyczny
rezultat
Naprawy
Rozważana utrata maksymalnej
trwałości
Naprawy bez końca i bez trwałego osłabienia
Leczenie
Długi odpoczynek po porażce
Natychmiastowo w kryjówce przy odpowiednich
środkach
Jedzenie i woda
Potrzeby i możliwe paski
Zasoby wyprawowe bez stale opadających pasków
Trofea
Wcześniej sugerowany handel
kolekcjami
Osobiste niezbywalne pamiątki w kolekcji
wyposażenia
Odbudowa
świata
Wspólna zmiana mogła zastąpić
początek
Pełna osobista odbudowa oraz oddzielne projekty
serwera
Fabuła
Rozważane wyprzedzenie etapów
Niezmienna kampania i ustalona kolejność
kluczowych wydarzeń
Kryjówka
Z boku bez przekroju
Końcowo dwa widoki z przekrojem; makieta wymaga
zatwierdzenia
Rynek
Pierwszy GDD pomijał bezpośrednią
wymianę
Regionalne targowiska tablica i bezpieczny handel
bezpośredni
Raporty
Pierwszy GDD proponował limit kopii
Wiedzę można wielokrotnie sprzedawać; sprzedawca
ją zachowuje
Nieobecność
Pierwszy GDD proponował sztywny
limit
Praca do braku zasobów energii lub miejsca;
dodatkowy limit niezatwierdzony
Porażka
Pierwszy GDD zostawiał śmierć jako
otwartą
Brak permanentnej śmierci i utraty własnego
wyposażenia
Co nadal nie jest zatwierdzoną treścią
Dokładne ceny, rozkłady losowe, statystyki, finalne nazwy, kompletny scenariusz, technologia,
budżet oraz zakres datowanej premiery. Plan MVP, harmonogram i techniczne zabezpieczenia
są propozycjami. Informacja o 30 pytaniach w końcowym podsumowaniu wywiadu nie opisuje
całej długości projektowania.
Rejestr zawiera 188 uporządkowanych wymagań. Właściciel projektu zatwierdza propozycje i
rozstrzyga pytania; zespół przekłada zaakceptowane reguły na tabele danych, makiety, zadania
oraz testy.
