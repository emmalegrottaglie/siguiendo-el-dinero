import type { Locale } from "@/lib/locales";
import type { CourtStatus } from "@/lib/court-records";

/**
 * Strings of CourtRecord.
 *
 * The status words and each record's text and note are the old court block's
 * (lib/i18n.ts, block `court`) word for word: they were checked against the
 * resolutions one by one and are not rephrased. `status` is keyed by the typed
 * status in lib/court-records.ts, so a new status cannot be added there
 * without a word for it here in all three languages.
 */
type RecordId = "menas-2021" | "herrero-valencia" | "jez-madrid-2023" | "belarra-querella";

const es = {
  status: {
    archived: "Causa archivada",
    "awaiting-trial": "Pendiente de juicio",
    "advertising-infringement": "Infracción de publicidad",
    "complaint-archived": "Querella archivada",
    "none-on-record": "Sin resoluciones",
  } as Record<CourtStatus, string>,
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
  } as Record<RecordId, { text: string; note: string }>,
  /** Screen-reader lead for the tag, so the status is announced as a status. */
  statusLabel: "Estado procesal",
  chainLabel: "Resoluciones, por orden",
  sourceLink: "Fuente",
  noneBody:
    "No consta en este portal ninguna resolución judicial ni acuerdo de junta electoral referido a cargos de esta formación en las materias que se siguen.",
  noneNote:
    "La ausencia de registro no es una declaración sobre la conducta de nadie: sólo significa que no hay una resolución citable.",
  policy:
    "Cuatro resoluciones verificadas una a una, no un censo: el número de registros de una formación no es comparable con el de otra. Una causa archivada se etiqueta como archivada y nunca como absolución; una causa abierta, como pendiente de juicio. De esto no se deriva ninguna puntuación ni clasificación.",
};
export type CourtCopy = typeof es;

const en: CourtCopy = {
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
  statusLabel: "Procedural stage",
  chainLabel: "Decisions, in order",
  sourceLink: "Source",
  noneBody:
    "This site holds no court resolution and no electoral-board order concerning officeholders of this formation in the matters it tracks.",
  noneNote:
    "An absence of records is not a statement about anyone's conduct: it means only that there is no citable resolution.",
  policy:
    "Four resolutions verified one by one, not a census: the number of records against one formation is not comparable with another’s. An archived case is labelled archived and never as an acquittal; an open case, as awaiting trial. No score or ranking is derived from any of it.",
};

const ca: CourtCopy = {
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
  statusLabel: "Fase processal",
  chainLabel: "Resolucions, per ordre",
  sourceLink: "Font",
  noneBody:
    "En aquest portal no consta cap resolució judicial ni acord de junta electoral referit a càrrecs d’aquesta formació en les matèries que se segueixen.",
  noneNote:
    "L’absència de registre no és una declaració sobre la conducta de ningú: només vol dir que no hi ha una resolució citable.",
  policy:
    "Quatre resolucions verificades una a una, no un cens: el nombre de registres d’una formació no és comparable amb el d’una altra. Una causa arxivada s’etiqueta com a arxivada i mai com a absolució; una causa oberta, com a pendent de judici. D’això no se’n deriva cap puntuació ni classificació.",
};

export const COURT_COPY: Record<Locale, CourtCopy> = { es, en, ca };
