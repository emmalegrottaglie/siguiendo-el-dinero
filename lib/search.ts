import { getPeople, placeOf, type Person } from "./people";
import { getVotes } from "./votes";
import { getFoundations, entities } from "./foundations";
import { getProvinces } from "./provinces";
import { PARTIES } from "./parties";
import { TERRITORIES } from "./territories";
import { shortName } from "./governments";
import { foldText } from "./name-key.mjs";
import { getDict } from "./i18n";

/**
 * One search across everything this site publishes.
 *
 * Until now a reader had to know which of eleven pages held the thing they were
 * looking for: an officeholder is on one page, the party that funds them on
 * another, the foundation that party owns on a third, and the comunidad they
 * govern on a fourth. That is a map of the site's internals, not of the
 * reader's question.
 *
 * It runs on the server, over the same module-cached data the pages use. That
 * is the whole reason it is cheap: the register alone is 6,670 rows and about
 * 1.8 MB, and shipping an index of it to every visitor to get a typeahead would
 * cost every reader far more than it saves the few who search. The search page
 * is a plain form GET, so it works without JavaScript, it is linkable, and the
 * browser announces the change of context — the same shape `/politicos`
 * already uses.
 *
 * What it does not do, and what the page says it does not do: it matches names
 * and titles, not the text of the reports behind them. A search for a word that
 * appears only inside a Tribunal de Cuentas finding will not find it, and
 * pretending otherwise would send a reader away believing the word is not
 * there.
 */

export type ResultKind =
  | "person"
  | "party"
  | "foundation"
  | "territory"
  | "province"
  | "vote"
  | "page";

export interface SearchResult {
  kind: ResultKind;
  /** What the row is called. */
  title: string;
  /** What distinguishes it from a row with the same name. Never invented. */
  detail: string | null;
  href: string;
  /** Lower sorts first. */
  rank: number;
}

export interface SearchGroup {
  kind: ResultKind;
  results: SearchResult[];
  /** Matches beyond the ones shown, so the count on the page is honest. */
  more: number;
}

export interface SearchOutcome {
  query: string;
  groups: SearchGroup[];
  total: number;
}

/** Shown per group. The rest is counted, never silently dropped. */
const PER_GROUP = 8;

/**
 * Rank for a row matched on its post or its place rather than its name.
 *
 * Below every tier `score` produces, so "Soria" lists the person called Soria
 * before the forty mayors of towns in Soria.
 */
const CONTEXT_RANK = 4;

/**
 * Shortest query that is run at all.
 *
 * One letter matches most of the register, so the page would be noise rather
 * than an answer. The page says the query was too short rather than reporting
 * no results, because "nothing matches" would be a claim about the data.
 */
export const MIN_QUERY = 2;

/**
 * Tie-break order for groups, used when two kinds match equally well.
 *
 * It is a tie-break and not the running order. A fixed order put the register
 * first unconditionally, so searching "pp" listed a man called Giuseppe above
 * the Partido Popular — a weak match in a big group beating an exact one in a
 * small group. Groups are ordered by their best match first, and this decides
 * only what happens when those are equal.
 */
const ORDER: ResultKind[] = [
  "person",
  "party",
  "foundation",
  "territory",
  "province",
  "vote",
  "page",
];

/**
 * How well a folded haystack matches a folded needle, or null for no match.
 *
 * Three tiers, because "Ayuso" should not rank below a row that merely contains
 * those letters in the middle of a longer word. Exact, then a word that starts
 * with the needle, then anywhere.
 */
function score(haystack: string, needle: string): number | null {
  if (haystack === needle) return 0;
  if (haystack.startsWith(needle)) return 1;
  // A word boundary inside the string: "Díaz" matching "Isabel Díaz Ayuso".
  if (haystack.includes(" " + needle)) return 2;
  if (haystack.includes(needle)) return 3;
  return null;
}

interface PersonRow {
  slug: string;
  name: string;
  detail: string | null;
  fName: string;
  /** Post and place folded together, for one `includes` instead of three. */
  fContext: string;
}

let peopleCache: PersonRow[] | null = null;

/**
 * Everyone with a profile (the register plus the deputies it lacks), folded once
 * per process rather than once per query.
 *
 * Folding ~6,800 names, posts and places on every keystroke-free page load is
 * about twenty-seven thousand `normalize()` calls for a result set that never
 * changes between deploys. The data is static, so the index is built on the
 * first search and kept.
 */
function peopleIndex(people: Person[]): PersonRow[] {
  if (peopleCache) return peopleCache;
  peopleCache = people.map((p) => ({
    slug: p.slug,
    name: p.name,
    // Thousands of these rows are mayors of small towns, so a list of bare
    // names would be unusable; the post and the place are what tell them apart.
    detail: [p.role, placeOf(p)].filter(Boolean).join(" · ") || null,
    fName: foldText(p.name),
    fContext: foldText([p.role, p.municipality ?? "", p.region ?? "", p.deputy?.constituency ?? ""].join(" ")),
  }));
  return peopleCache;
}

