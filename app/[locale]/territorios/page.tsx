import type { CSSProperties } from "react";
import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { getProvinces } from "@/lib/provinces";
import { getHateTerritory, getRegions } from "@/lib/regions";
import { TERRITORIES } from "@/lib/territories";
import { getDeclarations } from "@/lib/declarations";
import { getSalaries, SALARIES_SOURCE_URL } from "@/lib/salaries";
import { caName, deputiesByProvince, declarationState, type DeclarationState } from "@/lib/constituencies";
import { GOVERNMENTS, GOVERNMENTS_SOURCE } from "@/lib/governments";
import { euroExact, formatDate, integer, percent, rate } from "@/lib/format";
import RegionMap from "@/components/nuevo/RegionMap";
import ShareBar from "@/components/nuevo/ShareBar";
import InvestitureRecord, { StatusMark, shownInvestitures } from "@/components/nuevo/InvestitureRecord";
import { INVESTITURE_COPY } from "@/components/nuevo/investiture-copy";
import { COPY } from "./copy";

export const revalidate = 3600;

/**
 * The redesign prototype's index of places.
 *
 * A reader arrives with a place, not a dataset: so the page lists the 52
 * provinces, grouped by the comunidad each sits in, and puts on each one the
 * deputies it elects, one dot each, in the state of their asset declaration.
 * The map is for finding a comunidad, and encodes nothing.
 *
 * Under the list, the one comparison the record supports between comunidades:
 * how many officeholders the register places in each, and what the published
 * figures are. It is a count of the register's rows, and the page says so,
 * because the register does not cover every comunidad's posts alike.
 *
 * Then what the old /mapa page carried, comunidad by comunidad: who holds each
 * presidency, how the PP presidencies in the investiture record were invested,
 * and the hate incidents the Interior ministry's report places in each. The
 * old page drew the first and the last as two layers of one map and never
 * joined them; here they are separate sections, and still never joined. The map
 * at the top stays unencoded: the figures are in bars and tables, where they
 * can be read to the precision of a number.
 */

const LOOK: Record<DeclarationState, { cls?: string; style: CSSProperties }> = {
  securities: {
    cls: "n-companies",
    style: { background: "var(--route)", border: "2px solid var(--route)" },
  },
  transcribed: {
    style: { background: "var(--n-ink-2)", border: "2px solid var(--n-ink-2)" },
  },
  pending: {
    style: { background: "transparent", border: "2px solid var(--n-ink-3)" },
  },
  none: {
    style: { background: "transparent", border: "2px dashed var(--n-ink-3)" },
  },
};
const ORDER: DeclarationState[] = ["securities", "transcribed", "pending", "none"];

