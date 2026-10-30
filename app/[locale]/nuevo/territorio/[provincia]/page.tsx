import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getProvinces, provinceBySlug } from "@/lib/provinces";
import { getLocalView } from "@/lib/local";
import { absoluteMajority } from "@/lib/investitures";
import { getRegions } from "@/lib/regions";
import { getPeople, type Person } from "@/lib/people";
import { getDeclarations } from "@/lib/declarations";
import { getSalaries, SALARIES_SOURCE_URL } from "@/lib/salaries";
import { getAggregation } from "@/lib/data";
import {
  getFoundations,
  partyNifByFoundation,
  displayName,
  entitySlug,
} from "@/lib/foundations";
import { officeTies } from "@/lib/officeholder-ties";
import { ROLES } from "@/lib/foundation-people";
import { nameKey } from "@/lib/name-key.mjs";
import { formationOf } from "@/lib/deputy-join.mjs";
import {
  caName,
  deputiesByProvince,
  declarationState,
  type DeclarationState,
} from "@/lib/constituencies";
import type { Deputy } from "@/lib/deputies";
import {
  euroExact,
  euroM,
  formatDate,
  integer,
  percent,
  rate,
} from "@/lib/format";
import ShareBar from "@/components/nuevo/ShareBar";
import DotGrid from "@/components/nuevo/DotGrid";
import RegionMap from "@/components/nuevo/RegionMap";

export const revalidate = 3600;

export async function generateStaticParams() {
  const { provinces } = await getProvinces();
  return provinces.map((p) => ({ provincia: p.slug }));
}

/**
 * The redesign prototype's place page: one province, as a hub.
 *
 * It answers, in order: who represents this province in the Congreso, what the
 * public register says they are paid, what they declare owning, what public
 * money their parties receive, and what is measured for the comunidad the
 * province sits in.
 *
 * Two boundaries hold throughout. The deputies are the province's own: Congreso
 * elects them by province. Everything else is measured for the comunidad
 * autónoma, or for a party across all of Spain, and each section says which; a
 * regional or national figure is never divided down to a province. And nothing
 * here joins one record to another: the deputies' pay, their declarations and
 * their parties' subsidies sit side by side, none offered as the reason for any
 * other. People are listed by surname, never ordered by what they earn or own.
 */

/** "del PP", "de Vox": the article Spanish uses before each list's short name. */
const WITH_ARTICLE = new Set([
  "PP",
  "PSOE",
  "PSC",
  "PNV",
  "BNG",
  "PsdeG-PSOE",
  "PSIB-PSOE",
  "PSE-EE (PSOE)",
  "PSN-PSOE",
]);
const of = (short: string) =>
  WITH_ARTICLE.has(short) ? `del ${short}` : `de ${short}`;
const to = (short: string) =>
  WITH_ARTICLE.has(short) ? `al ${short}` : `a ${short}`;

const STATE_LABEL: Record<DeclarationState, [string, string]> = {
  securities: [
    "Declara acciones, bonos u otros valores",
    "Declaran acciones, bonos u otros valores",
  ],
  transcribed: [
    "Declaración transcrita, sin valores",
    "Declaración transcrita, sin valores",
  ],
  pending: [
    "Declaración sin transcribir todavía",
    "Declaración sin transcribir todavía",
  ],
  none: [
    "Sin declaración enlazada en su ficha",
    "Sin declaración enlazada en su ficha",
  ],
};

