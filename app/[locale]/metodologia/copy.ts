import type { Locale } from "@/lib/locales";

/**
 * Strings of the prototype's methodology page.
 *
 * The page is organised by the routes of the front page's map, so a reader can
 * go from a figure to how it was obtained. Each route holds one item per kind
 * of record, and every item says the same four things in the same order: where
 * it comes from (the source lines are built from the data, on the page), how it
 * is obtained, what is checked, and what it does not show.
 *
 * Interpolated sentences take already-formatted values (`V`). Counts that
 * decide a plural are passed as numbers as well. Names of reports, registers,
 * laws and courts are data and stay as their publishers write them.
 *
 * The hate-crime context, the news registry and the coverage figures reuse the
 * previous site's strings in `lib/i18n.ts` (`t.method`, `t.coverage`) word for
 * word, because those are already translated and checked.
 */

export type RouteId =
  | "estado"
  | "donantes"
  | "fundaciones"
  | "campana"
  | "votos"
  | "declaraciones"
  | "sueldos"
  | "contexto";

export type ItemId =
  | "subsidios"
  | "ingresos"
  | "donaciones"
  | "fundaciones"
  | "patronatos"
  | "cruce"
  | "gasto"
  | "votaciones"
  | "bienes"
  | "intereses"
  | "salarios"
  | "personas"
  | "odio"
  | "ine"
  | "territorio"
  | "noticias";

export interface Item {
  title: string;
  method: string[];
  checks: string[];
  gaps: string[];
}

/** Every figure the sentences need, already formatted for the locale. */
export interface V {
  // State money
  parties: string;
  total: string;
  updated: string;
  from: string;
  to: string;
  grants: string;
  // Party income
  incomeYears: string;
  incomeCounts: string;
  incomeLinked: string;
  incomeRows: string;
  // Donations
  donors: string;
  donationsTotal: string;
  donationsYear: string;
  // Foundations
  fYears: string;
  partyShare: string;
  companiesShare: string;
  fUnlinked: string;
  fDiscrepancies: number;
  registerAsOf: string;
  fRegistered: string;
  eRegistered: string;
  documented: string;
  entities: string;
  people: string;
  ties: string;
  press: number;
  pressFmt: string;
  boardGaps: number;
  boardGapsFmt: string;
  // Board-to-office join
  joinCandidates: string;
  joinMatched: string;
  joinUnmatched: string;
  joinAmbiguous: string;
  joinMismatch: string;
  registerUpdated: string;
  registerRows: string;
  registerKeys: string;
  // Campaign
  spendFormations: string;
  otherShare: string;
  // Votes
  divisions: string;
  votingDeputies: string;
  votesFrom: string;
  votesTo: string;
  topics: string;
  nonBinding: string;
  // Declarations
  declPublished: string;
  declTotal: string;
  declPending: string;
  declRtve: string;
  declSecond: string;
  checkName: string;
  deputies: string;
  interestRows: string;
  interestsUpdated: string;
  // Pay
  officeholders: string;
  withSalary: string;
  salaryUpdated: string;
  salaryVia: string;
  // Context
  hateYear: string;
  ineTables: string;
  govChecked: string;
  provinces: string;
}

