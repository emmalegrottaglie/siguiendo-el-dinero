import { euro, euroCompact, fill, integer, percent } from "@/lib/format";
import {
  axisPosition,
  type SalaryDistribution,
  type SalaryPosition,
} from "@/lib/salary-distribution";
import type { Dict } from "@/lib/i18n";
import SourceText, { type Source } from "./SourceText";

/**
 * One person's published pay against every published figure in the register.
 *
 * A euro figure on its own asks the reader to judge whether it is a lot for a
 * public post in Spain, which almost nobody can. This puts it on the
 * distribution it came from, so the judgement is made by looking.
 *
 * The axis is logarithmic: the register spans four orders of magnitude, from
 * village mayoralties paid a few euros a month to European posts, and a linear
 * axis would crowd nearly all of it into the first eighth of the width. Every
 * decade is ticked and labelled, both axes are named on the chart, and the
 * marker's exact figure is written in the sentence beneath, so no value is
 * read off a distance alone.
 *
 * The drawing is aria-hidden. The sentence carries the finding (rank,
 * denominator, median) in words and the table below lists every bar. The
 * register's own state is in the stroke: published pay is the State's money,
 * so the marker is drawn in the State route's colour.
 *
 * This is not a ranking of who is overpaid. A position in a list that mixes a
 * part-time mayoralty with the Crown is a position in a list, and the caveat
 * says so.
 */

const W = 100;
const BASE = 28;
/** Inset so a marker at either end of the register is not clipped. */
const PAD = 1.4;
const PLOT = W - PAD * 2;
const X = (pos: number) => PAD + pos * PLOT;

export default function PayDistribution({
  gross,
  distribution: d,
  position,
  t,
  showTable,
  source,
  sourceLabel,
  bcp47,
}: {
  gross: number;
  distribution: SalaryDistribution;
  /** Null when this person has no published figure. */
  position: SalaryPosition | null;
  t: Dict["salaryShape"];
  showTable: string;
  source: Source;
  sourceLabel: string;
  bcp47: string;
}) {
  const binW = PLOT / d.bins.length;
  const marker = position === null ? null : X(axisPosition(gross, d));
  const medianX = X(axisPosition(d.median, d));
  const finding = `${sentence(position, gross, t, bcp47)} ${fill(t.median, { median: euro(d.median, bcp47) })}`;

  const binOf = (v: number) =>
    d.bins.findIndex((b, i) => v >= b.from && (v < b.to || i === d.bins.length - 1));
  const hereBin = position === null ? -1 : binOf(gross);
  const medianBin = binOf(d.median);

  return (
    <figure className="n-state mt-8 max-w-[52rem]">
      <h3 className="n-h3">{t.title}</h3>
      <p className="n-finding mt-3">{finding}</p>

      {/* What a bar's height counts, written horizontally above the plot. */}
      <p className="n-meta mt-6">{fill(t.yAxis, { peak: integer(d.peak, bcp47) })}</p>
      <svg
        viewBox={`0 0 ${W} ${BASE}`}
        className="mt-1 block h-24 w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        {d.bins.map((b, i) => {
          const h = (b.count / d.peak) * BASE;
          return (
            <rect key={i} x={PAD + i * binW} y={BASE - h} width={binW * 0.86} height={h} fill="var(--n-rule-strong)" />
          );
        })}
        {/* The x axis is stretched, so every stroke is a rect with a width in
            x units rather than a line whose stroke the stretch would distort. */}
        {d.ticks.map((v) => (
          <rect key={v} x={X(axisPosition(v, d))} y={0} width={0.12} height={BASE} fill="var(--n-rule)" />
        ))}
        {/* The median, dashed by repetition. */}
        {Array.from({ length: 7 }, (_, i) => (
          <rect
            key={`m${i}`}
            x={medianX - 0.09}
            y={(BASE / 7) * i + 1}
            width={0.18}
            height={BASE / 7 - 2}
            fill="var(--n-ink)"
          />
        ))}
        {marker !== null && (
          <>
            <rect x={marker - 0.25} y={0} width={0.5} height={BASE} fill="var(--route)" />
            <polygon points={`${marker - 1.1},0 ${marker + 1.1},0 ${marker},2.6`} fill="var(--route)" />
          </>
        )}
      </svg>
      {/* Tick labels in HTML: SVG text would be stretched with the viewBox.
          W is 100, so a viewBox x is also a percentage of the width. */}
      <div aria-hidden className="relative mt-1 h-5">
        {d.ticks.map((v) => (
          <span
            key={v}
            className="n-meta n-num absolute -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${X(axisPosition(v, d))}%` }}
          >
            {euroCompact(v, bcp47)}
          </span>
        ))}
      </div>
      <div aria-hidden className="relative h-5">
        <span className="n-meta absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${medianX}%` }}>
          {t.medianTick}
        </span>
      </div>
      <p className="n-meta mt-1">{t.xAxis}</p>

      <p className="n-meta mt-4 max-w-[var(--n-w-read)]">
        {fill(t.caveat, {
          missing: integer(d.missing, bcp47),
          total: integer(d.published + d.missing, bcp47),
          min: euro(d.min, bcp47),
          max: euro(d.max, bcp47),
        })}
      </p>

      <details className="mt-4">
        <summary className="cursor-pointer text-[0.9375rem] font-bold">{showTable}</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="n-table max-w-[32rem]">
            <caption className="sr-only">
              {fill(t.tableCaption, {
                published: integer(d.published, bcp47),
                bins: integer(d.bins.length, bcp47),
              })}{" "}
              {finding}
            </caption>
            <thead>
              <tr>
                <th scope="col">{t.colBand}</th>
                <th scope="col" className="n-r">{t.colCount}</th>
              </tr>
            </thead>
            <tbody>
              {d.bins.map((b, i) => (
                <tr key={b.from}>
                  <th scope="row" className="n-num font-normal">
                    {euro(b.from, bcp47)} – {euro(b.to, bcp47)}
                    {i === hereBin && <span className="n-meta block">{t.readerHere}</span>}
                    {i === medianBin && <span className="n-meta block">{t.readerMedian}</span>}
                  </th>
                  <td className="n-r">{integer(b.count, bcp47)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <SourceText sources={[source]} label={sourceLabel} />
    </figure>
  );
}

/**
 * The position in words. The two ends of the register cannot be described by
 * a rounded percentile without lying (the fourth-highest figure would read as
 * "above 100 %", a group that includes itself), so there a count is used.
 */
function sentence(p: SalaryPosition | null, gross: number, t: Dict["salaryShape"], bcp47: string): string {
  if (p === null) return t.noFigure;
  const pay = euro(gross, bcp47);
  const published = integer(p.published, bcp47);
  if (p.above === 0) return fill(t.highest, { pay, published });
  if (p.below === 0) return fill(t.lowest, { pay, published });
  if (p.fraction >= 0.995) return fill(t.nearTop, { pay, above: integer(p.above, bcp47), published });
  if (p.fraction <= 0.005) return fill(t.nearBottom, { pay, below: integer(p.below, bcp47), published });
  return fill(t.position, { pay, rank: percent(p.fraction, bcp47, 0), published });
}
