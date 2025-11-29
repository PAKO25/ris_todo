
<img width="1979" height="1693" alt="nLXBRnit4Bxlho1qgPp8Rder2YFho4q4oB4XoUYPtXt9XBdabgJiEaN-U_dO5oboBRT1guF49OSpmszcFixgerHOg7r5iqm-4bPZWIjKK2nbhfGWzti5YuApDVa6w4EMrRXun3j0aqiz05QYwReMXEtG9UVgP8B-oZAaFvtODI-1ef_H5LD4lPXrr7oi3NGdGGmcpUSKBRbMICfWTgsie" src="https://github.com/user-attachments/assets/99f64ade-adae-4b84-af5e-48d2f9f15d42" />

## 1. Pregled razredov in njihovih vlog

### Paket: Model / Entity
Ti razredi so direktni mappingi s podatkovno bazo.

*   **`User`**
    *   Predstavlja registriranega uporabnika aplikacije. Hrani osebne podatke, vlogo (`Role`) in deluje kot lastnik seznamov (`TodoList`) ter iniciator sodelovanj (`Collaboration`).
    *   Vsebuje polje `role`, ki določa tip uporabnika (`REGULAR` ali `ADMINISTRATOR`).
*   **`TodoList`**
    *   Kontejner za opravila.
*   **`TodoItem`**
    *   Posamezna enota dela/naloge.
*   **`Collaboration`**
    *   Hrani informacijo o tem, kateri uporabnik (`User`) ima dostop do katerega seznama (`TodoList`), če ni njegov lastnik.
*   **`Role` (Enum)**
    *   Določa nivo pravic uporabnika (navaden uporabnik ali administrator).

### Paket: Service (Poslovna logika)
Glavna logika - povezava med REST endpointi in entitetami.

*   **`UserService`**: Skrbi za registracijo, prijavo in urejanje uporabniških profilov. Pri prijavi uporablja `AuthorizationService` za generiranje tokenov.
*   **`AdminService`**: Vsebuje logiko za administrativne posege (brisanje uporabnikov, obveščanje). Pred izvedbo akcij preveri pravice preko `AuthorizationService`.
*   **`TodoListService`**: Osrednji servis za ustvarjanje seznamov, upravljanje deljenja (sodelovanja) in izvoz podatkov. Vsaka akcija na obstoječem seznamu zahteva preverjanje dostopa.
*   **`TodoItemService`**: Skrbi za manipulacijo posameznih opravil (CRUD operacije, roki, statusi).
*   **`AuthorizationService`**: Centralizirana varnostna komponenta. Preverja dovoljenja uporabnikov za dostop do virov in pretvarja tokene v identiteto uporabnika.

### Paket: Repository (Dostop do podatkov)
Vmesniki za komunikacijo z bazo podatkov.

*   `UserRepository`, `TodoListRepository`, `CollaborationRepository`, `TodoItemRepository` zagotavljajo metode `find...`, `save` in `delete`.

---

## 2. Opis glavnih funkcionalnosti in interakcij med razredi

Kratek opis pomembnih funkcionalnosti iz usecase diagrama s poudarkom na varnostnih preverjanjih.

### A. Upravljanje s seznami opravil
**Use Cases:** *Ustvarjanje seznama opravil, Urejanje seznama opravil, Odstranitev seznama opravil, Nastavi na koloboracijski seznam, Izvozi kot PDF.*

*   **Potek izvedbe:**
    1.  Uporabnik sproži zahtevo (npr. prek REST klica s priloženim tokenom).
    2.  **`TodoListService`** najprej pokliče **`AuthorizationService.resolveToken()`**, da identificira uporabnika.
    3.  Če gre za dostop do obstoječega seznama (urejanje, brisanje, deljenje):
        *   Servis pokliče **`AuthorizationService.canAccessList(userId, listId)`**.
        *   Ta metoda preveri v bazi, ali je uporabnik lastnik seznama (prek `TodoListRepository`) ALI pa je na seznamu kolaborator (prek `CollaborationRepository`).
        *   Če preverjanje ne uspe, se akcija zavrne.
    4.  Če gre za *Ustvarjanje*: Servis ustvari novo instanco **`TodoList`** in jo shrani.
    5.  Če gre za *Kolaboracijo*: **`TodoListService`** preveri, ali je trenutni uporabnik lastnik seznama (samo lastnik lahko dodaja kolaboratorje), nato ustvari entiteto **`Collaboration`**.

### B. Upravljanje z opravili
**Use Cases:** *Ustvarjanje opravila, Dodajanje opravila na seznam, Urejanje opravila, Označi stanje opravila, Datum in čas skrajnega roka, Odstranitev opravila.*

*   **Potek izvedbe:**
    1.  Zahtevek prejme **`TodoItemService`**.
    2.  Pred kakršno koli spremembo servis uporabi **`AuthorizationService`** za preverjanje, ali ima uporabnik pravico do seznama (`TodoList`), kateremu opravilo pripada.
    3.  Pri *Ustvarjanju opravila*:
        *   Servis preveri dostop do ciljnega seznama (`canAccessList`).
        *   Če je dostop dovoljen, ustvari nov **`TodoItem`** in ga poveže s seznamom.
    4.  Pri *Urejanju/Brisanju opravila*:
        *   Servis poišče seznam, ki mu opravilo pripada.
        *   Ponovno se izvede varnostno preverjanje dostopa do tega seznama.
        *   Če je uspešno, se izvedejo metode `setDeadline()`, `toggleTodoCompletion()` ali `delete()`.

### C. Upravljanje uporabniškega računa (User Profile)
**Use Cases:** *Urejanje profilnih podatkov.*

*   **Potek izvedbe:**
    *   Uporabnik pošlje zahtevo za spremembo podatkov.
    *   **`UserService`** uporabi **`AuthorizationService.canModifyProfile(requestingUserId, targetUserId)`**.
    *   To zagotavlja, da lahko uporabnik ureja le svoj profil (razen če je administrator).
    *   Po uspešni avtorizaciji servis posodobi podatke na entiteti **`User`**.

### D. Administrativne funkcije (Admin Role)
**Use Cases:** *Odstranitev uporabnika, Obvesti uporabnika, Obvesti vse uporabnike.*

*   **Potek izvedbe:**
    *   Uporabnik sproži administrativno akcijo.
    *   **`AdminService`** takoj pokliče **`AuthorizationService.isAdmin(userId)`**.
    *   Ta metoda preveri polje `role` na uporabniku. Če ni `ADMINISTRATOR`, se akcija zavrne.
    *   *Odstranitev uporabnika:* Po potrditvi pravic servis izbriše uporabnika in kaskadno njegove podatke.
    *   *Obveščanje:* Po potrditvi pravic servis pridobi elektronske naslove in pošlje obvestila.
