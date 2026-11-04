import type { ReactNode } from "react";
import type { Locale } from "@/lib/locales";

/**
 * Every sentence the prototype's foundation dossier prints, per language, that
 * the current site's dictionary (`t.foundations` in lib/i18n.ts) does not
 * already carry. The page takes the legal and verdict vocabulary from that
 * dictionary as it stands, so a duty "not met" reads the same on both sites.
 *
 * Functions take figures already formatted for the locale and, where grammar
 * turns on a count, the raw number as well.
 */

/** Catalan "el 12 %" / "l'1 %" / "l'11 %": the article elides before a vowel sound. */
const caEl = (p: string) => (/^(11|1)(?![0-9])/.test(p) ? `l’${p}` : `el ${p}`);

/** The one board-gap reason in lib/foundation-people.ts written as a stock sentence. */
const STOCK_GAP = "No se localizó una publicación propia del patronato.";

type PartKey = "party" | "companies" | "individuals" | "subsidies";

const es = {
  breadcrumb: "Fundaciones de los partidos",
  parts: {
    party: { label: "Del propio partido", words: "del propio partido" },
    companies: { label: "De empresas", words: "de empresas" },
    individuals: { label: "De particulares", words: "de particulares" },
    subsidies: { label: "Subvenciones públicas", words: "en subvenciones públicas" },
  } as Record<PartKey, { label: string; words: string }>,
  linkedTo: (party: ReactNode): ReactNode => (
    <>Entidad vinculada a {party}, según el Tribunal de Cuentas.</>
  ),
  linkedUnresolved: (wording: string) =>
    `El Tribunal de Cuentas la vincula a «${wording}», un nombre que esta web no puede atribuir a un solo partido de los que recoge.`,
  linkedNone: "El informe del Tribunal de Cuentas no indica a qué partido está vinculada.",
  ownership: (pct: string) => ` Es una sociedad: el informe indica una participación del partido del ${pct}.`,
  auditedIn: (years: string) => ` El informe la fiscaliza en ${years}.`,
  finding: (year: number, pct: string, words: string, all: boolean) =>
    all
      ? `En ${year}, todo lo que entró en esta entidad llegó ${words}.`
      : `En ${year}, el ${pct} de lo que entró en esta entidad llegó ${words}.`,
  noMoney: (years: string) =>
    `El informe no registra aportaciones ni subvenciones para esta entidad en ${years}.`,
  findingNote:
    "Lo que entra en una entidad vinculada son aportaciones, del partido, de empresas o de particulares, y subvenciones públicas. A diferencia de un partido, una fundación sí puede recibir dinero de empresas. Cada ejercicio se muestra por separado y no se suman.",
  identityYear: (year: number, value: string) => `${year}: ${value}`,
  identitySource: (exercises: string) =>
    `Datos de la ficha de la entidad en el informe, ejercicios ${exercises}. Donde un dato cambia entre ejercicios, se dan los dos.`,
  moneyTitle: "Lo que entró, ejercicio por ejercicio",
  notAudited: "no fiscalizada",
  noContributions: "sin aportaciones ni subvenciones",
  inTotal: (amount: string) => `${amount} en total, entre aportaciones y subvenciones`,
  moneyCaption: (year: number) => `Aportaciones recibidas en ${year}, por origen`,
  subsidiesCaption: (year: number) => `Subvenciones públicas recibidas en ${year}, por organismo`,
  contributionsTotal: "Total de aportaciones",
  subsidiesTotal: "Total de subvenciones",
  subsidiesNone: "El informe no recoge subvenciones públicas para este ejercicio.",
  amount: "Importe",
  moneySource: (url: string, years: string): ReactNode => (
    <>
      Fuente: Tribunal de Cuentas, <a href={url}>informe nº 1.642</a> (ejercicios {years}), una
      ficha por entidad y ejercicio. «—» indica que el informe no da número o importe para esa
      línea.
    </>
  ),
  dealsNone: (years: string) =>
    `El informe no recoge convenios de colaboración de esta entidad en ${years}.`,
  dealYear: (year: number) => `Ejercicio ${year}`,
  quoteNote: "El texto entre comillas es del informe, citado tal cual.",
  boardSome: (matched: number, matchedNf: string, people: string, n: number) =>
    n === 1
      ? "La única persona que esta web recoge en su patronato tiene también un cargo público."
      : `${matched === 1 ? "Una" : matchedNf} de las ${people} que esta web recoge en su patronato ${matched === 1 ? "tiene" : "tienen"} también un cargo público.`,
  boardNone: (people: string, n: number) =>
    n === 1
      ? "La única persona que esta web recoge en su patronato no coincide con ningún cargo del Registro de Altos Cargos."
      : `Ninguna de las ${people} que esta web recoge en su patronato coincide con un cargo del Registro de Altos Cargos.`,
  boardUnknown: "Esta web todavía no recoge quién forma el patronato de esta entidad.",
  personas: (n: number, nf: string) => (n === 1 ? "1 persona" : `${nf} personas`),
  dotWith: "con cargo público",
  dotWithout: "sin coincidencia exacta en el registro",
  dotDropped: "descartadas: el nombre coincide con más de un cargo, o el partido del cargo no es el de la fundación",
  boardDotNote:
    "Un punto por persona del patronato o, donde consta, del consejo asesor. Solo se muestra la coincidencia cuando el nombre identifica a una sola persona y el partido del cargo es el de la fundación.",
  officeTitle: "Con cargo público",
  officeAsOf: (date: string | null) =>
    `Cargo tal como lo recogía el Registro de Altos Cargos${date ? ` el ${date}` : ""}.`,
  fullBoardTitle: "Todo el patronato que recoge esta web",
  fullBoardOpen: (people: string) => `Ver las ${people}`,
  gapReason: (reason: string) => reason,
  boardSources: (sources: ReactNode | null, updated: string | null): ReactNode => (
    <>
      Fuentes:{" "}
      {sources && <>patronato según {sources}; </>}
      cargos según el Registro de Altos Cargos
      {updated ? `, actualizado el ${updated}` : ""}. Que una persona aparezca en los dos registros
      no dice nada sobre por qué.
    </>
  ),
  accountsTitle: "Sus cuentas",
  accountsCaption: "Cuentas de la entidad, por ejercicio",
  accountsItem: "Partida",
  accountsNote:
    "Las cuentas de la entidad tal como las recoge el informe, un ejercicio por columna. Un resultado negativo es un gasto mayor que el ingreso del año.",
  findingsIntro:
    "Lo que el Tribunal de Cuentas anotó al fiscalizar la entidad, con la norma que cita cuando la cita.",
  gapsTitle: "Lo que no muestra",
  gapYears: (years: string) =>
    `El informe cubre ${years}; no hay ejercicios posteriores publicados. La línea llega hasta hoy: los años huecos son los que todavía no ha fiscalizado nadie.`,
  gapNotAudited: (years: string) => `Esta entidad no aparece en el informe en ${years}.`,
  gapDonorsCount: (year: number, n: string, amount: string) =>
    `En ${year} el informe registra ${n} aportaciones de empresas a esta entidad, por ${amount}, y no dice de quién. Solo nombra a la contraparte cuando el dinero llegó como convenio de colaboración.`,
  gapDonorsAmount: (year: number, amount: string) =>
    `En ${year} el informe registra ${amount} en aportaciones de empresas a esta entidad, y no dice de quién. Solo nombra a la contraparte cuando el dinero llegó como convenio de colaboración.`,
  gapDonors:
    "El informe no nombra a las empresas ni a los particulares que aportan dinero a estas entidades: solo a la contraparte de un convenio de colaboración.",
  gapBoard:
    "Un patronato es una foto con fecha. Cada nombre se muestra con la fecha de su fuente y puede haber cambiado desde entonces. El cargo público es el que recogía el registro en su última actualización, y que una persona figure en los dos sitios no dice nada sobre por qué.",
  gapParty:
    "Sin un partido identificado, esta entidad no aparece en la página de ningún partido de esta web.",
  yearsKey:
    "Estación llena: ejercicio que el informe fiscaliza. Estación hueca: ejercicio que no cubre.",
  today: "hoy",
  sourceFoot: (url: string, approved: string): ReactNode => (
    <>
      Tribunal de Cuentas, <a href={url}>informe nº 1.642</a>, aprobado el {approved}.
    </>
  ),
  currentSite: "Ver esta ficha en el sitio actual",
};

