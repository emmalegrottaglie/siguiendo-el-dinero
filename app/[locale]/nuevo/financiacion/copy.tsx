import type { ReactNode } from "react";
import type { Locale } from "@/lib/locales";

/**
 * Every sentence the prototype's money page prints, per language.
 *
 * Functions take figures already formatted for the locale (and, where grammar
 * turns on a count, the raw number too), so plural and agreement rules live
 * here and not in the page. The rules of each route, the tranche names and the
 * campaign-spending line names come from the current site's dictionaries
 * (`lib/i18n.ts`), which already carry them in all three languages; only what
 * this page says for the first time is written here.
 */

/** Catalan "el 12 %" / "l’1 %" / "l’11 %": the article elides before a vowel sound. */
const caEl = (p: string) => (/^(11|1)(?![0-9])/.test(p) ? `l’${p}` : `el ${p}`);
const caElCap = (p: string) => (/^(11|1)(?![0-9])/.test(p) ? `L’${p}` : `El ${p}`);

const es = {
  metaTitle: "El dinero de los partidos, ruta a ruta",
  breadcrumb: "Las rutas del dinero",
  title: "El dinero de los partidos, ruta a ruta",
  intro:
    "Las rutas de la portada, abiertas para consultarlas: lo que el Estado concede a los partidos, lo que les donan particulares, lo que entra en sus fundaciones y en qué declararon gastar una campaña. Cada ruta tiene su propia ley, su propia fuente y su propio año.",
  finding: (stateYear: number, donationsYear: number, foundationYears: string) =>
    `Solo la ruta del Estado se publica al día, con concesiones hasta ${stateYear}. Las otras tres salen de auditorías del Tribunal de Cuentas que llegan con años de retraso: ${donationsYear} para las donaciones, ${foundationYears} para las fundaciones y las europeas de 2024 para la campaña.`,
  yearsAnd: (a: string, b: string) => `${a} y ${b}`,
  noSum:
    "Cada cifra es de una fuente y un año distintos, así que no se suman entre ellas.",
  goTo: "Ir a la ruta",
  sumState: "Del Estado a los partidos",
  sumStateNote: (year: number, current: boolean, parties: string) =>
    `concedido en ${year}${current ? " (año en curso)" : ""} a ${parties} partidos`,
  sumDonations: "De particulares a los partidos",
  sumDonationsNote: (year: number, donors: string) => `declarado en ${year}, de ${donors} donantes`,
  sumFoundations: "Hacia sus fundaciones",
  sumFoundationsNote: (year: number) => `aportado en ${year}, sin contar subvenciones`,
  sumCampaign: "Gasto de campaña",
  sumCampaignNote: "gasto ordinario declarado en las europeas de 2024",

  // ---- shared ----
  rulesLabel: "Lo que fija la ley",
  routeSr: (from: string, to: string) => `Ruta: de ${from} a ${to}.`,
  gapsTitle: "Lo que no muestra",
  shareWords: (small: boolean, pct: string) => (small ? "menos del 1 %" : pct),
  noneOfKind: "Sin concesión de este tipo",
  notOnRecord: "No consta",
  others: (n: number) => (n === 1 ? "Otro partido" : `Los otros ${n}`),
  barKey: "La barra de cada fila se compara con la fila mayor de la tabla, no con el total.",

  // ---- state ----
  stateTitle: "Del Estado a los partidos",
  stateFrom: "El Estado",
  stateTo: "Los partidos",
  stateFinding: (current: boolean, year: number, amount: string, parties: string, list: string, pct: string) =>
    `${current ? `En lo que va de ${year}` : `En ${year}`}, el Estado concedió ${amount} a ${parties} partidos en subvenciones anuales. ${list} recibieron el ${pct}.`,
  byYear: "Lo concedido, año a año",
  currentYear: "en curso",
  yearsNoSum: (min: string, max: string) =>
    `Cada año reparte entre un conjunto distinto de partidos, de ${min} a ${max}, así que esta página no suma los años.`,
  shareTitle: (year: number) => `El reparto de ${year}`,
  shareNote: "Los tres partidos que más recibieron ese año y, juntos, el resto. Todos aparecen uno a uno en la tabla del año.",
  tablesTitle: "Partido a partido, cada año",
  yearSummary: (year: number, current: boolean, parties: string, grants: string, amount: string) =>
    `${year}${current ? " (en curso)" : ""}: ${parties} partidos, ${grants} concesiones, ${amount}`,
  stateCaption: (year: number) =>
    `Subvenciones del Estado a cada partido en ${year}, por tipo, en euros.`,
  thParty: "Partido",
  thYearTotal: "Total del año",
  thYearShare: "Parte del año",
  stateGaps: [
    "Solo las subvenciones anuales del Estado, para funcionamiento y para seguridad. La ley prevé también subvenciones electorales, dinero de las comunidades autónomas y aportaciones de los grupos parlamentarios, que no están en los datos que esta web toma de la Base de Datos Nacional de Subvenciones.",
    "Una cifra acumulada de todos los años: cada año la reciben partidos distintos, así que se muestra año por año.",
  ] as ReactNode[],
  stateIncomeGap: (href: string): ReactNode => (
    <>
      Lo que cada partido ingresó en 2020 de todas las administraciones está en la página de cada{" "}
      <a href={href}>partido</a>, tomado de su cuenta auditada.
    </>
  ),
  stateSource: (url: string, date: string): ReactNode => (
    <>
      Fuente: <a href={url}>Base de Datos Nacional de Subvenciones</a>, concesiones a partidos
      políticos, consultada el {date}. Se actualiza a diario.
    </>
  ),

  // ---- donations ----
  donationsTitle: "De particulares a los partidos",
  moneyByTranche: "El dinero, por tramo",
  donorsByTranche: "Los donantes, por tramo",
  donationsTableTitle: "Formación a formación",
  donationsSummary: (n: string, year: number) => `Las ${n} formaciones de la tabla de ${year}`,
  donationsCaption: (year: number) =>
    `Donaciones declaradas por cada formación en ${year}, por tramo, en euros y número de donantes.`,
  donorsCount: (n: number, nf: string) => (n === 1 ? "1 donante" : `${nf} donantes`),
  donationsGaps: (year: number): ReactNode[] => [
    "Ningún nombre: el Tribunal de Cuentas publica las donaciones agrupadas por tramos de importe, no donante a donante.",
    `Un solo ejercicio, ${year}: es el que esta web tiene transcrito de la tabla de donaciones del Tribunal de Cuentas, que se publica con años de retraso.`,
    "Una formación sin enlace no tiene página de partido en esta web: no recibe subvención anual del Estado en estos datos, o esta web no le tiene asignado un NIF.",
  ],
  donationsSource: (url: string, year: number, date: string): ReactNode => (
    <>
      Fuente: Tribunal de Cuentas, <a href={url}>informe nº 1.573 (ejercicio {year})</a>,
      donaciones del ejercicio por tramos; aprobado el {date}.
    </>
  ),

  // ---- foundations ----
  foundationsTitle: "Hacia las fundaciones de los partidos",
  foundationsFrom: "El partido, una empresa o una persona",
  foundationsFinding: (year: number, n: string, partyPct: string, companiesPct: string) =>
    `En ${year}, el ${partyPct} de lo que se aportó a las ${n} fundaciones y entidades auditadas lo puso el propio partido. Las empresas, que sí pueden donarles, aportaron el ${companiesPct}.`,
  foundationsByYear: "Lo aportado, año a año",
  foundationsYearLine: (year: number, amount: string, n: string) =>
    `${year}: ${amount} en aportaciones a ${n} entidades`,
  foundationsSubsidies: (amount: string) =>
    `Aparte, ${amount} en subvenciones públicas, que no forman parte de las aportaciones.`,
  foundationsNoSum: (counts: string) =>
    `Cada año se audita un conjunto distinto de entidades (${counts}), así que los años no se suman.`,
  entitiesIn: (n: string, year: number) => `${n} en ${year}`,
  foundationsTablesTitle: "Entidad a entidad, cada año",
  foundationsSummary: (year: number, n: string) => `${year}: las ${n} entidades una a una`,
  foundationsCaption: (year: number) =>
    `Lo que recibió cada fundación o entidad vinculada en ${year}, por origen, en euros.`,
  foundationsBarKey: "En la barra, los mismos tonos que arriba (del partido, de empresas, de particulares) y, en gris, las subvenciones públicas.",
  thEntity: "Entidad",
  thTotal: "Total",
  foundationsGaps: (asOf: string, nF: string, nE: string, unlinked: number, unlinkedNf: string, year: number): ReactNode[] => [
    `El registro obligatorio está casi vacío: a ${asOf}, solo constaban inscritas en el Registro de Partidos Políticos ${nF} fundaciones y ${nE} entidades de las fiscalizadas.`,
    `${unlinked === 1 ? "Una entidad" : `${unlinkedNf} entidades`} de ${year} no ${unlinked === 1 ? "enlaza" : "enlazan"} a una página de partido: el informe no nombra partido, nombra uno que esta web no puede atribuir con seguridad a uno solo, o ese partido no tiene página en esta web. Se muestra el partido tal como lo escribe el informe.`,
  ],
  foundationsDealsGap: (href: string): ReactNode => (
    <>
      El dinero de empresas casi nunca llega como donación, sino como convenio de colaboración con
      una contraprestación. Los convenios con nombre y quién gobierna cada fundación están en la{" "}
      <a href={href}>página de las fundaciones</a>.
    </>
  ),
  foundationsSource: (url: string, date: string): ReactNode => (
    <>
      Fuente: Tribunal de Cuentas, <a href={url}>informe nº 1.642</a>, aportaciones percibidas por
      las fundaciones y entidades vinculadas a los partidos, ejercicios 2021 y 2022; aprobado el{" "}
      {date}.
    </>
  ),

  // ---- campaign ----
  campaignTitle: "De las candidaturas a la campaña",
  campaignFrom: "Cada candidatura",
  campaignTo: "Su gasto de campaña",
  campaignRules: [
    "Publicidad exterior: límite propio (LOREG, art. 55)",
    "Prensa y radio: límite propio (LOREG, art. 58)",
    "Envíos de propaganda: fuera del límite general",
    "El resto: la ley no obliga a desglosarlo",
  ],
  campaignFinding: (pct: string) =>
    `El ${pct} del gasto ordinario que declararon las candidaturas en las europeas de 2024 está en una sola línea, sin desglosar.`,
  campaignTotal: (amount: string, n: string) =>
    `${amount} de gasto ordinario declarado por ${n} candidaturas`,
  mailingsLine: (amount: string, count: string) =>
    `Aparte, ${amount} en ${count} envíos de propaganda con derecho a subvención. No entran en el gasto ordinario ni en su límite general, así que no están en la barra.`,
  campaignTableTitle: "Candidatura a candidatura",
  campaignCaption:
    "Gasto ordinario declarado por cada candidatura en las europeas de 2024, por concepto, en euros. Los envíos de propaganda se contabilizan aparte.",
  thFormation: "Candidatura",
  thSplit: "Reparto",
  thDeclared: "Declarado",
  thShareOfAll: "Parte del total",
  thAdvertising: "Publicidad",
  thFinancial: "Gastos financieros",
  thUnitemised: "Sin desglosar",
  thMailings: "Envíos, aparte",
  coalitionNote:
    "Una coalición enlaza a la página del partido que encabezó su lista; la cifra es de toda la candidatura.",
  campaignSource: (url: string, date: string): ReactNode => (
    <>
      Fuente: Tribunal de Cuentas, <a href={url}>informe nº 1.628</a>, contabilidades de las
      elecciones al Parlamento Europeo de 9 de junio de 2024; aprobado el {date}.
    </>
  ),

  // ---- page-wide gaps ----
  pageGapsTitle: "Lo que no muestra esta página",
  pageGaps: [
    "Ninguna cifra por político. Las subvenciones y las donaciones son del partido, y esta web no las reparte entre personas.",
    "Ninguna suma entre rutas: cada una viene de una fuente, un año y un conjunto de partidos distintos.",
    "Ninguna relación entre el dinero y lo que votan los partidos. Que dos datos estén en la misma web no significa que uno explique el otro.",
  ],
};

