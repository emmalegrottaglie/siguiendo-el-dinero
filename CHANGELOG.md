# Changelog

Record of what changed, why, and what was deliberately left out. Entries are newest first. New
figures name their source; corrections and gaps are recorded alongside the work, not omitted.

---

## 2026-10-19 — Every chart says where it came from, and none relies on colour alone

An audit of the site's charts against the checklist in `RESEARCH-DATAVIZ/` (research carried over
from another project, now committed here) found six problems. All six are fixed, and `AGENTS.md`
has a new "Charts: what every chart must carry" section so the next chart starts from the rules
rather than rediscovering them.

**A legend that described a different chart.** The subsidy ranking on `/financiacion` had a legend
in its header saying ordinary funding was gold and security costs red. The bars drew ordinary
funding in each party's own colour and security costs as a hatched dark ink, so the legend was
wrong on both counts; it was also hidden on phones. The bars and the legend are now built by one
function, so they cannot disagree, and the ordinary-funding swatch shows several party colours with
the label "in the party's colour". A second legend under the list, whose ordinary-funding swatch
was the same grey as "other", is gone.

**Sí and No could not be told apart by a colour-blind reader.** The two were `--verd` (#2f7d70) and
`--red` (#b23a2c). They differ in hue but hardly in lightness (CIELAB L* 47.5 against 42.3).
Simulated for deuteranopia with the Machado (2009) full-severity matrix, both come out at L* 46.1:
a lightness difference of 0.1, with nothing else to separate them. They were side by side in every
vote bar on the front page, on `/votaciones`, in the ballot grid on each profile and in the flow
diagram. Two new tokens replace them in charts:

- `--stance-si` #3b8f8a: L* 54.5; 3.43:1 on the page, 3.16:1 on panels, 3.51:1 on cards. A fill
  only; sí text keeps `--verd-text` (5.28:1).
- `--stance-no` #6a1b12: L* 23.3; 10.57:1 on the page, 9.75:1 on panels, 10.82:1 on cards.
- Against each other: 3.08:1, so each clears 3:1 where they meet inside a stacked bar. Simulated
  deuteranopia: ΔL* 26.8, ΔE2000 34.6. Simulated protanopia: ΔL* 38.5, ΔE2000 35.9. (Normal
  vision: ΔE2000 52.6.)

Lightness is still colour, so No is also hatched, in light lines (3.7:1 against the No fill),
in every bar, legend, ballot-grid cell and flow-diagram node. Stance bars are now built with one
helper, `stanceSegments()`, which applies colour and hatch together. The stance counts on the front
page's vote cards are now printed under the bar. Two text fixes came with this: a profile's ballot
tags printed "A favor" in `--gold`, which is 3.02:1 and fails as text, and now use `--verd-text`;
and those tags' borders were written as a hex suffix on a CSS variable (`var(--red)55`), which is
not valid CSS and drew no border, and now use `color-mix()`.

**Charts did not say where their numbers came from.** Only three charts carried a source line.
Now every chart that lacked one has it inside its own frame: the subsidy ranking, electoral spending
by formation, the front page's three register summaries and its two vote cards, the salary
distribution, the minimum-wage ladder on profiles, the ballot grid, the coverage chart on
`/metodologia` and the flow diagram on `/votaciones`. Each names the publisher, the dataset or
report, the data date (the period covered, or for a live source the date it was fetched) and the
link. They are built by `lib/chart-sources.ts` from the data files and module constants the figures
come from, so no URL or date is typed at a chart. Two strings that were hard-coded in `/datos`
moved into their modules on the way, so both pages read the same one: the pay register's link and
BDNS's name for its party-subsidy listing.

**Charts hidden from screen readers had no other way in.** The salary histogram, the ballot grid,
the flow diagram, the subsidy ranking's split by kind, the coverage chart and the front page's
three summaries are `aria-hidden`, and several drew numbers printed nowhere else. Each now has a
closed "Ver los datos en una tabla" / "Show the data as a table" / "Mostra les dades en una taula"
disclosure with a real table: caption, column and row headers, and every number the chart draws.
It is one component, `components/chart/DataTable.tsx`, a native `<details>` with no JavaScript.
The tables scroll inside their own box on a phone. Charts that already had a full table on the page
(the per-group vote table, the per-formation spending table, the map) did not get a second one.

**The salary histogram had no value axis.** Nothing said the bars were counts of posts, and the log
scale was mentioned only in the caveat below the chart. It now has an axis title above the plot
("Nº de cargos en cada tramo · el tramo más poblado tiene 689") and a line under the ticks saying
the axis is gross annual pay on a logarithmic scale where each mark multiplies by 10.

**The spending donut identified formations by colour only, and cut their names.** It is replaced by
one labelled bar per formation (`SpendShares`, on the site's `Bar` primitive), each with the full
name, the declared amount and its share of the total; names wrap instead of truncating. The front
page's spending summary also wraps its names now.

**The flow diagram on a phone.** It needs about 62rem, so on a phone it scrolls inside its own box,
and the page itself does not scroll sideways (checked at 375px: no element outside a scrolling box
reaches past the viewport, and `scrollWidth` equals the viewport width, on every changed page in all
three languages). What was missing was any sign that the box scrolls: below 1024px
a line above the diagram now says it is wider than the screen and points to the table, and the box
is focusable so it can be scrolled from the keyboard.

What is not in this change: reading values from the keyboard with a live region, exporting a chart
as an image with its caption, and a dark theme. Each is planned as its own follow-up. The party
page's donation bar and the foundation channel's bars, which were not part of the audit, still
cite their report once per section rather than inside each chart.

---

## 2026-10-20 — Asset declarations, fourth batch: 84 published

**What was read.** The next 20 first filings in Congreso's surname order, from Isabel María Borrego
Cortés to Raquel Clemente Muñoz; second readings, in the same pass, of the four of them who took
their seats after RTVE's snapshot (Iván Cacho Isla, Víctor Camino Miñana, Andrea Canelo Matito,
María Carmen Castilla Álvarez); and second readings of the two whose first reading did not match
RTVE: 26 readings in all.

**Result: 84 published, up from 64**, 57 checked against RTVE and 27 by an independent second
reading. None is waiting for a second reading; 265 filings are not yet transcribed. Of the 16 new
filings RTVE covers, 14 matched it on the first reading, and the four later joiners' two readings
agreed on all four totals.

**Where two readings agree and RTVE does not.** Two, each checked against the scan:

- Pilar Calvo Gómez: financial assets 266,093.81 € against RTVE's 303,029.39 €. The difference,
  36,935.58 €, is exactly the two entries in the form's "Sociedades participadas en más de un 5% por
  otras sociedades…" block: Esportia SL (6.5 %), 36,185.58 €, and E-Players (25 %), 750 €. That
  block lists companies held by companies the deputy owns, not holdings of her own, and it is
  transcribed as free text and not counted in any total; RTVE added it to financial assets. The
  readings are unchanged, and the question is recorded as open in `NEXT-STEPS.md`.
- Javier Celaya Brey: financial assets 28,204.66 € against RTVE's 19,341.34 €, and debts 23,621.61 €
  against 22,621.61 €. RTVE's financial figure is his securities and pension plan without his
  current accounts, 8,863.32 €; the scan shows the accounts in the deposits block and the mortgage's
  outstanding balance as 23.621,61 €.

**Verified.** `check:declarations`, `check:deputies`, `npx tsc --noEmit` and `npm run build` pass.

---

## 2026-10-19 — Asset declarations, third batch: 64 published

**Two earlier changes reach the site with this one.** The "Declared assets" tab under Politicians
(`/politicos/declaraciones`) and the second batch of declarations were merged into the branch of an
earlier pull request after that pull request had already been merged, so neither reached `main`.
This branch merges them in. Their entries below describe them; nothing in them changed.

**What was read.** The next 20 first filings in Congreso's surname order, from Trinidad Carmen
Argota Castro to Félix Bolaños García; second readings, in the same pass, of the four of them who
took their seats after RTVE's snapshot (Evarist Aznar Teruel, Carmelo Barrio Baroja, Juan Andrés
Bayón Rolo, Gabriel Blanco Arrúe); and second readings of the four whose first reading did not
match RTVE: 28 readings in all.

**Result: 64 published, up from 44**, 43 checked against RTVE and 21 by an independent second
reading. None is waiting for a second reading; 285 filings are not yet transcribed. Of the 16 new
filings RTVE covers, 12 matched it on the first reading.

**Where two readings agree and RTVE does not.** Four, each checked against the scan or explained by
it:

- Enrique Belda Pérez-Pedrero lists three savings and investment products (a fund, a savings plan
  "acumulado desde 2013" and a rural fund, 121,190 € together) in the form's income block, "OTRAS
  rentas o percepciones". The readings transcribe them where he put them, so they count as income;
  RTVE moved them to financial assets. The scan was checked: they are in the income block. This is
  the reverse of the case recorded for the second batch, where income appeared in the assets block,
  and the same open question in `NEXT-STEPS.md` covers both.
- Patricia Blanquer Alcaraz declares two mortgages with Banco Sabadell, 20.693,31 € and 73.325,71 €
  outstanding; RTVE lists no debts for her. The scan was checked and shows both.
- Rafael Benigno Belmonte Gómez and Elías Bendodo Benasayag: financial assets 6,000 € apart from
  RTVE, in opposite directions.

**A new transcription rule.** Gabriel Blanco Arrúe's deposits block has one description and two
figures stacked in the balance cell, 1.086,86 and 28.330,35. The first reader marked the cell
illegible, since no rule covered it; the second gave each figure its own row. The scan was checked,
the first reading was corrected to the same layout, and `scripts/declaration-transcription.md` now
says it: each stacked figure is its own row, the first with the description, the rest with null,
never added together.

**Verified.** `check:declarations`, `check:deputies`, `npx tsc --noEmit` and `npm run build` pass.

---

## 2026-10-06 — Asset declarations, second batch: 44 published

The second batch of transcriptions of the deputies' *Declaración de Bienes y Rentas*, run with the
cheaper settings planned in `NEXT-STEPS.md`: two declarations per reader, a lighter model, and pages
read at full-page scale without cropping.

**What was read.** The next 20 first filings in Congreso's surname order, from José Luis Aceves
Galindo to Francisco Aranda Vargas; second readings of the six the pilot left waiting; and, in the
same pass, second readings of the four of the 20 who took their seats after RTVE's snapshot, since
only a second reading can check them. The four new first readings that did not match RTVE then got
a second reading too: 34 readings in all.

**Result: 44 published, up from 18**, 31 checked against RTVE and 13 by an independent second
reading. None is waiting for a second reading; 305 filings are not yet transcribed. Of the 16 new
filings RTVE covers, 12 matched it on the first reading.

**Where two readings agree and RTVE does not.** In six declarations, two independent readings agree
with each other and not with RTVE, so they are published by the second-reading check. Two were
checked by eye against the scan, and in both the scan bears out the readings:

- Santiago Abascal Conde: the scan lists one income line, 37.357,8 €; RTVE's income is 18,000 €
  higher.
- Mertxe Aizpurua Arzallus: the scan lists a current account of 19.400 € and a life insurance of
  21.000 €; RTVE's financial total is 9,287.48 € higher.
- Francisco José Alcaraz Martos: the form's last block lists a mobile home ("casa móvil") at
  57.000 €, which RTVE counts as income rather than as an asset; RTVE's debts are also 1,357.26 €
  higher.
- Francesc-Marc Álvaro Vidal: the same block lists a rent ("Renta de alquiler por el piso reseñado")
  of 1.056 €, which RTVE counts as income.
- Juan José Aizcorbe Torra and Teslem Andala Ubbi: debts 200 € and 2 cents apart.

**The form's last block holds income as well as assets.** It is titled "Otros bienes, rentas o
derechos de contenido económico no declarados en apartados anteriores", and deputies use it for both:
a mobile home in one declaration, a rent in another. Its items are transcribed as written and, as
before, counted in the "deposits and other assets" total, because splitting income from assets
within it would mean judging each item. The label on the page now repeats the block's own title,
"Otros bienes, rentas o derechos", so a rent listed there is not presented as an asset.

**Two new transcription rules**, both written into `scripts/declaration-transcription.md`:

- A row whose amount is filled but whose first cell is empty is kept, with the empty cell null and
  shown as "—": an account with no description, an interest line with no concept. Three readings
  had one, and the build had rejected them as invalid.
- A deputy who runs out of loan rows may continue the table in the "otras deudas" box. Carlos Rojas
  García did, with loans 6 and 7, which both readings had transcribed identically as free text. They
  are now transcribed as loans, which brings his debts outstanding to 692,810 €, RTVE's figure. One
  of the two balances is written "56 .419 €", and the page shows it as written.

**Cost.** The batch took 30 points of the five-hour usage window (35% to 65%) and 5 of the weekly,
for 34 readings, or a little under one point per reading; the pilot took 42 points for 21. The
background research for the housing news feeds ran in the same window.

**Verified.** `check:declarations`, `check:deputies`, `npx tsc --noEmit` and `npm run build` pass.
In the browser: `/politicos/declaraciones` with 44 rows; Carlos Rojas García's seven loans and the
balance shown as written; Pablo Antuñano Colina's interest line with "—" for its blank concept; the
relabelled block in es, en and ca.

---

## 2026-10-06 — What each deputy declared to Congress, next to how they voted

Every sitting deputy now has a profile, and each profile carries what the deputy declared to the
Congreso de los Diputados: the *Declaración de Intereses Económicos* for all 350, and the
*Declaración de Bienes y Rentas* for the 18 whose transcription has passed its check so far. The
declarations sit directly above the deputy's recorded votes, with a line saying the two are shown
together so they can be looked up and that neither explains the other. There is no net-worth
figure, no ranking by anything declared, and no tally of how the owners of anything voted.

**A profile for every deputy.** Profiles came only from the pay register, which carries 229 of the
350 sitting deputies. `npm run build:deputies` (`scripts/fetch-deputies.mjs`) now reads Congreso's
open-data roster and each deputy's *ficha* into `data/deputies.json`. A deputy is linked to a
register row only on the existing two-condition rule: exactly one register row with the same folded
name, or a reviewed alias, **and** agreeing party families (`lib/deputy-join.mjs`). That links 229
(217 by name, 12 by alias), gives 121 a profile built from Congreso alone, and leaves none
unresolved. `npm run check:deputies` fails on a slug collision, a missing or stale alias, a family
disagreement, or fewer than 200 links.

- The 12 aliases are deputies the register lists under a longer or shorter given name, such as
  Congreso's "Iniesta Egido, Isabel" and the register's "Isabel Belén Iniesta Egido". Each was read
  by eye on 2026-10-05. Their profiles were missing their recorded votes, and now show them.
- The 121 Congreso-only profiles show "—" for pay and say the deputy is not in the register this
  site uses. They skip the salary-distribution and minimum-wage blocks, whose wording ("the register
  publishes no figure for this post") would be false for them.
- `/politicos` and `/buscar` include them; a deputy's place is their constituency. The directory's
  introduction and source note now name Congreso's deputy list beside the pay register.

**"0 €" fixed.** About 1,706 register rows publish no pay figure, and their profile pay panel, card
and directory row printed "0 €". They now show "—", with "No published figure" and the reason.

**Economic interests.** `data/interests.json` holds Congreso's *Intereses Económicos* open data row
for row: 2,787 rows for 403 declarants, covering prior activities, foundations and associations,
gifts and remarks. A profile shows the deputy's rows grouped by filing and type, with the free-text
`sector` exactly as declared, and a foundation links to its page here only on an exact name match.
342 sitting deputies have rows under their name; the other 8 have none in the file, and their
profiles say so.

**Asset declarations.** Congreso publishes the *Bienes y Rentas* only as one scanned PDF per deputy,
with no text layer and no dataset, so each deputy's first filing of the legislature (made on taking
the seat in 2023, with the income of 2022) is transcribed here from the scan, following
`scripts/declaration-transcription.md`: text verbatim, amounts parsed from Spanish format, illegible
cells left empty and listed, nothing inferred, and no marital status, matrimonial regime or
signature. `npm run build:declarations` publishes a reading only when its totals for income,
financial assets and debts equal the ones RTVE published from its own transcription of the same
filings, or when all four totals, IRPF included, equal an independent second reading. Everything
else is left out, and the profile links the official PDF with a stated gap.
`npm run check:declarations` re-runs both checks on every published entry.

- **18 published**, all matching RTVE to the cent.
- **The pilot.** 24 declarations were read. Of the 21 that RTVE also covers, 17 matched on the first
  reading. Three did not, and stay out until a second reading settles them: Santiago Abascal Conde
  (income), Mertxe Aizpurua Arzallus (financial assets) and Carlos Rojas García (debts). Three
  deputies who took their seats after RTVE's snapshot, Cristina López Zamora, Ainhoa Molina León and
  Irene Jódar Pérez, can only be checked by a second reading and await one.
- **One cell, one new rule.** Gabriel Rufián Romero's declaration writes the pending balance of an
  80.000 € loan as "71,000". The rules then read that in Spanish format, as 71 euros, where RTVE
  read 71,000. Euro amounts never carry three decimals, so the rules now read a comma followed by
  exactly three digits as a thousands separator, and an apostrophe as a decimal mark. With that, the
  reading matches RTVE on every total and is published. The rule was written after this mismatch
  exposed the case, so for that one cell the check is not independent: the figure was checked by
  eye against the scan, and the page shows the cell as written beneath it.
- **RTVE is a check, never a source.** Its figures are cached locally, never published and never
  committed. It has its own errors: it records a Toledo house of Agustín Conde Bajén as bought
  ("compraventa") where the scan says inherited ("Herencia"). The page credits RTVE with a link.
- **What the check does not cover**, stated on the page: text fields are not cross-checked, and
  RTVE's listing has no IRPF figure, so the IRPF line of an RTVE-checked declaration rests on a
  single reading.
- **Left out or flagged on purpose.** One declaration gives a vehicle's licence plate, which the form
  asks deputies not to give; the build replaces any plate in a vehicle row with "[matrícula omitida]"
  and prints each replacement, and the page says plates are left out. The deposits block asks for a
  single balance across all accounts, so a figure can sit beside one account with the others empty;
  the page says that too. An amount written other than in Spanish format is shown beneath the
  figure exactly as the scan has it, with a line asking readers to check the PDF, and the `/datos`
  table carries it in a `cifra_tal_como_figura` column. Rufián's "71,000" is the one case so far.
- **Cost.** Reading the scans cost two to three times the estimate per declaration, mostly because
  readers zoomed into single cells. The remaining 325 filings, the six second readings and the 71
  deputies' later filings are planned in `NEXT-STEPS.md` as smaller batches, each its own change.

The scans (`data/_declaraciones/`) and the raw readings (`data/_transcriptions/`) stay local and are
not committed; `data/declarations.json` is the published result.

**A tab of its own under Politicians.** `/politicos/declaraciones`, reached from a "Declared
assets" tab beside the directory, lists every transcribed declaration side by side: income,
deposits and other assets, and debts outstanding as totals, and properties and vehicles as counts,
because the form gives them no value. Each name links to the full declaration on the profile. The
order is Congreso's surname order and cannot be changed: the site does not rank deputies by
anything they declared, does not sum a column across deputies, and says so under the table. A party
filter narrows both the table and the collapsed list of deputies still waiting for a
transcription; the one deputy whose Congreso page carries no asset declaration is named. The page
is also in site search.

**On `/datos`.** Two new tables: `declaraciones_bienes`, one row per declared item with the official
PDF and the check used on every row, and `intereses_economicos`, the open-data rows as published.

**Verified.** `check:deputies`, `check:declarations`, `npx tsc --noEmit` and `npm run build`
(396 static pages) pass. In the browser, in es, en and ca: Agustín Conde Bajén's totals (income
82,785.90 €, financial assets 302,481.75 €, the Toledo house "Herencia"); Cristina Abades Martínez,
Congreso-only, with "—" for pay and the gap stated, her votes and her declaration, on her profile, in
`/politicos` and in search; Isabel Belén Iniesta Egido's votes; Óscar Puente Santiago's later
filings listed; Cristina López Zamora's "not transcribed yet" with the PDF link; Laura Vergara
Román's empty-interests gap; Gabriel Rufián Romero's pending balance, 71.000 € with
"escrito «71,000»" beneath it, and the same in the CSV; the plate left out; the IRPF caveat; both
CSVs; `/politicos/declaraciones` with its 18 rows, the ERC filter (one row, six pending), an unknown
party's empty state, and the tab on both pages. No horizontal overflow at 375px, and no console
errors.

---

## 2026-10-06 — Housing in the news: fourteen new sources, and a section on the portal

Rents, evictions and the tenant protests have become a lead story, and the site had three housing
sources in its feed registry (Provivienda, Hogar Sí and El Salto · Vivienda) and no page that showed
them. Now it has seventeen, and the portal has a section of its own, "La vivienda, en las noticias".

**The fourteen new feeds**, each fetched on 2026-10-06 and publishing within the previous week:

- public broadcasters: RTVE · Vivienda and 3Cat · Habitatge;
- national press: El País, El Mundo, elDiario.es, El Español, 20minutos and The Objective, each
  through its housing section or tag;
- a wire agency and a fact-checker: Europa Press · Vivienda and Newtral · Vivienda;
- the Catalan-language press: Ara · Habitatge and VilaWeb · Habitatge;
- the organisations behind the protests, in their own voice: the Sindicat de Llogateres and the
  PAH.

**How they were chosen.** To span the spectrum rather than to agree, and only through section or tag
feeds that carry housing reporting: property portals are left out because they have a commercial
interest in prices. About fifty feeds qualified technically. The rest were left out because they
would tilt the balance, repeat national copy (most regional dailies) or publish too rarely; they
are listed with the reason in `research/housing-feeds.md`, so a later pass starts there. Five that
could not be used are recorded in `EXCLUDED_FEEDS`: ABC (stale and empty housing feeds), La
Vanguardia (no housing feed, 403), Público (no RSS), CTXT (general feed behind a bot check) and the
Sindicato de Inquilinas de Madrid (nothing since 28 July).

