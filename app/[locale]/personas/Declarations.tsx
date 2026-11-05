import Link from "next/link";
import type { Person } from "@/lib/people";
import type { AssetDeclaration, DeclarationsData } from "@/lib/declarations";
import { declarationTotals } from "@/lib/declaration-totals.mjs";
import { euro, fill, formatDate, integer } from "@/lib/format";
import type { Dict } from "@/lib/i18n";

/*
 * The directory's declarations view: what each sitting deputy declared, by
 * section, in alphabetical order, and who is still waiting for a transcription.
 * It replaces the previous site's /politicos/declaraciones and uses its strings.
 * Never sorted by an amount and never summed into a net worth: the person page
 * holds the detail.
 */
export default function Declarations({
  deputies,
  data,
  t,
  locale,
  bcp47,
}: {
  /** Deputies already filtered by the directory's search and party filter. */
  deputies: Person[];
  data: DeclarationsData;
  t: Dict;
  locale: string;
  bcp47: string;
}) {
  const A = t.assets;
  const byCod = new Map<number, AssetDeclaration>(data.declarations.map((d) => [d.cod, d]));
  const sorted = deputies
    .filter((p) => p.deputy)
    .sort((a, b) => a.deputy!.name.localeCompare(b.deputy!.name, "es"));
  const filed = (p: Person) => p.deputy!.filings.some((f) => f.kind === "bienes");
  const transcribed = sorted.flatMap((p) => {
    const d = byCod.get(p.deputy!.cod);
    return d ? [{ person: p, declaration: d, totals: declarationTotals(d) }] : [];
  });
  const pending = sorted.filter((p) => filed(p) && !byCod.has(p.deputy!.cod));
  const noFiling = sorted.filter((p) => !filed(p));
  const profile = (slug: string) => `/${locale}/politico/${slug}#bienes`;
  // A section with nothing declared shows a dash, never a zero.
  const amount = (n: number | null) => (n === null ? "—" : euro(n, bcp47));
  const count = (n: number) => (n === 0 ? "—" : integer(n, bcp47));
  const num = "n-num whitespace-nowrap py-3 pr-4 text-right align-top";

  return (
    <div className="mt-8">
      <h2 className="n-label">{A.title}</h2>
      <p className="n-body mt-3">{A.intro}</p>
      <p className="n-meta mt-3">
        {fill(A.coverage, {
          done: integer(data.declarations.length, bcp47),
          total: integer(sorted.filter(filed).length, bcp47),
        })}
      </p>

      {transcribed.length === 0 ? (
        <p className="n-body mt-6">{A.noneForParty}</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="n-table w-full min-w-[46rem]">
            <caption className="sr-only">{A.tableCaption}</caption>
            <thead>
              <tr>
                <th scope="col" className="text-left">{A.columns.name}</th>
                <th scope="col" className="text-left">{A.columns.filed}</th>
                <th scope="col" className="text-right">{A.columns.income}</th>
                <th scope="col" className="text-right">{A.columns.financial}</th>
                <th scope="col" className="text-right">{A.columns.realEstate}</th>
                <th scope="col" className="text-right">{A.columns.vehicles}</th>
                <th scope="col" className="text-right">{A.columns.debts}</th>
              </tr>
            </thead>
            <tbody>
              {transcribed.map(({ person, declaration, totals }) => (
                <tr key={declaration.cod}>
                  <th scope="row" className="py-3 pr-4 text-left align-top font-normal">
                    <Link href={profile(person.slug)} className="font-bold">
                      {person.name}
                    </Link>
                    <span className="n-meta block">
                      {[person.partyShort, person.deputy!.constituency].filter(Boolean).join(", ")}
                    </span>
                  </th>
                  <td className="n-num whitespace-nowrap py-3 pr-4 align-top">
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
      <p className="n-meta mt-4">{A.legend}</p>
      <p className="n-meta mt-2">{A.noRanking}</p>
      <p className="n-meta mt-2">
        <a href={`/${locale}/datos/declaraciones_bienes`}>{A.download}</a>
      </p>

      {pending.length > 0 && (
        <details className="mt-10">
          <summary className="n-label cursor-pointer">
            {fill(A.pending, { count: integer(pending.length, bcp47) })}
          </summary>
          <p className="n-meta mt-2">{A.pendingNote}</p>
          <ul className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map((p) => (
              <li key={p.deputy!.cod} className="border-t border-[var(--n-rule)] py-2.5">
                <Link href={profile(p.slug)}>{p.name}</Link>
                <span className="n-meta ml-2">{p.partyShort}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {noFiling.length > 0 && (
        <p className="n-meta mt-8">
          {fill(A.noFiling, { names: noFiling.map((p) => p.name).join(", ") })}
        </p>
      )}

      <p className="n-body mt-8">{fill(t.declarations.caveat, { check: data.check.name })}</p>
      <p className="n-source">
        {A.source}: <a href={data.source.url}>{data.source.name}</a>
      </p>
    </div>
  );
}
