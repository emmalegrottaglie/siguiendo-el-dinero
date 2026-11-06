# Plan: the context layer — wages, poverty, housing, and what parties actually did

Status (updated 2026-11-06): **partly built.** Steps 1 to 3 of the build order in §8 are done: the
news registry (`lib/news-sources.mjs`, `lib/news.ts`), the INE ingest (`scripts/fetch-ine.mjs` into
`data/indicators.json`) and the wage and poverty page at `/contexto`, plus each person's pay in
multiples of the SMI on their page. Steps 4 to 7 (housing, AEAT, Congreso initiatives, the
juxtaposition grid) are not built; `NEXT-STEPS.md` item 5 tracks them. The site was redesigned on
2026-11-05, so where this plan names components or chart technology of the time, a note says what
exists now. The rest of this document is the design as written on 2026-09-01: the sources verified
then, the ones that turned out to be traps, the visualisations worth building, and the honesty rules
that apply to each new number.

The site currently answers *who funds the parties* and *how the parties voted*. This layer adds the
third side: *what the country the parties govern actually looks like*. Wages by sector, poverty
rates, homelessness, empty housing — placed next to politician pay, party funding, and roll-call
votes, so a reader can see all three at once.

---

## 0. The framing rule, restated before anything else

The correlation decision made earlier in this project stands and governs this whole layer:
**factual juxtaposition, never asserted causation.**

That means, concretely:

- A chart may put "AROPE rate 2025: 25.7%" next to "Group X voted No on Ley 12/2023". It may not
  draw a trend line between them, compute a correlation coefficient between votes and poverty, or
  order parties by an invented "harm score".
- Every derived number (a ratio, a percentile, a multiple of the SMI) must be reproducible from two
  published figures that are both cited on the same screen.
- Where two official bodies publish different numbers for the same thing — and for empty housing
  they do — show both and name the methodological difference. Picking the bigger number is
  advocacy, not transparency.
- Press articles are entry points, not citations. Every figure on the page cites the statistical
  office, ministry, or audit body that produced it. The articles that prompted this work are listed
  in §5 as leads, and they are not what the page will link to for the numbers.

The existing standing practice in `NEXT-STEPS.md` applies too: **a gap stated on the page is worth
more than a number that might be wrong.**

---

## 1. Wages — verified sources

### 1.1 INE JSON API (Tempus3) — the spine of this layer

Base: `https://servicios.ine.es/wstempus/js/ES/{FUNCION}/{id}[?parametros]`. No key, no auth, JSON.
Documentation: <https://www.ine.es/dyngs/DAB/index.htm?cid=1099>.

Useful calls, all confirmed working on 2026-09-01:

| Call | What it returns |
|---|---|
| `OPERACIONES_DISPONIBLES` | Every statistical operation with its numeric id |
| `TABLAS_OPERACION/{opId}` | Every table in an operation |
| `DATOS_TABLA/{tableId}?nult=1` | Latest period of every series in a table |
| `DATOS_TABLA/{tableId}` | Full history |

Operations that matter here: **140 EAES** (Encuesta Anual de Estructura Salarial), **155 ECV**
(Encuesta de Condiciones de Vida), **303 ETCL** (coste laboral, quarterly), **432 IPVA** (índice de
precios de vivienda en alquiler), **353 ADRH** (Atlas de distribución de renta de los hogares —
income down to municipality and census district, the finest geography available).

Confirmed EAES tables:

| Table | Content |
|---|---|
| `28185` | Salario medio bruto by CNAE-2009 section and sex — **verified**, returns 57 series, 2024 data |
| `28191` / `80180` | Medias y percentiles by sex and comunidad autónoma |
| `28184` | Indicadores de desigualdad |
| `28186` / `80183` | By grupo principal de ocupación |
| `28187` | By tipo de jornada (full-time vs part-time) |
| `28182` / `80182` | Share of workers by earnings **relative to the SMI** |
| `30046` | Ingreso medio por hora by sex and sector |

Sample response, table `28185`, `nult=1`:

```
Ambos sexos. Todas las secciones. … Salario medio bruto.  -> 2024: 29540.26
Mujeres.     Todas las secciones. … Salario medio bruto.  -> 2024: 26904.90
Hombres.     Todas las secciones. … Salario medio bruto.  -> 2024: 32057.55
Ambos sexos. Industrias extractivas. …                    -> 2024: 41951.74
```

