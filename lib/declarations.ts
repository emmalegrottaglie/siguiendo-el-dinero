import { promises as fs } from "node:fs";
import path from "node:path";
import { foldTokens, nameKey } from "./name-key.mjs";
import type { Deputy } from "./deputies";

// ---------------------------------------------------------------------------
// Declaración de Bienes y Rentas: transcribed from Congreso's scans.
// Field names follow the form's own sections; text is kept as the deputy typed it.
// ---------------------------------------------------------------------------

/** The four groups of the form's "Rentas percibidas" block. */
export type IncomeGroup = "salary" | "dividends" | "interest" | "other";

export interface IncomeLine {
  group: IncomeGroup;
  /** Null where the deputy filled in the amount but left the concept blank. */
  concept: string | null;
  amount: number | null;
}

/** Urban property, rural property, or property held through an unlisted company. */
export type PropertyKind = "urban" | "rustic" | "company";

export interface Property {
  kind: PropertyKind;
  /** "Clase y características", verbatim. The form asks for no value. */
  description: string;
  /** "Situación": the province, or the country for property abroad. */
  location: string | null;
  acquired: string | null;
  /** "Derecho sobre el bien y título de adquisición", verbatim. */
  title: string | null;
}

export interface ValuedItem {
  /** Null where the deputy filled in the amount but left the description blank. */
  description: string | null;
  amount: number | null;
}

/**
 * "securities": the form's block for public debt, bonds and shares in any company.
 * "other": its closing block of goods and rights not declared elsewhere (funds, pension plans…).
 */
export interface OtherAsset extends ValuedItem {
  kind: "securities" | "other";
}

export interface Vehicle {
  acquired: string | null;
  description: string;
}

export interface Loan {
  /** "Descripción y acreedor", verbatim. */
  description: string;
  granted: string | null;
  amount: number | null;
  pending: number | null;
}

export interface Verification {
  /**
   * "rtve": all four section totals equal the figures RTVE published from its own, independent
   * transcription of the same filing. "second-reading": a second independent transcription of
   * the scan produced the same totals.
   */
  method: "rtve" | "second-reading";
  checkedAt: string;
}

export interface AssetDeclaration {
  /** Congreso's spelling of the deputy's name. */
  deputy: string;
  /** The ficha's codParlamentario: the join key. */
  cod: number;
  /** Date the filing was registered, from its filename. */
  filed: string;
  url: string;
  /** Why it was filed: on taking the seat, on leaving it, or another cause. */
  reason: "toma" | "cese" | "otra" | null;
  income: IncomeLine[];
  /** "Cantidad pagada por IRPF": the income-tax liability of the year before filing. */
  irpf: number | null;
  realEstate: Property[];
  /** Account balances; the form lets the deputy pick the reference date (footnote 11). */
  deposits: ValuedItem[];
  otherAssets: OtherAsset[];
  /** "Sociedades participadas en más de un 5%…", verbatim. */
  holdingsOver5pct: string | null;
  vehicles: Vehicle[];
  loans: Loan[];
  otherDebts: string | null;
  observations: string | null;
  /**
   * Amounts written other than in the form's Spanish format (a comma for thousands, an apostrophe
   * for decimals), as they appear on the scan. `path` names the amount, e.g. "loans[1].pending".
   */
  notes: { path: string; written: string }[];
  verified: Verification;
}

export interface DeclarationsData {
  generatedAt: string;
  source: { name: string; url: string };
  /** The independent transcription the totals were checked against, credited on the page. */
  check: { name: string; url: string };
  count: number;
  declarations: AssetDeclaration[];
  /** Filings that could not be transcribed with a passing check: the page links the PDF only. */
  unresolved: { deputy: string; cod: number; reason: string }[];
}

const DECLARATIONS = path.join(process.cwd(), "data", "declarations.json");
let declarationsCache: DeclarationsData | null = null;

/** Written by scripts/build-declarations.mjs. */
export async function getDeclarations(): Promise<DeclarationsData> {
  if (declarationsCache) return declarationsCache;
  declarationsCache = JSON.parse(await fs.readFile(DECLARATIONS, "utf-8")) as DeclarationsData;
  return declarationsCache;
}

export async function declarationFor(deputy: Deputy): Promise<AssetDeclaration | null> {
  const { declarations } = await getDeclarations();
  return declarations.find((d) => d.cod === deputy.cod) ?? null;
}

// ---------------------------------------------------------------------------
// Declaración de Intereses Económicos: Congreso's open data, row for row.
// ---------------------------------------------------------------------------

export interface InterestRow {
  /** "Apellidos,Nombre" as the open-data file spells it. */
  name: string;
  registered: string | null;
  /** "Declaración inicial" or "Modificación de la declaración de intereses económicos". */
  declaration: string | null;
  /** ACTIVIDAD, FUNDACIONES, DONACION or OBSERVACIONES. */
  type: string | null;
  period: string | null;
  employer: string | null;
  /** Free text as declared: the form imposes no list, so it is never normalised here. */
  sector: string | null;
  description: string | null;
  recipient: string | null;
  benefactor: string | null;
  observations: string | null;
}

export interface InterestsData {
  generatedAt: string;
  source: { name: string; url: string; file: string };
  count: number;
  rows: InterestRow[];
}

const INTERESTS = path.join(process.cwd(), "data", "interests.json");
let interestsCache: { data: InterestsData; byKey: Map<string, InterestRow[]> } | null = null;

async function interestsIndex() {
  if (interestsCache) return interestsCache;
  const data = JSON.parse(await fs.readFile(INTERESTS, "utf-8")) as InterestsData;
  const byKey = new Map<string, InterestRow[]>();
  for (const row of data.rows) {
    const k = nameKey(row.name);
    byKey.set(k, [...(byKey.get(k) ?? []), row]);
  }
  interestsCache = { data, byKey };
  return interestsCache;
}

export async function getInterests(): Promise<InterestsData> {
  return (await interestsIndex()).data;
}

/**
 * The deputy's interest rows. Both records are Congreso's own, so where the open-data file
 * spells the name differently (a second given name dropped or added), a token-subset match is
 * accepted — but only when exactly one declarant qualifies.
 */
export async function interestsFor(deputy: Deputy): Promise<InterestRow[]> {
  const { byKey } = await interestsIndex();
  const exact = byKey.get(nameKey(deputy.name)) ?? byKey.get(nameKey(deputy.fullName));
  if (exact) return exact;
  const own = new Set(foldTokens(deputy.fullName));
  const hits = [...byKey.keys()].filter((k) => {
    const t = k.split(" ");
    return t.length >= 3 && (t.every((x) => own.has(x)) || foldTokens(deputy.name).every((x) => t.includes(x)));
  });
  return hits.length === 1 ? byKey.get(hits[0])! : [];
}
