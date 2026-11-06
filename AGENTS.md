# AGENTS.md — Siguiendo el Dinero

Working guide for anyone (agent or human) continuing this project. The README is the
reader-facing document; this one covers how the thing is built, why it is built that way, and
where the sharp edges are. `NEXT-STEPS.md` covers the planned work and how to carry it out.

## What this is

A transparency portal on the money and votes behind Spanish politics, in Spanish, English and
Catalan, deployed on Vercel.

| Layer | Source | Freshness |
|-------|--------|-----------|
| State subsidies to parties | BDNS / SNPSAP REST API | Live, daily cron |
| Private donations to parties | Tribunal de Cuentas report 1573 (2020) | Fixed, transcribed |
| Parties' ordinary income, public and private | Tribunal de Cuentas reports 1532 (2018, 2019; Anexos IV, V, VII, VIII) and 1573 (2020; Anexos IV, V) | Fixed, transcribed |
| Party-linked foundations | Tribunal de Cuentas report 1.642 (2021–22) | Fixed, per-dossier |
| Electoral spending by category | Tribunal de Cuentas report 1.628 (EP 2024) | Fixed, per-formation |
| Public salaries of officeholders | Registro de Altos Cargos CSV export | Rebuilt from script |
| Key roll-call votes | Congreso de los Diputados open data | Rebuilt from script |
| Portraits | Wikipedia / Wikimedia Commons | Rebuilt from script |
| Politician social + news | Bluesky public API, Google News RSS | Live per request |
| Rights and housing news | Curated RSS/Atom registry in `lib/news-sources.mjs` | Live per request, 30 min cache |

Stack: **Next.js 15 (App Router) + TypeScript + Tailwind v4**, with the design in
`app/[locale]/site.css` (see "The design system" below). No chart library and no animation library.

## The rule that shaped everything: do not fabricate

This app makes claims about named real people. Every figure and every identity link is either
pulled from an official source or transcribed from a cited one. Where a source could not be
verified, the feature was cut rather than faked.

- **No inferred political stances.** The original brief asked for each politician's position on
  trans rights, abortion and housing. That was declined and replaced with recorded roll-call
  votes. Most of the register is local councillors, including 3,944 "Independiente" entries with
  no national record; attributing invented positions to them would be defamation-shaped at
  scale. A person shows a position only if their vote is on record, and someone with no record
  shows "sin voto registrado" plus a note that their position is **not** inferred from their
  party — never a blank that reads as absence of opinion.
- **Money and votes are juxtaposed, never causally linked.** The footer of every page, a
  deputy's vote section, and the topic pages' group tables carry a line stating they are published
  together so they can be looked up, not because one explains the other.
- **Say what was voted, not what it meant.** A ballot is a side taken on the subject actually put
  to the vote, never a position on the law in general. This matters: on the Ley 4/2023 ballot,
  which was on the Senate's amendments, a group-level "en contra" read on its own put EH Bildu
  against the trans law, when a vote against there can mean rejecting the amendment. The first
  version of the site therefore labelled ballots "votó Sí / votó No / se abstuvo" and showed each
  ballot's subject on its card. The new design adopted "a favor / en contra / abstención" in all
  three languages (`components/nuevo/vote-copy.ts`; CHANGELOG, 2026-11-04). The topic page prints
  each division's subject in the record's own wording (`whatWasVoted()` in
  `components/nuevo/topics.ts`) beside the ballots; the person page, the party page and the front
  page show the law's name and the date (and, on the person page, the kind of vote), with a link to
  the official record, but not the subject (see "Known gaps"). A new place that shows a ballot
  label must show the subject with it.
- **Vote kinds are labelled.** A *proposición no de Ley* or a *moción* is a non-binding position
  statement, not the passage of a law, and the UI says so. Amendment votes are excluded from the
  published set so the selection cannot be cherry-picked.
- **Tally verification.** `scripts/fetch-votes.mjs` pins each published vote by
  (legislature, session, number) with the tally expected on the official record, and refuses to
  publish when they disagree — that catches grabbing the wrong ballot.
- **No fuzzy identity matching.** Portraits attach only when the Wikipedia article title equals
  the person's name. Social handles link to register rows by token-subset, accepted only when
  exactly one row qualifies. An ambiguous match is dropped, because a wrong link would attribute
  someone else's accounts or face to a named person.
- **Bluesky handles verified one by one** (follower count and bio). Two impersonation accounts
  were caught and excluded during the build.
- **Per-politician funding does not exist** and is not invented. Subsidies go to parties;
  profiles link to the party's funding instead.

## The foundation channel runs the other way

Worth stating because the obvious guess is wrong, and the site used to imply it.
Parties may take **no** corporate money (LO 8/2007 art. 5: no *personas juríicas*, no anonymous
donations, €50,000 a year per individual, and a donor holding a live public contract must be
refused). Their **foundations** are governed by *disposición adicional séptima*, where legal
entities *may* donate — over €120,000 by public deed, notified to the Tribunal de Cuentas within
three months, donor identity published.

So the arrow runs into the foundations. But in the audited figures the corporate share is small:
across 2021–22, **89.8% of the €7.9M of contributions came from the parties themselves** and 4.6%
from companies, with €4.9M of public subsidies on top. The page leads with party money for that
reason. Do not rewrite it around a corporate-capture framing the figures do not support.

## The people layer is curated, and its sources are typed

`lib/foundation-people.ts` names living people, so it carries stricter rules than any other layer
and the types enforce them:

- **One dated source per record**, with a URL. A record without one does not exist.
- **`SourceKind` drives the rendering.** `registry` and `official` read as statements of record;
  `press` renders as *"según <publisher> (<date>)"*. They are never merged or counted together.
  This is the ODIHR rule the research verified 3-0: the label must match the evidentiary status of
  the source.
- **Nothing is inferred.** No score, no ranking, no derived edge. A tie exists only where a named
  source states it. `former: true` where the source puts a role in the past.
- **Names join by `nameKey`**, so an ambiguous match is dropped rather than guessed, exactly as with
  portraits and social handles.

**Chase the primary source.** Three secondary sources were wrong here. Wikipedia lists an
eight-member Disenso board from 2020 against the foundation's own filing of three. A 2017 PSOE
announcement of the Fundación Pablo Iglesias board would have published Félix Bolaños as its
secretary today. And a press report had Pablo Iglesias presiding over Podemos's foundation with
Monedero as director, where the entity's own patronato page shows neither and only one name in
common. Where a board could not be established at all, that goes in `BOARD_GAPS` and prints on the
dossier — the absence is a finding, because apartado Seis requires publication.

## The design system: routes, two typefaces, and quiet everything else

The site's look is defined in one stylesheet, `app/[locale]/site.css`, and drawn by the components
in `components/nuevo/` (the folder name dates from the prototype that ran at `/nuevo` before
2026-11-05; the components are the site's). The root layout, `app/[locale]/layout.tsx`, puts the
class `n-root` on `<body>`, and every token (`--n-*`) and class (`n-*`) is scoped to it. The `n-`
prefix is kept so the design's classes stay greppable among the Tailwind utilities, which still
do layout (grid, spacing, flex) on every page. `app/globals.css` holds only the Tailwind import,
two element defaults in `@layer base`, and the reduced-motion rule.

The design history is in `CHANGELOG.md`: "A redesign prototype at /nuevo, built on the route map"
(2026-10-30), "The prototype in English and Catalan…" (2026-11-04) and "The new design becomes the
site" (2026-11-05). The previous system (newsprint palette, `--ink`/`--gold` tokens, `label-mono`
and `panel` classes, `components/chart/`) is gone; do not reintroduce its names.

### One motif: money takes routes, and a line with stations draws them

