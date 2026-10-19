import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { getSpending, spendingTotals } from "@/lib/spending";
import { DONATIONS_SOURCE } from "@/lib/donations";
import { euroExact, euroM, integer, percent } from "@/lib/format";
import Dashboard from "@/components/Dashboard";
import DonationsTable from "@/components/DonationsTable";
import ElectoralSpending from "@/components/ElectoralSpending";
import StatStrip, { type StatItem } from "@/components/StatStrip";
import { subsidiesSource } from "@/lib/chart-sources";

export const revalidate = 3600;

/**
 * The three declared money flows: public subsidies, private donations, and what
 * an election's spending was declared to have bought.
 *
 * The page used to be the state-subsidy dashboard under a title promising to
 * answer who funds the parties — a narrower answer than the question, with the
 * least surprising chart on the site at the top of it. The order now runs from
 * the figure a reader cannot get elsewhere to the baseline the others sit
 * against, and the title names the three channels rather than claiming all of
 * party finance. The foundation channel lives at /fundaciones.
 */
export default async function FinanciacionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const [agg, spend] = await Promise.all([getAggregation(), getSpending()]);
  const { locale, bcp47, t } = getDict(localeParam);
  const S = t.fundingStats;
  const totals = spendingTotals(spend);

  const stats: StatItem[] = [
    {
      label: S.subsidies,
      value: euroM(agg.grandTotal, bcp47, 1),
      color: "var(--gold-deep)",
      note: S.subsidiesNote,
    },
    {
      label: S.donations,
      value: euroExact(DONATIONS_SOURCE.grandTotal, bcp47),
      note: S.donationsNote.replace(
        "{donors}",
        integer(DONATIONS_SOURCE.grandDonors, bcp47),
      ),
    },
    {
      label: S.electoral,
      value: euroM(totals.declared, bcp47),
      color: "var(--red)",
      note: S.electoralNote,
    },
    {
      label: S.capped,
      value: percent(totals.advertising / totals.declared, bcp47),
      note: S.cappedNote.replace("{amount}", euroExact(totals.advertising, bcp47)),
    },
    {
      label: S.residual,
      value: percent(totals.otherShare, bcp47),
      color: "var(--red)",
      note: S.residualNote.replace("{amount}", euroExact(totals.other, bcp47)),
    },
  ];

  return (
    <main>
      <header className="pb-7 pt-8">
        <p className="eyebrow">{t.fundingStats.eyebrow}</p>
        <h1
          className="display mt-3 font-normal"
          style={{ fontSize: "clamp(32px,4.6vw,54px)", maxWidth: "22ch" }}
        >
          {t.home.titlePre}
          <span className="italic text-[var(--gold)]">{t.home.titleEmph}</span>
          {t.home.titlePost}
        </h1>
        <p
          className="mt-5"
          style={{ fontSize: "15px", lineHeight: 1.68, color: "var(--ink-2)", maxWidth: "70ch" }}
        >
          {t.home.subtitle}
        </p>
      </header>

      <StatStrip
        items={stats}
        min={174}
        figureSize={34}
        labelMinHeight={32}
        className="border-t border-[var(--line)]"
      />

      <ElectoralSpending data={spend} t={t} bcp47={bcp47} />

      <div className="mt-10 border-t border-[var(--line)]">
        <DonationsTable t={t} bcp47={bcp47} locale={locale} />
      </div>

      {/* The subsidy dashboard is the baseline the two channels above sit
          against: it is the only place the €300M headline is broken down by
          party, and the only one of the three flows that is live rather than a
          snapshot from an audit with a one-to-two-year lag. */}
      <div className="mt-10 border-t border-[var(--line)]">
        <Dashboard
          base={agg}
          home={t.home}
          kinds={t.kinds}
          charts={t.charts}
          source={subsidiesSource(agg, t.charts, bcp47)}
          locale={locale}
        />
      </div>
    </main>
  );
}
