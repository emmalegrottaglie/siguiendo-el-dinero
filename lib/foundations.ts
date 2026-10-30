import { promises as fs } from "node:fs";
import path from "node:path";
import { PARTIES } from "./parties";
import { foldText, foldTokens } from "./name-key.mjs";

// The party-linked foundation channel: who pays into it, and who audits it.
//
// Extracted by scripts/extract-foundations.py from Tribunal de Cuentas report
// nº 1.642 (approved 25/09/2025), which audits one dossier per entity per
// exercise. The extractor recomputes every table's arithmetic and reconciles
// the dossiers against the report's own annex totals, aborting on a mismatch,
// so these figures agree with the report by construction.
//
// Why this channel exists at all. Political parties may take no corporate
// money: LO 8/2007 art. 5 bars donations from legal entities, bars anonymous
// donations, caps an individual at €50,000 a year and obliges a party to refuse
// a donor holding a live public contract. Their foundations are governed
// instead by disposición adicional séptima, under which legal entities *may*
// donate — over €120,000 by public deed, every corporate donation notified to
// the Tribunal within three months and the donor's identity published.
//
// What the audited figures actually show is not a corporate channel, though.
// Roughly nine tenths of the money entering these entities comes from the
// parties themselves, and corporate donations are under five per cent of it.
// The page says so rather than implying otherwise.

export interface Contribution {
  /** How many contributions of this kind. Null where the report omits a count. */
  count: number | null;
  amount: number;
}

export interface SubsidyItem {
  /** The granting body, verbatim. */
  body: string;
  amount: number;
}

/** A collaboration agreement, which is how corporate money mostly arrives. */
export interface Deal {
  /** Named counterparties, as the report names them. */
  counterparties: string[];
  amount: number | null;
  /** What the counterparty got in return, where the report states it. */
  consideration: string | null;
  /**
   * Whether the Tribunal found the three duties of DA 7ª apartado Cinco met.
   * Null where its wording does not settle the question — the sentence itself
   * is published in that case, and in every other.
   */
  compliant: boolean | null;
  rule: string | null;
  text: string;
}

export interface Finding {
  rule: string | null;
  text: string;
}

export interface Dossier {
  name: string;
  /** The report's own section number, kept so a figure can be traced back. */
  section: number;
  exercise: number;
  /** Party as the dossier states it. */
  partyLinked: string | null;
  /** Protectorado for a foundation, administración competente for an association. */
  supervisor: string | null;
  yearConstituted: number | null;
  registryDate: string | null;
  /**
   * Registration in the Registro de Partidos Políticos, three-valued: true with
   * a date, false where the report states "NO", null where the field is absent.
   * Disposición adicional cuarta of LO 6/2002 requires it, and most of these
   * entities are not registered.
   */
  registered: boolean | null;
  contributions: {
    individuals: Contribution;
    companies: Contribution;
    party: Contribution;
    total: { amount: number };
  };
  subsidies: { items: SubsidyItem[]; total: number };
  accounts: {
    netEquity: number | null;
    totalIncome: number | null;
    totalExpense: number | null;
    result: number | null;
  };
  deals: Deal[];
  findings: Finding[];
  /** Present where the report's own total disagrees with its itemised lines. */
  sourceDiscrepancies?: {
    field: string;
    stated: number;
    itemised: number;
    difference: number;
  }[];
}

export interface FoundationsFile {
  source: { body: string; report: string; approved: string; url: string };
  /** What the report says about the statutory register, as of its own cut-off. */
  register: {
    asOf: string;
    foundationsRegistered: number;
    entitiesRegistered: number;
    rule: string;
  };
  years: Record<
    string,
    {
      entities: number;
      individuals: number;
      companies: number;
      party: number;
      contributions: number;
      subsidies: number;
    }
  >;
  dossiers: Dossier[];
}

const FILE = path.join(process.cwd(), "data", "foundations.json");
let cache: FoundationsFile | null = null;

export async function getFoundations(): Promise<FoundationsFile> {
  if (cache) return cache;
  cache = JSON.parse(await fs.readFile(FILE, "utf-8")) as FoundationsFile;
  return cache;
}

// The legal basis, which is what makes this channel worth publishing at all.
export const FOUNDATIONS_LAW_URL = "https://www.boe.es/buscar/act.php?id=BOE-A-2007-13022";

