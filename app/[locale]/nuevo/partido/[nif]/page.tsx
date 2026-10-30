import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAggregation } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import {
  DONATIONS_SOURCE,
  donationsByNif,
  type Tranche,
} from "@/lib/donations";
import {
  displayName,
  entitySlug,
  foundationYears,
  getFoundations,
  partyNifByFoundation,
} from "@/lib/foundations";
import { officeTies, type OfficeTie } from "@/lib/officeholder-ties";
import { BOARD_GAPS, ROLES } from "@/lib/foundation-people";
import { nameKey } from "@/lib/name-key.mjs";
import { financial, getSpending } from "@/lib/spending";
import { getPeople } from "@/lib/people";
import {
  getVotes,
  stancesByParty,
  voteDateISO,
  type Stance,
} from "@/lib/votes";
import { sharedGroupFor } from "@/lib/groups";
import {
  euro,
  euroExact,
  euroM,
  formatDate,
  integer,
  percent,
} from "@/lib/format";
import ShareBar from "@/components/nuevo/ShareBar";
import Line from "@/components/nuevo/Line";
import DotGrid from "@/components/nuevo/DotGrid";
import {
  formationName,
  formationsOf,
  foundationsOf,
  isCoalition,
} from "../party-records";

export const revalidate = 3600;

export async function generateStaticParams() {
  const agg = await getAggregation();
  return agg.parties.map((p) => ({ nif: p.nif }));
}

const KIND_LABEL = {
  ordinaria: "Financiación ordinaria",
  seguridad: "Gastos de seguridad",
  otra: "Otras",
} as const;

const TRANCHES = [
  { key: "small", label: "Menos de 1.000 €", words: "de menos de 1.000 €" },
  { key: "mid", label: "De 1.000 a 10.000 €", words: "de 1.000 a 10.000 €" },
  { key: "large", label: "Más de 10.000 €", words: "de más de 10.000 €" },
] as const;

/** Where money into a foundation came from, as the report splits it. */
const FOUNDATION_PARTS = [
  { key: "party", label: "Del propio partido", words: "del propio partido" },
  { key: "companies", label: "De empresas", words: "de empresas" },
  { key: "individuals", label: "De particulares", words: "de particulares" },
  {
    key: "subsidies",
    label: "Subvenciones públicas",
    words: "en subvenciones públicas",
  },
] as const;
type PartKey = (typeof FOUNDATION_PARTS)[number]["key"];

const STANCE: Record<Stance, string> = {
  si: "A favor",
  no: "En contra",
  ab: "Abstención",
};

/**
 * The redesign prototype's party hub.
 *
 * It answers in the order a reader asks: how much the state gave the party and
 * how that ran year by year, what it declared in private donations, what went
 * into its foundations, what its campaign spending says it bought, which of its
 * foundations' trustees hold public office, and who its people are. Each
 * section opens with the one sentence its figures show, computed here, then the
 * graphic, then the source. A section with nothing on record says so rather
 * than disappearing, because the gap is part of the answer.
 *
 * Figures from different reports and years sit side by side and are never
 * added together.
 */