type Copy = typeof es;

const en: Copy = {
  metaTitle: "The parties' money, route by route",
  breadcrumb: "The routes of the money",
  title: "The parties' money, route by route",
  intro:
    "The front page's routes, opened up to look things up: what the State grants the parties, what individuals donate to them, what goes into their foundations and what a campaign was declared to have bought. Each route has its own law, its own source and its own year.",
  finding: (stateYear, donationsYear, foundationYears) =>
    `Only the State route is published as it happens, with grants up to ${stateYear}. The other three come from Court of Auditors audits that arrive years late: ${donationsYear} for donations, ${foundationYears} for foundations and the 2024 European election for the campaign.`,
  yearsAnd: (a, b) => `${a} and ${b}`,
  noSum: "Each figure comes from a different source and year, so they are not added together.",
  goTo: "Go to the route",
  sumState: "From the State to the parties",
  sumStateNote: (year, current, parties) =>
    `granted in ${year}${current ? " (year in progress)" : ""} to ${parties} parties`,
  sumDonations: "From individuals to the parties",
  sumDonationsNote: (year, donors) => `declared for ${year}, from ${donors} donors`,
  sumFoundations: "Into their foundations",
  sumFoundationsNote: (year) => `contributed in ${year}, not counting subsidies`,
  sumCampaign: "Campaign spending",
  sumCampaignNote: "ordinary spending declared for the 2024 European election",

  rulesLabel: "What the law sets",
  routeSr: (from, to) => `Route: from ${from} to ${to}.`,
  gapsTitle: "What it does not show",
  shareWords: (small, pct) => (small ? "less than 1%" : pct),
  noneOfKind: "No grant of this kind",
  notOnRecord: "Not on record",
  others: (n) => (n === 1 ? "One other party" : `The other ${n}`),
  barKey: "Each row's bar is compared with the largest row in the table, not with the total.",

  stateTitle: "From the State to the parties",
  stateFrom: "The State",
  stateTo: "The parties",
  stateFinding: (current, year, amount, parties, list, pct) =>
    `${current ? `So far in ${year}` : `In ${year}`}, the State granted ${amount} to ${parties} parties in annual subsidies. ${list} received ${pct} of it.`,
  byYear: "What was granted, year by year",
  currentYear: "in progress",
  yearsNoSum: (min, max) =>
    `Each year is shared among a different set of parties, from ${min} to ${max}, so this page does not add the years together.`,
  shareTitle: (year) => `How ${year} was shared`,
  shareNote: "The three parties that received most that year and, together, the rest. Every party is listed in that year's table.",
  tablesTitle: "Party by party, each year",
  yearSummary: (year, current, parties, grants, amount) =>
    `${year}${current ? " (in progress)" : ""}: ${parties} parties, ${grants} grants, ${amount}`,
  stateCaption: (year) => `State subsidies to each party in ${year}, by kind, in euros.`,
  thParty: "Party",
  thYearTotal: "Total for the year",
  thYearShare: "Share of the year",
  stateGaps: [
    "Only the State's annual subsidies, for running costs and for security. The law also provides for election subsidies, money from the autonomous communities and contributions from parliamentary groups, which are not in the data this site takes from the National Subsidies Database.",
    "A total across all years: each year goes to a different set of parties, so it is shown year by year.",
  ],
  stateIncomeGap: (href) => (
    <>
      What each party received in 2020 from every administration is on each{" "}
      <a href={href}>party</a>'s page, taken from its audited accounts.
    </>
  ),
  stateSource: (url, date) => (
    <>
      Source: <a href={url}>National Subsidies Database (BDNS)</a>, grants to political parties,
      retrieved {date}. Updated daily.
    </>
  ),

  donationsTitle: "From individuals to the parties",
  moneyByTranche: "The money, by tranche",
  donorsByTranche: "The donors, by tranche",
  donationsTableTitle: "Formation by formation",
  donationsSummary: (n, year) => `The ${n} formations in the ${year} table`,
  donationsCaption: (year) =>
    `Donations declared by each formation for ${year}, by tranche, in euros and number of donors.`,
  donorsCount: (n, nf) => (n === 1 ? "1 donor" : `${nf} donors`),
  donationsGaps: (year) => [
    "No names: the Court of Auditors publishes donations grouped into amount tranches, not donor by donor.",
    `A single financial year, ${year}: it is the one this site has transcribed from the Court of Auditors' donations table, which is published years late.`,
    "A formation without a link has no party page on this site: it receives no annual State subsidy in this data, or this site has no NIF assigned to it.",
  ],
  donationsSource: (url, year, date) => (
    <>
      Source: Court of Auditors, <a href={url}>report no. 1,573 (financial year {year})</a>,
      donations for the year by tranche; approved {date}.
    </>
  ),

  foundationsTitle: "Into the parties' foundations",
  foundationsFrom: "The party, a company or an individual",
  foundationsFinding: (year, n, partyPct, companiesPct) =>
    `In ${year}, ${partyPct} of what was contributed to the ${n} audited foundations and entities was put in by the party itself. Companies, which may donate to them, contributed ${companiesPct}.`,
  foundationsByYear: "What was contributed, year by year",
  foundationsYearLine: (year, amount, n) => `${year}: ${amount} in contributions to ${n} entities`,
  foundationsSubsidies: (amount) =>
    `Separately, ${amount} in public subsidies, which are not part of the contributions.`,
  foundationsNoSum: (counts) =>
    `Each year audits a different set of entities (${counts}), so the years are not added together.`,
  entitiesIn: (n, year) => `${n} in ${year}`,
  foundationsTablesTitle: "Entity by entity, each year",
  foundationsSummary: (year, n) => `${year}: all ${n} entities`,
  foundationsCaption: (year) =>
    `What each linked foundation or entity received in ${year}, by origin, in euros.`,
  foundationsBarKey: "In the bar, the same shades as above (from the party, from companies, from individuals) and, in grey, public subsidies.",
  thEntity: "Entity",
  thTotal: "Total",
  foundationsGaps: (asOf, nF, nE, unlinked, unlinkedNf, year) => [
    `The mandatory register is almost empty: as of ${asOf}, only ${nF} foundations and ${nE} entities among those audited were entered in the Register of Political Parties.`,
    `${unlinked === 1 ? "One entity" : `${unlinkedNf} entities`} in ${year} ${unlinked === 1 ? "does" : "do"} not link to a party page: the report names no party, names one this site cannot safely attribute to a single party, or that party has no page on this site. The party is shown as the report writes it.`,
  ],
  foundationsDealsGap: (href) => (
    <>
      Company money hardly ever arrives as a donation, but as a collaboration agreement with
      something given in return. The named agreements and who governs each foundation are on the{" "}
      <a href={href}>foundations page</a>.
    </>
  ),
  foundationsSource: (url, date) => (
    <>
      Source: Court of Auditors, <a href={url}>report no. 1,642</a>, contributions received by
      foundations and entities linked to the parties, financial years 2021 and 2022; approved{" "}
      {date}.
    </>
  ),

  campaignTitle: "From the candidacies to the campaign",
  campaignFrom: "Each candidacy",
  campaignTo: "Its campaign spending",
  campaignRules: [
    "Outdoor advertising: its own cap (LOREG, art. 55)",
    "Press and radio: its own cap (LOREG, art. 58)",
    "Propaganda mailings: outside the general limit",
    "The rest: the law does not require it to be broken down",
  ],
  campaignFinding: (pct) =>
    `${pct} of the ordinary spending the candidacies declared for the 2024 European election sits in a single line, not broken down.`,
  campaignTotal: (amount, n) => `${amount} of ordinary spending declared by ${n} candidacies`,
  mailingsLine: (amount, count) =>
    `Separately, ${amount} on ${count} propaganda mailings eligible for subsidy. They are outside ordinary spending and its general limit, so they are not in the bar.`,
  campaignTableTitle: "Candidacy by candidacy",
  campaignCaption:
    "Ordinary spending declared by each candidacy for the 2024 European election, by item, in euros. Propaganda mailings are accounted separately.",
  thFormation: "Candidacy",
  thSplit: "Split",
  thDeclared: "Declared",
  thShareOfAll: "Share of the total",
  thAdvertising: "Advertising",
  thFinancial: "Financial costs",
  thUnitemised: "Not broken down",
  thMailings: "Mailings, separate",
  coalitionNote:
    "A coalition links to the page of the party that led its list; the figure is the whole candidacy's.",
  campaignSource: (url, date) => (
    <>
      Source: Court of Auditors, <a href={url}>report no. 1,628</a>, accounts for the European
      Parliament election of 9 June 2024; approved {date}.
    </>
  ),

  pageGapsTitle: "What this page does not show",
  pageGaps: [
    "No figure per politician. Subsidies and donations belong to the party, and this site does not share them out among people.",
    "No sum across routes: each comes from a different source, year and set of parties.",
    "No link between the money and how the parties vote. Two records on the same site do not mean one explains the other.",
  ],
};

