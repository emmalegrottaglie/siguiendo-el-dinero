import type { Locale } from "@/lib/locales";

/**
 * Strings for the prototype's frame (layout) and front page.
 *
 * Interpolated sentences take already-formatted figures. Catalan puts the
 * article before a percentage ("el 54 %", "l'11 %"), so the Catalan sentences
 * build it with `elCa()` rather than hard-coding "el".
 */

/** Catalan article for a formatted percentage: "l'" before a vowel sound (1, 11), else "el ". */
const elCa = (p: string) => (/^(1([^\d]|$)|11([^\d]|$))/.test(p) ? `l'${p}` : `el ${p}`);
const capCa = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const es = {
  // Layout
  navLabel: "Secciones",
  nav: {
    parties: "Partidos",
    people: "Personas",
    territories: "Territorios",
    topics: "Temas",
    method: "Datos y método",
  },
  banner: "Prototipo del nuevo diseño.",
  bannerLink: "Ver el sitio actual",
  siteName: "Siguiendo el Dinero",
  footerSources:
    "Cada cifra lleva su fuente: el Tribunal de Cuentas, el Congreso de los Diputados, la Base de Datos Nacional de Subvenciones y el Registro de Altos Cargos.",
  footerJuxta:
    "Los datos se publican juntos para poder consultarlos. Que dos datos aparezcan uno al lado del otro no significa que uno explique el otro.",
  footerLink: "Cómo se hizo",

  // Shared
  sourceLabel: "Fuente",
  yearsAnd: (a: string, b: string) => `${a} y ${b}`,
  thousandsEur: (n: string) => `${n} mil €`,
  under1000: "Menos de 1.000 €",
  from1000to10000: "De 1.000 a 10.000 €",
  over10000: "Más de 10.000 €",

  // Hero
  h1: "Sigue el dinero que entra en la política española",
  lede: "Por dónde llega, con cifras oficiales y su fuente: lo que da el Estado, lo que donan particulares y lo que reciben las fundaciones de los partidos. Y quién aparece en esas rutas: los cargos que se sientan en los patronatos y lo que los diputados declaran poseer.",
  searchLabel: "Busca una persona, un partido o una provincia",
  searchPlaceholder: "Una persona, un partido o una provincia",
  searchButton: "Buscar",
  forExample: "Por ejemplo:",

  // Routes
  routesTitle: "Las tres rutas",
  routesIntro:
    "Cada ruta tiene su propia ley y su propia fuente, y sus cifras son de años distintos, así que no se suman.",
  stateTitle: "Del Estado a los partidos",
  stateFigureNote: "en subvenciones registradas, acumulado",
  stateFinding: (list: string, pct: string) => `${list} recibieron el ${pct} de todo lo concedido.`,
  othersLabel: (n: number) => `Los otros ${n}`,
  stateLink: "Ver el reparto partido a partido",
  stateSource: "Base de Datos Nacional de Subvenciones, actualizada a diario.",
  donorsTitle: "De particulares a los partidos",
  donorsFigureNote: (exact: string, donors: string, year: number) => `${exact} de ${donors} donantes, en ${year}`,
  donorsFinding: (donorPct: string, moneyPct: string) =>
    `El ${donorPct} de los donantes dio menos de 1.000 €, y entre todos aportaron el ${moneyPct} del dinero.`,
  donorsLink: "Ver las donaciones por partido",
  donorsSource:
    "Tribunal de Cuentas, informe nº 1.573 (ejercicio 2020). Las empresas no pueden donar a los partidos, y el informe no da nombres de donantes.",
  foundationsTitle: "Hacia las fundaciones de los partidos",
  foundationsFigureNote: (span: string) => `en aportaciones, entre ${span}`,
  foundationsFinding: (partyPct: string, companiesPct: string) =>
    `El ${partyPct} lo puso el propio partido. Las empresas, que sí pueden donar a una fundación, aportaron el ${companiesPct}.`,
  foundationsNote: (a: {
    year: number;
    parties: number;
    total: string;
    publicPct: string;
    officeholders: string;
    members: string;
    donors: string;
  }) =>
    `Ese dinero del partido sale a su vez de sus propios ingresos. En ${a.year}, los ${a.parties} partidos fiscalizados ingresaron ${a.total}: el ${a.publicPct} fue dinero público, y de lo privado, ${a.officeholders} lo aportaron sus cargos públicos, ${a.members} sus afiliados y ${a.donors} los donantes. Son años distintos, así que no se restan uno de otro.`,
  foundationsLink: "Ver las fundaciones y quién las gobierna",
  foundationsSource: "Tribunal de Cuentas, informe nº 1.642 (ejercicios 2021 y 2022).",
  fromParty: "Del propio partido",
  fromCompanies: "De empresas",
  fromIndividuals: "De particulares",

  // Who appears
  whoTitle: "Quién aparece en las rutas",
  whoFinding: (n: string) =>
    `${n} personas que se sientan en el patronato de una fundación de partido tienen también un cargo público.`,
  whoBody:
    "Son dos registros oficiales sobre la misma persona, puestos uno al lado del otro. Solo se muestra la coincidencia cuando el nombre identifica a una sola persona y el partido del cargo es el de la fundación.",
  boardCount: (n: number, nStr: string) =>
    `${n === 1 ? "1 persona con cargo público" : `${nStr} personas con cargo público`} en su patronato`,
  declTitle: "Lo que declaran los diputados",
  declFinding: (a: string, b: string) =>
    `${a} de los ${b} diputados con la declaración ya transcrita declaran acciones, bonos u otros valores.`,
  declMeta:
    "Un punto por diputado con declaración de bienes en el Congreso. Se leen del escaneo oficial y se comprueban antes de publicarse.",
  declLink: "Ver lo que declaró cada uno",
  dotSecurities: "declaran acciones, bonos u otros valores",
  dotNoSecurities: "transcritas, sin valores declarados",
  dotPending: "sin transcribir todavía",

  // Topics
  topicsTitle: "Temas",
  topicsIntro:
    "Cómo votó el Congreso en las votaciones que sigue esta web, de la más antigua a la más reciente, con el acta oficial de cada una.",
  topicsSource: "Fuente: actas de votación nominal del Congreso.",

  // Not on record
  gapTitle: "Lo que todavía no consta",
  gapIntro:
    "Lo que falta también es un dato. Esto es lo que las fuentes no publican, o lo que esta web todavía no recoge.",
  campaignTitle: "En qué se gastó la campaña",
  campaignFinding: (pct: string) =>
    `El ${pct} del gasto ordinario que los partidos declararon en las europeas de 2024 está en una sola línea, sin desglosar.`,
  brokenDown: "Desglosado",
  singleLine: "En una sola línea",
  campaignSource: "Fuente: Tribunal de Cuentas, informe nº 1.628.",
  whoDonatedTitle: "Quién donó a los partidos",
  whoDonatedFinding: (n: string, year: number) => `${n} donantes en ${year}, y ninguno con nombre.`,
  donorsCaption: (year: number) => `Donantes a partidos en ${year}, por tramo`,
  colDonor: "Donante",
  colTranche: "Tramo",
  colDonors: "Donantes",
  nameNotPublished: "Nombre no publicado",
  donorsNote:
    "El Tribunal de Cuentas publica las donaciones agrupadas por importe, sin nombres (informe nº 1.573, ejercicio 2020).",
  yearsTitle: "Qué años recoge esta web",
  yearsFinding: (foundationsYear: string, donationsYear: number) =>
    `Las cuentas auditadas llegan con años de retraso: lo más reciente que recoge esta web es ${foundationsYear} para las fundaciones y ${donationsYear} para las donaciones.`,
  rowDonations: "Donaciones a los partidos",
  rowFoundations: "Fundaciones de los partidos",
  today: "hoy",
  yearsKey: "Punto lleno: año con datos auditados en esta web. Punto vacío y línea discontinua: todavía no.",
};