const es = {
  metaTitle: "Cómo se hizo",
  title: "Cómo se hizo",
  intro:
    "De dónde sale cada cifra de esta web, cómo se obtuvo, qué se comprobó antes de publicarla y qué no muestra. Va ordenado por las rutas del mapa de la portada, para poder ir de una cifra a su método.",
  lead: "Esta herramienta es honesta sobre lo que puede y no puede mostrar. Léelo antes de sacar conclusiones.",
  navLabel: "Las rutas de esta página",
  navTitle: "Ir a una ruta",
  extraNav: {
    reglas: "Las reglas",
    cobertura: "Cuánto hay de cada cosa",
    falta: "Lo que todavía no recoge",
    fuentes: "Fuentes y descargas",
  },

  labels: {
    source: "Fuente",
    sources: "Fuentes",
    method: "Cómo se obtiene",
    checks: "Qué se comprueba",
    gaps: "Lo que no muestra",
    tables: "Tabla descargable",
    perRowSource: "cada fila lleva su propia fuente y su fecha",
  },

  rulesTitle: "Las reglas de todas las páginas",
  rules: [
    "Cada cifra lleva su fuente en la misma página, con enlace al documento original y su fecha.",
    "Los datos se publican juntos para poder consultarlos. Que dos datos aparezcan uno al lado del otro no significa que uno explique el otro: ni el dinero explica un voto ni un voto explica el dinero.",
    "Una persona se une a un registro sólo cuando el nombre identifica a una sola fila y, donde la fuente lo permite, el partido coincide. Un nombre parecido no basta: ante la duda, no se publica nada.",
    "Las posiciones son votos registrados, con las palabras de la papeleta. No se deduce la postura de nadie a partir de su partido.",
    "No se suman ni se restan cifras de años distintos ni de conjuntos de partidos distintos.",
    "No se suma un patrimonio total ni se ordena a nadie por lo que declara o cobra.",
    "Lo que falta se muestra como «—», nunca como 0. Una parte pequeña que no es cero se escribe «menos del 1 %», nunca «0 %».",
  ],

  routes: {
    estado: {
      title: "Del Estado a los partidos",
      finding: (v: V) =>
        `${v.parties} partidos han recibido ${v.total} en subvenciones estatales registradas, de ${v.from} a ${v.to}. Datos actualizados el ${v.updated}.`,
    },
    donantes: {
      title: "De particulares a los partidos",
      finding: (v: V) =>
        `${v.donors} donantes dieron ${v.donationsTotal} a los partidos en ${v.donationsYear}, según el Tribunal de Cuentas. Ninguno con nombre.`,
    },
    fundaciones: {
      title: "Hacia las fundaciones de los partidos",
      finding: (v: V) =>
        `De las aportaciones que recibieron las fundaciones vinculadas en ${v.fYears}, el ${v.partyShare} lo puso el propio partido y el ${v.companiesShare}, empresas.`,
    },
    campana: {
      title: "En qué se gastó la campaña",
      finding: (v: V) =>
        `El ${v.otherShare} del gasto ordinario que declararon las ${v.spendFormations} formaciones en las europeas de 2024 está en una sola línea, sin desglosar.`,
    },
    votos: {
      title: "Cómo se votó en el Congreso",
      finding: (v: V) =>
        `Esta web sigue ${v.divisions} votaciones nominales del Congreso, de ${v.votesFrom} a ${v.votesTo}, con ${v.votingDeputies} diputados distintos votando en ellas.`,
    },
    declaraciones: {
      title: "Lo que declaran los diputados",
      finding: (v: V) =>
        `${v.declPublished} de las ${v.declTotal} declaraciones de bienes de los diputados están transcritas y comprobadas. Las otras ${v.declPending} enlazan al PDF oficial mientras se transcriben.`,
    },
    sueldos: {
      title: "Lo que cobran los cargos públicos",
      finding: (v: V) =>
        `${v.withSalary} de los ${v.officeholders} cargos del Registro de Altos Cargos tienen una retribución publicada. El registro se actualizó el ${v.salaryUpdated}.`,
    },
    contexto: {
      title: "El contexto",
      finding: (_v: V) =>
        "Cifras del Estado que no son dinero ni votos: delitos de odio, salarios y pobreza, quién gobierna cada comunidad y las noticias que lee la portada. No se afirma que una cosa explique la otra.",
    },
  } satisfies Record<RouteId, { title: string; finding: (v: V) => string }>,

  items: (v: V): Record<ItemId, Item> => ({
    subsidios: {
      title: "Subvenciones estatales a los partidos",
      method: [
        "Las subvenciones públicas estatales concedidas a los partidos políticos se extraen en directo de la Base de Datos Nacional de Subvenciones (BDNS / SNPSAP), el registro oficial del Ministerio de Hacienda, en su listado de concesiones a partidos políticos de la Administración del Estado. Cada concesión llega con su importe, su fecha, su convocatoria, el órgano que la concede y el enlace a su base legal en el BOE.",
        "Cada concesión se atribuye al partido por el NIF que la propia BDNS escribe delante del nombre del beneficiario. El NIF es la clave que une esta cifra con el resto de la web.",
        "Se distinguen dos tipos de ayuda estatal anual, según el texto de la convocatoria: financiación ordinaria, la subvención principal, repartida según representación parlamentaria; y gastos de seguridad, ayudas para gastos de protección. Lo que no encaja en ninguna de las dos se cuenta aparte.",
      ],
      checks: [
        `${v.grants} concesiones en la última consulta. La convocatoria se escribe de varias formas en la fuente («financiación ordinaria», «financiación ordinara», sic), así que la clasificación busca la raíz de la palabra y no la frase exacta.`,
      ],
      gaps: [
        "Sólo el Estado: las subvenciones de comunidades autónomas, parlamentos y ayuntamientos no están en este listado. Aparecen, como totales por partido y año, en las cuentas que fiscaliza el Tribunal de Cuentas, en el apartado siguiente.",
        "Las subvenciones se conceden al partido, no a la persona: no hay una cifra de «financiación por político».",
        "Las subvenciones no tienen territorio. En las páginas de provincia se muestran como cifras nacionales.",
      ],
    },
    ingresos: {
      title: "De dónde salen los ingresos de los partidos",
      method: [
        `Transcritos de los informes de fiscalización de las cuentas anuales de los partidos políticos del Tribunal de Cuentas: nº 1.532 (ejercicios 2018 y 2019) y nº 1.573 (ejercicio 2020). Ejercicios en esta web: ${v.incomeYears}.`,
        "Dos tablas por año: los recursos públicos, por la administración que los paga (Estado, gobiernos autonómicos, Cortes Generales, parlamentos autonómicos, entidades locales y otros), y los privados, por origen (cuotas de afiliados, aportaciones de cargos públicos, donaciones y otros ingresos).",
        "El PDF tiene capa de texto, pero sus columnas salen desordenadas, así que las cifras se leyeron de las imágenes de cada página.",
        `Una fila se une a un partido de esta web sólo cuando el nombre impreso identifica a uno solo: ${v.incomeLinked} de ${v.incomeRows} filas. Las demás se muestran con el nombre del informe y sin enlace.`,
      ],
      checks: [
        "Cada fila suma su total impreso, y cada columna, la fila TOTAL del informe.",
        "Cada cifra transcrita aparece en la capa de texto del PDF para esa página.",
        "En 2020, las donaciones de cada partido coinciden con las del gráfico de donaciones del mismo informe, que es una lectura independiente.",
        "El total impreso de ingresos públicos de 2020 está cortado en su celda («167.744.342,3»); se guarda la suma de sus columnas, 167.744.342,39.",
      ],
      gaps: [
        `Son los partidos que el Tribunal fiscalizó cada año, los que recibieron subvención anual para su funcionamiento (${v.incomeCounts}), no todos los partidos de España. El conjunto cambia de un año a otro, así que los totales de años distintos no se suman ni se restan.`,
        "Las subvenciones electorales van en otro anexo y no están incluidas.",
        "En 2018 y 2019, Nueva Canarias figura sin cifras: una nota del informe dice que no facilitó la composición de sus ingresos. Se conserva la fila con ceros y la nota, para que los ceros no se lean como ausencia de ingresos.",
        "Las aportaciones de cargos públicos son lo que pagan al partido quienes ocupan un cargo en su nombre. El informe no dice qué parte de su sueldo representan.",
      ],
    },
    donaciones: {
      title: `Donaciones privadas, ${v.donationsYear}`,
      method: [
        `Transcritas de la tabla consolidada de donaciones por tramos (gráfico 5, página 435 de los anexos) del Informe nº 1.573 del Tribunal de Cuentas, ejercicio ${v.donationsYear}. Tres tramos: menos de 1.000 €, de 1.000 a 10.000 € y más de 10.000 €; por cada uno, cuántos donantes y cuánto dinero.`,
        "Las donaciones de empresas están prohibidas. Desde la reforma de 2015 de la Ley Orgánica 8/2007, las personas jurídicas no pueden donar a partidos; sólo personas físicas, con un máximo de 50.000 €/año y sin donaciones anónimas.",
      ],
      checks: [
        "Los totales de cada partido coinciden con la columna de donaciones de sus ingresos privados en el mismo informe, que se transcribió por separado.",
      ],
      gaps: [
        "El informe no da nombres de donantes: publica las donaciones agrupadas por importe.",
        `Lo privado no es un API. Estos datos sólo se publican en los informes anuales en PDF del Tribunal de Cuentas, con años de retraso (el del ejercicio ${v.donationsYear} se aprobó en junio de 2024); por eso el reparto por tramos es una foto fija de ${v.donationsYear} y no un dato en directo.`,
        "De 2018 y 2019 esta web tiene el total donado a cada partido, dentro de sus ingresos, pero no el reparto por tramos: el gráfico de donaciones de esos años no está transcrito.",
      ],
    },
    fundaciones: {
      title: `Dinero de las fundaciones vinculadas, ${v.fYears}`,
      method: [
        "Extraído del Informe nº 1.642 del Tribunal de Cuentas, que fiscaliza una ficha por entidad y ejercicio: aportaciones de particulares, de empresas y del propio partido, subvenciones públicas por organismo, convenios de colaboración, cuentas del ejercicio e incumplimientos.",
        `El partido de cada entidad es el que consta en el propio informe. ${v.fUnlinked} entidades cuyo partido, tal como lo nombra el informe, no identifica a uno solo de esta web no se atribuyen a ninguno.`,
        "A los partidos les está prohibido aceptar dinero de empresas; a sus fundaciones no. Se rigen por la disposición adicional séptima de la Ley Orgánica 8/2007: por encima de 120.000 euros la donación debe elevarse a documento público, toda donación de una persona jurídica debe comunicarse al Tribunal de Cuentas en tres meses y la identidad del donante debe publicarse.",
      ],
      checks: [
        "La extracción recalcula la aritmética de cada tabla y cuadra las fichas con los totales de los anexos del informe; si algo no cuadra, se detiene.",
        v.fDiscrepancies === 0
          ? ""
          : v.fDiscrepancies === 1
          ? "La aritmética del propio informe falla en un punto. Allí se publican las dos cifras, la declarada y la suma de sus partidas, porque el error es de la fuente, no de esta web."
          : `La aritmética del propio informe falla en ${v.fDiscrepancies} puntos. Allí se publican las dos cifras, la declarada y la suma de sus partidas, porque el error es de la fuente, no de esta web.`,
      ],
      gaps: [
        `El informe cubre ${v.fYears}; no hay datos posteriores publicados.`,
        "No dice quiénes son las personas jurídicas que donaron: nombra a la contraparte sólo cuando el dinero llegó como convenio de colaboración.",
        `El registro obligatorio está casi vacío: a ${v.registerAsOf} sólo constaban inscritas en el Registro de Partidos Políticos ${v.fRegistered} fundaciones y ${v.eRegistered} entidades de las fiscalizadas.`,
      ],
    },
    patronatos: {
      title: "Quién gobierna las fundaciones",
      method: [
        "El informe recoge el dinero, nunca a las personas. Los patronatos se recogen a mano, de la fuente que los publica en cada caso: un registro oficial, una fuente oficial, una publicación de la propia entidad o, si no hay otra, la prensa.",
        "Cada cargo lleva una sola fuente, con enlace y fecha; un cargo sin fuente no existe. Lo que sólo consta en prensa se muestra como «según <medio> (<fecha>)» y no se cuenta junto a lo que consta en un registro.",
        "Las fechas se muestran: una lista de patronato es una foto de un momento, no el patronato de hoy.",
      ],
      checks: [
        `Patronato documentado en ${v.documented} de ${v.entities} entidades auditadas: ${v.people} personas y ${v.ties} cargos externos, cada uno con su fuente y su fecha. ${
          v.press === 1
            ? "Uno de esos registros se apoya en prensa y se muestra como tal."
            : `${v.pressFmt} de esos registros se apoyan en prensa y se muestran como tal.`
        }`,
      ],
      gaps: [
        v.boardGaps === 1
          ? "En una entidad no se localizó un patronato publicado, y su ficha lo dice."
          : `En ${v.boardGapsFmt} entidades no se localizó un patronato publicado, y su ficha lo dice.`,
        "No se deduce nada: un cargo aparece sólo si una fuente con nombre lo afirma, y no hay puntuaciones, rankings ni métricas de red.",
      ],
    },
    cruce: {
      title: "Patronos que tienen además un cargo público",
      method: [
        "Las personas de los patronatos se cruzan con el Registro de Altos Cargos. Hacen falta dos condiciones a la vez: que el nombre normalizado (sin acentos y sin importar el orden) corresponda a un solo cargo del registro, y que el partido del cargo sea el de la fundación según el informe, o que el cargo conste sin partido.",
        `Un nombre normalizado no es una identidad: los ${v.registerRows} cargos del registro dan ${v.registerKeys} nombres distintos. Por eso un nombre que corresponde a más de un cargo distinto no da nada.`,
      ],
      checks: [
        `De las ${v.joinCandidates} personas de los patronatos, ${v.joinMatched} figuran en el registro con un cargo público, y ese cargo se muestra tal como lo recogía el registro el ${v.registerUpdated}. Quedan fuera ${v.joinUnmatched} que no constan en el registro, lo normal en un patronato con miembros que no son cargos públicos; ${v.joinAmbiguous} cuyo nombre coincide con más de un cargo distinto, y ${v.joinMismatch} en las que el partido del cargo no coincide con el de la fundación. En los dos últimos casos no se publica nada.`,
      ],
      gaps: [
        "El registro no tiene fecha por persona ni marca de activo, así que un cargo que ya cambió de manos es un retraso del registro, no un hecho actual que afirme esta web.",
        "Son dos registros públicos sobre la misma persona, puestos uno al lado del otro: nada aquí dice que el cargo y el patronato tengan relación.",
      ],
    },
    gasto: {
      title: "Gasto electoral declarado, europeas de 2024",
      method: [
        "Del Informe nº 1.628 del Tribunal de Cuentas sobre las contabilidades de las elecciones al Parlamento Europeo del 9 de junio de 2024: por formación, sus recursos (privados, préstamos, anticipos de subvención, aportaciones del partido y otros), su gasto ordinario declarado y justificado, y los envíos de propaganda.",
        "Cada formación se une a un partido con una tabla escrita a mano, no por parecido de nombres, porque varias son coaliciones cuyo nombre no comparte ninguna palabra con el de un partido. En una coalición, el partido es el que encabezó la lista, y la cifra es de toda la candidatura.",
        "Las dos partidas de publicidad, exterior y en prensa y radio, son los únicos gastos que la ley limita; la tabla dice si cada formación superó el límite.",
      ],
      checks: [],
      gaps: [
        "El resto del gasto ordinario figura en una sola línea cuyo destino el informe no detalla. Esa parte se dibuja a su tamaño en las páginas de los partidos.",
        "Una formación que no figura en la tabla de correspondencias no se atribuye a ningún partido.",
      ],
    },
    votaciones: {
      title: "Votaciones nominales",
      method: [
        "Cada voto procede de los datos abiertos de votaciones del Congreso de los Diputados: uno por diputado y votación, tal como lo recoge el acta. Cada votación enlaza a su acta oficial y, si es una ley, a su texto.",
        `Cada votación se etiqueta según su tipo: votación final de ley, toma en consideración, proposición no de ley o moción consecuencia de interpelación. Las dos últimas no son vinculantes (${v.nonBinding} de las seguidas). Se excluyen las votaciones de enmiendas.`,
        `Las votaciones se agrupan por temas (${v.topics}). Qué votaciones se siguen lo decide esta web: no son una muestra de toda la actividad del Congreso.`,
      ],
      checks: [
        "Un diputado aparece solo si consta su voto; no se deduce la postura de nadie a partir de su partido.",
        "Un grupo parlamentario no es un partido. Cuando el grupo lo forma un solo partido, se enlaza a la financiación de ese partido; cuando lo forman varios, a ninguno, porque atribuir el dinero de una coalición a uno de sus miembros sería falso.",
      ],
      gaps: [
        `Son cifras sin denominador: el Congreso celebra miles de votaciones, y dibujar estas ${v.divisions} como proporción de algo inventaría un total del que no forman parte.`,
        "Las barras de resultado no dicen si una votación salió adelante: las leyes orgánicas necesitan mayoría absoluta, y una barra invitaría a la lectura equivocada.",
      ],
    },
    bienes: {
      title: "Declaraciones de bienes y rentas",
      method: [
        "La declaración de bienes y rentas que cada diputado de la XV Legislatura presentó al tomar el escaño sólo existe como escaneo, sin texto legible por máquina. Esta web la transcribe apartado por apartado, con el texto tal como lo escribió el diputado.",
        "Las rentas son las del año anterior a la declaración. El formulario excluye lo cobrado del Congreso o del Senado, que ambas cámaras publican aparte.",
        "Una declaración se une a su diputado por el código de su ficha del Congreso, no por el nombre.",
      ],
      checks: [
        `Una transcripción se publica únicamente si sus totales coinciden con la transcripción independiente de ${v.checkName} o con una segunda lectura independiente del escaneo: ${v.declRtve} cotejadas con ${v.checkName} y ${v.declSecond} con una segunda lectura.`,
        `El listado de ${v.checkName} no incluye el IRPF, así que en las declaraciones cotejadas con él esa cifra procede de una sola lectura, y los textos no se cotejan en ningún caso.`,
        "Una cifra que no está escrita en el formato numérico español se muestra también tal como aparece en el escaneo, para comprobarla en el PDF oficial.",
        "Ante cualquier diferencia, manda el PDF oficial.",
      ],
      gaps: [
        `${v.declPending} declaraciones aún no están transcritas; el perfil de cada diputado enlaza el PDF oficial. Las declaraciones posteriores, al dejar el escaño o por otra causa, tampoco están transcritas.`,
        "El formulario no pide el valor de los inmuebles, así que no hay cifra de patrimonio total. Pide un único saldo para el conjunto de las cuentas, que puede aparecer junto a sólo una de ellas.",
        "Se omiten las matrículas que alguna declaración incluye, porque el propio formulario pide no indicarlas.",
        "Todo es una declaración propia: el Congreso la publica «sin corrección alguna», según su propio formulario.",
      ],
    },
    intereses: {
      title: "Declaraciones de intereses económicos",
      method: [
        `Actividades, fundaciones y asociaciones, regalos y observaciones, del fichero de datos abiertos del Congreso (${v.interestRows} filas, descargado el ${v.interestsUpdated}), reproducidas tal cual, incluido el sector, que cada declarante escribe a su manera.`,
        "Donde el fichero escribe el nombre de otra forma que la ficha del diputado (un segundo nombre de más o de menos), la coincidencia se acepta sólo si un único declarante encaja.",
      ],
      checks: [],
      gaps: ["Si el fichero no recoge ninguna fila con el nombre de un diputado, su perfil lo dice."],
    },
    salarios: {
      title: "Registro de Altos Cargos",
      method: [
        `Retribuciones de los cargos públicos en activo según el Registro de Altos Cargos (transparencia.gob.es), obtenidas a través de la exportación en CSV de ${v.salaryVia}: cargo, partido, ámbito y retribución bruta anual, y mensual donde la fuente la da.`,
        "Retribución del cargo, no patrimonio ni ingresos privados. Solo cargos marcados como activos en la fuente.",
      ],
      checks: [],
      gaps: [
        "Donde el registro no publica retribución, se muestra «—», nunca 0 €.",
        "No se ordena a nadie por lo que cobra.",
      ],
    },
    personas: {
      title: "Quién es quién: diputados, cargos y retratos",
      method: [
        `El directorio reúne a los ${v.deputies} diputados en activo, de los datos abiertos del Congreso, y a los cargos del Registro de Altos Cargos.`,
        "Un diputado y una fila del registro se tratan como la misma persona sólo si se cumplen dos condiciones: exactamente una fila del registro lleva su nombre normalizado, o una lista de alias escrita a mano la nombra; y sus partidos coinciden, o uno de los dos no consta. Lo que queda en medio no se resuelve y se informa, porque una unión equivocada pondría las declaraciones de una persona en la página de otra.",
        "Los retratos son de Wikipedia y Wikimedia Commons, con licencia libre, y sólo cuando el título del artículo coincide exactamente con el nombre de la persona.",
        "Los perfiles de las personas reúnen también la actividad en Bluesky y los titulares en los que aparece cada político. Cada perfil de Bluesky se ha verificado uno a uno; a día de hoy la izquierda tiene más presencia allí, y líderes de PP y Vox no tienen cuenta verificable.",
      ],
      checks: [],
      gaps: [
        "Que no conste un registro de una persona no significa que no exista.",
        "Un retrato depende de que exista una licencia libre; su ausencia no dice nada de la persona.",
      ],
    },
    odio: {
      title: "Delitos de odio",
      method: [
        `Por comunidad autónoma, los hechos registrados de ${v.hateYear} y su tasa por 100.000 habitantes, de las tablas 2.2 y 7.1 del informe del Ministerio del Interior, tal como las publica.`,
        "Las cifras nacionales y el caso judicial de abajo se comprobaron contra una fuente oficial antes de escribirse.",
      ],
      checks: [],
      gaps: [],
    },
    ine: {
      title: "Salarios y pobreza, INE",
      method: [
        `Tablas del INE de la Encuesta Anual de Estructura Salarial y de la Encuesta de Condiciones de Vida (${v.ineTables}), tal como las publica.`,
      ],
      checks: ["Las celdas que el INE marca por tener poca muestra se conservan marcadas, en la columna baja_muestra."],
      gaps: [],
    },
    territorio: {
      title: "Comunidades, provincias y gobiernos",
      method: [
        `Las ${v.provinces} provincias y su comunidad, del INE. Los contornos del mapa, del Instituto Geográfico Nacional. Quién preside cada comunidad y desde cuándo, comprobado el ${v.govChecked}.`,
      ],
      checks: [],
      gaps: [],
    },
    noticias: {
      title: "Fuentes de actualidad",
      method: [],
      checks: [],
      gaps: [],
    },
  }),

  routeTables: "Tablas de esta ruta",

  coverageSourcesLabel: "Fuentes",

  notYetTitle: "Lo que esta web todavía no recoge",
  notYetIntro:
    "Lo que falta también es un dato. Esto es lo que las fuentes no publican o lo que esta web aún no ha incorporado.",
  notYet: [
    "Donaciones por tramos de otros ejercicios que 2020.",
    "Fundaciones después de 2022: el Tribunal de Cuentas no ha publicado ejercicios posteriores.",
    "Las declaraciones de bienes que faltan por transcribir y las presentadas después de tomar el escaño.",
    "Las subvenciones autonómicas y locales concesión a concesión: sólo constan como totales por partido en las cuentas fiscalizadas.",
    "Contratación pública. Si se incorpora, cualquier vínculo entre partidos, fundaciones y adjudicatarios se etiquetará siempre como asociación, no como prueba de influencia.",
    "Nombramientos en empresas. El Boletín Oficial del Registro Mercantil los publica sólo con nombre y apellidos, sin DNI, así que sólo se podrían unir a un político por el nombre, y esta web no une por nombre.",
  ],

  srcTitle: "Fuentes y descargas",
  datosLink: "Todas las tablas de esta web, una por una, en CSV",
  lessThanOne: "menos del 1 %",
};

