import Link from "next/link";
import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { DONATIONS_SOURCE, DONATIONS_2020 } from "@/lib/donations";
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

export const revalidate = 3600;

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

  const topics = [...new Map(votes.votes.map((v) => [v.topic, v.topicLabel])).entries()].map(
    ([topic, label]) => ({
      topic,
      label,
      count: votes.votes.filter((v) => v.topic === topic).length,
    }),
  );

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

        {/* Every match, grouped by foundation. A first-N list showed one
            party's foundation only, which read as a choice the data did not make. */}
        <div className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {byFoundation.map(([foundation, list]) => (
            <div key={foundation}>
              <h3 className="n-h3">
                <Link href={L(`/fundacion/${entitySlug(foundation)}`)}>{displayName(foundation)}</Link>
              </h3>
              <p className="n-meta mt-1">
                {list.length === 1 ? "1 persona con cargo público" : `${list.length} personas con cargo público`} en su patronato
              </p>
              <ul className="mt-3">
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
        </div>

        <div className="mt-12 grid gap-8 border-t border-[var(--n-rule)] pt-8 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="n-figure n-companies n-route-text" style={{ fontSize: "2.6rem" }}>
              {integer(withSecurities, bcp47)}
              <span className="n-meta" style={{ fontFamily: "var(--n-sans)", fontSize: "1rem" }}>
                {" "}
                de {integer(declarations.length, bcp47)}
              </span>
            </p>
            <p className="mt-3 max-w-[30em]">
              diputados con la declaración transcrita declaran acciones, bonos u otros valores, según
              su declaración de bienes al Congreso.
            </p>
            <p className="n-meta mt-2">
              <Link href={L("/politicos/declaraciones")}>Ver lo que declaró cada uno</Link>
            </p>
          </div>
          <div>
            <p className="n-figure" style={{ fontSize: "2.6rem" }}>
              {integer(notYet, bcp47)}
            </p>
            <p className="mt-3 max-w-[30em]">
              declaraciones de diputados están todavía sin transcribir. Se leen del escaneo oficial y
              se comprueban antes de publicarse.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Themes ---------- */}
      <section className="n-shell n-section" aria-labelledby="temas">
        <h2 id="temas" className="n-h2">
          Temas
        </h2>
        <p className="n-body mt-3">
          Cómo votó cada grupo en el Congreso en las votaciones que siguen esta web, con el acta
          oficial de cada una.
        </p>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {topics.map((t) => (
            <li key={t.topic}>
              <Link href={L(`/votaciones`)} className="n-h3">
                {t.label}
              </Link>
              <p className="n-meta mt-1">{t.count} votaciones</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- What is not on record ---------- */}
      <section className="n-shell n-section" aria-labelledby="falta">
        <h2 id="falta" className="n-h2">
          Lo que todavía no consta
        </h2>
        <ul className="mt-8 grid gap-8 md:grid-cols-2">
          <Gap
            figure={pct(spending.otherShare)}
            text="del gasto ordinario que los partidos declararon en las europeas de 2024 está en una sola línea, sin desglosar."
          />
          <Gap
            figure={integer(DONATIONS_SOURCE.grandDonors, bcp47)}
            text={`donantes a partidos en ${DONATIONS_SOURCE.year}, y ninguno con nombre: el Tribunal de Cuentas publica las donaciones agrupadas por importe, con uno o dos años de retraso.`}
          />
          <Gap
            figure={fYears[fYears.length - 1]}
            text="es el último año auditado de las fundaciones de los partidos."
          />
          <Gap
            figure={integer(notYet, bcp47)}
            text="declaraciones de bienes de diputados pendientes de transcribir."
          />
        </ul>
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
        <ShareBar parts={bar} format={barFormat} className="mt-5" />
        <p className="mt-4">
          <Link href={link.href}>{link.text}</Link>
        </p>
        <p className="n-source">Fuente: {source}</p>
      </div>
    </article>
  );
}

function Gap({ figure, text }: { figure: string; text: string }) {
  return (
    <li className="grid grid-cols-[minmax(5.5rem,auto)_1fr] items-baseline gap-4">
      <span className="n-figure" style={{ fontSize: "2.2rem" }}>
        {figure}
      </span>
      <span className="text-[var(--n-ink-2)]">{text}</span>
    </li>
  );
}
