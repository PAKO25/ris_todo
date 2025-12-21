# 📄 Scrum Poročilo: Implementacija Prilog k Todo Nalogam

## 📋 Uporabniška Zgodba
> **Kot uporabnik** želim možnost dodajanja prilog (npr. slike ali dokumente) k nalogam, da imam vse pomembne informacije na enem mestu.

---

## 🛠️ Razbitje Funkcionalnosti
1. **Razširitev podatkovnega modela (SQL)** - dodana vrstica in ustrezno posodobljeni modeli
2. **Sprememba API endpointa za ustvarjanje todojev** (nalaganje slike)
3. **Sprememba API endpointa za pridobivanje todojev** (slika se ustrezno priloži)
4. **Sprememba API endpointa za spreminjanje todojev** (brisanje/spreminjanje slike)
5. **Prikaz slik na pročelju**
6. **Možnost spreminjanja slik na pročelju**
7. **Možno dodatni ali zamenjatu sliko na pročelju**
---

## 🃏 Točkovanje Funkcionalnosti (Planning Poker)
*Enota: 1 točka = 1 minuta*

| Funkcionalnost | Patrik | Tilen | **Povprečje** |
| :--- | :---: | :---: | :---: |
| **1.** Razširitev SQL modela | 1 | 2 | **1.5** |
| **2.** API: Ustvarjanje | 5 | 7 | **6** |
| **3.** API: Pridobivanje | 3 | 4 | **3.5** |
| **4.** API: Spreminjanje | 10 | 10 | **10** |
| **5.** Frontend: Prikaz | 5 | 7 | **6** |
| **6.** Frontend: Urejanje | 10 | 10 | **10** |
| **7** Frontend: Dodajanje | 10 | 12 | **11** |
---

## ✅ Definicija Končanosti (Definition of Done)
*   **1:** Določen je nov stolpec v tabeli `image`, tipa `LONGTEXT`, `NULL allowed`. Posodobljeni so modeli na back-endu.
*   **2:** DTO-ji so ustrezno posodobljeni. Controller in service ustrezno obravnavata novo dodano sliko.
*   **3:** Controller odgovoru priloži ustrezno sliko. DTO-ji so ustrezno posodobljeni.
*   **4:** Controller in service sta ustrezno posodobljena za obravnavo slik. V kolikor je slika definirana, se posodobi, v kolikor ni, se ne.
*   **5:** Slike se na pročelju ustrezno prikazujejo.
*   **6:** Na pročelju je mogoče spreminjati in brisati slike, tako kot je možno spreminjati vsebino samega todo-ja.
*   **7:** Na pročelju je mogoče dodati sliko k že obstoječemu opravilu, ali novo ustvarjenjemu, prav tako pa jo zamenjati.
---

## 👥 Delitev Nalog
Naloge sva razdelila po sklopih:
- **Zaledje (Back-end):** Funkcionalnosti (1, 2, 3, 4)
- **Pročelje (Front-end):** Funkcionalnosti (5, 6, 7)

> **Sistem delitve:** Sklopa sva si razdelila po naslednjem sistemu: kdor zmaga partijo šaha, dobi sklop (5, 6).

---

## 🚀 Implementacija in Spremljanje
Med samo implementacijo sva na [projektni tabeli](https://github.com/users/PAKO25/projects/1/views/1) ustrezno posodabljala stanje posamičnih nalog.

---

## 📝 Končno Poročilo
Vse posamične funkcionalnosti so implementirane. Skupaj zadoščajo osnovni zgodbi. Med samo implementacijo sva beležila tudi, kako dolgo sva dejansko potrebovala za implementacijo funkcionalnosti.

### 📊 Primerjava Časa: Predviden vs. Dejanski
| Naloga | Predviden čas (min) | Dejanski čas (min) |
| :--- | :---: | :---: |
| **1** | 1.5 | 4 |
| **2** | 6 | 3 |
| **3** | 3.5 | 1 |
| **4** | 10 | 3 |
| **5** | 6 | 7 |
| **6** | 10 | 9 |
| **7** | 11 | 15 |
