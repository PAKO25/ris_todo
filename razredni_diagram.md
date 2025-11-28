<img width="1979" height="1404" alt="class-diagram-slika" src="https://github.com/user-attachments/assets/8f4fc07a-168c-4b1d-aba5-e9f9b44aba23" />

## 1. Pregled razredov in njihovih vlog

### Paket: Model / Entity
Ti razredi so direktni mappingi z podatkovno bazo.

*   **`User`**
    *   Predstavlja registriranega uporabnika aplikacije. Hrani osebne podatke in deluje kot lastnik seznamov (`TodoList`) ter iniciator sodelovanj (`Collaboration`).
*   **`Administrator`**
    *   Specializiran uporabnik s sistemskimi pravicami (deduje od `User`). Izvajanje administrativnih akcij (brisanje uporabnikov, pošiljanje obvestil).
*   **`TodoList`**
    *   Kontejner za opravila.
*   **`TodoItem`**
    *   Posamezna enota dela/naloge.
*   **`Collaboration`**
    *   Hrani informacijo o tem, kateri uporabnik (`User`) ima dostop do katerega seznama (`TodoList`), če ni njegov lastnik.

### Paket: Service (Poslovna logika)
Glavna logika - povezava med REST endpointi in entitetami.

*   **`UserService`**: Skrbi za registracijo, prijavo in urejanje uporabniških profilov.
*   **`AdminService`**: Vsebuje logiko za administrativne posege (brisanje uporabnikov, obveščanje).
*   **`TodoListService`**: Osrednji servis za ustvarjanje seznamov, upravljanje deljenja (sodelovanja) in izvoz podatkov.
*   **`TodoItemService`**: Skrbi za manipulacijo posameznih opravil (CRUD operacije, roki, statusi).

### Paket: Repository (Dostop do podatkov)
Vmesniki za komunikacijo z bazo podatkov.

*   `UserRepository`, `TodoListRepository`, `CollaborationRepository`, `TodoItemRepository` zagotavljajo metode `find...`, `save` in `delete`.

---

## 2. Opis glavnih funkcionalnosti in interakcij med razredi

Kratek opis pomembnih funkcionalnosti iz usecase diagrama.

### A. Upravljanje s seznami opravil (Lists Management)
**Use Cases:** *Ustvarjanje seznama opravil, Urejanje seznama opravil, Odstranitev seznama opravil, Nastavi na koloboracijski seznam, Izvozi kot PDF.*

*   **Potek izvedbe:**
    1.  Uporabnik sproži zahtevo za ustvarjanje ali urejanje.
    2.  **`TodoListService`** prejme zahtevo.
    3.  Če gre za *Ustvarjanje*: Servis ustvari novo instanco **`TodoList`**, nastavi lastnika (**`User`**) in jo shrani prek **`TodoListRepository`**.
    4.  Če gre za *Kolaboracijo (Nastavi na koloboracijski seznam)*:
        *   To je razširitev (`<<extend>>`) osnovnega urejanja/ustvarjanja.
        *   **`TodoListService`** pokliče metodo `shareList()`.
        *   Ta metoda ustvari novo entiteto **`Collaboration`**, ki poveže izbrani **`TodoList`** z drugim **`User`**-jem in to shrani v **`CollaborationRepository`**.
    5.  Če gre za *Izvoz v PDF*: **`TodoListService`** zbere podatke iz seznama in generira datoteko (metoda `exportListAsPdf`).

### B. Upravljanje z opravili (Task Management)
**Use Cases:** *Ustvarjanje opravila, Dodajanje opravila na seznam, Urejanje opravila, Označi stanje opravila, Datum in čas skrajnega roka, Odstranitev opravila.*

*   **Potek izvedbe:**
    1.  Glavno vlogo igra **`TodoItemService`**.
    2.  Pri *Ustvarjanju opravila*:
        *   Primer uporabe vključuje (`<<include>>`) funkcionalnost "Dodajanje na seznam".
        *   **`TodoItemService`** ustvari nov **`TodoItem`**.
        *   Poišče ustrezen **`TodoList`** (prek ID-ja) in poveže opravilo z njim.
    3.  Pri *Urejanju opravila*:
        *   Funkcionalnosti "Datum in čas skrajnega roka" in "Odstranitev" sta razširitvi (`<<extend>>`) urejanja.
        *   Če uporabnik nastavi rok, servis pokliče metodo `setDeadline()` na entiteti **`TodoItem`**.
        *   Za spremembo stanja (končano/nekončano) servis pokliče `toggleTodoCompletion()`, entiteta **`TodoItem`** pa posodobi svoj boolov parameter `isCompleted`.
    4.  Vse spremembe se trajno zapišejo prek **`TodoItemRepository`**.

### C. Upravljanje uporabniškega računa (User Profile)
**Use Cases:** *Urejanje profilnih podatkov.*

*   **Potek izvedbe:**
    *   Uporabnik pošlje nove podatke (npr. novo geslo ali email).
    *   **`UserService`** preveri veljavnost podatkov.
    *   Servis pridobi entiteto **`User`** iz **`UserRepository`**.
    *   Pokliče se metoda `user.updateDetails(...)` na entiteti.
    *   Spremembe se shranijo nazaj v bazo.

### D. Administrativne funkcije (Admin Role)
**Use Cases:** *Odstranitev uporabnika, Obvesti uporabnika (in razširitev: Obvesti vse uporabnike).*

*   **Potek izvedbe:**
    *   Administrator (poseben tip **`User`**) dostopa do **`AdminService`**.
    *   *Odstranitev uporabnika:* **`AdminService`** pokliče `deleteUser()`, ki prek **`UserRepository`** izbriše uporabnika in kaskadno (odvisno od konfiguracije baze) tudi njegove sezname.
    *   *Obveščanje:*
        *   Za "Obvesti vse uporabnike" (**`broadcastNotification`**), servis uporabi **`UserRepository.findAllEmails()`**, da pridobi seznam prejemnikov.
        *   Sistem nato pošlje obvestilo vsem identificiranim uporabnikom.
