# Siguiendo el Dinero — Spanish party-funding tracker

A transparency portal for the money behind Spanish political parties: the public state subsidies
they receive (pulled live from the official national subsidies database), the private donations
they declare, the foundations attached to them, the officeholders they put in post, and how the
parliamentary groups voted on the laws that affect minorities.

Available in **Spanish, English and Catalan**.

## Documentation map

Six documents, each with one job. Start with the one that matches your question.

| Document | Answers |
|---|---|
| **README.md** (this file) | What the project is, how to run it, where things live |
| [`AGENTS.md`](AGENTS.md) | How it is built: architecture, data flow, endpoint gotchas, honesty rules |
| [`NEXT-STEPS.md`](NEXT-STEPS.md) | What is planned, with enough detail to pick any item up cold |
| [`PLAN-CONTEXT-LAYER.md`](PLAN-CONTEXT-LAYER.md) | Design for the wages / poverty / housing layer, with verified sources |
| [`PLAN-VISUAL.md`](PLAN-VISUAL.md) | Design critique, the WCAG 2.1 AA audit, and the plan to make the site visual |
| [`CHANGELOG.md`](CHANGELOG.md) | What changed, why, the source behind each figure, and what was left out |

## What it shows

| Layer | Source | Freshness |
|-------|--------|-----------|
| State subsidies to parties | BDNS / SNPSAP REST API | Live, refreshed daily |
| Private donations to parties | Tribunal de Cuentas report nº 1573 (2020) | Fixed snapshot, lagged 1–2 years |
| Party-linked foundations | Tribunal de Cuentas report nº 1.642 (2021–22) | Fixed snapshot, lagged |
| Public salaries of officeholders | Registro de Altos Cargos / transparencia.gob.es | Rebuilt from a CSV export |
| Key roll-call votes | Congreso de los Diputados open data | Rebuilt on demand |
| Sitting deputies and their economic interests | Congreso de los Diputados open data and deputy pages | Rebuilt on demand |
| Deputies' asset declarations | Congreso scans, transcribed here and checked against RTVE or a second reading | First XV filing (2023), transcribed in batches |
| Portraits | Wikipedia / Wikimedia Commons | Rebuilt on demand |
| Politician social presence | Curated registry + Bluesky public API | Live per request |
| Rights, housing and poverty news | Curated RSS/Atom registry (`lib/news-sources.mjs`) | Live, 30-minute cache |

### Honest limits

Read `/metodologia` in the app before drawing conclusions. In short:

- **Facts are placed side by side, never joined by an asserted cause.** Votes appear next to
  funding because both are on the public record, not because one is claimed to explain the other.
  There are no derived scores and no ranking of parties by anything computed.
- **Company donations to parties are illegal** in Spain. Since the 2015 reform of Organic Law
  8/2007 only individuals may donate, capped at €50,000/year, with no anonymous donations. So
  "corporations funding parties" barely exists as a legal category.
- **The foundations layer is not the corporate-money story either.** Party-linked foundations
  cannot take donations from public bodies or from companies that contract with them, and
  donations from private legal entities count against the party's own limits. The gap worth
  watching is the exception for financing specific projects, which is what the page says.
- **There is no per-politician funding figure.** Subsidies are granted to the party, not the
  person. Politician pages link to their party's funding instead of inventing a personal number.
- **Private data is not an API.** Donation and foundation figures come from annual Tribunal de
  Cuentas PDF reports, published one to two years late — hence fixed snapshots, not live feeds.
- **Recorded votes only**, and labelled by ballot language. Vote positions come from named roll
  calls, pinned by hand in `scripts/fetch-votes.mjs` with the tally expected on the official
  record; the fetcher refuses to publish a vote whose tally does not match. Each item is labelled
  by type, because a "proposición no de Ley" or a motion is a non-binding position, not the
  passage of a law. A person has a position only if their vote is on record — never inferred from
  their party.
- **Declarations are self-declared, and the asset ones are transcribed here.** Congreso publishes
  deputies' asset declarations as scans, "sin corrección alguna". A transcription is published only
  once its totals match RTVE's independent transcription or a second reading of the scan; until then
  the profile links the official PDF. No net worth is computed, because the form gives property no
  value.
- **Portraits are only attached on an exact name match** with the Wikipedia article title, and
  only when the licence permits reuse; author and licence are shown wherever the photo appears.
  Everyone else gets initials, never a stand-in photo of someone else.
- **Bluesky handles are verified one by one** (follower count and bio) before a politician is
  added, because Bluesky has weak identity checks. Unverifiable handles are excluded.
- **News comes from a fixed, published list of feeds**, not an open-web search, and every item
  shows its publisher. A source that stops publishing is dropped rather than left to fill the
  panel with old articles.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind v4