export type Copy = typeof es;

const en: Copy = {
  metaTitle: "How it was made",
  title: "How it was made",
  intro:
    "Where every figure on this site comes from, how it was obtained, what was checked before it was published and what it does not show. It follows the routes of the front page's map, so a reader can go from a figure to its method.",
  lead: "This tool is honest about what it can and cannot show. Read this before drawing conclusions.",
  navLabel: "The routes on this page",
  navTitle: "Go to a route",
  extraNav: {
    reglas: "The rules",
    cobertura: "How much of each there is",
    falta: "What it does not hold yet",
    fuentes: "Sources and downloads",
  },

  labels: {
    source: "Source",
    sources: "Sources",
    method: "How it is obtained",
    checks: "What is checked",
    gaps: "What it does not show",
    tables: "Downloadable table",
    perRowSource: "every row carries its own source and date",
  },

  rulesTitle: "The rules every page follows",
  rules: [
    "Every figure carries its source on the same page, with a link to the original document and its date.",
    "Records are published together so they can be looked up. Two records side by side do not mean one explains the other: money does not explain a vote, and a vote does not explain money.",
    "A person is joined to a record only when the name identifies a single row and, where the source allows it, the party agrees. A similar name is not enough: when in doubt, nothing is published.",
    "Positions are recorded votes, in the ballot's own words. Nobody's position is inferred from their party.",
    "Figures from different years, or from different sets of parties, are never added or subtracted.",
    "No total net worth is added up, and nobody is ranked by what they declare or are paid.",
    "What is missing is shown as “—”, never as 0. A small share that is not zero reads “less than 1 %”, never “0 %”.",
  ],

  routes: {
    estado: {
      title: "From the State to the parties",
      finding: (v) =>
        `${v.parties} parties have received ${v.total} in recorded state subsidies, from ${v.from} to ${v.to}. Data updated on ${v.updated}.`,
    },
    donantes: {
      title: "From individuals to the parties",
      finding: (v) =>
        `${v.donors} donors gave ${v.donationsTotal} to the parties in ${v.donationsYear}, according to the Court of Auditors. None of them is named.`,
    },
    fundaciones: {
      title: "Into the parties' foundations",
      finding: (v) =>
        `Of the contributions the party-linked foundations received in ${v.fYears}, ${v.partyShare} came from the party itself and ${v.companiesShare} from companies.`,
    },
    campana: {
      title: "What the campaign was spent on",
      finding: (v) =>
        `${v.otherShare} of the ordinary spending the ${v.spendFormations} formations declared for the 2024 European elections sits in a single line, not itemised.`,
    },
    votos: {
      title: "How the Congreso voted",
      finding: (v) =>
        `This site tracks ${v.divisions} recorded divisions of the Congreso, from ${v.votesFrom} to ${v.votesTo}, with ${v.votingDeputies} distinct deputies voting in them.`,
    },
    declaraciones: {
      title: "What the deputies declare",
      finding: (v) =>
        `${v.declPublished} of the deputies' ${v.declTotal} asset declarations are transcribed and checked. The other ${v.declPending} link to the official PDF while they are transcribed.`,
    },
    sueldos: {
      title: "What officeholders are paid",
      finding: (v) =>
        `${v.withSalary} of the ${v.officeholders} officeholders in the Register of Senior Officials have a published salary. The register was last updated on ${v.salaryUpdated}.`,
    },
    contexto: {
      title: "The context",
      finding: () =>
        "State figures that are neither money nor votes: hate crime, wages and poverty, who governs each region and the news the front page reads. Neither is claimed to explain the other.",
    },
  },

  items: (v) => ({
    subsidios: {
      title: "State subsidies to the parties",
      method: [
        "The public state subsidies granted to political parties are pulled live from the National Subsidies Database (BDNS / SNPSAP), the official registry of the Ministry of Finance, from its listing of grants to political parties by the State administration. Each grant comes with its amount, its date, its call, the granting body and the link to its legal basis in the BOE.",
        "Each grant is attributed to a party by the NIF (tax ID) that BDNS itself writes before the beneficiary's name. The NIF is the key that joins this figure to the rest of the site.",
        "Two kinds of annual state aid are distinguished, by the text of the call: ordinary funding, the main subsidy, distributed by parliamentary representation; and security costs, aid for protection expenses. Anything that fits neither is counted separately.",
      ],
      checks: [
        `${v.grants} grants in the latest fetch. The call is spelt several ways in the source (“financiación ordinaria”, “financiación ordinara”, sic), so the classification looks for the stem of the word, not the exact phrase.`,
      ],
      gaps: [
        "The State only: subsidies from regional governments, parliaments and councils are not in this listing. They appear, as totals per party and year, in the accounts the Court of Auditors audits, in the next item.",
        "Subsidies are granted to the party, not the person: there is no “funding per politician” figure.",
        "Subsidies carry no territory. On the province pages they are shown as national figures.",
      ],
    },
    ingresos: {
      title: "Where the parties' income comes from",
      method: [
        `Transcribed from the Court of Auditors' audit reports on the political parties' annual accounts: no. 1.532 (fiscal years 2018 and 2019) and no. 1.573 (fiscal year 2020). Years on this site: ${v.incomeYears}.`,
        "Two tables per year: public resources, by the administration that pays them (the State, regional governments, the Cortes Generales, regional parliaments, local bodies and others), and private resources, by origin (member fees, contributions from officeholders, donations and other income).",
        "The PDF has a text layer, but its columns come out scrambled, so the figures were read from each page's images.",
        `A row is joined to a party on this site only when the printed name identifies a single one: ${v.incomeLinked} of ${v.incomeRows} rows. The rest are shown under the report's name and not linked.`,
      ],
      checks: [
        "Every row sums to its printed total, and every column to the report's TOTAL row.",
        "Every figure transcribed appears in the PDF's text layer for that page.",
        "For 2020, each party's donations equal those in the same report's donations chart, which is an independent reading.",
        "The printed total of 2020 public income is cut off in its cell (“167.744.342,3”); the sum of its columns, 167,744,342.39, is what is stored.",
      ],
      gaps: [
        `These are the parties the Court audited each year, those that received an annual operating subsidy (${v.incomeCounts}), not every party in Spain. The set changes from year to year, so totals of different years are never added or subtracted.`,
        "Electoral subsidies are in a separate annex and are not included.",
        "In 2018 and 2019, Nueva Canarias is printed with no figures: a footnote in the report says it gave no breakdown of its income. The row is kept with zeros and the note, so the zeros are not read as no income.",
        "Contributions from officeholders are what people who hold office on a party's behalf pay to that party. The report does not say what share of their pay that is.",
      ],
    },
    donaciones: {
      title: `Private donations, ${v.donationsYear}`,
      method: [
        `Transcribed from the consolidated table of donations by tranche (chart 5, page 435 of the annexes) of Court of Auditors report no. 1.573, fiscal year ${v.donationsYear}. Three tranches: under €1,000, €1,000 to €10,000 and over €10,000; for each, how many donors and how much money.`,
        "Company donations are banned. Since the 2015 reform of Organic Law 8/2007, legal entities cannot donate to parties; only individuals, capped at €50,000/year and with no anonymous donations.",
      ],
      checks: [
        "Each party's totals equal the donations column of its private income in the same report, which was transcribed separately.",
      ],
      gaps: [
        "The report names no donors: it publishes donations grouped by amount.",
        `Private data is not an API. It is only published in the Court of Auditors' annual PDF reports, years late (the one for fiscal year ${v.donationsYear} was approved in June 2024); hence the split by tranche is a fixed ${v.donationsYear} snapshot, not live data.`,
        "For 2018 and 2019 this site holds the total donated to each party, within its income, but not the split by tranche: the donations chart for those years is not transcribed.",
      ],
    },
    fundaciones: {
      title: `Money into the party-linked foundations, ${v.fYears}`,
      method: [
        "Extracted from Court of Auditors report no. 1.642, which audits one dossier per entity and fiscal year: contributions from individuals, from companies and from the party itself, public subsidies by granting body, collaboration agreements, the year's accounts and breaches.",
        `Each entity's party is the one the report itself states. ${v.fUnlinked} entities whose party, as the report names it, does not identify a single party on this site are attributed to none.`,
        "Parties may not take money from companies; their foundations may. They are governed by the seventh additional provision of Organic Law 8/2007: above €120,000 a donation must be executed as a public deed, every donation from a legal entity must be notified to the Court of Auditors within three months, and the donor's identity must be published.",
      ],
      checks: [
        "The extraction recomputes every table's arithmetic and reconciles the dossiers against the report's annex totals; if anything does not reconcile, it stops.",
        v.fDiscrepancies === 0
          ? ""
          : v.fDiscrepancies === 1
          ? "The report's own arithmetic fails at one point. There both figures are published, the stated one and the sum of its lines, because the error is the source's, not this site's."
          : `The report's own arithmetic fails at ${v.fDiscrepancies} points. There both figures are published, the stated one and the sum of its lines, because the error is the source's, not this site's.`,
      ],
      gaps: [
        `The report covers ${v.fYears}; no later data has been published.`,
        "It does not say which legal entities donated: it names the counterparty only where the money came as a collaboration agreement.",
        `The mandatory register is almost empty: as of ${v.registerAsOf} only ${v.fRegistered} foundations and ${v.eRegistered} entities of those audited were registered in the Register of Political Parties.`,
      ],
    },
    patronatos: {
      title: "Who governs the foundations",
      method: [
        "The report records the money, never the people. Boards are collected by hand, from whichever source publishes them: an official register, an official source, the entity's own publication or, where there is no other, the press.",
        "Every role carries exactly one source, with a link and a date; a role without a source does not exist. What is only in the press is shown as “according to <outlet> (<date>)” and is not counted with what is on a register.",
        "Dates are shown: a board list is a snapshot of a moment, not today's board.",
      ],
      checks: [
        `Board documented for ${v.documented} of ${v.entities} audited entities: ${v.people} people and ${v.ties} outside roles, each with its source and date. ${
          v.press === 1
            ? "One of those records rests on the press and is shown as such."
            : `${v.pressFmt} of those records rest on the press and are shown as such.`
        }`,
      ],
      gaps: [
        v.boardGaps === 1
          ? "For one entity no published board was found, and its page says so."
          : `For ${v.boardGapsFmt} entities no published board was found, and their pages say so.`,
        "Nothing is inferred: a role appears only where a named source states it, and there is no score, ranking or network metric.",
      ],
    },
    cruce: {
      title: "Board members who also hold public office",
      method: [
        "The people on the boards are matched against the Register of Senior Officials. Two conditions must both hold: the normalised name (accents folded, order ignored) matches a single post in the register, and the post's party is the foundation's party according to the report, or the post is recorded with no party.",
        `A normalised name is not an identity: the register's ${v.registerRows} officeholders yield ${v.registerKeys} distinct names. So a name that matches more than one distinct post yields nothing.`,
      ],
      checks: [
        `Of the ${v.joinCandidates} people on the boards, ${v.joinMatched} appear in the register with a public office, shown as the register stated it on ${v.registerUpdated}. Left out: ${v.joinUnmatched} who are not in the register, the ordinary case for a board with members who are not officeholders; ${v.joinAmbiguous} whose name matches more than one distinct post; and ${v.joinMismatch} whose post's party differs from the foundation's. In the last two cases nothing is published.`,
      ],
      gaps: [
        "The register has no per-person date and no active flag, so a post that has since changed hands is the register's staleness, not a current fact this site asserts.",
        "These are two public records about the same person, placed side by side: nothing here says the office and the board seat have anything to do with each other.",
      ],
    },
    gasto: {
      title: "Declared campaign spending, 2024 European elections",
      method: [
        "From Court of Auditors report no. 1.628 on the accounts of the European Parliament elections of 9 June 2024: for each formation, its resources (private, loans, subsidy advances, contributions from the party and other), its ordinary spending declared and justified, and its campaign mailings.",
        "Each formation is joined to a party through a hand-written table, not by similarity of names, because several are coalitions whose name shares no word with any party's. For a coalition, the party is the one that led the list, and the figure is the whole list's.",
        "The two advertising lines, outdoor and press and radio, are the only spending the law caps; the table says whether each formation exceeded the cap.",
      ],
      checks: [],
      gaps: [
        "The rest of the ordinary spending sits in a single line whose destination the report does not state. That part is drawn at its size on the party pages.",
        "A formation that is not in the correspondence table is attributed to no party.",
      ],
    },
    votaciones: {
      title: "Recorded divisions",
      method: [
        "Every vote comes from the Congreso de los Diputados' open data on divisions: one per deputy and division, as the record states it. Each division links to its official record and, for a law, to its text.",
        `Each division is labelled by kind: final vote on a law, consideration, non-legislative motion or motion following an interpellation. The last two are not binding (${v.nonBinding} of those tracked). Amendment votes are excluded.`,
        `Divisions are grouped by topic (${v.topics}). Which divisions are tracked is this site's choice: they are not a sample of all the Congreso's business.`,
      ],
      checks: [
        "A deputy appears only if their vote is on record; nobody's position is inferred from their party.",
        "A parliamentary group is not a party. Where a single party forms the group, it links to that party's funding; where several do, it links to none, because attributing a coalition's money to one of its members would be false.",
      ],
      gaps: [
        `These are figures with no denominator: the Congreso holds thousands of divisions, and drawing these ${v.divisions} as a proportion of something would invent a whole they are not part of.`,
        "The result bars do not say whether a vote passed: organic laws need an absolute majority, and a bar would invite the wrong reading.",
      ],
    },
    bienes: {
      title: "Declarations of assets and income",
      method: [
        "The declaration of assets and income each deputy of the 15th Legislature filed on taking their seat exists only as a scan, with no machine-readable text. This site transcribes it section by section, with the text as the deputy wrote it.",
        "Income is for the year before the filing. The form excludes pay from the Congreso or the Senate, which both chambers publish separately.",
        "A declaration is joined to its deputy by the code of their Congreso record, not by name.",
      ],
      checks: [
        `A transcription is published only if its totals equal ${v.checkName}'s independent transcription or a second independent reading of the scan: ${v.declRtve} checked against ${v.checkName} and ${v.declSecond} by a second reading.`,
        `${v.checkName}'s listing has no income tax (IRPF) figure, so in the declarations checked against it that figure rests on a single reading, and texts are not cross-checked in any case.`,
        "A figure not written in the Spanish number format is also shown as it appears on the scan, so it can be checked against the official PDF.",
        "Wherever there is a difference, the official PDF prevails.",
      ],
      gaps: [
        `${v.declPending} declarations are not transcribed yet; each deputy's profile links the official PDF. Later filings, on leaving the seat or for another reason, are not transcribed either.`,
        "The form does not ask for the value of property, so there is no total net-worth figure. It asks for a single balance for all accounts together, which may appear beside only one of them.",
        "Licence plates some declarations include are left out, because the form itself asks for them not to be given.",
        "Everything is a self-declaration: the Congreso publishes it “without any correction”, as its own form says.",
      ],
    },
    intereses: {
      title: "Declarations of economic interests",
      method: [
        `Activities, foundations and associations, gifts and observations, from the Congreso's open-data file (${v.interestRows} rows, downloaded on ${v.interestsUpdated}), reproduced as they are, including the sector, which each declarant writes in their own way.`,
        "Where the file spells the name differently from the deputy's record (a second given name added or dropped), the match is accepted only if a single declarant fits.",
      ],
      checks: [],
      gaps: ["If the file holds no row under a deputy's name, their profile says so."],
    },
    salarios: {
      title: "Register of Senior Officials",
      method: [
        `Pay of serving public officeholders according to the Register of Senior Officials (transparencia.gob.es), obtained through the CSV export of ${v.salaryVia}: post, party, area and gross annual pay, and monthly where the source gives it.`,
        "Pay of the post, not wealth or private income. Only posts marked as active in the source.",
      ],
      checks: [],
      gaps: [
        "Where the register publishes no pay, “—” is shown, never €0.",
        "Nobody is ranked by what they are paid.",
      ],
    },
    personas: {
      title: "Who is who: deputies, officeholders and portraits",
      method: [
        `The directory brings together the ${v.deputies} sitting deputies, from the Congreso's open data, and the officeholders in the Register of Senior Officials.`,
        "A deputy and a register row are treated as one person only when two conditions hold: exactly one register row carries their normalised name, or a hand-written alias list names it; and their parties agree, or one side records none. Anything in between is left unresolved and reported, because a wrong join would put one person's declarations on another person's page.",
        "Portraits come from Wikipedia and Wikimedia Commons, under a free licence, and only where the article title matches the person's name exactly.",
        "The people's profiles also gather each politician's Bluesky activity and the headlines they appear in. Every Bluesky profile has been verified one by one; today the left has more presence there, and PP and Vox leaders have no verifiable account.",
      ],
      checks: [],
      gaps: [
        "A record that is not on file for a person does not mean it does not exist.",
        "A portrait depends on a free licence existing; its absence says nothing about the person.",
      ],
    },
    odio: {
      title: "Hate crime",
      method: [
        `By region, the incidents recorded in ${v.hateYear} and their rate per 100,000 inhabitants, from tables 2.2 and 7.1 of the Ministry of the Interior's report, as published.`,
        "The national figures and the court case below were checked against an official source before being written down.",
      ],
      checks: [],
      gaps: [],
    },
    ine: {
      title: "Wages and poverty, INE",
      method: [
        `INE tables from the Annual Wage Structure Survey and the Living Conditions Survey (${v.ineTables}), as published.`,
      ],
      checks: ["Cells the INE flags for a small sample stay flagged, in the baja_muestra column."],
      gaps: [],
    },
    territorio: {
      title: "Regions, provinces and governments",
      method: [
        `The ${v.provinces} provinces and their region, from the INE. The map outlines, from the Instituto Geográfico Nacional. Who presides over each region and since when, checked on ${v.govChecked}.`,
      ],
      checks: [],
      gaps: [],
    },
    noticias: {
      title: "News sources",
      method: [],
      checks: [],
      gaps: [],
    },
  }),

  routeTables: "Tables on this route",

  coverageSourcesLabel: "Sources",

  notYetTitle: "What this site does not hold yet",
  notYetIntro:
    "What is missing is a fact too. This is what the sources do not publish, or what this site has not brought in yet.",
  notYet: [
    "Donations by tranche for any fiscal year other than 2020.",
    "Foundations after 2022: the Court of Auditors has not published later years.",
    "The asset declarations still to be transcribed, and those filed after taking the seat.",
    "Regional and local subsidies grant by grant: they appear only as totals per party in the audited accounts.",
    "Public procurement. If it is brought in, any link between parties, foundations and contractors will always be labelled association, not proof of influence.",
    "Company appointments. The Boletín Oficial del Registro Mercantil publishes them with names only, no ID number, so they could only be joined to a politician by name, and this site does not join by name.",
  ],

  srcTitle: "Sources and downloads",
  datosLink: "Every table on this site, one by one, as CSV",
  lessThanOne: "less than 1 %",
};