**On the portal.** Six items, newest first, one per publisher. The organisations publish far less
often than the press, so newest-first alone would never show them: they get two places of their
own, ahead of four from the press. Every item names its source and whether it is an organisation
or a news outlet.

**Catalan.** The registry's language field gains `ca`. Spanish and Catalan now rank as one for a
reader of either, so a Catalan page is not narrowed to the three Catalan outlets, and an item in a
language other than Spanish and the page's own is tagged, as English items already were.

**A fix to the health check.** `npm run check:feeds` reported three of the new feeds as having "no
dated items" although the panel read them: they wrap their dates in CDATA, which `lib/news.ts`
unwraps and the check did not. The check now unwraps it too, so it fails only feeds the panel
cannot read. All 29 sources pass. Arcópoli, an LGBTI source, has published nothing in 120 days; the
check flags it, and it is left as it is here.

**Verified.** `npm run check:feeds`, `npx tsc --noEmit` and `npm run build` pass. In the browser:
the section on `/es`, `/ca` and `/en`, with two organisations and four outlets from six different
publishers, and no horizontal overflow at 375px.

---

## 2026-10-05 — The site is now "Siguiendo el Dinero"

Renamed from "Seguir el Dinero". The infinitive became a gerund: the name now describes work in
progress rather than an instruction.

Changed everywhere the name is shown: the masthead wordmark, the page `<title>` in each locale, and
the footer credit line. The footer and the wordmark keep the Spanish name in all three locales, as
before. The `<title>` was already translated per locale, so it follows the same change of tense:
"Following the Money" in English (was "Follow the Money") and "Seguint el Diner" in Catalan (was
"Seguir el Diner"). Also updated: the README and `AGENTS.md` headings, the design-system comment in
`app/globals.css`, and the `User-Agent` strings the image proxy and the photo fetcher send to other
servers, since those identify the site by name.

The wordmark is three characters longer. At 375px it still sits on one line at its 38px floor
(309px wide against 331px of room), and the descender of the "g" still clears the edition line
below it, which is what the `mt-3` comment in `Masthead.tsx` is about.

Deliberately not changed: the GitHub repository, the Vercel project and its domain, and the
`package.json` name, which are all still `seguir-el-dinero`. Renaming those is an account-level
change, and nothing in the code depends on them. Earlier changelog entries keep the old name,
because they record what was true when they were written.

---

## 2026-09-21 — Every salary, in multiples of the minimum wage

`NEXT-STEPS.md` names this precisely: *"the register overlay on the wage ladder, which needs the
SMI as a typed per-year module with BOE references."* `/contexto`'s `SmiLadder` already draws the
country's share of workers per SMI-multiple tranche (INE table 28182); nothing converted a single
salary into a multiple of the minimum wage, because nothing held the SMI's own euro value. That's
the missing piece — not a new dataset, a small one that had never been transcribed.

### The SMI, one entry per year, each with its Real Decreto

`lib/smi.ts` — seven years, 2020 through 2026, each verified against BOE directly: the decree
number and date, its `BOE-A-…` id, the monthly and annual amount, and the date the rate actually
took effect. Same treatment `lib/donations.ts` already gets for a figure of this shape: hand
transcribed, reviewed, cited — not scraped, because there is nothing to scrape from a page of legal
text with one number in it.

**2021 gets a `note`, not a rounded-off annual figure.** Real Decreto 817/2021 set €965/month, but
only from 1 September; January through August that year stayed at 2020's €950/month under Real
Decreto 231/2020, which was still in force. €965/month is the figure everyone cites as "the 2021
SMI," and it's what the module stores — but presenting it as though it applied all twelve months
would be the same shape of error this project has caught before (the AROPE-base mixing, the
low-sample flag): a real number, silently standing in for a claim it doesn't support.

Only 2026 is actually load-bearing here — `data/salaries.json` is a current snapshot, so every
register figure is a 2026 annual amount — but the module holds all seven years, because the SMI
changes yearly and the next person to touch this file shouldn't have to re-derive that.

### The overlay: a mark on the chart that already exists, not a new one

`lib/indicators.ts` gains `trancheFor(multiple, tranches)`, which parses `smiLadder()`'s own tranche
labels ("De 0 a 1 SMI", "Más de 8 SMI") to find which one a multiple falls into, rather than
hardcoding the boundaries — the tranche set is INE's ingested data to change, not this function's
to assume.

`components/SmiPosition.tsx` renders `/contexto`'s exact nine tranche rows a second time, on
`/politico/[slug]`, right after the existing `SalaryDistributionChart` — same section, same
"where this pay sits" framing, no new heading. The one row containing this person's multiple gets a
gold-deep left rule and bold weight; the other eight are drawn anyway, for the same reason
`SalaryDistributionChart` draws its whole histogram instead of a bare percentile: "24.8×" means
little without the shape of what it's a multiple of. A person with no published `gross` (about
1,700 of the register's rows) gets a stated absence instead of a marker — same branch
`SalaryDistributionChart` already takes for the same reason.

### Verified against a real figure

Teresa Ribera, €424,236.84/year ÷ €17,094 (2026 SMI) = 24.8×, landing in "Más de 8 SMI" — the
tranche where 0.12% of wage earners sit. Confirmed live across all three locales; the Spanish
tranche label stays untranslated in `/en` and `/ca`, matching how party and territory names already
work site-wide.

### Files

- `lib/smi.ts` (new) — the per-year SMI module.
- `lib/indicators.ts` — `trancheFor()`, additive only; `smiLadder()` and `/contexto` untouched.
- `components/SmiPosition.tsx` (new).
- `app/[locale]/politico/[slug]/page.tsx` — fetches `getIndicators()` alongside the existing
  `Promise.all`, renders `<SmiPosition>` beside `<SalaryDistributionChart>`.
- `lib/i18n.ts` — `smiPosition` block, ×3 locales.

Not in this change: `NEXT-STEPS.md` step 4 (the housing panel) and §6.A's sector-by-sector wage
ladder, which is a distinct interactive tool for `/contexto` and doesn't need the SMI value at all.

Verified: `npx tsc --noEmit` and `npm run build` clean; the Ribera figure spot-checked by hand and
confirmed in all three locales; the no-figure branch confirmed on a genuine zero-gross row; mobile
(375px) checked, no overflow; `/contexto` confirmed byte-for-byte unaffected.

---

## 2026-09-19 — The map's stray outline, fixed for the click and not just the key

A community selected on the map by clicking still drew the browser's own
bounding-box outline — the exact bug PR #19 was supposed to have closed, and
reported again with a fresh screenshot showing the same disconnected black
lines and box across Castilla y León.

The earlier fix scoped its CSS rule to `.region:focus-visible`, which
suppresses the browser's outline only when the browser itself decides focus
should be visibly indicated. Chrome's `:focus-visible` heuristic does not
consider a mouse click on this kind of element deserving of that treatment —
verified live: clicking a region left `:focus` true but `:focus-visible`
false, and with no rule targeting plain `:focus`, the browser fell through to
its own default `outline: auto`, drawn around the path's bounding box exactly
as the original bug described, just triggered by the far more common
interaction (click) instead of the one the fix actually covered (Tab).

Fixed by widening the selector from `.region:focus-visible` to `.region:focus`
— the comment already explaining the rule states the reasoning universally
("a focusable SVG shape cannot use the global focus ring"), so the rule now
matches that reasoning regardless of how focus arrived. Confirmed via computed
styles before and after: `outlineStyle` was `"auto"` on click, now `"none"`
with the intended `stroke: var(--ink)` at `2.4px` in its place, on both a
mouse click and a programmatic/keyboard focus.

Verified: `npx tsc --noEmit` and `npm run build` clean; reproduced the bug
live (clicking Castilla y León, matching the reported screenshot), confirmed
the fix removes it, and confirmed keyboard Tab focus still gets the same
stroke treatment as before — this is strictly a superset of the prior fix,
not a replacement of its behaviour.

---

## 2026-09-18 — A card for each foundation, the same way a politician gets one

The party-linked foundations lived at the bottom of `/fundaciones` as a dense
table — one row per entity, seven numeric columns, no visual identity. It was
complete and it was unreadable: the only way to place a foundation was to read
its whole row. `/politicos` solved the equivalent problem for officeholders
with a card per person; the same treatment now applies here.

### What a card carries, and why that set and no more

Name and an `Avatar` (initials on the foundation's party-colour ring — the
same fallback path the officeholder cards already use, since no foundation
has a portrait), the party it is linked to, total money received, the same
party/corporate/individual/public split as a small stacked bar the table row
already computed, and — only where published — how many people are on record
governing it.

