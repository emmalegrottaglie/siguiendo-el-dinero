import type { Locale } from "@/lib/locales";

const es = {
  metaTitle: (label: string) => `${label}: cómo votó el Congreso`,
  metaFallback: "Tema",
  relatedLgtbi: "Lo que publican las organizaciones LGTBI",
  relatedAll: "todas las votaciones",
  and: " y ",
  crumb: "Temas",
  intro:
    "Cómo votó el Congreso en las votaciones nominales sobre este tema que sigue esta web, de la más antigua a la más reciente. Cada voto es uno emitido y publicado en el acta oficial, no una postura atribuida.",
  lineTitle: "Las votaciones, en orden",
  lineFinding: (n: number, lowerLabel: string, span: string, binding: number, firstBinding: boolean) => {
    const bindingText =
      binding === 0
        ? "ninguna tiene efecto legal"
        : binding === n && n > 1
          ? "todas tienen efecto legal"
          : `${binding} de ellas ${binding === 1 ? "tiene" : "tienen"} efecto legal`;
    return n === 1
      ? `Esta web sigue 1 votación sobre ${lowerLabel}, ${span}, y ${firstBinding ? "tiene" : "no tiene"} efecto legal.`
      : `Esta web sigue ${n} votaciones sobre ${lowerLabel} ${span}, y ${bindingText}.`;
  },
  noLegalEffect: ", sin efecto legal",
  lineNote:
    "Una estación por votación. Todas constan en el acta oficial, por eso la línea es continua y los puntos están llenos.",
  sourceLabel: "Fuente: ",
  deputyTitle: "Cómo votó un diputado",
  deputyIntro:
    "Busca por apellido o nombre. Se muestra el voto que consta en cada acta y, cuando el nombre identifica a una sola persona, el enlace a su ficha.",
  missingTitle: "Lo que esta página no dice",
  passedTitle: "Si salió adelante",
  passedText:
    "Los datos que usa esta web no incluyen el resultado de cada votación, y contar votos no basta: una ley orgánica necesita la mayoría absoluta del Congreso. El acta oficial de cada votación está enlazada en su apartado.",
  amendmentsTitle: "Las enmiendas",
  amendmentsText:
    "Se recogen votaciones de conjunto, tomas en consideración, proposiciones no de ley y mociones. Las votaciones de enmiendas una a una no se recogen.",
  nobodyTitle: "La postura de nadie",
  nobodyText:
    "Un diputado aparece solo con el voto que consta en el acta. No se deduce la postura de nadie a partir de su partido o de su grupo.",
  otherTopics: "Otros temas: ",
  currentSite: "En el sitio actual: ",
  // One division
  legislature: (l: string) => `${l} legislatura.`,
  tied: (blocs: number, groups: number) =>
    `El sí y el no empataron, y ${blocs} de los ${groups} grupos votaron en bloque.`,
  gap: (diff: number, blocs: number, groups: number) =>
    `Hubo ${diff} ${diff === 1 ? "voto" : "votos"} de diferencia entre el sí y el no, y ${blocs} de los ${groups} grupos votaron en bloque.`,
  whatTitle: "Qué se votó, según el acta",
  kindTitle: "Qué tipo de votación es",
  hasEffect: "Tiene efecto legal.",
  noEffect: "No tiene efecto legal.",
  officialRecord: "Acta oficial de la votación",
  sessionNumber: (session: number | null, number: number | null) => `, sesión ${session}, votación ${number}`,
  lawText: "Texto de la ley en el BOE",
  groupsTitle: "Cómo votó cada grupo",
  severalParties: (parties: string) => `, grupo de varios partidos (${parties})`,
  groupUnknown: ", grupo no identificado en el registro",
  groupNote:
    "En bloque: todos los diputados del grupo que votaron lo hicieron en el mismo sentido. Un grupo parlamentario no es un partido: cuando lo forma uno solo, su nombre enlaza a la ficha de ese partido y a lo que recibe. Que el voto y el dinero estén en la misma web no significa que uno explique el otro.",
  divisionSource: (date: string) =>
    `Fuente: acta de votación nominal del Congreso de los Diputados, ${date}.`,
};
type Copy = typeof es;

