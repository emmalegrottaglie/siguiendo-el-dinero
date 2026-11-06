import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { euro, euroM, fill, formatDate, integer, percent } from "@/lib/format";
import { PARTIES } from "@/lib/parties";
import {
  displayName,
  entities,
  entityBySlug,
  foundationYears,
  getFoundations,
  partyNifByFoundation,
  type Dossier,
} from "@/lib/foundations";
import { governanceFor, type Role, type Source, type Tie } from "@/lib/foundation-people";
import { officeTies, type OfficeTie } from "@/lib/officeholder-ties";
import { nameKey } from "@/lib/name-key.mjs";
import { roleLabel } from "@/components/nuevo/roles";
import ShareBar from "@/components/nuevo/ShareBar";
import Line from "@/components/nuevo/Line";
import DotGrid from "@/components/nuevo/DotGrid";
import { COPY } from "./copy";

export const revalidate = 3600;

export async function generateStaticParams() {
  const data = await getFoundations();
  return entities(data).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entity = entityBySlug(await getFoundations(), slug);
  return { title: entity ? displayName(entity.name) : undefined };
}

const PART_KEYS = ["party", "companies", "individuals", "subsidies"] as const;
type PartKey = (typeof PART_KEYS)[number];

const partsOf = (d: Dossier): Record<PartKey, number> => ({
  party: d.contributions.party.amount,
  companies: d.contributions.companies.amount,
  individuals: d.contributions.individuals.amount,
  subsidies: d.subsidies.total,
});
const totalOf = (p: Record<PartKey, number>) =>
  p.party + p.companies + p.individuals + p.subsidies;

/** A board person, merged across every name the entity carries in the report. */
interface BoardPerson {
  person: string;
  roles: Role[];
  ties: Tie[];
}

/**
 * The prototype's dossier for one party-linked entity: one station on the
 * foundations' line.
 *
 * It reads in the order the route does: who the entity is linked to, what
 * entered it in each audited exercise and from where, who sits on its board and
 * which of them also holds a public post, its accounts and what the Court of
 * Auditors found, and what none of this shows. Each exercise is shown on its
 * own; figures from different exercises are never added.
 *
 * Like the previous site's dossier, this is a transcription: where the report
 * states nothing, the absence is printed. The legal and verdict wording comes
 * from the previous site's dictionary so a duty "not met" reads the same on
 * both sites.
 */
