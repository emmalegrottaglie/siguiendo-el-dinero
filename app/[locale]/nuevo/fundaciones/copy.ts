import type { Locale } from "@/lib/locales";

/**
 * Every sentence the prototype's foundations index prints, per language, that
 * the current site's dictionary (`t.foundations` in lib/i18n.ts) does not
 * already carry. The legal texts, the register and the officeholder join are
 * taken from that dictionary as they stand.
 *
 * Functions take figures already formatted for the locale and, where grammar
 * turns on a count, the raw number as well.
 */

/** Catalan "el 12 %" / "l'1 %" / "l'11 %": the article elides before a vowel sound. */
const caEl = (p: string) => (/^(11|1)(?![0-9])/.test(p) ? `l’${p}` : `el ${p}`);

type PartKey = "party" | "companies" | "individuals" | "subsidies";

const es = {
  metaTitle: "Fundaciones de los partidos",
  title: "Las fundaciones de los partidos",
  intro:
    "Cada partido tiene fundaciones, asociaciones y sociedades vinculadas que reciben dinero por su cuenta. A los partidos les está prohibido aceptar dinero de empresas; a sus fundaciones no. Aquí están todas las que audita el Tribunal de Cuentas, agrupadas por partido, con lo que entró en cada una y quién la gobierna.",
  finding: (year: number, n: string, pctParty: string, pctCompanies: string) =>
    `En ${year}, el ${pctParty} de lo que se aportó a las ${n} entidades fiscalizadas lo pusieron los propios partidos; las empresas, el ${pctCompanies}.`,
  findingNote:
    "Aparte de las aportaciones, las entidades reciben subvenciones públicas. Cada ejercicio se muestra por separado: las cifras de un año no se suman con las del otro.",
  parts: {
    party: { label: "Del propio partido", short: "partido" },
    companies: { label: "De empresas", short: "empresas" },
    individuals: { label: "De particulares", short: "particulares" },
    subsidies: { label: "Subvenciones públicas", short: "subvenciones" },
  } as Record<PartKey, { label: string; short: string }>,
  lessThanOne: "menos del 1 %",
  channelTitle: "Lo que entró, ejercicio por ejercicio",
  yearHead: (year: number, n: string) => `${year}, ${n} entidades fiscalizadas`,
  contributions: "Aportaciones",
  subsidies: "Subvenciones públicas",
  ofContributions: (pct: string) => `${pct} de las aportaciones`,
  channelSource: (years: string) =>
    `Fuente: Tribunal de Cuentas, informe nº 1.642 (ejercicios ${years}), totales del propio informe para cada ejercicio.`,
  entitiesTitle: "Entidad por entidad, partido por partido",
  entitiesIntro:
    "Cada partido es una línea y cada entidad vinculada, una estación en ella. Bajo cada entidad, lo que entró en cada ejercicio fiscalizado: la barra reparte el total entre partido, empresas, particulares y subvenciones, a la misma escala para todas, y la línea de texto lo dice en cifras. El partido es el que consta en el informe.",
  entitiesCount: (n: number, nf: string) => (n === 1 ? "1 entidad" : `${nf} entidades`),
  notAudited: "no fiscalizada este ejercicio",
  noContributions: "sin aportaciones ni subvenciones",
  board: (people: number, peopleNf: string, officers: number, officersNf: string) =>
    `${people === 1 ? "1 persona" : `${peopleNf} personas`} en el patronato${officers > 0 ? `, ${officers === 1 ? "1 con cargo público" : `${officersNf} con cargo público`}` : ""}`,
  noBoard: "patronato no recogido en esta web",
  asWritten: (wording: string) => `En el informe: «${wording}»`,
  unlinkedTitle: "Sin un partido identificado",
  unlinkedIntro: (n: number) =>
    `El informe vincula ${n === 1 ? "esta entidad" : `estas ${n} entidades`} a un partido con un nombre que no identifica a uno solo de los que recoge esta web: o el partido no está en ella, o hay más de uno con ese nombre (Coalición Canaria tiene dos NIF). Se muestran con el nombre que da el informe.`,
  entitiesSource: (years: string) =>
    `Fuente: Tribunal de Cuentas, informe nº 1.642 (ejercicios ${years}), una ficha por entidad y ejercicio. La escala de las barras es la misma para todas las entidades y los dos ejercicios; las cifras no se suman entre ejercicios.`,
  dealsCaption: "Convenios con contraparte nombrada en el informe",
  noAmount: "—",
  boardsFinding: (matched: string, candidates: string) =>
    `${matched} de las ${candidates} personas que esta web recoge en los patronatos tienen también un cargo público en el Registro de Altos Cargos.`,
  dotWith: "con cargo público",
  dotWithout: "sin fila en el registro",
  dotDropped: "descartadas: el nombre coincide con más de un cargo, o el partido no coincide",
  documentedTitle: "Patronatos que recoge esta web",
  documentedLine: (people: string, officers: number, officersNf: string) =>
    `${people} en el patronato, ${officers === 1 ? "1 con cargo público" : `${officersNf} con cargo público`}`,
  personas: (n: number, nf: string) => (n === 1 ? "1 persona" : `${nf} personas`),
  boardsSource: (updated: string | null) =>
    `Fuentes: patronatos según la publicación que se cita en cada ficha; cargos según el Registro de Altos Cargos${updated ? `, actualizado el ${updated}` : ""}. Que una persona aparezca en los dos registros no dice nada sobre por qué.`,
  lawTitle: "Lo que dice la ley, y lo que pidió el Tribunal",
  tally: (year: number, registered: string, total: string, not: string, unstated: number, unstatedNf: string) =>
    `En el ejercicio ${year}, ${registered} de las ${total} entidades fiscalizadas constan inscritas y ${not} no${unstated > 0 ? `; de ${unstatedNf} el informe no lo indica` : ""}.`,
  lawSource:
    "Fuente: Tribunal de Cuentas, informe nº 1.642, conclusiones y recomendaciones; Ley Orgánica 8/2007, en el BOE.",
  gapsTitle: "Lo que no muestra",
  gapYears:
    "La línea llega hasta hoy: los años huecos son los que todavía no ha fiscalizado nadie.",
  yearsKey:
    "Estación llena: ejercicio que el informe fiscaliza. Estación hueca: ejercicio que no cubre.",
  today: "hoy",
  gapNames:
    "Una misma entidad puede aparecer dos veces cuando cambió de nombre entre ejercicios o cuando el informe la escribe de forma distinta en cada uno. Se muestran tal como las nombra el informe.",
  gapUnlinked: (n: number) =>
    `${n === 1 ? "Una entidad no está vinculada" : `${n} entidades no están vinculadas`} a ningún partido de esta web, y no aparecen en la página de ningún partido.`,
  gapNoBoard: (n: number) =>
    `De ${n === 1 ? "una entidad" : `${n} entidades`} esta web no recoge quién forma el patronato: o no se localizó una publicación propia, o todavía no se ha buscado. Cada ficha dice cuál es el caso.`,
  sourceFoot: "Tribunal de Cuentas, informe nº 1.642, aprobado el",
  currentSite: "Ver las fundaciones en el sitio actual",
};

