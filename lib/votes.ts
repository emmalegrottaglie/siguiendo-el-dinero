import { promises as fs } from "node:fs";
import path from "node:path";
import { nameKey } from "./name-key.mjs";
import { groupInfo } from "./groups";

export type Ballot = "Sí" | "No" | "Abstención" | "No vota" | string;

export interface DeputyVote {
  deputy: string; // "Apellidos, Nombre" as published
  group: string; // parliamentary group code
  vote: Ballot;
}

/**
 * What kind of division it was. A vote on a bill is named by its stage, as the
 * record gives it: `conjunto` (the overall vote an organic law needs),
 * `enmiendas` (whether to accept the Senate's amendments) or `dictamen` (the
 * Congreso's vote on its committee's text, before the Senate).
 */
export type VoteKind = "conjunto" | "enmiendas" | "dictamen" | "toma" | "pnl" | "mocion";

export interface KeyVote {
  id: string;
  topic: string;
  topicLabel: string;
  kind: VoteKind;
  kindLabel: string;
  /** true for votes with legal effect; false for non-binding motions. */
  binding: boolean;
  law: string;
  lawUrl: string | null;
  legislature: string;
  session: number | null;
  number: number | null;
  date: string;
  title: string;
  expediente: string;
  /** The part of the item put to this division, where the record splits it ("" otherwise). */
  subgroupTitle: string;
  subgroupText: string;
  totals: {
    presentes: number;
    afavor: number;
    enContra: number;
    abstenciones: number;
    noVotan: number;
  };
  sourceUrl: string;
  votes: DeputyVote[];
}

export interface VotesData {
  generatedAt: string;
  source: { name: string; url: string };
  topics: { id: string; label: string }[];
  count: number;
  votes: KeyVote[];
}

const FILE = path.join(process.cwd(), "data", "votes.json");
let cache: VotesData | null = null;

export async function getVotes(): Promise<VotesData> {
  if (cache) return cache;
  cache = JSON.parse(await fs.readFile(FILE, "utf-8")) as VotesData;
  return cache;
}

// Names appear as "Apellidos, Nombre" in the roll call and "Nombre Apellidos" in
// the salary register, so comparison goes through the shared order-independent key.
export { nameKey };

export interface RecordedPosition {
  vote: KeyVote;
  ballot: Ballot;
  group: string;
}

// Every recorded position for one person. Empty when the person has no roll-call
// record — the app shows nothing rather than inferring a stance.
export async function positionsFor(name: string): Promise<RecordedPosition[]> {
  const data = await getVotes();
  const key = nameKey(name);
  const out: RecordedPosition[] = [];
  for (const vote of data.votes) {
    const hit = vote.votes.find((v) => nameKey(v.deputy) === key);
    if (hit) out.push({ vote, ballot: hit.vote, group: hit.group });
  }
  return out;
}

/**
 * The date of a division as an ISO day, from the D/M/YYYY the Congreso's own
 * record publishes.
 *
 * Two things go wrong without this. `new Date("25/6/2026")` is invalid, so
 * anything formatting the raw string throws; and sorting the raw strings is
 * lexicographic, which puts 25/6/2026 before 27/11/2025 and quietly picks the
 * wrong division as the most recent.
 */
export function voteDateISO(vote: Pick<KeyVote, "date">): string {
  const [d, m, y] = vote.date.split("/").map(Number);
  if (!d || !m || !y) throw new Error(`unparseable vote date: ${vote.date}`);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Divisions newest first, by their actual date rather than by string order. */
export function newestFirst(votes: KeyVote[]): KeyVote[] {
  return [...votes].sort((a, b) => voteDateISO(b).localeCompare(voteDateISO(a)));
}

export interface GroupTally {
  group: string;
  si: number;
  no: number;
  abst: number;
  other: number;
}

// Per-parliamentary-group breakdown of a single vote.
export function tallyByGroup(vote: KeyVote): GroupTally[] {
  const map = new Map<string, GroupTally>();
  for (const v of vote.votes) {
    const g = map.get(v.group) ?? { group: v.group, si: 0, no: 0, abst: 0, other: 0 };
    if (v.vote === "Sí") g.si++;
    else if (v.vote === "No") g.no++;
    else if (v.vote === "Abstención") g.abst++;
    else g.other++;
    map.set(v.group, g);
  }
  return [...map.values()].sort(
    (a, b) => b.si + b.no + b.abst + b.other - (a.si + a.no + a.abst + a.other),
  );
}

/** Which way a group came down on a division. */
export type Stance = "si" | "no" | "ab";

/**
 * Each party's recorded stance on a division, keyed by NIF.
 *
 * Two rules, and both are refusals to guess.
 *
 * A group's stance is the majority of its own members' ballots. Where the
 * largest count is tied the group gets no stance at all, rather than
 * whichever option happened to be checked first.
 *
 * A stance is only attributed to a party where a group represents exactly
 * that party. A party sitting inside a composite group - Mixto, Plural - has
 * no stance of its own in the record, and handing it the group's majority
 * would attribute a position to a party that never cast it as a party. That
 * is the inference this project declines everywhere else, so it declines it
 * here too, and callers say which parties they had to leave out.
 */
export function stancesByParty(vote: KeyVote): Map<string, Stance> {
  const out = new Map<string, Stance>();
  for (const g of tallyByGroup(vote)) {
    const best = Math.max(g.si, g.no, g.abst);
    if (best === 0) continue;
    if ([g.si, g.no, g.abst].filter((n) => n === best).length > 1) continue;
    const info = groupInfo(vote.legislature, g.group);
    if (!info?.party) continue;
    out.set(info.party, g.si === best ? "si" : g.no === best ? "no" : "ab");
  }
  return out;
}
