import type { Locale } from "@/lib/locales";

const es = {
  metaTitle: (label: string) => `${label}: cómo votó el Congreso`,
  metaFallback: "Tema",
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
  orgTitle: "Lo que publican las organizaciones LGTBI",
  orgJuxta: "Esta sección va al lado de las votaciones, no las explica ni se conecta con ellas: no dice qué votó nadie ni qué piensa nadie de lo votado.",
  orgIntro: "El resto de esta web mira al Estado: sus subvenciones, sus auditorías, sus votaciones registradas. Esta sección hace lo contrario y recoge lo que publican las propias organizaciones de derechos LGTBI, con su nombre delante de cada pieza.",
  orgsTitle: "Publicado por las organizaciones",
  orgsNote: "Ocho organizaciones, cada una a través de su propio canal. Van primero porque son fuente directa: hablan de sí mismas y de su trabajo, no de segunda mano.",
  mediaTitle: "Cobertura en medios",
  mediaNote: "Medios que cubren estos temas de forma continuada. Se muestran aparte para que quede claro qué es fuente directa y qué es cobertura.",
  directoryTitle: "De dónde sale todo esto",
  directoryNote: "El registro completo de canales que lee esta sección. Se enlaza cada organización para poder ir a la fuente y no sólo a lo que publicó esta quincena.",
  kindOrg: "Organizaciones",
  kindMedia: "Medios",
  empty: "Ningún canal ha devuelto piezas recientes. No es una afirmación sobre la actualidad: es un fallo de lectura, y se corrige solo cuando los canales responden.",
  droppedNote: "Canales que no respondieron en esta carga:",
  caveatLabel: "Qué hay que saber",
  caveat: "Esta web no edita, resume ni reescribe estas piezas: muestra el titular, la fecha y el enlace al original. Las imágenes son las que publica cada canal y se sirven a través de este sitio, no directamente desde el servidor de la organización, para no exponer la IP de quien lee. El orden es por fecha, con las fuentes en el idioma de la página primero.",
  methodLink: "Cómo se eligieron estos canales, y cuáles se descartaron",
  orgSource: "Fuente: los canales (RSS) que publica cada organización y cada medio, enlazados abajo.",
  feedTable: "Canales leídos por esta sección",
  // Housing in the news (housing topic only)
  housingTitle: "La vivienda, en las noticias",
  housingIntro:
    "El resto de esta página recoge votaciones registradas. Esta sección recoge lo último de medios de distinto signo, de las radiotelevisiones públicas y de las organizaciones de inquilinas, de afectados por la hipoteca y de personas sin hogar, cada pieza con el nombre de quien la publica.",
  housingJuxta:
    "Esta sección va al lado de las votaciones, no las explica ni se conecta con ellas: no dice qué votó nadie ni qué piensa nadie de lo votado.",
  housingOrgsNote: (n: string) =>
    `${n} organizaciones de vivienda, cada una a través de su propio canal. Van primero porque son fuente directa: hablan con su propia voz, no de segunda mano.`,
  housingMediaNote:
    "Las secciones de vivienda de medios de distinto signo y de las radiotelevisiones públicas. Se muestran aparte para que quede claro qué es fuente directa y qué es cobertura.",
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
  orgTitle: "What LGBTI rights organisations publish",
  orgJuxta: "This section sits beside the votes. It does not explain them or connect to them: it says nothing about what anyone voted or what anyone thinks of what was voted.",
  orgIntro: "The rest of this site looks at the state: its subsidies, its audits, its recorded votes. This section does the opposite and carries what the LGBTQ+ rights organisations publish themselves, with their name in front of every piece.",
  orgsTitle: "Published by the organisations",
  orgsNote: "Eight organisations, each through its own channel. They come first because they are first-hand: they are writing about themselves and their own work, not relaying it.",
  mediaTitle: "Coverage in the press",
  mediaNote: "Outlets that cover these subjects continuously. Shown separately so it stays clear what is first-hand and what is coverage.",
  directoryTitle: "Where all of this comes from",
  directoryNote: "The full registry of channels this section reads. Each organisation is linked so you can go to the source, not only to whatever it published this fortnight.",
  kindOrg: "Organisations",
  kindMedia: "Press",
  empty: "No channel returned anything recent. That is not a statement about the news: it is a read failure, and it clears itself when the channels answer.",
  droppedNote: "Channels that did not answer on this load:",
  caveatLabel: "What to know",
  caveat: "This site does not edit, summarise or rewrite these pieces: it shows the headline, the date and a link to the original. The images are the ones each channel publishes, served through this site rather than straight from the organisation's server, so a reader's IP address is not exposed. Order is by date, with sources in the page's language first.",
  methodLink: "How these channels were chosen, and which were rejected",
  orgSource: "Source: the feeds (RSS) each organisation and outlet publishes, linked below.",
  feedTable: "Channels this section reads",
  housingTitle: "Housing, in the news",
  housingIntro:
    "The rest of this page carries recorded votes. This section carries the latest from outlets across the spectrum, the public broadcasters, and tenants', mortgage-holders' and homelessness organisations, each piece named with its publisher.",
  housingJuxta:
    "This section sits beside the votes. It does not explain them or connect to them: it says nothing about what anyone voted or what anyone thinks of what was voted.",
  housingOrgsNote: (n) =>
    `${n} housing organisations, each through its own channel. They come first because they are first-hand: they speak in their own voice, not relaying it.`,
  housingMediaNote:
    "The housing sections of outlets across the spectrum and of the public broadcasters. Shown separately so it stays clear what is first-hand and what is coverage.",
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
  and: " i ",
  crumb: "Temes",
  intro:
    "Com va votar el Congrés en les votacions nominals sobre aquest tema que segueix aquest web, de la més antiga a la més recent. Cada vot és un vot emès i publicat a l'acta oficial, no una postura atribuïda.",
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
    "Les dades que fa servir aquest web no inclouen el resultat de cada votació, i comptar vots no n'hi ha prou: una llei orgànica necessita la majoria absoluta del Congrés. L'acta oficial de cada votació està enllaçada al seu apartat.",
  amendmentsTitle: "Les esmenes",
  amendmentsText:
    "Es recullen votacions de conjunt, preses en consideració, proposicions no de llei i mocions. Les votacions d'esmenes una a una no es recullen.",
  nobodyTitle: "La postura de ningú",
  nobodyText:
    "Un diputat apareix només amb el vot que consta a l'acta. No es dedueix la postura de ningú a partir del seu partit o del seu grup.",
  otherTopics: "Altres temes: ",
  orgTitle: "El que publiquen les organitzacions LGTBI",
  orgJuxta: "Aquesta secció va al costat de les votacions, no les explica ni s'hi connecta: no diu què va votar ningú ni què pensa ningú del que es va votar.",
  orgIntro: "La resta d'aquest web mira l'Estat: les seves subvencions, les seves auditories, les seves votacions registrades. Aquesta secció fa el contrari i recull el que publiquen les mateixes organitzacions de drets LGTBI, amb el seu nom davant de cada peça.",
  orgsTitle: "Publicat per les organitzacions",
  orgsNote: "Vuit organitzacions, cada una a través del seu propi canal. Van primer perquè són font directa: parlen d'elles mateixes i de la seva feina, no de segona mà.",
  mediaTitle: "Cobertura als mitjans",
  mediaNote: "Mitjans que cobreixen aquests temes de manera continuada. Es mostren a part perquè quedi clar què és font directa i què és cobertura.",
  directoryTitle: "D'on surt tot això",
  directoryNote: "El registre complet de canals que llegeix aquesta secció. S'enllaça cada organització per poder anar a la font i no només al que va publicar aquesta quinzena.",
  kindOrg: "Organitzacions",
  kindMedia: "Mitjans",
  empty: "Cap canal ha retornat peces recents. No és una afirmació sobre l'actualitat: és una fallada de lectura, i es corregeix sola quan els canals responen.",
  droppedNote: "Canals que no van respondre en aquesta càrrega:",
  caveatLabel: "Què cal saber",
  caveat: "Aquest web no edita, resumeix ni reescriu aquestes peces: mostra el titular, la data i l'enllaç a l'original. Les imatges són les que publica cada canal i se serveixen a través d'aquest lloc, no directament des del servidor de l'organització, per no exposar la IP de qui llegeix. L'ordre és per data, amb les fonts en l'idioma de la pàgina primer.",
  methodLink: "Com es van triar aquests canals, i quins es van descartar",
  orgSource: "Font: els canals (RSS) que publica cada organització i cada mitjà, enllaçats a sota.",
  feedTable: "Canals que llegeix aquesta secció",
  housingTitle: "L'habitatge, a les notícies",
  housingIntro:
    "La resta d'aquesta pàgina recull votacions registrades. Aquesta secció recull el més recent de mitjans de diferent signe, de les ràdios i televisions públiques i de les organitzacions de llogateres, d'afectades per la hipoteca i de persones sense llar, cada peça amb el nom de qui la publica.",
  housingJuxta:
    "Aquesta secció va al costat de les votacions, no les explica ni s'hi connecta: no diu què va votar ningú ni què pensa ningú del que es va votar.",
  housingOrgsNote: (n) =>
    `${n} organitzacions d'habitatge, cada una a través del seu propi canal. Van primer perquè són font directa: parlen amb la seva pròpia veu, no de segona mà.`,
  housingMediaNote:
    "Les seccions d'habitatge de mitjans de diferent signe i de les ràdios i televisions públiques. Es mostren a part perquè quedi clar què és font directa i què és cobertura.",
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
