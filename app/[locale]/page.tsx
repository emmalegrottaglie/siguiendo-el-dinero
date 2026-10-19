import Link from "next/link";
import { getAggregation } from "@/lib/data";
import { getSalaries } from "@/lib/salaries";
import { getVotes, newestFirst } from "@/lib/votes";
import { getSpending, spendingTotals, rankedBySpending } from "@/lib/spending";
import { DONATIONS_2020, DONATIONS_SOURCE } from "@/lib/donations";
import { fetchTopicNews } from "@/lib/news";
import { formationColor } from "@/lib/spending";
import { fillEdge, stanceSegments, TRANCHE_COLORS } from "@/lib/chart-colors";
import { donationsSource, spendingSource, voteRecordSource, votesSource } from "@/lib/chart-sources";
import { getDict, relativeTime } from "@/lib/i18n";
import { euroExact, euroM, integer, percent } from "@/lib/format";
import Bar, { BarLegend, type Segment } from "@/components/chart/Bar";
import SourceLine from "@/components/chart/SourceLine";
import DataTable from "@/components/chart/DataTable";
import StatStrip, { type StatItem } from "@/components/StatStrip";
import WhereYouLive from "@/components/WhereYouLive";
import { getProvinces } from "@/lib/provinces";
import StanceByGroup from "@/components/StanceByGroup";
import CourtRecords from "@/components/CourtRecords";

// The opinion rail reads the NGO feeds, on the same cadence as /api/news.
export const revalidate = 1800;

/**
 * The front page, as a front page.
 *
 * The order is editorial and it is the argument. A ticker of the six figures
 * the whole site rests on; then the lead, which is the one finding a reader
 * cannot get anywhere else — that over half of declared electoral spending
 * sits in a line the audit does not break down; then the organisations' own
 * voices beside it, because every other page here reports on the state and
 * they get to speak first about themselves; then the three public registers,
 * summarised; then the three columns of detail.
 *
 * Every figure comes from the data layer, not from the page. The prototype for
 * this screen hardcoded them, which is fine for a prototype and would rot here
 * within one refresh.
 */
