import type { ReactNode } from "react";
import { roleLabel } from "@/components/nuevo/roles";
import { KIND_SHORT, topicLabel } from "@/components/nuevo/topics";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile, placeOf } from "@/lib/people";
import { getDict } from "@/lib/i18n";
import { euro, euroExact, euroM, fill, formatDate, integer, percent } from "@/lib/format";
import { declarationTotals } from "@/lib/declaration-totals.mjs";
import { getVotes, tallyByGroup } from "@/lib/votes";
import { groupLabel } from "@/lib/groups";
import { displayName, entities, entitySlug, getFoundations, partyNifByFoundation } from "@/lib/foundations";
import { officeTies } from "@/lib/officeholder-ties";
import { ROLES } from "@/lib/foundation-people";
import { nameKey } from "@/lib/name-key.mjs";
import { getSalaryDistribution, positionOf } from "@/lib/salary-distribution";
import { getSalaries } from "@/lib/salaries";
import { getIndicators, smiLadder, sourceFor } from "@/lib/indicators";
import { currentSmi } from "@/lib/smi";
import { getDeclarations } from "@/lib/declarations";
import { DONATIONS_SOURCE } from "@/lib/donations";
import { salariesSource, votesSource } from "@/lib/chart-sources";
import Portrait from "@/components/nuevo/Portrait";
import PayDistribution from "@/components/nuevo/PayDistribution";
import SmiPosition from "@/components/nuevo/SmiPosition";
import BallotStrip from "@/components/nuevo/BallotStrip";
import Interests from "@/components/nuevo/Interests";
import BlueskyFeed from "@/components/nuevo/BlueskyFeed";
import NewsFeed from "@/components/nuevo/NewsFeed";
import SourceText from "@/components/nuevo/SourceText";
import { COPY } from "./copy";

export const dynamic = "force-dynamic";

/**
 * The person page.
 *
 * It answers, in this order, the question a reader arrives with: what public
 * pay this person draws and where it sits, where the rest of their money comes
 * from, what they declare owning and their economic interests, with whom they
 * appear on the record, and how they voted. A summary row states what is on
 * record before any table, and says "not on record" where nothing is.
 *
 * Two rules shape it. Nothing is added across sections: the form gives no
 * value for property, so a total of everything would be a guess dressed as a
 * figure (each section's own declared total is shown, as the form groups it).
 * And the party's money is the party's: it is linked, with that said, never
 * shown as if it were the person's, and never as an explanation of a vote.
 */
