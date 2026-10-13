# SpecPrawnik — koncepcja redesignu

Publiczny prototyp redesignu strony głównej, listy prawników (`prawnik/index.html`) i przykładowego profilu prawnika (`profil-prawnika.html`). Główne menu prowadzi do listy. Lista zawiera 16 przykładowych profili z 12 miast, lokalne wyszukiwanie, wielokrotny wybór dziedzin i rodzajów pomocy, filtr ceny pokazanej usługi, odległości od wybranego miasta, zawodu, oceny i liczby opinii, sortowanie po cenie, odległości między miastami oraz ocenach, mapę miast i porównanie do trzech profili. Każda karta pokazuje dwie usługi z cenami i prowadzi do zamówienia, wyceny oraz rezerwacji wizyty w aktualnym serwisie. Mapa wskazuje centra miast, nie adresy kancelarii. Karta Piotra Stosia otwiera podstronę demonstracyjną. Profil obejmuje pełny katalog 33 usług z publicznej oferty, doświadczenie, opinie, odpowiedzi, publikacje, rozliczenia i dostępność. Formularze kontaktowe, pozostałe profile i zamówienia prowadzą do aktualnego serwisu SpecPrawnik.

Strona jest statyczna (`index.html`, `prawnik/index.html`, `profil-prawnika.html` oraz arkusze stylów i skrypty). Projekt Vercel wdraża ją bez kroku budowania.

Sekcja porady telefonicznej na stronie głównej używa krótkiego, niemego klipu wygenerowanego w Higgsfield (`assets/cta-phone-background.mp4`). Wideo odtwarza się tylko wtedy, gdy sekcja jest widoczna. Przy systemowym ustawieniu ograniczenia ruchu pozostaje nieruchome.

Podgląd jest dostępny publicznie, ale zawiera dyrektywy `noindex` w HTML i nagłówkach HTTP. Nie jest to mechanizm kontroli dostępu.
