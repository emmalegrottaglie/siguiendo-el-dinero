import type { Locale } from "@/lib/locales";

/**
 * Strings of the prototype's party index. Interpolated sentences take
 * already-formatted values. Party names, report titles and the names the
 * report gives to entities are data and are never translated here.
 */
const es = {
  title: "Partidos",
  intro:
    "Lo que cada partido recibe del Estado, lo que declara en donaciones, lo que entra en sus fundaciones y lo que gastó en campaña, partido a partido y con la fuente de cada cifra.",
  and: " y ",
  span: (a: number | string, b: number | string) => `${a} y ${b}`,

  stateTitle: "Lo que reparte el Estado",
  stateFinding: (
    names: string,
    share: string,
    total: string,
    n: number,
    span: string,
  ) =>
    `${names} recibieron el ${share} de los ${total} que el Estado concedió a ${n} partidos entre ${span}.`,
  othersLabel: (n: number) => `Los otros ${n}`,
  stateSourcePre: "Fuente:",
  stateSourceLink: "Base de Datos Nacional de Subvenciones",
  stateSourcePost: (span: string, date: string) =>
    `, concesiones a partidos políticos entre ${span}, consultada el ${date}. Financiación ordinaria y gastos de seguridad.`,

  recordsTitle: "Qué consta de cada partido",
  recordsFinding: (
    n: number,
    withDonations: number,
    donationsYear: number | string,
    withFoundations: number,
    withCampaign: number,
  ) =>
    `De los ${n} partidos con dinero del Estado, ${withDonations} aparecen en la tabla de donaciones de ${donationsYear}, ${withFoundations} tienen una fundación vinculada en esta web y ${withCampaign} encabezaron una candidatura en las europeas de 2024.`,
  recordsKey:
    "Punto lleno: el dato consta en esta web. Punto vacío: no consta. Cada columna es de una fuente y un año distintos, y las cifras de una fila no se suman.",
  recordsCaption: "Registros de cada partido en esta web",
  colParty: "Partido",
  colState: (a: number | string, b: number | string) =>
    `Del Estado, de ${a} a ${b}`,
  colDonations: (year: number | string) => `Donaciones, ${year}`,
  colFoundations: (year: number | string) => `Fundaciones, ${year}`,
  colCampaign: "Campaña, europeas de 2024",
  notOnRecord: "No consta",
  donationsCell: (amount: string, donors: number, donorsFmt: string) =>
    `${amount}, ${donors === 1 ? "un donante" : `${donorsFmt} donantes`}`,
  foundationsCell: (money: string, n: number) =>
    `${money}, ${n === 1 ? "1 entidad" : `${n} entidades`}`,
  onlyIn: (years: string) => `Solo en ${years}`,
  inCoalition: ", en coalición",
  recordsSource: (
    donationsYear: number | string,
    foundationYears: string,
    latest: number | string,
  ) =>
    `Fuentes: Base de Datos Nacional de Subvenciones; Tribunal de Cuentas, informes nº 1.573 (donaciones, ejercicio ${donationsYear}), nº 1.642 (fundaciones, ejercicios ${foundationYears}; en la columna, aportaciones y subvenciones de ${latest}) y nº 1.628 (europeas de 2024, gasto ordinario declarado). En coalición: la cifra es de toda la candidatura que el partido encabezó.`,

  incomeTitle: "De dónde salen los ingresos de los partidos",
  incomeFinding: (
    year: number | string,
    n: number,
    total: string,
    publicShare: string,
    officeholdersMore: boolean,
    officeholders: string,
    fees: string,
  ) =>
    `En ${year}, los ${n} partidos que fiscalizó el Tribunal de Cuentas ingresaron ${total}, y el ${publicShare} fue dinero público. ${
      officeholdersMore
        ? `Sus propios cargos públicos aportaron ${officeholders}, más que las cuotas de los afiliados (${fees}).`
        : `Las cuotas de los afiliados sumaron ${fees} y las aportaciones de sus cargos públicos, ${officeholders}.`
    }`,
  incomeBody:
    "Cada barra es el total de ingresos ordinarios de un partido, repartido por origen. Las aportaciones de cargos públicos son lo que dan al partido las personas que ocupan un cargo en su nombre. Las subvenciones electorales van aparte y no están incluidas.",
  partPublic: "Dinero público",
  partFees: "Cuotas de afiliados",
  partOfficeholders: "Aportaciones de cargos públicos",
  partDonations: "Donaciones",
  partOther: "Otros ingresos privados",
  lessThanOne: "menos del 1 %",
  incomeSplit: (pub: string, fees: string, off: string, don: string) =>
    `Público, ${pub}. Cuotas, ${fees}; cargos públicos, ${off}; donaciones, ${don}.`,
  incomeSourcePre: "Fuente: Tribunal de Cuentas,",
  incomeSourceLink: (year: number | string) =>
    `informe nº 1.573 (ejercicio ${year})`,
  incomeSourcePost:
    ", anexos IV y V. Son los partidos que recibieron subvención anual para su funcionamiento. Los nombres son los del informe.",

  gapsTitle: "Lo que todavía no consta",
  donationsElsewhereTitle: "Donaciones de partidos fuera de la lista",
  donationsElsewhereIntro: (n: number, year: number | string) =>
    n === 1
      ? `Un partido de la tabla de donaciones de ${year} no recibe subvenciones del Estado en esta web, o no tiene un NIF con el que unirlo a ellas:`
      : `${n} partidos de la tabla de donaciones de ${year} no reciben subvenciones del Estado en esta web, o no tienen un NIF con el que unirlos a ellas:`,
  unlinkedTitle: "Fundaciones sin un partido de la lista",
  unlinkedIntro: (n: number) =>
    `El informe nº 1.642 audita ${n} entidades cuyo partido, tal como lo nombra el informe, no identifica a uno solo de los partidos con dinero del Estado en esta web. No se atribuyen a ninguno.`,
  noPartyInReport: "sin partido en el informe",
  gapsSourcePre: "Fuente: Tribunal de Cuentas,",
  gapsSourceLink1: "informe nº 1.642",
  gapsSourceMid: " y ",
  gapsSourceLink2: "informe nº 1.573",
  gapsSourcePost:
    ". Candidaturas de las europeas de 2024 que esta web no atribuye a ningún partido: ",
  none: "ninguna",
};