**Gotcha, and it will silently corrupt every chart if missed.** A leading minus sign in `Valor` is
not a negative number — it is a reliability flag. INE's own note: a `-` before the figure indicates
the sample has between 100 and 500 observations and the figure is subject to high variability. In
the same call, `Mujeres. Industrias extractivas` comes back as `-51101.45`, meaning €51,101.45 with
a low-sample warning. Any ingest script must take the absolute value and carry the flag through to
the UI as a visible marker, not strip it.

Second gotcha: table `80181` exists in the table list but `DATOS_TABLA` answers
`{"status": "No existen series para la tabla"}`. Not every listed table is populated. Probe before
depending on one.

### 1.2 EAES 2024 headline figures (for sanity-checking the ingest)

Mean €29,540.26 · median €24,497.17 · **modal €16,520.18**. Highest sector: energy supply
€57,931.81. Lowest: hostelería €17,653.42.

The gap between the mean and the mode is the single most useful fact in this dataset and should be
on the page in words: the most common salary in Spain is about 44% below the average one, because a
long upper tail drags the mean. Any page that shows only "the average salary" is misleading, so the
rule for this layer is **median and mode always appear alongside the mean**.

Related caveat to print: EAES gross annual earnings include part-time workers, so the figure is not
"what a full-time job pays". Table `28187` splits by jornada and should be used wherever the
comparison implies full-time work.

### 1.3 AEAT — salary distribution in SMI multiples

*Mercado de Trabajo y Pensiones en las Fuentes Tributarias*, from Modelo 190 — census-level, not a
survey, covering every wage payment declared to the tax agency. Alongside it AEAT maintains a
**"Distribución salarios"** file with the distribution by tranche **since 2001**, where the tranches
are defined as multiples of the annual SMI.

Catalogue page: <https://sede.agenciatributaria.gob.es/Sede/datosabiertos/catalogo/hacienda/Mercado_de_Trabajo_y_Pensiones_en_las_Fuentes_Tributarias.shtml>
Latest year: 2024. The catalogue page does **not** expose direct file links; each year has its own
publication page and the file URL has to be found there. Treat this as a discovery step of the same
class as the Tribunal de Cuentas report hunt — budget for it, and record the URL that worked.

This dataset is what makes the strongest visualisation in §6 possible, because it puts the whole
wage-earning population on the same axis as the SMI and therefore on the same axis as any politician
salary the site already holds.

### 1.4 SMI

2026: **€17,094/year in 14 payments of €1,221/month**, exempt from IRPF. The historical series lives
at MITES, *Boletín de Estadísticas Laborales*, table SMI-1:
<https://www.mites.gob.es/estadisticas/bel/SMI/smi1_top_HTML.htm>.

The SMI changes once a year by Real Decreto. This is a small, slow, legally-defined series, so the
right treatment is the one already used for `lib/donations.ts`: a typed module with one entry per
year, each carrying its BOE reference, transcribed by hand and reviewed — not a scrape.

---

## 2. Poverty — verified sources

**INE ECV, operation 155.** Table `67240` — *Riesgo de pobreza o exclusión social (objetivo Europa
2030) y sus componentes por edad y sexo* — verified working, 96 series. Latest values:

| Indicator, 2025 | Value |
|---|---|
| AROPE, total | 25.7% |
| At risk of poverty (income of the prior year) | 19.5% |
| Severe material and social deprivation | 8.1% |
| Low work intensity (0–64) | 8.0% |
| **AROPE, under-16s** | **33.9%** |

Companion tables: `67989` / `60264` AROPE by comunidad autónoma, `67246` Gini and S80/S20 by CCAA,
`29282` poverty rate by CCAA, `59962` poverty against a **fixed 2008 threshold** (this one matters —
the ordinary rate is relative to the current median, so it can fall in a downturn when everyone gets
poorer together).

**Definition trap.** The same INE table carries both the *Base 2013* AROPE series and the *objetivo
Europa 2030* series. They are not the same definition and must never be plotted as one line. Store
the series name verbatim and key charts off it.

