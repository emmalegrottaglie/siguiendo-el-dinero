import Link from "next/link";
import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { DONATIONS_SOURCE, DONATIONS_2020 } from "@/lib/donations";
import { ordinaryIncome, PARTY_INCOME, PARTY_INCOME_TOTALS, PARTY_INCOME_YEAR } from "@/lib/party-income";
import {
  channelTotals,
  displayName,
  entitySlug,
  getFoundations,
  partyNifByFoundation,
} from "@/lib/foundations";
import { officeTies, type OfficeTie } from "@/lib/officeholder-ties";
import { ROLES } from "@/lib/foundation-people";
import { nameKey } from "@/lib/name-key.mjs";
import { getDeclarations } from "@/lib/declarations";
import { getDeputies } from "@/lib/deputies";
import { getSpending, spendingTotals } from "@/lib/spending";
import { getVotes } from "@/lib/votes";
import { euroExact, euroM, fill, integer, percent } from "@/lib/format";
import RouteMap from "@/components/nuevo/RouteMap";
import ShareBar from "@/components/nuevo/ShareBar";
import Line from "@/components/nuevo/Line";
import DotGrid from "@/components/nuevo/DotGrid";
import VoteBar, { VoteLegend } from "@/components/nuevo/VoteBar";

export const revalidate = 3600;

/** What kind of vote each station on a topic's line is, in a few words. */
const KIND_NOTE: Record<string, string> = {
  ley: "votación final de ley",
  toma: "toma en consideración",
  pnl: "proposición no de ley",
  mocion: "moción",
};

/**
 * The redesign prototype's front door.
 *
 * One promise, the routes drawn, then each route opened with the one sentence
 * its figures show, then who appears on the routes, then what is still not on
 * record. Every sentence with a figure is computed from the same data the
 * current site uses; none is typed.
 */
