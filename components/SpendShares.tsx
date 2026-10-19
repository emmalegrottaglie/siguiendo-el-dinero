import { euroExact, euroM, percent } from "@/lib/format";
import Bar from "./chart/Bar";
import SourceLine, { type ChartSource } from "./chart/SourceLine";

export interface ShareRow {
  name: string;
  value: number;
  color: string;
}

/**
 * Declared electoral spending by formation, one labelled row per formation.
 *
 * This was a donut with a legend beside it. A slice could only be matched to
 * its formation by colour, and the legend truncated names to one line, which at
 * phone width cut the longest ("AHORA REPÚBLICAS (ERC-EH BILDU-BNG-ARA MÉS)",
 * "COALICIÓN POR UNA EUROPA SOLIDARIA") short — so for a colour-blind
 * reader, or anyone reading the longest names, the ring identified nothing.
 * Here every bar has its formation's full name above it, wrapping rather than
 * truncating, with the exact figure and its share beside it — the colour is a
 * second cue, not the only one. It also brings the chart onto `Bar`, the one
 * bar primitive the rest of the site uses.
 *
 * `scale="share"` against the declared total: each bar is that formation's
 * part of the whole, which is what the ring showed, and the note says so.
 *
 * Server component, no interaction. The rows are text, so nothing here needs
 * a second, hidden-from-sight version for a screen reader.
 */
export default function SpendShares({
  rows,
  total,
  totalLabel,
  caption,
  scaleNote,
  source,
  sourceLabel,
  bcp47,
}: {
  rows: ShareRow[];
  total: number;
  totalLabel: string;
  caption: string;
  scaleNote: string;
  source: ChartSource;
  sourceLabel: string;
  bcp47: string;
}) {
  return (
    <figure className="max-w-3xl">
      <p className="label-mono">{totalLabel}</p>
      <p className="figure mt-1 text-[32px]">{euroM(total, bcp47)}</p>

      <ul className="mt-5 flex flex-col gap-3.5">
        {rows.map((r) => (
          <li key={r.name}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5">
              {/* Wraps instead of truncating: the coalition labels are the
                  report's own, and a cut one names nobody. */}
              <span className="min-w-0 flex-1 break-words" style={{ fontSize: "13.5px" }}>
                {r.name}
              </span>
              <span className="mono whitespace-nowrap" style={{ fontSize: "12.5px" }}>
                {euroExact(r.value, bcp47)} ·{" "}
                <span style={{ color: "var(--ink-3)" }}>
                  {percent(total > 0 ? r.value / total : 0, bcp47)}
                </span>
              </span>
            </div>
            <Bar
              className="mt-1"
              segments={[{ value: r.value, color: r.color, label: r.name }]}
              total={total}
              scale="share"
              size="sm"
            />
          </li>
        ))}
      </ul>

      <figcaption
        className="mt-4"
        style={{ fontSize: "12px", lineHeight: 1.55, color: "var(--ink-3)", maxWidth: "88ch" }}
      >
        {caption} {scaleNote}
      </figcaption>
      <SourceLine sources={[source]} label={sourceLabel} />
    </figure>
  );
}
