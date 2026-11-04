import type { Locale } from "@/lib/locales";

/**
 * Strings of the prototype's person page. Interpolated sentences take
 * already-formatted values. Names, organisations, declared concepts, vote
 * titles and the text the declarant wrote are data and are never translated.
 */
const es = {
  people: "Personas",
  incomeGroup: {
    salary: "Rendimientos del trabajo",
    dividends: "Dividendos y participaciones",
    interest: "Intereses",
    other: "Otras rentas",
  } as Record<string, string>,
  ballot: {
    Sí: "A favor",
    No: "En contra",
    Abstención: "Abstención",
  } as Record<string, string>,
  noVote: "No votó",
  noConcept: "sin concepto",
  noConceptCap: "Sin concepto",
  noDescription: "Sin descripción",
  noName: "Sin nombre",
  illegible: "Ilegible",

  incomeFindingOne: (year: number | null, concept: string, amount: string) =>
    `Declaró un solo ingreso en ${year}: ${concept}, ${amount}.`,
  incomeFindingMany: (
    total: string,
    year: number | null,
    concept: string,
    share: string,
  ) =>
    `Declaró ${total} de ingresos en ${year}. El mayor, ${concept}, es el ${share} del total.`,
  voteFinding: (same: number, total: number) =>
    `Votó como la mayoría de su grupo en ${same} de las ${total} votaciones que sigue esta web.`,

  salaryLabel: "Sueldo público",
  notPublished: "No publicado",
  salaryPerYear: "al año, según el Registro de Altos Cargos",
  salaryNotPublished: "El registro no publica sueldo para este cargo",
  salaryNotInRegister: "No consta en el Registro de Altos Cargos",
  incomeLabel: "Ingresos declarados",
  noDeclaration: "Sin declaración",
  incomeNote: (year: number | null) =>
    `en ${year}, sin contar el sueldo de diputado`,
  notTranscribed: "transcrita todavía",
  financialLabel: "Cuentas, valores y otros bienes",
  nothingDeclared: "Nada declarado",
  propertyNote: (n: number, nFmt: string) =>
    `y ${nFmt} inmuebles, que el formulario no valora`,
  debtsLabel: "Deudas pendientes",
  noDebts: "Ninguna",
  debtsNote: "préstamos, saldo pendiente",
  noSum:
    "Las cifras no se suman entre sí: el formulario no da valor a los inmuebles, y un total con ellos fuera sería un patrimonio inventado.",

  incomeTitle: "De dónde le viene el dinero",
  incomeCaption: (year: number | null) => `Ingresos declarados en ${year}`,
  colConcept: "Concepto, como lo escribió",
  colType: "Tipo",
  colAmount: "Importe",
  incomeSourcePre: (date: string) =>
    `Fuente: declaración de bienes y rentas registrada en el Congreso el ${date} (`,
  originalDoc: "documento original",
  incomeSourcePost:
    "). Ingresos del año anterior; el formulario excluye el sueldo de diputado.",

  assetsTitle: "Lo que declara poseer",
  property: "Inmuebles",
  since: (acquired: string) => `desde ${acquired}`,
  noProperty: "No declara inmuebles.",
  financialTitle: "Cuentas, valores y otros bienes",
  financialCaption: "Cuentas, valores y otros bienes declarados",
  accounts: "Cuentas",
  securitiesSr: " (valores)",
  holdings: "Sociedades participadas por sus sociedades: ",
  debtsTitle: "Deudas",
  verifiedPre: (rtve: boolean) =>
    `Transcrito del escaneo y comprobado ${
      rtve
        ? "contra la transcripción independiente de RTVE"
        : "con una segunda lectura independiente"
    }.`,
  viewOriginal: "Ver el documento original",

  connectionsTitle: "Con quién aparece en el registro",
  connectionsIntro:
    "Organizaciones con las que esta persona consta en un registro oficial. Que aparezcan juntas no dice nada sobre por qué.",
  kindParty: "Su partido",
  partyMoney: (amount: string) =>
    `El partido recibió ${amount} en subvenciones del Estado. Es dinero del partido, no de esta persona.`,
  kindSecurities: "Declara valores",
  roleIn: (role: string) => `${role} en`,
  worked: (period: string | null) =>
    period ? `Trabajó, ${period}` : "Trabajó",
  kindContributes: "Aporta a",
  kindGift: "Regalo recibido",
  giftFrom: (benefactor: string) => `De ${benefactor}`,
  noConnection:
    "No consta ninguna conexión en los registros que usa esta web.",
  connectionsSource:
    "Fuentes: declaración de bienes y declaración de intereses económicos (Congreso), patronatos de las fundaciones (Tribunal de Cuentas y registros de fundaciones), Registro de Altos Cargos.",

  votesTitle: "Cómo votó",
  votesCaption: "Su voto en cada votación seguida",
  colVote: "Votación",
  colTheirVote: "Su voto",
  colTheirGroup: "Su grupo",
  noLegalEffect: ". Sin efecto legal",
  groupTally: (si: number, no: number, abst: number) =>
    `${si} a favor, ${no} en contra, ${abst} abst.`,
  votesSource: "Fuente: actas de votación nominal del Congreso de los Diputados.",

  citeTitle: "Cómo citar esta ficha",
  cite: (name: string, date: string) =>
    `Siguiendo el Dinero, «${name}», consultado el ${date}.`,
  citeDeclaration: (date: string, url: string) =>
    ` Declaración de bienes registrada en el Congreso el ${date}: ${url}`,

  queueDeputy:
    "Su declaración de bienes está en la cola de transcripción: se lee del escaneo oficial y se comprueba antes de publicarse.",
  queueOther:
    "Las declaraciones de bienes que publica esta web son las de los diputados del Congreso. Para este cargo solo consta el Registro de Altos Cargos.",
};

