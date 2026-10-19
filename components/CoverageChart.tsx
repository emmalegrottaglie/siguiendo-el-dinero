import { integer, percent } from "@/lib/format";
import type { Coverage } from "@/lib/coverage";
import Bar from "./chart/Bar";
import SourceLine, { type ChartSource } from "./chart/SourceLine";
import DataTable from "./chart/DataTable";
import type { Dict } from "@/lib/i18n";

/**
 * What fraction of each dataset is populated, as a picture.
 *
 * Every other chart on this site shows what the data says. This one shows how
 * much of it there is, which is the claim the methodology page has been making
 * in prose. A reader can check the sentence against the bar.
 *
 * Deliberately not ranked or scored. These four ratios measure different things
 * against different registers — a portrait is a licensing outcome, a roll-call
 * record is a fact about who sits in the Congreso — so ordering them by
 * percentage would invite a comparison that means nothing. They run in the
 * order a reader meets them on the site.
 *
 * The bars are `share`: each is a part of its own whole, and the unfilled track
 * is the gap. That is the one case on this site where the *empty* part of a bar
 * is the subject.
 */
export default function CoverageChart({
  coverage,
  t,
  sources,
  bcp47,
}: {
  coverage: Coverage;
  t: Dict;
  /** The datasets the four ratios are counted over, each with its date. */
  sources: ChartSource[];
  bcp47: string;
}) {
  const C = t.coverage;
  const label = (id: string) => C.rows[id as keyof typeof C.rows];

  return (
    <section className="mt-12">
      <h2 className="display section-tick text-2xl">{C.title}</h2>
      <p className="mt-6 text-[var(--ink-2)]">{C.intro}</p>

      <ul className="mt-8 flex flex-col gap-5">
        {coverage.ratios.map((r) => (
          <li key={r.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <span style={{ fontSize: "14px" }}>{label(r.id)}</span>
              <span className="mono whitespace-nowrap" style={{ fontSize: "13px" }}>
                {integer(r.covered, bcp47)}{" "}
                <span style={{ color: "var(--ink-3)" }}>
                  {C.of} {integer(r.total, bcp47)} ·{" "}
                  {percent(r.total > 0 ? r.covered / r.total : 0, bcp47)}
                </span>
              </span>
            </div>
            <Bar
              className="mt-1.5"
              segments={[{ value: r.covered, color: "var(--gold)", label: label(r.id) }]}
              total={r.total}
              scale="share"
              size="md"
            />
          </li>
        ))}
      </ul>

      <DataTable
        summary={t.charts.showTable}
        caption={C.tableCaption}
        rows={coverage.ratios}
        rowKey={(r) => r.id}
        columns={[
          { header: C.colWhat, cell: (r) => label(r.id) },
          { header: C.colCovered, cell: (r) => integer(r.covered, bcp47), numeric: true },
          { header: C.colTotal, cell: (r) => integer(r.total, bcp47), numeric: true },
          {
            header: C.colShare,
            cell: (r) => percent(r.total > 0 ? r.covered / r.total : 0, bcp47),
            numeric: true,
          },
        ]}
      />
      <SourceLine sources={sources} label={t.charts.source} />

      {/* Counts with no denominator. Drawing these as bars would invent a whole
          they are not a part of: the Congreso holds thousands of divisions, and
          nine of them being tracked is not nine-thousandths of anything the
          reader should picture. */}
      <p className="mt-6 leading-relaxed text-[var(--ink-2)]">
        {C.counts
          .replace(
            "{divisions}",
            integer(coverage.counts.find((c) => c.id === "divisions")?.value ?? 0, bcp47),
          )
          .replace(
            "{deputies}",
            integer(coverage.counts.find((c) => c.id === "deputies")?.value ?? 0, bcp47),
          )
          .replace(
            "{donationYear}",
            String(coverage.counts.find((c) => c.id === "donationYear")?.value ?? ""),
          )}
      </p>

      {coverage.orphanPortraits > 0 && (
        <p className="mt-3 text-sm leading-relaxed text-[var(--ink-3)]">
          {C.orphans.replace("{n}", integer(coverage.orphanPortraits, bcp47))}
        </p>
      )}

      <p className="mt-4 text-sm leading-relaxed text-[var(--ink-3)]">{C.note}</p>
    </section>
  );
}
