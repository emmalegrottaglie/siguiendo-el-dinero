import Link from "next/link";
import { roleLabel } from "@/components/nuevo/roles";
import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";
import { DONATIONS_SOURCE, DONATIONS_2020 } from "@/lib/donations";
import { ordinaryIncome, PARTY_INCOME, PARTY_INCOME_TOTALS, PARTY_INCOME_YEAR } from "@/lib/party-income";
import {
  channelTotals,
  displayName,
  entitySlug,
  getFoundations,
  partyNifByFoundation,
} from "@/lib/foundations";
import { officeTies, type OfficeTie } from "@/lib/officeholder-ties";
import { ROLES } from "@/lib/foundation-people";
import { nameKey } from "@/lib/name-key.mjs";
import { getDeclarations } from "@/lib/declarations";
import { getDeputies } from "@/lib/deputies";
import { getSpending, spendingTotals } from "@/lib/spending";
import { getVotes } from "@/lib/votes";
import { euroExact, euroM, integer, percent } from "@/lib/format";
import { KIND_SHORT, topicLabel } from "@/components/nuevo/topics";
import { COPY } from "./copy";
import RouteMap from "@/components/nuevo/RouteMap";
import ShareBar from "@/components/nuevo/ShareBar";
import Line from "@/components/nuevo/Line";
import DotGrid from "@/components/nuevo/DotGrid";
import VoteBar, { VoteLegend } from "@/components/nuevo/VoteBar";
import ProvincePicker from "@/components/nuevo/ProvincePicker";
import CourtRecord from "@/components/nuevo/CourtRecord";
import { getProvinces } from "@/lib/provinces";

export const revalidate = 3600;

/**
 * The redesign prototype's front door.
 *
 * One promise, the routes drawn, then each route opened with the one sentence
 * its figures show, then who appears on the routes, then what is still not on
 * record. Every sentence with a figure is computed from the same data the
 * previous site used; none is typed.
 */
