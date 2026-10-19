import { promises as fs } from "node:fs";
import path from "node:path";

export interface Officeholder {
  slug: string;
  name: string;
  role: string;
  partyLabel: string;
  partyNif: string | null;
  partyShort: string;
  region: string | null;
  municipality: string | null;
  gross: number;
  monthly: number | null;
}

export interface SalaryData {
  generatedAt: string;
  source: { name: string; via: string; updated: string | null };
  count: number;
  people: Officeholder[];
}

const FILE = path.join(process.cwd(), "data", "salaries.json");

/**
 * Where a reader can find the register this file was built from. The build's
 * own record names the register and the export it came through, but carries no
 * link, so the link lives here, once, for `/datos` and the charts alike.
 */
export const SALARIES_SOURCE_URL = "https://transparencia.gob.es";

let cache: SalaryData | null = null;

// The dataset is ~1.8 MB, so it is read once per server instance and never sent
// to the browser wholesale — pages render a filtered slice.
export async function getSalaries(): Promise<SalaryData> {
  if (cache) return cache;
  const raw = await fs.readFile(FILE, "utf-8");
  cache = JSON.parse(raw) as SalaryData;
  return cache;
}

// The directory query lives in lib/people.ts (queryPeople): it lists people, not pay, and the
// people include sitting deputies this register does not carry.

export async function getOfficeholder(slug: string): Promise<Officeholder | undefined> {
  const data = await getSalaries();
  return data.people.find((p) => p.slug === slug);
}

// Aggregate pay by party, for joining against the BDNS subsidy figures.
export async function salaryTotalsByNif(): Promise<Map<string, { total: number; count: number }>> {
  const data = await getSalaries();
  const out = new Map<string, { total: number; count: number }>();
  for (const p of data.people) {
    if (!p.partyNif) continue;
    const cur = out.get(p.partyNif) ?? { total: 0, count: 0 };
    cur.total += p.gross;
    cur.count += 1;
    out.set(p.partyNif, cur);
  }
  return out;
}