export default async function PersonPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const profile = await getProfile(slug);
  if (!profile) notFound();
  const { locale, bcp47, t: dict } = getDict(localeParam);
  const t = COPY[locale];
  const D = dict.declarations;
  const P = dict.people;
  const { person, party, donations, portrait, social, record, declaration: d, interests } = profile;
  const L = (path: string) => `/${locale}${path}`;

  const [foundations, allVotes, distribution, position, salaries, indicators, declarations] = await Promise.all([
    getFoundations(),
    getVotes(),
    getSalaryDistribution(),
    positionOf(person.gross),
    getSalaries(),
    getIndicators(),
    getDeclarations(),
  ]);
  const ties = await officeTies(partyNifByFoundation(foundations));
  const boardRoles = [...ties.byPerson.entries()]
    .filter(([, list]) => list.some((t) => t.slug === slug))
    .flatMap(([key]) => ROLES.filter((r) => nameKey(r.person) === key));
  const foundationSlugs = new Set(entities(foundations).map((e) => e.slug));
  const smi = currentSmi();
  const name = person.deputy?.fullName ?? person.name;

  const totals = d ? declarationTotals(d) : null;
  const incomeYear = d ? Number(d.filed.slice(0, 4)) - 1 : null;
  const securities = d?.otherAssets.filter((a) => a.kind === "securities") ?? [];
  const employers = interests.filter((r) => r.type === "ACTIVIDAD");
  const memberships = interests.filter((r) => r.type === "FUNDACIONES");
  const gifts = interests.filter((r) => r.type === "DONACION");
  const place = placeOf(person);

  // The Bienes y Rentas filings the Congreso ficha links: the first is the one
  // transcribed here; later ones are linked to their PDF.
  const bienes = person.deputy?.filings.filter((f) => f.kind === "bienes") ?? [];
  const firstFiling = bienes[0] ?? null;
  const laterFilings = bienes.slice(1);

  // Declared amounts keep their cents only where the deputy wrote some; an
  // amount left blank is "—", never 0. An amount the scan writes other than in
  // Spanish format is also shown as written.
  const money = (n: number | null) =>
    n === null ? "—" : Number.isInteger(n) ? euro(n, bcp47) : euroExact(n, bcp47);
  const noted = new Map((d?.notes ?? []).map((n) => [n.path, n.written]));
  const amount = (n: number | null, path: string) => (
    <>
      {money(n)}
      {noted.has(path) && (
        <span className="n-meta block whitespace-normal">{fill(D.writtenAs, { text: noted.get(path)! })}</span>
      )}
    </>
  );

  // The finding for the income section: the largest declared line and its share.
  const incomeLines = (d?.income ?? []).filter((l) => typeof l.amount === "number");
  const largest = [...incomeLines].sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))[0];
  const incomeFinding =
    !totals?.income || !largest?.amount
      ? null
      : incomeLines.length === 1
        ? t.incomeFindingOne(incomeYear, (largest.concept ?? t.noConcept).toLowerCase(), euroExact(largest.amount, bcp47))
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

  // No published pay is a gap, not a zero: "—", and why.
  const payGap = person.inRegister ? `${P.noPay}. ${P.noPayExplain}` : P.notInRegister;

  const summary = [
    {
      label: t.salaryLabel,
      value: person.gross > 0 ? euroExact(person.gross, bcp47) : "—",
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

  const ine = sourceFor(indicators, "smiTranches");

  return (
    <main>
      <div className="n-shell pb-10 pt-6">
        <p className="n-meta">
          <Link href={L("/personas")}>{t.people}</Link>
        </p>
        <div className="mt-3 flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="n-display" style={{ maxWidth: "22ch" }}>
              {name}
            </h1>
            <p className="mt-4 text-[1.1rem] text-[var(--n-ink-2)]">
              {[person.deputy?.role ?? person.role, place].filter(Boolean).join(", ")}
              {party ? (
                <>
                  {". "}
                  <Link href={L(`/partido/${party.nif}`)}>{party.displayName}</Link>
                </>
              ) : (
                person.partyShort && `. ${person.partyShort}`
              )}
              {person.deputy && `, ${person.deputy.group}.`}
            </p>
          </div>
          <Portrait name={name} portrait={portrait} color={party?.color} photoLabel={t.photo} />
        </div>

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
        <p className="n-meta mt-3 max-w-[60em]">{t.noSum}</p>
      </div>

      {/* ---------- Public pay ---------- */}
      <Section id="sueldo" title={t.payTitle}>
        {person.gross > 0 ? (
          <p className="n-state">
            <span className="n-figure n-route-text text-[2.2rem]">{euro(person.gross, bcp47)}</span>{" "}
            <span className="text-[var(--n-ink-2)]">{t.payPerYear}</span>
          </p>
        ) : (
          <>
            <p className="n-figure text-[2.2rem] text-[var(--n-ink-3)]">—</p>
            <p className="n-body mt-3">{payGap}</p>
          </>
        )}

        {/* Both charts place a register figure. For someone the register does
            not carry, their "the register publishes no figure for this post"
            lines would be false, so they are not drawn. */}
        {person.inRegister && (
          <>
            <PayDistribution
              gross={person.gross}
              distribution={distribution}
              position={position}
              t={dict.salaryShape}
              showTable={dict.charts.showTable}
              source={salariesSource(salaries, dict.charts, bcp47)}
              sourceLabel={dict.charts.source}
              bcp47={bcp47}
            />
            <SmiPosition
              gross={person.gross > 0 ? person.gross : null}
              tranches={smiLadder(indicators)}
              smi={smi}
              t={dict.smiPosition}
              sources={[
                { publisher: "INE", name: ine.name, period: ine.period, url: ine.url },
                { publisher: "BOE", name: smi.boe.title, period: String(smi.year), url: smi.boe.url },
              ]}
              sourceLabel={dict.charts.source}
              bcp47={bcp47}
            />
          </>
        )}
      </Section>

      {/* ---------- Where the money comes from ---------- */}
      <Section id="ingresos" title={t.incomeTitle}>
        {person.deputy && firstFiling && (
          <div className="n-meta mb-6 max-w-[var(--n-w-read)]">
            <p>
              {fill(D.filed, {
                date: formatDate(firstFiling.date!, bcp47),
                year: String(Number(firstFiling.date!.slice(0, 4)) - 1),
              })}{" "}
              <a href={firstFiling.url}>{D.officialPdf}</a>
            </p>
            {laterFilings.length > 0 && (
              <p className="mt-1">
                {D.later}{" "}
                {laterFilings.map((f, i) => (
                  <span key={f.url}>
                    {i > 0 && ", "}
                    <a href={f.url}>{formatDate(f.date!, bcp47)}</a>
                  </span>
                ))}
              </p>
            )}
            {d && d.notes.length > 0 && <p className="mt-1 font-bold text-[var(--n-ink-2)]">{D.notesFlag}</p>}
          </div>
        )}
        {d && totals ? (
          <>
            {incomeFinding && <p className="n-finding">{incomeFinding}</p>}
            {d.income.length === 0 ? (
              <p className="mt-4 text-[var(--n-ink-2)]">{D.none}</p>
            ) : (
              <div className="mt-6 max-w-[48rem] overflow-x-auto">
                <table className="n-table">
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
                        <td className="n-r">{amount(l.amount, `income[${i}].amount`)}</td>
                      </tr>
                    ))}
                    <tr>
                      <th scope="row" colSpan={2}>{D.total}</th>
                      <td className="n-r font-bold">{money(totals.income)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-4">
              <span className="n-label">{D.irpf}: </span>
              <span className="n-num">{amount(totals.irpf, "irpf")}</span>
            </p>
            <p className="n-source">
              {t.incomeSourcePre(formatDate(d.filed, bcp47))}
              <a href={d.url}>{t.originalDoc}</a>
              {t.incomeSourcePost}
            </p>
          </>
        ) : (
          <NoDeclaration isDeputy={!!person.deputy} hasFiling={!!firstFiling} noFiling={D.noFiling} t={t} />
        )}
      </Section>

      {/* ---------- What they declare owning ---------- */}
      {d && totals && (
        <Section id="bienes" title={t.assetsTitle}>
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="min-w-0">
              <h3 className="n-h3">{t.property}</h3>
              <p className="n-meta mt-1">{D.realEstateNote}</p>
              {d.realEstate.length ? (
                <ul className="mt-3">
                  {d.realEstate.map((p, i) => (
                    <li key={i} className="border-t border-[var(--n-rule)] py-3">
                      <p>
                        {p.description}
                        <span className="n-meta ml-2">{D.propertyKinds[p.kind]}</span>
                      </p>
                      <p className="n-meta mt-0.5">
                        {[p.location, p.acquired && t.since(p.acquired), p.title].filter(Boolean).join(". ")}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[var(--n-ink-2)]">{t.noProperty}</p>
              )}

              <h3 className="n-h3 mt-10">{D.vehicles}</h3>
              {d.vehicles.length ? (
                <ul className="mt-3">
                  {d.vehicles.map((v, i) => (
                    <li key={i} className="flex gap-4 border-t border-[var(--n-rule)] py-3">
                      <span className="n-num w-16 shrink-0 text-[var(--n-ink-3)]">{v.acquired ?? "—"}</span>
                      <span>{v.description}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[var(--n-ink-2)]">{D.none}</p>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="n-h3">{t.financialTitle}</h3>
              <p className="n-meta mt-1">{D.depositsNote}</p>
              {d.deposits.length + d.otherAssets.length === 0 ? (
                <p className="mt-3 text-[var(--n-ink-2)]">{D.none}</p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="n-table">
                    <caption className="sr-only">{t.financialCaption}</caption>
                    <thead>
                      <tr>
                        <th scope="col">{D.columns.description}</th>
                        <th scope="col">{D.columns.kind}</th>
                        <th scope="col" className="n-r">{t.colAmount}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.deposits.map((a, i) => (
                        <tr key={`d${i}`}>
                          <td>{a.description ?? t.accounts}</td>
                          <td className="text-[var(--n-ink-2)]">{D.deposits}</td>
                          <td className="n-r">{amount(a.amount, `deposits[${i}].amount`)}</td>
                        </tr>
                      ))}
                      {d.otherAssets.map((a, i) => (
                        <tr key={`o${i}`} className={a.kind === "securities" ? "n-companies" : undefined}>
                          <td>
                            {a.kind === "securities" && (
                              <span aria-hidden className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: "var(--route)" }} />
                            )}
                            {a.description ?? t.noDescription}
                          </td>
                          <td className="text-[var(--n-ink-2)]">{D.assetKinds[a.kind]}</td>
                          <td className="n-r">{amount(a.amount, `otherAssets[${i}].amount`)}</td>
                        </tr>
                      ))}
                      <tr>
                        <th scope="row" colSpan={2}>{D.total}</th>
                        <td className="n-r font-bold">{money(totals.financial)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {d.holdingsOver5pct && (
                <p className="mt-4 text-[0.95rem]">
                  <span className="n-label">{D.holdings}: </span>
                  {d.holdingsOver5pct}
                </p>
              )}

              <h3 className="n-h3 mt-10">{t.debtsTitle}</h3>
              {d.loans.length === 0 && !d.otherDebts ? (
                <p className="mt-3 text-[var(--n-ink-2)]">{D.none}</p>
              ) : (
                d.loans.length > 0 && (
                  <div className="mt-3 overflow-x-auto">
                    <table className="n-table min-w-[28rem]">
                      <caption className="sr-only">{D.debts}</caption>
                      <thead>
                        <tr>
                          <th scope="col">{D.columns.description}</th>
                          <th scope="col">{D.columns.granted}</th>
                          <th scope="col" className="n-r">{D.columns.lent}</th>
                          <th scope="col" className="n-r">{D.columns.pending}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.loans.map((l, i) => (
                          <tr key={i}>
                            <td>{l.description}</td>
                            <td className="n-num">{l.granted ?? "—"}</td>
                            <td className="n-r">{amount(l.amount, `loans[${i}].amount`)}</td>
                            <td className="n-r">{amount(l.pending, `loans[${i}].pending`)}</td>
                          </tr>
                        ))}
                        <tr>
                          <th scope="row" colSpan={3}>{D.total}</th>
                          <td className="n-r font-bold">{money(totals.debts)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              )}
              {d.otherDebts && (
                <p className="mt-4 text-[0.95rem]">
                  <span className="n-label">{D.otherDebts}: </span>
                  {d.otherDebts}
                </p>
              )}
            </div>
          </div>

          {d.observations && (
            <>
              <h3 className="n-h3 mt-10">{D.observations}</h3>
              <p className="n-body mt-3 whitespace-pre-line">“{d.observations}”</p>
            </>
          )}

          <p className="n-source">
            {d.verified.method === "rtve" ? (
              <>
                {D.checkRtve} <a href={declarations.check.url}>{declarations.check.name}</a>.
              </>
            ) : (
              D.checkSecond
            )}{" "}
            <a href={d.url}>{t.viewOriginal}</a>.
          </p>
        </Section>
      )}

      {/* ---------- Economic interests, and what to know about any declaration ---------- */}
      {person.deputy && (
        <Section id="intereses" title={t.declarationTitle}>
          <p className="n-body mb-8">{D.interestsNote}</p>
          <Interests interests={interests} foundationSlugs={foundationSlugs} t={D} locale={locale} bcp47={bcp47} />
          <details className="mt-10 max-w-[var(--n-w-read)]">
            <summary className="cursor-pointer font-bold">{dict.common.caveat}</summary>
            <p className="n-meta mt-3">{fill(D.caveat, { check: declarations.check.name })}</p>
          </details>
        </Section>
      )}

      {/* ---------- Connections ---------- */}
      <Section id="conexiones" title={t.connectionsTitle}>
        <p className="n-body">{t.connectionsIntro}</p>
        <ol className="mt-8 max-w-[46rem]">
          {party && (
            <Station cls="n-state" kind={t.kindParty}>
              <Link href={L(`/partido/${party.nif}`)}>{party.displayName}</Link>
              <p className="n-meta mt-1">{t.partyMoney(euroM(party.total, bcp47, 1), percent(party.share, bcp47))}</p>
              {donations && (
                <p className="n-meta mt-1">
                  {t.partyDonations(euroExact(donations.total.amount, bcp47), DONATIONS_SOURCE.year)}
                </p>
              )}
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
              <Link href={L(`/fundacion/${entitySlug(r.foundation)}`)}>{displayName(r.foundation)}</Link>
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
        {party && <p className="n-meta mt-6 max-w-[var(--n-w-read)]">{P.juxtaposition}</p>}
        <p className="n-source">{t.connectionsSource}</p>
      </Section>

      {/* ---------- Votes ---------- */}
      <Section id="votos" title={t.votesTitle}>
        {record.length === 0 ? (
          <>
            <p className="n-finding">{P.noRecord}.</p>
            <p className="n-body mt-3">{P.noRecordExplain}</p>
          </>
        ) : (
          <>
            {voteFinding && <p className="n-finding">{voteFinding}</p>}
            <p className="n-body mt-3">{t.votesNote}</p>
            {person.deputy && <p className="n-meta mt-2 max-w-[var(--n-w-read)]">{D.juxtaposition}</p>}
            <BallotStrip record={record} votes={allVotes.votes} t={dict} locale={locale} bcp47={bcp47} />
            <div className="mt-10 overflow-x-auto">
              <table className="n-table">
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
                            {topicLabel(r.vote.topic, r.vote.topicLabel, locale)},{" "}
                            {KIND_SHORT[locale][r.vote.kind] ?? r.vote.kindLabel}, {r.vote.date}
                            {r.vote.binding ? "" : t.noLegalEffect}
                          </p>
                        </td>
                        <td className="font-bold">{t.ballot[r.ballot] ?? t.noVote}</td>
                        <td className="n-num text-[var(--n-ink-2)]">
                          {groupLabel(r.vote.legislature, r.group)}
                          <span className="n-meta block">{g ? t.groupTally(g.si, g.no, g.abst) : "—"}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        <SourceText sources={[votesSource(allVotes, dict.charts, bcp47)]} label={dict.charts.source} />
      </Section>

      {/* ---------- Their own posts: verified handles only ---------- */}
      {social?.bluesky && (
        <Section id="bluesky" title={t.blueskyTitle}>
          <p className="n-meta">
            <a href={`https://bsky.app/profile/${social.bluesky}`} target="_blank" rel="noopener noreferrer">
              @{social.bluesky}
            </a>
          </p>
          <BlueskyFeed actor={social.bluesky} locale={locale} />
        </Section>
      )}

      {/* ---------- Headlines ---------- */}
      <Section id="noticias" title={t.newsTitle}>
        <p className="n-meta">{dict.party.recentHeadlines}</p>
        <NewsFeed query={person.name} locale={locale} />
      </Section>

      {/* ---------- Citing ---------- */}
      <Section id="citar" title={t.citeTitle}>
        <p className="max-w-[46rem] rounded-[6px] border border-[var(--n-rule)] bg-[var(--n-card)] p-5 text-[0.95rem] [overflow-wrap:anywhere]">
          {t.cite(name, formatDate(new Date().toISOString().slice(0, 10), bcp47))}
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

/**
 * No transcribed declaration. A deputy whose ficha links no filing is told
 * that, not that one is queued; a deputy with a filing waiting is pointed to
 * the official PDF above; anyone else is not a deputy, and the site publishes
 * declarations only for deputies.
 */
function NoDeclaration({
  isDeputy,
  hasFiling,
  noFiling,
  t,
}: {
  isDeputy: boolean;
  hasFiling: boolean;
  noFiling: string;
  t: (typeof COPY)["es"];
}) {
  return (
    <p className="max-w-[40em] text-[var(--n-ink-2)]">
      {!isDeputy ? t.queueOther : hasFiling ? t.queueDeputy : noFiling}
    </p>
  );
}
