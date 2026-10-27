"use client";

import Link from "next/link";
import type { PartyTotals } from "@/lib/types";
import type { Dict, Locale } from "@/lib/i18n";
import { squarify } from "@/lib/treemap";
import { euroCompact, euroExact, fill, percent } from "@/lib/format";
import { fillEdge } from "@/lib/chart-colors";
import { readerProps, say } from "@/lib/chart-reader";
import { exportLabels, exportMeta, type ChartExport } from "@/lib/chart-export";
import ChartReader from "./chart/ChartReader";
import ExportButton from "./chart/ExportButton";
import Finding from "./chart/Finding";
import SourceLine, { type ChartSource } from "./chart/SourceLine";

/**
 * Every euro of state subsidy in the current selection, as one shape.
 *
 * The ranked bars below answer "how does each party compare"; this answers the
 * question a reader asks first, "how is the whole divided", the way a newspaper
 * explainer draws it (Al Jazeera's "Tracking the money", 27 Oct 2026, did it
 * with donors). Area is a less exact encoding than length, so the treemap
 * never stands alone: it sits above the bars and their table, which carry the
 * exact figures, and the finding above it is computed from the same rows.
 *
 * Grouped by party only. The newspaper version grouped donors into political
 * camps; this site does not assign parties to blocs in a chart, because that
 * is a classification of stance and not a figure from the source.
 */

/** Below this share of the selection a party joins the "rest" cell. */
const REST_BELOW = 0.02;
/** The layout's box: two units wide for one tall. */
const W = 200;
const H = 100;

type Cell =
  | { kind: "party"; party: PartyTotals; value: number; share: number }
  | { kind: "rest"; parties: PartyTotals[]; value: number; share: number };