export default async function PrototypeHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const { locale, bcp47, t: dict } = getDict(localeParam);
  const [agg, foundations, decl, deputies, spend, votes, provinceFile] = await Promise.all([
    getAggregation(),
    getFoundations(),
    getDeclarations(),
    getDeputies(),
    getSpending(),
    getVotes(),
    getProvinces(),
  ]);
  const t = COPY[locale];
  const f = channelTotals(foundations);
  const fYears = Object.keys(foundations.years).sort();
  const fYearSpan = fYears.length > 1 ? t.yearsAnd(fYears[0], fYears[fYears.length - 1]) : fYears[0];
  const ties = await officeTies(partyNifByFoundation(foundations));
  const spending = spendingTotals(spend);

  const pct = (n: number) => percent(n, bcp47, 0);
  const listFmt = new Intl.ListFormat(bcp47, { type: "conjunction" });

  // Route 1: state subsidies.
  const top3 = agg.parties.slice(0, 3);
  const top3Share = top3.reduce((s, p) => s + p.total, 0) / agg.grandTotal;

  // Route 2: donations, by tranche.
  const sum = (k: "small" | "mid" | "large", m: "donors" | "amount") =>
    DONATIONS_2020.reduce((s, r) => s + r[k][m], 0);
  const smallDonorShare = sum("small", "donors") / DONATIONS_SOURCE.grandDonors;
  const smallMoneyShare = sum("small", "amount") / DONATIONS_SOURCE.grandTotal;
  // The report gives tranche totals, not gifts. Where a party's top tranche holds exactly one
  // donor, that total is one gift; where it holds several, no single figure can be read.
  const singles = DONATIONS_2020.filter((d) => d.large.donors === 1).map((d) => d.large.amount);
  const largestGift = singles.length > 0 ? Math.max(...singles) : null;

  // Who appears: officeholders on foundation boards, joined by both conditions.
  const byFoundation = [
    ...[...ties.byPerson.entries()]
      .flatMap(([key, list]) =>
        ROLES.filter((r) => nameKey(r.person) === key).map((r) => ({
          foundation: r.foundation,
          role: r.role,
          tie: list[0],
        })),
      )
      .reduce((m, x) => m.set(x.foundation, [...(m.get(x.foundation) ?? []), x]), new Map<string, { foundation: string; role: string; tie: OfficeTie }[]>())
      .entries(),
  ].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "es"));

  const declarations = decl.declarations;
  const withSecurities = declarations.filter((d) =>
    d.otherAssets.some((a) => a.kind === "securities"),
  ).length;
  // Deputies whose first filing is linked from their ficha, less those published.
  const filed = deputies.deputies.filter((d) => d.filings.some((x) => x.kind === "bienes")).length;
  const notYet = filed - declarations.length;

  // Each topic's votes in date order; dates are published as "16/2/2023".
  const when = (d: string) => {
    const [day, month, year] = d.split("/").map(Number);
    return Date.UTC(year, month - 1, day);
  };
  const topics = votes.topics
    .map((t) => ({
      topic: t.id,
      label: topicLabel(t.id, t.label, locale),
      votes: votes.votes.filter((v) => v.topic === t.id).sort((a, b) => when(a.date) - when(b.date)),
    }))
    .filter((t) => t.votes.length > 0);

  // Years from the first audited year on this site to now, for the audit-lag lines.
  const firstYear = Math.min(DONATIONS_SOURCE.year, ...fYears.map(Number));
  const auditYears = Array.from(
    { length: new Date().getFullYear() - firstYear + 1 },
    (_, i) => firstYear + i,
  );

  // Where a party's own money comes from in turn, from the party-accounts report.
  const allIncome = ordinaryIncome(PARTY_INCOME_TOTALS);
  const priv = PARTY_INCOME_TOTALS.private;

  const L = (path: string) => `/${locale}${path}`;

  return (
    <main>
      {/* ---------- The promise, and the routes drawn ---------- */}
      <section className="n-shell grid items-center gap-x-12 gap-y-10 pb-16 pt-8 lg:grid-cols-[1fr_minmax(0,30rem)]">
        <div>
          <h1 className="n-display">{t.h1}</h1>
          <p className="n-body mt-6" style={{ fontSize: "1.15rem" }}>
            {t.lede}
          </p>
          <form action={L("/buscar")} method="get" role="search" className="n-search mt-8">
            <label htmlFor="n-q" className="sr-only">
              {t.searchLabel}
            </label>
            <input
              id="n-q"
              name="q"
              type="search"
              placeholder={t.searchPlaceholder}
              autoComplete="off"
            />
            <button type="submit" className="n-button">
              {t.searchButton}
            </button>
          </form>
          <p className="n-meta mt-3">
            {t.forExample}{" "}
            <Link href={L("/politico/pilar-calvo-gomez")}>Pilar Calvo Gómez</Link>,{" "}
            <Link href={L("/politico/alberto-nunez-feijoo")}>Alberto Núñez Feijóo</Link>,{" "}
            <Link href={L("/territorio/madrid")}>Madrid</Link>.
          </p>
          {/* Where you live: the question a reader arriving from a link brought, answered in one
              step. The search box finds a province too, but only through a results page. */}
          <ProvincePicker
            provinces={provinceFile.provinces}
            locale={locale}
            t={t.where}
            className="mt-12 border-t border-[var(--n-rule)] pt-8"
          />
        </div>
        <RouteMap
          f={{
            subsidies: euroM(agg.grandTotal, bcp47, 1),
            donations: euroM(DONATIONS_SOURCE.grandTotal, bcp47, 2),
            donationsYear: String(DONATIONS_SOURCE.year),
            foundationsFromParty: euroM(f.party, bcp47, 1),
            foundationsFromCompanies: t.thousandsEur(integer(Math.round(f.companies / 1000), bcp47)),
            foundationsFromIndividuals: t.thousandsEur(integer(Math.round(f.individuals / 1000), bcp47)),
            foundationYears: fYearSpan,
            officeholdersOnBoards: integer(ties.audit.matched, bcp47),
          }}
          locale={locale}
        />
      </section>

      {/* ---------- Each route, opened by its finding ---------- */}
      <section className="n-shell n-section" aria-labelledby="rutas">
        <h2 id="rutas" className="n-h2">
          {t.routesTitle}
        </h2>
        <p className="n-body mt-3">
          {t.routesIntro}
        </p>

        <div className="mt-10 grid gap-14">
          <Route
            cls="n-state"
            title={t.stateTitle}
            figure={euroM(agg.grandTotal, bcp47, 1)}
            figureNote={t.stateFigureNote}
            finding={t.stateFinding(listFmt.format(top3.map((p) => p.shortName)), pct(top3Share))}
            bar={[
              ...top3.map((p) => ({ label: p.shortName, value: p.total })),
              {
                label: t.othersLabel(agg.parties.length - 3),
                value: agg.grandTotal - top3.reduce((s, p) => s + p.total, 0),
                muted: true,
              },
            ]}
            barFormat={(v) => pct(v / agg.grandTotal)}
            link={{ href: L("/financiacion#reparto"), text: t.stateLink }}
            source={t.stateSource}
            sourceLabel={t.sourceLabel}
            locale={locale}
          />
          <Route
            cls="n-donors"
            title={t.donorsTitle}
            figure={euroM(DONATIONS_SOURCE.grandTotal, bcp47, 2)}
            figureNote={t.donorsFigureNote(euroExact(DONATIONS_SOURCE.grandTotal, bcp47), integer(DONATIONS_SOURCE.grandDonors, bcp47), DONATIONS_SOURCE.year)}
            finding={t.donorsFinding(pct(smallDonorShare), pct(smallMoneyShare))}
            bar={[
              { label: t.under1000, value: sum("small", "amount") },
              { label: t.from1000to10000, value: sum("mid", "amount") },
              { label: t.over10000, value: sum("large", "amount") },
            ]}
            barFormat={(v) => pct(v / DONATIONS_SOURCE.grandTotal)}
            link={{ href: L("/financiacion#donaciones"), text: t.donorsLink }}
            source={t.donorsSource}
            sourceLabel={t.sourceLabel}
            locale={locale}
          />
          <Route
            cls="n-foundations"
            title={t.foundationsTitle}
            figure={euroM(f.party + f.companies + f.individuals, bcp47, 1)}
            figureNote={t.foundationsFigureNote(fYearSpan)}
            finding={t.foundationsFinding(pct(f.partyShare), pct(f.companiesShare))}
            findingNote={t.foundationsNote({
              year: PARTY_INCOME_YEAR,
              parties: PARTY_INCOME.length,
              total: euroM(allIncome, bcp47, 1),
              publicPct: pct(PARTY_INCOME_TOTALS.public.total / allIncome),
              officeholders: euroM(priv.officeholders, bcp47, 1),
              members: euroM(priv.memberFees, bcp47, 1),
              donors: euroM(priv.donations, bcp47, 2),
            })}
            bar={[
              { label: t.fromParty, value: f.party },
              { label: t.fromCompanies, value: f.companies },
              { label: t.fromIndividuals, value: f.individuals },
            ]}
            barFormat={(v) => pct(v / f.contributions)}
            link={{ href: L("/fundaciones"), text: t.foundationsLink }}
            source={t.foundationsSource}
            sourceLabel={t.sourceLabel}
            locale={locale}
          />
        </div>
      </section>

      {/* ---------- Who appears on the routes ---------- */}
      <section className="n-shell n-section" aria-labelledby="quien">
        <h2 id="quien" className="n-h2">
          {t.whoTitle}
        </h2>
        <p className="n-finding mt-4">
          {t.whoFinding(integer(ties.audit.matched, bcp47))}
        </p>
        <p className="n-body mt-3">
          {t.whoBody}
        </p>

        {/* Each foundation is a station on the foundations' line, and its board
            members with public office hang off it. Every match is listed,
            grouped by foundation: a first-N list showed one party's
            foundation only, which read as a choice the data did not make. */}
        {byFoundation.map(([foundation, list]) => (
          <div key={foundation} className="n-foundations mt-12">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span
                aria-hidden
                className="h-[23px] w-[23px] shrink-0 rounded-full border-[3px]"
                style={{ borderColor: "var(--route)", background: "var(--n-card)" }}
              />
              <h3 className="n-h3">
                <Link href={L(`/fundacion/${entitySlug(foundation)}`)}>{displayName(foundation)}</Link>
              </h3>
              <span aria-hidden className="hidden h-[5px] min-w-8 flex-1 sm:block" style={{ background: "var(--route)" }} />
              <span className="n-meta">
                {t.boardCount(list.length, integer(list.length, bcp47))}
              </span>
            </div>
            <ul className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {list.map(({ tie, role }) => (
                <li key={tie.slug + role} className="border-t border-[var(--n-rule)] py-3">
                  <Link href={L(`/politico/${tie.slug}`)} className="font-bold">
                    {tie.person}
                  </Link>
                  <span className="text-[var(--n-ink-2)]">, {roleLabel(role.toLowerCase(), locale)}</span>
                  <p className="n-meta mt-0.5">
                    {tie.organisation}
                    {tie.role ? `, ${tie.role}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* The declarations, one dot each: how much is read, and what it shows. */}
        <div className="mt-16 grid gap-x-12 gap-y-6 border-t border-[var(--n-rule)] pt-10 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <div>
            <h3 className="n-h3">{t.declTitle}</h3>
            <p className="n-finding mt-3">
              {t.declFinding(integer(withSecurities, bcp47), integer(declarations.length, bcp47))}
            </p>
            <p className="n-meta mt-3">
              {t.declMeta}{" "}
              <Link href={L("/personas?kind=declarations")}>{t.declLink}</Link>
            </p>
          </div>
          <DotGrid
            locale={locale}
            groups={[
              {
                key: "valores",
                count: withSecurities,
                label: t.dotSecurities,
                look: "filled",
                cls: "n-companies",
              },
              {
                key: "otros",
                count: declarations.length - withSecurities,
                label: t.dotNoSecurities,
                look: "ink",
              },
              { key: "pendientes", count: notYet, label: t.dotPending, look: "hollow" },
            ]}
          />
        </div>
      </section>

      {/* ---------- Themes ---------- */}
      <section className="n-shell n-section" aria-labelledby="temas">
        <h2 id="temas" className="n-h2">
          {t.topicsTitle}
        </h2>
        <p className="n-body mt-3">
          {t.topicsIntro}
        </p>
        <div className="mt-10 grid gap-x-12 gap-y-14 lg:grid-cols-3">
          {topics.map((t) => (
            <article key={t.topic} className="n-topic">
              <h3 className="n-h3">
                <Link href={L(`/tema/${t.topic}`)}>{t.label}</Link>
              </h3>
              <Line
                locale={locale}
                cls="n-topic"
                className="mt-5"
                stops={t.votes.map((v) => ({
                  key: v.id,
                  label: v.date.split("/").slice(2).join(""),
                  note: KIND_SHORT[locale][v.kind] ?? v.kindLabel,
                  on: true,
                }))}
              />
              <ol className="mt-6 grid gap-5">
                {t.votes.map((v) => (
                  <li key={v.id}>
                    <a href={v.sourceUrl} className="text-[0.95rem] font-bold">
                      {v.law}
                    </a>
                    <span className="n-meta">, {v.date}</span>
                    <VoteBar
                      locale={locale}
                      className="mt-2"
                      counts={{ si: v.totals.afavor, no: v.totals.enContra, abst: v.totals.abstenciones }}
                    />
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
        <p className="n-meta mt-8 flex flex-wrap items-center gap-x-5 gap-y-1">
          <VoteLegend locale={locale} />
          <span>{t.topicsSource}</span>
        </p>
        {/* What the front page used to carry from the press and the organisations now lives
            beside each topic's votes. Linked only where the topic is tracked. */}
        {(() => {
          const also = [
            { id: "lgtbi", text: t.topicsAlsoLgtbi, hash: "organizaciones" },
            { id: "vivienda", text: t.topicsAlsoHousing, hash: "noticias" },
          ].filter((a) => topics.some((tp) => tp.topic === a.id));
          return also.length > 0 ? (
            <p className="mt-4">
              <span className="n-label">{t.topicsAlso}</span>{" "}
              {also.map((a, i) => (
                <span key={a.id}>
                  {i > 0 && (i === also.length - 1 ? t.and : ", ")}
                  <Link href={L(`/tema/${a.id}#${a.hash}`)}>{a.text}</Link>
                </span>
              ))}
              .
            </p>
          ) : null;
        })()}
      </section>

      {/* ---------- The judicial record ---------- */}
      <section className="n-shell n-section" aria-labelledby="tribunales">
        <h2 id="tribunales" className="n-h2">
          {dict.court.title}
        </h2>
        <p className="n-body mt-3">{t.courtIntro}</p>
        <div className="mt-10">
          <CourtRecord locale={locale} bcp47={bcp47} />
        </div>
      </section>

      {/* ---------- What is not on record ---------- */}
      <section className="n-shell n-section" aria-labelledby="falta">
        <h2 id="falta" className="n-h2">
          {t.gapTitle}
        </h2>
        <p className="n-body mt-3">
          {t.gapIntro}
        </p>

        <div className="mt-12 grid gap-x-14 gap-y-16 lg:grid-cols-2">
          {/* Campaign spending: the unitemised line, drawn at its size. */}
          <article>
            <h3 className="n-h3">{t.campaignTitle}</h3>
            <p className="n-finding mt-3">
              {t.campaignFinding(pct(spending.otherShare))}
            </p>
            <div aria-hidden className="mt-5 flex h-7 w-full gap-[2px] overflow-hidden rounded-[3px]">
              <span style={{ flexGrow: 1 - spending.otherShare, flexBasis: 0, background: "var(--n-ink-2)" }} />
              <span className="n-hatch" style={{ flexGrow: spending.otherShare, flexBasis: 0, outline: "1px solid var(--n-ink-3)", outlineOffset: -1 }} />
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[0.95rem]">
              <li className="inline-flex items-center gap-2">
                <span aria-hidden className="inline-block h-3 w-3 rounded-[2px]" style={{ background: "var(--n-ink-2)" }} />
                {t.brokenDown} <span className="n-num font-bold">{pct(1 - spending.otherShare)}</span>
              </li>
              <li className="inline-flex items-center gap-2">
                <span aria-hidden className="n-hatch inline-block h-3 w-3 rounded-[2px]" style={{ outline: "1px solid var(--n-ink-3)", outlineOffset: -1 }} />
                {t.singleLine} <span className="n-num font-bold">{pct(spending.otherShare)}</span>
              </li>
            </ul>
            <p className="n-source">{t.campaignSource}</p>
          </article>

          {/* Donors: the names the source does not publish, drawn as redacted. */}
          <article>
            <h3 className="n-h3">{t.whoDonatedTitle}</h3>
            <p className="n-finding mt-3">
              {t.whoDonatedFinding(integer(DONATIONS_SOURCE.grandDonors, bcp47), DONATIONS_SOURCE.year)}
            </p>
            <table className="n-table mt-4">
              <caption className="sr-only">{t.donorsCaption(DONATIONS_SOURCE.year)}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.colDonor}</th>
                  <th scope="col">{t.colTranche}</th>
                  <th scope="col" className="n-r">{t.colDonors}</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["small", t.under1000, "78%"],
                    ["mid", t.from1000to10000, "64%"],
                    ["large", t.over10000, "90%"],
                  ] as const
                ).map(([k, label, w]) => (
                  <tr key={k}>
                    <td>
                      <span
                        className="inline-block h-[0.9em] rounded-[2px] align-middle"
                        style={{ width: w, background: "var(--n-ink)" }}
                      />
                      <span className="sr-only">{t.nameNotPublished}</span>
                    </td>
                    <td>{label}</td>
                    <td className="n-r">{integer(sum(k, "donors"), bcp47)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {largestGift !== null && (
              <p className="n-body mt-4">
                {t.largestGift(euroExact(largestGift, bcp47), DONATIONS_SOURCE.year)}
              </p>
            )}
            <p className="n-source">
              {t.donorsNote}
            </p>
          </article>

          {/* The years each audited source covers on this site. */}
          <article className="lg:col-span-2">
            <h3 className="n-h3">{t.yearsTitle}</h3>
            <p className="n-finding mt-3">
              {t.yearsFinding(fYears[fYears.length - 1], DONATIONS_SOURCE.year)}
            </p>
            <div className="mt-8 grid gap-10">
              {[
                { key: "d", name: t.rowDonations, cls: "n-donors", on: [DONATIONS_SOURCE.year] },
                { key: "f", name: t.rowFoundations, cls: "n-foundations", on: fYears.map(Number) },
              ].map((row) => (
                <div key={row.key} className="grid gap-4 md:grid-cols-[14rem_1fr] md:items-start">
                  <p className="font-bold">{row.name}</p>
                  <Line
                    locale={locale}
                    cls={row.cls}
                    stops={auditYears.map((y) => ({
                      key: String(y),
                      label: String(y),
                      note: y === auditYears[auditYears.length - 1] ? t.today : undefined,
                      on: row.on.includes(y),
                    }))}
                  />
                </div>
              ))}
            </div>
            <p className="n-meta mt-6">{t.yearsKey}</p>
          </article>
        </div>
      </section>
    </main>
  );
}

function Route({
  cls,
  title,
  figure,
  figureNote,
  finding,
  findingNote,
  bar,
  barFormat,
  link,
  source,
  sourceLabel,
  locale,
}: {
  cls: string;
  title: string;
  figure: string;
  figureNote: string;
  finding: string;
  /** Says what the finding's figures do not, right under it. */
  findingNote?: string;
  bar: { label: string; value: number; muted?: boolean }[];
  barFormat: (v: number) => string;
  link: { href: string; text: string };
  source: string;
  sourceLabel: string;
  locale: Locale;
}) {
  return (
    <article className={`${cls} grid gap-x-12 gap-y-5 md:grid-cols-[minmax(0,16rem)_1fr]`}>
      <div className="border-l-[6px] pl-5" style={{ borderColor: "var(--route)" }}>
        <h3 className="n-h3">{title}</h3>
        <p className="n-figure n-route-text mt-3" style={{ fontSize: "2.4rem" }}>
          {figure}
        </p>
        <p className="n-meta mt-2">{figureNote}</p>
      </div>
      <div>
        <p className="n-finding">{finding}</p>
        {findingNote && <p className="n-body mt-3">{findingNote}</p>}
        <ShareBar locale={locale} parts={bar} format={barFormat} className="mt-5" />
        <p className="mt-4">
          <Link href={link.href}>{link.text}</Link>
        </p>
        <p className="n-source">{sourceLabel}: {source}</p>
      </div>
    </article>
  );
}
