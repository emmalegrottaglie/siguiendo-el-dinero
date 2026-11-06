import {
  BCP47,
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
} from "./locales";

// Re-export the locale constants so existing "@/lib/i18n" imports keep working.
export * from "./locales";

const es = {
  meta: {
    title: "Siguiendo el Dinero · Subvenciones públicas a los partidos",
    description:
      "Rastreo de las subvenciones públicas estatales que reciben los partidos políticos españoles, con datos de la Base de Datos Nacional de Subvenciones (BDNS).",
  },
  nav: {
    panel: "Panel",
    people: "Políticos",
    votes: "Votaciones",
    methodology: "Metodología",
    context: "Contexto",
    funding: "Financiación",
    rights: "Derechos",
    map: "Mapa",
    foundations: "Fundaciones",
    skipToContent: "Saltar al contenido",
  },
  people: {
    title: "Políticos",
    intro:
      "Cada cargo público en activo del registro de retribuciones y cada diputado del Congreso: lo que cobra cuando el registro lo publica, la financiación de su partido, su voto registrado en leyes de derechos, lo que declaró al Congreso y, cuando existe, sus redes y los titulares en los que aparece.",
    featured: "Con voto registrado",
    featuredNote:
      "Perfiles con votación nominal documentada. El resto del registro aparece en el buscador.",
    directory: "Registro completo",
    hasRecord: "voto registrado",
    hasSocial: "redes",
    noRecord: "Sin voto registrado",
    noRecordExplain:
      "No consta ninguna votación nominal de esta persona en los asuntos que seguimos. No se deduce su postura a partir de su partido.",
    pay: "Retribución",
    noPay: "Sin cifra publicada",
    noPayExplain: "El registro de retribuciones no publica una cifra para este cargo.",
    notInRegister:
      "No figura en el registro de retribuciones que usa este sitio; el perfil procede de la lista de diputados del Congreso.",
    partyFunding: "Financiación del partido",
    rightsRecord: "Voto en leyes de derechos",
    juxtaposition:
      "Voto registrado y financiación del partido se muestran juntos como asociación, no como causa: el dinero público no explica un voto concreto.",
    profile: "Ver perfil →",
    backToPeople: "← Políticos",
    affects: "Asuntos que afectan a minorías",
    affectsNote:
      "Leyes y mociones sobre derechos trans y LGTBI, salud sexual y reproductiva, y vivienda. Cada posición enlaza al acta oficial.",
  },
  salaryShape: {
    readerBin: "{count} cargos",
    readerHere: "aquí cae esta retribución",
    readerMedian: "aquí cae la mediana",
    yAxis: "Nº de cargos en cada tramo · el tramo más poblado tiene {peak}",
    xAxis: "Retribución bruta anual · escala logarítmica: cada marca multiplica por 10",
    tableCaption:
      "Las {published} retribuciones publicadas en el registro, repartidas en {bins} tramos de igual anchura en la escala logarítmica, y cuántos cargos caen en cada uno.",
    colBand: "Tramo (€ brutos al año)",
    colCount: "Cargos",
    title: "Dónde queda esta retribución",
    position:
      "{pay} al año está por encima del {rank} de los {published} cargos del registro que publican una cifra.",
    medianTick: "mediana",
    highest:
      "{pay} al año es la retribución más alta de las {published} publicadas en el registro.",
    lowest:
      "{pay} al año es la retribución más baja de las {published} publicadas en el registro.",
    nearTop:
      "Sólo {above} de las {published} retribuciones publicadas en el registro superan los {pay} al año.",
    nearBottom:
      "Sólo {below} de las {published} retribuciones publicadas en el registro quedan por debajo de {pay} al año.",
    noFigure:
      "El registro no publica retribución anual para este cargo, así que no hay posición que señalar en el reparto.",
    median: "La mediana publicada es de {median}.",
    caveat:
      "{missing} de las {total} filas del registro no publican cifra y no entran en este reparto. El eje es logarítmico: lo publicado va de {min} a {max}, cuatro órdenes de magnitud, y mezcla una alcaldía de pueblo a tiempo parcial con la Corona y una comisaría europea. Una posición en este eje es una posición en una lista, no un juicio sobre si un cargo vale lo que cobra.",
  },
  smiPosition: {
    readerHere: "aquí cae esta retribución",
    title: "En múltiplos del salario mínimo",
    sentence:
      "{pay} al año equivale a {multiple} veces el SMI de {year} ({smi}/año); cae en el tramo «{tranche}», donde se sitúa el {share} de los asalariados.",
    boeLink: "RD {rd} ↗",
    noFigure:
      "El registro no publica retribución anual para este cargo, así que no hay múltiplo de SMI que calcular.",
    caveat:
      "El SMI es un salario por persona trabajadora; esta cifra es la retribución de un cargo público, que no siempre es a tiempo completo ni el único ingreso de quien lo ocupa. La comparación da una escala común, no una equivalencia exacta.",
  },
  declarations: {
    title: "Lo que declaró al Congreso",
    juxtaposition:
      "Lo declarado y lo votado se publican juntos para poder consultarlos; lo uno no explica lo otro.",
    filed:
      "Declaración de bienes y rentas del {date}, presentada al tomar el escaño; las rentas son las de {year}.",
    officialPdf: "PDF oficial ↗",
    later: "Declaraciones posteriores, aún sin transcribir aquí:",
    notTranscribed:
      "Esta declaración aún no está transcrita aquí. Se puede consultar en el PDF oficial.",
    noFiling: "La ficha del Congreso no enlaza ninguna declaración de bienes y rentas.",
    checkRtve: "Totales cotejados con la transcripción independiente de",
    checkSecond: "Totales cotejados con una segunda lectura independiente del escaneo.",
    income: "Rentas declaradas",
    incomeNote:
      "Del año anterior a la declaración. El formulario excluye lo cobrado del Congreso o del Senado, que ambas cámaras publican aparte.",
    groups: {
      salary: "Salarios, honorarios y retribuciones",
      dividends: "Dividendos y beneficios",
      interest: "Intereses de cuentas y activos",
      other: "Otras rentas",
    },
    irpf: "Cuota del IRPF declarada",
    realEstate: "Inmuebles",
    realEstateNote:
      "El formulario no pide el valor de los inmuebles, así que aquí no hay cifra de patrimonio total.",
    propertyKinds: { urban: "urbano", rustic: "rústico", company: "vía sociedad" },
    financial: "Depósitos y otros bienes",
    deposits: "Saldo en cuentas",
    depositsNote:
      "El formulario pide un único saldo para el conjunto de las cuentas, así que puede aparecer junto a sólo una de ellas.",
    notesFlag:
      "Alguna cifra de esta declaración no está escrita en el formato numérico español: debajo de ella figura tal como aparece en el escaneo, y conviene comprobarla en el PDF oficial.",
    writtenAs: "escrito «{text}»",
    noInterests: "El fichero de datos abiertos del Congreso no recoge ninguna fila con este nombre.",
    assetKinds: { securities: "Valores y participaciones", other: "Otros bienes, rentas o derechos" },
    holdings: "Sociedades participadas en más de un 5 %",
    vehicles: "Vehículos",
    debts: "Deudas",
    otherDebts: "Otras deudas",
    observations: "Observaciones",
    total: "Total declarado",
    none: "Nada declarado en este apartado.",
    columns: {
      concept: "Concepto",
      group: "Procedencia",
      amount: "Euros",
      description: "Descripción",
      location: "Situación",
      acquired: "Adquisición",
      title: "Derecho y título",
      kind: "Tipo",
      granted: "Concesión",
      lent: "Importe concedido",
      pending: "Saldo pendiente",
      sector: "sector declarado",
      benefactor: "de",
    },
    interests: "Intereses económicos",
    interestsNote:
      "Datos abiertos del Congreso, reproducidos tal cual, incluido el sector, que cada declarante escribe a su manera.",
    activities: "Actividades",
    foundations: "Fundaciones, asociaciones y aportaciones",
    donations: "Regalos y donaciones recibidos",
    interestObservations: "Observaciones",
    caveat:
      "Todo lo que figura aquí es una declaración propia: el Congreso la publica «sin corrección alguna», según su propio formulario. La declaración de bienes y rentas sólo existe como escaneo, sin texto legible por máquina, así que la transcribe este sitio, y cada transcripción se publica únicamente si sus totales coinciden con la transcripción independiente de {check} o con una segunda lectura independiente del escaneo. El listado de {check} no incluye el IRPF, así que en las declaraciones cotejadas con él esa cifra procede de una sola lectura, y los textos no se cotejan en ningún caso. Se omiten las matrículas que alguna declaración incluye, porque el propio formulario pide no indicarlas. Ante cualquier diferencia, manda el PDF oficial.",
  },
  assets: {
    title: "Lo que declararon",
    intro:
      "La declaración de bienes y rentas que cada diputado presentó al tomar posesión en 2023, con las rentas de 2022. Este sitio la transcribe del escaneo oficial y sólo la publica cuando sus totales se han comprobado. Junto a cada nombre, los totales por apartado; el detalle completo está en su perfil.",
    tabs: { label: "Secciones de Políticos", directory: "Directorio", declarations: "Bienes declarados" },
    coverage:
      "{done} de {total} declaraciones transcritas y comprobadas. El resto enlaza al PDF oficial mientras se transcribe.",
    all: "Todos",
    tableCaption: "Totales declarados por apartado, en orden alfabético",
    columns: {
      name: "Nombre",
      filed: "Presentada",
      income: "Rentas",
      financial: "Depósitos y otros bienes",
      realEstate: "Inmuebles",
      vehicles: "Vehículos",
      debts: "Deudas pendientes",
    },
    legend:
      "— : nada declarado en ese apartado. Inmuebles y vehículos se cuentan, porque el formulario no les da valor.",
    noRanking:
      "En orden alfabético. Este sitio no ordena a los diputados por nada de lo declarado ni suma un patrimonio total.",
    download: "Todas las partidas declaradas, en CSV ↓",
    noneForParty: "Ningún diputado de este partido tiene aún la declaración transcrita.",
    pending: "Pendientes de transcribir: {count}",
    pendingNote: "Cada nombre lleva a su perfil, que enlaza la declaración oficial.",
    noFiling: "Sin declaración de bienes en su ficha del Congreso: {names}.",
    source: "Fuente",
  },
  ballotGrid: {
    noBallot: "Sin voto registrado",
    caption:
      "Voto emitido en {cast} de las {tracked} votaciones nominales que seguimos. El Congreso celebra miles, así que esto es el registro que tenemos, no el historial completo de voto de esta persona.",
    tableCaption:
      "Cada votación que seguimos, por tema y de la más antigua a la más reciente, con el voto que consta para esta persona.",
    colTopic: "Tema",
    colVote: "Votación",
    colDate: "Fecha",
    colBallot: "Voto",
  },
  votes: {
    inFavour: "Sí",
    against: "No",
    abstention: "Abstención",
    noVote: "No vota",
  },
  court: {
    title: "Lo que consta en el registro judicial",
  },
  masthead: {
    edition: "Edición nº 001",
    live: "Datos en directo · BDNS",
    place: "Madrid",
    sources: "Fuentes: BDNS · Tribunal de Cuentas · Congreso",
    navLabel: "Secciones",
    theme: "Tema de color",
    themeLight: "Claro",
    themeDark: "Oscuro",
    themeSystem: "Como el sistema",
  },
  charts: {
    showTable: "Ver los datos en una tabla",
    source: "Fuente",
    updated: "actualizado el {date}",
    approved: "aprobado el {date}",
    financialYear: "ejercicio {year}",
    range: "de {from} a {to}",
    report: "Informe {report}",
    rollCall: "Acta de la votación nominal",
    spendingElection: "elecciones europeas del 9 de junio de 2024",
    portraitsDataset: "retratos con licencia libre",
    scrollHint:
      "El gráfico es más ancho que la pantalla: desliza en horizontal dentro del recuadro para verlo entero, o abre la tabla de debajo.",
    scrollRegion: "Gráfico desplazable en horizontal",
    readerKeys:
      "Usa las flechas para recorrer los valores; Inicio y Fin llevan al primero y al último.",
    readerGridKeys:
      "Usa las flechas para moverte entre las celdas; Inicio y Fin llevan al principio y al final de la fila, y Control con Inicio o Fin, a la primera y la última celda.",
    readerCount: "{n} valores",
    readerRange: "Valores de {min} a {max}",
    readerPosition: "{i} de {n}",
    ofTotal: "{share} del total",
    download: "Descargar imagen",
    downloadBusy: "Preparando la imagen…",
    downloadFailed: "No se ha podido generar la imagen.",
    downloadLabel: "Descargar imagen: «{title}», PNG de 1200 × 675",
    dataAsOf: "Datos a {date}",
  },
  common: {
    caveat: "Qué hay que saber",
  },
  kinds: {
    ordinaria: "Financiación ordinaria",
    seguridad: "Gastos de seguridad",
    otra: "Otra",
    all: "Todas",
  },
  money: {
    routePartyTo: "El partido",
    routeStateRules: [
      "Para gastos electorales",
      "Anuales, para funcionamiento",
      "De las comunidades autónomas",
      "Aportaciones de los grupos parlamentarios",
    ],
    routeDonorFrom: "Una persona",
    routeDonorRules: [
      "Sólo personas físicas, nunca empresas",
      "Hasta 50.000 € al año por persona",
      "Con nombre: ninguna anónima",
      "Nada de quien tenga un contrato público vigente",
    ],
    routeFoundationTo: "La fundación del partido",
    routeFoundationRules: [
      "Las empresas sí pueden donar",
      "Sin el tope de 50.000 €",
      "Más de 120.000 €: documento público",
      "Donación de empresa: aviso al Tribunal de Cuentas en tres meses",
    ],
    donationsFinding: "El {donorShare} de los donantes dio menos de 1.000 €, y entre todos aportaron el {amountShare} del dinero.",
  },
  foundations: {
    officeJoin:
      "De esas personas, {matched} de {candidates} figuran en el Registro de Altos Cargos con un cargo público, y ese cargo se muestra tal como lo recogía el registro el {updated}. Son dos registros públicos sobre la misma persona, puestos uno al lado del otro: nada aquí dice que el cargo y el patronato tengan relación.",
    officeJoinDrops:
      "Quedan fuera {unmatched} personas que no constan en el registro —lo normal en un patronato con miembros que no son cargos públicos—, {ambiguous} cuyo nombre coincide con más de un cargo distinto, y {mismatch} en las que el partido del cargo no coincide con el de la fundación. En los dos últimos casos no se publica nada: un nombre no identifica a una persona.",
    title: "Quién paga a las fundaciones de los partidos",
    intro:
      "Cada partido tiene fundaciones y asociaciones vinculadas que reciben dinero por su cuenta. A los partidos les está prohibido aceptar dinero de empresas; a sus fundaciones no. Pero al mirar las cifras auditadas, el dinero de empresas es la parte pequeña: casi nueve de cada diez euros que entran los pone el propio partido.",
    fromParty: "Del propio partido",
    fromCompanies: "De empresas",
    fromIndividuals: "De particulares",
    publicSubsidies: "Subvenciones públicas",
    ofContributions: "de las aportaciones declaradas",
    publicNote: "Dinero público concedido a las fundaciones, aparte de las aportaciones.",
    entities: "entidades auditadas",
    contributionCount: "Aportaciones",
    origin: "Origen",
    counterpartyTitle: "Empresas y entidades con nombre en el informe",
    counterpartyNote:
      "El dinero de empresas casi nunca llega como donación, sino como convenio de colaboración con una contraprestación. El informe nombra a la contraparte sólo en estos casos, e indica si se cumplieron los tres deberes del apartado Cinco de la disposición adicional séptima: elevar a documento público, comunicar al Tribunal de Cuentas en tres meses y publicar en la web.",
    counterparty: "Contraparte",
    consideration: "Contraprestación",
    duties: "Deberes de publicidad",
    dutiesMet: "cumplidos",
    dutiesFailed: "incumplidos",
    dutiesUnclear: "el informe no lo precisa",
    registerTitle: "El registro obligatorio está casi vacío",
    registerBody:
      "La disposición adicional cuarta de la Ley Orgánica 6/2002 obliga a estas entidades a inscribirse en el Registro de Partidos Políticos. A 31 de diciembre de 2022 sólo constaban inscritas 18 fundaciones y 3 entidades de las fiscalizadas. El Tribunal de Cuentas pide al Ministerio del Interior que reclame las inscripciones pendientes, y ya lo había pedido en su informe anterior.",
    repeatedTitle: "Pedido dos veces, sin cumplir",
    repeatedBody:
      "Las siete recomendaciones de este informe son las mismas que el Tribunal de Cuentas ya formuló en su informe nº 1.533, sobre el ejercicio 2020, aprobado el 28 de septiembre de 2023. Las tres dirigidas al Gobierno siguen sin cumplirse porque no se ha modificado la ley. Las dirigidas a las propias fundaciones —ajustar su actividad a sus fines y presentar un plan de saneamiento cuando su patrimonio es negativo— tampoco se han cumplido.",
    legalTitle: "Qué permite la ley",
    legalBody:
      "Desde la reforma de 2015, un partido no puede aceptar donaciones de personas jurídicas, ni donaciones anónimas, ni más de 50.000 euros al año de una misma persona física, y debe rechazar el dinero de quien tenga un contrato público vigente. Sus fundaciones se rigen por la disposición adicional séptima: ahí las personas jurídicas sí pueden donar. Por encima de 120.000 euros la donación debe elevarse a documento público, toda donación de una persona jurídica debe comunicarse al Tribunal de Cuentas en tres meses y la identidad del donante debe publicarse. No pueden recibir dinero de organismos, entidades o empresas públicas.",
    lawLink: "Ley Orgánica 8/2007, disposición adicional séptima ↗",
    tableTitle: "Entidad por entidad",
    tableNote:
      "Una tarjeta por entidad, sumando los ejercicios que el informe fiscaliza. El partido es el que consta en el propio informe. La barra reparte el total entre partido, empresas, particulares y subvención pública; ordenadas por lo que recibió cada una, de mayor a menor.",
    entity: "Entidad",
    party: "Partido",
    total: "Total recibido",
    boardCount: "{count} en el patronato",
    noPartyStated: "sin partido indicado",
    gapTitle: "Lo que no muestra",
    gapBody:
      "El informe cubre 2021 y 2022; no hay datos posteriores publicados. No dice quiénes son las personas jurídicas que donaron: nombra a la contraparte sólo cuando el dinero llegó como convenio de colaboración. Y su propia aritmética falla en un punto, que se señala en la ficha correspondiente.",
    dossierEyebrow: "Entidad vinculada a un partido",
    identityTitle: "Datos generales",
    supervisor: "Protectorado o administración competente",
    constituted: "Año de constitución",
    registryLabel: "Registro de Partidos Políticos",
    registryYes: "inscrita",
    registryNo: "no inscrita",
    registryUnstated: "el informe no lo indica",
    notStated: "no consta",
    moneyInTitle: "De dónde vino el dinero",
    publicByTitle: "Dinero público, por organismo",
    grantingBody: "Organismo",
    dealsTitle: "Convenios de colaboración",
    findingsTitle: "Lo que encontró el Tribunal de Cuentas",
    noFindings: "El informe no recoge incumplimientos para este ejercicio.",
    accountsTitle: "Cuentas del ejercicio",
    netEquity: "Patrimonio neto",
    income: "Ingresos",
    expense: "Gastos",
    result: "Resultado",
    discrepancyTitle: "La aritmética del informe no cuadra aquí",
    discrepancyBody:
      "El informe declara {stated} pero sus propias partidas suman {itemised}, una diferencia de {difference}. Se publican las dos cifras porque el error es de la fuente, no de esta web.",
    exercise: "Ejercicio",
    backToChannel: "← Volver a las fundaciones",
    allEntities: "Ver la ficha",
    peopleTitle: "Quién lo gobierna",
    peopleNote:
      "Cargos en el patronato y en los órganos de gobierno, según la fuente que se cita en cada caso y con su fecha. Se distingue lo que consta en un registro o en una publicación de la propia entidad de lo que sólo consta en prensa. No se deduce nada: un cargo aparece sólo si una fuente con nombre lo afirma.",
    peopleAlso: "También consta",
    peopleFormer: "cargo pasado",
    peoplePress: "según {publisher} ({date})",
    peopleSince: "desde",
    peopleGapTitle: "Sin patronato publicado",
    peopleRenameTitle: "La entidad cambió de nombre",
    peopleRenameBody: "El informe la llama «{report}». Desde {when} se denomina «{current}».",
    peopleKindRegistry: "registro oficial",
    peopleKindOfficial: "fuente oficial",
    peopleKindFoundation: "publicación de la propia entidad",
    peopleKindPress: "prensa",
    peopleCoveragePress: "{press} de esos registros se apoyan en prensa y se muestran como tal.",
    peopleCoverageTitle: "Quién gobierna estas entidades",
    peopleCoverage:
      "Patronato documentado en {documented} de {entities} entidades auditadas: {people} personas y {ties} cargos externos, cada uno con su fuente y su fecha. Donde no se localizó un patronato publicado, la ficha lo dice.",
  },
  party: {
    recentHeadlines: "Titulares recientes · Google News",
  },
  feed: {
    justNow: "hace un momento",
    hoursAgo: (n: number) => `hace ${n} h`,
    daysAgo: (n: number) => `hace ${n} d`,
    noRecent: "Sin resultados recientes.",
    cannotLoad: "No se pudieron cargar publicaciones ahora mismo.",
    reposted: "↻ Republicado",
    fromOrg: "publicación de la entidad",
  },
  donationsTable: {
    party: "Formación",
    byTranche: "Reparto por tramos",
    total: "Total",
    donors: "Donantes",
    tranchesNote:
      "Tramos del informe: menos de 1.000 €, de 1.000 a 10.000 €, más de 10.000 €.",
    trancheSmall: "Menos de 1.000 €",
    trancheMid: "De 1.000 a 10.000 €",
    trancheLarge: "Más de 10.000 €",
    legalNote:
      "Las empresas no pueden donar a los partidos desde la reforma de 2015 de la LO 8/2007: sólo personas físicas, con un máximo de 50.000 € al año y sin donaciones anónimas. No existe una cifra de financiación por político, y esta web no la calcula.",
  },
  spending: {
    lineAdvertising: "Publicidad exterior y en prensa y radio",
    lineAdvertisingNote:
      "Los dos únicos gastos con límite legal propio: arts. 55 y 58 de la LOREG.",
    lineResidual: "Línea residual, sin desglose en el informe",
    lineResidualNote:
      "«Otros gastos ordinarios». Es la mayor parte del gasto y el informe no dice en qué se fue.",
    lineFinancial: "Costes financieros y otros conceptos",
    lineFinancialNote: "Intereses liquidados y estimados de las operaciones de crédito.",
    gapBody:
      "«Otros gastos ordinarios» es una sola línea sin desglose y es la mayor parte del gasto declarado. El informe no dice en qué se gastó, y la ley no obliga a detallarlo: la publicidad digital no es una categoría con límite propio, y el propio Tribunal de Cuentas ha recomendado al Gobierno que legisle para que lo sea. Estas cifras son gasto declarado y fiscalizado, no una imputación de nada a nadie.",
  },
  coverage: {
    tableCaption: "Las cuatro proporciones, con su numerador y su denominador.",
    colWhat: "Qué se mide",
    colCovered: "Con dato",
    colTotal: "Total",
    colShare: "Proporción",
    title: "Cuánto hay de cada cosa",
    intro:
      "Esta página dice en prosa lo que falta. Aquí está en cifras, calculadas sobre los propios datos en cada compilación, para que se pueda comprobar la frase contra la barra.",
    of: "de",
    rows: {
      salary: "Cargos con retribución publicada",
      vote: "Cargos con voto nominal registrado",
      portrait: "Cargos con retrato de licencia libre",
      board: "Entidades fiscalizadas con patronato documentado",
    },
    counts:
      "Además: {divisions} llamamientos nominales seguidos, con {deputies} diputados distintos votando en ellos, y un único ejercicio de donaciones privadas, el de {donationYear}. Son cifras ciertas sin denominador: el Congreso celebra miles de votaciones, y dibujar nueve como proporción de algo inventaría un total del que no forman parte.",
    orphans:
      "Hay además {n} retratos de personas que no figuran en el registro de altos cargos. No se descartan: el registro sólo recoge cargos en activo, así que un retrato sin fila es lo normal para quien ya no lo es.",
    note:
      "Las cuatro proporciones miden cosas distintas contra registros distintos —un retrato depende de que exista una licencia libre, un voto registrado de que la persona se siente en el Congreso—, así que no están ordenadas por porcentaje ni comparadas entre sí. Van en el orden en que se encuentran en la web.",
  },
  method: {
    title: "Metodología y límites",
    lead: "Esta herramienta es honesta sobre lo que puede y no puede mostrar. Léelo antes de sacar conclusiones.",
    showTitle: "Qué muestra",
    showP1a: "Las ",
    showP1emph: "subvenciones públicas estatales",
    showP1b:
      " concedidas a los partidos políticos, extraídas en directo de la Base de Datos Nacional de Subvenciones (BDNS / SNPSAP), el registro oficial del Ministerio de Hacienda. Actualmente ",
    showP1c: " y un total de ",
    showP1d: ". Datos actualizados el ",
    showP2: "Se distinguen dos tipos de ayuda estatal anual:",
    showB1: "Financiación ordinaria — la subvención principal, repartida según representación parlamentaria.",
    showB2: "Gastos de seguridad — ayudas para gastos de protección.",
    privTitle: "Financiación privada (parcial)",
    privP1:
      "Cada partido muestra también sus donaciones privadas declaradas, transcritas del Informe nº 1573 del Tribunal de Cuentas (ejercicio 2020). Con dos advertencias importantes:",
    privB1:
      "Las donaciones de empresas están prohibidas. Desde la reforma de 2015 de la Ley Orgánica 8/2007, las personas jurídicas no pueden donar a partidos; sólo personas físicas, con un máximo de 50.000 €/año y sin donaciones anónimas.",
    privB2:
      "Lo privado no es un API. Estos datos sólo se publican en los informes anuales en PDF del Tribunal de Cuentas, con uno o dos años de retraso; por eso es una foto fija de 2020 y no un dato en directo.",
    polTitle: "Políticos individuales",
    polP1:
      "La sección Caras reúne políticos individuales con su partido, su actividad en Bluesky y los titulares en los que aparecen. No hay una cifra de «financiación por político»: las subvenciones se conceden al partido, no a la persona. Cada perfil de Bluesky se ha verificado uno a uno; a día de hoy la izquierda tiene más presencia allí, y líderes de PP y Vox no tienen cuenta verificable.",
    roadTitle: "Hoja de ruta",
    roadB1:
      "Hecho — Subvenciones públicas en directo (BDNS); donaciones privadas 2020 (Tribunal de Cuentas); políticos individuales con Bluesky y noticias.",
    roadB2:
      "Siguiente — Más ejercicios de donaciones del Tribunal de Cuentas y fundaciones vinculadas a partidos (ingesta periódica de PDF, no en directo).",
    roadB3:
      "Después — Contratación pública y grafo de vínculos entre partidos, fundaciones y adjudicatarios, etiquetado siempre como asociación, no prueba de influencia.",
    feedsTitle: "Fuentes de actualidad",
    feedsP1:
      "La portada no busca en la web abierta: lee una lista fija de canales RSS y Atom, de forma que el nombre de quien publica cada titular es siempre conocido y se muestra junto a él.",
    feedsGuard: (stale: number, item: number) =>
      `Una fuente cuya publicación más reciente supere los ${stale} días se considera apagada y se descarta por completo. Ninguna pieza con más de ${item} días entra en el panel, sea cual sea la fuente. Se muestran como máximo dos piezas por fuente, para que un medio que publica a diario no desplace a las entidades que publican una vez por semana.`,
    feedsSource: "Fuente",
    feedsKind: "Tipo",
    feedsTopics: "Temas",
    feedsOrg: "Entidad",
    feedsMedia: "Medio",
    feedsTopic: { lgtbi: "LGTBI y trans", vivienda: "Vivienda", pobreza: "Pobreza" },
    feedsExcludedP:
      "Estos canales se comprobaron y quedaron fuera. Se listan para que no se vuelvan a probar a ciegas y porque el primer caso es instructivo: un canal puede responder correctamente y llevar años sin publicar.",
    ctxTitle: "Qué dice el registro oficial sobre los delitos de odio",
    ctxLead:
      "Estas cifras son del Estado, no de esta web. Se publican aquí porque el dinero y los votos que recoge este sitio no significan nada sin el contexto de lo que ocurre en el país. No se afirma que una cosa explique la otra.",
    ctxRecordedTitle: "Hechos registrados por la policía",
    ctxRecordedNote:
      "Son hechos conocidos por las Fuerzas y Cuerpos de Seguridad: denuncias e incidentes registrados, no condenas. Los propios informes reconocen que muchos casos nunca llegan a la justicia, así que la cifra es un suelo, no un total.",
    ctxProsecutedTitle: "Actuación de la Fiscalía",
    ctxProsecutedNote:
      "Cuenta lo que hizo el Ministerio Fiscal, no lo que se denunció a la policía. Las dos series no son subconjuntos una de la otra y no deben sumarse.",
    ctxRacism: "por racismo o xenofobia",
    ctxLgtbi: "por orientación sexual o identidad de género",
    ctxSentences: "sentencias recibidas",
    ctxConvictions: "condenatorias",
    ctxCharges: "escritos de acusación por racismo o xenofobia",
    ctxChangeYear: "frente al año anterior",
    ctxFindingTitle: "Lo que ninguna autoridad ha declarado",
    ctxFindingBody:
      "Ninguna autoridad española ha resuelto que el gasto de campaña de un partido constituyera delito de odio. La Junta Electoral ordenó retirar una lona de Vox en Madrid, pero por el artículo 53 de la LOREG —propaganda fuera del periodo de campaña— y declinó expresamente pronunciarse sobre su contenido. El único intento penal conocido acabó archivado.",
    ctxCaseTitle: "El caso de los «menas», y cómo terminó",
    ctxCaseBody:
      "El cartel electoral de Vox para la Asamblea de Madrid de 2021 fue denunciado como delito de odio. El Juzgado de Instrucción nº 53 de Madrid lo sobreseyó el 29 de abril de 2021 y la Sección Segunda de la Audiencia Provincial de Madrid confirmó el archivo el 19 de julio de 2021, encuadrándolo en la «legítima lucha ideológica» de una campaña. Recurrieron el archivo la Fiscalía, el PSOE, Podemos, Izquierda Unida, la coalición Unidas Podemos y la asociación Progresa. Se recoge aquí precisamente porque el resultado fue negativo: un registro que enumere la acusación y no el archivo no es una herramienta de transparencia.",
    ctxNoTag:
      "Por eso esta web no etiqueta a nadie como «instigador de odio». No existe un registro público de condenas por persona que un particular pueda consultar y publicar: el artículo 10 de la LOPDGDD reserva los datos de condenas penales a las autoridades públicas, el CENDOJ disocia los datos personales antes de difundir las sentencias, y el Tribunal Constitucional (STC 58/2018) considera determinante que una persona pueda ser recuperada por su nombre. Se publican cifras agregadas oficiales y procedimientos concretos con su resultado; no inferencias.",
    srcTitle: "Fuentes",
    src1: "BDNS / SNPSAP — concesiones a partidos políticos ↗",
    src2: "Tribunal de Cuentas — partidos políticos ↗",
    src3: "Ley Orgánica 8/2007 sobre financiación de partidos ↗",
  },
  datos: {
    eyebrow: "Descargas",
    title: "Los datos, tabla por tabla",
    lead: "Las mismas cifras que el resto del sitio, no una extracción nueva: cada tabla de aquí abajo es la que ya alimenta sus páginas, en un CSV descargable. El enlace a cada tabla es permanente, para poder citarla.",
    rows: "{count} filas",
    download: "Descargar CSV",
    perRowSourced: "Cada fila lleva su propia fuente y fecha, en las columnas fuente_*: esta tabla no comparte una única fuente.",
    columnsNote: "Las cabeceras de columna son fijas y no cambian con el idioma de esta página.",
    tables: {
      subsidios: {
        title: "Subvenciones públicas a partidos",
        description: "Cada concesión de la BDNS a un partido político, una fila por concesión.",
      },
      donaciones: {
        title: "Donaciones privadas, 2020",
        description: "Donaciones privadas del ejercicio 2020, por partido y tramo, según el Tribunal de Cuentas.",
      },
      ingresos_partidos: {
        title: "Ingresos de los partidos, 2018–2020",
        description: "Ingresos ordinarios de 2018, 2019 y 2020 de los partidos fiscalizados cada año, públicos por administración y privados por origen (cuotas, cargos públicos, donaciones, otros), según el Tribunal de Cuentas. Una fila por partido y ejercicio; los partidos fiscalizados cambian de un año a otro.",
      },
      fundaciones: {
        title: "Fundaciones vinculadas a partidos",
        description: "Un dossier por entidad y ejercicio, del informe 1.642 del Tribunal de Cuentas.",
      },
      fundaciones_cargos: {
        title: "Quién gobierna esas fundaciones",
        description: "Personas con un cargo en el patronato de una fundación vinculada, con la fuente de cada nombramiento.",
      },
      fundaciones_vinculos: {
        title: "Sus otros cargos",
        description: "Los cargos que esas mismas personas tienen fuera de la fundación — empresa, gobierno u otro organismo.",
      },
      gasto_electoral: {
        title: "Gasto electoral declarado",
        description: "Lo que cada formación declaró haber gastado en las elecciones al Parlamento Europeo de 2024, por partida.",
      },
      salarios: {
        title: "Registro de altos cargos",
        description: "6.670 cargos públicos, con su puesto, su partido y su retribución.",
      },
      votaciones: {
        title: "Votaciones nominales",
        description: "Cada voto registrado en las votaciones que este sitio sigue, una fila por diputado y votación.",
      },
      declaraciones_bienes: {
        title: "Declaraciones de bienes y rentas",
        description:
          "Lo que cada diputado en activo declaró al tomar el escaño, transcrito del escaneo oficial: una fila por renta, inmueble, cuenta, bien, vehículo o deuda.",
      },
      intereses_economicos: {
        title: "Declaraciones de intereses económicos",
        description:
          "Actividades previas, fundaciones y asociaciones, regalos y observaciones que declara cada diputado, tal como las publica el Congreso.",
      },
      delitos_odio: {
        title: "Delitos de odio por comunidad",
        description: "Hechos registrados por comunidad autónoma, con la tasa por 100.000 habitantes.",
      },
      gobiernos: {
        title: "Presidencias autonómicas",
        description: "Quién preside cada comunidad autónoma, y desde cuándo.",
      },
      provincias: {
        title: "Provincias y comunidades",
        description: "Las 52 provincias y la comunidad autónoma a la que pertenece cada una.",
      },
      salarios_ine: {
        title: "Salarios — INE",
        description: "Salario por sector, tipo de jornada, percentil y tramo de SMI, según la Encuesta Anual de Estructura Salarial.",
      },
      pobreza_ine: {
        title: "Pobreza y exclusión — INE",
        description: "Tasas AROPE nacionales y por comunidad autónoma, según la Encuesta de Condiciones de Vida.",
      },
    },
  },
};

