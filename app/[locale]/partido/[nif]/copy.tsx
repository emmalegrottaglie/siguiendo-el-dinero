import type { ReactNode } from "react";
import type { Locale } from "@/lib/locales";

/**
 * Every sentence the prototype's party hub prints, per language. Functions take
 * figures that are already formatted for the locale (and, where grammar turns
 * on a count, the raw number as well), so plural and agreement rules live here
 * and not in the page.
 */

/** Catalan "el 12 %" / "l'1 %" / "l'11 %": the article elides before a vowel sound. */
const caEl = (p: string) => (/^(11|1)(?![0-9])/.test(p) ? `l’${p}` : `el ${p}`);
const caElCap = (p: string) => (/^(11|1)(?![0-9])/.test(p) ? `L’${p}` : `El ${p}`);

const es = {
  // ---- shared lookup tables ----
  kindLabel: {
    ordinaria: "Financiación ordinaria",
    seguridad: "Gastos de seguridad",
    otra: "Otras",
  } as Record<"ordinaria" | "seguridad" | "otra", string>,
  tranches: {
    small: { label: "Menos de 1.000 €", words: "de menos de 1.000 €" },
    mid: { label: "De 1.000 a 10.000 €", words: "de 1.000 a 10.000 €" },
    large: { label: "Más de 10.000 €", words: "de más de 10.000 €" },
  } as Record<"small" | "mid" | "large", { label: string; words: string }>,
  /** "donó menos de 1.000 €" / "donaron …", for the donors' dot grid. */
  donated: (
    key: "small" | "mid" | "large",
    n: number,
  ): string => {
    const t = {
      small: "menos de 1.000 €",
      mid: "de 1.000 a 10.000 €",
      large: "más de 10.000 €",
    }[key];
    return `${n === 1 ? "donó" : "donaron"} ${t}`;
  },
  foundationParts: {
    party: { label: "Del propio partido", words: "del propio partido" },
    companies: { label: "De empresas", words: "de empresas" },
    individuals: { label: "De particulares", words: "de particulares" },
    subsidies: {
      label: "Subvenciones públicas",
      words: "en subvenciones públicas",
    },
  } as Record<
    "party" | "companies" | "individuals" | "subsidies",
    { label: string; words: string }
  >,
  stance: { si: "Votó sí", no: "Votó no", ab: "Se abstuvo" } as Record<
    "si" | "no" | "ab",
    string
  >,
  privateParts: {
    memberFees: {
      label: "Cuotas de afiliados",
      words: "las cuotas de sus afiliados",
    },
    officeholders: {
      label: "Aportaciones de sus cargos públicos",
      words: "las aportaciones de sus cargos públicos",
    },
    donations: {
      label: "Donaciones de particulares",
      words: "las donaciones de particulares",
    },
    other: { label: "Otros ingresos", words: "otros ingresos" },
  } as Record<
    "memberFees" | "officeholders" | "donations" | "other",
    { label: string; words: string }
  >,
  publicParts: {
    state: "Del Estado",
    regionalParliaments: "De parlamentos autonómicos",
    local: "De entidades locales",
    regionalGovernments: "De gobiernos autonómicos",
    cortes: "De las Cortes Generales",
    other: "Otras subvenciones",
  } as Record<
    | "state"
    | "regionalParliaments"
    | "local"
    | "regionalGovernments"
    | "cortes"
    | "other",
    string
  >,
  // ---- small fragments ----
  ordinal: (n: number) => `${n}.º`,
  /** "menos del 1 %" or "el 12 %", for a share of the national total. */
  shareWords: (small: boolean, pct: string) =>
    small ? "menos del 1 %" : `el ${pct}`,
  donorsWord: (n: number, nf: string) =>
    n === 1 ? "un donante" : `${nf} donantes`,
  donorsCount: (n: number, nf: string) =>
    n === 1 ? "1 donante" : `${nf} donantes`,
  personas: (n: number, nf: string) =>
    n === 1 ? "1 persona" : `${nf} personas`,
  theirFoundations: (n: number): string => (n === 1 ? "su fundación" : "sus fundaciones"),
  listAnd: " y ",
  // ---- header ----
  breadcrumb: "Partidos",
  intro:
    "Lo que consta de este partido en registros públicos: el dinero que recibe del Estado y el que declara, sus fundaciones y su campaña, cómo votó su grupo y lo que tienen los tribunales sobre sus cargos. Cada registro va por separado y ninguno explica a los demás.",
  nif: "NIF",
  topRank: "El partido que más dinero público ha recibido en esta web.",
  rankLine: (ord: string, total: number) =>
    `El ${ord} de ${total} partidos por dinero público recibido.`,
  noSum: "Cada cifra es de una fuente y un año distintos, así que no se suman entre sí.",
  // ---- summary row ----
  sumState: "Del Estado",
  sumStateNote: (y0: number, y1: number | undefined) =>
    `en subvenciones, entre ${y0} y ${y1}`,
  sumDonations: "Donaciones declaradas",
  notRecorded: "No consta",
  sumDonationsNote: (year: number, donors: string) => `en ${year}, de ${donors}`,
  sumDonationsNoNote: (year: number) =>
    `en la tabla de ${year} del Tribunal de Cuentas`,
  sumFoundations: "Entró en sus fundaciones",
  zeroEuro: "0 €",
  sumFoundationsNote: (year: number) =>
    `en ${year}, aportaciones y subvenciones`,
  sumFoundationsYears: (years: string) => `en ${years}`,
  sumFoundationsNone: "ninguna fundación vinculada en esta web",
  sumCampaign: "Gasto de campaña",
  sumCampaignCoalition: "gasto ordinario de su candidatura, europeas de 2024",
  sumCampaignOwn: "gasto ordinario declarado, europeas de 2024",
  sumCampaignNone: "en las europeas de 2024",
  // ---- state money ----
  stateTitle: "Lo que le da el Estado",
  stateFinding: (
    first: boolean,
    amount: string,
    y0: number,
    y1: number | undefined,
    share: string,
    ord: string,
    total: number,
  ) =>
    first
      ? `Recibió ${amount} del Estado entre ${y0} y ${y1}, ${share} de lo concedido a todos los partidos: más que ningún otro.`
      : `Recibió ${amount} del Estado entre ${y0} y ${y1}, ${share} de lo concedido a todos los partidos, y es el ${ord} de ${total} por dinero recibido.`,
  byYear: "Por año de concesión",
  currentYear: "año en curso",
  noGrant: "sin concesión",
  dotLegend: "Punto lleno: año con concesiones. Punto vacío: ninguna ese año.",
  byKind: "Por tipo de subvención",
  kindNote:
    "La financiación ordinaria se reparte según los escaños y votos obtenidos en las últimas elecciones al Congreso.",
  seeGrants: (n: number, nf: string) =>
    `Ver las ${nf} concesiones una a una`,
  grantsCaption: (name: string) => `Concesiones del Estado a ${name}`,
  thDate: "Fecha",
  thKind: "Tipo",
  thExercise: "Ejercicio",
  thAmount: "Importe",
  legalBasis: "base legal",
  stateSource: (url: string, date: string): ReactNode => (
    <>
      Fuente: <a href={url}>Base de Datos Nacional de Subvenciones</a>,
      concesiones a partidos políticos, consultada el {date}.
    </>
  ),
  // ---- the party's own income ----
  incomeTitle: "De dónde salen sus ingresos",
  incomeFinding: (
    year: number,
    pct: string,
    hasPrivate: boolean,
    topWords: string,
    topMoney: string,
  ) =>
    `En ${year}, el ${pct} de sus ingresos ordinarios fue dinero público.${
      hasPrivate
        ? ` De lo privado, lo que más aportó fueron ${topWords}: ${topMoney}.`
        : " No declaró ingresos privados."
    }`,
  publicMoney: "Dinero público",
  privateMoney: "Dinero privado",
  publicBy: "El dinero público, según quién lo da",
  privateBy: "El dinero privado, según de dónde viene",
  noPrivate: "El informe no le anota ningún ingreso privado.",
  incomeNote:
    "Las aportaciones de cargos públicos son lo que dan al partido las personas que ocupan un cargo en su nombre. El dinero de las Cortes, de los parlamentos autonómicos y de las entidades locales llega a través de sus grupos. Las subvenciones electorales van aparte y no están incluidas.",
  incomeUnlinked: (year: number, label: string, short: string) =>
    `La tabla de ingresos de ${year} tiene una fila con el nombre «${label}», pero más de un partido registrado lleva ese nombre y el informe no dice cuál es, así que esta web no se la atribuye a ${short}.`,
  incomeNoRow: (year: number, n: number, short: string) =>
    `El Tribunal de Cuentas fiscalizó las cuentas de ${year} de las ${n} formaciones que recibieron subvención anual. Ninguna fila de esa tabla corresponde con seguridad a ${short}.`,
  incomeSource: (url: string, year: number): ReactNode => (
    <>
      Fuente: Tribunal de Cuentas,{" "}
      <a href={url}>informe nº 1.573 (ejercicio {year})</a>, anexos IV y V:
      recursos ordinarios de la financiación pública y privada.
    </>
  ),
  yearsTitle: "Año a año",
  yearsIntro: (short: string, years: string) =>
    `El mismo reparto en cada año que el Tribunal de Cuentas tiene fiscalizado para ${short}: ${years}. Cada barra muestra la proporción de ese año, no su tamaño, y los años no se suman: el Tribunal fiscaliza cada año a los partidos que recibieron subvención ese año.`,
  yearsPublicShare: (pct: string) => `${pct} público`,
  yearsTotal: (money: string) => `${money} en total`,
  yearsNoBreakdown: "Sin desglose: el partido no facilitó la composición de sus ingresos.",
  yearsSource: (url: string): ReactNode => (
    <>
      2018 y 2019: Tribunal de Cuentas,{" "}
      <a href={url}>informe nº 1.532 (ejercicios 2018 y 2019)</a>, anexos IV, V, VII y VIII.
    </>
  ),
  // ---- donations ----
  donationsTitle: "Lo que declaró en donaciones",
  donationFinding: (
    total: string,
    donors: string,
    year: number,
    pct: string,
    words: string,
  ) =>
    `Declaró ${total} de ${donors} en ${year}, y el ${pct} del dinero llegó en donaciones ${words}.`,
  moneyByTranche: "El dinero, por tramo",
  donorsByTranche: "Los donantes, por tramo",
  donationsNote:
    "El informe agrupa las donaciones por importe y no da el nombre de ningún donante. Las empresas no pueden donar a un partido.",
  donationsMissing: (year: number, short: string) =>
    `La tabla de donaciones por tramos del Tribunal de Cuentas para ${year} no incluye a ${short}.`,
  donationsSource: (url: string, year: number): ReactNode => (
    <>
      Fuente: Tribunal de Cuentas,{" "}
      <a href={url}>informe nº 1.573 (ejercicio {year})</a>, donaciones del
      ejercicio por tramos.
    </>
  ),
  // ---- foundations ----
  foundationsTitle: (n: number): string =>
    n === 1 ? "Su fundación" : "Sus fundaciones",
  foundationFinding: (
    year: number,
    pct: string,
    their: string,
    words: string,
  ) => `En ${year}, el ${pct} de lo que entró en ${their} llegó ${words}.`,
  foundationNoMoney: (n: number, years: string) =>
    `El informe no registra aportaciones ni subvenciones para ${
      n === 1 ? "su única entidad" : `ninguna de sus ${n} entidades`
    } en ${years}.`,
  foundationNote:
    "Fundaciones y otras entidades vinculadas al partido que audita el Tribunal de Cuentas. A diferencia de un partido, una fundación sí puede recibir donaciones de empresas.",
  inTotal: (amount: string) => `${amount} en total`,
  noContributions: "sin aportaciones ni subvenciones",
  thenCalled: (name: string) => `, entonces ${name}`,
  unfundedOne: "Sin aportaciones ni subvenciones en el informe: ",
  unfundedMany: (n: number) =>
    `${n} entidades sin aportaciones ni subvenciones en el informe: `,
  foundationNone: (short: string) =>
    `Esta web no vincula ninguna fundación del informe con ${short}: o el informe no audita ninguna suya, o el nombre de partido que da el informe no identifica a uno solo.`,
  foundationSource: (url: string, years: string): ReactNode => (
    <>
      Fuente: Tribunal de Cuentas, <a href={url}>informe nº 1.642</a>{" "}
      (ejercicios {years}). Los ejercicios se muestran por separado.
    </>
  ),
  // ---- boards ----
  boardsTitle: "Cargos públicos al frente de sus fundaciones",
  boardNone: (people: string, their: string) =>
    `Ninguna de las ${people} que esta web recoge al frente de ${their} coincide con un cargo del Registro de Altos Cargos.`,
  boardSome: (
    matched: number,
    matchedNf: string,
    people: string,
    their: string,
    _onlyOne: boolean,
  ) =>
    `${matched === 1 ? "Una" : matchedNf} de las ${people} que esta web recoge al frente de ${their} ${matched === 1 ? "tiene" : "tienen"} también un cargo público.`,
  dotWith: "con cargo público",
  dotWithout: "sin coincidencia exacta en el registro",
  boardDotNote:
    "Un punto por persona del patronato o, donde consta, del consejo asesor. Solo se muestra la coincidencia cuando el nombre identifica a una sola persona y el partido del cargo es el de la fundación.",
  boardDiscarded: (n: number) =>
    ` Se descartaron ${n === 1 ? "un nombre que coincidía" : `${n} nombres que coincidían`} con más de un cargo.`,
  boardUnknown: (n: number) =>
    `Esta web todavía no recoge quién forma el patronato de ${
      n === 1 ? "su fundación" : `ninguna de sus ${n} entidades`
    }.`,
  boardSources: (sources: ReactNode | null, updated: string | null): ReactNode => (
    <>
      Fuentes:{" "}
      {sources && (
        <>
          patronatos según {sources};{" "}
        </>
      )}
      cargos según el Registro de Altos Cargos
      {updated ? `, actualizado el ${updated}` : ""}. Que una persona aparezca
      en los dos registros no dice nada sobre por qué.
    </>
  ),
  // ---- campaign ----
  campaignTitle: "En qué gastó la campaña",
  campaignSplit: (pct: string, coalition: boolean) =>
    `El ${pct} de ${coalition ? "lo que su candidatura declaró" : "lo que declaró"} como gasto ordinario en las europeas de 2024 está en una sola línea, sin desglosar.`,
  campaignAllItemised: (coalition: boolean) =>
    `Todo lo que ${coalition ? "su candidatura declaró" : "declaró"} como gasto ordinario en las europeas de 2024 está desglosado: nada quedó en la línea sin desglosar.`,
  campaignCoalition: (short: string, name: string) =>
    `${short} encabezó la candidatura ${name}. La cifra es de toda la candidatura, no solo de ${short}.`,
  declaredOrdinary: (amount: string) =>
    `${amount} de gasto ordinario declarado`,
  outdoor: "Publicidad exterior",
  pressRadio: "Prensa y radio",
  financialCosts: "Gastos financieros",
  otherUnitemised: "Otros gastos, sin desglosar",
  mailings: (amount: string) =>
    `Aparte, justificó ${amount} en envíos de propaganda electoral, que se contabilizan por separado.`,
  unitemisedBy: "La parte sin desglosar, candidatura a candidatura",
  thisList: "(esta candidatura)",
  boldHatched: "En negrita y con trama, esta candidatura.",
  campaignNone: (short: string) =>
    `El informe del Tribunal de Cuentas sobre las europeas de 2024 no recoge ninguna candidatura que esta web atribuya a ${short}.`,
  campaignSource: (url: string): ReactNode => (
    <>
      Fuente: Tribunal de Cuentas, <a href={url}>informe nº 1.628</a>,
      contabilidades de las elecciones al Parlamento Europeo de 9 de junio de
      2024. Solo la publicidad exterior y la de prensa y radio tienen límite
      legal propio, y por eso se detallan.
    </>
  ),
  // ---- people ----
  peopleTitle: "Sus personas",
  peopleFinding: (
    people: string,
    short: string,
    deputies: number,
    deputiesNf: string,
  ) =>
    `Esta web recoge ${people} de ${short} con un cargo público, y ${deputies === 0 ? "ninguna de ellas tiene escaño" : deputies === 1 ? "una de ellas tiene escaño" : `${deputiesNf} de ellas tienen escaño`} en el Congreso.`,
  bodyCongress: "Congreso",
  bodySenate: "Senado",
  bodyEuro: "Parlamento Europeo",
  bodyOther: "Otros cargos",
  deputiesHeading: (n: number, nf: string) =>
    n === 1 ? "Su diputada o diputado" : `Sus ${nf} diputados`,
  seeDirectory: (people: string) => `Ver las ${people} en el directorio`,
  peopleNone: (short: string) =>
    `Esta web no recoge ninguna persona con cargo público de ${short}.`,
  peopleSource:
    "Fuentes: Registro de Altos Cargos y relación de diputados del Congreso de los Diputados.",
  // ---- votes ----
  votesTitle: "Cómo votó su grupo",
  voteFinding: (inFavour: number, inFavourNf: string, trackedNf: string) =>
    `Su grupo votó sí en ${inFavour === 0 ? "ninguna" : inFavourNf} de las ${trackedNf} votaciones que sigue esta web en las que tuvo grupo propio.`,
  voteNoGroup: (short: string, trackedNf: string) =>
    `${short} no tuvo grupo parlamentario propio en ninguna de las ${trackedNf} votaciones que sigue esta web, así que no consta una posición suya como partido.`,
  noOwnPosition: (group: string) => `Sin posición propia, dentro de ${group}`,
  noOwnGroup: "Sin grupo propio",
  votesSource:
    "Fuente: actas de votación nominal del Congreso. La posición del grupo es la de la mayoría de sus diputados; un partido dentro de un grupo compartido no tiene posición propia.",
  // ---- regional investitures ----
  investTitle: "Investiduras autonómicas",
  investFinding: (
    short: string,
    rounds: string,
    roundsN: number,
    list: string,
    failed: string,
    failedN: number,
  ) =>
    `Las actas que recoge esta web registran votos a favor de ${short} en ${rounds} ${roundsN === 1 ? "votación" : "votaciones"} de investidura, en ${list}${failedN ? `; ${failed} ${failedN === 1 ? "fue rechazada" : "fueron rechazadas"}` : ""}.`,
  investSeatsOnly: (short: string, list: string) =>
    `En ${list} sólo constan aquí los escaños, no el acta de la votación, así que no se dice cómo votó ${short}.`,
  investScope:
    "El registro de investiduras de esta web sólo recoge presidencias del PP. Los votos en contra no están desglosados por partido, así que ningún partido figura aquí por haber votado en contra. Cada investidura es una votación con fecha: no dice quién se sienta hoy en un gobierno.",
  investAll: "Todas las investiduras, por comunidad",
  // ---- court record ----
  courtTitle: "Lo que consta en el registro judicial",
  courtIntro: (short: string) =>
    `Resoluciones de tribunales y juntas electorales referidas a cargos de ${short} en las materias que sigue esta web, cada una con la fase procesal en la que está. Van aparte del dinero y de los votos, y no explican ni lo uno ni lo otro.`,
  courtSource:
    "Fuentes: cada resolución enlaza a la información pública que la recoge. Cada una se verificó por separado antes de publicarse.",
  // ---- news ----
  newsTitle: "En las noticias",
  newsIntro: (name: string) =>
    `Titulares recientes de Google News al buscar «${name}». Esta web no los elige ni comprueba que cada uno trate de este partido, y no relaciona ninguno con las cifras de esta página.`,
  newsSource:
    "Fuente: Google News, búsqueda por el nombre del partido, actualizada como mucho cada media hora. Los titulares se muestran tal como los publica cada medio.",
  // ---- footer ----
  allParties: "Ver todos los partidos",
};

