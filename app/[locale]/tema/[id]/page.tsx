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
  topicLabel,
  voteDate,
  votesOfTopic,
  whatWasVoted,
  yearSpan,
} from "@/components/nuevo/topics";
import type { Locale } from "@/lib/locales";
import { fetchTopicNews } from "@/lib/news";
import { NEWS_SOURCES } from "@/lib/news-sources.mjs";
import OrgVoices from "@/components/nuevo/OrgVoices";
import { integer } from "@/lib/format";
import { COPY } from "./copy";

// The deputy search reads the query string.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, id } = await params;
  const { locale } = getDict(localeParam);
  const t = COPY[locale];
  const topic = (await getVotes()).topics.find((tp) => tp.id === id);
  return { title: topic ? t.metaTitle(topicLabel(topic.id, topic.label, locale)) : t.metaFallback };
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
  const t = COPY[locale];
  const L = (path: string) => `/${locale}${path}`;

  const others = data.topics.filter((tp) => tp.id !== id && data.votes.some((v) => v.topic === tp.id));
  const label = topicLabel(topic.id, topic.label, locale);
  const lowerLabel = label[0].toLowerCase() + label.slice(1);

  // The LGBTI topic also carries what the organisations themselves publish. It sits beside the
  // votes and is fetched only for that topic.
  const isLgtbi = id === "lgtbi";
  const voices = isLgtbi ? await fetchTopicNews(["lgtbi"], 24, locale === "en" ? "en" : "es") : null;
  const orgSources = NEWS_SOURCES.filter((s) => s.topics.includes("lgtbi") && s.kind === "org");
  const mediaSources = NEWS_SOURCES.filter((s) => s.topics.includes("lgtbi") && s.kind === "media");

  // The housing topic carries the registry's housing feeds the same way: the organisations and the
  // press, each newest first (organisations ahead, so the weekly publishers are not buried by the
  // dailies), beside the votes and joined to none of them.
  const isHousing = id === "vivienda";
  const housing = isHousing ? await fetchTopicNews(["vivienda"], 24, locale) : null;
  const housingOrgs = NEWS_SOURCES.filter((s) => s.topics.includes("vivienda") && s.kind === "org");
  const housingMedia = NEWS_SOURCES.filter((s) => s.topics.includes("vivienda") && s.kind === "media");

  // The line's finding: how many divisions, over which years, and how many bind.
  const binding = votes.filter((v) => v.binding).length;
  const lineFinding = t.lineFinding(votes.length, lowerLabel, yearSpan(votes, locale), binding, votes[0].binding);

  return (
    <main>
      <div className="n-shell pb-10 pt-6">
        <p className="n-meta">
          <Link href={L("/temas")}>{t.crumb}</Link>
        </p>
        <h1 className="n-display mt-3" style={{ maxWidth: "22ch" }}>
          {label}
        </h1>
        <p className="n-body mt-5" style={{ fontSize: "1.15rem" }}>
          {t.intro}
        </p>
      </div>

      {/* ---------- The topic's line ---------- */}
      <Section id="linea" title={t.lineTitle}>
        <p className="n-finding">{lineFinding}</p>
        <Line
          cls="n-topic"
          className="mt-8 max-w-[52rem]"
          stops={votes.map((v) => ({
            key: v.id,
            label: <a href={`#${v.id}`}>{voteDate(v, bcp47)}</a>,
            note: `${KIND_SHORT[locale][v.kind] ?? v.kindLabel}${v.binding ? "" : t.noLegalEffect}`,
            on: true,
          }))}
        />
        <p className="n-meta mt-6 max-w-[46em]">
          {t.lineNote}
        </p>
        <p className="n-source">
          {t.sourceLabel}
          <a href={data.source.url}>{data.source.name}</a>.
        </p>
      </Section>

      {/* ---------- Each division ---------- */}
      {votes.map((v) => (
        <VoteSection key={v.id} vote={v} bcp47={bcp47} locale={locale} L={L} />
      ))}

      {/* ---------- Find a deputy ---------- */}
      <Section id="diputado" title={t.deputyTitle}>
        <p className="n-body mb-6">
          {t.deputyIntro}
        </p>
        <DeputyBallots
          votes={votes}
          q={q}
          action={L(`/tema/${id}#diputado`)}
          locale={locale}
          columnLabel={(v) => v.law}
        />
      </Section>

      {/* ---------- The organisations' own voice (LGBTI topic only) ---------- */}
      {voices && (
        <Section id="organizaciones" title={t.orgTitle}>
          <OrgVoices
            t={t}
            locale={locale}
            items={voices.items}
            dropped={voices.dropped}
            orgs={orgSources}
            media={mediaSources}
            methodHref={`/${locale}/metodologia`}
          />
        </Section>
      )}

      {/* ---------- Housing in the news (housing topic only) ---------- */}
      {housing && (
        <Section id="noticias" title={t.housingTitle}>
          <OrgVoices
            t={{
              ...t,
              orgIntro: t.housingIntro,
              orgJuxta: t.housingJuxta,
              orgsNote: t.housingOrgsNote(integer(housingOrgs.length, bcp47)),
              mediaNote: t.housingMediaNote,
            }}
            locale={locale}
            items={housing.items}
            dropped={housing.dropped}
            orgs={housingOrgs}
            media={housingMedia}
            methodHref={`/${locale}/metodologia`}
          />
        </Section>
      )}

      {/* ---------- What is not on record ---------- */}
      <Section id="falta" title={t.missingTitle}>
        <div className="grid gap-x-12 gap-y-8 md:grid-cols-3">
          <div>
            <h3 className="n-h3">{t.passedTitle}</h3>
            <p className="mt-2 text-[var(--n-ink-2)]">{t.passedText}</p>
          </div>
          <div>
            <h3 className="n-h3">{t.amendmentsTitle}</h3>
            <p className="mt-2 text-[var(--n-ink-2)]">{t.amendmentsText}</p>
          </div>
          <div>
            <h3 className="n-h3">{t.nobodyTitle}</h3>
            <p className="mt-2 text-[var(--n-ink-2)]">{t.nobodyText}</p>
          </div>
        </div>
        {others.length > 0 && (
          <div className="mt-12 border-t border-[var(--n-rule)] pt-8">
            <p>
              <span className="n-label">{t.otherTopics}</span>
              {others.map((tp, i) => (
                <span key={tp.id}>
                  {i > 0 && (i === others.length - 1 ? t.and : ", ")}
                  <Link href={L(`/tema/${tp.id}`)}>{topicLabel(tp.id, tp.label, locale)}</Link>
                </span>
              ))}
            </p>
          </div>
        )}
      </Section>
    </main>
  );
}