**EAPN** (*El Estado de la Pobreza*, annual) is the best interpretive secondary source and is worth
citing as analysis next to the INE primary figures, but it is not a data feed — `https://www.eapn.es/feed`
and `/rss` both 404. The **IVIE** estimate that eliminating poverty would cost roughly €24bn/year,
1.8% of GDP, is a research finding and belongs in prose with attribution, not in a chart axis.

---

## 3. Housing — verified sources, and the discrepancy that is the story

Two official numbers exist and they disagree, because they measure differently.

- **INE, Censo de Población y Viviendas 2021: ~3.8 million empty dwellings, 14.4% of the stock.**
  Definition: no electricity contract, or annual consumption below what an average dwelling in the
  same municipality would use if occupied 15 days a year. **45% of them are in municipalities under
  10,000 inhabitants.** The reference date is 1 January 2021 — a pandemic year, which is the basis
  of the standing criticism that consumption-based detection overcounted in large cities.
- **Ministerio de Vivienda, 2025 data: ~7.7 million dwellings that are not principal residences,
  28.6% of the stock**, of which roughly 2.9M second homes and 3.8M empty, using padrón, tax
  declarations, supply contracts and sporadic consumption peaks.

**Homelessness.** The current INE figure is from the *Encuesta de centros y servicios de atención a
personas sin hogar* **2024**: an average of **34,145 people over 18 staying daily in homelessness
care centres, +57.5% vs 2022**, across 1,376 centres (+17.1%). The older, more widely quoted 28,552
figure is the 2022 edition and is superseded.

**This is the most abusable pair of numbers on the whole site, so the rules are strict:**

1. The centres survey counts people *in centres*, not people without housing. It is a floor, not a
   count. Street homelessness is not in it.
2. Part of the 2022→2024 rise is more centres and a specific migration-driven cohort — INE reports
   places in centres serving migrant populations up 100.9%. Report that alongside the headline.
3. **Never divide empty homes by homeless people.** "111 empty homes per homeless person" is
   arithmetically true, geographically false, and the kind of claim that discredits everything else
   on the page. The honest version is §6.E: put empty-home density and housing stress on the same
   map and let the mismatch show.

Rent-side series: INE **IPVA** (operation 432) for rent prices, and ECV's housing-cost-overburden
rate for the household side.

---

## 4. What parties actually did — the hardest layer

The user's ask is a comparison against "the level of actual measures taken". The site already has
roll-call votes with `kind` (`ley` / `toma` / `pnl` / `mocion`) and `binding`, which is exactly the
distinction that keeps this honest: **tabling a non-binding PNL is not passing a law.**

The next source is the Congreso open-data **iniciativas** dataset,
<https://www.congreso.es/es/opendata/iniciativas>, downloadable as CSV/JSON/XML per legislature,
covering proyectos de ley, proposiciones de ley and other initiative types with their author group
and their outcome.

Proposed treatment, deliberately narrow:

- Filter to a small, hand-curated set of topic keywords (vivienda, alquiler, sinhogarismo, LGTBI,
  trans, pobreza infantil, salario mínimo), each keyword list committed to the repo and shown on the
  methodology page.
- Per parliamentary group, count initiatives **filed**, **admitted**, and **approved**, kept as
  three separate numbers. Never collapse them into one "activity" score.
- State the obvious structural fact next to the counts: governing groups legislate through proyectos
  de ley while opposition groups can only file proposiciones, so raw counts are not a like-for-like
  measure of effort. Without that sentence the chart is misinformation.

**Stop condition.** If keyword filtering cannot be made precise enough to avoid sweeping in
unrelated initiatives, publish the vote layer only and say so. Do not ship a fuzzy count.

---

## 5. News sources — probed 2026-09-01

Every feed below was fetched and its most recent item dated. This matters more than the list itself:
a dead feed in a "recent news" panel is worse than no panel.

**Working, fresh:**

| Feed | Items | Latest item at probe |
|---|---|---|
| `https://www.shangay.com/feed/` | 20 | 31 Aug 2026 |
| `https://tgeu.org/feed/` (Transgender Europe) | 12 | 31 Aug 2026 |
| `https://www.ilga-europe.org/feed/` | 10 | 31 Aug 2026 |
| `https://cogam.es/feed/` | 10 | 25 Aug 2026 |
| `https://euforia.org.es/feed/` (Euforia, familias trans-aliadas) | 13 | 22 Aug 2026 |
| `https://felgtbi.org/feed` (FELGTBI+) | 10 | 17 Aug 2026 |
| `https://plataformatrans.org/feed/` | 2 | 15 Aug 2026 |
| `https://www.hogarsi.org/feed/` (housing/homelessness) | 10 | 21 Aug 2026 |
| `https://www.provivienda.org/feed/` (housing) | 10 | 6 Aug 2026 |
| `https://fundaciontriangulo.org/feed` | 10 | 31 Jul 2026 |
| `https://www.pikaramagazine.com/feed/` | 10 | 29 Jul 2026 |
| `https://www.elsaltodiario.com/general/feed` | Atom | 31 Aug 2026 |

