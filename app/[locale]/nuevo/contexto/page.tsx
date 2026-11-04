import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { euro, formatDate, percent } from "@/lib/format";
import {
  AROPE_BASE,
  BOTH_SEXES,
  NATIONAL,
  jornadaSplit,
  nationalWages,
  getIndicators,
  povertyBases,
  povertyRate,
  sectorLadder,
  smiLadder,
  sourceFor,
  type SourceRef,
} from "@/lib/indicators";
import { smiForYear } from "@/lib/smi";
import Ladder from "@/components/nuevo/Ladder";
import { COPY } from "./copy";

export const revalidate = 3600;

/*
 * The redesign prototype's context page: the country the money is spent in.
 *
 * Every other page is about parties, officeholders and what they are paid, and
 * none of those figures means anything without a scale. The scale is INE's,
 * ingested by `scripts/fetch-ine.mjs` into `data/indicators.json`, plus the
 * SMI's euro value from `lib/smi.ts`, transcribed from the BOE.
 *
 * What the page deliberately does not do is join the two (PLAN-CONTEXT-LAYER
 * §0). No line from a poverty rate to a vote, no correlation, no ordering of
 * parties by anything computed here. Only one AROPE base is shown and it is
 * named; INE's low-sample flags are carried to the page; an empty cell is "—".
 * The only derived figures are ones the reader can redo from two figures cited
 * on the same screen: the sector spread, the share inside two minimum wages,
 * and the euro value of each SMI multiple.
 */

/** Context is not one of the money routes, so its line is ink, like the province page's wage scale. */
const ROUTE: CSSProperties = { ["--route" as string]: "var(--n-ink-2)" };

/** The four ECV indicators, in the order ECV itself lists them. */
const POVERTY_ROWS = [
  { id: "arope", startsWith: "Tasa de riesgo de pobreza o exclusión social", ageGroup: "Total" },
  { id: "aropeChildren", startsWith: "Tasa de riesgo de pobreza o exclusión social", ageGroup: "Menores de 16 años" },
  { id: "atRisk", startsWith: "En riesgo de pobreza", ageGroup: "Total" },
  { id: "deprivation", startsWith: "Con carencia material y social severa", ageGroup: "Total" },
] as const;

/** The regional table's columns, keyed by the start of INE's indicator name. */
const REGION_COLS = [
  { id: "arope", startsWith: "Tasa de riesgo de pobreza o exclusión social" },
  { id: "atRisk", startsWith: "En riesgo de pobreza" },
  { id: "deprivation", startsWith: "Con carencia material y social severa" },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = getDict((await params).locale);
  return { title: COPY[locale].metaTitle };
}