type Copy = typeof es;

const en: Copy = {
  navLabel: "Sections",
  nav: {
    parties: "Parties",
    people: "People",
    territories: "Territories",
    topics: "Topics",
    method: "Data and method",
  },
  banner: "Prototype of the new design.",
  bannerLink: "See the current site",
  siteName: "Following the Money",
  footerSources:
    "Every figure carries its source: the Court of Auditors, the Congress of Deputies, the National Subsidies Database and the Register of Senior Officials.",
  footerJuxta:
    "The data are published together so they can be looked up. That two pieces of data appear side by side does not mean one explains the other.",
  footerLink: "How it was made",

  sourceLabel: "Source",
  yearsAnd: (a, b) => `${a} and ${b}`,
  thousandsEur: (n) => `${n}k €`,
  under1000: "Under €1,000",
  from1000to10000: "€1,000 to €10,000",
  over10000: "Over €10,000",

  h1: "Follow the money that goes into Spanish politics",
  lede: "Where it comes from, with official figures and their source: what the State gives, what individuals donate and what the parties' foundations receive. And who appears on those routes: the officeholders who sit on the boards and what deputies declare they own.",
  searchLabel: "Search for a person, a party or a province",
  searchPlaceholder: "A person, a party or a province",
  searchButton: "Search",
  forExample: "For example:",

  routesTitle: "The three routes",
  routesIntro:
    "Each route has its own law and its own source, and its figures are from different years, so they are not added together.",
  stateTitle: "From the State to the parties",
  stateFigureNote: "in recorded subsidies, cumulative",
  stateFinding: (list, pct) => `${list} received ${pct} of everything granted.`,
  othersLabel: (n) => `The other ${n}`,
  stateLink: "See the split party by party",
  stateSource: "National Subsidies Database, updated daily.",
  donorsTitle: "From individuals to the parties",
  donorsFigureNote: (exact, donors, year) => `${exact} from ${donors} donors, in ${year}`,
  donorsFinding: (donorPct, moneyPct) =>
    `${donorPct} of donors gave less than €1,000, and between them they provided ${moneyPct} of the money.`,
  donorsLink: "See the donations by party",
  donorsSource:
    "Court of Auditors, report nº 1.573 (financial year 2020). Companies cannot donate to parties, and the report gives no donors' names.",
  foundationsTitle: "To the parties' foundations",
  foundationsFigureNote: (span) => `in contributions, between ${span}`,
  foundationsFinding: (partyPct, companiesPct) =>
    `${partyPct} was put in by the party itself. Companies, which can donate to a foundation, contributed ${companiesPct}.`,
  foundationsNote: (a) =>
    `That party money comes in turn from its own income. In ${a.year}, the ${a.parties} audited parties took in ${a.total}: ${a.publicPct} was public money, and of the private part, ${a.officeholders} came from their officeholders, ${a.members} from their members and ${a.donors} from donors. These are different years, so they are not subtracted from one another.`,
  foundationsLink: "See the foundations and who runs them",
  foundationsSource: "Court of Auditors, report nº 1.642 (financial years 2021 and 2022).",
  fromParty: "From the party itself",
  fromCompanies: "From companies",
  fromIndividuals: "From individuals",

  whoTitle: "Who appears on the routes",
  whoFinding: (n) => `${n} people who sit on the board of a party foundation also hold a public office.`,
  whoBody:
    "These are two official records about the same person, placed side by side. A match is shown only when the name identifies a single person and the party of the office is the foundation's.",
  boardCount: (n, nStr) =>
    `${n === 1 ? "1 person with a public office" : `${nStr} people with a public office`} on its board`,
  declTitle: "What deputies declare",
  declFinding: (a, b) =>
    `${a} of the ${b} deputies whose declaration has been transcribed declare shares, bonds or other securities.`,
  declMeta:
    "One dot per deputy with an asset declaration at the Congreso. They are read from the official scan and checked before they are published.",
  declLink: "See what each one declared",
  dotSecurities: "declare shares, bonds or other securities",
  dotNoSecurities: "transcribed, no securities declared",
  dotPending: "not yet transcribed",

  topicsTitle: "Topics",
  topicsIntro:
    "How the Congreso voted in the divisions this site tracks, from oldest to most recent, with the official record of each.",
  topicsSource: "Source: roll-call records of the Congreso.",

  gapTitle: "What is not yet on record",
  gapIntro:
    "What is missing is also a piece of data. This is what the sources do not publish, or what this site does not yet include.",
  campaignTitle: "What the campaign money was spent on",
  campaignFinding: (pct) =>
    `${pct} of the ordinary spending that parties declared for the 2024 European elections sits in a single line, not broken down.`,
  brokenDown: "Broken down",
  singleLine: "In a single line",
  campaignSource: "Source: Court of Auditors, report nº 1.628.",
  whoDonatedTitle: "Who donated to the parties",
  whoDonatedFinding: (n, year) => `${n} donors in ${year}, and none with a name.`,
  donorsCaption: (year) => `Donors to parties in ${year}, by tranche`,
  colDonor: "Donor",
  colTranche: "Tranche",
  colDonors: "Donors",
  nameNotPublished: "Name not published",
  donorsNote:
    "The Court of Auditors publishes donations grouped by amount, without names (report nº 1.573, financial year 2020).",
  yearsTitle: "Which years this site covers",
  yearsFinding: (foundationsYear, donationsYear) =>
    `Audited accounts arrive years late: the most recent this site holds is ${foundationsYear} for foundations and ${donationsYear} for donations.`,
  rowDonations: "Donations to the parties",
  rowFoundations: "The parties' foundations",
  today: "today",
  yearsKey: "Filled dot: a year with audited data on this site. Empty dot and dashed line: not yet.",
};

