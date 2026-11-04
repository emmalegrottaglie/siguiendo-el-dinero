import type { Locale } from "@/lib/locales";

/**
 * Strings of the prototype's context page: the country's scale, from INE.
 *
 * Started from the current site's `contexto` dictionary in `lib/i18n.ts`,
 * which is already translated, and kept at its strength: nothing here joins
 * an indicator to a party, a vote or a salary. Interpolated sentences take
 * already-formatted values. INE's own labels (sectors, tranches, comunidades,
 * table names) and the BOE's decree titles are data and are never translated.
 */
const es = {
  metaTitle: "La escala del país",
  title: "La escala del país",
  intro:
    "Esta web publica lo que cobran los partidos y lo que cobran los cargos públicos. Ninguna de esas cifras significa nada sin una escala. Ésta es la escala, tomada del INE, que es quien la produce.",
  framingLead: "Aquí no se une nada.",
  framingBody:
    "No hay línea que vaya de una tasa de pobreza a un voto, ni correlación, ni ordenación de partidos por nada calculado a partir de estos datos. Las cifras se ponen unas al lado de otras y quien lee saca sus conclusiones: una línea trazada aquí afirmaría algo que los datos no sostienen.",
  sourceLabel: "Fuente:",
  sourcesLabel: "Fuentes:",
  table: (id: string) => `tabla ${id}`,
  and: " y ",
  downloaded: (date: string) => `Datos descargados del INE el ${date}.`,
  lowSample: "muestra reducida",
  lowSampleNone:
    "El INE marca con un signo menos las celdas cuya muestra tiene entre 100 y 500 observaciones: no son cifras negativas, son cifras con alta variabilidad. Se conservan y se señalan; ninguna de las mostradas aquí lleva esa marca.",
  lowSampleSome: (n: number) =>
    `El INE marca con un signo menos las celdas cuya muestra tiene entre 100 y 500 observaciones: no son cifras negativas, son cifras con alta variabilidad. Se conservan y se señalan: ${n === 1 ? "una de las mostradas aquí lleva" : `${n} de las mostradas aquí llevan`} esa marca, indicada como «muestra reducida».`,

  // Wages
  wagesTitle: "Lo que se cobra en España",
  wagesFinding: (year: string, mean: string, median: string) =>
    `En ${year}, el salario bruto medio anual fue de ${mean}, pero la mitad de los asalariados cobró menos de ${median}.`,
  wagesBody: (p10: string, p90: string) =>
    `La mediana es la cifra que deja a la mitad de los asalariados por debajo. La diferencia con la media es la cola alta: el 10 % peor pagado no llegó a ${p10} y el 10 % mejor pagado superó ${p90}.`,
  scaleKey:
    "Cada estación de la línea es un percentil que publica el INE, sobre una escala en euros que empieza en cero. La media va encima de la línea: no es un punto de la distribución sino su promedio, y la cola alta la sube por encima de la mediana.",
  meanLabel: "Media",
  stations: {
    p10: { label: "Percentil 10", note: "el 10 % cobra menos" },
    q1: { label: "Cuartil inferior", note: "el 25 % cobra menos" },
    median: { label: "Mediana", note: "la mitad cobra menos" },
    q3: { label: "Cuartil superior", note: "el 75 % cobra menos" },
    p90: { label: "Percentil 90", note: "el 90 % cobra menos" },
  },
  jornada: (full: string, part: string) =>
    `Una advertencia que cambia cómo leer todo lo anterior: la EAES cuenta a tiempo parcial y a tiempo completo en la misma media, así que ninguna de estas cifras es «lo que paga un puesto». A jornada completa la media fue de ${full}; a jornada parcial, de ${part}.`,
  sectorsTitle: "Por sector de actividad",
  sectorsFinding: (ratio: string, high: string, highValue: string, low: string, lowValue: string) =>
    `Entre el sector mejor y el peor pagado hay un factor de ${ratio}: ${high} con ${highValue} frente a ${low} con ${lowValue}.`,
  sectorsKey:
    "Cada sector es una estación sobre la misma escala en euros, que empieza en cero; están todos, del mejor al peor pagado, para que se vea la distancia entera. La marca vertical de cada fila es la media de todas las secciones, de la misma tabla.",
  allSections: (value: string) => `Media de todas las secciones: ${value}`,
  sectorsCaption: "Salario bruto medio anual por sector de actividad",
  wagesSourceTail:
    "Salario bruto anual por trabajador, ambos sexos, toda España, jornada completa y parcial juntas salvo en la advertencia sobre la jornada.",

  // SMI
  smiTitle: "Toda la masa salarial, en múltiplos del SMI",
  smiFinding: (year: string, underTwo: string) =>
    `En ${year}, el ${underTwo} de los asalariados cobró menos de dos salarios mínimos.`,
  smiBody:
    "El mismo eje para cualquier sueldo de esta web. Los tramos son los del INE, calculados sobre el salario mínimo interprofesional (SMI) del propio año.",
  smiPeoplePre: "Lo que el registro publica de cada cargo está en ",
  smiPeopleLink: "el directorio de personas",
  smiPeoplePost: ". Esta página no pone a nadie sobre la escala.",
  smiStation: (n: number) => (n === 0 ? "0" : `${n} SMI`),
  smiEuro: (value: string) => `${value} al año`,
  smiKey: (top: string) =>
    `Cada estación es un múltiplo del SMI y cada peldaño, el tramo entre dos estaciones. Los tramos suman el total de asalariados. Se dibujan como peldaños separados y no apilados porque el tramo superior es el ${top} y apilado no se vería; cada peldaño lleva su porcentaje exacto, y las barras se miden contra el tramo más grande.`,
  smiEuroExplain: (year: string, annual: string, payments: number, monthly: string) =>
    `Los importes en euros junto a cada estación son una multiplicación de esta web, no una cifra del INE: el SMI de ${year}, ${annual} brutos al año (${payments} pagas de ${monthly}), por el múltiplo.`,
  smiNoEuro: (year: string) =>
    `Esta web no tiene transcrito el SMI de ${year}, así que las estaciones no llevan su importe en euros.`,
  smiCaption: "Porcentaje de asalariados por tramo de salario en múltiplos del SMI",
  smiDecree: "SMI:",

  // Poverty
  povertyTitle: "A cuánta gente afecta",
  povertyFinding: (year: string, arope: string) =>
    `En ${year}, el ${arope} de la población estaba en riesgo de pobreza o exclusión social.`,
  povertyBody:
    "Cuatro indicadores de la Encuesta de Condiciones de Vida. Cada uno es una proporción de una población, así que la parte vacía de la barra es el resto del país.",
  povertyRows: {
    arope: "En riesgo de pobreza o exclusión social (AROPE)",
    aropeChildren: "AROPE, menores de 16 años",
    atRisk: "En riesgo de pobreza (renta del año anterior)",
    deprivation: "Con carencia material y social severa",
  },
  povertySpread: (high: string, highRegion: string, low: string, lowRegion: string) =>
    `La cifra nacional no describe a ninguna comunidad en concreto: va de ${high} en ${highRegion} a ${low} en ${lowRegion}.`,
  povertyBase: (base: string) =>
    `Serie ${base}, indicada porque la misma tabla puede contener definiciones distintas del mismo indicador.`,
  povertyMultipleBases: (bases: string, shown: string) =>
    `La tabla contiene más de una definición (${bases}). Aquí se muestra ${shown}; no se mezclan, porque miden cosas distintas con el mismo nombre.`,
  povertyNote:
    "Estas cifras no se cruzan con ningún voto ni con ninguna financiación de esta web. Están aquí para que quien lea tenga delante las dos cosas, no para afirmar que una explica la otra.",
  regionsSummary: (n: number) => `Las ${n} comunidades y ciudades autónomas`,
  regionsCaption: "Indicadores de pobreza por comunidad autónoma",
  colRegion: "Comunidad",
  colArope: "AROPE",
  colAtRisk: "En riesgo de pobreza",
  colDeprivation: "Carencia material y social severa",
  national: "España (total nacional)",
  regionsOrder: "En el orden en que las publica el INE.",
  ecv: "Encuesta de Condiciones de Vida",
  eaes: "Encuesta Anual de Estructura Salarial",

  // Gaps
  gapsTitle: "Lo que no muestra",
  gaps: {
    yearsTitle: "Un año por cifra, sin tendencia",
    years: (wages: string, poverty: string) =>
      `Los salarios son de ${wages} y la pobreza, de ${poverty}. No se dibuja ninguna serie en el tiempo, y cifras de años distintos no se suman, no se restan ni se ponen en la misma barra.`,
    modeTitle: "El salario más frecuente",
    mode:
      "La moda, el salario que más gente cobra, no está en las tablas que esta web descarga del INE. Por eso la media nunca va sola: se publican con ella la mediana y los percentiles.",
    breakdownTitle: "Por sexo y por comunidad",
    breakdownPre:
      "El INE publica estos salarios también por sexo y por comunidad autónoma. Aquí van para ambos sexos y toda España; las cifras de cada comunidad están en ",
    breakdownLink: "la página de cada provincia",
    breakdownPost: ".",
    thresholdTitle: "Un umbral de pobreza fijo",
    threshold:
      "La tasa de riesgo de pobreza es relativa: se mide contra la renta mediana del mismo año, así que puede bajar cuando todo el país empobrece a la vez. El INE publica también una tasa contra un umbral fijo, que esta web aún no descarga.",
    housingTitle: "La vivienda",
    housing:
      "Alquileres, viviendas vacías y personas sin hogar aún no están en esta web.",
  },
};

