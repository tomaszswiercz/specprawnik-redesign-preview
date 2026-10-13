# SpecPrawnik — koncepcja redesignu

Publiczny prototyp redesignu strony głównej, listy prawników (`prawnik/index.html`) i przykładowego profilu prawnika (`profil-prawnika.html`). Główne menu prowadzi do listy. Lista zawiera 16 przykładowych profili z 12 miast, lokalne wyszukiwanie, filtrowanie po temacie, rodzaju pomocy, zawodzie, ocenie i liczbie opinii, sortowanie oraz porównanie do trzech profili. Karta Piotra Stosia otwiera podstronę demonstracyjną. Profil obejmuje pełny katalog 33 usług z publicznej oferty, doświadczenie, opinie, odpowiedzi, publikacje, rozliczenia i dostępność. Formularze kontaktowe, pozostałe profile i zamówienia prowadzą do aktualnego serwisu SpecPrawnik.

Strona jest statyczna (`index.html`, `prawnik/index.html`, `profil-prawnika.html` oraz arkusze stylów i skrypty). Projekt Vercel wdraża ją bez kroku budowania.

Sekcja porady telefonicznej na stronie głównej używa krótkiego, niemego klipu wygenerowanego w Higgsfield (`assets/cta-phone-background.mp4`). Wideo odtwarza się tylko wtedy, gdy sekcja jest widoczna. Przy systemowym ustawieniu ograniczenia ruchu pozostaje nieruchome.

Podgląd jest dostępny publicznie, ale zawiera dyrektywy `noindex` w HTML i nagłówkach HTTP. Nie jest to mechanizm kontroli dostępu.
