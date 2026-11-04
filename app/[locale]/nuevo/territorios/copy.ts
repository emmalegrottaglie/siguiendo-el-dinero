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
};

export const COPY: Record<Locale, Copy> = { es, en, ca };