That last one is deliberately conditional. `lib/foundation-people.ts` documents
board membership for about a tenth of the 39 audited entities; the other nine
tenths have no published board at all. A card either states a count or says
nothing — never "0 on the board", which would read as a fact about the
foundation rather than what it actually is: a gap in what got published.
Findings/compliance counts stay off the card by design (Emma's call) — they're
still on the named-counterparty table above and on each dossier page, so
nothing is lost, it's just not repeated on every one of 39 cards.

### What stayed exactly as it was

The four headline totals, the named-counterparty table, the register/legal/gap
panels and the source line are untouched — only the "every audited entity"
table became a grid. The ranking is the same `rankedEntities()` the table
already used (money received, descending), so a card grid and the old table
would list identically; nothing was re-sorted or re-scoped to make the redesign
land. No search or filter was added — 39 entities is small enough that a plain
ranked grid is the whole index, and adding a query-string filter would have
turned a static page into a per-request one for no real gain here.

### Files

- `components/FoundationChannel.tsx` — the entity table replaced with a
  `role="list"` grid of `panel`-styled link cards (same class list
  `/politicos`'s featured cards use); a `Map` of board counts is built once for
  all 39 entities rather than once per card, since `governanceFor()` scans the
  full curated roster.
- `lib/i18n.ts` — `foundations.boardCount` (all three locales); `tableNote`
  rewritten to describe the cards instead of a now-gone findings column;
  `foundations.findings` removed as dead after its only caller went away.

Verified: `npx tsc --noEmit` and `npm run build` clean; all 39 cards render,
ranked in the same order the table used; the board-count line confirmed
present on exactly the ten entities `lib/foundation-people.ts` covers and
absent everywhere else; `/fundacion/[slug]` and `/financiacion` confirmed
unaffected; mobile (375 px) collapses to one column with no overflow.

---

## 2026-09-18 — Every caveat is still there, just not shouting

This site's honesty rule has always been that a stated gap beats a possibly-wrong
number, and for a while that meant every limitation was printed in full, always
expanded, on every page that had one. Readable and honest pulled against each
other: a page with three caveats read as three warnings competing with the
figures they were explaining. Nothing here removes a single sentence. It changes
whether the sentence is visible by default.

### `Caveat`: a `<details>`, not a client component

`components/Caveat.tsx` is a native `<details>`/`<summary>` pair — closed by
default, a small "+ Qué hay que saber" toggle, the full text one click away.
No JavaScript ships for this: the browser owns open/closed state, and the
element degrades to a plain expandable disclosure with no JS at all. That is
the same preference this site already follows for the search box and the
sortable territory table — reach for the platform's own affordance before a
library.

`SourceLine`'s existing `note` prop is the main beneficiary: it used to render
a caveat sentence inline inside the citation's own `<p>`, always expanded, on
every chart that had one. `note` now renders through `Caveat` instead — the
same sentence, collapsed, as a sibling of the citation rather than crammed
inside it (a `<details>` cannot legally sit inside a `<p>`).

### What got collapsed, and what deliberately did not

Nine sites converted: the three INE-indicator caveats on `/contexto` (the
low-sample flag, the SMI-tranches rationale, the AROPE-base note), `/donde`'s
two standalone paragraphs (the register's territory-gap count, the closing
"nothing here is joined" line), the two chart-scaling notes on the donations
and electoral-spending bars, the foundation-channel's counterparty and
per-entity table notes, who-governs-a-foundation's inference-discipline note,
the parliamentary-group-is-not-a-party distinction, a party's stance-counting
method, and the rights page's own methodology caveat.

Left alone, on purpose:

- **A caveat that reframes the headline figures themselves** — `/contexto`'s
  part-time/full-time wage warning ("ninguna de estas cifras es «lo que paga
  un puesto»") and the funding page's corporate-donation-ban paragraph. These
  are not footnotes a reader can skip; they change how the number above them
  should be read at all, so they stay in the main flow.
- **A legend needed to read the chart in front of you** — the map's
  active-layer caption, and a table's column definitions. Hiding these would
  make the chart harder to read, not easier — the opposite of the goal.
- **The sole content of an already-minimal empty state** — a party with no
  court record gets one explicit card saying so; collapsing its own
  explanation would hide the one thing the card exists to say.
- **A caveat already gated behind an interaction** — the map's per-community
  hover panel is itself opt-in; collapsing text inside something you already
  had to click to see would be disclosure squared, not progressive disclosure.
- **`CoverageChart`**, because it lives only on `/metodologia`, which this
  pass leaves untouched — that page is the one place a reader chooses to see
  everything expanded, and it should stay that way.
- **Verbatim quoted findings** (a foundation dossier's `deal.text`) — these
  are evidence, not a hedge about the evidence, and quoting them collapsed
  would read as this site hiding something rather than citing it.

### Files

- `components/Caveat.tsx` (new).
- `components/chart/SourceLine.tsx` — `note` now renders through `Caveat`;
  callers must also pass `caveatLabel` or the note is dropped rather than
  shown ungated, so every existing call site was updated alongside it.
- `app/globals.css` — `.caveat > summary` styling: `content` markers rather
  than the browser's own disclosure triangle, `--gold-deep` to match `.src`.
- `lib/i18n.ts` — `common.caveat`, the toggle label, in all three locales.
- Nine call sites across `app/[locale]/{contexto,derechos,donde,party}` and
  `components/{DonationsTable,ElectoralSpending,FoundationChannel,
  FoundationGovernance,GroupBreakdown,PovertyPanel,SmiLadder,WageLadder}`.

Verified: `npx tsc --noEmit` and `npm run build` clean; every collapsed
caveat's full sentence confirmed present in the server-rendered HTML (so it
is not lost, only closed) and confirmed to open on click; the site-wide
`+`/`–` toggle checked against `.src`'s existing colour rather than a new
one; mobile (375 px) checked with no overflow.

---

## 2026-09-18 — Every table, as a CSV, with a permanent link

Until now the only way to take a figure off this site was to copy it out of a
sentence. `/datos` is the fix: thirteen tables, one per published dataset, each
downloadable as a CSV and each with a stable anchor — `/es/datos#salarios` names
one table, not "the site's data" in general, so a specific figure can be cited
rather than described.

### Not a new extraction

Every table in `lib/datasets.ts` is built from the same loader the rest of the
site already calls — `getSalaries()`, `getVotes()`, `getFoundations()`, and so
on. Nothing here re-reads a report or re-derives a number; a row count on
`/datos` and the count implied by the chart on another page come from the same
function, so they cannot drift apart. The registry is one file: a table added
there appears on the page and at its download route with nothing else to touch.

Thirteen tables: BDNS subsidies (232 rows), 2020 private donations (17), the
70 party-foundation dossiers, who governs those foundations and their outside
ties (54 + 18, each row individually sourced), declared electoral spending (8),
the 6,670-row officeholder register, 3,145 roll-call ballots, hate crime by
comunidad (19), regional presidencies (19), the 52 provinces, and two INE
tables — wages (444 rows across sector/jornada/percentile/SMI-tranche) and
poverty (176, national and regional AROPE).

### What a download route buys that a table on a page does not

The CSV columns are fixed, cross-locale identifiers — `retribucion_bruta_anual_eur`,
not a translated header — because a script reading one of these files by column
name should not break depending on which of the three locales downloaded it.
What *is* localised is each table's title and one-sentence description on
`/datos`; the data underneath is the same file regardless of language, so
`/es/datos/salarios` and `/en/datos/salarios` serve byte-identical content.

A UTF-8 BOM is prepended (`lib/csv.ts`) because Excel — still the tool most
people who ask for "the raw data" actually open it in — guesses Windows-1252
without one, and every accented name in the register would render wrong.
Fields are quoted per RFC 4180; the roll-call table is what actually exercises
that path, since the Congreso's own deputy names are published as
"Apellidos, Nombre" — a literal comma inside a field that must survive being a
CSV field and not become a fourth column.

Two tables — who governs a party foundation, and what else those people hold —
have no single publisher to cite: each row's source is a different dated
record, already in its own `fuente_*` columns. `/datos` says so explicitly
rather than attaching one source line that would only be true for some rows.

### Two source lines that would have shipped with empty parentheses

`SourceLine` renders `{publisher} {name} ({period})` unconditionally, and two
of the thirteen tables had nothing to put in `period`: the roll-call votes
(no single date — the tracked divisions span 2023–2026) and the province
table (a classification, not a series — INE gives it no period at all). Caught
in the browser rather than in review: both rendered as "… ()". Fixed by
computing the vote date range from the data itself rather than leaving it
blank, and by stating "vigente" for the province table, since a classification
table does have a truth condition — it is either current or superseded — even
though it has no period in the sense a survey does.

### Files

- `lib/datasets.ts` (new) — the registry: thirteen `{id, count, sources, csv}`
  definitions, each a thin wrapper over an existing loader.
- `lib/csv.ts` (new) — the RFC 4180 writer.
- `app/[locale]/datos/page.tsx` (new) — the index: one section per table, each
  with its `id`, row count, source line (or the per-row-sourced note), and a
  download link.
- `app/[locale]/datos/[table]/route.ts` (new) — the CSV itself, keyed by table
  id rather than by locale.
- `components/Masthead.tsx` — a `Datos` tab between Contexto and Metodología.
- `lib/i18n.ts` — a `datos` block in all three locales: page copy plus a
  title/description pair per table.
- `AGENTS.md` — routes and library tables.

### A branch that was two merges behind `main`

Before starting this, `main` was missing both the postcode entry point (#20)
and site-wide search (#21): #21's base was `feat/where-you-live`, not `main`,
so merging it only updated that branch. Opened a housekeeping PR to land both
on `main` and branched this work from plain `main` instead of stacking again,
since `/datos` depends on neither feature.

Verified: `npx tsc --noEmit` and `npm run build` clean, 393 static pages (up
from 390); all thirteen CSV downloads checked by HTTP status and row count
against the page's own count, for an exact match on every table; the roll-call
table's comma-containing names confirmed correctly quoted; UTF-8 accents
(`Álava`, `Cáceres`) confirmed intact in the raw bytes; the mobile layout
(375 px) checked with no horizontal overflow.

---

## 2026-09-17 — One search across everything, and it says what it does not search

Until now a reader had to already know which of eleven pages held the thing they
were looking for. An officeholder is on one page, the party that funds them on
another, the foundation that party owns on a third, the comunidad they govern on
a fourth. That is a map of the site's internals, not of anyone's question.

`/buscar` searches all of it at once: the 6,670-row register, 28 parties, the
audited entities, 19 comunidades, 52 provinces, the tracked divisions, and the
site's own sections. A field sits in the masthead on every page.

### A form GET, not a typeahead

The whole thing is `<form role="search" method="get">` and a server render.

That is a decision about cost, not an absence of effort. The register alone is
1.8 MB; an index of it shipped to every visitor so that a few can have a
dropdown charges every reader for the minority who search. A form GET costs
nothing to anyone who does not use it, works with JavaScript off, produces a URL
that can be sent to someone, and lets the browser's own navigation announce the
change of context — which a typeahead has to reimplement and usually gets wrong.
It is the shape `/politicos` already used.

Queries run in about 180 ms end to end. The register is folded once per process
rather than once per query: 6,670 names, posts and places is roughly 27,000
`normalize()` calls, and the data does not change between deploys.

### What it refuses to claim

**It says what it searches.** Names and titles — not the text of the reports
behind them. A word that appears only inside a Tribunal de Cuentas finding will
not turn up, and without that sentence a reader would take an empty result as
proof the word is not there.

**A truncated list says how much it truncated.** Eight rows per group, with "and
N more" printed underneath, so the eight never read as the whole answer.

**A query that was never run does not report "no results".** Under two
characters the search does not run at all, and the page says the query is too
short rather than making a claim about the data.

**The empty state says what an absence means.** "Something missing here does not
mean it does not exist: this search looks only at names and titles."

### Ranking, and the bug that made it necessary

Groups were in a fixed order with the register first. Searching "pp" therefore
listed a man called Giuseppe above the Partido Popular — a weak match in a big
group beating an exact match in a small one.

Groups are now ordered by their best match, with the fixed list left as the
tie-break. "pp" leads with Partidos, "vivienda" with the tracked divisions on the
housing law, "metodología" with the section, and "díaz" with people. Within a
group the tiers are exact, then a word starting with the query, then anywhere;
and a person matched on their post or town ranks below every person matched on
their name, because when the query is a name that is what was asked for.

The post and the town are matched as well as the name — thousands of these rows
are mayors of small towns, so "alcalde de Soria" has to work — and both are
printed beside every result, because a list of bare names where dozens of people
share a surname is not an answer.

### Two things caught in passing

- **"1 resultados" does not agree in Spanish**, and a one-result query is common.
  The count is now printed after a colon, which is correct at any number in all
  three languages. Same fix as the hate-crime sentence two days ago; worth noting
  that this is the second time, and that a plural-aware formatter would be the
  real answer if a third appears.
- **The masthead is a client component**, so anything handed to it is serialised
  into the payload of every page. It was being given the whole `search` block,
  including the scope paragraph and the empty-state hint — several hundred bytes
  of prose only the results page renders. It now takes the three strings the
  field prints.

### Files

- `lib/search.ts` (new) — the index, the ranking, and the folded register cache.
- `app/[locale]/buscar/page.tsx` (new), `components/SearchBox.tsx` (new).
- `components/Masthead.tsx`, `app/[locale]/layout.tsx` — the field in the nav row,
  beside the locale toggle rather than as a twelfth tab: the tab row already
  wraps, and a search field is not one of the site's sections.
- `lib/i18n.ts` — a `search` block in all three locales.

Verified: `npx tsc --noEmit` and `npm run build` clean, 393 static pages; queries
checked across every result kind, including the empty state, the too-short state
and the ranking fix; the contrast audit passes 34 pages with 0 inline-colour
failures; no horizontal overflow at 375 px.

---

## 2026-09-17 — "And where do you live?" — the site's first entry point that starts from the reader

Every page here opens with a national figure and leaves the reader to work out
whether any of it describes the place they live. This adds the question the
other way round: a postcode or a province, and a page of what is on record for
that comunidad autónoma, with the national figure beside each local one.

It is the pattern mySociety states outright about TheyWorkForYou — asking for a
postcode is "a super effective way of unlocking clear, relevant information for
them to act on" — and this site had every ingredient for it and no way to ask.

### The postcode never leaves the browser

The first two digits of a Spanish postcode are the province code, and a province
sits inside exactly one comunidad autónoma, so the whole journey is a lookup
over a 52-row table. No geocoder, no address, no request carrying it, nothing
stored. The box says so in the box, rather than in a privacy policy, because a
reader typing where they live into a site about politics is owed it where they
can see it.

That constraint shaped the code. `lib/postcode.ts` holds the type and the pure
resolution and imports nothing; `lib/provinces.ts` reads the JSON and therefore
imports `node:fs`. They are split because a client component that imports
`node:fs` does not fail at runtime, it fails the build — the same split as
`lib/governments.ts` out of `lib/regions.ts`, for the same reason.

The URL is the province, not the postcode. A postcode in a shareable link is
location data the reader did not choose to publish, and the province is the real
resolution of the answer anyway.

### A province is not a comunidad autónoma, and the page says so first

Every figure on this site is published per comunidad autónoma. The reader
arrives by province because that is what a postcode gives. Those are different
units, and the page's opening sentence is the distinction: *"Barcelona is in
Catalunya. Everything below is measured for Catalunya, not for Barcelona: these
figures do not exist per province, and dividing them down would be inventing
them."*

Nothing is apportioned, scaled or divided anywhere in `lib/local.ts`. Seven
provinces share their name with their comunidad — Madrid, Murcia, Cantabria,
Asturias, Navarra, La Rioja and the two autonomous cities — and those get a
different opening line, because "Madrid is in Madrid" reads as a fault.

### What the page shows, and what it refuses to show

Who presides, with the investiture finding where there is one. How many
officeholders the register carries there, how many publish a figure, and the
median of what is published. The comunidad's median wage against the national
one. Its AROPE rate against the national one. Its recorded hate crime against
the national rate.

Every one of those is nullable and nothing falls back:

- **889 of the register's 6,670 rows state no territory.** They are named on the
  page and not shared out between communities.
- **EAES publishes no wage percentiles for Ceuta or Melilla.** Those two pages
  say so. Substituting the national figure under a local heading is the one
  error this feature must not make, and it is the easiest one to make by
  accident.
- A poverty series is selected by its stated base, and an ambiguous match yields
  nothing rather than the first row — the rules `lib/indicators.ts` already
  enforces.

The closing line states the obvious thing that has to be stated: that a
territory has a given rate and that whoever presides over it voted a given way
are two facts side by side, not an explanation.

### Nineteen territories, four vocabularies

The map, the governments, the hate-crime file and the provinces all key on INE's
two-digit code. The other two sources key on names, in two different spellings:
the register writes "Islas Baleares", "Comunidad Valenciana", "País Vasco";
INE's survey tables write "Balears, Illes", "Comunitat Valenciana", "Rioja, La",
"Asturias, Principado de", and space the hyphen in "Castilla - La Mancha".

Fuzzy matching across those would work most of the time, which is exactly the
problem: the failure is a page headed with the reader's own province showing
another region's government. `lib/territories.ts` writes the aliases out, and
`npm run check:territories` fails the build if any source emits a spelling the
table does not carry — in both directions, so a stale alias is caught too.

The province table is derived rather than typed. `scripts/build-provinces.mjs`
reads INE's own province and comunidad value lists and takes the parent from
INE's hierarchy; 52 rows of two-digit codes is precisely the sort of table that
acquires a silent transposition. It aborts unless there are 52 provinces, codes
01 to 52 with none missing, unique slugs, and exactly 19 distinct comunidades.

### Three bugs found while building it

1. **`String.replace` swaps only the first occurrence.** The opening line names
   the comunidad twice, so Barcelona's page shipped a literal `{territory}`. A
   sweep found this is the only string on the site with a repeated placeholder,
   but the next one would have failed the same way, so `fill()` in
   `lib/format.ts` now does the substitution with `replaceAll`. An unknown
   placeholder is left visible rather than blanked — a visible `{token}` is a bug
   that gets noticed, and an empty gap is one that does not.

2. **A count of 1 does not agree with a plural verb.** "1 de esos hechos se
   registraron" is wrong Spanish, and one territory has exactly 1. The sentence
   is restructured so the number stands alone after a colon, which is correct at
   any count in all three languages.

3. **The front page scrolled sideways on a phone, and had been doing so all
   along.** Its lead is a two-column grid declared as an inline
   `grid-template-columns`, and an inline style cannot carry a media query — so
   at 375px the organisations' rail was squeezed to about 120px, its eyebrow
   could not fit, and the document was 403px wide in a 375px viewport. Moved to
   a `.lead-grid` class that is one column below 640px. Found because this was
   the page being made into a landing page; it is a pre-existing fault, not a new
   one.

### Files

- `scripts/build-provinces.mjs`, `data/provinces.json`, `lib/provinces.ts`,
  `lib/postcode.ts` (all new) — the 52 provinces and the postcode bridge.
- `lib/territories.ts`, `scripts/check-territories.mjs` (new) — the name join and
  its guard.
- `lib/local.ts` (new) — one comunidad's figures, each beside its national one.
- `components/WhereYouLive.tsx` (new), `app/[locale]/donde/[provincia]/page.tsx`
  (new).
- `lib/format.ts` — `fill()`.
- `app/[locale]/page.tsx` — the box above the lead; the lead grid now stacks.
- `app/globals.css` — `.lead-grid`.
- `lib/i18n.ts` — a `where` block in all three locales.

Verified: `npx tsc --noEmit` and `npm run build` clean, 390 static pages (up 156:
52 provinces × 3 locales); `npm run check:territories` resolves all four
vocabularies; postcode 08036 routes to Barcelona and 99999 raises the error
rather than guessing; the province select carries all 52; the contrast audit
passes 31 pages with 0 inline-colour failures; no horizontal overflow at 375 px.

---

## 2026-09-15 — A focus ring that followed a bounding box, and a sortable territory table

### The stray lines across the map

Keyboard-focusing a community drew a few black straight segments across northern
Spain — one over Asturias, one down the west of Castilla y León, a bracket near
Extremadura — that followed no border at all.

They were one rectangle. `:focus-visible` in `app/globals.css` applies
`outline: 2px solid var(--gold)` site-wide, and on an SVG shape `outline` is
drawn around the element's **bounding box**, not its shape. So focusing Castilla
y León put a gold rectangle across half the map, and because the regions painted
after it in document order covered parts of that rectangle, what survived was a
handful of disconnected straight lines rather than anything recognisable as a
box. That is also why it read as a rendering fault rather than as a focus ring.

The fix is a focus indicator that follows the border it belongs to:

```css
.region:focus-visible {
  outline: none;
  stroke: var(--ink);
  stroke-width: 2.4;
}
```

It lives in CSS rather than on the element for two reasons. CSS wins over the
`stroke` presentation attribute the map sets per region, so it does not have to
be threaded through the component's per-region style object. And it does not
depend on focus also selecting the region — focus does select, and the selected
region already gets an ink stroke, but relying on that coupling would mean a
later change to the selection behaviour silently removed the focus indicator.

`.region` is the only focusable SVG shape on the site, so no other chart is
affected. The tiny Ceuta and Melilla markers are `<rect>`s, where an outline
would have matched the shape anyway; they get the same stroke for consistency.

### The territory table sorts by any column

Nineteen rows with five columns, previously in one fixed order. Any column now
sorts, with the direction a reader wants first from each: text columns open
ascending, numeric ones descending.

Three things worth stating about how it behaves:

- **The layer's own order is still the default.** Without a chosen column the
  table follows the active map layer — by party on the government layer, by rate
  on the hate-crime layer — which is the order each layer is read in. A chosen
  sort then overrides it and survives a layer switch, because it is an explicit
  instruction. The caption changes to say which order is in force, since the
  original wording ("the order follows the active layer") stops being true.
- **A missing value sorts last in both directions.** A territory the report
  carries no record for has no value in three of these columns, and null is not
  zero: sorting it as zero would put an absence below every real figure
  descending and above every one ascending, which in both cases makes it look
  like a measurement. Same rule as the INE ingest.
- **The heading is a button inside the `<th>`, and the `<th>` carries
  `aria-sort`.** A `<th>` with a click handler is operable by neither keyboard
  nor screen reader. The caret is `aria-hidden`, because `aria-sort` already
  carries the same fact in the form assistive technology reads.

Header cells also gained the padding the body cells already had — the carets were
sitting flush against the next column's label.

### Files

- `app/globals.css` — `.region:focus-visible`.
- `components/RightsMap.tsx` — sort state, the ranking split into layer-default
  and user-chosen, and a `SortHeader` component.
- `lib/i18n.ts` — `tableCaptionSorted` and `sortHint` in all three locales.

Verified: `npx tsc --noEmit` and `npm run build` clean, 234 static pages; the
focused path now computes `outline-style: none` with a 2.4px `--ink` stroke, and
no bounding-box rectangle appears; sorting checked on a numeric column in both
directions and on a text column, 19 rows each time; the contrast audit passes 27
pages with 0 inline-colour failures.

---

## 2026-09-15 — The context layer: what the country earns, next to what the parties are paid

Every page on this site reports a figure about parties or officeholders, and none of those figures
means anything without a scale. €48,650 is the median public salary in the register; whether that is
a lot depends on what Spain earns, which is not this project's number to invent. `/contexto` is that
scale, taken from the statistical office that produces it.

This is step 2 of `PLAN-CONTEXT-LAYER.md`'s build order, plus most of step 3.

### What is on the page

**What Spain earns.** All nineteen CNAE sections as a ladder, rather than a sector selector — a
selector shows the reader the figure they picked and hides the eighteen they did not, and the
finding here is the spread. Energy supply pays €57,931.81; hostelería pays €17,653.42, a factor of
3.28.

The mean never appears alone. EAES's headline mean is €29,540.26 and the median is €24,497.17 —
€5,043 below it, because of a long upper tail. A page printing only the average would tell most
readers their own wage is unusually low, so the tenth and ninetieth percentiles are printed with it
(€12,018.46 and €52,515.27). The caveat that changes how all of it reads is stated under the chart:
EAES counts part-time and full-time workers in the same mean, so none of these is "what a job pays".
Full-time averaged €33,826.92; part-time €14,076.75.

**The whole payroll in multiples of the minimum wage.** The strongest chart of the set, and it turned
out to need no work at all beyond finding it: EAES table `28182` publishes the workforce split by SMI
multiples directly. 18.32 % of Spanish employees earn less than one minimum wage and 48.69 % between
one and two — two thirds inside two minimum wages. This is the axis every salary on this site can be
read against, because the SMI is a single legally fixed number the whole country argues about once a
year.

The tranches are drawn as separate rows rather than one stacked bar. They do partition the workforce
and a stack would be legitimate, but the top tranche is 0.12 % and would be two pixels of a hundred.

**How many people it reaches.** Four ECV indicators as shares of their populations: AROPE 25.7 %,
AROPE among under-16s 33.9 %, at risk of poverty 19.5 %, severe material and social deprivation
8.1 %. The national figure describes no particular community, so the regional spread is stated
alongside it: 43.7 % in Melilla against 14.7 % in the País Vasco.

### The framing rule, enforced in code rather than in prose

Nothing on this page is joined to anything else on the site. No line from a poverty rate to a vote,
no correlation, no ordering of parties by anything computed from these numbers. The figures sit near
each other and the reader does the joining. `lib/indicators.ts` contains no function that takes both
an indicator and a party.

Two rules that would be easy to get wrong are enforced in the module rather than left to each page:

- **A poverty series is always selected by its base.** The same ECV table can carry the Base 2013
  AROPE definition and the objetivo Europa 2030 one. They are different measurements sharing a name,
  so `povertyRate()` takes the base as a required argument, the page prints which base it is showing,
  and if a second base ever arrives in the data the note says so instead of the page silently picking
  one.
- **An ambiguous match is dropped.** A filter that matches two series no longer identifies one, and
  returning the first would publish an arbitrary row. Same rule as the officeholder join.

### Three traps in the INE API, all of which would have published wrong numbers

1. **A leading minus sign is a reliability flag, not a negative number.** INE marks a cell whose
   sample holds 100–500 observations by negating it. `Mujeres. Industrias extractivas` comes back as
   `-51101.45`, meaning €51,101.45 with high variability. Stripping the sign publishes a shaky figure
   as a firm one; taking it at face value publishes a negative salary. The ingest takes the absolute
   value and carries the flag through to the page as a visible marker, and a guard fails the build if
   no flag survives — because a refactor that strips the sign early would silently stop publishing
   the warning while the numbers stayed right.

2. **A table listed in `TABLAS_OPERACION` may hold no series.** Table `80181` answers
   `{"status": "No existen series para la tabla"}` — an object where an array is expected. The shape
   is checked rather than assumed.

3. **A `null` value is a third thing again.** ECV table `67240` has exactly three: "low work
   intensity (0–64)" cannot have a value for the 65-and-over age group, and INE returns null rather
   than zero. Null is carried through as null so the page can state the absence; writing zero would
   put a real-looking 0 % on a chart. The guard expects those three and fails on a null anywhere
   else, because elsewhere a null means a table changed shape.

### Guards

`scripts/fetch-ine.mjs` aborts rather than warns, following the two extractors that caught real
defects that way. Beyond the three traps above it checks the parse against figures published in
INE's own press note — mean €29,540.26, hostelería €17,653.42, median €24,497.17, AROPE 25.7 %,
under-16 AROPE 33.9 % — because a parser that drifts by one column still produces plausible-looking
euros, and the only useful test is against numbers known from outside the parser. It also requires
the SMI tranches to sum to 100 % (they come to 100.01) and every series in a table to share one
period.

### Two findings recorded in NEXT-STEPS.md

- **The AEAT discovery step may no longer be needed.** Build-order item 5 budgeted for a file hunt of
  the same class as the Tribunal de Cuentas one, to get the SMI-multiples distribution. INE publishes
  it. AEAT would still add a census basis and a series back to 2001, which is a real gain, but it is
  no longer the only route to that chart.
- **EAES publishes no modal wage through the API.** The plan's €16,520.18 mode comes from INE's press
  note, not from a table, so the page states mean, median and percentiles rather than the
  mean-versus-mode gap. Adding the mode means transcribing it with its own source block.

### Files

- `scripts/fetch-ine.mjs` (new), `data/indicators.json` (new), `lib/indicators.ts` (new).
- `components/WageLadder.tsx`, `components/SmiLadder.tsx`, `components/PovertyPanel.tsx` (new).
- `components/chart/SourceLine.tsx` (new) — the source line takes the ingested source record, so a
  chart's period and table number are what the ingest recorded rather than what someone typed.
- `app/[locale]/contexto/page.tsx` (new), `components/Masthead.tsx` (nav entry), `lib/i18n.ts`
  (`contexto` block in all three locales), `package.json` (`npm run build:ine`).

Verified: `npx tsc --noEmit` and `npm run build` clean, 234 static pages; all three locales render;
the contrast audit passes 27 pages with 0 inline-colour failures; no horizontal overflow at 375 px.

---

## 2026-09-15 — The coverage chart: the site's own gaps, as figures

`/metodologia` has always stated what is missing, in prose. A reader had to take
the sentence's word for it. This adds the same claim as four bars, computed over
the data itself on every build, so the page cannot claim a coverage it does not
have.

### Measured, never transcribed

`lib/coverage.ts` derives every figure at build time. This is not a style
preference: the plan that specified this chart quoted 133 portraits, taken from a
count made before three later ingests. Measured against the register it is 130,
because three of the portraits in `data/photos.json` belong to people the
register does not carry. A hardcoded figure would have shipped the wrong number
and gone on being wrong.

What it found, over the register of senior appointments (6,670 rows):

| | |
|---|---|
| With a published salary | 4,964 — 74.4 % |
| With a recorded roll-call vote | 268 — 4.0 % |
| With a freely licensed portrait | 130 — 1.9 % |
| Audited entities with a documented board | 5 of 39 — 12.8 % |

### What is not drawn as a bar, and why

Nine tracked divisions, with 580 distinct deputies voting in them, and a single
financial year of private donations (2020). These are true and useful numbers
with no denominator at all — the Congreso holds thousands of divisions — so
drawing nine as a proportion of anything would invent a whole they are not part
of. They are reported as a sentence instead.

The four ratios are not ranked or scored. They measure different things against
different registers: a portrait depends on a free licence existing, a recorded
vote on the person sitting in the Congreso. Ordering them by percentage would
invite a comparison that means nothing, so they run in the order a reader meets
them on the site. The page says so.

Three portraits match nobody in the register. They are reported rather than
discarded, with the reason: the register carries only serving officeholders, so a
portrait without a row is ordinary for someone who has left.

### A discrepancy resolved in the page's favour

A scratch probe written to sanity-check the numbers reported 10 documented boards
of 40; the page reported 5 of 39. The probe was wrong on both counts. Its regex
`/foundation:\s*"([^"]+)"/` also matched the `BOARD_GAPS` entries, which carry a
`foundation` field of their own and are by definition the boards that are *not*
documented. The 40-vs-39 difference is `entitySlug` correctly merging
`SOCIEDAD BATZOKIA S.L.U` with `S. L. U`. The page's figures stood.

### Files

- `lib/coverage.ts` (new) — derives ratios, counts and orphan portraits.
- `components/CoverageChart.tsx` (new) — four `share` bars on the `Bar` primitive,
  plus the prose for the counts that have no denominator.
- `app/[locale]/metodologia/page.tsx` — renders it directly after the lead.
- `lib/i18n.ts` — a `coverage` block in all three locales.

Verified: `npx tsc --noEmit` and `npm run build` clean; all three locales render
the block; the contrast audit passes on 20 pages with 0 inline-colour failures.
Spanish prints `4964` without a grouping separator, which is CLDR
`minimumGroupingDigits` for es, not a formatting fault.

---

## 2026-09-10 — The investiture overlay, as a dated vote rather than a standing arrangement

The map's missing layer. It was held back because the obvious version of it — a
hatch meaning "Vox is in this government" — was already false for part of the
period it would have described: five PP presidencies were invested with Vox
votes in July 2023 and Vox left three of those governments in July 2024.

The fix is to change what is drawn. An investiture happened on a day, in a
chamber of a known size, with a tally. That cannot go stale. Whether Vox sits in
a cabinet today is a different question and is not on this map.

### Two claims, kept separate

`lib/investitures.ts` records two things per community, and they are not the
same claim:

1. **The arithmetic** — the chamber's size and the seats the PP and Vox each
   won. From those, whether the PP could reach an absolute majority alone. Two
   published numbers and a division; anyone can redo it.
2. **The recorded vote**, where verified — date, round, tally, and how many
   votes in favour each party supplied.

They can disagree, which is the whole reason for the distinction. A Spanish
regional investiture that fails on an absolute majority is retried on a **simple
majority**, where abstentions suffice — so "the PP was short of a majority
alone" does **not** establish that Vox's votes invested anyone. Only the tally
does.

So the overlay has two densities: a solid hatch where a verified tally shows Vox
supplied votes the winning total needed, and a sparse one where only the
arithmetic is verified. Drawing both the same would present the weaker claim as
the stronger one.

**Eight communities, not the five the press reported** — because "a PP–Vox pact"
and "PP could not reach a majority alone" are different questions. Four of the
eight have a verified tally: Castilla y León, Comunitat Valenciana, Extremadura,
Murcia. Four ship on arithmetic alone: Aragón, Illes Balears, Cantabria,
Melilla.

### Murcia is why the tally was worth chasing

The arithmetic says only that the PP was two seats short. The record says
López Miras was **rejected twice** — 21–24 on 7 July 2023 and again on 10 July,
with Vox voting against him — and invested 30–15 on 7 September, after a
coalition agreement. The panel lists all three rounds. That is a considerably
stronger and more specific fact than the arithmetic, and it is not derivable
from it.

Comunitat Valenciana is the case that vindicates dating the claim: **two**
investitures in one legislature, Mazón on 13 July 2023 and Pérez Llorca on
27 November 2025, both 53 votes with PP 40 + Vox 13. A single undated overlay
would have described one of them and silently mis-described the other.

### The research was unreliable, and the guard is why that is survivable

Three sources gave figures that did not close, and two of them would have put a
wrong hatch on a public map:

- one table reported Aragón's Cortes at **65 seats** while stating a majority of
  **34**, which implies 67 — the real figure. Four chamber sizes in that table
  were wrong (Aragón, Illes Balears, Madrid, La Rioja), and correcting them
  **flipped La Rioja out of the layer entirely**: PP holds 17 of 33, which *is*
  an absolute majority;
- the Illes Balears tally put Vox at 4 votes and Més at 8 — the exact reverse of
  the 8 and 4 they hold;
- Castilla y León's against-column breakdown summed to one less than its own
  total.

`npm run check:investitures` therefore fails rather than warns, on: a
votes-in-favour breakdown that does not sum to its own total; a round with more
votes cast than the chamber has seats; a party contributing more votes than it
holds seats; a round marked successful that did not reach its stated bar; and a
community listed at all when the PP already held a majority there. Only the
**for**-column breakdown is required to close, because that is what establishes
Vox's contribution — the against column is not load-bearing for anything
published, and the sources disagree on its detail.

The guard was tested by injecting two faults and confirming both were caught: a
breakdown summing to 32 against a stated 33, and Vox voting 90 with 9 seats.

### What the map does

The overlay draws only on the government layer — an overlay on the hate-crime
ramp would imply a link between the two that nothing here supports, and it
clears when the layer switches (verified: 8 overlays and a legend on one layer,
0 and 0 on the other). It carries `pointer-events: none`, so the region beneath
stays hoverable and clickable: the hatch is a mark, not a target. The two tiny
territories get the same overlay on their markers rather than on their
unclickable outlines.

The drill-down panel states the arithmetic, then the deciding vote where one is
verified, then every round with its date and tally, then the source. A community
where the PP held a majority alone gets no investiture block at all — Madrid, at
70 of 135, correctly shows none.

**Verified.** Typecheck clean, build clean at 231 pages, both guards pass, 8
overlays in the two intended densities with both legended, the overlay and its
legend absent on the other layer, Murcia's three rounds rendering in order, and
**0 contrast failures across 20 routes**.

### Still not on this map

Whether Vox currently holds cabinet posts, and where. That is the standing
arrangement this layer deliberately does not draw, and it needs its own dated
record of entries and departures — three governments changed in July 2024
alone.

---

## 2026-09-10 — One bar, one convention, and a chart that was rendering black

Emma sent five screenshots of visual bugs and of the bar charts disagreeing with
each other. Three were defects; the fourth was the real problem.

### The donut was rendering solid black

`partyMeta(nif, rawName)` picked its fallback colour with
`FALLBACK_COLORS[nif.charCodeAt(1) % FALLBACK_COLORS.length]`. Three call sites
colour by *name* and pass an empty NIF, so `charCodeAt(1)` returned `NaN`,
`FALLBACK_COLORS[NaN]` returned `undefined`, and an SVG `fill` of `undefined`
paints **black**. No error anywhere: the electoral-spending donut and the front
page's spending bar were monochrome, and the only symptom was that they looked
like a design choice.

Two fixes, because there were two faults. `partyMeta` now hashes the cleaned
name, so it always yields a colour and uses the thing those callers actually
have. And the report's formation names — five of which are coalition labels that
no token rule resolves, since "AHORA REPÚBLICAS" and "COALICIÓN POR UNA EUROPA
SOLIDARIA" share no word with any registered party name — are mapped explicitly
in `lib/spending.ts` via `formationNif()` / `formationColor()`, falling back to a
neutral grey rather than to nothing. Where a coalition has several members the
NIF is the formation that led the list, and the report's own full name is still
what the chart labels it with, so nothing shortens a coalition to one party in
text.

### The vote-flow labels were all stacked at one point

Every party label in the flow diagram was wrapped in an `absolute` span carrying
only `top`. With no width that wrapper collapses to 0×0, so both of its
absolutely-positioned children resolved their `left` percentages against a
zero-width box and the whole column piled up at the same coordinate — party
name printed over amount, which is what the screenshot showed. Measured before
the fix: **15 labels at `w:0 h:0`, all at `x:45`**. After: 18 labels, **0 of
zero size, 0 overlapping pairs**.

### The masthead's wordmark struck through its own edition line

`EDICIÓN Nº 001` appeared to have a line through it. The boxes were not
overlapping — they measured a 4px gap — but the wordmark runs at 72px on a 0.9
line height, so its box is 65px and the descender of the "g" in "Seguir" paints
about 7px below it, straight through the "Nº". The gap is 12px now.

### The real problem: nine bars, six heights, two conventions

This is what Emma actually flagged, and it was worse than the screenshots
showed. Across the site there were **thirteen** hand-rolled bars — the first
sweep found nine, and four more were on older inline classes that the
`bar-track` grep missed. Between them:

- **six different heights** (6, 7, 8, 12, 15, 26, 30 px), none of them chosen
  against the others;
- **two incompatible scale conventions**, share-of-total and share-of-max, with
  nothing on the page saying which a given bar used;
- **the same three donation tranches in three different palettes** — party
  colour / party at 62 % / ink on the donations table, ink-3 / gold / red on a
  party page, ink-3 / abstention / ink on the front page, all reachable from
  each other in two clicks;
- **"sí" in gold in `GroupBreakdown` and in verdigris in `StanceByGroup`**, two
  widgets apart on the same page.

A chart that looks consistent and is not misleads by implication, which is worse
than having no chart.

So: `components/chart/Bar.tsx`, which is what `PLAN-VISUAL.md` step 1 already
asked for — a primitive, not a library. All thirteen bars now go through it.

**`scale` is a required prop, not a default.** `"share"` means the segments are
parts of a whole and fill the track; `"compare"` means the bar's own length is
its share of the largest row in the set, and the segments divide that length.
Making it required is the point: the previous bars each had a convention and
none of them said so.

**Heights are four named sizes** (`sm` 8, `md` 12, `lg` 20, `xl` 28), so a bar's
weight is a decision rather than an accident.

**`BarLegend` reads the same segments array as the bar.** A legend written out
by hand beside a bar drifts from it — that already happened here once, when a
swatch was darkened for contrast and stopped matching the segment it labelled.
Taking one array makes that unrepresentable.

**`lib/chart-colors.ts` decides each category's colour once**: `TRANCHE_COLORS`,
`SPEND_COLORS`, `STANCE_COLORS`, `SUBSIDY_COLORS`, `CHANNEL_COLORS`.

### A minimum width, and why it is defensible

Scaled linearly against the largest party, thirteen of the seventeen rows in the
donations table came out under four pixels and several under one — a real
declared figure rendering as literally nothing. Segments now have a **2px
floor**, so a non-zero value reads as non-zero without pretending to be readable
as a magnitude.

That is a small distortion and it is acknowledged rather than hidden: every one
of these charts prints the exact figure in an adjacent column, and both affected
tables now carry a note saying the floor exists and what the bar is scaled
against. The bottom rows (PP €3,120, PSC €1,800) sit at the floor and are
identical in width; their figures are two columns away.

### The unexplained hatch

The subsidy dashboard drew `seguridad` as `--red` with a 45° diagonal hatch, on
all 28 rows, with no legend anywhere on the page. Red is the alert colour this
site uses for "against" and for the unaccounted residual, so an ordinary
category of state subsidy read as a warning. It keeps the hatch — a fourth hue
in a chart already carrying 28 party colours would not be distinguishable — but
takes a neutral ink and is now named in a legend.

Also removed: `Dashboard`'s own local `Bar` component, which the primitive
replaced.

**Verified.** Typecheck clean; build clean at 231 pages; the donut renders eight
distinct party colours (was eight blacks); bar heights on `/financiacion` reduced
to the three named sizes in use; smallest rendered segment 2px, none invisible;
the flow diagram has 0 zero-size and 0 overlapping labels; legend swatches match
their segments' computed colours exactly; **0 contrast failures across 18
routes**; and the officeholder-join guard still passes.

---

## 2026-09-10 — The officeholder join, matched on two conditions rather than on a name

The foundation people layer and the officeholder register were both already
ingested, and stage 3 deliberately left them unjoined. This joins them: the public
offices held by the people who govern the party foundations, on each entity's
dossier.

It is the only join in this project that attaches a **named living private
individual** to a record neither they nor the foundation published, so it was
measured before it was built rather than after.

### What the measurement said

- The register holds **6,670 officeholders resolving to 6,663 folded names**, and
  only **three** of those keys cover genuinely different posts — a collision rate
  of **0.045 %**. Low, and not zero.
- Of the **53** curated board members, **14 match exactly one post**, **39 have no
  row at all** (the ordinary case for a trustee who holds no public office), and
  **0 are ambiguous**.

### Two conditions, both required

**One distinct post per folded name.** `nameKey` is order-independent and
accent-folded, which is what lets "Apellidos, Nombre" meet "Nombre Apellidos". It
is not an identity. A key covering more than one post therefore yields nothing
rather than the first of them.

**The party must agree.** The officeholder's party must be the party the audit
report links the foundation to, or the officeholder must be recorded as
unaffiliated — which is how the register carries government delegates and senior
appointees. This is what turns a name match into evidence: two different people
who happen to share a folded name have no reason at all to share a party with a
foundation neither was matched on.

All fourteen agree, and the agreement is the corroboration: every Fundación Pablo
Iglesias match is PSOE or a PSOE-appointed independent, both Sabino Arana matches
are PNV, and the Concordia y Libertad match is PP. Each pairing was also read by
eye against the board it came from.

### What is not claimed

The office is the office **as the register stated it on its own last-updated
date**, which every tie carries and renders. The register has no per-person date
and no active flag, so a title that has since changed hands is the register's
staleness, presented as such and never as a current fact this site asserts.

And nothing says a person's office and their board seat have anything to do with
each other. They are two public records about one person placed side by side — the
same rule the money and the votes are published under, and the page says so in
those words.

`/fundaciones` states the join's coverage and, more importantly, its refusals: how
many people were not in the register, how many were dropped as ambiguous, and how
many were dropped for party disagreement. A match rate alone would read as a
quality score; the drop conditions are what make the rate mean anything.

### A label that was inventing something

The tie's organisation slot was first filled from the register's
`region`/`municipality` columns, falling back to "Administración General del
Estado" where both were null. That was wrong twice over: the fallback is a label
the register never states, and where the columns *are* populated their meaning
changes with the row type — where a government delegate operates, the constituency
a deputy was elected in, the administration a regional consejera serves. Folding
all of that into one "organisation" meant inventing a fact.

The office title now carries the fact, and the region is a qualifier shown only
when the register gives one. So it reads "Ministro de la Presidencia, Justicia y
Relaciones con las Cortes" and, for the Basque consejera, "CONSEJERA DE DESARROLLO
ECONÓMICO… — País Vasco".

### A latent contrast bug the join would have exposed

`TieLine` set government and public-body ties in raw `--gold`, which is 3.02:1 on
the ground — a fill colour, below AA as 14px text. The contrast audit had passed
`/es/fundacion/fundacion-disenso` only because Disenso has no government tie. This
join creates fourteen of them, so it would have shipped fourteen failures. Fixed to
`--gold-deep`, and the audit now covers the three dossiers that carry them.

### The guard

`npm run check:office-join` fails rather than warns. It checks the assumption the
whole join rests on — that a folded name is nearly always unique in this register,
against a 0.5 % ceiling — plus the things a refreshed export could silently break:
that the `ROLES` literal is still parseable (otherwise the party condition would be
checked against nothing), that no published match links to a slug the register does
not carry, and that the join has not silently stopped matching anything.

It deliberately does **not** re-check the party condition. Doing so would mean
reimplementing `partyNifFor` in JavaScript, because the audit report writes
"Partido Socialista Obrero Español" where the register writes "PSOE" — and a second
copy of that rule would drift from the first. A drifted check is worse than no
check. The first draft of this script did attempt it, compared the two naming
styles by substring, and failed all ten PSOE and PNV matches; that is exactly the
drift the rule now avoids.

**Verified.** Typecheck clean, build clean at 231 pages, the guard passes, all three
tie links resolve to a real person page, all three locales render the dossiers, and
**0 contrast failures across 18 routes** — the thirteen from the redesign plus the
three foundation dossiers that now carry government ties and the two other locales
of the index.

---

## 2026-09-09 — The light newsprint redesign, a sourced territorial map, and a typed court record

The design handoff replaces the dark "dossier" system with a light newsprint one. The route
structure, the data layer and the honesty rules stay as they were; the shell, the palette, the type
and three screens are new.

### The shell

The 224px sidebar rail is gone, replaced by a 6px ink bar, a masthead row and a tab nav. The rail
put six links before the content on every page and spent a fifth of the viewport on navigation. A
masthead gives that width back to the data, and reads as what this is — an edition of a document,
not an application.

Fonts drop from three to two. **Cormorant Garamond** carries every heading, kicker, tab and display
figure; **Lora** carries body, meta and table amounts. The third face was a monospace loaded only to
get tabular figures, which both of these provide, so `.mono` is now the body face with
`font-variant-numeric: tabular-nums` — which is what nearly every call site was using it for.

The masthead dateline is formatted on the server from the request date, in `Europe/Madrid`. A
client-side date would either mismatch at hydration or be absent from the HTML; the layout carries
`revalidate = 3600` so the shell refreshes on the same cadence as the pages inside it.

### Two corrections to the handoff's own contrast table

Both were found by measuring rather than by reading, and both matter:

- **`#605d5d`** — the lightest permitted text colour — is stated as 7.0:1 on the ground and measures
  **5.83:1**. It still clears WCAG AA at the 10.5–12px it is used at, so nothing changed except the
  comment: no decision here should rest on the stated figure.
- **Verdigris `#2f7d70`** is stated to pass AA and measures **4.38:1**, which fails the 4.5:1 normal
  text needs — and it was specified for 10.5px organisation names and stance tags. It is now a
  graphic colour only (bar segments, dots, borders, the live-data dot), exactly as the design already
  rules for gold, and every verdigris *text* use takes a new `--verd-text` at **5.28:1** on the
  ground and **4.87:1** on the surface, so it passes on both grounds the site paints.

The same split now applies to gold, which the design states and then breaks in a few places:
`--gold` at 3.02:1 is a fill and a border, `--gold-deep` at 5.97:1 is text. The one exception is the
display italics — the masthead wordmark and the `h1` emphasis spans — which run at 32px and up,
where WCAG's large-text threshold puts the bar at 3:1 and `#b68235` passes as designed.

**Verified across every page**: an audit resolving each element's inline colour against the tokens
in `app/globals.css` reports **0 failures on all 13 routes** (three locales of the portada, plus
funding, foundations, map, votes, rights, politicians, methodology, two party pages and a foundation
dossier). It found 34 that the in-browser pass had missed, in components whose accent is chosen at
runtime rather than written as a class.

One of those fixes exposed a second defect. The donations legend on a party page drew its swatches
as a "■" character coloured with the bar's own token; darkening it for contrast fixed the ratio and
broke what a legend is for, because the swatch no longer matched the segment it labelled. It is now
an `aria-hidden` span block reading from the same array as the bar, which is the pattern the rest of
the site already uses, and the two cannot drift apart.

Also fixed while there: the grant tag's border was `` `1px solid ${token}44` ``, which concatenates a
hex alpha suffix onto a `var()` reference and yields `var(--gold)44` — not a colour, so the border
had been silently falling back to `currentColor`.

### /financiacion holds three channels, and the foundations moved

The page is now the stat strip, a donut of declared electoral spending by formation, the report's own
spending lines, the 2020 donations table by tranche, and the subsidy dashboard as the baseline the
others sit against.

**The foundation channel moved to `/fundaciones`.** The two were answering different questions from
different statutes — parties may take no corporate money at all, their foundations may take it under
*disposición adicional séptima* — and folding the second into the first made the funding page read as
one ranked list of everything, which is what made it uninformative in the first place.

The donut's arcs are explicit SVG paths rather than a stroked circle with a dash offset. A dashed
stroke needs the circumference to divide evenly and offsets every segment from one origin, which
puts the rounding error at the last arc, visible as a hairline gap where the ring should close.

The three spending lines partition declared ordinary spending exactly, so their percentages add to
100 %. Mailings do not belong to that total at all — they are accounted separately, outside the
general cap — so the fourth row runs full width against a note rather than taking a share of a
denominator it is not part of.

### /mapa — two layers, not the five designed

The other three layers came with sample values, and are not here. An LGBTI rights index, the state of
trans-law reform, and vote share for the parties that voted against the tracked bills have **no
citable per-community source**, and a plausible-looking number on a map is read as a measurement.

So is the hatch overlay marking investitures that depended on Vox, which is the most interesting
thing the government layer could carry. Five PP presidencies were invested with its votes in July
2023 and Vox then left three of those governments in July 2024, so one static overlay would be false
for part of the period it appeared to describe — and at least one arrangement has changed again
since. It needs each parliament's own investiture record, which is its own verification pass. The
page says all of this, rather than leaving the absence to be noticed.

What the two shipped layers do have behind them:

- **`scripts/extract-hate-territory.py`** reads the Ministerio del Interior's 2024 report — section
  2.2 for the rate per 100,000 inhabitants and annex 7.1 for counts by community and motivation. It
  aborts rather than warning. Every row must reconcile against its own printed total; the whole table
  must reconcile against the national figure already in `lib/hate-context.ts`; and **both motivation
  columns the site publishes must reconcile against their own national figures.**

  That last guard is the one that proves the columns are aligned. Fourteen integers on a line are
  positional, and a single-column shift would leave every row summing correctly while attributing
  racism figures to orientation. It caught a real defect on the first run: the document carries four
  tables of identical shape (*hechos conocidos* and *victimizaciones*, each by community and by
  province, then again for *detenidos* and *esclarecidos*), so a whole-document scan matched all of
  them and kept the last — reconciling to 1,405 against a national total of 1,955. Scoped to annex
  7.1, it reconciles exactly: 1,955, of which one incident is recorded in no territory, which is why
  the orientation column sums to 527 against a national 528.

- **`lib/governments.ts`** carries the presidency of each of the 19 territories with the date it was
  taken. Curated and dated, because a table without dates cannot be checked and goes stale quietly:
  the Valencian presidency changed hands in December 2025 within the same legislature and the same
  party, which a partyless snapshot would have hidden.

**What the figures are, precisely**, and the page says so: *hechos conocidos* are facts reported to
and recorded by the security forces — including administrative infractions — not convictions and not
incidence. The two communities with their own police forces (Policía Foral de Navarra, Ertzaintza)
head the rate table, which says something about how incidents are recorded and not necessarily about
where more of them happen.

`scripts/build-regions.mjs` projects the geometry once at build time rather than loading d3 and
topojson in the browser to compute a result that never changes. Ceuta and Melilla are about 19 km²
each and project to a couple of pixels, so the script also emits a centroid and a projected-area
flag, and the component draws a minimum-size marker for anything below the threshold — otherwise two
territories are on the map but cannot be seen, hovered or clicked. The threshold is on rendered area,
so it decides which territories need one rather than naming the two; it picked out exactly 18 and 19.
Melilla's centroid sits 8 units from the bottom of the viewBox, so its label flips above the marker
when there is no room beneath, which there is not.

The choropleth ramp uses CSS `color-mix(in oklab, …)` rather than a colour library. Mixing in a
perceptual space is the whole reason `d3.interpolateLab` was specified for it, the browser does that
natively now, and sampling from 0.16 rather than 0 keeps the lightest step reading as a fill instead
of as empty ground.

Every value is also a row in a table below the map. That is not a fallback: a choropleth cannot be
read to the precision of a number, and nineteen figures are worth having.

### The money→party→vote flow, on /votaciones

Ribbon thickness is the amount declared in 2020; the column it lands in is how that party's group
voted in 2026. The caveat saying the two are independent public registers of different years, and
that neither explains the other, sits **beside** the chart rather than under it.

Only parties whose group maps to them one-to-one appear. A party inside a composite group has no
stance of its own in the record, and handing it the group's majority would be the inference this
project refuses everywhere else — so those parties are **named as excluded** instead of dropped. Each
outcome node is exactly as tall as the ribbons it receives, so the two columns reconcile without a
second scale: verified at 399 units on both sides, 6 formations in and 6 named out.

That rule now lives once, as `stancesByParty()` in `lib/votes.ts`, and the party ficha uses it too.

### The court record, as a type rather than as copy

`lib/court-records.ts` holds the four resolutions that survived the three-verifier panel in
`research/hate-accountability.md` at 3-0. The status label is the whole point of the component, so it
is a union type and not a string, which makes four specific mistakes unrepresentable:

- an archived case is `archived`, **never "acquitted"** — both decisions in the *menas* matter are
  autos confirming *sobreseimiento* at the instruction stage, a finding of no *indicios*, never a
  merits judgment;
- an open case is `awaiting-trial`, and an *auto de apertura de juicio oral* cannot read as a verdict
  because no status in the union would let it;
- an electoral board's order is `advertising-infringement` and nothing more, because the Junta
  Electoral de Zona de Madrid expressly declared itself not competent over the content and opened no
  sanctioning file;
- a complaint *against* someone is `complaint-archived`, and the record says whose conduct it
  concerns: Vox's *querella* against Ione Belarra documents a complaint against her, never conduct by
  her.

The copy is translated in three languages; the tag is not, so no translation can turn an archiving
into an acquittal. A party with nothing on file gets an explicit card saying so and saying what that
does and does not mean — rendering nothing would read as a clean record, and rendering "0" would
invite a comparison four hand-verified records cannot support.

**On publishing a live prosecution by name.** The Herrero record processes a living person's
criminal-proceedings data, which engages art. 10 LOPDGDD and LO 1/1982. It is published because she
is an elected officeholder, the opening order was reported by five outlets across the political
spectrum, and the label states its procedural stage and nothing beyond it. That is a different thing
from the per-politician conviction tag this project declined to build, which would have required
attributing findings to people from records that are pseudonymised at source.

### The party ficha

A formation switcher, taking whichever parties carry a declared-donations record rather than the
design's fixed five, so the row cannot list a party whose page is empty nor omit one that appears
when the next audit lands. The active tab is underlined in the party's **own** colour, because the
reader is inside one party's dossier and the accent should say which.

Below the money: how the group voted on each tracked division, and the court record for that party.

The two kinds of gap are now distinguished, which matters more than it sounds. Sumar leads the Grupo
Plurinacional SUMAR, which also holds IU, Comuns, Más Madrid and Compromís, so the group has a
majority but it is not Sumar-the-party's own — attributing it to Sumar's NIF and not to IU's would be
arbitrary. That reads **"En grupo compartido · Sumar"**. A party that was not in the chamber at all
reads **"Sin representación"**. A single label for both would have said something false about one of
them: Sumar's six XV divisions are the first case and its three XIV ones the second.

`sharedGroupFor()` matches on `shortName` from the party registry against the labels in a composite
group's `parties`, exactly and case-sensitively. Those labels are written to be the registry's own
short names, so this is a lookup rather than a guess, and a label that stops matching produces no
group instead of the wrong one.

### The portada

A ticker of the six figures the site rests on; the lead, which is the one finding a reader cannot get
elsewhere; the organisations' own voices beside it; the three public registers summarised; then three
columns of detail.

**Every figure comes from the data layer.** The prototype hardcoded them, which is right for a
prototype and would rot here within one refresh. Computed rather than transcribed, they land on the
design's verified values exactly: subsidies 300,6 M€, donations 2,07 M€, electoral 18,43 M€, 9
divisions, 12 donors above €10,000, the residual at 54,5 % of €10,052,187.82, and the donor/money
tranche split at 91,6 / 8,2 / 0,2 % against 33,3 / 57,4 / 9,3 %.

The lead's ghost numeral is **truncated, not rounded**: the share is 54.5 %, and rounding it to 55
would put a numeral on the page contradicting the 54,5 % in the standfirst two inches below it.

The reportage column's single-cheque headline reads €23,000 from the data, not from the copy: where a
party's top tranche holds exactly one donor, its total *is* that gift, and that is the only
individual figure the report permits without inventing anything.

Both image slots are hatched placeholders awaiting licensed imagery. A placeholder that looked like a
photograph would be a claim about something that was never photographed.

### Bugs fixed along the way

- **`data/votes.json` stores dates as `D/M/YYYY`.** `formatDate` threw `RangeError: Invalid time
  value` on them, and picking "the most recent division" by string comparison put 25/6/2026 before
  27/11/2025. `lib/votes.ts` now owns `voteDateISO()` and `newestFirst()`.
- **Every face on every party page was a 404**: they linked to `/politician/${slug}` and the route is
  `/politico/[slug]`.
- `lib/groups.ts` still returned `var(--paper-faint)` for a composite group's swatch — a token the new
  sheet does not define. The token sweep had walked `app/` and `components/` but not `lib/`; its guard
  now covers all three.
- `RightsMap` is a client component, so importing `lib/regions.ts` pulled `node:fs` into the browser
  bundle. The curated presidency data moved to `lib/governments.ts`, which is free of Node imports,
  and `lib/regions.ts` keeps the file loaders and types.
- Passing the whole `Dict` to `RightsMap` failed at prerender: `Dict` carries functions
  (`news.hoursAgo` among them) and a function cannot cross the server-to-client boundary. It takes
  `Dict["map"]`.

### New helpers

`lib/format.ts` gains `cssPercent()`, because a localised percentage is not a parseable CSS length —
`es-ES` renders 0.545 as "54,5" and a bar given `width: 54,5%` collapses silently rather than
erroring, so display formatting and layout formatting never share a helper. And `rate()`, because
`toLocaleString` drops a trailing zero and turned the report's published 14,00 into 14.

### Left out, deliberately

- The design handoff bundle itself is gitignored. It is an input rather than product, and it carries
  a third-party streaming-template runtime the handoff says not to port.
- Three map layers and the Vox-investiture hatch, above.
- A small-phone layout. The flow diagram in particular needs a rethink below ~600px — probably a
  sorted list rather than ribbons.

**Verified.** Typecheck clean; build clean at **231 pages**; the extractor reconciles to the national
total and both published motivation columns; the flow diagram's columns balance at 399 units;
**0 contrast failures across 13 routes**; the map's marker threshold selects exactly Ceuta and
Melilla; and all three locales render every new screen.

---

## 2026-09-08 — A rights section in the organisations' own voices, images, and a cooler accent

Three things: article images where the feeds publish them, a dedicated LGBTQ+ rights section built on
the eight NGO feeds already in the registry, and a polish pass on the palette and cards.

### The rights section

`/derechos` — new, and the ordering is the argument. The eight organisations in
`lib/news-sources.mjs` come first under their own names, the three outlets follow in a separate
block, and a directory at the bottom links every channel so a reader can go to the source rather
than only to whatever it published this fortnight. Every other page on this site reports on the
state; this one carries what the organisations publish about themselves.

**Server-rendered, unlike the portal's `NewsFeed`.** A section that exists to give these
organisations a platform should not be the one part of the site that needs JavaScript to appear. All
three locales ship 24 cards in the HTML.

Feeds that fail are named on the page. The methodology page already lists the seven that were tested
and rejected; this reports the ones that broke on this load.

### Images, proxied rather than hotlinked

`lib/news.ts` now extracts a lead image per entry, trying candidates in descending order of how
deliberate they are: `<enclosure type="image/*">`, then `<media:content medium="image">`, then
`<media:thumbnail>`, and only last the first `<img>` in the entry body — which may equally be a
tracking pixel or a share badge. Anything that is not plainly an `http(s)` image URL is dropped, and
obvious trackers (`1x1`, `pixel.`, `/track`, `spacer.gif`) are skipped.

**New `app/api/news-image/route.ts` serves them through this origin.** Rendering `<img src>` at the
publisher would hand every reader's IP address, user agent and referring page to fifteen third-party
hosts. Several belong to LGBTQ+ organisations, and who reads them is precisely what should not leak;
the same holds for the housing and poverty feeds. Proxying also makes the images survive publishers
that block hotlinking — a broken image on every card is worse than no images.

The allowlist is the other half. An open image proxy is a server-side request forgery tool, so only
hosts vouched for by the registry are fetched — plus their subdomains, since WordPress sites serve
from CDN shards, and the `www.`/bare counterpart, which is what makes `shangay.com` resolve against
the registry's `www.shangay.com`. Only responses declaring `image/*` are returned, capped at 4 MB,
with `X-Content-Type-Options: nosniff` and a `sandbox` CSP because the bytes are someone else's.

Verified by request: a registry host returns `200 image/jpeg`; a foreign host `403`; the cloud
metadata address `169.254.169.254` `403`; a missing `url` `400`. On the page, 18 of 18 images load
and none break, and the server HTML contains **zero** hotlinked `src`.

`NewsFeed` gets the same images as a small thumbnail rather than full-width media, because it sits in
a narrow column beside other panels where a 16:9 image per row would push the headlines out of it.

### Palette and cards

The palette was gold and red on brown throughout, which made every accent read as the same kind of
emphasis. A verdigris counter-accent now carries the organisations' own voice — the NGO feeds, the
rights section — without leaving the aged-document world the rest of the site lives in. Measured on
`--ink`: `--verd` **7.76:1**, `--verd-bright` **11.57:1**, both clear of WCAG AA's 4.5:1. A source
label is verdigris when it is an organisation and gold when it is an outlet, everywhere it appears,
so provenance is legible before the text is read.

Also: a third cooler light in the page aura and a vignette, so a long page darkens at its edges
instead of ending in a flat field; panels gained an inset highlight along the top edge and a real
shadow; and a new `.card` treatment with a fixed 16:9 media block, a diagonal hatch behind it so a
slow image never reflows the grid, a gradient tint so white-heavy press photography does not punch a
hole in a dark page, and a slight desaturation that pulls photography from fifteen publishers towards
one palette.

Card images carry empty `alt`: the headline immediately below is the accessible name, and a
decorative duplicate would make a screen reader announce the same article twice.

**Verified.** Typecheck clean, build clean at 225 pages (104 → 221 → 225), zero contrast failures on
the new page, images load in the browser and in the server HTML, and all three locales render.

---

## 2026-09-08 — Who governs the party foundations, and how each claim is sourced

The money layer landed earlier today. This is the part it could not answer: report nº 1.642 records
what these entities received and never who runs them. `lib/foundation-people.ts` does, for the
entities that move real money, and every record carries one dated source with its evidentiary status
attached.

**Coverage: a board documented for 5 of the 39 audited entities — 53 people and 18 outside roles.**
Small on purpose. Board membership is published unevenly, and where it could not be established the
dossier says so rather than showing an empty section.

### The rules, enforced in the types

- **One dated source per record**, with a resolvable URL. A record without one does not exist.
- **`SourceKind` drives the rendering.** `registry` and `official` read as statements of record;
  `press` renders as *"según {publisher} ({date})"*. They are never merged or counted together —
  the ODIHR rule this project verified 3-0 in the research: the label must match the evidentiary
  status of its source.
- **Nothing is inferred.** No score, no ranking, no derived edge. A tie exists only where a named
  source states it, and `former: true` where the source puts the role in the past, because a stale
  role shown as current misrepresents a living person.
- **Names join by `nameKey`**, so an ambiguous match is dropped rather than guessed — the same rule
  the portrait and social-handle joins already follow.

### Chasing the primary source overturned three secondary ones

This is the finding of the exercise, and it is why the layer is small rather than broad:

- **Wikipedia lists an eight-member Fundación Disenso board** from 2020. The foundation's own
  transparency filing lists **three**: Santiago Abascal, Enrique Cabanas and Pablo Sáez.
- **A 2017 PSOE announcement** of the Fundación Pablo Iglesias board was the most recent list
  reachable without a bot check. Publishing it would have said **Félix Bolaños is the foundation's
  secretary today** — he is a minister, and the board has changed twice since. The foundation's own
  page (last modified 2026-07-02) gives the real 20-member board.
- **eldiario.es reported in October 2021** that Pablo Iglesias had taken the presidency of Podemos's
  foundation with Juan Carlos Monedero as director. The entity's own patronato page (modified
  2024-04-09) shows **neither of them**, and of the six names in that article only Orencio Osuna
  remains. The press record is kept for the one fact it still evidences: the change of name.

A fourth, smaller trap: a search summary offered a different and larger Podemos board than the
article it was summarising. Only fetched sources are recorded.

### What the boards actually show

- **Fundación Pablo Iglesias (PSOE)** — 20 trustees including **Pedro Sánchez**, **María Jesús
  Montero**, **Félix Bolaños**, Carmen Calvo, Cristina Narbona, Reyes Maroto, Pilar Bernabé, Rebeca
  Torró and César Luena. A foundation that took €451,260 of public subsidies in 2022 is governed by
  a board carrying the Prime Minister and the Finance Minister.
- **Fundación Concordia y Libertad (PP)**, which now trades as **Reformismo 21** — a six-member
  patronato under Pablo Vázquez (former Renfe and Ineco president), with an advisory council chaired
  by **Alberto Núñez Feijóo** and carrying the corporate ties: **Verónica Pascual**, a Telefónica
  board member; **Fátima Báñez**, president of Fundación CEOE and a former minister; **María Eugenia
  Clemente**, chief executive of Alestis Aerospace; plus Román Escolano (former Economy Minister,
  now at the European Investment Bank) and Ramón Gil-Casares.
- **Sabino Arana Fundazioa (PNV)** — nine trustees, and the only entity here publishing an
  appointment date for every one of them, from 2008 to November 2025. It is also the only party
  foundation holding the Haz Foundation's *"t de transparente"* seal. Its board is professionals
  rather than serving politicians, chaired by Arantxa Tapia Otaegi.
- **Fundación Disenso (Vox)** — three trustees, chaired in effect by the party's own president.
- **Fundación Instituto República y Democracia (Podemos)** — five, under José Julio Rodríguez
  Fernández, a retired career officer who was chief of staff to the Second Vice-President between
  January 2020 and March 2021.

### Renames, which the report cannot show

Report nº 1.642 uses the name in force during the audited exercise, and two of these entities have
since renamed themselves — so a reader searching the current name finds nothing, and one of them
appears in the report twice under both names. Both renames are now recorded and printed on the
dossier: **Concordia y Libertad → Reformismo 21 (2023)** and **Instituto 25 de Mayo para la
Democracia → Instituto República y Democracia (2021)**.

### Gaps, printed rather than hidden

`BOARD_GAPS` records the entities whose board could not be established, with the reason. Fundación
Ramón Rubial is the pointed one: no published patronato was found, and it is also the entity with
the most publicity breaches in the report — two agreements with companies, none of them deeded,
notified or published. Apartado Seis of disposición adicional séptima requires these entities to
publish; report 1.642 finds 16 did not publish their 2021 accounts and 14 their 2022 accounts. An
empty section would read as our omission rather than theirs.

### On the page

`components/FoundationGovernance.tsx` sits on each dossier directly under the identity block — who
runs it belongs next to what it is, not beneath the money. Each person shows their role or roles
with the source and date, then their outside roles, with corporate ties in the accent colour and
past roles labelled as past. The channel section carries a short coverage panel stating how much is
documented and pointing at the dossiers, rather than flattening forty boards into one list; its
press-count sentence renders only when the count is above zero, so a zero does not read as a
disclaimer about records that do not exist.

**Verified.** Every one of the 10 entity names in the registry joins to a dossier in
`data/foundations.json`. Typecheck clean, build clean at 221 pages, and `/es/financiacion` plus the
dossiers render with zero contrast failures.

**Deliberately not built.** No network graph and no join to the officeholder register. The register
join is attractive — it would attach an official public post to each trustee from a source the site
already ingests — but a wrong match would attribute someone else's public office to a named private
person, so it needs its own verification pass rather than being folded in here.

---

## 2026-09-08 — The foundation channel, and a title that was overclaiming

`/financiacion` was headed *"¿Quién financia a los partidos?"* and answered a much narrower
question: it showed BDNS state subsidies and nothing else, with a ranked bar chart of 28 parties as
its hero. Emma's read was right — the title overclaimed and the graphic was the least surprising
thing on the page.

**The premise behind the fix turned out to be wrong too, and correcting it is the finding.** The
brief was to document the foundations "who gave money to political parties". Checked against BOE and
the Tribunal de Cuentas: parties may take **no** corporate money at all (LO 8/2007 art. 5 — no
*personas jurídicas*, no anonymous donations, €50,000 a year per individual, and a donor holding a
live public contract must be refused), while their **foundations** fall under *disposición adicional
séptima*, where legal entities **may** donate: over €120,000 by public deed, notified to the
Tribunal within three months, donor identity published.

So the money runs *into* the foundations. And the audited figures say it is mostly not corporate
money either. Across 2021–22, of €7,936,729 in contributions:

- **€7,130,738 (89.8%) came from the parties themselves**
- €368,982 (4.6%) from companies
- €437,009 (5.5%) from individuals
- plus **€4,933,558 of public subsidies** on top

The page leads with party money for that reason. Leading with the corporate line would have been
accurate and misleading at once.

### What the report actually contains

The previous extractor read only ANEXO III and ANEXO IV and produced two numbers per entity. The
body of report nº 1.642 carries **70 per-entity dossiers**, and `scripts/extract-foundations.py` now
reads them: party link, supervising protectorate or *administración competente*, year constituted,
entry in the Registro de Partidos Políticos, contributions split by source with counts, public
subsidies **itemised by granting body**, the balance sheet, the collaboration agreements with their
named counterparties, and the Tribunal's compliance findings verbatim with the article each rests on.

`data/foundations.json` grew from 7.7 KB to 117 KB. New `app/[locale]/fundacion/[slug]/page.tsx`
gives each of the 39 entities its own dossier — 104 pages to 221.

### Three findings the old page could not show

- **The named corporate counterparties.** Fundación BBK paid Fundación Sabino Arana (PNV) €148,750
  in each year, expressly to *"promocionar la imagen corporativa del patrocinador"*, and met all
  three disclosure duties. BBK Fundazioa with **Petronor** (€25,000) and with Grupo Eibar (€30,000)
  paid Fundación Ramón Rubial (PSOE), and Fundación Cajasol paid Fundación Andalucía, Socialismo y
  Democracia (PSOE) €10,000 — **none of those three deeded, notified or published.**
- **The statutory register is nearly empty.** *Disposición adicional cuarta* of LO 6/2002 requires
  these entities to register. At 31/12/2022 only 18 foundations and 3 entities of those audited were
  registered; the extractor's own per-dossier flags independently produce exactly 18.
- **The Tribunal has asked twice.** All seven recommendations repeat those of report nº 1.533 on the
  2020 exercise, approved 28/09/2023. The three addressed to the Government are unmet because the
  LOFPP was never amended; recommendations 4 and 5, addressed to the foundations, are unmet too.

Fundación Disenso (Vox) is the single largest recipient — €2,500,900 in 2021 — and its composition
is the story in miniature: **one transfer of €2,500,000 from Vox itself**, against €900 of corporate
donations. Fundación Concordia y Libertad (PP) is the mirror image: €16,765 private against
**€1,012,408 of public money**, including €655,552 from Exteriores and, itemised in the report,
€23,102 from the Dominican Republic's HIV council and €48,201 from the Global Fund.

### Seven defects the guards caught, and two the guards were extended to catch

The extractor aborts rather than warning, and it earned that four separate times before producing a
figure:

- **A section anchor that matched only one of two wordings.** Foundations head their fifth section
  "RENDICIÓN DE LAS CUENTAS" and associations "RENDICIÓN DE CUENTAS" — 28 and 42 of the seventy.
  Requiring the longer form let the subsidies table run on into the narrative, where dates parsed as
  amounts. Caught on the first entity by the sum guard.
- **The word "Total" matching the table's own header.** The contributions header contains "Total
  aportaciones", which a bare `Total` label matches ahead of the real total row — so every total read
  as zero. Invisible until the first entity that had any money.
- **A page artefact read as a total.** Concordia y Libertad's 2022 row ends `15.235,00 69`, and "the
  last number in the row" is therefore not the total. Amounts are now told from counts by shape: a
  euro figure always carries decimals or a thousands separator, a count carries neither.
- **A copy-paste error in the source.** Asociación Juventudes Navarras's second dossier repeats the
  first one's sentence "las cuentas anuales del ejercicio 2021" while carrying 2022's figures.
  Reading the year from prose left 2022 an entity short and inflated 2021 by exactly the €9,500
  involved. The exercise now comes from the annexes, which state how many entities each year covers,
  and the split is checked against the annex `TOTALES`.
- **The last dossier swallowing the rest of the document** — conclusions, recommendations and
  annexes — so a report-wide finding appeared as one entity's own.
- **A sentence reporting the absence of a breach listed as a breach.** "No se han observado
  incumplimientos" contains the same words as a finding; listing it under *what the Tribunal found*
  inverted the report's meaning. 82 findings fell to 54 once negated statements were excluded.
- **The running page footer quoted inside findings** — "INFORME DE FISCALIZACIÓN APROBADO POR EL
  PLENO… 92" lands mid-sentence in the text layer.

### One error is the report's own, and both figures are published

Report 1.642 states Fundación Pablo Iglesias's 2022 subsidies as **€451,259.86** while its own three
lines sum to **€451,259.66**. That is the source's arithmetic, not a parse failure, so a mismatch of
up to one euro is recorded as a source discrepancy and printed on the dossier with both figures.
Anything larger still aborts, so the tolerance cannot absorb a stolen cell or a dropped row.

### The page

`components/FoundationChannel.tsx` leads with the four sources of money, then the named
counterparties with their disclosure verdict, then all 39 entities, then the register gap and the
repeated recommendations. The order of the page is now foundations → electoral spending → state
subsidies, and **the page owns its own `<h1>`**; `Dashboard` used to, which bound the title to the
least important channel. New `home.subtitle` names which channels are on the page and says that
private donations to the parties themselves are on each party's own page.

`displayName()` title-cases the report's ALL-CAPS entity names for display while the stored name
stays as the report writes it, because that is what joins a figure back to the source. It leaves
mixed-case and elided forms alone, so "Centre d`Estudis" survives.

**Verified.** Extractor: 70 dossiers, both exercises reconciling to the cent against the annex
totals. Typecheck clean, build clean at 221 pages. All three locales render the new order with a
single `h1`, every `<th>` scoped, and **zero contrast failures**; the sparse dossiers show "no
inscrita" and "no consta" as stated absences rather than blanks.

**Still to come:** the curated people-and-ties layer — who sits on these boards and what corporate
and government roles they hold. That is a separate unit and carries its own evidentiary rules.

---

## 2026-09-08 — The stopped research, finished: 18 findings, 10 refutations, and a year-stale figure

The deep-research run stopped on 2026-09-07 with 160 claims extracted and only 10 adversarial votes
cast, so `research/hate-accountability.md` had to lead with "the claims below are UNVERIFIED". It is
now finished: **26 sources, 124 claims, the top 28 each put to a three-vote adversarial panel — 18
confirmed, 10 refuted, none left unadjudicated.** The digest is rewritten around what survived, and
the refutations are printed beside the findings because three of them corrected the digest's own
earlier draft.

**How it was resumed within the rate limit.** `resumeFromRunId` caches each agent on its prompt, not
on the script's claim cap, so the cap could be raised in steps and every vote already cast replayed
free. A jump straight to 40 claims fires 120 verifier agents at once and hits the session limit,
which the harness reports as "unverified" rather than as failure — 138 of 152 agents died that way on
the first attempt. Climbing 14 → 28 in four resumes cost nothing extra and finished clean.

**The harness's own ranking had to be overridden first.** It sorts by importance then source quality,
which put ILGA rubric weightings and portal shapes in the first ten slots and never reached the
statutes that decide whether the feature is buildable. A priority tier was added ahead of that
ranking for claims naming a statute, a court, a prosecutor or a ruling.

### The finding that decides the feature, confirmed 3-0

A per-politician conviction register is not buildable from bulk retrieval, and the mechanism is now
precise rather than asserted. Publication of judgments is a CGPJ statutory duty under **art.
560.1.10ª LOPJ** — but only for resolutions *"que se determinen"*, and **Reglamento 1/2005 art. 7**
conditions treatment and dissemination on data-protection law and **LOPJ arts. 234 and 266**. Three
things follow:

- **CENDOJ pseudonymises by design**, substituting real names with randomly assigned archaic given
  names — Saturnino, Candelaria, Venancio, Eulalia — to avoid collision with real identities in
  judgments carrying up to ~500 names.
- **Coverage is selective exactly where it matters**: the Tribunal Supremo plus *"una selección
  creciente"* of single-judge resolutions, and single-judge courts are where most art. 510 CP
  convictions sit.
- **The one statutory carve-out excludes art. 510.** LOPJ art. 235 bis makes a *fallo*'s personal data
  public only for a closed list of Hacienda Pública offences (CP arts. 305, 305 bis, 306, and 257/258
  where the creditor is the Treasury). Art. 510 is not in it.

Re-identifying a defendant via case number, court and dates is recorded as a legal hazard, not a
workaround. This vindicates the decision already published on `/metodologia` and gives it citable
grounds.

### Three corrections to the digest's own draft

- **Art. 510 scope — refuted 0-3.** The draft said art. 510 protects listed minorities "but not other
  collectives such as political parties" as doctrine. Art. 510.1 CP **expressly lists *ideología***
  among the protected motives, with *aporofobia* added by LO 8/2021, and Circular 7/2019 FGE states
  group vulnerability is **not** an element of the offence and that incitement to hatred against a
  Nazi-ideology collective can fall within it. The Tribunal Supremo auto of 29 July 2021 does hold
  what it holds — it archived Vox's *querella* against Ione Belarra on that ground — but the general
  proposition fails.
- **The *peligro real* bar was backwards — refuted 0-3.** Circular 7/2019 classes art. 510 hate
  offences as ***delitos de peligro abstracto***: *"no es preciso un peligro concreto, siendo
  suficiente el peligro abstracto"*, needing only *"aptitud o idoneidad para generar un clima de
  odio"*. The exception is the result offence in the first part of art. 510.2 a). The phrase comes
  from STS 259/2011, which the Circular reads down.
- **The Herrero charge structure was a misread — refuted 1-2.** The auto pleads **510.1 a) + 510.3 +
  510.5 + 510.6, or alternatively 510.2 a) + 510.3 + 510.5 + 510.6** — mutually exclusive principal
  and subsidiary qualifications, not the joint "510.1 and 510.2" the draft published. The draft also
  dropped the subsections that drive the outcome: 510.3 (diffusion via internet or social media),
  510.5 (*inhabilitación especial*) and 510.6.

Two further refutations killed claims the draft had asserted: that CENDOJ is "the single institutional
retrieval point for named-defendant judgments" (0-3, refuted precisely because it is not a
named-defendant source, and because art. 619 LOPJ *defines* CENDOJ rather than creating it), and that
Reglamento 1/2005 art. 7 makes CENDOJ a comprehensive corpus (0-2 — universal remission is not
universal publication).

### A verifier's aside was wrong, and chasing it found the site a year stale

One agent reported the Interior series at "2,417 incidents, +23.6%", which does not chain from the
2,268 this project published for 2023. Checking it against the ministry produced a real update
instead. The *Informe sobre la evolución de los delitos e incidentes de odio en España (2024)*,
published 28 July 2025, records **1,955 penal infractions and hate incidents, −13.8%**; racism and
xenophobia **804 (−6%)**; sexual orientation and gender identity **528 (+1.15%)**. Antisemitism
+60.9%, aporofobia +33.3%, clearance 71.9%, 905 people arrested or investigated.

Every figure reconciles against the 2023 base — 2,268 × 0.862 = 1,955; 856 × 0.94 = 804; 522 × 1.0115
= 528 — and OBERAXE, a second ministry, publishes the same numbers, which is why the update is here at
all rather than flagged as a lead.

So the 2023 figures were right and the page was a year behind **while pointing the wrong way**: it
showed a 21.35% rise as the state's latest word when the latest word is a 13.8% fall.
`lib/hate-context.ts` now carries 2024 with 2023 kept beside it and the reconciliation written down.

**A latent bug surfaced with it.** `/metodologia` hardcoded a `+` before the year-on-year change, so
the first negative figure would have rendered "+−13,8 %". New `signedPercent()` in `lib/format.ts`
prefixes `+` only for positives and lets the locale supply its own minus sign, which is not always an
ASCII hyphen.

### Figures recovered, and one previously given up on

The three Fiscalía figures the earlier draft dropped as unverifiable are confirmed 3-0, with the panel
checking the arithmetic: for 2024, **477** *diligencias de investigación* (511 in 2023), **293**
*escritos de acusación* (210 in 2023), **173** sentences with **129 convictions and 44 acquittals**,
most prosecuted offence **art. 510.2 a) at 162 vs 85**.

