import type { Locale } from "@/lib/locales";

/** Lists whose short name takes the article in Spanish and Catalan ("del PP", "de Vox"). */
const WITH_ARTICLE = new Set([
  "PP",
  "PSOE",
  "PSC",
  "PNV",
  "BNG",
  "PsdeG-PSOE",
  "PSIB-PSOE",
  "PSE-EE (PSOE)",
  "PSN-PSOE",
]);
const VOWEL = /^[AEIOUÀÈÉÍÒÓÚHaeiouàèéíòóú]/;

type Kind = "securities" | "transcribed" | "pending" | "none";

const es = {
  deputy: ["diputado", "diputados"] as [string, string],
  seat: ["escaño", "escaños"] as [string, string],
  stateLabel: {
    securities: ["Declara acciones, bonos u otros valores", "Declaran acciones, bonos u otros valores"],
    transcribed: ["Declaración transcrita, sin valores", "Declaración transcrita, sin valores"],
    pending: ["Declaración sin transcribir todavía", "Declaración sin transcribir todavía"],
    none: ["Sin declaración enlazada en su ficha", "Sin declaración enlazada en su ficha"],
  } as Record<Kind, [string, string]>,

  repNone: (name: string) => `No consta ningún diputado elegido por ${name} en los datos del Congreso.`,
  repOne: (name: string, short: string) =>
    `${name} elige 1 diputado al Congreso, ${WITH_ARTICLE.has(short) ? `del ${short}` : `de ${short}`}.`,
  repMany: (name: string, n: string, list: string) => `${name} elige ${n} diputados al Congreso: ${list}.`,
  seatsOf: (n: string, short: string) => (WITH_ARTICLE.has(short) ? `${n} del ${short}` : `${n} de ${short}`),

  payOneYes: "El Registro de Altos Cargos publica el sueldo de su único diputado.",
  payOneNo: "El Registro de Altos Cargos no publica el sueldo de su único diputado.",
  payAll: (n: string, name: string) => `El Registro de Altos Cargos publica el sueldo de los ${n} diputados de ${name}.`,
  payNone: (n: string, name: string) =>
    `El Registro de Altos Cargos no publica el sueldo de ninguno de los ${n} diputados de ${name}.`,
  paySome: (paid: string, n: string, name: string, rest: string) =>
    `El Registro de Altos Cargos publica el sueldo de ${paid} de los ${n} diputados de ${name}; de los otros ${rest} no consta.`,

  declNone: (name: string) => `Ningún diputado de ${name} tiene declaración de bienes enlazada en su ficha.`,
  declUnreadOne: "La declaración de bienes de su diputado no está transcrita todavía.",
  declUnreadMany: (filed: string, name: string) =>
    `Ninguna de las ${filed} declaraciones de bienes de los diputados de ${name} está transcrita todavía.`,
  declReadOneSec: (name: string) =>
    `El único diputado de ${name} con la declaración ya transcrita declara acciones, bonos u otros valores.`,
  declReadOneNoSec: (name: string) =>
    `El único diputado de ${name} con la declaración ya transcrita no declara acciones, bonos ni otros valores.`,
  declReadNoSec: (read: string, name: string) =>
    `Ninguno de los ${read} diputados de ${name} con la declaración ya transcrita declara acciones, bonos ni otros valores.`,
  declReadAllSec: (read: string, name: string) =>
    `Los ${read} diputados de ${name} con la declaración ya transcrita declaran acciones, bonos u otros valores.`,
  declReadSome: (sec: number, secFmt: string, read: string, name: string) =>
    `${secFmt} de los ${read} diputados de ${name} con la declaración ya transcrita ${sec === 1 ? "declara" : "declaran"} acciones, bonos u otros valores.`,

  moneyNone: (name: string, year: number) =>
    `Ninguna de las listas con escaño por ${name} recibió en ${year} una subvención estatal a su nombre.`,
  moneyOne: (year: number, amount: string, short: string, name: string) =>
    `En ${year}, el Estado concedió ${amount} ${WITH_ARTICLE.has(short) ? `al ${short}` : `a ${short}`}, la única lista con escaño por ${name}, para toda España.`,
  moneyMany: (lists: string, name: string, all: boolean, funded: string, year: number, amount: string, short: string) =>
    `De las ${lists} listas con escaño por ${name}, ${all ? "todas" : funded} recibieron en ${year} una subvención estatal a su nombre; la mayor, ${amount} ${WITH_ARTICLE.has(short) ? `del ${short}` : `de ${short}`}, para toda España.`,
  unfundedNif: (year: number) => `sin subvención estatal a su nombre en ${year}.`,
  unfundedPsoe: "es una federación del PSOE; la subvención se concede al PSOE, y no consta por separado.",
  unfundedCoalition:
    "fue una lista de coalición; la subvención se concede a cada partido por separado, y no a la lista.",

  registerNone: (ca: string) => `El Registro de Altos Cargos no sitúa ningún cargo en ${ca}.`,
  registerNoSalary: (count: string, ca: string) =>
    `El Registro de Altos Cargos sitúa ${count} cargos en ${ca}, y no publica el sueldo de ninguno.`,
  registerSome: (count: string, ca: string, withSalary: string, median: string) =>
    `El Registro de Altos Cargos sitúa ${count} cargos en ${ca}; publica el sueldo de ${withSalary}, con una mediana de ${median} al año.`,

  breadcrumb: "Territorios",
  heroSame: (name: string) =>
    `${name} es a la vez provincia y comunidad autónoma. Sus diputados se eligen aquí; las cifras de la comunidad, más abajo, son de ese mismo territorio.`,
  heroOther: (name: string, ca: string) =>
    `${name} es una provincia de ${ca}. Sus diputados se eligen aquí; las cifras de la comunidad, más abajo, son de toda ${ca} y no se reparten por provincias.`,
  mapTitle: (ca: string) => `Situación de ${ca}`,
  mapDesc: (ca: string) => `Mapa de las comunidades autónomas con ${ca} marcada.`,
  mapCaption: (ca: string) => `Marcada, ${ca}. El mapa es de comunidades: no dibuja las provincias.`,
  statDeputies: "Diputados en el Congreso",
  statDeputiesNote: "elegidos por esta provincia",
  statPaid: "Con sueldo publicado",
  statPaidNote: "en el Registro de Altos Cargos",
  statDecl: "Declaraciones transcritas",
  statDeclNote: "declaraciones de bienes en esta web",
  statPresides: (ca: string) => `Preside ${ca}`,
  statNoRecord: "No consta",
  statPresidesNote: (party: string, date: string) => `${party}, desde el ${date}`,
  statNoPresidency: "sin presidencia registrada",
  xOfY: (x: string, y: string) => `${x} de ${y}`,

  repTitle: "Quién la representa en el Congreso",
  boardNoneOne: "No consta en el patronato de ninguna fundación de partido.",
  boardNoneMany: "Ninguno de ellos consta en el patronato de una fundación de partido.",
  boardSome: (N: number, boardPeople: number, nPeople: string) =>
    `${N === 1 ? "Se sienta" : `${nPeople} ${boardPeople === 1 ? "de ellos se sienta" : "de ellos se sientan"}`} también en el patronato de una fundación de partido. Son dos registros sobre la misma persona, puestos uno al lado del otro.`,
  roleAt: (role: string) => `, ${role} en`,
  repSource:
    "Fuente: Congreso de los Diputados, datos abiertos de la legislatura en curso. Patronatos: Tribunal de Cuentas y registros de fundaciones, cruzados con el Registro de Altos Cargos solo cuando el nombre identifica a una sola persona y el partido coincide. Los senadores no se incluyen: el registro no dice por qué provincia fue elegido cada uno.",

  payTitle: "Lo que cobran",
  legendPublished: "Sueldo publicado",
  legendNotInRegister: "No consta en el registro",
  seeEach: "Ver el sueldo de cada diputado",
  payCaption: (name: string) => `Sueldo público anual de los diputados de ${name}, por apellido`,
  colDeputy: "Diputado o diputada",
  colRole: "Cargo en el registro",
  colGross: "Sueldo bruto anual",
  notInRegister: "No consta en el registro",
  srNoRecord: "no consta",
  sourceLabel: "Fuente:",
  updated: (date: string) => `, actualizado el ${date}`,
  paySourceTail:
    ". Por orden de apellido. «—» quiere decir que el registro no publica sueldo para esa persona, no que no cobre.",

  declTitle: "Lo que declaran sus diputados",
  declCongress: (sec: string, total: string) =>
    `En todo el Congreso, ${sec} de los ${total} diputados con la declaración ya transcrita declaran valores.`,
  dotSecurities: (sec: number): string =>
    sec === 1 ? "declara acciones, bonos u otros valores" : "declaran acciones, bonos u otros valores",
  dotTranscribed: "transcritas, sin valores declarados",
  dotPending: "sin transcribir todavía",
  declNoLink: (count: number, nCount: string) =>
    `${nCount} ${count === 1 ? "diputado no tiene" : "diputados no tienen"} declaración de bienes enlazada en su ficha del Congreso, y no se dibuja.`,
  declSource:
    "Fuente: declaraciones de bienes y rentas registradas en el Congreso, leídas del escaneo oficial y comprobadas antes de publicarse. Las cifras de cada una están en la ficha de la persona.",
  allDeclarations: "Ver todas las declaraciones",

  moneyTitle: "Dinero público a sus partidos",
  moneyBody: (name: string) =>
    `Es la subvención de cada partido para toda España. Ninguna fuente la reparte por provincias, y esta página tampoco: no dice cuánto llega a ${name}.`,
  moneySource: (year: number) =>
    `Fuente: Base de Datos Nacional de Subvenciones, concesiones del Ministerio del Interior a partidos políticos con fecha de ${year} (financiación ordinaria y gastos de seguridad). Es dinero del partido, no de sus diputados.`,

  communityCity: "La ciudad autónoma",
  communitySame: "La comunidad",
  communityOther: (ca: string) => `La comunidad: ${ca}`,
  communityBodySame: (ca: string) => `Lo que sigue está medido para ${ca}, que es la misma provincia.`,
  communityBodyOther: (ca: string, name: string) =>
    `Lo que sigue está medido para toda ${ca}, no para ${name}: estas cifras no existen por provincia, y dividirlas sería inventarlas.`,

  whoPresides: "Quién preside",
  presidentFinding: (president: string, party: string, ca: string, date: string) =>
    `${president} (${party}) preside ${ca} desde el ${date}.`,
  rest: "Resto",
  absMajority: (n: string) => `Mayoría absoluta, ${n}`,
  investVox: (pp: string, seats: string) =>
    `El PP tenía ${pp} de ${seats} escaños, y la investidura salió adelante con votos de Vox: sin ellos no había mayoría.`,
  investShort: (pp: string, seats: string) =>
    `El PP tenía ${pp} de ${seats} escaños, menos de la mayoría absoluta. Esta web recoge la aritmética; el acta de la votación no está verificada aquí, y en segunda vuelta basta la mayoría simple, así que no se afirma quién invistió a nadie.`,
  wikiPrefix: "Wikipedia, ",
  checkedTail: (date: string) =>
    `, comprobado el ${date}. Es quién ocupa la presidencia, no el resultado de las elecciones.`,
  noPresidency: "No consta presidencia para este territorio.",

  registerTitle: "Cargos públicos en el registro",
  withSalary: "Con sueldo publicado",
  withoutSalary: "Sin sueldo publicado",
  registerGap: (missing: string, total: string) =>
    `${missing} de las ${total} filas del registro no indican comunidad y no entran en este recuento. `,
  seePosts: "Ver estos cargos",
  orCompare: ", o ",
  compareOthers: "compararlos con otras comunidades",
  registerSourceTail: ". Sueldo bruto anual.",

  wagesTitle: (ca: string) => `Lo que se cobra en ${ca}`,
  wagesFinding: (ca: string, median: string, national: string) =>
    `La mitad de los asalariados de ${ca} cobró menos de ${median} brutos al año, frente a ${national} en el conjunto de España.`,
  wagesSource: "INE, Encuesta Anual de Estructura Salarial",
  wagesSourceTail: (period: string) => `, ${period}. Salario bruto anual por trabajador.`,
  noWages: (ca: string) =>
    `La encuesta salarial del INE no publica percentiles para ${ca}: sus tablas por comunidad cubren las diecisiete comunidades autónomas y no las dos ciudades autónomas. No se sustituye por la cifra nacional.`,
  wageP10: "El 10 % peor pagado, por debajo de",
  wageMedian: "Mediana",
  wageP90: "El 10 % mejor pagado, por encima de",
  wageNational: (value: string) => `España, mediana ${value}`,

  povertyTitle: "Riesgo de pobreza o exclusión",
  povertyFinding: (ca: string, pct: string, national: string) =>
    `En ${ca}, el ${pct} de la población está en riesgo de pobreza o exclusión social, frente al ${national} en el conjunto de España.`,
  spain: "España",
  povertySource: "INE, Encuesta de Condiciones de Vida",
  povertySourceTail: (period: string, base: string) =>
    `, ${period}. Serie ${base}. Es una proporción de la población, no un recuento.`,
  noPoverty: "La Encuesta de Condiciones de Vida no publica este indicador para este territorio.",

  hateTitle: "Delitos de odio registrados",
  hateFinding: (ca: string, total: string, year: number | string, rate: string, national: string) =>
    `En ${ca} constan ${total} hechos conocidos en ${year}, ${rate} por cada 100.000 habitantes, frente a ${national} en el conjunto de España.`,
  hateBody: (sogi: string) =>
    `Por orientación sexual e identidad de género: ${sogi}. Son hechos conocidos por las fuerzas de seguridad, no incidencia: una tasa más alta puede reflejar más denuncia y no más delito.`,
  per100k: (rate: string) => `${rate} por 100.000`,
  noHate: "El informe no localiza hechos conocidos en este territorio.",

  closing: (ca: string) =>
    `Nada de esta página une una cifra con otra. Lo que cobran o declaran sus diputados, el dinero de sus partidos y las cifras de ${ca} son hechos puestos uno al lado del otro, no una explicación.`,
};
type Copy = typeof es;

