import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { euro, fill, formatDate, integer, percent, signedPercent } from "@/lib/format";
import { NEWS_SOURCES, EXCLUDED_FEEDS } from "@/lib/news-sources.mjs";
import {
  RECORDED,
  PROSECUTED,
  MENAS_CASE,
  CONVICTION_RATE_PCT,
  CHARGES_CHANGE_PCT,
} from "@/lib/hate-context";
import { ITEM_MAX_AGE_DAYS, SOURCE_STALE_DAYS } from "@/lib/news";
import { getCoverage } from "@/lib/coverage";
import { getSalaries } from "@/lib/salaries";
import { getVotes, voteDateISO } from "@/lib/votes";
import {
  channelTotals,
  entities,
  FOUNDATIONS_LAW_URL,
  foundationYears,
  getFoundations,
  partyNifByFoundation,
} from "@/lib/foundations";
import { BOARD_GAPS, governanceCoverage } from "@/lib/foundation-people";
import { officeTies } from "@/lib/officeholder-ties";
import { getSpending, spendingTotals } from "@/lib/spending";
import { getDeclarations, getInterests } from "@/lib/declarations";
import { getDeputies } from "@/lib/deputies";
import { DONATIONS_SOURCE } from "@/lib/donations";
import { PARTY_INCOME_YEARS } from "@/lib/party-income";
import { getHateTerritory, getRegions } from "@/lib/regions";
import { getIndicators } from "@/lib/indicators";
import { getProvinces } from "@/lib/provinces";
import { GOVERNMENTS_SOURCE } from "@/lib/governments";
import { photoBuildDate, photoSource } from "@/lib/photos";
import { nameKey } from "@/lib/name-key.mjs";
import {
  donationsSource,
  foundationsSource,
  portraitsSource,
  salariesSource,
  spendingSource,
  subsidiesSource,
  votesSource,
} from "@/lib/chart-sources";
import type { ChartSource } from "@/lib/chart-sources";
import { topicLabel } from "@/components/nuevo/topics";
import { unlinkedFoundations } from "../partido/party-records";
import { COPY, type ItemId, type V } from "./copy";
import { ROUTES } from "./routes";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = getDict((await params).locale);
  return { title: COPY[locale].metaTitle };
}

/** "Congreso de los Diputados — Datos Abiertos (…)" is stored as one string; the publisher is before the dash. */
function split(name: string): { publisher: string; rest: string } {
  const [publisher, ...rest] = name.split(" — ");
  return { publisher, rest: rest.join(" — ") };
}

/**
 * The prototype's methodology page: how every figure was obtained.
 *
 * It replaces `/metodologia` and keeps everything that page stated: the
 * coverage figures, the subsidy and donation method notes, the individual
 * politicians note, the news registry with its excluded feeds, the official
 * hate-crime context with its negative finding, and the three source links.
 * The old roadmap is restated as what the site does not hold yet, since part of
 * it has since been done.
 *
 * It is organised by the routes of the front page's map. Every kind of record
 * is one item that says, in the same order, where it comes from (built from the
 * loaded data, so a date cannot drift), how it is obtained, what is checked and
 * what it does not show, with a link to its downloadable table. Every count in
 * a sentence is computed here, never transcribed.
 */