type Copy = typeof es;

const en: Copy = {
  metaTitle: "Party foundations",
  title: "The parties’ foundations",
  intro:
    "Every party has linked foundations, associations and companies that take money in their own right. Parties may not accept money from companies; their foundations may. Here is every one the Court of Auditors audits, grouped by party, with what came into each and who governs it.",
  finding: (year, n, pctParty, pctCompanies) =>
    `In ${year}, ${pctParty} of what was contributed to the ${n} audited entities came from the parties themselves; ${pctCompanies} came from companies.`,
  findingNote:
    "On top of contributions, the entities receive public subsidies. Each exercise is shown on its own: one year’s figures are not added to the other’s.",
  parts: {
    party: { label: "From the party itself", short: "party" },
    companies: { label: "From companies", short: "companies" },
    individuals: { label: "From individuals", short: "individuals" },
    subsidies: { label: "Public subsidies", short: "subsidies" },
  },
  lessThanOne: "less than 1%",
  channelTitle: "What came in, exercise by exercise",
  yearHead: (year, n) => `${year}, ${n} audited entities`,
  contributions: "Contributions",
  subsidies: "Public subsidies",
  ofContributions: (pct) => `${pct} of contributions`,
  channelSource: (years) =>
    `Source: Court of Auditors, report nº 1.642 (exercises ${years}), the report’s own totals for each exercise.`,
  entitiesTitle: "Entity by entity, party by party",
  entitiesIntro:
    "Each party is a line and each linked entity a station on it. Under each entity, what came in during each audited exercise: the bar splits the total between party, companies, individuals and subsidies, on one scale for all of them, and the line of text gives it in figures. The party is the one the report states.",
  entitiesCount: (n, nf) => (n === 1 ? "1 entity" : `${nf} entities`),
  notAudited: "not audited this exercise",
  noContributions: "no contributions or subsidies",
  board: (people, peopleNf, officers, officersNf) =>
    `${people === 1 ? "1 person" : `${peopleNf} people`} on the board${officers > 0 ? `, ${officers === 1 ? "1 with a public post" : `${officersNf} with a public post`}` : ""}`,
  noBoard: "board not recorded on this site",
  asWritten: (wording) => `In the report: “${wording}”`,
  unlinkedTitle: "No party identified",
  unlinkedIntro: (n) =>
    `The report links ${n === 1 ? "this entity" : `these ${n} entities`} to a party under a name that does not identify a single party this site holds: either the party is not on it, or more than one carries that name (Coalición Canaria has two NIFs). They are shown under the name the report gives.`,
  entitiesSource: (years) =>
    `Source: Court of Auditors, report nº 1.642 (exercises ${years}), one dossier per entity and exercise. The bars share one scale across every entity and both exercises; figures are not added across exercises.`,
  dealsCaption: "Agreements whose counterparty the report names",
  noAmount: "—",
  boardsFinding: (matched, candidates) =>
    `${matched} of the ${candidates} people this site records on the boards also hold a public post in the Register of Senior Officials.`,
  dotWith: "with a public post",
  dotWithout: "no row in the register",
  dotDropped: "discarded: the name matches more than one post, or the party does not match",
  documentedTitle: "Boards this site records",
  documentedLine: (people, officers, officersNf) =>
    `${people} on the board, ${officers === 1 ? "1 with a public post" : `${officersNf} with a public post`}`,
  personas: (n, nf) => (n === 1 ? "1 person" : `${nf} people`),
  boardsSource: (updated) =>
    `Sources: boards according to the publication cited on each dossier; posts according to the Register of Senior Officials${updated ? `, updated on ${updated}` : ""}. That a person appears in both registers says nothing about why.`,
  lawTitle: "What the law says, and what the Court asked for",
  tally: (year, registered, total, not, unstated, unstatedNf) =>
    `In the ${year} exercise, ${registered} of the ${total} audited entities are recorded as registered and ${not} are not${unstated > 0 ? `; for ${unstatedNf} the report does not say` : ""}.`,
  lawSource:
    "Source: Court of Auditors, report nº 1.642, conclusions and recommendations; Ley Orgánica 8/2007, in the BOE.",
  gapsTitle: "What this does not show",
  gapYears: "The line runs to today: the hollow years are the ones nobody has audited yet.",
  yearsKey:
    "Filled station: an exercise the report audits. Hollow station: an exercise it does not cover.",
  today: "today",
  gapNames:
    "One entity can appear twice where it changed its name between exercises or where the report spells it differently in each. They are shown as the report names them.",
  gapUnlinked: (n) =>
    `${n === 1 ? "One entity is" : `${n} entities are`} linked to no party on this site, and appear on no party’s page.`,
  gapNoBoard: (n) =>
    `For ${n === 1 ? "one entity" : `${n} entities`} this site does not record who sits on the board: either no publication of its own could be found, or it has not been looked for yet. Each dossier says which.`,
  sourceFoot: "Court of Auditors, report nº 1.642, approved on",
  currentSite: "See the foundations on the current site",
};

