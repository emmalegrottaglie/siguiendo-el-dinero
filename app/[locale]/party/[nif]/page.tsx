import Link from "next/link";
import { notFound } from "next/navigation";
import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { euro, euroCompact, euroExact, integer, percent, formatDate } from "@/lib/format";
import CountUp from "@/components/CountUp";
import NewsFeed from "@/components/NewsFeed";
import { politiciansByParty } from "@/lib/politicians";
import { donationsByNif, donationsRanked, DONATIONS_SOURCE } from "@/lib/donations";
import { getVotes, newestFirst, stancesByParty } from "@/lib/votes";
import { sharedGroupFor } from "@/lib/groups";
import CourtRecords from "@/components/CourtRecords";
import PartySwitcher from "@/components/PartySwitcher";
import { TRANCHE_COLORS } from "@/lib/chart-colors";
import Bar, { type Segment } from "@/components/chart/Bar";
import ChartReader from "@/components/chart/ChartReader";
import { readerProps, say } from "@/lib/chart-reader";
import Caveat from "@/components/Caveat";
import type { SubsidyKind } from "@/lib/types";

export const revalidate = 3600;

export async function generateStaticParams() {
  const agg = await getAggregation();
  return agg.parties.map((p) => ({ nif: p.nif }));
}

export default async function PartyPage({
  params,
}: {
  params: Promise<{ locale: string; nif: string }>;
}) {
  const { locale: localeParam, nif } = await params;
  const [agg, votes] = await Promise.all([getAggregation(), getVotes()]);
  const party = agg.parties.find((p) => p.nif === nif);
  if (!party) notFound();

  const { locale, bcp47, t } = getDict(localeParam);
  const kindLabel: Record<SubsidyKind, string> = {
    ordinaria: t.kinds.ordinaria,
    seguridad: t.kinds.seguridad,
    otra: t.kinds.otra,
  };

  const rank = agg.parties.findIndex((p) => p.nif === nif) + 1;
  const faces = politiciansByParty(nif);
  const donations = donationsByNif(nif);
  // The parties worth offering in the switcher are those carrying a
  // declared-donations record, which is the one register that covers
  // several formations at comparable depth.
  const switchable = donationsRanked()
    .map((d) => d.nif)
    .filter((n): n is string => Boolean(n))
    .slice(0, 6);

  // How this party's own group voted, where it has a group of its own.
  // stancesByParty refuses to attribute a composite group's majority to a
  // party inside it, so a party with no group of its own gets an explicit
  // gap on each row rather than a stance it never cast.
  const stances = newestFirst(votes.votes).map((v) => ({
    vote: v,
    stance: stancesByParty(v).get(nif) ?? null,
    // Which kind of gap this is, when there is one.
    sharedGroup: sharedGroupFor(v.legislature, nif),
  }));

  // The three tranches, in the colours every other tranche chart on the site
  // uses. This page drew them in ink-3 / gold / red, which made the same three
  // categories look like three different things across two clicks.
  const trancheSegments: Segment[] = donations
    ? [
        {
          value: donations.small.amount,
          color: TRANCHE_COLORS.small,
          label: t.donationsTable.trancheSmall,
        },
        { value: donations.mid.amount, color: TRANCHE_COLORS.mid, label: t.donationsTable.trancheMid },
        {
          value: donations.large.amount,
          color: TRANCHE_COLORS.large,
          label: t.donationsTable.trancheLarge,
        },
      ]
    : [];

  const years = [...new Set(party.grants.map((g) => g.year))].sort((a, b) => a - b);
  const maxYear = Math.max(...years.map((y) => party.byYear[y] ?? 0), 1);

  return (
    <main className="pb-8">
      <PartySwitcher
        locale={locale}
        nifs={switchable}
        current={nif}
        label={t.party.switcherLabel}
      />

      {/* Identity */}
      <header className="rule-double pb-7 pt-7">
        <p className="eyebrow flex items-center gap-2">
          <span
            className="dot"
            aria-hidden
            style={{ width: 11, height: 11, background: party.color }}
          />
          {t.party.fichaKicker} · {t.common.nif} {party.nif} · Nº{" "}
          {String(rank).padStart(2, "0")} · {t.blocs[party.bloc]}
        </p>
        <h1
          className="display mt-3 font-normal"
          style={{ fontSize: "clamp(38px,5.4vw,64px)", lineHeight: 0.98, letterSpacing: "-0.03em" }}
        >
          {party.displayName}
        </h1>
        <p
          className="mt-5"
          style={{ fontSize: "15px", lineHeight: 1.68, color: "var(--ink-2)", maxWidth: "62ch" }}
        >
          {t.party.fichaIntro}
        </p>
      </header>

      {/* Total */}
      <div className="panel mt-8 flex flex-wrap items-end justify-between gap-6 p-6">
        <div>
          <p className="label-mono mb-2">
            {t.party.totalReceived} {years[0]}–{years.at(-1)}
          </p>
          <CountUp
            value={party.total}
            as="euro"
            bcp47={bcp47}
            className="mono block text-4xl text-[var(--gold-deep)] sm:text-5xl"
          />
        </div>
        <p className="mono text-sm text-[var(--ink-2)]">
          {percent(party.share, bcp47)} {t.party.ofNational}
        </p>
      </div>

      {/* Faces of the party */}
      {faces.length > 0 && (
        <section className="mt-10">
          <h2 className="display section-tick text-xl">{t.party.facesTitle}</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {faces.map((f) => (
              <Link
                key={f.slug}
                href={`/${locale}/politico/${f.slug}`}
                className="panel group px-4 py-3 transition-colors hover:border-[var(--line)]"
              >
                <span className="group-hover:text-[var(--gold-deep)]">{f.name}</span>
                <span className="label-mono ml-2 text-[var(--ink-3)]">{f.role}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* By kind */}
      <section className="mt-10">
        <h2 className="display section-tick text-xl">{t.party.whereFrom}</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(["ordinaria", "seguridad", "otra"] as SubsidyKind[])
            .filter((k) => party.byKind[k] > 0)
            .map((k) => (
              <div key={k} className="panel p-5">
                <p className="label-mono mb-3">{kindLabel[k]}</p>
                <p className="mono text-2xl text-[var(--ink)]">{euroCompact(party.byKind[k], bcp47)}</p>
                <p className="mono mt-1 text-xs text-[var(--ink-3)]">
                  {percent(party.byKind[k] / party.total, bcp47)} {t.party.ofItsFunds}
                </p>
              </div>
            ))}
        </div>
      </section>

      {/* By year */}
      <section className="mt-12">
        <h2 className="display section-tick text-xl">{t.party.yearlyEvolution}</h2>
        <div className="mt-8 flex items-end gap-3 sm:gap-5">
          {years.map((y) => {
            const v = party.byYear[y] ?? 0;
            const h = Math.max((v / maxYear) * 160, 3);
            return (
              <div key={y} className="flex flex-1 flex-col items-center gap-2">
                <span className="mono text-xs text-[var(--ink-2)]">{euroCompact(v, bcp47)}</span>
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    height: `${h}px`,
                    background: `linear-gradient(180deg, ${party.color}, ${party.color}55)`,
                  }}
                />
                <span className="mono text-xs text-[var(--ink-3)]">{y}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Private donations (Tribunal de Cuentas) */}
      {donations && (
        <section className="mt-14">
          <h2 className="display section-tick text-xl">
            {t.party.privateTitle} · {DONATIONS_SOURCE.year}
          </h2>
          <p className="label-mono mt-3">
            <a href={DONATIONS_SOURCE.url} target="_blank" rel="noopener noreferrer" className="src">
              {DONATIONS_SOURCE.body} · {DONATIONS_SOURCE.report} ↗
            </a>
          </p>

          <div className="panel mt-8 flex flex-wrap items-end justify-between gap-6 p-6">
            <div>
              <p className="label-mono mb-2">{t.party.donationsDeclared}</p>
              <p className="mono text-3xl text-[var(--gold-deep)] sm:text-4xl">
                {euro(donations.total.amount, bcp47)}
              </p>
            </div>
            <p className="mono text-sm text-[var(--ink-2)]">
              {integer(donations.total.donors, bcp47)} {t.party.donors}
            </p>
          </div>

          {/* tranche split by amount */}
          <ChartReader
            className="mt-6"
            items={(
              [
                [t.donationsTable.trancheSmall, donations.small],
                [t.donationsTable.trancheMid, donations.mid],
                [t.donationsTable.trancheLarge, donations.large],
              ] as const
            ).map(([lab, tr]) =>
              say(lab, euroExact(tr.amount, bcp47), `${integer(tr.donors, bcp47)} ${t.party.donors}`),
            )}
            {...readerProps(t.charts, bcp47, { title: t.party.donationsDeclared, count: 3 })}
          >
            <Bar
              segments={trancheSegments}
              total={donations.total.amount}
              scale="share"
              size="lg"
            />
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5">
              {(
                [
                  [t.donationsTable.trancheSmall, donations.small, TRANCHE_COLORS.small],
                  [t.donationsTable.trancheMid, donations.mid, TRANCHE_COLORS.mid],
                  [t.donationsTable.trancheLarge, donations.large, TRANCHE_COLORS.large],
                ] as const
              ).map(([lab, tr, color], i) => (
                <li key={lab} className="flex items-center gap-2" data-chart-item={i}>
                  <span
                    aria-hidden
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 1,
                      flex: "none",
                      background: color,
                    }}
                  />
                  <span className="label-mono">
                    {lab} · <span className="mono">{euroCompact(tr.amount, bcp47)}</span> (
                    {integer(tr.donors, bcp47)})
                  </span>
                </li>
              ))}
            </ul>
          </ChartReader>
          <p className="label-mono mt-4 text-[var(--ink-3)]">{t.party.privateCaveat}</p>
        </section>
      )}

      {/* Grant ledger */}
      <section className="mt-14">
        <h2 className="display section-tick text-xl">
          {t.party.ledgerTitle}
          <span className="label-mono ml-3 align-middle">{integer(party.grants.length, bcp47)}</span>
        </h2>
        <div className="mt-8 flex flex-col">
          {party.grants.map((g) => (
            <div key={g.id}>
              <div className="grid grid-cols-[5.5rem_1fr_auto] items-baseline gap-4 py-4">
                <span className="mono text-xs text-[var(--ink-2)]">{formatDate(g.date, bcp47)}</span>
                <span className="text-sm">
                  <span
                    className="mr-2 inline-block rounded px-2 py-0.5 text-[0.65rem] uppercase tracking-wider"
                    style={{
                      color: g.kind === "seguridad" ? "var(--red)" : "var(--gold-deep)",
                      border: `1px solid ${
                        g.kind === "seguridad" ? "var(--red)" : "var(--gold)"
                      }`,
                    }}
                  >
                    {kindLabel[g.kind]}
                  </span>
                  <span className="text-[var(--ink-2)]">{t.party.exercise} {g.year}</span>
                  {g.legalUrl && (
                    <a
                      href={g.legalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-[var(--ink-3)] underline decoration-dotted hover:text-[var(--gold-deep)]"
                    >
                      {t.party.legalBasis}
                    </a>
                  )}
                </span>
                <span className="mono text-right text-sm text-[var(--ink)]">{euro(g.amount, bcp47)}</span>
              </div>
              <hr className="hairline" />
            </div>
          ))}
        </div>
      </section>

      {/* The group's own record on the tracked divisions, and what the
          courts and electoral boards have on file. Side by side, never
          joined: the money above and the votes here are separate
          registers. */}
      <section className="mt-14 grid gap-9" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <div>
          <h2 className="display text-[22px] font-semibold" style={{ letterSpacing: "-0.015em" }}>
            {t.party.howItVoted}
          </h2>
          <ul className="mt-4 flex flex-col">
            {stances.map(({ vote, stance, sharedGroup }) => {
              const tone =
                stance === "si"
                  ? "var(--verd-text)"
                  : stance === "no"
                    ? "var(--red)"
                    : "var(--ink-3)";
              const text =
                stance === "si"
                  ? t.votes.inFavour
                  : stance === "no"
                    ? t.votes.against
                    : stance === "ab"
                      ? t.votes.abstention
                      : sharedGroup
                        ? t.party.sharedGroup.replace("{group}", sharedGroup.short)
                        : t.party.noRepresentation;
              return (
                <li
                  key={vote.id}
                  className="flex items-baseline justify-between gap-4 py-2.5"
                  style={{ borderBottom: "1px solid var(--line-soft)" }}
                >
                  <span style={{ fontSize: "13.5px" }}>{vote.law}</span>
                  <span className="tag" style={{ color: tone }}>
                    {text}
                  </span>
                </li>
              );
            })}
          </ul>
          <Caveat label={t.common.caveat} className="mt-3">
            {t.party.stanceNote}
          </Caveat>
        </div>

        <div>
          <h2 className="display text-[22px] font-semibold" style={{ letterSpacing: "-0.015em" }}>
            {t.court.title}
          </h2>
          <div className="mt-4">
            <CourtRecords t={t} bcp47={bcp47} partyNif={nif} />
          </div>
        </div>
      </section>

      {/* News feed */}
      <section className="mt-14">
        <h2 className="display section-tick text-xl">{t.party.inNews}</h2>
        <p className="label-mono mt-3 text-[var(--ink-3)]">{t.party.recentHeadlines}</p>
        <NewsFeed query={party.displayName} locale={locale} />
      </section>
    </main>
  );
}
