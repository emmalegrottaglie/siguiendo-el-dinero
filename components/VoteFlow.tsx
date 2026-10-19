import { DONATIONS_2020, DONATIONS_SOURCE } from "@/lib/donations";
import { euroExact, formatDate, integer } from "@/lib/format";
import { stancesByParty, voteDateISO, type Stance, type KeyVote } from "@/lib/votes";
import { PARTIES } from "@/lib/parties";
import { STANCE_SWATCH, svgFillEdge } from "@/lib/chart-colors";
import type { Dict } from "@/lib/i18n";
import SourceLine, { type ChartSource } from "./chart/SourceLine";
import DataTable from "./chart/DataTable";

/**
 * The site's standalone stance fills: each outcome node sits on the page, not
 * between other segments, so abstention takes the darker swatch grey rather
 * than --abst (1.8:1 on the page). No is also hatched (`HATCH_NO` below), as in
 * every stance bar.
 */
const STANCE_COLOUR: Record<Stance, string> = {
  si: STANCE_SWATCH.si,
  no: STANCE_SWATCH.no,
  ab: STANCE_SWATCH.abstention,
};

/** One page shows one flow diagram, so a fixed pattern id cannot collide. */
const HATCH_NO = "voteflow-hatch-no";

const W = 980;
const H = 530;
const TOP = 48;
const BOT = H - 18;
const GAP = 13;
const MIN_NODE = 6;
const SOURCE_X = 24;
const SOURCE_W = 13;
const PARTY_X = 470;
const OUT_X = 900;
const NODE_W = 13;

/**
 * Declared private donations on the left, the parties in the middle, the
 * group's vote on the right.
 *
 * The two registers are independent and public, and the chart puts them side by
 * side without joining them causally: the ribbon's thickness is the amount
 * declared in 2020, and the column it lands in is how that party's group voted
 * in 2026. A reader can see both at once, which is the point; nothing here
 * asserts that one produced the other, and the caveat saying so is part of the
 * chart rather than a footnote under it.
 *
 * Only parties whose group maps to them one-to-one appear. A party sitting
 * inside a composite group — Mixto, Plural — has no group stance of its own,
 * and attributing the group's majority to it would be exactly the inference
 * this site refuses to make elsewhere. Those parties are named as excluded
 * rather than silently dropped.
 *
 * Each outcome node is exactly as tall as the ribbons it receives, so the two
 * columns reconcile without a second scale.
 *
 * The diagram needs about 62rem to keep its labels apart, so on a narrower
 * screen it scrolls inside its own box — never the page — and says so above
 * the box. The table under it holds every figure the ribbons draw, for anyone
 * who would rather not scroll, and for screen readers, since the drawing is
 * aria-hidden.
 */