**Findings worth acting on:**

- **dosmanzanas is dormant.** `https://dosmanzanas.com/feed` returns 200 with 10 items whose most
  recent post is **23 February 2024**. It is the obvious LGBTI news source to reach for and it would
  have quietly filled a "latest news" panel with two-year-old articles. Exclude it, or label it as
  an archive.
- **Arcópoli is stale**, latest 12 Feb 2026 — include but do not rely on it for "trending".
- **El Salto is Atom, not RSS** — `<feed>`/`<entry>`, not `<channel>`/`<item>`. The parser in
  `lib/news.ts` matched `<item>` only and returned an empty array. (Fixed: it has an Atom branch
  since step 1.)
- **Dead or unreachable:** `chrysallis.org.es/feed/` (connection failure), `kifkif.info/feed/` (404),
  `fundacion26d.org/feed/` (404), `lambdavalencia.org/feed/` (404), `observatoriolgtb.org/feed/`
  (unreachable), `eapn.es/feed` and `/rss` (404). For these, either find the real feed path or fall
  back to the existing Google News RSS query scoped to the organisation's name.

**Implementation notes.** `lib/news.ts` then hardcoded one Google News query. It should become a
registry (done in step 1: `lib/news-sources.mjs`) of named sources — each with a URL, a format (`rss` | `atom`), an organisation name, a
topic tag, and a language — merged, de-duplicated by link, sorted by date, and rendered with the
source name always visible. Add a **staleness guard**: a source whose newest item is older than N
days is dropped from the merged feed and reported in a build log, so the dosmanzanas failure mode
cannot recur silently. Keep Google News as the fallback for organisations with no working feed.

---

## 6. Visualisation brainstorm

Ordered by how much they earn their screen space. Every one of them carries a source line and, for
accessibility, a toggleable data table — this is civic data and it must work without colour vision
or a mouse.

### A. The wage ladder — the core interaction

Pick a sector (EAES CNAE section), an occupation, or a comunidad autónoma. The chart draws that
group's mean, **median** and modal annual wage as three marks on one axis, and overlays the salary
of any politician selected from the existing 6,670-row register. Derived line, stated plainly: *"a
hostelería worker on the sector average earns €17,653; this post pays €X; the ratio is Y."*

Deliberately not: a "how many years to earn what they earn" counter as the headline. It is the same
arithmetic dressed as outrage. Offer it as a secondary toggle, not the default.

### B. The SMI-multiples histogram — the strongest single chart

From the AEAT distribution file: every wage earner in Spain bucketed by multiples of the annual SMI,
drawn as a histogram. Politician salaries drop in as vertical markers. The reader sees the entire
income distribution and exactly where public office sits in it. Because AEAT publishes this back to
2001, the histogram can animate across years, with the SMI itself moving along the axis.

### C. Percentile locator

The reader enters their own salary. The page returns their percentile (EAES percentile tables, or
the EPA *decil de salarios*), the sector figures around them, and which posts in the register sit
above. Purely client-side arithmetic on already-loaded data — the entered figure is never sent
anywhere, and the page should say so.

### D. Indexed divergence lines

SMI, median wage, mean wage, rent index (IPVA) and the AROPE rate, all indexed to 100 in a common
base year, on one set of axes. Shows which lines separated and when. No causal annotation; a
separate, clearly-marked band beneath the lines carries dated legislative events from the votes
dataset, so the reader can align them without the chart asserting anything.

### E. Empty homes vs housing stress — the honest housing map

Two choropleths side by side, or one bivariate map: empty-dwelling share by province (Censo 2021)
against a housing-stress measure (AROPE, or housing-cost overburden, by the same geography). The
finding this makes visible is the real one — that the empty stock is largely not where the pressure
is, with 45% of it in municipalities under 10,000 people. It replaces a false remedy with a real
diagnosis, and it is more damning of policy, not less.

