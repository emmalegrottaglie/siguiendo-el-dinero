import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { euro, euroM, fill, formatDate, integer, percent } from "@/lib/format";
import { PARTIES } from "@/lib/parties";
import {
  displayName,
  entities,
  foundationYears,
  getFoundations,
  namedDeals,
  partyNifByFoundation,
  registrationTally,
  FOUNDATIONS_LAW_URL,
  type Dossier,
  type Entity,
} from "@/lib/foundations";
import { governanceCoverage, ROLES } from "@/lib/foundation-people";
import { officeTies } from "@/lib/officeholder-ties";
import { nameKey } from "@/lib/name-key.mjs";
import {
  ordinaryIncome,
  PARTY_INCOME,
  PARTY_INCOME_SOURCE,
  PARTY_INCOME_TOTALS,
  PARTY_INCOME_YEAR,
} from "@/lib/party-income";
import ShareBar from "@/components/nuevo/ShareBar";
import Line from "@/components/nuevo/Line";
import DotGrid from "@/components/nuevo/DotGrid";
import { COPY } from "./copy";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = getDict((await params).locale);
  return { title: COPY[locale].metaTitle };
}

const PART_KEYS = ["party", "companies", "individuals", "subsidies"] as const;
type PartKey = (typeof PART_KEYS)[number];
/** The route colour at falling strength, the same steps ShareBar uses. */
const STRENGTH: Record<PartKey, number> = { party: 100, companies: 62, individuals: 38, subsidies: 22 };
const fillFor = (k: PartKey) => `color-mix(in srgb, var(--route) ${STRENGTH[k]}%, var(--n-bg))`;

const partsOf = (d: Dossier): Record<PartKey, number> => ({
  party: d.contributions.party.amount,
  companies: d.contributions.companies.amount,
  individuals: d.contributions.individuals.amount,
  subsidies: d.subsidies.total,
});
const totalOf = (p: Record<PartKey, number>) =>
  p.party + p.companies + p.individuals + p.subsidies;

/**
 * The prototype's index of party-linked entities: the foundations' line, drawn
 * party by party.
 *
 * Each party is a line and each of its entities a station, with what came into
 * that entity in each audited exercise drawn under it on one shared scale. The
 * channel's totals are shown per exercise and never added across exercises.
 * Entities the site cannot tie to one party are listed under the report's own
 * wording, so their absence from a party's page reads as a gap.
 */
