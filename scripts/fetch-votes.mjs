// Fetch the pinned roll-call votes from the Congreso de los Diputados open-data
// portal and write data/votes.json.
//
// Usage: node scripts/fetch-votes.mjs
//
// Every vote published by the app is listed by hand in KEY_VOTES below, with the
// tally observed on the official record. The fetcher refuses to publish a vote
// whose tally does not match, which catches picking up the wrong ballot.
//
// Nothing here infers a position. A person has a stance on an item only if their
// name appears in that item's roll call. Candidates were located with
// scripts/discover-votes.mjs and then chosen and labelled manually.

import { writeFileSync } from "node:fs";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";
const BASE = "https://www.congreso.es";

// kind matters for honesty: a "proposición no de Ley" or a "moción" is a
// non-binding position statement, not the passage of a law. The UI labels them.
// A vote on a bill is labelled by the stage the record gives, never as "the
// vote on the law": the overall vote an organic law needs ("votación de
// conjunto"), a vote on the Senate's amendments (a No there rejects the Senate's
// changes, not the law), or the Congreso's vote on its committee's text, after
// which the bill goes to the Senate.
const KIND = {
  conjunto: "Votación de conjunto de ley orgánica",
  enmiendas: "Votación de enmiendas del Senado",
  dictamen: "Votación del dictamen de la Comisión",
  toma: "Toma en consideración",
  pnl: "Proposición no de Ley (no vinculante)",
  mocion: "Moción consecuencia de interpelación (no vinculante)",
};

const TOPICS = {
  lgtbi: "Derechos trans y LGTBI",
  aborto: "Aborto y salud sexual",
  vivienda: "Vivienda",
};

