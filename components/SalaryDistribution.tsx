import { euro, euroCompact, fill, integer, percent } from "@/lib/format";
import {
  axisPosition,
  type SalaryDistribution as Distribution,
  type SalaryPosition,
} from "@/lib/salary-distribution";
import type { Dict } from "@/lib/i18n";
import SourceLine, { type ChartSource } from "./chart/SourceLine";
import DataTable from "./chart/DataTable";

/**
 * One person's pay against every published figure in the register.
 *
 * The page used to print a euro figure and stop, which asks the reader to judge
 * whether €31,200 is a lot for a public post in Spain. Almost nobody can. This
 * puts the figure on the distribution it came from, so the judgement is made by
 * looking rather than guessed.
 *
 * The axis is logarithmic because the data spans four orders of magnitude and a
 * linear axis would compress 93 % of the register into the first eighth of the
 * width. Logarithmic axes mislead when a reader reads distance as difference,
 * so every decade is ticked and labelled, and the marker prints the exact
 * figure rather than relying on its position.
 *
 * The histogram is `aria-hidden`; the sentence beneath it carries the same
 * finding — rank, denominator and median — in text, and the table under it
 * lists every bar.
 *
 * Both axes are named on the chart itself. The bars had no value-axis title,
 * so nothing said they were counts of posts, and the log scale was stated only
 * in the caveat below — a reader who looked at the chart and not the small
 * print would read equal distances as equal differences in euros.
 */

const W = 100; // viewBox units; the SVG scales to its container
const H = 34;
const BASE = 28; // baseline, leaving room for the tick labels

/**
 * Horizontal inset, in viewBox units.
 *
 * The marker sits at x = 0 for the lowest figure in the register and x = W for
 * the highest, and both of those are real rows. Without an inset the marker's
 * own width and its arrowhead are half outside the viewBox and get clipped, so
 * the two people the chart is most likely to be read for are the two whose
 * marker is drawn wrong. The plot is inset instead of the marker being clamped,
 * because clamping would move the line off the value it points at.
 */
const PAD = 1.4;
const PLOT = W - PAD * 2;

/** A 0-1 axis position as a viewBox x. */
const X = (pos: number) => PAD + pos * PLOT;

