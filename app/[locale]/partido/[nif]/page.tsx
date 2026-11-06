import type { ReactNode } from "react";
import { roleLabel } from "@/components/nuevo/roles";
import { topicLabel, whatWasVoted } from "@/components/nuevo/topics";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { COPY } from "./copy";
import {
  DONATIONS_SOURCE,
  donationsByNif,
  type Tranche,
} from "@/lib/donations";
import {
  displayName,
  entitySlug,
  foundationYears,
  getFoundations,
  partyNifByFoundation,
} from "@/lib/foundations";
import { officeTies, type OfficeTie } from "@/lib/officeholder-ties";
import { BOARD_GAPS, ROLES } from "@/lib/foundation-people";
import { foldText, nameKey } from "@/lib/name-key.mjs";
import { financial, getSpending } from "@/lib/spending";
import { getPeople } from "@/lib/people";
import {
  getVotes,
  stancesByParty,
  voteDateISO,
  type Stance,
} from "@/lib/votes";
import { sharedGroupFor } from "@/lib/groups";
import {
  euro,
  euroExact,
  euroM,
  formatDate,
  integer,
  percent,
} from "@/lib/format";
import ShareBar from "@/components/nuevo/ShareBar";
import InvestitureRecord, { investituresNaming } from "@/components/nuevo/InvestitureRecord";
import { PARTIES } from "@/lib/parties";
import { caName } from "@/lib/constituencies";
import Line from "@/components/nuevo/Line";
import DotGrid from "@/components/nuevo/DotGrid";
import CourtRecord from "@/components/nuevo/CourtRecord";
import { recordsForParty } from "@/lib/court-records";
import NewsFeed from "@/components/nuevo/NewsFeed";
import {
  incomeByNif,
  incomeHistoryByNif,
  ordinaryIncome,
  PARTY_INCOME,
  PARTY_INCOME_SOURCE,
  PARTY_INCOME_YEAR,
  PARTY_INCOME_YEARS,
} from "@/lib/party-income";
import {
  formationName,
  formationsOf,
  foundationsOf,
  isCoalition,
} from "../party-records";

export const revalidate = 3600;

export async function generateStaticParams() {
  const agg = await getAggregation();
  return agg.parties.map((p) => ({ nif: p.nif }));
}

const TRANCHE_KEYS = ["small", "mid", "large"] as const;

const FOUNDATION_PART_KEYS = [
  "party",
  "companies",
  "individuals",
  "subsidies",
] as const;
type PartKey = (typeof FOUNDATION_PART_KEYS)[number];

/**
 * The redesign prototype's party hub.
 *
 * It answers in the order a reader asks: how much the state gave the party and
 * how that ran year by year, what it declared in private donations, what went
 * into its foundations, what its campaign spending says it bought, which of its
 * foundations' trustees hold public office, and who its people are. Each
 * section opens with the one sentence its figures show, computed here, then the
 * graphic, then the source. A section with nothing on record says so rather
 * than disappearing, because the gap is part of the answer.
 *
 * Below the money and the votes, apart from both: what the courts and
 * electoral boards have on the party's officeholders (with an explicit card when
 * nothing is on file), and recent headlines from a news search on its name.
 *
 * The one exception is the regional investitures, from the old /mapa page: the
 * record names only the PP and Vox, so the section appears only on a hub whose
 * party the record names, and shows only the votes in favour it records.
 *
 * Figures from different reports and years sit side by side and are never
 * added together.
 */
