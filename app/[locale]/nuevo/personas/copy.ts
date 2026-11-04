import type { Locale } from "@/lib/locales";

const es = {
  metaTitle: "Personas",
  title: "Personas",
  intro:
    "Todas las personas de las que este sitio tiene algún registro: los diputados en activo y los cargos públicos del Registro de Altos Cargos. De cada una se dice qué consta y qué no.",
  finding: (people: string, deputies: string, declared: string, boards: string) =>
    `El sitio tiene registro de ${people} personas. ${deputies} son diputados en activo, y de ${declared} de ellos está transcrita su declaración de bienes. ${boards} aparecen además en el patronato de una fundación de partido.`,
  searchLabel: "Busca por nombre, cargo o lugar",
  searchPlaceholder: "Nombre, cargo o lugar",
  searchButton: "Buscar",
  filterParty: "Partido",
  allParties: "Todos",
  filterKind: "Quién",
  kinds: { all: "Todas", deputies: "Diputados en activo", others: "Otros cargos", declarations: "Bienes declarados" },
  stations: {
    votes: "Votos",
    declaration: "Declaración",
    pay: "Sueldo",
    board: "Patronato",
  },
  legendTitle: "Qué consta de cada persona",
  legend:
    "Cada fila es una línea con cuatro estaciones. Una estación llena es un registro que consta; una hueca, uno que no consta o que todavía no está transcrito. No consta no significa que no exista.",
  legendItems: {
    votes: "Votos: aparece en las votaciones nominales del Congreso que recoge el sitio.",
    declaration: "Declaración: su declaración de bienes y rentas está transcrita y comprobada.",
    pay: "Sueldo: el Registro de Altos Cargos publica su retribución.",
    board: "Patronato: consta en el patronato de una fundación de partido.",
  },
  srOn: (what: string) => `${what}: consta`,
  srOff: (what: string) => `${what}: no consta`,
  count: (from: string, to: string, total: string) => `${from}–${to} de ${total}`,
  none: "Ninguna persona coincide con la búsqueda.",
  page: (n: string, of: string) => `Página ${n} de ${of}`,
  prev: "Anterior",
  next: "Siguiente",
  pagesLabel: "Páginas",
  deputy: "Diputado",
  deputyF: "Diputada",
  sourceNote:
    "Fuentes: el Registro de Altos Cargos (cargos y retribuciones), la lista de diputados y las votaciones del Congreso de los Diputados, y los patronatos publicados por las fundaciones.",
  oldDirectory: "El directorio del sitio actual",
};

type Copy = typeof es;

const en: Copy = {
  metaTitle: "People",
  title: "People",
  intro:
    "Everyone this site holds any record of: the sitting deputies and the public officeholders in the Register of Senior Officials. For each person it says what is on record and what is not.",
  finding: (people, deputies, declared, boards) =>
    `The site holds records of ${people} people. ${deputies} are sitting deputies, and for ${declared} of them the asset declaration is transcribed. ${boards} also appear on the board of a party foundation.`,
  searchLabel: "Search by name, post or place",
  searchPlaceholder: "Name, post or place",
  searchButton: "Search",
  filterParty: "Party",
  allParties: "All",
  filterKind: "Who",
  kinds: { all: "Everyone", deputies: "Sitting deputies", others: "Other posts", declarations: "Declared assets" },
  stations: {
    votes: "Votes",
    declaration: "Declaration",
    pay: "Salary",
    board: "Board",
  },
  legendTitle: "What is on record for each person",
  legend:
    "Each row is a line with four stations. A filled station is a record that exists; a hollow one is a record that is not on file or not yet transcribed. Not on record does not mean it does not exist.",
  legendItems: {
    votes: "Votes: appears in the Congreso roll-call divisions this site holds.",
    declaration: "Declaration: their asset and income declaration is transcribed and checked.",
    pay: "Salary: the Register of Senior Officials publishes their pay.",
    board: "Board: listed on the board of a party foundation.",
  },
  srOn: (what) => `${what}: on record`,
  srOff: (what) => `${what}: not on record`,
  count: (from, to, total) => `${from}–${to} of ${total}`,
  none: "Nobody matches the search.",
  page: (n, of) => `Page ${n} of ${of}`,
  prev: "Previous",
  next: "Next",
  pagesLabel: "Pages",
  deputy: "Deputy",
  deputyF: "Deputy",
  sourceNote:
    "Sources: the Register of Senior Officials (posts and pay), the Congress of Deputies' list of deputies and roll-call divisions, and the boards the foundations publish.",
  oldDirectory: "The current site's directory",
};

const ca: Copy = {
  metaTitle: "Persones",
  title: "Persones",
  intro:
    "Totes les persones de les quals aquest web té algun registre: els diputats en actiu i els càrrecs públics del Registre d'Alts Càrrecs. De cadascuna es diu què hi consta i què no.",
  finding: (people, deputies, declared, boards) =>
    `El web té registre de ${people} persones. ${deputies} són diputats en actiu, i de ${declared} d'ells hi ha transcrita la declaració de béns. ${boards} apareixen a més en el patronat d'una fundació de partit.`,
  searchLabel: "Cerca per nom, càrrec o lloc",
  searchPlaceholder: "Nom, càrrec o lloc",
  searchButton: "Cerca",
  filterParty: "Partit",
  allParties: "Tots",
  filterKind: "Qui",
  kinds: { all: "Totes", deputies: "Diputats en actiu", others: "Altres càrrecs", declarations: "Béns declarats" },
  stations: {
    votes: "Vots",
    declaration: "Declaració",
    pay: "Sou",
    board: "Patronat",
  },
  legendTitle: "Què hi consta de cada persona",
  legend:
    "Cada fila és una línia amb quatre estacions. Una estació plena és un registre que hi consta; una de buida, un que no hi consta o que encara no està transcrit. Que no hi consti no vol dir que no existeixi.",
  legendItems: {
    votes: "Vots: apareix a les votacions nominals del Congrés que recull el web.",
    declaration: "Declaració: la seva declaració de béns i rendes està transcrita i comprovada.",
    pay: "Sou: el Registre d'Alts Càrrecs publica la seva retribució.",
    board: "Patronat: consta en el patronat d'una fundació de partit.",
  },
  srOn: (what) => `${what}: hi consta`,
  srOff: (what) => `${what}: no hi consta`,
  count: (from, to, total) => `${from}–${to} de ${total}`,
  none: "Cap persona no coincideix amb la cerca.",
  page: (n, of) => `Pàgina ${n} de ${of}`,
  prev: "Anterior",
  next: "Següent",
  pagesLabel: "Pàgines",
  deputy: "Diputat",
  deputyF: "Diputada",
  sourceNote:
    "Fonts: el Registre d'Alts Càrrecs (càrrecs i retribucions), la llista de diputats i les votacions del Congrés dels Diputats, i els patronats que publiquen les fundacions.",
  oldDirectory: "El directori del web actual",
};

export const COPY: Record<Locale, Copy> = { es, en, ca };
