import Link from "next/link";
import Caveat from "@/components/Caveat";
import type { Deputy } from "@/lib/deputies";
import type { AssetDeclaration, InterestRow } from "@/lib/declarations";
import { declarationTotals } from "@/lib/declaration-totals.mjs";
import { entitySlug } from "@/lib/foundations";
import { euro, euroExact, fill, formatDate } from "@/lib/format";
import type { Dict } from "@/lib/i18n";

/**
 * What a sitting deputy declared to Congress: the Bienes y Rentas filing made on taking the seat,
 * as transcribed from the official scan, and the Intereses Económicos rows Congreso publishes as
 * open data. Everything is shown as declared, part by part — there is no grand total, because the
 * form gives property no value and any "net worth" would leave it out.
 */
export default function Declarations({
  deputy,
  declaration,
  interests,
  check,
  foundationSlugs,
  t,
  caveatLabel,
  locale,
  bcp47,
}: {
  deputy: Deputy;
  declaration: AssetDeclaration | null;
  interests: InterestRow[];
  /** The independent transcription the totals were checked against, credited on the page. */
  check: { name: string; url: string };
  /** Slugs of the audited party foundations, to link a declared recipient on an exact match. */
  foundationSlugs: Set<string>;
  t: Dict["declarations"];
  caveatLabel: string;
  locale: string;
  bcp47: string;
}) {
  const bienes = deputy.filings.filter((f) => f.kind === "bienes");
  const first = bienes[0] ?? null;
  const later = bienes.slice(1);
  // Declared amounts keep their cents only where the deputy wrote some.
  const money = (n: number | null) =>
    n === null ? "—" : Number.isInteger(n) ? euro(n, bcp47) : euroExact(n, bcp47);
  const totals = declaration ? declarationTotals(declaration) : null;
  // An amount written other than in Spanish format is also shown as the scan has it.
  const noted = new Map((declaration?.notes ?? []).map((n) => [n.path, n.written]));
  const amount = (n: number | null, path: string) => (
    <>
      {money(n)}
      {noted.has(path) && (
        <span className="label-mono block text-[var(--red)]">{fill(t.writtenAs, { text: noted.get(path)! })}</span>
      )}
    </>
  );

  const th = "py-2 pr-4 font-normal";
  const thNum = "whitespace-nowrap py-2 pr-4 text-right font-normal";
  const cell = "py-2.5 pr-4 align-top text-[var(--ink)]";
  const num = "mono py-2.5 pr-4 text-right align-top";

  return (
    <section id="declaracion" className="mt-12 scroll-mt-6">
      <h2 className="display section-tick text-xl">{t.title}</h2>
      <p className="label-mono mt-4 text-[var(--ink-3)]">{t.juxtaposition}</p>

      {/* The filing, and every later one the ficha links */}
      <div className="mt-6 text-sm text-[var(--ink-2)]">
        {!first ? (
          <p>{t.noFiling}</p>
        ) : (
          <p>
            {fill(t.filed, {
              date: formatDate(first.date!, bcp47),
              year: String(Number(first.date!.slice(0, 4)) - 1),
            })}{" "}
            <a className="src" href={first.url} target="_blank" rel="noopener noreferrer">
              {t.officialPdf}
            </a>
          </p>
        )}
        {first && !declaration && <p className="mt-2 text-[var(--ink-3)]">{t.notTranscribed}</p>}
        {declaration && declaration.notes.length > 0 && (
          <p className="label-mono mt-2 text-[var(--red)]">{t.notesFlag}</p>
        )}
        {declaration && (
          <p className="label-mono mt-2 text-[var(--ink-3)]">
            {declaration.verified.method === "rtve" ? (
              <>
                {t.checkRtve}{" "}
                <a className="src" href={check.url} target="_blank" rel="noopener noreferrer">
                  RTVE ↗
                </a>
              </>
            ) : (
              t.checkSecond
            )}
          </p>
        )}
        {later.length > 0 && (
          <p className="label-mono mt-2 text-[var(--ink-3)]">
            {t.later}{" "}
            {later.map((f, i) => (
              <span key={f.url}>
                {i > 0 && " · "}
                <a className="src" href={f.url} target="_blank" rel="noopener noreferrer">
                  {formatDate(f.date!, bcp47)} ↗
                </a>
              </span>
            ))}
          </p>
        )}
      </div>

      {declaration && totals && (
        <>
          {/* Rentas */}
          <h3 className="display mt-10 text-lg">{t.income}</h3>
          <p className="label-mono mt-2 text-[var(--ink-3)]">{t.incomeNote}</p>
          {declaration.income.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--ink-3)]">{t.none}</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[30rem] border-collapse text-sm">
                <caption className="sr-only">{t.income}</caption>
                <thead>
                  <tr className="label-mono text-left text-[var(--ink-3)]">
                    <th scope="col" className={th}>{t.columns.concept}</th>
                    <th scope="col" className={th}>{t.columns.group}</th>
                    <th scope="col" className={thNum}>{t.columns.amount}</th>
                  </tr>
                </thead>
                <tbody>
                  {declaration.income.map((l, i) => (
                    <tr key={i} className="border-t border-[var(--line)]">
                      <th scope="row" className={`${cell} text-left font-normal`}>{l.concept ?? "—"}</th>
                      <td className={`${cell} text-[var(--ink-3)]`}>{t.groups[l.group]}</td>
                      <td className={num}>{amount(l.amount, `income[${i}].amount`)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-[var(--ink)]">
                    <th scope="row" colSpan={2} className={`${cell} text-left font-normal`}>{t.total}</th>
                    <td className={num}>{money(totals.income)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 text-sm text-[var(--ink-2)]">
            {t.irpf}: <span className="mono text-[var(--ink)]">{amount(totals.irpf, "irpf")}</span>
          </p>

          {/* Inmuebles */}
          <h3 className="display mt-10 text-lg">{t.realEstate}</h3>
          <p className="label-mono mt-2 text-[var(--ink-3)]">{t.realEstateNote}</p>
          {declaration.realEstate.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--ink-3)]">{t.none}</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[40rem] border-collapse text-sm">
                <caption className="sr-only">{t.realEstate}</caption>
                <thead>
                  <tr className="label-mono text-left text-[var(--ink-3)]">
                    <th scope="col" className={th}>{t.columns.description}</th>
                    <th scope="col" className={th}>{t.columns.location}</th>
                    <th scope="col" className={th}>{t.columns.acquired}</th>
                    <th scope="col" className={th}>{t.columns.title}</th>
                  </tr>
                </thead>
                <tbody>
                  {declaration.realEstate.map((p, i) => (
                    <tr key={i} className="border-t border-[var(--line)]">
                      <th scope="row" className={`${cell} text-left font-normal`}>
                        {p.description}
                        <span className="label-mono ml-2 text-[var(--ink-3)]">{t.propertyKinds[p.kind]}</span>
                      </th>
                      <td className={cell}>{p.location ?? "—"}</td>
                      <td className={`${cell} mono`}>{p.acquired ?? "—"}</td>
                      <td className={cell}>{p.title ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Depósitos y otros bienes */}
          <h3 className="display mt-10 text-lg">{t.financial}</h3>
          <p className="label-mono mt-2 text-[var(--ink-3)]">{t.depositsNote}</p>
          {declaration.deposits.length + declaration.otherAssets.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--ink-3)]">{t.none}</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[30rem] border-collapse text-sm">
                <caption className="sr-only">{t.financial}</caption>
                <thead>
                  <tr className="label-mono text-left text-[var(--ink-3)]">
                    <th scope="col" className={th}>{t.columns.description}</th>
                    <th scope="col" className={th}>{t.columns.kind}</th>
                    <th scope="col" className={thNum}>{t.columns.amount}</th>
                  </tr>
                </thead>
                <tbody>
                  {declaration.deposits.map((d, i) => (
                    <tr key={`d${i}`} className="border-t border-[var(--line)]">
                      <th scope="row" className={`${cell} text-left font-normal`}>{d.description ?? "—"}</th>
                      <td className={`${cell} text-[var(--ink-3)]`}>{t.deposits}</td>
                      <td className={num}>{amount(d.amount, `deposits[${i}].amount`)}</td>
                    </tr>
                  ))}
                  {declaration.otherAssets.map((a, i) => (
                    <tr key={`a${i}`} className="border-t border-[var(--line)]">
                      <th scope="row" className={`${cell} text-left font-normal`}>{a.description ?? "—"}</th>
                      <td className={`${cell} text-[var(--ink-3)]`}>{t.assetKinds[a.kind]}</td>
                      <td className={num}>{amount(a.amount, `otherAssets[${i}].amount`)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-[var(--ink)]">
                    <th scope="row" colSpan={2} className={`${cell} text-left font-normal`}>{t.total}</th>
                    <td className={num}>{money(totals.financial)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {declaration.holdingsOver5pct && (
            <p className="mt-4 text-sm text-[var(--ink-2)]">
              <span className="label-mono mr-2 text-[var(--ink-3)]">{t.holdings}</span>
              {declaration.holdingsOver5pct}
            </p>
          )}

          {/* Vehículos */}
          <h3 className="display mt-10 text-lg">{t.vehicles}</h3>
          {declaration.vehicles.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--ink-3)]">{t.none}</p>
          ) : (
            <ul className="mt-4 text-sm">
              {declaration.vehicles.map((v, i) => (
                <li key={i} className="flex gap-4 border-t border-[var(--line)] py-2.5">
                  <span className="mono w-16 shrink-0 text-[var(--ink-3)]">{v.acquired ?? "—"}</span>
                  <span className="text-[var(--ink)]">{v.description}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Deudas */}
          <h3 className="display mt-10 text-lg">{t.debts}</h3>
          {declaration.loans.length === 0 && !declaration.otherDebts ? (
            <p className="mt-4 text-sm text-[var(--ink-3)]">{t.none}</p>
          ) : (
            declaration.loans.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[36rem] border-collapse text-sm">
                  <caption className="sr-only">{t.debts}</caption>
                  <thead>
                    <tr className="label-mono text-left text-[var(--ink-3)]">
                      <th scope="col" className={th}>{t.columns.description}</th>
                      <th scope="col" className={th}>{t.columns.granted}</th>
                      <th scope="col" className={thNum}>{t.columns.lent}</th>
                      <th scope="col" className={thNum}>{t.columns.pending}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {declaration.loans.map((l, i) => (
                      <tr key={i} className="border-t border-[var(--line)]">
                        <th scope="row" className={`${cell} text-left font-normal`}>{l.description}</th>
                        <td className={`${cell} mono`}>{l.granted ?? "—"}</td>
                        <td className={num}>{amount(l.amount, `loans[${i}].amount`)}</td>
                        <td className={num}>{amount(l.pending, `loans[${i}].pending`)}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-[var(--ink)]">
                      <th scope="row" colSpan={3} className={`${cell} text-left font-normal`}>{t.total}</th>
                      <td className={num}>{money(totals.debts)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          )}
          {declaration.otherDebts && (
            <p className="mt-4 text-sm text-[var(--ink-2)]">
              <span className="label-mono mr-2 text-[var(--ink-3)]">{t.otherDebts}</span>
              {declaration.otherDebts}
            </p>
          )}

          {declaration.observations && (
            <>
              <h3 className="display mt-10 text-lg">{t.observations}</h3>
              <p className="mt-4 max-w-[68ch] whitespace-pre-line text-sm text-[var(--ink-2)]">
                “{declaration.observations}”
              </p>
            </>
          )}
        </>
      )}

      <Interests interests={interests} foundationSlugs={foundationSlugs} t={t} locale={locale} bcp47={bcp47} />

      <Caveat label={caveatLabel} className="mt-8">
        {fill(t.caveat, { check: check.name })}
      </Caveat>
    </section>
  );
}

const TYPES = ["ACTIVIDAD", "FUNDACIONES", "DONACION", "OBSERVACIONES"] as const;

function Interests({
  interests,
  foundationSlugs,
  t,
  locale,
  bcp47,
}: {
  interests: InterestRow[];
  foundationSlugs: Set<string>;
  t: Dict["declarations"];
  locale: string;
  bcp47: string;
}) {
  // One block per filing (the initial declaration, then any modification), as Congreso dates them.
  const filings = new Map<string, InterestRow[]>();
  for (const r of interests) {
    const key = `${r.registered ?? ""}|${r.declaration ?? ""}`;
    filings.set(key, [...(filings.get(key) ?? []), r]);
  }
  const ordered = [...filings.entries()].sort(([a], [b]) => a.localeCompare(b));
  const typeTitle: Record<(typeof TYPES)[number], string> = {
    ACTIVIDAD: t.activities,
    FUNDACIONES: t.foundations,
    DONACION: t.donations,
    OBSERVACIONES: t.interestObservations,
  };

  return (
    <>
      <h3 className="display mt-12 text-lg">{t.interests}</h3>
      <p className="label-mono mt-2 text-[var(--ink-3)]">{t.interestsNote}</p>
      {interests.length === 0 && <p className="mt-4 text-sm text-[var(--ink-3)]">{t.noInterests}</p>}
      {ordered.map(([key, rows]) => {
        const [date, declaration] = key.split("|");
        return (
          <div key={key} className="mt-6">
            <p className="eyebrow">
              {declaration || "—"}
              {date && ` · ${formatDate(date, bcp47)}`}
            </p>
            {TYPES.map((type) => {
              const list = rows.filter((r) => r.type === type);
              if (list.length === 0) return null;
              return (
                <div key={type} className="mt-4">
                  <p className="label-mono text-[var(--gold-deep)]">{typeTitle[type]}</p>
                  <ul className="mt-2 text-sm">
                    {list.map((r, i) => (
                      <li key={i} className="border-t border-[var(--line)] py-2.5">
                        {type === "ACTIVIDAD" && (
                          <>
                            <p className="text-[var(--ink)]">
                              {r.description ?? "—"}
                              {r.employer && <span className="text-[var(--ink-2)]"> · {r.employer}</span>}
                            </p>
                            <p className="label-mono mt-1 text-[var(--ink-3)]">
                              {[r.period, r.sector && `${t.columns.sector}: ${r.sector}`].filter(Boolean).join(" · ")}
                            </p>
                          </>
                        )}
                        {type === "FUNDACIONES" && (
                          <p className="text-[var(--ink)]">
                            {r.recipient && foundationSlugs.has(entitySlug(r.recipient)) ? (
                              <Link
                                href={`/${locale}/fundacion/${entitySlug(r.recipient)}`}
                                className="text-[var(--gold-deep)] hover:underline"
                              >
                                {r.recipient}
                              </Link>
                            ) : (
                              (r.recipient ?? "—")
                            )}
                            {r.description && <span className="text-[var(--ink-2)]"> · {r.description}</span>}
                          </p>
                        )}
                        {type === "DONACION" && (
                          <p className="text-[var(--ink)]">
                            {r.description ?? "—"}
                            {r.benefactor && (
                              <span className="text-[var(--ink-2)]">
                                {" "}
                                · {t.columns.benefactor}: {r.benefactor}
                              </span>
                            )}
                          </p>
                        )}
                        {type === "OBSERVACIONES" && (
                          <p className="whitespace-pre-line text-[var(--ink-2)]">“{r.observations ?? r.description}”</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