function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export default async function PrototypePlaces({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const { locale, bcp47 } = getDict(localeParam);
  const t = COPY[locale];
  const [{ provinces }, regions, decl, salaries, join, hate] = await Promise.all([
    getProvinces(),
    getRegions(),
    getDeclarations(),
    getSalaries(),
    deputiesByProvince(),
    getHateTerritory(),
  ]);
  const ti = INVESTITURE_COPY[locale];
  const L = (path: string) => `/${locale}${path}`;
  const n = (x: number) => integer(x, bcp47);
  const listFmt = new Intl.ListFormat(bcp47, { type: "conjunction" });

  // Each province with its deputies' declaration states, in the dot order.
  const rows = provinces.map((p) => {
    const deputies = join.byProvince.get(p.slug) ?? [];
    const states = deputies
      .map((d) => declarationState(d, decl.declarations))
      .sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
    return { province: p, deputies, states };
  });
  const seats = rows.reduce((s, r) => s + r.deputies.length, 0);
  const most = [...rows].sort((a, b) => b.deputies.length - a.deputies.length)[0];
  const fewest = Math.min(...rows.map((r) => r.deputies.length));
  const fewestNames = rows.filter((r) => r.deputies.length === fewest).map((r) => r.province.name);

  // Provinces whose filed declarations are all read, and those with none read yet.
  const filedIn = (r: (typeof rows)[number]) => r.states.filter((s) => s !== "none").length;
  const readIn = (r: (typeof rows)[number]) =>
    r.states.filter((s) => s === "securities" || s === "transcribed").length;
  const allRead = rows.filter((r) => filedIn(r) > 0 && readIn(r) === filedIn(r)).length;
  const noneRead = rows.filter((r) => filedIn(r) > 0 && readIn(r) === 0).length;
  const counts = ORDER.map((k) => ({ k, count: rows.reduce((s, r) => s + r.states.filter((x) => x === k).length, 0) }));

  // Comunidades, alphabetically, each with its provinces.
  const byTerritory = TERRITORIES.map((t) => ({
    territory: t,
    name: caName(t.id, t.mapName),
    rows: rows.filter((r) => r.province.territoryId === t.id),
  }))
    .filter((g) => g.rows.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
  const single = new Map(byTerritory.filter((g) => g.rows.length === 1).map((g) => [g.territory.id, g.rows[0].province.slug]));
  const territorySeats = new Map(byTerritory.map((g) => [g.territory.id, g.rows.reduce((s, r) => s + r.deputies.length, 0)]));

  // The register, by comunidad.
  const register = TERRITORIES.map((t) => {
    const here = salaries.people.filter((p) => p.region === t.registerName);
    const paid = here.filter((p) => p.gross > 0).map((p) => p.gross);
    return { territory: t, name: caName(t.id, t.mapName), count: here.length, paid: paid.length, median: median(paid) };
  }).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"));
  const unlocated = salaries.people.filter((p) => !p.region).length;
  const maxCount = Math.max(unlocated, ...register.map((r) => r.count));
  const top = register[0];

  const plural = (x: number, forms: [string, string]) => `${n(x)} ${x === 1 ? forms[0] : forms[1]}`;
  const lookLabel = (k: DeclarationState, one: boolean) => (one ? (t.look[k].one ?? t.look[k].label) : t.look[k].label);

  // ---------- Who presides each comunidad, and how it was invested ----------
  const hrefFor = (id: string) => (single.has(id) ? L(`/territorio/${single.get(id)}`) : `#ca-${id}`);
  const investitures = shownInvestitures();
  const invById = new Map(investitures.map((f) => [f.investiture.id, f]));
  const govRows = regions.regions
    .map((r) => ({
      id: r.id,
      name: caName(r.id, r.name),
      legal: r.name,
      gov: GOVERNMENTS.find((g) => g.id === r.id) ?? null,
      inv: invById.get(r.id) ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
  // Presidencies by party label, as the list records it: PSOE, PSC and
  // PSN-PSOE are kept apart, because the list keeps them apart.
  const byParty = [
    ...govRows.reduce((m, r) => {
      if (r.gov) m.set(r.gov.partyLabel, (m.get(r.gov.partyLabel) ?? 0) + 1);
      return m;
    }, new Map<string, number>()),
  ].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"));
  const presided = govRows.filter((r) => r.gov).length;
  const decisiveN = investitures.filter((f) => f.status === "vox-decisive").length;
  const shortN = investitures.length - decisiveN;
  const invCards = investitures
    .map((f) => ({ f, name: caName(f.investiture.id, regions.regions.find((r) => r.id === f.investiture.id)?.name ?? f.investiture.id) }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  // ---------- Recorded hate crime, by comunidad ----------
  // In the order the old map's hate-crime layer was read in: by rate, highest
  // first. A territory the report does not place has no rate, and sorts last.
  const hateRows = regions.regions
    .map((r) => ({ id: r.id, name: caName(r.id, r.name), h: hate.territories[r.id] ?? null }))
    .sort((a, b) => (b.h?.ratePer100k ?? -1) - (a.h?.ratePer100k ?? -1) || a.name.localeCompare(b.name, "es"));
  const rated = hateRows.filter((r) => r.h !== null);
  const hiRate = rated[0];
  const loRate = rated[rated.length - 1];
  const maxRate = Math.max(hate.national.ratePer100k, ...rated.map((r) => r.h!.ratePer100k));
  const unlocatedHate = Object.values(hate.unlocated).reduce((s, x) => s + x.total, 0);
  const share = (x: number, total: number) =>
    x <= 0 || total <= 0 ? null : x / total < 0.01 ? t.lessThanOne : percent(x / total, bcp47, 0);

  return (
    <main>
      {/* ---------- The places, and the map to find one ---------- */}
      <section className="n-shell grid items-center gap-x-12 gap-y-8 pb-14 pt-6 lg:grid-cols-[1fr_minmax(0,34rem)]">
        <div>
          <h1 className="n-display">{t.title}</h1>
          <p className="n-body mt-6" style={{ fontSize: "1.15rem" }}>
            {t.intro}
          </p>
          <p className="n-finding mt-6">
            {t.finding(n(rows.length), n(seats), most.province.name, n(most.deputies.length), listFmt.format(fewestNames), n(fewest), fewestNames.length > 1)}
          </p>
          <p className="n-source">{t.source}</p>
        </div>
        <figure className="m-0">
          <RegionMap
            locale={locale}
            regions={regions}
            title={t.mapTitle}
            desc={t.mapDesc}
            hrefFor={(id) => (single.has(id) ? L(`/territorio/${single.get(id)}`) : `#ca-${id}`)}
            labelFor={(id) => {
              const g = byTerritory.find((x) => x.territory.id === id);
              if (!g) return id;
              const s = territorySeats.get(id) ?? 0;
              return t.mapLabel(g.name, plural(s, t.deputy));
            }}
          />
          <figcaption className="n-meta mt-2">
            {t.mapCaption} {regions.source.body} ({regions.source.licence}).
          </figcaption>
        </figure>
      </section>

      {/* ---------- Provinces by comunidad, one dot per deputy ---------- */}
      <section className="n-shell n-section" aria-labelledby="provincias">
        <h2 id="provincias" className="n-h2">
          {t.provincesTitle}
        </h2>
        <p className="n-finding mt-4">
          {t.provincesFinding(plural(allRead, t.province), noneRead, n(noneRead))}
        </p>
        <p className="n-meta mt-3 max-w-[48em]">
          {t.dotsNote}
        </p>
        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem]">
          {counts
            .filter((c) => c.count > 0)
            .map((c) => (
              <li key={c.k} className={`${LOOK[c.k].cls ?? ""} inline-flex items-center gap-2`}>
                <span aria-hidden className="inline-block h-[13px] w-[13px] rounded-full" style={LOOK[c.k].style} />
                <span>
                  <span className="n-num font-bold">{n(c.count)}</span> {lookLabel(c.k, c.count === 1)}
                </span>
              </li>
            ))}
        </ul>

        <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {byTerritory.map((g) => {
            const s = territorySeats.get(g.territory.id) ?? 0;
            return (
              <section key={g.territory.id} id={`ca-${g.territory.id}`} aria-labelledby={`ca-${g.territory.id}-t`} className="scroll-mt-6 border-t-[3px] border-[var(--n-ink)] pt-3">
                <h3 id={`ca-${g.territory.id}-t`} className="n-h3">
                  {g.name}
                </h3>
                {g.rows.length > 1 && (
                  <p className="n-meta">{t.territoryMeta(plural(s, t.deputy), n(g.rows.length))}</p>
                )}
                <ul className="mt-2">
                  {g.rows.map((r) => (
                    <li key={r.province.slug} className="border-t border-[var(--n-rule)] py-2.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <Link href={L(`/territorio/${r.province.slug}`)} className="font-bold">
                          {r.province.name}
                        </Link>
                        <span className="n-meta n-num whitespace-nowrap">{plural(r.deputies.length, t.deputy)}</span>
                      </div>
                      <div aria-hidden className="mt-1.5 flex flex-wrap gap-[4px]">
                        {r.states.map((st, i) => (
                          <span
                            key={i}
                            className={`${LOOK[st].cls ?? ""} inline-block h-[11px] w-[11px] rounded-full`}
                            style={LOOK[st].style}
                          />
                        ))}
                      </div>
                      <p className="sr-only">
                        {ORDER.map((k) => ({ k, c: r.states.filter((x) => x === k).length }))
                          .filter((x) => x.c > 0)
                          .map((x) => `${n(x.c)} ${lookLabel(x.k, x.c === 1)}`)
                          .join("; ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
        {join.unresolved.length > 0 && (
          <p className="n-meta mt-6">
            {t.unresolved(listFmt.format(join.unresolved))}
          </p>
        )}
        <p className="n-source">
          {t.declSource} <Link href={L("/personas?kind=declarations")}>{t.allDeclarations}</Link>
        </p>
      </section>

      {/* ---------- The register, by comunidad ---------- */}
      <section className="n-shell n-section" aria-labelledby="registro">
        <h2 id="registro" className="n-h2">
          {t.registerTitle}
        </h2>
        <p className="n-finding mt-4">
          {t.registerFinding(top.name, n(top.count), n(unlocated), n(salaries.people.length))}
        </p>
        <p className="n-body mt-3">
          {t.registerBody}
        </p>
        <div className="relative mt-8 overflow-x-auto">
          <table className="n-table min-w-[36rem]">
            <caption className="sr-only">{t.caption}</caption>
            <thead>
              <tr>
                <th scope="col">{t.colCommunity}</th>
                <th scope="col" className="w-[40%]">
                  {t.colPosts}
                </th>
                <th scope="col" className="n-r">
                  {t.colPaid}
                </th>
                <th scope="col" className="n-r">
                  {t.colMedian}
                </th>
              </tr>
            </thead>
            <tbody>
              {register.map((r) => (
                <tr key={r.territory.id}>
                  <th scope="row" className="font-normal">
                    {single.has(r.territory.id) ? (
                      <Link href={L(`/territorio/${single.get(r.territory.id)}`)}>{r.name}</Link>
                    ) : (
                      <a href={`#ca-${r.territory.id}`}>{r.name}</a>
                    )}
                  </th>
                  <td>
                    <div className="flex items-center gap-3">
                      <div aria-hidden className="flex h-3 flex-1" >
                        <span
                          className="flex h-3 overflow-hidden rounded-[2px]"
                          style={{ width: `${(r.count / maxCount) * 100}%`, minWidth: r.count ? 2 : 0, outline: "1px solid var(--n-ink-3)", outlineOffset: -1 }}
                        >
                          <span style={{ flexGrow: r.paid, flexBasis: 0, background: "var(--n-ink-2)" }} />
                          <span style={{ flexGrow: r.count - r.paid, flexBasis: 0 }} />
                        </span>
                      </div>
                      <span className="n-num w-14 text-right">{n(r.count)}</span>
                    </div>
                  </td>
                  <td className="n-r">{n(r.paid)}</td>
                  <td className="n-r">
                    {r.median != null ? euroExact(r.median, bcp47) : <span className="text-[var(--n-ink-3)]">{t.notPublished}</span>}
                  </td>
                </tr>
              ))}
              <tr>
                <th scope="row" className="font-normal text-[var(--n-ink-2)]">
                  {t.noCommunity}
                </th>
                <td>
                  <div className="flex items-center gap-3">
                    <div aria-hidden className="flex h-3 flex-1">
                      <span
                        className="n-hatch h-3 rounded-[2px]"
                        style={{ width: `${(unlocated / maxCount) * 100}%`, outline: "1px solid var(--n-ink-3)", outlineOffset: -1 }}
                      />
                    </div>
                    <span className="n-num w-14 text-right">{n(unlocated)}</span>
                  </div>
                </td>
                <td className="n-r text-[var(--n-ink-3)]">—</td>
                <td className="n-r text-[var(--n-ink-3)]">—</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="n-meta mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="inline-block h-3 w-5 rounded-[2px]" style={{ background: "var(--n-ink-2)" }} />
            {t.legendPaid}
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="inline-block h-3 w-5 rounded-[2px]" style={{ outline: "1px solid var(--n-ink-3)", outlineOffset: -1 }} />
            {t.legendUnpaid}
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="n-hatch inline-block h-3 w-5 rounded-[2px]" style={{ outline: "1px solid var(--n-ink-3)", outlineOffset: -1 }} />
            {t.legendNoCommunity}
          </span>
        </p>
        <p className="n-source">
          {t.sourceLabel} <a href={SALARIES_SOURCE_URL}>{salaries.source.name}</a>
          {salaries.source.updated ? t.updated(formatDate(salaries.source.updated, bcp47)) : ""}
          {t.registerSourceTail}
        </p>
      </section>

      {/* ---------- Who presides each comunidad ---------- */}
      <section className="n-shell n-section" aria-labelledby="gobiernos">
        <h2 id="gobiernos" className="n-h2">
          {t.govTitle}
        </h2>
        {byParty.length > 0 && (
          <p className="n-finding mt-4">
            {t.govFinding(byParty[0][0], n(byParty[0][1]), n(govRows.length), formatDate(GOVERNMENTS_SOURCE.checked, bcp47))}
          </p>
        )}
        <p className="n-body mt-3">{t.govBody}</p>
        <ShareBar
          locale={locale}
          className="n-neutral mt-6 max-w-[48rem]"
          parts={[
            ...byParty.map(([label, count]) => ({ label, value: count })),
            ...(presided < govRows.length ? [{ label: "—", value: govRows.length - presided, muted: true }] : []),
          ]}
          format={(v) => n(v)}
        />
        <div className="relative mt-8 overflow-x-auto">
          <table className="n-table min-w-[40rem]">
            <caption className="sr-only">{t.govCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{t.colCommunity}</th>
                <th scope="col">{t.colPresident}</th>
                <th scope="col">{t.colParty}</th>
                <th scope="col" className="n-r">
                  {t.colSince}
                </th>
                <th scope="col">{t.colInvestiture}</th>
              </tr>
            </thead>
            <tbody>
              {govRows.map((r) => (
                <tr key={r.id}>
                  <th scope="row" className="font-normal">
                    <a href={hrefFor(r.id)}>{r.name}</a>
                    {r.legal !== r.name && <span className="n-meta block">{r.legal}</span>}
                  </th>
                  <td>{r.gov?.president ?? <span className="text-[var(--n-ink-3)]">—</span>}</td>
                  <td>{r.gov?.partyLabel ?? <span className="text-[var(--n-ink-3)]">—</span>}</td>
                  <td className="n-r">
                    {r.gov ? formatDate(r.gov.since, bcp47) : <span className="text-[var(--n-ink-3)]">—</span>}
                  </td>
                  <td>
                    {r.inv ? (
                      <a href={`#inv-${r.id}`} className="inline-flex items-start gap-2">
                        <span className="mt-[0.3em]">
                          <StatusMark status={r.inv.status} />
                        </span>
                        {r.inv.status === "vox-decisive" ? ti.hatchDecisive : ti.hatchShort}
                      </a>
                    ) : (
                      <span className="text-[var(--n-ink-3)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="n-meta mt-3 max-w-[48em]">{t.govInvestNote}</p>
        <p className="n-source">
          {t.sourceLabel}{" "}
          <a href={GOVERNMENTS_SOURCE.url}>
            {t.wikiPrefix}
            {GOVERNMENTS_SOURCE.body}
          </a>
          {t.checkedTail(formatDate(GOVERNMENTS_SOURCE.checked, bcp47))}
        </p>
      </section>

      {/* ---------- Investitures ---------- */}
      <section className="n-shell n-section" aria-labelledby="investiduras">
        <h2 id="investiduras" className="n-h2">
          {t.investTitle}
        </h2>
        <p className="n-finding mt-4">
          {t.investFinding(n(investitures.length), n(decisiveN), n(shortN))}
        </p>
        <p className="n-body mt-3">{t.investBody}</p>
        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem]">
          <li className="inline-flex items-center gap-2">
            <StatusMark status="vox-decisive" />
            {ti.hatchDecisive}
          </li>
          <li className="inline-flex items-center gap-2">
            <StatusMark status="pp-short-alone" />
            {ti.hatchShort}
          </li>
        </ul>
        <div className="mt-10 grid gap-x-14 gap-y-12 lg:grid-cols-2">
          {invCards.map(({ f, name }) => (
            <InvestitureRecord
              key={f.investiture.id}
              id={`inv-${f.investiture.id}`}
              finding={f}
              name={name}
              href={hrefFor(f.investiture.id)}
              locale={locale}
              bcp47={bcp47}
            />
          ))}
        </div>
        <p className="n-meta mt-8 max-w-[48em]">{t.investGap}</p>
      </section>

      {/* ---------- Recorded hate crime ---------- */}
      <section className="n-shell n-section" aria-labelledby="odio">
        <h2 id="odio" className="n-h2">
          {t.hateTitle}
        </h2>
        {hiRate && loRate && (
          <p className="n-finding mt-4">
            {t.hateFinding(
              String(hate.year),
              n(hate.national.total),
              rate(hate.national.ratePer100k, bcp47),
              rate(loRate.h!.ratePer100k, bcp47),
              loRate.name,
              rate(hiRate.h!.ratePer100k, bcp47),
              hiRate.name,
            )}
          </p>
        )}
        <p className="n-body mt-3">{t.hateBody}</p>

        {/* The rate, one bar per territory on one scale, with Spain's as a line. */}
        <ul aria-label={t.rateListLabel} className="mt-8 grid max-w-[48rem] gap-1.5">
          {hateRows.map((r) => (
            <li key={r.id} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-[0.95rem]">
              <a href={hrefFor(r.id)} className="leading-tight">
                {r.name}
              </a>
              <span aria-hidden className="relative block h-3">
                {r.h && (
                  <span
                    className="absolute inset-y-0 left-0 rounded-[2px]"
                    style={{ width: `${(r.h.ratePer100k / maxRate) * 100}%`, minWidth: 2, background: "var(--n-ink-2)" }}
                  />
                )}
                <span
                  className="absolute -bottom-0.5 -top-0.5 w-[2px]"
                  style={{ left: `${(hate.national.ratePer100k / maxRate) * 100}%`, background: "var(--n-ink)" }}
                />
              </span>
              <span className="n-num w-[4.5rem] text-right">
                {r.h ? rate(r.h.ratePer100k, bcp47) : <span className="text-[var(--n-ink-3)]">—</span>}
              </span>
            </li>
          ))}
        </ul>
        <p className="n-meta mt-3 inline-flex items-center gap-2">
          <span aria-hidden className="inline-block h-3 w-[2px]" style={{ background: "var(--n-ink)" }} />
          {t.nationalLine(rate(hate.national.ratePer100k, bcp47))}
        </p>

        <details className="mt-8">
          <summary className="n-h3 cursor-pointer">{t.hateTableSummary(n(hateRows.length))}</summary>
          <div className="relative mt-4 overflow-x-auto">
            <table className="n-table min-w-[40rem]">
              <caption className="sr-only">{t.hateCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.colTerritory}</th>
                  <th scope="col" className="n-r">
                    {t.colRecorded(String(hate.year))}
                  </th>
                  <th scope="col" className="n-r">
                    {t.colRate}
                  </th>
                  <th scope="col" className="n-r">
                    {t.colSogi}
                  </th>
                  <th scope="col" className="n-r">
                    {t.colRacism}
                  </th>
                </tr>
              </thead>
              <tbody>
                {hateRows.map((r) => {
                  const sogi = r.h ? share(r.h.sexualOrientationGenderIdentity, r.h.total) : null;
                  const racism = r.h ? share(r.h.racism, r.h.total) : null;
                  return (
                    <tr key={r.id}>
                      <th scope="row" className="font-normal">
                        <a href={hrefFor(r.id)}>{r.name}</a>
                      </th>
                      {r.h ? (
                        <>
                          <td className="n-r">{n(r.h.total)}</td>
                          <td className="n-r">{rate(r.h.ratePer100k, bcp47)}</td>
                          <td className="n-r">
                            {n(r.h.sexualOrientationGenderIdentity)}
                            {sogi && <span className="n-meta"> ({sogi})</span>}
                          </td>
                          <td className="n-r">
                            {n(r.h.racism)}
                            {racism && <span className="n-meta"> ({racism})</span>}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="n-r text-[var(--n-ink-3)]">—</td>
                          <td className="n-r text-[var(--n-ink-3)]">—</td>
                          <td className="n-r text-[var(--n-ink-3)]">—</td>
                          <td className="n-r text-[var(--n-ink-3)]">—</td>
                        </>
                      )}
                    </tr>
                  );
                })}
                {unlocatedHate > 0 && (
                  <tr>
                    <th scope="row" className="font-normal text-[var(--n-ink-2)]">
                      {t.noTerritory}
                    </th>
                    <td className="n-r">{n(unlocatedHate)}</td>
                    <td className="n-r text-[var(--n-ink-3)]">—</td>
                    <td className="n-r text-[var(--n-ink-3)]">—</td>
                    <td className="n-r text-[var(--n-ink-3)]">—</td>
                  </tr>
                )}
                <tr>
                  <th scope="row" className="font-bold">
                    {t.spain}
                  </th>
                  <td className="n-r font-bold">{n(hate.national.total)}</td>
                  <td className="n-r font-bold">{rate(hate.national.ratePer100k, bcp47)}</td>
                  <td className="n-r text-[var(--n-ink-3)]">—</td>
                  <td className="n-r text-[var(--n-ink-3)]">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="n-meta mt-3 max-w-[48em]">{t.barsNote}</p>
        </details>

        <p className="n-body mt-8 text-[0.95rem]">{t.hateLimits}</p>
        <p className="n-meta mt-3 max-w-[48em]">{t.hateNotJoined}</p>
        <p className="n-source">
          {t.sourceLabel}{" "}
          <a href={hate.source.url}>
            {hate.source.body.replace(/\s*·\s*/g, ", ")}, {hate.source.report}
          </a>
          {t.tablesTail(listFmt.format(hate.source.tables))}
        </p>
      </section>

      {/* ---------- What this page does not show ---------- */}
      <section className="n-shell n-section" aria-labelledby="no-muestra">
        <h2 id="no-muestra" className="n-h2">
          {t.missingTitle}
        </h2>
        <p className="n-body mt-4 max-w-[48em]">{t.missingLayers}</p>
      </section>
    </main>
  );
}