The front page draws where the money comes from as a transit map (`RouteMap`), and the same grammar
carries everything else that is a sequence or a path: the years an audit covers, a topic's votes in
date order, the four kinds of record the people directory holds about each person, a court record's
chain of bodies and dates. `Line` is the primitive; `Ladder` is a line stood on end.

**One colour per route.** A route class sets `--route`, and every mark inside reads
`var(--route)`, so a component takes its colour from the class on itself or an ancestor rather than
from a prop:

| Class | Route | Token |
|---|---|---|
| `n-state` | State money: subsidies, published public pay | `--n-state` |
| `n-donors` | Private donors to parties | `--n-donors` |
| `n-foundations` | The party foundations | `--n-foundations` |
| `n-companies` | Companies (and, in the directory, the asset declaration) | `--n-companies` |
| `n-topic` | The topics and their votes, which are lines but not money | `--n-topic` |
| `n-neutral` | Anything that belongs to no route (feeds, organisations' voices) | `--n-ink-3` |

A route's colour is used for its line, its marks and its figures, and for nothing decorative.
Every route colour clears 4.5:1 against `--n-bg` and `--n-card` in both themes, so a figure may be
set in its route's colour (`n-route-text`); the measured ratios are in the comment at the top of
`site.css`.

**Solid or filled means on record; dashed or hollow means not on record.** A filled station is a
record the site holds; a hollow one is a record it does not hold or has not transcribed yet; a
dashed segment or outline is a stretch the record does not cover. This holds across the site:
`Line`, the people directory's four stations, `BallotStrip` (a hollow cell with a solid outline is
"on the roll, no ballot cast", a dashed one "not on the record of that division"), the deputies'
declaration dots on `/territorios`, `InvestitureRecord` (filled when a recorded tally shows the
votes, hollow and dashed when only the seat arithmetic is verified), and `CourtRecord`, where only
"nothing on record" is dashed. The one different use is `RouteMap`: its dashed lines are links that
are **not money** (the same people appear on both sides of a record), and its legend says so.

**Never solid-versus-dashed, filled-versus-hollow, or colour alone.** Every such distinction is
also said in words: in a legend beside the mark, in an `sr-only` span on the mark, or in the table
under the graphic. Votes against are hatched (`n-hatch`) as well as differently coloured.
"Not on record" is never presented as "does not exist", and the legends say that too.

Line weights on the route map are equal on purpose: the figures run from about 300 M€ to under
400.000 €, so a weight scaled to money would make every route but one vanish. The figure is printed
on each line instead.

### Two typefaces, each with one job

Both are loaded with `next/font` in `app/[locale]/layout.tsx` and exposed as `--n-serif` and
`--n-sans`. The `next/font` variables (`--font-literata`, `--font-atkinson`) are set on `<html>`,
so `body.n-root`, where `--n-serif` and `--n-sans` refer to them, inherits them. The previous
system declared its font tokens on `:root` while the variables sat on `<body>`, and every page fell
back to the system sans; keep the variables on `<html>`.

- **Literata** (`--n-serif`) carries what the site *says*: the page title (`n-display`), section
  headings (`n-h2`), the finding sentence (`n-finding`), and display figures (`n-figure`). It was
  drawn for long reading on screens and its figures are sturdy at display sizes.
- **Atkinson Hyperlegible Next** (`--n-sans`) carries what a reader *looks up*: body text, labels
  (`n-label`), meta lines (`n-meta`), tables, figures in running text, `n-h3`. Its letterforms
  cannot be mistaken for one another (1 l I, 0 O), which is the job a table of declared amounts has.

No capitals for labels, and nothing under 13px (`n-meta` and `n-source` are 0.8125rem). Figures in
tables and running text use tabular numerals (`n-num`, `n-r`).

### The classes

| Class | Use |
|---|---|
| `n-shell` | The page column: max width `--n-w-wide` (72rem), side padding that shrinks to 1rem on a phone |
| `n-section` | A section: a hairline rule above, generous vertical padding |
| `n-display`, `n-h2`, `n-h3` | Page title, section heading, sub-heading |
| `n-finding` | The one sentence a section exists to show |
| `n-body` | Running text, limited to a reading width (`--n-w-read`, 42rem), in `--n-ink-2` |
| `n-label`, `n-meta` | Small bold labels; quiet small print in `--n-ink-3` |
| `n-figure`, `n-num` | A display figure in the serif; tabular numerals anywhere |
| `n-source` | The source line under a figure |
| `n-table`, `n-r` | A reference table; a right-aligned numeric cell |
| `n-state` … `n-neutral`, `n-route-text` | The route colour (see above); text in it |
| `n-hatch` | The hatch for votes against |
| `n-search`, `n-button` | The search field and its button (3rem tall) |
| `n-skip` | The skip link |
| `n-route-draw` | The route map's line drawing, only under `prefers-reduced-motion: no-preference` |

The rules in `site.css` are **not in a cascade layer**, so on any property they set they beat a
Tailwind utility on the same element, whatever its specificity (Tailwind v4 puts utilities in
`@layer utilities`, and unlayered rules win over every layer). That is why the header and the data
index write `!no-underline hover:!underline` on links: `.n-root a` sets the underline. Override one
of these properties with the `!` modifier or an inline style, and do not move `site.css` into a
layer without checking every page, because the change would flip which rule wins everywhere at
once. The same trap bit the previous stylesheet twice (62 call sites of one class rendered the
wrong colour in September, and an unlayered `a { color: inherit }` overrode every link's colour
class until 2026-10-19). Element defaults that utilities should override go in `@layer base` in
`app/globals.css`.

### How a page is built

Every page follows the same order, and the section components follow it too:

1. **A title and a plain intro.** `h1.n-display`, then one `n-body` paragraph that says in plain
   words what the page holds. On a detail page, a small `n-meta` link above the title leads back to
   its index (`breadcrumb` in the copy).
2. **Sections**, each `<section className="n-shell n-section">` labelled by its `h2.n-h2` through
   `aria-labelledby`. Most pages define a small local `Section` helper for this.
3. **One computed finding per section**, set as `n-finding`: the sentence the section's figures
   show ("PP, PSOE y Vox recibieron el 72 %…"). It is a function in the page's `copy.ts`, filled
   from the same rows the graphic draws, so it follows the data. It states a size, a share or a
   count; never a reason, never a comparison the page does not draw. Where the figures are too few
   for the sentence to say anything, it is left out.
