import type { CSSProperties } from "react";
import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { getProvinces } from "@/lib/provinces";
import { getRegions } from "@/lib/regions";
import { TERRITORIES } from "@/lib/territories";
import { getDeclarations } from "@/lib/declarations";
import { getSalaries, SALARIES_SOURCE_URL } from "@/lib/salaries";
import { caName, deputiesByProvince, declarationState, type DeclarationState } from "@/lib/constituencies";
import { euroExact, formatDate, integer } from "@/lib/format";
import RegionMap from "@/components/nuevo/RegionMap";

export const revalidate = 3600;

/**
 * The redesign prototype's index of places.
 *
 * A reader arrives with a place, not a dataset: so the page lists the 52
 * provinces, grouped by the comunidad each sits in, and puts on each one the
 * deputies it elects, one dot each, in the state of their asset declaration.
 * The map is for finding a comunidad, and encodes nothing.
 *
 * Under the list, the one comparison the record supports between comunidades:
 * how many officeholders the register places in each, and what the published
 * figures are. It is a count of the register's rows, and the page says so,
 * because the register does not cover every comunidad's posts alike.
 */

const LOOK: Record<DeclarationState, { cls?: string; style: CSSProperties; label: string; one?: string }> = {
  securities: {
    cls: "n-companies",
    style: { background: "var(--route)", border: "2px solid var(--route)" },
    label: "declaran acciones, bonos u otros valores",
    one: "declara acciones, bonos u otros valores",
  },
  transcribed: {
    style: { background: "var(--n-ink-2)", border: "2px solid var(--n-ink-2)" },
    label: "con la declaración transcrita, sin valores",
  },
  pending: {
    style: { background: "transparent", border: "2px solid var(--n-ink-3)" },
    label: "con la declaración sin transcribir todavía",
  },
  none: {
    style: { background: "transparent", border: "2px dashed var(--n-ink-3)" },
    label: "sin declaración enlazada en su ficha",
  },
};
const ORDER: DeclarationState[] = ["securities", "transcribed", "pending", "none"];