`chargesChangePct: 40` is replaced by a derived `CHARGES_CHANGE_PCT` computed from 293 and 210, so the
published percentage cannot drift from its own counts: **+39.5%**, not the "~40%" of press summaries.
`CONVICTION_RATE_PCT` likewise derives 74.6% where the Memoria prints a truncated 74.5%.

The verifiers flagged a trap now recorded in the code: the motive breakdown differs by stage —
racism/xenophobia is 150 among investigations but 121 among charge sheets, and *nación u origen
nacional* is tracked separately at 127 — so the two sets must never be conflated.

### Corrected on the page: "acquittal"

`MENAS_CASE`'s doc comment described the outcome as an acquittal. Both decisions are autos confirming
*sobreseimiento* at the instruction stage — a finding of no *indicios* — and never merits judgments,
so "acquitted" overstates what any court decided. Fixed, with the distinction written down. Also added
what actually closed the case: the **Tribunal Constitucional declined Podemos's *amparo*** for want of
*especial trascendencia constitucional*, reported 23 January 2023.

### Verified outside the harness

**Art. 10 LOPDGDD** is load-bearing for the published methodology text and the harness never
adjudicated it — its only source was rated unreliable and yielded no claims. Checked directly against
the BOE consolidated text of LO 3/2018 (last modified 27/12/2025), the page's claim holds, and the
chain is three paragraphs: **10.1** permits processing conviction data for non-law-enforcement
purposes only where covered by a norm of statutory rank; **10.2** routes the *registro completo*
through the *Sistema de registros administrativos de apoyo a la Administración de Justicia*; **10.3**
allows it outside those cases **only for *abogados* and *procuradores***, and only for information
supplied by their own clients.

