import type { Locale } from "@/lib/locales";

/**
 * Strings of VoteBar, VoteLegend and DeputyBallots.
 *
 * Ballots are named as they are cast, Sí / No / Abstención, never "a favor" or
 * "en contra": a No on a vote on the Senate's amendments is not a vote against
 * the law, and "en contra" next to a law's name would read as one.
 */
const es = {
  inFavour: (n: number): string => (n === 1 ? "voto sí" : "votos sí"),
  against: (n: number): string => (n === 1 ? "voto no" : "votos no"),
  abstention: (n: number): string => (n === 1 ? "abstención" : "abstenciones"),
  didNotVote: (n: number): string => (n === 1 ? "no votó" : "no votaron"),
  legendFor: "Sí",
  legendAgainst: "No",
  legendAbstention: "Abstención",
  // DeputyBallots
  searchLabel: "Apellido o nombre del diputado",
  searchPlaceholder: "Apellido o nombre",
  searchButton: "Buscar",
  none: "Ningún diputado con ese nombre consta en estas votaciones.",
  found: (n: number, capped: boolean) =>
    `${n === 1 ? "1 diputado" : `${n} diputados`} con ese nombre${capped ? " (se muestran los 40 primeros)" : ""}.`,
  caption: "Voto de cada diputado encontrado en cada votación",
  deputyCol: "Diputado, como figura en el acta",
  ballotFor: "Sí",
  ballotAgainst: "No",
  ballotAbstention: "Abstención",
  ballotNoVote: "No votó",
  notOnRecord: "No consta",
  note: "Un nombre enlaza a su ficha solo cuando identifica a una sola persona. «No consta»: su nombre no figura en el acta de esa votación.",
};
type Copy = typeof es;

const en: Copy = {
  inFavour: (n) => (n === 1 ? "Yes vote" : "Yes votes"),
  against: (n) => (n === 1 ? "No vote" : "No votes"),
  abstention: (n) => (n === 1 ? "abstention" : "abstentions"),
  didNotVote: () => "did not vote",
  legendFor: "Yes",
  legendAgainst: "No",
  legendAbstention: "Abstention",
  searchLabel: "Surname or name of the deputy",
  searchPlaceholder: "Surname or name",
  searchButton: "Search",
  none: "No deputy with that name appears in these divisions.",
  found: (n, capped) =>
    `${n === 1 ? "1 deputy" : `${n} deputies`} with that name${capped ? " (the first 40 are shown)" : ""}.`,
  caption: "Each deputy found, and how they voted in each division",
  deputyCol: "Deputy, as written in the record",
  ballotFor: "Yes",
  ballotAgainst: "No",
  ballotAbstention: "Abstention",
  ballotNoVote: "Did not vote",
  notOnRecord: "Not on record",
  note: "A name links to its profile only when it identifies a single person. “Not on record”: their name does not appear in the record of that division.",
};

const ca: Copy = {
  inFavour: (n) => (n === 1 ? "vot sí" : "vots sí"),
  against: (n) => (n === 1 ? "vot no" : "vots no"),
  abstention: (n) => (n === 1 ? "abstenció" : "abstencions"),
  didNotVote: (n) => (n === 1 ? "no va votar" : "no van votar"),
  legendFor: "Sí",
  legendAgainst: "No",
  legendAbstention: "Abstenció",
  searchLabel: "Cognom o nom del diputat",
  searchPlaceholder: "Cognom o nom",
  searchButton: "Cerca",
  none: "Cap diputat amb aquest nom consta en aquestes votacions.",
  found: (n, capped) =>
    `${n === 1 ? "1 diputat" : `${n} diputats`} amb aquest nom${capped ? " (es mostren els 40 primers)" : ""}.`,
  caption: "Vot de cada diputat trobat en cada votació",
  deputyCol: "Diputat, tal com figura a l'acta",
  ballotFor: "Sí",
  ballotAgainst: "No",
  ballotAbstention: "Abstenció",
  ballotNoVote: "No va votar",
  notOnRecord: "No consta",
  note: "Un nom enllaça a la seva fitxa només quan identifica una sola persona. «No consta»: el seu nom no figura a l'acta d'aquella votació.",
};

export const VOTE_COPY: Record<Locale, Copy> = { es, en, ca };