const KEY_VOTES = [
  // ---- XIV Legislatura (2019–2023): the landmark laws ----
  {
    id: "ley-trans-2023",
    topic: "lgtbi",
    // "Enmiendas del Senado", separate vote on "Resto de las enmiendas".
    kind: "enmiendas",
    label: "Ley 4/2023 (Ley Trans)",
    refUrl: "https://www.boe.es/buscar/act.php?id=BOE-A-2023-5366",
    legislature: "XIV",
    date: "16/02/2023",
    session: 236,
    number: 17,
    expect: { afavor: 191, enContra: 60, abstenciones: 91 },
  },
  {
    id: "lo-1-2023-aborto",
    topic: "aborto",
    // "Votación de conjunto" of an organic law.
    kind: "conjunto",
    label: "LO 1/2023 (reforma del aborto)",
    refUrl: "https://www.boe.es/buscar/act.php?id=BOE-A-2023-5364",
    legislature: "XIV",
    date: "16/02/2023",
    session: 236,
    number: 13,
    expect: { afavor: 185, enContra: 154, abstenciones: 3 },
  },
  {
    id: "ley-12-2023-vivienda",
    topic: "vivienda",
    // "Votación del dictamen": the bill then went to the Senate.
    kind: "dictamen",
    label: "Ley 12/2023 por el derecho a la vivienda",
    refUrl: "https://www.boe.es/buscar/act.php?id=BOE-A-2023-12203",
    legislature: "XIV",
    date: "27/04/2023",
    session: 256,
    number: 173,
    expect: { afavor: 176, enContra: 167, abstenciones: 1 },
  },

  // ---- XV Legislatura (2023–): current deputies ----
  {
    id: "xv-alquiler-temporada-2024",
    topic: "vivienda",
    kind: "toma",
    label: "Regulación del alquiler de temporada y de habitaciones",
    legislature: "XV",
    date: "17/12/2024",
    session: 86,
    number: 1,
    expect: { afavor: 176, enContra: 169, abstenciones: 0 },
  },
  {
    id: "xv-reforma-ley-vivienda-2025",
    topic: "vivienda",
    kind: "toma",
    label: "Reforma de la Ley 12/2023 de vivienda (Sumar)",
    legislature: "XV",
    date: "27/11/2025",
    session: 151,
    number: 2,
    expect: { afavor: 44, enContra: 179, abstenciones: 124 },
  },
  {
    id: "xv-salud-sexual-2024",
    topic: "aborto",
    kind: "pnl",
    label: "Garantía del derecho a la salud sexual y reproductiva",
    legislature: "XV",
    date: "21/11/2024",
    session: 79,
    number: 25,
    expect: { afavor: 178, enContra: 33, abstenciones: 138 },
  },
  {
    id: "xv-educacion-sexual-2026",
    topic: "aborto",
    kind: "pnl",
    label: "Educación sexual integral",
    legislature: "XV",
    date: "26/02/2026",
    session: 164,
    number: 1,
    expect: { afavor: 167, enContra: 183, abstenciones: 0 },
  },
  {
    id: "xv-orgullo-hungria-2025",
    topic: "lgtbi",
    kind: "pnl",
    label: "Condena de la prohibición del Orgullo LGTBI en Hungría",
    legislature: "XV",
    date: "19/06/2025",
    session: 121,
    number: 3,
    expect: { afavor: 176, enContra: 33, abstenciones: 136 },
  },
  {
    id: "xv-terapias-conversion-2026",
    topic: "lgtbi",
    kind: "mocion",
    label: "Apoyo a víctimas de pseudoterapias de conversión LGBTIQ+",
    legislature: "XV",
    date: "25/06/2026",
    session: 191,
    number: 15,
    expect: { afavor: 174, enContra: 169, abstenciones: 5 },
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

async function voteLinksForDate(leg, date) {
  const url =
    `${BASE}/es/opendata/votaciones?p_p_id=votaciones&p_p_lifecycle=0&p_p_state=normal` +
    `&p_p_mode=view&targetLegislatura=${leg}&currentLegislatura=${leg}` +
    `&targetDate=${encodeURIComponent(date)}`;
  const html = await (await get(url)).text();
  return [...new Set([...html.matchAll(/\/webpublica\/opendata\/votaciones\/[^"']+?\.json/g)].map((m) => m[0]))];
}

// Group the pinned votes by the day page that lists them.
const byDay = new Map();
for (const k of KEY_VOTES) {
  const key = `${k.legislature}|${k.date}`;
  if (!byDay.has(key)) byDay.set(key, []);
  byDay.get(key).push(k);
}

const kept = [];

for (const [key, wanted] of byDay) {
  const [leg, date] = key.split("|");
  const links = await voteLinksForDate(leg, date);
  console.log(`${leg} ${date}: ${links.length} votes on the order paper`);

  for (const k of wanted) {
    // Session and vote number are encoded in the file path.
    const link = links.find((l) =>
      new RegExp(`/Sesion0*${k.session}/.*/Votacion0*${k.number}/`).test(l),
    );
    if (!link) {
      console.warn(`  MISSING ${k.id}: no link for S${k.session}#${k.number}`);
      continue;
    }
    await sleep(250); // be a polite client
    let data;
    try {
      data = await (await get(BASE + link)).json();
    } catch (e) {
      console.warn(`  ERROR ${k.id}: ${e.message}`);
      continue;
    }

    const info = data.informacion ?? {};
    const t = data.totales ?? {};
    const { afavor, enContra, abstenciones } = k.expect;
    if (t.afavor !== afavor || t.enContra !== enContra || t.abstenciones !== abstenciones) {
      console.warn(
        `  MISMATCH ${k.id}: expected ${afavor}/${enContra}/${abstenciones}, got ${t.afavor}/${t.enContra}/${t.abstenciones} — skipped`,
      );
      continue;
    }

    kept.push({
      id: k.id,
      topic: k.topic,
      topicLabel: TOPICS[k.topic],
      kind: k.kind,
      kindLabel: KIND[k.kind],
      binding: k.kind !== "pnl" && k.kind !== "mocion",
      law: k.label,
      lawUrl: k.refUrl ?? null,
      legislature: k.legislature,
      session: info.sesion ?? k.session,
      number: info.numeroVotacion ?? k.number,
      date: info.fecha ?? k.date,
      title: info.titulo ?? "",
      expediente: info.textoExpediente ?? "",
      // Where the division was one of several on the same item, the record
      // says which part was put to this vote (e.g. "Votación separada de las
      // enmiendas" / "Resto de las enmiendas").
      subgroupTitle: info.tituloSubGrupo ?? "",
      subgroupText: info.textoSubGrupo ?? "",
      totals: t,
      sourceUrl: BASE + link,
      votes: (data.votaciones ?? []).map((v) => ({
        deputy: v.diputado,
        group: v.grupo,
        vote: v.voto,
      })),
    });
    console.log(`  [${k.topic}/${k.kind}] ${k.label} — ${t.afavor}/${t.enContra}/${t.abstenciones}`);
  }
}

// Newest first within each topic.
const order = { lgtbi: 0, aborto: 1, vivienda: 2 };
kept.sort(
  (a, b) =>
    order[a.topic] - order[b.topic] ||
    b.legislature.length - a.legislature.length ||
    (b.session ?? 0) - (a.session ?? 0),
);

writeFileSync(
  "data/votes.json",
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: {
      name: "Congreso de los Diputados — Datos Abiertos (votaciones)",
      url: "https://www.congreso.es/es/opendata/votaciones",
    },
    topics: Object.entries(TOPICS).map(([id, label]) => ({ id, label })),
    count: kept.length,
    votes: kept,
  }),
  "utf-8",
);
console.log(`\nwrote data/votes.json — ${kept.length}/${KEY_VOTES.length} votes`);
