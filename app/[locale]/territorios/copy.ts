import type { Locale } from "@/lib/locales";

const es = {
  title: "Territorios",
  intro:
    "Cada provincia, con quién la representa en el Congreso, lo que cobra según el registro público y lo que declara poseer, y las cifras de la comunidad autónoma en la que está.",
  /** `others` is the formatted list of the provinces with the fewest seats. */
  finding: (rows: string, seats: string, most: string, mostN: string, others: string, fewest: string, several: boolean) =>
    `Las ${rows} circunscripciones eligen a los ${seats} diputados del Congreso: ${most} elige ${mostN}; ${others}, ${fewest}${several ? " cada una" : ""}.`,
  source: "Fuente: Congreso de los Diputados, datos abiertos de la legislatura en curso.",
  mapTitle: "Mapa de las comunidades autónomas",
  mapDesc: "Cada comunidad lleva a sus provincias en la lista de abajo. El mapa no representa ninguna cifra.",
  mapLabel: (name: string, deputies: string) => `${name}: ${deputies}`,
  mapCaption: "Elige una comunidad para ir a sus provincias. Canarias, en el recuadro. Fuente del mapa:",
  deputy: ["diputado", "diputados"] as [string, string],
  province: ["provincia", "provincias"] as [string, string],
  provincesTitle: "Provincias por comunidad",
  provincesFinding: (provinces: string, noneRead: number, noneReadFmt: string) =>
    `En ${provinces} ya están transcritas las declaraciones de bienes de todos sus diputados, ${noneRead === 0 ? "y todas tienen ya al menos una" : `y en ${noneReadFmt} todavía no hay ninguna`}.`,
  dotsNote:
    "Un punto por diputado elegido en la provincia, según el estado de su declaración de bienes en esta web. Las declaraciones se leen del escaneo oficial y se comprueban antes de publicarse.",
  look: {
    securities: { label: "declaran acciones, bonos u otros valores", one: "declara acciones, bonos u otros valores" },
    transcribed: { label: "con la declaración transcrita, sin valores" },
    pending: { label: "con la declaración sin transcribir todavía" },
    none: { label: "sin declaración enlazada en su ficha" },
  } as Record<string, { label: string; one?: string }>,
  territoryMeta: (deputies: string, provinces: string) => `${deputies} en ${provinces} provincias`,
  unresolved: (list: string) =>
    `Sin provincia asignada, porque el nombre de la circunscripción no coincide con ninguna: ${list}.`,
  declSource:
    "Fuente: Congreso de los Diputados (datos abiertos y ficha de cada diputado); declaraciones de bienes transcritas por esta web.",
  allDeclarations: "Ver todas las declaraciones",
  registerTitle: "Cargos públicos en el registro, por comunidad",
  registerFinding: (top: string, count: string, unlocated: string, total: string) =>
    `El Registro de Altos Cargos sitúa más cargos en ${top} (${count}) que en ninguna otra comunidad, y no indica comunidad en ${unlocated} de sus ${total} filas.`,
  registerBody:
    "Es un recuento de las filas del registro, no del número de cargos que tiene cada comunidad: el registro no recoge igual los cargos de todas. Las filas sin comunidad no se reparten entre ellas.",
  caption: "Cargos del Registro de Altos Cargos por comunidad autónoma",
  colCommunity: "Comunidad",
  colPosts: "Cargos en el registro",
  colPaid: "Con sueldo publicado",
  colMedian: "Mediana del sueldo publicado",
  notPublished: "— no publicado",
  noCommunity: "Sin comunidad indicada",
  legendPaid: "Con sueldo publicado",
  legendUnpaid: "Sin sueldo publicado",
  legendNoCommunity: "Sin comunidad en el registro",
  sourceLabel: "Fuente:",
  updated: (date: string) => `, actualizado el ${date}`,
  registerSourceTail:
    ". Sueldo bruto anual. Los diputados del Congreso constan en el registro sin comunidad, y están en la página de cada provincia.",

  // ---- Who presides each comunidad (from the old /mapa government layer) ----
  govTitle: "Quién preside cada comunidad",
  govFinding: (party: string, count: string, total: string, date: string) =>
    `${party} ocupa la presidencia de ${count} de las ${total} comunidades y ciudades autónomas, según la lista comprobada el ${date}.`,
  govBody:
    "El partido de quien presidía cada comunidad en la fecha de comprobación, con la fecha en que tomó posesión. No es el resultado de las elecciones ni la composición del gobierno: es quién ocupa la presidencia.",
  govCaption: "Presidencia de cada comunidad y ciudad autónoma, con su partido, la fecha de toma de posesión y lo que consta de su investidura",
  colPresident: "Presidencia",
  colParty: "Partido",
  colSince: "Desde",
  colInvestiture: "Investidura",
  govInvestNote:
    "«—» en la columna de investidura quiere decir que no consta en el registro de esta web, que sólo recoge presidencias del PP; no quiere decir que no la hubiera.",
  wikiPrefix: "Wikipedia, ",
  checkedTail: (date: string) => `, comprobado el ${date}.`,

  // ---- Investitures (from the old /mapa investiture panel) ----
  investTitle: "Investiduras",
  investFinding: (count: string, decisive: string, short: string) =>
    `El registro de investiduras de esta web cubre ${count} comunidades con presidencia del PP. En ${decisive}, según el acta, la investidura salió con votos de Vox sin los que no había mayoría; en ${short}, sólo consta que el PP no llegaba solo a la mayoría absoluta.`,
  investBody:
    "Cada investidura es una votación con fecha, en una cámara de tamaño conocido. Aquí se separan dos cosas: la aritmética de escaños, que cualquiera puede rehacer, y el acta de la votación, sólo donde está verificada. No dicen lo mismo: si una investidura no alcanza la mayoría absoluta, en la segunda votación basta la mayoría simple, y las abstenciones pueden ser suficientes.",
  investGap:
    "El registro sólo recoge presidencias del PP: una comunidad que no aparece aquí no consta, y eso no es un hallazgo. Los votos en contra no están desglosados por partido.",

  // ---- Recorded hate crime (from the old /mapa hate-crime layer) ----
  hateTitle: "Delitos de odio registrados",
  hateFinding: (year: string, total: string, rate: string, lo: string, loName: string, hi: string, hiName: string) =>
    `En ${year} constan ${total} hechos de odio conocidos por las fuerzas de seguridad en toda España, ${rate} por cada 100.000 habitantes; por comunidad, la tasa va de ${lo} (${loName}) a ${hi} (${hiName}).`,
  hateBody:
    "Tasa de delitos, infracciones administrativas y otros incidentes de odio por cada 100.000 habitantes, 2024. Son hechos conocidos por las fuerzas de seguridad, no condenas: la cifra depende de cuánto se denuncia y de cómo registra cada policía lo que se denuncia.",
  rateListLabel: "Tasa por 100.000 habitantes, por comunidad, de mayor a menor",
  per100k: (rate: string) => `${rate} por 100.000 hab.`,
  nationalLine: (rate: string) => `España: ${rate} por 100.000 hab.`,
  hateTableSummary: (n: string) => `Las cifras de los ${n} territorios: hechos conocidos y dos motivaciones`,
  hateCaption: "Hechos de odio conocidos en cada territorio, con su tasa y dos de las motivaciones del informe",
  colTerritory: "Territorio",
  colRate: "Tasa / 100.000",
  colRecorded: (year: string) => `Hechos conocidos ${year}`,
  colSogi: "Orientación sexual e identidad de género",
  colRacism: "Racismo y xenofobia",
  barsNote:
    "Dos de las doce motivaciones que distingue el informe, con su proporción sobre los hechos conocidos de esa comunidad.",
  lessThanOne: "menos del 1 %",
  noTerritory: "Sin territorio en el informe",
  spain: "España",
  hateLimits:
    "Los hechos conocidos incluyen infracciones administrativas y otros incidentes, no sólo delitos, y no son condenas. Las dos comunidades con policía autonómica propia —la Policía Foral de Navarra y la Ertzaintza— encabezan la tabla de tasas, lo que dice algo sobre cómo se registra y no necesariamente sobre dónde ocurre más. Un incidente del informe no consta en ningún territorio y por eso las columnas de aquí suman uno menos que la cifra nacional.",
  hateNotJoined:
    "Quién preside una comunidad y los hechos de odio registrados en ella se muestran por separado, y ninguno explica al otro.",
  tablesTail: (tables: string) => `, tablas ${tables}.`,

  // ---- What this page does not show ----
  missingTitle: "Lo que no muestra",
  missingLayers:
    "El mapa territorial preveía tres capas más: un índice de derechos LGTBI, el estado de las reformas de las leyes trans y el voto a las formaciones que votaron en contra de las normas que este portal sigue. No están porque no hay todavía una fuente citable por comunidad para ninguna de las tres. Las investiduras sí están, pero marcan un hecho con fecha —cómo salió una votación concreta— y no quién se sienta hoy en un gobierno, que es lo que habría quedado desfasado: Vox salió de tres de esos gobiernos en julio de 2024.",
};
type Copy = typeof es;