const ca: Copy = {
  metaTitle: "Com s'ha fet",
  title: "Com s'ha fet",
  intro:
    "D'on surt cada xifra d'aquest web, com s'ha obtingut, què s'ha comprovat abans de publicar-la i què no mostra. Va ordenat per les rutes del mapa de la portada, per poder anar d'una xifra al seu mètode.",
  lead: "Aquesta eina és honesta sobre el que pot i no pot mostrar. Llegeix-ho abans de treure conclusions.",
  navLabel: "Les rutes d'aquesta pàgina",
  navTitle: "Anar a una ruta",
  extraNav: {
    reglas: "Les regles",
    cobertura: "Quant n'hi ha de cada cosa",
    falta: "El que encara no recull",
    fuentes: "Fonts i descàrregues",
  },

  labels: {
    source: "Font",
    sources: "Fonts",
    method: "Com s'obté",
    checks: "Què es comprova",
    gaps: "El que no mostra",
    tables: "Taula descarregable",
    perRowSource: "cada fila porta la seva pròpia font i data",
  },

  rulesTitle: "Les regles de totes les pàgines",
  rules: [
    "Cada xifra porta la seva font a la mateixa pàgina, amb enllaç al document original i la seva data.",
    "Les dades es publiquen juntes per poder-les consultar. Que dues dades apareguin l'una al costat de l'altra no vol dir que l'una expliqui l'altra: ni els diners expliquen un vot ni un vot explica els diners.",
    "Una persona s'uneix a un registre només quan el nom identifica una sola fila i, on la font ho permet, el partit coincideix. Un nom semblant no n'hi ha prou: en cas de dubte, no es publica res.",
    "Les posicions són vots registrats, amb les paraules de la papereta. No es dedueix la postura de ningú a partir del seu partit.",
    "No se sumen ni es resten xifres d'anys diferents ni de conjunts de partits diferents.",
    "No se suma un patrimoni total ni s'ordena ningú pel que declara o cobra.",
    "El que falta es mostra com a «—», mai com a 0. Una part petita que no és zero s'escriu «menys de l'1 %», mai «0 %».",
  ],

  routes: {
    estado: {
      title: "De l'Estat als partits",
      finding: (v) =>
        `${v.parties} partits han rebut ${v.total} en subvencions estatals registrades, de ${v.from} a ${v.to}. Dades actualitzades el ${v.updated}.`,
    },
    donantes: {
      title: "De particulars als partits",
      finding: (v) =>
        `${v.donors} donants van donar ${v.donationsTotal} als partits el ${v.donationsYear}, segons el Tribunal de Comptes. Cap amb nom.`,
    },
    fundaciones: {
      title: "Cap a les fundacions dels partits",
      finding: (v) =>
        `De les aportacions que van rebre les fundacions vinculades el ${v.fYears}, ${elCa(v.partyShare)} el va posar el mateix partit i ${elCa(v.companiesShare)}, empreses.`,
    },
    campana: {
      title: "En què es va gastar la campanya",
      finding: (v) =>
        `${capCa(elCa(v.otherShare))} de la despesa ordinària que van declarar les ${v.spendFormations} formacions a les europees de 2024 és en una sola línia, sense desglossar.`,
    },
    votos: {
      title: "Com es va votar al Congrés",
      finding: (v) =>
        `Aquest web segueix ${v.divisions} votacions nominals del Congrés, de ${v.votesFrom} a ${v.votesTo}, amb ${v.votingDeputies} diputats diferents votant-hi.`,
    },
    declaraciones: {
      title: "El que declaren els diputats",
      finding: (v) =>
        `${v.declPublished} de les ${v.declTotal} declaracions de béns dels diputats estan transcrites i comprovades. Les altres ${v.declPending} enllacen al PDF oficial mentre es transcriuen.`,
    },
    sueldos: {
      title: "El que cobren els càrrecs públics",
      finding: (v) =>
        `${v.withSalary} dels ${v.officeholders} càrrecs del Registre d'Alts Càrrecs tenen una retribució publicada. El registre es va actualitzar el ${v.salaryUpdated}.`,
    },
    contexto: {
      title: "El context",
      finding: () =>
        "Xifres de l'Estat que no són diners ni vots: delictes d'odi, salaris i pobresa, qui governa cada comunitat i les notícies que llegeix la portada. No s'afirma que una cosa expliqui l'altra.",
    },
  },

  items: (v) => ({
    subsidios: {
      title: "Subvencions estatals als partits",
      method: [
        "Les subvencions públiques estatals concedides als partits polítics s'extreuen en directe de la Base de Dades Nacional de Subvencions (BDNS / SNPSAP), el registre oficial del Ministeri d'Hisenda, del seu llistat de concessions a partits polítics de l'Administració de l'Estat. Cada concessió arriba amb el seu import, la seva data, la seva convocatòria, l'òrgan que la concedeix i l'enllaç a la seva base legal al BOE.",
        "Cada concessió s'atribueix al partit pel NIF que la mateixa BDNS escriu davant del nom del beneficiari. El NIF és la clau que uneix aquesta xifra amb la resta del web.",
        "Es distingeixen dos tipus d'ajut estatal anual, segons el text de la convocatòria: finançament ordinari, la subvenció principal, repartida segons representació parlamentària; i despeses de seguretat, ajuts per a despeses de protecció. El que no encaixa en cap de les dues es compta a part.",
      ],
      checks: [
        `${v.grants} concessions a l'última consulta. La convocatòria s'escriu de diverses maneres a la font («financiación ordinaria», «financiación ordinara», sic), així que la classificació busca l'arrel de la paraula i no la frase exacta.`,
      ],
      gaps: [
        "Només l'Estat: les subvencions de comunitats autònomes, parlaments i ajuntaments no són en aquest llistat. Apareixen, com a totals per partit i any, als comptes que fiscalitza el Tribunal de Comptes, a l'apartat següent.",
        "Les subvencions es concedeixen al partit, no a la persona: no hi ha una xifra de «finançament per polític».",
        "Les subvencions no tenen territori. A les pàgines de província es mostren com a xifres nacionals.",
      ],
    },
    ingresos: {
      title: "D'on surten els ingressos dels partits",
      method: [
        `Transcrits dels informes de fiscalització dels comptes anuals dels partits polítics del Tribunal de Comptes: núm. 1.532 (exercicis 2018 i 2019) i núm. 1.573 (exercici 2020). Exercicis en aquest web: ${v.incomeYears}.`,
        "Dues taules per any: els recursos públics, per l'administració que els paga (Estat, governs autonòmics, Corts Generals, parlaments autonòmics, entitats locals i altres), i els privats, per origen (quotes d'afiliats, aportacions de càrrecs públics, donacions i altres ingressos).",
        "El PDF té capa de text, però les columnes hi surten desordenades, així que les xifres es van llegir de les imatges de cada pàgina.",
        `Una fila s'uneix a un partit d'aquest web només quan el nom imprès n'identifica un de sol: ${v.incomeLinked} de ${v.incomeRows} files. Les altres es mostren amb el nom de l'informe i sense enllaç.`,
      ],
      checks: [
        "Cada fila suma el seu total imprès, i cada columna, la fila TOTAL de l'informe.",
        "Cada xifra transcrita apareix a la capa de text del PDF d'aquella pàgina.",
        "El 2020, les donacions de cada partit coincideixen amb les del gràfic de donacions del mateix informe, que és una lectura independent.",
        "El total imprès d'ingressos públics de 2020 està tallat a la cel·la («167.744.342,3»); es desa la suma de les seves columnes, 167.744.342,39.",
      ],
      gaps: [
        `Són els partits que el Tribunal va fiscalitzar cada any, els que van rebre subvenció anual per al seu funcionament (${v.incomeCounts}), no tots els partits d'Espanya. El conjunt canvia d'un any a l'altre, així que els totals d'anys diferents no se sumen ni es resten.`,
        "Les subvencions electorals van en un altre annex i no hi són incloses.",
        "El 2018 i el 2019, Nueva Canarias hi figura sense xifres: una nota de l'informe diu que no va facilitar la composició dels seus ingressos. Es conserva la fila amb zeros i la nota, perquè els zeros no es llegeixin com a absència d'ingressos.",
        "Les aportacions de càrrecs públics són el que paguen al partit els qui ocupen un càrrec en nom seu. L'informe no diu quina part del seu sou representen.",
      ],
    },
    donaciones: {
      title: `Donacions privades, ${v.donationsYear}`,
      method: [
        `Transcrites de la taula consolidada de donacions per trams (gràfic 5, pàgina 435 dels annexos) de l'Informe núm. 1.573 del Tribunal de Comptes, exercici ${v.donationsYear}. Tres trams: menys de 1.000 €, de 1.000 a 10.000 € i més de 10.000 €; per a cadascun, quants donants i quants diners.`,
        "Les donacions d'empreses estan prohibides. Des de la reforma de 2015 de la Llei Orgànica 8/2007, les persones jurídiques no poden donar a partits; només persones físiques, amb un màxim de 50.000 €/any i sense donacions anònimes.",
      ],
      checks: [
        "Els totals de cada partit coincideixen amb la columna de donacions dels seus ingressos privats al mateix informe, que es va transcriure per separat.",
      ],
      gaps: [
        "L'informe no dona noms de donants: publica les donacions agrupades per import.",
        `Allò privat no és una API. Aquestes dades només es publiquen als informes anuals en PDF del Tribunal de Comptes, amb anys de retard (el de l'exercici ${v.donationsYear} es va aprovar el juny de 2024); per això el repartiment per trams és una foto fixa de ${v.donationsYear} i no una dada en directe.`,
        "De 2018 i 2019 aquest web té el total donat a cada partit, dins dels seus ingressos, però no el repartiment per trams: el gràfic de donacions d'aquells anys no està transcrit.",
      ],
    },
    fundaciones: {
      title: `Diners de les fundacions vinculades, ${v.fYears}`,
      method: [
        "Extret de l'Informe núm. 1.642 del Tribunal de Comptes, que fiscalitza una fitxa per entitat i exercici: aportacions de particulars, d'empreses i del mateix partit, subvencions públiques per organisme, convenis de col·laboració, comptes de l'exercici i incompliments.",
        `El partit de cada entitat és el que consta al mateix informe. ${v.fUnlinked} entitats el partit de les quals, tal com el nomena l'informe, no n'identifica un de sol d'aquest web no s'atribueixen a cap.`,
        "Als partits els està prohibit acceptar diners d'empreses; a les seves fundacions no. Es regeixen per la disposició addicional setena de la Llei Orgànica 8/2007: per sobre de 120.000 euros la donació s'ha d'elevar a document públic, tota donació d'una persona jurídica s'ha de comunicar al Tribunal de Comptes en tres mesos i la identitat del donant s'ha de publicar.",
      ],
      checks: [
        "L'extracció recalcula l'aritmètica de cada taula i quadra les fitxes amb els totals dels annexos de l'informe; si alguna cosa no quadra, s'atura.",
        v.fDiscrepancies === 0
          ? ""
          : v.fDiscrepancies === 1
          ? "L'aritmètica del mateix informe falla en un punt. Allà es publiquen les dues xifres, la declarada i la suma de les seves partides, perquè l'error és de la font, no d'aquest web."
          : `L'aritmètica del mateix informe falla en ${v.fDiscrepancies} punts. Allà es publiquen les dues xifres, la declarada i la suma de les seves partides, perquè l'error és de la font, no d'aquest web.`,
      ],
      gaps: [
        `L'informe cobreix ${v.fYears}; no hi ha dades posteriors publicades.`,
        "No diu qui són les persones jurídiques que van donar: nomena la contrapart només quan els diners van arribar com a conveni de col·laboració.",
        `El registre obligatori és gairebé buit: a ${v.registerAsOf} només hi constaven inscrites al Registre de Partits Polítics ${v.fRegistered} fundacions i ${v.eRegistered} entitats de les fiscalitzades.`,
      ],
    },
    patronatos: {
      title: "Qui governa les fundacions",
      method: [
        "L'informe recull els diners, mai les persones. Els patronats es recullen a mà, de la font que els publica en cada cas: un registre oficial, una font oficial, una publicació de la mateixa entitat o, si no n'hi ha cap altra, la premsa.",
        "Cada càrrec porta una sola font, amb enllaç i data; un càrrec sense font no existeix. El que només consta a la premsa es mostra com a «segons <mitjà> (<data>)» i no es compta juntament amb el que consta en un registre.",
        "Les dates es mostren: una llista de patronat és una foto d'un moment, no el patronat d'avui.",
      ],
      checks: [
        `Patronat documentat en ${v.documented} de ${v.entities} entitats auditades: ${v.people} persones i ${v.ties} càrrecs externs, cadascun amb la seva font i la seva data. ${
          v.press === 1
            ? "Un d'aquests registres es basa en la premsa i es mostra com a tal."
            : `${v.pressFmt} d'aquests registres es basen en la premsa i es mostren com a tals.`
        }`,
      ],
      gaps: [
        v.boardGaps === 1
          ? "En una entitat no es va localitzar un patronat publicat, i la seva fitxa ho diu."
          : `En ${v.boardGapsFmt} entitats no es va localitzar un patronat publicat, i la seva fitxa ho diu.`,
        "No es dedueix res: un càrrec apareix només si una font amb nom ho afirma, i no hi ha puntuacions, rànquings ni mètriques de xarxa.",
      ],
    },
    cruce: {
      title: "Patrons que tenen també un càrrec públic",
      method: [
        "Les persones dels patronats es creuen amb el Registre d'Alts Càrrecs. Calen dues condicions alhora: que el nom normalitzat (sense accents i sense importar l'ordre) correspongui a un sol càrrec del registre, i que el partit del càrrec sigui el de la fundació segons l'informe, o que el càrrec consti sense partit.",
        `Un nom normalitzat no és una identitat: els ${v.registerRows} càrrecs del registre donen ${v.registerKeys} noms diferents. Per això un nom que correspon a més d'un càrrec diferent no dona res.`,
      ],
      checks: [
        `De les ${v.joinCandidates} persones dels patronats, ${v.joinMatched} consten al registre amb un càrrec públic, i aquest càrrec es mostra tal com el recollia el registre el ${v.registerUpdated}. En queden fora ${v.joinUnmatched} que no consten al registre, el normal en un patronat amb membres que no són càrrecs públics; ${v.joinAmbiguous} el nom de les quals coincideix amb més d'un càrrec diferent, i ${v.joinMismatch} en què el partit del càrrec no coincideix amb el de la fundació. En els dos últims casos no es publica res.`,
      ],
      gaps: [
        "El registre no té data per persona ni marca d'actiu, així que un càrrec que ja ha canviat de mans és un retard del registre, no un fet actual que afirmi aquest web.",
        "Són dos registres públics sobre la mateixa persona, posats l'un al costat de l'altre: res d'aquí no diu que el càrrec i el patronat tinguin relació.",
      ],
    },
    gasto: {
      title: "Despesa electoral declarada, europees de 2024",
      method: [
        "De l'Informe núm. 1.628 del Tribunal de Comptes sobre les comptabilitats de les eleccions al Parlament Europeu del 9 de juny de 2024: per formació, els seus recursos (privats, préstecs, bestretes de subvenció, aportacions del partit i altres), la seva despesa ordinària declarada i justificada, i els enviaments de propaganda.",
        "Cada formació s'uneix a un partit amb una taula escrita a mà, no per semblança de noms, perquè diverses són coalicions el nom de les quals no comparteix cap paraula amb el d'un partit. En una coalició, el partit és el que va encapçalar la llista, i la xifra és de tota la candidatura.",
        "Les dues partides de publicitat, exterior i en premsa i ràdio, són les úniques despeses que la llei limita; la taula diu si cada formació va superar el límit.",
      ],
      checks: [],
      gaps: [
        "La resta de la despesa ordinària figura en una sola línia el destí de la qual l'informe no detalla. Aquesta part es dibuixa a la seva mida a les pàgines dels partits.",
        "Una formació que no figura a la taula de correspondències no s'atribueix a cap partit.",
      ],
    },
    votaciones: {
      title: "Votacions nominals",
      method: [
        "Cada vot prové de les dades obertes de votacions del Congrés dels Diputats: un per diputat i votació, tal com el recull l'acta. Cada votació enllaça a la seva acta oficial i, si és una llei, al seu text.",
        `Cada votació s'etiqueta segons el seu tipus: votació final de llei, presa en consideració, proposició no de llei o moció conseqüència d'interpel·lació. Les dues últimes no són vinculants (${v.nonBinding} de les seguides). S'exclouen les votacions d'esmenes.`,
        `Les votacions s'agrupen per temes (${v.topics}). Quines votacions se segueixen ho decideix aquest web: no són una mostra de tota l'activitat del Congrés.`,
      ],
      checks: [
        "Un diputat apareix només si consta el seu vot; no es dedueix la postura de ningú a partir del seu partit.",
        "Un grup parlamentari no és un partit. Quan el grup el forma un sol partit, s'enllaça al finançament d'aquest partit; quan el formen diversos, a cap, perquè atribuir els diners d'una coalició a un dels seus membres seria fals.",
      ],
      gaps: [
        `Són xifres sense denominador: el Congrés celebra milers de votacions, i dibuixar-ne aquestes ${v.divisions} com a proporció d'alguna cosa inventaria un total del qual no formen part.`,
        "Les barres de resultat no diuen si una votació va prosperar: les lleis orgàniques necessiten majoria absoluta, i una barra convidaria a la lectura equivocada.",
      ],
    },
    bienes: {
      title: "Declaracions de béns i rendes",
      method: [
        "La declaració de béns i rendes que cada diputat de la XV Legislatura va presentar en prendre l'escó només existeix com a escaneig, sense text llegible per màquina. Aquest web la transcriu apartat per apartat, amb el text tal com el va escriure el diputat.",
        "Les rendes són les de l'any anterior a la declaració. El formulari exclou el que es cobra del Congrés o del Senat, que totes dues cambres publiquen a part.",
        "Una declaració s'uneix al seu diputat pel codi de la seva fitxa del Congrés, no pel nom.",
      ],
      checks: [
        `Una transcripció es publica únicament si els seus totals coincideixen amb la transcripció independent de ${v.checkName} o amb una segona lectura independent de l'escaneig: ${v.declRtve} acarades amb ${v.checkName} i ${v.declSecond} amb una segona lectura.`,
        `El llistat de ${v.checkName} no inclou l'IRPF, així que en les declaracions acarades amb ell aquesta xifra prové d'una sola lectura, i els textos no s'acaren en cap cas.`,
        "Una xifra que no està escrita en el format numèric espanyol es mostra també tal com apareix a l'escaneig, per comprovar-la al PDF oficial.",
        "Davant de qualsevol diferència, mana el PDF oficial.",
      ],
      gaps: [
        `${v.declPending} declaracions encara no estan transcrites; el perfil de cada diputat enllaça el PDF oficial. Les declaracions posteriors, en deixar l'escó o per una altra causa, tampoc no estan transcrites.`,
        "El formulari no demana el valor dels immobles, així que no hi ha xifra de patrimoni total. Demana un únic saldo per al conjunt dels comptes, que pot aparèixer al costat de només un d'ells.",
        "S'ometen les matrícules que alguna declaració inclou, perquè el mateix formulari demana no indicar-les.",
        "Tot és una declaració pròpia: el Congrés la publica «sin corrección alguna», segons el seu propi formulari.",
      ],
    },
    intereses: {
      title: "Declaracions d'interessos econòmics",
      method: [
        `Activitats, fundacions i associacions, regals i observacions, del fitxer de dades obertes del Congrés (${v.interestRows} files, baixat el ${v.interestsUpdated}), reproduïdes tal qual, inclòs el sector, que cada declarant escriu a la seva manera.`,
        "On el fitxer escriu el nom d'una altra manera que la fitxa del diputat (un segon nom de més o de menys), la coincidència s'accepta només si un únic declarant encaixa.",
      ],
      checks: [],
      gaps: ["Si el fitxer no recull cap fila amb el nom d'un diputat, el seu perfil ho diu."],
    },
    salarios: {
      title: "Registre d'Alts Càrrecs",
      method: [
        `Retribucions dels càrrecs públics en actiu segons el Registre d'Alts Càrrecs (transparencia.gob.es), obtingudes a través de l'exportació en CSV de ${v.salaryVia}: càrrec, partit, àmbit i retribució bruta anual, i mensual on la font la dona.`,
        "Retribució del càrrec, no patrimoni ni ingressos privats. Només càrrecs marcats com a actius a la font.",
      ],
      checks: [],
      gaps: [
        "On el registre no publica retribució, es mostra «—», mai 0 €.",
        "No s'ordena ningú pel que cobra.",
      ],
    },
    personas: {
      title: "Qui és qui: diputats, càrrecs i retrats",
      method: [
        `El directori reuneix els ${v.deputies} diputats en actiu, de les dades obertes del Congrés, i els càrrecs del Registre d'Alts Càrrecs.`,
        "Un diputat i una fila del registre es tracten com la mateixa persona només si es compleixen dues condicions: exactament una fila del registre porta el seu nom normalitzat, o una llista d'àlies escrita a mà la nomena; i els seus partits coincideixen, o un dels dos no hi consta. El que queda entremig no es resol i s'informa, perquè una unió equivocada posaria les declaracions d'una persona a la pàgina d'una altra.",
        "Els retrats són de Wikipedia i Wikimedia Commons, amb llicència lliure, i només quan el títol de l'article coincideix exactament amb el nom de la persona.",
        "Els perfils de les persones reuneixen també l'activitat a Bluesky i els titulars on apareix cada polític. Cada perfil de Bluesky s'ha verificat un a un; ara mateix l'esquerra hi té més presència, i líders del PP i Vox no hi tenen compte verificable.",
      ],
      checks: [],
      gaps: [
        "Que no consti un registre d'una persona no vol dir que no existeixi.",
        "Un retrat depèn que existeixi una llicència lliure; que no hi sigui no diu res de la persona.",
      ],
    },
    odio: {
      title: "Delictes d'odi",
      method: [
        `Per comunitat autònoma, els fets registrats el ${v.hateYear} i la seva taxa per 100.000 habitants, de les taules 2.2 i 7.1 de l'informe del Ministeri de l'Interior, tal com les publica.`,
        "Les xifres nacionals i el cas judicial de sota es van comprovar contra una font oficial abans d'escriure's.",
      ],
      checks: [],
      gaps: [],
    },
    ine: {
      title: "Salaris i pobresa, INE",
      method: [
        `Taules de l'INE de l'Enquesta Anual d'Estructura Salarial i de l'Enquesta de Condicions de Vida (${v.ineTables}), tal com les publica.`,
      ],
      checks: ["Les cel·les que l'INE marca per tenir poca mostra es conserven marcades, a la columna baja_muestra."],
      gaps: [],
    },
    territorio: {
      title: "Comunitats, províncies i governs",
      method: [
        `Les ${v.provinces} províncies i la seva comunitat, de l'INE. Els contorns del mapa, de l'Instituto Geográfico Nacional. Qui presideix cada comunitat i des de quan, comprovat el ${v.govChecked}.`,
      ],
      checks: [],
      gaps: [],
    },
    noticias: {
      title: "Fonts d'actualitat",
      method: [],
      checks: [],
      gaps: [],
    },
  }),

  routeTables: "Taules d'aquesta ruta",

  coverageSourcesLabel: "Fonts",

  notYetTitle: "El que aquest web encara no recull",
  notYetIntro:
    "El que falta també és una dada. Això és el que les fonts no publiquen o el que aquest web encara no ha incorporat.",
  notYet: [
    "Donacions per trams d'exercicis diferents del 2020.",
    "Fundacions després del 2022: el Tribunal de Comptes no n'ha publicat exercicis posteriors.",
    "Les declaracions de béns que falten per transcriure i les presentades després de prendre l'escó.",
    "Les subvencions autonòmiques i locals concessió a concessió: només hi consten com a totals per partit als comptes fiscalitzats.",
    "Contractació pública. Si s'incorpora, qualsevol vincle entre partits, fundacions i adjudicataris s'etiquetarà sempre com a associació, no com a prova d'influència.",
    "Nomenaments en empreses. El Boletín Oficial del Registro Mercantil els publica només amb nom i cognoms, sense DNI, així que només es podrien unir a un polític pel nom, i aquest web no uneix pel nom.",
  ],

  srcTitle: "Fonts i descàrregues",
  datosLink: "Totes les taules d'aquest web, una per una, en CSV",
  lessThanOne: "menys de l'1 %",
};

/** Catalan article for a formatted percentage: "l'" before a vowel sound (1, 11), else "el ". */
function elCa(p: string): string {
  return /^(1([^\d]|$)|11([^\d]|$))/.test(p) ? `l'${p}` : `el ${p}`;
}
function capCa(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const COPY: Record<Locale, Copy> = { es, en, ca };