/** Years present in the data, ascending. */
export function foundationYears(data: FoundationsFile): number[] {
  return Object.keys(data.years)
    .map(Number)
    .sort((a, b) => a - b);
}

/**
 * Money into the channel across every audited exercise, by where it came from.
 *
 * The shares are the finding: party money dominates, which is why it leads the
 * page rather than the corporate line a reader would expect.
 */
export function channelTotals(data: FoundationsFile) {
  const t = Object.values(data.years).reduce(
    (acc, y) => ({
      individuals: acc.individuals + y.individuals,
      companies: acc.companies + y.companies,
      party: acc.party + y.party,
      contributions: acc.contributions + y.contributions,
      subsidies: acc.subsidies + y.subsidies,
    }),
    { individuals: 0, companies: 0, party: 0, contributions: 0, subsidies: 0 },
  );
  const share = (n: number) => (t.contributions > 0 ? n / t.contributions : 0);
  return {
    ...t,
    /** Every euro the channel received, public money included. */
    allMoney: t.contributions + t.subsidies,
    partyShare: share(t.party),
    companiesShare: share(t.companies),
    individualsShare: share(t.individuals),
  };
}

// Words that stay lowercase inside a Spanish or Catalan proper name. Without
// this the report's own ALL-CAPS names ("FUNDACIÓN DE INVESTIGACIONES
// MARXISTAS") shout through the display face on every row.
const MINOR_WORDS = new Set([
  "de", "del", "la", "las", "el", "los", "y", "e", "i", "en", "por", "para",
  "a", "al", "con", "da", "das", "do", "dos", "per", "als", "un", "una",
]);

/**
 * The entity's name as a reader should see it.
 *
 * Title-cased from the report's capitals, leaving connectors lowercase and any
 * token that is already mixed-case or contains an apostrophe alone — "Centre
 * d`Estudis" and "S.A" must survive untouched. The stored name is unchanged,
 * because it is what joins a figure back to the report.
 */
export function displayName(name: string): string {
  return name
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token) || token.length === 0) return token;
      const lower = token.toLowerCase();
      if (MINOR_WORDS.has(lower)) return lower;
      if (/[`'´]/.test(token)) {
        // Catalan elision: keep the article attached and capitalise what follows.
        return lower.replace(/^([a-z]?[`'´])(.)/, (_, head, next) => head + next.toUpperCase());
      }
      if (/^[IVXLC]+$/.test(token)) return token; // roman numerals: "XXI"
      if (/\d/.test(token) || /[a-z]/.test(token)) return token; // already mixed or numeric
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("")
    .replace(/^([a-z])/, (c) => c.toUpperCase());
}

/**
 * A URL segment for an entity.
 *
 * `lib/name-key.mjs` deliberately produces match keys rather than URL segments
 * — `nameKey` sorts its tokens, which makes a fine identity key and a nonsense
 * slug — so the slug is built here, on top of its accent folding.
 */