type Copy = typeof es;

const en: Copy = {
  title: "Parties",
  intro:
    "What each party receives from the State, what it declares in donations, what goes into its foundations and what it spent on its campaign, party by party and with the source of every figure.",
  and: " and ",
  span: (a, b) => `${a} and ${b}`,

  stateTitle: "What the State hands out",
  stateFinding: (names, share, total, n, span) =>
    `${names} received ${share} of the ${total} that the State granted to ${n} parties between ${span}.`,
  othersLabel: (n) => `The other ${n}`,
  stateSourcePre: "Source:",
  stateSourceLink: "National Subsidies Database",
  stateSourcePost: (span, date) =>
    `, grants to political parties between ${span}, consulted on ${date}. Ordinary funding and security costs.`,

  recordsTitle: "What is on record for each party",
  recordsFinding: (n, withDonations, donationsYear, withFoundations, withCampaign) =>
    `Of the ${n} parties with State money, ${withDonations} appear in the ${donationsYear} donations table, ${withFoundations} have a linked foundation on this site and ${withCampaign} headed a list in the 2024 European elections.`,
  recordsKey:
    "Filled dot: the figure is on record on this site. Empty dot: not on record. Each column comes from a different source and year, and the figures in a row are not added together.",
  recordsCaption: "Records for each party on this site",
  colParty: "Party",
  colState: (a, b) => `From the State, ${a} to ${b}`,
  colDonations: (year) => `Donations, ${year}`,
  colFoundations: (year) => `Foundations, ${year}`,
  colCampaign: "Campaign, 2024 European elections",
  notOnRecord: "Not on record",
  donationsCell: (amount, donors, donorsFmt) =>
    `${amount}, ${donors === 1 ? "one donor" : `${donorsFmt} donors`}`,
  foundationsCell: (money, n) =>
    `${money}, ${n === 1 ? "1 entity" : `${n} entities`}`,
  onlyIn: (years) => `Only in ${years}`,
  inCoalition: ", in coalition",
  recordsSource: (donationsYear, foundationYears, latest) =>
    `Sources: National Subsidies Database; Court of Auditors, reports no. 1573 (donations, fiscal year ${donationsYear}), no. 1642 (foundations, fiscal years ${foundationYears}; in the column, contributions and subsidies for ${latest}) and no. 1628 (2024 European elections, ordinary spending declared). In coalition: the figure is for the whole list the party headed.`,

  incomeTitle: "Where the parties' income comes from",
  incomeFinding: (year, n, total, publicShare, officeholdersMore, officeholders, fees) =>
    `In ${year}, the ${n} parties audited by the Court of Auditors took in ${total}, and ${publicShare} of it was public money. ${
      officeholdersMore
        ? `Their own officeholders contributed ${officeholders}, more than member fees (${fees}).`
        : `Member fees came to ${fees} and contributions from their officeholders to ${officeholders}.`
    }`,
  incomeBody:
    "Each bar is a party's total ordinary income, split by origin. Contributions from officeholders are what the people who hold office in the party's name give to the party. Electoral subsidies are separate and not included.",
  partPublic: "Public money",
  partFees: "Member fees",
  partOfficeholders: "Contributions from officeholders",
  partDonations: "Donations",
  partOther: "Other private income",
  lessThanOne: "less than 1%",
  incomeSplit: (pub, fees, off, don) =>
    `Public, ${pub}. Fees, ${fees}; officeholders, ${off}; donations, ${don}.`,
  incomeSourcePre: "Source: Court of Auditors,",
  incomeSourceLink: (year) => `report no. 1573 (fiscal year ${year})`,
  incomeSourcePost:
    ", annexes IV and V. These are the parties that received the annual operating subsidy. The names are those in the report.",

  gapsTitle: "What is not yet on record",
  donationsElsewhereTitle: "Donations to parties outside the list",
  donationsElsewhereIntro: (n, year) =>
    n === 1
      ? `One party in the ${year} donations table does not receive State subsidies on this site, or has no tax ID (NIF) to link it with them:`
      : `${n} parties in the ${year} donations table do not receive State subsidies on this site, or have no tax ID (NIF) to link them with them:`,
  unlinkedTitle: "Foundations with no party from the list",
  unlinkedIntro: (n) =>
    `Report no. 1642 audits ${n} entities whose party, as the report names it, does not identify any single one of the parties with State money on this site. They are not attributed to any.`,
  noPartyInReport: "no party in the report",
  gapsSourcePre: "Source: Court of Auditors,",
  gapsSourceLink1: "report no. 1642",
  gapsSourceMid: " and ",
  gapsSourceLink2: "report no. 1573",
  gapsSourcePost:
    ". Lists in the 2024 European elections that this site does not attribute to any party: ",
  none: "none",
};

