import type { ReactNode } from "react";
import { roleLabel } from "@/components/nuevo/roles";
import { topicLabel } from "@/components/nuevo/topics";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile, placeOf } from "@/lib/people";
import { getDict } from "@/lib/i18n";
import { euroExact, euroM, formatDate, integer, percent } from "@/lib/format";
import { declarationTotals } from "@/lib/declaration-totals.mjs";
import { tallyByGroup } from "@/lib/votes";
import { displayName, entitySlug, getFoundations, partyNifByFoundation } from "@/lib/foundations";
import { officeTies } from "@/lib/officeholder-ties";
import { ROLES } from "@/lib/foundation-people";
import { nameKey } from "@/lib/name-key.mjs";
import { COPY } from "./copy";

export const dynamic = "force-dynamic";

/**
 * The redesign prototype's person page.
 *
 * It answers, in this order, the question a reader arrives with: where does
 * this person's money come from, what do they declare owning, with whom do
 * they appear on the record, and how did they vote. A summary row states what
 * is on record before any table, and says "not on record" where nothing is.
 *
 * Two rules shape it. Nothing is added across sections: the form gives no
 * value for property, so a total of everything would be a guess dressed as a
 * figure. And the party's money is the party's: it is linked, with that said,
 * never shown as if it were the person's.
 */
