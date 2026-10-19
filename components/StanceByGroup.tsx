import type { KeyVote } from "@/lib/votes";
import { tallyByGroup } from "@/lib/votes";
import { groupLabel } from "@/lib/groups";
import { stanceSegments } from "@/lib/chart-colors";
import { integer } from "@/lib/format";
import Bar, { BarLegend } from "./chart/Bar";
import SourceLine, { type ChartSource } from "./chart/SourceLine";
import ChartReader from "./chart/ChartReader";
import { readerProps, say } from "@/lib/chart-reader";
import type { Dict } from "@/lib/i18n";

/**
 * Which parliamentary groups backed, opposed or abstained on one vote.
 *
 * A group's position is the majority of its own named ballots — counted, not
 * assigned — so a group appears under "against" only because most of its
 * deputies are recorded voting No. Individual deputies who broke with their
 * group are visible on their own profile, which is the authoritative view.
 */
export default function StanceByGroup({
  vote,
  t,
  source,
  bcp47,
}: {
  vote: KeyVote;
  t: Dict;
  /** The division's own record, shown inside the card. */
  source: ChartSource;
  bcp47: string;
}) {
  const groups = tallyByGroup(vote);

  // Readable names, not the Congreso's group codes: "GCUP-EC-GC" tells a reader
  // nothing. groupLabel falls back to the raw code for anything unregistered.
  const bucket = { si: [] as string[], no: [] as string[], abst: [] as string[] };
  for (const g of groups) {
    const max = Math.max(g.si, g.no, g.abst);
    if (max === 0) continue;
    const label = groupLabel(vote.legislature, g.group);
    if (g.si === max) bucket.si.push(label);
    else if (g.no === max) bucket.no.push(label);
    else bucket.abst.push(label);
  }

  const tot = vote.totals;
  // The bar is aria-hidden; the legend under it prints each count, so the
  // figures are in text for every reader and not only in the bar's lengths.
  const segments = stanceSegments(
    { si: tot.afavor, no: tot.enContra, abstention: tot.abstenciones },
    { si: t.votes.inFavour, no: t.votes.against, abstention: t.votes.abstention },
  );

  const row = (label: string, names: string[], color: string) =>
    names.length > 0 && (
      <p className="label-mono flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span style={{ color }}>{label}</span>
        <span className="text-[var(--ink-2)]">{names.join(" · ")}</span>
      </p>
    );

  return (
    <div className="panel p-5">
      <p className="eyebrow">{vote.topicLabel}</p>
      <p className="mt-2 text-[var(--ink)]">{vote.law}</p>

      {(vote.expediente || vote.title) && (
        <p className="label-mono mt-2 line-clamp-2 text-[var(--ink-2)]">
          {vote.expediente || vote.title}
        </p>
      )}

      <p className="label-mono mt-2 flex flex-wrap gap-x-3 text-[var(--ink-3)]">
        <span>{t.votes.kinds[vote.kind as keyof typeof t.votes.kinds] ?? vote.kindLabel}</span>
        {!vote.binding && <span>· {t.votes.nonBinding}</span>}
        <span>· {vote.date}</span>
      </p>

      <ChartReader
        className="mt-4"
        items={segments.map((seg) => say(vote.law, seg.label, integer(seg.value, bcp47)))}
        {...readerProps(t.charts, bcp47, { title: vote.law, count: segments.length })}
      >
        <Bar segments={segments} total={Math.max(1, tot.presentes)} scale="share" size="sm" />
        <BarLegend
          className="mt-2"
          segments={segments}
          formatValue={(seg) => integer(seg.value, bcp47)}
          readable
        />
      </ChartReader>

      <div className="mt-3 flex flex-col gap-1">
        {row(t.portal.inFavourGroups, bucket.si, "var(--verd-text)")}
        {row(t.portal.againstGroups, bucket.no, "var(--stance-no)")}
        {row(t.portal.abstainGroups, bucket.abst, "var(--ink-3)")}
      </div>

      <SourceLine sources={[source]} label={t.charts.source} />
    </div>
  );
}