const ca: Copy = {
  title: "Partits",
  intro:
    "El que cada partit rep de l’Estat, el que declara en donacions, el que entra a les seves fundacions i el que va gastar en campanya, partit a partit i amb la font de cada xifra.",
  and: " i ",
  span: (a, b) => `${a} i ${b}`,

  stateTitle: "El que reparteix l’Estat",
  stateFinding: (names, share, total, n, span) =>
    `${names} van rebre el ${share} dels ${total} que l’Estat va concedir a ${n} partits entre ${span}.`,
  othersLabel: (n) => `Els altres ${n}`,
  stateSourcePre: "Font:",
  stateSourceLink: "Base de Dades Nacional de Subvencions",
  stateSourcePost: (span, date) =>
    `, concessions a partits polítics entre ${span}, consultada el ${date}. Finançament ordinari i despeses de seguretat.`,

  recordsTitle: "Què consta de cada partit",
  recordsFinding: (n, withDonations, donationsYear, withFoundations, withCampaign) =>
    `Dels ${n} partits amb diners de l’Estat, ${withDonations} apareixen a la taula de donacions de ${donationsYear}, ${withFoundations} tenen una fundació vinculada en aquest web i ${withCampaign} van encapçalar una candidatura a les europees de 2024.`,
  recordsKey:
    "Punt ple: la dada consta en aquest web. Punt buit: no consta. Cada columna és d’una font i d’un any diferents, i les xifres d’una fila no se sumen.",
  recordsCaption: "Registres de cada partit en aquest web",
  colParty: "Partit",
  colState: (a, b) => `De l’Estat, del ${a} al ${b}`,
  colDonations: (year) => `Donacions, ${year}`,
  colFoundations: (year) => `Fundacions, ${year}`,
  colCampaign: "Campanya, europees de 2024",
  notOnRecord: "No consta",
  donationsCell: (amount, donors, donorsFmt) =>
    `${amount}, ${donors === 1 ? "un donant" : `${donorsFmt} donants`}`,
  foundationsCell: (money, n) =>
    `${money}, ${n === 1 ? "1 entitat" : `${n} entitats`}`,
  onlyIn: (years) => `Només el ${years}`,
  inCoalition: ", en coalició",
  recordsSource: (donationsYear, foundationYears, latest) =>
    `Fonts: Base de Dades Nacional de Subvencions; Tribunal de Comptes, informes núm. 1.573 (donacions, exercici ${donationsYear}), núm. 1.642 (fundacions, exercicis ${foundationYears}; a la columna, aportacions i subvencions de ${latest}) i núm. 1.628 (europees de 2024, despesa ordinària declarada). En coalició: la xifra és de tota la candidatura que el partit va encapçalar.`,

  incomeTitle: "D’on surten els ingressos dels partits",
  incomeFinding: (year, n, total, publicShare, officeholdersMore, officeholders, fees) =>
    `El ${year}, els ${n} partits que va fiscalitzar el Tribunal de Comptes van ingressar ${total}, i el ${publicShare} va ser diner públic. ${
      officeholdersMore
        ? `Els seus propis càrrecs públics van aportar ${officeholders}, més que les quotes dels afiliats (${fees}).`
        : `Les quotes dels afiliats van sumar ${fees} i les aportacions dels seus càrrecs públics, ${officeholders}.`
    }`,
  incomeBody:
    "Cada barra és el total d’ingressos ordinaris d’un partit, repartit per origen. Les aportacions de càrrecs públics són el que donen al partit les persones que ocupen un càrrec en nom seu. Les subvencions electorals van a part i no hi són incloses.",
  partPublic: "Diners públics",
  partFees: "Quotes d’afiliats",
  partOfficeholders: "Aportacions de càrrecs públics",
  partDonations: "Donacions",
  partOther: "Altres ingressos privats",
  lessThanOne: "menys de l’1 %",
  incomeSplit: (pub, fees, off, don) =>
    `Públic, ${pub}. Quotes, ${fees}; càrrecs públics, ${off}; donacions, ${don}.`,
  incomeSourcePre: "Font: Tribunal de Comptes,",
  incomeSourceLink: (year) => `informe núm. 1.573 (exercici ${year})`,
  incomeSourcePost:
    ", annexos IV i V. Són els partits que van rebre subvenció anual per al seu funcionament. Els noms són els de l’informe.",

  gapsTitle: "El que encara no consta",
  donationsElsewhereTitle: "Donacions de partits fora de la llista",
  donationsElsewhereIntro: (n, year) =>
    n === 1
      ? `Un partit de la taula de donacions de ${year} no rep subvencions de l’Estat en aquest web, o no té un NIF amb què unir-lo a elles:`
      : `${n} partits de la taula de donacions de ${year} no reben subvencions de l’Estat en aquest web, o no tenen un NIF amb què unir-los a elles:`,
  unlinkedTitle: "Fundacions sense un partit de la llista",
  unlinkedIntro: (n) =>
    `L’informe núm. 1.642 audita ${n} entitats el partit de les quals, tal com el nomena l’informe, no identifica cap dels partits amb diners de l’Estat en aquest web. No s’atribueixen a cap.`,
  noPartyInReport: "sense partit a l’informe",
  gapsSourcePre: "Font: Tribunal de Comptes,",
  gapsSourceLink1: "informe núm. 1.642",
  gapsSourceMid: " i ",
  gapsSourceLink2: "informe núm. 1.573",
  gapsSourcePost:
    ". Candidatures de les europees de 2024 que aquest web no atribueix a cap partit: ",
  none: "cap",
};

export const COPY: Record<Locale, Copy> = { es, en, ca };