export default async function PrototypeFoundations({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const { locale, bcp47, t: dict } = getDict(localeParam);
  const F = dict.foundations;
  const t = COPY[locale];
  const [data, agg] = await Promise.all([getFoundations(), getAggregation()]);
  const L = (path: string) => `/${locale}${path}`;
  const listFmt = new Intl.ListFormat(bcp47, { type: "conjunction" });
  const money = (n: number) => (n >= 1_000_000 ? euroM(n, bcp47, 2) : euro(n, bcp47));
  /** A share in words: a small amount that rounds to 0 % is still not nothing. */
  const share = (n: number) => (n > 0 && n < 0.005 ? t.lessThanOne : percent(n, bcp47, 0));

  const fYears = foundationYears(data);
  const fLatest = fYears.at(-1)!;
  const yearsList = listFmt.format(fYears.map(String));
  const ents = entities(data);
  const ties = await officeTies(partyNifByFoundation(data));

  // ---------- The finding, from the latest exercise alone ----------
  const y = data.years[String(fLatest)];
  // Where the parties' own money comes from, from the party-accounts report.
  // A different year from the foundations' exercises: shown beside them, never
  // added to or subtracted from them.
  const income = PARTY_INCOME_TOTALS;
  const incomeTotal = ordinaryIncome(income);
  const incomeShare = (v: number) => `${euroM(v, bcp47, 1)} (${share(v / incomeTotal)})`;
  const publicShare = (v: number) => `${euroM(v, bcp47, 1)} (${share(v / income.public.total)})`;

  const finding = t.finding(
    fLatest,
    integer(y.entities, bcp47),
    share(y.party / y.contributions),
    share(y.companies / y.contributions),
  );

  // ---------- Boards, per entity ----------
  const boardOf = (e: Entity) => {
    const names = new Set(e.years.map((d) => d.name));
    const keys = new Set(ROLES.filter((r) => names.has(r.foundation)).map((r) => nameKey(r.person)));
    const officers = [...keys].filter((k) => ties.byPerson.has(k)).length;
    return { people: keys.size, officers };
  };
  const boards = new Map(ents.map((e) => [e.slug, boardOf(e)]));

  // ---------- Grouped by party ----------
  const stateNifs = new Set(agg.parties.map((p) => p.nif));
  const newestTotal = (e: Entity) => totalOf(partsOf(e.years[0]));
  const byNewest = (a: Entity, b: Entity) =>
    newestTotal(b) - newestTotal(a) || a.name.localeCompare(b.name, "es");
  const groups = [
    ...ents
      .filter((e) => e.partyNif)
      .reduce((m, e) => m.set(e.partyNif!, [...(m.get(e.partyNif!) ?? []), e]), new Map<string, Entity[]>())
      .entries(),
  ]
    .map(([nif, list]) => ({ nif, meta: PARTIES[nif], list: list.sort(byNewest) }))
    .sort((a, b) => (a.meta?.displayName ?? a.nif).localeCompare(b.meta?.displayName ?? b.nif, "es"));
  const unlinked = ents
    .filter((e) => !e.partyNif)
    .sort((a, b) => (a.party ?? "").localeCompare(b.party ?? "", "es") || a.name.localeCompare(b.name, "es"));
  const reportParty = (s: string | null) =>
    s ? s.replace(/\s*PORCENTAJE DE PARTICIPACI[ÓO]N.*$/i, "").trim() : F.noPartyStated;
  const max = Math.max(1, ...ents.flatMap((e) => e.years.map((d) => totalOf(partsOf(d)))));

  // ---------- Named counterparties, the join audit, the register ----------
  const deals = namedDeals(data);
  const gov = governanceCoverage(ents.map((e) => e.name));
  const audit = ties.audit;
  const droppedCount = audit.ambiguous.length + audit.partyMismatch.length;
  const registerUpdated = audit.registerUpdated ? formatDate(audit.registerUpdated, bcp47) : null;
  const documented = ents
    .filter((e) => (boards.get(e.slug)?.people ?? 0) > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
  const reg = registrationTally(data);
  const noBoard = ents.filter((e) => (boards.get(e.slug)?.people ?? 0) === 0).length;
  const firstYear = fYears[0];
  const lineYears = Array.from(
    { length: new Date().getFullYear() - firstYear + 1 },
    (_, i) => firstYear + i,
  );

  /** One entity: a station with each audited exercise drawn under it. */
  const entityRow = (e: Entity, showWording: boolean) => {
    const b = boards.get(e.slug)!;
    return (
      <li key={e.slug} className="relative border-t border-[var(--n-rule)] py-4">
        <span
          aria-hidden
          className="absolute -left-[34px] top-[1.3rem] h-[15px] w-[15px] rounded-full border-[3px]"
          style={{ borderColor: "var(--route)", background: "var(--n-card)" }}
        />
        <p className="font-bold">
          <Link href={L(`/fundacion/${e.slug}`)}>{displayName(e.name)}</Link>
        </p>
        <p className="n-meta mt-0.5">
          {showWording && <>{t.asWritten(reportParty(e.party))} · </>}
          {b.people > 0
            ? t.board(b.people, integer(b.people, bcp47), b.officers, integer(b.officers, bcp47))
            : t.noBoard}
        </p>
        <div className="mt-3 grid gap-2.5">
          {fYears.map((year) => {
            const d = e.years.find((x) => x.exercise === year);
            const p = d ? partsOf(d) : null;
            const total = p ? totalOf(p) : 0;
            return (
              <div key={year} className="grid grid-cols-[3rem_minmax(0,1fr)] items-start gap-x-3">
                <span className="n-num text-[0.9rem] font-bold">{year}</span>
                <div className="min-w-0">
                  {d && total > 0 ? (
                    <div
                      aria-hidden
                      className="mt-1 flex h-2.5 gap-[2px] overflow-hidden rounded-[2px]"
                      style={{ width: `${Math.max((total / max) * 100, 0.8).toFixed(2)}%` }}
                    >
                      {PART_KEYS.filter((k) => p![k] > 0).map((k) => (
                        <span
                          key={k}
                          style={{ flexGrow: p![k], flexBasis: 0, minWidth: 2, background: fillFor(k) }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div
                      aria-hidden
                      className="mt-[0.55rem] h-[2px] w-16"
                      style={{
                        backgroundImage: d
                          ? undefined
                          : "repeating-linear-gradient(90deg, var(--n-ink-3) 0 5px, transparent 5px 10px)",
                        background: d ? "var(--n-rule-strong)" : undefined,
                      }}
                    />
                  )}
                  <p className="n-meta mt-1">
                    {!d ? (
                      t.notAudited
                    ) : total > 0 ? (
                      <>
                        <span className="n-num font-bold text-[var(--n-ink)]">{money(total)}</span>
                        {" · "}
                        {PART_KEYS.filter((k) => p![k] > 0)
                          .map((k) => `${t.parts[k].short} ${share(p![k] / total)}`)
                          .join(", ")}
                      </>
                    ) : (
                      t.noContributions
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </li>
    );
  };

  const legend = (
    <ul className="n-foundations n-meta mt-6 flex flex-wrap gap-x-5 gap-y-1">
      {PART_KEYS.map((k) => (
        <li key={k} className="inline-flex items-center gap-2">
          <span aria-hidden className="inline-block h-3 w-5 rounded-[2px]" style={{ background: fillFor(k) }} />
          {t.parts[k].label}
        </li>
      ))}
      <li className="inline-flex items-center gap-2">
        <span
          aria-hidden
          className="inline-block h-[2px] w-5"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, var(--n-ink-3) 0 4px, transparent 4px 7px)" }}
        />
        {t.notAudited}
      </li>
    </ul>
  );

  return (
    <main>
      <div className="n-shell pb-12 pt-6">
        <h1 className="n-display" style={{ maxWidth: "22ch" }}>
          {t.title}
        </h1>
        <p className="n-body mt-6" style={{ fontSize: "1.15rem" }}>
          {t.intro}
        </p>
        <p className="n-finding mt-8">{finding}</p>
        <p className="n-body mt-3">{t.findingNote}</p>
        <p className="n-body mt-3">
          <a href="#de-donde">{t.toMoney}</a>
        </p>
      </div>

      {/* ---------- The channel, one exercise at a time ---------- */}
      <Section id="ejercicios" title={t.channelTitle}>
        <div className="n-foundations grid gap-x-14 gap-y-12 lg:grid-cols-2">
          {fYears.map((year) => {
            const s = data.years[String(year)];
            return (
              <article key={year} className="min-w-0 border-l-[5px] pl-5" style={{ borderColor: "var(--route)" }}>
                <h3 className="n-h3">{t.yearHead(year, integer(s.entities, bcp47))}</h3>
                <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-4">
                  <div>
                    <dt className="n-label">{t.contributions}</dt>
                    <dd className="n-figure n-route-text mt-2" style={{ fontSize: "1.9rem" }}>
                      {euroM(s.contributions, bcp47, 2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="n-label">{t.subsidies}</dt>
                    <dd className="n-figure mt-2" style={{ fontSize: "1.9rem" }}>
                      {euroM(s.subsidies, bcp47, 2)}
                    </dd>
                  </div>
                </dl>
                <ShareBar
                  locale={locale}
                  className="mt-6"
                  parts={(["party", "companies", "individuals"] as const).map((k) => ({
                    label: t.parts[k].label,
                    value: s[k],
                  }))}
                  format={(v) => `${euroM(v, bcp47, 2)} (${t.ofContributions(share(v / s.contributions))})`}
                />
              </article>
            );
          })}
        </div>
        <p className="n-body mt-8">{F.publicNote}</p>
        <p className="n-source">
          {t.channelSource(yearsList)} <a href={data.source.url}>{data.source.report}</a>
        </p>
      </Section>

      {/* ---------- Where the parties' own money comes from ---------- */}
      <Section id="de-donde" title={t.moneyTitle}>
        <p className="n-finding">
          {t.moneyFinding(
            PARTY_INCOME_YEAR,
            integer(PARTY_INCOME.length, bcp47),
            euroM(incomeTotal, bcp47, 1),
            share(income.public.total / incomeTotal),
          )}
        </p>
        <p className="n-body mt-3">
          {t.moneyPrivate(
            euroM(income.private.officeholders, bcp47, 1),
            euroM(income.private.memberFees, bcp47, 1),
            euroM(income.private.donations, bcp47, 2),
          )}
        </p>
        <div className="mt-8 grid gap-x-14 gap-y-10 lg:grid-cols-2">
          <div className="n-neutral min-w-0">
            <h3 className="n-h3">{t.moneyAllHead}</h3>
            <ShareBar
              locale={locale}
              className="mt-4"
              parts={[
                { label: t.incomeParts.public, value: income.public.total },
                { label: t.incomeParts.officeholders, value: income.private.officeholders },
                { label: t.incomeParts.memberFees, value: income.private.memberFees },
                { label: t.incomeParts.donations, value: income.private.donations },
                { label: t.incomeParts.otherPrivate, value: income.private.other },
              ]}
              format={incomeShare}
            />
          </div>
          <div className="n-state min-w-0">
            <h3 className="n-h3">{t.moneyPublicHead}</h3>
            <ShareBar
              locale={locale}
              className="mt-4"
              parts={(
                ["state", "regionalParliaments", "local", "regionalGovernments", "cortes", "other"] as const
              )
                .map((k) => ({ label: t.publicParts[k], value: income.public[k] }))
                .sort((a, b) => b.value - a.value)}
              format={publicShare}
            />
          </div>
        </div>
        <p className="n-body mt-8">{t.moneyCaveat(yearsList, PARTY_INCOME_YEAR)}</p>
        <p className="n-body mt-3">
          {t.moneyLinkPre}
          <Link href={`/${locale}/partidos#ingresos`}>{t.moneyLink}</Link>.
        </p>
        <p className="n-source">
          {t.moneySourcePre} <a href={PARTY_INCOME_SOURCE.url}>{PARTY_INCOME_SOURCE.report}</a>
          {t.moneySourcePost}
        </p>
      </Section>

      {/* ---------- Every entity, by party ---------- */}
      <Section id="entidades" title={t.entitiesTitle}>
        <p className="n-body">{t.entitiesIntro}</p>
        {legend}
        <div className="mt-10 grid gap-x-14 gap-y-12 lg:grid-cols-2">
          {groups.map(({ nif, meta, list }) => {
            const rows = <ul className="ml-[9px] border-l-[5px] pl-6" style={{ borderColor: "var(--route)" }}>{list.map((e) => entityRow(e, false))}</ul>;
            return (
              <article key={nif} className="n-foundations min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span
                    aria-hidden
                    className="h-[23px] w-[23px] shrink-0 rounded-full border-[3px]"
                    style={{ borderColor: "var(--route)", background: "var(--route)" }}
                  />
                  <h3 className="n-h3">
                    {stateNifs.has(nif) ? (
                      <Link href={L(`/partido/${nif}`)}>{meta?.displayName ?? nif}</Link>
                    ) : (
                      (meta?.displayName ?? nif)
                    )}
                  </h3>
                  <span className="n-meta">{t.entitiesCount(list.length, integer(list.length, bcp47))}</span>
                </div>
                {list.length > 16 ? (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-bold">
                      {t.entitiesCount(list.length, integer(list.length, bcp47))}
                    </summary>
                    {rows}
                  </details>
                ) : (
                  <div className="mt-2">{rows}</div>
                )}
              </article>
            );
          })}

          {unlinked.length > 0 && (
            <article id="sin-partido" className="n-foundations min-w-0 lg:col-span-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span
                  aria-hidden
                  className="h-[23px] w-[23px] shrink-0 rounded-full border-[3px]"
                  style={{ borderColor: "var(--n-ink-3)", background: "transparent" }}
                />
                <h3 className="n-h3">{t.unlinkedTitle}</h3>
                <span className="n-meta">{t.entitiesCount(unlinked.length, integer(unlinked.length, bcp47))}</span>
              </div>
              <p className="n-body mt-3">{t.unlinkedIntro(unlinked.length)}</p>
              <ul
                className="ml-[9px] mt-2 grid gap-x-12 border-l-2 border-dashed pl-6 lg:grid-cols-2"
                style={{ borderColor: "var(--n-ink-3)" }}
              >
                {unlinked.map((e) => entityRow(e, true))}
              </ul>
            </article>
          )}
        </div>
        <p className="n-source">
          {t.entitiesSource(yearsList)} <a href={data.source.url}>{data.source.report}</a>
        </p>
      </Section>

      {/* ---------- The companies and entities the report names ---------- */}
      <Section id="convenios" title={F.counterpartyTitle}>
        <p className="n-body">{F.counterpartyNote}</p>
        <div className="mt-8 overflow-x-auto">
          <table className="n-table min-w-[46rem]">
            <caption className="sr-only">{t.dealsCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{F.counterparty}</th>
                <th scope="col">{F.entity}</th>
                <th scope="col">{F.exercise}</th>
                <th scope="col">{F.consideration}</th>
                <th scope="col" className="n-r">
                  {F.total}
                </th>
                <th scope="col">{F.duties}</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((d, i) => (
                <tr key={`${d.slug}-${d.exercise}-${i}`}>
                  <th scope="row" className="font-bold">
                    {d.counterparties.join(" · ")}
                  </th>
                  <td>
                    <Link href={L(`/fundacion/${d.slug}`)}>{displayName(d.entity)}</Link>
                  </td>
                  <td className="n-num">{d.exercise}</td>
                  <td className="text-[var(--n-ink-2)]">{d.consideration ?? "—"}</td>
                  <td className="n-r">{d.amount === null ? t.noAmount : euro(d.amount, bcp47)}</td>
                  <td className={d.compliant === false ? "font-bold" : "text-[var(--n-ink-2)]"}>
                    {d.compliant === false ? F.dutiesFailed : d.compliant === true ? F.dutiesMet : F.dutiesUnclear}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="n-source">
          {t.channelSource(yearsList)} <a href={data.source.url}>{data.source.report}</a>
        </p>
      </Section>

      {/* ---------- Who governs them ---------- */}
      <Section id="patronatos" title={F.peopleCoverageTitle}>
        <p className="n-finding">
          {t.boardsFinding(integer(audit.matched, bcp47), integer(audit.candidates, bcp47))}
        </p>
        <div className="mt-8 grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <div>
            <DotGrid
              locale={locale}
              groups={[
                { key: "con", count: audit.matched, label: t.dotWith, look: "filled", cls: "n-foundations" },
                { key: "sin", count: audit.unmatched, label: t.dotWithout, look: "hollow" },
                ...(droppedCount > 0
                  ? [{ key: "fuera", count: droppedCount, label: t.dotDropped, look: "ink" as const }]
                  : []),
              ]}
            />
          </div>
          <div className="grid gap-4">
            <p className="n-body">
              {fill(F.peopleCoverage, {
                documented: integer(gov.documented, bcp47),
                entities: integer(gov.entities, bcp47),
                people: integer(gov.people, bcp47),
                ties: integer(gov.ties, bcp47),
              })}
              {gov.fromPress > 0 && ` ${fill(F.peopleCoveragePress, { press: integer(gov.fromPress, bcp47) })}`}
            </p>
            <p className="n-body">
              {fill(F.officeJoin, {
                matched: integer(audit.matched, bcp47),
                candidates: integer(audit.candidates, bcp47),
                updated: registerUpdated ?? "—",
              })}
            </p>
            <p className="n-body">
              {fill(F.officeJoinDrops, {
                unmatched: integer(audit.unmatched, bcp47),
                ambiguous: integer(audit.ambiguous.length, bcp47),
                mismatch: integer(audit.partyMismatch.length, bcp47),
              })}
            </p>
          </div>
        </div>
        <h3 className="n-h3 mt-10">{t.documentedTitle}</h3>
        <ul className="n-foundations mt-3 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {documented.map((e) => {
            const b = boards.get(e.slug)!;
            return (
              <li key={e.slug} className="border-t border-[var(--n-rule)] py-3">
                <Link href={L(`/fundacion/${e.slug}#patronato`)} className="font-bold">
                  {displayName(e.name)}
                </Link>
                <p className="n-meta mt-0.5">
                  {t.documentedLine(t.personas(b.people, integer(b.people, bcp47)), b.officers, integer(b.officers, bcp47))}
                </p>
              </li>
            );
          })}
        </ul>
        <p className="n-source">{t.boardsSource(registerUpdated)}</p>
      </Section>

      {/* ---------- The law, the register, the recommendations ---------- */}
      <Section id="ley" title={t.lawTitle}>
        <div className="grid gap-x-14 gap-y-10 lg:grid-cols-3">
          <article>
            <h3 className="n-h3">{F.legalTitle}</h3>
            <p className="n-body mt-3">{F.legalBody}</p>
            <p className="mt-3">
              <a href={FOUNDATIONS_LAW_URL}>{F.lawLink}</a>
            </p>
          </article>
          <article>
            <h3 className="n-h3">{F.registerTitle}</h3>
            <p className="n-body mt-3">{F.registerBody}</p>
            <p className="mt-3 font-bold">
              {t.tally(
                reg.exercise,
                integer(reg.registered, bcp47),
                integer(reg.total, bcp47),
                integer(reg.notRegistered, bcp47),
                reg.unstated,
                integer(reg.unstated, bcp47),
              )}
            </p>
          </article>
          <article>
            <h3 className="n-h3">{F.repeatedTitle}</h3>
            <p className="n-body mt-3">{F.repeatedBody}</p>
          </article>
        </div>
        <p className="n-source">{t.lawSource}</p>
      </Section>

      {/* ---------- What the record does not show ---------- */}
      <Section id="falta" title={t.gapsTitle}>
        <ul className="grid max-w-[60rem] gap-8">
          <li>
            <p className="text-[var(--n-ink-2)]">
              {F.gapBody} {t.gapYears}
            </p>
            <Line
              locale={locale}
              cls="n-foundations"
              className="mt-5"
              stops={lineYears.map((yr) => ({
                key: String(yr),
                label: String(yr),
                note: yr === lineYears.at(-1) ? t.today : undefined,
                on: fYears.includes(yr),
              }))}
            />
            <p className="n-meta mt-4">{t.yearsKey}</p>
          </li>
          {unlinked.length > 0 && (
            <GapItem>
              <a href="#sin-partido">{t.gapUnlinked(unlinked.length)}</a>
            </GapItem>
          )}
          {noBoard > 0 && <GapItem>{t.gapNoBoard(noBoard)}</GapItem>}
          <GapItem>{t.gapNames}</GapItem>
        </ul>
        <p className="n-source">
          {t.sourceFoot} {formatDate(data.source.approved, bcp47)}.{" "}
          <a href={data.source.url}>{data.source.report}</a>
        </p>
      </Section>

    </main>
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

/** A stated gap: dashed and hollow, like everything not on record. */
function GapItem({ children }: { children: ReactNode }) {
  return (
    <li className="border-l-[3px] border-dashed pl-4 text-[var(--n-ink-2)]" style={{ borderColor: "var(--n-ink-3)" }}>
      {children}
    </li>
  );
}
