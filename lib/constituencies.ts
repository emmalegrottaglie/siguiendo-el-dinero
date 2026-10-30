import { getDeputies, type Deputy } from "./deputies";
import { getProvinces, type Province } from "./provinces";
import { shortName } from "./governments";

/**
 * Congreso's electoral constituencies, joined to INE's provinces.
 *
 * The two sources name most provinces the same way. Five they do not: Congreso
 * inverts the article ("Coruña (A)", "Palmas (Las)", "Rioja (La)",
 * "Balears (Illes)") and abbreviates one name ("S/C Tenerife"). Those five are
 * written out here rather than matched by similarity, for the same reason as
 * lib/territories.ts: a near match that is wrong would put one province's
 * deputies on another province's page. Every other constituency must equal a
 * province's INE name exactly, or it is reported as unresolved and placed
 * nowhere.
 */
const ALIASES: Record<string, string> = {
  "Balears (Illes)": "illes-balears",
  "S/C Tenerife": "santa-cruz-de-tenerife",
  "Palmas (Las)": "las-palmas",
  "Rioja (La)": "la-rioja",
  "Coruña (A)": "a-coruna",
};

export interface ConstituencyJoin {
  /** Deputies elected in each province, keyed by province slug. */
  byProvince: Map<string, Deputy[]>;
  /** Constituency labels that matched no province. Expected to be empty. */
  unresolved: string[];
}

let cache: ConstituencyJoin | null = null;

export async function deputiesByProvince(): Promise<ConstituencyJoin> {
  if (cache) return cache;
  const [{ deputies }, { provinces }] = await Promise.all([getDeputies(), getProvinces()]);
  const bySlug = new Map(provinces.map((p) => [p.slug, p]));
  const byName = new Map(provinces.map((p) => [p.name, p]));

  const byProvince = new Map<string, Deputy[]>(provinces.map((p) => [p.slug, []]));
  const unresolved = new Set<string>();
  for (const d of deputies) {
    const alias = ALIASES[d.constituency];
    const province: Province | undefined = alias ? bySlug.get(alias) : byName.get(d.constituency);
    if (!province) {
      unresolved.add(d.constituency);
      continue;
    }
    byProvince.get(province.slug)!.push(d);
  }
  cache = { byProvince, unresolved: [...unresolved] };
  return cache;
}

/**
 * Where one deputy's asset declaration stands on this site: the three states
 * the front page's dot grid draws (transcribed and declaring securities,
 * transcribed without them, filed but not transcribed yet), plus a fourth for a
 * deputy whose ficha links no filing at all.
 */
export type DeclarationState = "securities" | "transcribed" | "pending" | "none";

export function declarationState(
  deputy: Deputy,
  declarations: { cod: number; otherAssets: { kind: string }[] }[],
): DeclarationState {
  const d = declarations.find((x) => x.cod === deputy.cod);
  if (d) return d.otherAssets.some((a) => a.kind === "securities") ? "securities" : "transcribed";
  return deputy.filings.some((f) => f.kind === "bienes") ? "pending" : "none";
}

/**
 * A comunidad's name for a heading or a sentence: the map's short form, except
 * where that form is an abbreviation ("C. Valenciana"), which reads as a label.
 */
export function caName(id: string, fallback: string): string {
  return id === "10" ? "Comunitat Valenciana" : shortName(id, fallback);
}
