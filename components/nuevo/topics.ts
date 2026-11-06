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
    conjunto: "votación de conjunto de ley orgánica",
    enmiendas: "enmiendas del Senado",
    dictamen: "dictamen de la comisión",
    toma: "toma en consideración",
    pnl: "proposición no de ley",
    mocion: "moción",
  },
  en: {
    conjunto: "overall vote on an organic law",
    enmiendas: "Senate amendments",
    dictamen: "committee's text",
    toma: "leave to proceed",
    pnl: "non-legislative motion",
    mocion: "motion",
  },
  ca: {
    conjunto: "votació de conjunt de llei orgànica",
    enmiendas: "esmenes del Senat",
    dictamen: "dictamen de la comissió",
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
    conjunto:
      "Votación de conjunto de una ley orgánica: el Congreso vota la ley orgánica entera, que necesita la mayoría absoluta de la cámara para salir adelante.",
    enmiendas:
      "Votación de las enmiendas del Senado: el Congreso vota si acepta los cambios que introdujo el Senado. Un sí los acepta; un no los rechaza y deja el texto que había aprobado el Congreso. No es una votación sobre la ley en su conjunto.",
    dictamen:
      "Votación del dictamen: el Congreso aprueba el texto que preparó su comisión, y el proyecto pasa después al Senado. No es la última votación de la ley.",
    toma: "Toma en consideración: el Congreso vota si una proposición de ley empieza a tramitarse.",
    pnl: "Proposición no de ley: el Congreso pide al Gobierno que haga algo, sin cambiar ninguna ley.",
    mocion:
      "Moción tras una interpelación: el Congreso fija una posición o pide algo al Gobierno, sin cambiar ninguna ley.",
  },
  en: {
    conjunto:
      "Overall vote on an organic law: the Congreso votes on the whole organic law, which needs an absolute majority of the chamber to pass.",
    enmiendas:
      "Vote on the Senate's amendments: the Congreso votes on whether to accept the changes the Senate made. A Yes accepts them; a No rejects them and keeps the text the Congreso had passed. It is not a vote on the law as a whole.",
    dictamen:
      "Vote on the committee's text: the Congreso approves the text its committee prepared, and the bill then goes to the Senate. It is not the last vote on the law.",
    toma: "Leave to proceed: the Congreso votes on whether a bill put forward by members starts to be processed.",
    pnl: "Non-legislative motion: the Congreso asks the Government to do something, without changing any law.",
    mocion:
      "Motion following an interpellation: the Congreso sets a position or asks something of the Government, without changing any law.",
  },
  ca: {
    conjunto:
      "Votació de conjunt d'una llei orgànica: el Congrés vota la llei orgànica sencera, que necessita la majoria absoluta de la cambra per tirar endavant.",
    enmiendas:
      "Votació de les esmenes del Senat: el Congrés vota si accepta els canvis que va introduir el Senat. Un sí els accepta; un no els rebutja i deixa el text que havia aprovat el Congrés. No és una votació sobre la llei en el seu conjunt.",
    dictamen:
      "Votació del dictamen: el Congrés aprova el text que va preparar la seva comissió, i el projecte passa després al Senat. No és l'última votació de la llei.",
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

/** Kinds of division on a bill, whose agenda heading says which stage it was. */
const BILL_STAGES = new Set(["conjunto", "enmiendas", "dictamen"]);

/**
 * What the ballot was on, in the record's own words and without stray
 * whitespace. For a vote on a bill, the heading it was taken under comes first
 * ("Enmiendas del Senado"); for the other kinds the heading only repeats the
 * kind ("Proposiciones no de Ley") and is left out. Where the record splits the
 * item into several divisions, the part put to this one follows ("Votación
 * separada de las enmiendas: Resto de las enmiendas"), then the item itself.
 * On Ley 4/2023 this is what shows that the ballot was on the Senate's
 * remaining amendments and not on the law. As recorded, so in Spanish in every
 * locale.
 */
export function whatWasVoted(vote: KeyVote): string {
  const clean = (s: string | undefined) => (s ?? "").replace(/\s+/g, " ").trim().replace(/\.$/, "");
  const heading = BILL_STAGES.has(vote.kind) ? clean(vote.title) : "";
  const stage = clean(vote.subgroupTitle);
  const part = clean(vote.subgroupText);
  const parts = [heading, stage && part ? `${stage}: ${part}` : stage || part, clean(vote.expediente)];
  return parts.filter(Boolean).join(". ") + ".";
}