/** A group voted as a bloc when every member who cast a ballot cast the same one. */
function isBloc(g: GroupTally) {
  return [g.si, g.no, g.abst].filter((n) => n > 0).length === 1;
}

function VoteSection({
  vote: v,
  bcp47,
  locale,
  L,
}: {
  vote: KeyVote;
  bcp47: string;
  locale: Locale;
  L: (p: string) => string;
}) {
  const t = COPY[locale];
  const groups = tallyByGroup(v);
  const blocs = groups.filter(isBloc).length;
  const diff = Math.abs(v.totals.afavor - v.totals.enContra);
  const finding = diff === 0 ? t.tied(blocs, groups.length) : t.gap(diff, blocs, groups.length);

  return (
    <section id={v.id} className="n-topic n-shell n-section" aria-labelledby={`${v.id}-t`}>
      <p className="n-meta">
        {(KIND_SHORT[locale][v.kind] ?? v.kindLabel).replace(/^./, (c) => c.toUpperCase())}, {voteDate(v, bcp47)}.{" "}
        {t.legislature(v.legislature)}
      </p>
      <h2 id={`${v.id}-t`} className="n-h2 mt-2">
        {v.law}
      </h2>

      <div className="mt-6 grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <div>
          <p className="n-finding">{finding}</p>
          <VoteBar
            locale={locale}
            className="mt-5"
            counts={{ si: v.totals.afavor, no: v.totals.enContra, abst: v.totals.abstenciones, noVota: v.totals.noVotan }}
          />
          <p className="n-meta mt-2">
            <VoteLegend locale={locale} />
          </p>

          <dl className="mt-8 grid gap-5 text-[0.95rem]">
            <div>
              <dt className="n-label">{t.whatTitle}</dt>
              <dd className="mt-1 text-[var(--n-ink-2)]">{whatWasVoted(v)}</dd>
            </div>
            <div>
              <dt className="n-label">{t.kindTitle}</dt>
              <dd className="mt-1 text-[var(--n-ink-2)]">
                {KIND_PLAIN[locale][v.kind] ?? v.kindLabel} {v.binding ? t.hasEffect : t.noEffect}
              </dd>
            </div>
          </dl>
          <ul className="mt-6 grid gap-1.5">
            <li>
              <a href={v.sourceUrl}>{t.officialRecord}</a>
              <span className="n-meta">{t.sessionNumber(v.session, v.number)}</span>
            </li>
            {v.lawUrl && (
              <li>
                <a href={v.lawUrl}>{t.lawText}</a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="n-h3">{t.groupsTitle}</h3>
          <ul className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {groups.map((g) => {
              const info = groupInfo(v.legislature, g.group);
              const name = info?.short ?? g.group;
              return (
                <li key={g.group} className="border-t border-[var(--n-rule)] pt-3">
                  <p className="font-bold">
                    {info?.party ? <Link href={L(`/partido/${info.party}`)}>{name}</Link> : name}
                    <span className="n-meta font-normal">
                      {info?.parties
                        ? t.severalParties(info.parties.join(", "))
                        : info
                          ? ""
                          : t.groupUnknown}
                    </span>
                  </p>
                  <VoteBar
                    locale={locale}
                    size="sm"
                    className="mt-2"
                    counts={{ si: g.si, no: g.no, abst: g.abst, noVota: g.other }}
                  />
                </li>
              );
            })}
          </ul>
          <p className="n-meta mt-6 max-w-[46em]">
            {t.groupNote}
          </p>
        </div>
      </div>
      <p className="n-source">
        {t.divisionSource(voteDate(v, bcp47))}
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