export default function VoteFlow({
  vote,
  t,
  sources,
  bcp47,
}: {
  vote: KeyVote;
  t: Dict;
  /** The donations report and the division's own record. */
  sources: ChartSource[];
  bcp47: string;
}) {
  const V = t.voteFlow;

  const stanceByNif = stancesByParty(vote);

  const included = DONATIONS_2020.filter(
    (d) => d.nif && stanceByNif.has(d.nif) && d.total.amount > 0,
  ).sort((a, b) => b.total.amount - a.total.amount);
  const excluded = DONATIONS_2020.filter((d) => !d.nif || !stanceByNif.has(d.nif));

  const sum = included.reduce((n, d) => n + d.total.amount, 0);
  if (included.length === 0 || sum === 0) return null;

  // Lay the party column out first: the available height less the gaps, shared
  // by amount, with a floor so the smallest party is still a visible node.
  const band = BOT - TOP;
  const gaps = GAP * (included.length - 1);
  const usable = band - gaps;
  const raw = included.map((d) => (d.total.amount / sum) * usable);
  const lifted = raw.map((h) => Math.max(h, MIN_NODE));
  // Lifting the small nodes to the floor overshoots the band, so the surplus is
  // taken back from the nodes that are above it, in proportion.
  const overshoot = lifted.reduce((n, h) => n + h, 0) - usable;
  const spare = lifted.reduce((n, h, i) => n + (h > MIN_NODE ? raw[i] : 0), 0);
  const heights = lifted.map((h, i) =>
    overshoot > 0 && h > MIN_NODE && spare > 0 ? h - (raw[i] / spare) * overshoot : h,
  );

  let y = TOP;
  const nodes = included.map((d, i) => {
    const node = { d, y, h: heights[i], stance: stanceByNif.get(d.nif!)! };
    y += heights[i] + GAP;
    return node;
  });

  // Outcome column: each node is the sum of the ribbons arriving at it.
  const order: Stance[] = ["si", "no", "ab"];
  const present = order.filter((s) => nodes.some((n) => n.stance === s));
  const outTotal = present.reduce(
    (n, s) => n + nodes.filter((x) => x.stance === s).reduce((m, x) => m + x.h, 0),
    0,
  );
  const outGaps = GAP * Math.max(0, present.length - 1);
  let oy = TOP + Math.max(0, (band - outTotal - outGaps) / 2);
  const outs = present.map((s) => {
    const h = nodes.filter((x) => x.stance === s).reduce((m, x) => m + x.h, 0);
    const node = { s, y: oy, h, cursor: oy };
    oy += h + GAP;
    return node;
  });
  const outBy = new Map(outs.map((o) => [o.s, o]));

  const label: Record<Stance, string> = {
    si: t.votes.inFavour,
    no: t.votes.against,
    ab: t.votes.abstention,
  };

  const mid = (PARTY_X + NODE_W + OUT_X) / 2;
  const srcMid = (SOURCE_X + SOURCE_W + PARTY_X) / 2;

  return (
    <section className="pt-9">
      <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-3">
        <div>
          <h3 className="display text-[22px] font-semibold" style={{ letterSpacing: "-0.015em" }}>
            {V.title}
          </h3>
          <p className="mono mt-1" style={{ fontSize: "11.5px", color: "var(--ink-3)" }}>
            {vote.law} · {formatDate(voteDateISO(vote), bcp47)}
          </p>
        </div>
        {/* Ships with the chart, not under it. */}
        <p
          className="max-w-[46ch] pl-3.5"
          style={{
            borderLeft: "2px solid var(--red)",
            fontSize: "12px",
            lineHeight: 1.55,
            color: "var(--ink-2)",
          }}
        >
          {V.caveat}
        </p>
      </div>

      {/* Shown only below the width at which the diagram fits. */}
      <p className="label-mono mt-5 lg:hidden">{t.charts.scrollHint}</p>
      {/* Focusable, so a keyboard user can scroll it with the arrow keys. */}
      <div
        className="mt-2 overflow-x-auto lg:mt-5"
        tabIndex={0}
        role="region"
        aria-label={`${V.title}: ${t.charts.scrollRegion}`}
      >
        <div className="relative min-w-[62rem]">
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden>
            <defs>
              <pattern
                id={HATCH_NO}
                width={6}
                height={6}
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width={6} height={6} fill={STANCE_COLOUR.no} />
                <rect width={3} height={6} fill="var(--hatch-inverse)" />
              </pattern>
            </defs>
            {/* Source: all declared donations, as one bar */}
            <rect x={SOURCE_X} y={TOP} width={SOURCE_W} height={band} fill="var(--ink)" />

            {nodes.map((n) => {
              const colour = PARTIES[n.d.nif!]?.color ?? "var(--grey-500)";
              // Source to party. Both edges of the ribbon are cubics with
              // control points at the horizontal midpoint, which is what keeps
              // the band an even thickness through the turn.
              // The source bar spans the same band the party column is laid
              // out over, so a ribbon leaves it at its party's own y.
              const sy0 = n.y;
              const ribbonIn = [
                `M ${SOURCE_X + SOURCE_W} ${sy0}`,
                `C ${srcMid} ${sy0} ${srcMid} ${n.y} ${PARTY_X} ${n.y}`,
                `L ${PARTY_X} ${n.y + n.h}`,
                `C ${srcMid} ${n.y + n.h} ${srcMid} ${sy0 + n.h} ${SOURCE_X + SOURCE_W} ${sy0 + n.h}`,
                "Z",
              ].join(" ");

              const out = outBy.get(n.stance)!;
              const oy0 = out.cursor;
              out.cursor += n.h;
              const ribbonOut = [
                `M ${PARTY_X + NODE_W} ${n.y}`,
                `C ${mid} ${n.y} ${mid} ${oy0} ${OUT_X} ${oy0}`,
                `L ${OUT_X} ${oy0 + n.h}`,
                `C ${mid} ${oy0 + n.h} ${mid} ${n.y + n.h} ${PARTY_X + NODE_W} ${n.y + n.h}`,
                "Z",
              ].join(" ");

              return (
                <g key={n.d.nif}>
                  <path d={ribbonIn} fill={colour} opacity={0.42} />
                  <path d={ribbonOut} fill={colour} opacity={0.42} />
                  <rect
                    x={PARTY_X}
                    y={n.y}
                    width={NODE_W}
                    height={n.h}
                    fill={colour}
                    {...svgFillEdge(colour)}
                  />
                </g>
              );
            })}

            {outs.map((o) => (
              <rect
                key={o.s}
                x={OUT_X}
                y={o.y}
                width={NODE_W}
                height={o.h}
                fill={o.s === "no" ? `url(#${HATCH_NO})` : STANCE_COLOUR[o.s]}
              />
            ))}
          </svg>

          {/* Labels are HTML over the SVG rather than <text>, so they inherit
              the page's body face and stay selectable and translatable. */}
          <div className="pointer-events-none absolute inset-0">
            <span
              className="label-mono absolute"
              style={{
                left: `${(SOURCE_X / W) * 100}%`,
                top: 0,
                maxWidth: "34%",
              }}
            >
              {V.sourceHead}
            </span>
            <span
              className="mono absolute"
              style={{
                left: `${(SOURCE_X / W) * 100}%`,
                top: `${(20 / H) * 100}%`,
                fontSize: "12.5px",
              }}
            >
              {euroExact(sum, bcp47)}
            </span>

            <span
              className="label-mono absolute"
              style={{
                left: `${(OUT_X / W) * 100}%`,
                top: 0,
                transform: "translateX(-100%)",
                whiteSpace: "nowrap",
              }}
            >
              {V.outcomeHead}
            </span>

            {/* Each label positions against the overlay directly.

                They used to be wrapped in one `absolute` span per node that
                carried only `top`. With no width that wrapper collapsed to
                0×0, so both children resolved their `left` percentages
                against a zero-width box and every label in the column piled
                up at the same point, party name overprinting amount. */}
            {nodes.map((n) => (
              <span key={n.d.nif}>
                <span
                  className="absolute text-right"
                  style={{
                    top: `${(n.y / H) * 100}%`,
                    left: 0,
                    width: `${(463 / W) * 100}%`,
                    fontSize: "12px",
                    lineHeight: 1.1,
                  }}
                >
                  {n.d.label}
                </span>
                <span
                  className="mono absolute whitespace-nowrap"
                  style={{
                    top: `${(n.y / H) * 100}%`,
                    left: `${(492 / W) * 100}%`,
                    fontSize: "11.5px",
                    color: "var(--ink-3)",
                    lineHeight: 1.1,
                  }}
                >
                  {euroExact(n.d.total.amount, bcp47)}
                </span>
              </span>
            ))}

            {outs.map((o) => (
              <span
                key={o.s}
                className="absolute text-right"
                style={{
                  left: `${(892 / W) * 100 - 14}%`,
                  width: "14%",
                  top: `${(o.y / H) * 100}%`,
                  fontSize: "12.5px",
                  lineHeight: 1.1,
                  color: "var(--ink)",
                }}
              >
                {label[o.s]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p
        className="mt-4"
        style={{ fontSize: "12px", lineHeight: 1.55, color: "var(--ink-3)", maxWidth: "88ch" }}
      >
        {V.scope
          .replace("{included}", integer(included.length, bcp47))
          .replace("{report}", DONATIONS_SOURCE.report.split("—")[0].trim())}
        {excluded.length > 0 && (
          <>
            {" "}
            {V.excluded} {excluded.map((d) => d.label).join(" · ")}.
          </>
        )}
      </p>

      <DataTable
        summary={t.charts.showTable}
        caption={V.tableCaption.replace("{total}", euroExact(sum, bcp47))}
        rows={nodes}
        rowKey={(n) => n.d.nif!}
        columns={[
          { header: V.colFormation, cell: (n) => n.d.label },
          { header: V.colDonations, cell: (n) => euroExact(n.d.total.amount, bcp47), numeric: true },
          { header: V.colVote, cell: (n) => label[n.stance] },
        ]}
      />
      <SourceLine sources={sources} label={t.charts.source} />
    </section>
  );
}