export default async function PrototypePerson({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const profile = await getProfile(slug);
  if (!profile) notFound();
  const { locale, bcp47 } = getDict(localeParam);
  const t = COPY[locale];
  const { person, party, record, declaration: d, interests } = profile;
  const L = (path: string) => `/${locale}${path}`;

  const foundations = await getFoundations();
  const ties = await officeTies(partyNifByFoundation(foundations));
  const boardRoles = [...ties.byPerson.entries()]
    .filter(([, list]) => list.some((t) => t.slug === slug))
    .flatMap(([key]) => ROLES.filter((r) => nameKey(r.person) === key));

  const totals = d ? declarationTotals(d) : null;
  const incomeYear = d ? Number(d.filed.slice(0, 4)) - 1 : null;
  const securities = d?.otherAssets.filter((a) => a.kind === "securities") ?? [];
  const employers = interests.filter((r) => r.type === "ACTIVIDAD");
  const memberships = interests.filter((r) => r.type === "FUNDACIONES");
  const gifts = interests.filter((r) => r.type === "DONACION");
  const place = placeOf(person);

  // The finding for the income section: the largest declared line and its share.
  const incomeLines = (d?.income ?? []).filter((l) => typeof l.amount === "number");
  const largest = [...incomeLines].sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))[0];
  const incomeFinding =
    !totals?.income || !largest?.amount
      ? null
      : incomeLines.length === 1
        ? t.incomeFindingOne(
            incomeYear,
            (largest.concept ?? t.noConcept).toLowerCase(),
            euroExact(largest.amount, bcp47),
          )
        : t.incomeFindingMany(
            euroExact(totals.income, bcp47),
            incomeYear,
            (largest.concept ?? t.noConcept).toLowerCase(),
            percent(largest.amount / totals.income, bcp47, 0),
          );

  const voteFinding = (() => {
    if (!record.length) return null;
    const withGroup = record.filter((r) => {
      const g = tallyByGroup(r.vote).find((x) => x.group === r.group);
      if (!g) return false;
      const best = Math.max(g.si, g.no, g.abst);
      const majority = g.si === best ? "Sí" : g.no === best ? "No" : "Abstención";
      return majority === r.ballot;
    }).length;
    return t.voteFinding(withGroup, record.length);
  })();

  const summary = [
    {
      label: t.salaryLabel,
      value: person.gross > 0 ? euroExact(person.gross, bcp47) : t.notPublished,
      note: person.gross > 0 ? t.salaryPerYear : person.inRegister ? t.salaryNotPublished : t.salaryNotInRegister,
      muted: person.gross <= 0,
    },
    {
      label: t.incomeLabel,
      value: totals?.income != null ? euroExact(totals.income, bcp47) : t.noDeclaration,
      note: totals ? t.incomeNote(incomeYear) : t.notTranscribed,
      muted: totals?.income == null,
    },
    {
      label: t.financialLabel,
      value: totals?.financial != null ? euroExact(totals.financial, bcp47) : totals ? t.nothingDeclared : t.noDeclaration,
      note: d ? t.propertyNote(d.realEstate.length, integer(d.realEstate.length, bcp47)) : t.notTranscribed,
      muted: totals?.financial == null,
    },
    {
      label: t.debtsLabel,
      value: totals?.debts != null ? euroExact(totals.debts, bcp47) : totals ? t.noDebts : t.noDeclaration,
      note: d ? t.debtsNote : t.notTranscribed,
      muted: totals?.debts == null,
    },
  ];

  return (
    <main>
      <div className="n-shell pb-10 pt-6">
        <p className="n-meta">
          <Link href={L("/nuevo/personas")}>{t.people}</Link>
        </p>
        <h1 className="n-display mt-3" style={{ maxWidth: "22ch" }}>
          {person.deputy?.fullName ?? person.name}
        </h1>
        <p className="mt-4 text-[1.1rem] text-[var(--n-ink-2)]">
          {[person.deputy?.role ?? person.role, place].filter(Boolean).join(", ")}
          {party && (
            <>
              {". "}
              <Link href={L(`/nuevo/partido/${party.nif}`)}>{party.displayName}</Link>
            </>
          )}
          {person.deputy && `, ${person.deputy.group}.`}
        </p>

        {/* What is on record, before any table. */}
        <dl className="mt-10 grid gap-px overflow-hidden rounded-[6px] border border-[var(--n-rule)] bg-[var(--n-rule)] sm:grid-cols-2 lg:grid-cols-4">
          {summary.map((s) => (
            <div key={s.label} className="bg-[var(--n-card)] p-5">
              <dt className="n-label">{s.label}</dt>
              <dd
                className="n-figure mt-3"
                style={{ fontSize: s.muted ? "1.35rem" : "1.9rem", color: s.muted ? "var(--n-ink-3)" : undefined }}
              >
                {s.value}
              </dd>
              <dd className="n-meta mt-2">{s.note}</dd>
            </div>
          ))}
        </dl>
        <p className="n-meta mt-3 max-w-[60em]">
          {t.noSum}
        </p>
      </div>

      {/* ---------- Where the money comes from ---------- */}
      <Section id="ingresos" title={t.incomeTitle}>
        {d ? (
          <>
            {incomeFinding && <p className="n-finding">{incomeFinding}</p>}
            <table className="n-table mt-6 max-w-[48rem]">
              <caption className="sr-only">{t.incomeCaption(incomeYear)}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.colConcept}</th>
                  <th scope="col">{t.colType}</th>
                  <th scope="col" className="n-r">{t.colAmount}</th>
                </tr>
              </thead>
              <tbody>
                {d.income.map((l, i) => (
                  <tr key={i}>
                    <td>{l.concept ?? t.noConceptCap}</td>
                    <td className="text-[var(--n-ink-2)]">{t.incomeGroup[l.group]}</td>
                    <td className="n-r">{l.amount != null ? euroExact(l.amount, bcp47) : t.illegible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="n-source">
              {t.incomeSourcePre(formatDate(d.filed, bcp47))}
              <a href={d.url}>{t.originalDoc}</a>
              {t.incomeSourcePost}
            </p>
          </>
        ) : (
          <NoDeclaration isDeputy={!!person.deputy} t={t} />
        )}
      </Section>

      {/* ---------- What they declare owning ---------- */}
      {d && (
        <Section id="bienes" title={t.assetsTitle}>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h3 className="n-h3">{t.property}</h3>
              {d.realEstate.length ? (
                <ul className="mt-3">
                  {d.realEstate.map((p, i) => (
                    <li key={i} className="border-t border-[var(--n-rule)] py-3">
                      <p>{p.description}</p>
                      <p className="n-meta mt-0.5">
                        {[p.location, p.acquired && t.since(p.acquired), p.title].filter(Boolean).join(". ")}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[var(--n-ink-2)]">{t.noProperty}</p>
              )}
            </div>
            <div>
              <h3 className="n-h3">{t.financialTitle}</h3>
              <table className="n-table mt-3">
                <caption className="sr-only">{t.financialCaption}</caption>
                <tbody>
                  {d.deposits.map((a, i) => (
                    <tr key={`d${i}`}>
                      <td>{a.description ?? t.accounts}</td>
                      <td className="n-r">{a.amount != null ? euroExact(a.amount, bcp47) : "—"}</td>
                    </tr>
                  ))}
                  {d.otherAssets.map((a, i) => (
                    <tr key={`o${i}`} className={a.kind === "securities" ? "n-companies" : undefined}>
                      <td>
                        {a.kind === "securities" && (
                          <span aria-hidden className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: "var(--route)" }} />
                        )}
                        {a.description ?? t.noDescription}
                        {a.kind === "securities" && <span className="sr-only">{t.securitiesSr}</span>}
                      </td>
                      <td className="n-r">{a.amount != null ? euroExact(a.amount, bcp47) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {d.holdingsOver5pct && (
                <p className="mt-4 text-[0.95rem]">
                  <span className="n-label">{t.holdings}</span>
                  {d.holdingsOver5pct}
                </p>
              )}
              {d.loans.length > 0 && (
                <>
                  <h3 className="n-h3 mt-8">{t.debtsTitle}</h3>
                  <ul className="mt-2">
                    {d.loans.map((l, i) => (
                      <li key={i} className="flex justify-between gap-4 border-t border-[var(--n-rule)] py-3">
                        <span>{l.description}</span>
                        <span className="n-num whitespace-nowrap">
                          {l.pending != null ? euroExact(l.pending, bcp47) : "—"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
          <p className="n-source">
            {t.verifiedPre(d.verified.method === "rtve")} <a href={d.url}>{t.viewOriginal}</a>.
          </p>
        </Section>
      )}

      {/* ---------- Connections ---------- */}
      <Section id="conexiones" title={t.connectionsTitle}>
        <p className="n-body">{t.connectionsIntro}</p>
        <ol className="mt-8 max-w-[46rem]">
          {party && (
            <Station cls="n-state" kind={t.kindParty}>
              <Link href={L(`/nuevo/partido/${party.nif}`)}>{party.displayName}</Link>
              <p className="n-meta mt-1">
                {t.partyMoney(euroM(party.total, bcp47, 1))}
              </p>
            </Station>
          )}
          {securities.map((a, i) => (
            <Station key={`s${i}`} cls="n-companies" kind={t.kindSecurities}>
              {a.description ?? t.noDescription}
              {a.amount != null && <span className="n-meta"> {euroExact(a.amount, bcp47)}</span>}
            </Station>
          ))}
          {boardRoles.map((r) => (
            <Station key={r.foundation + r.role} cls="n-foundations" kind={t.roleIn(roleLabel(r.role, locale))}>
              <Link href={L(`/nuevo/fundacion/${entitySlug(r.foundation)}`)}>{displayName(r.foundation)}</Link>
            </Station>
          ))}
          {employers.map((r, i) => (
            <Station key={`e${i}`} cls="n-neutral" kind={t.worked(r.period || null)}>
              {r.employer ?? r.description ?? t.noName}
              {r.sector && <p className="n-meta mt-1">{r.sector}</p>}
            </Station>
          ))}
          {memberships.map((r, i) => (
            <Station key={`m${i}`} cls="n-neutral" kind={t.kindContributes}>
              {r.recipient ?? r.description ?? t.noName}
            </Station>
          ))}
          {gifts.map((r, i) => (
            <Station key={`g${i}`} cls="n-neutral" kind={t.kindGift}>
              {r.description ?? t.noDescription}
              {r.benefactor && <p className="n-meta mt-1">{t.giftFrom(r.benefactor)}</p>}
            </Station>
          ))}
        </ol>
        {!party && !securities.length && !boardRoles.length && !interests.length && (
          <p className="mt-4 text-[var(--n-ink-2)]">{t.noConnection}</p>
        )}
        <p className="n-source">
          {t.connectionsSource}
        </p>
      </Section>

      {/* ---------- Votes ---------- */}
      {record.length > 0 && (
        <Section id="votos" title={t.votesTitle}>
          {voteFinding && <p className="n-finding">{voteFinding}</p>}
          <table className="n-table mt-6">
            <caption className="sr-only">{t.votesCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{t.colVote}</th>
                <th scope="col">{t.colTheirVote}</th>
                <th scope="col">{t.colTheirGroup}</th>
              </tr>
            </thead>
            <tbody>
              {record.map((r) => {
                const g = tallyByGroup(r.vote).find((x) => x.group === r.group);
                return (
                  <tr key={r.vote.id}>
                    <td>
                      <a href={r.vote.sourceUrl}>{r.vote.law}</a>
                      <p className="n-meta mt-0.5">
                        {topicLabel(r.vote.topic, r.vote.topicLabel, locale)}, {r.vote.date}
                        {r.vote.binding ? "" : t.noLegalEffect}
                      </p>
                    </td>
                    <td className="font-bold">{t.ballot[r.ballot] ?? t.noVote}</td>
                    <td className="n-num text-[var(--n-ink-2)]">
                      {g ? t.groupTally(g.si, g.no, g.abst) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="n-source">{t.votesSource}</p>
        </Section>
      )}

      {/* ---------- Citing ---------- */}
      <Section id="citar" title={t.citeTitle}>
        <p className="max-w-[46rem] rounded-[6px] border border-[var(--n-rule)] bg-[var(--n-card)] p-5 text-[0.95rem] [overflow-wrap:anywhere]">
          {t.cite(
            person.deputy?.fullName ?? person.name,
            formatDate(new Date().toISOString().slice(0, 10), bcp47),
          )}
          {d && t.citeDeclaration(formatDate(d.filed, bcp47), d.url)}
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

/** One organisation on the person's line, in its route's colour. */
function Station({ cls, kind, children }: { cls: string; kind: string; children: ReactNode }) {
  return (
    <li className={`${cls} relative pb-6 pl-9 last:pb-0`}>
      {/* The line itself, and the station on it. */}
      <span aria-hidden className="absolute bottom-0 left-[9px] top-0 w-[4px]" style={{ background: "var(--route)" }} />
      <span
        aria-hidden
        className="absolute left-0 top-[3px] h-[22px] w-[22px] rounded-full border-[3px] bg-[var(--n-card)]"
        style={{ borderColor: "var(--route)" }}
      />
      <p className="n-label">{kind}</p>
      <div className="mt-0.5">{children}</div>
    </li>
  );
}

function NoDeclaration({ isDeputy, t }: { isDeputy: boolean; t: (typeof COPY)["es"] }) {
  return (
    <p className="max-w-[40em] text-[var(--n-ink-2)]">
      {isDeputy ? t.queueDeputy : t.queueOther}
    </p>
  );
}
