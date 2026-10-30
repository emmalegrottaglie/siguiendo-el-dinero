/**
 * One division's result as a single bar: votes in favour in the route's
 * colour, votes against hatched, abstentions in the strong rule grey.
 *
 * The bar is drawn for the eye only (aria-hidden); the counts under it are
 * the record, in words, so no ballot is told apart by colour or pattern
 * alone. Shares are of the ballots cast (in favour, against, abstention):
 * deputies who did not vote are counted in the text but not drawn, as they
 * cast no ballot to divide.
 *
 * The bar says nothing about whether the motion passed. Organic laws need an
 * absolute majority of the chamber, and the data has no outcome field, so a
 * bar that looked like a verdict would be one the record does not give.
 *
 * Takes its colour from the `n-*` route class on an ancestor or on
 * `className` (normally `n-topic`).
 */
export interface VoteCounts {
  si: number;
  no: number;
  abst: number;
  /** Deputies on the roll who cast no ballot. Shown in words only. */
  noVota?: number;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "191 a favor, 60 en contra, 91 abstenciones", with singulars where they apply. */
export function voteCountsText({ si, no, abst, noVota }: VoteCounts): string {
  const parts = [`${si} a favor`, `${no} en contra`, plural(abst, "abstención", "abstenciones")];
  if (noVota) parts.push(`${noVota} no ${noVota === 1 ? "votó" : "votaron"}`);
  return parts.join(", ");
}

export default function VoteBar({
  counts,
  size = "md",
  showCounts = true,
  className = "",
}: {
  counts: VoteCounts;
  /** "md" for a division's overall result, "sm" for one group's. */
  size?: "sm" | "md";
  showCounts?: boolean;
  className?: string;
}) {
  const { si, no, abst } = counts;
  const total = si + no + abst;
  const h = size === "sm" ? "h-2.5" : "h-4";
  const seg = (n: number) => ({ flexGrow: n / Math.max(1, total), flexBasis: 0 });

  return (
    <div className={className}>
      <div
        aria-hidden
        className={`flex ${h} w-full gap-[2px] overflow-hidden rounded-[2px]`}
        style={total === 0 ? { background: "var(--n-rule)" } : undefined}
      >
        {si > 0 && <span style={{ ...seg(si), background: "var(--route)" }} />}
        {no > 0 && (
          <span
            className="n-hatch"
            style={{ ...seg(no), outline: "1px solid var(--n-ink-3)", outlineOffset: -1 }}
          />
        )}
        {abst > 0 && <span style={{ ...seg(abst), background: "var(--n-rule-strong)" }} />}
      </div>
      {showCounts && <p className="n-meta n-num mt-1.5">{voteCountsText(counts)}</p>}
    </div>
  );
}

/** The key to the bar, in words beside each swatch. */
export function VoteLegend({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-5 gap-y-1 ${className}`}>
      <span className="n-topic inline-flex items-center gap-2">
        <span aria-hidden className="inline-block h-3 w-5 rounded-[2px]" style={{ background: "var(--route)" }} />A favor
      </span>
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden
          className="n-hatch inline-block h-3 w-5 rounded-[2px]"
          style={{ outline: "1px solid var(--n-ink-3)", outlineOffset: -1 }}
        />
        En contra
      </span>
      <span className="inline-flex items-center gap-2">
        <span aria-hidden className="inline-block h-3 w-5 rounded-[2px]" style={{ background: "var(--n-rule-strong)" }} />
        Abstención
      </span>
    </span>
  );
}