type Dict = typeof es;

const en: Dict = {
  meta: {
    title: "Following the Money · Public subsidies to Spanish parties",
    description:
      "Tracking the public state subsidies that Spanish political parties receive, with data from the National Subsidies Database (BDNS).",
  },
  nav: {
    panel: "Dashboard",
    people: "Politicians",
    votes: "Votes",
    methodology: "Methodology",
    context: "Context",
    funding: "Funding",
    rights: "Rights",
    map: "Map",
    foundations: "Foundations",
    skipToContent: "Skip to content",
  },
  people: {
    title: "Politicians",
    intro:
      "Every serving officeholder in the pay register, and every member of the Congress: what they are paid where the register publishes it, how their party is funded, their recorded vote on rights legislation, what they declared to Congress and, where it exists, their social presence and the headlines they appear in.",
    featured: "With a voting record",
    featuredNote:
      "Profiles with a documented roll-call vote. The rest of the register is in the search below.",
    directory: "Full register",
    hasRecord: "voting record",
    hasSocial: "social",
    noRecord: "No recorded vote",
    noRecordExplain:
      "This person has no roll-call vote on record for the items we track. Their position is not inferred from their party.",
    pay: "Pay",
    noPay: "No published figure",
    noPayExplain: "The pay register publishes no figure for this post.",
    notInRegister:
      "Not in the pay register this site uses; this profile comes from Congreso's list of deputies.",
    partyFunding: "Party funding",
    rightsRecord: "Vote on rights legislation",
    juxtaposition:
      "Recorded votes and party funding are shown side by side as association, not cause: public money does not explain any particular vote.",
    profile: "View profile →",
    backToPeople: "← Politicians",
    affects: "Issues affecting minorities",
    affectsNote:
      "Laws and motions on trans and LGBTI rights, sexual and reproductive health, and housing. Every position links to the official record.",
  },
  salaryShape: {
    readerBin: "{count} posts",
    readerHere: "this pay falls here",
    readerMedian: "the median falls here",
    yAxis: "Number of posts in each band · the largest band holds {peak}",
    xAxis: "Gross annual pay · logarithmic scale: each mark multiplies by 10",
    tableCaption:
      "The {published} figures published in the register, split into {bins} bands of equal width on the logarithmic scale, and how many posts fall in each.",
    colBand: "Band (gross € a year)",
    colCount: "Posts",
    title: "Where this pay sits",
    position:
      "{pay} a year is higher than {rank} of the {published} officeholders in the register who publish a figure.",
    medianTick: "median",
    highest:
      "{pay} a year is the highest of the {published} figures published in the register.",
    lowest:
      "{pay} a year is the lowest of the {published} figures published in the register.",
    nearTop:
      "Only {above} of the {published} figures published in the register are higher than {pay} a year.",
    nearBottom:
      "Only {below} of the {published} figures published in the register are lower than {pay} a year.",
    noFigure:
      "The register publishes no annual figure for this post, so there is no position to mark on the distribution.",
    median: "The median published figure is {median}.",
    caveat:
      "{missing} of the register's {total} rows publish no figure and are not in this distribution. The axis is logarithmic: published pay runs from {min} to {max}, four orders of magnitude, and it mixes a part-time village mayoralty with the Crown and a European commissionership. A position on this axis is a position in a list, not a judgement about whether a post is worth its pay.",
  },
  smiPosition: {
    readerHere: "this pay falls here",
    title: "In multiples of the minimum wage",
    sentence:
      "{pay} a year is {multiple} times the {year} SMI ({smi}/year); it falls in the \"{tranche}\" tranche, where {share} of wage earners sit.",
    boeLink: "RD {rd} ↗",
    noFigure:
      "The register publishes no annual figure for this post, so there is no SMI multiple to calculate.",
    caveat:
      "The SMI is a per-worker wage; this figure is a public post's pay, which is not always full-time nor the only income of whoever holds it. The comparison gives a common scale, not an exact equivalence.",
  },
  declarations: {
    title: "What they declared to Congress",
    juxtaposition:
      "What was declared and how they voted are published together so both can be looked up; neither explains the other.",
    filed:
      "Declaration of assets and income dated {date}, filed on taking the seat; the income is for {year}.",
    officialPdf: "Official PDF ↗",
    later: "Later declarations, not yet transcribed here:",
    notTranscribed:
      "This declaration is not transcribed here yet. It can be read in the official PDF.",
    noFiling: "The Congreso profile links no declaration of assets and income.",
    checkRtve: "Totals checked against the independent transcription by",
    checkSecond: "Totals checked against a second, independent reading of the scan.",
    income: "Declared income",
    incomeNote:
      "For the year before the declaration. The form excludes pay from the Congreso or the Senado, which both chambers publish separately.",
    groups: {
      salary: "Salaries, fees and other pay",
      dividends: "Dividends and profit shares",
      interest: "Interest on accounts and assets",
      other: "Other income",
    },
    irpf: "Declared income-tax (IRPF) liability",
    realEstate: "Property",
    realEstateNote:
      "The form does not ask for the value of property, so there is no total net-worth figure here.",
    propertyKinds: { urban: "urban", rustic: "rural", company: "via a company" },
    financial: "Deposits and other assets",
    deposits: "Account balances",
    depositsNote:
      "The form asks for a single balance covering all accounts, so it may appear beside only one of them.",
    notesFlag:
      "Some figures in this declaration are not written in Spanish number format: each is shown beneath as it appears in the scan, and is worth checking against the official PDF.",
    writtenAs: "written “{text}”",
    noInterests: "Congreso's open-data file has no rows under this name.",
    assetKinds: { securities: "Securities and holdings", other: "Other goods, income or rights" },
    holdings: "Companies more than 5 % owned",
    vehicles: "Vehicles",
    debts: "Debts",
    otherDebts: "Other debts",
    observations: "Remarks",
    total: "Total declared",
    none: "Nothing declared in this part.",
    columns: {
      concept: "Item",
      group: "Source",
      amount: "Euros",
      description: "Description",
      location: "Location",
      acquired: "Acquired",
      title: "Right and title",
      kind: "Type",
      granted: "Granted",
      lent: "Amount lent",
      pending: "Outstanding",
      sector: "declared sector",
      benefactor: "from",
    },
    interests: "Economic interests",
    interestsNote:
      "Congreso open data, reproduced as published, including the sector, which each declarant words their own way. Text stays in Spanish.",
    activities: "Activities",
    foundations: "Foundations, associations and contributions",
    donations: "Gifts and donations received",
    interestObservations: "Remarks",
    caveat:
      "Everything here is self-declared: the Congreso publishes it \"sin corrección alguna\" (without any correction), as its own form says. The asset declaration exists only as a scan with no machine-readable text, so this site transcribes it, and each transcription is published only when its totals equal the independent transcription by {check} or a second, independent reading of the scan. {check}'s listing has no IRPF figure, so in declarations checked against it that line rests on a single reading, and text is never cross-checked. Licence plates that a few declarations include are left out, as the form itself asks. Wherever they differ, the official PDF prevails.",
  },
  assets: {
    title: "What they declared",
    intro:
      "The asset and income declaration each deputy filed on taking their seat in 2023, with their income for 2022. This site transcribes it from the official scan and publishes it only once its totals have been checked. Each name shows the totals by section; the full detail is on their profile.",
    tabs: { label: "Politicians sections", directory: "Directory", declarations: "Declared assets" },
    coverage:
      "{done} of {total} declarations transcribed and checked. The rest link the official PDF until they are transcribed.",
    all: "All",
    tableCaption: "Totals declared by section, in alphabetical order",
    columns: {
      name: "Name",
      filed: "Filed",
      income: "Income",
      financial: "Deposits and other assets",
      realEstate: "Properties",
      vehicles: "Vehicles",
      debts: "Debts outstanding",
    },
    legend:
      "— : nothing declared in that section. Properties and vehicles are counted, because the form gives them no value.",
    noRanking:
      "Alphabetical order. This site does not rank deputies by anything they declared, and does not add up a total net worth.",
    download: "Every declared item, as CSV ↓",
    noneForParty: "No deputy of this party has a transcribed declaration yet.",
    pending: "Not yet transcribed: {count}",
    pendingNote: "Each name leads to the deputy's profile, which links the official declaration.",
    noFiling: "No asset declaration on their Congreso page: {names}.",
    source: "Source",
  },
  ballotGrid: {
    noBallot: "No ballot recorded",
    caption:
      "A ballot cast in {cast} of the {tracked} recorded divisions this site tracks. The Congreso holds thousands, so this is the record we hold, not this person's complete voting history.",
    tableCaption:
      "Every division we track, by topic and oldest first, with the ballot on record for this person.",
    colTopic: "Topic",
    colVote: "Division",
    colDate: "Date",
    colBallot: "Ballot",
  },
  votes: {
    inFavour: "Yes",
    against: "No",
    abstention: "Abstention",
    noVote: "Did not vote",
  },
  court: {
    title: "What the judicial record says",
  },
  masthead: {
    edition: "Edition no. 001",
    live: "Live data · BDNS",
    place: "Madrid",
    sources: "Sources: BDNS · Court of Auditors · Congress",
    navLabel: "Sections",
    theme: "Colour theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "Match the system",
  },
  charts: {
    showTable: "Show the data as a table",
    source: "Source",
    updated: "updated {date}",
    approved: "approved {date}",
    financialYear: "financial year {year}",
    range: "{from} to {to}",
    report: "Report {report}",
    rollCall: "Record of the roll-call vote",
    spendingElection: "European Parliament election of 9 June 2024",
    portraitsDataset: "freely licensed portraits",
    scrollHint:
      "The chart is wider than the screen: swipe sideways inside its box to see all of it, or open the table below.",
    scrollRegion: "Horizontally scrollable chart",
    readerKeys:
      "Use the arrow keys to step through the values; Home and End go to the first and the last.",
    readerGridKeys:
      "Use the arrow keys to move between cells; Home and End go to the start and end of the row, and Control with Home or End to the first and last cell.",
    readerCount: "{n} values",
    readerRange: "Values from {min} to {max}",

    readerPosition: "{i} of {n}",
    ofTotal: "{share} of the total",
    download: "Download image",
    downloadBusy: "Preparing the image…",
    downloadFailed: "The image could not be generated.",
    downloadLabel: "Download image: “{title}”, 1200 × 675 PNG",
    dataAsOf: "Data as of {date}",
  },
  common: {
    caveat: "What to know",
  },
  kinds: {
    ordinaria: "Ordinary funding",
    seguridad: "Security costs",
    otra: "Other",
    all: "All",
  },
  money: {
    routePartyTo: "The party",
    routeStateRules: [
      "For election expenses",
      "Annual, for running costs",
      "From the autonomous communities",
      "Contributions from parliamentary groups",
    ],
    routeDonorFrom: "An individual",
    routeDonorRules: [
      "Individuals only, never companies",
      "Up to €50,000 a year per person",
      "Named: none anonymous",
      "None from anyone holding a live public contract",
    ],
    routeFoundationTo: "The party's foundation",
    routeFoundationRules: [
      "Companies may donate",
      "No €50,000 cap",
      "Over €120,000: a public deed",
      "A company donation: notified to the Tribunal de Cuentas within three months",
    ],
    donationsFinding: "{donorShare} of donors gave under €1,000, and together they gave {amountShare} of the money.",
  },
  foundations: {
    officeJoin:
      "Of those people, {matched} of {candidates} appear in the Senior Appointments Register holding a public office, and that office is shown as the register recorded it on {updated}. They are two public records about one person, placed side by side: nothing here says the office and the board seat are related.",
    officeJoinDrops:
      "Left out: {unmatched} people with no row in the register — ordinary for a board with members who hold no public office — {ambiguous} whose name matches more than one distinct office, and {mismatch} where the office’s party contradicts the foundation’s. Nothing is published in either of the last two cases: a name does not identify a person.",
    title: "Who pays the parties' foundations",
    intro:
      "Every party has linked foundations and associations that take money in their own right. Parties may not accept money from companies; their foundations may. But in the audited figures the corporate share is the small one: almost nine of every ten euros coming in are put there by the party itself.",
    fromParty: "From the party itself",
    fromCompanies: "From companies",
    fromIndividuals: "From individuals",
    publicSubsidies: "Public subsidies",
    ofContributions: "of declared contributions",
    publicNote: "Public money granted to the foundations, on top of the contributions.",
    entities: "audited entities",
    contributionCount: "Contributions",
    origin: "Source",
    counterpartyTitle: "Companies and entities the report names",
    counterpartyNote:
      "Corporate money almost never arrives as a donation. It arrives as a collaboration agreement with something given in return, and the report names the counterparty only in those cases — stating whether the three duties in apartado Cinco of disposición adicional séptima were met: raise it to a public deed, notify the Tribunal de Cuentas within three months, and publish it on the website.",
    counterparty: "Counterparty",
    consideration: "In return",
    duties: "Disclosure duties",
    dutiesMet: "met",
    dutiesFailed: "not met",
    dutiesUnclear: "the report does not settle it",
    registerTitle: "The compulsory register is nearly empty",
    registerBody:
      "Disposición adicional cuarta of Ley Orgánica 6/2002 obliges these entities to register in the Registro de Partidos Políticos. At 31 December 2022 only 18 foundations and 3 entities of those audited were registered. The Tribunal de Cuentas asks the Interior Ministry to chase the rest — as it had already asked in its previous report.",
    repeatedTitle: "Asked twice, still unmet",
    repeatedBody:
      "This report's seven recommendations are the same ones the Tribunal de Cuentas made in report nº 1.533 on the 2020 exercise, approved on 28 September 2023. The three addressed to the Government remain unmet because the law was never amended. Those addressed to the foundations themselves — keep to their own stated purposes, and produce a recovery plan where equity is negative — have not been met either.",
    legalTitle: "What the law allows",
    legalBody:
      "Since the 2015 reform a party may not accept donations from legal entities, nor anonymous donations, nor more than €50,000 a year from one individual, and must refuse money from anyone holding a live public contract. Its foundations are governed instead by disposición adicional séptima, where legal entities may donate. Above €120,000 the donation must be raised to a public deed, every donation from a legal entity must be notified to the Tribunal de Cuentas within three months, and the donor's identity must be published. They may not take money from public bodies, entities or companies.",
    lawLink: "Ley Orgánica 8/2007, disposición adicional séptima ↗",
    tableTitle: "Entity by entity",
    tableNote:
      "One card per entity, adding the exercises the report audits. The party is the one the report itself states. The bar splits the total between party, corporate, individual and public money; sorted by what each one received, highest first.",
    entity: "Entity",
    party: "Party",
    total: "Total received",
    boardCount: "{count} on the board",
    noPartyStated: "no party stated",
    gapTitle: "What this does not show",
    gapBody:
      "The report covers 2021 and 2022; nothing later has been published. It does not say which legal entities donated — it names the counterparty only where the money arrived as a collaboration agreement. And its own arithmetic fails in one place, which is flagged on the dossier concerned.",
    dossierEyebrow: "Entity linked to a party",
    identityTitle: "Identity",
    supervisor: "Supervising administration",
    constituted: "Year constituted",
    registryLabel: "Registro de Partidos Políticos",
    registryYes: "registered",
    registryNo: "not registered",
    registryUnstated: "the report does not say",
    notStated: "not stated",
    moneyInTitle: "Where the money came from",
    publicByTitle: "Public money, by granting body",
    grantingBody: "Granting body",
    dealsTitle: "Collaboration agreements",
    findingsTitle: "What the Tribunal de Cuentas found",
    noFindings: "The report records no breaches for this exercise.",
    accountsTitle: "Accounts for the exercise",
    netEquity: "Net equity",
    income: "Income",
    expense: "Expenditure",
    result: "Result",
    discrepancyTitle: "The report's arithmetic does not add up here",
    discrepancyBody:
      "The report states {stated} while its own lines sum to {itemised}, a difference of {difference}. Both figures are published, because the error is the source's and not this site's.",
    exercise: "Exercise",
    backToChannel: "← Back to the foundations",
    allEntities: "Open the dossier",
    peopleTitle: "Who governs it",
    peopleNote:
      "Roles on the board and in the governing bodies, each according to the source cited beside it and carrying that source's date. What stands in a register or in the entity's own disclosure is kept apart from what stands only in the press. Nothing is inferred: a role appears only where a named source states it.",
    peopleAlso: "Also on record",
    peopleFormer: "former role",
    peoplePress: "according to {publisher} ({date})",
    peopleSince: "since",
    peopleGapTitle: "No board published",
    peopleRenameTitle: "The entity changed its name",
    peopleRenameBody: "The report calls it “{report}”. Since {when} it trades as “{current}”.",
    peopleKindRegistry: "official register",
    peopleKindOfficial: "official filing",
    peopleKindFoundation: "the entity's own disclosure",
    peopleKindPress: "press",
    peopleCoveragePress: "{press} of those records rest on journalism and are shown as such.",
    peopleCoverageTitle: "Who governs these entities",
    peopleCoverage:
      "A board is documented for {documented} of the {entities} audited entities: {people} people and {ties} outside roles, each with its source and date. Where no published board could be found, the dossier says so.",
  },
  party: {
    recentHeadlines: "Recent headlines · Google News",
  },
  feed: {
    justNow: "just now",
    hoursAgo: (n: number) => `${n}h ago`,
    daysAgo: (n: number) => `${n}d ago`,
    noRecent: "No recent results.",
    cannotLoad: "Couldn't load posts right now.",
    reposted: "↻ Reposted",
    fromOrg: "organisation's own post",
  },
  donationsTable: {
    party: "Formation",
    byTranche: "Split by tranche",
    total: "Total",
    donors: "Donors",
    tranchesNote:
      "The report's tranches: under €1,000, €1,000–10,000, over €10,000.",
    trancheSmall: "Under €1,000",
    trancheMid: "€1,000–10,000",
    trancheLarge: "Over €10,000",
    legalNote:
      "Companies have not been able to donate to parties since the 2015 reform of LO 8/2007: natural persons only, capped at €50,000 a year, with no anonymous gifts. There is no per-politician funding figure, and this site does not compute one.",
  },
  spending: {
    lineAdvertising: "Outdoor, press and radio advertising",
    lineAdvertisingNote:
      "The only two kinds of spending with a cap of their own: LOREG arts. 55 and 58.",
    lineResidual: "Residual line, not broken down in the report",
    lineResidualNote:
      "“Otros gastos ordinarios”. It is most of the spending, and the report does not say where it went.",
    lineFinancial: "Financial costs and other items",
    lineFinancialNote: "Settled and estimated interest on credit facilities.",
    gapBody:
      "“Otros gastos ordinarios” is a single line with no breakdown, and it is most of the declared spending. The report does not say what it bought, and the law does not require it to: digital advertising is not a category with its own cap, and the Tribunal de Cuentas has itself recommended that the Government legislate to make it one. These are declared and audited figures, not an imputation of anything to anyone.",
  },
  coverage: {
    tableCaption: "The four ratios, with their numerator and denominator.",
    colWhat: "What is measured",
    colCovered: "With data",
    colTotal: "Total",
    colShare: "Ratio",
    title: "How much of each there is",
    intro:
      "This page states its gaps in prose. Here they are as figures, computed over the data itself on every build, so the sentence can be checked against the bar.",
    of: "of",
    rows: {
      salary: "Officeholders with a published salary",
      vote: "Officeholders with a recorded roll-call vote",
      portrait: "Officeholders with a freely licensed portrait",
      board: "Audited entities with a documented board",
    },
    counts:
      "Also: {divisions} recorded divisions tracked, with {deputies} distinct deputies voting in them, and a single financial year of private donations, {donationYear}. These are true figures with no denominator: the Congreso holds thousands of divisions, and drawing nine as a proportion of something would invent a whole they are not part of.",
    orphans:
      "There are also {n} portraits of people who do not appear in the senior appointments register. They are not discarded: the register carries only serving officeholders, so a portrait without a row is ordinary for someone who has left.",
    note:
      "The four ratios measure different things against different registers — a portrait depends on a free licence existing, a recorded vote on the person sitting in the Congreso — so they are neither ordered by percentage nor compared with one another. They run in the order a reader meets them on the site.",
  },
  method: {
    title: "Methodology and limits",
    lead: "This tool is honest about what it can and cannot show. Read this before drawing conclusions.",
    showTitle: "What it shows",
    showP1a: "The ",
    showP1emph: "public state subsidies",
    showP1b:
      " granted to political parties, pulled live from the National Subsidies Database (BDNS / SNPSAP), the official registry of the Ministry of Finance. Currently ",
    showP1c: " and a total of ",
    showP1d: ". Data updated on ",
    showP2: "Two kinds of annual state aid are distinguished:",
    showB1: "Ordinary funding — the main subsidy, distributed by parliamentary representation.",
    showB2: "Security costs — aid for protection expenses.",
    privTitle: "Private financing (partial)",
    privP1:
      "Each party also shows its declared private donations, transcribed from Court of Auditors Report no. 1573 (fiscal year 2020). With two important caveats:",
    privB1:
      "Company donations are banned. Since the 2015 reform of Organic Law 8/2007, legal entities cannot donate to parties; only individuals, capped at €50,000/year and with no anonymous donations.",
    privB2:
      "Private data is not an API. It is only published in the Court of Auditors' annual PDF reports, one or two years late; hence a fixed 2020 snapshot, not live data.",
    polTitle: "Individual politicians",
    polP1:
      "The Faces section gathers individual politicians with their party, their Bluesky activity and the headlines they appear in. There is no 'funding per politician' figure: subsidies are granted to the party, not the person. Every Bluesky profile has been verified one by one; today the left has more presence there, and PP and Vox leaders have no verifiable account.",
    roadTitle: "Roadmap",
    roadB1:
      "Done — Live public subsidies (BDNS); private donations 2020 (Court of Auditors); individual politicians with Bluesky and news.",
    roadB2:
      "Next — More donation years from the Court of Auditors and party-linked foundations (periodic PDF ingest, not live).",
    roadB3:
      "Later — Public procurement and a graph of links between parties, foundations and contractors, always labelled association, not proof of influence.",
    feedsTitle: "News sources",
    feedsP1:
      "The front page does not search the open web: it reads a fixed list of RSS and Atom feeds, so the publisher of every headline is known and is shown next to it.",
    feedsGuard: (stale: number, item: number) =>
      `A source whose newest post is more than ${stale} days old is treated as dead and dropped whole. No item older than ${item} days enters the panel, whatever its source. At most two items per source are shown, so an outlet publishing daily cannot displace organisations that publish weekly.`,
    feedsSource: "Source",
    feedsKind: "Type",
    feedsTopics: "Topics",
    feedsOrg: "Organisation",
    feedsMedia: "Outlet",
    feedsTopic: { lgtbi: "LGBTI and trans", vivienda: "Housing", pobreza: "Poverty" },
    feedsExcludedP:
      "These feeds were checked and left out. They are listed so they are not blindly re-probed, and because the first case is instructive: a feed can answer perfectly well and still have published nothing for years.",
    ctxTitle: "What the official record says about hate crime",
    ctxLead:
      "These figures are the state's, not this site's. They are here because the money and the votes this site collects mean nothing without the context of what happens in the country. Neither is claimed to explain the other.",
    ctxRecordedTitle: "Incidents recorded by the police",
    ctxRecordedNote:
      "These are hechos conocidos — reports and incidents recorded by the security forces, not convictions. The reports themselves acknowledge that many cases never reach the justice system, so the figure is a floor, not a total.",
    ctxProsecutedTitle: "Prosecution activity",
    ctxProsecutedNote:
      "This counts what the prosecution service did, not what was reported to the police. The two series are not subsets of one another and must not be added.",
    ctxRacism: "for racism or xenophobia",
    ctxLgtbi: "for sexual orientation or gender identity",
    ctxSentences: "sentences received",
    ctxConvictions: "convictions",
    ctxCharges: "charge sheets citing racism or xenophobia",
    ctxChangeYear: "on the previous year",
    ctxFindingTitle: "What no authority has found",
    ctxFindingBody:
      "No Spanish authority has ever ruled that a party's campaign spending constituted a hate crime. The electoral board ordered a Vox banner in Madrid taken down, but under Article 53 LOREG — propaganda outside the campaign period — and expressly declined to rule on its content. The one known criminal attempt was archived.",
    ctxCaseTitle: "The «menas» case, and how it ended",
    ctxCaseBody:
      "Vox's campaign poster for the 2021 Madrid Assembly election was reported as a hate crime. Juzgado de Instrucción nº 53 de Madrid dismissed the case on 29 April 2021, and Sección Segunda of the Audiencia Provincial de Madrid confirmed the archiving on 19 July 2021, framing it within the legitimate ideological struggle of an election campaign. The dismissal was appealed by the Fiscalía, PSOE, Podemos, Izquierda Unida, the Unidas Podemos coalition and the Progresa association. It is recorded here precisely because the outcome was negative: a record that lists the accusation and not the acquittal is not a transparency tool.",
    ctxNoTag:
      "This is why the site tags nobody as a «hate instigator». There is no public per-person register of convictions a private party may consult and republish: Article 10 LOPDGDD reserves criminal-conviction data to public authorities, CENDOJ dissociates personal data before disseminating judgments, and the Constitutional Court (STC 58/2018) treats retrievability of a person by name as the decisive harm. Official aggregates and specific proceedings with their outcome are published; inferences are not.",
    srcTitle: "Sources",
    src1: "BDNS / SNPSAP — grants to political parties ↗",
    src2: "Court of Auditors — political parties ↗",
    src3: "Organic Law 8/2007 on party financing ↗",
  },
  datos: {
    eyebrow: "Downloads",
    title: "The data, table by table",
    lead: "The same figures the rest of the site shows, not a new extraction: every table below is the one already feeding its pages, as a downloadable CSV. Each table's link is permanent, so it can be cited.",
    rows: "{count} rows",
    download: "Download CSV",
    perRowSourced: "Every row carries its own source and date, in the source_* columns: this table has no single shared source.",
    columnsNote: "Column headers are fixed and do not change with this page's language.",
    tables: {
      subsidios: {
        title: "Public subsidies to parties",
        description: "Every BDNS grant to a political party, one row per grant.",
      },
      donaciones: {
        title: "Private donations, 2020",
        description: "Private donations for 2020, by party and tranche, per the Court of Auditors.",
      },
      ingresos_partidos: {
        title: "Party income, 2018–2020",
        description: "Ordinary income in 2018, 2019 and 2020 of the parties audited each year, public by administration and private by origin (member fees, officeholders, donations, other), per the Court of Auditors. One row per party and year; the audited parties change from year to year.",
      },
      fundaciones: {
        title: "Party-linked foundations",
        description: "One dossier per entity and exercise, from Court of Auditors report 1.642.",
      },
      fundaciones_cargos: {
        title: "Who governs those foundations",
        description: "People holding a board role in a party-linked foundation, with the source of each appointment.",
      },
      fundaciones_vinculos: {
        title: "Their other roles",
        description: "Roles those same people hold outside the foundation — a company, a government post, another body.",
      },
      gasto_electoral: {
        title: "Declared election spending",
        description: "What each formation declared spending in the 2024 European Parliament election, by line.",
      },
      salarios: {
        title: "Officeholder register",
        description: "6,670 public office-holders, with their post, party and pay.",
      },
      votaciones: {
        title: "Roll-call votes",
        description: "Every recorded vote in the divisions this site tracks, one row per deputy and division.",
      },
      declaraciones_bienes: {
        title: "Declarations of assets and income",
        description:
          "What each sitting deputy declared on taking the seat, transcribed from the official scan: one row per income line, property, account, asset, vehicle or debt.",
      },
      intereses_economicos: {
        title: "Declarations of economic interests",
        description:
          "Prior activities, foundations and associations, gifts and remarks each deputy declares, as the Congreso publishes them.",
      },
      delitos_odio: {
        title: "Hate crime by comunidad",
        description: "Recorded incidents by autonomous community, with the rate per 100,000 residents.",
      },
      gobiernos: {
        title: "Regional presidencies",
        description: "Who presides each autonomous community, and since when.",
      },
      provincias: {
        title: "Provinces and comunidades",
        description: "The 52 provinces and the autonomous community each one sits in.",
      },
      salarios_ine: {
        title: "Wages — INE",
        description: "Wages by sector, contract type, percentile and minimum-wage tranche, per the annual wage structure survey.",
      },
      pobreza_ine: {
        title: "Poverty and exclusion — INE",
        description: "National and regional AROPE rates, per the Survey on Income and Living Conditions.",
      },
    },
  },
};