export function entitySlug(name: string): string {
  return foldText(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** One entity across every exercise the report audits it in. */
export interface Entity {
  slug: string;
  name: string;
  party: string | null;
  partyNif: string | null;
  /** Newest exercise first, so the current picture leads. */
  years: Dossier[];
  individuals: number;
  companies: number;
  party_: number;
  contributions: number;
  subsidies: number;
  deals: Deal[];
  findingCount: number;
}

/**
 * Group the dossiers into entities.
 *
 * The report names the same entity slightly differently between its body and
 * its annexes ("Fundación de Investigaciones Marxistas" against "Fundación
 * Investigaciones Marxistas", "Societat i Progrés" against "Societat y
 * Progrés"), so grouping folds the name rather than comparing it literally.
 */
export function entities(data: FoundationsFile): Entity[] {
  const byKey = new Map<string, Dossier[]>();
  for (const d of data.dossiers) {
    const key = entitySlug(d.name);
    const list = byKey.get(key);
    if (list) list.push(d);
    else byKey.set(key, [d]);
  }

  const out: Entity[] = [];
  for (const [slug, years] of byKey) {
    years.sort((a, b) => b.exercise - a.exercise);
    const sum = (pick: (d: Dossier) => number) => years.reduce((s, d) => s + pick(d), 0);
    const party = years.find((d) => d.partyLinked)?.partyLinked ?? null;
    out.push({
      slug,
      name: years[0].name,
      party,
      partyNif: partyNifFor(party),
      years,
      individuals: sum((d) => d.contributions.individuals.amount),
      companies: sum((d) => d.contributions.companies.amount),
      party_: sum((d) => d.contributions.party.amount),
      contributions: sum((d) => d.contributions.total.amount),
      subsidies: sum((d) => d.subsidies.total),
      deals: years.flatMap((d) => d.deals),
      findingCount: sum((d) => d.findings.length),
    });
  }
  return out;
}

/**
 * Each entity's linked party NIF, keyed by the entity name report nº 1.642
 * uses. This is the report's own party link, which is what makes it usable as
 * a corroborating condition elsewhere rather than something inferred.
 */
export function partyNifByFoundation(data: FoundationsFile): Map<string, string | null> {
  return new Map(entities(data).map((e) => [e.name, e.partyNif]));
}

/** Entities ranked by every euro they received, descending. */
export function rankedEntities(data: FoundationsFile): Entity[] {
  return entities(data).sort(
    (a, b) =>
      b.contributions + b.subsidies - (a.contributions + a.subsidies) ||
      a.name.localeCompare(b.name),
  );
}

export function entityBySlug(data: FoundationsFile, slug: string): Entity | undefined {
  return entities(data).find((e) => e.slug === slug);
}

/**
 * Every named counterparty in the report, with what it paid and whether the
 * Tribunal found the disclosure duties met.
 *
 * This is the part of "ties to companies" that rests on a primary official
 * source rather than on reporting, so it is kept separate from anything curated.
 */
export function namedDeals(data: FoundationsFile) {
  return data.dossiers
    .flatMap((d) =>
      d.deals
        .filter((deal) => deal.counterparties.length > 0)
        .map((deal) => ({
          entity: d.name,
          slug: entitySlug(d.name),
          party: d.partyLinked,
          exercise: d.exercise,
          ...deal,
        })),
    )
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
}

/** How many audited entities the report records as registered, and how many not. */
export function registrationTally(data: FoundationsFile) {
  const latest = Math.max(...foundationYears(data));
  const rows = data.dossiers.filter((d) => d.exercise === latest);
  return {
    exercise: latest,
    total: rows.length,
    registered: rows.filter((d) => d.registered === true).length,
    notRegistered: rows.filter((d) => d.registered === false).length,
    unstated: rows.filter((d) => d.registered === null).length,
  };
}

/**
 * Party names the report writes in a way the word rule below cannot resolve,
 * each read against the report and the registry, with nothing in doubt about
 * which party is meant:
 *
 *   * "Vox" has no word longer than three letters, so the rule compares nothing;
 *   * the report writes "Partit del Socialistes de Catalunya", one letter short
 *     of the registry's "dels";
 *   * the report writes "Partido Nacionalista Vasco" for the party the registry
 *     carries by its Basque name, "Eusko Alderdi Jeltzalea — PNV".
 *
 * Keys are the report's exact wording, folded. Companies wholly owned by a party
 * carry a "porcentaje de participación: 100 %" suffix after the party's name,
 * which is cut first. Coalición Canaria stays unresolved on purpose: the
 * registry holds two NIFs under that name and the report does not say which.
 */
const REPORT_PARTY_NIF: Record<string, string> = {
  vox: "G86867108",
  "partit del socialistes de catalunya": "G08564379",
  "partido nacionalista vasco": "G48103956",
};

/**
 * Link a report-stated party name to the NIF-keyed registry so the entity can
 * point at that party's funding page. Matching is on the registry entry's own
 * words appearing in the report's name; an ambiguous result yields null, because
 * pointing a foundation at the wrong party would misattribute its money.
 */
function partyNifFor(party: string | null): string | null {
  if (!party) return null;
  const worded = foldText(party)
    .replace(/\s*porcentaje de participacion.*$/, "")
    .replace(/\s+/g, " ")
    .trim();
  if (REPORT_PARTY_NIF[worded]) return REPORT_PARTY_NIF[worded];
  const tokens = new Set(foldTokens(party));
  const hits = Object.entries(PARTIES).filter(([, meta]) => {
    const words = foldTokens(meta.displayName).filter((w) => w.length > 3);
    return words.length > 0 && words.every((w) => tokens.has(w));
  });
  return hits.length === 1 ? hits[0][0] : null;
}
