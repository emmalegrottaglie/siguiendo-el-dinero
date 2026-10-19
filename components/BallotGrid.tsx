import { STANCE_STRIPE, STANCE_SWATCH } from "@/lib/chart-colors";
import { voteDateISO, type Ballot, type KeyVote } from "@/lib/votes";
import type { RecordedVote } from "@/lib/people";
import { formatDate } from "@/lib/format";
import type { Dict } from "@/lib/i18n";
import { stripeImage } from "./chart/Bar";
import SourceLine, { type ChartSource } from "./chart/SourceLine";
import DataTable from "./chart/DataTable";

/**
 * This person's whole recorded record, at a glance, above the list that gives
 * each ballot its law, date and source.
 *
 * The grid makes one claim per cell: sí, no, abstención, or no ballot recorded
 * here. It deliberately does not separate the two ways a ballot can be missing
 * — a deputy on the roll who did not vote, and a division their name does not
 * appear in at all — because those are different facts and the grid has no room
 * to say which. The list below does say which, on the same screen: a "No vota"
 * ballot appears there with its own tag, and a division the person was not part
 * of has no row. A coarse true statement above a precise one is the site's
 * usual order; a fine distinction drawn in two barely distinguishable greys
 * would not be.
 *
 * Nine divisions are tracked out of the thousands the Congreso holds. This is
 * the record we hold, not the record that exists, and the caption says so.
 */

const FILL: Record<string, string> = {
  Sí: STANCE_SWATCH.si,
  No: STANCE_SWATCH.no,
  Abstención: STANCE_SWATCH.abstention,
};

/**
 * The non-colour cue, the same as in every stance bar: a No cell is hatched.
 * Sí and No are also far apart in lightness, but lightness is still colour, and
 * on a grid of 16px cells a hatch is what a colour-blind reader can rely on.
 */
const HATCH: Record<string, string | undefined> = {
  No: stripeImage(STANCE_STRIPE.no, 4),
};

/**
 * Every cell carries this outline, filled or not, so that a cell's presence and
 * bounds are perceivable at 5.8:1 whatever its fill. Without it an unfilled
 * cell is the page colour and reads as nothing at all.
 */
const OUTLINE = "inset 0 0 0 1px var(--ink-3)";

export default function BallotGrid({
  record,
  votes,
  t,
  source,
  bcp47,
}: {
  record: RecordedVote[];
  /** Every tracked division, so the ones without a ballot show as gaps. */
  votes: KeyVote[];
  t: Dict;
  /** The tracked divisions' open-data source. */
  source: ChartSource;
  bcp47: string;
}) {
  const G = t.ballotGrid;
  const ballots = new Map(record.map((r) => [r.vote.id, r.ballot]));

  // Grouped by topic, oldest first inside each — the same order as the detailed
  // list below, so a cell and its row can be found by counting.
  const byTopic = new Map<string, KeyVote[]>();
  for (const v of [...votes].sort((a, b) => voteDateISO(a).localeCompare(voteDateISO(b)))) {
    byTopic.set(v.topicLabel, [...(byTopic.get(v.topicLabel) ?? []), v]);
  }

  const cast = record.filter((r) => FILL[r.ballot]).length;
  const shown: Ballot[] = (["Sí", "No", "Abstención"] as const).filter((b) =>
    record.some((r) => r.ballot === b),
  );

  const label = (b: Ballot) =>
    b === "Sí" ? t.votes.inFavour : b === "No" ? t.votes.against : t.votes.abstention;

  return (
    <figure className="mt-6">
      <ul className="flex flex-col gap-2" aria-hidden="true">
        {[...byTopic.entries()].map(([topic, list]) => (
          <li key={topic} className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex gap-1">
              {list.map((v) => (
                <span
                  key={v.id}
                  className="block h-4 w-4 rounded-[2px]"
                  style={{
                    background: FILL[ballots.get(v.id) ?? ""] ?? "transparent",
                    backgroundImage: HATCH[ballots.get(v.id) ?? ""],
                    boxShadow: OUTLINE,
                  }}
                />
              ))}
            </span>
            <span className="text-sm text-[var(--ink-2)]">{topic}</span>
          </li>
        ))}
      </ul>

      {/* The legend prints only the stances this person's record contains, plus
          the empty state when there is one, so a reader is not given a key to
          colours that are not on the grid. */}
      <ul className="label-mono mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[var(--ink-3)]">
        {shown.map((b) => (
          <li key={b} className="flex items-center gap-1.5">
            <span
              className="block h-3 w-3 rounded-[2px]"
              style={{ background: FILL[b], backgroundImage: HATCH[b], boxShadow: OUTLINE }}
            />
            {label(b)}
          </li>
        ))}
        {cast < votes.length && (
          <li className="flex items-center gap-1.5">
            <span
              className="block h-3 w-3 rounded-[2px]"
              style={{ boxShadow: OUTLINE }}
            />
            {G.noBallot}
          </li>
        )}
      </ul>

      <figcaption className="mt-3 text-sm leading-relaxed text-[var(--ink-3)]">
        {G.caption.replace("{cast}", String(cast)).replace("{tracked}", String(votes.length))}
      </figcaption>

      {/* The grid is aria-hidden, so its cells are listed here in the same
          order: by topic, oldest first. */}
      <DataTable
        summary={t.charts.showTable}
        caption={G.tableCaption}
        rows={[...byTopic.values()].flat()}
        rowKey={(v) => v.id}
        columns={[
          { header: G.colVote, cell: (v) => v.law },
          { header: G.colTopic, cell: (v) => v.topicLabel },
          { header: G.colDate, cell: (v) => formatDate(voteDateISO(v), bcp47) },
          {
            header: G.colBallot,
            cell: (v) => {
              const b = ballots.get(v.id);
              // More precise than the grid: a "No vota" on the roll is named.
              return b && FILL[b] ? label(b) : b ? t.votes.noVote : G.noBallot;
            },
          },
        ]}
      />
      <SourceLine sources={[source]} label={t.charts.source} />
    </figure>
  );
}
