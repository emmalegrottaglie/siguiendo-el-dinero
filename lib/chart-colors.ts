import type { Segment } from "@/components/chart/Bar";

/**
 * The colour a category gets, decided once.
 *
 * The three donation tranches were drawn three different ways: party colour /
 * party colour at 62 % / ink on the donations table, ink-3 / abstention grey /
 * ink on the front page, and ink-3 / gold / red on a party page. Same three
 * tranches, three palettes, on pages a reader moves between in two clicks.
 *
 * These are fills, so the 3:1 that WCAG 1.4.11 asks of a graphic applies rather
 * than the 4.5:1 for text — but their *labels* are text, which is why the
 * legend takes its colour from `BarLegend`'s swatch and never sets the label in
 * the fill colour.
 */

/**
 * Small to large. The ramp runs light-to-dark on purpose: the eye reads the
 * dark end as the heavier one, and the finding in this data is always that the
 * largest tranche holds the least of the money or the fewest of the people.
 */
export const TRANCHE_COLORS = {
  small: "var(--grey-500)",
  mid: "var(--gold)",
  large: "var(--ink)",
} as const;

/**
 * The report's own spending categories. The residual takes the alert colour
 * because it is the finding — the part whose destination the audit does not
 * state — and not because anything improper is alleged about it.
 */
export const SPEND_COLORS = {
  advertising: "var(--gold)",
  financial: "var(--grey-500)",
  residual: "var(--red)",
  /** Accounted outside the general limit, so it is deliberately inert. */
  mailings: "var(--grey-300)",
} as const;

/**
 * A division's outcome.
 *
 * Sí and No used to be --verd and --red, which differ in hue and barely in
 * lightness: simulated for deuteranopia they came out 0.1 L* apart, so a
 * colour-blind reader saw one colour where the bar showed two. They are now
 * separated by lightness (--stance-si is mid, --stance-no is dark; the measured
 * figures are with the tokens in app/globals.css), and No also carries a hatch,
 * so the two never differ by colour alone. Build stance bars with
 * `stanceSegments`, which applies both, rather than listing the colours by hand.
 */
export const STANCE_COLORS = {
  si: "var(--stance-si)",
  no: "var(--stance-no)",
  abstention: "var(--abst)",
} as const;

/** The non-colour cue: which stance is hatched, and in which ink. */
export const STANCE_STRIPE = {
  si: false,
  no: "light",
  abstention: false,
} as const satisfies Record<keyof typeof STANCE_COLORS, Segment["striped"]>;

/**
 * The same three stances, for a swatch that stands alone on the page.
 *
 * `--abst` is a light grey, which works where an abstention segment sits
 * between two saturated segments of the same bar: WCAG 1.4.11 asks a graphical
 * object to contrast with what is *adjacent* to it, and there its neighbours
 * are the sí and no segments. A standalone swatch's neighbour is the page,
 * where `--abst` reaches only 1.8:1 and a reader cannot tell a light grey cell
 * from an empty one.
 *
 * So abstention darkens to `--ink-3` (5.8:1) when the swatch is on its own.
 * This is a second variant rather than a change to `--abst`, because darkening
 * the token itself would bring it close to the sí fill and break the stacked
 * bars it was chosen for. No is hatched here exactly as in the bars.
 */
export const STANCE_SWATCH = {
  si: "var(--stance-si)",
  no: "var(--stance-no)",
  abstention: "var(--ink-3)",
} as const;

/**
 * The three segments of a stance bar, in the site's fixed order (sí, no,
 * abstention), with each stance's colour and hatch. A legend for the same bar
 * takes the same function's output, so the two cannot drift.
 */
export function stanceSegments(
  counts: { si: number; no: number; abstention: number },
  labels: { si: string; no: string; abstention: string },
): Segment[] {
  return (["si", "no", "abstention"] as const).map((k) => ({
    value: counts[k],
    color: STANCE_COLORS[k],
    label: labels[k],
    striped: STANCE_STRIPE[k] || undefined,
  }));
}

/**
 * State subsidy kinds. `seguridad` is hatched rather than given a colour of its
 * own: it is a small share on most rows, and a fourth hue in a chart that
 * already carries 28 party colours would not be distinguishable. The hatch is
 * legended wherever it appears — an unexplained hatch reads as a warning, and
 * this is an ordinary category.
 */
export const SUBSIDY_COLORS = {
  seguridad: "var(--ink-2)",
  otra: "var(--grey-500)",
} as const;

/**
 * Where a party foundation's money comes from. Party money leads the table and
 * takes the accent, because it is nine tenths of the total and the least
 * expected; corporate money takes the alert colour because it is the thing a
 * reader arrives looking for, not because anything improper is alleged.
 */
export const CHANNEL_COLORS = {
  party: "var(--gold)",
  companies: "var(--red)",
  individuals: "var(--ink-2)",
  subsidies: "var(--grey-500)",
} as const;