export default async function PrototypeContext({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const { locale, bcp47 } = getDict(localeParam);
  const t = COPY[locale];
  const L = (p: string) => `/${locale}${p}`;
  const indicators = await getIndicators();

  const money = (v: number | null | undefined) =>
    v === null || v === undefined ? "—" : euro(v, bcp47);
  const pct = (v: number | null | undefined, digits = 1) =>
    v === null || v === undefined ? "—" : percent(v / 100, bcp47, digits);
  const downloaded = t.downloaded(formatDate(indicators.generatedAt.slice(0, 10), bcp47));

  // ---------- Wages (EAES) ----------
  const sectorSrc = sourceFor(indicators, "sector");
  const pctSrc = sourceFor(indicators, "percentiles");
  const jornadaSrc = sourceFor(indicators, "jornada");
  const national = nationalWages(indicators);
  const ladder = sectorLadder(indicators);
  const allSections = indicators.wages.sector.find(
    (r) => r.sex === BOTH_SEXES && r.sector === "Todas las secciones",
  );
  const jornada = jornadaSplit(indicators);
  const full = jornada.find((j) => j.jornada.includes("completo"));
  const part = jornada.find((j) => j.jornada.includes("parcial"));
  const high = ladder[0];
  const low = ladder.at(-1);
  // The spread is the two figures printed beside it, divided; nothing else.
  const ratio =
    high?.value && low?.value
      ? (high.value / low.value).toLocaleString(bcp47, { maximumFractionDigits: 2 })
      : null;
  // The national percentiles carry INE's flag too; it is read, not assumed.
  const nationalFlagged = indicators.wages.percentiles.filter(
    (r) => r.region === NATIONAL && r.sex === BOTH_SEXES && r.lowSample,
  ).length;
  const wagesFlagged =
    ladder.filter((s) => s.lowSample).length +
    nationalFlagged +
    [full, part].filter((j) => j?.lowSample).length;

  // ---------- SMI tranches (EAES) ----------
  const smiSrc = sourceFor(indicators, "smiTranches");
  const tranches = smiLadder(indicators);
  const topTranche = Math.max(...tranches.map((r) => r.percent ?? 0));
  // The share inside two minimum wages: the two tranches the reader can see and add.
  const underTwo = tranches
    .filter((r) => r.tranche === "De 0 a 1 SMI" || r.tranche === "De 1 a 2 SMI")
    .reduce((n, r) => n + (r.percent ?? 0), 0);
  const smiYear = smiForYear(Number(smiSrc.period));
  const smiFlagged = tranches.filter((r) => r.lowSample).length;
  /** The lower boundary of an INE tranche label, parsed rather than assumed. */
  const lowerBound = (label: string): number | null => {
    const m = label.match(/^De (\d+) a \d+ SMI$/) ?? label.match(/^Más de (\d+) SMI$/);
    return m ? Number(m[1]) : null;
  };
  const rungs = tranches.map((r) => {
    const lo = lowerBound(r.tranche);
    return {
      key: r.tranche,
      station: lo === null ? undefined : t.smiStation(lo),
      stationNote:
        lo !== null && lo > 0 && smiYear ? t.smiEuro(euro(lo * smiYear.annual, bcp47)) : undefined,
      label: r.tranche,
      flag: r.lowSample ? t.lowSample : undefined,
      value: r.percent,
      text: pct(r.percent, 2),
    };
  });

  // ---------- Poverty (ECV) ----------
  const povSrc = sourceFor(indicators, "povertyNational");
  const regSrc = sourceFor(indicators, "povertyRegional");
  const bases = povertyBases(indicators);
  const povRows = POVERTY_ROWS.map((r) => ({
    id: r.id,
    // povertyRate drops an ambiguous match rather than guessing; a missing row is "—".
    row: povertyRate(indicators, {
      indicatorStartsWith: r.startsWith,
      ageGroup: r.ageGroup,
      base: AROPE_BASE,
    }),
  }));
  const arope = povRows[0].row?.percent ?? null;
  const regionalOnBase = indicators.poverty.regional.filter(
    (r) => r.base === AROPE_BASE && r.group === "Total",
  );
  const regionNames = [...new Set(regionalOnBase.map((r) => r.region))];
  const regionCell = (region: string, startsWith: string) => {
    const hits = regionalOnBase.filter(
      (r) => r.region === region && r.indicator.startsWith(startsWith),
    );
    return hits.length === 1 ? hits[0].percent : null;
  };
  const regionalArope = regionNames
    .filter((r) => r !== NATIONAL)
    .map((region) => ({ region, percent: regionCell(region, REGION_COLS[0].startsWith) }))
    .filter((r): r is { region: string; percent: number } => r.percent !== null)
    .sort((a, b) => b.percent - a.percent);
  const regionRows = [
    ...regionNames.filter((r) => r === NATIONAL),
    ...regionNames.filter((r) => r !== NATIONAL),
  ];
  const ccaaCount = regionNames.filter((r) => r !== NATIONAL).length;

  /** A table cited by name and number; its period is added only when it differs from the line's. */
  const tableLink = (s: SourceRef, period: string) => (
    <>
      <a href={s.url}>{s.name}</a> ({t.table(s.table)}
      {s.period !== period ? `, ${s.period}` : ""})
    </>
  );

  return (
    <main>
      <div className="n-shell pb-12 pt-6">
        <h1 className="n-display">{t.title}</h1>
        <p className="n-body mt-6" style={{ fontSize: "1.15rem" }}>
          {t.intro}
        </p>
        {/* The page's rule, said before any figure, at full strength. */}
        <div
          className="mt-8 max-w-[var(--n-w-read)] border-l-[5px] py-1 pl-5"
          style={{ borderColor: "var(--n-ink-2)", fontFamily: "var(--n-serif)" }}
        >
          <p className="text-[1.2rem] font-semibold">{t.framingLead}</p>
          <p className="mt-2 text-[1.05rem] leading-relaxed text-[var(--n-ink-2)]">
            {t.framingBody}
          </p>
        </div>
      </div>

      {/* ---------- Wages ---------- */}
      <Section id="salarios" title={t.wagesTitle}>
        <p className="n-finding">
          {t.wagesFinding(pctSrc.period, money(national.mean), money(national.median))}
        </p>
        <p className="n-body mt-3">{t.wagesBody(money(national.p10), money(national.p90))}</p>

        <Distribution
          national={national}
          fmt={money}
          meanLabel={t.meanLabel}
          stations={t.stations}
        />
        <p className="n-meta mt-4 max-w-[var(--n-w-read)]">{t.scaleKey}</p>

        <p className="n-body mt-8">
          {t.jornada(money(full?.value), money(part?.value))}
        </p>

        <h3 className="n-h3 mt-14">{t.sectorsTitle}</h3>
        {ratio && high && low && (
          <p className="n-finding mt-3">
            {t.sectorsFinding(ratio, high.sector, money(high.value), low.sector, money(low.value))}
          </p>
        )}
        <p className="n-meta mt-3 max-w-[var(--n-w-read)]">{t.sectorsKey}</p>
        <SectorLadder
          rows={ladder}
          reference={allSections?.value ?? null}
          referenceLabel={allSections ? t.allSections(money(allSections.value)) : null}
          fmt={money}
          caption={t.sectorsCaption}
          lowSample={t.lowSample}
        />

        <p className="n-source">
          {t.sourcesLabel} INE, {t.eaes} {sectorSrc.period}: {tableLink(sectorSrc, sectorSrc.period)},{" "}
          {tableLink(pctSrc, sectorSrc.period)}
          {t.and}
          {tableLink(jornadaSrc, sectorSrc.period)}. {t.wagesSourceTail} {downloaded}
        </p>
        <p className="n-source">
          {wagesFlagged === 0 ? t.lowSampleNone : t.lowSampleSome(wagesFlagged)}
        </p>
      </Section>

      {/* ---------- SMI tranches ---------- */}
      <Section id="smi" title={t.smiTitle}>
        <p className="n-finding">{t.smiFinding(smiSrc.period, pct(underTwo))}</p>
        <p className="n-body mt-3">
          {t.smiBody} {t.smiPeoplePre}
          <Link href={L("/nuevo/personas")}>{t.smiPeopleLink}</Link>
          {t.smiPeoplePost}
        </p>
        <p className="n-meta mt-3 max-w-[var(--n-w-read)]">
          {t.smiKey(pct(tranches.at(-1)?.percent ?? null, 2))}
        </p>
        <figure className="mt-8 max-w-[44rem]">
          <figcaption className="sr-only">{t.smiCaption}</figcaption>
          <Ladder rungs={rungs} max={topTranche} style={ROUTE} locale={locale} />
        </figure>
        <p className="n-meta max-w-[var(--n-w-read)]">
          {smiYear
            ? t.smiEuroExplain(
                String(smiYear.year),
                euro(smiYear.annual, bcp47),
                smiYear.payments,
                euro(smiYear.monthly, bcp47),
              )
            : t.smiNoEuro(smiSrc.period)}
        </p>
        <p className="n-source">
          {t.sourcesLabel} INE, {t.eaes} {smiSrc.period}: {tableLink(smiSrc, smiSrc.period)}. {downloaded}
          {smiYear && (
            <>
              {" "}
              {t.smiDecree} <a href={smiYear.boe.url}>{smiYear.boe.title}</a> (BOE,{" "}
              {smiYear.boe.id}).
            </>
          )}
        </p>
        <p className="n-source">
          {smiFlagged === 0 ? t.lowSampleNone : t.lowSampleSome(smiFlagged)}
        </p>
      </Section>

      {/* ---------- Poverty ---------- */}
      <Section id="pobreza" title={t.povertyTitle}>
        {arope !== null && (
          <p className="n-finding">{t.povertyFinding(povSrc.period, pct(arope))}</p>
        )}
        <p className="n-body mt-3">{t.povertyBody}</p>
        <ul className="mt-8 grid max-w-[44rem] gap-5" style={ROUTE}>
          {povRows.map(({ id, row }) => (
            <li key={id}>
              <p className="flex flex-wrap items-baseline justify-between gap-x-4">
                <span>{t.povertyRows[id]}</span>
                <span className="n-num font-bold whitespace-nowrap">{pct(row?.percent)}</span>
              </p>
              {/* The track is the whole population; the empty part is the rest of the country. */}
              <div
                aria-hidden
                className="mt-1.5 h-3.5 w-full overflow-hidden rounded-[2px]"
                style={{ background: "color-mix(in srgb, var(--n-rule) 45%, transparent)" }}
              >
                {row?.percent != null && (
                  <span
                    className="block h-full"
                    style={{
                      width: `${Math.min(100, row.percent).toFixed(2)}%`,
                      background: "var(--route)",
                    }}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>

        {regionalArope.length > 1 && (
          <p className="n-body mt-8">
            {t.povertySpread(
              pct(regionalArope[0].percent),
              regionalArope[0].region,
              pct(regionalArope.at(-1)!.percent),
              regionalArope.at(-1)!.region,
            )}
          </p>
        )}

        {regionRows.length > 0 && (
          <details className="mt-6" open={regionRows.length <= 16}>
            <summary className="cursor-pointer font-bold">{t.regionsSummary(ccaaCount)}</summary>
            <p className="n-meta mt-2">{t.regionsOrder}</p>
            <div className="mt-3 overflow-x-auto">
              <table className="n-table min-w-[34rem] max-w-[52rem]">
                <caption className="sr-only">{t.regionsCaption}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t.colRegion}</th>
                    <th scope="col" className="n-r">
                      {t.colArope}
                    </th>
                    <th scope="col" className="n-r">
                      {t.colAtRisk}
                    </th>
                    <th scope="col" className="n-r">
                      {t.colDeprivation}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {regionRows.map((region) => {
                    const isNational = region === NATIONAL;
                    return (
                      <tr key={region}>
                        <th scope="row" className={isNational ? "font-bold" : "font-normal"}>
                          {isNational ? t.national : region}
                        </th>
                        {REGION_COLS.map((c) => (
                          <td key={c.id} className={`n-r ${isNational ? "font-bold" : ""}`}>
                            {pct(regionCell(region, c.startsWith))}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </details>
        )}

        <p className="n-source">
          {t.sourcesLabel} INE, {t.ecv} {povSrc.period}: {tableLink(povSrc, povSrc.period)}
          {t.and}
          {tableLink(regSrc, povSrc.period)}.{" "}
          {bases.length === 1
            ? t.povertyBase(bases[0])
            : t.povertyMultipleBases(bases.join(", "), AROPE_BASE)}{" "}
          {downloaded}
        </p>
        <p className="n-body mt-6">{t.povertyNote}</p>
      </Section>

      {/* ---------- Gaps ---------- */}
      <Section id="falta" title={t.gapsTitle}>
        <ul className="grid gap-x-14 gap-y-8 lg:grid-cols-2">
          <Gap title={t.gaps.yearsTitle}>{t.gaps.years(sectorSrc.period, povSrc.period)}</Gap>
          <Gap title={t.gaps.modeTitle}>{t.gaps.mode}</Gap>
          <Gap title={t.gaps.breakdownTitle}>
            {t.gaps.breakdownPre}
            <Link href={L("/nuevo/territorios")}>{t.gaps.breakdownLink}</Link>
            {t.gaps.breakdownPost}
          </Gap>
          <Gap title={t.gaps.thresholdTitle}>{t.gaps.threshold}</Gap>
          <Gap title={t.gaps.housingTitle}>{t.gaps.housing}</Gap>
        </ul>
      </Section>
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

function Gap({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="border-t border-[var(--n-rule)] pt-4">
      <h3 className="n-h3">{title}</h3>
      <p className="n-body mt-2">{children}</p>
    </li>
  );
}

/**
 * The national distribution as a line with five stations, the percentiles INE
 * publishes, on one euro scale from zero, with the mean marked above the line.
 * Same grammar as the province page's wage scale. Every station is a published
 * figure, so every station is filled; the median, the centre, is the largest.
 */
function Distribution({
  national,
  fmt,
  meanLabel,
  stations,
}: {
  national: { mean: number; median: number; p10: number; p90: number; q1: number; q3: number };
  fmt: (v: number) => string;
  meanLabel: string;
  stations: Record<"p10" | "q1" | "median" | "q3" | "p90", { label: string; note: string }>;
}) {
  const top = Math.max(national.p90, national.mean) * 1.08;
  const x = (v: number) => `${((v / top) * 100).toFixed(2)}%`;
  const order = ["p10", "q1", "median", "q3", "p90"] as const;
  return (
    <div className="mt-8 max-w-[52rem]" style={ROUTE}>
      <div aria-hidden className="relative h-[5.5rem]">
        {/* The mean, above the line. */}
        <div
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
          style={{ left: x(national.mean) }}
        >
          <span className="n-meta whitespace-nowrap">
            {meanLabel} <span className="n-num font-bold text-[var(--n-ink)]">{fmt(national.mean)}</span>
          </span>
          <span className="mt-1 block h-[1.35rem] w-[2px]" style={{ background: "var(--route)" }} />
        </div>
        {/* Zero to the 90th percentile: a thin rule, then the line on record from p10 to p90. */}
        <span
          className="absolute left-0 right-0 top-[3.6rem] h-[2px]"
          style={{ background: "var(--n-rule)" }}
        />
        <span
          className="absolute h-[5px] rounded-full"
          style={{
            top: "calc(3.6rem - 1.5px)",
            left: x(national.p10),
            width: `calc(${x(national.p90)} - ${x(national.p10)})`,
            background: "var(--route)",
          }}
        />
        {order.map((k) => {
          const size = k === "median" ? 23 : 17;
          return (
            <span
              key={k}
              className="absolute -translate-x-1/2 rounded-full border-[3px]"
              style={{
                left: x(national[k]),
                top: `calc(3.6rem + 1px - ${size / 2}px)`,
                width: size,
                height: size,
                borderColor: "var(--route)",
                background: "var(--route)",
              }}
            />
          );
        })}
        <span className="n-meta absolute left-0 top-[4.3rem]">0 €</span>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">
        {order.map((k) => (
          <li key={k}>
            <span className="n-meta block">{stations[k].label}</span>
            <span className="n-num block font-bold">{fmt(national[k])}</span>
            <span className="n-meta block">{stations[k].note}</span>
          </li>
        ))}
        <li className="sr-only">
          {meanLabel} {fmt(national.mean)}
        </li>
      </ul>
    </div>
  );
}

/**
 * Every sector as a station on one euro scale from zero: the line runs from
 * zero to the sector's mean and ends in a filled station, because each is a
 * published figure. The mean across all sections, from the same table, is a
 * vertical rule through every row, labelled above. INE's low-sample flag is
 * printed beside the sector it belongs to.
 */
function SectorLadder({
  rows,
  reference,
  referenceLabel,
  fmt,
  caption,
  lowSample,
}: {
  rows: { sector: string; value: number | null; lowSample: boolean }[];
  reference: number | null;
  referenceLabel: string | null;
  fmt: (v: number | null) => string;
  caption: string;
  lowSample: string;
}) {
  const top = Math.max(...rows.map((r) => r.value ?? 0), reference ?? 0) * 1.04;
  const x = (v: number) => `${((v / top) * 100).toFixed(2)}%`;
  return (
    <figure className="mt-6 max-w-[52rem]" style={ROUTE}>
      <figcaption className="sr-only">{caption}</figcaption>
      {reference !== null && referenceLabel && (
        <p className="n-meta flex items-center gap-2">
          <span aria-hidden className="inline-block h-[17px] w-[2px]" style={{ background: "var(--n-ink-3)" }} />
          {referenceLabel}
        </p>
      )}
      <div className="mt-1">
        <ol>
          {rows.map((r) => (
            <li key={r.sector} className="py-2">
              <p className="flex items-baseline justify-between gap-4 text-[0.95rem]">
                <span className="min-w-0">
                  {r.sector}
                  {r.lowSample && <span className="n-meta ml-2">{lowSample}</span>}
                </span>
                <span className="n-num shrink-0 whitespace-nowrap font-bold">{fmt(r.value)}</span>
              </p>
              <div aria-hidden className="relative mt-1 h-[17px]">
                <span
                  className="absolute left-0 right-0 top-[7.5px] h-[2px]"
                  style={{ background: "color-mix(in srgb, var(--n-rule) 60%, transparent)" }}
                />
                {reference !== null && (
                  <span
                    className="absolute top-0 h-[17px] w-[2px] -translate-x-1/2"
                    style={{ left: x(reference), background: "var(--n-ink-3)" }}
                  />
                )}
                {r.value !== null && (
                  <>
                    <span
                      className="absolute left-0 top-[6px] h-[5px] rounded-l-full"
                      style={{ width: x(r.value), background: "var(--route)" }}
                    />
                    <span
                      className="absolute top-0 h-[17px] w-[17px] -translate-x-1/2 rounded-full border-[3px]"
                      style={{
                        left: x(r.value),
                        borderColor: "var(--route)",
                        background: "var(--route)",
                      }}
                    />
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}
