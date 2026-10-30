import type { Metadata } from "next";
import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { getVotes } from "@/lib/votes";
import Line from "@/components/nuevo/Line";
import VoteBar, { VoteLegend } from "@/components/nuevo/VoteBar";
import DeputyBallots from "@/components/nuevo/DeputyBallots";
import { KIND_SHORT, voteDate, voteYear, votesOfTopic, yearSpan } from "@/components/nuevo/topics";

// The deputy search reads the query string.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Temas: cómo votó el Congreso" };

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
  const L = (path: string) => `/${locale}${path}`;

  const topics = data.topics
    .map((t) => ({ ...t, votes: votesOfTopic(data, t.id) }))
    .filter((t) => t.votes.length > 0);
  const all = topics.flatMap((t) => t.votes);

  // The finding: the division with the smallest gap between yes and no.
  const margin = (v: (typeof all)[number]) => Math.abs(v.totals.afavor - v.totals.enContra);
  const closest = [...all].sort((a, b) => margin(a) - margin(b))[0];
  const gap = closest ? margin(closest) : 0;

  return (
    <main>
      <div className="n-shell pb-10 pt-6">
        <h1 className="n-display">Temas</h1>
        <p className="n-body mt-5" style={{ fontSize: "1.15rem" }}>
          Cómo votó el Congreso en los asuntos que sigue esta web: derechos de las personas trans y
          LGTBI, aborto y salud sexual, y vivienda. Cada voto es uno emitido y publicado en el acta
          oficial, no una postura atribuida.
        </p>
      </div>

      <section className="n-shell n-section" aria-labelledby="lineas">
        <h2 id="lineas" className="n-h2">
          Una línea por tema
        </h2>
        {closest && (
          <p className="n-finding mt-4">
            {`De las ${all.length} votaciones que sigue esta web ${yearSpan(all)}, la más ajustada fue «${closest.law}», con ${gap} ${gap === 1 ? "voto" : "votos"} de diferencia entre el sí y el no.`}
          </p>
        )}
        <div className="mt-10 grid gap-x-12 gap-y-14 lg:grid-cols-3">
          {topics.map((t) => {
            const binding = t.votes.filter((v) => v.binding).length;
            return (
              <article key={t.id} className="n-topic">
                <h3 className="n-h3">
                  <Link href={L(`/nuevo/tema/${t.id}`)}>{t.label}</Link>
                </h3>
                <p className="n-meta mt-1">
                  {t.votes.length === 1 ? "1 votación" : `${t.votes.length} votaciones`},{" "}
                  {binding === 0 ? "ninguna" : binding} con efecto legal
                </p>
                <Line
                  cls="n-topic"
                  className="mt-5"
                  stops={t.votes.map((v) => ({
                    key: v.id,
                    label: String(voteYear(v)),
                    note: KIND_SHORT[v.kind] ?? v.kindLabel,
                    on: true,
                  }))}
                />
                <ol className="mt-6 grid gap-5">
                  {t.votes.map((v) => (
                    <li key={v.id}>
                      <Link href={L(`/nuevo/tema/${t.id}#${v.id}`)} className="text-[0.95rem] font-bold">
                        {v.law}
                      </Link>
                      <span className="n-meta">
                        , {voteDate(v, bcp47)}
                        {v.binding ? "" : ", sin efecto legal"}
                      </span>
                      <VoteBar
                        className="mt-2"
                        counts={{ si: v.totals.afavor, no: v.totals.enContra, abst: v.totals.abstenciones }}
                      />
                    </li>
                  ))}
                </ol>
                <p className="mt-5">
                  <Link href={L(`/nuevo/tema/${t.id}`)}>Cómo votó cada grupo</Link>
                </p>
              </article>
            );
          })}
        </div>
        <p className="n-meta mt-10 flex flex-wrap items-center gap-x-5 gap-y-1">
          <VoteLegend />
          <span>
            Una estación por votación, de la más antigua a la más reciente; todas constan en acta, por
            eso la línea es continua. El resultado no dice si la votación salió adelante: una ley
            orgánica necesita la mayoría absoluta del Congreso.
          </span>
        </p>
        <p className="n-source">
          Fuente: <a href={data.source.url}>{data.source.name}</a>. Cada votación enlaza a su acta en
          su tema.
        </p>
      </section>

      <section id="diputado" className="n-shell n-section" aria-labelledby="diputado-t">
        <h2 id="diputado-t" className="n-h2 mb-5">
          Cómo votó un diputado
        </h2>
        <p className="n-body mb-6">
          Busca por apellido o nombre para ver su voto en las {all.length} votaciones, tal como consta
          en cada acta.
        </p>
        <DeputyBallots
          votes={all}
          q={q}
          action={L("/nuevo/temas#diputado")}
          locale={locale}
          columnLabel={(v) => v.law}
        />
      </section>
    </main>
  );
}