### Left as gaps rather than filled

- **Angle 1 produced no surviving claim.** The harness's own synthesis says to treat party-spending
  granularity as *not researched* rather than answered negatively. It was answered in code instead, by
  the report 1.628 extraction shipped the day before — which is also where the digest's claim about
  the eight LOREG art. 130 categories was corrected.
- **STC 58/2018 was in the claim pool but below the cap**, so it remains a lead. The methodology page
  cites it; the digest says so and says to verify it against the primary ruling.
- **The *menas* auto's roll number is still unpinned** and all its verification is secondary press, so
  the digest records that the primary text must be pulled before the case reference itself is
  published. An earlier AP Madrid resolution on the same matter is reported, so more than one auto may
  exist.
- **JEZ acuerdos are published in no machine-readable register**, so secondary reporting is the
  practical ceiling for the most promising name-bearing channel found.

### Also recorded

`research/README.md` explains how to read a vote, and that a refuted claim was adjudicated against on
its merits — which is different from one never adjudicated. `_research-hate-accountability-claims.json`
now carries the findings, caveats and open questions alongside the claims and all 101 votes, with a
note that its claim list is the union across resume attempts while `stats` describes the final run.

Verified: typecheck clean, production build clean, and `/metodologia` renders the negative change
correctly in all three locales — `1955 · -13,8 %` (es), `1,955 · -13.8 %` (en), `1.955 · -13,8 %` (ca),
the grouping difference being CLDR's `minimumGroupingDigits` and not a defect.

