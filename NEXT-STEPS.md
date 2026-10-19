# Next steps

Planned work, with enough detail to pick any item up cold. Each entry states what the goal is,
what is already known, the concrete procedure, and the point at which the work should stop rather
than approximate. `AGENTS.md` covers the current architecture; this file covers what is not built
yet.

The ordering below is by expected value, not by difficulty.

---

## 1. Per-foundation detail — DONE (2026-08-31)

Report **nº 1.642** ("aportaciones percibidas por las fundaciones y demás entidades vinculadas o
dependientes de los partidos políticos … ejercicios 2021 y 2022", approved 25/09/2025) is now
extracted by `scripts/extract-foundations.py` into `data/foundations.json`: 38 entities, per-year
donations and public subsidies, with the linked party taken from the report's own wording.

How it was found, since the earlier attempts all failed: the `/es/partidos-politicos/Informes/`
index lists only 20 reports and does not include 1.642, and the press release's "Informe" and
"Resumen" links are flagged `data-oc-broken-link="true"` by the Tribunal's own CMS. The route that
worked was the site-wide search, POSTed to `/es/buscador/` from the page context. Use that first
next time.

Remaining in this area is item 4 below (donation years for the parties themselves).

## 2. EU political-advertising repository — BLOCKED, probed 2026-08-31

**Goal.** A live source for who paid for political advertising, how much, and who was targeted —
the one funding channel still invisible on the site.

**Status: not publicly accessible. Do not re-probe without a trigger.**

What was checked, so it is not repeated:

- Regulation (EU) 2024/900 applies in full since 10 October 2025; Implementing Regulation (EU)
  2026/818 of 9 April 2026 defines the repository's data structure, metadata, authentication and
  common API, applying from 10 April 2026.
- The Commission's site for the Regulation is <https://political-advertising.ec.europa.eu>. It
  hosts only the Article 26 election-dates portal and the Article 21 legal-representatives portal.
  No advertisement repository, no public API. The site's only occurrence of "repositor" is the
  title of the implementing regulation in a document list, and no launch date is announced.
- Other plausible hosts return nothing: `political-ads.europa.eu`,
  `repository.political-advertising.europa.eu`, `transparency.ec.europa.eu/political-advertising_en`
  all fail to resolve; `ec.europa.eu/political-advertising` is a 404.
- Even once live, the API authenticates via **EU Login** with JWTs, so access is credentialed. That
  needs the repo owner's own credentials — it is not something to work around.

**Re-check trigger.** A launch announcement on the portal above, or a Commission statement that
the first version of the repository is functional. Until then this item stays blocked.

**Stop condition, restated.** Do not substitute a scrape of per-platform ad libraries (Meta,
Google) and present it as the EU repository: an ad library is one company's view of its own
inventory, while the EU repository is meant to be comprehensive across providers. A
clearly-labelled per-platform layer is a legitimate but *different* feature, and would need its
own decision.

---

## 3. Wider verified social coverage

**Goal.** More profiles carrying a social feed. Currently 6 verified handles in
`lib/politicians.ts` against 6,670 register rows.

**Procedure.** For each candidate, query the Bluesky public API
(`app.bsky.actor.getProfile`) and accept the handle only on evidence: follower count in the
thousands, a bio consistent with the person's public role, and posting history. Two
impersonation accounts were rejected this way during the original build — a fake "Feijóo" with 4
followers and 0 posts, and a fake "Mónica García" with 3 followers. Record the follower count at
verification time, as the existing entries do.

Mastodon is a reasonable second free source. X/Twitter requires a paid API key; if that is ever
wanted, it should sit behind an env var rather than being hardcoded.

**Stop conditions.** Never add a handle on name similarity alone. An unverifiable handle is left
out, and the site already states that Bluesky's Spanish presence skews left, so PP and Vox
leaders having no account there is a platform fact and not a coverage failure to paper over.

---

## 4. More donation years

**Goal.** Private donations beyond ejercicio 2020.

**What is known.** `lib/donations.ts` holds 2020 from Tribunal de Cuentas report 1573, transcribed
from the annex table *"Gráfico 5. Donaciones del ejercicio 2020 por tramos"* (page 435 of the
annexes in an 851-page-class PDF). Later exercises follow the same report series.

**Procedure.** Same as item 1: identify the report, fetch once, locate the equivalently-named
annex table, transcribe verbatim into the typed module with its own source block, and add a year
selector to the party page rather than overwriting 2020.

---

## 5. Context layer — wages, poverty, housing, and measures taken

**Goal.** Place what the country looks like next to who funds the parties and how they voted: wages
by sector, poverty and inequality, homelessness and empty housing, and a count of the measures
parties actually put through.

**Designed, not built.** The full design lives in `PLAN-CONTEXT-LAYER.md` — verified endpoints and
table ids, the traps in each dataset, ten visualisation proposals with a recommended build order,
and the framing rule that governs the lot. Read that file before starting; the sources were probed
on 2026-09-01 and the document records which ones lie.

**Steps 1 and 2 of the build order are DONE.** Step 1 (2026-09-01): `lib/news-sources.mjs` holds the
15-source registry, `lib/news.ts` parses both RSS and Atom, and both staleness guards are in place
along with a per-source cap and reader-language preference. `npm run check:feeds` is the health check.

Step 2 (2026-09-15): `scripts/fetch-ine.mjs` ingests EAES `28185`/`28187`/`28191`/`28182` and ECV
`67240`/`67989` into `data/indicators.json`, and `/contexto` renders the wage ladder, the SMI
tranches and the poverty indicators. Two findings worth carrying forward:

- **The AEAT discovery step (build-order item 5) may not be needed.** EAES table `28182` publishes
  the workforce split by multiples of the SMI directly — 18.32 % inside one SMI, 48.69 % between one
  and two — which is the §6.B chart from an endpoint that already works. AEAT would add the series
  back to 2001 and a census rather than a survey basis; that is a real gain, but it is no longer the
  only route to the chart.
- **EAES publishes no modal wage through the API.** The €16,520.18 mode in §1.2 of the plan comes
  from INE's press note, not from a table, so `/contexto` states the mean, median and the tenth and
  ninetieth percentiles instead of the mean-versus-mode gap. Adding the mode means transcribing it
  with its own source block, the way `lib/donations.ts` handles a figure that only exists in a PDF.

**Step 3's remaining half is DONE (2026-09-21).** `lib/smi.ts` holds the SMI as a typed per-year
module, 2020–2026, each entry with its Real Decreto and BOE id — 2021 carries a `note` recording
that Real Decreto 817/2021 only took effect from 1 September, rather than presenting €965/month as
though it applied the whole year. `lib/indicators.ts` gains `trancheFor()`, and
`components/SmiPosition.tsx` renders the register overlay on `/politico/[slug]`: the same nine SMI
tranches `SmiLadder` already draws on `/contexto`, with the row containing this person's multiple
marked. Verified against Teresa Ribera: €424,236.84 ÷ €17,094 (2026 SMI) = 24.8×, in the "Más de 8
SMI" tranche.

Next up is step 4, the housing panel — both official empty-dwelling estimates (INE's 3.8M and the
Ministerio's 7.7M) and the homelessness figure, per §3 and §6.E of `PLAN-CONTEXT-LAYER.md`. Still
needs its own INE/ministry table-id discovery pass before it can start, the way item 1 and item 6
needed one for their Tribunal de Cuentas reports.

**Stop conditions.** No correlation measure, no derived score, no ordering of parties by anything
computed: facts side by side, never joined by an asserted cause. Never divide empty dwellings by
homeless people. Never plot the AROPE *Base 2013* and *objetivo Europa 2030* series as one line. In
INE data, treat a leading minus sign as a low-sample reliability flag, not a negative value. If the
Congreso *iniciativas* keyword filter cannot be made precise, publish the vote layer alone and say
so.

---

## 6. What the money actually bought — DONE for one election (2026-09-07)

**Goal.** Make the €300.6M headline mean something. Right now the site shows who received money and
never what it purchased.

**Researched 2026-09-06/07, incomplete.** See `research/hate-accountability.md`. The run was stopped
before verification finished, so its 160 claims are leads rather than findings, but enough is
established to design against:

- Electoral spending **is** itemised by law — LOREG art. 130 fixes eight closed categories (a–h),
  with mailings separate from publicity — but **digital advertising is not separately identifiable**,
  and the Tribunal de Cuentas has itself recommended legislating to make it a distinct capped
  category.
- **Nothing is machine-readable.** TdC reports, the `cuentaspartidospoliticos.es` Observatorio,
  Infoelectoral subsidies and the Interior hate-crime series are all PDF or on-page tables with no
  CSV, API or open-data endpoint. Line items live inside the fiscalización PDFs under the *Plan de
  Contabilidad Adaptado a las Formaciones Políticas*.
- **Two party-level facts need no interpretation at all**: filing compliance against the 30 June
  statutory deadline, and TdC sanction proposals such as non-award of the electoral subsidy.

**Built.** `scripts/extract-electoral-spending.py` extracts report nº 1.628 (the 9 June 2024
European Parliament elections, approved 26/06/2025) into `data/electoral-spending.json`, rendered by
`components/ElectoralSpending.tsx` on `/financiacion`. Run it with
`npm run build:spending -- path/to/I1628.pdf`.

**The result, across the eight formations audited:** €18,433,012.62 of declared ordinary spending,
of which €6,808,676.26 (36.9%) is the two capped advertising categories and **€10,052,187.82 (54.5%)
is a single residual line, "Otros gastos ordinarios", that the report does not break down.** Mailings
of propaganda are accounted separately at €19,307,864.75 across 30.9 million items. No formation
exceeded a spending cap.

**Where to find the next report.** The URL pattern is
`https://www.tcu.es/export/sites/portal/repositorio2/INFORME/<approval-year>/I<number>.pdf` — note
the year segment, which is the approval year, not the election year. A bad URL redirects to the
site-wide search rather than 404ing, and that search page usefully lists PDF links including the
`resumen/NR_I<number>.pdf` summary.

**Procedure for another election.** Same shape as item 1: identify the fiscalización report, fetch once, extract the
expense annex with the eight LOREG categories as the schema, and verify the extracted sums against
the report's own totals, aborting on mismatch.

**Stop conditions.** Do not present a spending category as digital-vs-traditional — the law does not
separate them. Do not claim any Spanish authority has found a party's campaign spending to be hate
speech: the Junta Electoral expressly declined competence over content, and the one criminal attempt
(Vox's *menas* poster) was **archived on appeal, with the Fiscalía among the appellants**. And do not
build a per-politician "hateful" tag — art. 10 LOPDGDD reserves criminal-conviction data to public
authorities, CENDOJ requires data dissociation before dissemination, and STC 58/2018 makes
retrievability-by-name the decisive harm for a public figure. Official aggregates and individually
sourced proceedings, with status and outcome stated, are the defensible form.

---

## 7. The deputies' asset declarations — the remaining transcriptions

**Goal.** Every sitting deputy's first *Declaración de Bienes y Rentas* of the XV Legislatura
transcribed and checked, so each profile shows what the deputy declared rather than only a link to
the scan.

**Where it stands (2026-10-06).** 44 of the 349 filings are published: 31 checked against RTVE and
13 by a second reading. None is waiting for a second reading. The method, the checks and what they
do not cover are in `AGENTS.md` ("The deputies' declarations are transcribed, and nothing is
published unchecked"); the reader instructions are in `scripts/declaration-transcription.md`.

Remaining: 305 filings not yet read. `npm run build:declarations` lists them as `not-transcribed`,
and `data/_declaraciones/<cod>.pdf` holds each scan (`npm run build:deputies` downloads them again
if the cache is gone). The batches take them in Congreso's surname order; the next starts after
Francisco Aranda Vargas.

**Procedure.** The second batch settled the settings: a little under one point of the five-hour
usage window per reading, against two per declaration in the pilot. Run the rest in batches of
about 20 filings, each its own pull request:

1. Give each reader two declarations and a reading letter ("a", or "b" for a second reading), and
   point it at `scripts/declaration-transcription.md` rather than restating the rules.
2. Use a lighter model for the readers, and have them read each page at full-page scale, cropping
   only a cell they cannot read that way.
3. Deputies who took their seats after RTVE's August 2023 snapshot get their "a" and "b" readings
   in the same pass, from different readers, since only a second reading can check them.
4. After each pass, run `npm run build:declarations` and `npm run check:declarations`. A reading
   that disagrees with RTVE gets a "b" reading from a different reader, made without sight of the
   "a". Where the two readings then agree with each other and not with RTVE, look at the scan for
   the largest difference before publishing: RTVE has been wrong in every case checked so far.
5. Record in the batch's CHANGELOG entry how many were published, by which check, and which were
   left out and why.

**Settled, and still open.**

- **Amounts not in Spanish format** (settled 2026-10-06). A comma followed by exactly three digits
  is a thousands separator, since euro amounts never carry three decimals, and an apostrophe is a
  decimal mark. Each such cell is noted and shown as written beneath its figure. A figure the rules
  still do not settle is illegible, so its declaration waits.
- **Income in the form's last block** (open). "Otros bienes, rentas o derechos…" holds rents as
  well as assets, and its items all count towards the "deposits and other assets" total. Splitting
  them would mean judging each item; if that is ever done, it needs a written rule a second reader
  can apply the same way.
- **IRPF** (open). RTVE's listing has no IRPF figure, so an RTVE-checked declaration's IRPF rests on one
  reading. A second reading of the IRPF box alone, which is quick, would close that gap.

**Later.**

- 71 deputies have later filings (ministers, changes of circumstance), listed on their profiles by
  date with a link. Transcribe them only once every first filing is done; RTVE does not cover them,
  so each needs a second reading.
- Senators file the same declarations with the Senado. Nothing of the Senado is ingested yet.

**Stop conditions.** Do not publish a reading that has not passed a check. Do not add a net-worth
total, a ranking of deputies by anything declared, or a tally of how deputies holding a given asset
voted. Do not use RTVE's figures as a source, even where a reading is missing.

---

## Standing practice

- **Document every task in `CHANGELOG.md`** — what changed, why, the source behind any new
  figure, and what was deliberately left out.
- **Verify before publishing.** Two claims in this project were wrong on the first pass and were
  caught by checking: a group-position label that misrepresented EH Bildu on the Ley Trans
  amendment ballot, and an over-loose account of why party foundations matter. Both are recorded
  in `AGENTS.md`.
- **A gap stated on the page is worth more than a number that might be wrong.**