export default async function PrototypeParty({
  params,
}: {
  params: Promise<{ locale: string; nif: string }>;
}) {
  const { locale: localeParam, nif } = await params;
  const [agg, foundations, spend, people, votes] = await Promise.all([
    getAggregation(),
    getFoundations(),
    getSpending(),
    getPeople(),
    getVotes(),
  ]);
  const party = agg.parties.find((p) => p.nif === nif);
  if (!party) notFound();
  const { locale, bcp47 } = getDict(localeParam);
  const t = COPY[locale];
  const L = (path: string) => `/${locale}${path}`;
  const pct = (n: number) => percent(n, bcp47, 0);
  const money = (n: number) =>
    n >= 1_000_000 ? euroM(n, bcp47, 2) : euro(n, bcp47);
  /** Millions to one decimal where that is precise enough, whole euros below a million. */
  const big = (n: number) =>
    n >= 1_000_000 ? euroM(n, bcp47, 1) : euro(n, bcp47);
  /** A share of the national total: small parties need the decimal, and under 1 % says so. */
  const shareWords = (n: number) =>
    t.shareWords(n < 0.01, percent(n, bcp47, n < 0.1 ? 1 : 0));
  const listFmt = new Intl.ListFormat(bcp47, { type: "conjunction" });

  const rank = agg.parties.findIndex((p) => p.nif === nif) + 1;
  const short = party.shortName;

  // ---------- The party's own income, 2020 ----------
  const income = incomeByNif(nif);
  // A row printed under this party's name that the site leaves unlinked, because
  // more than one registered party carries the name.
  const unlinkedRow = income
    ? undefined
    : PARTY_INCOME.find(
        (f) =>
          !f.nif &&
          foldText(f.label) ===
            foldText(party.displayName.replace(/\s*\(.*\)\s*$/, "")),
      );
  const incomeTotal = income ? ordinaryIncome(income) : 0;
  // Every audited year with a row for this party, oldest first. Each year is
  // shown as its own proportion; years are never added together.
  const incomeYears = incomeHistoryByNif(nif);
  const earlierSource = PARTY_INCOME_YEARS.find((y) => y.year !== PARTY_INCOME_YEAR)?.source;
  const PRIVATE_PARTS = income
    ? [
        { ...t.privateParts.memberFees, value: income.private.memberFees },
        {
          ...t.privateParts.officeholders,
          value: income.private.officeholders,
        },
        { ...t.privateParts.donations, value: income.private.donations },
        { ...t.privateParts.other, value: income.private.other },
      ]
    : [];
  const PUBLIC_PARTS = income
    ? [
        { label: t.publicParts.state, value: income.public.state },
        {
          label: t.publicParts.regionalParliaments,
          value: income.public.regionalParliaments,
        },
        { label: t.publicParts.local, value: income.public.local },
        {
          label: t.publicParts.regionalGovernments,
          value: income.public.regionalGovernments,
        },
        { label: t.publicParts.cortes, value: income.public.cortes },
        { label: t.publicParts.other, value: income.public.other },
      ]
    : [];
  const topPrivate = [...PRIVATE_PARTS].sort((a, b) => b.value - a.value)[0];
  const incomeFinding =
    income && incomeTotal > 0
      ? t.incomeFinding(
          PARTY_INCOME_YEAR,
          pct(income.public.total / incomeTotal),
          income.private.total > 0,
          topPrivate.words,
          money(topPrivate.value),
        )
      : null;

  // ---------- State money, by year ----------
  const years = [...agg.years].sort((a, b) => a - b);
  const thisYear = new Date().getFullYear();
  const maxYear = Math.max(...years.map((y) => party.byYear[y] ?? 0), 1);
  const stateFinding = t.stateFinding(
    rank === 1,
    big(party.total),
    years[0],
    years.at(-1),
    shareWords(party.share),
    t.ordinal(rank),
    agg.parties.length,
  );
  const kinds = (["ordinaria", "seguridad", "otra"] as const).filter(
    (k) => party.byKind[k] > 0,
  );

  // ---------- Donations, 2020 ----------
  const donations = donationsByNif(nif) ?? null;
  const tranche = (k: (typeof TRANCHE_KEYS)[number]): Tranche =>
    donations![k];
  const topTranche = donations
    ? [...TRANCHE_KEYS].sort(
        (a, b) => donations[b].amount - donations[a].amount,
      )[0]
    : null;
  const donorsWord = (n: number) => t.donorsWord(n, integer(n, bcp47));
  const donationFinding =
    donations && topTranche
      ? t.donationFinding(
          euroExact(donations.total.amount, bcp47),
          donorsWord(donations.total.donors),
          DONATIONS_SOURCE.year,
          pct(donations[topTranche].amount / donations.total.amount),
          t.tranches[topTranche].words,
        )
      : null;

  // ---------- Foundations ----------
  const ents = foundationsOf(foundations, nif);
  const fYears = foundationYears(foundations);
  const partsOf = (d: {
    contributions: {
      party: { amount: number };
      companies: { amount: number };
      individuals: { amount: number };
    };
    subsidies: { total: number };
  }): Record<PartKey, number> => ({
    party: d.contributions.party.amount,
    companies: d.contributions.companies.amount,
    individuals: d.contributions.individuals.amount,
    subsidies: d.subsidies.total,
  });
  const byYear = fYears.map((y) => {
    const sum: Record<PartKey, number> = {
      party: 0,
      companies: 0,
      individuals: 0,
      subsidies: 0,
    };
    for (const e of ents)
      for (const d of e.years.filter((x) => x.exercise === y)) {
        const p = partsOf(d);
        for (const k of Object.keys(sum) as PartKey[]) sum[k] += p[k];
      }
    return {
      year: y,
      ...sum,
      total: sum.party + sum.companies + sum.individuals + sum.subsidies,
    };
  });
  const latest = [...byYear].reverse().find((y) => y.total > 0) ?? null;
  const funded = ents.filter((e) => e.contributions + e.subsidies > 0);
  const unfunded = ents.filter((e) => e.contributions + e.subsidies === 0);
  const theirFoundations = t.theirFoundations(ents.length);
  const foundationFinding = latest
    ? (() => {
        const top = [...FOUNDATION_PART_KEYS].sort(
          (a, b) => latest[b] - latest[a],
        )[0];
        return t.foundationFinding(
          latest.year,
          pct(latest[top] / latest.total),
          theirFoundations,
          t.foundationParts[top].words,
        );
      })()
    : ents.length
      ? t.foundationNoMoney(ents.length, listFmt.format(fYears.map(String)))
      : null;

  // ---------- Officeholders on foundation boards ----------
  const ties = await officeTies(partyNifByFoundation(foundations));
  const foundationNames = new Set(
    ents.flatMap((e) => e.years.map((d) => d.name)),
  );
  const boardRoles = ROLES.filter((r) => foundationNames.has(r.foundation));
  const boardKeys = new Set(boardRoles.map((r) => nameKey(r.person)));
  const onBoard = [...boardKeys]
    .filter((k) => ties.byPerson.has(k))
    .flatMap((k) =>
      boardRoles
        .filter((r) => nameKey(r.person) === k)
        .map((r) => ({
          foundation: r.foundation,
          role: r.role,
          tie: ties.byPerson.get(k)![0] as OfficeTie,
        })),
    );
  const matchedPeople = new Set(onBoard.map((x) => x.tie.slug)).size;
  const boardByFoundation = [
    ...onBoard
      .reduce(
        (m, x) => m.set(x.foundation, [...(m.get(x.foundation) ?? []), x]),
        new Map<string, typeof onBoard>(),
      )
      .entries(),
  ].sort((a, b) => b[1].length - a[1].length);
  const ambiguousHere = ties.audit.ambiguous.filter((p) =>
    boardKeys.has(nameKey(p)),
  );
  const boardGaps = BOARD_GAPS.filter((g) => foundationNames.has(g.foundation));
  const boardSources = [
    ...new Map(boardRoles.map((r) => [r.source.url, r.source])).values(),
  ];
  const personas = (n: number) => t.personas(n, integer(n, bcp47));
  const boardFinding = boardKeys.size
    ? matchedPeople === 0
      ? t.boardNone(personas(boardKeys.size), theirFoundations)
      : t.boardSome(
          matchedPeople,
          integer(matchedPeople, bcp47),
          personas(boardKeys.size),
          theirFoundations,
          boardKeys.size === 1,
        )
    : null;

  // ---------- Campaign spending ----------
  const formations = formationsOf(spend, nif);
  const allShares = spend.formations
    .map((f) => ({
      name: f.name,
      share:
        f.ordinary.declared > 0
          ? f.ordinary.otherOrdinary / f.ordinary.declared
          : 0,
      mine: formations.includes(f),
    }))
    .sort((a, b) => b.share - a.share);

  // ---------- People ----------
  const mine = people.filter((p) => p.partyNif === nif);
  const deputies = mine
    .filter((p) => p.deputy)
    .sort((a, b) => a.deputy!.name.localeCompare(b.deputy!.name, "es"));
  const senators = mine.filter(
    (p) => !p.deputy && /^senador/i.test(p.role),
  ).length;
  const meps = mine.filter(
    (p) => !p.deputy && /^eurodiputad/i.test(p.role),
  ).length;
  const others = mine.length - deputies.length - senators - meps;
  const shortCounts = mine.reduce(
    (m, p) => m.set(p.partyShort, (m.get(p.partyShort) ?? 0) + 1),
    new Map<string, number>(),
  );
  const directoryLabel = [...shortCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];
  const peopleFinding = mine.length
    ? t.peopleFinding(
        personas(mine.length),
        short,
        deputies.length,
        integer(deputies.length, bcp47),
      )
    : null;

  // ---------- Votes ----------
  const stances = [...votes.votes]
    .sort((a, b) => voteDateISO(a).localeCompare(voteDateISO(b)))
    .map((v) => ({
      vote: v,
      stance: stancesByParty(v).get(nif) ?? null,
      shared: sharedGroupFor(v.legislature, nif),
    }));
  const withStance = stances.filter((s) => s.stance);
  const inFavour = withStance.filter((s) => s.stance === "si").length;
  const voteFinding = withStance.length
    ? t.voteFinding(
        inFavour,
        integer(inFavour, bcp47),
        integer(withStance.length, bcp47),
      )
    : t.voteNoGroup(short, integer(stances.length, bcp47));

  // ---------- Regional investitures, as recorded ----------
  // The record keys votes in favour by the party's short name as lib/parties.ts
  // spells it ("PP", "Vox"); the match is exact, on that registry's name for
  // this NIF, never on the display name.
  const recordName = PARTIES[nif]?.shortName;
  const invNamed = recordName ? investituresNaming(recordName) : { voted: [], seatsOnly: [] };
  const invRounds = invNamed.voted.flatMap((f) =>
    f.investiture.rounds.filter((r) => (r.forBreakdown[recordName!] ?? 0) > 0),
  );
  const invFailed = invRounds.filter((r) => !r.succeeded).length;
  const invName = (id: string) => caName(id, id);

  // ---------- Summary row ----------
  const f0 = formations[0];
  const summary = [
    {
      label: t.sumState,
      value: big(party.total),
      note: t.sumStateNote(years[0], years.at(-1)),
      cls: "n-state",
      muted: false,
    },
    {
      label: t.sumDonations,
      value: donations ? euro(donations.total.amount, bcp47) : t.notRecorded,
      note: donations
        ? t.sumDonationsNote(
            DONATIONS_SOURCE.year,
            donorsWord(donations.total.donors),
          )
        : t.sumDonationsNoNote(DONATIONS_SOURCE.year),
      cls: "n-donors",
      muted: !donations,
    },
    {
      label: t.sumFoundations,
      value: latest
        ? money(latest.total)
        : ents.length
          ? t.zeroEuro
          : t.notRecorded,
      note: latest
        ? t.sumFoundationsNote(latest.year)
        : ents.length
          ? t.sumFoundationsYears(listFmt.format(fYears.map(String)))
          : t.sumFoundationsNone,
      cls: "n-foundations",
      muted: !latest,
    },
    {
      label: t.sumCampaign,
      value: f0 ? money(f0.ordinary.declared) : t.notRecorded,
      note: f0
        ? isCoalition(f0, party.displayName)
          ? t.sumCampaignCoalition
          : t.sumCampaignOwn
        : t.sumCampaignNone,
      cls: "n-neutral",
      muted: !f0,
    },
  ];

  return (
    <main>
      <div className="n-shell pb-10 pt-6">
        <p className="n-meta">
          <Link href={L("/partidos")}>{t.breadcrumb}</Link>
        </p>
        <h1 className="n-display mt-3" style={{ maxWidth: "22ch" }}>
          {party.displayName}
        </h1>
        <p className="mt-4 text-[1.1rem] text-[var(--n-ink-2)]">
          {short !== party.displayName && `${short}. `}
          {t.nif} {party.nif}.{" "}
          {rank === 1
            ? t.topRank
            : t.rankLine(t.ordinal(rank), agg.parties.length)}
        </p>
        <p className="n-body mt-4 max-w-[46em]">{t.intro}</p>

        <dl className="mt-10 grid gap-px overflow-hidden rounded-[6px] border border-[var(--n-rule)] bg-[var(--n-rule)] sm:grid-cols-2 lg:grid-cols-4">
          {summary.map((s) => (
            <div key={s.label} className={`${s.cls} bg-[var(--n-card)] p-5`}>
              <dt className="n-label flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block h-[5px] w-6 rounded-full"
                  style={{
                    background: s.muted
                      ? "var(--n-rule-strong)"
                      : "var(--route)",
                  }}
                />
                {s.label}
              </dt>
              <dd
                className={`n-figure mt-3 ${s.muted ? "" : "n-route-text"}`}
                style={{
                  fontSize: s.muted ? "1.35rem" : "1.9rem",
                  color: s.muted ? "var(--n-ink-3)" : undefined,
                }}
              >
                {s.value}
              </dd>
              <dd className="n-meta mt-2">{s.note}</dd>
            </div>
          ))}
        </dl>
        <p className="n-meta mt-3 max-w-[60em]">
          {t.noSum}
        </p>
      </div>

      {/* ---------- State money ---------- */}
      <Section id="estado" title={t.stateTitle}>
        <p className="n-finding">{stateFinding}</p>
        <div className="mt-8 grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <div className="n-state">
            <h3 className="n-h3">{t.byYear}</h3>
            {/* Columns and stations share one grid, so each bar stands over its year. */}
            <div
              aria-hidden
              className="mt-5 grid h-40 items-end"
              style={{
                gridTemplateColumns: `repeat(${years.length}, minmax(0, 1fr))`,
              }}
            >
              {years.map((y) => {
                const v = party.byYear[y] ?? 0;
                return (
                  <div
                    key={y}
                    className="flex h-full flex-col items-center justify-end px-[18%]"
                  >
                    {v > 0 && (
                      <span
                        className="w-full rounded-t-[2px]"
                        style={{
                          height: `${Math.max((v / maxYear) * 100, 2)}%`,
                          background: "var(--route)",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <Line
              locale={locale}
              cls="n-state"
              className="mt-1"
              stops={years.map((y) => {
                const v = party.byYear[y] ?? 0;
                return {
                  key: String(y),
                  label: String(y),
                  note:
                    v > 0
                      ? `${big(v)}${y === thisYear ? `, ${t.currentYear}` : ""}`
                      : t.noGrant,
                  on: v > 0,
                };
              })}
            />
            <p className="n-meta mt-4">
              {t.dotLegend}
            </p>
          </div>
          <div className="n-state">
            <h3 className="n-h3">{t.byKind}</h3>
            <ShareBar
              locale={locale}
              className="mt-5"
              parts={kinds.map((k) => ({
                label: t.kindLabel[k],
                value: party.byKind[k],
              }))}
              format={(v) => big(v)}
            />
            <p className="n-meta mt-4">
              {t.kindNote}
            </p>
          </div>
        </div>
        <details className="mt-8">
          <summary className="cursor-pointer font-bold">
            {t.seeGrants(party.grants.length, integer(party.grants.length, bcp47))}
          </summary>
          <div className="mt-4 overflow-x-auto">
            <table className="n-table min-w-[34rem]">
              <caption className="sr-only">
                {t.grantsCaption(party.displayName)}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{t.thDate}</th>
                  <th scope="col">{t.thKind}</th>
                  <th scope="col">{t.thExercise}</th>
                  <th scope="col" className="n-r">
                    {t.thAmount}
                  </th>
                </tr>
              </thead>
              <tbody>
                {party.grants.map((g) => (
                  <tr key={g.id}>
                    <td className="n-num whitespace-nowrap">
                      {formatDate(g.date, bcp47)}
                    </td>
                    <td>
                      {t.kindLabel[g.kind]}
                      {g.legalUrl && (
                        <>
                          {" "}
                          <a href={g.legalUrl} className="n-meta">
                            {t.legalBasis}
                          </a>
                        </>
                      )}
                    </td>
                    <td className="n-num">
                      {g.convocatoria.match(/ejercicio (\d{4})/)?.[1] ?? g.year}
                    </td>
                    <td className="n-r">{euroExact(g.amount, bcp47)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
        <p className="n-source">
          {t.stateSource(
            agg.source.url,
            formatDate(agg.generatedAt.slice(0, 10), bcp47),
          )}
        </p>
      </Section>

      {/* ---------- The party's own income ---------- */}
      <Section id="ingresos" title={t.incomeTitle}>
        {income && incomeFinding ? (
          <>
            <p className="n-finding">{incomeFinding}</p>
            <div className="mt-6">
              <div
                aria-hidden
                className="flex h-7 w-full gap-[2px] overflow-hidden rounded-[3px]"
              >
                <span
                  className="n-state"
                  style={{
                    flexGrow: income.public.total,
                    flexBasis: 0,
                    background: "var(--route)",
                  }}
                />
                {income.private.total > 0 && (
                  <span
                    className="n-donors"
                    style={{
                      flexGrow: income.private.total,
                      flexBasis: 0,
                      background: "var(--route)",
                    }}
                  />
                )}
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[0.95rem]">
                <li className="n-state inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3 rounded-[2px]"
                    style={{ background: "var(--route)" }}
                  />
                  {t.publicMoney}{" "}
                  <span className="n-num font-bold">
                    {money(income.public.total)}
                  </span>
                </li>
                <li className="n-donors inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3 rounded-[2px]"
                    style={{ background: "var(--route)" }}
                  />
                  {t.privateMoney}{" "}
                  <span className="n-num font-bold">
                    {money(income.private.total)}
                  </span>
                </li>
              </ul>
            </div>
            <div className="mt-10 grid gap-x-14 gap-y-10 lg:grid-cols-2">
              <div className="n-state">
                <h4 className="font-bold">{t.publicBy}</h4>
                <ShareBar
                  locale={locale}
                  className="mt-4"
                  parts={PUBLIC_PARTS.filter((x) => x.value > 0)}
                  format={money}
                />
              </div>
              <div className="n-donors">
                <h4 className="font-bold">{t.privateBy}</h4>
                {income.private.total > 0 ? (
                  <ShareBar
                    locale={locale}
                    className="mt-4"
                    parts={PRIVATE_PARTS.filter((x) => x.value > 0).map(
                      ({ label, value }) => ({ label, value }),
                    )}
                    format={money}
                  />
                ) : (
                  <p className="n-body mt-4">{t.noPrivate}</p>
                )}
              </div>
            </div>
            <p className="n-body mt-6">{t.incomeNote}</p>
          </>
        ) : (
          <p className="n-finding">
            {unlinkedRow
              ? t.incomeUnlinked(PARTY_INCOME_YEAR, unlinkedRow.label, short)
              : t.incomeNoRow(PARTY_INCOME_YEAR, PARTY_INCOME.length, short)}
          </p>
        )}
        {incomeYears.length > 1 && (
          <div className="mt-12">
            <h3 className="font-bold" style={{ fontFamily: "var(--n-serif)", fontSize: "1.25rem" }}>
              {t.yearsTitle}
            </h3>
            <p className="n-body mt-3">
              {t.yearsIntro(short, incomeYears.map((y) => y.year).join(", "))}
            </p>
            <ul className="mt-6 grid gap-5">
              {incomeYears.map(({ year, income: row }) => {
                const total = ordinaryIncome(row);
                return (
                  <li key={year} className="grid gap-2 sm:grid-cols-[4rem_minmax(0,1fr)] sm:items-center sm:gap-6">
                    <span className="n-num font-bold">{year}</span>
                    {total > 0 ? (
                      <div>
                        <div aria-hidden className="flex h-5 w-full gap-[2px] overflow-hidden rounded-[3px]">
                          <span
                            className="n-state"
                            style={{ flexGrow: row.public.total, flexBasis: 0, background: "var(--route)" }}
                          />
                          {row.private.total > 0 && (
                            <span
                              className="n-donors"
                              style={{ flexGrow: row.private.total, flexBasis: 0, background: "var(--route)" }}
                            />
                          )}
                        </div>
                        <p className="n-meta mt-1">
                          {t.yearsPublicShare(pct(row.public.total / total))}, {t.yearsTotal(money(total))}
                        </p>
                      </div>
                    ) : (
                      <p className="n-meta">{row.note ? t.yearsNoBreakdown : "—"}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <p className="n-source">
          {t.incomeSource(PARTY_INCOME_SOURCE.url, PARTY_INCOME_YEAR)}
          {incomeYears.some((y) => y.year !== PARTY_INCOME_YEAR) && earlierSource && (
            <>
              {" "}
              {t.yearsSource(earlierSource.url)}
            </>
          )}
        </p>
      </Section>

      {/* ---------- Private donations ---------- */}
      <Section id="donaciones" title={t.donationsTitle}>
        {donations && donationFinding ? (
          <>
            <p className="n-finding">{donationFinding}</p>
            <div className="n-donors mt-8 grid gap-x-14 gap-y-10 lg:grid-cols-2">
              <div>
                <h3 className="n-h3">{t.moneyByTranche}</h3>
                <ShareBar
                  locale={locale}
                  className="mt-5"
                  parts={TRANCHE_KEYS.map((k) => ({
                    label: t.tranches[k].label,
                    value: tranche(k).amount,
                  }))}
                  format={(v) => euro(v, bcp47)}
                />
              </div>
              <div>
                <h3 className="n-h3">{t.donorsByTranche}</h3>
                {donations.total.donors <= 400 ? (
                  <DotGrid
                    locale={locale}
                    className="mt-5"
                    groups={TRANCHE_KEYS.map((k, i) => ({
                      key: k,
                      count: tranche(k).donors,
                      label: t.donated(k, tranche(k).donors),
                      look: i === 0 ? "filled" : i === 1 ? "ink" : "hollow",
                      cls: "n-donors",
                    }))}
                  />
                ) : (
                  <ShareBar
                    locale={locale}
                    className="mt-5"
                    parts={TRANCHE_KEYS.map((k) => ({
                      label: t.tranches[k].label,
                      value: tranche(k).donors,
                    }))}
                    format={(v) => t.donorsCount(v, integer(v, bcp47))}
                  />
                )}
              </div>
            </div>
            <p className="n-body mt-6">{t.donationsNote}</p>
          </>
        ) : (
          <p className="n-finding">
            {t.donationsMissing(DONATIONS_SOURCE.year, short)}
          </p>
        )}
        <p className="n-source">
          {t.donationsSource(DONATIONS_SOURCE.url, DONATIONS_SOURCE.year)}
        </p>
      </Section>

      {/* ---------- Foundations ---------- */}
      <Section
        id="fundaciones"
        title={t.foundationsTitle(ents.length)}
      >
        {foundationFinding ? (
          <>
            <p className="n-finding">{foundationFinding}</p>
            <p className="n-body mt-3">{t.foundationNote}</p>
            {funded.length > 0 && (
              <div
                className={`mt-10 grid gap-x-14 gap-y-12 ${funded.length > 1 ? "lg:grid-cols-2" : ""}`}
              >
                {funded.map((e) => (
                  <article key={e.slug} className="n-foundations">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="h-[23px] w-[23px] shrink-0 rounded-full border-[3px]"
                        style={{
                          borderColor: "var(--route)",
                          background: "var(--n-card)",
                        }}
                      />
                      <h3 className="n-h3">
                        <Link href={L(`/fundacion/${e.slug}`)}>
                          {displayName(e.name)}
                        </Link>
                      </h3>
                    </div>
                    <div
                      className="mt-5 grid gap-7 border-l-[5px] pl-6 ml-[9px]"
                      style={{ borderColor: "var(--route)" }}
                    >
                      {[...e.years].reverse().map((d) => {
                        const p = partsOf(d);
                        const total =
                          p.party + p.companies + p.individuals + p.subsidies;
                        return (
                          <div key={d.exercise + d.name}>
                            <p className="font-bold">
                              {d.exercise}
                              <span className="n-meta font-normal">
                                {", "}
                                {total > 0
                                  ? t.inTotal(euro(total, bcp47))
                                  : t.noContributions}
                                {d.name !== e.name
                                  ? t.thenCalled(displayName(d.name))
                                  : ""}
                              </span>
                            </p>
                            {total > 0 && (
                              <ShareBar
                                locale={locale}
                                className="mt-3"
                                parts={FOUNDATION_PART_KEYS.filter(
                                  (k) => p[k] > 0,
                                ).map((k) => ({
                                  label: t.foundationParts[k].label,
                                  value: p[k],
                                }))}
                                format={(v) => euro(v, bcp47)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            )}
            {unfunded.length > 0 && (
              <p className="mt-10 max-w-[48rem] text-[var(--n-ink-2)]">
                {unfunded.length === 1
                  ? t.unfundedOne
                  : t.unfundedMany(unfunded.length)}
                {unfunded.map((e, i) => (
                  <span key={e.slug}>
                    {i > 0 && (i === unfunded.length - 1 ? t.listAnd : ", ")}
                    <Link href={L(`/fundacion/${e.slug}`)}>
                      {displayName(e.name)}
                    </Link>
                  </span>
                ))}
                .
              </p>
            )}
          </>
        ) : (
          <p className="n-finding">
            {t.foundationNone(short)}
          </p>
        )}
        <p className="n-source">
          {t.foundationSource(
            foundations.source.url,
            listFmt.format(fYears.map(String)),
          )}
        </p>
      </Section>

      {/* ---------- Officeholders on the boards ---------- */}
      {ents.length > 0 && (
        <Section id="patronatos" title={t.boardsTitle}>
          {boardFinding ? (
            <>
              <p className="n-finding">{boardFinding}</p>
              <div className="mt-8 grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,22rem)_1fr]">
                <div>
                  <DotGrid
                    locale={locale}
                    groups={[
                      {
                        key: "con",
                        count: matchedPeople,
                        label: t.dotWith,
                        look: "filled",
                        cls: "n-foundations",
                      },
                      {
                        key: "sin",
                        count: boardKeys.size - matchedPeople,
                        label: t.dotWithout,
                        look: "hollow",
                      },
                    ]}
                  />
                  <p className="n-meta mt-4">
                    {t.boardDotNote}
                    {ambiguousHere.length > 0 &&
                      t.boardDiscarded(ambiguousHere.length)}
                  </p>
                </div>
                <div>
                  {boardByFoundation.map(([foundation, list]) => (
                    <div
                      key={foundation}
                      className="n-foundations mb-8 last:mb-0"
                    >
                      <h3 className="n-h3">
                        <Link href={L(`/fundacion/${entitySlug(foundation)}`)}>
                          {displayName(foundation)}
                        </Link>
                      </h3>
                      <ul className="mt-3 grid gap-x-8 sm:grid-cols-2">
                        {list.map(({ tie, role }) => (
                          <li
                            key={tie.slug + role}
                            className="border-t border-[var(--n-rule)] py-3"
                          >
                            <Link
                              href={L(`/politico/${tie.slug}`)}
                              className="font-bold"
                            >
                              {tie.person}
                            </Link>
                            <span className="text-[var(--n-ink-2)]">
                              , {roleLabel(role.toLowerCase(), locale)}
                            </span>
                            <p className="n-meta mt-0.5">
                              {tie.organisation}
                              {tie.role ? `, ${tie.role}` : ""}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="n-finding">
              {t.boardUnknown(ents.length)}
            </p>
          )}
          {boardGaps.length > 0 && (
            <ul className="mt-8 grid max-w-[60rem] gap-4">
              {boardGaps.map((g) => (
                <li
                  key={g.foundation}
                  className="border-l-[3px] border-dashed pl-4"
                  style={{ borderColor: "var(--n-ink-3)" }}
                >
                  <p className="font-bold">{displayName(g.foundation)}</p>
                  <p className="n-meta mt-0.5">{g.reason}</p>
                </li>
              ))}
            </ul>
          )}
          <p className="n-source">
            {t.boardSources(
              boardSources.length > 0
                ? boardSources.map((s, i) => (
                    <span key={s.url}>
                      {i > 0 && ", "}
                      <a href={s.url}>{s.publisher}</a> ({s.date})
                    </span>
                  ))
                : null,
              ties.audit.registerUpdated
                ? formatDate(ties.audit.registerUpdated, bcp47)
                : null,
            )}
          </p>
        </Section>
      )}

      {/* ---------- Campaign spending ---------- */}
      <Section id="campana" title={t.campaignTitle}>
        {formations.length ? (
          formations.map((f) => {
            const o = f.ordinary;
            const share = o.declared > 0 ? o.otherOrdinary / o.declared : 0;
            const coalition = isCoalition(f, party.displayName);
            const itemised = [
              {
                label: t.outdoor,
                value: o.outdoorAdvertising,
                strength: 100,
              },
              {
                label: t.pressRadio,
                value: o.pressRadioAdvertising,
                strength: 62,
              },
              {
                label: t.financialCosts,
                value: financial(f),
                strength: 38,
              },
            ].filter((x) => x.value > 0);
            return (
              <div key={f.name}>
                <p className="n-finding">
                  {share > 0
                    ? t.campaignSplit(pct(share), coalition)
                    : t.campaignAllItemised(coalition)}
                </p>
                {coalition && (
                  <p className="n-body mt-3">
                    {t.campaignCoalition(short, formationName(f.name))}
                  </p>
                )}
                <div className="mt-8 grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
                  <div>
                    <h3 className="n-h3">
                      {t.declaredOrdinary(money(o.declared))}
                    </h3>
                    <div
                      aria-hidden
                      className="mt-5 flex h-7 w-full gap-[2px] overflow-hidden rounded-[3px]"
                    >
                      {itemised.map((x) => (
                        <span
                          key={x.label}
                          style={{
                            flexGrow: x.value / o.declared,
                            flexBasis: 0,
                            minWidth: 3,
                            background: `color-mix(in srgb, var(--n-ink-2) ${x.strength}%, var(--n-bg))`,
                          }}
                        />
                      ))}
                      {o.otherOrdinary > 0 && (
                        <span
                          className="n-hatch"
                          style={{
                            flexGrow: share,
                            flexBasis: 0,
                            outline: "1px solid var(--n-ink-3)",
                            outlineOffset: -1,
                          }}
                        />
                      )}
                    </div>
                    <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[0.95rem]">
                      {itemised.map((x) => (
                        <li
                          key={x.label}
                          className="inline-flex items-center gap-2"
                        >
                          <span
                            aria-hidden
                            className="inline-block h-3 w-3 rounded-[2px]"
                            style={{
                              background: `color-mix(in srgb, var(--n-ink-2) ${x.strength}%, var(--n-bg))`,
                            }}
                          />
                          {x.label}{" "}
                          <span className="n-num font-bold">
                            {money(x.value)}
                          </span>
                        </li>
                      ))}
                      {o.otherOrdinary > 0 && (
                        <li className="inline-flex items-center gap-2">
                          <span
                            aria-hidden
                            className="n-hatch inline-block h-3 w-3 rounded-[2px]"
                            style={{
                              outline: "1px solid var(--n-ink-3)",
                              outlineOffset: -1,
                            }}
                          />
                          {t.otherUnitemised}{" "}
                          <span className="n-num font-bold">
                            {money(o.otherOrdinary)}
                          </span>
                        </li>
                      )}
                    </ul>
                    {f.mailings.totalJustified > 0 && (
                      <p className="n-meta mt-4">
                        {t.mailings(money(f.mailings.totalJustified))}
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="n-h3">{t.unitemisedBy}</h3>
                    <ul className="mt-4 grid gap-2.5">
                      {allShares.map((s) => (
                        <li key={s.name}>
                          <p
                            className={`text-[0.9rem] ${s.mine ? "font-bold" : "text-[var(--n-ink-2)]"}`}
                          >
                            {formationName(s.name)}
                            {s.mine && (
                              <span className="sr-only">
                                {" "}
                                {t.thisList}
                              </span>
                            )}
                            <span className="n-num">{`, ${pct(s.share)}`}</span>
                          </p>
                          <div
                            aria-hidden
                            className="mt-1 h-2.5 w-full rounded-[2px] bg-[var(--n-rule)]"
                          >
                            <span
                              className={`block h-full rounded-[2px] ${s.mine ? "n-hatch" : ""}`}
                              style={{
                                width: `${(s.share * 100).toFixed(2)}%`,
                                background: s.mine
                                  ? undefined
                                  : "var(--n-rule-strong)",
                                outline: s.mine
                                  ? "1px solid var(--n-ink)"
                                  : undefined,
                                outlineOffset: -1,
                              }}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                    <p className="n-meta mt-3">{t.boldHatched}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="n-finding">
            {t.campaignNone(short)}
          </p>
        )}
        <p className="n-source">
          {t.campaignSource(spend.source.url)}
        </p>
      </Section>

      {/* ---------- People ---------- */}
      <Section id="personas" title={t.peopleTitle}>
        {peopleFinding ? (
          <>
            <p className="n-finding">{peopleFinding}</p>
            <ShareBar
              locale={locale}
              className="n-neutral mt-6 max-w-[48rem]"
              parts={[
                { label: t.bodyCongress, value: deputies.length },
                { label: t.bodySenate, value: senators },
                { label: t.bodyEuro, value: meps },
                { label: t.bodyOther, value: others },
              ].filter((x) => x.value > 0)}
              format={(v) => integer(v, bcp47)}
            />
            {deputies.length > 0 && (
              // A long list starts folded, so the sections after it stay within reach.
              <details className="mt-10" open={deputies.length <= 16}>
                <summary className="n-h3 cursor-pointer">
                  {t.deputiesHeading(
                    deputies.length,
                    integer(deputies.length, bcp47),
                  )}
                </summary>
                <ul className="mt-3 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
                  {deputies.map((p) => (
                    <li
                      key={p.slug}
                      className="border-t border-[var(--n-rule)] py-2.5"
                    >
                      <Link
                        href={L(`/politico/${p.slug}`)}
                        className="font-bold"
                      >
                        {p.deputy!.fullName}
                      </Link>
                      <p className="n-meta mt-0.5">{p.deputy!.constituency}</p>
                    </li>
                  ))}
                </ul>
              </details>
            )}
            {directoryLabel && (
              <p className="mt-6">
                <Link
                  href={`${L("/personas")}?party=${encodeURIComponent(directoryLabel)}`}
                >
                  {t.seeDirectory(personas(mine.length))}
                </Link>
              </p>
            )}
          </>
        ) : (
          <p className="n-finding">{t.peopleNone(short)}</p>
        )}
        <p className="n-source">
          {t.peopleSource}
        </p>
      </Section>

      {/* ---------- Votes ---------- */}
      <Section id="votos" title={t.votesTitle}>
        <p className="n-finding">{voteFinding}</p>
        {(withStance.length > 0 || stances.some((x) => x.shared)) && (
          <ol className="mt-8 grid gap-x-12 lg:grid-cols-2">
            {stances.map(({ vote, stance, shared }) => (
              <li
                key={vote.id}
                className="n-topic flex items-start gap-4 border-t border-[var(--n-rule)] py-3"
              >
                <span
                  aria-hidden
                  className={`mt-1 inline-block h-4 w-4 shrink-0 rounded-full border-2 ${stance === "no" ? "n-hatch" : ""}`}
                  style={{
                    borderColor: stance
                      ? stance === "si"
                        ? "var(--route)"
                        : "var(--n-ink-3)"
                      : "var(--n-ink-3)",
                    background:
                      stance === "si"
                        ? "var(--route)"
                        : stance === "ab"
                          ? "var(--n-rule-strong)"
                          : stance === "no"
                            ? undefined
                            : "transparent",
                  }}
                />
                <div className="min-w-0">
                  <a href={vote.sourceUrl} className="text-[0.95rem]">
                    {vote.law}
                  </a>
                  <p lang="es" className="n-meta mt-0.5">{whatWasVoted(vote)}</p>
                  <p className="n-meta mt-0.5">
                    <span className="font-bold text-[var(--n-ink)]">
                      {stance
                        ? t.stance[stance]
                        : shared
                          ? t.noOwnPosition(shared.short)
                          : t.noOwnGroup}
                    </span>
                    {", "}
                    {vote.date}.{" "}
                    <Link href={L(`/tema/${vote.topic}`)}>
                      {topicLabel(vote.topic, vote.topicLabel, locale)}
                    </Link>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
        <p className="n-source">
          {t.votesSource}
        </p>
      </Section>

      {/* ---------- Regional investitures ---------- */}
      {recordName && (invNamed.voted.length > 0 || invNamed.seatsOnly.length > 0) && (
        <Section id="investiduras" title={t.investTitle}>
          {invNamed.voted.length > 0 && (
            <p className="n-finding">
              {t.investFinding(
                short,
                integer(invRounds.length, bcp47),
                invRounds.length,
                listFmt.format(invNamed.voted.map((f) => invName(f.investiture.id))),
                integer(invFailed, bcp47),
                invFailed,
              )}
            </p>
          )}
          {invNamed.seatsOnly.length > 0 && (
            <p className={invNamed.voted.length > 0 ? "n-body mt-3" : "n-finding"}>
              {t.investSeatsOnly(
                short,
                listFmt.format(invNamed.seatsOnly.map((f) => invName(f.investiture.id))),
              )}
            </p>
          )}
          {invNamed.voted.length > 0 && (
            <div className="mt-10 grid gap-x-14 gap-y-12 lg:grid-cols-2">
              {invNamed.voted.map((f) => (
                <InvestitureRecord
                  key={f.investiture.id}
                  finding={f}
                  name={invName(f.investiture.id)}
                  href={L(`/territorios#inv-${f.investiture.id}`)}
                  locale={locale}
                  bcp47={bcp47}
                  highlight={recordName}
                />
              ))}
            </div>
          )}
          <p className="n-meta mt-8 max-w-[48em]">{t.investScope}</p>
          <p className="mt-4">
            <Link href={L("/territorios#investiduras")}>{t.investAll}</Link>
          </p>
        </Section>
      )}

      {/* ---------- Courts and electoral boards ---------- */}
      <Section id="tribunales" title={t.courtTitle}>
        <p className="n-body mb-8 max-w-[46em]">{t.courtIntro(short)}</p>
        <CourtRecord locale={locale} bcp47={bcp47} partyNif={nif} />
        {recordsForParty(nif).length > 0 && <p className="n-source">{t.courtSource}</p>}
      </Section>

      {/* ---------- In the news ---------- */}
      <Section id="noticias" title={t.newsTitle}>
        <p className="n-body max-w-[46em]">{t.newsIntro(party.displayName)}</p>
        <NewsFeed query={party.displayName} locale={locale} />
        <p className="n-source">{t.newsSource}</p>
      </Section>

      <div className="n-shell pb-4">
        <p className="n-meta">
          <Link href={L("/partidos")}>{t.allParties}</Link>
        </p>
      </div>
    </main>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="n-shell n-section" aria-labelledby={`${id}-t`}>
      <h2 id={`${id}-t`} className="n-h2 mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}
