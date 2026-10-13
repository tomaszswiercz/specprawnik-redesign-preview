# SpecPrawnik — koncepcja redesignu

Publiczny prototyp redesignu strony głównej, listy prawników (`prawnik/index.html`) i przykładowego profilu prawnika (`profil-prawnika.html`). Lista zawiera cztery przykładowe profile oraz lokalne wyszukiwanie, filtrowanie i sortowanie. Karta Piotra Stosia otwiera podstronę demonstracyjną. Profil obejmuje pełny katalog 33 usług z publicznej oferty, doświadczenie, opinie, odpowiedzi, publikacje, rozliczenia i dostępność. Formularze kontaktowe, pozostałe profile i zamówienia prowadzą do aktualnego serwisu SpecPrawnik.

Strona jest statyczna (`index.html`, `prawnik/index.html`, `profil-prawnika.html` oraz arkusze stylów i skrypty). Projekt Vercel wdraża ją bez kroku budowania.

Sekcja porady telefonicznej na stronie głównej używa krótkiego, niemego klipu wygenerowanego w Higgsfield (`assets/cta-phone-background.mp4`). Wideo odtwarza się tylko wtedy, gdy sekcja jest widoczna. Przy systemowym ustawieniu ograniczenia ruchu pozostaje nieruchome.

Podgląd jest dostępny publicznie, ale zawiera dyrektywy `noindex` w HTML i nagłówkach HTTP. Nie jest to mechanizm kontroli dostępu.
