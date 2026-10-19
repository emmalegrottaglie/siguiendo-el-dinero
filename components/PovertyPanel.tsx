import Bar from "./chart/Bar";
import SourceLine, { type ChartSource } from "./chart/SourceLine";
import ChartReader from "./chart/ChartReader";
import ExportButton from "./chart/ExportButton";
import { readerProps, say } from "@/lib/chart-reader";
import { exportLabels, exportMeta, type ChartExport } from "@/lib/chart-export";
import { percent } from "@/lib/format";
import type { Indicators, PovertyRow } from "@/lib/indicators";
import { AROPE_BASE, povertyBases, povertyRate, sourceFor } from "@/lib/indicators";
import type { Dict } from "@/lib/i18n";

/**
 * How many people the money on this site is being spent on behalf of.
 *
 * Four ECV indicators, each a share of a population, so each is drawn as a
 * `share` bar where the unfilled track is the rest of the country. No trend
 * line, no comparison with any party's votes or funding: the framing rule for
 * this whole layer is factual juxtaposition, and a chart that placed a poverty
 * rate against a voting record on the same axis would be asserting the thing
 * the rule forbids.
 *
 * Every row states its base. The ECV table carries indicators under more than
 * one definition — the Base 2013 AROPE series and the objetivo Europa 2030
 * series are different measurements sharing a name — and a page that showed an
 * AROPE rate without saying which one would be publishing an ambiguous number.
 * If the ingest ever brings in a second base, the note beneath says so rather
 * than the page silently picking one.
 */

/** The four indicators, in the order ECV itself lists them. */
const ROWS: { id: string; startsWith: string; ageGroup: string }[] = [
  { id: "arope", startsWith: "Tasa de riesgo de pobreza o exclusión social", ageGroup: "Total" },
  { id: "aropeChildren", startsWith: "Tasa de riesgo de pobreza o exclusión social", ageGroup: "Menores de 16 años" },
  { id: "atRisk", startsWith: "En riesgo de pobreza", ageGroup: "Total" },
  { id: "deprivation", startsWith: "Con carencia material y social severa", ageGroup: "Total" },
];

export default function PovertyPanel({
  indicators,
  t,
  bcp47,
  caveatLabel,
  charts,
}: {
  indicators: Indicators;
  t: Dict["contexto"];
  bcp47: string;
  caveatLabel: string;
  charts: Dict["charts"];
}) {
  const P = t.poverty;
  const src = sourceFor(indicators, "povertyNational");
  const regionalSrc = sourceFor(indicators, "povertyRegional");
  const bases = povertyBases(indicators);

  const found = ROWS.map((r) => ({
    ...r,
    row: povertyRate(indicators, {
      indicatorStartsWith: r.startsWith,
      ageGroup: r.ageGroup,
      base: AROPE_BASE,
    }),
  })).filter((r): r is typeof r & { row: PovertyRow } => r.row !== null && r.row.percent !== null);

  // The regional spread, from the comunidades themselves rather than from a
  // separate national statistic — the highest and lowest AROPE rate on the same
  // base, so the national figure is not read as a description of anywhere.
  const regional = indicators.poverty.regional
    .filter(
      (r) =>
        r.base === AROPE_BASE &&
        r.group === "Total" &&
        r.region !== "Total Nacional" &&
        r.indicator.startsWith("Tasa de riesgo de pobreza o exclusión social") &&
        r.percent !== null,
    )
    .sort((a, b) => (b.percent ?? 0) - (a.percent ?? 0));

  const sources: ChartSource[] = [
    { publisher: "INE", name: src.name, period: src.period, url: src.url },
    { publisher: "INE", name: regionalSrc.name, period: regionalSrc.period, url: regionalSrc.url },
  ];
  const rowLabel = (id: string) => P.rows[id as keyof typeof P.rows];
  const shown = (row: PovertyRow) =>
    row.percent === null ? "—" : percent(row.percent / 100, bcp47);
  const image: ChartExport = {
    ...exportMeta(charts, bcp47, {
      title: P.title,
      caption: `${P.intro} ${P.note}`,
      sources,
      file: "pobreza-y-exclusion",
    }),
    body: {
      kind: "bars",
      rows: found.map(({ id, row }) => ({
        label: rowLabel(id),
        value: shown(row),
        segments: [{ value: row.percent ?? 0, color: "var(--red)" }],
        total: 100,
        scale: "share",
      })),
    },
  };

  return (
    <section className="mt-16">
      <h2 className="display section-tick text-2xl">{P.title}</h2>
      <p className="mt-6 leading-relaxed text-[var(--ink-2)]">{P.intro}</p>

      <ChartReader
        className="mt-8"
        items={found.map(({ id, row }) => say(rowLabel(id), shown(row)))}
        {...readerProps(charts, bcp47, { title: P.title, count: found.length })}
      >
        <ul className="flex flex-col gap-5">
          {found.map(({ id, row }, i) => (
            <li key={id} data-chart-item={i}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <span style={{ fontSize: "14px" }}>
                  {P.rows[id as keyof typeof P.rows]}
                </span>
                <span className="mono whitespace-nowrap" style={{ fontSize: "13px" }}>
                  {shown(row)}
                </span>
              </div>
              <Bar
                className="mt-1.5"
                segments={[
                  {
                    value: row.percent ?? 0,
                    color: "var(--red)",
                    label: P.rows[id as keyof typeof P.rows],
                  },
                ]}
                total={100}
                scale="share"
                size="md"
              />
            </li>
          ))}
        </ul>
      </ChartReader>

      {regional.length > 1 && (
        <p className="mt-6 leading-relaxed text-[var(--ink-2)]">
          {P.spread
            .replace("{highRegion}", regional[0].region)
            .replace("{high}", percent((regional[0].percent ?? 0) / 100, bcp47))
            .replace("{lowRegion}", regional[regional.length - 1].region)
            .replace("{low}", percent((regional[regional.length - 1].percent ?? 0) / 100, bcp47))}
        </p>
      )}

      <SourceLine
        sources={sources}
        note={
          bases.length === 1
            ? P.base.replace("{base}", bases[0])
            : P.multipleBases.replace("{bases}", bases.join(", ")).replace("{shown}", AROPE_BASE)
        }
        caveatLabel={caveatLabel}
      />
      <ExportButton className="mt-3" spec={image} {...exportLabels(charts, P.title)} />

      <p className="mt-6 leading-relaxed text-[var(--ink-3)]">{P.note}</p>
    </section>
  );
}