type Copy = typeof es;

const en: Copy = {
  breadcrumb: "Party foundations",
  parts: {
    party: { label: "From the party itself", words: "from the party itself" },
    companies: { label: "From companies", words: "from companies" },
    individuals: { label: "From individuals", words: "from individuals" },
    subsidies: { label: "Public subsidies", words: "in public subsidies" },
  },
  linkedTo: (party) => <>An entity linked to {party}, according to the Court of Auditors.</>,
  linkedUnresolved: (wording) =>
    `The Court of Auditors links it to “${wording}”, a name this site cannot attribute to a single party among those it holds.`,
  linkedNone: "The Court of Auditors’ report does not say which party it is linked to.",
  ownership: (pct) => ` It is a company: the report gives the party’s holding as ${pct}.`,
  auditedIn: (years) => ` The report audits it in ${years}.`,
  finding: (year, pct, words, all) =>
    all
      ? `In ${year}, everything that came into this entity came ${words}.`
      : `In ${year}, ${pct} of what came into this entity came ${words}.`,
  noMoney: (years) =>
    `The report records no contributions or subsidies for this entity in ${years}.`,
  findingNote:
    "What comes into a linked entity is contributions, from the party, from companies or from individuals, and public subsidies. Unlike a party, a foundation may take money from companies. Each exercise is shown on its own and the two are not added.",
  identityYear: (year, value) => `${year}: ${value}`,
  identitySource: (exercises) =>
    `From the entity’s dossier in the report, exercises ${exercises}. Where a detail changes between exercises, both are given.`,
  moneyTitle: "What came in, exercise by exercise",
  notAudited: "not audited",
  noContributions: "no contributions or subsidies",
  inTotal: (amount) => `${amount} in total, contributions and subsidies`,
  moneyCaption: (year) => `Contributions received in ${year}, by source`,
  subsidiesCaption: (year) => `Public subsidies received in ${year}, by granting body`,
  contributionsTotal: "Total contributions",
  subsidiesTotal: "Total subsidies",
  subsidiesNone: "The report records no public subsidies for this exercise.",
  amount: "Amount",
  moneySource: (url, years) => (
    <>
      Source: Court of Auditors, <a href={url}>report nº 1.642</a> (exercises {years}), one
      dossier per entity and exercise. “—” means the report gives no count or amount for that
      line.
    </>
  ),
  dealsNone: (years) =>
    `The report records no collaboration agreements for this entity in ${years}.`,
  dealYear: (year) => `Exercise ${year}`,
  quoteNote: "Text in quotation marks is the report’s, quoted as written.",
  boardSome: (matched, matchedNf, people, n) =>
    n === 1
      ? "The only person this site records on its board also holds a public post."
      : `${matched === 1 ? "One" : matchedNf} of the ${people} this site records on its board also ${matched === 1 ? "holds" : "hold"} a public post.`,
  boardNone: (people, n) =>
    n === 1
      ? "The only person this site records on its board matches no post in the Register of Senior Officials."
      : `None of the ${people} this site records on its board matches a post in the Register of Senior Officials.`,
  boardUnknown: "This site does not yet record who sits on this entity’s board.",
  personas: (n, nf) => (n === 1 ? "1 person" : `${nf} people`),
  dotWith: "with a public post",
  dotWithout: "no exact match in the register",
  dotDropped: "discarded: the name matches more than one post, or the post’s party is not the foundation’s",
  boardDotNote:
    "One dot per member of the board of trustees or, where recorded, of the advisory council. A match is shown only when the name identifies a single person and the party of the post is the foundation’s.",
  officeTitle: "With a public post",
  officeAsOf: (date) =>
    `Post as the Register of Senior Officials recorded it${date ? ` on ${date}` : ""}.`,
  fullBoardTitle: "The whole board this site records",
  fullBoardOpen: (people) => `Show all ${people}`,
  gapReason: (reason) =>
    reason === STOCK_GAP ? "No publication of its own board could be found." : reason,
  boardSources: (sources, updated) => (
    <>
      Sources:{" "}
      {sources && <>board according to {sources}; </>}
      posts according to the Register of Senior Officials
      {updated ? `, updated on ${updated}` : ""}. That a person appears in both registers says
      nothing about why.
    </>
  ),
  accountsTitle: "Its accounts",
  accountsCaption: "The entity’s accounts, by exercise",
  accountsItem: "Item",
  accountsNote:
    "The entity’s accounts as the report records them, one exercise per column. A negative result means spending exceeded the year’s income.",
  findingsIntro:
    "What the Court of Auditors noted when auditing the entity, with the rule it cites where it cites one.",
  gapsTitle: "What this does not show",
  gapYears: (years) =>
    `The report covers ${years}; no later exercise has been published. The line runs to today: the hollow years are the ones nobody has audited yet.`,
  gapNotAudited: (years) => `This entity does not appear in the report for ${years}.`,
  gapDonorsCount: (year, n, amount) =>
    `In ${year} the report records ${n} contributions from companies to this entity, worth ${amount}, and does not say whose. It names the counterparty only where the money arrived as a collaboration agreement.`,
  gapDonorsAmount: (year, amount) =>
    `In ${year} the report records ${amount} in contributions from companies to this entity, and does not say whose. It names the counterparty only where the money arrived as a collaboration agreement.`,
  gapDonors:
    "The report does not name the companies or individuals who give these entities money: only the counterparty to a collaboration agreement.",
  gapBoard:
    "A board is a dated snapshot. Each name is shown with its source’s date and may have changed since. The public post is the one the register held at its last update, and that a person appears in both places says nothing about why.",
  gapParty:
    "With no party identified, this entity does not appear on any party’s page on this site.",
  yearsKey:
    "Filled station: an exercise the report audits. Hollow station: an exercise it does not cover.",
  today: "today",
  sourceFoot: (url, approved) => (
    <>
      Court of Auditors, <a href={url}>report nº 1.642</a>, approved on {approved}.
    </>
  ),
  currentSite: "See this dossier on the current site",
};

