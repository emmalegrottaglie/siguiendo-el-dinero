import type { Locale } from "@/lib/locales";

/**
 * Strings of the prototype's data page. Each table's title and description come
 * from `lib/i18n.ts` (`t.datos.tables`), the same words the current `/datos`
 * uses, so a table described there is described the same way here. The route
 * names come from the methodology page's copy, which owns them.
 */
const es = {
  metaTitle: "Los datos",
  finding: (tables: string, routes: string) =>
    `${tables} tablas, cada una en un CSV, agrupadas por las ${routes} rutas del mapa. Son las mismas cifras que el resto de la web, no una extracción nueva.`,
  format:
    "Los archivos van en UTF-8 con marca de orden de bytes, para que Excel lea bien los acentos, y separados por comas según el RFC 4180. La misma tabla se descarga igual desde cualquier idioma.",
  perRowSourced:
    "Cada fila lleva su propia fuente y su fecha, en las columnas fuente_*: esta tabla no comparte una única fuente.",
  rows: (count: string) => `${count} filas`,
  columns: (count: string) => `${count} columnas`,
  source: "Fuente",
  sources: "Fuentes",
  download: (file: string) => `Descargar CSV (${file})`,
  method: "Cómo se obtuvo",
  others: "Otras tablas",
  checked: (date: string) => `comprobado el ${date}`,
  current: "vigente",
  tableLink: "Enlace permanente a esta tabla",
};

type Copy = typeof es;

const en: Copy = {
  metaTitle: "The data",
  finding: (tables, routes) =>
    `${tables} tables, each as a CSV, grouped by the map's ${routes} routes. They are the same figures as the rest of the site, not a new extraction.`,
  format:
    "Files are UTF-8 with a byte-order mark, so Excel reads accents correctly, and comma-separated following RFC 4180. A table downloads the same from any language.",
  perRowSourced:
    "Every row carries its own source and date, in the fuente_* columns: this table has no single shared source.",
  rows: (count) => `${count} rows`,
  columns: (count) => `${count} columns`,
  source: "Source",
  sources: "Sources",
  download: (file) => `Download CSV (${file})`,
  method: "How it was obtained",
  others: "Other tables",
  checked: (date) => `checked ${date}`,
  current: "current",
  tableLink: "Permanent link to this table",
};

const ca: Copy = {
  metaTitle: "Les dades",
  finding: (tables, routes) =>
    `${tables} taules, cadascuna en un CSV, agrupades per les ${routes} rutes del mapa. Són les mateixes xifres que la resta del web, no una extracció nova.`,
  format:
    "Els fitxers van en UTF-8 amb marca d'ordre de bytes, perquè Excel llegeixi bé els accents, i separats per comes segons l'RFC 4180. La mateixa taula es descarrega igual des de qualsevol idioma.",
  perRowSourced:
    "Cada fila porta la seva pròpia font i data, a les columnes fuente_*: aquesta taula no comparteix una única font.",
  rows: (count) => `${count} files`,
  columns: (count) => `${count} columnes`,
  source: "Font",
  sources: "Fonts",
  download: (file) => `Descarregar CSV (${file})`,
  method: "Com s'ha obtingut",
  others: "Altres taules",
  checked: (date) => `comprovat el ${date}`,
  current: "vigent",
  tableLink: "Enllaç permanent a aquesta taula",
};

export const COPY: Record<Locale, Copy> = { es, en, ca };