type Copy = typeof es;

const en: Copy = {
  metaTitle: "The country's scale",
  title: "The country's scale",
  intro:
    "This site publishes what parties are paid and what officeholders earn. Neither figure means anything without a scale. This is that scale, taken from INE, which produces it.",
  framingLead: "Nothing here is joined up.",
  framingBody:
    "There is no line from a poverty rate to a vote, no correlation, no ordering of parties by anything computed from these numbers. The figures sit next to each other and the reader does the joining: a line drawn here would assert something the data cannot carry.",
  sourceLabel: "Source:",
  sourcesLabel: "Sources:",
  table: (id) => `table ${id}`,
  and: " and ",
  downloaded: (date) => `Data downloaded from INE on ${date}.`,
  lowSample: "small sample",
  lowSampleNone:
    "INE marks cells whose sample holds between 100 and 500 observations with a leading minus sign: those are not negative figures, they are figures with high variability. They are kept and marked; none shown here carries the mark.",
  lowSampleSome: (n) =>
    `INE marks cells whose sample holds between 100 and 500 observations with a leading minus sign: those are not negative figures, they are figures with high variability. They are kept and marked: ${n === 1 ? "one figure shown here carries" : `${n} figures shown here carry`} the mark, labelled “small sample”.`,

  wagesTitle: "What Spain earns",
  wagesFinding: (year, mean, median) =>
    `In ${year}, mean gross annual earnings were ${mean}, but half of all employees earned less than ${median}.`,
  wagesBody: (p10, p90) =>
    `The median is the figure with half of all employees below it. The difference from the mean is the upper tail: the lowest-paid tenth did not reach ${p10}, and the highest-paid tenth cleared ${p90}.`,
  scaleKey:
    "Each station on the line is a percentile INE publishes, on a euro scale that starts at zero. The mean sits above the line: it is not a point in the distribution but its average, and the upper tail lifts it above the median.",
  meanLabel: "Mean",
  stations: {
    p10: { label: "10th percentile", note: "10% earn less" },
    q1: { label: "Lower quartile", note: "25% earn less" },
    median: { label: "Median", note: "half earn less" },
    q3: { label: "Upper quartile", note: "75% earn less" },
    p90: { label: "90th percentile", note: "90% earn less" },
  },
  jornada: (full, part) =>
    `One caveat that changes how everything above should be read: EAES counts part-time and full-time workers in the same mean, so none of these figures is “what a job pays”. Full-time work averaged ${full}; part-time work averaged ${part}.`,
  sectorsTitle: "By sector of activity",
  sectorsFinding: (ratio, high, highValue, low, lowValue) =>
    `The best- and worst-paid sectors are a factor of ${ratio} apart: ${high} at ${highValue} against ${low} at ${lowValue}.`,
  sectorsKey:
    "Each sector is a station on the same euro scale, starting at zero; all of them are drawn, best- to worst-paid, so the whole distance is visible. The vertical mark in each row is the mean across all sections, from the same table.",
  allSections: (value) => `Mean across all sections: ${value}`,
  sectorsCaption: "Mean gross annual earnings by sector of activity",
  wagesSourceTail:
    "Gross annual earnings per employee, both sexes, all of Spain, full-time and part-time together except in the caveat on working hours.",

  smiTitle: "The whole payroll, in multiples of the minimum wage",
  smiFinding: (year, underTwo) =>
    `In ${year}, ${underTwo} of employees earned less than two minimum wages.`,
  smiBody:
    "One axis for every salary on this site. The tranches are INE's own, computed against the minimum wage (salario mínimo interprofesional, SMI) of the same year.",
  smiPeoplePre: "What the register publishes for each post is in ",
  smiPeopleLink: "the people directory",
  smiPeoplePost: ". This page places no one on the scale.",
  smiStation: (n) => (n === 0 ? "0" : `${n} × SMI`),
  smiEuro: (value) => `${value} a year`,
  smiKey: (top) =>
    `Each station is a multiple of the SMI and each rung the tranche between two stations. The tranches account for all employees. They are drawn as separate rungs rather than stacked because the top tranche is ${top} and would be invisible in a stack; every rung prints its exact percentage, and the bars are measured against the largest tranche.`,
  smiEuroExplain: (year, annual, payments, monthly) =>
    `The euro amounts beside each station are this site's multiplication, not an INE figure: the ${year} SMI, ${annual} gross a year (${payments} payments of ${monthly}), times the multiple.`,
  smiNoEuro: (year) =>
    `This site has not transcribed the ${year} SMI, so the stations carry no euro amount.`,
  smiCaption: "Share of employees by earnings tranche in multiples of the SMI",
  smiDecree: "SMI:",

  povertyTitle: "How many people it reaches",
  povertyFinding: (year, arope) =>
    `In ${year}, ${arope} of the population was at risk of poverty or social exclusion.`,
  povertyBody:
    "Four indicators from the Living Conditions Survey. Each is a share of a population, so the unfilled part of the bar is the rest of the country.",
  povertyRows: {
    arope: "At risk of poverty or social exclusion (AROPE)",
    aropeChildren: "AROPE, under 16s",
    atRisk: "At risk of poverty (prior year's income)",
    deprivation: "In severe material and social deprivation",
  },
  povertySpread: (high, highRegion, low, lowRegion) =>
    `The national figure describes no particular community: it runs from ${high} in ${highRegion} to ${low} in ${lowRegion}.`,
  povertyBase: (base) =>
    `${base} series, stated because the same table can hold more than one definition of the same indicator.`,
  povertyMultipleBases: (bases, shown) =>
    `The table holds more than one definition (${bases}). ${shown} is shown here; they are not merged, because they measure different things under the same name.`,
  povertyNote:
    "None of these figures is crossed with any vote or any funding figure on this site. They are here so a reader has both in front of them, not to claim that one explains the other.",
  regionsSummary: (n) => `The ${n} autonomous communities and cities`,
  regionsCaption: "Poverty indicators by autonomous community",
  colRegion: "Community",
  colArope: "AROPE",
  colAtRisk: "At risk of poverty",
  colDeprivation: "Severe material and social deprivation",
  national: "Spain (national total)",
  regionsOrder: "In the order INE publishes them.",
  ecv: "Living Conditions Survey",
  eaes: "Annual Earnings Structure Survey",

  gapsTitle: "What this does not show",
  gaps: {
    yearsTitle: "One year per figure, no trend",
    years: (wages, poverty) =>
      `The wages are for ${wages} and the poverty figures for ${poverty}. No series over time is drawn, and figures from different years are never added, subtracted or put in the same bar.`,
    modeTitle: "The most common wage",
    mode:
      "The mode, the wage the most people earn, is not in the tables this site downloads from INE. That is why the mean is never shown alone: the median and the percentiles are published with it.",
    breakdownTitle: "By sex and by community",
    breakdownPre:
      "INE also publishes these wages by sex and by autonomous community. Here they are for both sexes and all of Spain; each community's figures are on ",
    breakdownLink: "each province's page",
    breakdownPost: ".",
    thresholdTitle: "A fixed poverty line",
    threshold:
      "The at-risk-of-poverty rate is relative: it is measured against the median income of the same year, so it can fall when the whole country grows poorer at once. INE also publishes a rate against a fixed line, which this site does not yet download.",
    housingTitle: "Housing",
    housing: "Rents, empty homes and homelessness are not on this site yet.",
  },
};