export default function SalaryDistributionChart({
  gross,
  distribution: d,
  position,
  t,
  charts,
  source,
  bcp47,
}: {
  gross: number;
  distribution: Distribution;
  /** Null when this person has no published figure. */
  position: SalaryPosition | null;
  t: Dict["salaryShape"];
  charts: Dict["charts"];
  /** The pay register the distribution is built from. */
  source: ChartSource;
  bcp47: string;
}) {
  const binW = PLOT / d.bins.length;
  const marker = position === null ? null : X(axisPosition(gross, d));
  const medianX = X(axisPosition(d.median, d));

  const finding = `${sentence(position, gross, d, t, bcp47)} ${t.median.replace(
    "{median}",
    euro(d.median, bcp47),
  )}`;

  return (
    <figure className="mt-6">
      {/* The value axis: what a bar's height counts, above the top-left of the
          plot and horizontal, since rotated text is the hardest kind to read.
          The tallest bar's count gives the scale a number. */}
      <p className="label-mono mb-1.5">
        {fill(t.yAxis, { peak: integer(d.peak, bcp47) })}
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-24 w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        {d.bins.map((b, i) => {
          const h = (b.count / d.peak) * BASE;
          return (
            <rect
              key={i}
              x={PAD + i * binW}
              y={BASE - h}
              width={binW * 0.86}
              height={h}
              fill="var(--ink-3)"
            />
          );
        })}

        {/* Decade ticks. preserveAspectRatio="none" stretches the x axis, so
            every stroke is drawn as a rect with a width in x units rather than
            as a line with a stroke-width, which the stretch would distort. */}
        {d.ticks.map((v) => (
          <rect
            key={v}
            x={X(axisPosition(v, d))}
            y={0}
            width={0.12}
            height={BASE}
            fill="var(--line)"
          />
        ))}

        {/* The median, dashed by repetition rather than by stroke-dasharray for
            the same reason. */}
        {Array.from({ length: 7 }, (_, i) => (
          <rect
            key={i}
            x={medianX - 0.09}
            y={(BASE / 7) * i + 1}
            width={0.18}
            height={BASE / 7 - 2}
            fill="var(--ink)"
          />
        ))}

        {marker !== null && (
          <>
            <rect x={marker - 0.22} y={0} width={0.44} height={BASE} fill="var(--gold-deep)" />
            <polygon
              points={`${marker - 1.1},0 ${marker + 1.1},0 ${marker},2.4`}
              fill="var(--gold-deep)"
            />
          </>
        )}
      </svg>

      {/* Tick labels in HTML, not SVG text: the viewBox is stretched, and
          stretched text is unreadable at either end. W is 100, so a viewBox x
          is also a percentage of the container's width and the labels line up
          with the ticks without a second scale. */}
      <div className="relative mt-1 h-4">
        {d.ticks.map((v) => (
          <span
            key={v}
            className="mono absolute -translate-x-1/2 whitespace-nowrap text-[var(--ink-3)]"
            style={{ left: `${X(axisPosition(v, d))}%`, fontSize: "11px" }}
          >
            {euroCompact(v, bcp47)}
          </span>
        ))}
      </div>

      {/* The median line is drawn, so it has to be named: an unlabelled dashed
          rule through the middle of a chart is a claim the reader cannot read.
          It gets its own row rather than sharing the tick row, where it would
          collide with a decade label at some values. */}
      <div className="relative h-4">
        <span
          className="mono absolute -translate-x-1/2 whitespace-nowrap text-[var(--ink-3)]"
          style={{ left: `${X(axisPosition(d.median, d))}%`, fontSize: "11px" }}
        >
          {t.medianTick}
        </span>
      </div>

      {/* The x axis's unit, and that it is logarithmic, said on the chart. */}
      <p className="label-mono mt-1">{t.xAxis}</p>

      <figcaption className="mt-3 text-sm leading-relaxed text-[var(--ink-2)]">{finding}</figcaption>

      <p className="mt-2 text-sm leading-relaxed text-[var(--ink-3)]">
        {t.caveat
          .replace("{missing}", integer(d.missing, bcp47))
          .replace("{total}", integer(d.published + d.missing, bcp47))
          .replace("{min}", euro(d.min, bcp47))
          .replace("{max}", euro(d.max, bcp47))}
      </p>

      <DataTable
        summary={charts.showTable}
        caption={`${fill(t.tableCaption, {
          published: integer(d.published, bcp47),
          bins: integer(d.bins.length, bcp47),
        })} ${finding}`}
        rows={d.bins}
        rowKey={(b) => String(b.from)}
        columns={[
          { header: t.colBand, cell: (b) => `${euro(b.from, bcp47)} – ${euro(b.to, bcp47)}` },
          { header: t.colCount, cell: (b) => integer(b.count, bcp47), numeric: true },
        ]}
      />
      <SourceLine sources={[source]} label={charts.source} />
    </figure>
  );
}

/**
 * The same position, in words. Split out because the two ends of the
 * distribution cannot be described by a percentile without lying: rounded to
 * whole percent, the fourth-highest figure in the register reads as higher than
 * 100 % of the register, which would include itself.
 */
function sentence(
  p: SalaryPosition | null,
  gross: number,
  d: Distribution,
  t: Dict["salaryShape"],
  bcp47: string,
): string {
  if (p === null) return t.noFigure;

  const pay = euro(gross, bcp47);
  const published = integer(p.published, bcp47);

  if (p.above === 0) return t.highest.replace("{pay}", pay).replace("{published}", published);
  if (p.below === 0) return t.lowest.replace("{pay}", pay).replace("{published}", published);

  // Rounded to whole percent, anything past these bounds prints as 0 % or
  // 100 %. Inside them the percentile is the clearer sentence; outside them a
  // count is the only true one.
  if (p.fraction >= 0.995)
    return t.nearTop
      .replace("{pay}", pay)
      .replace("{above}", integer(p.above, bcp47))
      .replace("{published}", published);
  if (p.fraction <= 0.005)
    return t.nearBottom
      .replace("{pay}", pay)
      .replace("{below}", integer(p.below, bcp47))
      .replace("{published}", published);

  return t.position
    .replace("{pay}", pay)
    .replace("{rank}", percent(p.fraction, bcp47, 0))
    .replace("{published}", published);
}
