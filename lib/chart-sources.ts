import type { ChartSource } from "@/components/chart/SourceLine";
import type { Aggregation } from "./types";
import type { VotesData, KeyVote } from "./votes";
import { voteDateISO } from "./votes";
import type { SpendingFile } from "./spending";
import type { SalaryData } from "./salaries";
import { SALARIES_SOURCE_URL } from "./salaries";
import type { FoundationsFile } from "./foundations";
import { DONATIONS_SOURCE } from "./donations";
import { SUBSIDIES_DATASET_NAME } from "./data";
import { formatDate, fill } from "./format";
import type { Dict } from "./i18n";

/**
 * The source line for each chart, built from the record the data itself
 * carries.
 *
 * Every chart now prints its publisher, dataset, data date and link inside its
 * own frame (`SourceLine`). Writing those by hand at each chart is how a period
 * drifts from the data it describes, so each builder here reads the loaded file
 * or the module constant that the figures came from. Only the connecting words
 * ("updated", "approved") are translated; a publisher's own title for its
 * dataset or report stays as the publisher wrote it.
 */

type Charts = Dict["charts"];

/** A source date as ISO, whether the ingest stored it as ISO or as DD/MM/YYYY. */
function iso(date: string): string {
  const dmy = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return dmy ? `${dmy[3]}-${dmy[2]}-${dmy[1]}` : date.slice(0, 10);
}

const updated = (c: Charts, date: string, bcp47: string) =>
  fill(c.updated, { date: formatDate(iso(date), bcp47) });

const approved = (c: Charts, date: string, bcp47: string) =>
  fill(c.approved, { date: formatDate(iso(date), bcp47) });

/**
 * "Congreso de los Diputados — Datos Abiertos (votaciones)" is stored as one
 * string; the publisher is the part before the dash.
 */
function split(name: string): { publisher: string; rest: string } {
  const [publisher, ...rest] = name.split(" — ");
  return { publisher, rest: rest.join(" — ") || name };
}

/** BDNS, the live subsidy register, dated by the snapshot's fetch. */
export function subsidiesSource(agg: Aggregation, c: Charts, bcp47: string): ChartSource {
  return {
    publisher: agg.source.system,
    name: SUBSIDIES_DATASET_NAME,
    period: updated(c, agg.generatedAt, bcp47),
    url: agg.source.url,
  };
}

/** Every tracked division: the open-data portal, the years covered and the fetch date. */
export function votesSource(votes: VotesData, c: Charts, bcp47: string): ChartSource {
  const { publisher, rest } = split(votes.source.name);
  const years = votes.votes.map((v) => Number(voteDateISO(v).slice(0, 4)));
  const range = years.length
    ? fill(c.range, { from: String(Math.min(...years)), to: String(Math.max(...years)) })
    : "";
  return {
    publisher,
    name: rest,
    period: [range, updated(c, votes.generatedAt, bcp47)].filter(Boolean).join("; "),
    url: votes.source.url,
  };
}

/** One division's own record on the Congreso site. */
export function voteRecordSource(
  votes: VotesData,
  vote: KeyVote,
  c: Charts,
  bcp47: string,
): ChartSource {
  return {
    publisher: split(votes.source.name).publisher,
    name: c.rollCall,
    period: formatDate(voteDateISO(vote), bcp47),
    url: vote.sourceUrl,
  };
}

/** The 2020 party accounts, transcribed from Tribunal de Cuentas report 1573. */
export function donationsSource(c: Charts, bcp47: string): ChartSource {
  return {
    publisher: DONATIONS_SOURCE.body,
    name: DONATIONS_SOURCE.report,
    period: `${fill(c.financialYear, { year: String(DONATIONS_SOURCE.year) })}; ${approved(c, DONATIONS_SOURCE.approved, bcp47)}`,
    url: DONATIONS_SOURCE.url,
  };
}

/** Electoral spending, Tribunal de Cuentas report 1.628. */
export function spendingSource(spend: SpendingFile, c: Charts, bcp47: string): ChartSource {
  return {
    publisher: spend.source.body,
    name: fill(c.report, { report: spend.source.report }),
    period: `${c.spendingElection}; ${approved(c, spend.source.approved, bcp47)}`,
    url: spend.source.url,
  };
}

/** The pay register, dated by the register's own last update. */
export function salariesSource(salaries: SalaryData, c: Charts, bcp47: string): ChartSource {
  const date = salaries.source.updated ?? salaries.generatedAt;
  return {
    publisher: salaries.source.name,
    name: salaries.source.via,
    period: updated(c, date, bcp47),
    url: SALARIES_SOURCE_URL,
  };
}

/** Party-linked foundations, Tribunal de Cuentas report 1.642. */
export function foundationsSource(f: FoundationsFile, c: Charts, bcp47: string): ChartSource {
  return {
    publisher: f.source.body,
    name: f.source.report,
    period: approved(c, f.source.approved, bcp47),
    url: f.source.url,
  };
}

/** Portrait licences, dated by the photo build. */
export function portraitsSource(
  photos: { name: string; url: string },
  generatedAt: string,
  c: Charts,
  bcp47: string,
): ChartSource {
  return {
    publisher: photos.name,
    name: c.portraitsDataset,
    period: generatedAt ? updated(c, generatedAt, bcp47) : "—",
    url: photos.url,
  };
}