const ca: Copy = {
  metaTitle: "Fundacions dels partits",
  title: "Les fundacions dels partits",
  intro:
    "Cada partit té fundacions, associacions i societats vinculades que reben diners pel seu compte. Als partits els està prohibit acceptar diners d’empreses; a les seves fundacions, no. Aquí hi ha totes les que audita el Tribunal de Comptes, agrupades per partit, amb el que va entrar a cadascuna i qui la governa.",
  finding: (year, n, pctParty, pctCompanies) =>
    `El ${year}, ${caEl(pctParty)} del que es va aportar a les ${n} entitats fiscalitzades ho van posar els mateixos partits; les empreses, ${caEl(pctCompanies)}.`,
  findingNote:
    "A part de les aportacions, les entitats reben subvencions públiques. Cada exercici es mostra per separat: les xifres d’un any no se sumen amb les de l’altre.",
  parts: {
    party: { label: "Del propi partit", short: "partit" },
    companies: { label: "D’empreses", short: "empreses" },
    individuals: { label: "De particulars", short: "particulars" },
    subsidies: { label: "Subvencions públiques", short: "subvencions" },
  },
  lessThanOne: "menys de l’1 %",
  channelTitle: "El que va entrar, exercici per exercici",
  yearHead: (year, n) => `${year}, ${n} entitats fiscalitzades`,
  contributions: "Aportacions",
  subsidies: "Subvencions públiques",
  ofContributions: (pct) => `${pct} de les aportacions`,
  channelSource: (years) =>
    `Font: Tribunal de Comptes, informe nº 1.642 (exercicis ${years}), totals del mateix informe per a cada exercici.`,
  entitiesTitle: "Entitat per entitat, partit per partit",
  entitiesIntro:
    "Cada partit és una línia i cada entitat vinculada, una estació. Sota cada entitat, el que va entrar en cada exercici fiscalitzat: la barra reparteix el total entre partit, empreses, particulars i subvencions, a la mateixa escala per a totes, i la línia de text ho diu en xifres. El partit és el que consta a l’informe.",
  entitiesCount: (n, nf) => (n === 1 ? "1 entitat" : `${nf} entitats`),
  notAudited: "no fiscalitzada aquest exercici",
  noContributions: "sense aportacions ni subvencions",
  board: (people, peopleNf, officers, officersNf) =>
    `${people === 1 ? "1 persona" : `${peopleNf} persones`} al patronat${officers > 0 ? `, ${officers === 1 ? "1 amb càrrec públic" : `${officersNf} amb càrrec públic`}` : ""}`,
  noBoard: "patronat no recollit en aquest web",
  asWritten: (wording) => `A l’informe: «${wording}»`,
  unlinkedTitle: "Sense un partit identificat",
  unlinkedIntro: (n) =>
    `L’informe vincula ${n === 1 ? "aquesta entitat" : `aquestes ${n} entitats`} a un partit amb un nom que no n’identifica un de sol dels que recull aquest web: o el partit no hi és, o n’hi ha més d’un amb aquest nom (Coalición Canaria té dos NIF). Es mostren amb el nom que dona l’informe.`,
  entitiesSource: (years) =>
    `Font: Tribunal de Comptes, informe nº 1.642 (exercicis ${years}), una fitxa per entitat i exercici. L’escala de les barres és la mateixa per a totes les entitats i els dos exercicis; les xifres no se sumen entre exercicis.`,
  dealsCaption: "Convenis amb contrapart nomenada a l’informe",
  noAmount: "—",
  boardsFinding: (matched, candidates) =>
    `${matched} de les ${candidates} persones que aquest web recull als patronats també tenen un càrrec públic al Registre d’Alts Càrrecs.`,
  dotWith: "amb càrrec públic",
  dotWithout: "sense fila al registre",
  dotDropped: "descartades: el nom coincideix amb més d’un càrrec, o el partit no coincideix",
  documentedTitle: "Patronats que recull aquest web",
  documentedLine: (people, officers, officersNf) =>
    `${people} al patronat, ${officers === 1 ? "1 amb càrrec públic" : `${officersNf} amb càrrec públic`}`,
  personas: (n, nf) => (n === 1 ? "1 persona" : `${nf} persones`),
  boardsSource: (updated) =>
    `Fonts: patronats segons la publicació que se cita a cada fitxa; càrrecs segons el Registre d’Alts Càrrecs${updated ? `, actualitzat el ${updated}` : ""}. Que una persona aparegui als dos registres no diu res sobre el perquè.`,
  lawTitle: "Què diu la llei, i què va demanar el Tribunal",
  tally: (year, registered, total, not, unstated, unstatedNf) =>
    `A l’exercici ${year}, ${registered} de les ${total} entitats fiscalitzades consten inscrites i ${not} no${unstated > 0 ? `; de ${unstatedNf} l’informe no ho indica` : ""}.`,
  lawSource:
    "Font: Tribunal de Comptes, informe nº 1.642, conclusions i recomanacions; Llei Orgànica 8/2007, al BOE.",
  gapsTitle: "Què no mostra",
  gapYears: "La línia arriba fins avui: els anys buits són els que encara no ha fiscalitzat ningú.",
  yearsKey:
    "Estació plena: exercici que l’informe fiscalitza. Estació buida: exercici que no cobreix.",
  today: "avui",
  gapNames:
    "Una mateixa entitat pot aparèixer dues vegades quan va canviar de nom entre exercicis o quan l’informe l’escriu de manera diferent en cadascun. Es mostren tal com les anomena l’informe.",
  gapUnlinked: (n) =>
    `${n === 1 ? "Una entitat no està vinculada" : `${n} entitats no estan vinculades`} a cap partit d’aquest web, i no apareixen a la pàgina de cap partit.`,
  gapNoBoard: (n) =>
    `${n === 1 ? "D’una entitat" : `De ${n} entitats`} aquest web no recull qui forma el patronat: o no es va localitzar una publicació pròpia, o encara no s’ha buscat. Cada fitxa diu quin és el cas.`,
  sourceFoot: "Tribunal de Comptes, informe nº 1.642, aprovat el",
  currentSite: "Veure les fundacions al web actual",
};

export const COPY: Record<Locale, Copy> = { es, en, ca };
