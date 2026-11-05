import Link from "next/link";
import type { InterestRow } from "@/lib/declarations";
import { entitySlug } from "@/lib/foundations";
import { formatDate } from "@/lib/format";
import type { Dict } from "@/lib/i18n";

/**
 * A deputy's declaration of economic interests, every row as Congreso's open
 * data publishes it: one block per filing (the initial declaration, then each
 * modification, in the order Congreso dates them), and inside each the
 * activities, the foundations and associations they contribute to, the gifts
 * received and their own observations.
 *
 * Everything is reproduced as written, including the sector, which each
 * declarant writes in their own way and which is never normalised here. A
 * declared recipient links to a party foundation's page only on an exact slug
 * match with one of the audited foundations, never on a resemblance.
 */
const TYPES = ["ACTIVIDAD", "FUNDACIONES", "DONACION", "OBSERVACIONES"] as const;

export default function Interests({
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

  if (interests.length === 0) return <p className="n-body">{t.noInterests}</p>;

  return (
    <div className="grid max-w-[52rem] gap-10">
      {ordered.map(([key, rows]) => {
        const [date, declaration] = key.split("|");
        return (
          <div key={key}>
            <p className="n-h3">
              {declaration || "—"}
              {date && <span className="n-meta ml-2 font-normal">{formatDate(date, bcp47)}</span>}
            </p>
            {TYPES.map((type) => {
              const list = rows.filter((r) => r.type === type);
              if (list.length === 0) return null;
              return (
                <div key={type} className="mt-5">
                  <p className="n-label">{typeTitle[type]}</p>
                  <ul className="mt-2">
                    {list.map((r, i) => (
                      <li key={i} className="border-t border-[var(--n-rule)] py-3">
                        {type === "ACTIVIDAD" && (
                          <>
                            <p>
                              {r.description ?? "—"}
                              {r.employer && <span className="text-[var(--n-ink-2)]">. {r.employer}</span>}
                            </p>
                            {(r.period || r.sector) && (
                              <p className="n-meta mt-0.5">
                                {[r.period, r.sector && `${t.columns.sector}: ${r.sector}`].filter(Boolean).join(". ")}
                              </p>
                            )}
                          </>
                        )}
                        {type === "FUNDACIONES" && (
                          <p>
                            {r.recipient && foundationSlugs.has(entitySlug(r.recipient)) ? (
                              <Link href={`/${locale}/fundacion/${entitySlug(r.recipient)}`}>{r.recipient}</Link>
                            ) : (
                              (r.recipient ?? "—")
                            )}
                            {r.description && <span className="text-[var(--n-ink-2)]">. {r.description}</span>}
                          </p>
                        )}
                        {type === "DONACION" && (
                          <p>
                            {r.description ?? "—"}
                            {r.benefactor && (
                              <span className="text-[var(--n-ink-2)]">
                                {" "}({t.columns.benefactor} {r.benefactor})
                              </span>
                            )}
                          </p>
                        )}
                        {type === "OBSERVACIONES" && (
                          <p className="whitespace-pre-line text-[var(--n-ink-2)]">
                            “{r.observations ?? r.description}”
                          </p>
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
    </div>
  );
}
