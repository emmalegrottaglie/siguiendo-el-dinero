import type { ReactNode } from "react";
import Link from "next/link";
import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import {
  DONATIONS_2020,
  DONATIONS_SOURCE,
  donationsByNif,
} from "@/lib/donations";
import {
  displayName,
  foundationYears,
  getFoundations,
} from "@/lib/foundations";
import { getSpending } from "@/lib/spending";
import { euro, euroM, formatDate, integer, percent } from "@/lib/format";
import ShareBar from "@/components/nuevo/ShareBar";
import {
  ordinaryIncome,
  PARTY_INCOME,
  PARTY_INCOME_SOURCE,
  PARTY_INCOME_TOTALS,
  PARTY_INCOME_YEAR,
} from "@/lib/party-income";
import {
  formationName,
  formationsOf,
  foundationsOf,
  isCoalition,
  unlinkedFoundations,
} from "../partido/party-records";

export const revalidate = 3600;

/**
 * The redesign prototype's index of parties.
 *
 * Parties are ranked by the state money they received, which is public
 * funding and the one comparison the data supports across every party. Then,
 * party by party, which of the other records exists at all: a filled station
 * where the record is on this site, a hollow one where it is not. The figures
 * in a row come from different reports and years and are never added.
 */
export default async function PrototypeParties({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const { locale, bcp47 } = getDict(localeParam);
  const [agg, foundations, spend] = await Promise.all([
    getAggregation(),
    getFoundations(),
    getSpending(),
  ]);
  const L = (path: string) => `/${locale}${path}`;
  const pct = (n: number) => percent(n, bcp47, 0);
  const money = (n: number) =>
    n >= 1_000_000 ? euroM(n, bcp47, 2) : euro(n, bcp47);
  const listFmt = new Intl.ListFormat(bcp47, { type: "conjunction" });

  const years = [...agg.years].sort((a, b) => a - b);
  const span = `${years[0]} y ${years.at(-1)}`;
  const fYears = foundationYears(foundations);
  const fLatest = fYears.at(-1)!;
  const max = agg.parties[0]?.total ?? 1;

  const top3 = agg.parties.slice(0, 3);
  const top3Total = top3.reduce((s, p) => s + p.total, 0);

  const rows = agg.parties.map((p) => {
    const ents = foundationsOf(foundations, p.nif);
    const latestDossiers = ents.flatMap((e) =>
      e.years.filter((d) => d.exercise === fLatest),
    );
    const fMoney = latestDossiers.reduce(
      (s, d) => s + d.contributions.total.amount + d.subsidies.total,
      0,
    );
    const formation = formationsOf(spend, p.nif)[0] ?? null;
    return {
      party: p,
      donations: donationsByNif(p.nif) ?? null,
      foundations: ents.length,
      fLatestCount: latestDossiers.length,
      fMoney,
      formation,
      coalition: formation ? isCoalition(formation, p.displayName) : false,
    };
  });
  const withDonations = rows.filter((r) => r.donations).length;
  const withFoundations = rows.filter((r) => r.foundations > 0).length;
  const withCampaign = rows.filter((r) => r.formation).length;

  // Records on this site that belong to no party on the list above.
  const stateNifs = new Set(agg.parties.map((p) => p.nif));
  const donationsElsewhere = DONATIONS_2020.filter(
    (d) => !d.nif || !stateNifs.has(d.nif),
  );
  const unlinked = unlinkedFoundations(foundations);
  const reportParty = (s: string | null) =>
    s
      ? s.replace(/\s*PORCENTAJE DE PARTICIPACI[ÓO]N.*$/i, "").trim()
      : "sin partido en el informe";

  // Where the audited parties' own money came from, from the party-accounts report.
  const allIncome = ordinaryIncome(PARTY_INCOME_TOTALS);
  const priv = PARTY_INCOME_TOTALS.private;
  const byIncome = [...PARTY_INCOME].sort(
    (a, b) => ordinaryIncome(b) - ordinaryIncome(a),
  );
  const incomeFinding = `En ${PARTY_INCOME_YEAR}, los ${PARTY_INCOME.length} partidos que fiscalizó el Tribunal de Cuentas ingresaron ${euroM(allIncome, bcp47, 1)}, y el ${percent(PARTY_INCOME_TOTALS.public.total / allIncome, bcp47, 0)} fue dinero público. ${
    priv.officeholders > priv.memberFees
      ? `Sus propios cargos públicos aportaron ${euroM(priv.officeholders, bcp47, 1)}, más que las cuotas de los afiliados (${euroM(priv.memberFees, bcp47, 1)}).`
      : `Las cuotas de los afiliados sumaron ${euroM(priv.memberFees, bcp47, 1)} y las aportaciones de sus cargos públicos, ${euroM(priv.officeholders, bcp47, 1)}.`
  }`;
  const PARTS = [
    {
      key: "public",
      label: "Dinero público",
      cls: "n-state",
      strength: 100,
      pick: (f: (typeof PARTY_INCOME)[number]) => f.public.total,
    },
    {
      key: "fees",
      label: "Cuotas de afiliados",
      cls: "n-donors",
      strength: 100,
      pick: (f: (typeof PARTY_INCOME)[number]) => f.private.memberFees,
    },
    {
      key: "officeholders",
      label: "Aportaciones de cargos públicos",
      cls: "n-donors",
      strength: 62,
      pick: (f: (typeof PARTY_INCOME)[number]) => f.private.officeholders,
    },
    {
      key: "donations",
      label: "Donaciones",
      cls: "n-donors",
      strength: 38,
      pick: (f: (typeof PARTY_INCOME)[number]) => f.private.donations,
    },
    {
      key: "other",
      label: "Otros ingresos privados",
      cls: "n-donors",
      strength: 22,
      pick: (f: (typeof PARTY_INCOME)[number]) => f.private.other,
    },
  ];
  /** A share in words: a small amount that rounds to 0 % is still not nothing. */
  const share = (n: number) =>
    n > 0 && n < 0.005 ? "menos del 1 %" : percent(n, bcp47, 0);
  const fill = (strength: number) =>
    `color-mix(in srgb, var(--route) ${strength}%, var(--n-bg))`;

  return (
    <main>
      <div className="n-shell pb-12 pt-6">
        <h1 className="n-display">Partidos</h1>
        <p className="n-body mt-6" style={{ fontSize: "1.15rem" }}>
          Lo que cada partido recibe del Estado, lo que declara en donaciones,
          lo que entra en sus fundaciones y lo que gastó en campaña, partido a
          partido y con la fuente de cada cifra.
        </p>
      </div>

      {/* ---------- The ranking by state money ---------- */}
      <Section id="estado" title="Lo que reparte el Estado">
        <p className="n-finding">
          {`${listFmt.format(top3.map((p) => p.shortName))} recibieron el ${pct(top3Total / agg.grandTotal)} de los ${euroM(agg.grandTotal, bcp47, 1)} que el Estado concedió a ${agg.parties.length} partidos entre ${span}.`}
        </p>
        <ShareBar
          className="n-state mt-6"
          parts={[
            ...top3.map((p) => ({ label: p.shortName, value: p.total })),
            {
              label: `Los otros ${agg.parties.length - 3}`,
              value: agg.grandTotal - top3Total,
              muted: true,
            },
          ]}
          format={(v) => pct(v / agg.grandTotal)}
        />
        <ol className="n-state mt-10 lg:columns-2 lg:gap-12">
          {agg.parties.map((p, i) => (
            <li
              key={p.nif}
              className="break-inside-avoid border-t border-[var(--n-rule)] py-3"
            >
              <div className="flex items-baseline justify-between gap-4">
                <p className="min-w-0">
                  <span className="n-meta n-num mr-2">{i + 1}</span>
                  <Link
                    href={L(`/nuevo/partido/${p.nif}`)}
                    className="font-bold"
                  >
                    {p.displayName}
                  </Link>
                </p>
                <span className="n-num shrink-0 whitespace-nowrap">
                  {money(p.total)}
                </span>
              </div>
              <div
                aria-hidden
                className="mt-2 h-2.5 w-full rounded-[2px]"
                style={{ background: "var(--n-rule)" }}
              >
                <span
                  className="block h-full rounded-[2px]"
                  style={{
                    width: `${Math.max((p.total / max) * 100, 0.6).toFixed(2)}%`,
                    background: "var(--route)",
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
        <p className="n-source">
          Fuente:{" "}
          <a href={agg.source.url}>Base de Datos Nacional de Subvenciones</a>,
          concesiones a partidos políticos entre {span}, consultada el{" "}
          {formatDate(agg.generatedAt.slice(0, 10), bcp47)}. Financiación
          ordinaria y gastos de seguridad.
        </p>
      </Section>

      {/* ---------- What is on record, party by party ---------- */}
      <Section id="registros" title="Qué consta de cada partido">
        <p className="n-finding">
          {`De los ${agg.parties.length} partidos con dinero del Estado, ${withDonations} aparecen en la tabla de donaciones de ${DONATIONS_SOURCE.year}, ${withFoundations} tienen una fundación vinculada en esta web y ${withCampaign} encabezaron una candidatura en las europeas de 2024.`}
        </p>
        <p className="n-body mt-3">
          Punto lleno: el dato consta en esta web. Punto vacío: no consta. Cada
          columna es de una fuente y un año distintos, y las cifras de una fila
          no se suman.
        </p>
        <div className="mt-8 overflow-x-auto">
          <table className="n-table min-w-[46rem]">
            <caption className="sr-only">
              Registros de cada partido en esta web
            </caption>
            <thead>
              <tr>
                <th scope="col">Partido</th>
                <th scope="col">
                  Del Estado, de {years[0]} a {years.at(-1)}
                </th>
                <th scope="col">Donaciones, {DONATIONS_SOURCE.year}</th>
                <th scope="col">Fundaciones, {fLatest}</th>
                <th scope="col">Campaña, europeas de 2024</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.party.nif}>
                  <th scope="row" className="font-normal">
                    <Link
                      href={L(`/nuevo/partido/${r.party.nif}`)}
                      className="font-bold"
                    >
                      {r.party.shortName}
                    </Link>
                  </th>
                  <td>
                    <Cell cls="n-state" on>
                      {money(r.party.total)}
                    </Cell>
                  </td>
                  <td>
                    <Cell cls="n-donors" on={!!r.donations}>
                      {r.donations
                        ? `${euro(r.donations.total.amount, bcp47)}, ${r.donations.total.donors === 1 ? "un donante" : `${integer(r.donations.total.donors, bcp47)} donantes`}`
                        : "No consta"}
                    </Cell>
                  </td>
                  <td>
                    <Cell cls="n-foundations" on={r.foundations > 0}>
                      {r.fLatestCount > 0
                        ? `${money(r.fMoney)}, ${r.fLatestCount === 1 ? "1 entidad" : `${r.fLatestCount} entidades`}`
                        : r.foundations > 0
                          ? `Solo en ${fYears.slice(0, -1).join(" y ")}`
                          : "No consta"}
                    </Cell>
                  </td>
                  <td>
                    <Cell cls="n-neutral" on={!!r.formation}>
                      {r.formation
                        ? `${money(r.formation.ordinary.declared)}${r.coalition ? ", en coalición" : ""}`
                        : "No consta"}
                    </Cell>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="n-source">
          Fuentes: Base de Datos Nacional de Subvenciones; Tribunal de Cuentas,
          informes nº 1.573 (donaciones, ejercicio {DONATIONS_SOURCE.year}), nº
          1.642 (fundaciones, ejercicios {listFmt.format(fYears.map(String))};
          en la columna, aportaciones y subvenciones de {fLatest}) y nº 1.628
          (europeas de 2024, gasto ordinario declarado). En coalición: la cifra
          es de toda la candidatura que el partido encabezó.
        </p>
      </Section>

      {/* ---------- Where the parties' own money comes from ---------- */}
      <Section
        id="ingresos"
        title="De dónde salen los ingresos de los partidos"
      >
        <p className="n-finding">{incomeFinding}</p>
        <p className="n-body mt-3">
          Cada barra es el total de ingresos ordinarios de un partido, repartido
          por origen. Las aportaciones de cargos públicos son lo que dan al
          partido las personas que ocupan un cargo en su nombre. Las
          subvenciones electorales van aparte y no están incluidas.
        </p>
        <ul className="n-meta mt-6 flex flex-wrap gap-x-5 gap-y-1">
          {PARTS.map((x) => (
            <li
              key={x.key}
              className={`${x.cls} inline-flex items-center gap-2`}
            >
              <span
                aria-hidden
                className="inline-block h-3 w-5 rounded-[2px]"
                style={{ background: fill(x.strength) }}
              />
              {x.label}
            </li>
          ))}
        </ul>
        <ol className="mt-6 grid gap-x-12 lg:grid-cols-2">
          {byIncome.map((f) => {
            const total = ordinaryIncome(f);
            const name =
              f.nif && stateNifs.has(f.nif) ? (
                <Link href={L(`/nuevo/partido/${f.nif}`)}>{f.label}</Link>
              ) : (
                f.label
              );
            return (
              <li
                key={f.label}
                className="border-t border-[var(--n-rule)] py-3"
              >
                <p className="flex justify-between gap-4">
                  <span className="font-bold">{name}</span>
                  <span className="n-num whitespace-nowrap">
                    {euroM(total, bcp47, 2)}
                  </span>
                </p>
                <div
                  aria-hidden
                  className="mt-2 flex h-3 w-full gap-[2px] overflow-hidden rounded-[2px]"
                >
                  {PARTS.filter((x) => x.pick(f) > 0).map((x) => (
                    <span
                      key={x.key}
                      className={x.cls}
                      style={{
                        flexGrow: x.pick(f),
                        flexBasis: 0,
                        background: fill(x.strength),
                      }}
                    />
                  ))}
                </div>
                <p className="n-meta mt-1.5">
                  {`Público, ${share(f.public.total / total)}. Cuotas, ${share(f.private.memberFees / total)}; cargos públicos, ${share(f.private.officeholders / total)}; donaciones, ${share(f.private.donations / total)}.`}
                </p>
              </li>
            );
          })}
        </ol>
        <p className="n-source">
          Fuente: Tribunal de Cuentas,{" "}
          <a href={PARTY_INCOME_SOURCE.url}>
            informe nº 1.573 (ejercicio {PARTY_INCOME_YEAR})
          </a>
          , anexos IV y V. Son los partidos que recibieron subvención anual para
          su funcionamiento. Los nombres son los del informe.
        </p>
      </Section>

      {/* ---------- Gaps ---------- */}
      <Section id="falta" title="Lo que todavía no consta">
        <div className="grid gap-x-14 gap-y-14 lg:grid-cols-2">
          {donationsElsewhere.length > 0 && (
            <article>
              <h3 className="n-h3">Donaciones de partidos fuera de la lista</h3>
              <p className="n-body mt-3">
                {donationsElsewhere.length === 1
                  ? `Un partido de la tabla de donaciones de ${DONATIONS_SOURCE.year} no recibe subvenciones del Estado en esta web, o no tiene un NIF con el que unirlo a ellas:`
                  : `${donationsElsewhere.length} partidos de la tabla de donaciones de ${DONATIONS_SOURCE.year} no reciben subvenciones del Estado en esta web, o no tienen un NIF con el que unirlos a ellas:`}
              </p>
              <ul className="mt-4">
                {donationsElsewhere.map((d) => (
                  <li
                    key={d.label}
                    className="flex justify-between gap-4 border-t border-[var(--n-rule)] py-2.5"
                  >
                    <span>{d.label}</span>
                    <span className="n-num whitespace-nowrap">
                      {euro(d.total.amount, bcp47)}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          )}

          {unlinked.length > 0 && (
            <article className="lg:col-span-2">
              <h3 className="n-h3">Fundaciones sin un partido de la lista</h3>
              <p className="n-body mt-3">
                {`El informe nº 1.642 audita ${unlinked.length} entidades cuyo partido, tal como lo nombra el informe, no identifica a uno solo de los partidos con dinero del Estado en esta web. No se atribuyen a ninguno.`}
              </p>
              <ul className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                {unlinked.map((e) => (
                  <li
                    key={e.slug}
                    className="border-t border-[var(--n-rule)] py-2.5"
                  >
                    <Link href={L(`/fundacion/${e.slug}`)}>
                      {displayName(e.name)}
                    </Link>
                    <p className="n-meta mt-0.5">{reportParty(e.party)}</p>
                  </li>
                ))}
              </ul>
            </article>
          )}
        </div>
        <p className="n-source">
          Fuente: Tribunal de Cuentas,{" "}
          <a href={foundations.source.url}>informe nº 1.642</a> y{" "}
          <a href={DONATIONS_SOURCE.url}>informe nº 1.573</a>. Candidaturas de
          las europeas de 2024 que esta web no atribuye a ningún partido:{" "}
          {spend.formations
            .filter(
              (f) =>
                !agg.parties.some((p) =>
                  formationsOf(spend, p.nif).includes(f),
                ),
            )
            .map((f) => formationName(f.name))
            .join(", ") || "ninguna"}
          .
        </p>
      </Section>
    </main>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="n-shell n-section" aria-labelledby={`${id}-t`}>
      <h2 id={`${id}-t`} className="n-h2 mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** One record in the table: a station, filled when the record is on this site. */
function Cell({
  cls,
  on,
  children,
}: {
  cls: string;
  on: boolean;
  children: ReactNode;
}) {
  return (
    <span className={`${cls} inline-flex items-center gap-2 whitespace-nowrap`}>
      <span
        aria-hidden
        className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border-2"
        style={{
          borderColor: on ? "var(--route)" : "var(--n-ink-3)",
          background: on ? "var(--route)" : "transparent",
        }}
      />
      <span className={on ? "n-num" : "text-[var(--n-ink-3)]"}>{children}</span>
    </span>
  );
}