const en: Copy = {
  deputy: ["deputy", "deputies"],
  seat: ["seat", "seats"],
  stateLabel: {
    securities: ["Declares shares, bonds or other securities", "Declare shares, bonds or other securities"],
    transcribed: ["Declaration transcribed, no securities", "Declaration transcribed, no securities"],
    pending: ["Declaration not yet transcribed", "Declaration not yet transcribed"],
    none: ["No declaration linked on their profile", "No declaration linked on their profile"],
  },

  repNone: (name) => `No deputy elected for ${name} is on record in the Congress data.`,
  repOne: (name, short) => `${name} elects 1 deputy to the Congress, from ${short}.`,
  repMany: (name, n, list) => `${name} elects ${n} deputies to the Congress: ${list}.`,
  seatsOf: (n, short) => `${n} ${short}`,

  payOneYes: "The Senior Appointments Register publishes the salary of its only deputy.",
  payOneNo: "The Senior Appointments Register does not publish the salary of its only deputy.",
  payAll: (n, name) => `The Senior Appointments Register publishes the salary of all ${n} deputies for ${name}.`,
  payNone: (n, name) =>
    `The Senior Appointments Register publishes the salary of none of the ${n} deputies for ${name}.`,
  paySome: (paid, n, name, rest) =>
    `The Senior Appointments Register publishes the salary of ${paid} of the ${n} deputies for ${name}; for the other ${rest} none is on record.`,

  declNone: (name) => `No deputy for ${name} has an asset declaration linked on their profile.`,
  declUnreadOne: "The asset declaration of its deputy has not been transcribed yet.",
  declUnreadMany: (filed, name) =>
    `None of the ${filed} asset declarations of the deputies for ${name} has been transcribed yet.`,
  declReadOneSec: (name) =>
    `The only deputy for ${name} whose declaration is already transcribed declares shares, bonds or other securities.`,
  declReadOneNoSec: (name) =>
    `The only deputy for ${name} whose declaration is already transcribed does not declare shares, bonds or other securities.`,
  declReadNoSec: (read, name) =>
    `None of the ${read} deputies for ${name} whose declaration is already transcribed declares shares, bonds or other securities.`,
  declReadAllSec: (read, name) =>
    `The ${read} deputies for ${name} whose declaration is already transcribed declare shares, bonds or other securities.`,
  declReadSome: (sec, secFmt, read, name) =>
    `${secFmt} of the ${read} deputies for ${name} whose declaration is already transcribed ${sec === 1 ? "declares" : "declare"} shares, bonds or other securities.`,

  moneyNone: (name, year) =>
    `None of the lists with a seat for ${name} received a state subsidy in its own name in ${year}.`,
  moneyOne: (year, amount, short, name) =>
    `In ${year}, the State granted ${amount} to ${short}, the only list with a seat for ${name}, for all of Spain.`,
  moneyMany: (lists, name, all, funded, year, amount, short) =>
    `Of the ${lists} lists with a seat for ${name}, ${all ? "all" : funded} received a state subsidy in their own name in ${year}; the largest, ${amount} to ${short}, for all of Spain.`,
  unfundedNif: (year) => `no state subsidy in its own name in ${year}.`,
  unfundedPsoe: "is a federation of the PSOE; the subsidy is granted to the PSOE, and is not recorded separately.",
  unfundedCoalition:
    "was a coalition list; the subsidy is granted to each party separately, not to the list.",

  registerNone: (ca) => `The Senior Appointments Register places no officeholder in ${ca}.`,
  registerNoSalary: (count, ca) =>
    `The Senior Appointments Register places ${count} officeholders in ${ca}, and publishes the salary of none.`,
  registerSome: (count, ca, withSalary, median) =>
    `The Senior Appointments Register places ${count} officeholders in ${ca}; it publishes the salary of ${withSalary}, with a median of ${median} a year.`,

  breadcrumb: "Territories",
  heroSame: (name) =>
    `${name} is both a province and an autonomous community. Its deputies are elected here; the community's figures, further down, are for that same territory.`,
  heroOther: (name, ca) =>
    `${name} is a province of ${ca}. Its deputies are elected here; the community's figures, further down, are for all of ${ca} and are not split by province.`,
  mapTitle: (ca) => `Location of ${ca}`,
  mapDesc: (ca) => `Map of the autonomous communities with ${ca} marked.`,
  mapCaption: (ca) => `Marked, ${ca}. The map is of communities: it does not draw the provinces.`,
  statDeputies: "Deputies in the Congress",
  statDeputiesNote: "elected by this province",
  statPaid: "With published salary",
  statPaidNote: "in the Senior Appointments Register",
  statDecl: "Declarations transcribed",
  statDeclNote: "asset declarations on this site",
  statPresides: (ca) => `Presides over ${ca}`,
  statNoRecord: "None on record",
  statPresidesNote: (party, date) => `${party}, since ${date}`,
  statNoPresidency: "no presidency on record",
  xOfY: (x, y) => `${x} of ${y}`,

  repTitle: "Who represents it in the Congress",
  boardNoneOne: "Not on the board of any party foundation on record.",
  boardNoneMany: "None of them is on record on the board of a party foundation.",
  boardSome: (N, boardPeople, nPeople) =>
    `${N === 1 ? "The deputy sits" : `${nPeople} of them ${boardPeople === 1 ? "sits" : "sit"}`} also on the board of a party foundation. These are two records about the same person, placed side by side.`,
  roleAt: (role) => `, ${role} at`,
  repSource:
    "Source: Congress of Deputies, open data for the current legislature. Boards: Court of Auditors and foundation registers, cross-checked with the Senior Appointments Register only where the name identifies a single person and the party matches. Senators are not included: the register does not say for which province each was elected.",

  payTitle: "What they are paid",
  legendPublished: "Salary published",
  legendNotInRegister: "Not on record in the register",
  seeEach: "See each deputy's salary",
  payCaption: (name) => `Annual public salary of the deputies for ${name}, by surname`,
  colDeputy: "Deputy",
  colRole: "Post in the register",
  colGross: "Gross annual salary",
  notInRegister: "Not on record in the register",
  srNoRecord: "not on record",
  sourceLabel: "Source:",
  updated: (date) => `, updated on ${date}`,
  paySourceTail:
    ". In surname order. “—” means the register does not publish a salary for that person, not that they are not paid.",

  declTitle: "What their deputies declare",
  declCongress: (sec, total) =>
    `Across the whole Congress, ${sec} of the ${total} deputies whose declaration is already transcribed declare securities.`,
  dotSecurities: (sec) =>
    sec === 1 ? "declares shares, bonds or other securities" : "declare shares, bonds or other securities",
  dotTranscribed: "transcribed, no securities declared",
  dotPending: "not yet transcribed",
  declNoLink: (count, nCount) =>
    `${nCount} ${count === 1 ? "deputy has" : "deputies have"} no asset declaration linked on their Congress profile, and is not drawn.`,
  declSource:
    "Source: asset and income declarations registered in the Congress, read from the official scan and checked before publication. Each one's figures are on the person's page.",
  allDeclarations: "See all declarations",

  moneyTitle: "Public money to their parties",
  moneyBody: (name) =>
    `This is each party's subsidy for the whole of Spain. No source splits it by province, and this page does not either: it does not say how much reaches ${name}.`,
  moneySource: (year) =>
    `Source: National Subsidies Database (BDNS), grants from the Interior Ministry to political parties dated ${year} (ordinary funding and security costs). It is the party's money, not its deputies'.`,

  communityCity: "The autonomous city",
  communitySame: "The community",
  communityOther: (ca) => `The community: ${ca}`,
  communityBodySame: (ca) => `What follows is measured for ${ca}, which is the same province.`,
  communityBodyOther: (ca, name) =>
    `What follows is measured for all of ${ca}, not for ${name}: these figures do not exist by province, and dividing them would be making them up.`,

  whoPresides: "Who presides",
  presidentFinding: (president, party, ca, date) =>
    `${president} (${party}) has presided over ${ca} since ${date}.`,
  rest: "Rest",
  absMajority: (n) => `Absolute majority, ${n}`,
  investVox: (pp, seats) =>
    `The PP held ${pp} of ${seats} seats, and the investiture carried with votes from Vox: without them there was no majority.`,
  investShort: (pp, seats) =>
    `The PP held ${pp} of ${seats} seats, short of an absolute majority. This site records the arithmetic; the division record itself is not verified here, and a second round needs only a simple majority, so nothing is claimed about who invested whom.`,
  wikiPrefix: "Wikipedia, ",
  checkedTail: (date) =>
    `, checked on ${date}. It is who holds the presidency, not the result of the elections.`,
  noPresidency: "No presidency is on record for this territory.",

  registerTitle: "Public officeholders in the register",
  withSalary: "With published salary",
  withoutSalary: "Without published salary",
  registerGap: (missing, total) =>
    `${missing} of the register's ${total} rows state no community and are not in this count. `,
  seePosts: "See these officeholders",
  orCompare: ", or ",
  compareOthers: "compare them with other communities",
  registerSourceTail: ". Gross annual salary.",

  wagesTitle: (ca) => `What is earned in ${ca}`,
  wagesFinding: (ca, median, national) =>
    `Half of the employees in ${ca} earned less than ${median} gross a year, against ${national} across Spain.`,
  wagesSource: "INE, Annual Earnings Structure Survey",
  wagesSourceTail: (period) => `, ${period}. Gross annual wage per worker.`,
  noWages: (ca) =>
    `INE's earnings survey publishes no percentiles for ${ca}: its regional tables cover the seventeen comunidades autónomas and not the two autonomous cities. The national figure is not substituted for it.`,
  wageP10: "The lowest-paid 10%, below",
  wageMedian: "Median",
  wageP90: "The highest-paid 10%, above",
  wageNational: (value) => `Spain, median ${value}`,

  povertyTitle: "At risk of poverty or exclusion",
  povertyFinding: (ca, pct, national) =>
    `In ${ca}, ${pct} of the population is at risk of poverty or social exclusion, against ${national} across Spain.`,
  spain: "Spain",
  povertySource: "INE, Living Conditions Survey",
  povertySourceTail: (period, base) =>
    `, ${period}. ${base} series. It is a share of the population, not a count.`,
  noPoverty: "The Living Conditions Survey publishes no figure for this territory.",

  hateTitle: "Recorded hate crime",
  hateFinding: (ca, total, year, rate, national) =>
    `In ${ca}, ${total} known incidents are on record for ${year}, ${rate} per 100,000 inhabitants, against ${national} across Spain.`,
  hateBody: (sogi) =>
    `By sexual orientation and gender identity: ${sogi}. These are incidents known to the security forces, not incidence: a higher rate may reflect more reporting and not more crime.`,
  per100k: (rate) => `${rate} per 100,000`,
  noHate: "The report locates no known incidents in this territory.",

  closing: (ca) =>
    `Nothing on this page joins one figure to another. What their deputies are paid or declare, their parties' money and the figures for ${ca} are facts placed side by side, not an explanation.`,
};

