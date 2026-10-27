import Link from "next/link";
import { DONATIONS_SOURCE, donationsRanked } from "@/lib/donations";
import { euroExact, fill, integer, percent } from "@/lib/format";
import { PARTIES } from "@/lib/parties";
import { fillEdge, TRANCHE_COLORS } from "@/lib/chart-colors";
import Bar, { BarLegend, type Segment } from "./chart/Bar";
import Caveat from "./Caveat";
import type { Dict, Locale } from "@/lib/i18n";
import ScrollBox from "./chart/ScrollBox";
import Finding from "./chart/Finding";

/**
 * Private donations declared for 2020, by party and by tranche.
 *
 * The bar is scaled against the largest party total rather than against the
 * national total: at national scale fifteen of the seventeen rows would be
 * under two pixels wide. What the row is comparing is therefore stated in the
 * header, so the reader is not left to infer the denominator.
 *
 * The three tranches are the report's own (<1.000 €, 1.000–10.000 €,
 * >10.000 €), which is what makes the shape legible — a party's money can come
 * from many small gifts or from a handful of large ones, and the totals alone
 * do not say which.
 */
export default function DonationsTable({
  t,
  bcp47,
  locale,
}: {
  t: Dict;
  bcp47: string;
  locale: Locale;
}) {
  const F = t.donationsTable;
  const rows = donationsRanked();
  const max = Math.max(...rows.map((r) => r.total.amount));

  // The finding is the shape the tranches show, computed from the same rows:
  // most donors give little, and the money they give is the smaller part.
  const smallDonors = rows.reduce((s, r) => s + r.small.donors, 0);
  const smallAmount = rows.reduce((s, r) => s + r.small.amount, 0);
  const finding = fill(t.money.donationsFinding, {
    donorShare: percent(smallDonors / DONATIONS_SOURCE.grandDonors, bcp47, 0),
    amountShare: percent(smallAmount / DONATIONS_SOURCE.grandTotal, bcp47, 0),
  });

  return (
    <section className="pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <div>
          <h3 className="display text-[22px] font-semibold" style={{ letterSpacing: "-0.015em" }}>
            {F.title}
          </h3>
          <p className="mono mt-1" style={{ fontSize: "11.5px", color: "var(--ink-3)" }}>
            {DONATIONS_SOURCE.report.split("—")[0].trim()} ·{" "}
            {euroExact(DONATIONS_SOURCE.grandTotal, bcp47)} ·{" "}
            {integer(DONATIONS_SOURCE.grandDonors, bcp47)} {F.donorsWord}
          </p>
        </div>
        <p
          className="text-right"
          style={{ fontSize: "11.5px", lineHeight: 1.45, color: "var(--ink-3)", maxWidth: "34ch" }}
        >
          {F.tranchesNote}
        </p>
      </div>

      <Finding className="mt-5">{finding}</Finding>

      <ScrollBox className="mt-5">
        <table className="min-w-[44rem] w-full border-collapse text-sm">
          <caption className="sr-only">{F.caption}</caption>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              <th scope="col" className="label-mono py-2 text-left" style={{ width: 26 }}>
                {F.rank}
              </th>
              <th scope="col" className="label-mono py-2 text-left">
                {F.party}
              </th>
              <th scope="col" className="label-mono py-2 text-left">
                {F.byTranche}
              </th>
              <th scope="col" className="label-mono whitespace-nowrap py-2 text-right">
                {F.total}
              </th>
              <th scope="col" className="label-mono whitespace-nowrap py-2 text-right">
                {F.donors}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d, i) => {
              const meta = d.nif ? PARTIES[d.nif] : undefined;
              const dotColor = meta?.color ?? "var(--grey-500)";
              const segments: Segment[] = [
                { value: d.small.amount, color: TRANCHE_COLORS.small, label: F.trancheSmall },
                { value: d.mid.amount, color: TRANCHE_COLORS.mid, label: F.trancheMid },
                { value: d.large.amount, color: TRANCHE_COLORS.large, label: F.trancheLarge },
              ];
              return (
                <tr key={d.label} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                  <td className="mono py-[9px]" style={{ color: "var(--ink-3)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <th scope="row" className="py-[9px] pr-3 text-left font-normal">
                    <span className="flex items-center gap-2">
                      <span
                        className="dot"
                        aria-hidden
                        style={{ width: 9, height: 9, background: dotColor, ...fillEdge(dotColor) }}
                      />
                      {d.nif ? (
                        <Link href={`/${locale}/party/${d.nif}`} className="truncate hover:underline">
                          {d.label}
                        </Link>
                      ) : (
                        <span className="truncate">{d.label}</span>
                      )}
                    </span>
                  </th>
                  <td className="py-[9px] pr-4">
                    <Bar segments={segments} total={max} scale="compare" size="md" />
                  </td>
                  <td className="mono whitespace-nowrap py-[9px] text-right">
                    {euroExact(d.total.amount, bcp47)}
                  </td>
                  <td
                    className="mono whitespace-nowrap py-[9px] text-right"
                    style={{ color: "var(--ink-3)" }}
                  >
                    {integer(d.total.donors, bcp47)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollBox>

      <BarLegend
        className="mt-4"
        segments={[
          { value: 1, color: TRANCHE_COLORS.small, label: F.trancheSmall },
          { value: 1, color: TRANCHE_COLORS.mid, label: F.trancheMid },
          { value: 1, color: TRANCHE_COLORS.large, label: F.trancheLarge },
        ]}
      />
      <Caveat label={t.common.caveat} className="mt-2">
        {F.barNote}
      </Caveat>

      <p
        className="mt-4"
        style={{ fontSize: "12px", lineHeight: 1.55, color: "var(--ink-3)", maxWidth: "88ch" }}
      >
        {F.legalNote}{" "}
        <Link href={`/${locale}/metodologia`} className="src">
          {t.rights.methodLink}
        </Link>
      </p>
    </section>
  );
}
