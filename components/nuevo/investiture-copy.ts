import type { Locale } from "@/lib/locales";

/**
 * Strings of InvestitureRecord, shared by the territory index and the party
 * hub so the two can never word the same record differently.
 *
 * `decisive` and `short` are the old map's `investitureDecisive` and
 * `investitureShort` (lib/i18n.ts, block `map`) word for word, turned into
 * functions: their caveats are the substance of the record and are not
 * rephrased. Figures arrive already formatted for the locale.
 */
const es = {
  title: "Investidura",
  decisive: (a: {
    pp: string;
    seats: string;
    majority: string;
    date: string;
    for: string;
    against: string;
    voxVotes: string;
  }) =>
    `El PP tenía ${a.pp} de ${a.seats} escaños y la mayoría absoluta era ${a.majority}. En la votación del ${a.date} la investidura salió por ${a.for} votos frente a ${a.against}, y ${a.voxVotes} de esos votos los puso Vox: sin ellos no había mayoría.`,
  short: (a: { pp: string; seats: string; majority: string; vox: string }) =>
    `El PP tenía ${a.pp} de ${a.seats} escaños y la mayoría absoluta era ${a.majority}, así que no la alcanzaba solo; los ${a.vox} escaños de Vox habrían bastado para cubrir la diferencia. El acta de la votación no está verificada aquí, y en segunda vuelta basta la mayoría simple, así que no se afirma quién invistió a nadie.`,
  carried: "aprobada",
  failed: "rechazada",
  hatchDecisive: "Investidura con votos de Vox, según el acta",
  hatchShort: "El PP no llegaba solo a la mayoría absoluta",
  seat: ["escaño", "escaños"] as [string, string],
  rest: "Resto",
  absMajority: (n: string) => `Mayoría absoluta, ${n}`,
  seatsFrom: (date: string) => `Escaños de las elecciones del ${date}.`,
  roundsTitle: "Votaciones registradas",
  round: (n: number, required: "absolute" | "simple") =>
    `${n}.ª votación, mayoría ${required === "absolute" ? "absoluta" : "simple"}`,
  tally: (forV: string, against: string) => `${forV} a favor, ${against} en contra`,
  abstentions: (n: string, raw: number) => `${n} ${raw === 1 ? "abstención" : "abstenciones"}`,
  /** Votes in favour by party, as recorded. */
  forLabel: "A favor:",
  noRounds: "El acta de la votación no está transcrita aquí: sólo constan los escaños.",
  sourceLabel: "Fuente:",
};
export type InvestitureCopy = typeof es;

const en: InvestitureCopy = {
  title: "Investiture",
  decisive: (a) =>
    `The PP held ${a.pp} of ${a.seats} seats and an absolute majority was ${a.majority}. In the vote of ${a.date} the investiture carried ${a.for} to ${a.against}, and ${a.voxVotes} of those votes came from Vox: without them there was no majority.`,
  short: (a) =>
    `The PP held ${a.pp} of ${a.seats} seats and an absolute majority was ${a.majority}, so it could not reach one alone; Vox’s ${a.vox} seats would have closed the gap. The vote record is not verified here, and a second round needs only a simple majority, so nothing is claimed about who invested whom.`,
  carried: "carried",
  failed: "rejected",
  hatchDecisive: "Invested with Vox votes, per the record",
  hatchShort: "PP could not reach an absolute majority alone",
  seat: ["seat", "seats"],
  rest: "Rest",
  absMajority: (n) => `Absolute majority, ${n}`,
  seatsFrom: (date) => `Seats from the election of ${date}.`,
  roundsTitle: "Recorded votes",
  round: (n, required) => `Round ${n}, ${required === "absolute" ? "absolute" : "simple"} majority`,
  tally: (forV, against) => `${forV} in favour, ${against} against`,
  abstentions: (n, raw) => `${n} ${raw === 1 ? "abstention" : "abstentions"}`,
  forLabel: "In favour:",
  noRounds: "The vote record is not transcribed here: only the seats are on record.",
  sourceLabel: "Source:",
};

const ca: InvestitureCopy = {
  title: "Investidura",
  decisive: (a) =>
    `El PP tenia ${a.pp} de ${a.seats} escons i la majoria absoluta era ${a.majority}. A la votació del ${a.date} la investidura va sortir per ${a.for} vots contra ${a.against}, i ${a.voxVotes} d’aquells vots els va posar Vox: sense ells no hi havia majoria.`,
  short: (a) =>
    `El PP tenia ${a.pp} de ${a.seats} escons i la majoria absoluta era ${a.majority}, així que no hi arribava sol; els ${a.vox} escons de Vox haurien bastat per cobrir la diferència. L’acta de la votació no està verificada aquí, i en segona volta n’hi ha prou amb la majoria simple, així que no s’afirma qui va investir ningú.`,
  carried: "aprovada",
  failed: "rebutjada",
  hatchDecisive: "Investidura amb vots de Vox, segons l’acta",
  hatchShort: "El PP no arribava sol a la majoria absoluta",
  seat: ["escó", "escons"],
  rest: "Resta",
  absMajority: (n) => `Majoria absoluta, ${n}`,
  seatsFrom: (date) => `Escons de les eleccions del ${date}.`,
  roundsTitle: "Votacions registrades",
  round: (n, required) => `${n}a votació, majoria ${required === "absolute" ? "absoluta" : "simple"}`,
  tally: (forV, against) => `${forV} a favor, ${against} en contra`,
  abstentions: (n, raw) => `${n} ${raw === 1 ? "abstenció" : "abstencions"}`,
  forLabel: "A favor:",
  noRounds: "L’acta de la votació no està transcrita aquí: només hi consten els escons.",
  sourceLabel: "Font:",
};

export const INVESTITURE_COPY: Record<Locale, InvestitureCopy> = { es, en, ca };