Beside it, a panel showing the two official empty-home estimates (INE 3.8M vs Ministerio 7.7M
non-principal) with the methodological difference in one sentence each.

### F. The juxtaposition grid

The site's centrepiece. Rows are parliamentary groups. Columns are grouped into three bands:

1. **Votes** — one cell per pinned roll call, labelled by the side taken on the ballot, not by an
   interpreted position, with the ballot's subject shown beside it (as the topic pages do with
   `whatWasVoted()` in `components/nuevo/topics.ts`; `StanceByGroup`, which this originally pointed
   to, was removed in the redesign).
2. **Money** — state subsidies received, foundation donations, donation-band data where held.
3. **Measures** — initiative counts from §4, split filed / admitted / approved.

A fourth, non-party band sits above or below as a fixed reference strip: the national indicators
(AROPE, child AROPE, wage gap, homelessness, empty stock) with their dates. The grid never sorts
parties by anything derived; the reference strip is context, not a scoreboard. The header states in
plain words that the grid places facts side by side and does not assert that one caused another.

### G. Money flow — Sankey

Public subsidy → party → linked foundation, using data already in `data/subsidies.json` and
`data/foundations.json`. The one layer the site has that nobody else renders visually. Needs the
gap statement from the foundations page carried onto the diagram: what the flow does *not* include.

### H. Sector scatter: pay vs gender gap

EAES by sector and sex — x = mean wage, y = female/male ratio, bubble size = employment. One chart,
two dimensions of inequality, and it needs no interpretation to be legible.

### I. Territorial small multiples

One tile per comunidad autónoma, each showing the same three-line mini-chart (median wage, AROPE,
rent index). Sorted by any of the three. Cheap to build once the ingest exists, and it localises the
story for every reader.

### J. Timeline scrubber

A single shared time axis. Dragging it moves every other panel on the page to that date: the
indicator values, the funding totals for that year, the votes that had happened by then. Expensive,
and worth it only after A, B, E and F exist.

**Charting technology.** The project hand-rolls its graphics and has no chart dependency, which is
why the pages are fast and look like the rest of the site. (When this was written the bars were
animated with `motion`; since the redesign of 2026-11-05 there is no animation library either, and
the graphics are the server-rendered components in `components/nuevo/`.) A, B, D, H and I are
all achievable that way. Recommendation: stay hand-rolled, and if a real need appears for scales,
paths or a Sankey layout, add `d3-scale` / `d3-shape` / `d3-sankey` only — they are pure maths, run
server-side, and add no DOM layer. Do not add a full charting framework; it will not match the
existing design and it will pull a client bundle onto pages that are currently static.

---

## 7. Sourcing pattern

Every new figure follows the shape already used by `lib/foundations.ts` and `lib/donations.ts`:

- A typed module or generated JSON with an explicit `source` block — body, publication, reference
  date, URL.
- A build script under `scripts/` that fetches, verifies against a published total or headline where
  one exists, and **aborts rather than publishing on mismatch** (as `extract-foundations.py` does).
- The rendered figure carries a visible source link and its reference date. Freshness is part of the
  claim: an AROPE rate is a 2025 figure and must not read as "now".
- A short entry per source on the methodology page, in the site's three languages, saying what the
  number counts and what it does not.

---

## 8. Suggested build order

1. **`lib/news.ts` → source registry with an Atom branch and a staleness guard**, seeded with the
   verified feeds in §5. Smallest change, immediate visible payoff, and it fixes a real latent bug.
2. **INE ingest** (`scripts/fetch-ine.mjs`) for EAES `28185`/`28187`/`28191` and ECV `67240`/`67989`,
   handling the negative-sign reliability flag, into `data/indicators.json`.
3. **Visualisation A (wage ladder)** on a new `/contexto` route, joined to the existing salary
   register.
4. **Housing panel and map (E)**, with both official estimates shown.
5. **AEAT distribution file discovery, then visualisation B.**
6. **Congreso iniciativas (§4)** — only if keyword precision holds up.
7. **The juxtaposition grid (F)**, last, because it consumes everything above.

Items 1–4 are self-contained and can ship independently. Nothing here should be started without the
§0 framing rule in front of you.
