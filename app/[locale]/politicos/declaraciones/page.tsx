import Link from "next/link";
import Caveat from "@/components/Caveat";
import PeopleTabs from "@/components/PeopleTabs";
import { declarationTotals } from "@/lib/declaration-totals.mjs";
import { getDeclarations } from "@/lib/declarations";
import { formationOf } from "@/lib/deputy-join.mjs";
import { euro, fill, formatDate, integer } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import { getPeople } from "@/lib/people";

// The party filter comes from the query string.
export const dynamic = "force-dynamic";

/**
 * What the sitting deputies declared, side by side: each transcribed declaration's totals by
 * section, in Congreso's own surname order, and the deputies still waiting for a transcription.
 * Never sorted by an amount and never summed into a net worth: the profile holds the detail.
 */
export default async function DeclaracionesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ party?: string }>;
}) {
  const { locale: localeParam } = await params;
  const { party } = await searchParams;
  const { locale, bcp47, t } = getDict(localeParam);
  const A = t.assets;

  const [people, { declarations, check, source }] = await Promise.all([getPeople(), getDeclarations()]);
  const byCod = new Map(declarations.map((d) => [d.cod, d]));

  const deputies = people
    .flatMap((person) =>
      person.deputy
        ? [
            {
              person,
              deputy: person.deputy,
              // The list the deputy was elected on, as Congreso records it.
              party: formationOf(person.deputy.formation)?.short ?? person.deputy.formation ?? "—",
              filed: person.deputy.filings.some((f) => f.kind === "bienes"),
            },
          ]
        : [],
    )
    .sort((a, b) => a.deputy.name.localeCompare(b.deputy.name, "es"));

  const parties = [...deputies.reduce((m, d) => m.set(d.party, (m.get(d.party) ?? 0) + 1), new Map<string, number>())]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
    .map(([short, count]) => ({ short, count }));

  const shown = party ? deputies.filter((d) => d.party === party) : deputies;
  const transcribed = shown.flatMap((d) => {
    const declaration = byCod.get(d.deputy.cod);
    return declaration ? [{ ...d, declaration, totals: declarationTotals(declaration) }] : [];
  });
  const pending = shown.filter((d) => d.filed && !byCod.has(d.deputy.cod));
  const noFiling = shown.filter((d) => !d.filed);

  const href = (p?: string) => `/${locale}/politicos/declaraciones${p ? `?party=${encodeURIComponent(p)}` : ""}`;
  const profile = (slug: string) => `/${locale}/politico/${slug}#declaracion`;
  // A section with nothing declared shows a dash, as on the profile, never a zero.
  const amount = (n: number | null) => (n === null ? "—" : euro(n, bcp47));
  const count = (n: number) => (n === 0 ? "—" : integer(n, bcp47));

  const th = "label-mono py-2 pr-4 text-left font-normal text-[var(--ink-3)]";
  const thNum = "label-mono whitespace-nowrap py-2 pr-4 text-right font-normal text-[var(--ink-3)]";
  const num = "mono whitespace-nowrap py-3 pr-4 text-right align-top text-sm text-[var(--ink)]";

  return (
    <main className="mx-auto max-w-5xl pb-8">
      <h1 className="display mt-6 text-4xl sm:text-5xl">{t.people.title}</h1>
      <PeopleTabs locale={locale} current="declarations" labels={A.tabs} />

      <h2 className="display mt-10 text-2xl">{A.title}</h2>
      <p className="mt-4 max-w-2xl text-[var(--ink-2)]">{A.intro}</p>
      <p className="label-mono mt-4 text-[var(--ink-3)]">
        {fill(A.coverage, {
          done: integer(declarations.length, bcp47),
          total: integer(deputies.filter((d) => d.filed).length, bcp47),
        })}
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {[{ short: undefined, label: A.all, count: deputies.length }, ...parties.map((p) => ({ ...p, label: p.short }))].map(
          (p) => (
            <Link
              key={p.label}
              href={href(p.short)}
              aria-current={party === p.short ? "page" : undefined}
              className={`label-mono inline-flex min-h-11 items-center rounded-full border px-3 transition-colors ${
                party === p.short
                  ? "border-[var(--gold)] text-[var(--gold-deep)]"
                  : "border-[var(--line)] text-[var(--ink-3)] hover:text-[var(--ink)]"
              }`}
            >
              {p.label} <span className="ml-1 opacity-60">{p.count}</span>
            </Link>
          ),
        )}
      </div>

      <section className="mt-10">
        {transcribed.length === 0 ? (
          <p className="text-sm text-[var(--ink-3)]">{A.noneForParty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse">
              <caption className="sr-only">{A.tableCaption}</caption>
              <thead>
                <tr>
                  <th scope="col" className={th}>{A.columns.name}</th>
                  <th scope="col" className={th}>{A.columns.filed}</th>
                  <th scope="col" className={thNum}>{A.columns.income}</th>
                  <th scope="col" className={thNum}>{A.columns.financial}</th>
                  <th scope="col" className={thNum}>{A.columns.realEstate}</th>
                  <th scope="col" className={thNum}>{A.columns.vehicles}</th>
                  <th scope="col" className={thNum}>{A.columns.debts}</th>
                </tr>
              </thead>
              <tbody>
                {transcribed.map(({ person, deputy, party: p, declaration, totals }) => (
                  <tr key={deputy.cod} className="border-t border-[var(--line)]">
                    <th scope="row" className="py-3 pr-4 text-left align-top font-normal">
                      <Link href={profile(person.slug)} className="text-[var(--ink)] hover:text-[var(--gold-deep)]">
                        {person.name}
                      </Link>
                      <span className="label-mono mt-1 block text-[var(--ink-3)]">
                        {p} · {deputy.constituency}
                      </span>
                    </th>
                    <td className="mono whitespace-nowrap py-3 pr-4 align-top text-sm text-[var(--ink-2)]">
                      {formatDate(declaration.filed, bcp47)}
                    </td>
                    <td className={num}>{amount(totals.income)}</td>
                    <td className={num}>{amount(totals.financial)}</td>
                    <td className={num}>{count(declaration.realEstate.length)}</td>
                    <td className={num}>{count(declaration.vehicles.length)}</td>
                    <td className={num}>{amount(totals.debts)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="label-mono mt-4 text-[var(--ink-3)]">{A.legend}</p>
        <p className="label-mono mt-2 text-[var(--ink-3)]">{A.noRanking}</p>
        <p className="label-mono mt-2 text-[var(--ink-3)]">
          <a className="src" href={`/${locale}/datos/declaraciones_bienes`}>
            {A.download}
          </a>
        </p>
      </section>

      {pending.length > 0 && (
        <details className="mt-12">
          <summary className="label-mono inline-flex min-h-11 cursor-pointer items-center text-[var(--ink-2)] hover:text-[var(--ink)]">
            {fill(A.pending, { count: integer(pending.length, bcp47) })}
          </summary>
          <p className="label-mono mt-2 text-[var(--ink-3)]">{A.pendingNote}</p>
          <ul className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map(({ person, deputy, party: p }) => (
              <li key={deputy.cod} className="border-t border-[var(--line)] py-2.5">
                <Link href={profile(person.slug)} className="text-sm text-[var(--ink)] hover:text-[var(--gold-deep)]">
                  {person.name}
                </Link>
                <span className="label-mono ml-2 text-[var(--ink-3)]">{p}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {noFiling.length > 0 && (
        <p className="label-mono mt-8 text-[var(--ink-3)]">
          {fill(A.noFiling, { names: noFiling.map((d) => d.person.name).join(", ") })}
        </p>
      )}

      <Caveat label={t.common.caveat} className="mt-10">
        {fill(t.declarations.caveat, { check: check.name })}
      </Caveat>
      <p className="label-mono mt-6 text-[var(--ink-3)]">
        {A.source}:{" "}
        <a className="src" href={source.url} target="_blank" rel="noopener noreferrer">
          {source.name} ↗
        </a>
      </p>
    </main>
  );
}