export default async function PrototypeMethod({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const { locale, bcp47, t } = getDict(localeParam);
  const c = COPY[locale];
  const m = t.method;
  const C = t.coverage;
  const L = (p: string) => `/${locale}${p}`;
  const n = (x: number) => integer(x, bcp47);
  const date = (iso: string) => formatDate(iso.slice(0, 10), bcp47);
  const list = (xs: string[]) =>
    new Intl.ListFormat(bcp47, { type: "conjunction" }).format(xs);
  /** A share in words: a small amount that rounds to 0 % is still not nothing. */
  const share = (x: number) => (x > 0 && x < 0.005 ? c.lessThanOne : percent(x, bcp47, 0));

  const [
    agg,
    coverage,
    salaries,
    votes,
    foundations,
    photos,
    photosDate,
    spend,
    decl,
    interests,
    deputies,
    hate,
    indicators,
    provinces,
    regions,
  ] = await Promise.all([
    getAggregation(),
    getCoverage(),
    getSalaries(),
    getVotes(),
    getFoundations(),
    photoSource(),
    photoBuildDate(),
    getSpending(),
    getDeclarations(),
    getInterests(),
    getDeputies(),
    getHateTerritory(),
    getIndicators(),
    getProvinces(),
    getRegions(),
  ]);
  const join = (await officeTies(partyNifByFoundation(foundations))).audit;

  // ---- The figures the sentences state ----------------------------------
  const years = [...agg.years].sort((a, b) => a - b);
  const fYears = foundationYears(foundations);
  const channel = channelTotals(foundations);
  const gov = governanceCoverage(entities(foundations).map((e) => e.name));
  const voteYears = votes.votes.map((v) => Number(voteDateISO(v).slice(0, 4)));
  const byMethod = (k: string) => decl.declarations.filter((d) => d.verified.method === k).length;
  const covered = (id: string) => coverage.ratios.find((r) => r.id === id)?.covered ?? 0;
  const count = (id: string) => coverage.counts.find((x) => x.id === id)?.value ?? 0;

  const v: V = {
    parties: n(agg.parties.length),
    total: euro(agg.grandTotal, bcp47),
    updated: date(agg.generatedAt),
    from: String(years[0] ?? "—"),
    to: String(years.at(-1) ?? "—"),
    grants: n(agg.parties.reduce((s, p) => s + p.grants.length, 0)),
    incomeYears: list(PARTY_INCOME_YEARS.map((y) => String(y.year))),
    incomeCounts: PARTY_INCOME_YEARS.map((y) => `${y.year}: ${n(y.formations.length)}`).join("; "),
    incomeLinked: n(PARTY_INCOME_YEARS.reduce((s, y) => s + y.formations.filter((f) => f.nif).length, 0)),
    incomeRows: n(PARTY_INCOME_YEARS.reduce((s, y) => s + y.formations.length, 0)),
    donors: n(DONATIONS_SOURCE.grandDonors),
    donationsTotal: euro(DONATIONS_SOURCE.grandTotal, bcp47),
    donationsYear: String(DONATIONS_SOURCE.year),
    fYears: list(fYears.map(String)),
    partyShare: share(channel.partyShare),
    companiesShare: share(channel.companiesShare),
    fUnlinked: n(unlinkedFoundations(foundations).length),
    fDiscrepancies: foundations.dossiers.reduce((s, d) => s + (d.sourceDiscrepancies?.length ?? 0), 0),
    registerAsOf: date(foundations.register.asOf),
    fRegistered: n(foundations.register.foundationsRegistered),
    eRegistered: n(foundations.register.entitiesRegistered),
    documented: n(gov.documented),
    entities: n(gov.entities),
    people: n(gov.people),
    ties: n(gov.ties),
    press: gov.fromPress,
    pressFmt: n(gov.fromPress),
    boardGaps: BOARD_GAPS.length,
    boardGapsFmt: n(BOARD_GAPS.length),
    joinCandidates: n(join.candidates),
    joinMatched: n(join.matched),
    joinUnmatched: n(join.unmatched),
    joinAmbiguous: n(join.ambiguous.length),
    joinMismatch: n(join.partyMismatch.length),
    registerUpdated: join.registerUpdated ? date(join.registerUpdated) : "—",
    registerRows: n(salaries.people.length),
    registerKeys: n(new Set(salaries.people.map((p) => nameKey(p.name))).size),
    spendFormations: n(spend.formations.length),
    otherShare: share(spendingTotals(spend).otherShare),
    divisions: n(votes.votes.length),
    votingDeputies: n(count("deputies")),
    votesFrom: voteYears.length ? String(Math.min(...voteYears)) : "—",
    votesTo: voteYears.length ? String(Math.max(...voteYears)) : "—",
    topics: list(votes.topics.map((x) => topicLabel(x.id, x.label, locale))),
    nonBinding: n(votes.votes.filter((x) => !x.binding).length),
    declPublished: n(decl.declarations.length),
    declTotal: n(decl.declarations.length + decl.unresolved.length),
    declPending: n(decl.unresolved.length),
    declRtve: n(byMethod("rtve")),
    declSecond: n(byMethod("second-reading")),
    checkName: decl.check.name,
    deputies: n(deputies.count),
    interestRows: n(interests.rows.length),
    interestsUpdated: date(interests.generatedAt),
    officeholders: n(salaries.people.length),
    withSalary: n(covered("salary")),
    salaryUpdated: date(salaries.source.updated ?? salaries.generatedAt),
    // The build records the export as "sueldode.com CSV export"; the sentence says "CSV export" itself.
    salaryVia: salaries.source.via.replace(/\s*CSV export$/i, ""),
    hateYear: String(hate.year),
    ineTables: list(indicators.sources.map((s) => s.table)),
    govChecked: date(GOVERNMENTS_SOURCE.checked),
    provinces: n(provinces.provinces.length),
  };
  const items = c.items(v);

  // ---- The source lines, built from what each figure was read from ------
  const approved = (iso: string) => fill(t.charts.approved, { date: date(iso) });
  const updated = (iso: string) => fill(t.charts.updated, { date: date(iso) });
  const incomeReports = [...new Map(PARTY_INCOME_YEARS.map((y) => [y.source.url, y.source])).values()];
  const declSrc = split(decl.source.name);
  const intSrc = split(interests.source.name);
  const depSrc = split(deputies.source.name);
  const SOURCES: Record<ItemId, ChartSource[]> = {
    subsidios: [subsidiesSource(agg, t.charts, bcp47)],
    ingresos: incomeReports.map((s) => ({
      publisher: s.body,
      name: s.report,
      period: approved(s.approved),
      url: s.url,
    })),
    donaciones: [donationsSource(t.charts, bcp47)],
    fundaciones: [
      foundationsSource(foundations, t.charts, bcp47),
      { publisher: "BOE", name: "Ley Orgánica 8/2007, disposición adicional séptima", period: "", url: FOUNDATIONS_LAW_URL },
    ],
    patronatos: [],
    cruce: [salariesSource(salaries, t.charts, bcp47)],
    gasto: [spendingSource(spend, t.charts, bcp47)],
    votaciones: [votesSource(votes, t.charts, bcp47)],
    bienes: [
      { publisher: declSrc.publisher, name: declSrc.rest, period: updated(decl.generatedAt), url: decl.source.url },
      { publisher: decl.check.name, name: "", period: "", url: decl.check.url },
    ],
    intereses: [
      { publisher: intSrc.publisher, name: intSrc.rest, period: updated(interests.generatedAt), url: interests.source.url },
    ],
    salarios: [salariesSource(salaries, t.charts, bcp47)],
    personas: [
      { publisher: depSrc.publisher, name: depSrc.rest, period: updated(deputies.generatedAt), url: deputies.source.url },
      salariesSource(salaries, t.charts, bcp47),
      ...(photos ? [portraitsSource(photos, photosDate, t.charts, bcp47)] : []),
    ],
    odio: [{ publisher: hate.source.body, name: hate.source.report, period: String(hate.year), url: hate.source.url }],
    ine: indicators.sources.map((s) => ({
      publisher: "INE",
      name: `${s.name} (${s.table})`,
      period: s.period,
      url: s.url,
    })),
    territorio: [
      { publisher: provinces.source.body, name: provinces.source.name, period: "", url: provinces.source.url },
      {
        publisher: regions.source.body,
        name: regions.source.licence,
        period: date(regions.source.retrieved),
        url: regions.source.url,
      },
      { publisher: "Wikipedia", name: GOVERNMENTS_SOURCE.body, period: date(GOVERNMENTS_SOURCE.checked), url: GOVERNMENTS_SOURCE.url },
    ],
    noticias: [],
  };

  const coverageSources = [
    salariesSource(salaries, t.charts, bcp47),
    votesSource(votes, t.charts, bcp47),
    ...(photos ? [portraitsSource(photos, photosDate, t.charts, bcp47)] : []),
    foundationsSource(foundations, t.charts, bcp47),
  ];
  const tableTitle = (id: string) =>
    t.datos.tables[id as keyof typeof t.datos.tables]?.title ?? id;

  return (
    <main>
      <div className="n-shell pb-10 pt-6">
        <h1 className="n-display">{c.title}</h1>
        <p className="n-body mt-6" style={{ fontSize: "1.15rem" }}>
          {c.intro}
        </p>
        <p className="n-body mt-3">{c.lead}</p>

        {/* The routes, as stations: the page's own table of contents. */}
        <nav aria-label={c.navLabel} className="mt-8">
          <p className="n-label">{c.navTitle}</p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {ROUTES.map((r) => (
              <li key={r.id} className={`${r.cls} inline-flex items-center gap-2`}>
                <span
                  aria-hidden
                  className="inline-block h-3.5 w-3.5 shrink-0 rounded-full"
                  style={{ background: "var(--route)" }}
                />
                <a href={`#ruta-${r.id}`}>{c.routes[r.id].title}</a>
              </li>
            ))}
          </ul>
          <ul className="n-meta mt-3 flex flex-wrap gap-x-6 gap-y-1">
            {(["reglas", "cobertura", "falta", "fuentes"] as const).map((k) => (
              <li key={k}>
                <a href={`#${k}`}>{c.extraNav[k]}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* ---------- The rules every page follows ---------- */}
      <Section id="reglas" title={c.rulesTitle}>
        <ol className="n-body flex list-decimal flex-col gap-2 pl-6">
          {c.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </Section>

      {/* ---------- Route by route ---------- */}
      {ROUTES.map((r) => (
        <Section key={r.id} id={`ruta-${r.id}`} title={c.routes[r.id].title} cls={r.cls}>
          <p className="n-finding">{c.routes[r.id].finding(v)}</p>

          {r.items.map((it) => {
            const item = items[it.id];
            const sources = SOURCES[it.id];
            return (
              <article
                key={it.id}
                id={it.id}
                aria-labelledby={`${it.id}-t`}
                className="mt-10 border-t border-[var(--n-rule)] pt-6"
                style={{ scrollMarginTop: "1.5rem" }}
              >
                <h3 id={`${it.id}-t`} className="n-h3">
                  {item.title}
                </h3>
                <dl className="mt-4 flex flex-col gap-5">
                  {sources.length > 0 ? (
                    <Row label={sources.length > 1 ? c.labels.sources : c.labels.source}>
                      <ul className="flex flex-col gap-1">
                        {sources.map((s) => (
                          <li key={`${s.url}${s.name}`}>
                            <Src s={s} />
                          </li>
                        ))}
                      </ul>
                    </Row>
                  ) : it.id === "patronatos" ? (
                    <Row label={c.labels.source}>
                      <p>{c.labels.perRowSource}</p>
                    </Row>
                  ) : null}
                  <Lines label={c.labels.method} lines={item.method} />
                  <Lines label={c.labels.checks} lines={item.checks} />
                  <Lines label={c.labels.gaps} lines={item.gaps} />
                  {it.tables.length > 0 && (
                    <Row label={c.labels.tables}>
                      <ul className="flex flex-col gap-1">
                        {it.tables.map((id) => (
                          <li key={id}>
                            <Link href={L(`/datos#${id}`)}>{tableTitle(id)}</Link>{" "}
                            <code className="n-meta">{id}.csv</code>
                          </li>
                        ))}
                      </ul>
                    </Row>
                  )}
                </dl>

                {it.id === "odio" && hateContext()}
                {it.id === "noticias" && feeds()}
              </article>
            );
          })}
        </Section>
      ))}

      {/* ---------- How much of each there is ---------- */}
      <Section id="cobertura" title={C.title}>
        <p className="n-body">{C.intro}</p>
        <ul className="mt-8 flex max-w-[46rem] flex-col gap-6">
          {coverage.ratios.map((r) => {
            const frac = r.total > 0 ? r.covered / r.total : 0;
            return (
              <li key={r.id}>
                <p className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <span>{C.rows[r.id as keyof typeof C.rows]}</span>
                  <span className="n-num whitespace-nowrap">
                    <span className="font-bold">{n(r.covered)}</span>{" "}
                    <span className="text-[var(--n-ink-3)]">
                      {C.of} {n(r.total)} · {share(frac)}
                    </span>
                  </span>
                </p>
                {/* The empty part of the track is the gap, which is the subject here. */}
                <div
                  aria-hidden
                  className="mt-2 h-3 w-full rounded-[2px]"
                  style={{ background: "var(--n-rule)" }}
                >
                  <span
                    className="block h-full rounded-[2px]"
                    style={{
                      width: `${frac > 0 ? Math.max(frac * 100, 0.6).toFixed(2) : 0}%`,
                      background: "var(--n-ink-2)",
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        <details className="mt-6">
          <summary className="cursor-pointer font-bold">{t.charts.showTable}</summary>
          <div className="mt-4 overflow-x-auto">
            <table className="n-table min-w-[30rem]">
              <caption className="sr-only">{C.tableCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{C.colWhat}</th>
                  <th scope="col" className="n-r">{C.colCovered}</th>
                  <th scope="col" className="n-r">{C.colTotal}</th>
                  <th scope="col" className="n-r">{C.colShare}</th>
                </tr>
              </thead>
              <tbody>
                {coverage.ratios.map((r) => (
                  <tr key={r.id}>
                    <th scope="row" className="font-normal">
                      {C.rows[r.id as keyof typeof C.rows]}
                    </th>
                    <td className="n-r">{n(r.covered)}</td>
                    <td className="n-r">{n(r.total)}</td>
                    <td className="n-r">{share(r.total > 0 ? r.covered / r.total : 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
        <p className="n-body mt-6">
          {C.counts
            .replace("{divisions}", n(count("divisions")))
            .replace("{deputies}", n(count("deputies")))
            .replace("{donationYear}", String(count("donationYear") || "—"))}
        </p>
        {coverage.orphanPortraits > 0 && (
          <p className="n-body mt-3">{C.orphans.replace("{n}", n(coverage.orphanPortraits))}</p>
        )}
        <p className="n-meta mt-4 max-w-[var(--n-w-read)]">{C.note}</p>
        <div className="n-source">
          <p>{c.coverageSourcesLabel}:</p>
          <ul className="mt-1 flex flex-col gap-1">
            {coverageSources.map((s) => (
              <li key={`${s.url}${s.name}`}>
                <Src s={s} />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ---------- What is not held yet ---------- */}
      <Section id="falta" title={c.notYetTitle}>
        <p className="n-body">{c.notYetIntro}</p>
        <ul className="mt-6 grid gap-x-12 lg:grid-cols-2">
          {c.notYet.map((x) => (
            <li key={x} className="n-body flex gap-3 border-t border-[var(--n-rule)] py-3">
              {/* A hollow station: not on record. */}
              <span
                aria-hidden
                className="mt-[0.4em] inline-block h-3.5 w-3.5 shrink-0 rounded-full border-2"
                style={{ borderColor: "var(--n-ink-3)" }}
              />
              <span>{x}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- Sources ---------- */}
      <Section id="fuentes" title={c.srcTitle}>
        <ul className="flex flex-col gap-2">
          <li>
            <a href="https://www.infosubvenciones.es/bdnstrans/GE/es/concesiones/partidosPoliticos">{m.src1}</a>
          </li>
          <li>
            <a href="https://www.tcu.es/es/partidos-politicos/">{m.src2}</a>
          </li>
          <li>
            <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2007-13022">{m.src3}</a>
          </li>
        </ul>
        <p className="mt-6 font-bold">
          <Link href={L("/datos")}>{c.datosLink}</Link>
        </p>
      </Section>
    </main>
  );

  // ---- Pieces that only this page draws ---------------------------------

  /**
   * Official hate-crime figures, and the record of what happened when campaign
   * material was taken to court. Both are here because the money and the votes
   * elsewhere mean little without them; neither is presented as explaining the
   * other, and nothing attributes anything to a named person.
   */
  function hateContext() {
    return (
      <div className="mt-8">
        <h4 className="n-h3">{m.ctxTitle}</h4>
        <p className="n-body mt-3">{m.ctxLead}</p>

        <div className="mt-6 grid grid-cols-1 gap-10 sm:grid-cols-2">
          <div>
            <p className="n-label">{m.ctxRecordedTitle}</p>
            <p className="n-figure mt-2" style={{ fontSize: "2.4rem" }}>
              {n(RECORDED.total.value)}
            </p>
            <p className="n-meta mt-1">
              {RECORDED.total.year} · {signedPercent(RECORDED.changePct / 100, bcp47)} {m.ctxChangeYear}
            </p>
            <ul className="mt-4 flex flex-col gap-1">
              <li>
                <span className="n-num font-bold">{n(RECORDED.racism.value)}</span> {m.ctxRacism}
              </li>
              <li>
                <span className="n-num font-bold">
                  {n(RECORDED.sexualOrientationGenderIdentity.value)}
                </span>{" "}
                {m.ctxLgtbi}
              </li>
            </ul>
            <p className="n-meta mt-4">{m.ctxRecordedNote}</p>
            <p className="n-source">
              <a href={RECORDED.total.url}>{RECORDED.total.body}</a>
            </p>
          </div>

          <div>
            <p className="n-label">{m.ctxProsecutedTitle}</p>
            <p className="n-figure mt-2" style={{ fontSize: "2.4rem" }}>
              {n(PROSECUTED.convictions.value)}
              <span className="text-[var(--n-ink-3)]" style={{ fontSize: "1.5rem" }}>
                {" / "}
                {n(PROSECUTED.sentences.value)}
              </span>
            </p>
            <p className="n-meta mt-1">
              {PROSECUTED.convictions.year} · {m.ctxConvictions} / {m.ctxSentences} ·{" "}
              {percent(CONVICTION_RATE_PCT / 100, bcp47)}
            </p>
            <ul className="mt-4 flex flex-col gap-1">
              <li>
                <span className="n-num font-bold">{n(PROSECUTED.racismCharges.value)}</span> {m.ctxCharges}
              </li>
              <li>
                <span className="n-num font-bold">{signedPercent(CHARGES_CHANGE_PCT / 100, bcp47)}</span>{" "}
                {m.ctxChangeYear}
              </li>
            </ul>
            <p className="n-meta mt-4">{m.ctxProsecutedNote}</p>
            <p className="n-source flex flex-col gap-1">
              <a href={PROSECUTED.url}>{PROSECUTED.body}</a>
              <a href={PROSECUTED.summaryUrl}>{PROSECUTED.summaryBody}</a>
            </p>
          </div>
        </div>

        {/* The negative finding, stated as prominently as any figure: it is the
            answer to the question the site invites. */}
        <div
          className="mt-8 rounded-[6px] border border-[var(--n-rule)] p-6"
          style={{ background: "var(--n-card)" }}
        >
          <p className="n-label">{m.ctxFindingTitle}</p>
          <p className="n-finding mt-3">{m.ctxFindingBody}</p>
        </div>

        <p className="n-label mt-8">{m.ctxCaseTitle}</p>
        <p className="n-body mt-2">{m.ctxCaseBody}</p>
        <p className="n-source">
          <a href={MENAS_CASE.url}>{MENAS_CASE.appeal.court}</a>
        </p>

        <p className="n-body mt-6">{m.ctxNoTag}</p>
      </div>
    );
  }

  /** The news registry, in full: who the front page reads, and which feeds it deliberately does not. */
  function feeds() {
    return (
      <div className="mt-6">
        <p className="n-body">{m.feedsP1}</p>
        <p className="n-meta mt-3 max-w-[var(--n-w-read)]">
          {m.feedsGuard(SOURCE_STALE_DAYS, ITEM_MAX_AGE_DAYS)}
        </p>
        <details className="mt-6" open={NEWS_SOURCES.length <= 16}>
          <summary className="cursor-pointer font-bold">
            {m.feedsTitle} ({n(NEWS_SOURCES.length)})
          </summary>
          <div className="mt-4 overflow-x-auto">
            <table className="n-table min-w-[34rem]">
              <caption className="sr-only">{m.feedsTitle}</caption>
              <thead>
                <tr>
                  <th scope="col">{m.feedsSource}</th>
                  <th scope="col">{m.feedsKind}</th>
                  <th scope="col">{m.feedsTopics}</th>
                </tr>
              </thead>
              <tbody>
                {NEWS_SOURCES.map((s) => (
                  <tr key={s.id}>
                    <th scope="row" className="font-normal">
                      <a href={s.url}>{s.name}</a>
                    </th>
                    <td>
                      {s.kind === "org" ? m.feedsOrg : m.feedsMedia}
                      {s.lang !== "es" ? ` · ${s.lang.toUpperCase()}` : ""}
                    </td>
                    <td>{s.topics.map((topic) => m.feedsTopic[topic]).join(" · ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <p className="n-body mt-6">{m.feedsExcludedP}</p>
        <ul className="mt-3 flex flex-col">
          {EXCLUDED_FEEDS.map((f) => (
            <li key={f.url} className="border-t border-[var(--n-rule)] py-2.5">
              <a href={f.url} className="font-bold">
                {f.name}
              </a>
              {/* The reason is recorded in English in the registry, and shown as recorded. */}
              <p className="n-meta mt-0.5" lang="en">
                {f.reason}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

function Section({
  id,
  title,
  cls,
  children,
}: {
  id: string;
  title: string;
  /** A route's colour class: drawn as the route's line above the heading. */
  cls?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`n-shell n-section ${cls ?? ""}`} aria-labelledby={`${id}-t`}>
      {cls && (
        <span
          aria-hidden
          className="mb-4 block h-[5px] w-16 rounded-[2px]"
          style={{ background: "var(--route)" }}
        />
      )}
      <h2 id={`${id}-t`} className="n-h2 mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** One labelled part of an item: the label beside its content on wide screens, above it on narrow ones. */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-6">
      <dt className="n-label">{label}</dt>
      <dd className="n-body min-w-0">{children}</dd>
    </div>
  );
}

function Lines({ label, lines }: { label: string; lines: string[] }) {
  if (lines.filter(Boolean).length === 0) return null;
  return (
    <Row label={label}>
      <ul className="flex flex-col gap-2">
        {lines.filter(Boolean).map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </Row>
  );
}

/** A source as its publisher names it, linked, with its date. */
function Src({ s }: { s: ChartSource }) {
  return (
    <>
      <a href={s.url}>{[s.publisher, s.name].filter(Boolean).join(", ")}</a>
      {s.period ? <span className="text-[var(--n-ink-3)]"> ({s.period})</span> : null}
    </>
  );
}