const caOf = (short: string) =>
  WITH_ARTICLE.has(short) ? `del ${short}` : VOWEL.test(short) ? `d'${short}` : `de ${short}`;

const ca: Copy = {
  deputy: ["diputat", "diputats"],
  seat: ["escó", "escons"],
  stateLabel: {
    securities: ["Declara accions, bons o altres valors", "Declaren accions, bons o altres valors"],
    transcribed: ["Declaració transcrita, sense valors", "Declaració transcrita, sense valors"],
    pending: ["Declaració encara sense transcriure", "Declaració encara sense transcriure"],
    none: ["Sense declaració enllaçada a la seva fitxa", "Sense declaració enllaçada a la seva fitxa"],
  },

  repNone: (name) => `No consta cap diputat elegit per ${name} a les dades del Congrés.`,
  repOne: (name, short) => `${name} elegeix 1 diputat al Congrés, ${caOf(short)}.`,
  repMany: (name, n, list) => `${name} elegeix ${n} diputats al Congrés: ${list}.`,
  seatsOf: (n, short) => `${n} ${caOf(short)}`,

  payOneYes: "El Registre d'Alts Càrrecs publica el sou del seu únic diputat.",
  payOneNo: "El Registre d'Alts Càrrecs no publica el sou del seu únic diputat.",
  payAll: (n, name) => `El Registre d'Alts Càrrecs publica el sou dels ${n} diputats elegits per ${name}.`,
  payNone: (n, name) =>
    `El Registre d'Alts Càrrecs no publica el sou de cap dels ${n} diputats elegits per ${name}.`,
  paySome: (paid, n, name, rest) =>
    `El Registre d'Alts Càrrecs publica el sou de ${paid} dels ${n} diputats elegits per ${name}; dels altres ${rest} no consta.`,

  declNone: (name) => `Cap diputat elegit per ${name} té declaració de béns enllaçada a la seva fitxa.`,
  declUnreadOne: "La declaració de béns del seu diputat encara no està transcrita.",
  declUnreadMany: (filed, name) =>
    `Cap de les ${filed} declaracions de béns dels diputats elegits per ${name} no està transcrita encara.`,
  declReadOneSec: (name) =>
    `L'únic diputat elegit per ${name} amb la declaració ja transcrita declara accions, bons o altres valors.`,
  declReadOneNoSec: (name) =>
    `L'únic diputat elegit per ${name} amb la declaració ja transcrita no declara accions, bons ni altres valors.`,
  declReadNoSec: (read, name) =>
    `Cap dels ${read} diputats elegits per ${name} amb la declaració ja transcrita declara accions, bons ni altres valors.`,
  declReadAllSec: (read, name) =>
    `Els ${read} diputats elegits per ${name} amb la declaració ja transcrita declaren accions, bons o altres valors.`,
  declReadSome: (sec, secFmt, read, name) =>
    `${secFmt} dels ${read} diputats elegits per ${name} amb la declaració ja transcrita ${sec === 1 ? "declara" : "declaren"} accions, bons o altres valors.`,

  moneyNone: (name, year) =>
    `Cap de les llistes amb escó per ${name} va rebre el ${year} una subvenció estatal a nom seu.`,
  moneyOne: (year, amount, short, name) =>
    `El ${year}, l'Estat va concedir ${amount} ${WITH_ARTICLE.has(short) ? `al ${short}` : `a ${short}`}, l'única llista amb escó per ${name}, per a tota Espanya.`,
  moneyMany: (lists, name, all, funded, year, amount, short) =>
    `De les ${lists} llistes amb escó per ${name}, ${all ? "totes" : funded} van rebre el ${year} una subvenció estatal a nom seu; la més gran, ${amount} ${caOf(short)}, per a tota Espanya.`,
  unfundedNif: (year) => `sense subvenció estatal a nom seu el ${year}.`,
  unfundedPsoe: "és una federació del PSOE; la subvenció es concedeix al PSOE, i no consta per separat.",
  unfundedCoalition:
    "va ser una llista de coalició; la subvenció es concedeix a cada partit per separat, i no a la llista.",

  registerNone: (ca) => `El Registre d'Alts Càrrecs no situa cap càrrec a ${ca}.`,
  registerNoSalary: (count, ca) =>
    `El Registre d'Alts Càrrecs situa ${count} càrrecs a ${ca}, i no publica el sou de cap.`,
  registerSome: (count, ca, withSalary, median) =>
    `El Registre d'Alts Càrrecs situa ${count} càrrecs a ${ca}; publica el sou de ${withSalary}, amb una mediana de ${median} a l'any.`,

  breadcrumb: "Territoris",
  heroSame: (name) =>
    `${name} és alhora província i comunitat autònoma. Els seus diputats s'hi elegeixen; les xifres de la comunitat, més avall, són d'aquest mateix territori.`,
  heroOther: (name, ca) =>
    `${name} pertany a ${ca}. Els seus diputats s'hi elegeixen; les xifres de la comunitat, més avall, són de tota ${ca} i no es reparteixen per províncies.`,
  mapTitle: (ca) => `${ca}: situació al mapa`,
  mapDesc: (ca) => `Mapa de les comunitats autònomes amb ${ca} marcada.`,
  mapCaption: (ca) => `Marcada, ${ca}. El mapa és de comunitats: no dibuixa les províncies.`,
  statDeputies: "Diputats al Congrés",
  statDeputiesNote: "elegits per aquesta província",
  statPaid: "Amb sou publicat",
  statPaidNote: "al Registre d'Alts Càrrecs",
  statDecl: "Declaracions transcrites",
  statDeclNote: "declaracions de béns en aquest web",
  statPresides: (ca) => `Presideix ${ca}`,
  statNoRecord: "No consta",
  statPresidesNote: (party, date) => `${party}, des del ${date}`,
  statNoPresidency: "sense presidència registrada",
  xOfY: (x, y) => `${x} de ${y}`,

  repTitle: "Qui la representa al Congrés",
  boardNoneOne: "No consta al patronat de cap fundació de partit.",
  boardNoneMany: "Cap d'ells consta al patronat d'una fundació de partit.",
  boardSome: (N, boardPeople, nPeople) =>
    `${N === 1 ? "El diputat seu" : `${nPeople} d'ells ${boardPeople === 1 ? "seu" : "seuen"}`} també al patronat d'una fundació de partit. Són dos registres sobre la mateixa persona, posats l'un al costat de l'altre.`,
  roleAt: (role) => `, ${role} a`,
  repSource:
    "Font: Congrés dels Diputats, dades obertes de la legislatura en curs. Patronats: Tribunal de Comptes i registres de fundacions, creuats amb el Registre d'Alts Càrrecs només quan el nom identifica una sola persona i el partit coincideix. Els senadors no s'inclouen: el registre no diu per quina província va ser elegit cadascun.",

  payTitle: "El que cobren",
  legendPublished: "Sou publicat",
  legendNotInRegister: "No consta al registre",
  seeEach: "Veure el sou de cada diputat",
  payCaption: (name) => `Sou públic anual dels diputats elegits per ${name}, per cognom`,
  colDeputy: "Diputat o diputada",
  colRole: "Càrrec al registre",
  colGross: "Sou brut anual",
  notInRegister: "No consta al registre",
  srNoRecord: "no consta",
  sourceLabel: "Font:",
  updated: (date) => `, actualitzat el ${date}`,
  paySourceTail:
    ". Per ordre de cognom. «—» vol dir que el registre no publica sou d'aquesta persona, no que no cobri.",

  declTitle: "El que declaren els seus diputats",
  declCongress: (sec, total) =>
    `En tot el Congrés, ${sec} dels ${total} diputats amb la declaració ja transcrita declaren valors.`,
  dotSecurities: (sec) =>
    sec === 1 ? "declara accions, bons o altres valors" : "declaren accions, bons o altres valors",
  dotTranscribed: "transcrites, sense valors declarats",
  dotPending: "encara sense transcriure",
  declNoLink: (count, nCount) =>
    `${nCount} ${count === 1 ? "diputat no té" : "diputats no tenen"} declaració de béns enllaçada a la seva fitxa del Congrés, i no es dibuixa.`,
  declSource:
    "Font: declaracions de béns i rendes registrades al Congrés, llegides de l'escaneig oficial i comprovades abans de publicar-se. Les xifres de cadascuna són a la fitxa de la persona.",
  allDeclarations: "Veure totes les declaracions",

  moneyTitle: "Diners públics als seus partits",
  moneyBody: (name) =>
    `És la subvenció de cada partit per a tota Espanya. Cap font la reparteix per províncies, i aquesta pàgina tampoc: no diu quant arriba a ${name}.`,
  moneySource: (year) =>
    `Font: Base de Dades Nacional de Subvencions, concessions del Ministeri de l'Interior a partits polítics amb data de ${year} (finançament ordinari i despeses de seguretat). És diner del partit, no dels seus diputats.`,

  communityCity: "La ciutat autònoma",
  communitySame: "La comunitat",
  communityOther: (ca) => `La comunitat: ${ca}`,
  communityBodySame: (ca) => `El que segueix està mesurat per a ${ca}, que és la mateixa província.`,
  communityBodyOther: (ca, name) =>
    `El que segueix està mesurat per a tota ${ca}, no per a ${name}: aquestes xifres no existeixen per província, i dividir-les seria inventar-les.`,

  whoPresides: "Qui presideix",
  presidentFinding: (president, party, ca, date) =>
    `${president} (${party}) presideix ${ca} des del ${date}.`,
  rest: "Resta",
  absMajority: (n) => `Majoria absoluta, ${n}`,
  investVox: (pp, seats) =>
    `El PP tenia ${pp} de ${seats} escons, i la investidura va tirar endavant amb vots de Vox: sense ells no hi havia majoria.`,
  investShort: (pp, seats) =>
    `El PP tenia ${pp} de ${seats} escons, menys de la majoria absoluta. Aquest web recull l'aritmètica; l'acta de la votació no està verificada aquí, i en segona volta n'hi ha prou amb la majoria simple, així que no s'afirma qui va investir ningú.`,
  wikiPrefix: "Wikipedia, ",
  checkedTail: (date) =>
    `, comprovat el ${date}. És qui ocupa la presidència, no el resultat de les eleccions.`,
  noPresidency: "No consta presidència per a aquest territori.",

  registerTitle: "Càrrecs públics al registre",
  withSalary: "Amb sou publicat",
  withoutSalary: "Sense sou publicat",
  registerGap: (missing, total) =>
    `${missing} de les ${total} files del registre no indiquen comunitat i no entren en aquest recompte. `,
  seePosts: "Veure aquests càrrecs",
  orCompare: ", o ",
  compareOthers: "comparar-los amb altres comunitats",
  registerSourceTail: ". Sou brut anual.",

  wagesTitle: (ca) => `El que es cobra a ${ca}`,
  wagesFinding: (ca, median, national) =>
    `La meitat dels assalariats de ${ca} va cobrar menys de ${median} bruts a l'any, davant de ${national} al conjunt d'Espanya.`,
  wagesSource: "INE, Enquesta Anual d'Estructura Salarial",
  wagesSourceTail: (period) => `, ${period}. Salari brut anual per treballador.`,
  noWages: (ca) =>
    `L'enquesta salarial de l'INE no publica percentils per a ${ca}: les seves taules per comunitat cobreixen les disset comunitats autònomes i no les dues ciutats autònomes. No se substitueix per la xifra estatal.`,
  wageP10: "El 10 % pitjor pagat, per sota de",
  wageMedian: "Mediana",
  wageP90: "El 10 % millor pagat, per sobre de",
  wageNational: (value) => `Espanya, mediana ${value}`,

  povertyTitle: "Risc de pobresa o exclusió",
  povertyFinding: (ca, pct, national) =>
    `A ${ca}, el ${pct} de la població està en risc de pobresa o exclusió social, davant del ${national} al conjunt d'Espanya.`,
  spain: "Espanya",
  povertySource: "INE, Enquesta de Condicions de Vida",
  povertySourceTail: (period, base) =>
    `, ${period}. Sèrie ${base}. És una proporció de la població, no un recompte.`,
  noPoverty: "L'Enquesta de Condicions de Vida no publica aquest indicador per a aquest territori.",

  hateTitle: "Delictes d'odi registrats",
  hateFinding: (ca, total, year, rate, national) =>
    `A ${ca} consten ${total} fets coneguts el ${year}, ${rate} per cada 100.000 habitants, davant de ${national} al conjunt d'Espanya.`,
  hateBody: (sogi) =>
    `Per orientació sexual i identitat de gènere: ${sogi}. Són fets coneguts per les forces de seguretat, no incidència: una taxa més alta pot reflectir més denúncia i no més delicte.`,
  per100k: (rate) => `${rate} per 100.000`,
  noHate: "L'informe no localitza fets coneguts en aquest territori.",

  closing: (ca) =>
    `Res d'aquesta pàgina uneix una xifra amb una altra. El que cobren o declaren els seus diputats, els diners dels seus partits i les xifres de ${ca} són fets posats l'un al costat de l'altre, no una explicació.`,
};

export const COPY: Record<Locale, Copy> = { es, en, ca };
