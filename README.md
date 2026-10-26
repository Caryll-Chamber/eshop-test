# E2E testy e-shopu (Playwright + TypeScript)

[![Playwright Tests](https://github.com/Caryll-Chamber/eshop-test/actions/workflows/playwright.yml/badge.svg)](https://github.com/Caryll-Chamber/eshop-test/actions/workflows/playwright.yml)

Automatizované end-to-end testy pre demo e-shop [automationexercise.com](https://automationexercise.com), napísané v **Playwright + TypeScript** s využitím vzoru **Page Object Model**.

## Testovacie scenáre

| Typ | Test | Čo overuje |
|---|---|---|
| Positive | `Blue Top in Cart`, `Men Tshirt in Cart` | Vyhľadanie produktu → detail produktu (názov, dostupnosť „In Stock“) → pridanie do košíka → v košíku je správny produkt, cena a množstvo 1 |
| Negative | `Negative quantity is accepted (known bug)` | Pridanie množstva **-1** do košíka. Test dokumentuje nájdený bug (viď nižšie) |

Positive test je **data-driven**: pre každý produkt v [`test_data/products.json`](test_data/products.json) sa vytvorí samostatný test. Nový produkt znamená len nový riadok v JSON bez akejkoľvek zmeny kódu.

## Spustenie testov

**Predpoklady:** [Node.js](https://nodejs.org) (LTS)

```bash
npm ci                              # inštalácia závislostí
npx playwright install chromium     # stiahnutie prehliadača pre Playwright
```

```bash
npm test                            # spustenie všetkých testov
npm run test:ui                     # interaktívny UI režim (krok po kroku, so screenshotmi)
npm run report                      # otvorenie posledného HTML reportu
```

Užitočné prepínače:

```bash
npx playwright test --headed              # s viditeľným prehliadačom
npx playwright test --repeat-each=5       # opakovanie testov (overenie stability)
npx playwright test negative              # iba súbory, ktorých názov obsahuje "negative"
```

Adresa e-shopu sa dá zmeniť premennou prostredia `BASE_URL`.

## CI/CD a report

Testy bežia v **GitHub Actions** ([`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)) pri každom pushi a pull requeste do vetvy `main`.

- Výsledky sú v záložke [Actions](https://github.com/Caryll-Chamber/eshop-test/actions)
- **HTML report** sa ukladá ako artifact `playwright-report` (30 dní). Stiahne sa v detaile behu v sekcii *Artifacts* (vyžaduje prihlásenie do GitHubu). Po rozbalení sa otvorí v priečinku projektu príkazom `npx playwright show-report <rozbalený-priečinok>`. Priame otvorenie `index.html` zo súboru zobrazí výsledky, ale trace viewer funguje iba cez tento príkaz (potrebuje http server).
- Pri zlyhanom teste obsahuje report screenshot a **trace**: záznam celého testu so snímkou stránky (DOM) pred a po každom kroku, sieťovou komunikáciou (requesty a HTTP statusy) a výpismi z konzoly prehliadača.

## Štruktúra projektu

```
.github/workflows/playwright.yml   CI pipeline
fixtures/index.ts                  rozšírený `test`: príprava prehliadača + page objecty pre testy
pages/
  BasePage.ts                      spoločný základ: otvorenie stránky s kontrolou HTTP statusu
  ProductsPage.ts                  zoznam produktov a vyhľadávanie
  ProductDetailPage.ts             detail produktu, pridanie do košíka
  CartPage.ts                      košík
  routes.ts                        všetky adresy stránok na jednom mieste
test_data/products.json            testovacie dáta (id, názov, cena)
utils/price.ts                     formát ceny tak, ako ho zobrazuje e-shop (Rs. 500)
tests/
  positive_flow.spec.ts
  negative_flow.spec.ts
playwright.config.ts
```

## Prístup (approach)

1. **Plán bod po bode.** Najprv som si celý test rozpísal na papier ako postupnosť krokov, tak, ako by ich robil človek: pripojiť sa na e-shop → odkliknúť cookies → nájsť vyhľadávacie políčko → zadať produkt → overiť, že sa našiel → vložiť do košíka → otvoriť košík → overiť obsah. Poradie krokov pomohlo včas odhaliť, čo od čoho závisí.
2. **Otázka „čo keby?“ pri každom kroku.** Ku každému bodu (a neskôr ku každému riadku kódu) som si písal otázky, napríklad:
   - *Čo ak je stránka v inom jazyku alebo sa cookie dialóg vôbec nezobrazí?*
   - *Čo ak sa zmení tlačidlo vyhľadávania alebo jeho `id`?*
   - *Čo ak sa nájde viac produktov, ktorý vezmem?*
   - *Je hľadaný produkt zapísaný natvrdo? Ako to spraviť všeobecnejšie?*
   - *Čo ak dvaja ľudia kúpia posledný kus naraz?*

   Odpovede na tieto otázky neskôr určili, ako sa kód upratoval. Niektoré skončili ako [nápady na ďalšie testy](#nápady-na-ďalšie-testy).
3. **Jednoduchý test, ktorý spoľahlivo prejde.** Prvá verzia bola zámerne jednoduchá: jeden test v jednom súbore, všetky hodnoty zapísané natvrdo (hard-coded). Cieľom bolo, aby celý postup od vyhľadania po košík fungoval bez problémov a aby bolo jasné, ako sa stránka správa. Stabilitu som overoval opakovaným spúšťaním (`--repeat-each`).
4. **Súbor s produktmi (JSON).** Natvrdo zapísaný produkt a cenu som presunul do [`test_data/products.json`](test_data/products.json) a test obalil cyklom. Z jedného testu sa tak stal test pre ľubovoľný počet produktov a pridanie ďalšieho produktu nevyžaduje písať kód.
5. **Zovšeobecnenie: menej hard-coded, menej duplicity.** Keď test fungoval, prepracoval som ho podľa otázok z bodu 2:
   - **Page Object Model.** Každá stránka má vlastnú triedu so **všetkými locatormi a akciami**. Zmena v UI (napr. iné `id` tlačidla) znamená opravu na jednom mieste, nie v každom teste.
   - **Overenia správania ostávajú v testoch.** Page Object hovorí *kde* veci sú a *ako* sa robia akcie, test hovorí *čo* sa overuje. Page Objecty obsahujú iba **poistky**, ktoré strážia, že akcia naozaj prebehla (HTTP status otvorenej stránky, zobrazenie výsledkov vyhľadávania).
   - **Adresy stránok a formát ceny na jednom mieste** (`pages/routes.ts`, `utils/price.ts`). Stránka, ktorá čaká na prechod na inú stránku, používa tú istú adresu ako cieľová stránka, a testy nepoznajú formát meny.
   - **Fixtures.** Spoločná príprava (cookies, blokovanie reklám) je **raz** na jednom mieste a každý nový test ju dostane automaticky.
   - **Výber produktu podľa presného názvu** namiesto „prvý nájdený“.
   - **BasePage.** Kontrola HTTP statusu pri otváraní stránok bola najprv skopírovaná v troch triedach a texty chybových hlášok sa medzi nimi začali líšiť. Presunul som ju preto do spoločnej rodičovskej triedy.

   Pri testoch, ktoré majú rásť, nejde o rýchlosť výpočtu, ale o čitateľnosť a čo najmenej duplicitného kódu.

**Locatory:** prednostne `getByRole` / `getByText` (podľa toho, čo vidí používateľ). CSS selektory tam, kde prvok nemá text (tlačidlo s lupou `#submit_search`) a pre štrukturálne časti stránky bez vhodnej role (karty produktov, bunky v tabuľke košíka). Všetky sú schované v Page Objectoch.

## Rozhodnutia

- **Demo e-shop namiesto reálneho.** Pôvodne bol zvažovaný alza.sk. Overenie ukázalo, že Cloudflare blokuje headless prehliadač (HTTP 403, „potvrďte, že ste z mäsa a kostí“). V CI pipeline (headless, IP dátového centra) by testy nemohli bežať spoľahlivo a obchádzanie ochrany proti botom na cudzej produkcii nie je cieľom zadania ani eticky správne.
- **Iba Chromium.** Playwright Firefox sa mi na počítači nespustil (Windows Insider build, chýbajúca závislosť `mozglue`). Zadanie konkrétny prehliadač nevyžaduje. Pridanie ďalšieho prehliadača (napr. Firefox):
  1. odkomentovať projekt `firefox` v `playwright.config.ts`,
  2. lokálne stiahnuť prehliadač: `npx playwright install firefox`,
  3. v CI rozšíriť krok inštalácie na `npx playwright install --with-deps chromium firefox`.
- **Výber produktu podľa presného názvu**, nie „prvý nájdený“. Pri všeobecnejšom vyhľadávaní (napr. „Top“) by `.first()` mohol vybrať iný produkt a overenie košíka by nemalo zmysel.
- **Kontrola nadpisu „Searched Products“.** Stránka `/products` zobrazuje všetky produkty už pred vyhľadaním. Keby sa vyhľadávanie pokazilo tak, že klik na lupu nič nespraví, ostal by zobrazený zoznam všetkých produktov, test by v ňom hľadaný produkt našiel a prešiel by. Nadpis „Searched Products“ sa zobrazí iba po skutočnom vyhľadaní, takže v takom prípade test správne zlyhá.
- **Cena v JSON ako číslo** (`500`), formát meny (`Rs. `) pozná iba funkcia `formatPrice()`. S číslom sa dá počítať: negatívny test očakáva `formatPrice(-1 * 500)` = `Rs. -500`. Rovnako množstvo je v teste zapísané raz a očakávané hodnoty sa z neho odvodzujú.
- **Testovacie dáta nie sú načítané zo stránky.** Očakávané hodnoty musia byť nezávislé od testovaného systému, inak by test porovnával stránku samu so sebou.
- **Blokovanie cudzích domén.** Stránka načítava ~20 reklamných a sledovacích domén. Fixture povoľuje iba requesty na doménu e-shopu: test je rýchlejší (~13 s → ~5 s) a reklamy (vrátane celostránkových) neprekrývajú tlačidlá. Blokovanie zároveň zastaví aj cookie dialóg, lebo ho načítavajú Google domény.
- **Cookie dialóg: `addLocatorHandler` ako poistka.** Dialóg sa zobrazuje iba v niektorých regiónoch (napr. EÚ), v CI (USA) nemusí, takže pevné „klikni na Consent“ by tam zlyhalo. Pri blokovaní cudzích domén sa neobjaví vôbec. Handler ostáva ako poistka pre prípad, že by sa blokovanie vyplo alebo e-shop začal dialóg zobrazovať zo svojej domény: klikne iba vtedy, keď sa dialóg naozaj objaví.

## Výzvy (challenges)

- **Race condition po prechode na novú stránku.** Po kliku na „View Product“ sa tlačidlo „Add to cart“ zobrazí skôr, než mu JavaScript stránky (načítaný na konci stránky) pripojí funkciu. Klik v tej chvíli nič nespraví. Riešenie: po každom prechode kliknutím počkať na úplné načítanie novej stránky (`waitForURL`) a až potom pokračovať.
- **Race condition pri pridaní do košíka.** Pri prechode do košíka hneď po kliknutí test niekedy prišiel skôr, než server uložil produkt, alebo prehliadač požiadavku pri odchode zo stránky zrušil (timeout). Prvá verzia negatívneho testu očakávala prázdny košík, a tak bola v takých prípadoch **falošne zelená**: bug existoval, ale test ho nevidel (pri 5 spusteniach 2× zelený, 3× timeout). V teste, ktorý očakáva produkt v košíku, by rovnaký problém spôsoboval náhodné zlyhania. Riešenie: `waitForResponse` nastavený **pred** klikom a čakanie na odpoveď servera pred ďalším krokom. Overené opakovaným spúšťaním (`--repeat-each`).
- **Preťažený demo server (HTTP 503).** Server pri záťaži sporadicky vracia 503, čo sa najprv prejavovalo ako nezrozumiteľný 30-sekundový timeout. Riešenie: `BasePage.open()` overuje HTTP status a hneď hlási `ERR: server returned an error page for <url>`. Oba testy podobne overujú aj odpoveď servera na pridanie do košíka (`ERR: server did not accept the add-to-cart request`). V CI zmierňujú výpadky `retries: 2` (v reporte označené ako *flaky*) a `workers: 1`.

## Nájdený bug: záporné množstvo

**Kroky:** detail produktu (`/product_details/1`) → množstvo `-1` → *Add to cart* → košík.
**Očakávané:** záporné množstvo je odmietnuté, košík ostane prázdny.
**Skutočné:** v košíku je množstvo `-1` a celková cena `Rs. -500`. (Prijaté je aj množstvo `0` a ľubovoľne veľké množstvo, napr. `9999`.)

**Ako je bug v teste zachytený.** Najprv bol zvažovaný `test.fail()` (test, ktorý *má* zlyhať). Ten však považuje za očakávané **akékoľvek** zlyhanie, takže by zamaskoval aj úplne iný problém (napr. nedostupný e-shop). Preto negatívny test:

- overuje **presný prejav bugu** (v košíku je `-1` a `Rs. -500`) a je zelený iba v tomto stave,
- je rozdelený na pomenované kroky (`test.step`) a každý `expect` má **vlastnú chybovú správu**:

| Červený krok a správa | Význam |
|---|---|
| `1. Open product details` – `ERR: server returned an error page ...` | nový problém: server vrátil chybovú stránku |
| `1. Open product details` – `ERR: test data mismatch ...` | chyba v testovacích dátach: `id` a `name` v JSON nepatria k sebe |
| `2. Add -1 piece to cart` – `ERR: server did not accept ...` | nový problém: server neprijal požiadavku |
| `3. KNOWN BUG ...` – `ERR: server returned an error page ...` | nový problém: košík sa nenačítal |
| `3. KNOWN BUG ...` – `BUG FIXED? ...` | bug bol opravený, test treba prepísať na správne správanie |

Správy začínajúce `ERR:` teda vždy znamenajú nový problém, iba `BUG FIXED?` znamená zmenu v správaní, ktoré test dokumentuje.

- je označený anotáciou `bug`, ktorá sa zobrazí v HTML reporte.

## Nápady na ďalšie testy

- **Súbežný nákup posledného kusu** dvoma používateľmi. Playwright to vie simulovať cez dva browser contexty. Demo e-shop však nemá sklad (overené: dvaja používatelia naraz, jeden s 9999 kusmi), takže scenár by mal zmysel v testovacom prostredí s kontrolovaným stavom skladu, ideálne aj na úrovni API.
- **Stav skladu:** porovnanie požadovaného množstva s počtom kusov na sklade (stránka zobrazuje iba „In Stock“).
- **Nákup bez účtu** a celý checkout.
- **Validácia množstva:** hodnoty `0` a veľmi veľké čísla.
- **Ďalšie prehliadače** a mobilné viewporty.