type Copy = typeof es;

const en: Copy = {
  kindLabel: {
    ordinaria: "Ordinary funding",
    seguridad: "Security costs",
    otra: "Other",
  },
  tranches: {
    small: { label: "Under €1,000", words: "of under €1,000" },
    mid: { label: "€1,000 to €10,000", words: "of €1,000 to €10,000" },
    large: { label: "Over €10,000", words: "of over €10,000" },
  },
  donated: (key, n) => {
    const t = {
      small: "under €1,000",
      mid: "€1,000 to €10,000",
      large: "over €10,000",
    }[key];
    return `gave ${t}`;
  },
  foundationParts: {
    party: { label: "From the party itself", words: "from the party itself" },
    companies: { label: "From companies", words: "from companies" },
    individuals: {
      label: "From private individuals",
      words: "from private individuals",
    },
    subsidies: { label: "Public subsidies", words: "as public subsidies" },
  },
  stance: { si: "Voted Yes", no: "Voted No", ab: "Abstained" },
  privateParts: {
    memberFees: { label: "Member fees", words: "member fees" },
    officeholders: {
      label: "Contributions from its officeholders",
      words: "contributions from its officeholders",
    },
    donations: {
      label: "Donations from private individuals",
      words: "donations from private individuals",
    },
    other: { label: "Other income", words: "other income" },
  },
  publicParts: {
    state: "From the State",
    regionalParliaments: "From regional parliaments",
    local: "From local authorities",
    regionalGovernments: "From regional governments",
    cortes: "From the Cortes Generales",
    other: "Other subsidies",
  },
  ordinal: (n) => {
    const r = n % 100;
    if (r >= 11 && r <= 13) return `${n}th`;
    return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
  },
  shareWords: (small, pct) => (small ? "less than 1%" : pct),
  donorsWord: (n, nf) => (n === 1 ? "one donor" : `${nf} donors`),
  donorsCount: (n, nf) => (n === 1 ? "1 donor" : `${nf} donors`),
  personas: (n, nf) => (n === 1 ? "1 person" : `${nf} people`),
  theirFoundations: (n) => (n === 1 ? "its foundation" : "its foundations"),
  listAnd: " and ",
  breadcrumb: "Parties",
  intro:
    "What public records hold on this party: the money it receives from the State and the money it declares, its foundations and its campaign, how its group voted and what the courts have on its officeholders. Each record stands on its own and none explains the others.",
  nif: "NIF",
  topRank: "The party that has received the most public money on this site.",
  rankLine: (ord, total) =>
    `Ranks ${ord} of ${total} parties by public money received.`,
  noSum:
    "Each figure comes from a different source and year, so they are not added together.",
  sumState: "From the State",
  sumStateNote: (y0, y1) => `in subsidies, between ${y0} and ${y1}`,
  sumDonations: "Declared donations",
  notRecorded: "Not recorded",
  sumDonationsNote: (year, donors) => `in ${year}, from ${donors}`,
  sumDonationsNoNote: (year) =>
    `in the ${year} table of the Court of Auditors`,
  sumFoundations: "Went into its foundations",
  zeroEuro: "€0",
  sumFoundationsNote: (year) => `in ${year}, contributions and subsidies`,
  sumFoundationsYears: (years) => `in ${years}`,
  sumFoundationsNone: "no foundation linked on this site",
  sumCampaign: "Campaign spending",
  sumCampaignCoalition:
    "ordinary spending of its candidacy, 2024 European elections",
  sumCampaignOwn: "declared ordinary spending, 2024 European elections",
  sumCampaignNone: "in the 2024 European elections",
  stateTitle: "What the State gives it",
  stateFinding: (first, amount, y0, y1, share, ord, total) =>
    first
      ? `It received ${amount} from the State between ${y0} and ${y1}, ${share} of what was granted to all parties: more than any other.`
      : `It received ${amount} from the State between ${y0} and ${y1}, ${share} of what was granted to all parties, and ranks ${ord} of ${total} by money received.`,
  byYear: "By year of grant",
  currentYear: "current year",
  noGrant: "no grant",
  dotLegend: "Filled dot: a year with grants. Empty dot: none that year.",
  byKind: "By type of subsidy",
  kindNote:
    "Ordinary funding is shared out according to the seats and votes won in the latest elections to the Congress.",
  seeGrants: (_n, nf) => `See all ${nf} grants one by one`,
  grantsCaption: (name) => `State grants to ${name}`,
  thDate: "Date",
  thKind: "Type",
  thExercise: "Fiscal year",
  thAmount: "Amount",
  legalBasis: "legal basis",
  stateSource: (url, date) => (
    <>
      Source: <a href={url}>National Subsidies Database</a>, grants to
      political parties, consulted on {date}.
    </>
  ),
  incomeTitle: "Where its income comes from",
  incomeFinding: (year, pct, hasPrivate, topWords, topMoney) =>
    `In ${year}, ${pct} of its ordinary income was public money.${
      hasPrivate
        ? ` Of the private part, the largest amount came from ${topWords}: ${topMoney}.`
        : " It declared no private income."
    }`,
  publicMoney: "Public money",
  privateMoney: "Private money",
  publicBy: "Public money, by who gives it",
  privateBy: "Private money, by where it comes from",
  noPrivate: "The report records no private income for it.",
  incomeNote:
    "Contributions from officeholders are what people holding office in the party’s name give to the party. Money from the Cortes, the regional parliaments and the local authorities arrives through their groups. Election subsidies are separate and are not included.",
  incomeUnlinked: (year, label, short) =>
    `The ${year} income table has a row named “${label}”, but more than one registered party carries that name and the report does not say which one it is, so this site does not attribute it to ${short}.`,
  incomeNoRow: (year, n, short) =>
    `The Court of Auditors audited the ${year} accounts of the ${n} formations that received the annual subsidy. No row of that table corresponds with certainty to ${short}.`,
  incomeSource: (url, year) => (
    <>
      Source: Court of Auditors, <a href={url}>Report no. 1573 (fiscal year {year})</a>,
      annexes IV and V: ordinary resources from public and private funding.
    </>
  ),
  yearsTitle: "Year by year",
  yearsIntro: (short, years) =>
    `The same split for each year the Court of Auditors has audited for ${short}: ${years}. Each bar shows that year’s proportions, not its size, and the years are not added together: each year the Court audits the parties that received a subsidy that year.`,
  yearsPublicShare: (pct) => `${pct} public`,
  yearsTotal: (money) => `${money} in total`,
  yearsNoBreakdown: "No breakdown: the party did not provide the composition of its income.",
  yearsSource: (url) => (
    <>
      2018 and 2019: Court of Auditors,{" "}
      <a href={url}>Report no. 1532 (fiscal years 2018 and 2019)</a>, annexes IV, V, VII and VIII.
    </>
  ),
  donationsTitle: "What it declared in donations",
  donationFinding: (total, donors, year, pct, words) =>
    `It declared ${total} from ${donors} in ${year}, and ${pct} of the money came in donations ${words}.`,
  moneyByTranche: "The money, by tranche",
  donorsByTranche: "The donors, by tranche",
  donationsNote:
    "The report groups donations by amount and gives no donor’s name. Companies cannot donate to a party.",
  donationsMissing: (year, short) =>
    `The Court of Auditors’ table of donations by tranche for ${year} does not include ${short}.`,
  donationsSource: (url, year) => (
    <>
      Source: Court of Auditors, <a href={url}>Report no. 1573 (fiscal year {year})</a>,
      donations of the fiscal year by tranche.
    </>
  ),
  foundationsTitle: (n) => (n === 1 ? "Its foundation" : "Its foundations"),
  foundationFinding: (year, pct, their, words) =>
    `In ${year}, ${pct} of what went into ${their} came ${words}.`,
  foundationNoMoney: (n, years) =>
    `The report records no contributions or subsidies for ${
      n === 1 ? "its only entity" : `any of its ${n} entities`
    } in ${years}.`,
  foundationNote:
    "Foundations and other entities linked to the party that the Court of Auditors audits. Unlike a party, a foundation can receive donations from companies.",
  inTotal: (amount) => `${amount} in total`,
  noContributions: "no contributions or subsidies",
  thenCalled: (name) => `, then ${name}`,
  unfundedOne: "No contributions or subsidies in the report: ",
  unfundedMany: (n) =>
    `${n} entities with no contributions or subsidies in the report: `,
  foundationNone: (short) =>
    `This site links no foundation in the report to ${short}: either the report audits none of its own, or the party name the report gives does not identify a single party.`,
  foundationSource: (url, years) => (
    <>
      Source: Court of Auditors, <a href={url}>Report no. 1642</a> (fiscal
      years {years}). The fiscal years are shown separately.
    </>
  ),
  boardsTitle: "Officeholders at the head of its foundations",
  boardNone: (people, their) =>
    `None of the ${people} this site records at the head of ${their} matches a post in the Register of Senior Officials.`,
  boardSome: (matched, matchedNf, people, their, onlyOne) =>
    onlyOne
      ? `The one person this site records at the head of ${their} also holds a public post.`
      : `${matched === 1 ? "One" : matchedNf} of the ${people} this site records at the head of ${their} also ${matched === 1 ? "holds" : "hold"} a public post.`,
  dotWith: "with a public post",
  dotWithout: "no exact match in the register",
  boardDotNote:
    "One dot per member of the board of trustees or, where recorded, of the advisory council. A match is shown only when the name identifies a single person and the party of the post is the foundation’s.",
  boardDiscarded: (n) =>
    ` ${n === 1 ? "One name that matched" : `${n} names that matched`} more than one post ${n === 1 ? "was" : "were"} discarded.`,
  boardUnknown: (n) =>
    `This site does not yet record who sits on the board of trustees of ${
      n === 1 ? "its foundation" : `any of its ${n} entities`
    }.`,
  boardSources: (sources, updated) => (
    <>
      Sources:{" "}
      {sources && (
        <>
          boards according to {sources};{" "}
        </>
      )}
      posts according to the Register of Senior Officials
      {updated ? `, updated on ${updated}` : ""}. That a person appears in both
      registers says nothing about why.
    </>
  ),
  campaignTitle: "What the campaign spent on",
  campaignSplit: (pct, coalition) =>
    `${pct} of what ${coalition ? "its candidacy declared" : "it declared"} as ordinary spending in the 2024 European elections is on a single line, with no breakdown.`,
  campaignAllItemised: (coalition) =>
    `Everything ${coalition ? "its candidacy declared" : "it declared"} as ordinary spending in the 2024 European elections is broken down: nothing was left on the line with no breakdown.`,
  campaignCoalition: (short, name) =>
    `${short} headed the candidacy ${name}. The figure is for the whole candidacy, not only for ${short}.`,
  declaredOrdinary: (amount) => `${amount} of declared ordinary spending`,
  outdoor: "Outdoor advertising",
  pressRadio: "Press and radio",
  financialCosts: "Financial costs",
  otherUnitemised: "Other spending, not broken down",
  mailings: (amount) =>
    `Separately, it justified ${amount} in election propaganda mailings, which are counted separately.`,
  unitemisedBy: "The part not broken down, candidacy by candidacy",
  thisList: "(this candidacy)",
  boldHatched: "In bold and hatched, this candidacy.",
  campaignNone: (short) =>
    `The Court of Auditors’ report on the 2024 European elections records no candidacy that this site attributes to ${short}.`,
  campaignSource: (url) => (
    <>
      Source: Court of Auditors, <a href={url}>Report no. 1628</a>, accounts of
      the European Parliament election of 9 June 2024. Only outdoor
      advertising and press and radio advertising have a legal limit of their
      own, and that is why they are detailed.
    </>
  ),
  peopleTitle: "Its people",
  peopleFinding: (people, short, deputies, deputiesNf) =>
    `This site records ${people} from ${short} holding public office, and ${deputies === 0 ? "none of them holds" : deputies === 1 ? "one of them holds" : `${deputiesNf} of them hold`} a seat in the Congress.`,
  bodyCongress: "Congress",
  bodySenate: "Senate",
  bodyEuro: "European Parliament",
  bodyOther: "Other posts",
  deputiesHeading: (n, nf) => (n === 1 ? "Its deputy" : `Its ${nf} deputies`),
  seeDirectory: (people) => `See the ${people} in the directory`,
  peopleNone: (short) =>
    `This site records no one holding public office for ${short}.`,
  peopleSource:
    "Sources: Register of Senior Officials and the list of members of the Congress of Deputies.",
  votesTitle: "How its group voted",
  voteFinding: (inFavour, inFavourNf, trackedNf) =>
    `Its group voted Yes in ${inFavour === 0 ? "none" : inFavourNf} of the ${trackedNf} votes this site follows in which it had its own group.`,
  voteNoGroup: (short, trackedNf) =>
    `${short} had no parliamentary group of its own in any of the ${trackedNf} votes this site follows, so no position of its own as a party is recorded.`,
  noOwnPosition: (group) => `No position of its own, within ${group}`,
  noOwnGroup: "No group of its own",
  votesSource:
    "Source: records of the Congress’s roll-call votes. The group’s position is that of the majority of its deputies; a party within a shared group has no position of its own.",
  investTitle: "Regional investitures",
  investFinding: (short, rounds, roundsN, list, failed, failedN) =>
    `The records this site holds show ${short} votes in favour in ${rounds} investiture ${roundsN === 1 ? "vote" : "votes"}, in ${list}${failedN ? `; ${failed} of them ${failedN === 1 ? "was" : "were"} rejected` : ""}.`,
  investSeatsOnly: (short, list) =>
    `For ${list} only the seats are on record here, not the record of the vote, so nothing is said about how ${short} voted.`,
  investScope:
    "This site's investiture record covers PP presidencies only. Votes against are not broken down by party, so no party appears here for having voted against. Each investiture is a dated vote: it does not say who sits in a government today.",
  investAll: "Every investiture, by community",
  courtTitle: "What the judicial record says",
  courtIntro: (short) =>
    `Court and electoral-board resolutions concerning officeholders of ${short} in the matters this site tracks, each with the procedural stage it is at. They sit apart from the money and the votes, and explain neither.`,
  courtSource:
    "Sources: each resolution links to the public report of it. Each was verified separately before publication.",
  newsTitle: "In the news",
  newsIntro: (name) =>
    `Recent Google News headlines for a search of “${name}”. This site does not choose them or check that each one is about this party, and links none of them to the figures on this page.`,
  newsSource:
    "Source: Google News, searched by the party’s name, refreshed at most every half hour. Headlines are shown as each outlet publishes them.",
  allParties: "See all parties",
};