export default async function PrototypeParty({
  params,
}: {
  params: Promise<{ locale: string; nif: string }>;
}) {
  const { locale: localeParam, nif } = await params;
  const [agg, foundations, spend, people, votes] = await Promise.all([
    getAggregation(),
    getFoundations(),
    getSpending(),
    getPeople(),
    getVotes(),
  ]);
  const party = agg.parties.find((p) => p.nif === nif);
  if (!party) notFound();
  const { locale, bcp47 } = getDict(localeParam);
  const L = (path: string) => `/${locale}${path}`;
  const pct = (n: number) => percent(n, bcp47, 0);
  const money = (n: number) =>
    n >= 1_000_000 ? euroM(n, bcp47, 2) : euro(n, bcp47);
  /** Millions to one decimal where that is precise enough, whole euros below a million. */
  const big = (n: number) =>
    n >= 1_000_000 ? euroM(n, bcp47, 1) : euro(n, bcp47);
  /** A share of the national total: small parties need the decimal, and under 1 % says so. */
  const shareWords = (n: number) =>
    n < 0.01 ? "menos del 1 %" : `el ${percent(n, bcp47, n < 0.1 ? 1 : 0)}`;
  const listFmt = new Intl.ListFormat(bcp47, { type: "conjunction" });

  const rank = agg.parties.findIndex((p) => p.nif === nif) + 1;
  const short = party.shortName;

  // ---------- State money, by year ----------
  const years = [...agg.years].sort((a, b) => a - b);
  const thisYear = new Date().getFullYear();
  const maxYear = Math.max(...years.map((y) => party.byYear[y] ?? 0), 1);
  const stateFinding =
    rank === 1
      ? `Recibió ${big(party.total)} del Estado entre ${years[0]} y ${years.at(-1)}, ${shareWords(party.share)} de lo concedido a todos los partidos: más que ningún otro.`
      : `Recibió ${big(party.total)} del Estado entre ${years[0]} y ${years.at(-1)}, ${shareWords(party.share)} de lo concedido a todos los partidos, y es el ${rank}.º de ${agg.parties.length} por dinero recibido.`;
  const kinds = (["ordinaria", "seguridad", "otra"] as const).filter(
    (k) => party.byKind[k] > 0,
  );

  // ---------- Donations, 2020 ----------
  const donations = donationsByNif(nif) ?? null;
  const tranche = (k: (typeof TRANCHES)[number]["key"]): Tranche =>
    donations![k];
  const topTranche = donations
    ? [...TRANCHES].sort(
        (a, b) => donations[b.key].amount - donations[a.key].amount,
      )[0]
    : null;
  const donorsWord = (n: number) =>
    n === 1 ? "un donante" : `${integer(n, bcp47)} donantes`;
  const donationFinding =
    donations && topTranche
      ? `Declaró ${euroExact(donations.total.amount, bcp47)} de ${donorsWord(donations.total.donors)} en ${DONATIONS_SOURCE.year}, y el ${pct(donations[topTranche.key].amount / donations.total.amount)} del dinero llegó en donaciones ${topTranche.words}.`
      : null;

  // ---------- Foundations ----------
  const ents = foundationsOf(foundations, nif);
  const fYears = foundationYears(foundations);
  const partsOf = (d: {
    contributions: {
      party: { amount: number };
      companies: { amount: number };
      individuals: { amount: number };
    };
    subsidies: { total: number };
  }): Record<PartKey, number> => ({
    party: d.contributions.party.amount,
    companies: d.contributions.companies.amount,
    individuals: d.contributions.individuals.amount,
    subsidies: d.subsidies.total,
  });
  const byYear = fYears.map((y) => {
    const sum: Record<PartKey, number> = {
      party: 0,
      companies: 0,
      individuals: 0,
      subsidies: 0,
    };
    for (const e of ents)
      for (const d of e.years.filter((x) => x.exercise === y)) {
        const p = partsOf(d);
        for (const k of Object.keys(sum) as PartKey[]) sum[k] += p[k];
      }
    return {
      year: y,
      ...sum,
      total: sum.party + sum.companies + sum.individuals + sum.subsidies,
    };
  });
  const latest = [...byYear].reverse().find((y) => y.total > 0) ?? null;
  const funded = ents.filter((e) => e.contributions + e.subsidies > 0);
  const unfunded = ents.filter((e) => e.contributions + e.subsidies === 0);
  const theirFoundations =
    ents.length === 1 ? "su fundación" : "sus fundaciones";
  const foundationFinding = latest
    ? (() => {
        const top = [...FOUNDATION_PARTS].sort(
          (a, b) => latest[b.key] - latest[a.key],
        )[0];
        return `En ${latest.year}, el ${pct(latest[top.key] / latest.total)} de lo que entró en ${theirFoundations} llegó ${top.words}.`;
      })()
    : ents.length
      ? `El informe no registra aportaciones ni subvenciones para ${ents.length === 1 ? "su única entidad" : `ninguna de sus ${ents.length} entidades`} en ${listFmt.format(fYears.map(String))}.`
      : null;

  // ---------- Officeholders on foundation boards ----------
  const ties = await officeTies(partyNifByFoundation(foundations));
  const foundationNames = new Set(
    ents.flatMap((e) => e.years.map((d) => d.name)),
  );
  const boardRoles = ROLES.filter((r) => foundationNames.has(r.foundation));
  const boardKeys = new Set(boardRoles.map((r) => nameKey(r.person)));
  const onBoard = [...boardKeys]
    .filter((k) => ties.byPerson.has(k))
    .flatMap((k) =>
      boardRoles
        .filter((r) => nameKey(r.person) === k)
        .map((r) => ({
          foundation: r.foundation,
          role: r.role,
          tie: ties.byPerson.get(k)![0] as OfficeTie,
        })),
    );
  const matchedPeople = new Set(onBoard.map((x) => x.tie.slug)).size;
  const boardByFoundation = [
    ...onBoard
      .reduce(
        (m, x) => m.set(x.foundation, [...(m.get(x.foundation) ?? []), x]),
        new Map<string, typeof onBoard>(),
      )
      .entries(),
  ].sort((a, b) => b[1].length - a[1].length);
  const ambiguousHere = ties.audit.ambiguous.filter((p) =>
    boardKeys.has(nameKey(p)),
  );
  const boardGaps = BOARD_GAPS.filter((g) => foundationNames.has(g.foundation));
  const boardSources = [
    ...new Map(boardRoles.map((r) => [r.source.url, r.source])).values(),
  ];
  const personas = (n: number) =>
    n === 1 ? "1 persona" : `${integer(n, bcp47)} personas`;
  const boardFinding = boardKeys.size
    ? matchedPeople === 0
      ? `Ninguna de las ${personas(boardKeys.size)} que esta web recoge al frente de ${theirFoundations} coincide con un cargo del Registro de Altos Cargos.`
      : `${matchedPeople === 1 ? "Una" : integer(matchedPeople, bcp47)} de las ${personas(boardKeys.size)} que esta web recoge al frente de ${theirFoundations} ${matchedPeople === 1 ? "tiene" : "tienen"} también un cargo público.`
    : null;

  // ---------- Campaign spending ----------
  const formations = formationsOf(spend, nif);
  const allShares = spend.formations
    .map((f) => ({
      name: f.name,
      share:
        f.ordinary.declared > 0
          ? f.ordinary.otherOrdinary / f.ordinary.declared
          : 0,
      mine: formations.includes(f),
    }))
    .sort((a, b) => b.share - a.share);

  // ---------- People ----------
  const mine = people.filter((p) => p.partyNif === nif);
  const deputies = mine
    .filter((p) => p.deputy)
    .sort((a, b) => a.deputy!.name.localeCompare(b.deputy!.name, "es"));
  const senators = mine.filter(
    (p) => !p.deputy && /^senador/i.test(p.role),
  ).length;
  const meps = mine.filter(
    (p) => !p.deputy && /^eurodiputad/i.test(p.role),
  ).length;
  const others = mine.length - deputies.length - senators - meps;
  const shortCounts = mine.reduce(
    (m, p) => m.set(p.partyShort, (m.get(p.partyShort) ?? 0) + 1),
    new Map<string, number>(),
  );
  const directoryLabel = [...shortCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];
  const peopleFinding = mine.length
    ? `Esta web recoge ${personas(mine.length)} de ${short} con un cargo público, y ${deputies.length === 0 ? "ninguna de ellas tiene escaño" : deputies.length === 1 ? "una de ellas tiene escaño" : `${integer(deputies.length, bcp47)} de ellas tienen escaño`} en el Congreso.`
    : null;

  // ---------- Votes ----------
  const stances = [...votes.votes]
    .sort((a, b) => voteDateISO(a).localeCompare(voteDateISO(b)))
    .map((v) => ({
      vote: v,
      stance: stancesByParty(v).get(nif) ?? null,
      shared: sharedGroupFor(v.legislature, nif),
    }));
  const withStance = stances.filter((s) => s.stance);
  const inFavour = withStance.filter((s) => s.stance === "si").length;
  const voteFinding = withStance.length
    ? `Su grupo votó a favor en ${inFavour === 0 ? "ninguna" : integer(inFavour, bcp47)} de las ${integer(withStance.length, bcp47)} votaciones que sigue esta web en las que tuvo grupo propio.`
    : `${short} no tuvo grupo parlamentario propio en ninguna de las ${integer(stances.length, bcp47)} votaciones que sigue esta web, así que no consta una posición suya como partido.`;

  // ---------- Summary row ----------
  const f0 = formations[0];
  const summary = [
    {
      label: "Del Estado",
      value: big(party.total),
      note: `en subvenciones, entre ${years[0]} y ${years.at(-1)}`,
      cls: "n-state",
      muted: false,
    },
    {
      label: "Donaciones declaradas",
      value: donations ? euro(donations.total.amount, bcp47) : "No consta",
      note: donations
        ? `en ${DONATIONS_SOURCE.year}, de ${donorsWord(donations.total.donors)}`
        : `en la tabla de ${DONATIONS_SOURCE.year} del Tribunal de Cuentas`,
      cls: "n-donors",
      muted: !donations,
    },
    {
      label: "Entró en sus fundaciones",
      value: latest ? money(latest.total) : ents.length ? "0 €" : "No consta",
      note: latest
        ? `en ${latest.year}, aportaciones y subvenciones`
        : ents.length
          ? `en ${listFmt.format(fYears.map(String))}`
          : "ninguna fundación vinculada en esta web",
      cls: "n-foundations",
      muted: !latest,
    },
    {
      label: "Gasto de campaña",
      value: f0 ? money(f0.ordinary.declared) : "No consta",
      note: f0
        ? isCoalition(f0, party.displayName)
          ? "gasto ordinario de su candidatura, europeas de 2024"
          : "gasto ordinario declarado, europeas de 2024"
        : "en las europeas de 2024",
      cls: "n-neutral",
      muted: !f0,
    },
  ];

  return (
    <main>
      <div className="n-shell pb-10 pt-6">
        <p className="n-meta">
          <Link href={L("/nuevo/partidos")}>Partidos</Link>
        </p>
        <h1 className="n-display mt-3" style={{ maxWidth: "22ch" }}>
          {party.displayName}
        </h1>
        <p className="mt-4 text-[1.1rem] text-[var(--n-ink-2)]">
          {short !== party.displayName && `${short}. `}NIF {party.nif}.{" "}
          {rank === 1
            ? "El partido que más dinero público ha recibido en esta web."
            : `El ${rank}.º de ${agg.parties.length} partidos por dinero público recibido.`}
        </p>

        <dl className="mt-10 grid gap-px overflow-hidden rounded-[6px] border border-[var(--n-rule)] bg-[var(--n-rule)] sm:grid-cols-2 lg:grid-cols-4">
          {summary.map((s) => (
            <div key={s.label} className={`${s.cls} bg-[var(--n-card)] p-5`}>
              <dt className="n-label flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block h-[5px] w-6 rounded-full"
                  style={{
                    background: s.muted
                      ? "var(--n-rule-strong)"
                      : "var(--route)",
                  }}
                />
                {s.label}
              </dt>
              <dd
                className={`n-figure mt-3 ${s.muted ? "" : "n-route-text"}`}
                style={{
                  fontSize: s.muted ? "1.35rem" : "1.9rem",
                  color: s.muted ? "var(--n-ink-3)" : undefined,
                }}
              >
                {s.value}
              </dd>
              <dd className="n-meta mt-2">{s.note}</dd>
            </div>
          ))}
        </dl>
        <p className="n-meta mt-3 max-w-[60em]">
          Cada cifra es de una fuente y un año distintos, así que no se suman
          entre sí.
        </p>
      </div>

      {/* ---------- State money ---------- */}
      <Section id="estado" title="Lo que le da el Estado">
        <p className="n-finding">{stateFinding}</p>
        <div className="mt-8 grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <div className="n-state">
            <h3 className="n-h3">Por año de concesión</h3>
            {/* Columns and stations share one grid, so each bar stands over its year. */}
            <div
              aria-hidden
              className="mt-5 grid h-40 items-end"
              style={{
                gridTemplateColumns: `repeat(${years.length}, minmax(0, 1fr))`,
              }}
            >
              {years.map((y) => {
                const v = party.byYear[y] ?? 0;
                return (
                  <div
                    key={y}
                    className="flex h-full flex-col items-center justify-end px-[18%]"
                  >
                    {v > 0 && (
                      <span
                        className="w-full rounded-t-[2px]"
                        style={{
                          height: `${Math.max((v / maxYear) * 100, 2)}%`,
                          background: "var(--route)",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <Line
              cls="n-state"
              className="mt-1"
              stops={years.map((y) => {
                const v = party.byYear[y] ?? 0;
                return {
                  key: String(y),
                  label: String(y),
                  note:
                    v > 0
                      ? `${big(v)}${y === thisYear ? ", año en curso" : ""}`
                      : "sin concesión",
                  on: v > 0,
                };
              })}
            />
            <p className="n-meta mt-4">
              Punto lleno: año con concesiones. Punto vacío: ninguna ese año.
            </p>
          </div>
          <div className="n-state">
            <h3 className="n-h3">Por tipo de subvención</h3>
            <ShareBar
              className="mt-5"
              parts={kinds.map((k) => ({
                label: KIND_LABEL[k],
                value: party.byKind[k],
              }))}
              format={(v) => big(v)}
            />
            <p className="n-meta mt-4">
              La financiación ordinaria se reparte según los escaños y votos
              obtenidos en las últimas elecciones al Congreso.
            </p>
          </div>
        </div>
        <details className="mt-8">
          <summary className="cursor-pointer font-bold">
            Ver las {integer(party.grants.length, bcp47)} concesiones una a una
          </summary>
          <div className="mt-4 overflow-x-auto">
            <table className="n-table min-w-[34rem]">
              <caption className="sr-only">
                Concesiones del Estado a {party.displayName}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Ejercicio</th>
                  <th scope="col" className="n-r">
                    Importe
                  </th>
                </tr>
              </thead>
              <tbody>
                {party.grants.map((g) => (
                  <tr key={g.id}>
                    <td className="n-num whitespace-nowrap">
                      {formatDate(g.date, bcp47)}
                    </td>
                    <td>
                      {KIND_LABEL[g.kind]}
                      {g.legalUrl && (
                        <>
                          {" "}
                          <a href={g.legalUrl} className="n-meta">
                            base legal
                          </a>
                        </>
                      )}
                    </td>
                    <td className="n-num">
                      {g.convocatoria.match(/ejercicio (\d{4})/)?.[1] ?? g.year}
                    </td>
                    <td className="n-r">{euroExact(g.amount, bcp47)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
        <p className="n-source">
          Fuente:{" "}
          <a href={agg.source.url}>Base de Datos Nacional de Subvenciones</a>,
          concesiones a partidos políticos, consultada el{" "}
          {formatDate(agg.generatedAt.slice(0, 10), bcp47)}.
        </p>
      </Section>

      {/* ---------- Private donations ---------- */}
      <Section id="donaciones" title="Lo que declaró en donaciones">
        {donations && donationFinding ? (
          <>
            <p className="n-finding">{donationFinding}</p>
            <div className="n-donors mt-8 grid gap-x-14 gap-y-10 lg:grid-cols-2">
              <div>
                <h3 className="n-h3">El dinero, por tramo</h3>
                <ShareBar
                  className="mt-5"
                  parts={TRANCHES.map((t) => ({
                    label: t.label,
                    value: tranche(t.key).amount,
                  }))}
                  format={(v) => euro(v, bcp47)}
                />
              </div>
              <div>
                <h3 className="n-h3">Los donantes, por tramo</h3>
                {donations.total.donors <= 400 ? (
                  <DotGrid
                    className="mt-5"
                    groups={TRANCHES.map((t, i) => ({
                      key: t.key,
                      count: tranche(t.key).donors,
                      label: `${tranche(t.key).donors === 1 ? "donó" : "donaron"} ${t.label.charAt(0).toLowerCase() + t.label.slice(1)}`,
                      look: i === 0 ? "filled" : i === 1 ? "ink" : "hollow",
                      cls: "n-donors",
                    }))}
                  />
                ) : (
                  <ShareBar
                    className="mt-5"
                    parts={TRANCHES.map((t) => ({
                      label: t.label,
                      value: tranche(t.key).donors,
                    }))}
                    format={(v) =>
                      v === 1 ? "1 donante" : `${integer(v, bcp47)} donantes`
                    }
                  />
                )}
              </div>
            </div>
            <p className="n-body mt-6">
              El informe agrupa las donaciones por importe y no da el nombre de
              ningún donante. Las empresas no pueden donar a un partido.
            </p>
          </>
        ) : (
          <p className="n-finding">
            {`La tabla de donaciones por tramos del Tribunal de Cuentas para ${DONATIONS_SOURCE.year} no incluye a ${short}.`}
          </p>
        )}
        <p className="n-source">
          Fuente: Tribunal de Cuentas,{" "}
          <a href={DONATIONS_SOURCE.url}>
            informe nº 1.573 (ejercicio {DONATIONS_SOURCE.year})
          </a>
          , donaciones del ejercicio por tramos.
        </p>

        {/* The party's own income split: where it belongs, stated as the gap it is. */}
        <div className="mt-14 grid gap-x-12 gap-y-6 border-t border-[var(--n-rule)] pt-10 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <div>
            <h3 className="n-h3">De dónde salen todos sus ingresos</h3>
            <p className="n-body mt-3">
              Cuánto son cuotas de afiliados, aportaciones de sus cargos
              públicos, donaciones y subvenciones está en sus cuentas anuales,
              que audita el Tribunal de Cuentas en el{" "}
              <a href={DONATIONS_SOURCE.url}>
                informe nº 1.573 (ejercicio 2020)
              </a>
              . Esta web todavía no recoge ese desglose.
            </p>
          </div>
          <div>
            <Line
              cls="n-neutral"
              stops={[
                { key: "cuotas", label: "Cuotas de afiliados", on: false },
                {
                  key: "cargos",
                  label: "Aportaciones de cargos públicos",
                  on: false,
                },
                { key: "donaciones", label: "Donaciones", on: false },
                { key: "subvenciones", label: "Subvenciones", on: false },
              ]}
            />
            <p className="n-meta mt-4">
              Puntos vacíos y línea discontinua: todavía no están en esta web.
            </p>
          </div>
        </div>
      </Section>

      {/* ---------- Foundations ---------- */}
      <Section
        id="fundaciones"
        title={ents.length === 1 ? "Su fundación" : "Sus fundaciones"}
      >
        {foundationFinding ? (
          <>
            <p className="n-finding">{foundationFinding}</p>
            <p className="n-body mt-3">
              Fundaciones y otras entidades vinculadas al partido que audita el
              Tribunal de Cuentas. A diferencia de un partido, una fundación sí
              puede recibir donaciones de empresas.
            </p>
            {funded.length > 0 && (
              <div
                className={`mt-10 grid gap-x-14 gap-y-12 ${funded.length > 1 ? "lg:grid-cols-2" : ""}`}
              >
                {funded.map((e) => (
                  <article key={e.slug} className="n-foundations">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="h-[23px] w-[23px] shrink-0 rounded-full border-[3px]"
                        style={{
                          borderColor: "var(--route)",
                          background: "var(--n-card)",
                        }}
                      />
                      <h3 className="n-h3">
                        <Link href={L(`/fundacion/${e.slug}`)}>
                          {displayName(e.name)}
                        </Link>
                      </h3>
                    </div>
                    <div
                      className="mt-5 grid gap-7 border-l-[5px] pl-6 ml-[9px]"
                      style={{ borderColor: "var(--route)" }}
                    >
                      {[...e.years].reverse().map((d) => {
                        const p = partsOf(d);
                        const total =
                          p.party + p.companies + p.individuals + p.subsidies;
                        return (
                          <div key={d.exercise + d.name}>
                            <p className="font-bold">
                              {d.exercise}
                              <span className="n-meta font-normal">
                                {", "}
                                {total > 0
                                  ? `${euro(total, bcp47)} en total`
                                  : "sin aportaciones ni subvenciones"}
                                {d.name !== e.name
                                  ? `, entonces ${displayName(d.name)}`
                                  : ""}
                              </span>
                            </p>
                            {total > 0 && (
                              <ShareBar
                                className="mt-3"
                                parts={FOUNDATION_PARTS.filter(
                                  (x) => p[x.key] > 0,
                                ).map((x) => ({
                                  label: x.label,
                                  value: p[x.key],
                                }))}
                                format={(v) => euro(v, bcp47)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            )}
            {unfunded.length > 0 && (
              <p className="mt-10 max-w-[48rem] text-[var(--n-ink-2)]">
                {unfunded.length === 1
                  ? "Sin aportaciones ni subvenciones en el informe: "
                  : `${unfunded.length} entidades sin aportaciones ni subvenciones en el informe: `}
                {unfunded.map((e, i) => (
                  <span key={e.slug}>
                    {i > 0 && (i === unfunded.length - 1 ? " y " : ", ")}
                    <Link href={L(`/fundacion/${e.slug}`)}>
                      {displayName(e.name)}
                    </Link>
                  </span>
                ))}
                .
              </p>
            )}
          </>
        ) : (
          <p className="n-finding">
            Esta web no vincula ninguna fundación del informe con {short}: o el
            informe no audita ninguna suya, o el nombre de partido que da el
            informe no identifica a uno solo.
          </p>
        )}
        <p className="n-source">
          Fuente: Tribunal de Cuentas,{" "}
          <a href={foundations.source.url}>informe nº 1.642</a> (ejercicios{" "}
          {listFmt.format(fYears.map(String))}). Los ejercicios se muestran por
          separado.
        </p>
      </Section>

      {/* ---------- Officeholders on the boards ---------- */}
      {ents.length > 0 && (
        <Section
          id="patronatos"
          title="Cargos públicos al frente de sus fundaciones"
        >
          {boardFinding ? (
            <>
              <p className="n-finding">{boardFinding}</p>
              <div className="mt-8 grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,22rem)_1fr]">
                <div>
                  <DotGrid
                    groups={[
                      {
                        key: "con",
                        count: matchedPeople,
                        label: "con cargo público",
                        look: "filled",
                        cls: "n-foundations",
                      },
                      {
                        key: "sin",
                        count: boardKeys.size - matchedPeople,
                        label: "sin coincidencia exacta en el registro",
                        look: "hollow",
                      },
                    ]}
                  />
                  <p className="n-meta mt-4">
                    Un punto por persona del patronato o, donde consta, del
                    consejo asesor. Solo se muestra la coincidencia cuando el
                    nombre identifica a una sola persona y el partido del cargo
                    es el de la fundación.
                    {ambiguousHere.length > 0 &&
                      ` Se descartaron ${ambiguousHere.length === 1 ? "un nombre que coincidía" : `${ambiguousHere.length} nombres que coincidían`} con más de un cargo.`}
                  </p>
                </div>
                <div>
                  {boardByFoundation.map(([foundation, list]) => (
                    <div
                      key={foundation}
                      className="n-foundations mb-8 last:mb-0"
                    >
                      <h3 className="n-h3">
                        <Link href={L(`/fundacion/${entitySlug(foundation)}`)}>
                          {displayName(foundation)}
                        </Link>
                      </h3>
                      <ul className="mt-3 grid gap-x-8 sm:grid-cols-2">
                        {list.map(({ tie, role }) => (
                          <li
                            key={tie.slug + role}
                            className="border-t border-[var(--n-rule)] py-3"
                          >
                            <Link
                              href={L(`/nuevo/politico/${tie.slug}`)}
                              className="font-bold"
                            >
                              {tie.person}
                            </Link>
                            <span className="text-[var(--n-ink-2)]">
                              , {role.toLowerCase()}
                            </span>
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
              </div>
            </>
          ) : (
            <p className="n-finding">
              Esta web todavía no recoge quién forma el patronato de{" "}
              {ents.length === 1
                ? "su fundación"
                : `ninguna de sus ${ents.length} entidades`}
              .
            </p>
          )}
          {boardGaps.length > 0 && (
            <ul className="mt-8 grid max-w-[60rem] gap-4">
              {boardGaps.map((g) => (
                <li
                  key={g.foundation}
                  className="border-l-[3px] border-dashed pl-4"
                  style={{ borderColor: "var(--n-ink-3)" }}
                >
                  <p className="font-bold">{displayName(g.foundation)}</p>
                  <p className="n-meta mt-0.5">{g.reason}</p>
                </li>
              ))}
            </ul>
          )}
          <p className="n-source">
            Fuentes:{" "}
            {boardSources.length > 0 && (
              <>
                patronatos según{" "}
                {boardSources.map((s, i) => (
                  <span key={s.url}>
                    {i > 0 && ", "}
                    <a href={s.url}>{s.publisher}</a> ({s.date})
                  </span>
                ))}
                ;{" "}
              </>
            )}
            cargos según el Registro de Altos Cargos
            {ties.audit.registerUpdated
              ? `, actualizado el ${formatDate(ties.audit.registerUpdated, bcp47)}`
              : ""}
            . Que una persona aparezca en los dos registros no dice nada sobre
            por qué.
          </p>
        </Section>
      )}

      {/* ---------- Campaign spending ---------- */}
      <Section id="campana" title="En qué gastó la campaña">
        {formations.length ? (
          formations.map((f) => {
            const o = f.ordinary;
            const share = o.declared > 0 ? o.otherOrdinary / o.declared : 0;
            const coalition = isCoalition(f, party.displayName);
            const itemised = [
              {
                label: "Publicidad exterior",
                value: o.outdoorAdvertising,
                strength: 100,
              },
              {
                label: "Prensa y radio",
                value: o.pressRadioAdvertising,
                strength: 62,
              },
              {
                label: "Gastos financieros",
                value: financial(f),
                strength: 38,
              },
            ].filter((x) => x.value > 0);
            return (
              <div key={f.name}>
                <p className="n-finding">
                  {share > 0
                    ? `El ${pct(share)} de ${coalition ? "lo que su candidatura declaró" : "lo que declaró"} como gasto ordinario en las europeas de 2024 está en una sola línea, sin desglosar.`
                    : `Todo lo que ${coalition ? "su candidatura declaró" : "declaró"} como gasto ordinario en las europeas de 2024 está desglosado: nada quedó en la línea sin desglosar.`}
                </p>
                {coalition && (
                  <p className="n-body mt-3">
                    {`${short} encabezó la candidatura ${formationName(f.name)}. La cifra es de toda la candidatura, no solo de ${short}.`}
                  </p>
                )}
                <div className="mt-8 grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
                  <div>
                    <h3 className="n-h3">
                      {money(o.declared)} de gasto ordinario declarado
                    </h3>
                    <div
                      aria-hidden
                      className="mt-5 flex h-7 w-full gap-[2px] overflow-hidden rounded-[3px]"
                    >
                      {itemised.map((x) => (
                        <span
                          key={x.label}
                          style={{
                            flexGrow: x.value / o.declared,
                            flexBasis: 0,
                            minWidth: 3,
                            background: `color-mix(in srgb, var(--n-ink-2) ${x.strength}%, var(--n-bg))`,
                          }}
                        />
                      ))}
                      {o.otherOrdinary > 0 && (
                        <span
                          className="n-hatch"
                          style={{
                            flexGrow: share,
                            flexBasis: 0,
                            outline: "1px solid var(--n-ink-3)",
                            outlineOffset: -1,
                          }}
                        />
                      )}
                    </div>
                    <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[0.95rem]">
                      {itemised.map((x) => (
                        <li
                          key={x.label}
                          className="inline-flex items-center gap-2"
                        >
                          <span
                            aria-hidden
                            className="inline-block h-3 w-3 rounded-[2px]"
                            style={{
                              background: `color-mix(in srgb, var(--n-ink-2) ${x.strength}%, var(--n-bg))`,
                            }}
                          />
                          {x.label}{" "}
                          <span className="n-num font-bold">
                            {money(x.value)}
                          </span>
                        </li>
                      ))}
                      {o.otherOrdinary > 0 && (
                        <li className="inline-flex items-center gap-2">
                          <span
                            aria-hidden
                            className="n-hatch inline-block h-3 w-3 rounded-[2px]"
                            style={{
                              outline: "1px solid var(--n-ink-3)",
                              outlineOffset: -1,
                            }}
                          />
                          Otros gastos, sin desglosar{" "}
                          <span className="n-num font-bold">
                            {money(o.otherOrdinary)}
                          </span>
                        </li>
                      )}
                    </ul>
                    {f.mailings.totalJustified > 0 && (
                      <p className="n-meta mt-4">
                        {`Aparte, justificó ${money(f.mailings.totalJustified)} en envíos de propaganda electoral, que se contabilizan por separado.`}
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="n-h3">
                      La parte sin desglosar, candidatura a candidatura
                    </h3>
                    <ul className="mt-4 grid gap-2.5">
                      {allShares.map((s) => (
                        <li key={s.name}>
                          <p
                            className={`text-[0.9rem] ${s.mine ? "font-bold" : "text-[var(--n-ink-2)]"}`}
                          >
                            {formationName(s.name)}
                            {s.mine && (
                              <span className="sr-only">
                                {" "}
                                (esta candidatura)
                              </span>
                            )}
                            <span className="n-num">{`, ${pct(s.share)}`}</span>
                          </p>
                          <div
                            aria-hidden
                            className="mt-1 h-2.5 w-full rounded-[2px] bg-[var(--n-rule)]"
                          >
                            <span
                              className={`block h-full rounded-[2px] ${s.mine ? "n-hatch" : ""}`}
                              style={{
                                width: `${(s.share * 100).toFixed(2)}%`,
                                background: s.mine
                                  ? undefined
                                  : "var(--n-rule-strong)",
                                outline: s.mine
                                  ? "1px solid var(--n-ink)"
                                  : undefined,
                                outlineOffset: -1,
                              }}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                    <p className="n-meta mt-3">
                      En negrita y con trama, esta candidatura.
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="n-finding">
            {`El informe del Tribunal de Cuentas sobre las europeas de 2024 no recoge ninguna candidatura que esta web atribuya a ${short}.`}
          </p>
        )}
        <p className="n-source">
          Fuente: Tribunal de Cuentas,{" "}
          <a href={spend.source.url}>informe nº 1.628</a>, contabilidades de las
          elecciones al Parlamento Europeo de 9 de junio de 2024. Solo la
          publicidad exterior y la de prensa y radio tienen límite legal propio,
          y por eso se detallan.
        </p>
      </Section>

      {/* ---------- People ---------- */}
      <Section id="personas" title="Sus personas">
        {peopleFinding ? (
          <>
            <p className="n-finding">{peopleFinding}</p>
            <ShareBar
              className="n-neutral mt-6 max-w-[48rem]"
              parts={[
                { label: "Congreso", value: deputies.length },
                { label: "Senado", value: senators },
                { label: "Parlamento Europeo", value: meps },
                { label: "Otros cargos", value: others },
              ].filter((x) => x.value > 0)}
              format={(v) => integer(v, bcp47)}
            />
            {deputies.length > 0 && (
              // A long list starts folded, so the sections after it stay within reach.
              <details className="mt-10" open={deputies.length <= 16}>
                <summary className="n-h3 cursor-pointer">
                  {deputies.length === 1
                    ? "Su diputada o diputado"
                    : `Sus ${integer(deputies.length, bcp47)} diputados`}
                </summary>
                <ul className="mt-3 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
                  {deputies.map((p) => (
                    <li
                      key={p.slug}
                      className="border-t border-[var(--n-rule)] py-2.5"
                    >
                      <Link
                        href={L(`/nuevo/politico/${p.slug}`)}
                        className="font-bold"
                      >
                        {p.deputy!.fullName}
                      </Link>
                      <p className="n-meta mt-0.5">{p.deputy!.constituency}</p>
                    </li>
                  ))}
                </ul>
              </details>
            )}
            {directoryLabel && (
              <p className="mt-6">
                <Link
                  href={`${L("/politicos")}?party=${encodeURIComponent(directoryLabel)}`}
                >
                  Ver las {personas(mine.length)} en el directorio
                </Link>
              </p>
            )}
          </>
        ) : (
          <p className="n-finding">{`Esta web no recoge ninguna persona con cargo público de ${short}.`}</p>
        )}
        <p className="n-source">
          Fuentes: Registro de Altos Cargos y relación de diputados del Congreso
          de los Diputados.
        </p>
      </Section>

      {/* ---------- Votes ---------- */}
      <Section id="votos" title="Cómo votó su grupo">
        <p className="n-finding">{voteFinding}</p>
        {(withStance.length > 0 || stances.some((x) => x.shared)) && (
          <ol className="mt-8 grid gap-x-12 lg:grid-cols-2">
            {stances.map(({ vote, stance, shared }) => (
              <li
                key={vote.id}
                className="n-topic flex items-start gap-4 border-t border-[var(--n-rule)] py-3"
              >
                <span
                  aria-hidden
                  className={`mt-1 inline-block h-4 w-4 shrink-0 rounded-full border-2 ${stance === "no" ? "n-hatch" : ""}`}
                  style={{
                    borderColor: stance
                      ? stance === "si"
                        ? "var(--route)"
                        : "var(--n-ink-3)"
                      : "var(--n-ink-3)",
                    background:
                      stance === "si"
                        ? "var(--route)"
                        : stance === "ab"
                          ? "var(--n-rule-strong)"
                          : stance === "no"
                            ? undefined
                            : "transparent",
                  }}
                />
                <div className="min-w-0">
                  <a href={vote.sourceUrl} className="text-[0.95rem]">
                    {vote.law}
                  </a>
                  <p className="n-meta mt-0.5">
                    <span className="font-bold text-[var(--n-ink)]">
                      {stance
                        ? STANCE[stance]
                        : shared
                          ? `Sin posición propia, dentro de ${shared.short}`
                          : "Sin grupo propio"}
                    </span>
                    {", "}
                    {vote.date}.{" "}
                    <Link href={L(`/nuevo/tema/${vote.topic}`)}>
                      {vote.topicLabel}
                    </Link>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
        <p className="n-source">
          Fuente: actas de votación nominal del Congreso. La posición del grupo
          es la de la mayoría de sus diputados; un partido dentro de un grupo
          compartido no tiene posición propia.
        </p>
      </Section>

      <div className="n-shell pb-4">
        <p className="n-meta">
          <Link href={L(`/party/${party.nif}`)}>
            Ver la ficha de {short} en el sitio actual
          </Link>
        </p>
      </div>
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