const ca: Copy = {
  breadcrumb: "Fundacions dels partits",
  parts: {
    party: { label: "Del propi partit", words: "del propi partit" },
    companies: { label: "D’empreses", words: "d’empreses" },
    individuals: { label: "De particulars", words: "de particulars" },
    subsidies: { label: "Subvencions públiques", words: "en subvencions públiques" },
  },
  linkedTo: (party) => <>Entitat vinculada a {party}, segons el Tribunal de Comptes.</>,
  linkedUnresolved: (wording) =>
    `El Tribunal de Comptes la vincula a «${wording}», un nom que aquest web no pot atribuir a un sol partit dels que recull.`,
  linkedNone: "L’informe del Tribunal de Comptes no indica a quin partit està vinculada.",
  ownership: (pct) => ` És una societat: l’informe indica una participació del partit del ${pct}.`,
  auditedIn: (years) => ` L’informe la fiscalitza el ${years}.`,
  finding: (year, pct, words, all) =>
    all
      ? `El ${year}, tot el que va entrar en aquesta entitat va arribar ${words}.`
      : `El ${year}, ${caEl(pct)} del que va entrar en aquesta entitat va arribar ${words}.`,
  noMoney: (years) =>
    `L’informe no registra aportacions ni subvencions per a aquesta entitat el ${years}.`,
  findingNote:
    "El que entra en una entitat vinculada són aportacions, del partit, d’empreses o de particulars, i subvencions públiques. A diferència d’un partit, una fundació sí que pot rebre diners d’empreses. Cada exercici es mostra per separat i no se sumen.",
  identityYear: (year, value) => `${year}: ${value}`,
  identitySource: (exercises) =>
    `Dades de la fitxa de l’entitat a l’informe, exercicis ${exercises}. On una dada canvia entre exercicis, es donen totes dues.`,
  moneyTitle: "El que va entrar, exercici per exercici",
  notAudited: "no fiscalitzada",
  noContributions: "sense aportacions ni subvencions",
  inTotal: (amount) => `${amount} en total, entre aportacions i subvencions`,
  moneyCaption: (year) => `Aportacions rebudes el ${year}, per origen`,
  subsidiesCaption: (year) => `Subvencions públiques rebudes el ${year}, per organisme`,
  contributionsTotal: "Total d’aportacions",
  subsidiesTotal: "Total de subvencions",
  subsidiesNone: "L’informe no recull subvencions públiques per a aquest exercici.",
  amount: "Import",
  moneySource: (url, years) => (
    <>
      Font: Tribunal de Comptes, <a href={url}>informe nº 1.642</a> (exercicis {years}), una
      fitxa per entitat i exercici. «—» indica que l’informe no dona nombre o import per a
      aquella línia.
    </>
  ),
  dealsNone: (years) =>
    `L’informe no recull convenis de col·laboració d’aquesta entitat el ${years}.`,
  dealYear: (year) => `Exercici ${year}`,
  quoteNote: "El text entre cometes és de l’informe, citat tal qual.",
  boardSome: (matched, matchedNf, people, n) =>
    n === 1
      ? "L’única persona que aquest web recull al seu patronat també té un càrrec públic."
      : `${matched === 1 ? "Una" : matchedNf} de les ${people} que aquest web recull al seu patronat també ${matched === 1 ? "té" : "tenen"} un càrrec públic.`,
  boardNone: (people, n) =>
    n === 1
      ? "L’única persona que aquest web recull al seu patronat no coincideix amb cap càrrec del Registre d’Alts Càrrecs."
      : `Cap de les ${people} que aquest web recull al seu patronat no coincideix amb un càrrec del Registre d’Alts Càrrecs.`,
  boardUnknown: "Aquest web encara no recull qui forma el patronat d’aquesta entitat.",
  personas: (n, nf) => (n === 1 ? "1 persona" : `${nf} persones`),
  dotWith: "amb càrrec públic",
  dotWithout: "sense coincidència exacta al registre",
  dotDropped: "descartades: el nom coincideix amb més d’un càrrec, o el partit del càrrec no és el de la fundació",
  boardDotNote:
    "Un punt per persona del patronat o, on consta, del consell assessor. Només es mostra la coincidència quan el nom identifica una sola persona i el partit del càrrec és el de la fundació.",
  officeTitle: "Amb càrrec públic",
  officeAsOf: (date) =>
    `Càrrec tal com el recollia el Registre d’Alts Càrrecs${date ? ` el ${date}` : ""}.`,
  fullBoardTitle: "Tot el patronat que recull aquest web",
  fullBoardOpen: (people) => `Veure les ${people}`,
  gapReason: (reason) =>
    reason === STOCK_GAP ? "No es va localitzar cap publicació pròpia del patronat." : reason,
  boardSources: (sources, updated) => (
    <>
      Fonts:{" "}
      {sources && <>patronat segons {sources}; </>}
      càrrecs segons el Registre d’Alts Càrrecs
      {updated ? `, actualitzat el ${updated}` : ""}. Que una persona aparegui als dos registres no
      diu res sobre el perquè.
    </>
  ),
  accountsTitle: "Els seus comptes",
  accountsCaption: "Comptes de l’entitat, per exercici",
  accountsItem: "Partida",
  accountsNote:
    "Els comptes de l’entitat tal com els recull l’informe, un exercici per columna. Un resultat negatiu és una despesa més gran que l’ingrés de l’any.",
  findingsIntro:
    "El que el Tribunal de Comptes va anotar en fiscalitzar l’entitat, amb la norma que cita quan la cita.",
  gapsTitle: "Què no mostra",
  gapYears: (years) =>
    `L’informe cobreix ${years}; no hi ha exercicis posteriors publicats. La línia arriba fins avui: els anys buits són els que encara no ha fiscalitzat ningú.`,
  gapNotAudited: (years) => `Aquesta entitat no apareix a l’informe el ${years}.`,
  gapDonorsCount: (year, n, amount) =>
    `El ${year} l’informe registra ${n} aportacions d’empreses a aquesta entitat, per ${amount}, i no diu de qui. Només nomena la contrapart quan els diners van arribar com a conveni de col·laboració.`,
  gapDonorsAmount: (year, amount) =>
    `El ${year} l’informe registra ${amount} en aportacions d’empreses a aquesta entitat, i no diu de qui. Només nomena la contrapart quan els diners van arribar com a conveni de col·laboració.`,
  gapDonors:
    "L’informe no nomena les empreses ni els particulars que aporten diners a aquestes entitats: només la contrapart d’un conveni de col·laboració.",
  gapBoard:
    "Un patronat és una foto amb data. Cada nom es mostra amb la data de la seva font i pot haver canviat des d’aleshores. El càrrec públic és el que recollia el registre en la seva última actualització, i que una persona consti als dos llocs no diu res sobre el perquè.",
  gapParty:
    "Sense un partit identificat, aquesta entitat no apareix a la pàgina de cap partit d’aquest web.",
  yearsKey:
    "Estació plena: exercici que l’informe fiscalitza. Estació buida: exercici que no cobreix.",
  today: "avui",
  sourceFoot: (url, approved) => (
    <>
      Tribunal de Comptes, <a href={url}>informe nº 1.642</a>, aprovat el {approved}.
    </>
  ),
  currentSite: "Veure aquesta fitxa al web actual",
};

export const COPY: Record<Locale, Copy> = { es, en, ca };
