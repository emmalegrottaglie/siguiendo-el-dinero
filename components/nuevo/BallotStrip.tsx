import { voteDateISO, type KeyVote } from "@/lib/votes";
import type { RecordedVote } from "@/lib/people";
import { formatDate } from "@/lib/format";
import type { Dict } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";
import { topicLabel } from "./topics";

/**
 * One person's whole recorded record at a glance: one cell per division the
 * site tracks, one row per topic, oldest first inside each.
 *
 * A cell makes one claim: in favour (filled in the topic colour), against
 * (hatched), abstention (filled grey), on the roll but no ballot cast (hollow,
 * solid outline), or not on the record of that division at all (hollow,
 * dashed outline: not on record). Never colour or dash alone: the legend
 * names every mark shown, and the table under the grid says each cell in
 * words, with the division, its date and its official record.
 *
 * A division the person was not part of is a gap, never their group's
 * position. And the tracked divisions are a handful of the thousands the
 * Congreso holds: this is the record the site holds, not the record that
 * exists, and the caption says so.
 */
type Mark = "si" | "no" | "abst" | "noVote" | "none";

const MARK_OF: Record<string, Mark> = { Sí: "si", No: "no", Abstención: "abst" };

export default function BallotStrip({
  record,
  votes,
  t,
  locale,
  bcp47,
}: {
  record: RecordedVote[];
  /** Every tracked division, so the ones without a ballot show as gaps. */
  votes: KeyVote[];
  t: Dict;
  locale: Locale;
  bcp47: string;
}) {
  const G = t.ballotGrid;
  const ballots = new Map(record.map((r) => [r.vote.id, r.ballot]));
  const markOf = (v: KeyVote): Mark => {
    const b = ballots.get(v.id);
    return b === undefined ? "none" : (MARK_OF[b] ?? "noVote");
  };
  const words: Record<Mark, string> = {
    si: t.votes.inFavour,
    no: t.votes.against,
    abst: t.votes.abstention,
    noVote: t.votes.noVote,
    none: G.noBallot,
  };

  const byTopic = new Map<string, KeyVote[]>();
  for (const v of [...votes].sort((a, b) => voteDateISO(a).localeCompare(voteDateISO(b)))) {
    byTopic.set(v.topic, [...(byTopic.get(v.topic) ?? []), v]);
  }
  const topics = [...byTopic.entries()];
  const flat = topics.flatMap(([, list]) => list);
  const cast = record.filter((r) => MARK_OF[r.ballot]).length;
  const shown = (["si", "no", "abst", "noVote", "none"] as const).filter((m) => flat.some((v) => markOf(v) === m));
  const caption = G.caption.replace("{cast}", String(cast)).replace("{tracked}", String(votes.length));

  return (
    <figure className="n-topic mt-8">
      <ul aria-hidden className="flex flex-col gap-2">
        {topics.map(([topic, list]) => (
          <li key={topic} className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex flex-wrap gap-1">
              {list.map((v) => (
                <Cell key={v.id} mark={markOf(v)} />
              ))}
            </span>
            <span className="text-[0.9375rem] text-[var(--n-ink-2)]">
              {topicLabel(topic, list[0].topicLabel, locale)}
            </span>
          </li>
        ))}
      </ul>

      <ul className="n-meta mt-4 flex flex-wrap gap-x-5 gap-y-1">
        {shown.map((m) => (
          <li key={m} className="flex items-center gap-1.5">
            <Cell mark={m} small />
            {words[m]}
          </li>
        ))}
      </ul>

      <figcaption className="n-meta mt-3 max-w-[var(--n-w-read)]">{caption}</figcaption>

      <details className="mt-4">
        <summary className="cursor-pointer text-[0.9375rem] font-bold">{t.charts.showTable}</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="n-table">
            <caption className="sr-only">{G.tableCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{G.colVote}</th>
                <th scope="col">{G.colTopic}</th>
                <th scope="col">{G.colDate}</th>
                <th scope="col">{G.colBallot}</th>
              </tr>
            </thead>
            <tbody>
              {flat.map((v) => {
                const m = markOf(v);
                return (
                  <tr key={v.id}>
                    <th scope="row" className="font-normal">
                      <a href={v.sourceUrl}>{v.law}</a>
                    </th>
                    <td>{topicLabel(v.topic, v.topicLabel, locale)}</td>
                    <td className="n-num whitespace-nowrap">{formatDate(voteDateISO(v), bcp47)}</td>
                    <td className={m === "none" ? "text-[var(--n-ink-3)]" : "font-bold"}>{words[m]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

function Cell({ mark, small = false }: { mark: Mark; small?: boolean }) {
  const size = small ? "h-3 w-3" : "h-[18px] w-[18px]";
  const style =
    mark === "si"
      ? { background: "var(--route)" }
      : mark === "no"
        ? { outline: "1px solid var(--n-ink-3)", outlineOffset: -1 }
        : mark === "abst"
          ? { background: "var(--n-rule-strong)" }
          : mark === "noVote"
            ? { border: "1.5px solid var(--n-ink-3)" }
            : { border: "1.5px dashed var(--n-ink-3)" };
  return <span aria-hidden className={`block shrink-0 rounded-[2px] ${size} ${mark === "no" ? "n-hatch" : ""}`} style={style} />;
}
