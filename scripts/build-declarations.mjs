// Assemble data/declarations.json from transcriptions of the deputies' Bienes y Rentas scans,
// publishing a transcription only once it has passed a check against an independent reading.
//
// Usage: npm run build:declarations
//
// Inputs:
//   data/deputies.json                — which filing each sitting deputy made on taking the seat
//                                       (scripts/fetch-deputies.mjs).
//   data/_transcriptions/<cod>.a.json — a reading of that filing's scan.
//   data/_transcriptions/<cod>.b.json — an independent second reading, made without sight of the
//                                       first, where one was needed.
//   data/_rtve-totals.json            — the totals RTVE published from its own transcription of
//                                       the same filings, fetched here on first run. A check only:
//                                       never published, never committed.
//
// A reading is published when its section totals (lib/declaration-totals.mjs) equal RTVE's for
// income, financial assets and debts, or equal all four totals of an independent second reading.
// RTVE's listing carries no IRPF figure, so the IRPF line is covered by the second reading only.
// Anything else is left out and reported, and its profile links the official PDF instead.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { declarationTotals } from "../lib/declaration-totals.mjs";
import { foldTokens, nameKey } from "../lib/name-key.mjs";

const DIR = path.join(process.cwd(), "data", "_transcriptions");
const RTVE_CACHE = path.join(process.cwd(), "data", "_rtve-totals.json");
const RTVE_URL = "https://www.rtve.es/noticias/2023/declaracion-bienes-diputados-congreso/";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const today = new Date().toISOString().slice(0, 10);

// ---- RTVE's published totals ----------------------------------------------------------------

/** "58.248,17€" to 58248.17; "-" to null. */
function rtveAmount(s) {
  const t = s.replace(/[€\s]/g, "");
  if (t === "-" || t === "") return null;
  const n = Number(t.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(n)) throw new Error(`unreadable RTVE amount: ${s}`);
  return n;
}