type Copy = typeof es;

const en: Copy = {
  people: "People",
  incomeGroup: {
    salary: "Earnings from work",
    dividends: "Dividends and shareholdings",
    interest: "Interest",
    other: "Other income",
  },
  ballot: {
    Sí: "In favour",
    No: "Against",
    Abstención: "Abstention",
  },
  noVote: "Did not vote",
  noConcept: "no description",
  noConceptCap: "No description",
  noDescription: "No description",
  noName: "No name",
  illegible: "Illegible",

  incomeFindingOne: (year, concept, amount) =>
    `Declared a single income item in ${year}: ${concept}, ${amount}.`,
  incomeFindingMany: (total, year, concept, share) =>
    `Declared ${total} of income in ${year}. The largest, ${concept}, is ${share} of the total.`,
  voteFinding: (same, total) =>
    `Voted the same way as the majority of their group in ${same} of the ${total} divisions this site tracks.`,

  salaryLabel: "Public salary",
  notPublished: "Not published",
  salaryPerYear: "a year, according to the Register of Senior Officials",
  salaryNotPublished: "The register publishes no salary for this post",
  salaryNotInRegister: "Not on record in the Register of Senior Officials",
  incomeLabel: "Declared income",
  noDeclaration: "No declaration",
  incomeNote: (year) => `in ${year}, not counting the deputy's salary`,
  notTranscribed: "not yet transcribed",
  financialLabel: "Accounts, securities and other assets",
  nothingDeclared: "Nothing declared",
  propertyNote: (n, nFmt) =>
    `and ${nFmt} ${n === 1 ? "property" : "properties"}, which the form does not value`,
  debtsLabel: "Outstanding debts",
  noDebts: "None",
  debtsNote: "loans, outstanding balance",
  noSum:
    "The figures are not added together: the form gives no value to property, and a total that left it out would be an invented net worth.",

  incomeTitle: "Where the money comes from",
  incomeCaption: (year) => `Income declared in ${year}`,
  colConcept: "Item, as they wrote it",
  colType: "Type",
  colAmount: "Amount",
  incomeSourcePre: (date) =>
    `Source: declaration of assets and income registered with the Congreso on ${date} (`,
  originalDoc: "original document",
  incomeSourcePost:
    "). Income for the previous year; the form excludes the deputy's salary.",

  assetsTitle: "What they declare owning",
  property: "Property",
  since: (acquired) => `since ${acquired}`,
  noProperty: "Declares no property.",
  financialTitle: "Accounts, securities and other assets",
  financialCaption: "Accounts, securities and other assets declared",
  accounts: "Accounts",
  securitiesSr: " (securities)",
  holdings: "Companies held by their companies: ",
  debtsTitle: "Debts",
  verifiedPre: (rtve) =>
    `Transcribed from the scan and checked ${
      rtve
        ? "against the independent transcription by RTVE"
        : "with a second, independent reading"
    }.`,
  viewOriginal: "View the original document",

  connectionsTitle: "Who they appear with on the record",
  connectionsIntro:
    "Organisations with which this person is on record in an official register. That they appear together says nothing about why.",
  kindParty: "Their party",
  partyMoney: (amount) =>
    `The party received ${amount} in State subsidies. It is the party's money, not this person's.`,
  kindSecurities: "Declares securities",
  roleIn: (role) => `${role} at`,
  worked: (period) => (period ? `Worked, ${period}` : "Worked"),
  kindContributes: "Contributes to",
  kindGift: "Gift received",
  giftFrom: (benefactor) => `From ${benefactor}`,
  noConnection:
    "No connection is on record in the registers this site uses.",
  connectionsSource:
    "Sources: declaration of assets and declaration of economic interests (Congreso), boards of the foundations (Court of Auditors and foundation registers), Register of Senior Officials.",

  votesTitle: "How they voted",
  votesCaption: "Their vote in each division tracked",
  colVote: "Division",
  colTheirVote: "Their vote",
  colTheirGroup: "Their group",
  noLegalEffect: ". No legal effect",
  groupTally: (si, no, abst) =>
    `${si} in favour, ${no} against, ${abst} abst.`,
  votesSource: "Source: roll-call records of the Congress of Deputies.",

  citeTitle: "How to cite this profile",
  cite: (name, date) => `Siguiendo el Dinero, “${name}”, consulted on ${date}.`,
  citeDeclaration: (date, url) =>
    ` Declaration of assets registered with the Congreso on ${date}: ${url}`,

  queueDeputy:
    "Their declaration of assets is in the transcription queue: it is read from the official scan and checked before it is published.",
  queueOther:
    "The declarations of assets this site publishes are those of deputies in the Congreso. For this post only the Register of Senior Officials is on record.",
};