const en: Copy = {
  title: "Territories",
  intro:
    "Each province, with who represents it in the Congress, what they are paid according to the public register and what they declare owning, and the figures for the autonomous community it sits in.",
  finding: (rows, seats, most, mostN, others, fewest, several) =>
    `The ${rows} constituencies elect the ${seats} deputies of the Congress: ${most} elects ${mostN}; ${others}, ${fewest}${several ? " each" : ""}.`,
  source: "Source: Congress of Deputies, open data for the current legislature.",
  mapTitle: "Map of the autonomous communities",
  mapDesc: "Each community leads to its provinces in the list below. The map does not represent any figure.",
  mapLabel: (name, deputies) => `${name}: ${deputies}`,
  mapCaption: "Choose a community to go to its provinces. The Canary Islands are in the inset. Map source:",
  deputy: ["deputy", "deputies"],
  province: ["province", "provinces"],
  provincesTitle: "Provinces by community",
  provincesFinding: (provinces, noneRead, noneReadFmt) =>
    `In ${provinces} the asset declarations of all their deputies are already transcribed, ${noneRead === 0 ? "and every province already has at least one" : `and in ${noneReadFmt} there is not yet any`}.`,
  dotsNote:
    "One dot per deputy elected in the province, by the state of their asset declaration on this site. The declarations are read from the official scan and checked before they are published.",
  look: {
    securities: { label: "declare shares, bonds or other securities", one: "declares shares, bonds or other securities" },
    transcribed: { label: "with the declaration transcribed, no securities" },
    pending: { label: "with the declaration not yet transcribed" },
    none: { label: "with no declaration linked on their profile" },
  },
  territoryMeta: (deputies, provinces) => `${deputies} in ${provinces} provinces`,
  unresolved: (list) =>
    `No province assigned, because the constituency name matches none: ${list}.`,
  declSource:
    "Source: Congress of Deputies (open data and each deputy's profile); asset declarations transcribed by this site.",
  allDeclarations: "See all declarations",
  registerTitle: "Public officeholders in the register, by community",
  registerFinding: (top, count, unlocated, total) =>
    `The Senior Appointments Register places more officeholders in ${top} (${count}) than in any other community, and states no community for ${unlocated} of its ${total} rows.`,
  registerBody:
    "This is a count of the register's rows, not of the number of posts each community has: the register does not cover every community's posts alike. Rows with no community are not shared out between them.",
  caption: "Senior Appointments Register posts by autonomous community",
  colCommunity: "Community",
  colPosts: "Posts in the register",
  colPaid: "With published salary",
  colMedian: "Median of published salary",
  notPublished: "— not published",
  noCommunity: "No community stated",
  legendPaid: "With published salary",
  legendUnpaid: "Without published salary",
  legendNoCommunity: "No community in the register",
  sourceLabel: "Source:",
  updated: (date) => `, updated on ${date}`,
  registerSourceTail:
    ". Gross annual salary. Deputies of the Congress are in the register with no community, and are on each province's page.",

  govTitle: "Who holds each presidency",
  govFinding: (party, count, total, date) =>
    `${party} holds the presidency of ${count} of the ${total} autonomous communities and cities, per the list checked on ${date}.`,
  govBody:
    "The party of whoever held each community's presidency on the date checked, with the date they took office. It is not the election result and not the composition of the government: it is who holds the presidency.",
  govCaption: "Presidency of each autonomous community and city, with its party, the date of taking office and what is on record about its investiture",
  colPresident: "President",
  colParty: "Party",
  colSince: "In office since",
  colInvestiture: "Investiture",
  govInvestNote:
    "“—” in the investiture column means it is not in this site's record, which covers PP presidencies only; it does not mean there was none.",
  wikiPrefix: "Wikipedia, ",
  checkedTail: (date) => `, checked ${date}.`,

  investTitle: "Investitures",
  investFinding: (count, decisive, short) =>
    `This site's investiture record covers ${count} communities with a PP presidency. In ${decisive}, per the record, the investiture carried with Vox votes without which there was no majority; in ${short}, all that is on record is that the PP could not reach an absolute majority alone.`,
  investBody:
    "Each investiture is a dated vote, in a chamber of known size. Two things are kept apart here: the seat arithmetic, which anyone can redo, and the record of the vote, only where it is verified. They do not say the same thing: if an investiture falls short of an absolute majority, a second vote needs only a simple majority, and abstentions can be enough.",
  investGap:
    "The record covers PP presidencies only: a community that does not appear here is not on record, and that is not a finding. Votes against are not broken down by party.",

  hateTitle: "Recorded hate crime",
  hateFinding: (year, total, rate, lo, loName, hi, hiName) =>
    `In ${year}, ${total} hate incidents were recorded by the security forces across Spain, ${rate} per 100,000 inhabitants; by community, the rate runs from ${lo} (${loName}) to ${hi} (${hiName}).`,
  hateBody:
    "Rate of hate offences, administrative infractions and other incidents per 100,000 inhabitants, 2024. These are facts recorded by the security forces, not convictions: the figure depends on how much is reported and on how each police force records what is reported.",
  rateListLabel: "Rate per 100,000 inhabitants, by community, highest first",
  per100k: (rate) => `${rate} per 100,000`,
  nationalLine: (rate) => `Spain: ${rate} per 100,000`,
  hateTableSummary: (n) => `The figures for the ${n} territories: recorded facts and two motivations`,
  hateCaption: "Hate incidents recorded in each territory, with the rate and two of the report's motivations",
  colTerritory: "Territory",
  colRate: "Rate / 100,000",
  colRecorded: (year) => `Recorded, ${year}`,
  colSogi: "Sexual orientation and gender identity",
  colRacism: "Racism and xenophobia",
  barsNote:
    "Two of the twelve motivations the report distinguishes, with their proportion of that community's recorded facts.",
  lessThanOne: "less than 1 %",
  noTerritory: "No territory in the report",
  spain: "Spain",
  hateLimits:
    "Recorded facts include administrative infractions and other incidents, not only offences, and they are not convictions. The two communities with their own regional police forces — the Policía Foral de Navarra and the Ertzaintza — head the rate table, which says something about how incidents are recorded and not necessarily about where more of them happen. One incident in the report is recorded in no territory at all, which is why the columns here sum to one less than the national figure.",
  hateNotJoined:
    "Who presides a community and the hate incidents recorded there are shown separately, and neither explains the other.",
  tablesTail: (tables) => `, tables ${tables}.`,

  missingTitle: "What this page does not show",
  missingLayers:
    "The territorial map was designed with three further layers: an LGBTI rights index, the state of trans-law reform, and vote share for the formations that voted against the measures this site tracks. They are absent because there is no citable per-community source for any of the three yet. The investitures are present, but they mark a dated fact — how one particular vote went — rather than who sits in a government today, which is the part that would have gone stale: Vox left three of those governments in July 2024.",
};

