import type { Metadata } from "next";
import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { getVotes } from "@/lib/votes";
import Line from "@/components/nuevo/Line";
import VoteBar, { VoteLegend } from "@/components/nuevo/VoteBar";
import DeputyBallots from "@/components/nuevo/DeputyBallots";
import { KIND_SHORT, topicLabel, voteDate, voteYear, votesOfTopic, yearSpan } from "@/components/nuevo/topics";
import { COPY } from "./copy";

// The deputy search reads the query string.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = getDict((await params).locale);
  return { title: COPY[locale].metaTitle };
}

/**
 * The redesign prototype's index of topics, the nav's "Temas".
 *
 * Every topic the site follows is one line, its divisions the stations in the
 * order they were voted, each with its result as one bar. The page opens with
 * the one finding the divisions show together (the closest margin), and ends
 * with the search a reader most often brings: how did this deputy vote.
 */
export default async function PrototypeTopics({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale: localeParam } = await params;
  const { q } = await searchParams;
  const { locale, bcp47 } = getDict(localeParam);
  const data = await getVotes();
  const t = COPY[locale];
  const L = (path: string) => `/${locale}${path}`;

  const topics = data.topics
    .map((tp) => ({ ...tp, label: topicLabel(tp.id, tp.label, locale), votes: votesOfTopic(data, tp.id) }))
    .filter((tp) => tp.votes.length > 0);
  const all = topics.flatMap((tp) => tp.votes);

  // The finding: the division with the smallest gap between yes and no.
  const margin = (v: (typeof all)[number]) => Math.abs(v.totals.afavor - v.totals.enContra);
  const closest = [...all].sort((a, b) => margin(a) - margin(b))[0];
  const gap = closest ? margin(closest) : 0;

  return (
    <main>
      <div className="n-shell pb-10 pt-6">
        <h1 className="n-display">{t.title}</h1>
        <p className="n-body mt-5" style={{ fontSize: "1.15rem" }}>
          {t.intro}
        </p>
      </div>

      <section className="n-shell n-section" aria-labelledby="lineas">
        <h2 id="lineas" className="n-h2">
          {t.linesTitle}
        </h2>
        {closest && (
          <p className="n-finding mt-4">
            {t.finding(all.length, yearSpan(all, locale), closest.law, gap)}
          </p>
        )}
        <div className="mt-10 grid gap-x-12 gap-y-14 lg:grid-cols-3">
          {topics.map((tp) => {
            const binding = tp.votes.filter((v) => v.binding).length;
            return (
              <article key={tp.id} className="n-topic">
                <h3 className="n-h3">
                  <Link href={L(`/tema/${tp.id}`)}>{tp.label}</Link>
                </h3>
                <p className="n-meta mt-1">
                  {t.topicMeta(tp.votes.length, binding)}
                </p>
                <Line
                  cls="n-topic"
                  className="mt-5"
                  stops={tp.votes.map((v) => ({
                    key: v.id,
                    label: String(voteYear(v)),
                    note: KIND_SHORT[locale][v.kind] ?? v.kindLabel,
                    on: true,
                  }))}
                />
                <ol className="mt-6 grid gap-5">
                  {tp.votes.map((v) => (
                    <li key={v.id}>
                      <Link href={L(`/tema/${tp.id}#${v.id}`)} className="text-[0.95rem] font-bold">
                        {v.law}
                      </Link>
                      <span className="n-meta">
                        , {voteDate(v, bcp47)}
                        {v.binding ? "" : t.noLegalEffect}
                      </span>
                      <VoteBar
                        locale={locale}
                        className="mt-2"
                        counts={{ si: v.totals.afavor, no: v.totals.enContra, abst: v.totals.abstenciones }}
                      />
                    </li>
                  ))}
                </ol>
                <p className="mt-5">
                  <Link href={L(`/tema/${tp.id}`)}>{t.groupsLink}</Link>
                </p>
              </article>
            );
          })}
        </div>
        <p className="n-meta mt-10 flex flex-wrap items-center gap-x-5 gap-y-1">
          <VoteLegend locale={locale} />
          <span>{t.legendNote}</span>
        </p>
        <p className="n-source">
          {t.sourceLabel}
          <a href={data.source.url}>{data.source.name}</a>
          {t.sourceTail}
        </p>
      </section>

      <section id="diputado" className="n-shell n-section" aria-labelledby="diputado-t">
        <h2 id="diputado-t" className="n-h2 mb-5">
          {t.deputyTitle}
        </h2>
        <p className="n-body mb-6">
          {t.deputyIntro(all.length)}
        </p>
        <DeputyBallots
          votes={all}
          q={q}
          action={L("/temas#diputado")}
          locale={locale}
          columnLabel={(v) => v.law}
        />
      </section>
    </main>
  );
}
