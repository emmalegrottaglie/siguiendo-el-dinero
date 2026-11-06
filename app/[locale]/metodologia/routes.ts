import type { ItemId, RouteId } from "./copy";

/**
 * The methodology page's skeleton, shared with the data page.
 *
 * One entry per route of the front page's map, in the map's order, each with
 * the kinds of record it holds and the downloadable tables (`lib/datasets.ts`
 * ids) each kind is published as. The data page groups its tables by these
 * routes and links each table back to the item that says how it was obtained,
 * so a table and its method are never more than one link apart.
 */
export interface RouteDef {
  id: RouteId;
  /** The route's colour class from site.css. */
  cls: string;
  items: { id: ItemId; tables: string[] }[];
}

export const ROUTES: RouteDef[] = [
  {
    id: "estado",
    cls: "n-state",
    items: [
      { id: "subsidios", tables: ["subsidios"] },
      { id: "ingresos", tables: ["ingresos_partidos"] },
    ],
  },
  {
    id: "donantes",
    cls: "n-donors",
    items: [{ id: "donaciones", tables: ["donaciones"] }],
  },
  {
    id: "fundaciones",
    cls: "n-foundations",
    items: [
      { id: "fundaciones", tables: ["fundaciones"] },
      { id: "patronatos", tables: ["fundaciones_cargos", "fundaciones_vinculos"] },
      { id: "cruce", tables: [] },
    ],
  },
  {
    id: "campana",
    cls: "n-neutral",
    items: [{ id: "gasto", tables: ["gasto_electoral"] }],
  },
  {
    id: "votos",
    cls: "n-topic",
    items: [{ id: "votaciones", tables: ["votaciones"] }],
  },
  {
    id: "declaraciones",
    cls: "n-companies",
    items: [
      { id: "bienes", tables: ["declaraciones_bienes"] },
      { id: "intereses", tables: ["intereses_economicos"] },
    ],
  },
  {
    id: "sueldos",
    cls: "n-neutral",
    items: [
      { id: "salarios", tables: ["salarios"] },
      { id: "personas", tables: [] },
    ],
  },
  {
    id: "contexto",
    cls: "n-neutral",
    items: [
      { id: "odio", tables: ["delitos_odio"] },
      { id: "ine", tables: ["salarios_ine", "pobreza_ine"] },
      { id: "territorio", tables: ["gobiernos", "provincias"] },
      { id: "noticias", tables: [] },
    ],
  },
];

/** The method item a table belongs to, for the data page's "how it was obtained" link. */
export function itemForTable(table: string): ItemId | null {
  for (const r of ROUTES) for (const i of r.items) if (i.tables.includes(table)) return i.id;
  return null;
}
