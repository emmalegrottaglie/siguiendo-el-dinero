import Bar from "./chart/Bar";
import SourceLine, { type ChartSource } from "./chart/SourceLine";
import ChartReader from "./chart/ChartReader";
import ExportButton from "./chart/ExportButton";
import { readerProps, say } from "@/lib/chart-reader";
import { exportLabels, exportMeta, type ChartExport } from "@/lib/chart-export";
import { percent } from "@/lib/format";
import type { Indicators } from "@/lib/indicators";
import { smiLadder, sourceFor } from "@/lib/indicators";
import type { Dict } from "@/lib/i18n";

/**
 * The whole wage-earning workforce, bucketed by multiples of the minimum wage.
 *
 * This is the chart that puts every salary on this site — a village mayor's
 * €9,996 and a commissioner's €424,237 alike — on one axis that a reader
 * already understands, because the SMI is a single legally-fixed number the
 * whole country argues about once a year.
 *
 * Two thirds of Spanish wage earners are inside two minimum wages. That fact
 * needs no comparison drawn for it and none is drawn: the bars are the
 * workforce, and what any particular post is paid is stated elsewhere on the
 * site. The page puts them near each other and leaves the arithmetic to the
 * reader, which is this project's standing rule.
 *
 * The bars are `compare` against the largest tranche rather than `share` of the
 * workforce. They do partition the workforce and would be legitimate as one
 * stacked bar, but at 0.12 % the top tranche would be two pixels of a hundred
 * and the reader would see nothing. Separate rows give the small tranches a
 * length worth reading and every row prints its exact percentage.
 */
export default function SmiLadder({
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
  const S = t.smi;
  const tranches = smiLadder(indicators);
  const top = Math.max(...tranches.map((r) => r.percent ?? 0));
  const src = sourceFor(indicators, "smiTranches");

  // The share inside two minimum wages, computed from the two tranches the
  // reader can see and add up themselves rather than from a separate figure.
  const underTwo = tranches
    .filter((r) => r.tranche === "De 0 a 1 SMI" || r.tranche === "De 1 a 2 SMI")
    .reduce((n, r) => n + (r.percent ?? 0), 0);

  const source: ChartSource = { publisher: "INE", name: src.name, period: src.period, url: src.url };
  const intro = S.intro.replace("{underTwo}", percent(underTwo / 100, bcp47));
  // A tranche INE leaves empty is unknown, not zero.
  const shown = (r: (typeof tranches)[number]) =>
    r.percent === null || r.percent === undefined ? "—" : percent(r.percent / 100, bcp47, 2);
  const image: ChartExport = {
    ...exportMeta(charts, bcp47, {
      title: S.title,
      caption: intro,
      sources: [source],
      file: "salarios-en-multiplos-del-smi",
    }),
    body: {
      kind: "bars",
      rows: tranches.map((r) => ({
        label: r.lowSample ? `${r.tranche} (${t.wages.lowSample})` : r.tranche,
        value: shown(r),
        segments: [{ value: r.percent ?? 0, color: "var(--verd)" }],
        total: top,
        scale: "compare",
      })),
    },
  };

  return (
    <section className="mt-16">
      <h2 className="display section-tick text-2xl">{S.title}</h2>
      <p className="mt-6 leading-relaxed text-[var(--ink-2)]">
        {intro}
      </p>

      <ChartReader
        className="mt-8"
        items={tranches.map((r) => say(r.tranche, shown(r), r.lowSample && t.wages.lowSample))}
        {...readerProps(charts, bcp47, { title: S.title, count: tranches.length })}
      >
        <ul className="flex flex-col gap-4">
          {tranches.map((r, i) => (
            <li key={r.tranche} data-chart-item={i}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <span style={{ fontSize: "14px" }}>
                  {r.tranche}
                  {r.lowSample && (
                    <span className="label-mono ml-2 text-[var(--ink-3)]">{t.wages.lowSample}</span>
                  )}
                </span>
                <span className="mono whitespace-nowrap" style={{ fontSize: "13px" }}>
                  {shown(r)}
                </span>
              </div>
              <Bar
                className="mt-1.5"
                segments={[{ value: r.percent ?? 0, color: "var(--verd)", label: r.tranche }]}
                total={top}
                scale="compare"
                size="sm"
              />
            </li>
          ))}
        </ul>
      </ChartReader>

      <SourceLine sources={[source]} note={S.sourceNote} caveatLabel={caveatLabel} />
      <ExportButton className="mt-3" spec={image} {...exportLabels(charts, S.title)} />
    </section>
  );
}
