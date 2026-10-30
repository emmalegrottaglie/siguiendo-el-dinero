import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getVotes, tallyByGroup, type GroupTally, type KeyVote } from "@/lib/votes";
import { groupInfo } from "@/lib/groups";
import Line from "@/components/nuevo/Line";
import VoteBar, { VoteLegend } from "@/components/nuevo/VoteBar";
import DeputyBallots from "@/components/nuevo/DeputyBallots";
import {
  KIND_PLAIN,
  KIND_SHORT,
  voteDate,
  votesOfTopic,
  whatWasVoted,
  yearSpan,
} from "@/components/nuevo/topics";

// The deputy search reads the query string.
export const dynamic = "force-dynamic";

/** Other pages of the current site that cover the same topic. */
const RELATED: Record<string, { href: string; text: string }[]> = {
  lgtbi: [{ href: "/derechos", text: "Lo que publican las organizaciones LGTBI" }],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const topic = (await getVotes()).topics.find((t) => t.id === id);
  return { title: topic ? `${topic.label}: cómo votó el Congreso` : "Tema" };
}

/**
 * The redesign prototype's topic hub.
 *
 * A topic is a line too: its divisions are stations in the order they were
 * voted. Each division then gets its own section: what was voted, in the
 * record's own words and in plain ones; the result as one bar; and how each
 * parliamentary group voted, a bar each.
 *
 * What it deliberately leaves out: whether a division passed (organic laws
 * need an absolute majority and the data has no outcome field), any stance
 * not cast as a ballot, and any tally that joins votes to money. A group links
 * to its party's page only where one party makes up the group, and the page
 * says that the two records sitting together explain nothing about each other.
 */
