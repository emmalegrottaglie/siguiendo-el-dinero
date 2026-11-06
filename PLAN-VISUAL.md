# Design critique, accessibility audit, and plan: making the portal visual

> **Status (2026-11-06): finished, then overtaken. Kept as a record.** Every defect and audit item
> below was fixed on the first design by 2026-09-07, and the plan in §4 was carried out between
> September and October 2026 (the coverage chart, the chart primitives, a lead visual per page). On 2026-11-05 that whole
> design was replaced by the redesign built at `/nuevo`: the route-map motif, the `--n-*` tokens and
> `n-*` classes in `app/[locale]/site.css`, and the components in `components/nuevo/`. See
> `CHANGELOG.md` ("A redesign prototype at /nuevo, built on the route map", 2026-10-30, and "The new
> design becomes the site", 2026-11-05), and `AGENTS.md`, "The design system", for what exists now.
>
> The files, tokens and routes named below are those of the first design and mostly no longer
> exist: `components/Dashboard.tsx`, `components/Sidebar.tsx`, `components/GroupBreakdown.tsx`,
> `components/chart/`, `lib/motion.ts`, the `motion` dependency, the old stylesheet in
> `app/globals.css` (`--ink`, `--paper-*`, `--gold`, `--line-*`, `.label-mono`, `.eyebrow`,
> `.panel`), and the `/votaciones`, `/politicos` and `/party/[nif]` routes, which now redirect. The
> findings still worth carrying into the new design are kept in `AGENTS.md`: the cascade-layer trap
> (D1), no content at `opacity: 0` without JavaScript (D3b), the skip link built by translation
> rather than `sr-only` (O1), a caption and scoped headers on every table (R3, N1), and the 3:1
> boundary on interactive controls (P3).

Audited 2026-09-01 against the running app: seven routes at 1440×900 and at 375×812, with contrast
ratios and element counts measured in the page rather than estimated by eye. Everything numbered
below was measured; where a figure is stated, the method is stated with it.

The site is at refinement stage — the dossier art direction is settled and working. This is not a
redesign. It is a set of measured defects to fix, a WCAG 2.1 AA audit in §2b, and one deliberate
absence to fill.

---

## 1. Overall impression

The art direction is genuinely good and should not be touched: ink ground, warm paper text, a single
gold accent, serif display against mono labels, film grain, the gold aura at the top. It reads as an
investigative dossier, which is exactly right for the subject, and it does not look like a generic
dashboard.

The biggest opportunity is not styling. It is that **a data-journalism site currently contains no
charts**. Across all seven routes there are **zero `<svg>` and zero `<canvas>` elements**. Every
"chart" is a `div` whose width is a percentage — 27 on the portal, 27 on `/votaciones`, 2 on
`/financiacion`, and none at all on the politician profile, the party page or the directory. The
data is the story, and right now the reader has to assemble it from numerals in prose.

---

## 2. Defects, measured

### 🔴 D1 — `.label-mono` silently overrides every text colour set beside it

**Fixed 2026-09-01.** `.label-mono` in `app/globals.css` set `color: var(--paper-dim)` from an
*unlayered* rule. Tailwind v4 emits its utilities inside `@layer utilities`, and **unlayered styles
beat every cascade layer regardless of specificity**, so the class won against any `text-[var(--…)]`
set beside it. **62 call sites silently rendered `--paper-dim`.**

The first diagnosis here said "same specificity, defined later" and proposed `:where(.label-mono)`.
That was wrong, and trying it proved it: `:where()` drops specificity to zero but changes nothing
about layer order, and the chip still measured 1.14 : 1. The fix that works is moving `.label-mono`
and `.eyebrow` into `@layer base`, which loses to `utilities` by layer order. Recorded because the
same trap applies to every custom class in this file.

Most are harmless — they ask for `--paper-faint` and get `--paper-dim`, which is darker text becoming
lighter, so contrast improves. Two are not harmless:

| Where | Code asks for | Actually renders | Contrast |
|---|---|---|---|
| Active filter chip, `components/Dashboard.tsx:113` (removed 2026-11-05) | `--ink` on `--gold` | `--paper-dim` on `--gold` | **1.14 : 1** |
| Active chip, `app/[locale]/votaciones/page.tsx:76` (removed 2026-11-05) | `--ink` on `--gold` | `--paper-dim` on `--gold` | **1.14 : 1** |
| Reset button, `components/Dashboard.tsx:145` (removed) | `--red` | `--paper-dim` | n/a |

1.14 : 1 is invisible. The currently-selected filter — the one control that tells the reader what
they are looking at — is the least readable text on the page. Confirmed by reading
`getComputedStyle` on the live elements on both routes, not inferred from the source.

**Applied.** `.label-mono` and `.eyebrow` now live in `@layer base`. Verified in the browser: a
probe element with `label-mono text-[var(--ink)]` computes `rgb(16, 14, 10)`, and the active chip
measures 8.30 : 1 on both filtered routes.

Still unlayered and carrying the same latent trap: `.display`, `.mono`, `.src`, `.panel`. None has a
measured casualty today — `.display` sets `line-height: 0.95` and the one page using `leading-[…]`
asks for 0.95 as well — but a future `leading-` or `text-` utility on them will be ignored.

### 🔴 D2 — `--paper-faint` fails WCAG AA for body text

`--paper-faint` `#6f6857` on `--ink` `#100e0a` is **3.48 : 1**. AA needs 4.5 : 1 for normal text and
3.0 : 1 for large. It is used 80 times, of which **21 render at that ratio for real** — the other 43
are masked by D1 and would start failing the moment D1 is fixed. Several are `text-xs` and
`text-sm`, well inside "normal text".

| Token | On `--ink` | AA normal | AA large |
|---|---|---|---|
| `--paper` | 14.99 | pass | pass |
| `--paper-dim` | 7.27 | pass | pass |
| **`--paper-faint`** | **3.48** | **fail** | pass |
| `--gold` | 8.30 | pass | pass |
| `--gold-bright` | 11.91 | pass | pass |
| `--red` | 4.70 | pass | pass |

**Applied.** `--paper-faint` is now `#8a8270`, **5.06 : 1**, same warm-grey family. Shipped in the
same change as D1, which was necessary: fixing D1 alone would have newly exposed the 43 masked
elements to the failing value.

### 🔴 D3 — reduced motion is declared but not honoured — FIXED 2026-09-07

`@media (prefers-reduced-motion: reduce)` in `globals.css` disabled `scroll-behavior` and nothing
else. Four components animated with `motion`, and none consulted `useReducedMotion()`.

**Applied.** A shared `useEntrance()` hook in `lib/motion.ts` (removed 2026-11-05) built every entrance's
`initial` / `animate` / `transition`, collapsing to the final state with a zero duration under
reduced motion. All four components use it: `Dashboard` (masthead, party rows, bars), `NewsFeed`,
`BlueskyFeed` and `CountUp`, which skips its count-up entirely and shows the figure. The skeleton
`animate-pulse` classes are dropped under the same flag, and the CSS block now also neutralises
`animation-duration` and `transition-duration` globally rather than only `scroll-behavior`.

The stagger is capped. `stagger(index)` is `min(index × 0.035, 0.4)`; the party bars previously used
an uncapped `i * 0.03`, so with 28 rows the last bar started 0.81 s in and finished past 1.7 s.

**Verified by emulating the media query**, sampling the `<h1>` opacity every 120 ms from
`domcontentloaded`:

| `prefers-reduced-motion` | Early `<h1>` opacity samples |
|---|---|
| `no-preference` | 0, 0, 0, 0, **0.415, 0.866** — ramps, as designed |
| `reduce` | 0, 0, 0, 0, **1, 1** — jumps straight to final |

Computed `transition-duration` on a control drops from `0s` to `1e-05s` under `reduce`, confirming
the CSS block applies. Both modes settle with the headline at opacity 1 and all 81 bars at non-zero
width.

### 🟡 D3b — the page was blank without JavaScript — FIXED 2026-09-07

Separate defect, and the original D3 entry wrongly folded it in. Those four leading zeros in *both*
rows of the table above are not the entrance: `motion` serialises `initial={{ opacity: 0 }}` into the
server-rendered HTML, and `useReducedMotion()` returns false on the server because there is no
`matchMedia` there. So the masthead ships as `opacity: 0` in the HTML and only becomes visible when
React hydrates — regardless of the reader's motion preference, and permanently if JavaScript never
runs.

This is what the audit originally caught as the `<h1>` at `opacity: 0.058`, and `useReducedMotion()`
cannot fix it, because the decision happens before the client knows anything.

**It was worse than the first write-up said.** Counting the prerendered HTML rather than reasoning
about it: `/financiacion` shipped **32 elements at `opacity: 0`** — four masthead elements and all 28
party rows — **plus every bar at `width: 0px`**. Without JavaScript the page was not a blank hero, it
was a blank page.

**Applied: the entrances moved from JS to CSS.** `globals.css` gains an `.enter` class
(`@keyframes enter-rise`) and an `.enter-bar` class (`@keyframes enter-grow`), each taking its delay
from a `--enter-delay` custom property so the stagger stays presentational. A CSS animation runs
without JavaScript and starts from a state the HTML already carries, so the content is present either
way.

Two details that make it work:

- **Bars grow by `transform: scaleX()`, not by animating `width`.** The real width stays inline in the
  HTML, so the bar is the correct size with no JS. A `transition: width` then covers the other case —
  a filter change moves the bar without replaying the entrance.
- **`motion.li` stays, with `initial={false}`.** The row renders visible on the server while `layout`
  still animates reordering when a filter changes; the entrance lives on the inner `<Link>`.

The reduced-motion block also needed `animation-delay: 0s !important` — neutralising only
`animation-duration` would have left a reader who asked for less motion waiting out the stagger while
the element held its `from` state.

**Verified in three states**, not two:

| State | `<h1>` opacity | Party rows visible | Bars sized |
|---|---|---|---|
| **JavaScript disabled** | **1** | **28 / 28** | **40 of 53** (the rest are sub-pixel segments) |
| `reduce`, 150 ms after DCL | 1 | 28 / 28 | 41 |
| `no-preference`, sampled | 0.057 → 0.762 → 0.99 → 1 | 28 / 28 | 41 |

So the content is present without JavaScript, immediate under reduced motion, and still animates for
everyone else. `motion` now carries only what genuinely needs it: `layout` reordering, the two
client-fetched feeds, and `CountUp`.

### 🟡 D4 — the directory is 98 % initials

`data/photos.json` holds **133 portraits against 6,670 register rows: 2.0 % coverage**. The
politician directory — the largest section of the site, and the one users will spend most time in —
is therefore a grid of coloured initials. That is the honest fallback and the licence rule behind it
is right, but it means the most visual page has almost no imagery.

**Fix.** Not more scraping under looser rules — the exact-name-match and licence gates stay. Instead
make the initials tile a designed object rather than a placeholder: party colour as a field, the
person's role and chamber as typographic furniture, a consistent duotone treatment so a page of them
reads as a deliberate grid rather than a page of missing images. And put the coverage figure on the
page, because "133 of 6,670 have a freely-licensed portrait" is itself a fact about the commons.

### 🟡 D5 — touch targets

34 interactive elements measure under 44 px tall at 375 px wide: the "Menú" button at 31 px, filter
chips at 34–35 px, year chips at 34 px. They clear WCAG 2.2's AA minimum (2.5.8, 24 × 24 px) but sit
under the 44 px in platform guidance and WCAG 2.5.5.

**Fix.** `py-2.5` on the chips and a 44 px minimum on the menu button. Cheap.

### 🟢 What is already right

- **No horizontal page scroll at 375 px.** The wide foundations table scrolls inside its own
  `overflow-x-auto` box, which is the correct pattern and is often got wrong.
- The palette is disciplined: one accent, one alert colour, three text weights.
- `.section-tick`, `.eyebrow` and the panel gradient give sections rhythm without boxes everywhere.
- Portrait attribution is rendered wherever a photo appears — a licence obligation met in the UI.
- Locale lives in the URL and the toggle is always reachable.

---

## 2b. WCAG 2.1 AA audit — full pass, 2026-09-01

Nine route/locale combinations tested in the running app: structure and naming parsed from the
served HTML, contrast and focus measured with `getComputedStyle` on live elements, keyboard
behaviour driven with real key events, reflow tested at 320 CSS px. Ratios below are computed from
the actual rendered colours, including alpha compositing against the page background.

**Issues found: 8 · Critical 2 · Major 3 · Minor 3.** P1, P2, P3, O2, R1 and R2 were fixed on
2026-09-01 and re-verified; P4 was found by the verification sweep that followed P1 and P2. Open:
O1 (skip link), O3 (target size — partly done, the menu button is now 44 px), R3 (table semantics),
P4.

**A verification limitation, stated because it matters.** Real key events stopped being delivered to
the page partway through this session — the Browser pane reports itself hidden, and a listener
recording every `keydown` saw nothing for either Escape or a letter key. O2’s fix is therefore
verified the two ways that remain available: by code, and by dispatching a `KeyboardEvent` on
`document`, which exercises the exact listener the handler registers. The original finding does not
depend on that plumbing either — `components/Sidebar.tsx` (removed 2026-11-05) had no key handler at all, which is
visible in the source.

**On P3's fix.** `--line-strong` was doing two jobs: the boundary of interactive controls and
decorative rules and hover states. Raising it wholesale would have thickened panel edges and card
hovers that are not UI boundaries at all. Instead there is now a separate `--line-control` token at
`rgba(236, 226, 205, 0.4)` — **3.22 : 1** over `--ink` — used on the filter and year chips, the party
facet chips, both search fields and the mobile menu button. `--line` and `--line-strong` keep the
decorative work. Verified across the three filtered routes: every interactive control measures
≥ 3 : 1, worst case 3.22, and the active states sit at 8.30 on the gold border.

### Perceivable

| # | Issue | Criterion | Severity | Fix |
|---|---|---|---|---|
| P1 | ~~Active filter chip renders `--paper-dim` on `--gold` at **1.14 : 1**~~ **FIXED 2026-09-01** — now `--ink` on `--gold` at **8.30 : 1** | 1.4.3 Contrast | 🔴 Critical | done |
| P2 | ~~`--paper-faint` `#6f6857` is **3.48 : 1**~~ **FIXED 2026-09-01** — token is now `#8a8270`, **5.06 : 1** | 1.4.3 Contrast | 🔴 Critical | done |
| P3 | ~~Chips have no boundary other than a 1 px `--line-strong` border at **1.77 : 1**~~ **FIXED 2026-09-01** — a new `--line-control` token at **3.22 : 1** carries every interactive boundary | 1.4.11 Non-text contrast | 🟡 Major | done |

| P4 | ~~Avatar initials use the party’s brand colour as text; three party colours fall under 4.5 : 1~~ **FIXED 2026-09-04** — initials are `--paper` (**13.33 : 1**), the party colour moved to the ring and a tinted field; the gradient’s lightest possible stop still measures 9.46 : 1 | 1.4.3 Contrast | 🟢 Minor | done |

**On P4.** The initials carry `aria-hidden="true"` and sit immediately beside the person's name, so
they are redundant decoration rather than content, which is the case for treating them as incidental
text under 1.4.3. It is a defensible exemption but not a clean one. Fixing it properly is a design
decision and not mine to take: lightening the party colours misrepresents party identity, so the
better options are keeping the brand colour for the ring and tinted field while setting the initials
themselves in `--paper`, or raising the tile background contrast. Left for a decision.

### Operable

| # | Issue | Criterion | Severity | Fix |
|---|---|---|---|---|
| O1 | ~~No skip link on any of the nine routes~~ **FIXED 2026-09-01** — a 44 px skip link, translated out of view until focused, moving focus to `#main` (`tabIndex={-1}`), on every route in all three languages | 2.4.1 Bypass Blocks | 🟡 Major | done |
| O2 | ~~Escape does not close the mobile menu; focus stays on the trigger when it opens~~ **FIXED 2026-09-01** — Escape closes it and returns focus to the trigger, opening moves focus into the panel, and the button gained `aria-controls` | 2.1.2 / 2.4.3 | 🟡 Major | done |
| O3 | ~~34 interactive elements under 44 × 44 px at 375 px wide~~ **FIXED 2026-09-01** — zero standalone controls under 44 px across seven route/locale combinations; the remainder are inline text links, which 2.5.5 and 2.5.8 both exempt | 2.5.5 (AAA) / 2.5.8 AA | 🟢 Minor | done |

### Robust

| # | Issue | Criterion | Severity | Fix |
|---|---|---|---|---|
| R1 | ~~All 8 filter chips lack `aria-pressed`~~ **FIXED 2026-09-01** — the 8 Dashboard toggle chips carry `aria-pressed`; the directory’s party facets are links, so they carry `aria-current="page"` instead | 4.1.2 Name, Role, Value | 🟡 Major | done |
| R2 | ~~No live regions anywhere~~ **FIXED 2026-09-01** — `/es/financiacion` has a `role="status"` result count. **Correction to the original finding:** it named `/es/politicos` too, wrongly — that page’s search is a form GET, so it navigates, and a change of context is announced by the browser rather than being a status message | 4.1.3 Status Messages | 🟡 Major | done |
| R3 | `<th>` elements carry no `scope` (4 on `/financiacion`, 3 on `/metodologia`); neither table has a `<caption>` | 1.3.1 Info and Relationships | 🟢 Minor | Both tables are simple single-header-row, so association is already programmatically determinable — add `scope="col"` and a caption as good practice, not as a failure fix |

### Re-audit 2026-09-01 (after the P1–P3, R1, R2, O2 fixes)

Two new findings, both verified live; the fixed items were re-checked and hold.

| # | Issue | Criterion | Severity | Fix |
|---|---|---|---|---|
| N1 | ~~On `/votaciones` the per-group rows announce as “GS 116/0/1”. There are no column headers and no legend in that section, so what the three numbers mean is carried only by the colour of the bars — and those sit in a *different* widget higher up the page. The group codes themselves (`GS`, `GCUP-EC-GC`, `GPlu`) are never expanded either~~ **FIXED 2026-09-01** — rebuilt as `components/GroupBreakdown.tsx` (removed 2026-11-05; the topic pages' group tables replace it): a real table with a caption, `scope="col"` headers, `scope="row"` group names, Sí/No/abstención in their own columns, and the bar reduced to `aria-hidden` decoration | 1.3.1 Info and Relationships | 🟡 Major | done |
| N2 | ~~`aria-controls="mobile-nav"` dangles when the menu is closed~~ **FIXED 2026-09-04** — the panel is always mounted and its display switched by class, so the IDREF always resolves; zero dangling `aria-controls` across eight route/locale combinations | 4.1.2 Name, Role, Value | 🟢 Minor | done |

**Newly tested and passing.** These had been listed as untested:

- **1.4.4 Resize text** — text-only zoom to 200% at 1280 px: no horizontal scroll, no clipped boxes.
- **1.4.12 Text spacing** — with `line-height: 1.5`, `letter-spacing: 0.12em`, `word-spacing: 0.16em`
  and `2em` paragraph spacing forced: no overflow, no loss of content.
- **2.4.3 Focus order** in the opened mobile menu — the trigger is focusable #1, the panel occupies
  #2–#10, focus lands on #2 when it opens, and tabbing past the panel continues into page content.
- **1.4.1 Use of colour** on the vote bars — the Sí/No/abstention counts are present as text, so the
  information is not colour-only. What is missing is their *labelling*, which is N1 above.
- The mobile menu is a **non-modal disclosure**, not a dialog: it pushes content rather than
  overlaying it, and it correctly has no focus trap. Do not "fix" it into one.

**A measurement caveat worth recording.** The first portal run of the text-spacing test reported
horizontal overflow. It was an artifact: the Browser pane had collapsed and `clientWidth` read 0, so
every element "overflowed". Re-run with an explicit 1280 px viewport, it passes. Any run of this
audit should assert a sane viewport width before trusting an overflow result.

**R3 is also closed (2026-09-01).** Every table on the site now carries a `<caption>` and scoped
headers: `/votaciones` 138 `<th>` across 9 tables, `/financiacion` 42, `/metodologia` 18, all with
`scope`, zero tables without a caption, verified in all three locales. The two pre-existing tables got
a visually-hidden caption, since the heading above each already says the same thing on screen but the
table still needs its own accessible name.

**O1 and O3 are also closed (2026-09-01).** Every route in all three languages carries a 44 px skip
link that sits translated out of view until focused and moves focus to `#main`, and no standalone
interactive control measures under 44 px at 375 px wide. Inline text links are left as they are:
2.5.5 and 2.5.8 both exempt a target whose size is constrained by the line of text it sits in, and
padding them out would break the prose they are set in.

**A note on how the skip link is built.** `sr-only` + `focus:not-sr-only` was tried first and left the
link **2 px tall when focused** — `sr-only`'s `height: 1px` and `clip` survived the reset. It is
positioned absolutely and translated out of view instead, so the element keeps its real 44 px size at
all times, stays focusable and in the accessibility tree, and simply slides in.

**N2 and P4 are closed too (2026-09-04), so every item in this audit is now resolved.** The mobile
menu panel is always mounted with its display switched by class — `hidden` as an attribute would have
lost to the `flex` utility, since `[hidden]{display:none}` sits in Tailwind's base layer, which is the
same layer-order trap as D1. And the avatar initials are `--paper` on a party-tinted field, with the
brand colour kept in the ring: identity preserved, contrast fixed, and no party's colour altered.

### Passing, and worth keeping

Confirmed rather than assumed:

- **`lang` is correct per locale** — `es`, `en`, `ca` all served correctly (3.1.1).
- **One `<h1>` per route, no skipped heading levels** on any of the nine (1.3.1, 2.4.6).
- **`<main>`, `<nav>`, `<footer>` present on every route** (1.3.1). No `<header>` element, which is fine — the sidebar is the nav.
- **Every image has `alt`; every link and button has an accessible name; every input is labelled.** The search field carries `aria-label="Buscar"` plus a descriptive placeholder (1.1.1, 2.4.4, 3.3.2, 4.1.2).
- **Focus is visible under real keyboard use** — `:focus-visible` matches on Tab and the browser draws its default ring (2.4.7). Note the caveat: there is **not one `:focus` rule in the site's CSS**, so the indicator is entirely the user agent's. On this near-black ground it should be designed rather than inherited, but it is not a failure today.
- **Reflow passes at 320 CSS px** — no horizontal page scroll; the wide foundations table scrolls inside its own box; the only overflowing elements are `truncate` ellipses, which is intended (1.4.10, and 1.4.4 follows).
- **The mobile menu button sets `aria-expanded` correctly**, false → true on open (4.1.2).
- **Portrait attribution and licence are rendered wherever a photo appears**, which is both a licence obligation and useful non-text context.

### Not tested here

Automated and scripted checks catch perhaps a third of real barriers. Still outstanding: a pass with
an actual screen reader (NVDA or VoiceOver) over the politician profile and the votes page, where the
per-group ballot cards carry meaning through layout; and a check of whether the vote result colours
are distinguishable without colour vision (1.4.1 Use of Colour) — the group cards use red/gold/paper
to distinguish Sí, No and abstention, and whether the text label alone is sufficient needs a human
looking at it.

### Priority

1. **P1 + P2** — one selector change and one token value. Fixes the invisible active control and the
   failing text colour, and P2 must land with P1 or 43 elements newly break.
2. **R1 + R2 + O2** — the filter chips and the mobile menu. These are the site's only stateful
   controls and all three defects sit on them.
3. **O1, P3, O3, R3** — skip link, control boundaries, target size, table semantics.

## 3. Visual hierarchy

**What draws the eye first** on the portal: the serif `<h1>`, correctly — once it has finished
animating in.

**What draws it second:** nothing in particular, and that is the problem. The headline figures
(€300.6 M public, €2.1 M private) are set as text in a `<dl>` at roughly body scale. The single most
important comparison on the site — two orders of magnitude between public and private money — is
carried entirely by the reader parsing two numerals. It should be the first *shape* they see.

**Reading flow** is a single column of stacked sections at a consistent rhythm. It is calm and it
works, but every section has the same visual weight, so nothing signals "this is the finding" versus
"this is context". The pages read like a well-set report and not like a story with a lede.

---

## 4. The plan: making it visual

Ordered so that each step ships on its own. Steps 0–2 are corrective; 3 onward add.

### Step 0 — clear the WCAG audit in §2b

Not visual work, but everything below inherits the colour system and the control patterns, so it
goes first. Take it in the priority order at the end of §2b. It is measurable: re-run the contrast
table and confirm every token pairing passes AA, confirm the active chip reads `--ink` on `--gold`
(8.30 : 1), confirm Escape closes the menu, and confirm a result-count status node exists on both
filtered pages.

### Step 1 — a charting primitive, not a charting library

The plan in `PLAN-CONTEXT-LAYER.md` already settled this: stay hand-rolled, add `d3-scale` /
`d3-shape` only if a real need appears, no charting framework. What is missing is the shared piece
every chart needs. Build `components/chart/` (built in October 2026, removed 2026-11-05) with:

- `Frame` — viewBox, responsive sizing, axis rules in `--line`, the site's type scale for ticks.
- `Bars`, `Line`, `Dots` — thin wrappers over `<rect>`, `<path>`, `<circle>`.
- `Marker` — a labelled reference line, since almost every chart here needs one (the SMI, the median,
  the national mean).
- `SourceLine` — the citation strip already used in prose, as a chart footer.
- `DataTable` — every chart renders an accessible table alongside, toggleable. This is civic data;
  a chart that only works visually excludes people.

Server-rendered SVG, no client JS unless a chart is interactive. This matches the existing pages,
which are static, and it keeps the bundle where it is.

### Step 2 — replace the `div`-width bars with real bars

The 27 + 27 existing percentage-width divs become `Bars`. Same look, but they gain axes, ticks,
labels and a table, and they stop being invisible to a screen reader.

### Step 3 — give each page one lead visual

The rule: **every page opens with one image that carries its finding**, then prose supports it.

| Route | Lead visual | What it shows |
|---|---|---|
| `/` portal | Public vs private money at true scale, one axis | The 140× gap, as a shape |
| `/financiacion` | Sankey: state → party → linked foundation | The route the money takes, which nobody else renders |
| `/politicos` | Salary distribution strip with the register plotted on it | Where public pay sits, before you search |
| `/politico/[slug]` | The person's ballots as a compact grid + their pay against the register's distribution | Currently zero visuals on a page that is entirely about one person |
| `/party/[nif]` | Stacked money over time in the party's own colour | Currently two bars |
| `/votaciones` | Group-by-vote matrix | The juxtaposition grid from the context-layer plan |
| `/metodologia` | Coverage bars: what fraction of each dataset is actually populated | Turns the honesty section into something you can see |

That last one deserves emphasis. The site's strongest quality is that it states its gaps. Right now
those gaps are prose. **A coverage chart — 133 of 6,670 portraits, 268 of 6,670 with a roll-call
record, 4,964 of 6,670 with a published salary, 2 of N donation years — makes the honesty visible**,
and no comparable site does that.

### Step 4 — the context layer's charts

`PLAN-CONTEXT-LAYER.md` §6 already specifies ten. Build them on the Step 1 primitives, in its order:
wage ladder, SMI-multiples histogram, housing map, indexed divergence lines.

### Step 5 — motion that means something

Once D3 is fixed, spend the motion budget where it carries information rather than on entrances:
bars growing from zero on first view, the count-up on figures that are already there, a marker line
sliding when a filter changes. Everything gated on `useReducedMotion()`.

---

## 5. Priority

1. **D1 + D2** — an invisible active filter and a failing text token, both one-line fixes to a token
   and a selector. Highest ratio of harm removed to effort.
2. **Step 1 + Step 2** — the chart primitives, then convert what already exists. Nothing new is
   claimed; the existing bars simply become real, accessible, labelled charts.
3. **Step 3, starting with `/metodologia` and `/politico/[slug]`** — the coverage chart because it is
   unique to this project, and the profile page because it is the page with the most words and the
   fewest pictures.

D4 and D5 ride along with Step 3.
