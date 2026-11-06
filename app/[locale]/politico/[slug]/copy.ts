import type { Locale } from "@/lib/locales";

/**
 * Strings of the prototype's person page. Interpolated sentences take
 * already-formatted values. Names, organisations, declared concepts, vote
 * titles and the text the declarant wrote are data and are never translated.
 */
const es = {
  people: "Personas",
  photo: "Foto",
  payTitle: "Su sueldo público",
  payPerYear: "brutos al año, según el Registro de Altos Cargos.",
  votesNote:
    "Solo las votaciones nominales que sigue esta web, cada una con su acta oficial. Un hueco es una votación en cuya acta no figura, nunca la postura de su grupo.",
  blueskyTitle: "En Bluesky",
  newsTitle: "En las noticias",
  declarationTitle: "Intereses económicos declarados",
  incomeGroup: {
    salary: "Rendimientos del trabajo",
    dividends: "Dividendos y participaciones",
    interest: "Intereses",
    other: "Otras rentas",
  } as Record<string, string>,
  ballot: {
    Sí: "Votó sí",
    No: "Votó no",
    Abstención: "Se abstuvo",
  } as Record<string, string>,
  noVote: "No votó",
  noConcept: "sin concepto",
  noConceptCap: "Sin concepto",
  noDescription: "Sin descripción",
  noName: "Sin nombre",

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
  debtsTitle: "Deudas",
  viewOriginal: "Ver el documento original",

  connectionsTitle: "Con quién aparece en el registro",
  connectionsIntro:
    "Organizaciones con las que esta persona consta en un registro oficial. Que aparezcan juntas no dice nada sobre por qué.",
  kindParty: "Su partido",
  partyMoney: (amount: string, share: string) =>
    `El partido recibió ${amount} en subvenciones del Estado, el ${share} del total nacional. Es dinero del partido, no de esta persona.`,
  partyDonations: (amount: string, year: number) =>
    `En ${year} declaró ${amount} en donaciones de particulares, según el Tribunal de Cuentas.`,
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
    `${si} sí, ${no} no, ${abst} abst.`,

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
  photo: "Photo",
  payTitle: "Their public salary",
  payPerYear: "gross a year, according to the Register of Senior Officials.",
  votesNote:
    "Only the roll-call divisions this site tracks, each with its official record. A gap is a division whose record does not include them, never their group's position.",
  blueskyTitle: "On Bluesky",
  newsTitle: "In the news",
  declarationTitle: "Declared economic interests",
  incomeGroup: {
    salary: "Earnings from work",
    dividends: "Dividends and shareholdings",
    interest: "Interest",
    other: "Other income",
  },
  ballot: {
    Sí: "Voted Yes",
    No: "Voted No",
    Abstención: "Abstained",
  },
  noVote: "Did not vote",
  noConcept: "no description",
  noConceptCap: "No description",
  noDescription: "No description",
  noName: "No name",

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
  debtsTitle: "Debts",
  viewOriginal: "View the original document",

  connectionsTitle: "Who they appear with on the record",
  connectionsIntro:
    "Organisations with which this person is on record in an official register. That they appear together says nothing about why.",
  kindParty: "Their party",
  partyMoney: (amount, share) =>
    `The party received ${amount} in State subsidies, ${share} of the national total. It is the party's money, not this person's.`,
  partyDonations: (amount, year) =>
    `In ${year} it declared ${amount} in donations from individuals, according to the Court of Audit.`,
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
    `${si} Yes, ${no} No, ${abst} abst.`,

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
  photo: "Foto",
  payTitle: "El seu sou públic",
  payPerYear: "bruts l’any, segons el Registre d’Alts Càrrecs.",
  votesNote:
    "Només les votacions nominals que segueix aquest web, cadascuna amb la seva acta oficial. Un buit és una votació en l’acta de la qual no figura, mai la posició del seu grup.",
  blueskyTitle: "A Bluesky",
  newsTitle: "A les notícies",
  declarationTitle: "Interessos econòmics declarats",
  incomeGroup: {
    salary: "Rendiments del treball",
    dividends: "Dividends i participacions",
    interest: "Interessos",
    other: "Altres rendes",
  },
  ballot: {
    Sí: "Va votar sí",
    No: "Va votar no",
    Abstención: "Es va abstenir",
  },
  noVote: "No va votar",
  noConcept: "sense concepte",
  noConceptCap: "Sense concepte",
  noDescription: "Sense descripció",
  noName: "Sense nom",

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
  debtsTitle: "Deutes",
  viewOriginal: "Veure el document original",

  connectionsTitle: "Amb qui apareix al registre",
  connectionsIntro:
    "Organitzacions amb què aquesta persona consta en un registre oficial. Que apareguin juntes no diu res sobre el perquè.",
  kindParty: "El seu partit",
  partyMoney: (amount, share) =>
    `El partit va rebre ${amount} en subvencions de l’Estat, el ${share} del total nacional. És diner del partit, no d’aquesta persona.`,
  partyDonations: (amount, year) =>
    `El ${year} va declarar ${amount} en donacions de particulars, segons el Tribunal de Comptes.`,
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
    `${si} sí, ${no} no, ${abst} abst.`,

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