function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export default async function PrototypePlaces({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const { locale, bcp47 } = getDict(localeParam);
  const [{ provinces }, regions, decl, salaries, join] = await Promise.all([
    getProvinces(),
    getRegions(),
    getDeclarations(),
    getSalaries(),
    deputiesByProvince(),
  ]);
  const L = (path: string) => `/${locale}${path}`;
  const n = (x: number) => integer(x, bcp47);
  const listFmt = new Intl.ListFormat(bcp47, { type: "conjunction" });

  // Each province with its deputies' declaration states, in the dot order.
  const rows = provinces.map((p) => {
    const deputies = join.byProvince.get(p.slug) ?? [];
    const states = deputies
      .map((d) => declarationState(d, decl.declarations))
      .sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
    return { province: p, deputies, states };
  });
  const seats = rows.reduce((s, r) => s + r.deputies.length, 0);
  const most = [...rows].sort((a, b) => b.deputies.length - a.deputies.length)[0];
  const fewest = Math.min(...rows.map((r) => r.deputies.length));
  const fewestNames = rows.filter((r) => r.deputies.length === fewest).map((r) => r.province.name);

  // Provinces whose filed declarations are all read, and those with none read yet.
  const filedIn = (r: (typeof rows)[number]) => r.states.filter((s) => s !== "none").length;
  const readIn = (r: (typeof rows)[number]) =>
    r.states.filter((s) => s === "securities" || s === "transcribed").length;
  const allRead = rows.filter((r) => filedIn(r) > 0 && readIn(r) === filedIn(r)).length;
  const noneRead = rows.filter((r) => filedIn(r) > 0 && readIn(r) === 0).length;
  const counts = ORDER.map((k) => ({ k, count: rows.reduce((s, r) => s + r.states.filter((x) => x === k).length, 0) }));

  // Comunidades, alphabetically, each with its provinces.
  const byTerritory = TERRITORIES.map((t) => ({
    territory: t,
    name: caName(t.id, t.mapName),
    rows: rows.filter((r) => r.province.territoryId === t.id),
  }))
    .filter((g) => g.rows.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
  const single = new Map(byTerritory.filter((g) => g.rows.length === 1).map((g) => [g.territory.id, g.rows[0].province.slug]));
  const territorySeats = new Map(byTerritory.map((g) => [g.territory.id, g.rows.reduce((s, r) => s + r.deputies.length, 0)]));

  // The register, by comunidad.
  const register = TERRITORIES.map((t) => {
    const here = salaries.people.filter((p) => p.region === t.registerName);
    const paid = here.filter((p) => p.gross > 0).map((p) => p.gross);
    return { territory: t, name: caName(t.id, t.mapName), count: here.length, paid: paid.length, median: median(paid) };
  }).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"));
  const unlocated = salaries.people.filter((p) => !p.region).length;
  const maxCount = Math.max(unlocated, ...register.map((r) => r.count));
  const top = register[0];

  const plural = (x: number, one: string, many: string) => `${n(x)} ${x === 1 ? one : many}`;

  return (
    <main>
      {/* ---------- The places, and the map to find one ---------- */}
      <section className="n-shell grid items-center gap-x-12 gap-y-8 pb-14 pt-6 lg:grid-cols-[1fr_minmax(0,34rem)]">
        <div>
          <h1 className="n-display">Territorios</h1>
          <p className="n-body mt-6" style={{ fontSize: "1.15rem" }}>
            Cada provincia, con quién la representa en el Congreso, lo que cobra según el registro
            público y lo que declara poseer, y las cifras de la comunidad autónoma en la que está.
          </p>
          <p className="n-finding mt-6">
            {`Las ${n(rows.length)} circunscripciones eligen a los ${n(seats)} diputados del Congreso: ${most.province.name} elige ${n(most.deputies.length)}; ${listFmt.format(fewestNames)}, ${n(fewest)}${fewestNames.length > 1 ? " cada una" : ""}.`}
          </p>
          <p className="n-source">Fuente: Congreso de los Diputados, datos abiertos de la legislatura en curso.</p>
        </div>
        <figure className="m-0">
          <RegionMap
            regions={regions}
            title="Mapa de las comunidades autónomas"
            desc="Cada comunidad lleva a sus provincias en la lista de abajo. El mapa no representa ninguna cifra."
            hrefFor={(id) => (single.has(id) ? L(`/nuevo/territorio/${single.get(id)}`) : `#ca-${id}`)}
            labelFor={(id) => {
              const g = byTerritory.find((x) => x.territory.id === id);
              if (!g) return id;
              const s = territorySeats.get(id) ?? 0;
              return `${g.name}: ${plural(s, "diputado", "diputados")}`;
            }}
          />
          <figcaption className="n-meta mt-2">
            Elige una comunidad para ir a sus provincias. Canarias, en el recuadro. Fuente del mapa:{" "}
            {regions.source.body} ({regions.source.licence}).
          </figcaption>
        </figure>
      </section>

      {/* ---------- Provinces by comunidad, one dot per deputy ---------- */}
      <section className="n-shell n-section" aria-labelledby="provincias">
        <h2 id="provincias" className="n-h2">
          Provincias por comunidad
        </h2>
        <p className="n-finding mt-4">
          {`En ${plural(allRead, "provincia", "provincias")} ya están transcritas las declaraciones de bienes de todos sus diputados, ${noneRead === 0 ? "y todas tienen ya al menos una" : `y en ${n(noneRead)} todavía no hay ninguna`}.`}
        </p>
        <p className="n-meta mt-3 max-w-[48em]">
          Un punto por diputado elegido en la provincia, según el estado de su declaración de bienes
          en esta web. Las declaraciones se leen del escaneo oficial y se comprueban antes de publicarse.
        </p>
        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem]">
          {counts
            .filter((c) => c.count > 0)
            .map((c) => (
              <li key={c.k} className={`${LOOK[c.k].cls ?? ""} inline-flex items-center gap-2`}>
                <span aria-hidden className="inline-block h-[13px] w-[13px] rounded-full" style={LOOK[c.k].style} />
                <span>
                  <span className="n-num font-bold">{n(c.count)}</span> {c.count === 1 ? (LOOK[c.k].one ?? LOOK[c.k].label) : LOOK[c.k].label}
                </span>
              </li>
            ))}
        </ul>

        <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {byTerritory.map((g) => {
            const s = territorySeats.get(g.territory.id) ?? 0;
            return (
              <section key={g.territory.id} id={`ca-${g.territory.id}`} aria-labelledby={`ca-${g.territory.id}-t`} className="scroll-mt-6 border-t-[3px] border-[var(--n-ink)] pt-3">
                <h3 id={`ca-${g.territory.id}-t`} className="n-h3">
                  {g.name}
                </h3>
                {g.rows.length > 1 && (
                  <p className="n-meta">{`${plural(s, "diputado", "diputados")} en ${n(g.rows.length)} provincias`}</p>
                )}
                <ul className="mt-2">
                  {g.rows.map((r) => (
                    <li key={r.province.slug} className="border-t border-[var(--n-rule)] py-2.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <Link href={L(`/nuevo/territorio/${r.province.slug}`)} className="font-bold">
                          {r.province.name}
                        </Link>
                        <span className="n-meta n-num whitespace-nowrap">{plural(r.deputies.length, "diputado", "diputados")}</span>
                      </div>
                      <div aria-hidden className="mt-1.5 flex flex-wrap gap-[4px]">
                        {r.states.map((st, i) => (
                          <span
                            key={i}
                            className={`${LOOK[st].cls ?? ""} inline-block h-[11px] w-[11px] rounded-full`}
                            style={LOOK[st].style}
                          />
                        ))}
                      </div>
                      <p className="sr-only">
                        {ORDER.map((k) => ({ k, c: r.states.filter((x) => x === k).length }))
                          .filter((x) => x.c > 0)
                          .map((x) => `${n(x.c)} ${x.c === 1 ? (LOOK[x.k].one ?? LOOK[x.k].label) : LOOK[x.k].label}`)
                          .join("; ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
        {join.unresolved.length > 0 && (
          <p className="n-meta mt-6">
            {`Sin provincia asignada, porque el nombre de la circunscripción no coincide con ninguna: ${listFmt.format(join.unresolved)}.`}
          </p>
        )}
        <p className="n-source">
          Fuente: Congreso de los Diputados (datos abiertos y ficha de cada diputado); declaraciones
          de bienes transcritas por esta web. <Link href={L("/politicos/declaraciones")}>Ver todas las declaraciones</Link>
        </p>
      </section>

      {/* ---------- The register, by comunidad ---------- */}
      <section className="n-shell n-section" aria-labelledby="registro">
        <h2 id="registro" className="n-h2">
          Cargos públicos en el registro, por comunidad
        </h2>
        <p className="n-finding mt-4">
          {`El Registro de Altos Cargos sitúa más cargos en ${top.name} (${n(top.count)}) que en ninguna otra comunidad, y no indica comunidad en ${n(unlocated)} de sus ${n(salaries.people.length)} filas.`}
        </p>
        <p className="n-body mt-3">
          Es un recuento de las filas del registro, no del número de cargos que tiene cada
          comunidad: el registro no recoge igual los cargos de todas. Las filas sin comunidad no se
          reparten entre ellas.
        </p>
        <div className="relative mt-8 overflow-x-auto">
          <table className="n-table min-w-[36rem]">
            <caption className="sr-only">Cargos del Registro de Altos Cargos por comunidad autónoma</caption>
            <thead>
              <tr>
                <th scope="col">Comunidad</th>
                <th scope="col" className="w-[40%]">
                  Cargos en el registro
                </th>
                <th scope="col" className="n-r">
                  Con sueldo publicado
                </th>
                <th scope="col" className="n-r">
                  Mediana del sueldo publicado
                </th>
              </tr>
            </thead>
            <tbody>
              {register.map((r) => (
                <tr key={r.territory.id}>
                  <th scope="row" className="font-normal">
                    {single.has(r.territory.id) ? (
                      <Link href={L(`/nuevo/territorio/${single.get(r.territory.id)}`)}>{r.name}</Link>
                    ) : (
                      <a href={`#ca-${r.territory.id}`}>{r.name}</a>
                    )}
                  </th>
                  <td>
                    <div className="flex items-center gap-3">
                      <div aria-hidden className="flex h-3 flex-1" >
                        <span
                          className="flex h-3 overflow-hidden rounded-[2px]"
                          style={{ width: `${(r.count / maxCount) * 100}%`, minWidth: r.count ? 2 : 0, outline: "1px solid var(--n-ink-3)", outlineOffset: -1 }}
                        >
                          <span style={{ flexGrow: r.paid, flexBasis: 0, background: "var(--n-ink-2)" }} />
                          <span style={{ flexGrow: r.count - r.paid, flexBasis: 0 }} />
                        </span>
                      </div>
                      <span className="n-num w-14 text-right">{n(r.count)}</span>
                    </div>
                  </td>
                  <td className="n-r">{n(r.paid)}</td>
                  <td className="n-r">
                    {r.median != null ? euroExact(r.median, bcp47) : <span className="text-[var(--n-ink-3)]">— no publicado</span>}
                  </td>
                </tr>
              ))}
              <tr>
                <th scope="row" className="font-normal text-[var(--n-ink-2)]">
                  Sin comunidad indicada
                </th>
                <td>
                  <div className="flex items-center gap-3">
                    <div aria-hidden className="flex h-3 flex-1">
                      <span
                        className="n-hatch h-3 rounded-[2px]"
                        style={{ width: `${(unlocated / maxCount) * 100}%`, outline: "1px solid var(--n-ink-3)", outlineOffset: -1 }}
                      />
                    </div>
                    <span className="n-num w-14 text-right">{n(unlocated)}</span>
                  </div>
                </td>
                <td className="n-r text-[var(--n-ink-3)]">—</td>
                <td className="n-r text-[var(--n-ink-3)]">—</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="n-meta mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="inline-block h-3 w-5 rounded-[2px]" style={{ background: "var(--n-ink-2)" }} />
            Con sueldo publicado
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="inline-block h-3 w-5 rounded-[2px]" style={{ outline: "1px solid var(--n-ink-3)", outlineOffset: -1 }} />
            Sin sueldo publicado
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="n-hatch inline-block h-3 w-5 rounded-[2px]" style={{ outline: "1px solid var(--n-ink-3)", outlineOffset: -1 }} />
            Sin comunidad en el registro
          </span>
        </p>
        <p className="n-source">
          Fuente: <a href={SALARIES_SOURCE_URL}>{salaries.source.name}</a>
          {salaries.source.updated ? `, actualizado el ${formatDate(salaries.source.updated, bcp47)}` : ""}. Sueldo
          bruto anual. Los diputados del Congreso constan en el registro sin comunidad, y están en la
          página de cada provincia.
        </p>
      </section>
    </main>
  );
}