const ca: Copy = {
  title: "Territoris",
  intro:
    "Cada província, amb qui la representa al Congrés, què cobra segons el registre públic i què declara posseir, i les xifres de la comunitat autònoma on és.",
  finding: (rows, seats, most, mostN, others, fewest, several) =>
    `Les ${rows} circumscripcions elegeixen els ${seats} diputats del Congrés: ${most} n'elegeix ${mostN}; ${others}, ${fewest}${several ? " cadascuna" : ""}.`,
  source: "Font: Congrés dels Diputats, dades obertes de la legislatura en curs.",
  mapTitle: "Mapa de les comunitats autònomes",
  mapDesc: "Cada comunitat porta a les seves províncies a la llista de sota. El mapa no representa cap xifra.",
  mapLabel: (name, deputies) => `${name}: ${deputies}`,
  mapCaption: "Tria una comunitat per anar a les seves províncies. Canàries, al requadre. Font del mapa:",
  deputy: ["diputat", "diputats"],
  province: ["província", "províncies"],
  provincesTitle: "Províncies per comunitat",
  provincesFinding: (provinces, noneRead, noneReadFmt) =>
    `En ${provinces} ja estan transcrites les declaracions de béns de tots els seus diputats, ${noneRead === 0 ? "i totes ja en tenen almenys una" : `i en ${noneReadFmt} encara no n'hi ha cap`}.`,
  dotsNote:
    "Un punt per diputat elegit a la província, segons l'estat de la seva declaració de béns en aquest web. Les declaracions es llegeixen de l'escaneig oficial i es comproven abans de publicar-se.",
  look: {
    securities: { label: "declaren accions, bons o altres valors", one: "declara accions, bons o altres valors" },
    transcribed: { label: "amb la declaració transcrita, sense valors" },
    pending: { label: "amb la declaració encara sense transcriure" },
    none: { label: "sense declaració enllaçada a la seva fitxa" },
  },
  territoryMeta: (deputies, provinces) => `${deputies} en ${provinces} províncies`,
  unresolved: (list) =>
    `Sense província assignada, perquè el nom de la circumscripció no coincideix amb cap: ${list}.`,
  declSource:
    "Font: Congrés dels Diputats (dades obertes i fitxa de cada diputat); declaracions de béns transcrites per aquest web.",
  allDeclarations: "Veure totes les declaracions",
  registerTitle: "Càrrecs públics al registre, per comunitat",
  registerFinding: (top, count, unlocated, total) =>
    `El Registre d'Alts Càrrecs situa més càrrecs a ${top} (${count}) que en cap altra comunitat, i no indica comunitat en ${unlocated} de les seves ${total} files.`,
  registerBody:
    "És un recompte de les files del registre, no del nombre de càrrecs que té cada comunitat: el registre no recull igual els càrrecs de totes. Les files sense comunitat no es reparteixen entre elles.",
  caption: "Càrrecs del Registre d'Alts Càrrecs per comunitat autònoma",
  colCommunity: "Comunitat",
  colPosts: "Càrrecs al registre",
  colPaid: "Amb sou publicat",
  colMedian: "Mediana del sou publicat",
  notPublished: "— no publicat",
  noCommunity: "Sense comunitat indicada",
  legendPaid: "Amb sou publicat",
  legendUnpaid: "Sense sou publicat",
  legendNoCommunity: "Sense comunitat al registre",
  sourceLabel: "Font:",
  updated: (date) => `, actualitzat el ${date}`,
  registerSourceTail:
    ". Sou brut anual. Els diputats del Congrés consten al registre sense comunitat, i són a la pàgina de cada província.",

  govTitle: "Qui presideix cada comunitat",
  govFinding: (party, count, total, date) =>
    `${party} ocupa la presidència de ${count} de les ${total} comunitats i ciutats autònomes, segons la llista comprovada el ${date}.`,
  govBody:
    "El partit de qui presidia cada comunitat a la data de comprovació, amb la data en què va prendre possessió. No és el resultat de les eleccions ni la composició del govern: és qui ocupa la presidència.",
  govCaption: "Presidència de cada comunitat i ciutat autònoma, amb el seu partit, la data de presa de possessió i el que consta de la seva investidura",
  colPresident: "Presidència",
  colParty: "Partit",
  colSince: "Des de",
  colInvestiture: "Investidura",
  govInvestNote:
    "«—» a la columna d'investidura vol dir que no consta al registre d'aquest web, que només recull presidències del PP; no vol dir que no n'hi hagués.",
  wikiPrefix: "Wikipedia, ",
  checkedTail: (date) => `, comprovat el ${date}.`,

  investTitle: "Investidures",
  investFinding: (count, decisive, short) =>
    `El registre d'investidures d'aquest web cobreix ${count} comunitats amb presidència del PP. En ${decisive}, segons l'acta, la investidura va sortir amb vots de Vox sense els quals no hi havia majoria; en ${short}, només consta que el PP no arribava sol a la majoria absoluta.`,
  investBody:
    "Cada investidura és una votació amb data, en una cambra de mida coneguda. Aquí se separen dues coses: l'aritmètica d'escons, que qualsevol pot refer, i l'acta de la votació, només on està verificada. No diuen el mateix: si una investidura no arriba a la majoria absoluta, a la segona votació n'hi ha prou amb la majoria simple, i les abstencions poden ser suficients.",
  investGap:
    "El registre només recull presidències del PP: una comunitat que no apareix aquí no hi consta, i això no és una troballa. Els vots en contra no estan desglossats per partit.",

  hateTitle: "Delictes d'odi registrats",
  hateFinding: (year, total, rate, lo, loName, hi, hiName) =>
    `El ${year} consten ${total} fets d'odi coneguts per les forces de seguretat a tot Espanya, ${rate} per cada 100.000 habitants; per comunitat, la taxa va de ${lo} (${loName}) a ${hi} (${hiName}).`,
  hateBody:
    "Taxa de delictes, infraccions administratives i altres incidents d'odi per cada 100.000 habitants, 2024. Són fets coneguts per les forces de seguretat, no condemnes: la xifra depèn de quant es denuncia i de com registra cada policia el que es denuncia.",
  rateListLabel: "Taxa per 100.000 habitants, per comunitat, de més a menys",
  per100k: (rate) => `${rate} per 100.000 hab.`,
  nationalLine: (rate) => `Espanya: ${rate} per 100.000 hab.`,
  hateTableSummary: (n) => `Les xifres dels ${n} territoris: fets coneguts i dues motivacions`,
  hateCaption: "Fets d'odi coneguts a cada territori, amb la taxa i dues de les motivacions de l'informe",
  colTerritory: "Territori",
  colRate: "Taxa / 100.000",
  colRecorded: (year) => `Fets coneguts ${year}`,
  colSogi: "Orientació sexual i identitat de gènere",
  colRacism: "Racisme i xenofòbia",
  barsNote:
    "Dues de les dotze motivacions que distingeix l'informe, amb la seva proporció sobre els fets coneguts d'aquella comunitat.",
  lessThanOne: "menys de l'1 %",
  noTerritory: "Sense territori a l'informe",
  spain: "Espanya",
  hateLimits:
    "Els fets coneguts inclouen infraccions administratives i altres incidents, no només delictes, i no són condemnes. Les dues comunitats amb policia autonòmica pròpia —la Policia Foral de Navarra i l'Ertzaintza— encapçalen la taula de taxes, cosa que diu alguna cosa sobre com es registra i no necessàriament sobre on passa més. Un incident de l'informe no consta en cap territori, i per això les columnes d'aquí sumen un menys que la xifra estatal.",
  hateNotJoined:
    "Qui presideix una comunitat i els fets d'odi registrats en ella es mostren per separat, i cap no explica l'altre.",
  tablesTail: (tables) => `, taules ${tables}.`,

  missingTitle: "El que no mostra",
  missingLayers:
    "El mapa territorial preveia tres capes més: un índex de drets LGTBI, l'estat de les reformes de les lleis trans i el vot a les formacions que van votar en contra de les normes que aquest portal segueix. No hi són perquè encara no hi ha una font citable per comunitat per a cap de les tres. Les investidures sí que hi són, però marquen un fet amb data —com va sortir una votació concreta— i no qui seu avui en un govern, que és el que hauria quedat desfasat: Vox va sortir de tres d'aquells governs el juliol del 2024.",
};

export const COPY: Record<Locale, Copy> = { es, en, ca };