- `motion` for animations
- Vercel KV / Upstash Redis for the refreshed data snapshot (filesystem fallback in dev)
- No API keys required: BDNS, Bluesky, the news feeds and Google News RSS are all public

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it redirects to `/es`. Also try `/en` and `/ca`. Every dataset the
app needs is committed under `data/`, so a clean checkout renders fully without running anything
else.

Pull fresh subsidy data from BDNS into the local snapshot:

```bash
curl http://localhost:3000/api/refresh
```

If you have set `CRON_SECRET` locally (in `.env.local`), the endpoint is protected and the
call above returns 401. Pass the secret instead:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/refresh
```

### Rebuilding the committed datasets

Each of these regenerates one file under `data/` and is safe to re-run. They are separate from
`npm run build` on purpose: they hit third-party sources, and none of them should run during a
deploy.

| Command | Writes | Notes |
|---|---|---|
| `npm run build:salaries -- <csv>` | `data/salaries.json` | Officeholder pay from the transparency CSV export |
| `npm run build:votes` | `data/votes.json` | Pinned roll calls; **aborts** if a tally does not match the official record |
| `npm run discover:votes -- XV` | nothing | Shortlists candidate votes for a human to review |
| `npm run build:photos` | `data/photos.json` | Wikimedia portraits; skips anything not freely licensed. Re-run to top up after throttling |
| `npm run build:foundations -- <pdf>` | `data/foundations.json` | Python, needs `pip install pypdf`; **aborts** unless the extracted sums reconcile with the report's own totals |
| `npm run build:deputies` | `data/deputies.json`, `data/interests.json` | Congreso roster, deputy pages and interests open data; caches each first asset-declaration PDF locally; **aborts** unless every roster entry matches exactly one deputy page |
| `npm run check:deputies` | nothing | The deputy-to-register join; **exits non-zero** on a missing or stale alias, a party-family disagreement or a slug collision |
| `npm run build:declarations` | `data/declarations.json` | Publishes only transcriptions that pass a check, and lists the rest |
| `npm run check:declarations` | nothing | Re-runs the checks on every published declaration |
| `npm run check:feeds` | nothing | Health-checks every news feed; **exits non-zero** on a dead, unparseable or stale source |

Run `npm run check:feeds` after editing `lib/news-sources.mjs`. A feed can answer HTTP 200 and
still have published nothing for two years, so the check reports the age of each source's newest
item rather than its status code.

> **Do not run `npm run build` while `npm run dev` is running.** The two share `.next` and the
> production build corrupts the dev server's chunks (`Cannot find module './586.js'`). Stop dev,
> delete `.next`, then build.

## Data flow

```
BDNS /api/partidospoliticos/busqueda
        │  (lib/bdns.ts)
        ▼
GET /api/refresh ──► lib/store.ts ──► Vercel KV  (production)
                                 └──► data/subsidies.json  (local dev, committed seed)
        │
        ▼
