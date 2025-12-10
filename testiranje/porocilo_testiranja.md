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

---
**Skupna ocena:** Vsi testi so bili uspešno opravljeni, odkrita ni bila nobena napaka.