async function rtveTotals() {
  if (existsSync(RTVE_CACHE)) return JSON.parse(readFileSync(RTVE_CACHE, "utf8"));
  const rows = [];
  const seen = new Set();
  for (let page = 1; ; page++) {
    // Without an explicit order the listing's pages 2 and 3 return ten overlapping rows each and
    // about thirty deputies never appear; with one, every page holds the next twenty.
    const res = await fetch(`${RTVE_URL}?order=nombre_listado,asc&page=${page}`, {
      headers: { "User-Agent": UA },
    });
    if (!res.ok) throw new Error(`${res.status} RTVE page ${page}`);
    const html = await res.text();
    const items = [...html.matchAll(/<span class="nombre">([^<]+)<\/span>[\s\S]*?retribucion-cifra">([^<]*)<[\s\S]*?patrimonio-cifra">([^<]*)<[\s\S]*?deudas-cifra">([^<]*)</g)];
    if (items.length === 0) break;
    for (const m of items) {
      if (seen.has(m[1].trim())) continue;
      seen.add(m[1].trim());
      rows.push({
        name: m[1].trim(),
        income: rtveAmount(m[2]),
        financial: rtveAmount(m[3]),
        debts: rtveAmount(m[4]),
      });
    }
    await sleep(1000); // a news site, not an API: one page a second
  }
  if (rows.length !== 350) throw new Error(`RTVE listing parsed to ${rows.length} deputies, not 350; layout changed?`);
  writeFileSync(RTVE_CACHE, JSON.stringify({ fetchedAt: new Date().toISOString(), url: RTVE_URL, rows }, null, 2));
  return { rows };
}

// ---- validation -----------------------------------------------------------------------------

const GROUPS = new Set(["salary", "dividends", "interest", "other"]);
const PROPERTY_KINDS = new Set(["urban", "rustic", "company"]);
const ASSET_KINDS = new Set(["securities", "other"]);
const REASONS = new Set(["toma", "cese", "otra", null]);

const isAmount = (v) => v === null || (typeof v === "number" && Number.isFinite(v));
const isText = (v) => v === null || typeof v === "string";

function invalid(t) {
  const errors = [];
  const need = (cond, msg) => cond || errors.push(msg);
  for (const k of ["income", "realEstate", "deposits", "otherAssets", "vehicles", "loans", "illegible"]) {
    need(Array.isArray(t[k]), `${k} is not an array`);
  }
  if (errors.length) return errors;
  t.income.forEach((l, i) => {
    need(GROUPS.has(l.group), `income[${i}].group`);
    need(isText(l.concept), `income[${i}].concept`);
    need(isAmount(l.amount), `income[${i}].amount`);
  });
  t.realEstate.forEach((p, i) => {
    need(PROPERTY_KINDS.has(p.kind), `realEstate[${i}].kind`);
    need(typeof p.description === "string", `realEstate[${i}].description`);
    for (const k of ["location", "acquired", "title"]) need(isText(p[k]), `realEstate[${i}].${k}`);
  });
  t.deposits.forEach((d, i) => need(isText(d.description) && isAmount(d.amount), `deposits[${i}]`));
  t.otherAssets.forEach((a, i) =>
    need(ASSET_KINDS.has(a.kind) && isText(a.description) && isAmount(a.amount), `otherAssets[${i}]`),
  );
  t.vehicles.forEach((v, i) => need(typeof v.description === "string" && isText(v.acquired), `vehicles[${i}]`));
  t.loans.forEach((l, i) =>
    need(
      typeof l.description === "string" && isText(l.granted) && isAmount(l.amount) && isAmount(l.pending),
      `loans[${i}]`,
    ),
  );
  need(isAmount(t.irpf), "irpf");
  for (const k of ["holdingsOver5pct", "otherDebts", "observations"]) need(isText(t[k]), k);
  need(REASONS.has(t.reason ?? null), "reason");
  need(t.notes === undefined || Array.isArray(t.notes), "notes");
  (t.notes ?? []).forEach((n, i) =>
    need(typeof n?.written === "string" && amountAt(t, n?.path) !== undefined, `notes[${i}]`),
  );
  return errors;
}

/** The amount a note's path names ("irpf", "income[0].amount", "loans[1].pending"…), or undefined. */
function amountAt(t, path) {
  const m = /^(?:irpf|(income|deposits|otherAssets)\[(\d+)\]\.amount|loans\[(\d+)\]\.(amount|pending))$/.exec(path ?? "");
  if (!m) return undefined;
  if (path === "irpf") return t.irpf;
  const row = m[1] ? t[m[1]][Number(m[2])] : t.loans[Number(m[3])];
  return row ? row[m[4] ?? "amount"] : undefined;
}

// The form asks for no licence plate (footnote 13), and a few deputies typed one anyway. A plate
// identifies a vehicle, not a sum of money, so it is left out here; the page says so.
const PLATE = /\b(?:\d{4}[- ]?(?!BMW\b|BYD\b|KTM\b)[BCDFGHJKLMNPRSTVWXYZ]{3}|[A-Z]{1,2}[- ]\d{4}[- ][A-Z]{1,2})\b/g;
const platesLeftOut = [];
function withoutPlate(cod, vehicle) {
  const description = vehicle.description.replace(PLATE, "[matrícula omitida]");
  if (description !== vehicle.description) platesLeftOut.push(`${cod} ${description}`);
  return { ...vehicle, description };
}

// null and 0 both mean nothing was declared in that part of the form.
const same = (a, b) => Math.abs((a ?? 0) - (b ?? 0)) < 0.005;

// ---- assemble -------------------------------------------------------------------------------

const { deputies } = JSON.parse(readFileSync("data/deputies.json", "utf8"));
mkdirSync(DIR, { recursive: true });
const files = new Set(readdirSync(DIR));
const read = (cod, reading) => {
  const f = `${cod}.${reading}.json`;
  return files.has(f) ? JSON.parse(readFileSync(path.join(DIR, f), "utf8")) : null;
};

const rtve = (await rtveTotals()).rows;
const rtveByKey = new Map(rtve.map((r) => [nameKey(r.name), r]));
function rtveFor(d) {
  const exact = rtveByKey.get(nameKey(d.name)) ?? rtveByKey.get(nameKey(d.fullName));
  if (exact) return exact;
  // RTVE sometimes spells out a second given name the roster drops; accept a unique subset.
  const own = foldTokens(d.name);
  const hits = rtve.filter((r) => {
    const t = new Set(foldTokens(r.name));
    return own.every((x) => t.has(x));
  });
  return hits.length === 1 ? hits[0] : null;
}

const published = [];
const report = { rtve: 0, second: 0, needSecond: [], disagree: [], invalidReadings: [], untranscribed: 0 };
const unresolved = [];

for (const d of deputies) {
  const filing = d.filings.find((f) => f.kind === "bienes");
  if (!filing) continue;
  const a = read(d.cod, "a");
  const b = read(d.cod, "b");
  if (!a && !b) {
    report.untranscribed++;
    unresolved.push({ deputy: d.name, cod: d.cod, reason: "not-transcribed" });
    continue;
  }

  const usable = [a, b].filter(Boolean).filter((t) => {
    const errors = invalid(t);
    if (errors.length) report.invalidReadings.push(`${d.cod} ${d.name}: ${errors.slice(0, 3).join(", ")}`);
    return errors.length === 0;
  });

  const r = rtveFor(d);
  let chosen = null;
  let method = null;
  for (const t of usable) {
    if (t.illegible.length) continue;
    const s = declarationTotals(t);
    if (r && same(s.income, r.income) && same(s.financial, r.financial) && same(s.debts, r.debts)) {
      chosen = t;
      method = "rtve";
      break;
    }
  }
  if (!chosen && usable.length === 2 && usable.every((t) => t.illegible.length === 0)) {
    const [x, y] = usable.map((t) => declarationTotals(t));
    if (["income", "financial", "debts", "irpf"].every((k) => same(x[k], y[k]))) {
      chosen = usable[0];
      method = "second-reading";
    }
  }

  if (chosen) {
    method === "rtve" ? report.rtve++ : report.second++;
    const { illegible, ...fields } = chosen;
    published.push({
      ...fields,
      vehicles: fields.vehicles.map((v) => withoutPlate(d.cod, v)),
      notes: fields.notes ?? [],
      deputy: d.name,
      cod: d.cod,
      filed: filing.date,
      url: filing.url,
      verified: { method, checkedAt: today },
    });
  } else if (!b) {
    report.needSecond.push(d.cod);
    unresolved.push({ deputy: d.name, cod: d.cod, reason: "awaiting-second-reading" });
  } else {
    const totals = usable.map((t) => JSON.stringify(declarationTotals(t))).join(" vs ");
    report.disagree.push(`${d.cod} ${d.name}: ${totals}${r ? ` vs RTVE ${JSON.stringify(r)}` : ""}`);
    unresolved.push({ deputy: d.name, cod: d.cod, reason: "readings-disagree" });
  }
}

// Field order as the form's, so the file reads like the declaration.
const ORDER = [
  "deputy", "cod", "filed", "url", "reason", "income", "irpf", "realEstate", "deposits",
  "otherAssets", "holdingsOver5pct", "vehicles", "loans", "otherDebts", "observations", "notes", "verified",
];
const ordered = published
  .sort((x, y) => x.deputy.localeCompare(y.deputy, "es"))
  .map((p) => Object.fromEntries(ORDER.map((k) => [k, p[k] ?? null])));

writeFileSync(
  "data/declarations.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: {
        name: "Congreso de los Diputados — Declaraciones de Bienes y Rentas, XV Legislatura (transcripción propia)",
        url: "https://www.congreso.es/es/busqueda-de-diputados",
      },
      check: { name: "RTVE", url: RTVE_URL },
      count: ordered.length,
      declarations: ordered,
      unresolved,
    },
    null,
    2,
  ) + "\n",
  "utf-8",
);

console.log(`published: ${ordered.length} (${report.rtve} checked against RTVE, ${report.second} by second reading)`);
console.log(`not transcribed yet: ${report.untranscribed}`);
console.log(`awaiting a second reading: ${report.needSecond.length}${report.needSecond.length ? ` — ${report.needSecond.join(" ")}` : ""}`);
if (platesLeftOut.length) console.log(`licence plates left out: ${platesLeftOut.length}\n  ${platesLeftOut.join("\n  ")}`);
if (report.disagree.length) console.log(`readings disagree:\n  ${report.disagree.join("\n  ")}`);
if (report.invalidReadings.length) console.log(`invalid readings:\n  ${report.invalidReadings.join("\n  ")}`);
console.log(`\nwrote data/declarations.json`);
