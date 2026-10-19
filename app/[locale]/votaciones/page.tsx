import Link from "next/link";
import { getVotes, nameKey, newestFirst, type Ballot } from "@/lib/votes";
import GroupBreakdown from "@/components/GroupBreakdown";
import VoteFlow from "@/components/VoteFlow";
import { getDict } from "@/lib/i18n";
import { integer } from "@/lib/format";
import { stanceSegments } from "@/lib/chart-colors";
import { donationsSource, voteRecordSource } from "@/lib/chart-sources";
import Bar from "@/components/chart/Bar";
import ChartReader from "@/components/chart/ChartReader";
import { readerProps, say } from "@/lib/chart-reader";

// The deputy search reads the query string.
export const dynamic = "force-dynamic";

const BALLOT_COLOR: Record<string, string> = {
  Sí: "var(--verd-text)",
  No: "var(--stance-no)",
  Abstención: "var(--ink-3)",
};

type Dict = ReturnType<typeof getDict>["t"];

function ballotLabel(b: Ballot, t: Dict): string {
  if (b === "Sí") return t.votes.inFavour;
  if (b === "No") return t.votes.against;
  if (b === "Abstención") return t.votes.abstention;
  return t.votes.noVote;
}

export default async function VotacionesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale: localeParam } = await params;
  const { q } = await searchParams;
  const { locale, bcp47, t } = getDict(localeParam);
  const v = t.votes;

  const data = await getVotes();

  // Deputy lookup: one row per person, showing their ballot on each tracked item.
  // The parliamentary group is stored per ballot, not per person: deputies change
  // group between legislatures, so a single group label would misattribute their
  // affiliation on the other legislature's votes.
  type Cast = { ballot: Ballot; group: string };
  let found: { name: string; ballots: Record<string, Cast> }[] = [];
  if (q?.trim()) {
    const needle = nameKey(q).split(" ").filter(Boolean);
    const people = new Map<string, { name: string; ballots: Record<string, Cast> }>();
    for (const vote of data.votes) {
      for (const dv of vote.votes) {
        const key = nameKey(dv.deputy);
        if (!needle.every((n) => key.includes(n))) continue;
        const rec = people.get(key) ?? { name: dv.deputy, ballots: {} };
        rec.ballots[vote.id] = { ballot: dv.vote, group: dv.group };
        people.set(key, rec);
      }
    }
    found = [...people.values()].sort((a, b) => a.name.localeCompare(b.name, "es")).slice(0, 40);
  }

  return (
    <main className="pb-8">
      <header className="pb-7 pt-8">
        <p className="eyebrow">{v.eyebrow}</p>
        <h1
          className="display mt-3 font-normal"
          style={{ fontSize: "clamp(32px,4.6vw,54px)", maxWidth: "22ch" }}
        >
          {v.title}
        </h1>
        <p
          className="mt-5"
          style={{ fontSize: "15px", lineHeight: 1.68, color: "var(--ink-2)", maxWidth: "70ch" }}
        >
          {v.intro}
        </p>
      </header>

      {/* Deputy search */}
      <form action={`/${locale}/votaciones`} method="get" className="panel mt-8 flex flex-wrap gap-3 p-4">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder={v.searchPlaceholder}
          aria-label={v.searchLabel}
          className="mono min-h-11 min-w-0 flex-1 rounded border border-[var(--line)] bg-[var(--track)] px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--gold)]"
        />
        <button
          type="submit"
          className="label-mono inline-flex min-h-11 items-center rounded border border-[var(--gold)] bg-[var(--gold)] px-4 text-[var(--on-gold)]"
        >
          {v.searchLabel}
        </button>
      </form>

      {q?.trim() && (
        <section className="mt-6">
          {found.length === 0 ? (
            <p className="label-mono py-4 text-[var(--ink-3)]">{v.noMatch}</p>
          ) : (
            <>
              <p className="label-mono mb-3 text-[var(--ink-3)]">
                {integer(found.length, bcp47)} {v.results}
              </p>
              <div className="flex flex-col">
                {found.map((p) => (
                  <div key={p.name}>
                    <div className="py-4">
                      <p className="text-[var(--ink)]">{p.name}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {data.votes.map((vote) => {
                          const cast = p.ballots[vote.id];
                          if (!cast) return null;
                          const color = BALLOT_COLOR[cast.ballot] ?? "var(--ink-3)";
                          return (
                            <span
                              key={vote.id}
                              className="label-mono rounded border px-2 py-1"
                              style={{ color, borderColor: `color-mix(in srgb, ${color} 33%, transparent)` }}
                              title={vote.law}
                            >
                              {vote.law}: {ballotLabel(cast.ballot, t)}
                              <span className="ml-1.5 text-[var(--ink-3)]">({cast.group})</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <hr className="hairline" />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* The money and the vote, side by side. Uses the most recent tracked
          division: it is the one whose group stances the site has most
          confidence in, and a flow of every nine would be nine charts. */}
      {data.votes.length > 0 && (
        <VoteFlow
          vote={newestFirst(data.votes)[0]}
          t={t}
          sources={[
            donationsSource(t.charts, bcp47),
            voteRecordSource(data, newestFirst(data.votes)[0], t.charts, bcp47),
          ]}
          bcp47={bcp47}
        />
      )}

      {/* One block per tracked law */}
      {data.votes.map((vote) => {
        const tot = vote.totals;
        const width = (n: number) => `${(n / Math.max(1, tot.presentes)) * 100}%`;
        return (
          <section key={vote.id} className="mt-14">
            <p className="eyebrow">{vote.topicLabel}</p>
            <h2 className="display section-tick mt-2 text-2xl">{vote.law}</h2>

            <p className="label-mono mt-5 flex flex-wrap items-center gap-2">
              <span
                className="rounded border px-2 py-1"
                style={{
                  color: vote.binding ? "var(--gold-deep)" : "var(--ink-3)",
                  borderColor: vote.binding ? "var(--gold)" : "var(--line)",
                }}
              >
                {v.kinds[vote.kind as keyof typeof v.kinds] ?? vote.kindLabel}
              </span>
              {!vote.binding && (
                <span className="text-[var(--ink-3)]">· {v.nonBinding}</span>
              )}
              <span className="text-[var(--ink-3)]">
                · {v.legislature} {vote.legislature}
              </span>
            </p>

            <p className="label-mono mt-6 flex flex-wrap gap-4">
              {vote.lawUrl && (
                <a className="src" href={vote.lawUrl} target="_blank" rel="noopener noreferrer">
                  {v.lawText}
                </a>
              )}
              <a className="src" href={vote.sourceUrl} target="_blank" rel="noopener noreferrer">
                {v.officialRecord}
              </a>
              <span className="text-[var(--ink-3)]">
                {v.session} {vote.session} · {vote.date}
              </span>
            </p>

            {/* Overall result */}
            <ChartReader
              className="mt-6"
              items={[
                [v.inFavour, tot.afavor],
                [v.against, tot.enContra],
                [v.abstention, tot.abstenciones],
                [v.present, tot.presentes],
              ].map(([l, n]) => say(vote.law, String(l), integer(Number(n), bcp47)))}
              {...readerProps(t.charts, bcp47, { title: vote.law, count: 4 })}
            >
              <Bar
                segments={stanceSegments(
                  { si: tot.afavor, no: tot.enContra, abstention: tot.abstenciones },
                  { si: v.inFavour, no: v.against, abstention: v.abstention },
                )}
                total={Math.max(1, tot.presentes)}
                scale="share"
                size="lg"
              />
              <div className="label-mono mt-3 flex flex-wrap gap-x-6 gap-y-1">
                <span data-chart-item={0} style={{ color: "var(--verd-text)" }}>
                  {v.inFavour} {integer(tot.afavor, bcp47)}
                </span>
                <span data-chart-item={1} style={{ color: "var(--stance-no)" }}>
                  {v.against} {integer(tot.enContra, bcp47)}
                </span>
                <span data-chart-item={2} className="text-[var(--ink-3)]">
                  {v.abstention} {integer(tot.abstenciones, bcp47)}
                </span>
                <span data-chart-item={3} className="text-[var(--ink-3)]">
                  {v.present} {integer(tot.presentes, bcp47)}
                </span>
              </div>
            </ChartReader>

            {/* Per-group breakdown */}
            <h3 className="label-mono mt-8">{v.byGroup}</h3>
            <GroupBreakdown vote={vote} t={t} locale={locale} />
          </section>
        );
      })}

      <p className="label-mono mt-12 text-[var(--ink-3)]">{v.caveat}</p>
      <p className="label-mono mt-2 text-[var(--ink-3)]">
        {data.source.name} ·{" "}
        <a className="src" href={data.source.url} target="_blank" rel="noopener noreferrer">
          congreso.es
        </a>
      </p>
      <p className="label-mono mt-6">
        <Link href={`/${locale}`} className="hover:text-[var(--gold-deep)]">
          {t.common.backToPanel}
        </Link>
      </p>
    </main>
  );
}
