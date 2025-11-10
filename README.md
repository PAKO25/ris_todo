## Informacije za razvijalce
V mapi frontend je *vue+vite* projekt (vue 3.5, vite 7.1). V mapi backend je *SpringBoot* (3.5) projekt. Za povezavo z podatkovno bazo uporabljamo mysql-connector (8.2) jn JPA. Java verzija je 21.
*MySQL* je potrebno vspostaviti na localhost:8180 z konfiguracijo, ki jo najdemo v sql_setup.sql.
Za posamezne backend funkcionalnosti so v paketu controllers REST handlerji.
Struktura frontend projekta je klasičen vue/vite projekt, z komponenti v src/components in slikami v src/assets.

## Prispevanje
Če želite na projektu sodelovati ustvarite svoj branch, naredite spremembe in oddajte pull request.
Priporočeno je, da z svojimi doprinosi rešujete odprte težave v https://github.com/PAKO25/ris_todo/issues, drugače pa implementirate načrtovane funkcionalnosti, opisane kasneje v tem dokumentu.

## Navodila za nameščanje
Ločimo dva primera:
- **Development**: Zaženite ustrezno konfiguriran MySQL strežnik. Nato v mapi frontend/todo poženite `npm run dev` (in `npm i`, če zaganjate prvič). V mapi backend/todo z javo 21 zgradite in poženite projekt z glavnim razredom com.example.todo.TodoApplication. Pazite, da je pravilno konfiguriran tudi Vite Proxy (vite.config.ts)
- **Production**: še ni dorečeno, ker je potrebno še izbrati strežnik (morda nginx)
