# RIS To-Do Aplikacija

Pregledna in enostavna spletna aplikacija za upravljanje z opravili, razvita v sklopu predmeta "Razvoj informacijskih sistemov".

## Kazalo
1. [Vizija projekta](#1-vizija-projekta)
2. [Besednjak](#2-besednjak)
3. [Navodila za namestitev](#3-navodila-za-namestitev)
   - [Predpogoji](#31-predpogoji)
   - [Podatkovna baza](#32-podatkovna-baza)
   - [Backend](#33-backend)
   - [Frontend](#34-frontend)
4. [Dokumentacija za razvijalce](#4-dokumentacija-za-razvijalce)
   - [Uporabljene tehnologije](#41-uporabljene-tehnologije)
   - [Struktura projekta](#42-struktura-projekta)
   - [Standardi kodiranja](#43-standardi-kodiranja)
5. [Navodila za prispevanje](#5-navodila-za-prispevanje)
6. [Usecase diagram](#6-usecase-diagram)

---

## 1. Vizija projekta

Namen aplikacije je ustvariti preprosto, a zmogljivo orodje za upravljanje opravil (to-do listo), ki uporabnikom omogoča enostaven pregled in organizacijo dnevnih nalog. Z minimalističnim vmesnikom in osredotočenostjo na ključne funkcije želimo izboljšati produktivnost in zmanjšati mentalno obremenitev.

### Meje Rešitve

Da bi ohranili preprostost, smo jasno določili obseg.

**Kaj vključujemo:**
*   Registracija in prijava uporabnikov.
*   Osnovno upravljanje nalog: dodajanje, urejanje, brisanje, označevanje.
*   Organizacija nalog v sezname.
*   Določanje rokov in prioritet.

**Česa NE vključujemo:**
*   Naprednih funkcij za timsko delo (dodeljevanje, komentiranje).
*   Integracij z zunanjimi orodji (npr. koledarji).
*   Prileganja datotek k nalogam.

### Ključne Funkcionalnosti
*   **Minimalističen vmesnik:** Hitro dodajanje in pregled nalog brez motenj.
*   **Prilagodljiva organizacija:** Ustvarjanje lastnih seznamov (npr. "Delo", "Osebno").
*   **Robustna arhitektura:** Zaledje v Javi (Spring Boot) in sodoben čelni del (Vue.js).

### Poslovne Omejitve
*   **Ekipa in viri:** Projekt razvijata dva študenta v okviru študijskih obveznosti in prostega časa.
*   **Finančne omejitve:** Projekt nima finančnih sredstev, kar omejuje možnosti za plačljive storitve (npr. napredno gostovanje, domena).
*   **Namen:** Primarni cilj je učenje, razvoj portfelja in uspešno zaključen študijski projekt, ne pa komercialna uporaba.

---

## 2. Besednjak

Ta razdelek vsebuje razlago ključnih tehničnih izrazov, ki se uporabljajo v projektu.

- **Uporabnik**
   - Oseba, ki uporablja sistem todo. V sistem se prijavi z uporabniškim imenom in geslom ter lahko upravlja svoje sezname opravil in opravila.

- **Administrator**
   - Poseben tip uporabnika, ki ima poleg običajnih uporabniških funkcionalnosti tudi dodatna pooblastila, kot so upravljanje drugih uporabnikov in pošiljanje obvestil.

- **Seznam opravil**
   - Zbirka opravil, ki jih ustvari posamezen uporabnik za določeno področje (npr. “Faks”, “Delo”, “Osebno”, "Inbox"). Uporabnik lahko ustvari več seznamov opravil.

- **Kolaboracijski seznam**
   - Seznam opravil, ki je deljen med več uporabniki. Udeleženci lahko seznam in opravila na njem berejo in urejajo ali brišejo.

- **Opravilo (todo)**
   - Posamezen element v seznamu opravil. Opravilo ima vsaj naslov in status, lahko pa tudi opis, rok, prioriteto in druge lastnosti.

- **Rok (deadline)**
   - Datum in čas, do katerega naj bo določeno opravilo izvedeno. Rok se lahko nastavi ob ustvarjanju opravila ali kasneje pri urejanju.

- **Profil uporabnika**
   - Podatki, ki opisujejo uporabnika v sistemu (ime, uporabniško ime, e-poštni naslov, geslo, nastavitve obveščanja).

- **Obvestilo**
   - Sporočilo, ki ga sistem pošlje uporabniku ali vsem uporabnikom. Obvestilo lahko opozarja na morebitne spremembe sistema ali specifično obvestilo določenemu uporabniku, ki je za njega relevantno.

- **PDF izvoz seznama**
   - Funkcionalnost, ki uporabniku omogoča, da izbrani seznam opravil izvozi in shrani kot PDF dokument za tiskanje ali deljenje.
---

## 3. Navodila za namestitev

Sledite tem korakom za uspešno namestitev in zagon aplikacije v lokalnem razvojnem okolju.

### 3.1. Predpogoji

Prepričajte se, da imate nameščeno naslednjo programsko opremo:
- [Git](https://git-scm.com/)
- [Java JDK 21](https://www.oracle.com/java/technologies/downloads/#jdk21)
- [Node.js (20.x)](https://nodejs.org/)
- [MySQL Server 8.0+](https://dev.mysql.com/downloads/mysql/)

### 3.2. Podatkovna baza

1.  Zaženite MySQL strežnik.
2.  Odprite odjemalca za MySQL (npr. `mysql` CLI, MySQL Workbench, DBeaver).
3.  Izvedite skripto `sql_setup.sql`, ki se nahaja v korenski mapi projekta. Ta skripta bo ustvarila potrebno bazo podatkov in tabele.
    ```sql
    -- Primer ukaza v CLI
    mysql -u <uporabnisko_ime> -p < sql_setup.sql
    ```
4.  Privzeta konfiguracija Spring Boot aplikacije pričakuje, da baza teče na `localhost:3306`. Če vaša konfiguracija odstopa, popravite datoteko `application.properties` v `backend/todo/src/main/resources/`.

### 3.3. Backend

1.  Pomaknite se v mapo z backend kodo:
    ```bash
    cd backend/todo
    ```
2.  Zgradite projekt z uporabo Maven. Alternativno ga odprite v vašem najljubšem IDE (npr. IntelliJ IDEA) in poženite glavno aplikacijsko datoteko.
3.  Strežnik bo po uspešnem zagonu dostopen na `http://localhost:8080`.
4.  Če spremenite konfiguracijo strežnika (npr. vrata), ustrezno posodobite tudi konfiguracijo Vite proxy-a, ki jo najdete v `frontend/todo/vite.config.ts`.

### 3.4. Frontend

1.  V novi terminalski seji se pomaknite v mapo s frontend kodo:
    ```bash
    cd frontend/todo
    ```
2.  Namestite vse potrebne odvisnosti:
    ```bash
    npm install
    ```
3.  Zaženite razvojni strežnik:
    ```bash
    npm run dev
    ```
4.  Aplikacija bo dostopna v brskalniku na naslovu, ki ga izpiše Vite (običajno `http://localhost:5173`).

---

## 4. Dokumentacija za razvijalce

Ta razdelek vsebuje tehnične informacije o projektu, uporabljene tehnologije, strukturo in standarde kodiranja.

### 4.1. Uporabljene tehnologije

| Kategorija | Tehnologija/Orodje | Različica | Opis |
| :--- | :--- | :--- | :--- |
| **Backend** | Java | `21` | Osnovni programski jezik za strežniški del. |
| | Spring Boot | `3.5` | ogrodje za razvoj REST API-ja. |
| | JPA (Hibernate) | | Standard za preslikavo objektov v relacijsko bazo. |
| **Frontend** | Vue.js | `~3.5` | Ogrodje za izgradnjo uporabniškega vmesnika. |
| | Vite | `~7.1` | Orodje za gradnjo in zagon frontend aplikacije. |
| | Node.js | `20+` | Priporočeno okolje za poganjanje Vite in npm. |
| **Database** | MySQL | `8.0+` | Relacijska podatkovna baza za shranjevanje podatkov. |
| | mysql-connector-j | `8.2` | JDBC gonilnik za povezavo Jave z MySQL. |

### 4.2. Struktura projekta

Projekt je organiziran v ločeni mapi za frontend in backend, kar omogoča neodvisen razvoj in zagon.

```
.
├── backend/                  # Mapa za Spring Boot aplikacijo
│   └── todo/                 # Izvorna koda backenda
├── frontend/                 # Mapa za Vue.js aplikacijo
│   └── todo/                 # Izvorna koda frontenda
├── sql_setup.sql             # Skripta za inicializacijo baze
└── README.md                 # Ta datoteka
```

### 4.3. Standardi kodiranja

- **Git & Branching**:
  - `main` veja je zaščitena in predstavlja stabilno različico.
  - Za vsako novo funkcionalnost ali popravek ustvarite novo vejo iz `main`.
  - Ime veje naj sledi formatu `tip/kratek-opis` (npr. `feature/user-authentication` ali `fix/login-bug`).
- **Commit sporočila**:
  - Pišite jih v angleščini.
  - Sledite formatu `tip: opis` (npr. `feat: Add user login endpoint`, `docs: Update README installation guide`).
- **Koda**:
  - **Java**: Sledite standardnim [Java kodirnim konvencijam](https://www.oracle.com/technetwork/java/codeconventions-150003.pdf). Uporabljajte smiselna in opisna imena za spremenljivke in metode.
  - **Vue**: Uporabljajte priporočila iz uradne Vue dokumentacije in sledite strukturi, ki jo generira Vite. Imena komponent naj bodo v formatu `PascalCase`.

---

## 5. Navodila za prispevanje

Veseli bomo vašega prispevka! Če želite sodelovati pri razvoju:

1.  Naredite "fork" repozitorija.
2.  Klonirajte svoj "fork" na vaš računalnik.
3.  Ustvarite novo vejo za vaše spremembe (glejte [Standardi kodiranja](#43-standardi-kodiranja)).
4.  Naredite želene spremembe in jih potrdite z jasnimi sporočili.
5.  Potisnite spremembe v vaš oddaljeni "fork".
6.  Ustvarite "Pull Request" (PR) v originalni `PAKO25/ris_todo` repozitorij.
7.  V opisu PR-ja jasno opišite, kaj ste spremenili in zakaj. Če rešujete obstoječo "težavo" (issue), jo omenite v opisu (npr. `Closes #123`).

---

## 6. Use-case diagram
<img width="1115" height="1565" alt="DPU_todo_ris" src="https://github.com/user-attachments/assets/13521614-ce2a-4d08-968d-d0dc551cc2d6" />
