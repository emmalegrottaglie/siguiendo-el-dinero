import type { ReactNode } from "react";
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
const INCOME_GROUP: Record<string, string> = {
  salary: "Rendimientos del trabajo",
  dividends: "Dividendos y participaciones",
  interest: "Intereses",
  other: "Otras rentas",
};

const BALLOT: Record<string, string> = {
  Sí: "A favor",
  No: "En contra",
  Abstención: "Abstención",
};

export default async function PrototypePerson({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const profile = await getProfile(slug);
  if (!profile) notFound();
  const { locale, bcp47 } = getDict(localeParam);
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
        ? `Declaró un solo ingreso en ${incomeYear}: ${(largest.concept ?? "sin concepto").toLowerCase()}, ${euroExact(largest.amount, bcp47)}.`
        : `Declaró ${euroExact(totals.income, bcp47)} de ingresos en ${incomeYear}. El mayor, ${(largest.concept ?? "sin concepto").toLowerCase()}, es el ${percent(largest.amount / totals.income, bcp47, 0)} del total.`;

  const voteFinding = (() => {
    if (!record.length) return null;
    const withGroup = record.filter((r) => {
      const g = tallyByGroup(r.vote).find((x) => x.group === r.group);
      if (!g) return false;
      const best = Math.max(g.si, g.no, g.abst);
      const majority = g.si === best ? "Sí" : g.no === best ? "No" : "Abstención";
      return majority === r.ballot;
    }).length;
    return `Votó como la mayoría de su grupo en ${withGroup} de las ${record.length} votaciones que sigue esta web.`;
  })();

  const summary = [
    {
      label: "Sueldo público",
      value: person.gross > 0 ? euroExact(person.gross, bcp47) : "No publicado",
      note: person.gross > 0 ? "al año, según el Registro de Altos Cargos" : person.inRegister ? "El registro no publica sueldo para este cargo" : "No consta en el Registro de Altos Cargos",
      muted: person.gross <= 0,
    },
    {
      label: "Ingresos declarados",
      value: totals?.income != null ? euroExact(totals.income, bcp47) : "Sin declaración",
      note: totals ? `en ${incomeYear}, sin contar el sueldo de diputado` : "transcrita todavía",
      muted: totals?.income == null,
    },
    {
      label: "Cuentas, valores y otros bienes",
      value: totals?.financial != null ? euroExact(totals.financial, bcp47) : totals ? "Nada declarado" : "Sin declaración",
      note: d ? `y ${integer(d.realEstate.length, bcp47)} inmuebles, que el formulario no valora` : "transcrita todavía",
      muted: totals?.financial == null,
    },
    {
      label: "Deudas pendientes",
      value: totals?.debts != null ? euroExact(totals.debts, bcp47) : totals ? "Ninguna" : "Sin declaración",
      note: d ? "préstamos, saldo pendiente" : "transcrita todavía",
      muted: totals?.debts == null,
    },
  ];

  return (
    <main>
      <div className="n-shell pb-10 pt-6">
        <p className="n-meta">
          <Link href={L("/politicos")}>Personas</Link>
        </p>
        <h1 className="n-display mt-3" style={{ maxWidth: "22ch" }}>
          {person.deputy?.fullName ?? person.name}
        </h1>
        <p className="mt-4 text-[1.1rem] text-[var(--n-ink-2)]">
          {[person.deputy?.role ?? person.role, place].filter(Boolean).join(", ")}
          {party && (
            <>
              {". "}
              <Link href={L(`/party/${party.nif}`)}>{party.displayName}</Link>
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
          Las cifras no se suman entre sí: el formulario no da valor a los inmuebles, y un total con
          ellos fuera sería un patrimonio inventado.
        </p>
      </div>

      {/* ---------- Where the money comes from ---------- */}
      <Section id="ingresos" title="De dónde le viene el dinero">
        {d ? (
          <>
            {incomeFinding && <p className="n-finding">{incomeFinding}</p>}
            <table className="n-table mt-6 max-w-[48rem]">
              <caption className="sr-only">Ingresos declarados en {incomeYear}</caption>
              <thead>
                <tr>
                  <th scope="col">Concepto, como lo escribió</th>
                  <th scope="col">Tipo</th>
                  <th scope="col" className="n-r">Importe</th>
                </tr>
              </thead>
              <tbody>
                {d.income.map((l, i) => (
                  <tr key={i}>
                    <td>{l.concept ?? "Sin concepto"}</td>
                    <td className="text-[var(--n-ink-2)]">{INCOME_GROUP[l.group]}</td>
                    <td className="n-r">{l.amount != null ? euroExact(l.amount, bcp47) : "Ilegible"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="n-source">
              Fuente: declaración de bienes y rentas registrada en el Congreso el{" "}
              {formatDate(d.filed, bcp47)} (<a href={d.url}>documento original</a>). Ingresos del año
              anterior; el formulario excluye el sueldo de diputado.
            </p>
          </>
        ) : (
          <NoDeclaration isDeputy={!!person.deputy} />
        )}
      </Section>

      {/* ---------- What they declare owning ---------- */}
      {d && (
        <Section id="bienes" title="Lo que declara poseer">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h3 className="n-h3">Inmuebles</h3>
              {d.realEstate.length ? (
                <ul className="mt-3">
                  {d.realEstate.map((p, i) => (
                    <li key={i} className="border-t border-[var(--n-rule)] py-3">
                      <p>{p.description}</p>
                      <p className="n-meta mt-0.5">
                        {[p.location, p.acquired && `desde ${p.acquired}`, p.title].filter(Boolean).join(". ")}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[var(--n-ink-2)]">No declara inmuebles.</p>
              )}
            </div>
            <div>
              <h3 className="n-h3">Cuentas, valores y otros bienes</h3>
              <table className="n-table mt-3">
                <caption className="sr-only">Cuentas, valores y otros bienes declarados</caption>
                <tbody>
                  {d.deposits.map((a, i) => (
                    <tr key={`d${i}`}>
                      <td>{a.description ?? "Cuentas"}</td>
                      <td className="n-r">{a.amount != null ? euroExact(a.amount, bcp47) : "—"}</td>
                    </tr>
                  ))}
                  {d.otherAssets.map((a, i) => (
                    <tr key={`o${i}`} className={a.kind === "securities" ? "n-companies" : undefined}>
                      <td>
                        {a.kind === "securities" && (
                          <span aria-hidden className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: "var(--route)" }} />
                        )}
                        {a.description ?? "Sin descripción"}
                        {a.kind === "securities" && <span className="sr-only"> (valores)</span>}
                      </td>
                      <td className="n-r">{a.amount != null ? euroExact(a.amount, bcp47) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {d.holdingsOver5pct && (
                <p className="mt-4 text-[0.95rem]">
                  <span className="n-label">Sociedades participadas por sus sociedades: </span>
                  {d.holdingsOver5pct}
                </p>
              )}
              {d.loans.length > 0 && (
                <>
                  <h3 className="n-h3 mt-8">Deudas</h3>
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
            Transcrito del escaneo y comprobado{" "}
            {d.verified.method === "rtve"
              ? "contra la transcripción independiente de RTVE"
              : "con una segunda lectura independiente"}
            . <a href={d.url}>Ver el documento original</a>.
          </p>
        </Section>
      )}

      {/* ---------- Connections ---------- */}
      <Section id="conexiones" title="Con quién aparece en el registro">
        <p className="n-body">
          Organizaciones con las que esta persona consta en un registro oficial. Que aparezcan
          juntas no dice nada sobre por qué.
        </p>
        <ol className="mt-8 max-w-[46rem]">
          {party && (
            <Station cls="n-state" kind="Su partido">
              <Link href={L(`/party/${party.nif}`)}>{party.displayName}</Link>
              <p className="n-meta mt-1">
                El partido recibió {euroM(party.total, bcp47, 1)} en subvenciones del Estado. Es dinero
                del partido, no de esta persona.
              </p>
            </Station>
          )}
          {securities.map((a, i) => (
            <Station key={`s${i}`} cls="n-companies" kind="Declara valores">
              {a.description ?? "Sin descripción"}
              {a.amount != null && <span className="n-meta"> {euroExact(a.amount, bcp47)}</span>}
            </Station>
          ))}
          {boardRoles.map((r) => (
            <Station key={r.foundation + r.role} cls="n-foundations" kind={`${r.role} en`}>
              <Link href={L(`/fundacion/${entitySlug(r.foundation)}`)}>{displayName(r.foundation)}</Link>
            </Station>
          ))}
          {employers.map((r, i) => (
            <Station key={`e${i}`} cls="n-neutral" kind={r.period ? `Trabajó, ${r.period}` : "Trabajó"}>
              {r.employer ?? r.description ?? "Sin nombre"}
              {r.sector && <p className="n-meta mt-1">{r.sector}</p>}
            </Station>
          ))}
          {memberships.map((r, i) => (
            <Station key={`m${i}`} cls="n-neutral" kind="Aporta a">
              {r.recipient ?? r.description ?? "Sin nombre"}
            </Station>
          ))}
          {gifts.map((r, i) => (
            <Station key={`g${i}`} cls="n-neutral" kind="Regalo recibido">
              {r.description ?? "Sin descripción"}
              {r.benefactor && <p className="n-meta mt-1">De {r.benefactor}</p>}
            </Station>
          ))}
        </ol>
        {!party && !securities.length && !boardRoles.length && !interests.length && (
          <p className="mt-4 text-[var(--n-ink-2)]">No consta ninguna conexión en los registros que usa esta web.</p>
        )}
        <p className="n-source">
          Fuentes: declaración de bienes y declaración de intereses económicos (Congreso), patronatos
          de las fundaciones (Tribunal de Cuentas y registros de fundaciones), Registro de Altos Cargos.
        </p>
      </Section>

      {/* ---------- Votes ---------- */}
      {record.length > 0 && (
        <Section id="votos" title="Cómo votó">
          {voteFinding && <p className="n-finding">{voteFinding}</p>}
          <table className="n-table mt-6">
            <caption className="sr-only">Su voto en cada votación seguida</caption>
            <thead>
              <tr>
                <th scope="col">Votación</th>
                <th scope="col">Su voto</th>
                <th scope="col">Su grupo</th>
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
                        {r.vote.topicLabel}, {r.vote.date}
                        {r.vote.binding ? "" : ". Sin efecto legal"}
                      </p>
                    </td>
                    <td className="font-bold">{BALLOT[r.ballot] ?? "No votó"}</td>
                    <td className="n-num text-[var(--n-ink-2)]">
                      {g ? `${g.si} a favor, ${g.no} en contra, ${g.abst} abst.` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="n-source">Fuente: actas de votación nominal del Congreso de los Diputados.</p>
        </Section>
      )}

      {/* ---------- Citing ---------- */}
      <Section id="citar" title="Cómo citar esta ficha">
        <p className="max-w-[46rem] rounded-[6px] border border-[var(--n-rule)] bg-[var(--n-card)] p-5 text-[0.95rem]">
          Siguiendo el Dinero, «{person.deputy?.fullName ?? person.name}», consultado el{" "}
          {formatDate(new Date().toISOString().slice(0, 10), bcp47)}.
          {d && ` Declaración de bienes registrada en el Congreso el ${formatDate(d.filed, bcp47)}: ${d.url}`}
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

function NoDeclaration({ isDeputy }: { isDeputy: boolean }) {
  return (
    <p className="max-w-[40em] text-[var(--n-ink-2)]">
      {isDeputy
        ? "Su declaración de bienes está en la cola de transcripción: se lee del escaneo oficial y se comprueba antes de publicarse."
        : "Las declaraciones de bienes que publica esta web son las de los diputados del Congreso. Para este cargo solo consta el Registro de Altos Cargos."}
    </p>
  );
}