export default async function PrototypeFoundation({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const [data, agg] = await Promise.all([getFoundations(), getAggregation()]);
  const entity = entityBySlug(data, slug);
  if (!entity) notFound();

  const { locale, bcp47, t: dict } = getDict(localeParam);
  const F = dict.foundations;
  const t = COPY[locale];
  const L = (path: string) => `/${locale}${path}`;
  const listFmt = new Intl.ListFormat(bcp47, { type: "conjunction" });
  const money = (n: number) => (n >= 1_000_000 ? euroM(n, bcp47, 2) : euro(n, bcp47));
  /** A source's date as given: a full date is formatted, a bare month is left as written. */
  const dateOf = (iso: string) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? formatDate(iso, bcp47) : iso);

  const fYears = foundationYears(data);
  const dossiers = [...entity.years].sort((a, b) => a.exercise - b.exercise);
  const audited = new Set(dossiers.map((d) => d.exercise));
  const auditedList = listFmt.format(dossiers.map((d) => String(d.exercise)));
  const allYearsList = listFmt.format(fYears.map(String));
  const missingYears = fYears.filter((y) => !audited.has(y));
  const name = displayName(entity.name);

  // ---------- Party ----------
  const partyMeta = entity.partyNif ? PARTIES[entity.partyNif] : undefined;
  const hasHub = !!entity.partyNif && agg.parties.some((p) => p.nif === entity.partyNif);
  const partyWording = entity.party
    ? entity.party.replace(/\s*PORCENTAJE DE PARTICIPACI[ÓO]N.*$/i, "").trim()
    : null;
  const ownership = entity.party?.match(/PORCENTAJE DE PARTICIPACI[ÓO]N:\s*([\d.,]+\s*%)/i)?.[1] ?? null;
  const partyNode: ReactNode = partyMeta ? (
    hasHub ? (
      <Link href={L(`/partido/${entity.partyNif}`)}>{partyMeta.displayName}</Link>
    ) : (
      partyMeta.displayName
    )
  ) : null;
  const partySentence = partyNode
    ? t.linkedTo(partyNode)
    : partyWording
      ? t.linkedUnresolved(partyWording)
      : t.linkedNone;

  // ---------- The finding ----------
  const latest = [...dossiers].reverse().find((d) => totalOf(partsOf(d)) > 0) ?? null;
  const finding = latest
    ? (() => {
        const p = partsOf(latest);
        const total = totalOf(p);
        const top = [...PART_KEYS].sort((a, b) => p[b] - p[a])[0];
        return t.finding(
          latest.exercise,
          percent(p[top] / total, bcp47, 0),
          t.parts[top].words,
          p[top] === total,
        );
      })()
    : t.noMoney(auditedList);

  // ---------- Identity, per field across exercises ----------
  const newestFirst = [...dossiers].reverse();
  const acrossYears = (pick: (d: Dossier) => string) => {
    const vals = newestFirst.map((d) => ({ year: d.exercise, v: pick(d) }));
    return new Set(vals.map((x) => x.v)).size === 1
      ? vals[0].v
      : vals.map((x) => t.identityYear(x.year, x.v)).join(" · ");
  };
  const registry = (d: Dossier) =>
    d.registered === true
      ? d.registryDate
        ? `${F.registryYes} · ${d.registryDate}`
        : F.registryYes
      : d.registered === false
        ? F.registryNo
        : F.registryUnstated;
  const identity: { label: string; value: ReactNode; note?: string }[] = [
    {
      label: F.party,
      value: partyNode ?? partyWording ?? F.noPartyStated,
      note:
        partyNode && partyWording && partyWording !== partyMeta?.displayName
          ? `«${partyWording}»`
          : undefined,
    },
    { label: F.supervisor, value: acrossYears((d) => d.supervisor ?? F.notStated) },
    {
      label: F.constituted,
      value: acrossYears((d) => (d.yearConstituted === null ? F.notStated : String(d.yearConstituted))),
    },
    { label: F.registryLabel, value: acrossYears(registry) },
  ];

  // ---------- Board ----------
  const names = [...new Set(entity.years.map((d) => d.name))];
  const govs = names.map((n) => governanceFor(n));
  const peopleMap = new Map<string, BoardPerson>();
  for (const g of govs)
    for (const p of g.people) {
      const key = nameKey(p.person);
      const prev = peopleMap.get(key);
      if (prev) prev.roles.push(...p.roles);
      else peopleMap.set(key, { person: p.person, roles: [...p.roles], ties: p.ties });
    }
  const people = [...peopleMap.values()];
  const gap = govs.find((g) => g.gap)?.gap;
  const rename = govs.find((g) => g.rename)?.rename;
  const ties = await officeTies(partyNifByFoundation(data));
  const officeOf = (person: string): OfficeTie[] => ties.byPerson.get(nameKey(person)) ?? [];
  const droppedKeys = new Set([
    ...ties.audit.ambiguous.map((p) => nameKey(p)),
    ...ties.audit.partyMismatch.map((m) => nameKey(m.person)),
  ]);
  const withOffice = people.filter((p) => officeOf(p.person).length > 0);
  const dropped = people.filter((p) => droppedKeys.has(nameKey(p.person)));
  const without = people.length - withOffice.length - dropped.length;
  const personas = (n: number) => t.personas(n, integer(n, bcp47));
  const boardFinding =
    people.length === 0
      ? t.boardUnknown
      : withOffice.length === 0
        ? t.boardNone(personas(people.length), people.length)
        : t.boardSome(
            withOffice.length,
            integer(withOffice.length, bcp47),
            personas(people.length),
            people.length,
          );
  const boardSources = [
    ...new Map(people.flatMap((p) => p.roles).map((r) => [r.source.url, r.source])).values(),
  ];
  const registerUpdated = ties.audit.registerUpdated
    ? formatDate(ties.audit.registerUpdated, bcp47)
    : null;

  const kindLabel = (kind: Source["kind"]) =>
    kind === "registry"
      ? F.peopleKindRegistry
      : kind === "official"
        ? F.peopleKindOfficial
        : kind === "foundation"
          ? F.peopleKindFoundation
          : F.peopleKindPress;
  /** A press claim carries its attribution in the sentence, not in a footnote. */
  const attribution = (s: Source) =>
    s.kind === "press"
      ? fill(F.peoplePress, { publisher: s.publisher, date: dateOf(s.date) })
      : `${kindLabel(s.kind)}, ${dateOf(s.date)}`;

  // ---------- Gaps ----------
  const companiesYear = [...dossiers]
    .reverse()
    .find((d) => d.contributions.companies.amount > 0);
  const firstYear = fYears[0];
  const lineYears = Array.from(
    { length: new Date().getFullYear() - firstYear + 1 },
    (_, i) => firstYear + i,
  );

  const fullBoard = (
    <ul className="mt-4 grid gap-x-10 lg:grid-cols-2">
      {people.map((p) => {
        const office = officeOf(p.person);
        const all: (Tie | OfficeTie)[] = [...p.ties, ...office];
        return (
          <li key={p.person} className="border-t border-[var(--n-rule)] py-3">
            <p className="font-bold">
              {office[0] ? (
                <Link href={L(`/politico/${office[0].slug}`)}>{p.person}</Link>
              ) : (
                p.person
              )}
            </p>
            {p.roles.map((r, i) => (
              <p key={i} className="text-[0.95rem] text-[var(--n-ink-2)]">
                {roleLabel(r.role.toLowerCase(), locale)}
                {r.since && `, ${F.peopleSince} ${dateOf(r.since)}`}
                {r.until && ` – ${dateOf(r.until)}`}
                <span className="n-meta">
                  {" · "}
                  <a href={r.source.url}>{attribution(r.source)}</a>
                </span>
              </p>
            ))}
            {all.length > 0 && (
              <>
                <p className="n-meta mt-2">{F.peopleAlso}</p>
                <ul className="mt-0.5 grid gap-0.5">
                  {all.map((tie, i) => (
                    <li key={i} className="text-[0.95rem]">
                      {"slug" in tie ? (
                        <Link href={L(`/politico/${tie.slug}`)}>{tie.organisation}</Link>
                      ) : (
                        tie.organisation
                      )}
                      {tie.role && <span className="text-[var(--n-ink-2)]">, {tie.role}</span>}
                      {tie.former && <span className="n-meta"> ({F.peopleFormer})</span>}
                      <span className="n-meta">
                        {" · "}
                        <a href={tie.source.url}>{attribution(tie.source)}</a>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <main>
      <div className="n-shell pb-10 pt-6">
        <p className="n-meta">
          <Link href={L("/fundaciones")}>{t.breadcrumb}</Link>
        </p>
        <div className="n-foundations mt-4 flex items-center gap-3">
          <span
            aria-hidden
            className="h-[23px] w-[23px] shrink-0 rounded-full border-[3px]"
            style={{ borderColor: "var(--route)", background: "var(--n-card)" }}
          />
          <span aria-hidden className="h-[5px] w-16 rounded-full" style={{ background: "var(--route)" }} />
        </div>
        <h1 className="n-display mt-4" style={{ maxWidth: "24ch" }}>
          {name}
        </h1>
        <p className="mt-4 max-w-[48rem] text-[1.1rem] text-[var(--n-ink-2)]">
          {partySentence}
          {ownership && t.ownership(ownership)}
          {t.auditedIn(auditedList)}
        </p>
        <p className="n-finding mt-8">{finding}</p>
        <p className="n-body mt-3">{t.findingNote}</p>

        <dl className="mt-10 grid gap-px overflow-hidden rounded-[6px] border border-[var(--n-rule)] bg-[var(--n-rule)] sm:grid-cols-2 lg:grid-cols-4">
          {identity.map((row) => (
            <div key={row.label} className="bg-[var(--n-card)] p-5">
              <dt className="n-label">{row.label}</dt>
              <dd className="mt-2">{row.value}</dd>
              {row.note && <dd className="n-meta mt-1">{row.note}</dd>}
            </div>
          ))}
        </dl>
        <p className="n-source">{t.identitySource(auditedList)}</p>
      </div>

      {/* ---------- What came in ---------- */}
      <Section id="dinero" title={t.moneyTitle}>
        <Line
          locale={locale}
          cls="n-foundations"
          className="max-w-[32rem]"
          stops={fYears.map((y) => {
            const d = dossiers.find((x) => x.exercise === y);
            const total = d ? totalOf(partsOf(d)) : 0;
            return {
              key: String(y),
              label: String(y),
              note: d ? (total > 0 ? money(total) : t.noContributions) : t.notAudited,
              on: !!d,
            };
          })}
        />
        <p className="n-meta mt-4">{t.yearsKey}</p>

        <div
          className={`n-foundations mt-10 grid gap-x-14 gap-y-12 ${dossiers.length > 1 ? "lg:grid-cols-2" : ""}`}
        >
          {dossiers.map((d) => {
            const p = partsOf(d);
            const total = totalOf(p);
            const c = d.contributions;
            const rows: [string, number | null, number][] = [
              [F.fromParty, c.party.count, c.party.amount],
              [F.fromCompanies, c.companies.count, c.companies.amount],
              [F.fromIndividuals, c.individuals.count, c.individuals.amount],
            ];
            return (
              <article
                key={d.exercise + d.name}
                className="min-w-0 border-l-[5px] pl-5"
                style={{ borderColor: "var(--route)" }}
              >
                <h3 className="n-h3">
                  {F.exercise} {d.exercise}
                </h3>
                <p className="n-meta mt-0.5">
                  {total > 0 ? t.inTotal(euro(total, bcp47)) : t.noContributions}
                  {d.name !== entity.name && ` · ${F.entity}: ${displayName(d.name)}`}
                </p>
                {total > 0 && (
                  <ShareBar
                    locale={locale}
                    className="mt-4"
                    parts={PART_KEYS.filter((k) => p[k] > 0).map((k) => ({
                      label: t.parts[k].label,
                      value: p[k],
                    }))}
                    format={(v) => euro(v, bcp47)}
                  />
                )}

                <div className="mt-6 overflow-x-auto">
                  <table className="n-table min-w-[20rem]">
                    <caption className="sr-only">{t.moneyCaption(d.exercise)}</caption>
                    <thead>
                      <tr>
                        <th scope="col">{F.origin}</th>
                        <th scope="col" className="n-r">
                          {F.contributionCount}
                        </th>
                        <th scope="col" className="n-r">
                          {t.amount}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(([label, count, amount]) => (
                        <tr key={label}>
                          <th scope="row" className="font-normal">
                            {label}
                          </th>
                          <td className="n-r">{count === null ? "—" : integer(count, bcp47)}</td>
                          <td className="n-r">{amount > 0 ? euro(amount, bcp47) : "—"}</td>
                        </tr>
                      ))}
                      <tr>
                        <th scope="row">{t.contributionsTotal}</th>
                        <td />
                        <td className="n-r font-bold">{euro(c.total.amount, bcp47)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h4 className="n-label mt-6">{F.publicByTitle}</h4>
                {d.subsidies.items.length === 0 ? (
                  <p className="mt-2 text-[var(--n-ink-2)]">{t.subsidiesNone}</p>
                ) : (
                  <div className="mt-2 overflow-x-auto">
                    <table className="n-table min-w-[20rem]">
                      <caption className="sr-only">{t.subsidiesCaption(d.exercise)}</caption>
                      <thead>
                        <tr>
                          <th scope="col">{F.grantingBody}</th>
                          <th scope="col" className="n-r">
                            {t.amount}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.subsidies.items.map((item, i) => (
                          <tr key={item.body + i}>
                            <th scope="row" className="font-normal">
                              {item.body}
                            </th>
                            <td className="n-r">{euro(item.amount, bcp47)}</td>
                          </tr>
                        ))}
                        <tr>
                          <th scope="row">{t.subsidiesTotal}</th>
                          <td className="n-r font-bold">{euro(d.subsidies.total, bcp47)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Where the report's own total disagrees with its own lines,
                    both are published: the error is the source's. */}
                {d.sourceDiscrepancies?.map((x) => (
                  <div
                    key={x.field}
                    className="mt-6 border-l-[3px] border-dashed pl-4"
                    style={{ borderColor: "var(--n-ink-3)" }}
                  >
                    <p className="font-bold">{F.discrepancyTitle}</p>
                    <p className="n-meta mt-0.5">
                      {fill(F.discrepancyBody, {
                        stated: euro(x.stated, bcp47),
                        itemised: euro(x.itemised, bcp47),
                        difference: euro(Math.abs(x.difference), bcp47),
                      })}
                    </p>
                  </div>
                ))}
              </article>
            );
          })}
        </div>
        <p className="n-source">{t.moneySource(data.source.url, auditedList)}</p>
      </Section>

      {/* ---------- Collaboration agreements ---------- */}
      <Section id="convenios" title={F.dealsTitle}>
        {entity.deals.length === 0 ? (
          <p className="n-finding">{t.dealsNone(auditedList)}</p>
        ) : (
          <>
            <p className="n-body">{F.counterpartyNote}</p>
            <ul className="mt-8 grid max-w-[60rem] gap-6">
              {dossiers.flatMap((d) =>
                d.deals.map((deal, i) => (
                  <li
                    key={`${d.exercise}-${i}`}
                    className="n-neutral border-l-[3px] pl-4"
                    style={{ borderColor: "var(--route)" }}
                  >
                    <p className="n-meta">{t.dealYear(d.exercise)}</p>
                    <p className="mt-0.5">
                      <span className="font-bold">
                        {deal.counterparties.length > 0 ? deal.counterparties.join(" · ") : F.notStated}
                      </span>
                      {deal.amount !== null && (
                        <span className="n-num ml-3">{euro(deal.amount, bcp47)}</span>
                      )}
                    </p>
                    {deal.consideration && (
                      <p className="mt-1 text-[0.95rem] text-[var(--n-ink-2)]">
                        {F.consideration}: {deal.consideration}
                      </p>
                    )}
                    <p className="mt-1 text-[0.95rem]">
                      {F.duties}:{" "}
                      <span className={deal.compliant === false ? "font-bold" : ""}>
                        {deal.compliant === false
                          ? F.dutiesFailed
                          : deal.compliant === true
                            ? F.dutiesMet
                            : F.dutiesUnclear}
                      </span>
                      {deal.rule && <span className="n-meta"> · {deal.rule}</span>}
                    </p>
                    <p className="n-meta mt-2" style={{ fontFamily: "var(--n-serif)" }}>
                      “{deal.text}”
                    </p>
                  </li>
                )),
              )}
            </ul>
            <p className="n-meta mt-6">{t.quoteNote}</p>
          </>
        )}
        <p className="n-source">{t.moneySource(data.source.url, auditedList)}</p>
      </Section>

      {/* ---------- Who governs it ---------- */}
      <Section id="patronato" title={F.peopleTitle}>
        <p className="n-finding">{boardFinding}</p>

        {rename && (
          <div
            className="mt-6 max-w-[48rem] border-l-[3px] border-dashed pl-4"
            style={{ borderColor: "var(--n-ink-3)" }}
          >
            <p className="font-bold">{F.peopleRenameTitle}</p>
            <p className="n-meta mt-0.5">
              {fill(F.peopleRenameBody, {
                report: rename.reportName,
                when: rename.when,
                current: rename.currentName,
              })}{" "}
              <a href={rename.source.url}>{attribution(rename.source)}</a>
            </p>
          </div>
        )}
        {gap && (
          <div
            className="mt-6 max-w-[48rem] border-l-[3px] border-dashed pl-4"
            style={{ borderColor: "var(--n-ink-3)" }}
          >
            <p className="font-bold">{F.peopleGapTitle}</p>
            <p className="n-meta mt-0.5">
              {t.gapReason(gap.reason)}
              {gap.url && (
                <>
                  {" "}
                  <a href={gap.url}>{gap.url}</a>
                </>
              )}
            </p>
          </div>
        )}

        {people.length > 0 && (
          <>
            <div className="mt-8 grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,22rem)_1fr]">
              <div>
                <DotGrid
                  locale={locale}
                  groups={[
                    {
                      key: "con",
                      count: withOffice.length,
                      label: t.dotWith,
                      look: "filled",
                      cls: "n-foundations",
                    },
                    { key: "sin", count: without, label: t.dotWithout, look: "hollow" },
                    ...(dropped.length > 0
                      ? [{ key: "fuera", count: dropped.length, label: t.dotDropped, look: "ink" as const }]
                      : []),
                  ]}
                />
                <p className="n-meta mt-4">{t.boardDotNote}</p>
              </div>
              {withOffice.length > 0 && (
                <div className="n-foundations">
                  <h3 className="n-h3">{t.officeTitle}</h3>
                  <ul className="mt-3 grid gap-x-8 sm:grid-cols-2">
                    {withOffice.map((p) => {
                      const tie = officeOf(p.person)[0];
                      return (
                        <li key={tie.slug} className="border-t border-[var(--n-rule)] py-3">
                          <Link href={L(`/politico/${tie.slug}`)} className="font-bold">
                            {tie.person}
                          </Link>
                          <span className="text-[var(--n-ink-2)]">
                            ,{" "}
                            {listFmt.format(
                              [...new Set(p.roles.map((r) => roleLabel(r.role.toLowerCase(), locale)))],
                            )}
                          </span>
                          <p className="n-meta mt-0.5">
                            {tie.organisation}
                            {tie.role ? `, ${tie.role}` : ""}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="n-meta mt-3">{t.officeAsOf(registerUpdated)}</p>
                </div>
              )}
            </div>

            <p className="n-body mt-10">{F.peopleNote}</p>
            {people.length > 16 ? (
              <details className="mt-6">
                <summary className="cursor-pointer font-bold">
                  {t.fullBoardOpen(personas(people.length))}
                </summary>
                {fullBoard}
              </details>
            ) : (
              <>
                <h3 className="n-h3 mt-8">{t.fullBoardTitle}</h3>
                {fullBoard}
              </>
            )}
          </>
        )}
        <p className="n-source">
          {t.boardSources(
            boardSources.length > 0
              ? boardSources.map((s, i) => (
                  <span key={s.url}>
                    {i > 0 && ", "}
                    <a href={s.url}>{s.publisher}</a> ({dateOf(s.date)})
                  </span>
                ))
              : null,
            registerUpdated,
          )}
        </p>
      </Section>

      {/* ---------- Accounts ---------- */}
      <Section id="cuentas" title={t.accountsTitle}>
        <p className="n-body">{t.accountsNote}</p>
        <div className="mt-6 max-w-[44rem] overflow-x-auto">
          <table className="n-table min-w-[22rem]">
            <caption className="sr-only">{t.accountsCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{t.accountsItem}</th>
                {fYears.map((y) => (
                  <th key={y} scope="col" className="n-r">
                    {y}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  [F.netEquity, "netEquity"],
                  [F.income, "totalIncome"],
                  [F.expense, "totalExpense"],
                  [F.result, "result"],
                ] as const
              ).map(([label, key]) => (
                <tr key={key}>
                  <th scope="row" className="font-normal">
                    {label}
                  </th>
                  {fYears.map((y) => {
                    const d = dossiers.find((x) => x.exercise === y);
                    const v = d ? d.accounts[key] : null;
                    return (
                      <td key={y} className="n-r">
                        {!d ? (
                          <span className="text-[var(--n-ink-3)]">{t.notAudited}</span>
                        ) : v === null ? (
                          "—"
                        ) : (
                          euro(v, bcp47)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="n-source">{t.moneySource(data.source.url, auditedList)}</p>
      </Section>

      {/* ---------- What the Court found ---------- */}
      <Section id="tribunal" title={F.findingsTitle}>
        <p className="n-body">{t.findingsIntro}</p>
        <div className={`mt-8 grid gap-x-14 gap-y-10 ${dossiers.length > 1 ? "lg:grid-cols-2" : ""}`}>
          {dossiers.map((d) => (
            <article key={d.exercise + d.name} className="min-w-0">
              <h3 className="n-h3">
                {F.exercise} {d.exercise}
              </h3>
              {d.findings.length === 0 ? (
                <p className="mt-3 text-[var(--n-ink-2)]">{F.noFindings}</p>
              ) : (
                <ul className="mt-3 grid gap-4">
                  {d.findings.map((f, i) => (
                    <li
                      key={i}
                      className="border-l-[3px] pl-4"
                      style={{ borderColor: "var(--n-rule-strong)" }}
                    >
                      {f.rule && <p className="n-meta">{f.rule}</p>}
                      <p className="text-[0.95rem] text-[var(--n-ink-2)]" style={{ fontFamily: "var(--n-serif)" }}>
                        “{f.text}”
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
        <p className="n-meta mt-6">{t.quoteNote}</p>
        <p className="n-source">{t.sourceFoot(data.source.url, formatDate(data.source.approved, bcp47))}</p>
      </Section>

      {/* ---------- What the record does not show ---------- */}
      <Section id="falta" title={t.gapsTitle}>
        <ul className="grid max-w-[60rem] gap-8">
          <li>
            <p className="text-[var(--n-ink-2)]">{t.gapYears(allYearsList)}</p>
            <Line
              locale={locale}
              cls="n-foundations"
              className="mt-5"
              stops={lineYears.map((y) => ({
                key: String(y),
                label: String(y),
                note: y === lineYears.at(-1) ? t.today : undefined,
                on: fYears.includes(y),
              }))}
            />
            <p className="n-meta mt-4">{t.yearsKey}</p>
          </li>
          {missingYears.length > 0 && (
            <GapItem>{t.gapNotAudited(listFmt.format(missingYears.map(String)))}</GapItem>
          )}
          <GapItem>
            {companiesYear
              ? companiesYear.contributions.companies.count !== null
                ? t.gapDonorsCount(
                    companiesYear.exercise,
                    integer(companiesYear.contributions.companies.count, bcp47),
                    euro(companiesYear.contributions.companies.amount, bcp47),
                  )
                : t.gapDonorsAmount(
                    companiesYear.exercise,
                    euro(companiesYear.contributions.companies.amount, bcp47),
                  )
              : t.gapDonors}
          </GapItem>
          {people.length > 0 && <GapItem>{t.gapBoard}</GapItem>}
          {!partyNode && (
            <GapItem>
              {partyWording ? t.linkedUnresolved(partyWording) : t.linkedNone} {t.gapParty}
            </GapItem>
          )}
        </ul>
        <p className="n-source">{t.sourceFoot(data.source.url, formatDate(data.source.approved, bcp47))}</p>
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
