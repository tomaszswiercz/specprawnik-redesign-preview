# SpecPrawnik — koncepcja redesignu

Publiczny prototyp redesignu strony głównej i przykładowego profilu prawnika (`profil-prawnika.html`). Karta Piotra Stosia na stronie głównej otwiera podstronę demonstracyjną. Profil obejmuje pełny katalog 33 usług z publicznej oferty, doświadczenie, opinie, odpowiedzi, publikacje, rozliczenia i dostępność. Formularze kontaktowe, pozostałe profile i zamówienia prowadzą do aktualnego serwisu SpecPrawnik.

Strona jest statyczna (`index.html`, `profil-prawnika.html`, `styles.css`, `profile.css`, `main.js`). Projekt Vercel wdraża ją bez kroku budowania.

Sekcja porady telefonicznej na stronie głównej używa krótkiego, niemego klipu wygenerowanego w Higgsfield (`assets/cta-phone-background.mp4`). Wideo uruchamia się dopiero po przewinięciu do sekcji; można je zatrzymać, a przy ustawieniu ograniczenia ruchu pozostaje nieruchome, dopóki użytkownik sam go nie odtworzy.

Podgląd jest dostępny publicznie, ale zawiera dyrektywy `noindex` w HTML i nagłówkach HTTP. Nie jest to mechanizm kontroli dostępu.