/** The Catalan article before a percentage: "l’1 %", "l’11 %", "el 54 %". */
const caArt = (p: string) => (/^1([,.]\d+)? %|^11([,.]\d+)? %/.test(p) ? `l’${p}` : `el ${p}`);

const ca: Copy = {
  metaTitle: "L’escala del país",
  title: "L’escala del país",
  intro:
    "Aquest web publica el que cobren els partits i el que cobren els càrrecs públics. Cap d’aquestes xifres no significa res sense una escala. Aquesta és l’escala, presa de l’INE, que és qui la produeix.",
  framingLead: "Aquí no s’uneix res.",
  framingBody:
    "No hi ha cap línia que vagi d’una taxa de pobresa a un vot, ni correlació, ni ordenació de partits per res calculat a partir d’aquestes dades. Les xifres es posen les unes al costat de les altres i qui llegeix en treu les conclusions: una línia traçada aquí afirmaria una cosa que les dades no sostenen.",
  sourceLabel: "Font:",
  sourcesLabel: "Fonts:",
  table: (id) => `taula ${id}`,
  and: " i ",
  downloaded: (date) => `Dades descarregades de l’INE el ${date}.`,
  lowSample: "mostra reduïda",
  lowSampleNone:
    "L’INE marca amb un signe menys les cel·les la mostra de les quals té entre 100 i 500 observacions: no són xifres negatives, són xifres amb alta variabilitat. Es conserven i s’assenyalen; cap de les mostrades aquí no porta aquesta marca.",
  lowSampleSome: (n) =>
    `L’INE marca amb un signe menys les cel·les la mostra de les quals té entre 100 i 500 observacions: no són xifres negatives, són xifres amb alta variabilitat. Es conserven i s’assenyalen: ${n === 1 ? "una de les mostrades aquí porta" : `${n} de les mostrades aquí porten`} aquesta marca, indicada com a «mostra reduïda».`,

  wagesTitle: "El que es cobra a Espanya",
  wagesFinding: (year, mean, median) =>
    `El ${year}, el salari brut mitjà anual va ser de ${mean}, però la meitat dels assalariats va cobrar menys de ${median}.`,
  wagesBody: (p10, p90) =>
    `La mediana és la xifra que deixa la meitat dels assalariats per sota. La diferència amb la mitjana és la cua alta: el 10 % pitjor pagat no va arribar a ${p10} i el 10 % millor pagat va superar ${p90}.`,
  scaleKey:
    "Cada estació de la línia és un percentil que publica l’INE, sobre una escala en euros que comença a zero. La mitjana va damunt de la línia: no és un punt de la distribució sinó la seva mitjana aritmètica, i la cua alta l’apuja per sobre de la mediana.",
  meanLabel: "Mitjana",
  stations: {
    p10: { label: "Percentil 10", note: "el 10 % cobra menys" },
    q1: { label: "Quartil inferior", note: "el 25 % cobra menys" },
    median: { label: "Mediana", note: "la meitat cobra menys" },
    q3: { label: "Quartil superior", note: "el 75 % cobra menys" },
    p90: { label: "Percentil 90", note: "el 90 % cobra menys" },
  },
  jornada: (full, part) =>
    `Un advertiment que canvia com llegir tot l’anterior: l’EAES compta la jornada parcial i la completa en la mateixa mitjana, així que cap d’aquestes xifres no és «el que paga un lloc de treball». A jornada completa la mitjana va ser de ${full}; a jornada parcial, de ${part}.`,
  sectorsTitle: "Per sector d’activitat",
  sectorsFinding: (ratio, high, highValue, low, lowValue) =>
    `Entre el sector més ben pagat i el pitjor pagat hi ha un factor de ${ratio}: ${high} amb ${highValue} davant de ${low} amb ${lowValue}.`,
  sectorsKey:
    "Cada sector és una estació sobre la mateixa escala en euros, que comença a zero; hi són tots, del més ben pagat al pitjor pagat, perquè es vegi la distància sencera. La marca vertical de cada fila és la mitjana de totes les seccions, de la mateixa taula.",
  allSections: (value) => `Mitjana de totes les seccions: ${value}`,
  sectorsCaption: "Salari brut mitjà anual per sector d’activitat",
  wagesSourceTail:
    "Salari brut anual per treballador, ambdós sexes, tot Espanya, jornada completa i parcial juntes excepte en l’advertiment sobre la jornada.",

  smiTitle: "Tota la massa salarial, en múltiples del SMI",
  smiFinding: (year, underTwo) =>
    `El ${year}, ${caArt(underTwo)} dels assalariats va cobrar menys de dos salaris mínims.`,
  smiBody:
    "El mateix eix per a qualsevol sou d’aquest web. Els trams són els de l’INE, calculats sobre el salari mínim interprofessional (SMI) del mateix any.",
  smiPeoplePre: "El que el registre publica de cada càrrec és al ",
  smiPeopleLink: "directori de persones",
  smiPeoplePost: ". Aquesta pàgina no situa ningú sobre l’escala.",
  smiStation: (n) => (n === 0 ? "0" : `${n} SMI`),
  smiEuro: (value) => `${value} l’any`,
  smiKey: (top) =>
    `Cada estació és un múltiple del SMI i cada esglaó, el tram entre dues estacions. Els trams sumen el total d’assalariats. Es dibuixen com a esglaons separats i no apilats perquè el tram superior és ${caArt(top)} i apilat no es veuria; cada esglaó porta el seu percentatge exacte, i les barres es mesuren contra el tram més gran.`,
  smiEuroExplain: (year, annual, payments, monthly) =>
    `Els imports en euros al costat de cada estació són una multiplicació d’aquest web, no una xifra de l’INE: el SMI del ${year}, ${annual} bruts l’any (${payments} pagues de ${monthly}), pel múltiple.`,
  smiNoEuro: (year) =>
    `Aquest web no té transcrit el SMI del ${year}, així que les estacions no porten l’import en euros.`,
  smiCaption: "Percentatge d’assalariats per tram de salari en múltiples del SMI",
  smiDecree: "SMI:",

  povertyTitle: "A quanta gent afecta",
  povertyFinding: (year, arope) =>
    `El ${year}, ${caArt(arope)} de la població estava en risc de pobresa o exclusió social.`,
  povertyBody:
    "Quatre indicadors de l’Enquesta de Condicions de Vida. Cadascun és una proporció d’una població, així que la part buida de la barra és la resta del país.",
  povertyRows: {
    arope: "En risc de pobresa o exclusió social (AROPE)",
    aropeChildren: "AROPE, menors de 16 anys",
    atRisk: "En risc de pobresa (renda de l’any anterior)",
    deprivation: "Amb privació material i social severa",
  },
  povertySpread: (high, highRegion, low, lowRegion) =>
    `La xifra estatal no descriu cap comunitat en concret: va de ${high} a ${highRegion} fins a ${low} a ${lowRegion}.`,
  povertyBase: (base) =>
    `Sèrie ${base}, indicada perquè la mateixa taula pot contenir definicions diferents del mateix indicador.`,
  povertyMultipleBases: (bases, shown) =>
    `La taula conté més d’una definició (${bases}). Aquí es mostra ${shown}; no es barregen, perquè mesuren coses diferents amb el mateix nom.`,
  povertyNote:
    "Aquestes xifres no es creuen amb cap vot ni amb cap finançament d’aquest web. Són aquí perquè qui llegeix tingui les dues coses al davant, no per afirmar que l’una explica l’altra.",
  regionsSummary: (n) => `Les ${n} comunitats i ciutats autònomes`,
  regionsCaption: "Indicadors de pobresa per comunitat autònoma",
  colRegion: "Comunitat",
  colArope: "AROPE",
  colAtRisk: "En risc de pobresa",
  colDeprivation: "Privació material i social severa",
  national: "Espanya (total estatal)",
  regionsOrder: "En l’ordre en què les publica l’INE.",
  ecv: "Enquesta de Condicions de Vida",
  eaes: "Enquesta Anual d’Estructura Salarial",

  gapsTitle: "El que no mostra",
  gaps: {
    yearsTitle: "Un any per xifra, sense tendència",
    years: (wages, poverty) =>
      `Els salaris són del ${wages} i la pobresa, del ${poverty}. No es dibuixa cap sèrie en el temps, i xifres d’anys diferents no se sumen, no es resten ni es posen a la mateixa barra.`,
    modeTitle: "El salari més freqüent",
    mode:
      "La moda, el salari que cobra més gent, no és a les taules que aquest web descarrega de l’INE. Per això la mitjana no va mai sola: s’hi publiquen la mediana i els percentils.",
    breakdownTitle: "Per sexe i per comunitat",
    breakdownPre:
      "L’INE publica aquests salaris també per sexe i per comunitat autònoma. Aquí hi són per a ambdós sexes i tot Espanya; les xifres de cada comunitat són a ",
    breakdownLink: "la pàgina de cada província",
    breakdownPost: ".",
    thresholdTitle: "Un llindar de pobresa fix",
    threshold:
      "La taxa de risc de pobresa és relativa: es mesura contra la renda mediana del mateix any, així que pot baixar quan tot el país s’empobreix alhora. L’INE publica també una taxa contra un llindar fix, que aquest web encara no descarrega.",
    housingTitle: "L’habitatge",
    housing: "Lloguers, habitatges buits i persones sense llar encara no són en aquest web.",
  },
};

export const COPY: Record<Locale, Copy> = { es, en, ca };