---

## 2026-09-07 — What the electoral money was declared to have bought

The site could show which parties received public money and never what it purchased. This is the
first answer, and part of the answer is that the record does not say.

**New `scripts/extract-electoral-spending.py`** extracts Tribunal de Cuentas report nº 1.628 — the
fiscalización of the 9 June 2024 European Parliament election accounts, approved 26/06/2025 — into
`data/electoral-spending.json`, rendered by `components/ElectoralSpending.tsx` on `/financiacion`.
`npm run build:spending -- path/to/I1628.pdf`.

**Across the eight formations audited: €18,433,012.62 of declared ordinary spending.** €6,808,676.26
of it (36.9%) is the two advertising categories the law caps — outdoor under LOREG art. 55 and press
and radio under art. 58. **€10,052,187.82 (54.5%) is a single residual line, "Otros gastos
ordinarios", which the report does not break down.** Propaganda mailings are accounted separately at
€19,307,864.75 across 30.9 million items. No formation exceeded a spending cap.

Per formation the residual runs from 0% for Coalición por una Europa Solidaria, whose entire declared
spend is the two advertising lines, to 87.0% for Sumar, with PP at 47.5% and PSOE at 58.8%.

**This corrects the research digest.** It recorded the eight lettered categories of LOREG art. 130 as
the itemisation to expect. Those are the legal definition of *gasto electoral*, but the fiscalización
reports against something else: the two advertising caps, mailings, financial costs, and the
residual. `research/hate-accountability.md` §1 should be read with that correction.

**Verification is the report's own arithmetic, and it earned its keep.** The report prints
`F = A + B - C - D + E` for ordinary spending and `D = A + B - C` for mailings; both are recomputed
per formation and the script aborts on a mismatch over one cent. A third check requires the five
itemised sub-lines to sum **exactly** to the declared total, which they do for all eight.

Five defects were caught by those guards rather than by reading the output, and every one of them
would have put wrong figures on the page:

- **A typo in the source document.** Report 1.628 prints Podemos's ordinary total as
  `1.331.207.90` — a period where the decimal comma belongs. The report's own arithmetic gives
  1,331,207.90. `money()` reinterprets that shape deterministically rather than by guessing: in this
  format every thousands group after the first is exactly three digits, so a final group of exactly
  two digits cannot be one.
- **A blank cell stealing its neighbour's value.** Podemos's empty "B) Gastos reclasificados netos"
  let a look-ahead scan run into "C) Gastos no subvencionables" and read its 3.267,00. Fixed by
  splitting the table into rows before reading any figure.
- **Four formations silently skipped.** The heading matcher already excluded the dotted
  table-of-contents entries, but the code then also took the later half of the matches to drop TOC
  duplicates that were never in the list. The four that survived verified cleanly, so nothing looked
  wrong. Each heading is now confirmed by the subsection that must follow it.
- **Tables in a different order.** Podemos prints "2. RECURSOS DECLARADOS" *after* its expenditure
  table, so slicing between two fixed heading texts returned an empty resources table and let the
  expenditure slice run on into the next one, where "Total recursos" was read as the expenditure
  total. Sections are now split on their numbering, which is order-independent.
- **A guard that passed an empty parse.** All-zero figures satisfy `A+B-C-D+E = F` trivially, and for
  one run the script reported eight empty formations as verified. The guard now requires a declared
  total to be present, and requires the sub-lines to equal it exactly rather than merely not exceed
  it — which is what finally caught a label that had stopped matching the report's "- " bullet.

**Left out rather than shipped wrong.** The limits table's rows carry no lettered marker or bullet,
so the row splitter does not divide them and every cap amount read as zero. Publishing zeros that
look like real caps would be worse than omitting them, so only the SÍ/NO exceedance verdicts are
extracted — those are read from the raw text and are correct.

**Also recorded in `AGENTS.md`:** the TdC report URL's year segment is the **approval** year, not the
year covered — report 1.628 audits a June 2024 election and lives under `/2025/`. And a wrong URL
does not 404; it redirects to the site-wide search, whose HTML lists PDF links including the
`resumen/NR_I<number>.pdf` summary. That is how this report was found.

**Verified.** All three locales render the section with per-locale number formatting, eight rows, a
caption, every `<th>` scoped and zero contrast failures. Typecheck clean, production build clean at
104 pages.

**Framing unchanged.** These are declared and audited figures next to the subsidies that funded them.
Nothing is imputed to anyone, and the panel says so.

---

## 2026-09-07 — What the official record says, and what no authority has found

The first thing from the stopped research to reach the site, and the reason it is a small thing: of
roughly 160 extracted claims only 10 had been adversarially verified, so every figure published here
was checked against an official source first, and everything that failed to check stayed out.

**New `lib/hate-context.ts`** holds two separate things, and the page keeps them separate: aggregate
hate-crime statistics from the state's own bodies, and the record of what happened when campaign
material was actually taken to court. Neither is presented as explaining the other, and nothing in it
attributes anything to a named person.

**Verified and published.** Police-recorded hate crimes and incidents: **2,268 in 2023, +21.35%** on
the previous year, of which **856** racism or xenophobia and **522** sexual orientation or gender
identity — Ministerio del Interior / Oficina Nacional contra los Delitos de Odio. Prosecution output:
**129 convictions of 173 sentences (74.6%)** and **121** charge sheets citing racism or xenophobia,
with charges up about **40%** year on year — Fiscalía General del Estado, cross-checked against
OBERAXE's official summary of the same Memoria.

**Two corrections to my own extraction, caught by verifying.** The digest recorded 1,869 recorded
incidents for 2022; the current report supersedes that with 2,268 for 2023, and 2,268 ÷ 1.2135 ≈ 1,869
confirms the old base while retiring it as the headline. And the appellate decision in the *menas*
case is dated **19 July 2021**, which the digest had left as "on appeal".

**Left out for failing verification.** The 477 preprocedural investigations, the 293 total charge
sheets, and the ~40% share of investigations concerning online conduct all appear in the extraction
but could not be confirmed against a primary or official-secondary source in this pass. They stay in
`research/hate-accountability.md` as leads.

**The negative finding, stated as prominently as any figure.** No Spanish authority has ever ruled
that a party's campaign spending constituted a hate crime. The electoral board ordered a Vox banner
in Madrid taken down under **Article 53 LOREG** — propaganda outside the campaign period — and
expressly declined to rule on its content. The one known criminal attempt, over the *menas* poster
for the 2021 Madrid Assembly election, was dismissed by Juzgado de Instrucción nº 53 de Madrid on
29 April 2021 and the archiving was confirmed by Sección Segunda of the Audiencia Provincial de
Madrid on 19 July 2021, framed as *legítima lucha ideológica* within an election. The dismissal had
been appealed by the Fiscalía, PSOE, Podemos, Izquierda Unida, the Unidas Podemos coalition and the
Progresa association.

That outcome is on the page **because** it was negative. A record that lists the accusation and not
the acquittal is not a transparency tool, and this is the answer to the question the site invites.

**And the page now says why it tags nobody.** Article 10 LOPDGDD reserves criminal-conviction data to
public authorities, CENDOJ dissociates personal data before disseminating judgments, and STC 58/2018
treats retrievability of a person by name as the decisive harm for a public figure. Official
aggregates and specific proceedings with their outcome are published; inferences are not.

**Verified.** All three locales render the section with the right figures — `2.268` / `2,268` per
locale formatting, `129 / 173`, four source links, no untranslated string leaking through. Zero
contrast failures on `/es`, `/en` and `/ca` methodology pages, every `<th>` scoped, every table
captioned. Typecheck clean, production build clean at 104 pages.

**Also recorded, from a `caveman learn` run.** `Bash(cd)` was the heaviest tool shape in the scanned
window — 35.8% of 1,082,573 tool-output tokens over 1,388 calls — but broken down by verb the volume
is diffuse rather than one habit. The two notes that came out of it are in `AGENTS.md`, deliberately
not in `CLAUDE.md`, since a rule there is injected every turn and the saving is unproven.

---

## 2026-09-07 — The dashboard renders without JavaScript (D3b)

D3b was recorded as open earlier the same day, on the strength of the `<h1>` starting at opacity 0 in
both motion modes. Counting the prerendered HTML rather than reasoning about it made it worse:
`/financiacion` shipped **32 elements at `opacity: 0`** — four masthead elements and all 28 party
rows — **plus every bar at `width: 0px`**. Without JavaScript the page was not a blank hero. It was a
blank page.

**The entrances moved from JS to CSS.** `globals.css` gains `.enter` (`@keyframes enter-rise`) and
`.enter-bar` (`@keyframes enter-grow`), each taking its delay from a `--enter-delay` custom property
so the stagger stays a presentational detail rather than a prop threaded through components. A CSS
animation runs without JavaScript and starts from a state the HTML already carries.

Two details carry the fix:

- **Bars grow by `transform: scaleX()` rather than by animating `width`.** The real width stays inline
  in the HTML, so a bar is the correct size with no JS, and a `transition: width` covers the other
  case — a filter change moving the bar without replaying the entrance.
- **`motion.li` stays, with `initial={false}`.** The row renders visible on the server while `layout`
  still animates reordering when a filter changes; the entrance sits on the inner `<Link>`.

The reduced-motion block needed one more line, `animation-delay: 0s !important`. Neutralising only
`animation-duration` would have left a reader who asked for less motion waiting out the stagger while
the element held its `from` state — the same defect in a new place.

**Verified in three states.** With **JavaScript disabled**: headline opacity 1 with its text present,
28 of 28 party rows visible, 40 of 53 bars sized (the remainder are sub-pixel segments). Under
`reduce`, 150 ms after `domcontentloaded`: opacity 1 already. Under `no-preference`, sampled every
110 ms: 0.057 → 0.762 → 0.99 → 1, so the entrance still plays for everyone else. The prerendered HTML
now contains zero `opacity: 0` and zero `width: 0px` declarations.

`motion` is left carrying only what needs it: `layout` reordering, the two client-fetched feeds, and
`CountUp`. `lib/motion.ts` keeps `useEntrance()` for those and exports `stagger()`, which the CSS
delays are computed from, so both paths share one cap.

**Noted, not fixed:** the only console error on the page is a 404 for `/favicon.ico`, which predates
this work and is unrelated to it.

Typecheck clean, production build clean at 104 pages, shared First Load JS unchanged at 103 kB.

---

## 2026-09-07 — Reduced motion honoured (D3), a new finding beside it (D3b), and the research saved

**D3 — reduced motion.** `globals.css` declared a `prefers-reduced-motion` block that disabled
`scroll-behavior` and nothing else, so every fade-and-rise entrance still played for a reader who had
asked their operating system for less motion. Four components animated with `motion` and none
consulted `useReducedMotion()`.

New `lib/motion.ts` holds a shared `useEntrance()` hook that builds each entrance's
`initial` / `animate` / `transition` in one place, collapsing to the final state with a zero duration
under reduced motion. All four components use it: `Dashboard` for the masthead, party rows and bars,
plus `NewsFeed`, `BlueskyFeed`, and `CountUp`, which skips its count-up and simply shows the figure.
The skeleton `animate-pulse` classes drop under the same flag, and the CSS block now neutralises
`animation-duration` and `transition-duration` globally rather than only the smooth scroll.

The stagger is capped: `stagger(index)` is `min(index × 0.035, 0.4)`. The party bars had used an
uncapped `i * 0.03`, so with 28 rows the last bar started 0.81 s in and finished past 1.7 s.

**Verified by emulating the media query** rather than by reading the code, sampling `<h1>` opacity
every 120 ms from `domcontentloaded`. Under `no-preference` the samples run 0, 0, 0, 0, 0.415, 0.866
— a ramp. Under `reduce` they run 0, 0, 0, 0, 1, 1 — straight to final. Computed
`transition-duration` on a control drops from `0s` to `1e-05s`, confirming the CSS block applies.
Both modes settle with the headline visible and all 81 bars at non-zero width.

**D3b — a separate defect the audit had folded into D3, now recorded as its own open finding.** The
four leading zeros in *both* rows above are not the entrance. `motion` serialises
`initial={{ opacity: 0 }}` into the server-rendered HTML, and `useReducedMotion()` returns false on
the server because there is no `matchMedia` there — so the masthead ships as `opacity: 0` and becomes
visible only when React hydrates, whatever the reader's motion preference, and permanently if
JavaScript never runs. This is what the original audit caught as the `<h1>` at `opacity: 0.058`, and
the hook cannot fix it, because the decision happens before the client knows anything. Two candidate
fixes are recorded in `PLAN-VISUAL.md`; neither is applied.

Stating this rather than closing D3 outright: the reduced-motion half is fixed and measured, the
pre-hydration half is not.

**Research saved before it was lost.** The deep-research run into party spending and hate-conduct
records was stopped to protect context. Its cached output is now committed under `research/` rather
than left in a session directory: the workflow journal, the 160 extracted claims with their 10
adversarial verification votes, and a written digest in `research/hate-accountability.md`.

**The digest leads with its own status, because only 10 of ~160 claims were verified.** Everything in
it is a lead to check, not a finding to publish. What it establishes well enough to design against:

- LOREG art. 130 does itemise electoral spending into eight closed categories, mailings separate from
  publicity — but digital advertising is not separately identifiable, and the Tribunal de Cuentas has
  itself recommended legislating to make it a distinct capped category.
- Nothing is machine-readable. TdC reports, the `cuentaspartidospoliticos.es` Observatorio,
  Infoelectoral subsidies and the Interior hate-crime series are all PDF or on-page tables.
- **No Spanish authority has ruled that a party's campaign spending constituted hate speech.** The
  Junta Electoral ordered a Vox banner down on Article 53 LOREG timing grounds and *expressly declined
  competence* over its content; the one criminal attempt, over the *menas* poster, was archived on
  appeal by the Audiencia Provincial de Madrid with the Fiscalía among the appellants.
- A per-politician conviction tag is largely foreclosed: art. 10 LOPDGDD reserves criminal-conviction
  data to public authorities with *abogados* and *procuradores* the only private exception, CENDOJ
  requires dissociation of personal data before dissemination, and STC 58/2018 makes
  retrievability-by-name the decisive harm for a public figure.

The digest ends with resume instructions and the gotcha that cost a run: `resumeFromRunId` replays
the script but does not carry `args`, so resuming without re-passing the question exits in 9 ms with
*"No research question provided"*. `NEXT-STEPS.md` gains item 6 with the stop conditions.

**Deliberately not done.** No spending extractor was built, no politician was tagged, and the
reframing stands: the research was pointed at records that already exist and are attributable rather
than at a classifier that infers intent.

Typecheck clean, production build clean at 104 pages.