const ca: Copy = {
  kindLabel: {
    ordinaria: "Finançament ordinari",
    seguridad: "Despeses de seguretat",
    otra: "Altres",
  },
  tranches: {
    small: { label: "Menys de 1.000 €", words: "de menys de 1.000 €" },
    mid: { label: "De 1.000 a 10.000 €", words: "de 1.000 a 10.000 €" },
    large: { label: "Més de 10.000 €", words: "de més de 10.000 €" },
  },
  donated: (key, n) => {
    const t = {
      small: "menys de 1.000 €",
      mid: "de 1.000 a 10.000 €",
      large: "més de 10.000 €",
    }[key];
    return `${n === 1 ? "va donar" : "van donar"} ${t}`;
  },
  foundationParts: {
    party: { label: "Del mateix partit", words: "del mateix partit" },
    companies: { label: "D’empreses", words: "d’empreses" },
    individuals: { label: "De particulars", words: "de particulars" },
    subsidies: {
      label: "Subvencions públiques",
      words: "en subvencions públiques",
    },
  },
  stance: { si: "Va votar sí", no: "Va votar no", ab: "Es va abstenir" },
  privateParts: {
    memberFees: {
      label: "Quotes d’afiliats",
      words: "les quotes dels seus afiliats",
    },
    officeholders: {
      label: "Aportacions dels seus càrrecs públics",
      words: "les aportacions dels seus càrrecs públics",
    },
    donations: {
      label: "Donacions de particulars",
      words: "les donacions de particulars",
    },
    other: { label: "Altres ingressos", words: "altres ingressos" },
  },
  publicParts: {
    state: "De l’Estat",
    regionalParliaments: "De parlaments autonòmics",
    local: "D’entitats locals",
    regionalGovernments: "De governs autonòmics",
    cortes: "De les Corts Generals",
    other: "Altres subvencions",
  },
  ordinal: (n) => `${n}${({ 1: "r", 2: "n", 3: "r", 4: "t" } as Record<number, string>)[n] ?? "è"}`,
  shareWords: (small, pct) => (small ? "menys de l’1 %" : caEl(pct)),
  donorsWord: (n, nf) => (n === 1 ? "un donant" : `${nf} donants`),
  donorsCount: (n, nf) => (n === 1 ? "1 donant" : `${nf} donants`),
  personas: (n, nf) => (n === 1 ? "1 persona" : `${nf} persones`),
  theirFoundations: (n) => (n === 1 ? "la seva fundació" : "les seves fundacions"),
  listAnd: " i ",
  breadcrumb: "Partits",
  intro:
    "El que consta d’aquest partit en registres públics: els diners que rep de l’Estat i els que declara, les seves fundacions i la seva campanya, com va votar el seu grup i el que tenen els tribunals sobre els seus càrrecs. Cada registre va per separat i cap no explica els altres.",
  nif: "NIF",
  topRank: "El partit que més diners públics ha rebut en aquest web.",
  rankLine: (ord, total) =>
    `El ${ord} de ${total} partits per diners públics rebuts.`,
  noSum:
    "Cada xifra és d’una font i un any diferents, de manera que no se sumen entre elles.",
  sumState: "De l’Estat",
  sumStateNote: (y0, y1) => `en subvencions, entre el ${y0} i el ${y1}`,
  sumDonations: "Donacions declarades",
  notRecorded: "No consta",
  sumDonationsNote: (year, donors) => `el ${year}, de ${donors}`,
  sumDonationsNoNote: (year) =>
    `a la taula del ${year} del Tribunal de Comptes`,
  sumFoundations: "Va entrar a les seves fundacions",
  zeroEuro: "0 €",
  sumFoundationsNote: (year) => `el ${year}, aportacions i subvencions`,
  sumFoundationsYears: (years) => `el ${years}`,
  sumFoundationsNone: "cap fundació vinculada en aquest web",
  sumCampaign: "Despesa de campanya",
  sumCampaignCoalition:
    "despesa ordinària de la seva candidatura, europees del 2024",
  sumCampaignOwn: "despesa ordinària declarada, europees del 2024",
  sumCampaignNone: "a les europees del 2024",
  stateTitle: "El que li dona l’Estat",
  stateFinding: (first, amount, y0, y1, share, ord, total) =>
    first
      ? `Va rebre ${amount} de l’Estat entre el ${y0} i el ${y1}, ${share} del que s’ha concedit a tots els partits: més que cap altre.`
      : `Va rebre ${amount} de l’Estat entre el ${y0} i el ${y1}, ${share} del que s’ha concedit a tots els partits, i és el ${ord} de ${total} per diners rebuts.`,
  byYear: "Per any de concessió",
  currentYear: "any en curs",
  noGrant: "sense concessió",
  dotLegend: "Punt ple: any amb concessions. Punt buit: cap aquell any.",
  byKind: "Per tipus de subvenció",
  kindNote:
    "El finançament ordinari es reparteix segons els escons i els vots obtinguts a les últimes eleccions al Congrés.",
  seeGrants: (_n, nf) => `Veure les ${nf} concessions una per una`,
  grantsCaption: (name) => `Concessions de l’Estat a ${name}`,
  thDate: "Data",
  thKind: "Tipus",
  thExercise: "Exercici",
  thAmount: "Import",
  legalBasis: "base legal",
  stateSource: (url, date) => (
    <>
      Font: <a href={url}>Base de Dades Nacional de Subvencions</a>,
      concessions a partits polítics, consultada el {date}.
    </>
  ),
  incomeTitle: "D’on surten els seus ingressos",
  incomeFinding: (year, pct, hasPrivate, topWords, topMoney) =>
    `El ${year}, ${caEl(pct)} dels seus ingressos ordinaris va ser diner públic.${
      hasPrivate
        ? ` De la part privada, el que més va aportar van ser ${topWords}: ${topMoney}.`
        : " No va declarar ingressos privats."
    }`,
  publicMoney: "Diner públic",
  privateMoney: "Diner privat",
  publicBy: "El diner públic, segons qui el dona",
  privateBy: "El diner privat, segons d’on ve",
  noPrivate: "L’informe no li anota cap ingrés privat.",
  incomeNote:
    "Les aportacions de càrrecs públics són el que donen al partit les persones que ocupen un càrrec en nom seu. Els diners de les Corts, dels parlaments autonòmics i de les entitats locals arriben a través dels seus grups. Les subvencions electorals van a part i no hi són incloses.",
  incomeUnlinked: (year, label, short) =>
    `La taula d’ingressos del ${year} té una fila amb el nom «${label}», però més d’un partit registrat porta aquest nom i l’informe no diu quin és, de manera que aquest web no l’atribueix a ${short}.`,
  incomeNoRow: (year, n, short) =>
    `El Tribunal de Comptes va fiscalitzar els comptes del ${year} de les ${n} formacions que van rebre subvenció anual. Cap fila d’aquesta taula correspon amb seguretat a ${short}.`,
  incomeSource: (url, year) => (
    <>
      Font: Tribunal de Comptes, <a href={url}>informe núm. 1.573 (exercici {year})</a>,
      annexos IV i V: recursos ordinaris del finançament públic i privat.
    </>
  ),
  yearsTitle: "Any a any",
  yearsIntro: (short, years) =>
    `El mateix repartiment per a cada any que el Tribunal de Comptes té fiscalitzat de ${short}: ${years}. Cada barra mostra la proporció d’aquell any, no la seva mida, i els anys no se sumen: el Tribunal fiscalitza cada any els partits que van rebre subvenció aquell any.`,
  yearsPublicShare: (pct) => `${pct} públic`,
  yearsTotal: (money) => `${money} en total`,
  yearsNoBreakdown: "Sense desglossament: el partit no va facilitar la composició dels seus ingressos.",
  yearsSource: (url) => (
    <>
      2018 i 2019: Tribunal de Comptes,{" "}
      <a href={url}>informe núm. 1.532 (exercicis 2018 i 2019)</a>, annexos IV, V, VII i VIII.
    </>
  ),
  donationsTitle: "El que va declarar en donacions",
  donationFinding: (total, donors, year, pct, words) =>
    `Va declarar ${total} de ${donors} el ${year}, i ${caEl(pct)} dels diners va arribar en donacions ${words}.`,
  moneyByTranche: "Els diners, per tram",
  donorsByTranche: "Els donants, per tram",
  donationsNote:
    "L’informe agrupa les donacions per import i no dona el nom de cap donant. Les empreses no poden donar a un partit.",
  donationsMissing: (year, short) =>
    `La taula de donacions per trams del Tribunal de Comptes per al ${year} no inclou ${short}.`,
  donationsSource: (url, year) => (
    <>
      Font: Tribunal de Comptes, <a href={url}>informe núm. 1.573 (exercici {year})</a>,
      donacions de l’exercici per trams.
    </>
  ),
  foundationsTitle: (n) =>
    n === 1 ? "La seva fundació" : "Les seves fundacions",
  foundationFinding: (year, pct, their, words) =>
    `El ${year}, ${caEl(pct)} del que va entrar a ${their} va arribar ${words}.`,
  foundationNoMoney: (n, years) =>
    `L’informe no registra aportacions ni subvencions per a ${
      n === 1 ? "la seva única entitat" : `cap de les seves ${n} entitats`
    } el ${years}.`,
  foundationNote:
    "Fundacions i altres entitats vinculades al partit que audita el Tribunal de Comptes. A diferència d’un partit, una fundació sí que pot rebre donacions d’empreses.",
  inTotal: (amount) => `${amount} en total`,
  noContributions: "sense aportacions ni subvencions",
  thenCalled: (name) => `, aleshores ${name}`,
  unfundedOne: "Sense aportacions ni subvencions a l’informe: ",
  unfundedMany: (n) =>
    `${n} entitats sense aportacions ni subvencions a l’informe: `,
  foundationNone: (short) =>
    `Aquesta web no vincula cap fundació de l’informe amb ${short}: o l’informe no n’audita cap de seva, o el nom de partit que dona l’informe no n’identifica un de sol.`,
  foundationSource: (url, years) => (
    <>
      Font: Tribunal de Comptes, <a href={url}>informe núm. 1.642</a>{" "}
      (exercicis {years}). Els exercicis es mostren per separat.
    </>
  ),
  boardsTitle: "Càrrecs públics al capdavant de les seves fundacions",
  boardNone: (people, their) =>
    `Cap de les ${people} que aquest web recull al capdavant de ${their} coincideix amb un càrrec del Registre d’Alts Càrrecs.`,
  boardSome: (matched, matchedNf, people, their, onlyOne) =>
    onlyOne
      ? `L’única persona que aquest web recull al capdavant de ${their} té també un càrrec públic.`
      : `${matched === 1 ? "Una" : matchedNf} de les ${people} que aquest web recull al capdavant de ${their} ${matched === 1 ? "té" : "tenen"} també un càrrec públic.`,
  dotWith: "amb càrrec públic",
  dotWithout: "sense coincidència exacta al registre",
  boardDotNote:
    "Un punt per persona del patronat o, on consta, del consell assessor. Només es mostra la coincidència quan el nom identifica una sola persona i el partit del càrrec és el de la fundació.",
  boardDiscarded: (n) =>
    ` Es van descartar ${n === 1 ? "un nom que coincidia" : `${n} noms que coincidien`} amb més d’un càrrec.`,
  boardUnknown: (n) =>
    `Aquesta web encara no recull qui forma el patronat de ${
      n === 1 ? "la seva fundació" : `cap de les seves ${n} entitats`
    }.`,
  boardSources: (sources, updated) => (
    <>
      Fonts:{" "}
      {sources && (
        <>
          patronats segons {sources};{" "}
        </>
      )}
      càrrecs segons el Registre d’Alts Càrrecs
      {updated ? `, actualitzat el ${updated}` : ""}. Que una persona aparegui
      als dos registres no diu res sobre el perquè.
    </>
  ),
  campaignTitle: "En què va gastar la campanya",
  campaignSplit: (pct, coalition) =>
    `${caElCap(pct)} del que ${coalition ? "la seva candidatura va declarar" : "va declarar"} com a despesa ordinària a les europees del 2024 és en una sola línia, sense desglossar.`,
  campaignAllItemised: (coalition) =>
    `Tot el que ${coalition ? "la seva candidatura va declarar" : "va declarar"} com a despesa ordinària a les europees del 2024 està desglossat: res no va quedar a la línia sense desglossar.`,
  campaignCoalition: (short, name) =>
    `${short} va encapçalar la candidatura ${name}. La xifra és de tota la candidatura, no només de ${short}.`,
  declaredOrdinary: (amount) => `${amount} de despesa ordinària declarada`,
  outdoor: "Publicitat exterior",
  pressRadio: "Premsa i ràdio",
  financialCosts: "Despeses financeres",
  otherUnitemised: "Altres despeses, sense desglossar",
  mailings: (amount) =>
    `A part, va justificar ${amount} en enviaments de propaganda electoral, que es comptabilitzen per separat.`,
  unitemisedBy: "La part sense desglossar, candidatura per candidatura",
  thisList: "(aquesta candidatura)",
  boldHatched: "En negreta i amb trama, aquesta candidatura.",
  campaignNone: (short) =>
    `L’informe del Tribunal de Comptes sobre les europees del 2024 no recull cap candidatura que aquest web atribueixi a ${short}.`,
  campaignSource: (url) => (
    <>
      Font: Tribunal de Comptes, <a href={url}>informe núm. 1.628</a>,
      comptabilitats de les eleccions al Parlament Europeu del 9 de juny del
      2024. Només la publicitat exterior i la de premsa i ràdio tenen límit
      legal propi, i per això es detallen.
    </>
  ),
  peopleTitle: "Les seves persones",
  peopleFinding: (people, short, deputies, deputiesNf) =>
    `Aquesta web recull ${people} de ${short} amb un càrrec públic, i ${deputies === 0 ? "cap d’elles té escó" : deputies === 1 ? "una d’elles té escó" : `${deputiesNf} d’elles tenen escó`} al Congrés.`,
  bodyCongress: "Congrés",
  bodySenate: "Senat",
  bodyEuro: "Parlament Europeu",
  bodyOther: "Altres càrrecs",
  deputiesHeading: (n, nf) =>
    n === 1 ? "El seu diputat o diputada" : `Els seus ${nf} diputats`,
  seeDirectory: (people) => `Veure les ${people} al directori`,
  peopleNone: (short) =>
    `Aquesta web no recull cap persona amb càrrec públic de ${short}.`,
  peopleSource:
    "Fonts: Registre d’Alts Càrrecs i relació de diputats del Congrés dels Diputats.",
  votesTitle: "Com va votar el seu grup",
  voteFinding: (inFavour, inFavourNf, trackedNf) =>
    `El seu grup va votar sí en ${inFavour === 0 ? "cap" : inFavourNf} de les ${trackedNf} votacions que segueix aquest web en què va tenir grup propi.`,
  voteNoGroup: (short, trackedNf) =>
    `${short} no va tenir grup parlamentari propi en cap de les ${trackedNf} votacions que segueix aquest web, de manera que no consta una posició seva com a partit.`,
  noOwnPosition: (group) => `Sense posició pròpia, dins de ${group}`,
  noOwnGroup: "Sense grup propi",
  votesSource:
    "Font: actes de votació nominal del Congrés. La posició del grup és la de la majoria dels seus diputats; un partit dins d’un grup compartit no té posició pròpia.",
  investTitle: "Investidures autonòmiques",
  investFinding: (short, rounds, roundsN, list, failed, failedN) =>
    `Les actes que recull aquest web registren vots a favor de ${short} en ${rounds} ${roundsN === 1 ? "votació" : "votacions"} d'investidura, a ${list}${failedN ? `; ${failed} ${failedN === 1 ? "va ser rebutjada" : "van ser rebutjades"}` : ""}.`,
  investSeatsOnly: (short, list) =>
    `A ${list} només hi consten els escons, no l'acta de la votació, així que no es diu com va votar ${short}.`,
  investScope:
    "El registre d'investidures d'aquest web només recull presidències del PP. Els vots en contra no estan desglossats per partit, així que cap partit no hi figura per haver votat en contra. Cada investidura és una votació amb data: no diu qui seu avui en un govern.",
  investAll: "Totes les investidures, per comunitat",
  courtTitle: "Què consta al registre judicial",
  courtIntro: (short) =>
    `Resolucions de tribunals i juntes electorals referides a càrrecs de ${short} en les matèries que segueix aquest web, cadascuna amb la fase processal en què es troba. Van a part dels diners i dels vots, i no expliquen ni una cosa ni l’altra.`,
  courtSource:
    "Fonts: cada resolució enllaça a la informació pública que la recull. Cadascuna es va verificar per separat abans de publicar-se.",
  newsTitle: "A les notícies",
  newsIntro: (name) =>
    `Titulars recents de Google News en cercar «${name}». Aquest web no els tria ni comprova que cadascun tracti d’aquest partit, i no en relaciona cap amb les xifres d’aquesta pàgina.`,
  newsSource:
    "Font: Google News, cerca pel nom del partit, actualitzada com a màxim cada mitja hora. Els titulars es mostren tal com els publica cada mitjà.",
  allParties: "Veure tots els partits",
};

export const COPY: Record<Locale, Copy> = { es, en, ca };