export default async function PrototypeHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const { locale, bcp47 } = getDict(localeParam);
  const [agg, foundations, decl, deputies, spend, votes] = await Promise.all([
    getAggregation(),
    getFoundations(),
    getDeclarations(),
    getDeputies(),
    getSpending(),
    getVotes(),
  ]);
  const f = channelTotals(foundations);
  const fYears = Object.keys(foundations.years).sort();
  const fYearSpan = fYears.length > 1 ? `${fYears[0]} y ${fYears[fYears.length - 1]}` : fYears[0];
  const ties = await officeTies(partyNifByFoundation(foundations));
  const spending = spendingTotals(spend);

  const pct = (n: number) => percent(n, bcp47, 0);
  const listFmt = new Intl.ListFormat(bcp47, { type: "conjunction" });

  // Route 1: state subsidies.
  const top3 = agg.parties.slice(0, 3);
  const top3Share = top3.reduce((s, p) => s + p.total, 0) / agg.grandTotal;

  // Route 2: donations, by tranche.
  const sum = (k: "small" | "mid" | "large", m: "donors" | "amount") =>
    DONATIONS_2020.reduce((s, r) => s + r[k][m], 0);
  const smallDonorShare = sum("small", "donors") / DONATIONS_SOURCE.grandDonors;
  const smallMoneyShare = sum("small", "amount") / DONATIONS_SOURCE.grandTotal;

  // Who appears: officeholders on foundation boards, joined by both conditions.
  const byFoundation = [
    ...[...ties.byPerson.entries()]
      .flatMap(([key, list]) =>
        ROLES.filter((r) => nameKey(r.person) === key).map((r) => ({
          foundation: r.foundation,
          role: r.role,
          tie: list[0],
        })),
      )
      .reduce((m, x) => m.set(x.foundation, [...(m.get(x.foundation) ?? []), x]), new Map<string, { foundation: string; role: string; tie: OfficeTie }[]>())
      .entries(),
  ].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "es"));

  const declarations = decl.declarations;
  const withSecurities = declarations.filter((d) =>
    d.otherAssets.some((a) => a.kind === "securities"),
  ).length;
  // Deputies whose first filing is linked from their ficha, less those published.
  const filed = deputies.deputies.filter((d) => d.filings.some((x) => x.kind === "bienes")).length;
  const notYet = filed - declarations.length;

  // Each topic's votes in date order; dates are published as "16/2/2023".
  const when = (d: string) => {
    const [day, month, year] = d.split("/").map(Number);
    return Date.UTC(year, month - 1, day);
  };
  const topics = votes.topics
    .map((t) => ({
      topic: t.id,
      label: t.label,
      votes: votes.votes.filter((v) => v.topic === t.id).sort((a, b) => when(a.date) - when(b.date)),
    }))
    .filter((t) => t.votes.length > 0);

  // Years from the first audited year on this site to now, for the audit-lag lines.
  const firstYear = Math.min(DONATIONS_SOURCE.year, ...fYears.map(Number));
  const auditYears = Array.from(
    { length: new Date().getFullYear() - firstYear + 1 },
    (_, i) => firstYear + i,
  );

  // Where a party's own money comes from in turn, from the party-accounts report.
  const allIncome = ordinaryIncome(PARTY_INCOME_TOTALS);
  const priv = PARTY_INCOME_TOTALS.private;

  const L = (path: string) => `/${locale}${path}`;

  return (
    <main>
      {/* ---------- The promise, and the routes drawn ---------- */}
      <section className="n-shell grid items-center gap-x-12 gap-y-10 pb-16 pt-8 lg:grid-cols-[1fr_minmax(0,30rem)]">
        <div>
          <h1 className="n-display">Sigue el dinero que entra en la política española</h1>
          <p className="n-body mt-6" style={{ fontSize: "1.15rem" }}>
            Por dónde llega, con cifras oficiales y su fuente: lo que da el Estado, lo que donan
            particulares y lo que reciben las fundaciones de los partidos. Y quién aparece en esas
            rutas: los cargos que se sientan en los patronatos y lo que los diputados declaran poseer.
          </p>
          <form action={L("/buscar")} method="get" role="search" className="n-search mt-8">
            <label htmlFor="n-q" className="sr-only">
              Busca una persona, un partido o una provincia
            </label>
            <input
              id="n-q"
              name="q"
              type="search"
              placeholder="Una persona, un partido o una provincia"
              autoComplete="off"
            />
            <button type="submit" className="n-button">
              Buscar
            </button>
          </form>
          <p className="n-meta mt-3">
            Por ejemplo:{" "}
            <Link href={L("/nuevo/politico/pilar-calvo-gomez")}>Pilar Calvo Gómez</Link>,{" "}
            <Link href={L("/nuevo/politico/alberto-nunez-feijoo")}>Alberto Núñez Feijóo</Link>,{" "}
            <Link href={L("/donde/madrid")}>Madrid</Link>.
          </p>
        </div>
        <RouteMap
          f={{
            subsidies: euroM(agg.grandTotal, bcp47, 1),
            donations: euroM(DONATIONS_SOURCE.grandTotal, bcp47, 2),
            donationsYear: String(DONATIONS_SOURCE.year),
            foundationsFromParty: euroM(f.party, bcp47, 1),
            foundationsFromCompanies: `${integer(Math.round(f.companies / 1000), bcp47)} mil €`,
            foundationsFromIndividuals: `${integer(Math.round(f.individuals / 1000), bcp47)} mil €`,
            foundationYears: fYearSpan,
            officeholdersOnBoards: integer(ties.audit.matched, bcp47),
          }}
        />
      </section>

      {/* ---------- Each route, opened by its finding ---------- */}
      <section className="n-shell n-section" aria-labelledby="rutas">
        <h2 id="rutas" className="n-h2">
          Las tres rutas
        </h2>
        <p className="n-body mt-3">
          Cada ruta tiene su propia ley y su propia fuente, y sus cifras son de años distintos, así
          que no se suman.
        </p>

        <div className="mt-10 grid gap-14">
          <Route
            cls="n-state"
            title="Del Estado a los partidos"
            figure={euroM(agg.grandTotal, bcp47, 1)}
            figureNote="en subvenciones registradas, acumulado"
            finding={`${listFmt.format(top3.map((p) => p.shortName))} recibieron el ${pct(top3Share)} de todo lo concedido.`}
            bar={[
              ...top3.map((p) => ({ label: p.shortName, value: p.total })),
              {
                label: `Los otros ${agg.parties.length - 3}`,
                value: agg.grandTotal - top3.reduce((s, p) => s + p.total, 0),
                muted: true,
              },
            ]}
            barFormat={(v) => pct(v / agg.grandTotal)}
            link={{ href: L("/financiacion#reparto"), text: "Ver el reparto partido a partido" }}
            source="Base de Datos Nacional de Subvenciones, actualizada a diario."
          />
          <Route
            cls="n-donors"
            title="De particulares a los partidos"
            figure={euroM(DONATIONS_SOURCE.grandTotal, bcp47, 2)}
            figureNote={`${euroExact(DONATIONS_SOURCE.grandTotal, bcp47)} de ${integer(DONATIONS_SOURCE.grandDonors, bcp47)} donantes, en ${DONATIONS_SOURCE.year}`}
            finding={`El ${pct(smallDonorShare)} de los donantes dio menos de 1.000 €, y entre todos aportaron el ${pct(smallMoneyShare)} del dinero.`}
            bar={[
              { label: "Menos de 1.000 €", value: sum("small", "amount") },
              { label: "De 1.000 a 10.000 €", value: sum("mid", "amount") },
              { label: "Más de 10.000 €", value: sum("large", "amount") },
            ]}
            barFormat={(v) => pct(v / DONATIONS_SOURCE.grandTotal)}
            link={{ href: L("/financiacion#donaciones"), text: "Ver las donaciones por partido" }}
            source="Tribunal de Cuentas, informe nº 1.573 (ejercicio 2020). Las empresas no pueden donar a los partidos, y el informe no da nombres de donantes."
          />
          <Route
            cls="n-foundations"
            title="Hacia las fundaciones de los partidos"
            figure={euroM(f.party + f.companies + f.individuals, bcp47, 1)}
            figureNote={`en aportaciones, entre ${fYearSpan}`}
            finding={`El ${pct(f.partyShare)} lo puso el propio partido. Las empresas, que sí pueden donar a una fundación, aportaron el ${pct(f.companiesShare)}.`}
            findingNote={`Ese dinero del partido sale a su vez de sus propios ingresos. En ${PARTY_INCOME_YEAR}, los ${PARTY_INCOME.length} partidos fiscalizados ingresaron ${euroM(allIncome, bcp47, 1)}: el ${pct(PARTY_INCOME_TOTALS.public.total / allIncome)} fue dinero público, y de lo privado, ${euroM(priv.officeholders, bcp47, 1)} lo aportaron sus cargos públicos, ${euroM(priv.memberFees, bcp47, 1)} sus afiliados y ${euroM(priv.donations, bcp47, 2)} los donantes. Son años distintos, así que no se restan uno de otro.`}
            bar={[
              { label: "Del propio partido", value: f.party },
              { label: "De empresas", value: f.companies },
              { label: "De particulares", value: f.individuals },
            ]}
            barFormat={(v) => pct(v / f.contributions)}
            link={{ href: L("/fundaciones"), text: "Ver las fundaciones y quién las gobierna" }}
            source="Tribunal de Cuentas, informe nº 1.642 (ejercicios 2021 y 2022)."
          />
        </div>
      </section>

      {/* ---------- Who appears on the routes ---------- */}
      <section className="n-shell n-section" aria-labelledby="quien">
        <h2 id="quien" className="n-h2">
          Quién aparece en las rutas
        </h2>
        <p className="n-finding mt-4">
          {fill("{n} personas que se sientan en el patronato de una fundación de partido tienen también un cargo público.", {
            n: integer(ties.audit.matched, bcp47),
          })}
        </p>
        <p className="n-body mt-3">
          Son dos registros oficiales sobre la misma persona, puestos uno al lado del otro. Solo se
          muestra la coincidencia cuando el nombre identifica a una sola persona y el partido del
          cargo es el de la fundación.
        </p>

        {/* Each foundation is a station on the foundations' line, and its board
            members with public office hang off it. Every match is listed,
            grouped by foundation: a first-N list showed one party's
            foundation only, which read as a choice the data did not make. */}
        {byFoundation.map(([foundation, list]) => (
          <div key={foundation} className="n-foundations mt-12">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span
                aria-hidden
                className="h-[23px] w-[23px] shrink-0 rounded-full border-[3px]"
                style={{ borderColor: "var(--route)", background: "var(--n-card)" }}
              />
              <h3 className="n-h3">
                <Link href={L(`/fundacion/${entitySlug(foundation)}`)}>{displayName(foundation)}</Link>
              </h3>
              <span aria-hidden className="hidden h-[5px] min-w-8 flex-1 sm:block" style={{ background: "var(--route)" }} />
              <span className="n-meta">
                {list.length === 1 ? "1 persona con cargo público" : `${list.length} personas con cargo público`} en su patronato
              </span>
            </div>
            <ul className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {list.map(({ tie, role }) => (
                <li key={tie.slug + role} className="border-t border-[var(--n-rule)] py-3">
                  <Link href={L(`/nuevo/politico/${tie.slug}`)} className="font-bold">
                    {tie.person}
                  </Link>
                  <span className="text-[var(--n-ink-2)]">, {role.toLowerCase()}</span>
                  <p className="n-meta mt-0.5">
                    {tie.organisation}
                    {tie.role ? `, ${tie.role}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* The declarations, one dot each: how much is read, and what it shows. */}
        <div className="mt-16 grid gap-x-12 gap-y-6 border-t border-[var(--n-rule)] pt-10 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <div>
            <h3 className="n-h3">Lo que declaran los diputados</h3>
            <p className="n-finding mt-3">
              {`${integer(withSecurities, bcp47)} de los ${integer(declarations.length, bcp47)} diputados con la declaración ya transcrita declaran acciones, bonos u otros valores.`}
            </p>
            <p className="n-meta mt-3">
              Un punto por diputado con declaración de bienes en el Congreso. Se leen del escaneo
              oficial y se comprueban antes de publicarse.{" "}
              <Link href={L("/politicos/declaraciones")}>Ver lo que declaró cada uno</Link>
            </p>
          </div>
          <DotGrid
            groups={[
              {
                key: "valores",
                count: withSecurities,
                label: "declaran acciones, bonos u otros valores",
                look: "filled",
                cls: "n-companies",
              },
              {
                key: "otros",
                count: declarations.length - withSecurities,
                label: "transcritas, sin valores declarados",
                look: "ink",
              },
              { key: "pendientes", count: notYet, label: "sin transcribir todavía", look: "hollow" },
            ]}
          />
        </div>
      </section>

      {/* ---------- Themes ---------- */}
      <section className="n-shell n-section" aria-labelledby="temas">
        <h2 id="temas" className="n-h2">
          Temas
        </h2>
        <p className="n-body mt-3">
          Cómo votó el Congreso en las votaciones que sigue esta web, de la más antigua a la más
          reciente, con el acta oficial de cada una.
        </p>
        <div className="mt-10 grid gap-x-12 gap-y-14 lg:grid-cols-3">
          {topics.map((t) => (
            <article key={t.topic} className="n-topic">
              <h3 className="n-h3">
                <Link href={L(`/nuevo/tema/${t.topic}`)}>{t.label}</Link>
              </h3>
              <Line
                cls="n-topic"
                className="mt-5"
                stops={t.votes.map((v) => ({
                  key: v.id,
                  label: v.date.split("/").slice(2).join(""),
                  note: KIND_NOTE[v.kind] ?? v.kindLabel,
                  on: true,
                }))}
              />
              <ol className="mt-6 grid gap-5">
                {t.votes.map((v) => (
                  <li key={v.id}>
                    <a href={v.sourceUrl} className="text-[0.95rem] font-bold">
                      {v.law}
                    </a>
                    <span className="n-meta">, {v.date}</span>
                    <VoteBar
                      className="mt-2"
                      counts={{ si: v.totals.afavor, no: v.totals.enContra, abst: v.totals.abstenciones }}
                    />
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
        <p className="n-meta mt-8 flex flex-wrap items-center gap-x-5 gap-y-1">
          <VoteLegend />
          <span>Fuente: actas de votación nominal del Congreso.</span>
        </p>
      </section>

      {/* ---------- What is not on record ---------- */}
      <section className="n-shell n-section" aria-labelledby="falta">
        <h2 id="falta" className="n-h2">
          Lo que todavía no consta
        </h2>
        <p className="n-body mt-3">
          Lo que falta también es un dato. Esto es lo que las fuentes no publican, o lo que esta web
          todavía no recoge.
        </p>

        <div className="mt-12 grid gap-x-14 gap-y-16 lg:grid-cols-2">
          {/* Campaign spending: the unitemised line, drawn at its size. */}
          <article>
            <h3 className="n-h3">En qué se gastó la campaña</h3>
            <p className="n-finding mt-3">
              {`El ${pct(spending.otherShare)} del gasto ordinario que los partidos declararon en las europeas de 2024 está en una sola línea, sin desglosar.`}
            </p>
            <div aria-hidden className="mt-5 flex h-7 w-full gap-[2px] overflow-hidden rounded-[3px]">
              <span style={{ flexGrow: 1 - spending.otherShare, flexBasis: 0, background: "var(--n-ink-2)" }} />
              <span className="n-hatch" style={{ flexGrow: spending.otherShare, flexBasis: 0, outline: "1px solid var(--n-ink-3)", outlineOffset: -1 }} />
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[0.95rem]">
              <li className="inline-flex items-center gap-2">
                <span aria-hidden className="inline-block h-3 w-3 rounded-[2px]" style={{ background: "var(--n-ink-2)" }} />
                Desglosado <span className="n-num font-bold">{pct(1 - spending.otherShare)}</span>
              </li>
              <li className="inline-flex items-center gap-2">
                <span aria-hidden className="n-hatch inline-block h-3 w-3 rounded-[2px]" style={{ outline: "1px solid var(--n-ink-3)", outlineOffset: -1 }} />
                En una sola línea <span className="n-num font-bold">{pct(spending.otherShare)}</span>
              </li>
            </ul>
            <p className="n-source">Fuente: Tribunal de Cuentas, informe nº 1.628.</p>
          </article>

          {/* Donors: the names the source does not publish, drawn as redacted. */}
          <article>
            <h3 className="n-h3">Quién donó a los partidos</h3>
            <p className="n-finding mt-3">
              {`${integer(DONATIONS_SOURCE.grandDonors, bcp47)} donantes en ${DONATIONS_SOURCE.year}, y ninguno con nombre.`}
            </p>
            <table className="n-table mt-4">
              <caption className="sr-only">Donantes a partidos en {DONATIONS_SOURCE.year}, por tramo</caption>
              <thead>
                <tr>
                  <th scope="col">Donante</th>
                  <th scope="col">Tramo</th>
                  <th scope="col" className="n-r">Donantes</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["small", "Menos de 1.000 €", "78%"],
                    ["mid", "De 1.000 a 10.000 €", "64%"],
                    ["large", "Más de 10.000 €", "90%"],
                  ] as const
                ).map(([k, label, w]) => (
                  <tr key={k}>
                    <td>
                      <span
                        className="inline-block h-[0.9em] rounded-[2px] align-middle"
                        style={{ width: w, background: "var(--n-ink)" }}
                      />
                      <span className="sr-only">Nombre no publicado</span>
                    </td>
                    <td>{label}</td>
                    <td className="n-r">{integer(sum(k, "donors"), bcp47)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="n-source">
              El Tribunal de Cuentas publica las donaciones agrupadas por importe, sin nombres
              (informe nº 1.573, ejercicio 2020).
            </p>
          </article>

          {/* The years each audited source covers on this site. */}
          <article className="lg:col-span-2">
            <h3 className="n-h3">Qué años recoge esta web</h3>
            <p className="n-finding mt-3">
              {`Las cuentas auditadas llegan con años de retraso: lo más reciente que recoge esta web es ${fYears[fYears.length - 1]} para las fundaciones y ${DONATIONS_SOURCE.year} para las donaciones.`}
            </p>
            <div className="mt-8 grid gap-10">
              {[
                { name: "Donaciones a los partidos", cls: "n-donors", on: [DONATIONS_SOURCE.year] },
                { name: "Fundaciones de los partidos", cls: "n-foundations", on: fYears.map(Number) },
              ].map((row) => (
                <div key={row.name} className="grid gap-4 md:grid-cols-[14rem_1fr] md:items-start">
                  <p className="font-bold">{row.name}</p>
                  <Line
                    cls={row.cls}
                    stops={auditYears.map((y) => ({
                      key: String(y),
                      label: String(y),
                      note: y === auditYears[auditYears.length - 1] ? "hoy" : undefined,
                      on: row.on.includes(y),
                    }))}
                  />
                </div>
              ))}
            </div>
            <p className="n-meta mt-6">Punto lleno: año con datos auditados en esta web. Punto vacío y línea discontinua: todavía no.</p>
          </article>
        </div>
      </section>
    </main>
  );
}

function Route({
  cls,
  title,
  figure,
  figureNote,
  finding,
  findingNote,
  bar,
  barFormat,
  link,
  source,
}: {
  cls: string;
  title: string;
  figure: string;
  figureNote: string;
  finding: string;
  /** Says what the finding's figures do not, right under it. */
  findingNote?: string;
  bar: { label: string; value: number; muted?: boolean }[];
  barFormat: (v: number) => string;
  link: { href: string; text: string };
  source: string;
}) {
  return (
    <article className={`${cls} grid gap-x-12 gap-y-5 md:grid-cols-[minmax(0,16rem)_1fr]`}>
      <div className="border-l-[6px] pl-5" style={{ borderColor: "var(--route)" }}>
        <h3 className="n-h3">{title}</h3>
        <p className="n-figure n-route-text mt-3" style={{ fontSize: "2.4rem" }}>
          {figure}
        </p>
        <p className="n-meta mt-2">{figureNote}</p>
      </div>
      <div>
        <p className="n-finding">{finding}</p>
        {findingNote && <p className="n-body mt-3">{findingNote}</p>}
        <ShareBar parts={bar} format={barFormat} className="mt-5" />
        <p className="mt-4">
          <Link href={link.href}>{link.text}</Link>
        </p>
        <p className="n-source">Fuente: {source}</p>
      </div>
    </article>
  );
}
