import type { Locale } from "@/lib/locales";

const es = {
  metaTitle: "Temas: cómo votó el Congreso",
  title: "Temas",
  intro:
    "Cómo votó el Congreso en los asuntos que sigue esta web: derechos de las personas trans y LGTBI, aborto y salud sexual, y vivienda. Cada voto es uno emitido y publicado en el acta oficial, no una postura atribuida.",
  linesTitle: "Una línea por tema",
  finding: (n: number, span: string, law: string, gap: number) =>
    `De las ${n} votaciones que sigue esta web ${span}, la más ajustada fue «${law}», con ${gap} ${gap === 1 ? "voto" : "votos"} de diferencia entre el sí y el no.`,
  topicMeta: (n: number, binding: number) =>
    `${n === 1 ? "1 votación" : `${n} votaciones`}, ${binding === 0 ? "ninguna" : binding} con efecto legal`,
  noLegalEffect: ", sin efecto legal",
  groupsLink: "Cómo votó cada grupo",
  legendNote:
    "Una estación por votación, de la más antigua a la más reciente; todas constan en acta, por eso la línea es continua. El resultado no dice si la votación salió adelante: una ley orgánica necesita la mayoría absoluta del Congreso.",
  sourceLabel: "Fuente: ",
  sourceTail: ". Cada votación enlaza a su acta en su tema.",
  deputyTitle: "Cómo votó un diputado",
  deputyIntro: (n: number) =>
    `Busca por apellido o nombre para ver su voto en las ${n} votaciones, tal como consta en cada acta.`,
};
type Copy = typeof es;

const en: Copy = {
  metaTitle: "Topics: how the Congreso voted",
  title: "Topics",
  intro:
    "How the Congreso voted on the matters this site follows: trans and LGBTI rights, abortion and sexual health, and housing. Each vote is one cast and published in the official record, not an attributed stance.",
  linesTitle: "One line per topic",
  finding: (n, span, law, gap) =>
    `Of the ${n} divisions this site follows ${span}, the closest was “${law}”, with a gap of ${gap} ${gap === 1 ? "vote" : "votes"} between yes and no.`,
  topicMeta: (n, binding) =>
    `${n === 1 ? "1 division" : `${n} divisions`}, ${binding === 0 ? "none" : binding} with legal effect`,
  noLegalEffect: ", no legal effect",
  groupsLink: "How each group voted",
  legendNote:
    "One station per division, from the oldest to the most recent; all are on the record, which is why the line is continuous. The result does not say whether the division passed: an organic law needs an absolute majority of the Congreso.",
  sourceLabel: "Source: ",
  sourceTail: ". Each division links to its record under its topic.",
  deputyTitle: "How a deputy voted",
  deputyIntro: (n) =>
    `Search by surname or name to see their vote in the ${n} divisions, as it appears in each record.`,
};

const ca: Copy = {
  metaTitle: "Temes: com va votar el Congrés",
  title: "Temes",
  intro:
    "Com va votar el Congrés en els assumptes que segueix aquest web: drets de les persones trans i LGBTI, avortament i salut sexual, i habitatge. Cada vot és un vot emès i publicat a l'acta oficial, no una postura atribuïda.",
  linesTitle: "Una línia per tema",
  finding: (n, span, law, gap) =>
    `De les ${n} votacions que segueix aquest web ${span}, la més ajustada va ser «${law}», amb ${gap} ${gap === 1 ? "vot" : "vots"} de diferència entre el sí i el no.`,
  topicMeta: (n, binding) =>
    `${n === 1 ? "1 votació" : `${n} votacions`}, ${binding === 0 ? "cap" : binding} amb efecte legal`,
  noLegalEffect: ", sense efecte legal",
  groupsLink: "Com va votar cada grup",
  legendNote:
    "Una estació per votació, de la més antiga a la més recent; totes consten a l'acta, per això la línia és contínua. El resultat no diu si la votació va tirar endavant: una llei orgànica necessita la majoria absoluta del Congrés.",
  sourceLabel: "Font: ",
  sourceTail: ". Cada votació enllaça a la seva acta al seu tema.",
  deputyTitle: "Com va votar un diputat",
  deputyIntro: (n) =>
    `Cerca per cognom o nom per veure el seu vot en les ${n} votacions, tal com consta a cada acta.`,
};

export const COPY: Record<Locale, Copy> = { es, en, ca };
