import type { Locale } from "@/lib/locales";

const es = {
  metaTitle: "Buscar",
  title: "Buscar",
  intro:
    "Una sola búsqueda sobre todo lo que publica el sitio: personas, partidos, fundaciones, comunidades, provincias, votaciones y secciones.",
  searchLabel: "Busca una persona, un partido o una provincia",
  searchPlaceholder: "Nombre, partido o provincia",
  searchButton: "Buscar",
  count: (total: string, query: string) => `${total} resultados para «${query}».`,
  countOne: (query: string) => `1 resultado para «${query}».`,
  more: (more: string) => `y ${more} más`,
  moreInPeople: "Ver todas las personas que coinciden en el directorio",
  tooShort: (min: string) => `Escriba al menos ${min} letras.`,
  empty: (query: string) => `No hay resultados para «${query}».`,
  emptyHint:
    "Pruebe con menos palabras, o con el apellido en lugar del nombre completo. Los acentos no importan. Que algo no salga aquí no significa que no exista: esta búsqueda sólo mira nombres y títulos.",
  gapsTitle: "Lo que esta búsqueda no mira",
  scope:
    "Busca nombres y títulos: personas del registro de altos cargos con su puesto y su municipio, partidos, fundaciones vinculadas, comunidades, provincias, votaciones seguidas y secciones de la web. No busca dentro del texto de los informes, así que una palabra que sólo aparezca en un hallazgo del Tribunal de Cuentas no saldrá aquí.",
  kinds: {
    person: "Cargos públicos",
    party: "Partidos",
    foundation: "Fundaciones y entidades",
    territory: "Comunidades autónomas",
    province: "Provincias",
    vote: "Votaciones seguidas",
    page: "Secciones",
  },
};
type Copy = typeof es;

const en: Copy = {
  metaTitle: "Search",
  title: "Search",
  intro:
    "One search across everything the site publishes: people, parties, foundations, comunidades, provinces, divisions and sections.",
  searchLabel: "Search for a person, a party or a province",
  searchPlaceholder: "Name, party or province",
  searchButton: "Search",
  count: (total, query) => `${total} results for “${query}”.`,
  countOne: (query) => `1 result for “${query}”.`,
  more: (more) => `and ${more} more`,
  moreInPeople: "See every matching person in the directory",
  tooShort: (min) => `Type at least ${min} letters.`,
  empty: (query) => `No results for “${query}”.`,
  emptyHint:
    "Try fewer words, or a surname rather than a full name. Accents do not matter. Something missing here does not mean it does not exist: this search looks only at names and titles.",
  gapsTitle: "What this search does not look at",
  scope:
    "Searches names and titles: people in the senior appointments register along with their post and town, parties, linked foundations, comunidades, provinces, tracked divisions and the site's own sections. It does not search inside the text of the reports, so a word that appears only in a Tribunal de Cuentas finding will not turn up here.",
  kinds: {
    person: "Officeholders",
    party: "Parties",
    foundation: "Foundations and entities",
    territory: "Comunidades autónomas",
    province: "Provinces",
    vote: "Tracked divisions",
    page: "Sections",
  },
};

const ca: Copy = {
  metaTitle: "Cercar",
  title: "Cercar",
  intro:
    "Una sola cerca sobre tot el que publica el lloc: persones, partits, fundacions, comunitats, províncies, votacions i seccions.",
  searchLabel: "Cerca una persona, un partit o una província",
  searchPlaceholder: "Nom, partit o província",
  searchButton: "Cercar",
  count: (total, query) => `${total} resultats per a «${query}».`,
  countOne: (query) => `1 resultat per a «${query}».`,
  more: (more) => `i ${more} més`,
  moreInPeople: "Vegeu totes les persones que coincideixen al directori",
  tooShort: (min) => `Escrigui almenys ${min} lletres.`,
  empty: (query) => `No hi ha resultats per a «${query}».`,
  emptyHint:
    "Provi amb menys paraules, o amb el cognom en lloc del nom complet. Els accents no hi fan res. Que una cosa no hi surti no vol dir que no existeixi: aquesta cerca només mira noms i títols.",
  gapsTitle: "El que aquesta cerca no mira",
  scope:
    "Cerca noms i títols: persones del registre d’alts càrrecs amb el seu lloc i el seu municipi, partits, fundacions vinculades, comunitats, províncies, votacions seguides i seccions del web. No cerca dins del text dels informes, així que una paraula que només aparegui en una troballa del Tribunal de Comptes no hi sortirà.",
  kinds: {
    person: "Càrrecs públics",
    party: "Partits",
    foundation: "Fundacions i entitats",
    territory: "Comunitats autònomes",
    province: "Províncies",
    vote: "Votacions seguides",
    page: "Seccions",
  },
};

export const COPY: Record<Locale, Copy> = { es, en, ca };
