import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { euro, integer } from "@/lib/format";
import { PARTIES } from "@/lib/parties";
import { fillEdge } from "@/lib/chart-colors";
import FoundationGovernance from "@/components/FoundationGovernance";
import {
  displayName,
  entityBySlug,
  entities,
  getFoundations,
  partyNifByFoundation,
  type Dossier,
} from "@/lib/foundations";
import { officeTies } from "@/lib/officeholder-ties";
import ScrollBox from "@/components/chart/ScrollBox";

export const revalidate = 3600;

export async function generateStaticParams() {
  const data = await getFoundations();
  return entities(data).map((e) => ({ slug: e.slug }));
}

/**
 * One party-linked entity, exercise by exercise.
 *
 * The page is a transcription, not an analysis: where the report states a
 * figure it is shown, and where it states nothing the absence is printed as an
 * absence. That matters most for the register — an entity that is not in the
 * Registro de Partidos Políticos is in breach of an obligation, and a blank
 * cell would read as merely missing data.
 */
export default async function FundacionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const data = await getFoundations();
  const entity = entityBySlug(data, slug);
  if (!entity) notFound();

  const { locale, bcp47, t } = getDict(localeParam);
  const F = t.foundations;
  const party = entity.partyNif ? PARTIES[entity.partyNif] : undefined;

  // Public offices held by this entity's board members, matched against the
  // Registro de Altos Cargos. The join needs the report's own party link for
  // every entity, not just this one, because a person can sit on two boards.
  const offices = await officeTies(partyNifByFoundation(data));

  return (
    <main className="mx-auto max-w-4xl pb-8">
      <Link
        href={`/${locale}/financiacion`}
        className="label-mono inline-block py-4 hover:text-[var(--gold-deep)]"
      >
        {F.backToChannel}
      </Link>

      <div
        className="mt-2 h-1 w-16 rounded-full"
        style={{ backgroundColor: party?.color ?? "var(--gold)", ...fillEdge(party?.color) }}
      />
      <p className="eyebrow mt-4">{F.dossierEyebrow}</p>
      <h1 className="display mt-3 text-3xl leading-tight sm:text-4xl">{displayName(entity.name)}</h1>

      <section className="mt-10">
        <h2 className="display section-tick text-xl">{F.identityTitle}</h2>
        <dl className="mt-5 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
          <div>
            <dt className="label-mono text-[var(--ink-3)]">{F.party}</dt>
            <dd className="mt-1">
              {entity.partyNif ? (
                <Link className="hover:text-[var(--gold-deep)]" href={`/${locale}/party/${entity.partyNif}`}>
                  {entity.party}
                </Link>
              ) : (
                (entity.party ?? <span className="text-[var(--ink-3)]">{F.noPartyStated}</span>)
              )}
            </dd>
          </div>
          <div>
            <dt className="label-mono text-[var(--ink-3)]">{F.supervisor}</dt>
            <dd className="mt-1">
              {entity.years[0].supervisor ?? (
                <span className="text-[var(--ink-3)]">{F.notStated}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="label-mono text-[var(--ink-3)]">{F.constituted}</dt>
            <dd className="mono mt-1">
              {entity.years[0].yearConstituted ?? (
                <span className="text-[var(--ink-3)]">{F.notStated}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="label-mono text-[var(--ink-3)]">{F.registryLabel}</dt>
            <dd className="mt-1">
              {entity.years[0].registered === true ? (
                <>
                  {F.registryYes}{" "}
                  <span className="mono text-[var(--ink-3)]">
                    · {entity.years[0].registryDate}
                  </span>
                </>
              ) : entity.years[0].registered === false ? (
                <span className="text-[var(--red)]">{F.registryNo}</span>
              ) : (
                <span className="text-[var(--ink-3)]">{F.registryUnstated}</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <FoundationGovernance
        foundation={entity.name}
        t={t}
        locale={locale}
        offices={offices.byPerson}
      />

      {entity.years.map((year) => (
        <Exercise key={year.exercise} year={year} F={F} bcp47={bcp47} />
      ))}

      <p className="label-mono mt-12">
        <a className="src" href={data.source.url} target="_blank" rel="noopener noreferrer">
          {data.source.body} · {data.source.report} ↗
        </a>
      </p>
    </main>
  );
}

function Exercise({
  year,
  F,
  bcp47,
}: {
  year: Dossier;
  F: ReturnType<typeof getDict>["t"]["foundations"];
  bcp47: string;
}) {
  const c = year.contributions;
  const rows: [string, number, string][] = [
    [F.fromParty, c.party.amount, "var(--gold-deep)"],
    [F.fromCompanies, c.companies.amount, "var(--red)"],
    [F.fromIndividuals, c.individuals.amount, "var(--ink-2)"],
  ];
  const counts: Record<string, number | null> = {
    [F.fromParty]: c.party.count,
    [F.fromCompanies]: c.companies.count,
    [F.fromIndividuals]: c.individuals.count,
  };

  return (
    <section className="mt-14 border-t border-[var(--line)] pt-8">
      <p className="eyebrow">
        {F.exercise} {year.exercise}
      </p>

      <h2 className="display section-tick mt-4 text-xl">{F.moneyInTitle}</h2>
      <ScrollBox className="mt-5">
        <table className="w-full min-w-[26rem] border-collapse text-sm">
          <caption className="sr-only">
            {F.moneyInTitle} · {year.exercise}
          </caption>
          <thead>
            <tr className="label-mono text-left text-[var(--ink-3)]">
              <th scope="col" className="py-2 pr-4 font-normal">
                {F.origin}
              </th>
              <th scope="col" className="whitespace-nowrap py-2 pr-4 text-right font-normal">
                {F.contributionCount}
              </th>
              <th scope="col" className="whitespace-nowrap py-2 text-right font-normal">
                {F.total}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, amount, color]) => (
              <tr key={label} className="border-t border-[var(--line)]">
                <th scope="row" className="py-2.5 pr-4 text-left font-normal text-[var(--ink)]">
                  {label}
                </th>
                <td className="mono py-2.5 pr-4 text-right text-[var(--ink-3)]">
                  {counts[label] === null ? "—" : integer(counts[label] as number, bcp47)}
                </td>
                <td className="mono py-2.5 text-right" style={{ color }}>
                  {amount > 0 ? euro(amount, bcp47) : "—"}
                </td>
              </tr>
            ))}
            <tr className="border-t border-[var(--line)]">
              <th scope="row" className="py-2.5 pr-4 text-left font-normal text-[var(--ink)]">
                {F.total}
              </th>
              <td />
              <td className="mono py-2.5 text-right text-[var(--ink)]">
                {euro(c.total.amount, bcp47)}
              </td>
            </tr>
          </tbody>
        </table>
      </ScrollBox>

      <h2 className="display section-tick mt-10 text-xl">{F.publicByTitle}</h2>
      {year.subsidies.items.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--ink-3)]">{F.notStated}</p>
      ) : (
        <ScrollBox className="mt-5">
          <table className="w-full min-w-[26rem] border-collapse text-sm">
            <caption className="sr-only">
              {F.publicByTitle} · {year.exercise}
            </caption>
            <thead>
              <tr className="label-mono text-left text-[var(--ink-3)]">
                <th scope="col" className="py-2 pr-4 font-normal">
                  {F.grantingBody}
                </th>
                <th scope="col" className="py-2 text-right font-normal">
                  {F.publicSubsidies}
                </th>
              </tr>
            </thead>
            <tbody>
              {year.subsidies.items.map((item) => (
                <tr key={item.body} className="border-t border-[var(--line)]">
                  <th scope="row" className="py-2.5 pr-4 text-left font-normal text-[var(--ink)]">
                    {item.body}
                  </th>
                  <td className="mono py-2.5 text-right text-[var(--gold-deep)]">
                    {euro(item.amount, bcp47)}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-[var(--line)]">
                <th scope="row" className="py-2.5 pr-4 text-left font-normal text-[var(--ink)]">
                  {F.total}
                </th>
                <td className="mono py-2.5 text-right text-[var(--ink)]">
                  {euro(year.subsidies.total, bcp47)}
                </td>
              </tr>
            </tbody>
          </table>
        </ScrollBox>
      )}

      {/* Where the report's own total disagrees with its own lines, both are
          published. The error is the source's, and hiding it would make this
          page look more certain than the document it transcribes. */}
      {year.sourceDiscrepancies?.map((d) => (
        <div key={d.field} className="panel mt-6 p-5">
          <p className="label-mono mb-2 text-[var(--red)]">{F.discrepancyTitle}</p>
          <p className="text-sm leading-relaxed text-[var(--ink-2)]">
            {F.discrepancyBody
              .replace("{stated}", euro(d.stated, bcp47))
              .replace("{itemised}", euro(d.itemised, bcp47))
              .replace("{difference}", euro(Math.abs(d.difference), bcp47))}
          </p>
        </div>
      ))}

      {year.deals.length > 0 && (
        <>
          <h2 className="display section-tick mt-10 text-xl">{F.dealsTitle}</h2>
          <ul className="mt-5 flex flex-col gap-5">
            {year.deals.map((deal, i) => (
              <li key={i} className="panel p-5">
                <p className="label-mono mb-2 text-[var(--ink)]">
                  {deal.counterparties.length > 0 ? deal.counterparties.join(" · ") : F.notStated}
                  {deal.amount !== null && (
                    <span className="mono ml-3 text-[var(--gold-deep)]">
                      {euro(deal.amount, bcp47)}
                    </span>
                  )}
                </p>
                {deal.consideration && (
                  <p className="mb-2 text-sm text-[var(--ink-2)]">
                    {F.consideration}: {deal.consideration}
                  </p>
                )}
                <p
                  className="label-mono mb-3"
                  style={{
                    color:
                      deal.compliant === false
                        ? "var(--red)"
                        : deal.compliant === true
                          ? "var(--ink-2)"
                          : "var(--ink-3)",
                  }}
                >
                  {F.duties}:{" "}
                  {deal.compliant === false
                    ? F.dutiesFailed
                    : deal.compliant === true
                      ? F.dutiesMet
                      : F.dutiesUnclear}
                  {deal.rule && ` · ${deal.rule}`}
                </p>
                <p className="text-sm leading-relaxed text-[var(--ink-3)]">“{deal.text}”</p>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="display section-tick mt-10 text-xl">{F.findingsTitle}</h2>
      {year.findings.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--ink-3)]">{F.noFindings}</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-4">
          {year.findings.map((f, i) => (
            <li key={i} className="border-l-2 border-[var(--red)] pl-4">
              {f.rule && <p className="label-mono mb-1 text-[var(--ink-3)]">{f.rule}</p>}
              <p className="text-sm leading-relaxed text-[var(--ink-2)]">“{f.text}”</p>
            </li>
          ))}
        </ul>
      )}

      <h2 className="display section-tick mt-10 text-xl">{F.accountsTitle}</h2>
      <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-4">
        {(
          [
            [F.netEquity, year.accounts.netEquity],
            [F.income, year.accounts.totalIncome],
            [F.expense, year.accounts.totalExpense],
            [F.result, year.accounts.result],
          ] as [string, number | null][]
        ).map(([label, value]) => (
          <div key={label}>
            <dt className="label-mono text-[var(--ink-3)]">{label}</dt>
            <dd
              className="mono mt-1"
              style={{ color: value !== null && value < 0 ? "var(--red)" : "var(--ink)" }}
            >
              {value === null ? "—" : euro(value, bcp47)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