export async function search(rawQuery: string, locale: string): Promise<SearchOutcome> {
  const query = rawQuery.trim();
  const needle = foldText(query);

  if (needle.length < MIN_QUERY) {
    return { query, groups: [], total: 0 };
  }

  const [people, votes, foundations, provinceFile] = await Promise.all([
    getPeople(),
    getVotes(),
    getFoundations(),
    getProvinces(),
  ]);

  const hits: SearchResult[] = [];
  const add = (
    kind: ResultKind,
    title: string,
    detail: string | null,
    href: string,
    rank: number | null,
  ) => {
    if (rank !== null) hits.push({ kind, title, detail, href, rank });
  };

  // --- people -------------------------------------------------------------
  //
  // Matched on the name, and also on the post and the place, because a reader
  // looking for "alcalde de Soria" knows the post and not the person. A context
  // match ranks below every name match: when the query is a name, that is what
  // was asked for.
  for (const p of peopleIndex(people)) {
    const rank =
      score(p.fName, needle) ??
      (p.fContext.includes(needle) ? CONTEXT_RANK : null);
    add("person", p.name, p.detail, `/${locale}/politico/${p.slug}`, rank);
  }

  // --- parties ------------------------------------------------------------
  for (const [nif, meta] of Object.entries(PARTIES)) {
    const rank =
      score(foldText(meta.displayName), needle) ??
      score(foldText(meta.shortName), needle) ??
      score(foldText(nif), needle);
    add("party", meta.displayName, meta.shortName, `/${locale}/party/${nif}`, rank);
  }

  // --- party-linked entities ---------------------------------------------
  for (const e of entities(foundations)) {
    add(
      "foundation",
      e.name,
      e.party,
      `/${locale}/fundacion/${e.slug}`,
      score(foldText(e.name), needle),
    );
  }

  // --- comunidades autónomas ---------------------------------------------
  //
  // These link to the map rather than to a local page: `/donde` is addressed by
  // province, and sending "Cataluña" to one of its four provinces would pick a
  // province the reader did not ask for.
  for (const t of TERRITORIES) {
    const display = shortName(t.id, t.mapName);
    const rank =
      score(foldText(display), needle) ??
      score(foldText(t.mapName), needle) ??
      score(foldText(t.registerName), needle);
    add("territory", display, t.mapName === display ? null : t.mapName, `/${locale}/mapa`, rank);
  }

  // --- provinces ----------------------------------------------------------
  for (const p of provinceFile.provinces) {
    const territory = TERRITORIES.find((t) => t.id === p.territoryId);
    add(
      "province",
      p.name,
      territory ? shortName(territory.id, territory.mapName) : null,
      `/${locale}/donde/${p.slug}`,
      score(foldText(p.name), needle),
    );
  }

  // --- tracked divisions --------------------------------------------------
  for (const v of votes.votes) {
    const rank = score(foldText(v.law), needle) ?? score(foldText(v.title), needle);
    add("vote", v.law, `${v.topicLabel} · ${v.date}`, `/${locale}/votaciones`, rank);
  }

  // --- the site's own sections -------------------------------------------
  //
  // A reader who types "metodología" wants the page, not a person whose post
  // mentions it. Cheap to include and it removes the one case where a search
  // for something plainly on the site returns nothing.
  const { t } = getDict(locale);
  const sections: [string, string][] = [
    [t.nav.panel, ""],
    [t.nav.funding, "/financiacion"],
    [t.nav.foundations, "/fundaciones"],
    [t.nav.rights, "/derechos"],
    [t.nav.votes, "/votaciones"],
    [t.nav.map, "/mapa"],
    [t.nav.people, "/politicos"],
    [t.assets.tabs.declarations, "/politicos/declaraciones"],
    [t.nav.context, "/contexto"],
    [t.nav.methodology, "/metodologia"],
  ];
  for (const [label, path] of sections) {
    add("page", label, null, `/${locale}${path}`, score(foldText(label), needle));
  }

  hits.sort((a, b) => a.rank - b.rank || a.title.localeCompare(b.title, locale));

  const groups: SearchGroup[] = [];
  for (const kind of ORDER) {
    const all = hits.filter((h) => h.kind === kind);
    if (all.length === 0) continue;
    groups.push({
      kind,
      results: all.slice(0, PER_GROUP),
      more: Math.max(0, all.length - PER_GROUP),
    });
  }

  // `hits` is already sorted, so a group's first result carries its best rank.
  groups.sort(
    (a, b) =>
      a.results[0].rank - b.results[0].rank ||
      ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind),
  );

  return { query, groups, total: hits.length };
}
