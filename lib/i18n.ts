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
    faces: "Caras",
    salaries: "Sueldos",
    people: "Políticos",
    votes: "Votaciones",
    methodology: "Metodología",
    context: "Contexto",
    funding: "Financiación",
    rights: "Derechos",
    map: "Mapa",
    foundations: "Fundaciones",
    data: "Datos",
    sectionData: "Datos",
    sectionAbout: "Sobre",
    menu: "Menú",
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
    eyebrow: "Votaciones nominales",
    title: "Votaciones clave",
    intro:
      "Posiciones registradas en votaciones nominales del Congreso sobre asuntos concretos. Cada posición es un voto realmente emitido y verificable, no una opinión atribuida.",
    caveat:
      "Cada votación se etiqueta según su tipo: unas aprueban leyes, otras son proposiciones no de Ley o mociones, que no son vinculantes. Se excluyen las votaciones de enmiendas. Un diputado aparece solo si consta su voto; no se deduce la postura de nadie a partir de su partido.",
    searchLabel: "Buscar diputado",
    searchPlaceholder: "Apellido o nombre…",
    inFavour: "A favor",
    against: "En contra",
    abstention: "Abstención",
    noVote: "No vota",
    present: "Presentes",
    byGroup: "Por grupo parlamentario",
    group: "Grupo",
    byGroupCaption: "Un grupo por fila, con sus votos contados y el enlace a la financiación del partido cuando el grupo lo forma uno solo.",
    distribution: "Reparto",
    funding: "Financiación",
    severalParties: "Varios partidos",
    groupUnknown: "Grupo no identificado en el registro",
    groupNote:
      "Un grupo parlamentario no es un partido. Cuando el grupo lo forma un solo partido, la última columna enlaza a la financiación de ese partido; cuando lo forman varios, no se enlaza a ninguno, porque atribuir el dinero de una coalición a uno de sus miembros sería falso.",
    groupSource: "Composición de los grupos ↗",
    officialRecord: "Acta oficial ↗",
    lawText: "Texto de la ley ↗",
    session: "Sesión",
    noMatch: "Sin votos registrados para esa búsqueda.",
    results: "diputados",
    kinds: {
      ley: "Votación final de ley",
      toma: "Toma en consideración",
      pnl: "Proposición no de Ley",
      mocion: "Moción consecuencia de interpelación",
    },
    nonBinding: "no vinculante",
    legislature: "Legislatura",
  },
  salaries: {
    title: "Sueldos públicos",
    intro:
      "Retribuciones de los cargos públicos en activo, según el Registro de Altos Cargos y los portales de transparencia. Busca por nombre, cargo, municipio o comunidad.",
    search: "Buscar",
    searchPlaceholder: "Nombre, cargo, municipio…",
    party: "Partido",
    all: "Todos",
    role: "Cargo",
    where: "Ámbito",
    annual: "Bruto anual",
    people: "cargos",
    results: "resultados",
    noResults: "Sin resultados para esta búsqueda.",
    prev: "Anterior",
    next: "Siguiente",
    page: "Página",
    of: "de",
    median: "Mediana",
    sourceNote:
      "Fuentes · Registro de Altos Cargos / transparencia.gob.es; los diputados que el registro no recoge, de los datos abiertos del Congreso",
    caveat:
      "Retribución del cargo, no patrimonio ni ingresos privados. Solo cargos marcados como activos en la fuente.",
  },
  map: {
    investitureTitle: "Investidura",
    investitureDecisive:
      "El PP tenía {pp} de {seats} escaños y la mayoría absoluta era {majority}. En la votación del {date} la investidura salió por {for} votos frente a {against}, y {voxVotes} de esos votos los puso Vox: sin ellos no había mayoría.",
    investitureShort:
      "El PP tenía {pp} de {seats} escaños y la mayoría absoluta era {majority}, así que no la alcanzaba solo; los {vox} escaños de Vox habrían bastado para cubrir la diferencia. El acta de la votación no está verificada aquí, y en segunda vuelta basta la mayoría simple, así que no se afirma quién invistió a nadie.",
    investitureCarried: "aprobada",
    investitureFailed: "rechazada",
    hatchDecisive: "Investidura con votos de Vox, según el acta",
    hatchShort: "El PP no llegaba solo a la mayoría absoluta",
    eyebrow: "Mapa territorial",
    title: "Dónde manda cada partido, y qué consta registrado allí",
    standfirst:
      "Pase el cursor para ver la comunidad. Pulse para fijarla en el panel. Las dos capas se muestran por separado y ninguna explica a la otra.",
    svgLabel: "Mapa de las comunidades autónomas",
    layerGov: "Gobierno autonómico",
    layerGovNote:
      "El partido de quien presidía cada comunidad en la fecha de comprobación, con la fecha en que tomó posesión. No es el resultado de las elecciones ni la composición del gobierno: es quién ocupa la presidencia.",
    layerHate: "Delitos de odio registrados",
    layerHateNote:
      "Tasa de delitos, infracciones administrativas y otros incidentes de odio por cada 100.000 habitantes, 2024. Son hechos conocidos por las fuerzas de seguridad, no condenas: la cifra depende de cuánto se denuncia y de cómo registra cada policía lo que se denuncia.",
    perHundredThousand: "por 100.000 hab.",
    panelKicker: "Ficha territorial",
    rowPresident: "Presidencia",
    rowParty: "Partido",
    rowSince: "Desde",
    rowRecorded: "Hechos conocidos 2024",
    rowRate: "Tasa por 100.000 hab.",
    barSogi: "Orientación sexual e identidad de género",
    barRacism: "Racismo y xenofobia",
    barsNote:
      "Dos de las doce motivaciones que distingue el informe, como proporción de los hechos conocidos de esa comunidad.",
    noData: "No consta",
    tableCaption:
      "Un territorio por fila, con las dos capas del mapa como cifras. El orden sigue a la capa activa: por partido en la de gobierno, por tasa en la de delitos de odio.",
    tableCaptionSorted:
      "Un territorio por fila, con las dos capas del mapa como cifras. Ordenado por la columna que ha elegido; pulse otra cabecera para cambiarlo.",
    sortHint: "Ordenar por {column}",
    colTerritory: "Territorio",
    colRate: "Tasa / 100.000",
    sourcesTitle: "Fuentes",
    tablesLabel: "tablas",
    checkedLabel: "comprobado el",
    limits:
      "Los hechos conocidos incluyen infracciones administrativas y otros incidentes, no sólo delitos, y no son condenas. Las dos comunidades con policía autonómica propia —la Policía Foral de Navarra y la Ertzaintza— encabezan la tabla de tasas, lo que dice algo sobre cómo se registra y no necesariamente sobre dónde ocurre más. Un incidente del informe no consta en ningún territorio y por eso las columnas de aquí suman uno menos que la cifra nacional.",
    missingLayers:
      "El diseño de esta sección preveía tres capas más: un índice de derechos LGTBI, el estado de las reformas de las leyes trans y el voto a las formaciones que votaron en contra de las normas que este portal sigue. No están porque no hay todavía una fuente citable por comunidad para ninguna de las tres. El sombreado de las investiduras sí está, pero marca un hecho con fecha —cómo salió una votación concreta— y no quién se sienta hoy en un gobierno, que es lo que habría quedado desfasado: Vox salió de tres de esos gobiernos en julio de 2024.",
  },
  court: {
    title: "Lo que consta en el registro judicial",
    eyebrow: "En los tribunales",
    sourceLink: "Fuente",
    statusNone: "Sin resoluciones",
    noneBody:
      "No consta en este portal ninguna resolución judicial ni acuerdo de junta electoral referido a cargos de esta formación en las materias que se siguen.",
    noneNote:
      "La ausencia de registro no es una declaración sobre la conducta de nadie: sólo significa que no hay una resolución citable.",
    status: {
      archived: "Causa archivada",
      "awaiting-trial": "Pendiente de juicio",
      "advertising-infringement": "Infracción de publicidad",
      "complaint-archived": "Querella archivada",
      "none-on-record": "Sin resoluciones",
    },
    records: {
      "menas-2021": {
        text: "El cartel de los «menas» de Vox en la campaña de la Asamblea de Madrid de 2021. El juzgado archivó por auto y la Audiencia Provincial lo confirmó: «no existe delito de odio ni delito electoral».",
        note: "Recurrieron la Fiscalía, PSOE, Podemos, Izquierda Unida y Progresa. Es un archivo en fase de instrucción, no una absolución: ningún tribunal entró en el fondo.",
      },
      "herrero-valencia": {
        text: "La concejala de Vox en València Cecilia Herrero irá a juicio oral por delitos de odio: unas treinta publicaciones en X entre abril de 2020 y abril de 2024. La Fiscalía pide 3 años de prisión, multa de 12 meses a 20 €/día e inhabilitación.",
        note: "Auto de apertura de juicio oral, no sentencia. La calificación es alternativa: 510.1 a) más 510.3, 510.5 y 510.6, o bien 510.2 a) con los mismos apartados.",
      },
      "jez-madrid-2023": {
        text: "La Junta Electoral de Zona de Madrid ordenó retirar una lona de la calle Alcalá en «plazo de un día», por propaganda contratada fuera del periodo de campaña.",
        note: "LOREG art. 53 e Instrucción 3/2011 de la JEC. La junta se declaró expresamente no competente sobre el contenido y no abrió expediente sancionador: es una infracción de calendario publicitario, nada más.",
      },
      "belarra-querella": {
        text: "La Sala de lo Penal del Tribunal Supremo archivó la querella de Vox contra Ione Belarra por sus palabras en un mitin de Collado Villalba: el art. 510 CP protege a las minorías sociales, no a los partidos políticos.",
        note: "Ponente Sánchez Melgar; el recurso de súplica fue rechazado. El registro documenta una querella contra ella, nunca una conducta suya.",
      },
    },
    policy:
      "Cuatro resoluciones verificadas una a una, no un censo: el número de registros de una formación no es comparable con el de otra. Una causa archivada se etiqueta como archivada y nunca como absolución; una causa abierta, como pendiente de juicio. De esto no se deriva ninguna puntuación ni clasificación.",
  },
  masthead: {
    edition: "Edición nº 001",
    live: "Datos en directo · BDNS",
    place: "Madrid",
    sources: "Fuentes: BDNS · Tribunal de Cuentas · Congreso",
    navLabel: "Secciones",
  },
  footer: {
    source:
      "Siguiendo el Dinero · Datos abiertos BDNS, Tribunal de Cuentas y Congreso de los Diputados",
    caveat: "Los hechos van uno junto a otro; ninguna causa se afirma",
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
  },
  common: {
    backToPanel: "← Volver al panel",
    backToFaces: "← Caras",
    nif: "NIF",
    caveat: "Qué hay que saber",
  },
  blocs: {
    derecha: "Derecha",
    izquierda: "Izquierda",
    nacionalista: "Nacionalista",
    regionalista: "Regionalista",
    otro: "Otro",
  },
  kinds: {
    ordinaria: "Financiación ordinaria",
    seguridad: "Gastos de seguridad",
    otra: "Otra",
    all: "Todas",
  },
  fundingStats: {
    eyebrow: "Los tres cauces del dinero",
    subsidies: "Subvenciones del Estado",
    subsidiesNote: "Total acumulado en la BDNS · actualizado a diario",
    donations: "Donaciones privadas 2020",
    donationsNote: "{donors} donantes declarados",
    electoral: "Gasto electoral 2024",
    electoralNote: "Gasto ordinario declarado en las europeas",
    capped: "Publicidad con tope legal",
    cappedNote: "{amount} · LOREG arts. 55 y 58",
    residual: "Línea residual sin desglosar",
    residualNote: "{amount} en una sola partida",
  },
  foundationsPage: {
    eyebrow: "El cauce que corre al revés",
    titlePre: "Quién paga a las ",
    titleEmph: "fundaciones",
    titlePost: " de los partidos, y quién las gobierna",
    standfirst:
      "A los partidos les está prohibido aceptar dinero de empresas; a sus fundaciones vinculadas no. Pero en las cifras auditadas el dinero de empresas es la parte pequeña, y casi nueve de cada diez euros que entran los pone el propio partido. Aquí están las entidades, sus cuentas y los patronatos que las dirigen.",
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
  rights: {
    eyebrow: "Voces de las organizaciones",
    titlePre: "Lo que publican las ",
    titleEmph: "entidades",
    titlePost: ", en su propia voz",
    intro:
      "El resto de esta web mira al Estado: sus subvenciones, sus auditorías, sus votaciones registradas. Esta sección hace lo contrario y recoge lo que publican las propias organizaciones de derechos LGTBI, con su nombre delante de cada pieza.",
    orgsTitle: "Publicado por las organizaciones",
    orgsNote:
      "Ocho organizaciones, cada una a través de su propio canal. Van primero porque son fuente directa: hablan de sí mismas y de su trabajo, no de segunda mano.",
    mediaTitle: "Cobertura en medios",
    mediaNote:
      "Medios que cubren estos temas de forma continuada. Se muestran aparte para que quede claro qué es fuente directa y qué es cobertura.",
    directoryTitle: "De dónde sale todo esto",
    directoryNote:
      "El registro completo de canales que lee esta sección. Se enlaza cada organización para poder ir a la fuente y no sólo a lo que publicó esta quincena.",
    kindOrg: "Organizaciones",
    kindMedia: "Medios",
    empty:
      "Ningún canal ha devuelto piezas recientes. No es una afirmación sobre la actualidad: es un fallo de lectura, y se corrige solo cuando los canales responden.",
    droppedNote: "Canales que no respondieron en esta carga:",
    caveat:
      "Esta web no edita, resume ni reescribe estas piezas: muestra el titular, la fecha y el enlace al original. Las imágenes son las que publica cada canal y se sirven a través de este sitio, no directamente desde el servidor de la organización, para no exponer la IP de quien lee. El orden es por fecha, con las fuentes en el idioma de la página primero.",
    methodLink: "Cómo se eligieron estos canales, y cuáles se descartaron ↗",
    homeTitle: "Derechos LGTBI, en voz de las organizaciones",
    homeCta: "Ver la sección de derechos",
  },
  lead: {
    kicker: "Investigación · Gasto electoral",
    title: "Más de la mitad del gasto electoral no está desglosado",
    standfirst:
      "De los {declared} que ocho formaciones declararon como gasto ordinario en las europeas del 9 de junio de 2024, {residual} —el {share}— figuran en una sola línea residual que el informe de fiscalización no desglosa. La publicidad, la única partida con tope legal, es el {ads}.",
    link: "Leer el desglose completo",
  },
  portal: {
    tickSubsidies: "Subvenciones del Estado",
    tickSubsidiesNote: "BDNS · actualizado a diario",
    tickDonations: "Donaciones privadas",
    tickDonationsNote: "Ejercicio {year} · {donors} donantes",
    tickSpending: "Gasto electoral",
    tickSpendingNote: "Europeas de 2024 · {n} formaciones",
    tickVotes: "Votaciones seguidas",
    tickVotesNote: "Llamamientos nominales del Congreso",
    tickPeople: "Cargos con retribución",
    tickPeopleNote: "Registro de Altos Cargos, sólo activos",
    tickLarge: "Donantes de más de 10.000 €",
    tickLargeNote: "Entre todos aportaron {amount}",
    opinionKicker: "Las organizaciones hablan",
    opinionTitle: "Opinión y análisis",
    housingKicker: "Vivienda",
    housingTitle: "La vivienda, en las noticias",
    housingNote:
      "Lo último de medios de distinto signo, de las radiotelevisiones públicas y de las organizaciones de inquilinas y de afectados por la hipoteca, cada pieza con el nombre de quien la publica. Las organizaciones hablan en su propia voz; los medios, como cobertura.",
    opinionCta: "Directorio de organizaciones",
    bandTitle: "El pulso de los datos",
    bandNote: "Tres registros públicos, resumidos",
    colVote: "Votación",
    colDate: "Fecha",
    colResult: "Resultado",
    bandVotesTable:
      "Cada votación seguida, de la más reciente a la más antigua, con los votos emitidos tal como constan en el acta.",
    colTranche: "Tramo",
    colDonors: "Donantes",
    colDonorShare: "% de donantes",
    colAmount: "Importe",
    colMoneyShare: "% del dinero",
    bandDonorsTable:
      "Donantes e importes declarados en {year}, sumados en todas las formaciones, por tramo del informe.",
    colFormation: "Formación",
    colDeclared: "Declarado",
    colShare: "Parte del total",
    bandSpendTable: "Gasto ordinario declarado por cada formación en las europeas de 2024.",
    bandVotesTitle: "Los llamamientos, uno a uno",
    bandDonorsTitle: "Muchos donantes, poco dinero",
    bandDonorsNote:
      "{n} personas —el {donorShare} de los donantes— aportaron {amount} en {year}: el {moneyShare} de todo el dinero privado declarado.",
    bandSpendTitle: "Gasto electoral, europeas de 2024",
    carried: "Aprobada",
    rejected: "Rechazada",
    per100Donors: "De cada 100 donantes",
    per100Euros: "De cada 100 euros",
    colRecordKicker: "Registro parlamentario",
    colReportKicker: "Reportaje",
    colReportTitle: "{donors} donantes y un solo cheque de {largest}",
    colReportBody:
      "El informe no publica donación por donación: agrupa lo declarado en tres tramos y da, por partido, cuántas personas hay en cada uno y cuánto suman. De ahí sale la forma del dinero privado, que es lo que importa. Un partido puede recibir lo mismo de miles de personas que de un puñado, y el total por sí solo no dice cuál de las dos cosas ha pasado. Donde un tramo alto tiene un único donante, su total es esa donación: es el único caso en que una cifra individual se puede leer del informe sin inventar nada.",
    colReportLink: "Ver el reparto por partido",
    photoPending: "Fotografía · pendiente de licencia",
    eyebrow: "Portal de transparencia política",
    titlePre: "Quién les paga, y ",
    titleEmph: "cómo votan",
    titlePost: ".",
    lead:
      "Seguimiento del dinero público y privado que reciben los partidos españoles, junto al voto registrado de sus cargos en las leyes que afectan a las personas trans y LGTBI, a la salud sexual y reproductiva, y al derecho a la vivienda.",
    statPublic: "Dinero público a partidos",
    statPrivate: "Donaciones privadas declaradas",
    statPeople: "Cargos públicos en activo",
    statVotes: "Votaciones seguidas",
    stanceTitle: "Cómo votó cada grupo",
    stanceNote:
      "Voto mayoritario de cada grupo, contado a partir de los votos nominales. Se indica el sentido del voto tal cual consta en el acta, no una interpretación: en votaciones de enmiendas, un No puede significar rechazar la enmienda y no oponerse a la ley. Consulta el acta oficial y el asunto de cada votación.",
    inFavourGroups: "Votó Sí",
    againstGroups: "Votó No",
    abstainGroups: "Se abstuvo",
    newsTitle: "Derechos LGTBI, trans y vivienda en la actualidad",
    newsNote:
      "Publicaciones recientes de una lista fija de medios y entidades. Las marcadas como publicación de la entidad son sus propios textos, y pueden tratar tanto de derechos como de su actividad.",
    newsSourcesLink: "Ver las fuentes",
    exploreTitle: "Explorar",
    exploreMoney: "El reparto del dinero público entre partidos, año a año.",
    explorePeople: "Cada cargo en activo: sueldo, partido y voto registrado.",
    exploreVotes: "Las votaciones seguidas, con desglose por grupo.",
    exploreMethod: "Fuentes, límites y qué no muestra esta herramienta.",
    linkFraming:
      "El dinero y los votos se publican juntos para poder consultarlos, no porque uno explique al otro. Una subvención pública no determina un voto concreto.",
  },
  home: {
    perPartyColour: "Financiación ordinaria, en el color del partido",
    eyebrow: "Subvenciones estatales",
    titlePre: "El dinero de los ",
    titleEmph: "partidos",
    titlePost: ", canal por canal",
    channelTitle: "Subvenciones estatales a los partidos",
    subtitle:
      "Tres canales, cada uno con su fuente oficial: lo que el Estado les entrega, lo que declararon haber gastado en una campaña y lo que declararon recibir de particulares. El dinero de las fundaciones vinculadas tiene su propia sección.",
    intro:
      "El dinero público que el Estado entrega a cada partido, tomado en directo de la Base de Datos Nacional de Subvenciones. Filtra por año y por tipo de ayuda para ver el reparto.",
    totalLabel: "Total concedido (selección)",
    parties: "Partidos",
    concessions: "Concesiones",
    updated: "Actualizado",
    year: "Ejercicio",
    reset: "Reset",
    distribution: "Reparto por partido",
    noResults: "No hay concesiones para esta selección.",
    filterStatus: "{parties} partidos · {grants} concesiones · {total} con los filtros actuales",
    tableCaption:
      "Lo concedido a cada partido con los filtros actuales, por tipo de ayuda, en euros: las cifras que dibuja cada barra.",
    colParty: "Partido",
    colTotal: "Total",
    colShare: "Parte del total",
  },
  party: {
    switcherLabel: "Elegir formación",
    fichaKicker: "Ficha de partido",
    fichaIntro:
      "Cuatro registros públicos sobre la misma formación: lo que el Estado le entrega, lo que declaró recibir de particulares, cómo votó su grupo en los llamamientos que este portal sigue y qué consta de sus cargos en el registro judicial. Ninguno explica a los demás.",
    howItVoted: "Cómo votó el grupo",
    sharedGroup: "En grupo compartido · {group}",
    noRepresentation: "Sin representación",
    stanceNote:
      "La posición es la mayoría de las papeletas nominales del propio grupo: contada, no atribuida. Donde una formación comparte grupo con otras se dice cuál, en lugar de asignarle la mayoría de ese grupo: en el Grupo Plurinacional SUMAR, por ejemplo, atribuir su voto a Sumar y no a Izquierda Unida sería arbitrario. Y donde no tenía representación en aquella legislatura, se dice también.",
    totalReceived: "Total recibido",
    ofNational: "del total nacional",
    facesTitle: "Caras del partido",
    whereFrom: "De dónde viene",
    ofItsFunds: "de sus fondos",
    yearlyEvolution: "Evolución anual",
    privateTitle: "Financiación privada",
    donationsDeclared: "Donaciones declaradas",
    donors: "donantes",
    privateCaveat:
      "Solo personas físicas (las donaciones de empresas están prohibidas). Dato anual del último informe disponible del Tribunal de Cuentas.",
    ledgerTitle: "Registro de concesiones",
    exercise: "Ejercicio",
    legalBasis: "base legal (BOE) ↗",
    inNews: "En las noticias",
    recentHeadlines: "Titulares recientes · Google News",
  },
  politician: {
    partyFunding: "Financiación pública de su partido",
    seeBreakdown: "ver desglose →",
    caveat: "Las subvenciones públicas se conceden al partido, no a la persona.",
    onBluesky: "En Bluesky",
  },
  caras: {
    title: "Caras",
    intro:
      "Políticos individuales: su partido y financiación pública, su actividad en Bluesky y los titulares en los que aparecen. Los perfiles de Bluesky están verificados uno a uno.",
    note:
      "La lista es una muestra curada. Bluesky tiene, a día de hoy, mayor presencia de la izquierda; líderes de PP y Vox no tienen cuenta verificable allí.",
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
  voteFlow: {
    tableCaption:
      "Las formaciones del gráfico, con lo que declararon en donaciones privadas en 2020 y cómo votó su grupo. Total declarado por ellas: {total}.",
    colFormation: "Formación",
    colDonations: "Donaciones declaradas, 2020",
    colVote: "Voto del grupo",
    title: "Dinero declarado y voto registrado, uno junto a otro",
    sourceHead: "Donaciones privadas declaradas · 2020",
    outcomeHead: "Voto del grupo",
    caveat:
      "El grosor del trazo es la cuantía declarada, no una relación causal. Los dos registros son públicos, independientes y de años distintos: nada aquí afirma que el uno explique al otro.",
    scope:
      "{included} formaciones, las que tienen a la vez donaciones declaradas en el informe y un grupo propio con voto registrado en este llamamiento. Fuente del dinero: {report}.",
    excluded:
      "Quedan fuera, por no tener grupo propio en esta legislatura o no constar en el informe:",
  },
  donationsTable: {
    barNote:
      "Cada barra se compara con la del partido que más declaró —el PSOE—, no con el total nacional: a escala nacional trece de las diecisiete filas medirían menos de dos píxeles. Un importe muy pequeño se dibuja con un ancho mínimo para que se vea que no es cero.",
    title: "Donaciones privadas declaradas, 2020",
    caption:
      "Una formación por fila, ordenadas por importe declarado. La barra reparte el total de cada partido entre los tres tramos del informe y está escalada contra el mayor total, no contra el total nacional.",
    rank: "Nº",
    party: "Formación",
    byTranche: "Reparto por tramos",
    total: "Total",
    donors: "Donantes",
    donorsWord: "donantes",
    tranchesNote:
      "Tramos del informe: menos de 1.000 €, de 1.000 a 10.000 €, más de 10.000 €.",
    trancheSmall: "Menos de 1.000 €",
    trancheMid: "De 1.000 a 10.000 €",
    trancheLarge: "Más de 10.000 €",
    legalNote:
      "Las empresas no pueden donar a los partidos desde la reforma de 2015 de la LO 8/2007: sólo personas físicas, con un máximo de 50.000 € al año y sin donaciones anónimas. No existe una cifra de financiación por político, y esta web no la calcula.",
  },
  spending: {
    barNote:
      "Cada barra se compara con la de la formación que más declaró, así que su longitud dice cuánto gastó y sus tramos en qué. Un importe muy pequeño se dibuja con un ancho mínimo para que se vea que no es cero; la cifra exacta está en las columnas.",
    eyebrow: "Gasto electoral · europeas de 2024",
    sharesTotal: "Gasto ordinario declarado, en total",
    sharesNote:
      "Cada barra es la parte de la formación en ese total, así que juntas suman el 100 %. Un importe muy pequeño se dibuja con un ancho mínimo para que se vea que no es cero.",
    sharesCaption:
      "Gasto ordinario declarado por cada formación en las elecciones europeas del 9 de junio de 2024.",
    linesTitle: "En qué se declaró gastado",
    lineAdvertising: "Publicidad exterior y en prensa y radio",
    lineAdvertisingNote:
      "Los dos únicos gastos con límite legal propio: arts. 55 y 58 de la LOREG.",
    lineResidual: "Línea residual, sin desglose en el informe",
    lineResidualNote:
      "«Otros gastos ordinarios». Es la mayor parte del gasto y el informe no dice en qué se fue.",
    lineFinancial: "Costes financieros y otros conceptos",
    lineFinancialNote: "Intereses liquidados y estimados de las operaciones de crédito.",
    lineMailings: "Envíos postales, aparte del gasto ordinario",
    lineMailingsNote:
      "{count} envíos con derecho a subvención. No entran en el gasto ordinario ni en el límite general, así que no tienen porcentaje de esa cifra: la barra va completa para decir que el denominador es otro.",
    title: "En qué se declaró gastado el dinero electoral",
    intro:
      "El Tribunal de Cuentas fiscaliza las cuentas de cada elección y desglosa el gasto declarado. Sólo dos tipos de publicidad tienen límite legal y aparecen detallados; el resto del gasto ordinario se agrupa en una única línea que el informe no desglosa.",
    unexplained: "Sin desglosar",
    ofDeclared: "del gasto ordinario declarado",
    advertising: "Publicidad",
    cappedOnly:
      "Publicidad exterior (art. 55 LOREG) y en prensa y radio (art. 58). Son los dos únicos gastos con límite propio.",
    mailings: "Envíos de propaganda",
    mailingItems: "envíos con derecho a subvención",
    declared: "Declarado",
    formation: "Formación",
    split: "Reparto",
    caption:
      "Una formación por fila, con el gasto ordinario declarado y cuánto de él corresponde a publicidad con límite legal frente a la línea residual «Otros gastos ordinarios». Los envíos de propaganda se contabilizan aparte y no entran en estas columnas.",
    gapTitle: "Lo que el registro no dice",
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
  contexto: {
    eyebrow: "El país",
    title: "Contexto",
    lead:
      "Esta web publica lo que cobran los partidos y lo que cobran los cargos públicos. Ninguna de esas cifras significa nada sin una escala. Ésta es la escala, tomada del INE, que es quien la produce.",
    framing:
      "Aquí no se une nada. No hay línea que vaya de una tasa de pobreza a un voto, ni correlación, ni ordenación de partidos por nada calculado a partir de estos datos. Las cifras se ponen unas al lado de otras y quien lee saca sus conclusiones: una línea trazada aquí afirmaría algo que los datos no sostienen.",
    wages: {
      title: "Lo que se cobra en España",
      intro:
        "El salario bruto medio anual fue de {mean}. La mediana —la cifra que deja a la mitad de los asalariados por debajo— fue de {median}. La diferencia es la cola alta: el 10 % peor pagado no llegó a {p10} y el 10 % mejor pagado superó {p90}.",
      lowSample: "muestra reducida",
      sourceNote:
        "El INE marca con un signo menos las celdas cuya muestra tiene entre 100 y 500 observaciones: no son cifras negativas, son cifras con alta variabilidad. Se conservan y se señalan; ninguna de las mostradas aquí lleva esa marca.",
      jornada:
        "Una advertencia que cambia cómo leer todo lo anterior: la EAES cuenta a tiempo parcial y a tiempo completo en la misma media, así que ninguna de estas cifras es «lo que paga un puesto». A jornada completa la media fue de {full}; a jornada parcial, de {part}.",
      spread:
        "Entre el sector mejor y el peor pagado hay un factor de {ratio}: {high} con {highValue} frente a {low} con {lowValue}.",
    },
    smi: {
      title: "Toda la masa salarial, en múltiplos del SMI",
      intro:
        "El mismo eje para cualquier sueldo de esta web. El {underTwo} de los asalariados españoles cobra menos de dos salarios mínimos. Los tramos son los del INE, calculados sobre el SMI del propio año.",
      sourceNote:
        "Los tramos suman el total de asalariados. Se dibujan en filas separadas y no apilados porque el tramo superior es el 0,12 % y apilado no se vería; cada fila lleva su porcentaje exacto.",
    },
    poverty: {
      title: "A cuánta gente afecta",
      intro:
        "Cuatro indicadores de la Encuesta de Condiciones de Vida. Cada uno es una proporción de una población, así que la parte vacía de la barra es el resto del país.",
      rows: {
        arope: "En riesgo de pobreza o exclusión social (AROPE)",
        aropeChildren: "AROPE, menores de 16 años",
        atRisk: "En riesgo de pobreza (renta del año anterior)",
        deprivation: "Con carencia material y social severa",
      },
      spread:
        "La cifra nacional no describe a ninguna comunidad en concreto: va de {high} en {highRegion} a {low} en {lowRegion}.",
      base: "Serie {base}, indicada porque la misma tabla puede contener definiciones distintas del mismo indicador.",
      multipleBases:
        "La tabla contiene más de una definición ({bases}). Aquí se muestra {shown}; no se mezclan, porque miden cosas distintas con el mismo nombre.",
      note:
        "Estas cifras no se cruzan con ningún voto ni con ninguna financiación de esta web. Están aquí para que quien lea tenga delante las dos cosas, no para afirmar que una explica la otra.",
    },
  },
  where: {
    title: "¿Y usted, dónde vive?",
    intro:
      "Casi todo lo que hay en esta web se publica por comunidad autónoma. Escriba su código postal o elija su provincia y verá lo que consta de la suya.",
    postcodeLabel: "Código postal",
    postcodePlaceholder: "28001",
    submit: "Ver",
    provinceLabel: "O elija provincia",
    provincePlaceholder: "Provincia…",
    notFound: "Ese código postal no corresponde a ninguna provincia. Son cinco dígitos.",
    privacy:
      "El código postal se resuelve en su navegador: sus dos primeras cifras son el código de provincia. No se envía a ningún sitio ni se guarda.",
    backHome: "← Portada",
    eyebrow: "Dónde vive usted",
    lead:
      "{province} está en {territory}. Todo lo que sigue está medido para {territory}, no para {province}: no existen estas cifras por provincia, y dividirlas sería inventarlas.",
    leadSame:
      "{territory} es a la vez provincia y comunidad autónoma, así que todo lo que sigue está medido para ese mismo territorio.",
    governmentTitle: "Quién preside",
    president: "Presidencia",
    party: "Partido",
    since: "Desde",
    governmentNote:
      "Es quién ocupa la presidencia en la fecha de comprobación, no el resultado de las elecciones ni la composición del gobierno.",
    noGovernment: "No consta presidencia para este territorio.",
    investitureDecisive:
      "El PP tenía {pp} de {seats} escaños, y la investidura salió adelante con votos de Vox: sin ellos no había mayoría. Vox tenía {vox} escaños.",
    investitureShort:
      "El PP tenía {pp} de {seats} escaños, menos de la mayoría absoluta, y Vox {vox}. Esta web recoge la aritmética; el acta de la votación no está verificada aquí.",
    officeholdersTitle: "Cargos públicos de aquí",
    officeholders:
      "El registro de altos cargos recoge {count} cargos en {territory}. De ellos, {withSalary} publican retribución anual, y la mediana de lo publicado es {median}.",
    officeholdersGap:
      "{missing} de las {total} filas del registro no indican territorio, así que no entran en este recuento. No se reparten entre comunidades.",
    noFigure: "ninguna cifra",
    seeOfficeholders: "Ver estos cargos en el registro →",
    wagesTitle: "Lo que se cobra aquí",
    wages:
      "En {territory} la mediana del salario bruto anual fue de {median}, frente a {national} en el conjunto de España. El 10 % peor pagado no llegó a {p10} y el 10 % mejor pagado superó {p90}.",
    noWages:
      "La encuesta salarial del INE no publica percentiles para {territory}: sus tablas por comunidad cubren las diecisiete comunidades autónomas y no las dos ciudades autónomas. No se sustituye por la cifra nacional.",
    seeContext: "Ver los salarios de toda España →",
    povertyTitle: "Riesgo de pobreza o exclusión",
    national: "España",
    povertyNote:
      "Serie {base}. Es una proporción de la población, no un recuento, y no se cruza con nada más de esta web.",
    noPoverty: "La Encuesta de Condiciones de Vida no publica este indicador para este territorio.",
    hateTitle: "Delitos de odio registrados",
    hate:
      "En {territory} constan {total} hechos conocidos en {year}, una tasa de {rate} por cada 100.000 habitantes frente a {national} en el conjunto de España. Registrados por orientación sexual e identidad de género: {sogi}.",
    hateNote:
      "Son hechos conocidos por las fuerzas de seguridad, no incidencia: una tasa más alta puede reflejar más denuncia y no más delito.",
    noHate: "El informe no localiza hechos conocidos en este territorio.",
    seeMap: "Ver el mapa completo →",
    closing:
      "Nada de esta página une una cifra con otra. Que {territory} tenga una tasa determinada y que quien la preside votara de una manera son dos hechos puestos uno al lado del otro, no una explicación.",
  },
  search: {
    label: "Buscar en la web",
    placeholder: "Buscar…",
    submit: "Buscar",
    eyebrow: "Búsqueda",
    title: "Buscar",
    scope:
      "Busca nombres y títulos: personas del registro de altos cargos con su puesto y su municipio, partidos, fundaciones vinculadas, comunidades, provincias, votaciones seguidas y secciones de la web. No busca dentro del texto de los informes, así que una palabra que sólo aparezca en un hallazgo del Tribunal de Cuentas no saldrá aquí.",
    count: "Resultados para «{query}»: {total}",
    more: "y {more} más",
    tooShort: "Escriba al menos {min} letras.",
    empty: "No hay resultados para «{query}».",
    emptyHint:
      "Pruebe con menos palabras, o con el apellido en lugar del nombre completo. Los acentos no importan. Que algo no salga aquí no significa que no exista: esta búsqueda sólo mira nombres y títulos.",
    kinds: {
      person: "Cargos públicos",
      party: "Partidos",
      foundation: "Fundaciones y entidades",
      territory: "Comunidades autónomas",
      province: "Provincias",
      vote: "Votaciones seguidas",
      page: "Secciones",
    },
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
    faces: "Faces",
    salaries: "Salaries",
    people: "Politicians",
    votes: "Votes",
    methodology: "Methodology",
    context: "Context",
    funding: "Funding",
    rights: "Rights",
    map: "Map",
    foundations: "Foundations",
    data: "Data",
    sectionData: "Data",
    sectionAbout: "About",
    menu: "Menu",
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
    eyebrow: "Recorded divisions",
    title: "Key votes",
    intro:
      "Positions recorded in roll-call votes of the Congress on specific items. Each position is a ballot actually cast and verifiable, not an opinion attributed to anyone.",
    caveat:
      "Each vote is labelled by type: some pass laws, others are non-legislative motions, which are not binding. Amendment votes are excluded. A deputy appears only if their vote is on record; nobody's stance is inferred from their party.",
    searchLabel: "Search deputy",
    searchPlaceholder: "Surname or name…",
    inFavour: "In favour",
    against: "Against",
    abstention: "Abstention",
    noVote: "Did not vote",
    present: "Present",
    byGroup: "By parliamentary group",
    group: "Group",
    byGroupCaption: "One group per row, with its ballots counted and a link to the party's funding where the group is made up of one party.",
    distribution: "Split",
    funding: "Funding",
    severalParties: "Several parties",
    groupUnknown: "Group not in the registry",
    groupNote:
      "A parliamentary group is not a party. Where a group is made up of one party, the last column links to that party's funding; where it is a coalition, it links to none of them, because attributing a coalition's money to one member would be false.",
    groupSource: "Group composition ↗",
    officialRecord: "Official record ↗",
    lawText: "Text of the law ↗",
    session: "Session",
    noMatch: "No recorded votes for that search.",
    results: "deputies",
    kinds: {
      ley: "Final vote on a law",
      toma: "Leave to proceed",
      pnl: "Non-legislative motion",
      mocion: "Motion following an urgent interpellation",
    },
    nonBinding: "non-binding",
    legislature: "Legislature",
  },
  salaries: {
    title: "Public salaries",
    intro:
      "Pay for serving public officeholders, from the Register of Senior Officials and government transparency portals. Search by name, role, municipality or region.",
    search: "Search",
    searchPlaceholder: "Name, role, municipality…",
    party: "Party",
    all: "All",
    role: "Role",
    where: "Scope",
    annual: "Gross annual",
    people: "officeholders",
    results: "results",
    noResults: "No results for this search.",
    prev: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    median: "Median",
    sourceNote:
      "Sources · Register of Senior Officials / transparencia.gob.es; deputies the register does not carry, from Congreso open data",
    caveat:
      "Pay for the post — not personal wealth or private income. Only posts marked active in the source.",
  },
  map: {
    investitureTitle: "Investiture",
    investitureDecisive:
      "The PP held {pp} of {seats} seats and an absolute majority was {majority}. In the vote of {date} the investiture carried {for} to {against}, and {voxVotes} of those votes came from Vox: without them there was no majority.",
    investitureShort:
      "The PP held {pp} of {seats} seats and an absolute majority was {majority}, so it could not reach one alone; Vox’s {vox} seats would have closed the gap. The vote record is not verified here, and a second round needs only a simple majority, so nothing is claimed about who invested whom.",
    investitureCarried: "carried",
    investitureFailed: "rejected",
    hatchDecisive: "Invested with Vox votes, per the record",
    hatchShort: "PP could not reach an absolute majority alone",
    eyebrow: "Territorial map",
    title: "Where each party governs, and what is on record there",
    standfirst:
      "Hover to read a community. Click to pin it to the panel. The two layers are shown separately and neither explains the other.",
    svgLabel: "Map of the autonomous communities",
    layerGov: "Regional government",
    layerGovNote:
      "The party of whoever held each community's presidency on the date checked, with the date they took office. It is not the election result and not the composition of the government: it is who holds the presidency.",
    layerHate: "Recorded hate crime",
    layerHateNote:
      "Rate of hate offences, administrative infractions and other incidents per 100,000 inhabitants, 2024. These are facts recorded by the security forces, not convictions: the figure depends on how much is reported and on how each police force records what is reported.",
    perHundredThousand: "per 100,000",
    panelKicker: "Territorial record",
    rowPresident: "President",
    rowParty: "Party",
    rowSince: "In office since",
    rowRecorded: "Recorded, 2024",
    rowRate: "Rate per 100,000",
    barSogi: "Sexual orientation and gender identity",
    barRacism: "Racism and xenophobia",
    barsNote:
      "Two of the twelve motivations the report distinguishes, as a proportion of that community's recorded facts.",
    noData: "Not on record",
    tableCaption:
      "One territory per row, with both map layers as figures. The order follows the active layer: by party on the government layer, by rate on the hate-crime one.",
    tableCaptionSorted:
      "One territory per row, with both map layers as figures. Sorted by the column you chose; click another heading to change it.",
    sortHint: "Sort by {column}",
    colTerritory: "Territory",
    colRate: "Rate / 100,000",
    sourcesTitle: "Sources",
    tablesLabel: "tables",
    checkedLabel: "checked",
    limits:
      "Recorded facts include administrative infractions and other incidents, not only offences, and they are not convictions. The two communities with their own regional police forces — the Policía Foral de Navarra and the Ertzaintza — head the rate table, which says something about how incidents are recorded and not necessarily about where more of them happen. One incident in the report is recorded in no territory at all, which is why the columns here sum to one less than the national figure.",
    missingLayers:
      "This section was designed with three further layers: an LGBTI rights index, the state of trans-law reform, and vote share for the formations that voted against the measures this site tracks. They are absent because there is no citable per-community source for any of the three yet. The investiture hatching is present, but it marks a dated fact — how one particular vote went — rather than who sits in a government today, which is the part that would have gone stale: Vox left three of those governments in July 2024.",
  },
  court: {
    title: "What the judicial record says",
    eyebrow: "In the courts",
    sourceLink: "Source",
    statusNone: "Nothing on record",
    noneBody:
      "This site holds no court resolution and no electoral-board order concerning officeholders of this formation in the matters it tracks.",
    noneNote:
      "An absence of records is not a statement about anyone's conduct: it means only that there is no citable resolution.",
    status: {
      archived: "Case archived",
      "awaiting-trial": "Awaiting trial",
      "advertising-infringement": "Advertising infringement",
      "complaint-archived": "Complaint archived",
      "none-on-record": "Nothing on record",
    },
    records: {
      "menas-2021": {
        text: "Vox’s “menas” poster in the 2021 Madrid Assembly campaign. The investigating court archived the case by order and the Audiencia Provincial confirmed it: “there is no hate offence and no electoral offence”.",
        note: "The prosecution service, PSOE, Podemos, Izquierda Unida and Progresa all appealed. This is an archiving at the instruction stage, not an acquittal: no court reached the merits.",
      },
      "herrero-valencia": {
        text: "Vox’s València city councillor Cecilia Herrero has been committed to oral trial for hate offences over roughly thirty posts on X between April 2020 and April 2024. The prosecution seeks 3 years’ imprisonment, a 12-month fine at €20/day, and disqualification.",
        note: "An order opening oral trial, not a verdict. The charge is pleaded in the alternative: 510.1 a) with 510.3, 510.5 and 510.6, or else 510.2 a) with the same subsections.",
      },
      "jez-madrid-2023": {
        text: "The Junta Electoral de Zona de Madrid ordered a banner on calle Alcalá taken down “within one day”, as propaganda contracted outside the campaign period.",
        note: "LOREG art. 53 and JEC Instrucción 3/2011. The board expressly declared itself not competent over the content and opened no sanctioning file: this is a breach of advertising timing and nothing more.",
      },
      "belarra-querella": {
        text: "The Supreme Court’s criminal chamber archived Vox’s complaint against Ione Belarra over remarks at a Collado Villalba rally, holding that art. 510 CP protects social minorities and not political parties.",
        note: "Ponente Sánchez Melgar; the appeal was rejected. The record documents a complaint against her, never conduct by her.",
      },
    },
    policy:
      "Four resolutions verified one by one, not a census: the number of records against one formation is not comparable with another’s. An archived case is labelled archived and never as an acquittal; an open case, as awaiting trial. No score or ranking is derived from any of it.",
  },
  masthead: {
    edition: "Edition no. 001",
    live: "Live data · BDNS",
    place: "Madrid",
    sources: "Sources: BDNS · Court of Auditors · Congress",
    navLabel: "Sections",
  },
  footer: {
    source:
      "Siguiendo el Dinero · Open data from the BDNS, the Court of Auditors and the Congress of Deputies",
    caveat: "Facts are placed side by side; no cause is asserted",
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
  },
  common: {
    backToPanel: "← Back to dashboard",
    backToFaces: "← Faces",
    nif: "Tax ID",
    caveat: "What to know",
  },
  blocs: {
    derecha: "Right",
    izquierda: "Left",
    nacionalista: "Nationalist",
    regionalista: "Regionalist",
    otro: "Other",
  },
  kinds: {
    ordinaria: "Ordinary funding",
    seguridad: "Security costs",
    otra: "Other",
    all: "All",
  },
  fundingStats: {
    eyebrow: "The three channels the money runs through",
    subsidies: "State subsidies",
    subsidiesNote: "Running total in the BDNS · updated daily",
    donations: "Private donations, 2020",
    donationsNote: "{donors} declared donors",
    electoral: "Electoral spending, 2024",
    electoralNote: "Ordinary spending declared for the European elections",
    capped: "Advertising under a legal cap",
    cappedNote: "{amount} · LOREG arts. 55 and 58",
    residual: "Residual line, not broken down",
    residualNote: "{amount} in a single item",
  },
  foundationsPage: {
    eyebrow: "The channel that runs the other way",
    titlePre: "Who pays the parties’ ",
    titleEmph: "foundations",
    titlePost: ", and who governs them",
    standfirst:
      "Parties may accept no corporate money at all; their linked foundations may. But in the audited figures corporate money is the small part, and nearly nine in every ten euros coming in are put there by the party itself. Here are the entities, their accounts, and the boards that run them.",
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
  rights: {
    eyebrow: "The organisations' own voices",
    titlePre: "What the ",
    titleEmph: "organisations",
    titlePost: " publish, in their own words",
    intro:
      "The rest of this site looks at the state: its subsidies, its audits, its recorded votes. This section does the opposite and carries what the LGBTQ+ rights organisations publish themselves, with their name in front of every piece.",
    orgsTitle: "Published by the organisations",
    orgsNote:
      "Eight organisations, each through its own channel. They come first because they are first-hand: they are writing about themselves and their own work, not relaying it.",
    mediaTitle: "Coverage in the press",
    mediaNote:
      "Outlets that cover these subjects continuously. Shown separately so it stays clear what is first-hand and what is coverage.",
    directoryTitle: "Where all of this comes from",
    directoryNote:
      "The full registry of channels this section reads. Each organisation is linked so you can go to the source, not only to whatever it published this fortnight.",
    kindOrg: "Organisations",
    kindMedia: "Press",
    empty:
      "No channel returned anything recent. That is not a statement about the news: it is a read failure, and it clears itself when the channels answer.",
    droppedNote: "Channels that did not answer on this load:",
    caveat:
      "This site does not edit, summarise or rewrite these pieces: it shows the headline, the date and a link to the original. The images are the ones each channel publishes, served through this site rather than straight from the organisation's server, so a reader's IP address is not exposed. Order is by date, with sources in the page's language first.",
    methodLink: "How these channels were chosen, and which were rejected \u2197",
    homeTitle: "LGBTQ+ rights, in the organisations' own voices",
    homeCta: "Open the rights section",
  },
  lead: {
    kicker: "Investigation · Electoral spending",
    title: "More than half of electoral spending is never broken down",
    standfirst:
      "Of the {declared} that eight formations declared as ordinary spending for the European elections of 9 June 2024, {residual} — {share} — sits in a single residual line the audit report does not break down. Advertising, the only item with a legal cap, is {ads}.",
    link: "Read the full breakdown",
  },
  portal: {
    tickSubsidies: "State subsidies",
    tickSubsidiesNote: "BDNS · updated daily",
    tickDonations: "Private donations",
    tickDonationsNote: "{year} financial year · {donors} donors",
    tickSpending: "Electoral spending",
    tickSpendingNote: "2024 European elections · {n} formations",
    tickVotes: "Divisions tracked",
    tickVotesNote: "Recorded divisions of the Congreso",
    tickPeople: "Paid officeholders",
    tickPeopleNote: "Senior Appointments Register, active only",
    tickLarge: "Donors above €10,000",
    tickLargeNote: "Between them they gave {amount}",
    opinionKicker: "The organisations speak",
    opinionTitle: "Opinion and analysis",
    housingKicker: "Housing",
    housingTitle: "Housing, in the news",
    housingNote:
      "The latest from outlets across the spectrum, the public broadcasters, and tenants' and mortgage-holders' organisations, each item named with its publisher. The organisations speak in their own voice; the outlets are coverage.",
    opinionCta: "Directory of organisations",
    bandTitle: "The pulse of the data",
    bandNote: "Three public registers, summarised",
    colVote: "Division",
    colDate: "Date",
    colResult: "Result",
    bandVotesTable:
      "Every tracked division, newest first, with the ballots cast as the official record gives them.",
    colTranche: "Band",
    colDonors: "Donors",
    colDonorShare: "% of donors",
    colAmount: "Amount",
    colMoneyShare: "% of the money",
    bandDonorsTable:
      "Donors and amounts declared in {year}, summed across all formations, by the report's bands.",
    colFormation: "Formation",
    colDeclared: "Declared",
    colShare: "Share of total",
    bandSpendTable: "Ordinary spending declared by each formation in the 2024 European election.",
    bandVotesTitle: "The divisions, one by one",
    bandDonorsTitle: "Many donors, little money",
    bandDonorsNote:
      "{n} people — {donorShare} of all donors — gave {amount} in {year}: {moneyShare} of every private euro declared.",
    bandSpendTitle: "Electoral spending, 2024 European elections",
    carried: "Carried",
    rejected: "Rejected",
    per100Donors: "Of every 100 donors",
    per100Euros: "Of every 100 euros",
    colRecordKicker: "Parliamentary record",
    colReportKicker: "Report",
    colReportTitle: "{donors} donors and a single cheque for {largest}",
    colReportBody:
      "The report does not publish donations one by one: it groups what was declared into three tranches and gives, per party, how many people are in each and what they add up to. That is where the shape of private money comes from, and the shape is what matters. A party can receive the same sum from thousands of people or from a handful, and the total alone does not say which happened. Where a top tranche holds a single donor, its total is that donation: the one case in which an individual figure can be read from the report without inventing anything.",
    colReportLink: "See the split by party",
    photoPending: "Photograph · awaiting licence",
    eyebrow: "Political transparency portal",
    titlePre: "Who pays them, and ",
    titleEmph: "how they vote",
    titlePost: ".",
    lead:
      "Tracking the public and private money Spanish parties receive, alongside the recorded votes of their officeholders on laws affecting trans and LGBTI people, sexual and reproductive health, and the right to housing.",
    statPublic: "Public money to parties",
    statPrivate: "Declared private donations",
    statPeople: "Serving officeholders",
    statVotes: "Votes tracked",
    stanceTitle: "How each group voted",
    stanceNote:
      "Each group's majority ballot, counted from the named votes. It reports the ballot as recorded, not an interpretation of intent: in a vote on amendments, a No can mean rejecting the amendment rather than opposing the law. Check the official record and the subject of each vote.",
    inFavourGroups: "Voted Yes",
    againstGroups: "Voted No",
    abstainGroups: "Abstained",
    newsTitle: "LGBTI, trans rights and housing in the news",
    newsNote:
      "Recent posts from a fixed list of outlets and organisations. Items marked as an organisation's own post are its own writing, and may cover its activities as much as rights news.",
    newsSourcesLink: "See the sources",
    exploreTitle: "Explore",
    exploreMoney: "How public money is split between parties, year by year.",
    explorePeople: "Every serving officeholder: pay, party and recorded vote.",
    exploreVotes: "The votes we track, broken down by group.",
    exploreMethod: "Sources, limits, and what this tool does not show.",
    linkFraming:
      "Money and votes are published together so they can be looked up, not because one explains the other. A public subsidy does not determine any particular vote.",
  },
  home: {
    perPartyColour: "Ordinary funding, in the party’s own colour",
    eyebrow: "State subsidies",
    titlePre: "Party money, ",
    titleEmph: "channel",
    titlePost: " by channel",
    channelTitle: "State subsidies to the parties",
    subtitle:
      "Three channels, each with its own official source: what the state hands them, what they declared spending on a campaign, and what they declared receiving from individuals. The money reaching their linked foundations has a section of its own.",
    intro:
      "The public money the State hands each party, pulled live from the National Subsidies Database. Filter by year and aid type to see the split.",
    totalLabel: "Total awarded (selection)",
    parties: "Parties",
    concessions: "Grants",
    updated: "Updated",
    year: "Year",
    reset: "Reset",
    distribution: "Breakdown by party",
    noResults: "No grants for this selection.",
    filterStatus: "{parties} parties · {grants} grants · {total} under the current filters",
    tableCaption:
      "What each party was granted under the current filters, by kind of grant, in euros: the figures each bar draws.",
    colParty: "Party",
    colTotal: "Total",
    colShare: "Share of total",
  },
  party: {
    switcherLabel: "Choose a formation",
    fichaKicker: "Party record",
    fichaIntro:
      "Four public registers on the same formation: what the state hands it, what it declared receiving from individuals, how its group voted in the divisions this site tracks, and what is on file about its officeholders in the judicial record. None of them explains the others.",
    howItVoted: "How the group voted",
    sharedGroup: "In a shared group · {group}",
    noRepresentation: "Not in the chamber",
    stanceNote:
      "A position is the majority of the group's own recorded ballots: counted, not attributed. Where a formation shares a group with others, this names it rather than handing it that group's majority: in the Grupo Plurinacional SUMAR, attributing the vote to Sumar and not to Izquierda Unida would be arbitrary. And where it had no seats in that legislature, this says that too.",
    totalReceived: "Total received",
    ofNational: "of the national total",
    facesTitle: "Faces of the party",
    whereFrom: "Where it comes from",
    ofItsFunds: "of its funds",
    yearlyEvolution: "Yearly evolution",
    privateTitle: "Private financing",
    donationsDeclared: "Declared donations",
    donors: "donors",
    privateCaveat:
      "Individuals only (company donations are banned). Annual figure from the latest available Court of Auditors report.",
    ledgerTitle: "Grant ledger",
    exercise: "Year",
    legalBasis: "legal basis (BOE) ↗",
    inNews: "In the news",
    recentHeadlines: "Recent headlines · Google News",
  },
  politician: {
    partyFunding: "Public funding of their party",
    seeBreakdown: "see breakdown →",
    caveat: "Public subsidies are granted to the party, not the individual.",
    onBluesky: "On Bluesky",
  },
  caras: {
    title: "Faces",
    intro:
      "Individual politicians: their party and public funding, their Bluesky activity and the headlines they appear in. Every Bluesky profile is verified one by one.",
    note:
      "This is a curated sample. Bluesky today skews left; PP and Vox leaders have no verifiable account there.",
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
  voteFlow: {
    tableCaption:
      "The formations in the chart, with what they declared in private donations in 2020 and how their group voted. Their declared total: {total}.",
    colFormation: "Formation",
    colDonations: "Declared donations, 2020",
    colVote: "Group's vote",
    title: "Declared money and recorded vote, side by side",
    sourceHead: "Declared private donations · 2020",
    outcomeHead: "Group’s vote",
    caveat:
      "The thickness of a ribbon is the amount declared, not a causal relation. The two registers are public, independent and from different years: nothing here asserts that one explains the other.",
    scope:
      "{included} formations — those with both declared donations in the report and a group of their own with a recorded vote in this division. Money source: {report}.",
    excluded:
      "Left out, for having no group of their own in this legislature or not appearing in the report:",
  },
  donationsTable: {
    barNote:
      "Each bar is scaled against the party that declared most — the PSOE — and not against the national total: at national scale thirteen of the seventeen rows would be under two pixels. A very small amount is drawn at a minimum width so it reads as non-zero.",
    title: "Declared private donations, 2020",
    caption:
      "One formation per row, ordered by declared amount. The bar splits each party's total across the report's three tranches and is scaled against the largest total, not against the national one.",
    rank: "No.",
    party: "Formation",
    byTranche: "Split by tranche",
    total: "Total",
    donors: "Donors",
    donorsWord: "donors",
    tranchesNote:
      "The report's tranches: under €1,000, €1,000–10,000, over €10,000.",
    trancheSmall: "Under €1,000",
    trancheMid: "€1,000–10,000",
    trancheLarge: "Over €10,000",
    legalNote:
      "Companies have not been able to donate to parties since the 2015 reform of LO 8/2007: natural persons only, capped at €50,000 a year, with no anonymous gifts. There is no per-politician funding figure, and this site does not compute one.",
  },
  spending: {
    barNote:
      "Each bar is scaled against the formation that declared most, so its length says how much was spent and its segments say on what. A very small amount is drawn at a minimum width so it reads as non-zero; the exact figure is in the columns.",
    eyebrow: "Electoral spending · 2024 European elections",
    sharesTotal: "Declared ordinary spending, in total",
    sharesNote:
      "Each bar is the formation's share of that total, so together they add up to 100%. A very small amount is drawn at a minimum width so it can be seen not to be zero.",
    sharesCaption:
      "Ordinary spending declared by each formation for the European elections of 9 June 2024.",
    linesTitle: "What it was declared to have bought",
    lineAdvertising: "Outdoor, press and radio advertising",
    lineAdvertisingNote:
      "The only two kinds of spending with a cap of their own: LOREG arts. 55 and 58.",
    lineResidual: "Residual line, not broken down in the report",
    lineResidualNote:
      "“Otros gastos ordinarios”. It is most of the spending, and the report does not say where it went.",
    lineFinancial: "Financial costs and other items",
    lineFinancialNote: "Settled and estimated interest on credit facilities.",
    lineMailings: "Mailings, accounted separately from ordinary spending",
    lineMailingsNote:
      "{count} mailings carrying a subsidy entitlement. They are outside ordinary spending and outside the general cap, so they have no share of that figure: the bar runs full width to say the denominator is a different one.",
    title: "What the electoral money was declared to have bought",
    intro:
      "The Tribunal de Cuentas audits each election's accounts and itemises the declared spending. Only two kinds of advertising carry a legal cap and appear broken out; the rest of ordinary spending is grouped into a single line the report does not break down.",
    unexplained: "Not broken down",
    ofDeclared: "of declared ordinary spending",
    advertising: "Advertising",
    cappedOnly:
      "Outdoor advertising (LOREG art. 55) and press and radio (art. 58). These are the only two expenses with a cap of their own.",
    mailings: "Propaganda mailings",
    mailingItems: "mailings carrying a subsidy entitlement",
    declared: "Declared",
    formation: "Formation",
    split: "Split",
    caption:
      "One formation per row, with its declared ordinary spending and how much of it is capped advertising against the residual line “Otros gastos ordinarios”. Propaganda mailings are accounted separately and are not in these columns.",
    gapTitle: "What the record does not say",
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
  contexto: {
    eyebrow: "The country",
    title: "Context",
    lead:
      "This site publishes what parties are paid and what officeholders earn. Neither figure means anything without a scale. This is that scale, taken from INE, which produces it.",
    framing:
      "Nothing here is joined up. There is no line from a poverty rate to a vote, no correlation, no ordering of parties by anything computed from these numbers. The figures sit next to each other and the reader does the joining: a line drawn here would assert something the data cannot carry.",
    wages: {
      title: "What Spain earns",
      intro:
        "Mean gross annual earnings were {mean}. The median — the figure with half of all employees below it — was {median}. The difference is the upper tail: the lowest-paid tenth did not reach {p10}, and the highest-paid tenth cleared {p90}.",
      lowSample: "small sample",
      sourceNote:
        "INE marks cells whose sample holds between 100 and 500 observations with a leading minus sign: those are not negative figures, they are figures with high variability. They are kept and marked; none shown here carries the mark.",
      jornada:
        "One caveat that changes how everything above should be read: EAES counts part-time and full-time workers in the same mean, so none of these figures is \u201cwhat a job pays\u201d. Full-time work averaged {full}; part-time work averaged {part}.",
      spread:
        "The best- and worst-paid sectors are a factor of {ratio} apart: {high} at {highValue} against {low} at {lowValue}.",
    },
    smi: {
      title: "The whole payroll, in multiples of the minimum wage",
      intro:
        "One axis for every salary on this site. {underTwo} of Spanish employees earn less than two minimum wages. The tranches are INE's own, computed against the minimum wage of the same year.",
      sourceNote:
        "The tranches account for all employees. They are drawn as separate rows rather than stacked because the top tranche is 0.12 % and would be invisible in a stack; every row prints its exact percentage.",
    },
    poverty: {
      title: "How many people it reaches",
      intro:
        "Four indicators from the Living Conditions Survey. Each is a share of a population, so the unfilled part of the bar is the rest of the country.",
      rows: {
        arope: "At risk of poverty or social exclusion (AROPE)",
        aropeChildren: "AROPE, under 16s",
        atRisk: "At risk of poverty (prior year's income)",
        deprivation: "In severe material and social deprivation",
      },
      spread:
        "The national figure describes no particular community: it runs from {high} in {highRegion} to {low} in {lowRegion}.",
      base: "{base} series, stated because the same table can hold more than one definition of the same indicator.",
      multipleBases:
        "The table holds more than one definition ({bases}). {shown} is shown here; they are not merged, because they measure different things under the same name.",
      note:
        "None of these figures is crossed with any vote or any funding figure on this site. They are here so a reader has both in front of them, not to claim that one explains the other.",
    },
  },
  where: {
    title: "And where do you live?",
    intro:
      "Almost everything on this site is published by comunidad autónoma. Enter your postcode or pick your province and you will see what is on record for yours.",
    postcodeLabel: "Postcode",
    postcodePlaceholder: "28001",
    submit: "Go",
    provinceLabel: "Or pick a province",
    provincePlaceholder: "Province…",
    notFound: "That postcode matches no province. Spanish postcodes are five digits.",
    privacy:
      "The postcode is resolved in your browser: its first two digits are the province code. It is not sent anywhere and it is not stored.",
    backHome: "← Front page",
    eyebrow: "Where you live",
    lead:
      "{province} is in {territory}. Everything below is measured for {territory}, not for {province}: these figures do not exist per province, and dividing them down would be inventing them.",
    leadSame:
      "{territory} is both a province and a comunidad autónoma, so everything below is measured for that same territory.",
    governmentTitle: "Who presides",
    president: "President",
    party: "Party",
    since: "Since",
    governmentNote:
      "This is who holds the presidency on the date checked — not the election result, and not the composition of the government.",
    noGovernment: "No presidency is on record for this territory.",
    investitureDecisive:
      "The PP held {pp} of {seats} seats, and the investiture carried with votes from Vox: without them there was no majority. Vox held {vox} seats.",
    investitureShort:
      "The PP held {pp} of {seats} seats, short of an absolute majority, and Vox held {vox}. This site records the arithmetic; the division record itself is not verified here.",
    officeholdersTitle: "Officeholders from here",
    officeholders:
      "The senior appointments register carries {count} officeholders in {territory}. Of those, {withSalary} publish an annual figure, and the median of what is published is {median}.",
    officeholdersGap:
      "{missing} of the register's {total} rows state no territory and are not in this count. They are not shared out between communities.",
    noFigure: "no figure",
    seeOfficeholders: "See these officeholders in the register →",
    wagesTitle: "What is earned here",
    wages:
      "In {territory} the median gross annual wage was {median}, against {national} across Spain. The lowest-paid tenth did not reach {p10} and the highest-paid tenth cleared {p90}.",
    noWages:
      "INE's earnings survey publishes no percentiles for {territory}: its regional tables cover the seventeen comunidades autónomas and not the two autonomous cities. The national figure is not substituted for it.",
    seeContext: "See wages across Spain →",
    povertyTitle: "At risk of poverty or exclusion",
    national: "Spain",
    povertyNote:
      "{base} series. It is a share of a population rather than a count, and it is not crossed with anything else on this site.",
    noPoverty: "The Living Conditions Survey publishes no figure for this territory.",
    hateTitle: "Recorded hate crime",
    hate:
      "{total} offences were recorded in {territory} in {year}, a rate of {rate} per 100,000 inhabitants against {national} across Spain. Recorded under sexual orientation and gender identity: {sogi}.",
    hateNote:
      "These are offences known to the police, not incidence: a higher rate can reflect more reporting rather than more crime.",
    noHate: "The report locates no recorded offence in this territory.",
    seeMap: "See the whole map →",
    closing:
      "Nothing on this page joins one figure to another. That {territory} has a given rate and that whoever presides over it voted a given way are two facts placed side by side, not an explanation.",
  },
  search: {
    label: "Search the site",
    placeholder: "Search…",
    submit: "Search",
    eyebrow: "Search",
    title: "Search",
    scope:
      "Searches names and titles: people in the senior appointments register along with their post and town, parties, linked foundations, comunidades, provinces, tracked divisions and the site's own sections. It does not search inside the text of the reports, so a word that appears only in a Tribunal de Cuentas finding will not turn up here.",
    count: "Results for “{query}”: {total}",
    more: "and {more} more",
    tooShort: "Type at least {min} letters.",
    empty: "No results for “{query}”.",
    emptyHint:
      "Try fewer words, or a surname rather than a full name. Accents do not matter. Something missing here does not mean it does not exist: this search looks only at names and titles.",
    kinds: {
      person: "Officeholders",
      party: "Parties",
      foundation: "Foundations and entities",
      territory: "Comunidades autónomas",
      province: "Provinces",
      vote: "Tracked divisions",
      page: "Sections",
    },
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
    faces: "Cares",
    salaries: "Sous",
    people: "Polítics",
    votes: "Votacions",
    methodology: "Metodologia",
    context: "Context",
    funding: "Finançament",
    rights: "Drets",
    map: "Mapa",
    foundations: "Fundacions",
    data: "Dades",
    sectionData: "Dades",
    sectionAbout: "Sobre",
    menu: "Menú",
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
    eyebrow: "Votacions nominals",
    title: "Votacions clau",
    intro:
      "Posicions registrades en votacions nominals del Congrés sobre assumptes concrets. Cada posició és un vot realment emès i verificable, no una opinió atribuïda.",
    caveat:
      "Cada votació s'etiqueta segons el seu tipus: unes aproven lleis, altres són proposicions no de Llei o mocions, que no són vinculants. S'exclouen les votacions d'esmenes. Un diputat apareix només si consta el seu vot; no es dedueix la postura de ningú a partir del seu partit.",
    searchLabel: "Cerca diputat",
    searchPlaceholder: "Cognom o nom…",
    inFavour: "A favor",
    against: "En contra",
    abstention: "Abstenció",
    noVote: "No vota",
    present: "Presents",
    byGroup: "Per grup parlamentari",
    group: "Grup",
    byGroupCaption: "Un grup per fila, amb els seus vots comptats i l'enllaç al finançament del partit quan el grup el forma un de sol.",
    distribution: "Repartiment",
    funding: "Finançament",
    severalParties: "Diversos partits",
    groupUnknown: "Grup no identificat al registre",
    groupNote:
      "Un grup parlamentari no és un partit. Quan el grup el forma un sol partit, l'última columna enllaça al finançament d'aquest partit; quan el formen diversos, no s'enllaça a cap, perquè atribuir els diners d'una coalició a un dels seus membres seria fals.",
    groupSource: "Composició dels grups ↗",
    officialRecord: "Acta oficial ↗",
    lawText: "Text de la llei ↗",
    session: "Sessió",
    noMatch: "Sense vots registrats per a aquesta cerca.",
    results: "diputats",
    kinds: {
      ley: "Votació final de llei",
      toma: "Presa en consideració",
      pnl: "Proposició no de Llei",
      mocion: "Moció conseqüència d'interpel·lació",
    },
    nonBinding: "no vinculant",
    legislature: "Legislatura",
  },
  salaries: {
    title: "Sous públics",
    intro:
      "Retribucions dels càrrecs públics en actiu, segons el Registre d'Alts Càrrecs i els portals de transparència. Cerca per nom, càrrec, municipi o comunitat.",
    search: "Cerca",
    searchPlaceholder: "Nom, càrrec, municipi…",
    party: "Partit",
    all: "Tots",
    role: "Càrrec",
    where: "Àmbit",
    annual: "Brut anual",
    people: "càrrecs",
    results: "resultats",
    noResults: "Sense resultats per a aquesta cerca.",
    prev: "Anterior",
    next: "Següent",
    page: "Pàgina",
    of: "de",
    median: "Mediana",
    sourceNote:
      "Fonts · Registre d'Alts Càrrecs / transparencia.gob.es; els diputats que el registre no recull, de les dades obertes del Congrés",
    caveat:
      "Retribució del càrrec, no patrimoni ni ingressos privats. Només càrrecs marcats com a actius a la font.",
  },
  map: {
    investitureTitle: "Investidura",
    investitureDecisive:
      "El PP tenia {pp} de {seats} escons i la majoria absoluta era {majority}. A la votació del {date} la investidura va sortir per {for} vots contra {against}, i {voxVotes} d’aquells vots els va posar Vox: sense ells no hi havia majoria.",
    investitureShort:
      "El PP tenia {pp} de {seats} escons i la majoria absoluta era {majority}, així que no hi arribava sol; els {vox} escons de Vox haurien bastat per cobrir la diferència. L’acta de la votació no està verificada aquí, i en segona volta n’hi ha prou amb la majoria simple, així que no s’afirma qui va investir ningú.",
    investitureCarried: "aprovada",
    investitureFailed: "rebutjada",
    hatchDecisive: "Investidura amb vots de Vox, segons l’acta",
    hatchShort: "El PP no arribava sol a la majoria absoluta",
    eyebrow: "Mapa territorial",
    title: "On manà cada partit, i què hi consta registrat",
    standfirst:
      "Passeu el cursor per veure la comunitat. Premeu per fixar-la al panell. Les dues capes es mostren per separat i cap no explica l'altra.",
    svgLabel: "Mapa de les comunitats autònomes",
    layerGov: "Govern autonòmic",
    layerGovNote:
      "El partit de qui presidia cada comunitat a la data de comprovació, amb la data en què va prendre possessió. No és el resultat de les eleccions ni la composició del govern: és qui ocupa la presidència.",
    layerHate: "Delictes d'odi registrats",
    layerHateNote:
      "Taxa de delictes, infraccions administratives i altres incidents d'odi per cada 100.000 habitants, 2024. Són fets coneguts per les forces de seguretat, no condemnes: la xifra depèn de quant es denuncia i de com registra cada policia el que es denuncia.",
    perHundredThousand: "per 100.000 hab.",
    panelKicker: "Fitxa territorial",
    rowPresident: "Presidència",
    rowParty: "Partit",
    rowSince: "Des de",
    rowRecorded: "Fets coneguts 2024",
    rowRate: "Taxa per 100.000 hab.",
    barSogi: "Orientació sexual i identitat de gènere",
    barRacism: "Racisme i xenofòbia",
    barsNote:
      "Dues de les dotze motivacions que distingeix l'informe, com a proporció dels fets coneguts d'aquella comunitat.",
    noData: "No consta",
    tableCaption:
      "Un territori per fila, amb les dues capes del mapa com a xifres. L'ordre segueix la capa activa: per partit a la de govern, per taxa a la de delictes d'odi.",
    tableCaptionSorted:
      "Un territori per fila, amb les dues capes del mapa com a xifres. Ordenat per la columna que heu triat; premeu una altra capçalera per canviar-ho.",
    sortHint: "Ordenar per {column}",
    colTerritory: "Territori",
    colRate: "Taxa / 100.000",
    sourcesTitle: "Fonts",
    tablesLabel: "taules",
    checkedLabel: "comprovat el",
    limits:
      "Els fets coneguts inclouen infraccions administratives i altres incidents, no només delictes, i no són condemnes. Les dues comunitats amb policia autonòmica pròpia —la Policia Foral de Navarra i l'Ertzaintza— encapçalen la taula de taxes, cosa que diu alguna cosa sobre com es registra i no necessàriament sobre on passa més. Un incident de l'informe no consta en cap territori, i per això les columnes d'aquí sumen un menys que la xifra estatal.",
    missingLayers:
      "El disseny d'aquesta secció preveia tres capes més: un índex de drets LGTBI, l'estat de les reformes de les lleis trans i el vot a les formacions que van votar en contra de les normes que aquest portal segueix. No hi són perquè encara no hi ha una font citable per comunitat per a cap de les tres. Tampoc no hi és l'ombrejat que marcaria les investidures que van dependre de Vox: cinc presidències del PP es van investir amb els seus vots el juliol del 2023 i Vox va sortir de tres d'aquells governs el juliol del 2024, així que un ombrejat fix seria fals per a part del període que semblaria descriure.",
  },
  court: {
    title: "Què consta al registre judicial",
    eyebrow: "Als tribunals",
    sourceLink: "Font",
    statusNone: "Sense resolucions",
    noneBody:
      "En aquest portal no consta cap resolució judicial ni acord de junta electoral referit a càrrecs d’aquesta formació en les matèries que se segueixen.",
    noneNote:
      "L’absència de registre no és una declaració sobre la conducta de ningú: només vol dir que no hi ha una resolució citable.",
    status: {
      archived: "Causa arxivada",
      "awaiting-trial": "Pendent de judici",
      "advertising-infringement": "Infracció de publicitat",
      "complaint-archived": "Querella arxivada",
      "none-on-record": "Sense resolucions",
    },
    records: {
      "menas-2021": {
        text: "El cartell dels «menas» de Vox a la campanya de l’Assemblea de Madrid del 2021. El jutjat va arxivar la causa per acte i l’Audiència Provincial ho va confirmar: «no existeix delicte d’odi ni delicte electoral».",
        note: "Hi van recórrer la Fiscalia, el PSOE, Podem, Esquerra Unida i Progresa. És un arxivament en fase d’instrucció, no una absolució: cap tribunal no va entrar en el fons.",
      },
      "herrero-valencia": {
        text: "La regidora de Vox a València Cecilia Herrero anirà a judici oral per delictes d’odi: una trentena de publicacions a X entre l’abril del 2020 i l’abril del 2024. La Fiscalia demana 3 anys de presó, multa de 12 mesos a 20 €/dia i inhabilitació.",
        note: "Acte d’obertura de judici oral, no sentència. La qualificació és alternativa: 510.1 a) amb 510.3, 510.5 i 510.6, o bé 510.2 a) amb els mateixos apartats.",
      },
      "jez-madrid-2023": {
        text: "La Junta Electoral de Zona de Madrid va ordenar retirar una lona del carrer Alcalá en «termini d’un dia», per propaganda contractada fora del període de campanya.",
        note: "LOREG art. 53 i Instrucció 3/2011 de la JEC. La junta es va declarar expressament no competent sobre el contingut i no va obrir expedient sancionador: és una infracció de calendari publicitari, i res més.",
      },
      "belarra-querella": {
        text: "La Sala Penal del Tribunal Suprem va arxivar la querella de Vox contra Ione Belarra per les seves paraules en un míting de Collado Villalba: l’art. 510 CP protegeix les minories socials, no els partits polítics.",
        note: "Ponent Sánchez Melgar; el recurs de súplica va ser rebutjat. El registre documenta una querella contra ella, mai una conducta seva.",
      },
    },
    policy:
      "Quatre resolucions verificades una a una, no un cens: el nombre de registres d’una formació no és comparable amb el d’una altra. Una causa arxivada s’etiqueta com a arxivada i mai com a absolució; una causa oberta, com a pendent de judici. D’això no se’n deriva cap puntuació ni classificació.",
  },
  masthead: {
    edition: "Edició nº 001",
    live: "Dades en directe · BDNS",
    place: "Madrid",
    sources: "Fonts: BDNS · Tribunal de Comptes · Congrés",
    navLabel: "Seccions",
  },
  footer: {
    source:
      "Siguiendo el Dinero · Dades obertes de la BDNS, el Tribunal de Comptes i el Congrés dels Diputats",
    caveat: "Els fets van un al costat de l’altre; no s’afirma cap causa",
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
  },
  common: {
    backToPanel: "← Tornar al tauler",
    backToFaces: "← Cares",
    nif: "NIF",
    caveat: "Què cal saber",
  },
  blocs: {
    derecha: "Dreta",
    izquierda: "Esquerra",
    nacionalista: "Nacionalista",
    regionalista: "Regionalista",
    otro: "Altre",
  },
  kinds: {
    ordinaria: "Finançament ordinari",
    seguridad: "Despeses de seguretat",
    otra: "Altra",
    all: "Totes",
  },
  fundingStats: {
    eyebrow: "Els tres canals del diner",
    subsidies: "Subvencions de l'Estat",
    subsidiesNote: "Total acumulat a la BDNS · actualitzat diàriament",
    donations: "Donacions privades 2020",
    donationsNote: "{donors} donants declarats",
    electoral: "Despesa electoral 2024",
    electoralNote: "Despesa ordinària declarada a les europees",
    capped: "Publicitat amb límit legal",
    cappedNote: "{amount} · LOREG arts. 55 i 58",
    residual: "Línia residual sense desglossar",
    residualNote: "{amount} en una sola partida",
  },
  foundationsPage: {
    eyebrow: "El canal que corre a l'inrevés",
    titlePre: "Qui paga les ",
    titleEmph: "fundacions",
    titlePost: " dels partits, i qui les governa",
    standfirst:
      "Als partits els està prohibit acceptar diners d'empreses; a les seves fundacions vinculades no. Però en les xifres auditades el diner d'empreses és la part petita, i gairebé nou de cada deu euros que entren els posa el mateix partit. Aquí hi ha les entitats, els seus comptes i els patronats que les dirigeixen.",
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
      "Des de la reforma de 2015, un partit no pot acceptar donacions de persones juríiques, ni donacions anònimes, ni més de 50.000 euros l'any d'una mateixa persona física, i ha de rebutjar els diners de qui tingui un contracte públic vigent. Les seves fundacions es regeixen per la disposició addicional setena: allà les persones juríiques sí que poden donar. Per damunt de 120.000 euros la donació s'ha d'elevar a document públic, tota donació d'una persona jurídica s'ha de comunicar al Tribunal de Comptes en tres mesos i la identitat del donant s'ha de publicar. No poden rebre diners d'organismes, entitats o empreses públiques.",
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
      "L'informe cobreix 2021 i 2022; no hi ha dades posteriors publicades. No diu qui són les persones juríiques que van donar: nomena la contrapart només quan els diners van arribar com a conveni de col·laboració. I la seva pròpia aritmètica falla en un punt, que s'assenyala a la fitxa corresponent.",
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
  rights: {
    eyebrow: "Veus de les organitzacions",
    titlePre: "El que publiquen les ",
    titleEmph: "entitats",
    titlePost: ", amb la seva pr\u00f2pia veu",
    intro:
      "La resta d'aquest web mira l'Estat: les seves subvencions, les seves auditories, les seves votacions registrades. Aquesta secci\u00f3 fa el contrari i recull el que publiquen les mateixes organitzacions de drets LGTBI, amb el seu nom davant de cada pe\u00e7a.",
    orgsTitle: "Publicat per les organitzacions",
    orgsNote:
      "Vuit organitzacions, cada una a trav\u00e9s del seu propi canal. Van primer perqu\u00e8 s\u00f3n font directa: parlen d'elles mateixes i de la seva feina, no de segona m\u00e0.",
    mediaTitle: "Cobertura als mitjans",
    mediaNote:
      "Mitjans que cobreixen aquests temes de manera continuada. Es mostren a part perqu\u00e8 quedi clar qu\u00e8 \u00e9s font directa i qu\u00e8 \u00e9s cobertura.",
    directoryTitle: "D'on surt tot aix\u00f2",
    directoryNote:
      "El registre complet de canals que llegeix aquesta secci\u00f3. S'enlla\u00e7a cada organitzaci\u00f3 per poder anar a la font i no nom\u00e9s al que va publicar aquesta quinzena.",
    kindOrg: "Organitzacions",
    kindMedia: "Mitjans",
    empty:
      "Cap canal ha retornat pe\u00e7es recents. No \u00e9s una afirmaci\u00f3 sobre l'actualitat: \u00e9s una fallada de lectura, i es corregeix sola quan els canals responen.",
    droppedNote: "Canals que no van respondre en aquesta c\u00e0rrega:",
    caveat:
      "Aquest web no edita, resumeix ni reescriu aquestes pe\u00e7es: mostra el titular, la data i l'enlla\u00e7 a l'original. Les imatges s\u00f3n les que publica cada canal i se serveixen a trav\u00e9s d'aquest lloc, no directament des del servidor de l'organitzaci\u00f3, per no exposar la IP de qui llegeix. L'ordre \u00e9s per data, amb les fonts en l'idioma de la p\u00e0gina primer.",
    methodLink: "Com es van triar aquests canals, i quins es van descartar \u2197",
    homeTitle: "Drets LGTBI, amb la veu de les organitzacions",
    homeCta: "Veure la secci\u00f3 de drets",
  },
  lead: {
    kicker: "Investigació · Despesa electoral",
    title: "Més de la meitat de la despesa electoral no està desglossada",
    standfirst:
      "Dels {declared} que vuit formacions van declarar com a despesa ordinària a les europees del 9 de juny del 2024, {residual} —el {share}— figuren en una sola línia residual que l'informe de fiscalització no desglossa. La publicitat, l'única partida amb límit legal, és el {ads}.",
    link: "Llegir el desglossament complet",
  },
  portal: {
    tickSubsidies: "Subvencions de l'Estat",
    tickSubsidiesNote: "BDNS · actualitzat diàriament",
    tickDonations: "Donacions privades",
    tickDonationsNote: "Exercici {year} · {donors} donants",
    tickSpending: "Despesa electoral",
    tickSpendingNote: "Europees del 2024 · {n} formacions",
    tickVotes: "Votacions seguides",
    tickVotesNote: "Votacions nominals del Congrés",
    tickPeople: "Càrrecs amb retribució",
    tickPeopleNote: "Registre d'Alts Càrrecs, només actius",
    tickLarge: "Donants de més de 10.000 €",
    tickLargeNote: "Entre tots van aportar {amount}",
    opinionKicker: "Les organitzacions parlen",
    opinionTitle: "Opinió i anàlisi",
    housingKicker: "Habitatge",
    housingTitle: "L’habitatge, a les notícies",
    housingNote:
      "El més recent de mitjans de diferent signe, de les ràdios i televisions públiques i de les organitzacions de llogateres i d’afectades per la hipoteca, cada peça amb el nom de qui la publica. Les organitzacions parlen amb la seva pròpia veu; els mitjans, com a cobertura.",
    opinionCta: "Directori d'organitzacions",
    bandTitle: "El pols de les dades",
    bandNote: "Tres registres públics, resumits",
    colVote: "Votació",
    colDate: "Data",
    colResult: "Resultat",
    bandVotesTable:
      "Cada votació seguida, de la més recent a la més antiga, amb els vots emesos tal com consten a l'acta.",
    colTranche: "Tram",
    colDonors: "Donants",
    colDonorShare: "% de donants",
    colAmount: "Import",
    colMoneyShare: "% dels diners",
    bandDonorsTable:
      "Donants i imports declarats el {year}, sumats en totes les formacions, per tram de l'informe.",
    colFormation: "Formació",
    colDeclared: "Declarat",
    colShare: "Part del total",
    bandSpendTable: "Despesa ordinària declarada per cada formació a les europees del 2024.",
    bandVotesTitle: "Les votacions, una a una",
    bandDonorsTitle: "Molts donants, pocs diners",
    bandDonorsNote:
      "{n} persones —el {donorShare} dels donants— van aportar {amount} el {year}: el {moneyShare} de tot el diner privat declarat.",
    bandSpendTitle: "Despesa electoral, europees del 2024",
    carried: "Aprovada",
    rejected: "Rebutjada",
    per100Donors: "De cada 100 donants",
    per100Euros: "De cada 100 euros",
    colRecordKicker: "Registre parlamentari",
    colReportKicker: "Reportatge",
    colReportTitle: "{donors} donants i un sol xec de {largest}",
    colReportBody:
      "L'informe no publica donació per donació: agrupa el que es va declarar en tres trams i dóna, per partit, quantes persones hi ha en cada un i quant sumen. D'aquí surt la forma del diner privat, que és el que importa. Un partit pot rebre el mateix de milers de persones que d'un grapat, i el total tot sol no diu quina de les dues coses ha passat. Quan un tram alt té un únic donant, el seu total és aquella donació: l'únic cas en què una xifra individual es pot llegir de l'informe sense inventar res.",
    colReportLink: "Veure el repartiment per partit",
    photoPending: "Fotografia · pendent de llicència",
    eyebrow: "Portal de transparència política",
    titlePre: "Qui els paga, i ",
    titleEmph: "com voten",
    titlePost: ".",
    lead:
      "Seguiment dels diners públics i privats que reben els partits espanyols, juntament amb el vot registrat dels seus càrrecs en les lleis que afecten les persones trans i LGBTI, la salut sexual i reproductiva, i el dret a l'habitatge.",
    statPublic: "Diners públics als partits",
    statPrivate: "Donacions privades declarades",
    statPeople: "Càrrecs públics en actiu",
    statVotes: "Votacions seguides",
    stanceTitle: "Com va votar cada grup",
    stanceNote:
      "Vot majoritari de cada grup, comptat a partir dels vots nominals. Indica el sentit del vot tal com consta a l'acta, no una interpretació: en votacions d'esmenes, un No pot significar rebutjar l'esmena i no oposar-se a la llei. Consulta l'acta oficial i l'assumpte de cada votació.",
    inFavourGroups: "Va votar Sí",
    againstGroups: "Va votar No",
    abstainGroups: "Es va abstenir",
    newsTitle: "Drets LGBTI, trans i habitatge a l'actualitat",
    newsNote:
      "Publicacions recents d'una llista fixa de mitjans i entitats. Les marcades com a publicació de l'entitat són els seus propis textos, i poden tractar tant de drets com de la seva activitat.",
    newsSourcesLink: "Veure les fonts",
    exploreTitle: "Explorar",
    exploreMoney: "El repartiment dels diners públics entre partits, any a any.",
    explorePeople: "Cada càrrec en actiu: sou, partit i vot registrat.",
    exploreVotes: "Les votacions seguides, amb desglossament per grup.",
    exploreMethod: "Fonts, límits i què no mostra aquesta eina.",
    linkFraming:
      "Els diners i els vots es publiquen junts per poder consultar-los, no perquè l'un expliqui l'altre. Una subvenció pública no determina un vot concret.",
  },
  home: {
    perPartyColour: "Finançament ordinari, en el color del partit",
    eyebrow: "Subvencions estatals",
    titlePre: "El diner dels ",
    titleEmph: "partits",
    titlePost: ", canal per canal",
    channelTitle: "Subvencions estatals als partits",
    subtitle:
      "Tres canals, cada un amb la seva font oficial: el que l’Estat els lliura, el que van declarar haver gastat en una campanya i el que van declarar rebre de particulars. El diner de les fundacions vinculades té la seva pròpia secció.",
    intro:
      "Els diners públics que l'Estat lliura a cada partit, extrets en directe de la Base de Dades Nacional de Subvencions. Filtra per any i per tipus d'ajut per veure el repartiment.",
    totalLabel: "Total concedit (selecció)",
    parties: "Partits",
    concessions: "Concessions",
    updated: "Actualitzat",
    year: "Exercici",
    reset: "Reset",
    distribution: "Repartiment per partit",
    noResults: "No hi ha concessions per a aquesta selecció.",
    filterStatus: "{parties} partits · {grants} concessions · {total} amb els filtres actuals",
    tableCaption:
      "El que s'ha concedit a cada partit amb els filtres actuals, per tipus d'ajuda, en euros: les xifres que dibuixa cada barra.",
    colParty: "Partit",
    colTotal: "Total",
    colShare: "Part del total",
  },
  party: {
    switcherLabel: "Triar formació",
    fichaKicker: "Fitxa de partit",
    fichaIntro:
      "Quatre registres públics sobre la mateixa formació: el que l'Estat li lliura, el que va declarar rebre de particulars, com va votar el seu grup en les votacions que aquest portal segueix i què consta dels seus càrrecs al registre judicial. Cap no explica els altres.",
    howItVoted: "Com va votar el grup",
    sharedGroup: "En grup compartit · {group}",
    noRepresentation: "Sense representació",
    stanceNote:
      "La posició és la majoria de les paperetes nominals del mateix grup: comptada, no atribuïda. Quan una formació comparteix grup amb altres es diu quin, en lloc d'assignar-li la majoria d'aquell grup: al Grup Plurinacional SUMAR, per exemple, atribuir-ne el vot a Sumar i no a Esquerra Unida seria arbitrari. I quan no tenia representació en aquella legislatura, també es diu.",
    totalReceived: "Total rebut",
    ofNational: "del total nacional",
    facesTitle: "Cares del partit",
    whereFrom: "D'on ve",
    ofItsFunds: "dels seus fons",
    yearlyEvolution: "Evolució anual",
    privateTitle: "Finançament privat",
    donationsDeclared: "Donacions declarades",
    donors: "donants",
    privateCaveat:
      "Només persones físiques (les donacions d'empreses estan prohibides). Dada anual de l'últim informe disponible del Tribunal de Comptes.",
    ledgerTitle: "Registre de concessions",
    exercise: "Exercici",
    legalBasis: "base legal (BOE) ↗",
    inNews: "A les notícies",
    recentHeadlines: "Titulars recents · Google News",
  },
  politician: {
    partyFunding: "Finançament públic del seu partit",
    seeBreakdown: "veure desglossament →",
    caveat: "Les subvencions públiques es concedeixen al partit, no a la persona.",
    onBluesky: "A Bluesky",
  },
  caras: {
    title: "Cares",
    intro:
      "Polítics individuals: el seu partit i finançament públic, la seva activitat a Bluesky i els titulars on apareixen. Els perfils de Bluesky estan verificats un a un.",
    note:
      "La llista és una mostra curada. Bluesky té, ara mateix, més presència de l'esquerra; líders del PP i Vox no hi tenen compte verificable.",
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
  voteFlow: {
    tableCaption:
      "Les formacions del gràfic, amb el que van declarar en donacions privades el 2020 i com va votar el seu grup. Total declarat per elles: {total}.",
    colFormation: "Formació",
    colDonations: "Donacions declarades, 2020",
    colVote: "Vot del grup",
    title: "Diner declarat i vot registrat, un al costat de l’altre",
    sourceHead: "Donacions privades declarades · 2020",
    outcomeHead: "Vot del grup",
    caveat:
      "El gruix del traç és la quantia declarada, no una relació causal. Els dos registres són públics, independents i d’anys diferents: res d’això afirma que l’un expliqui l’altre.",
    scope:
      "{included} formacions, les que tenen alhora donacions declarades a l’informe i un grup propi amb vot registrat en aquesta votació. Font del diner: {report}.",
    excluded:
      "En queden fora, per no tenir grup propi en aquesta legislatura o no constar a l’informe:",
  },
  donationsTable: {
    barNote:
      "Cada barra es compara amb la del partit que més va declarar —el PSOE—, no amb el total estatal: a escala estatal tretze de les disset files mesurarien menys de dos píxels. Un import molt petit es dibuixa amb una amplada mínima perquè es vegi que no és zero.",
    title: "Donacions privades declarades, 2020",
    caption:
      "Una formació per fila, ordenades per import declarat. La barra reparteix el total de cada partit entre els tres trams de l'informe i està escalada contra el total més alt, no contra el total estatal.",
    rank: "Núm.",
    party: "Formació",
    byTranche: "Repartiment per trams",
    total: "Total",
    donors: "Donants",
    donorsWord: "donants",
    tranchesNote:
      "Trams de l'informe: menys de 1.000 €, de 1.000 a 10.000 €, més de 10.000 €.",
    trancheSmall: "Menys de 1.000 €",
    trancheMid: "De 1.000 a 10.000 €",
    trancheLarge: "Més de 10.000 €",
    legalNote:
      "Les empreses no poden donar als partits des de la reforma del 2015 de la LO 8/2007: només persones físiques, amb un màxim de 50.000 € l'any i sense donacions anònimes. No existeix una xifra de finançament per polític, i aquesta web no la calcula.",
  },
  spending: {
    barNote:
      "Cada barra es compara amb la de la formació que més va declarar, així que la seva llargada diu quant va gastar i els seus trams en què. Un import molt petit es dibuixa amb una amplada mínima perquè es vegi que no és zero; la xifra exacta és a les columnes.",
    eyebrow: "Despesa electoral · europees del 2024",
    sharesTotal: "Despesa ordinària declarada, en total",
    sharesNote:
      "Cada barra és la part de la formació en aquest total, així que juntes sumen el 100 %. Un import molt petit es dibuixa amb una amplada mínima perquè es vegi que no és zero.",
    sharesCaption:
      "Despesa ordinària declarada per cada formació a les eleccions europees del 9 de juny de 2024.",
    linesTitle: "En què es va declarar gastat",
    lineAdvertising: "Publicitat exterior i a premsa i ràdio",
    lineAdvertisingNote:
      "Les dues úniques despeses amb límit legal propi: arts. 55 i 58 de la LOREG.",
    lineResidual: "Línia residual, sense desglossament a l'informe",
    lineResidualNote:
      "«Otros gastos ordinarios». És la major part de la despesa i l'informe no diu on va anar.",
    lineFinancial: "Costos financers i altres conceptes",
    lineFinancialNote: "Interessos liquidats i estimats de les operacions de crèdit.",
    lineMailings: "Enviaments postals, a part de la despesa ordinària",
    lineMailingsNote:
      "{count} enviaments amb dret a subvenció. No entren en la despesa ordinària ni en el límit general, així que no tenen percentatge d'aquella xifra: la barra va completa per dir que el denominador és un altre.",
    title: "En què es va declarar gastat el diner electoral",
    intro:
      "El Tribunal de Comptes fiscalitza els comptes de cada elecció i desglossa la despesa declarada. Només dos tipus de publicitat tenen límit legal i apareixen detallats; la resta de la despesa ordinària s'agrupa en una única línia que l'informe no desglossa.",
    unexplained: "Sense desglossar",
    ofDeclared: "de la despesa ordinària declarada",
    advertising: "Publicitat",
    cappedOnly:
      "Publicitat exterior (art. 55 LOREG) i a premsa i ràdio (art. 58). Són les dues úniques despeses amb límit propi.",
    mailings: "Trameses de propaganda",
    mailingItems: "trameses amb dret a subvenció",
    declared: "Declarat",
    formation: "Formació",
    split: "Repartiment",
    caption:
      "Una formació per fila, amb la despesa ordinària declarada i quina part correspon a publicitat amb límit legal davant la línia residual «Otros gastos ordinarios». Les trameses de propaganda es comptabilitzen a part i no entren en aquestes columnes.",
    gapTitle: "Què no diu el registre",
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
  contexto: {
    eyebrow: "El país",
    title: "Context",
    lead:
      "Aquest web publica el que cobren els partits i el que cobren els càrrecs públics. Cap d’aquestes xifres no significa res sense una escala. Aquesta és l’escala, presa de l’INE, que és qui la produeix.",
    framing:
      "Aquí no s’uneix res. No hi ha cap línia que vagi d’una taxa de pobresa a un vot, ni correlació, ni ordenació de partits per res calculat a partir d’aquestes dades. Les xifres es posen les unes al costat de les altres i qui llegeix en treu les conclusions: una línia traçada aquí afirmaria una cosa que les dades no sostenen.",
    wages: {
      title: "El que es cobra a Espanya",
      intro:
        "El salari brut mitjà anual va ser de {mean}. La mediana —la xifra que deixa la meitat dels assalariats per sota— va ser de {median}. La diferència és la cua alta: el 10 % pitjor pagat no va arribar a {p10} i el 10 % millor pagat va superar {p90}.",
      lowSample: "mostra reduïda",
      sourceNote:
        "L’INE marca amb un signe menys les cel·les la mostra de les quals té entre 100 i 500 observacions: no són xifres negatives, són xifres amb alta variabilitat. Es conserven i s’assenyalen; cap de les mostrades aquí no porta aquesta marca.",
      jornada:
        "Un advertiment que canvia com llegir tot l’anterior: l’EAES compta la jornada parcial i la completa en la mateixa mitjana, així que cap d’aquestes xifres no és «el que paga un lloc de treball». A jornada completa la mitjana va ser de {full}; a jornada parcial, de {part}.",
      spread:
        "Entre el sector més ben pagat i el pitjor pagat hi ha un factor de {ratio}: {high} amb {highValue} davant de {low} amb {lowValue}.",
    },
    smi: {
      title: "Tota la massa salarial, en múltiples del SMI",
      intro:
        "El mateix eix per a qualsevol sou d’aquest web. El {underTwo} dels assalariats espanyols cobra menys de dos salaris mínims. Els trams són els de l’INE, calculats sobre el SMI del mateix any.",
      sourceNote:
        "Els trams sumen el total d’assalariats. Es dibuixen en files separades i no apilats perquè el tram superior és el 0,12 % i apilat no es veuria; cada fila porta el seu percentatge exacte.",
    },
    poverty: {
      title: "A quanta gent afecta",
      intro:
        "Quatre indicadors de l’Enquesta de Condicions de Vida. Cadascun és una proporció d’una població, així que la part buida de la barra és la resta del país.",
      rows: {
        arope: "En risc de pobresa o exclusió social (AROPE)",
        aropeChildren: "AROPE, menors de 16 anys",
        atRisk: "En risc de pobresa (renda de l’any anterior)",
        deprivation: "Amb privació material i social severa",
      },
      spread:
        "La xifra estatal no descriu cap comunitat en concret: va de {high} a {highRegion} fins a {low} a {lowRegion}.",
      base: "Sèrie {base}, indicada perquè la mateixa taula pot contenir definicions diferents del mateix indicador.",
      multipleBases:
        "La taula conté més d’una definició ({bases}). Aquí es mostra {shown}; no es barregen, perquè mesuren coses diferents amb el mateix nom.",
      note:
        "Aquestes xifres no es creuen amb cap vot ni amb cap finançament d’aquest web. Són aquí perquè qui llegeix tingui les dues coses al davant, no per afirmar que l’una explica l’altra.",
    },
  },
  where: {
    title: "I vostè, on viu?",
    intro:
      "Gairebé tot el que hi ha en aquest web es publica per comunitat autònoma. Escrigui el seu codi postal o triï la seva província i veurà què consta de la seva.",
    postcodeLabel: "Codi postal",
    postcodePlaceholder: "08001",
    submit: "Veure",
    provinceLabel: "O triï província",
    provincePlaceholder: "Província…",
    notFound: "Aquest codi postal no correspon a cap província. En són cinc dígits.",
    privacy:
      "El codi postal es resol al seu navegador: les dues primeres xifres són el codi de província. No s’envia enlloc ni es desa.",
    backHome: "← Portada",
    eyebrow: "On viu vostè",
    lead:
      "{province} és a {territory}. Tot el que segueix està mesurat per a {territory}, no per a {province}: aquestes xifres no existeixen per província, i dividir-les seria inventar-les.",
    leadSame:
      "{territory} és alhora província i comunitat autònoma, així que tot el que segueix està mesurat per a aquest mateix territori.",
    governmentTitle: "Qui presideix",
    president: "Presidència",
    party: "Partit",
    since: "Des de",
    governmentNote:
      "És qui ocupa la presidència a la data de comprovació, no el resultat de les eleccions ni la composició del govern.",
    noGovernment: "No consta presidència per a aquest territori.",
    investitureDecisive:
      "El PP tenia {pp} de {seats} escons, i la investidura va tirar endavant amb vots de Vox: sense ells no hi havia majoria. Vox en tenia {vox}.",
    investitureShort:
      "El PP tenia {pp} de {seats} escons, menys de la majoria absoluta, i Vox {vox}. Aquest web recull l’aritmètica; l’acta de la votació no està verificada aquí.",
    officeholdersTitle: "Càrrecs públics d’aquí",
    officeholders:
      "El registre d’alts càrrecs recull {count} càrrecs a {territory}. D’aquests, {withSalary} publiquen retribució anual, i la mediana del que es publica és {median}.",
    officeholdersGap:
      "{missing} de les {total} files del registre no indiquen territori i no entren en aquest recompte. No es reparteixen entre comunitats.",
    noFigure: "cap xifra",
    seeOfficeholders: "Veure aquests càrrecs al registre →",
    wagesTitle: "El que es cobra aquí",
    wages:
      "A {territory} la mediana del salari brut anual va ser de {median}, davant de {national} al conjunt d’Espanya. El 10 % pitjor pagat no va arribar a {p10} i el 10 % millor pagat va superar {p90}.",
    noWages:
      "L’enquesta salarial de l’INE no publica percentils per a {territory}: les seves taules per comunitat cobreixen les disset comunitats autònomes i no les dues ciutats autònomes. No se substitueix per la xifra estatal.",
    seeContext: "Veure els salaris de tot Espanya →",
    povertyTitle: "Risc de pobresa o exclusió",
    national: "Espanya",
    povertyNote:
      "Sèrie {base}. És una proporció de la població, no un recompte, i no es creua amb res més d’aquest web.",
    noPoverty: "L’Enquesta de Condicions de Vida no publica aquest indicador per a aquest territori.",
    hateTitle: "Delictes d’odi registrats",
    hate:
      "A {territory} consten {total} fets coneguts el {year}, una taxa de {rate} per cada 100.000 habitants davant de {national} al conjunt d’Espanya. Registrats per orientació sexual i identitat de gènere: {sogi}.",
    hateNote:
      "Són fets coneguts per les forces de seguretat, no incidència: una taxa més alta pot reflectir més denúncia i no més delicte.",
    noHate: "L’informe no localitza fets coneguts en aquest territori.",
    seeMap: "Veure el mapa complet →",
    closing:
      "Res d’aquesta pàgina uneix una xifra amb una altra. Que {territory} tingui una taxa determinada i que qui la presideix votés d’una manera són dos fets posats l’un al costat de l’altre, no una explicació.",
  },
  search: {
    label: "Cercar al web",
    placeholder: "Cercar…",
    submit: "Cercar",
    eyebrow: "Cerca",
    title: "Cercar",
    scope:
      "Cerca noms i títols: persones del registre d’alts càrrecs amb el seu lloc i el seu municipi, partits, fundacions vinculades, comunitats, províncies, votacions seguides i seccions del web. No cerca dins del text dels informes, així que una paraula que només aparegui en una troballa del Tribunal de Comptes no hi sortirà.",
    count: "Resultats per a «{query}»: {total}",
    more: "i {more} més",
    tooShort: "Escrigui almenys {min} lletres.",
    empty: "No hi ha resultats per a «{query}».",
    emptyHint:
      "Provi amb menys paraules, o amb el cognom en lloc del nom complet. Els accents no hi fan res. Que una cosa no hi surti no vol dir que no existeixi: aquesta cerca només mira noms i títols.",
    kinds: {
      person: "Càrrecs públics",
      party: "Partits",
      foundation: "Fundacions i entitats",
      territory: "Comunitats autònomes",
      province: "Províncies",
      vote: "Votacions seguides",
      page: "Seccions",
    },
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
