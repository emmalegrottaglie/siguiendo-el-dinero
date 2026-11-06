import { formatDate } from "@/lib/format";
import type { Locale } from "@/lib/locales";
import { voteDateISO, type KeyVote, type VotesData } from "@/lib/votes";

/**
 * Shared helpers for the prototype's topic pages (`/temas` and
 * `/tema/[id]`): which votes belong to a topic, in date order, and how
 * each kind of division is named in plain words.
 */

/** What kind of vote each station on a topic's line is, in a few words. */
export const KIND_SHORT: Record<Locale, Record<string, string>> = {
  es: {
    ley: "votación final de ley",
    toma: "toma en consideración",
    pnl: "proposición no de ley",
    mocion: "moción",
  },
  en: {
    ley: "final vote on a law",
    toma: "leave to proceed",
    pnl: "non-legislative motion",
    mocion: "motion",
  },
  ca: {
    ley: "votació final de llei",
    toma: "presa en consideració",
    pnl: "proposició no de llei",
    mocion: "moció",
  },
};

/**
 * What each kind of division is, for a reader who does not know the
 * Congreso's procedure. General facts about the procedure only; whether a
 * given division has legal effect is read from its own `binding` field.
 */
export const KIND_PLAIN: Record<Locale, Record<string, string>> = {
  es: {
    ley: "Votación final de una ley: el Congreso vota el texto que saldrá publicado en el BOE.",
    toma: "Toma en consideración: el Congreso vota si una proposición de ley empieza a tramitarse.",
    pnl: "Proposición no de ley: el Congreso pide al Gobierno que haga algo, sin cambiar ninguna ley.",
    mocion:
      "Moción tras una interpelación: el Congreso fija una posición o pide algo al Gobierno, sin cambiar ninguna ley.",
  },
  en: {
    ley: "Final vote on a law: the Congreso votes the text that will be published in the BOE.",
    toma: "Leave to proceed: the Congreso votes on whether a bill put forward by members starts to be processed.",
    pnl: "Non-legislative motion: the Congreso asks the Government to do something, without changing any law.",
    mocion:
      "Motion following an interpellation: the Congreso sets a position or asks something of the Government, without changing any law.",
  },
  ca: {
    ley: "Votació final d'una llei: el Congrés vota el text que es publicarà al BOE.",
    toma: "Presa en consideració: el Congrés vota si una proposició de llei comença a tramitar-se.",
    pnl: "Proposició no de llei: el Congrés demana al Govern que faci alguna cosa, sense canviar cap llei.",
    mocion:
      "Moció conseqüència d'una interpel·lació: el Congrés fixa una posició o demana alguna cosa al Govern, sense canviar cap llei.",
  },
};

/**
 * The topics' names. The data carries them in Spanish (`topics[].label`); the
 * other languages are looked up by topic id, and an unknown id keeps the
 * label as recorded.
 */
const TOPIC_LABEL: Record<Locale, Record<string, string>> = {
  es: {},
  en: {
    lgtbi: "Trans and LGBTI rights",
    aborto: "Abortion and sexual health",
    vivienda: "Housing",
  },
  ca: {
    lgtbi: "Drets trans i LGBTI",
    aborto: "Avortament i salut sexual",
    vivienda: "Habitatge",
  },
};

export function topicLabel(id: string, label: string, locale: Locale = "es"): string {
  return TOPIC_LABEL[locale][id] ?? label;
}

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

/** "en 2023", or "entre 2023 y 2026" when the votes span more than one year. */
export function yearSpan(votes: KeyVote[], locale: Locale = "es"): string {
  const years = votes.map(voteYear);
  const lo = Math.min(...years);
  const hi = Math.max(...years);
  if (locale === "en") return lo === hi ? `in ${lo}` : `between ${lo} and ${hi}`;
  if (locale === "ca") return lo === hi ? `el ${lo}` : `entre el ${lo} i el ${hi}`;
  return lo === hi ? `en ${lo}` : `entre ${lo} y ${hi}`;
}

/** The record's own wording of what was voted, without stray whitespace. */
export function whatWasVoted(vote: KeyVote): string {
  return vote.expediente.replace(/\s+/g, " ").trim();
}