const ca: Copy = {
  navLabel: "Seccions",
  nav: {
    parties: "Partits",
    people: "Persones",
    territories: "Territoris",
    topics: "Temes",
    method: "Dades i mètode",
  },
  banner: "Prototip del nou disseny.",
  bannerLink: "Veure el web actual",
  siteName: "Seguint el Diner",
  footerSources:
    "Cada xifra porta la seva font: el Tribunal de Comptes, el Congrés dels Diputats, la Base de Dades Nacional de Subvencions i el Registre d'Alts Càrrecs.",
  footerJuxta:
    "Les dades es publiquen juntes per poder consultar-les. Que dues dades apareguin l'una al costat de l'altra no vol dir que l'una expliqui l'altra.",
  footerLink: "Com es va fer",

  sourceLabel: "Font",
  yearsAnd: (a, b) => `${a} i ${b}`,
  thousandsEur: (n) => `${n} mil €`,
  under1000: "Menys de 1.000 €",
  from1000to10000: "De 1.000 a 10.000 €",
  over10000: "Més de 10.000 €",

  h1: "Segueix els diners que entren a la política espanyola",
  lede: "Per on arriben, amb xifres oficials i la seva font: el que dona l'Estat, el que donen els particulars i el que reben les fundacions dels partits. I qui apareix en aquestes rutes: els càrrecs que seuen als patronats i el que els diputats declaren posseir.",
  searchLabel: "Cerca una persona, un partit o una província",
  searchPlaceholder: "Una persona, un partit o una província",
  searchButton: "Cerca",
  forExample: "Per exemple:",

  routesTitle: "Les tres rutes",
  routesIntro:
    "Cada ruta té la seva pròpia llei i la seva pròpia font, i les seves xifres són d'anys diferents, així que no se sumen.",
  stateTitle: "De l'Estat als partits",
  stateFigureNote: "en subvencions registrades, acumulat",
  stateFinding: (list, pct) => `${list} van rebre ${elCa(pct)} de tot el que s'ha concedit.`,
  othersLabel: (n) => `Els altres ${n}`,
  stateLink: "Veure el repartiment partit a partit",
  stateSource: "Base de Dades Nacional de Subvencions, actualitzada diàriament.",
  donorsTitle: "De particulars als partits",
  donorsFigureNote: (exact, donors, year) => `${exact} de ${donors} donants, el ${year}`,
  donorsFinding: (donorPct, moneyPct) =>
    `${capCa(elCa(donorPct))} dels donants va donar menys de 1.000 €, i entre tots van aportar ${elCa(moneyPct)} dels diners.`,
  donorsLink: "Veure les donacions per partit",
  donorsSource:
    "Tribunal de Comptes, informe nº 1.573 (exercici 2020). Les empreses no poden donar als partits, i l'informe no dona noms de donants.",
  foundationsTitle: "Cap a les fundacions dels partits",
  foundationsFigureNote: (span) => `en aportacions, entre ${span}`,
  foundationsFinding: (partyPct, companiesPct) =>
    `${capCa(elCa(partyPct))} el va posar el mateix partit. Les empreses, que sí que poden donar a una fundació, van aportar ${elCa(companiesPct)}.`,
  foundationsNote: (a) =>
    `Aquests diners del partit surten al seu torn dels seus propis ingressos. El ${a.year}, els ${a.parties} partits fiscalitzats van ingressar ${a.total}: ${elCa(a.publicPct)} va ser diner públic, i del privat, ${a.officeholders} els van aportar els seus càrrecs públics, ${a.members} els seus afiliats i ${a.donors} els donants. Són anys diferents, així que no es resten l'un de l'altre.`,
  foundationsLink: "Veure les fundacions i qui les governa",
  foundationsSource: "Tribunal de Comptes, informe nº 1.642 (exercicis 2021 i 2022).",
  fromParty: "Del mateix partit",
  fromCompanies: "D'empreses",
  fromIndividuals: "De particulars",

  whoTitle: "Qui apareix a les rutes",
  whoFinding: (n) => `${n} persones que seuen al patronat d'una fundació de partit també tenen un càrrec públic.`,
  whoBody:
    "Són dos registres oficials sobre la mateixa persona, posats l'un al costat de l'altre. Només es mostra la coincidència quan el nom identifica una sola persona i el partit del càrrec és el de la fundació.",
  boardCount: (n, nStr) =>
    `${n === 1 ? "1 persona amb càrrec públic" : `${nStr} persones amb càrrec públic`} al seu patronat`,
  declTitle: "Què declaren els diputats",
  declFinding: (a, b) =>
    `${a} dels ${b} diputats amb la declaració ja transcrita declaren accions, bons o altres valors.`,
  declMeta:
    "Un punt per diputat amb declaració de béns al Congrés. Es llegeixen de l'escaneig oficial i es comproven abans de publicar-se.",
  declLink: "Veure què va declarar cadascú",
  dotSecurities: "declaren accions, bons o altres valors",
  dotNoSecurities: "transcrites, sense valors declarats",
  dotPending: "encara sense transcriure",

  topicsTitle: "Temes",
  topicsIntro:
    "Com va votar el Congrés en les votacions que segueix aquest web, de la més antiga a la més recent, amb l'acta oficial de cadascuna.",
  topicsSource: "Font: actes de votació nominal del Congrés.",

  gapTitle: "Allò que encara no consta",
  gapIntro:
    "Allò que falta també és una dada. Això és el que les fonts no publiquen, o el que aquest web encara no recull.",
  campaignTitle: "En què es va gastar la campanya",
  campaignFinding: (pct) =>
    `${capCa(elCa(pct))} de la despesa ordinària que els partits van declarar a les europees del 2024 és en una sola línia, sense desglossar.`,
  brokenDown: "Desglossat",
  singleLine: "En una sola línia",
  campaignSource: "Font: Tribunal de Comptes, informe nº 1.628.",
  whoDonatedTitle: "Qui va donar als partits",
  whoDonatedFinding: (n, year) => `${n} donants el ${year}, i cap amb nom.`,
  donorsCaption: (year) => `Donants a partits el ${year}, per tram`,
  colDonor: "Donant",
  colTranche: "Tram",
  colDonors: "Donants",
  nameNotPublished: "Nom no publicat",
  donorsNote:
    "El Tribunal de Comptes publica les donacions agrupades per import, sense noms (informe nº 1.573, exercici 2020).",
  yearsTitle: "Quins anys recull aquest web",
  yearsFinding: (foundationsYear, donationsYear) =>
    `Els comptes auditats arriben amb anys de retard: el més recent que recull aquest web és el ${foundationsYear} per a les fundacions i el ${donationsYear} per a les donacions.`,
  rowDonations: "Donacions als partits",
  rowFoundations: "Fundacions dels partits",
  today: "avui",
  yearsKey: "Punt ple: any amb dades auditades en aquest web. Punt buit i línia discontínua: encara no.",
};

export const COPY: Record<Locale, Copy> = { es, en, ca };
