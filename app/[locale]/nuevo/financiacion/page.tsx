import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAggregation } from "@/lib/data";
import { filterAggregation } from "@/lib/normalize";
import { getDict } from "@/lib/i18n";
import { DONATIONS_SOURCE, donationsRanked } from "@/lib/donations";
import {
  displayName,
  entities,
  entitySlug,
  foundationYears,
  getFoundations,
} from "@/lib/foundations";
import {
  advertising,
  financial,
  formationNif,
  getSpending,
  rankedBySpending,
  spendingTotals,
} from "@/lib/spending";
import { euro, euroExact, euroM, formatDate, integer, percent } from "@/lib/format";
import type { SubsidyKind } from "@/lib/types";
import ShareBar from "@/components/nuevo/ShareBar";
import Line from "@/components/nuevo/Line";
import { formationName } from "../partido/party-records";
import { COPY } from "./copy";

export const revalidate = 3600;

/** Past this many rows a table starts folded, so the sections below stay within reach. */
const FOLD_OVER = 16;
const KINDS: SubsidyKind[] = ["ordinaria", "seguridad", "otra"];
const TRANCHES = ["small", "mid", "large"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = getDict((await params).locale);
  return { title: COPY[locale].metaTitle };
}

/**
 * The prototype's money page: the reference view behind the front page's
 * route map.
 *
 * Each route is a section, opened by its stretch of line (where the money
 * comes from, where it goes, and the rules the law sets on it), then the one
 * sentence its figures show, the graphic, the table a reader looks things up
 * in, what the route does not show, and its source.
 *
 * Nothing is added across years or across sets of parties. The state register
 * is shown year by year, because each year is shared among a different set of
 * parties; the foundation audit is shown exercise by exercise for the same
 * reason. The current page's cumulative subsidy total is therefore not printed
 * here.
 */