const ca: Copy = {
  metaTitle: "Els diners dels partits, ruta a ruta",
  breadcrumb: "Les rutes dels diners",
  title: "Els diners dels partits, ruta a ruta",
  intro:
    "Les rutes de la portada, obertes per consultar-les: el que l’Estat concedeix als partits, el que els donen particulars, el que entra a les seves fundacions i en què van declarar gastar una campanya. Cada ruta té la seva pròpia llei, la seva pròpia font i el seu propi any.",
  finding: (stateYear, donationsYear, foundationYears) =>
    `Només la ruta de l’Estat es publica al dia, amb concessions fins al ${stateYear}. Les altres tres surten d’auditories del Tribunal de Comptes que arriben amb anys de retard: el ${donationsYear} per a les donacions, el ${foundationYears} per a les fundacions i les europees del 2024 per a la campanya.`,
  yearsAnd: (a, b) => `${a} i ${b}`,
  noSum:
    "Cada xifra és d’una font i un any diferents, de manera que no se sumen entre elles.",
  goTo: "Anar a la ruta",
  sumState: "De l’Estat als partits",
  sumStateNote: (year, current, parties) =>
    `concedit el ${year}${current ? " (any en curs)" : ""} a ${parties} partits`,
  sumDonations: "De particulars als partits",
  sumDonationsNote: (year, donors) => `declarat el ${year}, de ${donors} donants`,
  sumFoundations: "Cap a les seves fundacions",
  sumFoundationsNote: (year) => `aportat el ${year}, sense comptar subvencions`,
  sumCampaign: "Despesa de campanya",
  sumCampaignNote: "despesa ordinària declarada a les europees del 2024",

  rulesLabel: "El que fixa la llei",
  routeSr: (from, to) => `Ruta: de ${from} a ${to}.`,
  gapsTitle: "El que no mostra",
  shareWords: (small, pct) => (small ? "menys de l’1 %" : caEl(pct)),
  noneOfKind: "Sense concessió d’aquest tipus",
  notOnRecord: "No hi consta",
  others: (n) => (n === 1 ? "Un altre partit" : `Els altres ${n}`),
  barKey: "La barra de cada fila es compara amb la fila més gran de la taula, no amb el total.",

  stateTitle: "De l’Estat als partits",
  stateFrom: "L’Estat",
  stateTo: "Els partits",
  stateFinding: (current, year, amount, parties, list, pct) =>
    `${current ? `En el que va del ${year}` : `El ${year}`}, l’Estat va concedir ${amount} a ${parties} partits en subvencions anuals. ${list} en van rebre ${caEl(pct)}.`,
  byYear: "El que s’ha concedit, any a any",
  currentYear: "en curs",
  yearsNoSum: (min, max) =>
    `Cada any es reparteix entre un conjunt diferent de partits, de ${min} a ${max}, així que aquesta pàgina no suma els anys.`,
  shareTitle: (year) => `El repartiment del ${year}`,
  shareNote: "Els tres partits que més van rebre aquell any i, junts, la resta. Tots apareixen un a un a la taula de l’any.",
  tablesTitle: "Partit a partit, cada any",
  yearSummary: (year, current, parties, grants, amount) =>
    `${year}${current ? " (en curs)" : ""}: ${parties} partits, ${grants} concessions, ${amount}`,
  stateCaption: (year) => `Subvencions de l’Estat a cada partit el ${year}, per tipus, en euros.`,
  thParty: "Partit",
  thYearTotal: "Total de l’any",
  thYearShare: "Part de l’any",
  stateGaps: [
    "Només les subvencions anuals de l’Estat, per a funcionament i per a seguretat. La llei preveu també subvencions electorals, diners de les comunitats autònomes i aportacions dels grups parlamentaris, que no són a les dades que aquesta web pren de la Base de Dades Nacional de Subvencions.",
    "Una xifra acumulada de tots els anys: cada any la reben partits diferents, així que es mostra any per any.",
  ],
  stateIncomeGap: (href) => (
    <>
      El que cada partit va ingressar el 2020 de totes les administracions és a la pàgina de cada{" "}
      <a href={href}>partit</a>, pres del seu compte auditat.
    </>
  ),
  stateSource: (url, date) => (
    <>
      Font: <a href={url}>Base de Dades Nacional de Subvencions</a>, concessions a partits
      polítics, consultada el {date}. S’actualitza cada dia.
    </>
  ),

  donationsTitle: "De particulars als partits",
  moneyByTranche: "Els diners, per tram",
  donorsByTranche: "Els donants, per tram",
  donationsTableTitle: "Formació a formació",
  donationsSummary: (n, year) => `Les ${n} formacions de la taula del ${year}`,
  donationsCaption: (year) =>
    `Donacions declarades per cada formació el ${year}, per tram, en euros i nombre de donants.`,
  donorsCount: (n, nf) => (n === 1 ? "1 donant" : `${nf} donants`),
  donationsGaps: (year) => [
    "Cap nom: el Tribunal de Comptes publica les donacions agrupades per trams d’import, no donant a donant.",
    `Un sol exercici, el ${year}: és el que aquesta web té transcrit de la taula de donacions del Tribunal de Comptes, que es publica amb anys de retard.`,
    "Una formació sense enllaç no té pàgina de partit en aquesta web: no rep subvenció anual de l’Estat en aquestes dades, o aquesta web no li té assignat un NIF.",
  ],
  donationsSource: (url, year, date) => (
    <>
      Font: Tribunal de Comptes, <a href={url}>informe núm. 1.573 (exercici {year})</a>,
      donacions de l’exercici per trams; aprovat el {date}.
    </>
  ),

  foundationsTitle: "Cap a les fundacions dels partits",
  foundationsFrom: "El partit, una empresa o una persona",
  foundationsFinding: (year, n, partyPct, companiesPct) =>
    `El ${year}, ${caEl(partyPct)} del que es va aportar a les ${n} fundacions i entitats auditades ho va posar el mateix partit. Les empreses, que sí que hi poden donar, en van aportar ${caEl(companiesPct)}.`,
  foundationsByYear: "El que s’ha aportat, any a any",
  foundationsYearLine: (year, amount, n) => `${year}: ${amount} en aportacions a ${n} entitats`,
  foundationsSubsidies: (amount) =>
    `A banda, ${amount} en subvencions públiques, que no formen part de les aportacions.`,
  foundationsNoSum: (counts) =>
    `Cada any s’audita un conjunt diferent d’entitats (${counts}), així que els anys no se sumen.`,
  entitiesIn: (n, year) => `${n} el ${year}`,
  foundationsTablesTitle: "Entitat a entitat, cada any",
  foundationsSummary: (year, n) => `${year}: les ${n} entitats una a una`,
  foundationsCaption: (year) =>
    `El que va rebre cada fundació o entitat vinculada el ${year}, per origen, en euros.`,
  foundationsBarKey: "A la barra, els mateixos tons que a dalt (del partit, d’empreses, de particulars) i, en gris, les subvencions públiques.",
  thEntity: "Entitat",
  thTotal: "Total",
  foundationsGaps: (asOf, nF, nE, unlinked, unlinkedNf, year) => [
    `El registre obligatori és gairebé buit: a ${asOf}, només hi constaven inscrites al Registre de Partits Polítics ${nF} fundacions i ${nE} entitats de les fiscalitzades.`,
    `${unlinked === 1 ? "Una entitat" : `${unlinkedNf} entitats`} del ${year} no ${unlinked === 1 ? "enllaça" : "enllacen"} a una pàgina de partit: l’informe no anomena cap partit, n’anomena un que aquesta web no pot atribuir amb seguretat a un de sol, o aquest partit no té pàgina en aquesta web. Es mostra el partit tal com l’escriu l’informe.`,
  ],
  foundationsDealsGap: (href) => (
    <>
      Els diners d’empreses gairebé mai arriben com a donació, sinó com a conveni de col·laboració
      amb una contraprestació. Els convenis amb nom i qui governa cada fundació són a la{" "}
      <a href={href}>pàgina de les fundacions</a>.
    </>
  ),
  foundationsSource: (url, date) => (
    <>
      Font: Tribunal de Comptes, <a href={url}>informe núm. 1.642</a>, aportacions percebudes per
      les fundacions i entitats vinculades als partits, exercicis 2021 i 2022; aprovat el {date}.
    </>
  ),

  campaignTitle: "De les candidatures a la campanya",
  campaignFrom: "Cada candidatura",
  campaignTo: "La seva despesa de campanya",
  campaignRules: [
    "Publicitat exterior: límit propi (LOREG, art. 55)",
    "Premsa i ràdio: límit propi (LOREG, art. 58)",
    "Enviaments de propaganda: fora del límit general",
    "La resta: la llei no obliga a desglossar-la",
  ],
  campaignFinding: (pct) =>
    `${caElCap(pct)} de la despesa ordinària que van declarar les candidatures a les europees del 2024 és en una sola línia, sense desglossar.`,
  campaignTotal: (amount, n) => `${amount} de despesa ordinària declarada per ${n} candidatures`,
  mailingsLine: (amount, count) =>
    `A banda, ${amount} en ${count} enviaments de propaganda amb dret a subvenció. No entren a la despesa ordinària ni al seu límit general, així que no són a la barra.`,
  campaignTableTitle: "Candidatura a candidatura",
  campaignCaption:
    "Despesa ordinària declarada per cada candidatura a les europees del 2024, per concepte, en euros. Els enviaments de propaganda es comptabilitzen a banda.",
  thFormation: "Candidatura",
  thSplit: "Repartiment",
  thDeclared: "Declarat",
  thShareOfAll: "Part del total",
  thAdvertising: "Publicitat",
  thFinancial: "Despeses financeres",
  thUnitemised: "Sense desglossar",
  thMailings: "Enviaments, a banda",
  coalitionNote:
    "Una coalició enllaça a la pàgina del partit que va encapçalar la seva llista; la xifra és de tota la candidatura.",
  campaignSource: (url, date) => (
    <>
      Font: Tribunal de Comptes, <a href={url}>informe núm. 1.628</a>, comptabilitats de les
      eleccions al Parlament Europeu del 9 de juny de 2024; aprovat el {date}.
    </>
  ),

  pageGapsTitle: "El que no mostra aquesta pàgina",
  pageGaps: [
    "Cap xifra per polític. Les subvencions i les donacions són del partit, i aquesta web no les reparteix entre persones.",
    "Cap suma entre rutes: cadascuna ve d’una font, un any i un conjunt de partits diferents.",
    "Cap relació entre els diners i el que voten els partits. Que dues dades siguin a la mateixa web no vol dir que l’una expliqui l’altra.",
  ],
};

export const COPY: Record<Locale, Copy> = { es, en, ca };
