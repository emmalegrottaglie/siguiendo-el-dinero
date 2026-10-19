import { euro, euroCompact, fill, integer, percent } from "@/lib/format";
import {
  axisPosition,
  type SalaryDistribution as Distribution,
  type SalaryPosition,
} from "@/lib/salary-distribution";
import type { Dict } from "@/lib/i18n";
import SourceLine, { type ChartSource } from "./chart/SourceLine";
import DataTable from "./chart/DataTable";
import ChartReader from "./chart/ChartReader";
import ExportButton from "./chart/ExportButton";
import { readerProps, say } from "@/lib/chart-reader";
import {
  exportLabels,
  exportMeta,
  type ChartExport,
  type ExportLabel,
  type ExportShape,
} from "@/lib/chart-export";

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
  subject,
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
  /** Whose pay this is, for the exported image's title: "Nombre · cargo". */
  subject?: string;
  bcp47: string;
}) {
  const binW = PLOT / d.bins.length;
  const marker = position === null ? null : X(axisPosition(gross, d));
  const medianX = X(axisPosition(d.median, d));

  const finding = `${sentence(position, gross, d, t, bcp47)} ${t.median.replace(
    "{median}",
    euro(d.median, bcp47),
  )}`;

  // Which bin holds this person's figure and which the median, so the reader
  // can say so on the bin the marker crosses.
  const binOf = (v: number) =>
    d.bins.findIndex((b, i) => v >= b.from && (v < b.to || i === d.bins.length - 1));
  const hereBin = position === null ? -1 : binOf(gross);
  const medianBin = binOf(d.median);
  const band = (b: (typeof d.bins)[number]) => `${euro(b.from, bcp47)} – ${euro(b.to, bcp47)}`;
  const items = d.bins.map((b, i) =>
    say(
      band(b),
      fill(t.readerBin, { count: integer(b.count, bcp47) }),
      i === hereBin && t.readerHere,
      i === medianBin && t.readerMedian,
    ),
  );

  // The image redraws the same marks in the same 0-100 space, with room above
  // for the value-axis title and below for the ticks, the median label and the
  // x-axis title. Text is placed, not stretched.
  const TOP = 6;
  const rect = (x: number, y: number, w: number, h: number) =>
    `M${x} ${y + TOP}h${w}v${h}h${-w}Z`;
  const shapes: ExportShape[] = [
    ...d.bins.map((b, i) => {
      const h = (b.count / d.peak) * BASE;
      return { d: rect(PAD + i * binW, BASE - h, binW * 0.86, h), fill: "var(--ink-3)" };
    }),
    ...d.ticks.map((v) => ({ d: rect(X(axisPosition(v, d)), 0, 0.12, BASE), fill: "var(--line)" })),
    ...Array.from({ length: 7 }, (_, i) => ({
      d: rect(medianX - 0.09, (BASE / 7) * i + 1, 0.18, BASE / 7 - 2),
      fill: "var(--ink)",
    })),
    ...(marker === null
      ? []
      : [
          { d: rect(marker - 0.22, 0, 0.44, BASE), fill: "var(--gold-deep)" },
          {
            d: `M${marker - 1.1} ${TOP}L${marker + 1.1} ${TOP}L${marker} ${TOP + 2.4}Z`,
            fill: "var(--gold-deep)",
          },
        ]),
  ];
  const labels: ExportLabel[] = [
    { x: PAD, y: 0, text: fill(t.yAxis, { peak: integer(d.peak, bcp47) }).toUpperCase(), size: 12, tone: "ink-3", weight: 600, face: "heading" },
    ...d.ticks.map((v) => ({
      x: X(axisPosition(v, d)),
      y: TOP + BASE + 1.2,
      text: euroCompact(v, bcp47),
      align: "center" as const,
      size: 13,
      tone: "ink-3" as const,
    })),
    { x: medianX, y: TOP + BASE + 5.4, text: t.medianTick, align: "center", size: 13, tone: "ink-3" },
    { x: PAD, y: TOP + BASE + 9.8, text: t.xAxis.toUpperCase(), size: 12, tone: "ink-3", weight: 600, face: "heading" },
    ...(marker === null
      ? []
      : [
          {
            // Above the plot, beside the arrowhead, so it crosses no bar.
            x: marker > 70 ? marker + 1.4 : marker - 1.4,
            y: 2.4,
            text: euro(gross, bcp47),
            align: marker > 70 ? ("right" as const) : ("left" as const),
            size: 15,
            weight: 600 as const,
          },
        ]),
  ];
  const image: ChartExport = {
    ...exportMeta(charts, bcp47, {
      title: subject ? `${t.title}: ${subject}` : t.title,
      caption: finding,
      sources: [source],
      file: "retribucion-en-el-registro",
    }),
    body: { kind: "shapes", width: W, height: TOP + BASE + 13, stretch: true, shapes, labels },
  };

  return (
    <figure className="mt-6">
      {/* The value axis: what a bar's height counts, above the top-left of the
          plot and horizontal, since rotated text is the hardest kind to read.
          The tallest bar's count gives the scale a number. */}
      <p className="label-mono mb-1.5">
        {fill(t.yAxis, { peak: integer(d.peak, bcp47) })}
      </p>
      <ChartReader
        items={items}
        {...readerProps(charts, bcp47, {
          title: t.title,
          count: d.bins.length,
          range: { min: euro(d.min, bcp47), max: euro(d.max, bcp47) },
        })}
      >
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

          {/* One full-height column per bin, for the keyboard cursor and the
              pointer: a bin of two posts is too short to outline or to hover. */}
          {d.bins.map((b, i) => (
            <rect
              key={`hit-${b.from}`}
              data-chart-item={i}
              x={PAD + i * binW}
              y={0}
              width={binW}
              height={BASE}
              fill="transparent"
            />
          ))}
        </svg>
      </ChartReader>

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
      <ExportButton className="mt-3" spec={image} {...exportLabels(charts, t.title)} />
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
