import { formatDate } from "@/lib/format";
import { voteDateISO, type KeyVote, type VotesData } from "@/lib/votes";

/**
 * Shared helpers for the prototype's topic pages (`/nuevo/temas` and
 * `/nuevo/tema/[id]`): which votes belong to a topic, in date order, and how
 * each kind of division is named in plain words.
 */

/** What kind of vote each station on a topic's line is, in a few words. */
export const KIND_SHORT: Record<string, string> = {
  ley: "votación final de ley",
  toma: "toma en consideración",
  pnl: "proposición no de ley",
  mocion: "moción",
};

/**
 * What each kind of division is, for a reader who does not know the
 * Congreso's procedure. General facts about the procedure only; whether a
 * given division has legal effect is read from its own `binding` field.
 */
export const KIND_PLAIN: Record<string, string> = {
  ley: "Votación final de una ley: el Congreso vota el texto que saldrá publicado en el BOE.",
  toma: "Toma en consideración: el Congreso vota si una proposición de ley empieza a tramitarse.",
  pnl: "Proposición no de ley: el Congreso pide al Gobierno que haga algo, sin cambiar ninguna ley.",
  mocion: "Moción tras una interpelación: el Congreso fija una posición o pide algo al Gobierno, sin cambiar ninguna ley.",
};

/** A topic's divisions, oldest first, by their actual date. */
export function votesOfTopic(data: VotesData, topic: string): KeyVote[] {
  return data.votes
    .filter((v) => v.topic === topic)
    .sort((a, b) => voteDateISO(a).localeCompare(voteDateISO(b)));
}

/** "16 feb 2023". */
export function voteDate(vote: KeyVote, bcp47: string): string {
  return formatDate(voteDateISO(vote), bcp47);
}

export function voteYear(vote: KeyVote): number {
  return Number(voteDateISO(vote).slice(0, 4));
}

/** "2023", or "2023 y 2026" when the votes span more than one year. */
export function yearSpan(votes: KeyVote[]): string {
  const years = votes.map(voteYear);
  const lo = Math.min(...years);
  const hi = Math.max(...years);
  return lo === hi ? `en ${lo}` : `entre ${lo} y ${hi}`;
}

/** The record's own wording of what was voted, without stray whitespace. */
export function whatWasVoted(vote: KeyVote): string {
  return vote.expediente.replace(/\s+/g, " ").trim();
}
