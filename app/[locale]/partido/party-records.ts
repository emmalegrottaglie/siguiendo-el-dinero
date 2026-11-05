import { foldText } from "@/lib/name-key.mjs";
import { displayName, entities, type Entity, type FoundationsFile } from "@/lib/foundations";
import { formationNif, type FormationSpending, type SpendingFile } from "@/lib/spending";

/**
 * What the prototype's party pages need from the data layers, joined by NIF.
 *
 * Nothing here computes a figure the lib modules do not already hold; it only
 * decides which records belong to which party, using the lib's own joins.
 */

/** The audited entities linked to one party, by every euro received, descending. */
export function foundationsOf(data: FoundationsFile, nif: string): Entity[] {
  return entities(data)
    .filter((e) => e.partyNif === nif)
    .sort(
      (a, b) =>
        b.contributions + b.subsidies - (a.contributions + a.subsidies) ||
        a.name.localeCompare(b.name, "es"),
    );
}

/**
 * The audited entities this site cannot tie to one party, with the party as
 * the report words it. Listed on the index so that an entity missing from a
 * party's page reads as a gap, not as an absence.
 */
export function unlinkedFoundations(data: FoundationsFile): Entity[] {
  return entities(data)
    .filter((e) => e.partyNif === null)
    .sort((a, b) => (a.party ?? "").localeCompare(b.party ?? "", "es") || a.name.localeCompare(b.name, "es"));
}

/**
 * The campaign accounts the report audits for a party. A coalition is mapped to
 * the party that led its list (lib/spending.ts), so a coalition's figure is the
 * whole candidacy's, and the page says so.
 */
export function formationsOf(data: SpendingFile, nif: string): FormationSpending[] {
  return data.formations.filter((f) => formationNif(f.name) === nif);
}

/** A formation is a coalition when its name is not the party's own name. */
export function isCoalition(f: FormationSpending, partyName: string): boolean {
  return foldText(f.name) !== foldText(partyName);
}

/**
 * A candidacy's name as a reader should see it. The report prints it in
 * capitals; the title-casing that suits a foundation's name would turn the
 * member parties' acronyms in brackets into words ("Erc-eh Bildu"), so the
 * bracketed list is kept as printed.
 */
export function formationName(name: string): string {
  const m = name.match(/^(.*?)\s*(\(.*\))\s*$/);
  return m ? `${displayName(m[1])} ${m[2]}` : displayName(name);
}