---

## 2026-09-04 — Last two audit items closed (N2, P4), and caveman mode written into the rules

**N2 — the dangling IDREF I introduced.** The O2 fix put `aria-controls="mobile-nav"` on the menu
button, but the panel was conditionally rendered, so the reference pointed at nothing whenever the
menu was closed — which is most of the time, on every route. The panel is always mounted now and its
display is switched by class instead.

Using the `hidden` *attribute* would have been the obvious move and it would have been wrong:
`[hidden] { display: none }` sits in Tailwind's base layer and loses to the `flex` utility, so the
panel would have stayed visible when closed. That is the same layer-order trap as D1, three fixes
later, which is why the reason is written into the component.

**P4 — avatar initials.** The initials were set in the party's brand colour on `--ink-3`, putting
three parties under 4.5 : 1 (`#8b5cc4` 3.61, `#d64545` 3.92, `#c7527f` 4.04). Lightening those
colours was never an option — they are the parties' own identities — so the colour moved off the
text: initials are `--paper` at **13.33 : 1**, and the party colour now carries the tile through its
ring and a tinted gradient field. Identity preserved, contrast fixed, no party's colour altered.

The gradient's lightest possible stop was checked rather than assumed: the brightest party colour at
15% over `--ink-3` still gives `--paper` **9.46 : 1**.

**Every item in the WCAG audit is now resolved** — P1, P2, P3, P4, O1, O2, O3, R1, R2, R3, N1 and N2.

**Verified.** Zero contrast failures and zero dangling `aria-controls` across `/es`, `/es/politicos`,
`/es/politico/[slug]`, `/es/financiacion`, `/es/votaciones`, `/es/metodologia`, `/en/politicos` and
`/ca/politicos`. The menu panel reports `display: none` with `aria-expanded="false"` when closed and
`display: flex` with six visible links when open. Typecheck clean, production build clean at 104
pages.

**Caveman mode is now a written rule, not a per-session request.** Emma asked for it to be enforced
always. Added `CLAUDE.md` at the repo root and `~/.claude/CLAUDE.md` for every other repo, both
stating level `full` from the first reply, the compression rules, the auto-clarity exceptions
(security warnings, irreversible-action confirmations, order-sensitive sequences), and the boundary
that matters here: **compression is a chat style only**. Everything persisted outside the chat — code,
comments, commit messages, this changelog, `AGENTS.md`, the `PLAN-*.md` documents, PR and issue
bodies — stays in normal prose. The project memory note was rewritten from a per-session preference
into that standing rule.

Worth recording because it cost time twice this session: the `caveman` CLI **is** installed, at
`%APPDATA%\npm\caveman.cmd` with a proxy at `~/.caveman/bin/caveman-proxy.exe`, and the plugin's
hooks in `~/.claude/settings.json` inject the mode on `SessionStart` and every `UserPromptSubmit`.
Two earlier probes reported it missing because `%APPDATA%\npm` is not on the PATH the tool shells
inherit — check the hook config and that directory directly before concluding it is absent.

---

## 2026-09-01 — Skip link, and every control at 44 px (O1, O3)

**O1 — a skip link.** The sidebar repeats six navigation links before the content on every page, so a
keyboard or screen-reader user had to pass all of them each time. Every route now opens with a skip
link that moves focus to the content wrapper, which carries `id="main"` and `tabIndex={-1}` so focus
actually lands there rather than only the scroll position moving. Present and verified on all seven
route/locale combinations checked.

**How it is built, and what was tried first.** The obvious `sr-only` + `focus:not-sr-only` pair was
written first and **left the link 2 px tall when focused** — `sr-only`'s `height: 1px` and `clip`
survived the reset, which the geometry check caught. It is positioned absolutely and translated out
of view instead: the element keeps its real 44 px size at all times, stays focusable and in the
accessibility tree, and slides in on focus. Deterministic, and it does not depend on one utility
undoing another cleanly.

**O3 — target sizes.** Raised to a 44 px minimum: the Dashboard kind and year chips, the reset button,
the party facet chips, both search fields and their submit buttons, the sidebar navigation links, the
locale toggles, the mobile wordmark, and the directory's previous/next pager. Where a control was
`px-3 py-1.5`, the vertical padding was replaced with `inline-flex min-h-11 items-center` so the
height applies to an inline element and the label stays centred.

**Inline text links are deliberately left alone.** Both 2.5.5 and 2.5.8 exempt a target whose size is
constrained by the line of text it sits in, and padding out a link inside a sentence or a table cell
would break the prose around it. The verification therefore separates the two: it reports standalone
controls under 44 px as offenders and counts inline ones as exempt.

**Verified.** Zero standalone controls under 44 px across `/es`, `/es/financiacion`, `/es/politicos`,
`/es/votaciones`, `/es/metodologia`, `/en` and `/ca` at 375 px wide, plus `/es/politicos?page=2` and
`/en/politicos` for the pager specifically. The skip link measures 44 px and sits off-screen at
`top: -44` until focused on every route; activating it sets `#main` and moves `document.activeElement`
to that wrapper. Typecheck clean, production build clean at 104 pages.

**A verification limitation.** `:focus` styles could not be exercised: `document.hasFocus()` is false
because the Browser pane cannot hold focus, which is the same condition that stopped key events
earlier in the session. The slide-in is therefore evidenced by the rule existing in the compiled CSS
(`.focus\:translate-y-0:focus`), by the element's measured 44 px size and `top: -44` resting position,
and by activation moving focus to `#main` — not by observing the transition.

Still open in `PLAN-VISUAL.md` §2b: N2 (the dangling `aria-controls` introduced by the O2 fix) and P4
(avatar initials in party brand colours, a design decision).

---

## 2026-09-01 — Parliamentary groups are named, and link to the right party's money (N1, R3)

A reader pointed out that the group labels on `/votaciones` were unreadable — `GS`, `GCUP-EC-GC`,
`GPlu` with nothing saying which parties those are — and asked for a link to each group's financing.
The re-audit had reached the same place from the accessibility side (N1, 1.3.1): the rows announced
as “GS 116/0/1”, and what the three numbers meant was carried only by the colour of bars sitting in a
different widget higher up the page.

**New `lib/groups.ts`.** A per-legislature registry of the 13 group codes across Leg XIV and XV, each
with the group's name in full, a short label, and either the NIF of the one party it belongs to or the
list of parties observed in it.

**The single-party classification is evidence-based, not assumed.** Joining every deputy in
`data/votes.json` to the officeholder register by folded name gives, per group, the distribution of
party labels among the deputies that match. A group is only marked single-party where every matched
deputy carries the same party: GP 57/57 then 89/89 PP; GS 55 PSOE plus 2 unlabelled, then 73/73;
GVOX 26 Vox plus 2 unlabelled, then 26/26; GR 4/4 then 5/5 ERC; GEH Bildu 4/4 then 5/5; GV (EAJ-PNV)
3/3 twice; GJxCAT 6/6 Junts. The same join settled the composites: GCUP-EC-GC returned Sumar 6 and
Podemos 4, GPlu returned Junts 3, CM 1, BNG 1, and GMx returned PP 2, CC 1, Teruel Existe 1 in XIV
and Podemos 4, UPN 1, BNG 1, CC 1 in XV.

**Two entries are deliberately not decided by that join**, and the file says so. GSUMAR's matched
deputies all carry the register label “Sumar”, but that is a coalition's label and the group's own
name is “Plurinacional SUMAR” — linking it to the Movimiento Sumar NIF would attribute a coalition's
votes to one component, so it is composite. GCs matches no register rows at all, the party having
dissolved; it is marked single-party on the strength of the group's name being the party's name, with
that absence of evidence recorded.

**Why the link is missing on some rows, on purpose.** A parliamentary group is not a party. Pointing a
coalition group at one party's funding page would misattribute the other parties' money, so composite
rows link to nothing and instead name the parties in them. The table states this in prose beneath it,
in all three languages, and links the Congreso's own composition page.

**`components/GroupBreakdown.tsx`** replaces the hand-rolled bar list. It is a real table: a caption,
`scope="col"` headers, the group as a `scope="row"` header, Sí / No / abstención each in their own
labelled column, the party's colour as a rule down the left, the official group name and the raw
Congreso code both kept visible so a row can still be matched against the official record, and the
bar reduced to `aria-hidden` decoration that repeats what the numbers already say. The portal's
`StanceByGroup` cards now read “PSOE · Unidas Podemos · ERC · Plural · Mixto” in place of the codes.

**R3 closed while in the area.** Every table on the site now has a `<caption>` and scoped headers:
`/votaciones` 138 `<th>` across 9 tables, `/financiacion` 42, `/metodologia` 18, none unscoped, no
table without a caption, checked in all three locales. The two older tables took a visually-hidden
caption, because the heading above each already says the same thing on screen while the table still
needs its own accessible name.

**Three things wrong in the first draft, fixed before committing.** A code comment claimed the raw
group code stayed visible when the markup had dropped it — the code is rendered now, as the comment
said. The caption repeated the `<h3>` above it word for word, so it now says something the heading
does not. And both the caption and the note below the table were set in `label-mono`, which
uppercases — a two-sentence paragraph in capitals, the third time that class has caused this, so both
are plain text now.

**Verified.** All 8 funding links resolve 200 (`/es/party/G28477727` and the rest). Zero contrast
failures across `/es`, `/es/votaciones`, `/es/financiacion`, `/es/metodologia`, `/en/votaciones` and
`/ca/votaciones`. Typecheck clean, production build clean at 104 pages.

**Left alone.** No change to the art direction — the audit's judgement was that it is settled and
working, so this executes the existing dossier language rather than introducing another. Still open:
O1 (skip link), O3 (chip target sizes), N2 (the dangling `aria-controls` from the O2 fix), P4 (avatar
initials in party brand colours).

---

## 2026-09-01 — WCAG re-audit after the six fixes (no code shipped)

Re-ran the audit against the running app now that P1, P2, P3, R1, R2 and O2 are in. The fixed items
hold. Two new findings, and five criteria that had been listed as untested now tested and passing.
Recorded in `PLAN-VISUAL.md` §2b; nothing was changed in the app.

**N1 — the per-group rows on `/votaciones` announce as “GS 116/0/1”.** That section has no column
headers and no legend, so what the three numbers mean is carried only by the colour of the bars — and
those bars sit in a different widget higher up the page. The group codes are never expanded either,
so a reader sees `GS`, `GCUP-EC-GC`, `GPlu` with nothing telling them which parties those are. This
is 1.3.1, and it is the same problem a reader raised independently about the group labels being
unreadable. Fix: label the three columns, expand the codes to readable names, keep the numeric
triplet as the non-colour carrier.

**N2 — a dangling IDREF I introduced.** The O2 fix added `aria-controls="mobile-nav"` to the menu
button, but that panel only exists while the menu is open, so the reference points at nothing in the
closed state on all five routes. Either render the panel always and toggle `hidden`, or drop the
attribute — `aria-expanded` alone is sufficient for a disclosure.

**Newly tested, all passing.** 1.4.4 resize text to 200%; 1.4.12 text spacing with line-height 1.5,
letter-spacing 0.12em, word-spacing 0.16em and 2em paragraph spacing forced; 2.4.3 focus order in the
opened mobile menu (trigger is focusable #1, panel #2–#10, focus lands on #2, tabbing past it
continues into page content); and 1.4.1 on the vote bars — the counts are present as text, so the
information is not colour-only, only unlabelled. Also confirmed the mobile menu is a non-modal
disclosure that pushes content rather than overlaying it, and correctly has no focus trap.

**A false positive caught, and why.** The first portal run of the text-spacing test reported
horizontal overflow. It was an artifact: the Browser pane had collapsed, `clientWidth` read 0, and
every element therefore “overflowed”. Re-run with an explicit 1280 px viewport it passes. The audit
notes now say to assert a sane viewport width before trusting any overflow result — a measurement bug
reported as a defect would have sent someone chasing nothing.

**Confirmed still open**, unchanged: O1 (no skip link, checked on all five routes), O3 (chip target
sizes — the menu button is now 44 px), R3 (7 `<th>` across two tables with no `scope`, neither table
with a `<caption>`), P4 (avatar initials in party brand colours).

---

## 2026-09-01 — Stateful controls: pressed state, a status region, and Escape (R1, R2, O2)

Three audit items, all sitting on the site’s only stateful controls.

**R1 — pressed state.** The eight Dashboard filter chips on `/financiacion` (kind and year) now carry
`aria-pressed`, so the selected filter is available programmatically. Together with the P1 contrast
fix that state is now conveyed both ways; before that pair it was conveyed neither way. The party
facets on `/politicos` are links rather than toggles, so they take `aria-current="page"` instead — a
link cannot be “pressed”, and `aria-pressed` there would have been the wrong role.

**R2 — a status region.** `/financiacion` now carries a `role="status"` line reading, for example,
“28 partidos · 232 concesiones · 300,6 M € con los filtros actuales”, in all three languages.

**A correction to the original finding.** It said the result set is replaced with no announcement on
`/es/financiacion` *and* `/es/politicos`. Only the first is true. The searches on `/politicos` and
`/votaciones` are form GETs that navigate, and a change of context is announced by the browser — it
is not a status message, and 4.1.3 does not apply. Only the Dashboard mutates its list in place, so
only the Dashboard needed a region.

**O2 — Escape and focus.** Escape now closes the mobile menu and returns focus to the button that
opened it; opening moves focus into the panel so the next Tab continues inside it; the button gained
`aria-controls="mobile-nav"`. Its height also went from 31 px to 44 px, which is part of O3.

**One error worth recording.** The status string was first written as a function on the `home`
dictionary. `home` is passed as a prop from a server component into `<Dashboard>`, which is a client
component, so the page died with *“Functions cannot be passed directly to Client Components”* — the
same trap this project hit once before with a formatter prop. It is a template string with
`{parties}` / `{grants}` / `{total}` placeholders now, interpolated on the client, matching the
existing `CountUp as="euro"` pattern.

**Verified.** The eight chips report `aria-pressed` and toggle correctly (`Gastos de seguridad=true`
after a click, `Todas=false`). The status line changed from “28 partidos · 232 concesiones ·
300,6 M €” to “25 partidos · 108 concesiones · 14,7 M €” on that click. The menu button measures
44 px, exposes `aria-controls`, moves focus into the panel on open, and closes on Escape with focus
returning to the trigger.

**A limitation, stated rather than glossed.** Real key events stopped reaching the page partway
through this session — the Browser pane reports itself hidden, and a listener recording every
`keydown` saw neither Escape nor a letter key. O2 is therefore verified by code and by dispatching a
`KeyboardEvent` on `document`, which exercises the exact listener registered. The original finding
never depended on that plumbing: `components/Sidebar.tsx` had no key handler at all.

Still open in `PLAN-VISUAL.md` §2b: O1 (no skip link), O3 (remaining chip target sizes), R3 (table
`scope`/`caption`), P4 (avatar initials in party brand colours — a design decision).

Typecheck clean, production build clean at 104 pages.

---

## 2026-09-01 — Interactive control boundaries now meet non-text contrast (P3)

`--line-strong` was carrying two different jobs: the visible boundary of interactive controls, and
decorative rules and card hover states. At `rgba(236, 226, 205, 0.22)` it measured **1.77 : 1** over
`--ink`, below the 3 : 1 that WCAG 1.4.11 requires for the visual information needed to identify a UI
component — and a filter chip has no boundary other than its border.

Raising `--line-strong` wholesale would also have thickened panel edges and card hovers, which are
not UI boundaries and are exempt. So the fix splits the token: **`--line-control`** at
`rgba(236, 226, 205, 0.4)`, **3.22 : 1**, now carries the filter and year chips on `/financiacion`,
the party facet chips and search field on `/politicos`, the search field on `/votaciones`, and the
mobile menu button. `--line` and `--line-strong` keep the decorative work unchanged.

**Verified in the browser across the three filtered routes.** Every interactive control now measures
≥ 3 : 1 — worst case 3.22, active states at 8.30 on their gold border, and all 21 party facet chips
on `/politicos` confirmed individually. Two things were checked rather than assumed and turned out
fine: the `opacity-60` count inside each facet chip composites to **5.86 : 1**, and the ES/EN/CA
locale toggles have no border at all, so they are text-labelled controls with no boundary to fail.

**Deliberately unchanged.** The `.panel` card borders on the portal, party, profile and Bluesky cards
measure 1.30 : 1 and stay that way: each card is identified by its own heading text, so its edge is
decoration rather than the information needed to identify the control. The same reasoning leaves the
vote card border on `/votaciones` alone.

Still open from `PLAN-VISUAL.md` §2b: O1 (no skip link), O2 (Escape does not close the mobile menu),
O3 (target size), R1 (no `aria-pressed` on filter chips), R2 (no live regions), R3 (table semantics),
P4 (avatar initials in party brand colours, a design decision).

Typecheck clean, production build clean at 104 pages.

---

## 2026-09-01 — Fixed the two critical contrast defects (P1, P2)

Two WCAG 1.4.3 failures from the audit, fixed together because they were entangled.

**P1 — the cascade defect.** `.label-mono` set `color: var(--paper-dim)` from an unlayered rule.
Tailwind v4 emits utilities inside `@layer utilities`, and **unlayered styles beat every cascade
layer regardless of specificity**, so the class won against any `text-[var(--…)]` written beside it.
62 call sites silently rendered `--paper-dim`. The visible casualty was the active filter chip on
`/financiacion` and `/votaciones`, which asks for `--ink` on `--gold` and rendered **1.14 : 1** — the
control telling the reader which filter is selected was the least readable text on the page.

The audit's first diagnosis was wrong and is corrected in `PLAN-VISUAL.md`: it said "same
specificity, defined later" and proposed `:where(.label-mono)`. Applying that changed nothing, and
measuring it is what showed why — `:where()` drops specificity to zero but does not touch layer
order. The fix that works is moving `.label-mono` and `.eyebrow` into `@layer base`, which loses to
`utilities` by layer order.

**P2 — the failing token.** `--paper-faint` was `#6f6857`, **3.48 : 1** on `--ink`, below the 4.5 : 1
that normal text needs, and used at `text-xs` and `text-sm`. It is now `#8a8270`, **5.06 : 1**, in
the same warm-grey family. This had to ship with P1: fixing the cascade alone would have newly
exposed the 43 elements that were accidentally being rescued by it.

**Verified in the browser, not assumed.** The active chip now measures **8.30 : 1** (`rgb(16,14,10)`
on gold); a probe with `label-mono text-[var(--ink)]` computes `rgb(16,14,10)`; a probe with
`label-mono text-[var(--paper-faint)]` computes `#8a8270` at 5.06 : 1. A sweep then walked every
visible text-bearing element on nine route/locale combinations, composited each against its real
background, and applied the large-text threshold by measured size and weight. **Eight of the nine
routes now report zero contrast failures.**

**One new finding, from that sweep.** `/es/politicos` reports four. The avatar initials use the
party's brand colour as text on `--ink-3`, and three party colours fall under 4.5 : 1 at 16.3 px:
`#8b5cc4` (3.61), `#d64545` (3.92), `#c7527f` (4.04). Recorded as P4 and **not fixed**: the initials
are `aria-hidden` and sit beside the person's name, so treating them as incidental decoration is
defensible, and the honest fixes — initials in `--paper` with the brand colour kept for the ring, or
a lighter tile — are design decisions rather than defect repairs. Lightening the party colours
themselves is not on the table, since those are the parties' own identities.

**Deliberately left out.** Only P1 and P2 were in scope. P3 (chip borders at 1.77 : 1), O1 (no skip
link), O2 (Escape does not close the mobile menu), O3 (target size), R1 (no `aria-pressed`), R2 (no
live regions) and R3 (table semantics) are unchanged and still listed in `PLAN-VISUAL.md` §2b. Also
recorded there: `.display`, `.mono`, `.src` and `.panel` remain unlayered and carry the same latent
trap as P1, with no measured casualty today.

Typecheck clean, production build clean at 104 pages.

---

## 2026-09-01 — Design critique and WCAG 2.1 AA audit (no code shipped)

Audited the running app rather than the source: seven routes at 1440×900 and 375×812, nine
route/locale combinations for the accessibility pass. Contrast was read with `getComputedStyle` on
live elements and composited against the real background, keyboard behaviour was driven with real key
events, and reflow was tested at 320 CSS px. Findings and the plan are in `PLAN-VISUAL.md`. Nothing
was changed in the app.

**The cascade bug that hid two others.** `.label-mono` in `app/globals.css` sets a colour. It has the
same specificity as a Tailwind colour utility and is defined after the Tailwind layers, so it
silently wins — **every element combining `label-mono` with a `text-[var(--…)]` utility renders
`--paper-dim` regardless of what the code says, across 62 occurrences.** Two are visible failures:
the active filter chip on `/es/financiacion` and `/es/votaciones` asks for `--ink` on `--gold` and
renders `--paper-dim` on `--gold` at **1.14 : 1**. The control that tells the reader which filter is
selected is the least readable text on the page.

**A token below AA.** `--paper-faint` `#6f6857` on `--ink` is **3.48 : 1**, under the 4.5 : 1 normal
text needs. 21 elements render at it today; 43 more are masked by the cascade bug. The two defects
must be fixed in the same change, because fixing the cascade alone newly exposes those 43.

**Five more, all verified in the browser.** Escape does not close the mobile menu (`aria-expanded`
stays `"true"`). No route carries a skip link, though the sidebar's six links precede `<main>` every
time. All eight filter chips lack `aria-pressed`, so with the contrast defect the selected state is
unavailable both visually and programmatically. There are no live regions anywhere, on pages whose
entire result set is replaced by filtering or searching. The chips' only boundary measures
**1.77 : 1** where non-text contrast needs 3 : 1.