4. **The graphic, then the figures in words or a table.** Every graphic is `aria-hidden` and its
   numbers are somewhere a screen reader reaches: printed beside the marks (`ShareBar`'s list,
   `VoteBar`'s counts, every rung of a `Ladder`), or in a table under it, usually folded in a
   `<details>` so the next section stays within reach.
5. **The source on the page**, as an `n-source` line at the end of the section (or `SourceText`):
   publisher, the dataset or report as the publisher names it, the period or fetch date, and the
   link. Build it from the data or the module constant the figures came from (`lib/chart-sources.ts`
   and the `*_SOURCE` constants in `lib/donations.ts`, `lib/party-income.ts` and the like), never
   by typing a URL or a date at the page.

**A section with nothing on record says so** rather than disappearing (`noPrivate`, the court
record's "nothing on file" card, `people.noRecord` on a person with no recorded vote), because the
gap is part of the answer. The page frame's footer carries the juxtaposition line on every page.

### Figures, shares and missing values

- **"—" for a missing figure, never 0.** Unknown is not zero: a `Ladder` rung or table cell the
  source leaves empty prints "—" and draws no bar.
- **"menos del 1 %" for a share that is not zero but rounds to it**, never "0 %" (`shareWords` in
  the money and party copy, `lessThanOne` in the foundations and methodology copy). Small shares
  take one decimal under 10 %.
- **Never add up across years or across a set of parties.** Each year of income, each report and
  each election is its own proportion, side by side; the money page shows state subsidies per year
  rather than as a running total.
- **A localised percentage is not a CSS length.** `es-ES` renders 0.545 as "54,5", and a bar given
  `width: 54,5%` collapses to nothing rather than erroring. Widths are computed with `toFixed()` or
  `flexGrow` (or `cssPercent()` from `lib/format.ts`); `percent()` is for display only.
- **Bars start at zero and share a stated scale.** `ShareBar` divides one whole; `VoteBar` divides
  the ballots cast; `Ladder` and `SmiPosition` share one scale set by the largest rung, and every
  rung also prints its exact figure, so nothing is read off a length alone. A minimum width keeps a
  real non-zero figure visible; that small distortion is acceptable only because the exact figure
  is printed beside it. `PayDistribution`'s axis is logarithmic and says so on the chart.

### Tables

Every table on the site follows one pattern (26 tables, 26 captions at the time of writing):

```tsx
<div className="overflow-x-auto">
  <table className="n-table min-w-[34rem]">
    <caption className="sr-only">{t.grantsCaption(party.displayName)}</caption>
    <thead><tr><th scope="col">…</th><th scope="col" className="n-r">…</th></tr></thead>
    <tbody><tr><th scope="row">…</th><td className="n-r">…</td></tr></tbody>
  </table>
</div>
```

- **A wide table scrolls inside its own box**, never the page. Give the table a `min-w-[…]` so its
  columns do not crush, and the `overflow-x-auto` wrapper takes the overflow at 375px.
- **A caption, always,** visually hidden when the heading above already says the same thing on
  screen, because the table still needs its own accessible name.
- **`scope="col"` on column headers, `scope="row"` on the cell that names a row.**
- Headers are sentence case. Figures are right-aligned with tabular numerals (`n-r`).
- Long tables start folded in `<details>`, with a summary that says how many rows they hold.
- Rows are in the order the source or the alphabet gives, never ordered by an amount a person
  declared or by anything that would read as a ranking of people.

### Words: a `copy.ts` beside every page

Each page keeps its words in a `copy.ts` (or `copy.tsx` where a sentence carries a link or
emphasis) beside it, in this shape:

```ts
const es = { title: "Personas", finding: (people: string, …) => `El sitio tiene registro de ${people} personas…`, … };
type Copy = typeof es;
const en: Copy = { … };
const ca: Copy = { … };
export const COPY: Record<Locale, Copy> = { es, en, ca };
```

The page reads `COPY[locale]`, with `locale` and `bcp47` from `getDict()` in `lib/i18n.ts`. `Copy`
is the Spanish block's type, so a key missing from English or Catalan fails the type check.

- **A sentence that depends on a number is a function**, given figures already formatted for the
  locale (and the raw count where grammar turns on it). Plurals, agreement, "menos del 1 %" and the
  Catalan article before a percentage ("l'1 %" against "el 54 %") are written out per language,
  never assembled by concatenation.
- **Components carry their own words** for the three languages, either from the page's copy as a
  prop (`OrgVoicesCopy`, `ProvincePickerCopy`) or in a `*-copy.ts` beside them (`vote-copy.ts`,
  `court-copy.ts`, `investiture-copy.ts`, `feed-copy.ts`). Every component takes the locale.
- **Not translated, because it is data as recorded:** names of parties, people, foundations,
  places and laws; vote titles as Congreso records them; posts as the Register writes them; report
  titles. Board roles are translated only where they are a plain title (`components/nuevo/roles.ts`).
- `lib/i18n.ts` still holds the dictionary blocks several pages share (the skip link, the theme
  toggle's words, `people`, `declarations`, `feed`, the source-line pieces). New page words go in
  the page's `copy.ts`.
- **A function cannot cross to a client component.** A client component imports its words
  (`NewsFeed` and `BlueskyFeed` import `feed-copy.ts`) or receives plain strings (`ThemeToggle`
  takes `dict.masthead`); never pass a whole dictionary or a copy block with functions in it.

### Accessibility: what every page must meet

- **No horizontal page scroll at 375px.** Multi-column layouts collapse with Tailwind breakpoints;
  wide tables scroll in their own box; the route map is drawn in a 360-unit box so its 13-unit
  labels render at about 13px on a phone and scale up from there. At the switch-over, 15 pages
  across the three languages were checked at 375px.
- **A visible focus ring everywhere**: `.n-root :focus-visible` draws a 2px outline in `--n-focus`.
  A skip link (`n-skip`) is the first focusable element, translated out of view until focused (not
  `sr-only`, which left it 2px tall when focused), and moves focus to `#main`.
- **Reduced motion is honoured.** The only animation is the route map's line drawing, and it is
  declared inside `@media (prefers-reduced-motion: no-preference)`; `app/globals.css` also
  neutralises every animation and transition under `reduce`. The `motion` dependency was removed
  with the old pages; do not bring back entrance animations, which once left whole pages at
  `opacity: 0` without JavaScript.
- **Both themes, measured.** See below.
- **Text 4.5:1, graphics and control boundaries 3:1,** against `--n-bg` and `--n-card`, in both
  themes. `--n-rule-strong` is a border for decoration only (2.8–3.2:1); form controls take
  `--n-ink-3`. Search fields and buttons are 3rem tall.
- **Every form control has a label** (often `sr-only`), filters that are links carry
  `aria-current="page"` for the active choice, and a result count that changes is a polite live
  region.
- **No label is truncated.** Names wrap.

### Two themes, and the rule for every new colour

There is a light theme and a dark one, and both are the same tokens with different values. The
dark values live in `app/[locale]/site.css` twice: under `@media (prefers-color-scheme: dark)`
guarded by `:root:not([data-theme="light"]) .n-root`, and under `:root[data-theme="dark"] .n-root`.
Change one, change both. The comment block at the top of the file records every measured ratio.

**How the choice works.** The site follows the reader's system setting until the reader picks a
theme with the header toggle (`components/ThemeToggle.tsx`: three buttons, light / dark / system,
each with `aria-pressed`). A pick is stored in `localStorage` under `theme` and set as `data-theme`
on `<html>`; "system" removes both, so the media query takes over and follows the system live,
without a reload. An inline script in `<head>` (`app/[locale]/layout.tsx`) applies a stored pick
before first paint, so there is no flash of the wrong theme. `suppressHydrationWarning` sits on
`<html>` only, because that is the one element the script changes before React hydrates.

**A dark theme has failed once already in this project's history.** The first visual system was
dark; its muted text measured 3.48:1 and its chip borders 1.77:1, and it stacked an aura, a
vignette, shadows and a tint over photographs, each lowering contrast somewhere nobody had
measured. The current themes have no overlays, glows or shadows. Keep it that way. Measure; do not
read a design handoff's contrast table (the last one asserted two passes that were failures).

- **Every new colour needs a dark value with a measured contrast**, recorded in the comment at the
  top of `site.css`, before it ships. A colour written as a literal in a component does not change
  with the theme, so do not write one: add a token, or derive one with
  `color-mix(in srgb, var(--route) N%, var(--n-bg))`, as `ShareBar` does for its parts.
- **Party colours are data and are never adjusted, and never set on text,** where some fall under
  4.5:1. Today a party colour appears only as the ring of a `Portrait`; everything else is drawn in
  route colours.
- **Photographs are never inverted or filtered for the theme.**

## The court record's status is a type, not a string

`lib/court-records.ts` holds the four resolutions that passed the 3-0 panel in
`research/hate-accountability.md`. The status label is the entire point of the component, so it
is a union type rather than translated copy, which makes four specific errors unrepresentable:

- an archived case is `archived`, **never** "acquitted" — both *menas* decisions are autos
  confirming *sobreseimiento* at the instruction stage, a finding of no *indicios*, and never a
  merits judgment;
- an open case is `awaiting-trial`, and there is no status that would let an *auto de apertura de
  juicio oral* read as a verdict;
- an electoral board's order is `advertising-infringement` and nothing more, because the Junta
  Electoral de Zona expressly declared itself not competent over the content;
- a complaint *against* someone is `complaint-archived`, and the record says whose conduct it
  concerns.

The copy is translated three ways; the tag is not, so no translation can turn an archiving into
an acquittal. A party with nothing on file gets an explicit card saying so and saying what it
does not mean — rendering nothing would read as a clean record, and rendering "0" would invite a
comparison four hand-verified records cannot support.

Publishing a live prosecution by name (the Herrero record) processes a living person's
criminal-proceedings data and engages art. 10 LOPDGDD and LO 1/1982. It is published because she
is an elected officeholder, the opening order was reported by five outlets across the spectrum,
and the label states its procedural stage and nothing beyond it. That is a different thing from
the per-politician conviction tag this project declined to build, which would have required
attributing findings from records that are pseudonymised at source.

## The officeholder join needs two conditions, and a name is not one of them

`lib/officeholder-ties.ts` attaches the public offices in `data/salaries.json` to the people who
govern the party foundations. It is the only join here that connects a **named living private
individual** to a record neither they nor the foundation published, so a wrong match would put
someone else's public office against a named person. Two conditions must both hold:

1. **One distinct post per folded name.** `nameKey` is order-independent and accent-folded, which
   is what lets "Apellidos, Nombre" meet "Nombre Apellidos". It is not an identity. Measured:
   6,670 officeholders resolve to 6,663 folded names, three of which cover genuinely different
   posts — 0.045 %. A key covering more than one post yields nothing, never the first of them.
2. **The party must agree** with the party the audit report links the foundation to, or the
   officeholder must be recorded as unaffiliated (how the register carries government delegates
   and senior appointees). This is what turns a name match into evidence: two people who happen
   to share a folded name have no reason to share a party with a foundation neither was matched
   on. All fourteen current matches agree, and each was read by eye.

The office is stated **as the register had it on the register's own last-updated date**, which
travels on every tie and is rendered. There is no per-person date and no active flag, so a title
that has since changed hands is the register's staleness, shown as such. And nothing asserts that
a board seat and an office are connected — two public records about one person, side by side.

`npm run check:office-join` fails rather than warns, on the assumption underneath the join (the
collision ceiling), on the `ROLES` literal still being parseable, on every published slug
existing in the register, and on the join not having silently stopped matching.

It does **not** re-check the party condition, on purpose. That would mean reimplementing
`partyNifFor` in JavaScript — the report writes "Partido Socialista Obrero Español" where the
register writes "PSOE" — and a second copy of a rule drifts from the first. The script's own
first draft tried it with substring matching and failed all ten PSOE and PNV matches, which is
the drift in miniature.

## The deputies' declarations are transcribed, and nothing is published unchecked

Congreso publishes two declarations per deputy, and they could not be more different to ingest.
The **Intereses Económicos** are open data: `docacteco__*.json`, one row per prior activity,
foundation or association, gift or remark, reproduced on the profile as published (the `sector`
field is free text and is never normalised). The **Bienes y Rentas** exist only as one scanned PDF
per deputy, so they are transcribed here.

**Who gets a profile.** The profile spine was the pay register, which carries only 229 of the 350
sitting deputies: 217 under the same folded name, 12 under a longer or shorter one. `lib/deputy-join.mjs`
links a deputy to a register row only on the officeholder join's two conditions: one register row
with that folded name (or a `DEPUTY_ALIASES` entry), **and** agreeing party families (PSC sits with
PSOE, the parties of the 2023 SUMAR list with Sumar). A deputy whose name appears nowhere in the
register, not even inside a longer name, gets a profile from Congreso alone (121 of them): no pay
figure, `inRegister: false`, the gap stated, and no salary-distribution or SMI block, because those
blocks' "the register publishes no figure for this post" would be false. A deputy with a candidate
row is never linked or duplicated automatically: `check:deputies` lists the candidate, a person
reads it, and only then does it go into `DEPUTY_ALIASES` with the review date. All 12 aliases are
Congreso posts in the register, carried as "Madrid" the way the register carries Congress deputies.

**Which filing.** Each deputy's first filing of the legislature, the one made on taking the seat:
it puts every deputy on the same footing (income of the year before), and it is the filing RTVE
transcribed. Later filings are listed on the profile with their date and a link, not transcribed.

**How a transcription earns publication.** Readers follow `scripts/declaration-transcription.md`:
verbatim text, Spanish amounts parsed, illegible cells left null and listed, nothing inferred, and
no marital status, matrimonial regime, age or signature. `build:declarations` publishes a reading
only when its section totals (`lib/declaration-totals.mjs`) equal RTVE's published totals for
income, financial assets and debts, or equal all four totals (IRPF included) of an independent
second reading. Everything else is listed and left out, and the profile links the PDF instead.
RTVE is a **check, never a source**: its figures are cached locally, never published and never
committed, and it has its own errors — it records a Toledo house of Agustín Conde Bajén as bought
("compraventa") where the scan says inherited ("Herencia").

What the check does not cover, said plainly: text fields are not cross-checked, and an
RTVE-checked entry's IRPF line rests on the one reading, because RTVE's listing does not carry it.
The page's caveat says both.

**What the build changes, and what it flags.** A published reading is never edited by hand. The
build makes one change in code: a licence plate typed into a vehicle row becomes "[matrícula
omitida]", since the form itself asks for none, and `build:declarations` prints every replacement so
a false match is caught on review. An amount written other than in Spanish format is read by a
fixed rule (a comma followed by exactly three digits is a thousands separator, since euro amounts
never carry three decimals; an apostrophe is a decimal mark) and recorded in `notes` with the cell
exactly as written; the page shows that written form beneath the figure, and `/datos` carries it.
A third came from the third batch: several figures stacked in one amount cell become one row each,
never a sum. Two layout rules come from the second batch: a row with an amount and an empty first cell is kept
with that cell null, and loan rows a deputy continued into the "otras deudas" box are transcribed
as loans. The form's last block, "otros bienes, rentas o derechos", holds rents as well as assets;
its items count towards the deposits-and-other-assets total, and the page labels them with the
block's own title rather than calling them assets.
The deposits block asks for one balance across all accounts, so a
figure may sit beside one account line with null on the rest, and the page says so. A deputy with
no rows in the interests file gets a stated gap rather than a missing section.

**What the page will not do.** There is no grand total, because the form gives property no value
and a "net worth" would leave out what is often the largest asset. There is no ranking of deputies
by anything declared, and no tally of how the owners of N properties voted. The declaration sits
above the recorded votes on the profile, and the vote section carries the juxtaposition line; that
is the whole link. The side-by-side table at `/personas?kind=declarations` keeps the same rules: Congreso's
surname order, no sorting by any amount, properties and vehicles counted rather than valued, and no
column summed across deputies.

## Graphics: what each one draws, and what it must carry

There is no chart library and no chart primitive any more: each graphic is a small server-rendered
component in `components/nuevo/` (only the two feeds and `ProvincePicker` run in the browser), drawn
with SVG or plain boxes and the route classes. `RESEARCH-DATAVIZ/05-checklist.md` is still the
checklist to run before a new graphic ships; it was written for a time-series study, so the
index-chart, event-marker, chance-band, control-group, smoothing and gap-detection items do not
apply here, because nothing on this site is a time series or a before-and-after study.

| Component | Draws | Its words |
|---|---|---|
| `RouteMap` | Where the money comes from, as a transit map | Each route's figure on the line; legend for solid and dashed |
| `Line` | A sequence: years, votes, records | Each station labelled; on record or not said beside it |
| `ShareBar` | One whole split into its parts, in the route's colour at falling strength | Every part named with its figure under the bar |
| `DotGrid` | A count drawn one dot per item (the 349 declarations) | Each group named with its count in the legend |
| `Ladder`, `SmiPosition` | Rungs on one shared scale (wages in multiples of the SMI) | Every rung prints its figure; "—" where the source is empty |
| `PayDistribution` | One person's pay on the register's distribution, log axis | A sentence with rank, denominator and median, and a table |
| `VoteBar` | One division's result: in favour, against (hatched), abstentions | The counts in words under it (`voteCountsText`) |
| `BallotStrip` | One cell per tracked division for one person | A legend for every mark shown and a table that says each cell |
| `InvestitureRecord` | A community's seat arithmetic and recorded rounds | The finding in words, the tally of each round, the source |
| `RegionMap` | The comunidades, plain, as a way to find a place | Encodes nothing; figures are in bars and tables beside it |

Rules that apply to every graphic:

- **Its numbers are reachable without seeing it.** The drawing is `aria-hidden`; the figures are
  printed beside the marks or in a table on the page.
- **It does not say more than the record.** `VoteBar` never says whether a motion passed, because
  organic laws need an absolute majority and the data has no outcome field. The route map draws no
  line from the companies to the officeholders, because nothing on record says the deputies hold
  shares in the companies that pay the foundations.
- **It groups by party, never by bloc or camp.** Grouping parties into "left" and "right" is a
  classification of stance, which this site does not make. The left/right bloc label was removed
  from the party page at the switch-over; `lib/parties.ts` still carries a `bloc` field, and no page
  renders it.
- **An area is never the only reading of a figure.** Area is read less precisely than length, so a
  graphic drawn by area needs the exact figures beside it.

**Left out on purpose at the switch-over (2026-11-05):** the keyboard chart reader and the
"Descargar imagen" export buttons of the old chart system, the money-to-party-to-vote flow diagram,
the subsidy treemap and the choropleth map fills. The same figures are on the pages, in words and
in tables. If a graphic with discrete values is added without a table under it, it needs either a
table or a keyboard reading of its own, and an image export would need to carry its source and date
inside the image.

## Architecture / where things live

### Routes (all under `app/[locale]/`)

| Path | Role |
|------|------|
| `layout.tsx` | The frame: fonts, theme script, skip link, header with language and theme toggles, the menu, footer with the juxtaposition line |
| `copy.ts` | The frame's and the front page's words |
| `site.css` | The design system: `--n-*` tokens and `n-*` classes, scoped under `.n-root` (see the redesign entries in `CHANGELOG.md`) |
| `page.tsx` | The front page: where the money comes from, drawn as a route map, and what the site holds |
| `financiacion/page.tsx` | The money: state subsidies per year, 2020 donations by tranche, electoral spending, the foundations layer |
| `partidos/page.tsx` | Index of the parties |
| `partido/[nif]/page.tsx` | One party: public and private money by year, its foundation, its people, its recorded votes and the investiture record, court records, news |
| `partido/party-records.ts` | Which electoral formations and foundations belong to a party, shared by the party pages |
| `fundaciones/page.tsx` | The foundation channel: who pays the party foundations and who governs them |
| `fundacion/[slug]/page.tsx` | One party-linked entity: money in by source, public money by grantor, board, findings |
| `personas/page.tsx` | Everyone the site holds a record of, one line per person with a station per kind of record; `?kind=declarations` shows the deputies' transcribed declarations side by side (`Declarations.tsx`) |
| `politico/[slug]/page.tsx` | One person: pay, what a deputy declared to Congreso, recorded ballots, social, news |
| `territorios/page.tsx` | The 52 provinces by comunidad with the deputies each elects, the register's officeholders per comunidad, who governs each, the investiture votes, and recorded hate crime (absorbed what was `/mapa`) |
| `territorio/[provincia]/page.tsx` | What this site holds about one comunidad, reached by province, each figure beside its national one (was `/donde/[provincia]`) |
| `temas/page.tsx` | The topics, each built from recorded votes (absorbed what was `/votaciones`) |
| `tema/[id]/page.tsx` | One topic: its votes, each group's and each deputy's ballot, and related records; the LGTBI topic carries the organisations' own feeds (was `/derechos`) |
| `contexto/page.tsx` | The country the money is spent in: wages by sector, the payroll in multiples of the minimum wage, and the poverty indicators — INE figures, never joined to a vote |
| `buscar/page.tsx` | One search across the register, parties, entities, comunidades, provinces, tracked divisions and the site's own sections — a form GET, server-rendered |
| `datos/page.tsx` | Every dataset this site publishes, one section per table, each with a stable anchor, a row count, its source, and a CSV download |
| `datos/[table]/route.ts` | The CSV itself, for one table id from `lib/datasets.ts` |
| `metodologia/page.tsx` | Methodology and legal caveats, one section per route of the front page's map |
| `metodologia/routes.ts` | That route skeleton, shared with `/datos` so each table links to the item saying how it was obtained |

Each page keeps its words in a `copy.ts` (or `copy.tsx`) beside it, one block per locale. Retired
addresses are permanent redirects in `next.config.ts`: the `/nuevo` prototype paths, `/party`,
`/donde`, `/politicos`, `/votaciones`, `/mapa`, `/derechos`, and the older `/sueldos`, `/caras` and
`/politician/[slug]`.

`app/api/`: `refresh` (BDNS pull, cron-protected), `news`, `bluesky`, `news-image`.

`news-image` is an **allowlisted** image proxy, and both halves of that matter. Feed images are
served through this origin so a reader who opens the LGTBI topic page does not hand their IP
address to some thirty third-party hosts — several of them LGBTQ+ organisations, where who reads
them is the last thing to leak. And the allowlist is what keeps it from being an SSRF tool and a
bandwidth piñata: only hosts vouched for by `lib/news-sources.mjs` (plus their subdomains and
the `www.`/bare counterpart) are fetched, only responses declaring `image/*` are returned, and
the response carries `nosniff` and a `sandbox` CSP because the bytes are someone else's.

`/api/news?q=` is a free-text Google News search, used by `NewsFeed` on party and person pages.
The curated feed registry in `lib/news-sources.mjs` is read on the server by `fetchTopicNews()` in
`lib/news.ts`, for the LGTBI and housing topic pages (`/tema/lgtbi`, `/tema/vivienda`, rendered by
`OrgVoices`); `/api/news?topic=…` still serves it, but no page calls that mode now. Two guards apply
to the registry, and both exist because of feeds that failed silently:

- **Source staleness.** A source whose newest item is older than a year is dropped whole. dosmanzanas
  serves HTTP 200 with ten items whose newest post is February 2024, so a status-code check calls it
  healthy — only the item dates reveal it.
- **Item age.** Nothing older than 120 days enters the panel, whatever the source.

Two further rules keep the panel representative: at most two items per source, so a daily outlet
cannot bury organisations that post weekly, and items in the reader's language sort first, with
Spanish and Catalan counted as one, so a Catalan page is not narrowed to the three Catalan outlets.
On the topic pages the organisations' pieces come first, under their own heading, and the press
follows apart from them, so a reader can tell at a glance who is speaking and a daily outlet does
not bury organisations that post weekly. The housing sources were chosen to span the spectrum, and
`research/housing-feeds.md` holds every feed probed, including those left out and why. Feeds are
parsed for both RSS (`<item>`) and Atom (`<entry>`) — El Salto publishes Atom, and the RSS-only
parser returned an empty array for it without erroring. Run `npm run check:feeds` after editing the
registry; it fails on any source that is unreachable, unparseable or stale. Its date parsing must
match the app's: three housing feeds wrap their dates in CDATA, which `lib/news.ts` unwrapped and
the check, until it was fixed, reported as "no dated items".

One gotcha worth keeping: `provivienda.org` answers 403 to a descriptive bot User-Agent and 200 to an
ordinary browser one, so `FEED_HEADERS` in the registry sends the browser string.

### Library

| Path | Role |
|------|------|
| `lib/bdns.ts` | BDNS API client (endpoint, organ list, pagination) |
| `lib/store.ts` | Snapshot persistence: Vercel KV in production, filesystem in dev |
| `lib/data.ts` | Load + cache the aggregation; `invalidate()` after refresh |
| `lib/normalize.ts` | Parse `beneficiario` into NIF, classify subsidy kind, aggregate, filter |
| `lib/parties.ts` | Canonical NIF → party (name, colour, and a `bloc` field no page renders) |
| `lib/donations.ts` | Private donations 2020, transcribed from the TdC report |
| `lib/party-income.ts` | The audited parties' ordinary income in 2018, 2019 and 2020 (`data/party-income-<year>.json`): public by administration, private by origin. Single-year exports are 2020; `PARTY_INCOME_YEARS` holds all three |
| `lib/foundations.ts` | Party-linked foundations 2021–22, per-dossier + the legal mechanism |
| `lib/foundation-people.ts` | Curated: who governs each foundation, and their outside roles, one dated source per record |
| `lib/salaries.ts` | The pay register: load. Everything about *pay* reads it; the directory does not (see `lib/people.ts`) |
| `lib/votes.ts` | Roll-call votes: load, `positionsFor`, `tallyByGroup`, `stancesByParty`, `voteDateISO`, `newestFirst` |
| `lib/regions.ts` | The communities' projected geometry and the per-territory hate-crime figures (file loaders + types) |
| `lib/governments.ts` | Curated: who holds each community's presidency, and since when. Pure data with no Node imports, kept apart from the loaders in `lib/regions.ts` |
| `lib/court-records.ts` | The four verified judicial and electoral-board resolutions, with the status as a **type** |
| `lib/officeholder-ties.ts` | The board-member → public-office join, gated on one-post-per-name **and** party agreement |
| `lib/chart-sources.ts` | A figure's source line (publisher, dataset, date, link), built from the data it shows; read by `SourceText`, the person page and the methodology page. The name dates from the old chart system |
| `lib/investitures.ts` | Per community: the investiture arithmetic, and the recorded tally where verified |
| `lib/spending.ts` | Electoral spending, plus `formationNif`/`formationColor` for the report's coalition labels |
| `lib/photos.ts` | Portrait lookup, `portraitKeys` for bulk tests |
| `lib/politicians.ts` | Curated politicians with verified Bluesky handles |
| `lib/people.ts` | **The join.** The people spine (register rows plus the deputies the register lacks), one profile from every dataset that knows the person, and the directory query |
| `lib/deputies.ts` | The sitting deputies, from Congreso open data and each deputy's ficha, with every declaration the ficha links |
| `lib/deputy-join.mjs` | The deputy → register join (one folded name or a reviewed alias, **and** party-family agreement), the electoral-formation map, `DEPUTY_ALIASES` |
| `lib/declarations.ts` | Bienes y Rentas as transcribed and checked (`data/declarations.json`), and the Intereses Económicos open-data rows |
| `lib/declaration-totals.mjs` | The section totals of a declaration, shared by the page and the build's check |
| `lib/name-key.mjs` | Shared name folding — `foldText`, `foldTokens`, `nameKey` |
| `lib/news.ts` | Feed fetching and merging: RSS + Atom, staleness guards, per-source cap |
| `lib/news-sources.mjs` | The feed registry itself, plus the excluded feeds and why |
| `lib/i18n.ts` / `lib/locales.ts` | Dictionaries / locale constants (keeps middleware light) |
| `lib/format.ts` | Currency, number and date formatting, locale-aware via BCP-47 tag |
| `lib/datasets.ts` | The `/datos` registry: every published table as `{count, sources, csv}`, built from the same loaders the rest of the site uses |
| `lib/csv.ts` | RFC 4180 CSV writer, BOM-prefixed for Excel |
| `lib/smi.ts` | The SMI, one hand-transcribed entry per year with its Real Decreto; `currentSmi()`, `multiplesOfSmi()` |
| `lib/indicators.ts` | INE wage and poverty series (`data/indicators.json`) for `/contexto`; `trancheFor()` places a salary on the SMI tranches |
| `lib/salary-distribution.ts` | The shape of public pay in the register, so one person's figure can be read against it (`PayDistribution`) |
| `lib/coverage.ts` | How much of each dataset is populated, as figures, for the methodology page |
| `lib/hate-context.ts` | Official hate-crime and prosecution figures, and the court record on campaign material, each with its source |
| `lib/provinces.ts` / `lib/postcode.ts` | The 52 provinces and their comunidad (`data/provinces.json`); postcode → province with no filesystem import, so `ProvincePicker` can use it in the browser |
| `lib/constituencies.ts` | Congreso's constituencies joined to INE's provinces, and each deputy's declaration state |
| `lib/territories.ts` | One identity per comunidad across the four sources that name them differently (`check:territories` guards it) |
| `lib/local.ts` | Everything the site holds about one comunidad, assembled for the province page |
| `lib/groups.ts` | Parliamentary group codes → names, and the party a group may honestly link to |
| `lib/search.ts` | The one search behind `/buscar` |
| `lib/bluesky.ts` | Bluesky's public AppView, for `/api/bluesky` |
| `lib/types.ts` | Shapes of the BDNS snapshot and the aggregation |
| `middleware.ts` | Redirects unprefixed paths to `/{locale}/…` |

`lib/name-key.mjs` is plain JS with a `.d.mts` beside it **on purpose**: the build scripts and
the app must fold names with the identical implementation, or portrait and social lookups
silently miss. Do not fork it. `lib/deputy-join.mjs` and `lib/declaration-totals.mjs` follow the
same pattern for the same reason: `check:deputies` must run the join the app runs, and the totals
the build checked must be the totals the page prints.

### Components

Everything in the design lives in `components/nuevo/` (the folder name dates from the prototype;
the components are the site's). Each one takes the locale and carries its own words for the three
languages, either in its props from the page's `copy.ts` or in a `*-copy.ts` beside it.

- The motif: `Line` (a route drawn as a line with stations), `RouteMap` (the front page's map of
  where the money comes from), `ShareBar` and `DotGrid` (shares and counts), `Ladder`.
- Votes: `VoteBar` (one division's result as a single bar), `DeputyBallots` (how one deputy voted), `BallotStrip` (one cell per
  tracked division on a person page, including those with no ballot on record),
  `InvestitureRecord`.
- People: `Portrait`, `PayDistribution`, `SmiPosition`, `Interests`, `SourceText`.
- Places: `RegionMap`, `ProvincePicker` (postcode or province, resolved in the browser).
- Records and feeds: `CourtRecord` (status words keyed by the `CourtStatus` type), `OrgVoices`
  (the organisations' own feeds on a topic), `NewsFeed`, `BlueskyFeed`.
- Shared vocabulary: `topics.ts`, `roles.ts`, `vote-copy.ts`, `investiture-copy.ts`,
  `court-copy.ts`, `feed-copy.ts`.

`components/LocaleToggle.tsx` and `components/ThemeToggle.tsx` are the frame's two toggles.

Data files in `data/`: `subsidies.json` (live), `salaries.json` (~1.7 MB), `votes.json`,
`photos.json`, `foundations.json`, `electoral-spending.json`, `regions.json` (projected SVG
paths), `hate-territory.json`, `deputies.json`, `interests.json`, `declarations.json`,
`indicators.json`, `provinces.json`, and `party-income-2018.json`, `-2019.json`, `-2020.json`. The
declaration scans (`data/_declaraciones/*.pdf`) and their working transcriptions
(`data/_transcriptions/`) are gitignored and regenerable.

Read server-side only — pages render a filtered slice, so the browser never receives the large
datasets. `data/_*.json` are scraper caches and are gitignored. `regions.json` is the one file
whose contents do reach the browser, drawn into the page by `RegionMap`; that is why the build script
rounds the path data to one decimal place.

**A client component may not import a module that reads the filesystem.** Only five components
run in the browser: the two toggles, `ProvincePicker`, `NewsFeed` and `BlueskyFeed`. The old
client-side map once imported `lib/regions.ts` for its presidency data and pulled `node:fs` into the
browser bundle, which fails the build outright; that is why `lib/governments.ts` is pure data
apart from the loaders in `lib/regions.ts`, and why `lib/postcode.ts` was split out of
`lib/provinces.ts` for `ProvincePicker`. The same boundary bites a second way: a dictionary or copy
block carrying functions cannot be passed as a prop to a client component (see "Words" above).

Locale comes from the URL (`/es`, `/en`, `/ca`), which keeps most pages statically generated and
re-rendered hourly. Pages that read query strings or live feeds render per request
(`force-dynamic`): `buscar`, `personas`, `politico/[slug]`, `temas` and `tema/[id]`.

## Data pipelines

```bash
npm run build:salaries -- "path/to/sueldos-cargos-publicos-espana.csv"
npm run build:votes            # fetches the votes pinned in KEY_VOTES
npm run discover:votes -- XV   # shortlists candidate votes for review; publishes nothing
npm run build:photos           # Wikimedia portraits; re-run to top up after throttling
npm run build:foundations -- path/to/I1642.pdf   # needs pypdf: pip install pypdf
npm run build:spending -- path/to/I1628.pdf      # electoral spending by category
npm run build:hate-territory -- path/to/INFORME_odio_2024.pdf   # per-community hate-crime figures
npm run build:regions          # projects the community geometry into data/regions.json
curl http://localhost:3000/api/refresh   # subsidies (add the CRON_SECRET header if set)
npm run build:ine              # INE wage and poverty series into data/indicators.json
npm run build:provinces        # the 52 provinces and the comunidad each belongs to
npm run check:territories      # guards the name join between the four sources; non-zero on an unknown spelling
npm run check:feeds            # health-checks every news feed; non-zero on a dead or stale one
npm run check:office-join      # guards the board-member → public-office join; non-zero on a break
npm run check:investitures     # guards the investiture arithmetic; non-zero on a sum that does not close
npm run build:deputies         # Congreso roster, fichas, interest declarations, and the asset-declaration scans
npm run check:deputies         # guards the deputy → register join; lists candidates for DEPUTY_ALIASES
npm run build:declarations     # publishes only the transcriptions that pass their check
npm run check:declarations     # re-runs each published entry's check; non-zero on a failure
npm run check:party-income     # each year's party income rows and columns sum to the report's totals; 2020 donations agree with lib/donations.ts
```

Endpoint notes that cost real time to work out:

- **BDNS party subsidies** live at `/api/partidospoliticos/busqueda`, *not* under
  `/api/concesiones/`. Returns the full set in one page.
- **Congreso votaciones** needs a browser User-Agent or it blocks the request. The portlet takes
  `targetLegislatura` as a **Roman numeral** and `targetDate` as **DD/MM/YYYY**; the landing page
  embeds `diasVotaciones`, listing every plenary day, so sessions are enumerable. Day pages carry
  vote titles and tallies in the HTML, so discovery reads day pages rather than thousands of
  per-vote JSONs. Per-vote filenames contain an opaque timestamp and cannot be constructed.
- **TdC reports** are addressable as
  `https://www.tcu.es/export/sites/portal/repositorio2/INFORME/<year>/I<number>.pdf`, where `<year>`
  is the **approval** year, not the year the report covers — report 1.628 audits the June 2024
  election and lives under `/2025/`. A wrong URL does not 404: it redirects to the site-wide search,
  whose HTML usefully lists PDF links, including the `resumen/NR_I<number>.pdf` summary. But the
  `/es/partidos-politicos/Informes/` index lists only 20 reports and does not include 1.642. The
  site-wide POST search at `/es/buscador/` does find it, and it is the only route that worked —
  the press release's own "Informe" and "Resumen" links carry `data-oc-broken-link="true"`.
- **INE Tempus3** is open JSON with no key: `https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/{id}?nult=1`.
  Two traps. A **leading minus sign in `Valor` is a reliability flag, not a negative number** — the
  cell's sample holds 100-500 observations and the figure has high variability; `Mujeres.
  Industrias extractivas` comes back as `-51101.45`, meaning €51,101.45 with a warning. And a table
  listed by `TABLAS_OPERACION` may hold no series at all: table `80181` answers
  `{"status": "No existen series para la tabla"}`, an object rather than an array, so the shape has
  to be checked before it is iterated. A `null` `Valor` is a third thing again — a cell the
  indicator does not define, such as low work intensity (0-64) for the 65-and-over age group — and
  it is neither zero nor an error.
- **Congreso deputies.** `/es/opendata/diputados` links timestamped files (`DiputadosActivos__*.json`,
  `docacteco__*.json`, `Diputadas__*.json`) whose names change daily, so scrape the links from the page.
  The roster carries no `codParlamentario`; the fichas are enumerable as
  `busqueda-de-diputados?…&codParlamentario=N&idLegislatura=XV` and are server-rendered, with the
  declaration PDFs linked in the raw HTML and dated in their filenames. The Bienes y Rentas PDFs are
  CCITT scans with no usable text layer; BOCG reproduces the same images.
- **RTVE's listing** of the 2023 declarations paginates inconsistently unless an order is given:
  `?page=2` and `?page=3` return ten overlapping rows each and about thirty deputies never appear.
  `?order=nombre_listado,asc&page=N` returns twenty new rows a page.
- **Wikipedia and Commons** throttle anonymous clients hard (429). The photo script backs off
  exponentially and caches both passes. Commons returns file titles with spaces while
  `pageimage` gives underscores — keys must be normalised or the licence lookup silently misses.

## The territories: an unencoded map, two figures, and the investiture record

The old `/mapa` page drew a five-layer map; it was merged into `/territorios` on 2026-11-05, and
the map there (`RegionMap`) now encodes nothing. It is a way to find a comunidad, and every figure
sits beside it in bars and tables, where it can be read to the precision of a number. Two figures
are published per comunidad, each in its own section and never joined to the other: who holds the
presidency (`lib/governments.ts`), and the hate incidents the Interior ministry's report places
there (`data/hate-territory.json`, against the national rate). The design for the old map had
specified three more layers (an LGBTI rights index, the state of trans-law reform, and vote share
for the parties that voted against the tracked bills); they arrived with sample values and no
citable per-community source, and are not published, because a plausible-looking number on a map
is read as a measurement.

**The investiture record is a dated vote, never a standing arrangement.** A mark meaning "Vox is
in this government" would have been false for part of the period it described: Vox left three of
those governments in July 2024. What is shown instead is the investiture vote, which cannot go
stale. It is drawn by `InvestitureRecord` on `/territorios` and, for the PP and Vox, on the party
page (`investituresNaming()` matches the party's short name exactly against the names the record
uses, never fuzzily).

`lib/investitures.ts` keeps two claims apart. The **arithmetic** (chamber size, PP and Vox seats)
says whether the PP could reach an absolute majority alone. The **recorded tally**, where verified,
says who actually supplied the winning votes. They can disagree, because a failed absolute-majority
round is retried on a **simple majority** where abstentions suffice, so "PP was short alone" does
not establish that Vox invested anyone. The component therefore draws a recorded tally as a filled
mark and arithmetic alone as a hollow, dashed one, and says which in words; drawing them the same
would present the weaker claim as the stronger one.

Eight communities qualify, not the five the press reported, because "a PP–Vox pact" and "PP could
not reach a majority alone" are different questions. Four have a verified tally.

`npm run check:investitures` fails rather than warns, and it exists because the research was
unreliable in ways that would have shipped: a source reported Aragón at 65 seats while stating a
majority of 34 (implying the real 67), and four chamber sizes in that table were wrong; correcting
them **removed La Rioja from the record entirely**, since PP's 17 of 33 is a majority. Another
reversed Vox's and Més's seat counts. So a votes-in-favour breakdown must sum to its own total, a
round must fit inside its chamber, no party may vote beyond its seats, and a community must not be
listed if the PP already held a majority there. Only the for-column must close; the against column
is not load-bearing and the sources disagree on its detail.

The hate-crime figures are held to the usual standard: `scripts/extract-hate-territory.py` aborts
unless every row reconciles against its own printed total, the table reconciles against the
national figure in `lib/hate-context.ts`, **and** both published motivation columns reconcile
against their own national figures. That last guard is the one that proves the columns are
aligned: fourteen integers on a line are positional, and a one-column shift would leave every row
summing correctly while attributing racism figures to orientation. It caught the report carrying
four tables of identical shape, where a whole-document scan kept the last and reconciled to 1,405
against a national 1,955. The series measures police recording, not incidence, and the page says so.

## Run / verify

```bash
npm install
npm run dev
```

Do **not** run `npm run build` while `npm run dev` is running — they share `.next` and the dev
server dies with `Cannot find module './586.js'`. Stop the dev server, or clear `.next` after.

Sanity checks (figures from the committed data; re-derive them if the data is rebuilt): the money
page shows €300.6M of state subsidies and €2.1M of 2020 private donations, with the PP first; the
PSOE party page shows €837,506 in 2020 donations; `/es/temas` lists 9 tracked votes, three in each of
the three topics; Rufián votes in favour and Abascal against on all three XIV-legislature laws; a
deputy's page (e.g. `/es/politico/gabriel-rufian-romero`) shows ballots in all three topics;
`/es/personas?q=diaz` returns matches. Every old address in `next.config.ts` answers 308.
`npx tsc --noEmit` and `npm run build` must both pass.

## Deploy (Vercel)

1. Import the repo; Next.js is auto-detected.
2. **Storage** → add an Upstash for Redis / KV store. It sets `KV_REST_API_URL` and
   `KV_REST_API_TOKEN`, which `lib/store.ts` picks up. Without it the daily refresh cannot
   persist, because Vercel's filesystem is read-only.
3. Set `CRON_SECRET`. Without it `/api/refresh` is an unauthenticated public write endpoint.
4. Redeploy so the new variables take effect.

The daily cron is declared in `vercel.json` and appears under **Settings → Cron Jobs**.

## Dependency notes

`package.json` pins `engines.node` to 22.x and carries an `overrides` block for `postcss` and
`sharp`. That block is deliberate: Next pinned a nested `postcss` at 8.4.31 (four advisories) and
`sharp` at 0.34.5 (libvips CVEs), and npm's only proposed fix was `next@16.3.3`, a semver-major.
The overrides take `npm audit` to zero without forcing that upgrade. Keep them until Next itself
ships newer transitives. A stale Vercel-generated branch proposing `next@15.5.9` was closed as a
downgrade — see PR #1.

## Working habits worth keeping

Measured on 2026-09-07 with `caveman learn`: `Bash(cd)` was the heaviest tool shape in the scanned
window at 35.8% of 1,082,573 tool-output tokens, over 1,388 calls. Two notes came out of looking at
it, neither of which is a big win on its own:

- **The `cd` prefix is redundant.** The Bash tool's working directory persists between calls, and
  `git -C <path>` covers the rest. A `cd` inside a compound command can also trigger a permission
  prompt, which the tool's own guidance warns about.
- **The output volume is diffuse, not one bad habit.** Broken down by verb it was `echo` 55k,
  `git` 37k, `cat` 34k, `python` 31k, `node` 27k, `for` 25k, `sed` 23k — median 115-494 tokens per
  call. There is no single offender to fix, so the practice is simply to cap output at the source:
  `| head -N`, `--stat` over a full diff, and quiet flags.

This is recorded here rather than in `CLAUDE.md` on purpose. `CLAUDE.md` is injected into every
turn, so a rule there costs tokens forever; the measured saving here is diffuse and unproven, and
paying a permanent prefix cost to chase it would be the wrong trade.

## Known gaps

- **Foundations years.** Report 1.642 covers 2021 and 2022 only; nothing later is published.
  Four of the 38 audited entities carry no party because the report does not state their link.
- **Vote coverage.** 268 of the register's rows have a roll-call record; the rest show nothing by
  design. 9 votes are tracked across two legislatures.
- **Social coverage.** 6 verified Bluesky handles. Bluesky skews left in Spain, so PP and Vox
  leaders have no verifiable account there — a property of the platform, stated on the site.
- **Donations years.** Donations by tranche only for ejercicio 2020 (report 1573); the parties'
  income by source is transcribed for 2018, 2019 and 2020. Later reports are 700-page PDFs.
- **Territory figures.** Two per comunidad, plus the investiture record. The three layers the old
  map's design asked for with no citable per-community source are covered above.
- **Vox in government now.** Deliberately not shown: that is a standing arrangement, and three of
  those governments changed in July 2024. It needs its own dated record of entries and departures.
- **The officeholder join publishes 14 of 53 board members.** The other 39 have no row in the
  register, which is the ordinary case for a trustee holding no public office — not a failure to
  find them. Nothing is inferred for the rest.
- **Autonomous presidencies.** Curated in `lib/governments.ts` against one secondary source, dated
  `2026-09-09`. There is no machine-readable national register of them; each community's own
  official gazette is the primary route and has not been walked.
- **Ballot subjects outside the topic pages.** The person page and the party page label a ballot
  "a favor / en contra / abstención" beside the law's name and the date, and the
  front page shows each division's tally under the law's name; none of them prints the subject
  actually voted, which the topic page does. On a ballot such as
  Ley 4/2023's, which was on the Senate's amendments, that is the reading the first version of the
  site was built to prevent (see "Say what was voted" above). It needs a decision and a code change.
- **Scrolling tables and the keyboard.** A wide table scrolls inside an `overflow-x-auto` box that
  is not made a tab stop. Firefox and recent Chromium versions make such a box focusable on their
  own; the old `ScrollBox` did it explicitly, and nothing does now.
- **News registry.** 29 sources: 11 on the LGTBI topic, 17 on housing and one on poverty, which no
  page shows since the old front page's news panel went; three publish in Catalan. Arcópoli is
  live but has published nothing in 201 days. Organisation
  feeds mix rights news with their own activity announcements — one COGAM item in the live feed
  is a hiking outing. That is labelled rather than keyword-filtered, because filtering an
  organisation's own feed by keyword would be arbitrary.