export default async function PrototypeTopic({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const { q } = await searchParams;
  const { locale, bcp47 } = getDict(localeParam);
  const data = await getVotes();
  const topic = data.topics.find((t) => t.id === id);
  if (!topic) notFound();
  const votes = votesOfTopic(data, id);
  if (!votes.length) notFound();
  const L = (path: string) => `/${locale}${path}`;

  const others = data.topics.filter((t) => t.id !== id && data.votes.some((v) => v.topic === t.id));
  const lowerLabel = topic.label[0].toLowerCase() + topic.label.slice(1);

  // The line's finding: how many divisions, over which years, and how many bind.
  const binding = votes.filter((v) => v.binding).length;
  const bindingText =
    binding === 0
      ? "ninguna tiene efecto legal"
      : binding === votes.length && votes.length > 1
        ? "todas tienen efecto legal"
        : `${binding} de ellas ${binding === 1 ? "tiene" : "tienen"} efecto legal`;
  const lineFinding =
    votes.length === 1
      ? `Esta web sigue 1 votación sobre ${lowerLabel}, ${yearSpan(votes)}, y ${votes[0].binding ? "tiene" : "no tiene"} efecto legal.`
      : `Esta web sigue ${votes.length} votaciones sobre ${lowerLabel} ${yearSpan(votes)}, y ${bindingText}.`;

  return (
    <main>
      <div className="n-shell pb-10 pt-6">
        <p className="n-meta">
          <Link href={L("/nuevo/temas")}>Temas</Link>
        </p>
        <h1 className="n-display mt-3" style={{ maxWidth: "22ch" }}>
          {topic.label}
        </h1>
        <p className="n-body mt-5" style={{ fontSize: "1.15rem" }}>
          Cómo votó el Congreso en las votaciones nominales sobre este tema que sigue esta web, de la
          más antigua a la más reciente. Cada voto es uno emitido y publicado en el acta oficial, no
          una postura atribuida.
        </p>
      </div>

      {/* ---------- The topic's line ---------- */}
      <Section id="linea" title="Las votaciones, en orden">
        <p className="n-finding">{lineFinding}</p>
        <Line
          cls="n-topic"
          className="mt-8 max-w-[52rem]"
          stops={votes.map((v) => ({
            key: v.id,
            label: <a href={`#${v.id}`}>{voteDate(v, bcp47)}</a>,
            note: `${KIND_SHORT[v.kind] ?? v.kindLabel}${v.binding ? "" : ", sin efecto legal"}`,
            on: true,
          }))}
        />
        <p className="n-meta mt-6 max-w-[46em]">
          Una estación por votación. Todas constan en el acta oficial, por eso la línea es continua y
          los puntos están llenos.
        </p>
        <p className="n-source">
          Fuente: <a href={data.source.url}>{data.source.name}</a>.
        </p>
      </Section>

      {/* ---------- Each division ---------- */}
      {votes.map((v) => (
        <VoteSection key={v.id} vote={v} bcp47={bcp47} L={L} />
      ))}

      {/* ---------- Find a deputy ---------- */}
      <Section id="diputado" title="Cómo votó un diputado">
        <p className="n-body mb-6">
          Busca por apellido o nombre. Se muestra el voto que consta en cada acta y, cuando el nombre
          identifica a una sola persona, el enlace a su ficha.
        </p>
        <DeputyBallots
          votes={votes}
          q={q}
          action={L(`/nuevo/tema/${id}#diputado`)}
          locale={locale}
          columnLabel={(v) => v.law}
        />
      </Section>

      {/* ---------- What is not on record ---------- */}
      <Section id="falta" title="Lo que esta página no dice">
        <div className="grid gap-x-12 gap-y-8 md:grid-cols-3">
          <div>
            <h3 className="n-h3">Si salió adelante</h3>
            <p className="mt-2 text-[var(--n-ink-2)]">
              Los datos que usa esta web no incluyen el resultado de cada votación, y contar votos no
              basta: una ley orgánica necesita la mayoría absoluta del Congreso. El acta oficial de
              cada votación está enlazada en su apartado.
            </p>
          </div>
          <div>
            <h3 className="n-h3">Las enmiendas</h3>
            <p className="mt-2 text-[var(--n-ink-2)]">
              Se recogen votaciones de conjunto, tomas en consideración, proposiciones no de ley y
              mociones. Las votaciones de enmiendas una a una no se recogen.
            </p>
          </div>
          <div>
            <h3 className="n-h3">La postura de nadie</h3>
            <p className="mt-2 text-[var(--n-ink-2)]">
              Un diputado aparece solo con el voto que consta en el acta. No se deduce la postura de
              nadie a partir de su partido o de su grupo.
            </p>
          </div>
        </div>
        <div className="mt-12 grid gap-x-12 gap-y-4 border-t border-[var(--n-rule)] pt-8 md:grid-cols-2">
          {others.length > 0 && (
            <p>
              <span className="n-label">Otros temas: </span>
              {others.map((t, i) => (
                <span key={t.id}>
                  {i > 0 && (i === others.length - 1 ? " y " : ", ")}
                  <Link href={L(`/nuevo/tema/${t.id}`)}>{t.label}</Link>
                </span>
              ))}
            </p>
          )}
          <p>
            <span className="n-label">En el sitio actual: </span>
            {[...(RELATED[id] ?? []), { href: "/votaciones", text: "todas las votaciones" }].map((r, i, all) => (
              <span key={r.href}>
                {i > 0 && (i === all.length - 1 ? " y " : ", ")}
                <Link href={L(r.href)}>{i === 0 ? r.text : r.text[0].toLowerCase() + r.text.slice(1)}</Link>
              </span>
            ))}
          </p>
        </div>
      </Section>
    </main>
  );
}

/** A group voted as a bloc when every member who cast a ballot cast the same one. */
function isBloc(g: GroupTally) {
  return [g.si, g.no, g.abst].filter((n) => n > 0).length === 1;
}

function VoteSection({ vote: v, bcp47, L }: { vote: KeyVote; bcp47: string; L: (p: string) => string }) {
  const groups = tallyByGroup(v);
  const blocs = groups.filter(isBloc).length;
  const diff = Math.abs(v.totals.afavor - v.totals.enContra);
  const finding =
    diff === 0
      ? `El sí y el no empataron, y ${blocs} de los ${groups.length} grupos votaron en bloque.`
      : `Hubo ${diff} ${diff === 1 ? "voto" : "votos"} de diferencia entre el sí y el no, y ${blocs} de los ${groups.length} grupos votaron en bloque.`;

  return (
    <section id={v.id} className="n-topic n-shell n-section" aria-labelledby={`${v.id}-t`}>
      <p className="n-meta">
        {(KIND_SHORT[v.kind] ?? v.kindLabel).replace(/^./, (c) => c.toUpperCase())}, {voteDate(v, bcp47)}.{" "}
        {v.legislature} legislatura.
      </p>
      <h2 id={`${v.id}-t`} className="n-h2 mt-2">
        {v.law}
      </h2>

      <div className="mt-6 grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <div>
          <p className="n-finding">{finding}</p>
          <VoteBar
            className="mt-5"
            counts={{ si: v.totals.afavor, no: v.totals.enContra, abst: v.totals.abstenciones, noVota: v.totals.noVotan }}
          />
          <p className="n-meta mt-2">
            <VoteLegend />
          </p>

          <dl className="mt-8 grid gap-5 text-[0.95rem]">
            <div>
              <dt className="n-label">Qué se votó, según el acta</dt>
              <dd className="mt-1 text-[var(--n-ink-2)]">{whatWasVoted(v)}</dd>
            </div>
            <div>
              <dt className="n-label">Qué tipo de votación es</dt>
              <dd className="mt-1 text-[var(--n-ink-2)]">
                {KIND_PLAIN[v.kind] ?? v.kindLabel} {v.binding ? "Tiene efecto legal." : "No tiene efecto legal."}
              </dd>
            </div>
          </dl>
          <ul className="mt-6 grid gap-1.5">
            <li>
              <a href={v.sourceUrl}>Acta oficial de la votación</a>
              <span className="n-meta">, sesión {v.session}, votación {v.number}</span>
            </li>
            {v.lawUrl && (
              <li>
                <a href={v.lawUrl}>Texto de la ley en el BOE</a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="n-h3">Cómo votó cada grupo</h3>
          <ul className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {groups.map((g) => {
              const info = groupInfo(v.legislature, g.group);
              const name = info?.short ?? g.group;
              return (
                <li key={g.group} className="border-t border-[var(--n-rule)] pt-3">
                  <p className="font-bold">
                    {info?.party ? <Link href={L(`/nuevo/partido/${info.party}`)}>{name}</Link> : name}
                    <span className="n-meta font-normal">
                      {info?.parties
                        ? `, grupo de varios partidos (${info.parties.join(", ")})`
                        : info
                          ? ""
                          : ", grupo no identificado en el registro"}
                    </span>
                  </p>
                  <VoteBar
                    size="sm"
                    className="mt-2"
                    counts={{ si: g.si, no: g.no, abst: g.abst, noVota: g.other }}
                  />
                </li>
              );
            })}
          </ul>
          <p className="n-meta mt-6 max-w-[46em]">
            En bloque: todos los diputados del grupo que votaron lo hicieron en el mismo sentido. Un
            grupo parlamentario no es un partido: cuando lo forma uno solo, su nombre enlaza a la ficha
            de ese partido y a lo que recibe. Que el voto y el dinero estén en la misma web no significa
            que uno explique el otro.
          </p>
        </div>
      </div>
      <p className="n-source">
        Fuente: acta de votación nominal del Congreso de los Diputados, {voteDate(v, bcp47)}.
      </p>
    </section>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="n-shell n-section" aria-labelledby={`${id}-t`}>
      <h2 id={`${id}-t`} className="n-h2 mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}