const en: Copy = {
  metaTitle: (label) => `${label}: how the Congreso voted`,
  metaFallback: "Topic",
  relatedLgtbi: "What LGBTI rights organisations publish",
  relatedAll: "all the divisions",
  and: " and ",
  crumb: "Topics",
  intro:
    "How the Congreso voted in the roll-call votes on this topic that this site follows, from the oldest to the most recent. Each vote is one cast and published in the official record, not an attributed stance.",
  lineTitle: "The divisions, in order",
  lineFinding: (n, lowerLabel, span, binding, firstBinding) => {
    const bindingText =
      binding === 0
        ? "none has legal effect"
        : binding === n && n > 1
          ? "all have legal effect"
          : `${binding} of them ${binding === 1 ? "has" : "have"} legal effect`;
    return n === 1
      ? `This site follows 1 division on ${lowerLabel}, ${span}, and it ${firstBinding ? "has" : "has no"} legal effect.`
      : `This site follows ${n} divisions on ${lowerLabel} ${span}, and ${bindingText}.`;
  },
  noLegalEffect: ", no legal effect",
  lineNote:
    "One station per division. All are on the official record, which is why the line is continuous and the dots are filled.",
  sourceLabel: "Source: ",
  deputyTitle: "How a deputy voted",
  deputyIntro:
    "Search by surname or name. The vote on record in each division is shown and, when the name identifies a single person, a link to their profile.",
  missingTitle: "What this page does not say",
  passedTitle: "Whether it passed",
  passedText:
    "The data this site uses do not include the result of each division, and counting votes is not enough: an organic law needs an absolute majority of the Congreso. The official record of each division is linked in its section.",
  amendmentsTitle: "Amendments",
  amendmentsText:
    "Votes on the bill as a whole, leave to proceed, non-legislative motions and motions are included. Votes on amendments one by one are not included.",
  nobodyTitle: "Nobody's stance",
  nobodyText:
    "A deputy appears only with the vote on record. Nobody's stance is inferred from their party or their group.",
  otherTopics: "Other topics: ",
  currentSite: "On the current site: ",
  legislature: (l) => `${l} legislature.`,
  tied: (blocs, groups) => `Yes and no tied, and ${blocs} of the ${groups} groups voted as a bloc.`,
  gap: (diff, blocs, groups) =>
    `There was a gap of ${diff} ${diff === 1 ? "vote" : "votes"} between yes and no, and ${blocs} of the ${groups} groups voted as a bloc.`,
  whatTitle: "What was voted, according to the record",
  kindTitle: "What kind of vote it is",
  hasEffect: "It has legal effect.",
  noEffect: "It has no legal effect.",
  officialRecord: "Official record of the division",
  sessionNumber: (session, number) => `, session ${session}, division ${number}`,
  lawText: "Text of the law in the BOE",
  groupsTitle: "How each group voted",
  severalParties: (parties) => `, group of several parties (${parties})`,
  groupUnknown: ", group not in the registry",
  groupNote:
    "As a bloc: every member of the group who voted did so in the same direction. A parliamentary group is not a party: when a single party makes it up, its name links to that party's profile and to what it receives. That the vote and the money are on the same site does not mean that one explains the other.",
  divisionSource: (date) => `Source: record of the roll-call vote of the Congreso de los Diputados, ${date}.`,
};

const ca: Copy = {
  metaTitle: (label) => `${label}: com va votar el Congrés`,
  metaFallback: "Tema",
  relatedLgtbi: "Allò que publiquen les organitzacions LGBTI",
  relatedAll: "totes les votacions",
  and: " i ",
  crumb: "Temes",
  intro:
    "Com va votar el Congrés en les votacions nominals sobre aquest tema que segueix aquesta web, de la més antiga a la més recent. Cada vot és un vot emès i publicat a l'acta oficial, no una postura atribuïda.",
  lineTitle: "Les votacions, per ordre",
  lineFinding: (n, lowerLabel, span, binding, firstBinding) => {
    const bindingText =
      binding === 0
        ? "cap té efecte legal"
        : binding === n && n > 1
          ? "totes tenen efecte legal"
          : `${binding} d'elles ${binding === 1 ? "té" : "tenen"} efecte legal`;
    return n === 1
      ? `Aquesta web segueix 1 votació sobre ${lowerLabel}, ${span}, i ${firstBinding ? "té" : "no té"} efecte legal.`
      : `Aquesta web segueix ${n} votacions sobre ${lowerLabel} ${span}, i ${bindingText}.`;
  },
  noLegalEffect: ", sense efecte legal",
  lineNote:
    "Una estació per votació. Totes consten a l'acta oficial, per això la línia és contínua i els punts són plens.",
  sourceLabel: "Font: ",
  deputyTitle: "Com va votar un diputat",
  deputyIntro:
    "Cerca per cognom o nom. Es mostra el vot que consta a cada acta i, quan el nom identifica una sola persona, l'enllaç a la seva fitxa.",
  missingTitle: "El que aquesta pàgina no diu",
  passedTitle: "Si va tirar endavant",
  passedText:
    "Les dades que fa servir aquesta web no inclouen el resultat de cada votació, i comptar vots no n'hi ha prou: una llei orgànica necessita la majoria absoluta del Congrés. L'acta oficial de cada votació està enllaçada al seu apartat.",
  amendmentsTitle: "Les esmenes",
  amendmentsText:
    "Es recullen votacions de conjunt, preses en consideració, proposicions no de llei i mocions. Les votacions d'esmenes una a una no es recullen.",
  nobodyTitle: "La postura de ningú",
  nobodyText:
    "Un diputat apareix només amb el vot que consta a l'acta. No es dedueix la postura de ningú a partir del seu partit o del seu grup.",
  otherTopics: "Altres temes: ",
  currentSite: "Al lloc actual: ",
  legislature: (l) => `${l} legislatura.`,
  tied: (blocs, groups) => `El sí i el no van empatar, i ${blocs} dels ${groups} grups van votar en bloc.`,
  gap: (diff, blocs, groups) =>
    `Hi va haver ${diff} ${diff === 1 ? "vot" : "vots"} de diferència entre el sí i el no, i ${blocs} dels ${groups} grups van votar en bloc.`,
  whatTitle: "Què es va votar, segons l'acta",
  kindTitle: "Quin tipus de votació és",
  hasEffect: "Té efecte legal.",
  noEffect: "No té efecte legal.",
  officialRecord: "Acta oficial de la votació",
  sessionNumber: (session, number) => `, sessió ${session}, votació ${number}`,
  lawText: "Text de la llei al BOE",
  groupsTitle: "Com va votar cada grup",
  severalParties: (parties) => `, grup de diversos partits (${parties})`,
  groupUnknown: ", grup no identificat al registre",
  groupNote:
    "En bloc: tots els diputats del grup que van votar ho van fer en el mateix sentit. Un grup parlamentari no és un partit: quan el forma un de sol, el seu nom enllaça a la fitxa d'aquest partit i a allò que rep. Que el vot i els diners siguin a la mateixa web no vol dir que l'un expliqui l'altre.",
  divisionSource: (date) => `Font: acta de votació nominal del Congrés dels Diputats, ${date}.`,
};

export const COPY: Record<Locale, Copy> = { es, en, ca };