lib/data.ts (read + cache) ──► lib/normalize.ts (aggregate) ──► app/[locale]/* (render)
```

The browser never calls BDNS directly — pages read the stored snapshot, so rendering is fast
and free of CORS and rate-limit problems. `data/subsidies.json` is committed so the app works
on a clean checkout before any refresh has run.

The other layers are static: a build script writes a JSON file under `data/`, a `lib/*.ts` module
loads and caches it, and `lib/people.ts` joins them into one profile per officeholder. Names are
folded through the single shared implementation in `lib/name-key.mjs` — if the app and a build
script folded names differently, portrait and social lookups would silently miss.

## Internationalization

Locale lives in the URL (`/es`, `/en`, `/ca`), which keeps pages statically generated.

- `middleware.ts` redirects unprefixed paths, choosing the locale from the `locale` cookie,
  then `Accept-Language`, then the Spanish default.
- `lib/locales.ts` holds the locale constants only, so the edge middleware does not pull in the
  translation tables.
- `lib/i18n.ts` holds the dictionaries and `getDict(locale)`.
- Numbers and dates are formatted with the locale's BCP-47 tag via `lib/format.ts`.

Party names, official job titles and cited report titles stay in their original language on
purpose — they are proper names, not UI copy.

## Deployment (Vercel)

1. Import the repository at vercel.com. Next.js is auto-detected; keep the default build settings.
2. **Storage** tab → create an Upstash for Redis / KV store and connect it to the project. This
   sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`, which `lib/store.ts` picks up automatically.
   Without it the daily refresh cannot persist, because Vercel's filesystem is read-only.
3. **Settings → Environment Variables** → add `CRON_SECRET` with a long random value:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Set this. Without it, `/api/refresh` is an unauthenticated public write endpoint.
4. Redeploy so the new environment variables take effect.

The daily cron (`/api/refresh`, 06:00) is declared in `vercel.json` and appears automatically
under **Settings → Cron Jobs**. Verify the whole chain with:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://YOUR-APP.vercel.app/api/refresh
```

A healthy response reports `"storage":{"configured":"kv","writtenTo":"kv"}`.

## Routes

| Path | Page |
|------|------|
| `/[locale]` | Portal: headline figures, how each group voted, rights and housing news |
| `/[locale]/financiacion` | Money: subsidies dashboard and the party-linked foundations layer |
| `/[locale]/politicos` | Every officeholder and sitting deputy: search, party facets, paging |
| `/[locale]/politicos/declaraciones` | What each sitting deputy declared to Congress, side by side, in alphabetical order |
| `/[locale]/politico/[slug]` | One person: pay, party funding, declarations to Congress, recorded ballots, social, news |
| `/[locale]/party/[nif]` | One party: public and private money, faces, ledger, news |
| `/[locale]/votaciones` | Key votes: result, per-group breakdown, deputy search |
| `/[locale]/metodologia` | Methodology, legal caveats, and the full news-source registry |

`/sueldos`, `/caras` and `/politician/[slug]` are permanent redirects to `/politicos`; the pages
were merged. See `next.config.ts`.

API routes: `/api/refresh` (BDNS pull, cron-protected), `/api/news`, `/api/bluesky`.

## Key files

| Path | Role |
|------|------|
| `lib/bdns.ts` | BDNS API client — endpoint, organ list, pagination |
| `lib/store.ts` | Snapshot persistence: Vercel KV in production, filesystem in dev |
| `lib/data.ts` | Load, cache and invalidate the aggregated snapshot |
| `lib/normalize.ts` | Parse `beneficiario` into NIF, classify subsidy kind, aggregate, filter |
| `lib/parties.ts` | Canonical NIF → party registry (name, colour, bloc) |
| `lib/people.ts` | The join: one profile per officeholder and sitting deputy from every dataset |
| `lib/name-key.mjs` | Shared accent-folded name keys — single source of truth for every join |
| `lib/politicians.ts` | Curated politicians with verified Bluesky handles |
| `lib/donations.ts` | Private donations 2020, transcribed from Tribunal de Cuentas report 1573 |
| `lib/foundations.ts` + `scripts/extract-foundations.py` | Party-linked foundations from report 1.642 |
| `lib/salaries.ts` + `scripts/build-salaries.mjs` | Officeholder pay: load, search, party join |
| `lib/votes.ts` + `scripts/fetch-votes.mjs` | Pinned roll-call votes and per-deputy positions |
| `lib/deputies.ts` + `scripts/fetch-deputies.mjs` | Sitting deputies, their filings, and the interests open data |
| `lib/deputy-join.mjs` + `scripts/check-deputies.mjs` | The deputy-to-register join (aliases, party families) and its guard |
| `lib/declarations.ts` + `scripts/build-declarations.mjs` | Asset declarations and interests: types, loaders, and the checked build |
| `lib/declaration-totals.mjs` + `scripts/check-declarations.mjs` | The totals rule shared by the page and the checks |
| `scripts/declaration-transcription.md` | The instructions every transcription reader follows |
| `scripts/discover-votes.mjs` | Finds candidate votes for review (publishes nothing) |
| `lib/photos.ts` + `scripts/fetch-photos.mjs` | Freely-licensed portraits with attribution |
| `lib/news.ts` | Feed fetching and merging: RSS and Atom, staleness guards, per-source cap |
| `lib/news-sources.mjs` + `scripts/check-feeds.mjs` | The feed registry and its health check |
| `lib/i18n.ts`, `lib/locales.ts` | Dictionaries and locale constants |
| `middleware.ts` | Locale redirects |
| `components/Sidebar.tsx` | Left rail navigation and the mobile menu |
| `components/Dashboard.tsx` | Overview: totals, filters, ranked bars |
| `components/StanceByGroup.tsx` | Per-group ballots, labelled by how each group voted |
| `components/Declarations.tsx` | Profile section: asset declaration, economic interests, caveat |
| `components/NewsFeed.tsx` | News panel: topic mode (registry) or query mode (search) |

## Sources

- [BDNS / SNPSAP — grants to political parties](https://www.infosubvenciones.es/bdnstrans/GE/es/concesiones/partidosPoliticos)
- [Tribunal de Cuentas — political parties](https://www.tcu.es/es/partidos-politicos/)
- [Organic Law 8/2007 on party financing](https://www.boe.es/buscar/act.php?id=BOE-A-2007-13022)
- [Congreso de los Diputados — open data](https://www.congreso.es/es/opendata)
- [Congreso de los Diputados — deputies and their declarations](https://www.congreso.es/es/busqueda-de-diputados)
- [RTVE — the deputies' 2023 declarations](https://www.rtve.es/noticias/2023/declaracion-bienes-diputados-congreso/), used only to check transcribed totals, never as a source

The full news-source registry, including the feeds deliberately excluded and the reason for each,
is listed in the app at `/metodologia` and in `lib/news-sources.mjs`.
