# Poročilo testiranja

**Datum:** 10. 12. 2025

## Avtorstvo testov
*   **Patrik:**
    *   Preklop statusa opravila (uncompleted -> completed)
    *   Preklop statusa opravila (completed -> uncompleted)
    *   Obravnava napak pri preklopu statusa
    *   Dodajanje novega opravila
    *   Obravnava napak pri dodajanju opravila
*   **Tilen:** /
    *   Dodajanje novega opravila z eksplicitno prioriteto (ohranjanje prioritete + povezava na pravilen seznam)
    *   Preklop statusa opravila: spremeni se samo `isCompleted`, ostali podatki ostanejo enaki
    *   Dvojni preklop statusa: stanje `isCompleted` se po dveh preklopih vrne na začetno stanje

## Podroben opis in rezultati testov

V tem sklopu smo testirali funkcionalnosti v `TodoItemService`. Spodaj so navedeni posamezni testi, njihov namen in rezultati.

### 1. Preklop statusa opravila (uncompleted -> completed)
*   **Opis:** Test preverja metodo `toggleTodoCompletion`. Zagotavlja, da se status opravila pravilno spremeni iz `false` (neopravljeno) v `true` (opravljeno).
*   **Pomen:** Ključno za osnovno funkcionalnost označevanja opravil kot končanih.
*   **Rezultat:** ✅ Uspešen

### 2. Preklop statusa opravila (completed -> uncompleted)
*   **Opis:** Test preverja metodo `toggleTodoCompletion`. Zagotavlja, da se status opravila pravilno spremeni iz `true` (opravljeno) nazaj v `false` (neopravljeno).
*   **Pomen:** Omogoča uporabniku, da popravi napako, če je opravilo pomotoma označil kot končano.
*   **Rezultat:** ✅ Uspešen

### 3. Obravnava napak pri preklopu statusa
*   **Opis:** Test preverja odziv sistema, če poskušamo spremeniti status opravila z neveljavnim ID-jem (npr. -1). Pričakuje se `RuntimeException`.
*   **Pomen:** Zagotavlja robustnost sistema in preprečuje nepredvideno obnašanje pri delu z neobstoječimi podatki.
*   **Rezultat:** ✅ Uspešen

### 4. Dodajanje novega opravila
*   **Opis:** Test preverja metodo `addTodo`. Preveri, ali se novo opravilo uspešno shrani v bazo, ali je povezano s pravim seznamom in ali ima nastavljene pravilne privzete vrednosti (prioriteta, status).
*   **Pomen:** Preverja osnovno funkcionalnost ustvarjanja podatkov.
*   **Rezultat:** ✅ Uspešen

### 5. Obravnava napak pri dodajanju opravila
*   **Opis:** Test preverja, ali metoda `addTodo` pravilno zavrne zahtevo (vrže `RuntimeException`), če poskušamo dodati opravilo na seznam, ki ne obstaja.
*   **Pomen:** Zagotavlja integriteto podatkov (tuji ključi) in preprečuje "sirote" v bazi.
*   **Rezultat:** ✅ Uspešen

### 6. Obravnava ohranjanja prioritete in ali je to opravilo povezano na pravilen seznam opravil
*   **Opis:** Test preverja metodo `addTodo` pri dodajanju opravila z eksplicitno podano prioriteto (npr. `LOW`, `MEDIUM`, `HIGH`). Preveri, ali se prioriteta pravilno shrani v bazo (in ne ostane privzeta `MEDIUM` razen v koliko je ta eksplicitno nastavljena) ter ali je novo opravilo povezano s pravilnim `TodoList` (prek ID-ja seznama).
*   **Pomen:** Zagotavlja pravilnost shranjevanja podatkov in preprečuje napake, kjer bi se vnosne vrednosti (prioriteta ali povezava na seznam) izgubile ali bile napačno nastavljene.
*   **Rezultat:** Uspešen

### 7. Obravnava ohranjanja osatalih podatkov pri spreminjanju stanja isCompleted
*   **Opis:** Test preverja metodo `toggleTodoCompletion` in zagotavlja, da se ob preklopu statusa spremeni izključno polje `isCompleted`, medtem ko ostali podatki opravila (npr. `title`, `description`, `priority`, `kanbanLevel` ter povezava na seznam) ostanejo nespremenjeni.
*   **Pomen:** Preprečuje regresije, kjer bi preklop statusa nenamerno spremenil tudi druge lastnosti opravila, kar bi vodilo do izgube ali popačenja podatkov.
*   **Rezultat:** Uspešen

### 8. Obravnava ohranjanja isCompleted stanja po dvojnem premiku
*   **Opis:** Test preverja metodo `toggleTodoCompletion` pri dveh zaporednih klicih. Pričakovano je, da se stanje `isCompleted` po prvem klicu spremeni (npr. `false` → `true`), po drugem klicu pa se vrne na prvotno vrednost (npr. `true` → `false`).
*   **Pomen:** Zagotavlja konsistentnost funkcionalnosti preklopa statusa in pravilno delovanje v realnih pogojih, kjer uporabnik lahko večkrat zaporedoma spremeni stanje opravila.
*   **Rezultat:** Uspešen

---
**Skupna ocena:** Vsi testi so bili uspešno opravljeni, odkrita ni bila nobena napaka.
