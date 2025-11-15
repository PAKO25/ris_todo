# RIS To-Do Aplikacija

Pregledna in enostavna spletna aplikacija za upravljanje z opravili, razvita v sklopu predmeta "Razvoj informacijskih sistemov".

## Kazalo
1. [Dokumentacija za razvijalce](#1-dokumentacija-za-razvijalce)
   - [Uporabljene tehnologije](#11-uporabljene-tehnologije)
   - [Struktura projekta](#12-struktura-projekta)
   - [Standardi kodiranja](#13-standardi-kodiranja)
2. [Navodila za nameščanje](#2-navodila-za-nameščanje)
   - [Predpogoji](#21-predpogoji)
   - [Podatkovna baza](#22-podatkovna-baza)
   - [Backend](#23-backend)
   - [Frontend](#24-frontend)
3. [Navodila za razvijalce (prispevanje)](#3-navodila-za-razvijalce-prispevanje)

---

## 1. Dokumentacija za razvijalce

Ta razdelek vsebuje tehnične informacije o projektu, uporabljene tehnologije, strukturo in standarde kodiranja.

### 1.1. Uporabljene tehnologije

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

### 1.2. Struktura projekta

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

### 1.3. Standardi kodiranja

- **Git & Branching**:
  - `main` veja je zaščitena in predstavlja stabilno različico.
  - Za vsako novo funkcionalnost ali popravek ustvarite novo vejo iz `main`. (glej [Prispevanje](https://github.com/PAKO25/ris_todo?tab=readme-ov-file#3-navodila-za-razvijalce-prispevanje)
  - Ime veje naj sledi formatu `tip/kratek-opis` (npr. `feature/user-authentication` ali `fix/login-bug`).
- **Commit sporočila**:
  - Pišite jih v angleščini.
  - Sledite formatu `tip: opis` (npr. `feat: Add user login endpoint`, `docs: Update README installation guide`).
- **Koda**:
  - **Java**: Sledite standardnim [Java kodirnim konvencijam](https://www.oracle.com/technetwork/java/codeconventions-150003.pdf). Uporabljajte smiselna in opisna imena za spremenljivke in metode.
  - **Vue**: Uporabljajte priporočila iz uradne Vue dokumentacije in sledite strukturi, ki jo generira Vite. Imena komponent naj bodo v formatu `PascalCase`.

---

## 2. Navodila za nameščanje

Sledite tem korakom za uspešno namestitev in zagon aplikacije v lokalnem razvojnem okolju.

### 2.1. Predpogoji

Prepričajte se, da imate nameščeno naslednjo programsko opremo:
- [Git](https://git-scm.com/)
- [Java JDK 21](https://www.oracle.com/java/technologies/downloads/#jdk21)
- [Node.js (20.x)](https://nodejs.org/)
- [MySQL Server 8.0+](https://dev.mysql.com/downloads/mysql/)

### 2.2. Podatkovna baza

1.  Zaženite MySQL strežnik.
2.  Odprite odjemalca za MySQL (npr. `mysql` CLI, MySQL Workbench, DBeaver).
3.  Izvedite skripto `sql_setup.sql`, ki se nahaja v korenski mapi projekta. Ta skripta bo ustvarila potrebno bazo podatkov in tabele.
    ```sql
    -- Primer ukaza v CLI
    mysql -u <uporabnisko_ime> -p < sql_setup.sql
    ```
4.  Privzeta konfiguracija Spring Boot aplikacije pričakuje, da baza teče na `localhost:3306`. Če vaša konfiguracija odstopa, popravite datoteko `application.properties` v `backend/todo/src/main/resources/`.

### 2.3. Backend

1.  Pomaknite se v mapo z backend kodo:
    ```bash
    cd backend/todo
    ```
2.  Zgradite projekt z uporabo Maven. Alternativno ga odprite v vašem najljubšem IDE (npr. IntelliJ IDEA) in poženite glavno aplikacijsko datoteko ali ustvarite nov artifakt z glavnim razredom `backend/todo/src/main/java/com/example/todo/TodoApplication.java`.
3.  Strežnik bo po uspešnem zagonu dostopen na `http://localhost:8080`.
4.  Če spremenite konfiguracijo strežnika (npr. vprata), ustrezno posodobite tudi konfiguracijo Vite proxy-a, ki jo najdete v `frontend/todo/vite.config.ts`.

### 2.4. Frontend

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

## 3. Navodila za razvijalce (prispevanje)

Veseli bomo vašega prispevka! Če želite sodelovati pri razvoju:

1.  Naredite "fork" repozitorija.
2.  Klonirajte svoj "fork" na vaš računalnik.
3.  Ustvarite novo vejo za vaše spremembe (glejte [Standardi kodiranja](#13-standardi-kodiranja)).
4.  Naredite želene spremembe in jih potrdite z jasnimi sporočili.
5.  Potisnite spremembe v vaš oddaljeni "fork".
6.  Ustvarite "Pull Request" (PR) v originalni `PAKO25/ris_todo` repozitorij.
7.  V opisu PR-ja jasno opišite, kaj ste spremenili in zakaj. Če rešujete obstoječo "težavo" (issue), jo omenite v opisu (npr. `Closes #123`).