const ca: Copy = {
  people: "Persones",
  incomeGroup: {
    salary: "Rendiments del treball",
    dividends: "Dividends i participacions",
    interest: "Interessos",
    other: "Altres rendes",
  },
  ballot: {
    Sí: "A favor",
    No: "En contra",
    Abstención: "Abstenció",
  },
  noVote: "No va votar",
  noConcept: "sense concepte",
  noConceptCap: "Sense concepte",
  noDescription: "Sense descripció",
  noName: "Sense nom",
  illegible: "Il·legible",

  incomeFindingOne: (year, concept, amount) =>
    `Va declarar un sol ingrés el ${year}: ${concept}, ${amount}.`,
  incomeFindingMany: (total, year, concept, share) =>
    `Va declarar ${total} d’ingressos el ${year}. El més gran, ${concept}, és el ${share} del total.`,
  voteFinding: (same, total) =>
    `Va votar igual que la majoria del seu grup en ${same} de les ${total} votacions que segueix aquest web.`,

  salaryLabel: "Sou públic",
  notPublished: "No publicat",
  salaryPerYear: "a l’any, segons el Registre d’Alts Càrrecs",
  salaryNotPublished: "El registre no publica sou per a aquest càrrec",
  salaryNotInRegister: "No consta al Registre d’Alts Càrrecs",
  incomeLabel: "Ingressos declarats",
  noDeclaration: "Sense declaració",
  incomeNote: (year) => `el ${year}, sense comptar el sou de diputat`,
  notTranscribed: "encara no transcrita",
  financialLabel: "Comptes, valors i altres béns",
  nothingDeclared: "Res declarat",
  propertyNote: (n, nFmt) =>
    `i ${nFmt} ${n === 1 ? "immoble" : "immobles"}, que el formulari no valora`,
  debtsLabel: "Deutes pendents",
  noDebts: "Cap",
  debtsNote: "préstecs, saldo pendent",
  noSum:
    "Les xifres no se sumen entre elles: el formulari no dona valor als immobles, i un total amb ells fora seria un patrimoni inventat.",

  incomeTitle: "D’on li ve el diner",
  incomeCaption: (year) => `Ingressos declarats el ${year}`,
  colConcept: "Concepte, tal com el va escriure",
  colType: "Tipus",
  colAmount: "Import",
  incomeSourcePre: (date) =>
    `Font: declaració de béns i rendes registrada al Congrés el ${date} (`,
  originalDoc: "document original",
  incomeSourcePost:
    "). Ingressos de l’any anterior; el formulari exclou el sou de diputat.",

  assetsTitle: "El que declara posseir",
  property: "Immobles",
  since: (acquired) => `des de ${acquired}`,
  noProperty: "No declara immobles.",
  financialTitle: "Comptes, valors i altres béns",
  financialCaption: "Comptes, valors i altres béns declarats",
  accounts: "Comptes",
  securitiesSr: " (valors)",
  holdings: "Societats participades per les seves societats: ",
  debtsTitle: "Deutes",
  verifiedPre: (rtve) =>
    `Transcrit de l’escaneig i comprovat ${
      rtve
        ? "amb la transcripció independent de RTVE"
        : "amb una segona lectura independent"
    }.`,
  viewOriginal: "Veure el document original",

  connectionsTitle: "Amb qui apareix al registre",
  connectionsIntro:
    "Organitzacions amb què aquesta persona consta en un registre oficial. Que apareguin juntes no diu res sobre el perquè.",
  kindParty: "El seu partit",
  partyMoney: (amount) =>
    `El partit va rebre ${amount} en subvencions de l’Estat. És diner del partit, no d’aquesta persona.`,
  kindSecurities: "Declara valors",
  roleIn: (role) => `${role} a`,
  worked: (period) => (period ? `Va treballar, ${period}` : "Va treballar"),
  kindContributes: "Aporta a",
  kindGift: "Regal rebut",
  giftFrom: (benefactor) => `De ${benefactor}`,
  noConnection:
    "No consta cap connexió als registres que fa servir aquest web.",
  connectionsSource:
    "Fonts: declaració de béns i declaració d’interessos econòmics (Congrés), patronats de les fundacions (Tribunal de Comptes i registres de fundacions), Registre d’Alts Càrrecs.",

  votesTitle: "Com va votar",
  votesCaption: "El seu vot en cada votació seguida",
  colVote: "Votació",
  colTheirVote: "El seu vot",
  colTheirGroup: "El seu grup",
  noLegalEffect: ". Sense efecte legal",
  groupTally: (si, no, abst) =>
    `${si} a favor, ${no} en contra, ${abst} abst.`,
  votesSource: "Font: actes de votació nominal del Congrés dels Diputats.",

  citeTitle: "Com citar aquesta fitxa",
  cite: (name, date) => `Seguint el Diner, «${name}», consultat el ${date}.`,
  citeDeclaration: (date, url) =>
    ` Declaració de béns registrada al Congrés el ${date}: ${url}`,

  queueDeputy:
    "La seva declaració de béns és a la cua de transcripció: es llegeix de l’escaneig oficial i es comprova abans de publicar-se.",
  queueOther:
    "Les declaracions de béns que publica aquest web són les dels diputats del Congrés. Per a aquest càrrec només consta el Registre d’Alts Càrrecs.",
};

export const COPY: Record<Locale, Copy> = { es, en, ca };