const ca: Dict = {
  meta: {
    title: "Seguint el Diner · Subvencions públiques als partits",
    description:
      "Seguiment de les subvencions públiques estatals que reben els partits polítics espanyols, amb dades de la Base de Dades Nacional de Subvencions (BDNS).",
  },
  nav: {
    panel: "Tauler",
    people: "Polítics",
    votes: "Votacions",
    methodology: "Metodologia",
    context: "Context",
    funding: "Finançament",
    rights: "Drets",
    map: "Mapa",
    foundations: "Fundacions",
    skipToContent: "Salta al contingut",
  },
  people: {
    title: "Polítics",
    intro:
      "Cada càrrec públic en actiu del registre de retribucions i cada diputat del Congrés: què cobra quan el registre ho publica, el finançament del seu partit, el seu vot registrat en lleis de drets, què va declarar al Congrés i, quan existeix, les seves xarxes i els titulars on apareix.",
    featured: "Amb vot registrat",
    featuredNote:
      "Perfils amb votació nominal documentada. La resta del registre és al cercador.",
    directory: "Registre complet",
    hasRecord: "vot registrat",
    hasSocial: "xarxes",
    noRecord: "Sense vot registrat",
    noRecordExplain:
      "No consta cap votació nominal d'aquesta persona en els assumptes que seguim. No es dedueix la seva postura a partir del seu partit.",
    pay: "Retribució",
    noPay: "Sense xifra publicada",
    noPayExplain: "El registre de retribucions no publica cap xifra per a aquest càrrec.",
    notInRegister:
      "No figura al registre de retribucions que fa servir aquest lloc; el perfil prové de la llista de diputats del Congrés.",
    partyFunding: "Finançament del partit",
    rightsRecord: "Vot en lleis de drets",
    juxtaposition:
      "Vot registrat i finançament del partit es mostren junts com a associació, no com a causa: els diners públics no expliquen un vot concret.",
    profile: "Veure perfil →",
    backToPeople: "← Polítics",
    affects: "Assumptes que afecten minories",
    affectsNote:
      "Lleis i mocions sobre drets trans i LGBTI, salut sexual i reproductiva, i habitatge. Cada posició enllaça a l'acta oficial.",
  },
  salaryShape: {
    readerBin: "{count} càrrecs",
    readerHere: "aquí cau aquesta retribució",
    readerMedian: "aquí cau la mediana",
    yAxis: "Nombre de càrrecs a cada tram · el tram més poblat en té {peak}",
    xAxis: "Retribució bruta anual · escala logarítmica: cada marca multiplica per 10",
    tableCaption:
      "Les {published} retribucions publicades al registre, repartides en {bins} trams d'igual amplada en l'escala logarítmica, i quants càrrecs cauen a cada un.",
    colBand: "Tram (€ bruts l'any)",
    colCount: "Càrrecs",
    title: "On queda aquesta retribució",
    position:
      "{pay} l’any està per damunt del {rank} dels {published} càrrecs del registre que publiquen una xifra.",
    medianTick: "mediana",
    highest:
      "{pay} l’any és la retribució més alta de les {published} publicades al registre.",
    lowest:
      "{pay} l’any és la retribució més baixa de les {published} publicades al registre.",
    nearTop:
      "Només {above} de les {published} retribucions publicades al registre superen els {pay} l’any.",
    nearBottom:
      "Només {below} de les {published} retribucions publicades al registre queden per sota de {pay} l’any.",
    noFigure:
      "El registre no publica retribució anual per a aquest càrrec, així que no hi ha cap posició a assenyalar al repartiment.",
    median: "La mediana publicada és de {median}.",
    caveat:
      "{missing} de les {total} files del registre no publiquen xifra i no entren en aquest repartiment. L’eix és logarítmic: el que es publica va de {min} a {max}, quatre ordres de magnitud, i barreja una alcaldia de poble a temps parcial amb la Corona i una comissaria europea. Una posició en aquest eix és una posició en una llista, no un judici sobre si un càrrec val el que cobra.",
  },
  smiPosition: {
    readerHere: "aquí cau aquesta retribució",
    title: "En múltiples del salari mínim",
    sentence:
      "{pay} l’any equival a {multiple} vegades l’SMI de {year} ({smi}/any); cau al tram «{tranche}», on se situa el {share} dels assalariats.",
    boeLink: "RD {rd} ↗",
    noFigure:
      "El registre no publica retribució anual per a aquest càrrec, així que no hi ha cap múltiple d’SMI a calcular.",
    caveat:
      "L’SMI és un salari per persona treballadora; aquesta xifra és la retribució d’un càrrec públic, que no sempre és a temps complet ni l’únic ingrés de qui l’ocupa. La comparació dona una escala comuna, no una equivalència exacta.",
  },
  declarations: {
    title: "Què va declarar al Congrés",
    juxtaposition:
      "El que es declara i el que es vota es publiquen junts per poder-los consultar; l’un no explica l’altre.",
    filed:
      "Declaració de béns i rendes del {date}, presentada en prendre l’escó; les rendes són les de {year}.",
    officialPdf: "PDF oficial ↗",
    later: "Declaracions posteriors, encara sense transcriure aquí:",
    notTranscribed:
      "Aquesta declaració encara no està transcrita aquí. Es pot consultar al PDF oficial.",
    noFiling: "La fitxa del Congrés no enllaça cap declaració de béns i rendes.",
    checkRtve: "Totals contrastats amb la transcripció independent de",
    checkSecond: "Totals contrastats amb una segona lectura independent de l’escaneig.",
    income: "Rendes declarades",
    incomeNote:
      "De l’any anterior a la declaració. El formulari exclou el que es cobra del Congrés o del Senat, que totes dues cambres publiquen a part.",
    groups: {
      salary: "Salaris, honoraris i retribucions",
      dividends: "Dividends i beneficis",
      interest: "Interessos de comptes i actius",
      other: "Altres rendes",
    },
    irpf: "Quota de l’IRPF declarada",
    realEstate: "Immobles",
    realEstateNote:
      "El formulari no demana el valor dels immobles, així que aquí no hi ha cap xifra de patrimoni total.",
    propertyKinds: { urban: "urbà", rustic: "rústic", company: "via societat" },
    financial: "Dipòsits i altres béns",
    deposits: "Saldo en comptes",
    depositsNote:
      "El formulari demana un únic saldo per al conjunt dels comptes, així que pot aparèixer al costat només d’un d’ells.",
    notesFlag:
      "Alguna xifra d’aquesta declaració no està escrita en el format numèric espanyol: a sota hi figura tal com apareix a l’escaneig, i convé comprovar-la al PDF oficial.",
    writtenAs: "escrit «{text}»",
    noInterests: "El fitxer de dades obertes del Congrés no recull cap fila amb aquest nom.",
    assetKinds: { securities: "Valors i participacions", other: "Altres béns, rendes o drets" },
    holdings: "Societats participades en més d’un 5 %",
    vehicles: "Vehicles",
    debts: "Deutes",
    otherDebts: "Altres deutes",
    observations: "Observacions",
    total: "Total declarat",
    none: "No s’hi declara res en aquest apartat.",
    columns: {
      concept: "Concepte",
      group: "Procedència",
      amount: "Euros",
      description: "Descripció",
      location: "Situació",
      acquired: "Adquisició",
      title: "Dret i títol",
      kind: "Tipus",
      granted: "Concessió",
      lent: "Import concedit",
      pending: "Saldo pendent",
      sector: "sector declarat",
      benefactor: "de",
    },
    interests: "Interessos econòmics",
    interestsNote:
      "Dades obertes del Congrés, reproduïdes tal com es publiquen, inclòs el sector, que cada declarant escriu a la seva manera. El text es manté en castellà.",
    activities: "Activitats",
    foundations: "Fundacions, associacions i aportacions",
    donations: "Regals i donacions rebuts",
    interestObservations: "Observacions",
    caveat:
      "Tot el que hi ha aquí és una declaració pròpia: el Congrés la publica «sin corrección alguna», com diu el seu propi formulari. La declaració de béns i rendes només existeix com a escaneig, sense text llegible per màquina, així que la transcriu aquest lloc, i cada transcripció es publica només si els seus totals coincideixen amb la transcripció independent de {check} o amb una segona lectura independent de l’escaneig. El llistat de {check} no inclou l’IRPF, així que en les declaracions contrastades amb ell aquesta xifra prové d’una sola lectura, i els textos no es contrasten mai. S’ometen les matrícules que alguna declaració inclou, perquè el mateix formulari demana no indicar-les. Davant qualsevol diferència, mana el PDF oficial.",
  },
  assets: {
    title: "El que van declarar",
    intro:
      "La declaració de béns i rendes que cada diputat va presentar en prendre possessió el 2023, amb les rendes del 2022. Aquest lloc la transcriu de l’escaneig oficial i només la publica quan se n’han comprovat els totals. Al costat de cada nom, els totals per apartat; el detall complet és al seu perfil.",
    tabs: { label: "Seccions de Polítics", directory: "Directori", declarations: "Béns declarats" },
    coverage:
      "{done} de {total} declaracions transcrites i comprovades. La resta enllaça al PDF oficial mentre es transcriu.",
    all: "Tots",
    tableCaption: "Totals declarats per apartat, en ordre alfabètic",
    columns: {
      name: "Nom",
      filed: "Presentada",
      income: "Rendes",
      financial: "Dipòsits i altres béns",
      realEstate: "Immobles",
      vehicles: "Vehicles",
      debts: "Deutes pendents",
    },
    legend:
      "— : res declarat en aquell apartat. Immobles i vehicles es compten, perquè el formulari no els dona valor.",
    noRanking:
      "En ordre alfabètic. Aquest lloc no ordena els diputats per res del que han declarat ni suma un patrimoni total.",
    download: "Totes les partides declarades, en CSV ↓",
    noneForParty: "Cap diputat d’aquest partit no té encara la declaració transcrita.",
    pending: "Pendents de transcriure: {count}",
    pendingNote: "Cada nom porta al seu perfil, que enllaça la declaració oficial.",
    noFiling: "Sense declaració de béns a la seva fitxa del Congrés: {names}.",
    source: "Font",
  },
  ballotGrid: {
    noBallot: "Sense vot registrat",
    caption:
      "Vot emès en {cast} de les {tracked} votacions nominals que seguim. El Congrés en celebra milers, així que això és el registre que tenim, no l’historial complet de vot d’aquesta persona.",
    tableCaption:
      "Cada votació que seguim, per tema i de la més antiga a la més recent, amb el vot que consta per a aquesta persona.",
    colTopic: "Tema",
    colVote: "Votació",
    colDate: "Data",
    colBallot: "Vot",
  },
  votes: {
    inFavour: "Sí",
    against: "No",
    abstention: "Abstenció",
    noVote: "No vota",
  },
  court: {
    title: "Què consta al registre judicial",
  },
  masthead: {
    edition: "Edició nº 001",
    live: "Dades en directe · BDNS",
    place: "Madrid",
    sources: "Fonts: BDNS · Tribunal de Comptes · Congrés",
    navLabel: "Seccions",
    theme: "Tema de color",
    themeLight: "Clar",
    themeDark: "Fosc",
    themeSystem: "Com el sistema",
  },
  charts: {
    showTable: "Mostra les dades en una taula",
    source: "Font",
    updated: "actualitzat el {date}",
    approved: "aprovat el {date}",
    financialYear: "exercici {year}",
    range: "de {from} a {to}",
    report: "Informe {report}",
    rollCall: "Acta de la votació nominal",
    spendingElection: "eleccions europees del 9 de juny de 2024",
    portraitsDataset: "retrats amb llicència lliure",
    scrollHint:
      "El gràfic és més ample que la pantalla: llisca en horitzontal dins el requadre per veure'l sencer, o obre la taula de sota.",
    scrollRegion: "Gràfic desplaçable en horitzontal",
    readerKeys:
      "Fes servir les fletxes per recórrer els valors; Inici i Fi porten al primer i a l'últim.",
    readerGridKeys:
      "Fes servir les fletxes per moure't entre les cel·les; Inici i Fi porten al principi i al final de la fila, i Control amb Inici o Fi, a la primera i l'última cel·la.",
    readerCount: "{n} valors",
    readerRange: "Valors de {min} a {max}",
    readerPosition: "{i} de {n}",
    ofTotal: "{share} del total",
    download: "Baixa la imatge",
    downloadBusy: "S'està preparant la imatge…",
    downloadFailed: "No s'ha pogut generar la imatge.",
    downloadLabel: "Baixa la imatge: «{title}», PNG de 1200 × 675",
    dataAsOf: "Dades a {date}",
  },
  common: {
    caveat: "Què cal saber",
  },
  kinds: {
    ordinaria: "Finançament ordinari",
    seguridad: "Despeses de seguretat",
    otra: "Altra",
    all: "Totes",
  },
  money: {
    routePartyTo: "El partit",
    routeStateRules: [
      "Per a despeses electorals",
      "Anuals, per a funcionament",
      "De les comunitats autònomes",
      "Aportacions dels grups parlamentaris",
    ],
    routeDonorFrom: "Una persona",
    routeDonorRules: [
      "Només persones físiques, mai empreses",
      "Fins a 50.000 € l'any per persona",
      "Nominatives: cap d'anònima",
      "Res de qui tingui un contracte públic vigent",
    ],
    routeFoundationTo: "La fundació del partit",
    routeFoundationRules: [
      "Les empreses sí que poden donar",
      "Sense el límit de 50.000 €",
      "Més de 120.000 €: document públic",
      "Donació d'empresa: avís al Tribunal de Comptes en tres mesos",
    ],
    donationsFinding: "El {donorShare} dels donants van donar menys de 1.000 €, i entre tots van aportar el {amountShare} dels diners.",
  },
  foundations: {
    officeJoin:
      "D’aquestes persones, {matched} de {candidates} consten al Registre d’Alts Càrrecs amb un càrrec públic, i aquell càrrec es mostra tal com el recollia el registre el {updated}. Són dos registres públics sobre la mateixa persona, posats l’un al costat de l’altre: res d’això no diu que el càrrec i el patronat hi tinguin relació.",
    officeJoinDrops:
      "En queden fora {unmatched} persones que no consten al registre —el normal en un patronat amb membres que no són càrrecs públics—, {ambiguous} el nom de les quals coincideix amb més d’un càrrec diferent, i {mismatch} en què el partit del càrrec no coincideix amb el de la fundació. En els dos últims casos no es publica res: un nom no identifica una persona.",
    title: "Qui paga les fundacions dels partits",
    intro:
      "Cada partit té fundacions i associacions vinculades que reben diners pel seu compte. Als partits els està prohibit acceptar diners d'empreses; a les seves fundacions, no. Però en les xifres auditades els diners d'empreses són la part petita: gairebé nou de cada deu euros que entren els posa el propi partit.",
    fromParty: "Del propi partit",
    fromCompanies: "D'empreses",
    fromIndividuals: "De particulars",
    publicSubsidies: "Subvencions públiques",
    ofContributions: "de les aportacions declarades",
    publicNote: "Diners públics concedits a les fundacions, al marge de les aportacions.",
    entities: "entitats auditades",
    contributionCount: "Aportacions",
    origin: "Origen",
    counterpartyTitle: "Empreses i entitats amb nom a l'informe",
    counterpartyNote:
      "Els diners d'empreses gairebé mai arriben com a donació, sinó com a conveni de col·laboració amb una contraprestació. L'informe nomena la contrapart només en aquests casos, i indica si es van complir els tres deures de l'apartat Cinc de la disposició addicional setena: elevar a document públic, comunicar al Tribunal de Comptes en tres mesos i publicar-ho al web.",
    counterparty: "Contrapart",
    consideration: "Contraprestació",
    duties: "Deures de publicitat",
    dutiesMet: "complerts",
    dutiesFailed: "incomplerts",
    dutiesUnclear: "l'informe no ho precisa",
    registerTitle: "El registre obligatori és gairebé buit",
    registerBody:
      "La disposició addicional quarta de la Llei Orgànica 6/2002 obliga aquestes entitats a inscriure's al Registre de Partits Polítics. A 31 de desembre de 2022 només hi constaven inscrites 18 fundacions i 3 entitats de les fiscalitzades. El Tribunal de Comptes demana al Ministeri de l'Interior que reclami les inscripcions pendents, i ja ho havia demanat a l'informe anterior.",
    repeatedTitle: "Demanat dues vegades, sense complir",
    repeatedBody:
      "Les set recomanacions d'aquest informe són les mateixes que el Tribunal de Comptes ja va formular a l'informe nº 1.533, sobre l'exercici 2020, aprovat el 28 de setembre de 2023. Les tres dirigides al Govern segueixen sense complir-se perquè no s'ha modificat la llei. Les dirigides a les mateixes fundacions —ajustar l'activitat als seus fins i presentar un pla de sanejament quan el patrimoni és negatiu— tampoc s'han complert.",
    legalTitle: "Què permet la llei",
    legalBody:
      "Des de la reforma de 2015, un partit no pot acceptar donacions de persones jurídiques, ni donacions anònimes, ni més de 50.000 euros l'any d'una mateixa persona física, i ha de rebutjar els diners de qui tingui un contracte públic vigent. Les seves fundacions es regeixen per la disposició addicional setena: allà les persones jurídiques sí que poden donar. Per damunt de 120.000 euros la donació s'ha d'elevar a document públic, tota donació d'una persona jurídica s'ha de comunicar al Tribunal de Comptes en tres mesos i la identitat del donant s'ha de publicar. No poden rebre diners d'organismes, entitats o empreses públiques.",
    lawLink: "Llei Orgànica 8/2007, disposició addicional setena ↗",
    tableTitle: "Entitat per entitat",
    tableNote:
      "Una targeta per entitat, sumant els exercicis que l'informe fiscalitza. El partit és el que consta al propi informe. La barra reparteix el total entre partit, empreses, particulars i subvenció pública; ordenades pel que va rebre cadascuna, de més a menys.",
    entity: "Entitat",
    party: "Partit",
    total: "Total rebut",
    boardCount: "{count} al patronat",
    noPartyStated: "sense partit indicat",
    gapTitle: "Què no mostra",
    gapBody:
      "L'informe cobreix 2021 i 2022; no hi ha dades posteriors publicades. No diu qui són les persones jurídiques que van donar: nomena la contrapart només quan els diners van arribar com a conveni de col·laboració. I la seva pròpia aritmètica falla en un punt, que s'assenyala a la fitxa corresponent.",
    dossierEyebrow: "Entitat vinculada a un partit",
    identityTitle: "Dades generals",
    supervisor: "Protectorat o administració competent",
    constituted: "Any de constitució",
    registryLabel: "Registre de Partits Polítics",
    registryYes: "inscrita",
    registryNo: "no inscrita",
    registryUnstated: "l'informe no ho indica",
    notStated: "no consta",
    moneyInTitle: "D'on van venir els diners",
    publicByTitle: "Diners públics, per organisme",
    grantingBody: "Organisme",
    dealsTitle: "Convenis de col·laboració",
    findingsTitle: "Què va trobar el Tribunal de Comptes",
    noFindings: "L'informe no recull incompliments per a aquest exercici.",
    accountsTitle: "Comptes de l'exercici",
    netEquity: "Patrimoni net",
    income: "Ingressos",
    expense: "Despeses",
    result: "Resultat",
    discrepancyTitle: "L'aritmètica de l'informe no quadra aquí",
    discrepancyBody:
      "L'informe declara {stated} però les seves pròpies partides sumen {itemised}, una diferència de {difference}. Es publiquen les dues xifres perquè l'error és de la font, no d'aquest web.",
    exercise: "Exercici",
    backToChannel: "← Tornar a les fundacions",
    allEntities: "Veure la fitxa",
    peopleTitle: "Qui el governa",
    peopleNote:
      "Càrrecs al patronat i als òrgans de govern, segons la font que se cita en cada cas i amb la seva data. Es distingeix el que consta en un registre o en una publicació de la mateixa entitat del que només consta en premsa. No es dedueix res: un càrrec apareix només si una font amb nom l'afirma.",
    peopleAlso: "També consta",
    peopleFormer: "càrrec passat",
    peoplePress: "segons {publisher} ({date})",
    peopleSince: "des de",
    peopleGapTitle: "Sense patronat publicat",
    peopleRenameTitle: "L'entitat va canviar de nom",
    peopleRenameBody: "L'informe l'anomena «{report}». Des de {when} es denomina «{current}».",
    peopleKindRegistry: "registre oficial",
    peopleKindOfficial: "font oficial",
    peopleKindFoundation: "publicació de la mateixa entitat",
    peopleKindPress: "premsa",
    peopleCoveragePress: "{press} d'aquests registres es basen en premsa i es mostren com a tals.",
    peopleCoverageTitle: "Qui governa aquestes entitats",
    peopleCoverage:
      "Patronat documentat en {documented} de {entities} entitats auditades: {people} persones i {ties} càrrecs externs, cada un amb la seva font i la seva data. On no es va localitzar un patronat publicat, la fitxa ho diu.",
  },
  party: {
    recentHeadlines: "Titulars recents · Google News",
  },
  feed: {
    justNow: "ara mateix",
    hoursAgo: (n: number) => `fa ${n} h`,
    daysAgo: (n: number) => `fa ${n} d`,
    noRecent: "Sense resultats recents.",
    cannotLoad: "No s'han pogut carregar les publicacions ara mateix.",
    reposted: "↻ Republicat",
    fromOrg: "publicació de l'entitat",
  },
  donationsTable: {
    party: "Formació",
    byTranche: "Repartiment per trams",
    total: "Total",
    donors: "Donants",
    tranchesNote:
      "Trams de l'informe: menys de 1.000 €, de 1.000 a 10.000 €, més de 10.000 €.",
    trancheSmall: "Menys de 1.000 €",
    trancheMid: "De 1.000 a 10.000 €",
    trancheLarge: "Més de 10.000 €",
    legalNote:
      "Les empreses no poden donar als partits des de la reforma del 2015 de la LO 8/2007: només persones físiques, amb un màxim de 50.000 € l'any i sense donacions anònimes. No existeix una xifra de finançament per polític, i aquesta web no la calcula.",
  },
  spending: {
    lineAdvertising: "Publicitat exterior i a premsa i ràdio",
    lineAdvertisingNote:
      "Les dues úniques despeses amb límit legal propi: arts. 55 i 58 de la LOREG.",
    lineResidual: "Línia residual, sense desglossament a l'informe",
    lineResidualNote:
      "«Otros gastos ordinarios». És la major part de la despesa i l'informe no diu on va anar.",
    lineFinancial: "Costos financers i altres conceptes",
    lineFinancialNote: "Interessos liquidats i estimats de les operacions de crèdit.",
    gapBody:
      "«Otros gastos ordinarios» és una sola línia sense desglossament i és la major part de la despesa declarada. L'informe no diu en què es va gastar, i la llei no obliga a detallar-ho: la publicitat digital no és una categoria amb límit propi, i el mateix Tribunal de Comptes ha recomanat al Govern que legisli perquè ho sigui. Aquestes xifres són despesa declarada i fiscalitzada, no una imputació de res a ningú.",
  },
  coverage: {
    tableCaption: "Les quatre proporcions, amb el numerador i el denominador.",
    colWhat: "Què es mesura",
    colCovered: "Amb dada",
    colTotal: "Total",
    colShare: "Proporció",
    title: "Quant n’hi ha de cada cosa",
    intro:
      "Aquesta pàgina diu en prosa què hi falta. Aquí està en xifres, calculades sobre les mateixes dades a cada compilació, perquè es pugui comprovar la frase contra la barra.",
    of: "de",
    rows: {
      salary: "Càrrecs amb retribució publicada",
      vote: "Càrrecs amb vot nominal registrat",
      portrait: "Càrrecs amb retrat de llicència lliure",
      board: "Entitats fiscalitzades amb patronat documentat",
    },
    counts:
      "A més: {divisions} votacions nominals seguides, amb {deputies} diputats diferents votant-hi, i un únic exercici de donacions privades, el de {donationYear}. Són xifres certes sense denominador: el Congrés celebra milers de votacions, i dibuixar-ne nou com a proporció d’alguna cosa inventaria un total del qual no formen part.",
    orphans:
      "Hi ha també {n} retrats de persones que no consten al registre d’alts càrrecs. No es descarten: el registre només recull càrrecs en actiu, així que un retrat sense fila és el normal per a qui ja no ho és.",
    note:
      "Les quatre proporcions mesuren coses diferents contra registres diferents —un retrat depèn que existeixi una llicència lliure, un vot registrat que la persona segui al Congrés—, així que no estan ordenades per percentatge ni comparades entre si. Van en l’ordre en què es troben a la web.",
  },
  method: {
    title: "Metodologia i límits",
    lead: "Aquesta eina és honesta sobre el que pot i no pot mostrar. Llegeix-ho abans de treure conclusions.",
    showTitle: "Què mostra",
    showP1a: "Les ",
    showP1emph: "subvencions públiques estatals",
    showP1b:
      " concedides als partits polítics, extretes en directe de la Base de Dades Nacional de Subvencions (BDNS / SNPSAP), el registre oficial del Ministeri d'Hisenda. Actualment ",
    showP1c: " i un total de ",
    showP1d: ". Dades actualitzades el ",
    showP2: "Es distingeixen dos tipus d'ajut estatal anual:",
    showB1: "Finançament ordinari — la subvenció principal, repartida segons representació parlamentària.",
    showB2: "Despeses de seguretat — ajuts per a despeses de protecció.",
    privTitle: "Finançament privat (parcial)",
    privP1:
      "Cada partit mostra també les seves donacions privades declarades, transcrites de l'Informe núm. 1573 del Tribunal de Comptes (exercici 2020). Amb dos advertiments importants:",
    privB1:
      "Les donacions d'empreses estan prohibides. Des de la reforma de 2015 de la Llei Orgànica 8/2007, les persones jurídiques no poden donar a partits; només persones físiques, amb un màxim de 50.000 €/any i sense donacions anònimes.",
    privB2:
      "Allò privat no és una API. Aquestes dades només es publiquen als informes anuals en PDF del Tribunal de Comptes, amb un o dos anys de retard; per això és una foto fixa de 2020 i no una dada en directe.",
    polTitle: "Polítics individuals",
    polP1:
      "La secció Cares reuneix polítics individuals amb el seu partit, la seva activitat a Bluesky i els titulars on apareixen. No hi ha una xifra de «finançament per polític»: les subvencions es concedeixen al partit, no a la persona. Cada perfil de Bluesky s'ha verificat un a un; ara mateix l'esquerra hi té més presència, i líders del PP i Vox no hi tenen compte verificable.",
    roadTitle: "Full de ruta",
    roadB1:
      "Fet — Subvencions públiques en directe (BDNS); donacions privades 2020 (Tribunal de Comptes); polítics individuals amb Bluesky i notícies.",
    roadB2:
      "Següent — Més exercicis de donacions del Tribunal de Comptes i fundacions vinculades a partits (ingesta periòdica de PDF, no en directe).",
    roadB3:
      "Després — Contractació pública i graf de vincles entre partits, fundacions i adjudicataris, etiquetat sempre com a associació, no prova d'influència.",
    feedsTitle: "Fonts d'actualitat",
    feedsP1:
      "La portada no cerca a la web oberta: llegeix una llista fixa de canals RSS i Atom, de manera que el nom de qui publica cada titular sempre es coneix i es mostra al costat.",
    feedsGuard: (stale: number, item: number) =>
      `Una font amb la publicació més recent de fa més de ${stale} dies es considera apagada i es descarta del tot. Cap peça de més de ${item} dies entra al panell, sigui quina sigui la font. Es mostren com a màxim dues peces per font, perquè un mitjà que publica cada dia no desplaci les entitats que publiquen un cop per setmana.`,
    feedsSource: "Font",
    feedsKind: "Tipus",
    feedsTopics: "Temes",
    feedsOrg: "Entitat",
    feedsMedia: "Mitjà",
    feedsTopic: { lgtbi: "LGBTI i trans", vivienda: "Habitatge", pobreza: "Pobresa" },
    feedsExcludedP:
      "Aquests canals es van comprovar i van quedar fora. Es llisten perquè no es tornin a provar a cegues i perquè el primer cas és instructiu: un canal pot respondre correctament i portar anys sense publicar.",
    ctxTitle: "Què diu el registre oficial sobre els delictes d'odi",
    ctxLead:
      "Aquestes xifres són de l'Estat, no d'aquest web. Es publiquen aquí perquè els diners i els vots que recull aquest lloc no signifiquen res sense el context del que passa al país. No s'afirma que una cosa expliqui l'altra.",
    ctxRecordedTitle: "Fets registrats per la policia",
    ctxRecordedNote:
      "Són fets coneguts per les Forces i Cossos de Seguretat: denúncies i incidents registrats, no condemnes. Els mateixos informes reconeixen que molts casos no arriben mai a la justícia, així que la xifra és un mínim, no un total.",
    ctxProsecutedTitle: "Actuació de la Fiscalia",
    ctxProsecutedNote:
      "Compta el que va fer el Ministeri Fiscal, no el que es va denunciar a la policia. Les dues sèries no són subconjunts l'una de l'altra i no s'han de sumar.",
    ctxRacism: "per racisme o xenofòbia",
    ctxLgtbi: "per orientació sexual o identitat de gènere",
    ctxSentences: "sentències rebudes",
    ctxConvictions: "condemnatòries",
    ctxCharges: "escrits d'acusació per racisme o xenofòbia",
    ctxChangeYear: "respecte a l'any anterior",
    ctxFindingTitle: "Què no ha declarat cap autoritat",
    ctxFindingBody:
      "Cap autoritat espanyola ha resolt que la despesa de campanya d'un partit constituís un delicte d'odi. La Junta Electoral va ordenar retirar una lona de Vox a Madrid, però per l'article 53 de la LOREG —propaganda fora del període de campanya— i va declinar expressament pronunciar-se sobre el contingut. L'únic intent penal conegut va acabar arxivat.",
    ctxCaseTitle: "El cas dels «menas», i com va acabar",
    ctxCaseBody:
      "El cartell electoral de Vox per a l'Assemblea de Madrid del 2021 va ser denunciat com a delicte d'odi. El Jutjat d'Instrucció núm. 53 de Madrid el va sobreseure el 29 d'abril de 2021 i la Secció Segona de l'Audiència Provincial de Madrid va confirmar l'arxivament el 19 de juliol de 2021, emmarcant-lo en la «legítima lluita ideològica» d'una campanya. Van recórrer l'arxivament la Fiscalia, el PSOE, Podemos, Esquerra Unida, la coalició Unidas Podemos i l'associació Progresa. Es recull aquí precisament perquè el resultat va ser negatiu: un registre que enumeri l'acusació i no l'arxivament no és una eina de transparència.",
    ctxNoTag:
      "Per això aquest web no etiqueta ningú com a «instigador d'odi». No existeix un registre públic de condemnes per persona que un particular pugui consultar i publicar: l'article 10 de la LOPDGDD reserva les dades de condemnes penals a les autoritats públiques, el CENDOJ dissocia les dades personals abans de difondre les sentències, i el Tribunal Constitucional (STC 58/2018) considera determinant que una persona pugui ser recuperada pel seu nom. Es publiquen xifres agregades oficials i procediments concrets amb el seu resultat; no inferències.",
    srcTitle: "Fonts",
    src1: "BDNS / SNPSAP — concessions a partits polítics ↗",
    src2: "Tribunal de Comptes — partits polítics ↗",
    src3: "Llei Orgànica 8/2007 sobre finançament de partits ↗",
  },
  datos: {
    eyebrow: "Descàrregues",
    title: "Les dades, taula per taula",
    lead: "Les mateixes xifres que la resta del lloc, no una extracció nova: cada taula d'aquí sota és la que ja alimenta les seves pàgines, en un CSV descarregable. L'enllaç a cada taula és permanent, per poder-la citar.",
    rows: "{count} files",
    download: "Descarregar CSV",
    perRowSourced: "Cada fila porta la seva pròpia font i data, a les columnes fuente_*: aquesta taula no comparteix una única font.",
    columnsNote: "Les capçaleres de columna són fixes i no canvien amb l'idioma d'aquesta pàgina.",
    tables: {
      subsidios: {
        title: "Subvencions públiques a partits",
        description: "Cada concessió de la BDNS a un partit polític, una fila per concessió.",
      },
      donaciones: {
        title: "Donacions privades, 2020",
        description: "Donacions privades de l'exercici 2020, per partit i tram, segons el Tribunal de Comptes.",
      },
      ingresos_partidos: {
        title: "Ingressos dels partits, 2018–2020",
        description: "Ingressos ordinaris del 2018, el 2019 i el 2020 dels partits fiscalitzats cada any, públics per administració i privats per origen (quotes, càrrecs públics, donacions, altres), segons el Tribunal de Comptes. Una fila per partit i exercici; els partits fiscalitzats canvien d'un any a l'altre.",
      },
      fundaciones: {
        title: "Fundacions vinculades a partits",
        description: "Un dossier per entitat i exercici, de l'informe 1.642 del Tribunal de Comptes.",
      },
      fundaciones_cargos: {
        title: "Qui governa aquestes fundacions",
        description: "Persones amb un càrrec al patronat d'una fundació vinculada, amb la font de cada nomenament.",
      },
      fundaciones_vinculos: {
        title: "Els seus altres càrrecs",
        description: "Els càrrecs que aquestes mateixes persones tenen fora de la fundació — empresa, govern o un altre organisme.",
      },
      gasto_electoral: {
        title: "Despesa electoral declarada",
        description: "El que cada formació va declarar haver gastat a les eleccions al Parlament Europeu de 2024, per partida.",
      },
      salarios: {
        title: "Registre d'alts càrrecs",
        description: "6.670 càrrecs públics, amb el seu lloc, el seu partit i la seva retribució.",
      },
      votaciones: {
        title: "Votacions nominals",
        description: "Cada vot registrat a les votacions que aquest lloc segueix, una fila per diputat i votació.",
      },
      declaraciones_bienes: {
        title: "Declaracions de béns i rendes",
        description:
          "El que cada diputat en actiu va declarar en prendre l’escó, transcrit de l’escaneig oficial: una fila per renda, immoble, compte, bé, vehicle o deute.",
      },
      intereses_economicos: {
        title: "Declaracions d’interessos econòmics",
        description:
          "Activitats prèvies, fundacions i associacions, regals i observacions que declara cada diputat, tal com les publica el Congrés.",
      },
      delitos_odio: {
        title: "Delictes d'odi per comunitat",
        description: "Fets registrats per comunitat autònoma, amb la taxa per 100.000 habitants.",
      },
      gobiernos: {
        title: "Presidències autonòmiques",
        description: "Qui presideix cada comunitat autònoma, i des de quan.",
      },
      provincias: {
        title: "Províncies i comunitats",
        description: "Les 52 províncies i la comunitat autònoma a la qual pertany cadascuna.",
      },
      salarios_ine: {
        title: "Salaris — INE",
        description: "Salari per sector, tipus de jornada, percentil i tram de SMI, segons l'Enquesta Anual d'Estructura Salarial.",
      },
      pobreza_ine: {
        title: "Pobresa i exclusió — INE",
        description: "Taxes AROPE nacionals i per comunitat autònoma, segons l'Enquesta de Condicions de Vida.",
      },
    },
  },
};

export const DICTS: Record<Locale, Dict> = { es, en, ca };
export type { Dict };

// Resolve a locale (from a route param) to its dictionary + BCP-47 tag.
export function resolveLocale(param: string | undefined): Locale {
  return isLocale(param) ? param : DEFAULT_LOCALE;
}

export function getDict(param: string | undefined): {
  locale: Locale;
  bcp47: string;
  t: Dict;
} {
  const locale = resolveLocale(param);
  return { locale, bcp47: BCP47[locale], t: DICTS[locale] };
}

// Locale-aware "x ago" formatter shared by the feed components.
export function relativeTime(iso: string, locale: Locale): string {
  if (!iso) return "";
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return "";
  const h = Math.round((Date.now() - ms) / 3.6e6);
  const f = DICTS[locale].feed;
  if (h < 1) return f.justNow;
  if (h < 24) return f.hoursAgo(h);
  return f.daysAgo(Math.round(h / 24));
}