export default async function PrototypeMoney({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const [agg, foundations, spend] = await Promise.all([
    getAggregation(),
    getFoundations(),
    getSpending(),
  ]);
  const { locale, bcp47, t: dict } = getDict(localeParam);
  const t = COPY[locale];
  const L = (path: string) => `/${locale}${path}`;
  const pct = (n: number) => percent(n, bcp47, 0);
  /** A share that may be tiny: one decimal under 10 %, and "less than 1 %" rather than "0 %". */
  const share = (n: number) =>
    n > 0 ? t.shareWords(n < 0.01, percent(n, bcp47, n < 0.1 ? 1 : 0)) : "—";
  const big = (n: number) => (n >= 1_000_000 ? euroM(n, bcp47, 1) : euro(n, bcp47));
  const exact = (n: number) => (n > 0 ? euroExact(n, bcp47) : "—");
  const listFmt = new Intl.ListFormat(bcp47, { type: "conjunction" });
  /** A source date stored as ISO or as DD/MM/YYYY. */
  const date = (d: string) => {
    const dmy = d.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    return formatDate(dmy ? `${dmy[3]}-${dmy[2]}-${dmy[1]}` : d.slice(0, 10), bcp47);
  };

  // Only parties in the subsidy register have a hub in the prototype; any other
  // NIF would land on a 404, so it is shown as text.
  const hub = new Map(agg.parties.map((p) => [p.nif, p]));
  const partyHref = (nif: string | null | undefined) =>
    nif && hub.has(nif) ? L(`/nuevo/partido/${nif}`) : null;

  // ---------- The State, year by year ----------
  const thisYear = new Date().getFullYear();
  const years = [...agg.years].sort((a, b) => a - b);
  const perYear = years.map((y) => {
    const a = filterAggregation(agg, { years: [y] });
    return {
      year: y,
      current: y === thisYear,
      total: a.grandTotal,
      parties: a.parties,
      grants: a.parties.reduce((s, p) => s + p.grants.length, 0),
    };
  });
  const latestState = perYear[perYear.length - 1];
  const maxYear = Math.max(...perYear.map((y) => y.total), 1);
  const partyCounts = perYear.map((y) => y.parties.length);
  const kindsShown = KINDS.filter((k) => perYear.some((y) => y.parties.some((p) => p.byKind[k] > 0)));
  const top3 = latestState.parties.slice(0, 3);
  const top3Total = top3.reduce((s, p) => s + p.total, 0);
  const stateFinding = t.stateFinding(
    latestState.current,
    latestState.year,
    big(latestState.total),
    integer(latestState.parties.length, bcp47),
    listFmt.format(top3.map((p) => p.shortName)),
    pct(top3Total / latestState.total),
  );

  // ---------- Donations, one financial year ----------
  const donations = donationsRanked();
  const tranche = (k: (typeof TRANCHES)[number], m: "donors" | "amount") =>
    donations.reduce((s, r) => s + r[k][m], 0);
  const trancheLabel = {
    small: dict.donationsTable.trancheSmall,
    mid: dict.donationsTable.trancheMid,
    large: dict.donationsTable.trancheLarge,
  };
  const donationsFinding = dict.money.donationsFinding
    .replace("{donorShare}", pct(tranche("small", "donors") / DONATIONS_SOURCE.grandDonors))
    .replace("{amountShare}", pct(tranche("small", "amount") / DONATIONS_SOURCE.grandTotal));
  const maxDonation = Math.max(...donations.map((d) => d.total.amount), 1);

  // ---------- Foundations, exercise by exercise ----------
  const fYears = foundationYears(foundations);
  const fYearSpan =
    fYears.length > 1
      ? t.yearsAnd(String(fYears[0]), String(fYears[fYears.length - 1]))
      : String(fYears[0] ?? "—");
  const nifBySlug = new Map(entities(foundations).map((e) => [e.slug, e.partyNif]));
  const fByYear = [...fYears].reverse().map((y) => {
    const s = foundations.years[String(y)];
    const rows = foundations.dossiers
      .filter((d) => d.exercise === y)
      .map((d) => {
        const slug = entitySlug(d.name);
        const nif = nifBySlug.get(slug) ?? null;
        const parts = {
          party: d.contributions.party.amount,
          companies: d.contributions.companies.amount,
          individuals: d.contributions.individuals.amount,
          subsidies: d.subsidies.total,
        };
        return {
          d,
          slug,
          href: partyHref(nif),
          partyShort: nif ? hub.get(nif)?.shortName : undefined,
          ...parts,
          total: parts.party + parts.companies + parts.individuals + parts.subsidies,
        };
      })
      .sort((a, b) => b.total - a.total || a.d.name.localeCompare(b.d.name, "es"));
    return { year: y, s, rows };
  });
  const latestF = fByYear[0];
  const unlinkedF = latestF.rows.filter((r) => !r.href).length;
  const maxEntity = Math.max(...fByYear.flatMap((y) => y.rows.map((r) => r.total)), 1);

  // ---------- Campaign, one election ----------
  const totals = spendingTotals(spend);
  const ranked = rankedBySpending(spend);
  const maxFormation = ranked[0]?.ordinary.declared || 1;

  const summary = [
    {
      id: "reparto",
      cls: "n-state",
      label: t.sumState,
      value: big(latestState.total),
      note: t.sumStateNote(latestState.year, latestState.current, integer(latestState.parties.length, bcp47)),
    },
    {
      id: "donaciones",
      cls: "n-donors",
      label: t.sumDonations,
      value: big(DONATIONS_SOURCE.grandTotal),
      note: t.sumDonationsNote(DONATIONS_SOURCE.year, integer(DONATIONS_SOURCE.grandDonors, bcp47)),
    },
    {
      id: "fundaciones",
      cls: "n-foundations",
      label: t.sumFoundations,
      value: big(latestF.s.contributions),
      note: t.sumFoundationsNote(latestF.year),
    },
    {
      id: "campana",
      cls: "n-neutral",
      label: t.sumCampaign,
      value: big(totals.declared),
      note: t.sumCampaignNote,
    },
  ];

  return (
    <main>
      <div className="n-shell pb-10 pt-6">
        <p className="n-meta">
          <Link href={L("/nuevo")}>{t.breadcrumb}</Link>
        </p>
        <h1 className="n-display mt-3" style={{ maxWidth: "22ch" }}>
          {t.title}
        </h1>
        <p className="n-body mt-6" style={{ fontSize: "1.15rem" }}>
          {t.intro}
        </p>
        <p className="n-finding mt-8">
          {t.finding(latestState.year, DONATIONS_SOURCE.year, fYearSpan)}
        </p>

        <dl className="mt-10 grid gap-px overflow-hidden rounded-[6px] border border-[var(--n-rule)] bg-[var(--n-rule)] sm:grid-cols-2 lg:grid-cols-4">
          {summary.map((s) => (
            <div key={s.id} className={`${s.cls} bg-[var(--n-card)] p-5`}>
              <dt className="n-label flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block h-[5px] w-6 rounded-full"
                  style={{ background: "var(--route)" }}
                />
                {s.label}
              </dt>
              <dd className="n-figure n-route-text mt-3" style={{ fontSize: "1.9rem" }}>
                {s.value}
              </dd>
              <dd className="n-meta mt-2">{s.note}</dd>
              <dd className="mt-2 text-[0.9rem]">
                <a href={`#${s.id}`}>
                  {t.goTo}
                  <span className="sr-only">: {s.label}</span>
                </a>
              </dd>
            </div>
          ))}
        </dl>
        <p className="n-meta mt-3 max-w-[60em]">{t.noSum}</p>
      </div>

      {/* ---------- The State ---------- */}
      <Section id="reparto" title={t.stateTitle} cls="n-state">
        <RouteHead
          from={t.stateFrom}
          to={t.stateTo}
          rules={dict.money.routeStateRules}
          rulesLabel={t.rulesLabel}
          sr={t.routeSr(t.stateFrom, t.stateTo)}
        />
        <p className="n-finding mt-8">{stateFinding}</p>

        <div className="mt-8 grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
          <div>
            <h3 className="n-h3">{t.byYear}</h3>
            {/* Columns and stations share one grid, so each bar stands over its year. */}
            <div
              aria-hidden
              className="mt-5 grid h-40 items-end"
              style={{ gridTemplateColumns: `repeat(${perYear.length}, minmax(0, 1fr))` }}
            >
              {perYear.map((y) => (
                <div key={y.year} className="flex h-full flex-col items-center justify-end px-[18%]">
                  <span
                    className="w-full rounded-t-[2px]"
                    style={{
                      height: `${Math.max((y.total / maxYear) * 100, 2)}%`,
                      background: "var(--route)",
                    }}
                  />
                </div>
              ))}
            </div>
            <Line
              locale={locale}
              cls="n-state"
              className="mt-1"
              stops={perYear.map((y) => ({
                key: String(y.year),
                label: String(y.year),
                note: `${big(y.total)}${y.current ? `, ${t.currentYear}` : ""}`,
                on: y.total > 0,
              }))}
            />
            <p className="n-meta mt-4">
              {t.yearsNoSum(
                integer(Math.min(...partyCounts), bcp47),
                integer(Math.max(...partyCounts), bcp47),
              )}
            </p>
          </div>
          <div>
            <h3 className="n-h3">{t.shareTitle(latestState.year)}</h3>
            <ShareBar
              locale={locale}
              className="mt-5"
              parts={[
                ...top3.map((p) => ({ label: p.shortName, value: p.total })),
                {
                  label: t.others(latestState.parties.length - top3.length),
                  value: latestState.total - top3Total,
                  muted: true,
                },
              ]}
              format={(v) => share(v / latestState.total)}
            />
            <p className="n-meta mt-4">{t.shareNote}</p>
          </div>
        </div>

        <h3 className="n-h3 mt-12">{t.tablesTitle}</h3>
        <div className="mt-2">
          {[...perYear].reverse().map((y) => (
            <Fold
              key={y.year}
              rows={y.parties.length}
              summary={t.yearSummary(
                y.year,
                y.current,
                integer(y.parties.length, bcp47),
                integer(y.grants, bcp47),
                big(y.total),
              )}
            >
              <table className="n-table min-w-[40rem]">
                <caption className="sr-only">{t.stateCaption(y.year)}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t.thParty}</th>
                    {kindsShown.map((k) => (
                      <th key={k} scope="col" className="n-r">
                        {dict.kinds[k]}
                      </th>
                    ))}
                    <th scope="col" className="n-r">
                      {t.thYearTotal}
                    </th>
                    <th scope="col" className="n-r">
                      {t.thYearShare}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {y.parties.map((p) => (
                    <tr key={p.nif}>
                      <th scope="row" className="font-normal">
                        <Link href={L(`/nuevo/partido/${p.nif}`)}>{p.shortName}</Link>
                      </th>
                      {kindsShown.map((k) => (
                        <td key={k} className="n-r">
                          <Amount value={p.byKind[k]} fmt={exact} none={t.noneOfKind} />
                        </td>
                      ))}
                      <td className="n-r font-bold">{euroExact(p.total, bcp47)}</td>
                      <td className="n-r">{share(p.total / y.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Fold>
          ))}
        </div>

        <Gaps title={t.gapsTitle}>
          {[...t.stateGaps, t.stateIncomeGap(L("/nuevo/partidos"))]}
        </Gaps>
        <p className="n-source">
          {t.stateSource(agg.source.url, formatDate(agg.generatedAt.slice(0, 10), bcp47))}
        </p>
      </Section>

      {/* ---------- Donations ---------- */}
      <Section id="donaciones" title={t.donationsTitle} cls="n-donors">
        <RouteHead
          from={dict.money.routeDonorFrom}
          to={dict.money.routePartyTo}
          rules={dict.money.routeDonorRules}
          rulesLabel={t.rulesLabel}
          sr={t.routeSr(dict.money.routeDonorFrom, dict.money.routePartyTo)}
        />
        <p className="n-finding mt-8">{donationsFinding}</p>

        <div className="mt-8 grid gap-x-14 gap-y-10 lg:grid-cols-2">
          <div>
            <h3 className="n-h3">{t.moneyByTranche}</h3>
            <ShareBar
              locale={locale}
              className="mt-5"
              parts={TRANCHES.map((k) => ({ label: trancheLabel[k], value: tranche(k, "amount") }))}
              format={(v) => `${big(v)}, ${share(v / DONATIONS_SOURCE.grandTotal)}`}
            />
          </div>
          <div>
            <h3 className="n-h3">{t.donorsByTranche}</h3>
            <ShareBar
              locale={locale}
              className="mt-5"
              parts={TRANCHES.map((k) => ({ label: trancheLabel[k], value: tranche(k, "donors") }))}
              format={(v) => `${integer(v, bcp47)}, ${share(v / DONATIONS_SOURCE.grandDonors)}`}
            />
          </div>
        </div>

        <h3 className="n-h3 mt-12">{t.donationsTableTitle}</h3>
        <div className="mt-2">
          <Fold
            rows={donations.length}
            summary={t.donationsSummary(integer(donations.length, bcp47), DONATIONS_SOURCE.year)}
          >
            <table className="n-table min-w-[52rem]">
              <caption className="sr-only">{t.donationsCaption(DONATIONS_SOURCE.year)}</caption>
              <thead>
                <tr>
                  <th scope="col">{dict.donationsTable.party}</th>
                  <th scope="col" className="w-[9rem]">
                    {dict.donationsTable.byTranche}
                  </th>
                  {TRANCHES.map((k) => (
                    <th key={k} scope="col" className="n-r">
                      {trancheLabel[k]}
                    </th>
                  ))}
                  <th scope="col" className="n-r">
                    {dict.donationsTable.total}
                  </th>
                  <th scope="col" className="n-r">
                    {dict.donationsTable.donors}
                  </th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => {
                  const href = partyHref(d.nif);
                  return (
                    <tr key={d.label}>
                      <th scope="row" className="font-normal">
                        {href ? <Link href={href}>{d.label}</Link> : d.label}
                      </th>
                      <td>
                        <StackBar
                          max={maxDonation}
                          parts={TRANCHES.map((k, i) => ({ value: d[k].amount, strength: [100, 62, 38][i] }))}
                        />
                      </td>
                      {TRANCHES.map((k) => (
                        <td key={k} className="n-r">
                          {exact(d[k].amount)}
                          {d[k].donors > 0 && (
                            <span className="n-meta block">
                              {t.donorsCount(d[k].donors, integer(d[k].donors, bcp47))}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="n-r font-bold">{euroExact(d.total.amount, bcp47)}</td>
                      <td className="n-r">{integer(d.total.donors, bcp47)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Fold>
        </div>
        <p className="n-meta mt-3">
          {dict.donationsTable.tranchesNote} {t.barKey}
        </p>

        <Gaps title={t.gapsTitle}>
          {[...t.donationsGaps(DONATIONS_SOURCE.year), dict.donationsTable.legalNote]}
        </Gaps>
        <p className="n-source">
          {t.donationsSource(DONATIONS_SOURCE.url, DONATIONS_SOURCE.year, date(DONATIONS_SOURCE.approved))}
        </p>
      </Section>

      {/* ---------- Foundations ---------- */}
      <Section id="fundaciones" title={t.foundationsTitle} cls="n-foundations">
        <RouteHead
          from={t.foundationsFrom}
          to={dict.money.routeFoundationTo}
          rules={dict.money.routeFoundationRules}
          rulesLabel={t.rulesLabel}
          sr={t.routeSr(t.foundationsFrom, dict.money.routeFoundationTo)}
        />
        <p className="n-finding mt-8">
          {t.foundationsFinding(
            latestF.year,
            integer(latestF.s.entities, bcp47),
            pct(latestF.s.party / latestF.s.contributions),
            share(latestF.s.companies / latestF.s.contributions),
          )}
        </p>

        <h3 className="n-h3 mt-8">{t.foundationsByYear}</h3>
        <div className="mt-5 grid gap-x-14 gap-y-10 lg:grid-cols-2">
          {[...fByYear].reverse().map(({ year, s }) => (
            <div key={year}>
              <p className="font-bold">
                {t.foundationsYearLine(year, big(s.contributions), integer(s.entities, bcp47))}
              </p>
              <ShareBar
                locale={locale}
                className="mt-3"
                parts={[
                  { label: dict.foundations.fromParty, value: s.party },
                  { label: dict.foundations.fromCompanies, value: s.companies },
                  { label: dict.foundations.fromIndividuals, value: s.individuals },
                ]}
                format={(v) => `${big(v)}, ${share(v / s.contributions)}`}
              />
              <p className="n-meta mt-3">{t.foundationsSubsidies(big(s.subsidies))}</p>
            </div>
          ))}
        </div>
        <p className="n-meta mt-5">
          {t.foundationsNoSum(
            listFmt.format(
              [...fByYear].reverse().map(({ year, s }) => t.entitiesIn(integer(s.entities, bcp47), year)),
            ),
          )}
        </p>

        <h3 className="n-h3 mt-12">{t.foundationsTablesTitle}</h3>
        <div className="mt-2">
          {fByYear.map(({ year, rows }) => (
            <Fold
              key={year}
              rows={rows.length}
              summary={t.foundationsSummary(year, integer(rows.length, bcp47))}
            >
              <table className="n-table min-w-[56rem]">
                <caption className="sr-only">{t.foundationsCaption(year)}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t.thEntity}</th>
                    <th scope="col">{t.thParty}</th>
                    <th scope="col" className="w-[7rem]">
                      <span className="sr-only">{t.thTotal}</span>
                    </th>
                    <th scope="col" className="n-r">
                      {dict.foundations.fromParty}
                    </th>
                    <th scope="col" className="n-r">
                      {dict.foundations.fromCompanies}
                    </th>
                    <th scope="col" className="n-r">
                      {dict.foundations.fromIndividuals}
                    </th>
                    <th scope="col" className="n-r">
                      {dict.foundations.publicSubsidies}
                    </th>
                    <th scope="col" className="n-r">
                      {t.thTotal}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.d.section + r.d.name}>
                      <th scope="row" className="font-normal">
                        <Link href={L(`/nuevo/fundacion/${r.slug}`)}>{displayName(r.d.name)}</Link>
                      </th>
                      <td>
                        {r.href ? (
                          <Link href={r.href}>{r.partyShort}</Link>
                        ) : r.d.partyLinked ? (
                          <span className="n-meta">{r.d.partyLinked}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <StackBar
                          max={maxEntity}
                          parts={[
                            { value: r.party, strength: 100 },
                            { value: r.companies, strength: 62 },
                            { value: r.individuals, strength: 38 },
                            { value: r.subsidies, muted: true },
                          ]}
                        />
                      </td>
                      <td className="n-r">{exact(r.party)}</td>
                      <td className="n-r">{exact(r.companies)}</td>
                      <td className="n-r">{exact(r.individuals)}</td>
                      <td className="n-r">{exact(r.subsidies)}</td>
                      <td className="n-r font-bold">{exact(r.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Fold>
          ))}
        </div>
        <p className="n-meta mt-3">
          {t.foundationsBarKey} {t.barKey}
        </p>

        <Gaps title={t.gapsTitle}>
          {[
            ...t.foundationsGaps(
              formatDate(foundations.register.asOf, bcp47),
              integer(foundations.register.foundationsRegistered, bcp47),
              integer(foundations.register.entitiesRegistered, bcp47),
              unlinkedF,
              integer(unlinkedF, bcp47),
              latestF.year,
            ),
            t.foundationsDealsGap(L("/fundaciones")),
          ]}
        </Gaps>
        <p className="n-source">
          {t.foundationsSource(foundations.source.url, date(foundations.source.approved))}
        </p>
      </Section>

      {/* ---------- Campaign spending ---------- */}
      <Section id="campana" title={t.campaignTitle} cls="n-neutral">
        <RouteHead
          from={t.campaignFrom}
          to={t.campaignTo}
          rules={t.campaignRules}
          rulesLabel={t.rulesLabel}
          sr={t.routeSr(t.campaignFrom, t.campaignTo)}
        />
        <p className="n-finding mt-8">{t.campaignFinding(pct(totals.otherShare))}</p>

        {/* The three lines partition declared ordinary spending exactly, so the
            bar is one whole; the unitemised line is hatched, never told apart
            by shade alone. Mailings sit outside that total and are said apart. */}
        <div className="mt-8">
          <h3 className="n-h3">
            {t.campaignTotal(big(totals.declared), integer(spend.formations.length, bcp47))}
          </h3>
          <div aria-hidden className="mt-5 flex h-7 w-full gap-[2px] overflow-hidden rounded-[3px]">
            <span style={{ flexGrow: totals.advertising, flexBasis: 0, minWidth: 3, background: "var(--n-ink-2)" }} />
            <span
              style={{
                flexGrow: totals.financial,
                flexBasis: 0,
                minWidth: 3,
                background: "color-mix(in srgb, var(--n-ink-2) 45%, var(--n-bg))",
              }}
            />
            <span
              className="n-hatch"
              style={{ flexGrow: totals.other, flexBasis: 0, outline: "1px solid var(--n-ink-3)", outlineOffset: -1 }}
            />
          </div>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              {
                key: "ads",
                label: dict.spending.lineAdvertising,
                note: dict.spending.lineAdvertisingNote,
                value: totals.advertising,
                swatch: { background: "var(--n-ink-2)" },
                hatch: false,
              },
              {
                key: "fin",
                label: dict.spending.lineFinancial,
                note: dict.spending.lineFinancialNote,
                value: totals.financial,
                swatch: { background: "color-mix(in srgb, var(--n-ink-2) 45%, var(--n-bg))" },
                hatch: false,
              },
              {
                key: "other",
                label: dict.spending.lineResidual,
                note: dict.spending.lineResidualNote,
                value: totals.other,
                swatch: { outline: "1px solid var(--n-ink-3)", outlineOffset: -1 },
                hatch: true,
              },
            ].map((l) => (
              <li key={l.key}>
                <p className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className={`mt-[0.3em] inline-block h-3 w-3 shrink-0 rounded-[2px] ${l.hatch ? "n-hatch" : ""}`}
                    style={l.swatch}
                  />
                  <span>
                    {l.label}{" "}
                    <span className="n-num font-bold">
                      {big(l.value)}, {share(l.value / totals.declared)}
                    </span>
                  </span>
                </p>
                <p className="n-meta mt-1 pl-5">{l.note}</p>
              </li>
            ))}
          </ul>
          <p className="n-body mt-5">
            {t.mailingsLine(big(totals.mailings), integer(totals.mailingCount, bcp47))}
          </p>
        </div>

        <h3 className="n-h3 mt-12">{t.campaignTableTitle}</h3>
        <div className="mt-2">
          <Fold rows={ranked.length} summary={t.campaignTableTitle}>
            <table className="n-table min-w-[60rem]">
              <caption className="sr-only">{t.campaignCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.thFormation}</th>
                  <th scope="col" className="w-[8rem]">
                    {t.thSplit}
                  </th>
                  <th scope="col" className="n-r">
                    {t.thDeclared}
                  </th>
                  <th scope="col" className="n-r">
                    {t.thShareOfAll}
                  </th>
                  <th scope="col" className="n-r">
                    {t.thAdvertising}
                  </th>
                  <th scope="col" className="n-r">
                    {t.thFinancial}
                  </th>
                  <th scope="col" className="n-r">
                    {t.thUnitemised}
                  </th>
                  <th scope="col" className="n-r">
                    {t.thMailings}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((f) => {
                  const href = partyHref(formationNif(f.name));
                  const o = f.ordinary;
                  return (
                    <tr key={f.name}>
                      <th scope="row" className="font-normal">
                        {href ? <Link href={href}>{formationName(f.name)}</Link> : formationName(f.name)}
                      </th>
                      <td>
                        <StackBar
                          max={maxFormation}
                          parts={[
                            { value: advertising(f), strength: 100 },
                            { value: financial(f), strength: 45 },
                            { value: o.otherOrdinary, hatch: true },
                          ]}
                          ink
                        />
                      </td>
                      <td className="n-r font-bold">{euroExact(o.declared, bcp47)}</td>
                      <td className="n-r">{share(o.declared / totals.declared)}</td>
                      <td className="n-r">{exact(advertising(f))}</td>
                      <td className="n-r">{exact(financial(f))}</td>
                      <td className="n-r">
                        {exact(o.otherOrdinary)}
                        {o.declared > 0 && o.otherOrdinary > 0 && (
                          <span className="n-meta block">{share(o.otherOrdinary / o.declared)}</span>
                        )}
                      </td>
                      <td className="n-r">{exact(f.mailings.totalJustified)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Fold>
        </div>
        <p className="n-meta mt-3">
          {t.coalitionNote} {t.barKey}
        </p>

        <Gaps title={t.gapsTitle}>{[dict.spending.gapBody]}</Gaps>
        <p className="n-source">{t.campaignSource(spend.source.url, date(spend.source.approved))}</p>
      </Section>

      {/* ---------- What the page does not show ---------- */}
      <section className="n-shell n-section" aria-labelledby="falta-t">
        <h2 id="falta-t" className="n-h2">
          {t.pageGapsTitle}
        </h2>
        <ul className="n-body mt-5 grid list-disc gap-3 pl-5">
          {t.pageGaps.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Section({
  id,
  title,
  cls,
  children,
}: {
  id: string;
  title: string;
  cls: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`${cls} n-shell n-section scroll-mt-6`} aria-labelledby={`${id}-t`}>
      <h2 id={`${id}-t`} className="n-h2">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * The route's own stretch of the front page's map: where the money comes from,
 * a solid line in the route's colour (money on record), where it goes, and the
 * rules the law sets on it. Read as one sentence by a screen reader.
 */
function RouteHead({
  from,
  to,
  rules,
  rulesLabel,
  sr,
}: {
  from: string;
  to: string;
  rules: string[];
  rulesLabel: string;
  sr: string;
}) {
  const station = (
    <span
      aria-hidden
      className="relative z-[1] h-[23px] w-[23px] shrink-0 rounded-full border-[3px]"
      style={{ borderColor: "var(--route)", background: "var(--route)" }}
    />
  );
  return (
    <div className="mt-6">
      <p className="sr-only">{sr}</p>
      <div aria-hidden>
        <div className="flex items-center">
          {station}
          <span className="h-[5px] flex-1" style={{ background: "var(--route)" }} />
          {station}
        </div>
        <div className="mt-2 flex justify-between gap-6">
          <span className="max-w-[14rem] text-[0.95rem] font-bold leading-tight">{from}</span>
          <span className="max-w-[14rem] text-right text-[0.95rem] font-bold leading-tight">{to}</span>
        </div>
      </div>
      <p className="n-label mt-5">{rulesLabel}</p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {rules.map((r) => (
          <li
            key={r}
            className="rounded-full border border-[var(--n-rule-strong)] px-3 py-1 text-[0.875rem] leading-snug text-[var(--n-ink-2)]"
          >
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** What a route does not show, stated on the page rather than left out. */
function Gaps({ title, children }: { title: string; children: ReactNode[] }) {
  return (
    <div className="mt-10 border-l-[3px] border-dashed border-[var(--n-ink-3)] pl-5">
      <h3 className="n-h3">{title}</h3>
      <ul className="n-body mt-3 grid list-disc gap-2 pl-5 text-[0.95rem]">
        {children.map((g, i) => (
          <li key={i}>{g}</li>
        ))}
      </ul>
    </div>
  );
}

/** A table that starts folded when it is long; short ones are shown as they are. */
function Fold({ rows, summary, children }: { rows: number; summary: string; children: ReactNode }) {
  const table = <div className="mt-4 overflow-x-auto">{children}</div>;
  if (rows <= FOLD_OVER) return <div className="mt-4">{table}</div>;
  return (
    <details className="border-t border-[var(--n-rule)] py-3">
      <summary className="cursor-pointer font-bold">{summary}</summary>
      {table}
    </details>
  );
}

/** A figure, or "—" with its meaning said for screen readers. */
function Amount({ value, fmt, none }: { value: number; fmt: (n: number) => string; none: string }) {
  if (value > 0) return <>{fmt(value)}</>;
  return (
    <>
      <span aria-hidden>—</span>
      <span className="sr-only">{none}</span>
    </>
  );
}

/**
 * A row's parts as one small stacked bar, scaled against the table's largest
 * row. Decorative: every part's figure is in the row's own cells.
 */
function StackBar({
  parts,
  max,
  ink = false,
}: {
  parts: { value: number; strength?: number; muted?: boolean; hatch?: boolean }[];
  max: number;
  /** Ink rather than the route colour, for money that is not on a route (campaign spending). */
  ink?: boolean;
}) {
  const total = parts.reduce((s, p) => s + Math.max(0, p.value), 0);
  if (total <= 0) return <span aria-hidden className="n-meta">—</span>;
  const base = ink ? "var(--n-ink-2)" : "var(--route)";
  return (
    <div aria-hidden className="mt-[0.35em] flex h-2.5 gap-[1px]" style={{ width: `${Math.max((total / max) * 100, 2)}%` }}>
      {parts.map((p, i) =>
        p.value > 0 ? (
          <span
            key={i}
            className={p.hatch ? "n-hatch" : ""}
            style={{
              flexGrow: p.value,
              flexBasis: 0,
              minWidth: 2,
              background: p.hatch
                ? undefined
                : p.muted
                  ? "var(--n-rule-strong)"
                  : `color-mix(in srgb, ${base} ${p.strength ?? 100}%, var(--n-bg))`,
              outline: p.hatch ? "1px solid var(--n-ink-3)" : undefined,
              outlineOffset: p.hatch ? -1 : undefined,
            }}
          />
        ) : null,
      )}
    </div>
  );
}