**What passes was checked, not assumed**, and is recorded so a future pass does not redo it: correct
`lang` per locale, exactly one `<h1>` and no skipped heading levels on all nine, `<main>`/`<nav>`/
`<footer>` present, every image with `alt`, every control with an accessible name, the search field
labelled, focus visible under real keyboard use, and reflow clean at 320 px with the wide table
scrolling inside its own box. One caveat recorded with the pass: the site contains **no `:focus` rule
at all**, so the focus ring is entirely the browser's default — adequate today, but undesigned on a
near-black ground.

**The visual finding.** A data-journalism site with **zero `<svg>` and zero `<canvas>` on any
route** — every chart is a `div` with a percentage width, and the politician profile, party page and
directory have no chart at all. `data/photos.json` holds 133 portraits against 6,670 register rows,
so the directory is 98% initials. The plan proposes a small server-rendered chart primitive rather
than a charting framework, converting the 54 existing bars first, then one lead visual per page.

The page it recommends starting with is `/metodologia`: the project's strongest quality is that it
states its gaps, and those gaps are currently only prose. A coverage chart — 133 of 6,670 portraits,
268 of 6,670 with a roll-call record, 4,964 of 6,670 with a published salary — makes the honesty
visible.

**Deliberately left out.** No code changes, no token edits, and no screen-reader claims: an NVDA or
VoiceOver pass over the profile and votes pages is listed as outstanding, along with a check of
whether the vote cards work without colour vision. Automated checks catch roughly a third of real
barriers and the document says so.

---

## 2026-09-01 — News source registry, Atom support, and two staleness guards

First implementation step of the context layer designed in `PLAN-CONTEXT-LAYER.md`. The portal's
news panel no longer runs a Google News search: it reads a fixed, auditable list of RSS and Atom
feeds, so the publisher of every headline is known.

**Fixed a real bug.** `lib/news.ts` matched `<item>` only, so it returned an empty array for Atom
feeds — El Salto publishes Atom — without raising an error. The parser now handles both `<item>` and
`<entry>`, and reads Atom's self-closing `<link href>` attribute rather than element text.

**New registry.** `lib/news-sources.mjs` holds 15 verified sources with their format, topics,
language, whether they are an organisation or an outlet, and the date of their newest item at the
2026-09-01 probe. It follows the `lib/name-key.mjs` precedent — a `.mjs` module with a `.d.mts`
declaration — so the app and the build script read the same list rather than two copies. Seven
deliberately excluded feeds are listed with the reason each was left out.

**Two guards, each from an observed failure.** A source whose newest item is more than 365 days old
is dropped whole; nothing older than 120 days enters the panel regardless of source. The reason is
dosmanzanas: the most obvious LGBTI news source in Spain serves HTTP 200 with ten items whose newest
post is 23 February 2024. A status-code check calls that healthy, and it would have filled a "recent
news" panel with two-year-old articles.

**Two further rules, added after watching the merged output.** At most two items per source, because
the first working version was four-fifths Shangay — sorting purely by date makes the panel a ranking
of who publishes most often, burying the organisations the registry exists to include. And items in
the reader's language sort first, because TGEU and ILGA-Europe post daily in English and had taken
the top of the Spanish page. Catalan readers get the Spanish sources first; the registry has no
Catalan feed and Spanish is the nearer of the two.

**Provenance shown, not just used.** Every item carries its source name, and items from an
organisation's own site are marked as such — an association's statement about a law is not the same
kind of item as a newspaper's report on it. The methodology page now lists the whole registry with
links, the guard thresholds in words, and the excluded feeds with their reasons, in all three
languages. The portal's news heading now says rights *and* housing, which is what the panel actually
contains, and the note states plainly that organisation posts may cover their own activities as much
as rights news — one COGAM item in the live feed is a hiking outing, and filtering organisation
feeds by keyword would be arbitrary where labelling them is not.

**New check.** `npm run check:feeds` fetches every registered feed, reports the age of its newest
item, and exits non-zero on any source that is unreachable, unparseable or stale. It has one retry
per source: fetching fifteen feeds at once produces the occasional timeout, and a health check that
reports transient failures as dead feeds is one people learn to ignore. It found two things this
run — `provivienda.org` answers 403 to a descriptive bot User-Agent and 200 to an ordinary browser
one (so `FEED_HEADERS` sends the browser string), and Arcópoli is live but has published nothing in
201 days, which the report marks with `~` rather than treating as a failure.

**Verified.** All 15 sources live, 0 failing. `/api/news?topic=lgtbi,vivienda&lang=es` returns eight
items across six distinct Spanish sources with an empty `dropped` list; `lang=en` puts the English
organisations first. Typecheck clean, production build clean at 104 pages, no console errors.

**Deliberately left out.** No keyword filtering of organisation feeds, no attempt to rank items by
relevance, and no new statistical figures — the INE ingest is the next step, not this one. Query mode
is unchanged, so party and politician pages still use Google News.

**Two review findings fixed before the branch went further.** Both were drift risks rather than
present bugs, and both were cheap:

- `SOURCE_STALE_DAYS` and `ITEM_MAX_AGE_DAYS` were defined twice, once in `lib/news.ts` and once in
  `scripts/check-feeds.mjs`. Changing one would have left the health check passing feeds the live
  code then filtered out. They now live in `lib/news-sources.mjs` and both consumers import them.
- The per-source cap was keyed on the display name. Two registry entries sharing a name would have
  shared one counter. It is keyed on the registry id now, and `check:feeds` refuses to run at all if
  any `id`, `name` or `url` is duplicated — the uniqueness the cap relies on is checked rather than
  assumed. Verified by constructing a duplicate and confirming the detection fires.

---

## 2026-09-01 — Context layer designed and sources verified (no code shipped)

Planning task. The site answers who funds the parties and how they voted; the missing third side is
what the country those parties govern actually looks like — wages by sector, poverty, homelessness,
empty housing — placed next to politician pay, party funding and roll-call votes. This entry records
the source verification behind the new design document `PLAN-CONTEXT-LAYER.md`. No feature code was
written.

**Sources confirmed working.** The INE JSON API (Tempus3, `servicios.ine.es/wstempus`, no key) is the
spine of the layer. Verified live: `OPERACIONES_DISPONIBLES`, `TABLAS_OPERACION`, `DATOS_TABLA`.
Operation 140 EAES table `28185` returns 57 series of gross annual wage by CNAE section and sex for
2024; operation 155 ECV table `67240` returns 96 AROPE series with 2025 values. EAES 2024 headline
figures for sanity-checking an ingest: mean €29,540.26, median €24,497.17, mode €16,520.18, highest
sector energy supply €57,931.81, lowest hostelería €17,653.42. AROPE 2025: 25.7% overall, 33.9% for
under-16s.

**Traps found before they could reach a chart.** Three matter enough to name here:

- In INE data a **leading minus sign is a reliability flag, not a negative number** — it marks a
  sample of 100–500 observations. `Mujeres. Industrias extractivas` returns `-51101.45`, meaning
  €51,101.45 with a variability warning. An ingest that takes the value at face value will draw
  negative wages.
- Not every table listed by `TABLAS_OPERACION` is populated: table `80181` answers
  `{"status": "No existen series para la tabla"}`. Probe before depending on one.
- The same ECV table carries both the *Base 2013* AROPE series and the *objetivo Europa 2030*
  series. They are different definitions and must never be plotted as one line.

**Housing: two official numbers that disagree, recorded as such.** INE's Censo 2021 counts ~3.8M
empty dwellings (14.4% of stock), detected by absent or minimal electricity consumption, with 45% of
them in municipalities under 10,000 inhabitants and a reference date of 1 January 2021 — a pandemic
year, which is the basis of the standing criticism of the method. The Ministerio de Vivienda's 2025
data instead reports ~7.7M non-principal dwellings (28.6%) on a different method. Both will be
shown, with the methodological difference stated, rather than picking the larger figure.

On homelessness the current INE figure is the *Encuesta de centros y servicios de atención a personas
sin hogar* **2024**: an average 34,145 people over 18 staying daily in care centres, up 57.5% on
2022, across 1,376 centres. The widely-quoted 28,552 is the superseded 2022 edition. The plan
explicitly forbids dividing empty homes by homeless people: it is arithmetically true,
geographically false, and would discredit the rest of the site. The honest treatment is a map
placing empty-dwelling density against housing stress in the same geography.

**News feeds: probed every candidate rather than trusting the list.** Twelve feeds work and are
fresh, including Shangay, FELGTBI+, Fundación Triángulo, COGAM, Euforia, Plataforma Trans, Arcópoli,
TGEU, ILGA-Europe, Pikara, Provivienda and Hogar Sí. Two findings changed the design:

- **dosmanzanas is dormant.** Its feed returns HTTP 200 with ten items whose newest post is 23
  February 2024. It is the first LGBTI news source anyone would reach for, and it would have filled a
  "latest news" panel with two-year-old articles while looking perfectly healthy.
- **El Salto publishes Atom, not RSS.** The parser in `lib/news.ts` matches `<item>` only, so it
  returns an empty array for `<feed>`/`<entry>` documents. A latent bug, found by probing rather than
  by a user noticing an empty panel.

Consequently `lib/news.ts` is to become a registry of named sources with a format field, an Atom
branch, and a **staleness guard** that drops any source whose newest item is older than a threshold
and reports it in a build log, so the dosmanzanas failure mode cannot recur silently. Dead or
unreachable at probe time, recorded so they are not re-probed blindly: chrysallis.org.es,
kifkif.info, fundacion26d.org, lambdavalencia.org, observatoriolgtb.org, and both feed paths on
eapn.es.

**Deliberately left out.** Nothing was built, no numbers were added to the site, and no correlation
measure of any kind was designed. The framing decision taken earlier in the project stands and is
restated at the top of the plan: facts are placed side by side, never joined by an asserted cause. No
trend lines between votes and poverty rates, no derived "harm score", no ordering of parties by
anything computed. Press articles — including the ones that prompted this work — are treated as leads
only; every figure on the page will cite the statistical office, ministry or audit body that produced
it.

Also left for the build phase, not decided here: the exact AEAT *Distribución salarios* file URL (the
open-data catalogue page exposes no direct links, so each year's publication page has to be opened —
a discovery step of the same class as the Tribunal de Cuentas report hunt), and whether keyword
filtering of the Congreso *iniciativas* dataset can be made precise enough to publish at all.

---

## 2026-08-31 — EU political-ad repository: probed, not usable yet (no code shipped)

Investigated the European repository for online political advertisements as a live source for who
paid for political advertising, how much, and who was targeted. **It is not publicly accessible,
so nothing was built.** Recording the result so the probe is not repeated.

What the law provides. Regulation (EU) 2024/900 has applied in full since 10 October 2025 and
requires political ads to carry the sponsor, the amounts paid and the targeting criteria.
Commission Implementing Regulation (EU) 2026/818 of 9 April 2026 defines the repository's common
data structure, standardised metadata, authentication and common API, and its provisions apply
from 10 April 2026 — nearly five months before this check.

What actually exists. The Commission's site for the Regulation is
<https://political-advertising.ec.europa.eu>. It hosts exactly two portals: the Article 26 portal
for Member States to file election and referendum dates, and the Article 21 portal linking
national registers of legal representatives for non-EU providers. There is no repository of
advertisements and no public API. Searching the site's own text for "repositor" returns a single
hit: the *title* of the implementing regulation, listed among documents. No launch date is
announced, although the implementing regulation says the date "should be announced on the public
portal of the repository sufficiently in advance".

Two further blockers even once it exists. The implementing regulation specifies authentication via
**EU Login** with JSON Web Tokens, so the API is credentialed rather than open; and the regulation
defines standards for the architecture, not an operational endpoint — the portal address is to be
announced separately and has not been.

Deliberately not substituted: per-platform ad libraries (Meta, Google) do exist and would produce
*something*. They were not used, because presenting a platform-by-platform scrape as the EU
repository would misrepresent both provenance and completeness — the EU repository is meant to be
comprehensive across providers, an ad library is one company's view of its own inventory. That
remains available as a clearly-labelled separate layer if wanted, but it is not this.

Re-check trigger: a launch announcement on the portal above, or a Commission statement that the
first version of the repository is functional.

---

## 2026-08-31 — Per-foundation detail from Tribunal de Cuentas report 1.642

`/financiacion` now names every audited party-linked foundation instead of showing only
aggregates. 38 entities, with donations and public subsidies per year and the party each is
linked to.

**Source.** Report nº 1.642, "Informe de fiscalización de las aportaciones percibidas por las
fundaciones y demás entidades vinculadas o dependientes de los partidos políticos y de los gastos
de programas y actividades de estas financiados con cargo a subvenciones públicas, ejercicios 2021
y 2022", approved 25 September 2025. Annexes III (2021) and IV (2022) carry the consolidated
tables. Extracted by the new `scripts/extract-foundations.py` into `data/foundations.json`.

**How it was located**, after the previous attempt gave up: the `/es/partidos-politicos/Informes/`
index lists only 20 reports and does not include this one, and the press release's own "Informe"
and "Resumen" links are flagged `data-oc-broken-link="true"` by the Tribunal's CMS — the publisher
links to its own report are broken. The route that worked was the site-wide search POSTed to
`/es/buscador/`. That is now recorded in `AGENTS.md` and `NEXT-STEPS.md` so the dead ends are not
retried.

**Verification.** The extractor sums its own parsed rows and compares them to each annex's
TOTALES row, aborting on a mismatch. That guard earned its place immediately: the first run
reported `2021 donations: extracted 3735060.25 but the report totals 3813743.67`, a €78,683.42
shortfall. Cause: the row pattern excluded digits from entity names, so "Fundación 14 de Abril",
"Fundación Instituto 25 de Mayo para la Democracia" and "Asociación Movimiento Ciudadano Madrid
2019" were silently skipped. Anchoring the amounts by their decimal comma instead fixed it, and
both years now reconcile exactly: €3,813,743.67 / €2,394,338.06 for 2021 and €4,122,985.46 /
€2,539,219.75 for 2022.

**Party attribution comes from the report, not from us.** Links are read from its own sentence
"La <entity>, vinculada a la formación política <party>", which covers 34 of the 38 entities. The
other four are shown as "sin partido indicado" rather than matched by name, and the report-stated
party name is joined to the NIF registry only when exactly one registry entry matches.

**What this surfaces.** Fundación Disenso, linked to Vox, received €5,091,920 across the two
years — **64.2%** of all donations to party-linked foundations. The page now leads with that
concentration figure. Next are Fundación Iratzar (Sortu, €1,007,500), Fundación Pablo Iglesias
(PSOE, €559,459) and Fundación Sabino Arana (PNV, €544,002).

**Still not covered:** the report covers 2021 and 2022 only, nothing later is published, and four
entities carry no party because the report does not state one. Both facts are stated on the page.

---

## 2026-08-31 — Docs: architecture refresh, next steps, this changelog

- Rewrote `AGENTS.md`. It had gone stale: it still documented `/sueldos`, `/caras` and
  `/politician/[slug]` as live routes when those are now redirects, and it had no sidebar,
  `/politicos`, `/politico/[slug]`, `/financiacion` or foundations layer. It now carries the real
  route and library inventory, the honesty rules with the two concrete near-misses that produced
  them, the endpoint findings that cost time to work out, the dependency-overrides rationale, and
  a known-gaps section.
- Added `NEXT-STEPS.md`: the planned work, each item with what is already known, the procedure,
  and explicit stop conditions. It records what was already tried on the foundations-report hunt
  so it is not repeated — the report-index gap, the `I<number>.pdf` URL pattern, the fact that a
  `HEAD` probe returns 200 with a zero body for most numbers and so cannot identify a report,
  that I1612 and I1611 are the wrong reports, and that the TdC search endpoint needs a session.
- Added this changelog, and adopted documenting each task here as standing practice.

No application code changed in this entry.

---

## 2026-08-31 — Dependencies: cleared postcss and sharp advisories without a Next major

`npm audit` reported three high findings attributed to `next`, but only as the parent of two
transitive dependencies:

- **postcss** — Next pinned a nested copy at 8.4.31, inside the vulnerable range for four
  advisories: CSS-stringify XSS (GHSA-qx2v-qp2m-jg93) and three `sourceMappingURL` path
  traversals disclosing arbitrary `.map` files (GHSA-6g55-p6wh-862q, GHSA-fxqj-rqcc-2cmp,
  GHSA-r28c-9q8g-f849). Our own build already used 8.5.26 via `@tailwindcss/postcss`.
- **sharp** — 0.34.5, below the 0.35.0 carrying the libvips CVE fixes (GHSA-f88m-g3jw-g9cj:
  CVE-2026-33327, -33328, -35590, -35591).

Fixed with an `overrides` block pinning `postcss` to `^8.5.26` and `sharp` to `^0.35.0`. Result:
**3 high → 0 vulnerabilities**, nested postcss deduped away, sharp at 0.35.4, build still clean at
104 pages. npm's only proposed fix was `next@16.3.3`, a semver-major; the overrides reach the same
audit result without forcing that upgrade, so moving to Next 16 stays a deliberate decision.

Neither advisory was reachable in this app as configured — the postcss ones need
attacker-controlled CSS or `sourceMappingURL` comments, and the only CSS in the build is ours plus
Tailwind; the sharp CVEs need image processing, and `next/image` is used solely with `unoptimized`.
Pinned anyway, because "not reachable today" depends on choices a later change could reverse.

Also closed a Vercel-generated branch and its PR #1, which proposed `next` 15.5.4 → 15.5.9. It was
cut eight commits back, would have been a downgrade of the pin from 15.5.23, still contained a
`refresh` script that had since been removed, and 15.5.9 sits inside both vulnerable ranges so it
would not have cleared the audit either.

---

## 2026-08-31 — Party-linked foundations layer

`/financiacion` gained the foundations channel: private donations and public subsidies per year —
2021, €3.8M and €2.4M across 36 audited entities; 2022, €4.1M and €2.5M across 34 — sourced to the
Tribunal de Cuentas release of 26 September 2025 reporting that these donations doubled against
2020.

**A framing claim was corrected before shipping.** The section was going to say that foundations
are simply the route corporate money can still take. That is too loose. Under the seventh
additional provision of LO 8/2007 these entities cannot accept donations from public bodies or
companies at all, and donations from private legal entities carry the same limits that apply to
parties. The actual difference is narrower: money given to finance a *specific activity or
project* of the foundation is not legally treated as a donation, where it answers to a common
interest or to both entities' statutory purpose. The page explains that mechanism instead.

**Deliberately absent:** the per-foundation breakdown. The full report was not locatable from the
published index without a large blind PDF hunt, so only the Tribunal's aggregates are loaded, and
the page states under "lo que no muestra" that no foundation is named and no amount is attributed
to any particular party.

---

## 2026-08-31 — Landing page rebuilt as a transparency portal

The home page is now an entry point rather than a single chart: what the site tracks, the headline
figures (€300.6M public money, €2.1M declared private donations, 6,670 officeholders, 9 votes
tracked), how each parliamentary group voted on the tracked items, a rights-focused news feed, and
cards into the four sections. The full party dashboard moved to `/financiacion` with its own
sidebar entry. `components/StanceByGroup.tsx` reports each group's majority ballot, counted from
that group's own named votes.

**A labelling error was caught by spot-checking.** Groups were first bucketed as "a favor" /
"en contra", which put EH Bildu in "en contra" on Ley 4/2023 — but that ballot was on the Senate's
amendments, where a No can mean rejecting the amendment rather than opposing the law. On a site
about exactly this issue that would have misrepresented a party's position. The buckets now use
ballot language ("votó Sí" / "votó No" / "se abstuvo"), each card shows the actual subject of the
ballot, and the note states this is the vote as recorded, not an interpretation of intent.

The framing line under the figures states that money and votes are published together so they can
be looked up, not because one explains the other.

---

## 2026-08-31 — Sidebar navigation and a unified politician directory

- `components/Sidebar.tsx`: persistent left rail on desktop (Datos / Sobre groups), collapsible
  menu on mobile, active-item highlight, locale toggle at the foot. The header nav is gone.
- `/sueldos` and `/caras` merged into `/politicos`; both, and `/politician/[slug]`, now redirect.
  A lead section cards the profiles that carry a roll-call record, ranked by how much material
  exists, hidden while the visitor searches. The full register of 6,670 keeps search, party facets
  and paging.
- `/politico/[slug]`: portrait or initials, post and party, the person's pay beside their party's
  public funding and declared private donations, their recorded ballots grouped by topic (trans
  and LGBTI rights, sexual and reproductive health, housing) with vote kind, non-binding marker,
  the group they sat in *at that vote*, and a link to the official record. Bluesky and news feeds
  where they exist.
- `lib/people.ts` performs the join. Curated handles carry a short public name ("Óscar Puente")
  while the register carries the full legal name ("Óscar Puente Santiago"), so they are linked by
  matching every token of the short name into the register's tokens, accepted only when exactly
  one row qualifies. An ambiguous match is dropped rather than guessed, because a wrong link would
  attribute someone else's accounts to a named person.

Someone with no roll-call record shows "sin voto registrado" plus a note that their position is
not inferred from their party — not a blank that reads as absence of opinion.

**Performance note:** the directory first took over 300 seconds because badge-building did 6,670
sequential awaits. Rewritten to set-based lookups: ~6s cold in dev, sub-second warm.

---

## Earlier work (merged as PR #2)

- Public salaries index: 6,670 active officeholders from the Registro de Altos Cargos export,
  accent-folded search, party facets, 74.8% matched to the BDNS party registry by NIF.
- Key roll-call votes: 9 votes from Congreso de los Diputados open data across the XIV and XV
  legislatures, each pinned by hand with the tally expected on the official record and refused if
  the tally disagrees. Vote kinds labelled; amendment votes excluded.
- Portraits: 133 freely-licensed images from Wikimedia Commons, attached only on an exact
  article-title match, with author and licence rendered wherever the image appears.
- Internationalisation: ES / EN / CA under `/[locale]`, with locale-aware number and date
  formatting.
- Live BDNS subsidy tracker with a daily Vercel cron and KV-backed snapshot persistence.