export default async function PortalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const { locale, bcp47, t } = getDict(localeParam);
  const P = t.portal;
  const L = t.lead;
  const stanceLabels = {
    si: t.votes.inFavour,
    no: t.votes.against,
    abstention: t.votes.abstention,
  };

  const [agg, salaries, votes, spend, news, housing, provinceFile] = await Promise.all([
    getAggregation(),
    getSalaries(),
    getVotes(),
    getSpending(),
    fetchTopicNews(["lgtbi"], 8, locale === "en" ? "en" : "es"),
    fetchTopicNews(["vivienda"], 40, locale),
    getProvinces(),
  ]);

  const totals = spendingTotals(spend);
  const ranked = rankedBySpending(spend);

  // Donors against money, by the report's own tranches. Computed here rather
  // than transcribed: the two shapes are the finding, and a hardcoded pair of
  // percentages could not survive the 2021 report replacing the 2020 one.
  const tranche = DONATIONS_2020.reduce(
    (a, d) => ({
      smallDonors: a.smallDonors + d.small.donors,
      midDonors: a.midDonors + d.mid.donors,
      largeDonors: a.largeDonors + d.large.donors,
      smallMoney: a.smallMoney + d.small.amount,
      midMoney: a.midMoney + d.mid.amount,
      largeMoney: a.largeMoney + d.large.amount,
    }),
    {
      smallDonors: 0,
      midDonors: 0,
      largeDonors: 0,
      smallMoney: 0,
      midMoney: 0,
      largeMoney: 0,
    },
  );
  const donorTotal = tranche.smallDonors + tranche.midDonors + tranche.largeDonors;
  const moneyTotal = tranche.smallMoney + tranche.midMoney + tranche.largeMoney;

  const ticker: StatItem[] = [
    {
      label: P.tickSubsidies,
      value: euroM(agg.grandTotal, bcp47, 1),
      dot: "var(--gold)",
      note: P.tickSubsidiesNote,
    },
    {
      label: P.tickDonations,
      value: euroM(DONATIONS_SOURCE.grandTotal, bcp47),
      dot: "var(--ink)",
      note: P.tickDonationsNote
        .replace("{year}", String(DONATIONS_SOURCE.year))
        .replace("{donors}", integer(DONATIONS_SOURCE.grandDonors, bcp47)),
    },
    {
      label: P.tickSpending,
      value: euroM(totals.declared, bcp47),
      dot: "var(--red)",
      note: P.tickSpendingNote.replace("{n}", integer(spend.formations.length, bcp47)),
    },
    {
      label: P.tickVotes,
      value: integer(votes.count, bcp47),
      dot: "var(--verd)",
      note: P.tickVotesNote,
    },
    {
      label: P.tickPeople,
      value: integer(salaries.count, bcp47),
      dot: "var(--ink)",
      note: P.tickPeopleNote,
    },
    {
      label: P.tickLarge,
      value: integer(tranche.largeDonors, bcp47),
      dot: "var(--gold)",
      note: P.tickLargeNote.replace("{amount}", euroExact(tranche.largeMoney, bcp47)),
    },
  ];

  // Rights-affecting items lead; the newest of each topic first within that.
  const order = ["lgtbi", "aborto", "vivienda"];
  const tracked = newestFirst(votes.votes).sort(
    (a, b) => order.indexOf(a.topic) - order.indexOf(b.topic),
  );
  const orgItems = news.items.filter((i) => i.sourceKind === "org").slice(0, 3);
  // The organisations publish far less often than the press, so newest-first alone would never
  // show them: they get two places of their own, ahead of four from the press. One item per
  // publisher, so six places show six voices rather than the two busiest twice over.
  const firstPerSource = (items: typeof housing.items, n: number) => {
    const seen = new Set<string>();
    return items.filter((i) => !seen.has(i.source) && seen.add(i.source)).slice(0, n);
  };
  const housingItems = [
    ...firstPerSource(housing.items.filter((i) => i.sourceKind === "org"), 2),
    ...firstPerSource(housing.items.filter((i) => i.sourceKind !== "org"), 4),
  ];

  return (
    <main>
      <StatStrip items={ticker} className="border-t border-[var(--line)]" />

      {/* Where you live. Above the lead deliberately: the lead is the finding
          this site owns, but a reader arriving from a link has no reason yet to
          care about it, and "what does this mean where I am" is the question
          they actually brought. The lead keeps its place directly below. */}
      <WhereYouLive provinces={provinceFile.provinces} locale={locale} t={t.where} />

      {/* Lead */}
      <section className="rule-double lead-grid">
        <article
          className="relative flex min-h-[376px] flex-col justify-end overflow-hidden px-9 pb-8 pt-8"
          style={{ background: "var(--surface)", borderTop: "6px solid var(--ink)" }}
        >
          {/* The share, as a ghost numeral. Decorative: the same figure is in
              the standfirst below and in the ticker above.

              Truncated rather than rounded. The share is 54.5 %, and rounding
              it to 55 would put a numeral on the page that contradicts the
              54,5 % in the standfirst two inches below it. The integer part is
              what a display numeral means. */}
          <span
            aria-hidden
            className="display pointer-events-none absolute select-none"
            style={{
              right: -14,
              top: -42,
              fontSize: 250,
              fontWeight: 400,
              lineHeight: 1,
              color: "color-mix(in srgb, var(--gold) 22%, transparent)",
            }}
          >
            {Math.trunc(totals.otherShare * 100)}
          </span>

          <div className="relative">
            <p className="eyebrow">{L.kicker}</p>
            <h1
              className="display mt-3 font-normal"
              style={{ fontSize: "clamp(34px,4.4vw,58px)", maxWidth: "19ch" }}
            >
              {L.title}
            </h1>
            <p
              className="mt-5"
              style={{ fontSize: "16px", lineHeight: 1.62, color: "var(--ink-2)", maxWidth: "56ch" }}
            >
              {L.standfirst
                .replace("{declared}", euroExact(totals.declared, bcp47))
                .replace("{residual}", euroExact(totals.other, bcp47))
                .replace("{share}", percent(totals.otherShare, bcp47))
                .replace("{ads}", percent(totals.advertising / totals.declared, bcp47))}
            </p>
            <p className="mt-5" style={{ fontSize: "11.5px", color: "var(--ink-3)" }}>
              {spend.source.body}, {spend.source.report} · {spend.source.approved} ·{" "}
              <Link href={`/${locale}/financiacion`} className="src">
                {L.link} →
              </Link>
            </p>
          </div>
        </article>

        <aside className="border-t border-[var(--line)] px-6 pb-6 pt-6 sm:border-l sm:border-t-0">
          <p className="eyebrow" style={{ color: "var(--verd-text)" }}>
            {P.opinionKicker}
          </p>
          <h2 className="display mt-2 text-[21px] font-semibold" style={{ lineHeight: 1.12 }}>
            {P.opinionTitle}
          </h2>

          {orgItems.length === 0 ? (
            <p className="mt-4" style={{ fontSize: "12.5px", color: "var(--ink-3)" }}>
              {t.rights.empty}
            </p>
          ) : (
            <ul className="mt-2 flex flex-col">
              {orgItems.map((item) => (
                <li
                  key={item.link}
                  className="py-3"
                  style={{ borderTop: "1px solid var(--line)" }}
                >
                  <p
                    className="label-mono"
                    style={{ color: "var(--verd-text)", letterSpacing: "0.14em" }}
                  >
                    {item.source}
                  </p>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="display mt-1 block text-[17px] font-semibold hover:underline"
                    style={{ lineHeight: 1.2 }}
                  >
                    {item.title}
                  </a>
                  <p className="mt-1" style={{ fontSize: "11.5px", color: "var(--ink-3)" }}>
                    {relativeTime(item.date, locale)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <p className="label-mono mt-4">
            <Link href={`/${locale}/derechos`} className="src-org">
              {P.opinionCta} →
            </Link>
          </p>
        </aside>
      </section>

      {/* The three registers, summarised */}
      <section className="rule-ink">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 py-6">
          <h2 className="display text-[26px] font-semibold" style={{ letterSpacing: "-0.02em" }}>
            {P.bandTitle}
          </h2>
          <p style={{ fontSize: "12px", color: "var(--ink-3)" }}>{P.bandNote}</p>
        </div>

        <div
          className="grid border-t border-[var(--line)]"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(236px, 1fr))" }}
        >
          {/* Every tracked division, one row each */}
          <div className="px-5 py-5" style={{ borderRight: "1px solid var(--line)" }}>
            <p className="eyebrow">{P.bandVotesTitle}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {newestFirst(votes.votes).map((vote) => {
                const cast =
                  vote.totals.afavor + vote.totals.enContra + vote.totals.abstenciones;
                const carried = vote.totals.afavor > vote.totals.enContra;
                return (
                  <li key={vote.id} className="grid items-center gap-2" style={{ gridTemplateColumns: "minmax(0,1fr) 92px" }}>
                    <div className="min-w-0">
                      <p className="truncate" style={{ fontSize: "11.5px" }} title={vote.law}>
                        {vote.law}
                      </p>
                      <Bar
                        className="mt-1"
                        segments={stanceSegments(
                          {
                            si: vote.totals.afavor,
                            no: vote.totals.enContra,
                            abstention: vote.totals.abstenciones,
                          },
                          stanceLabels,
                        )}
                        total={Math.max(1, cast)}
                        scale="share"
                        size="sm"
                      />
                    </div>
                    <span
                      className="label-mono text-right"
                      style={{ color: carried ? "var(--verd-text)" : "var(--red)" }}
                    >
                      {carried ? P.carried : P.rejected}
                    </span>
                  </li>
                );
              })}
            </ul>
            <BarLegend
              className="mt-4"
              segments={stanceSegments({ si: 1, no: 1, abstention: 1 }, stanceLabels)}
            />
            {/* The bars carry no figures of their own, so the counts are here. */}
            <DataTable
              summary={t.charts.showTable}
              caption={P.bandVotesTable}
              rows={newestFirst(votes.votes)}
              rowKey={(v) => v.id}
              columns={[
                { header: P.colVote, cell: (v) => v.law },
                { header: P.colDate, cell: (v) => v.date },
                { header: t.votes.inFavour, cell: (v) => integer(v.totals.afavor, bcp47), numeric: true },
                { header: t.votes.against, cell: (v) => integer(v.totals.enContra, bcp47), numeric: true },
                {
                  header: t.votes.abstention,
                  cell: (v) => integer(v.totals.abstenciones, bcp47),
                  numeric: true,
                },
                {
                  header: P.colResult,
                  cell: (v) => (v.totals.afavor > v.totals.enContra ? P.carried : P.rejected),
                },
              ]}
            />
            <SourceLine sources={[votesSource(votes, t.charts, bcp47)]} label={t.charts.source} />
          </div>

          {/* Many donors, little money */}
          <div className="px-5 py-5" style={{ borderRight: "1px solid var(--line)" }}>
            <p className="eyebrow">{P.bandDonorsTitle}</p>
            {[
              {
                caption: P.per100Donors,
                parts: [
  {
                    n: tranche.smallDonors,
                    c: TRANCHE_COLORS.small,
                    l: t.donationsTable.trancheSmall,
                  },
                  { n: tranche.midDonors, c: TRANCHE_COLORS.mid, l: t.donationsTable.trancheMid },
                  {
                    n: tranche.largeDonors,
                    c: TRANCHE_COLORS.large,
                    l: t.donationsTable.trancheLarge,
                  },
                ],
                total: donorTotal,
              },
              {
                caption: P.per100Euros,
                parts: [
{
                    n: tranche.smallMoney,
                    c: TRANCHE_COLORS.small,
                    l: t.donationsTable.trancheSmall,
                  },
                  { n: tranche.midMoney, c: TRANCHE_COLORS.mid, l: t.donationsTable.trancheMid },
                  {
                    n: tranche.largeMoney,
                    c: TRANCHE_COLORS.large,
                    l: t.donationsTable.trancheLarge,
                  },
                ],
                total: moneyTotal,
              },
            ].map((block) => (
              <div key={block.caption} className="mt-4">
                <p className="display text-[15px] font-semibold">{block.caption}</p>
                <Bar
                  className="mt-2"
                  segments={block.parts.map((p) => ({ value: p.n, color: p.c, label: p.l }))}
                  total={block.total}
                  scale="share"
                  size="xl"
                />
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {block.parts.map((p) => (
                    <li key={p.l} className="flex items-center gap-1.5">
                      <span
                        aria-hidden
                        style={{ width: 10, height: 10, borderRadius: 1, background: p.c }}
                      />
                      <span className="label-mono">
                        {p.l} · <span className="mono">{percent(p.n / block.total, bcp47)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="mt-4" style={{ fontSize: "11.5px", lineHeight: 1.5, color: "var(--ink-3)" }}>
              {P.bandDonorsNote
                .replace("{n}", integer(tranche.largeDonors, bcp47))
                .replace("{donorShare}", percent(tranche.largeDonors / donorTotal, bcp47))
                .replace("{amount}", euroExact(tranche.largeMoney, bcp47))
                .replace("{year}", String(DONATIONS_SOURCE.year))
                .replace("{moneyShare}", percent(tranche.largeMoney / moneyTotal, bcp47))}
            </p>
            <DataTable
              summary={t.charts.showTable}
              caption={P.bandDonorsTable.replace("{year}", String(DONATIONS_SOURCE.year))}
              rows={[
                {
                  l: t.donationsTable.trancheSmall,
                  donors: tranche.smallDonors,
                  money: tranche.smallMoney,
                },
                { l: t.donationsTable.trancheMid, donors: tranche.midDonors, money: tranche.midMoney },
                {
                  l: t.donationsTable.trancheLarge,
                  donors: tranche.largeDonors,
                  money: tranche.largeMoney,
                },
              ]}
              rowKey={(r) => r.l}
              columns={[
                { header: P.colTranche, cell: (r) => r.l },
                { header: P.colDonors, cell: (r) => integer(r.donors, bcp47), numeric: true },
                {
                  header: P.colDonorShare,
                  cell: (r) => percent(r.donors / donorTotal, bcp47),
                  numeric: true,
                },
                { header: P.colAmount, cell: (r) => euroExact(r.money, bcp47), numeric: true },
                {
                  header: P.colMoneyShare,
                  cell: (r) => percent(r.money / moneyTotal, bcp47),
                  numeric: true,
                },
              ]}
            />
            <SourceLine sources={[donationsSource(t.charts, bcp47)]} label={t.charts.source} />
          </div>

          {/* Electoral spending by formation */}
          <div className="px-5 py-5">
            <p className="eyebrow">{P.bandSpendTitle}</p>
            <Bar
              className="mt-4"
              segments={ranked.map(
                (f): Segment => ({
                  value: f.ordinary.declared,
                  color: formationColor(f.name),
                  label: f.name,
                }),
              )}
              total={totals.declared}
              scale="share"
              size="xl"
            />
            <ul className="mt-3 flex flex-col gap-1">
              {ranked.map((f) => (
                <li key={f.name} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 1,
                      flex: "none",
                      background: formationColor(f.name),
                      ...fillEdge(formationColor(f.name)),
                    }}
                  />
                  {/* Wraps rather than truncating: a cut coalition name names nobody. */}
                  <span className="min-w-0 flex-1 break-words" style={{ fontSize: "11.5px" }}>
                    {f.name}
                  </span>
                  <span className="mono" style={{ fontSize: "11.5px", color: "var(--ink-3)" }}>
                    {percent(f.ordinary.declared / totals.declared, bcp47)}
                  </span>
                </li>
              ))}
            </ul>
            <DataTable
              summary={t.charts.showTable}
              caption={P.bandSpendTable}
              rows={ranked}
              rowKey={(f) => f.name}
              columns={[
                { header: P.colFormation, cell: (f) => f.name },
                {
                  header: P.colDeclared,
                  cell: (f) => euroExact(f.ordinary.declared, bcp47),
                  numeric: true,
                },
                {
                  header: P.colShare,
                  cell: (f) => percent(f.ordinary.declared / totals.declared, bcp47),
                  numeric: true,
                },
              ]}
            />
            <SourceLine sources={[spendingSource(spend, t.charts, bcp47)]} label={t.charts.source} />
          </div>
        </div>
      </section>

      {/* Housing, in the news: the registry's housing press and organisations together, newest
          first and at most two items per source, each named with its source and its kind. */}
      <section className="rule-ink px-6 pb-7 pt-6">
        <p className="eyebrow">{P.housingKicker}</p>
        <h2 className="display mt-2 text-[25px] font-semibold" style={{ lineHeight: 1.1 }}>
          {P.housingTitle}
        </h2>
        <p className="mt-2 max-w-2xl" style={{ fontSize: "12.5px", lineHeight: 1.5, color: "var(--ink-3)" }}>
          {P.housingNote}
        </p>
        {housingItems.length === 0 ? (
          <p className="mt-4" style={{ fontSize: "12.5px", color: "var(--ink-3)" }}>
            {t.rights.empty}
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {housingItems.map((item) => (
              <li key={item.link} className="py-3" style={{ borderTop: "1px solid var(--line)" }}>
                <p className="label-mono" style={{ letterSpacing: "0.14em", color: "var(--ink-2)" }}>
                  {item.source}
                  <span style={{ color: "var(--ink-3)" }}>
                    {" · "}
                    {item.sourceKind === "org" ? t.rights.kindOrg : t.rights.kindMedia}
                    {item.lang && item.lang !== "es" && item.lang !== locale ? ` · ${item.lang.toUpperCase()}` : ""}
                  </span>
                </p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="display mt-1 block text-[17px] font-semibold hover:underline"
                  style={{ lineHeight: 1.2 }}
                >
                  {item.title}
                </a>
                <p className="mt-1" style={{ fontSize: "11.5px", color: "var(--ink-3)" }}>
                  {relativeTime(item.date, locale)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Three columns */}
      <section className="rule-ink">
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(268px, 1fr))" }}
        >
          <div className="px-6 pb-7 pt-6" style={{ borderRight: "1px solid var(--line)" }}>
            <p className="eyebrow">{P.colRecordKicker}</p>
            <h3 className="display mt-2 text-[25px] font-semibold" style={{ lineHeight: 1.1 }}>
              {P.stanceTitle}
            </h3>
            <div className="mt-5 flex flex-col gap-5">
              {tracked.slice(0, 2).map((vote) => (
                <StanceByGroup
                  key={vote.id}
                  vote={vote}
                  t={t}
                  source={voteRecordSource(votes, vote, t.charts, bcp47)}
                  bcp47={bcp47}
                />
              ))}
            </div>
            <p className="mt-4" style={{ fontSize: "12px", lineHeight: 1.5, color: "var(--ink-3)" }}>
              {P.stanceNote}
            </p>
            <p className="label-mono mt-3">
              <Link href={`/${locale}/votaciones`} className="src">
                {t.nav.votes} →
              </Link>
            </p>
          </div>

          <div className="px-6 pb-7 pt-6" style={{ borderRight: "1px solid var(--line)" }}>
            <p className="eyebrow">{P.colReportKicker}</p>
            {/* Awaiting licensed imagery. A hatched plate rather than a stock
                photograph: a placeholder that looks like a photograph is a
                claim about something that was never photographed. */}
            <div className="plate hatch mt-4" style={{ aspectRatio: "4 / 3" }} role="presentation" />
            <p className="mt-1.5" style={{ fontSize: "10.5px", color: "var(--ink-3)" }}>
              {P.photoPending}
            </p>
            <h3 className="display mt-3 text-[25px] font-semibold" style={{ lineHeight: 1.1 }}>
              {P.colReportTitle
                .replace("{donors}", integer(DONATIONS_SOURCE.grandDonors, bcp47))
                .replace("{largest}", euroExact(tranche.largeMoney > 0 ? largestSingle() : 0, bcp47))}
            </h3>
            <p
              className="justified mt-3"
              style={{ fontSize: "14px", lineHeight: 1.68, color: "var(--ink-2)" }}
            >
              {P.colReportBody}
            </p>
            <p className="label-mono mt-3">
              <Link href={`/${locale}/financiacion`} className="src">
                {P.colReportLink} →
              </Link>
            </p>
          </div>

          <div className="px-6 pb-7 pt-6">
            <p className="eyebrow" style={{ color: "var(--red)" }}>
              {t.court.eyebrow}
            </p>
            <h3 className="display mt-2 text-[25px] font-semibold" style={{ lineHeight: 1.1 }}>
              {t.court.title}
            </h3>
            <div className="mt-4">
              <CourtRecords t={t} bcp47={bcp47} />
            </div>
          </div>
        </div>

        <p
          className="pb-7 pt-6"
          style={{ fontSize: "12px", lineHeight: 1.6, color: "var(--ink-3)", maxWidth: "88ch" }}
        >
          {P.linkFraming}{" "}
          <Link href={`/${locale}/metodologia`} className="src">
            {t.method.title} →
          </Link>
        </p>
      </section>
    </main>
  );
}

/**
 * The single largest declared donation in the report's top tranche.
 *
 * The report publishes tranche totals and donor counts, not individual gifts,
 * so where one party's >€10,000 tranche holds exactly one donor its total *is*
 * that gift. Where a tranche holds several, no single figure can be extracted
 * and it is skipped.
 */
function largestSingle(): number {
  const singles = DONATIONS_2020.filter((d) => d.large.donors === 1).map((d) => d.large.amount);
  return singles.length > 0 ? Math.max(...singles) : 0;
}