export default async function PrototypePlace({
  params,
}: {
  params: Promise<{ locale: string; provincia: string }>;
}) {
  const { locale: localeParam, provincia } = await params;
  const province = await provinceBySlug(provincia);
  if (!province) notFound();
  const view = await getLocalView(province.territoryId);
  if (!view) notFound();

  const { locale, bcp47 } = getDict(localeParam);
  const [join, decl, people, salaries, agg, foundations, regions] =
    await Promise.all([
      deputiesByProvince(),
      getDeclarations(),
      getPeople(),
      getSalaries(),
      getAggregation(),
      getFoundations(),
      getRegions(),
    ]);
  const ties = await officeTies(partyNifByFoundation(foundations));

  const L = (path: string) => `/${locale}${path}`;
  const n = (x: number) => integer(x, bcp47);
  const pct = (x: number) => percent(x, bcp47, 1);
  const listFmt = new Intl.ListFormat(bcp47, { type: "conjunction" });
  const plural = (x: number, one: string, many: string) =>
    `${n(x)} ${x === 1 ? one : many}`;

  const {
    territory,
    government,
    investiture,
    officeholders,
    hate,
    poverty,
    wages,
  } = view;
  const ca = caName(territory.id, territory.mapName);
  const sameName =
    province.name === ca || province.name === territory.registerName;
  const name = province.name;

  // ---------- The deputies, by surname, with what each record holds ----------
  const personByCod = new Map<number, Person>();
  for (const p of people) if (p.deputy) personByCod.set(p.deputy.cod, p);
  const deputies = [...(join.byProvince.get(province.slug) ?? [])].sort(
    (a, b) => a.name.localeCompare(b.name, "es"),
  );
  const rows = deputies.map((d) => {
    const person = personByCod.get(d.cod) ?? null;
    const formation = formationOf(d.formation);
    return {
      deputy: d,
      slug: person?.slug ?? d.slug,
      // A deputy the register does not list has no figure, never a zero.
      gross:
        person && person.inRegister && person.gross > 0 ? person.gross : null,
      registerRole: person?.inRegister ? person.role : null,
      short: formation?.short ?? d.formation,
      nif: formation?.nif ?? null,
      state: declarationState(d, decl.declarations),
    };
  });
  const N = rows.length;
  const paid = rows.filter((r) => r.gross !== null).length;

  // Seats by list, largest first.
  const lists = [
    ...rows.reduce(
      (m, r) => m.set(r.short, [...(m.get(r.short) ?? []), r]),
      new Map<string, typeof rows>(),
    ),
  ]
    .map(([short, list]) => ({
      short,
      nif: list[0].nif,
      label: list[0].deputy.formation,
      seats: list.length,
    }))
    .sort((a, b) => b.seats - a.seats || a.short.localeCompare(b.short, "es"));

  const repFinding =
    N === 0
      ? `No consta ningún diputado elegido por ${name} en los datos del Congreso.`
      : N === 1
        ? `${name} elige 1 diputado al Congreso, ${of(lists[0].short)}.`
        : `${name} elige ${n(N)} diputados al Congreso: ${listFmt.format(lists.map((l) => `${n(l.seats)} ${of(l.short)}`))}.`;

  // Officeholders of this province on a party foundation's board, by both join conditions.
  const slugs = new Set(rows.map((r) => r.slug));
  const boards = [...ties.byPerson.entries()]
    .filter(([, list]) => list.some((t) => slugs.has(t.slug)))
    .flatMap(([key, list]) => {
      const row = rows.find((r) => list.some((t) => t.slug === r.slug))!;
      return ROLES.filter((r) => nameKey(r.person) === key).map((r) => ({
        row,
        role: r.role,
        foundation: r.foundation,
      }));
    });
  const boardPeople = new Set(boards.map((b) => b.row.slug)).size;

  // ---------- Pay ----------
  const payFinding =
    N === 0
      ? null
      : N === 1
        ? paid
          ? `El Registro de Altos Cargos publica el sueldo de su único diputado.`
          : `El Registro de Altos Cargos no publica el sueldo de su único diputado.`
        : paid === N
          ? `El Registro de Altos Cargos publica el sueldo de los ${n(N)} diputados de ${name}.`
          : paid === 0
            ? `El Registro de Altos Cargos no publica el sueldo de ninguno de los ${n(N)} diputados de ${name}.`
            : `El Registro de Altos Cargos publica el sueldo de ${n(paid)} de los ${n(N)} diputados de ${name}; de los otros ${n(N - paid)} no consta.`;

  // ---------- Declarations ----------
  const count = (k: DeclarationState) =>
    rows.filter((r) => r.state === k).length;
  const sec = count("securities");
  const read = sec + count("transcribed");
  const filed = N - count("none");
  const declFinding =
    filed === 0
      ? `Ningún diputado de ${name} tiene declaración de bienes enlazada en su ficha.`
      : read === 0
        ? filed === 1
          ? `La declaración de bienes de su diputado no está transcrita todavía.`
          : `Ninguna de las ${n(filed)} declaraciones de bienes de los diputados de ${name} está transcrita todavía.`
        : read === 1
          ? sec
            ? `El único diputado de ${name} con la declaración ya transcrita declara acciones, bonos u otros valores.`
            : `El único diputado de ${name} con la declaración ya transcrita no declara acciones, bonos ni otros valores.`
          : sec === 0
            ? `Ninguno de los ${n(read)} diputados de ${name} con la declaración ya transcrita declara acciones, bonos ni otros valores.`
            : sec === read
              ? `Los ${n(read)} diputados de ${name} con la declaración ya transcrita declaran acciones, bonos u otros valores.`
              : `${n(sec)} de los ${n(read)} diputados de ${name} con la declaración ya transcrita ${sec === 1 ? "declara" : "declaran"} acciones, bonos u otros valores.`;
  const allDecl = decl.declarations;
  const allSec = allDecl.filter((d) =>
    d.otherAssets.some((a) => a.kind === "securities"),
  ).length;

  // ---------- Party subsidies: the latest year, for all of Spain ----------
  const year = Math.max(...agg.years);
  const money = lists.map((l) => {
    const party = l.nif
      ? (agg.parties.find((p) => p.nif === l.nif) ?? null)
      : null;
    return { ...l, party, amount: party ? (party.byYear[year] ?? 0) : null };
  });
  const funded = money
    .filter((m) => (m.amount ?? 0) > 0)
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
  const unfunded = money.filter((m) => !((m.amount ?? 0) > 0));
  const maxAmount = Math.max(1, ...funded.map((m) => m.amount ?? 0));
  const moneyFinding =
    lists.length === 0
      ? null
      : funded.length === 0
        ? `Ninguna de las listas con escaño por ${name} recibió en ${year} una subvención estatal a su nombre.`
        : lists.length === 1
          ? `En ${year}, el Estado concedió ${euroM(funded[0].amount!, bcp47, 1)} ${to(funded[0].short)}, la única lista con escaño por ${name}, para toda España.`
          : `De las ${n(lists.length)} listas con escaño por ${name}, ${funded.length === lists.length ? "todas" : n(funded.length)} recibieron en ${year} una subvención estatal a su nombre; la mayor, ${euroM(funded[0].amount!, bcp47, 1)} ${of(funded[0].short)}, para toda España.`;

  // ---------- The comunidad ----------
  const registerFinding =
    officeholders.count === 0
      ? `El Registro de Altos Cargos no sitúa ningún cargo en ${ca}.`
      : officeholders.withSalary === 0 || officeholders.medianGross === null
        ? `El Registro de Altos Cargos sitúa ${n(officeholders.count)} cargos en ${ca}, y no publica el sueldo de ninguno.`
        : `El Registro de Altos Cargos sitúa ${n(officeholders.count)} cargos en ${ca}; publica el sueldo de ${n(officeholders.withSalary)}, con una mediana de ${euroExact(officeholders.medianGross, bcp47)} al año.`;

  return (
    <main>
      {/* ---------- The place, and what is on record ---------- */}
      <div className="n-shell grid gap-x-12 gap-y-8 pb-10 pt-6 lg:grid-cols-[1fr_16rem]">
        <div>
          <p className="n-meta">
            <Link href={L("/nuevo/territorios")}>Territorios</Link>
          </p>
          <h1 className="n-display mt-3">{name}</h1>
          <p className="mt-4 max-w-[42em] text-[1.1rem] text-[var(--n-ink-2)]">
            {sameName
              ? `${name} es a la vez provincia y comunidad autónoma. Sus diputados se eligen aquí; las cifras de la comunidad, más abajo, son de ese mismo territorio.`
              : `${name} es una provincia de ${ca}. Sus diputados se eligen aquí; las cifras de la comunidad, más abajo, son de toda ${ca} y no se reparten por provincias.`}
          </p>
        </div>
        <figure className="m-0 self-end">
          <RegionMap
            regions={regions}
            highlight={territory.id}
            title={`Situación de ${ca}`}
            desc={`Mapa de las comunidades autónomas con ${ca} marcada.`}
            className="max-w-[16rem]"
          />
          <figcaption className="n-meta mt-1">
            Marcada, {ca}. El mapa es de comunidades: no dibuja las provincias.
          </figcaption>
        </figure>

        <dl className="grid gap-px overflow-hidden rounded-[6px] border border-[var(--n-rule)] bg-[var(--n-rule)] sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4">
          {[
            {
              label: "Diputados en el Congreso",
              value: n(N),
              note: "elegidos por esta provincia",
            },
            {
              label: "Con sueldo publicado",
              value: N ? `${n(paid)} de ${n(N)}` : "—",
              note: "en el Registro de Altos Cargos",
            },
            {
              label: "Declaraciones transcritas",
              value: filed ? `${n(read)} de ${n(filed)}` : "—",
              note: "declaraciones de bienes en esta web",
            },
            {
              label: `Preside ${ca}`,
              value: government ? government.president : "No consta",
              note: government
                ? `${government.partyLabel}, desde el ${formatDate(government.since, bcp47)}`
                : "sin presidencia registrada",
              small: true,
            },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--n-card)] p-5">
              <dt className="n-label">{s.label}</dt>
              <dd
                className="n-figure mt-3"
                style={{
                  fontSize: s.small ? "1.35rem" : "1.9rem",
                  lineHeight: 1.15,
                }}
              >
                {s.value}
              </dd>
              <dd className="n-meta mt-2">{s.note}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ---------- Who represents it ---------- */}
      <Section id="representan" title="Quién la representa en el Congreso">
        <p className="n-finding">{repFinding}</p>
        {N > 0 && (
          <>
            <div className="n-neutral mt-6 max-w-[48rem]">
              <ShareBar
                parts={lists.map((l) => ({ label: l.short, value: l.seats }))}
                format={(v) => plural(v, "escaño", "escaños")}
              />
            </div>
            <ul className="mt-8 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((r) => (
                <li
                  key={r.deputy.cod}
                  className="border-t border-[var(--n-rule)] py-3"
                >
                  <Link
                    href={L(`/nuevo/politico/${r.slug}`)}
                    className="font-bold"
                  >
                    {r.deputy.fullName}
                  </Link>
                  <p className="n-meta mt-0.5">
                    {r.nif ? (
                      <Link href={L(`/nuevo/partido/${r.nif}`)}>{r.short}</Link>
                    ) : (
                      r.short
                    )}
                    {`, ${r.deputy.group}`}
                  </p>
                </li>
              ))}
            </ul>

            {/* Who of them also sits on a party foundation's board. */}
            <div className="mt-8 max-w-[46rem]">
              <p className="text-[var(--n-ink-2)]">
                {boardPeople === 0
                  ? N === 1
                    ? "No consta en el patronato de ninguna fundación de partido."
                    : "Ninguno de ellos consta en el patronato de una fundación de partido."
                  : `${N === 1 ? "Se sienta" : plural(boardPeople, "de ellos se sienta", "de ellos se sientan")} también en el patronato de una fundación de partido. Son dos registros sobre la misma persona, puestos uno al lado del otro.`}
              </p>
              {boards.length > 0 && (
                <ol className="mt-5">
                  {boards.map((b) => (
                    <li
                      key={b.row.slug + b.foundation + b.role}
                      className="n-foundations relative pb-5 pl-9 last:pb-0"
                    >
                      <span
                        aria-hidden
                        className="absolute bottom-0 left-[9px] top-0 w-[4px]"
                        style={{ background: "var(--route)" }}
                      />
                      <span
                        aria-hidden
                        className="absolute left-0 top-[3px] h-[22px] w-[22px] rounded-full border-[3px] bg-[var(--n-card)]"
                        style={{ borderColor: "var(--route)" }}
                      />
                      <p className="n-label">
                        <Link href={L(`/nuevo/politico/${b.row.slug}`)}>
                          {b.row.deputy.fullName}
                        </Link>
                        , {b.role.toLowerCase()} en
                      </p>
                      <Link href={L(`/fundacion/${entitySlug(b.foundation)}`)}>
                        {displayName(b.foundation)}
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </>
        )}
        <p className="n-source">
          Fuente: Congreso de los Diputados, datos abiertos de la legislatura en
          curso. Patronatos: Tribunal de Cuentas y registros de fundaciones,
          cruzados con el Registro de Altos Cargos solo cuando el nombre
          identifica a una sola persona y el partido coincide. Los senadores no
          se incluyen: el registro no dice por qué provincia fue elegido cada
          uno.
        </p>
      </Section>

      {/* ---------- What they are paid ---------- */}
      {N > 0 && (
        <Section id="sueldos" title="Lo que cobran">
          {payFinding && <p className="n-finding">{payFinding}</p>}
          <div className="mt-6 max-w-[48rem]">
            <div
              aria-hidden
              className="flex h-7 w-full gap-[2px] overflow-hidden rounded-[3px]"
            >
              {paid > 0 && (
                <span
                  style={{
                    flexGrow: paid,
                    flexBasis: 0,
                    background: "var(--n-ink-2)",
                  }}
                />
              )}
              {N - paid > 0 && (
                <span
                  style={{
                    flexGrow: N - paid,
                    flexBasis: 0,
                    outline: "1px solid var(--n-ink-3)",
                    outlineOffset: -1,
                  }}
                />
              )}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[0.95rem]">
              {paid > 0 && (
                <li className="inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3 rounded-[2px]"
                    style={{ background: "var(--n-ink-2)" }}
                  />
                  Sueldo publicado{" "}
                  <span className="n-num font-bold">{n(paid)}</span>
                </li>
              )}
              {N - paid > 0 && (
                <li className="inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3 rounded-[2px]"
                    style={{
                      outline: "1px solid var(--n-ink-3)",
                      outlineOffset: -1,
                    }}
                  />
                  No consta en el registro{" "}
                  <span className="n-num font-bold">{n(N - paid)}</span>
                </li>
              )}
            </ul>
          </div>
          {/* A long table starts folded, so the sections after it stay within reach. */}
          <details className="mt-8" open={rows.length <= 16}>
            <summary className="cursor-pointer font-bold">
              Ver el sueldo de cada diputado
            </summary>
            <div className="relative mt-4 overflow-x-auto">
              <table className="n-table min-w-[30rem] max-w-[52rem]">
                <caption className="sr-only">
                  Sueldo público anual de los diputados de {name}, por apellido
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Diputado o diputada</th>
                    <th scope="col">Cargo en el registro</th>
                    <th scope="col" className="n-r">
                      Sueldo bruto anual
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.deputy.cod}>
                      <th scope="row" className="font-normal">
                        <Link href={L(`/nuevo/politico/${r.slug}`)}>
                          {r.deputy.fullName}
                        </Link>
                      </th>
                      <td className="text-[var(--n-ink-2)]">
                        {r.registerRole ?? "No consta en el registro"}
                      </td>
                      <td className="n-r">
                        {r.gross !== null ? (
                          euroExact(r.gross, bcp47)
                        ) : (
                          <span className="text-[var(--n-ink-3)]">
                            <span aria-hidden>—</span>
                            <span className="sr-only">no consta</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <p className="n-source">
            Fuente: <a href={SALARIES_SOURCE_URL}>{salaries.source.name}</a>
            {salaries.source.updated
              ? `, actualizado el ${formatDate(salaries.source.updated, bcp47)}`
              : ""}
            . Por orden de apellido. «—» quiere decir que el registro no publica
            sueldo para esa persona, no que no cobre.
          </p>
        </Section>
      )}

      {/* ---------- What they declare ---------- */}
      {N > 0 && (
        <Section id="declaran" title="Lo que declaran sus diputados">
          <div className="grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,24rem)_1fr]">
            <div>
              <p className="n-finding">{declFinding}</p>
              <p className="n-meta mt-3">
                {`En todo el Congreso, ${n(allSec)} de los ${n(allDecl.length)} diputados con la declaración ya transcrita declaran valores.`}
              </p>
            </div>
            <div>
              <DotGrid
                groups={
                  [
                    {
                      key: "valores",
                      count: sec,
                      label:
                        sec === 1
                          ? "declara acciones, bonos u otros valores"
                          : "declaran acciones, bonos u otros valores",
                      look: "filled",
                      cls: "n-companies",
                    },
                    {
                      key: "otros",
                      count: count("transcribed"),
                      label: "transcritas, sin valores declarados",
                      look: "ink",
                    },
                    {
                      key: "pendientes",
                      count: count("pending"),
                      label: "sin transcribir todavía",
                      look: "hollow",
                    },
                  ].filter((g) => g.count > 0) as Parameters<
                    typeof DotGrid
                  >[0]["groups"]
                }
              />
              {count("none") > 0 && (
                <p className="n-meta mt-3">
                  {`${plural(count("none"), "diputado no tiene", "diputados no tienen")} declaración de bienes enlazada en su ficha del Congreso, y no se dibuja.`}
                </p>
              )}
            </div>
          </div>
          <div className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                "securities",
                "transcribed",
                "pending",
                "none",
              ] as DeclarationState[]
            )
              .map((k) => ({ k, list: rows.filter((r) => r.state === k) }))
              .filter((g) => g.list.length > 0)
              .map((g) => (
                <div
                  key={g.k}
                  className={g.k === "securities" ? "n-companies" : undefined}
                >
                  <h3 className="n-label">
                    {STATE_LABEL[g.k][g.list.length === 1 ? 0 : 1]}
                  </h3>
                  <ul className="mt-2">
                    {g.list.map((r) => (
                      <li
                        key={r.deputy.cod}
                        className="border-t border-[var(--n-rule)] py-2"
                      >
                        <Link href={L(`/nuevo/politico/${r.slug}`)}>
                          {r.deputy.fullName}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
          <p className="n-source">
            Fuente: declaraciones de bienes y rentas registradas en el Congreso,
            leídas del escaneo oficial y comprobadas antes de publicarse. Las
            cifras de cada una están en la ficha de la persona.{" "}
            <Link href={L("/politicos/declaraciones")}>
              Ver todas las declaraciones
            </Link>
          </p>
        </Section>
      )}

      {/* ---------- Public money to their parties ---------- */}
      {lists.length > 0 && (
        <Section id="partidos" title="Dinero público a sus partidos">
          {moneyFinding && <p className="n-finding">{moneyFinding}</p>}
          <p className="n-body mt-3">
            Es la subvención de cada partido para toda España. Ninguna fuente la
            reparte por provincias, y esta página tampoco: no dice cuánto llega
            a {name}.
          </p>
          {funded.length > 0 && (
            <ul className="n-state mt-8 grid max-w-[52rem] gap-4">
              {funded.map((m) => (
                <li
                  key={m.short}
                  className="grid gap-x-4 gap-y-1 sm:grid-cols-[9rem_1fr_10rem] sm:items-center"
                >
                  <Link
                    href={L(`/nuevo/partido/${m.nif}`)}
                    className="font-bold"
                  >
                    {m.short}
                  </Link>
                  <span aria-hidden className="flex h-3">
                    <span
                      className="h-3 rounded-[2px]"
                      style={{
                        width: `${((m.amount ?? 0) / maxAmount) * 100}%`,
                        minWidth: 3,
                        background: "var(--route)",
                      }}
                    />
                  </span>
                  <span className="n-num whitespace-nowrap sm:text-right">
                    {euroExact(m.amount ?? 0, bcp47)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {unfunded.length > 0 && (
            <ul className="mt-6 grid max-w-[52rem] gap-2 text-[var(--n-ink-2)]">
              {unfunded.map((m) => (
                <li key={m.short}>
                  <span className="font-bold text-[var(--n-ink)]">
                    {m.short}
                  </span>
                  {": "}
                  {m.nif
                    ? `sin subvención estatal a su nombre en ${year}.`
                    : formationOf(m.label)?.family === "psoe"
                      ? "es una federación del PSOE; la subvención se concede al PSOE, y no consta por separado."
                      : "fue una lista de coalición; la subvención se concede a cada partido por separado, y no a la lista."}
                </li>
              ))}
            </ul>
          )}
          <p className="n-source">
            Fuente: Base de Datos Nacional de Subvenciones, concesiones del
            Ministerio del Interior a partidos políticos con fecha de {year}{" "}
            (financiación ordinaria y gastos de seguridad). Es dinero del
            partido, no de sus diputados.
          </p>
        </Section>
      )}

      {/* ---------- The comunidad ---------- */}
      <Section
        id="comunidad"
        title={
          sameName
            ? territory.id === "18" || territory.id === "19"
              ? "La ciudad autónoma"
              : "La comunidad"
            : `La comunidad: ${ca}`
        }
      >
        <p className="n-body">
          {sameName
            ? `Lo que sigue está medido para ${ca}, que es la misma provincia.`
            : `Lo que sigue está medido para toda ${ca}, no para ${name}: estas cifras no existen por provincia, y dividirlas sería inventarlas.`}
        </p>

        <div className="mt-10 grid gap-x-14 gap-y-14 lg:grid-cols-2">
          {/* Who presides */}
          <article>
            <h3 className="n-h3">Quién preside</h3>
            {government ? (
              <>
                <p className="n-finding mt-3">
                  {`${government.president} (${government.partyLabel}) preside ${ca} desde el ${formatDate(government.since, bcp47)}.`}
                </p>
                {investiture.investiture &&
                  investiture.status !== "pp-majority" &&
                  (() => {
                    const inv = investiture.investiture;
                    const others =
                      inv.chamberSeats - inv.seatsPP - inv.seatsVox;
                    const majority = absoluteMajority(inv.chamberSeats);
                    return (
                      <>
                        <div aria-hidden className="relative mt-5">
                          <div className="flex h-5 w-full gap-[2px] overflow-hidden rounded-[3px]">
                            <span
                              style={{
                                flexGrow: inv.seatsPP,
                                flexBasis: 0,
                                background: "var(--n-ink-2)",
                              }}
                            />
                            <span
                              className="n-hatch"
                              style={{
                                flexGrow: inv.seatsVox,
                                flexBasis: 0,
                                outline: "1px solid var(--n-ink-3)",
                                outlineOffset: -1,
                              }}
                            />
                            <span
                              style={{
                                flexGrow: others,
                                flexBasis: 0,
                                background: "var(--n-rule)",
                              }}
                            />
                          </div>
                          <span
                            className="absolute -bottom-1 -top-1 w-[2px]"
                            style={{
                              left: `${(majority / inv.chamberSeats) * 100}%`,
                              background: "var(--n-ink)",
                            }}
                          />
                        </div>
                        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem]">
                          <li className="inline-flex items-center gap-2">
                            <span
                              aria-hidden
                              className="inline-block h-3 w-3 rounded-[2px]"
                              style={{ background: "var(--n-ink-2)" }}
                            />
                            PP{" "}
                            <span className="n-num font-bold">
                              {plural(inv.seatsPP, "escaño", "escaños")}
                            </span>
                          </li>
                          <li className="inline-flex items-center gap-2">
                            <span
                              aria-hidden
                              className="n-hatch inline-block h-3 w-3 rounded-[2px]"
                              style={{
                                outline: "1px solid var(--n-ink-3)",
                                outlineOffset: -1,
                              }}
                            />
                            Vox{" "}
                            <span className="n-num font-bold">
                              {plural(inv.seatsVox, "escaño", "escaños")}
                            </span>
                          </li>
                          <li className="inline-flex items-center gap-2">
                            <span
                              aria-hidden
                              className="inline-block h-3 w-3 rounded-[2px]"
                              style={{ background: "var(--n-rule)" }}
                            />
                            Resto{" "}
                            <span className="n-num font-bold">
                              {plural(others, "escaño", "escaños")}
                            </span>
                          </li>
                          <li className="inline-flex items-center gap-2">
                            <span
                              aria-hidden
                              className="inline-block h-3 w-[2px]"
                              style={{ background: "var(--n-ink)" }}
                            />
                            Mayoría absoluta, {n(majority)}
                          </li>
                        </ul>
                        <p className="n-body mt-3 text-[0.95rem]">
                          {investiture.status === "vox-decisive"
                            ? `El PP tenía ${n(inv.seatsPP)} de ${n(inv.chamberSeats)} escaños, y la investidura salió adelante con votos de Vox: sin ellos no había mayoría.`
                            : `El PP tenía ${n(inv.seatsPP)} de ${n(inv.chamberSeats)} escaños, menos de la mayoría absoluta. Esta web recoge la aritmética; el acta de la votación no está verificada aquí.`}
                        </p>
                      </>
                    );
                  })()}
                <p className="n-source">
                  Fuente:{" "}
                  <a href={view.governmentSource.url}>
                    Wikipedia, {view.governmentSource.body}
                  </a>
                  , comprobado el{" "}
                  {formatDate(view.governmentSource.checked, bcp47)}. Es quién
                  ocupa la presidencia, no el resultado de las elecciones.
                </p>
              </>
            ) : (
              <p className="mt-3 text-[var(--n-ink-2)]">
                No consta presidencia para este territorio.
              </p>
            )}
          </article>

          {/* Officeholders in the register */}
          <article>
            <h3 className="n-h3">Cargos públicos en el registro</h3>
            <p className="n-finding mt-3">{registerFinding}</p>
            {officeholders.count > 0 && (
              <>
                <div
                  aria-hidden
                  className="mt-5 flex h-5 w-full gap-[2px] overflow-hidden rounded-[3px]"
                >
                  {officeholders.withSalary > 0 && (
                    <span
                      style={{
                        flexGrow: officeholders.withSalary,
                        flexBasis: 0,
                        background: "var(--n-ink-2)",
                      }}
                    />
                  )}
                  {officeholders.count - officeholders.withSalary > 0 && (
                    <span
                      style={{
                        flexGrow:
                          officeholders.count - officeholders.withSalary,
                        flexBasis: 0,
                        outline: "1px solid var(--n-ink-3)",
                        outlineOffset: -1,
                      }}
                    />
                  )}
                </div>
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem]">
                  {officeholders.withSalary > 0 && (
                    <li className="inline-flex items-center gap-2">
                      <span
                        aria-hidden
                        className="inline-block h-3 w-3 rounded-[2px]"
                        style={{ background: "var(--n-ink-2)" }}
                      />
                      Con sueldo publicado{" "}
                      <span className="n-num font-bold">
                        {n(officeholders.withSalary)}
                      </span>
                    </li>
                  )}
                  {officeholders.count - officeholders.withSalary > 0 && (
                    <li className="inline-flex items-center gap-2">
                      <span
                        aria-hidden
                        className="inline-block h-3 w-3 rounded-[2px]"
                        style={{
                          outline: "1px solid var(--n-ink-3)",
                          outlineOffset: -1,
                        }}
                      />
                      Sin sueldo publicado{" "}
                      <span className="n-num font-bold">
                        {n(officeholders.count - officeholders.withSalary)}
                      </span>
                    </li>
                  )}
                </ul>
              </>
            )}
            <p className="n-meta mt-3">
              {`${n(view.registerWithoutTerritory)} de las ${n(view.registerTotal)} filas del registro no indican comunidad y no entran en este recuento. `}
              <Link
                href={L(
                  `/politicos?q=${encodeURIComponent(territory.registerName)}`,
                )}
              >
                Ver estos cargos
              </Link>
              {", o "}
              <Link href={L("/nuevo/territorios#registro")}>
                compararlos con otras comunidades
              </Link>
              .
            </p>
            <p className="n-source">
              Fuente: <a href={SALARIES_SOURCE_URL}>{salaries.source.name}</a>.
              Sueldo bruto anual.
            </p>
          </article>

          {/* Wages */}
          <article>
            <h3 className="n-h3">Lo que se cobra en {ca}</h3>
            {wages ? (
              <>
                <p className="n-finding mt-3">
                  {`La mitad de los asalariados de ${ca} cobró menos de ${euroExact(wages.median, bcp47)} brutos al año, frente a ${euroExact(wages.nationalMedian, bcp47)} en el conjunto de España.`}
                </p>
                <WageScale wages={wages} fmt={(v) => euroExact(v, bcp47)} />
                <p className="n-source">
                  Fuente:{" "}
                  <a href={wages.sourceUrl}>
                    INE, Encuesta Anual de Estructura Salarial
                  </a>
                  , {wages.period}. Salario bruto anual por trabajador.
                </p>
              </>
            ) : (
              <p className="mt-3 text-[var(--n-ink-2)]">
                {`La encuesta salarial del INE no publica percentiles para ${ca}: sus tablas por comunidad cubren las diecisiete comunidades autónomas y no las dos ciudades autónomas. No se sustituye por la cifra nacional.`}
              </p>
            )}
          </article>

          {/* Poverty */}
          <article>
            <h3 className="n-h3">Riesgo de pobreza o exclusión</h3>
            {poverty ? (
              <>
                <p className="n-finding mt-3">
                  {`En ${ca}, el ${pct(poverty.percent / 100)} de la población está en riesgo de pobreza o exclusión social, frente al ${pct(poverty.nationalPercent / 100)} en el conjunto de España.`}
                </p>
                <Compare
                  rows={[
                    {
                      label: ca,
                      value: poverty.percent,
                      text: pct(poverty.percent / 100),
                      strong: true,
                    },
                    {
                      label: "España",
                      value: poverty.nationalPercent,
                      text: pct(poverty.nationalPercent / 100),
                    },
                  ]}
                  max={100}
                />
                <p className="n-source">
                  Fuente:{" "}
                  <a href={poverty.sourceUrl}>
                    INE, Encuesta de Condiciones de Vida
                  </a>
                  , {poverty.period}. Serie {poverty.base}. Es una proporción de
                  la población, no un recuento.
                </p>
              </>
            ) : (
              <p className="mt-3 text-[var(--n-ink-2)]">
                La Encuesta de Condiciones de Vida no publica este indicador
                para este territorio.
              </p>
            )}
          </article>

          {/* Hate crime */}
          <article className="lg:col-span-2">
            <h3 className="n-h3">Delitos de odio registrados</h3>
            {hate ? (
              <div className="grid gap-x-14 lg:grid-cols-2">
                <div>
                  <p className="n-finding mt-3">
                    {`En ${ca} constan ${n(hate.total)} hechos conocidos en ${hate.year}, ${rate(hate.ratePer100k, bcp47)} por cada 100.000 habitantes, frente a ${rate(hate.nationalRatePer100k, bcp47)} en el conjunto de España.`}
                  </p>
                  <p className="n-body mt-3 text-[0.95rem]">
                    {`Por orientación sexual e identidad de género: ${n(hate.sexualOrientationGenderIdentity)}. Son hechos conocidos por las fuerzas de seguridad, no incidencia: una tasa más alta puede reflejar más denuncia y no más delito.`}
                  </p>
                </div>
                <div className="lg:pt-4">
                  <Compare
                    rows={[
                      {
                        label: ca,
                        value: hate.ratePer100k,
                        text: `${rate(hate.ratePer100k, bcp47)} por 100.000`,
                        strong: true,
                      },
                      {
                        label: "España",
                        value: hate.nationalRatePer100k,
                        text: `${rate(hate.nationalRatePer100k, bcp47)} por 100.000`,
                      },
                    ]}
                    max={Math.max(hate.ratePer100k, hate.nationalRatePer100k)}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-3 text-[var(--n-ink-2)]">
                El informe no localiza hechos conocidos en este territorio.
              </p>
            )}
            {hate && (
              <p className="n-source">
                Fuente:{" "}
                <a href={hate.source.url}>
                  {hate.source.body.replace(/\s*·\s*/g, ", ")},{" "}
                  {hate.source.report}
                </a>
                .
              </p>
            )}
          </article>
        </div>

        <p className="n-body mt-14 text-[0.95rem]">
          {`Nada de esta página une una cifra con otra. Lo que cobran o declaran sus diputados, el dinero de sus partidos y las cifras de ${ca} son hechos puestos uno al lado del otro, no una explicación.`}
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

/** Two figures on one scale: the place in ink, the national reference lighter. */
function Compare({
  rows,
  max,
}: {
  rows: { label: string; value: number; text: string; strong?: boolean }[];
  max: number;
}) {
  return (
    <ul className="mt-5 grid gap-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 text-[0.95rem]">
            <span className={r.strong ? "font-bold" : "text-[var(--n-ink-2)]"}>
              {r.label}
            </span>
            <span className="n-num">{r.text}</span>
          </div>
          <div
            aria-hidden
            className="mt-1 h-3 w-full rounded-[2px] bg-[var(--n-rule)]/40"
          >
            <span
              className="block h-3 rounded-[2px]"
              style={{
                width: `${Math.min(100, (r.value / max) * 100)}%`,
                background: r.strong
                  ? "var(--n-ink-2)"
                  : "var(--n-rule-strong)",
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * The comunidad's wages as a line with three stations: the 10th percentile,
 * the median and the 90th, placed on one euro scale, with the national median
 * marked above it as a hollow station so the local one is never read alone.
 */
function WageScale({
  wages,
  fmt,
}: {
  wages: { median: number; p10: number; p90: number; nationalMedian: number };
  fmt: (v: number) => string;
}) {
  const top = Math.max(wages.p90, wages.nationalMedian) * 1.08;
  const x = (v: number) => `${(v / top) * 100}%`;
  const stations = [
    {
      v: wages.p10,
      label: "El 10 % peor pagado, por debajo de",
      align: "start",
    },
    { v: wages.median, label: "Mediana", align: "middle" },
    {
      v: wages.p90,
      label: "El 10 % mejor pagado, por encima de",
      align: "end",
    },
  ] as const;
  return (
    <div className="mt-6">
      <div className="relative h-[4.5rem]">
        {/* National median, above the line. */}
        <div
          className="absolute top-0 -translate-x-1/2 text-center"
          style={{ left: x(wages.nationalMedian) }}
        >
          <p className="n-meta whitespace-nowrap">
            España, mediana {fmt(wages.nationalMedian)}
          </p>
          <span
            aria-hidden
            className="mx-auto mt-1 block h-[15px] w-[15px] rounded-full border-[3px] bg-[var(--n-bg)]"
            style={{ borderColor: "var(--n-ink-3)" }}
          />
        </div>
        {/* The line from p10 to p90, on record. */}
        <span
          aria-hidden
          className="absolute top-[3.15rem] h-[5px] rounded-full"
          style={{
            left: x(wages.p10),
            width: `calc(${x(wages.p90)} - ${x(wages.p10)})`,
            background: "var(--n-ink-2)",
          }}
        />
        {stations.map((s) => (
          <span
            key={s.label}
            aria-hidden
            className="absolute top-[2.65rem] h-[23px] w-[23px] -translate-x-1/2 rounded-full border-[3px]"
            style={{
              left: x(s.v),
              borderColor: "var(--n-ink-2)",
              background:
                s.label === "Mediana" ? "var(--n-ink-2)" : "var(--n-card)",
            }}
          />
        ))}
      </div>
      <ul className="mt-3 grid gap-x-4 gap-y-2 text-[0.95rem] sm:grid-cols-3">
        {stations.map((s) => (
          <li
            key={s.label}
            className={
              s.align === "middle"
                ? "sm:text-center"
                : s.align === "end"
                  ? "sm:text-right"
                  : undefined
            }
          >
            <span className="n-meta block">{s.label}</span>
            <span className="n-num font-bold">{fmt(s.v)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