export default function SubsidyTreemap({
  parties,
  grandTotal,
  m,
  charts,
  source,
  selection,
  bcp47,
  locale,
}: {
  /** Largest first, as the aggregation returns them. */
  parties: PartyTotals[];
  grandTotal: number;
  m: Dict["money"];
  charts: Dict["charts"];
  source: ChartSource;
  /** The current filters, as printed in the exported image's caption. */
  selection: string;
  bcp47: string;
  locale: Locale;
}) {
  if (parties.length < 2 || grandTotal <= 0) return null;

  const big = parties.filter((p) => p.total / grandTotal >= REST_BELOW);
  const small = parties.filter((p) => p.total / grandTotal < REST_BELOW);
  const cells: Cell[] = big.map((p) => ({
    kind: "party",
    party: p,
    value: p.total,
    share: p.total / grandTotal,
  }));
  if (small.length) {
    const value = small.reduce((s, p) => s + p.total, 0);
    cells.push({ kind: "rest", parties: small, value, share: value / grandTotal });
  }
  const layout = squarify(cells, (c) => c.value, W, H);

  // The finding names the largest three and states their share: arithmetic on
  // the rows, nothing more. With three parties or fewer in the selection it
  // would only restate the whole, so the chart's own title stands alone.
  const lead = parties.slice(0, 3);
  const leadShare = lead.reduce((s, p) => s + p.total, 0) / grandTotal;
  const names = new Intl.ListFormat(bcp47, { type: "conjunction" }).format(
    lead.map((p) => p.shortName),
  );
  const finding =
    parties.length > 3
      ? fill(m.treemapFinding, { names, share: percent(leadShare, bcp47, 0) })
      : null;

  const restName = (c: Extract<Cell, { kind: "rest" }>) =>
    fill(m.treemapRest, { n: String(c.parties.length) });
  const items = layout.map(({ item: c }) =>
    c.kind === "party"
      ? say(c.party.shortName, euroExact(c.value, bcp47), fill(charts.ofTotal, { share: percent(c.share, bcp47) }))
      : say(
          restName(c),
          euroExact(c.value, bcp47),
          fill(charts.ofTotal, { share: percent(c.share, bcp47) }),
          c.parties.map((p) => p.shortName).join(", "),
        ),
  );

  const image: ChartExport = {
    ...exportMeta(charts, bcp47, {
      title: finding ?? m.treemapTitle,
      caption: `${selection}. ${m.treemapNote}`,
      sources: [source],
      file: "subvenciones-de-un-vistazo",
    }),
    body: {
      kind: "shapes",
      width: W,
      height: H,
      shapes: layout.map(({ item: c, x, y, w, h }) => ({
        d: `M${x} ${y}h${w}v${h}h${-w}Z`,
        fill: c.kind === "party" ? c.party.color : "var(--grey-500)",
        stroke: "var(--bg)",
        strokeWidth: 0.6,
      })),
      labels: [],
      // The figures go beside the drawing rather than on it: a label set on
      // a party's own colour cannot be guaranteed 4.5:1 against all of them.
      aside: {
        rows: layout.slice(0, 8).map(({ item: c }) => ({
          label: c.kind === "party" ? c.party.shortName : restName(c),
          value: `${euroCompact(c.value, bcp47)} · ${percent(c.share, bcp47)}`,
          color: c.kind === "party" ? c.party.color : "var(--grey-500)",
        })),
      },
    },
  };

  return (
    <section className="mx-auto max-w-6xl pt-14">
      <h2 className="display section-tick text-2xl">{m.treemapTitle}</h2>
      {finding && <Finding className="mt-5">{finding}</Finding>}

      <ChartReader
        className="mt-6"
        items={items}
        {...readerProps(charts, bcp47, { title: m.treemapTitle, count: items.length })}
      >
        <div
          className="relative w-full aspect-square sm:aspect-[2/1]"
          style={{ background: "var(--bg)" }}
        >
          {layout.map(({ item: c, x, y, w, h }, i) => {
            const color = c.kind === "party" ? c.party.color : "var(--grey-500)";
            const style = {
              left: `${(x / W) * 100}%`,
              top: `${(y / H) * 100}%`,
              // A 2px gap of page ground between cells, so two neighbours in
              // similar colours still read as two.
              width: `calc(${(w / W) * 100}% - 2px)`,
              height: `calc(${(h / H) * 100}% - 2px)`,
              background: color,
              ...fillEdge(color),
            };
            const label = (
              // The label sits on a chip of page ground, not on the party's
              // colour, so its contrast does not depend on which party it is.
              // Each cell is a size container: the name shows once the cell is
              // wide enough to hold it and the figure once it can hold that,
              // sized to the cell, so a phone gets fewer labels rather than
              // labels cut short. The rest are in the reader and the table.
              <span
                className={`absolute left-1.5 top-1.5 hidden max-w-[calc(100%-12px)] overflow-hidden rounded-sm px-1.5 py-1 ${
                  // "Otros 20" is longer than any party's short name.
                  c.kind === "party" ? "@min-[64px]:block" : "@min-[96px]:block"
                }`}
                style={{ background: "var(--card)", color: "var(--ink)" }}
              >
                <span className="label-mono block break-words">
                  {c.kind === "party" ? c.party.shortName : restName(c)}
                </span>
                <span
                  className="mono hidden break-words @min-[88px]:block"
                  style={{ fontSize: "clamp(12px, 11cqi, 30px)" }}
                >
                  {euroCompact(c.value, bcp47)}
                </span>
              </span>
            );
            return c.kind === "party" ? (
              <Link
                key={c.party.nif}
                href={`/${locale}/party/${c.party.nif}`}
                data-chart-item={i}
                aria-label={items[i]}
                className="@container absolute block overflow-hidden"
                style={style}
              >
                {label}
              </Link>
            ) : (
              <div
                key="rest"
                role="img"
                data-chart-item={i}
                aria-label={items[i]}
                className="@container absolute overflow-hidden"
                style={style}
              >
                {label}
              </div>
            );
          })}
        </div>
      </ChartReader>

      <p className="mt-3" style={{ fontSize: "12px", lineHeight: 1.55, color: "var(--ink-3)", maxWidth: "88ch" }}>
        {m.treemapNote}
      </p>
      <SourceLine sources={[source]} label={charts.source} />
      <ExportButton className="mt-3" spec={image} {...exportLabels(charts, m.treemapTitle)} />
    </section>
  );
}
