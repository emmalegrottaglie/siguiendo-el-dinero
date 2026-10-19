import { cssPercent } from "@/lib/format";

/**
 * The one bar on this site.
 *
 * There were nine of them before this, at six different heights, with two
 * incompatible scale conventions and three different colour sets for the same
 * three donation tranches. A reader comparing two bars on one page had no way
 * to know whether they were comparing like with like, which is worse than
 * having no bar: a chart that looks consistent and is not misleads by
 * implication.
 *
 * So the convention is a required prop, not a default, and it is stated in the
 * legend that renders from the same segments.
 */

/** How the segments relate to the track. */
export type BarScale =
  /**
   * The segments are parts of a whole, and they fill the track. `total` is that
   * whole. Use when the question is "what is this made of".
   */
  | "share"
  /**
   * The bar's own length is `sum(segments) / total`, where `total` is the
   * largest row in the same set, and the segments divide that length. Use when
   * the question is "how does this row compare with the others".
   */
  | "compare";

export interface Segment {
  value: number;
  /** A CSS colour. Fills are exempt from the 4.5:1 text rule; 3:1 applies. */
  color: string;
  /** What this segment is. Required, because it is what the legend prints. */
  label: string;
  /**
   * A diagonal hatch over the fill. Only for a segment whose meaning a reader
   * would not guess from position — and never without the legend, since a
   * hatch that is not explained reads as a warning.
   *
   * `true` draws dark lines, for a light or mid fill. `"light"` draws lines in
   * the page colour, for a fill too dark for dark lines to show — the votó No
   * fill, where the hatch is what separates it from sí without relying on
   * colour.
   */
  striped?: Stripe;
}

export type Stripe = boolean | "light";

/**
 * The hatch drawn over a striped segment, as a CSS background-image.
 *
 * One function for the bar, its legend and any swatch that stands for the same
 * segment elsewhere (the ballot grid), so the pattern a reader is told about is
 * the pattern they see. `period` is the repeat in pixels; the line is half of it.
 */
export function stripeImage(striped: Stripe | undefined, period = 6): string | undefined {
  if (!striped) return undefined;
  const line = period / 2;
  const ink = stripeInk(striped);
  return `repeating-linear-gradient(45deg, ${ink} 0 ${line}px, transparent ${line}px ${period}px)`;
}

/** The hatch's line colour, shared with the exported image so the two match. */
export function stripeInk(striped: Stripe): string {
  return striped === "light" ? "rgba(243,242,242,0.5)" : "rgba(32,31,29,0.22)";
}

/** Named heights, so a bar's weight is a decision and not an accident. */
const HEIGHT = { sm: 8, md: 12, lg: 20, xl: 28 } as const;
export type BarSize = keyof typeof HEIGHT;

/**
 * The smallest a non-zero segment may render.
 *
 * Scaled linearly, thirteen of the seventeen parties in the donations table
 * come out under four pixels and several under one, so a real declared figure
 * renders as nothing at all. A floor keeps a non-zero value visible *as*
 * non-zero without pretending to be readable as a magnitude — which is
 * acceptable only because every one of these charts prints the exact figure
 * beside it, and the caption says the floor exists.
 */
const MIN_VISIBLE_PX = 2;

export default function Bar({
  segments,
  total,
  scale,
  size = "md",
  className = "",
}: {
  segments: Segment[];
  total: number;
  scale: BarScale;
  size?: BarSize;
  className?: string;
}) {
  const height = HEIGHT[size];
  const sum = segments.reduce((n, s) => n + s.value, 0);

  // In `compare` mode the row's own length is its share of the largest row, and
  // the segments then divide that length — so a segment's width is its share of
  // the row multiplied by the row's share of the maximum.
  const rowShare = scale === "compare" ? (total > 0 ? sum / total : 0) : 1;
  const denominator = scale === "compare" ? sum : total;

  return (
    // aria-hidden throughout: every chart here prints its figures as text
    // beside the bar, so announcing the bar as well would read the same numbers
    // twice. The text is the accessible representation, not a fallback.
    <span
      aria-hidden
      className={`bar-track ${className}`}
      style={{ height }}
    >
      {segments.map((s) =>
        s.value <= 0 ? null : (
          <i
            key={s.label}
            style={{
              width: cssPercent(
                denominator > 0 ? (s.value / denominator) * rowShare : 0,
              ),
              minWidth: MIN_VISIBLE_PX,
              background: s.color,
              backgroundImage: stripeImage(s.striped),
            }}
          />
        ),
      )}
    </span>
  );
}

/**
 * The legend for a bar, from the bar's own segments.
 *
 * Taking the same array is the point. A legend written out by hand beside a bar
 * drifts from it — that happened once here already, when a swatch was darkened
 * for contrast and stopped matching the segment it labelled.
 */
export function BarLegend({
  segments,
  formatValue,
  readable = false,
  className = "",
}: {
  segments: Segment[];
  /** Prints each segment's figure, if the legend should carry one. */
  formatValue?: (s: Segment) => string;
  /**
   * Marks each entry as a `ChartReader` item, in segment order, for a chart
   * whose legend is where its values are printed.
   */
  readable?: boolean;
  className?: string;
}) {
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-1.5 ${className}`}>
      {segments.map((s, i) => (
        <li
          key={s.label}
          className="flex items-center gap-2"
          data-chart-item={readable ? i : undefined}
        >
          <span
            aria-hidden
            style={{
              width: 11,
              height: 11,
              borderRadius: 1,
              flex: "none",
              background: s.color,
              backgroundImage: stripeImage(s.striped, 4),
            }}
          />
          <span className="label-mono">
            {s.label}
            {formatValue && (
              <>
                {" · "}
                <span className="mono">{formatValue(s)}</span>
              </>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
