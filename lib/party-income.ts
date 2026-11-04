import income2018 from "@/data/party-income-2018.json";
import income2019 from "@/data/party-income-2019.json";
import income from "@/data/party-income-2020.json";

/**
 * The parties' ordinary income in 2018, 2019 and 2020, as the Tribunal de
 * Cuentas reports it. The single-year exports below (`PARTY_INCOME`,
 * `PARTY_INCOME_YEAR`, ...) are the latest year, 2020; `PARTY_INCOME_YEARS`
 * holds every year, oldest first.
 *
 * 2018 and 2019 come from Informe nº 1.532 (ejercicios 2018 y 2019, approved
 * 28/09/2023), Anexos IV and VII (2018) and V and VIII (2019): the same two
 * tables as 2020's, with the same columns. The set of formations differs from
 * year to year, because the Court audits the parties that received annual
 * operating subsidies that year, so totals of different years are not totals
 * of the same parties and are never added together or subtracted.
 *
 * Description of the 2020 figures follows.
 *
 * Source: Informe nº 1.573, Cuentas Anuales de los Partidos Políticos, ejercicio
 * 2020 (approved 27/06/2024), Anexo IV (public resources) and Anexo V (private
 * resources). These are the 25 formations the Court audited because they
 * received annual operating subsidies, so the table is not every party in Spain.
 *
 * It answers the question the foundations route raises: where a party's own
 * money comes from. Public money is subsidies from the State, the regional
 * governments, the Cortes, the regional parliaments and local bodies (the last
 * three paid to the parliamentary and council groups and passed on). Private
 * money is member fees, contributions from the party's own officeholders,
 * donations from individuals, and other income. Electoral subsidies are a
 * separate annex and are not included.
 *
 * Transcribed from the page images and checked by `npm run check:party-income`:
 * every row and column sums to the report's printed totals, and every party's
 * donations equal the figure lib/donations.ts takes from the same report.
 */

export interface PublicIncome {
  state: number;
  regionalGovernments: number;
  cortes: number;
  regionalParliaments: number;
  local: number;
  other: number;
  total: number;
}

export interface PrivateIncome {
  memberFees: number;
  officeholders: number;
  donations: number;
  other: number;
  total: number;
}

export interface FormationIncome {
  /** As printed in the report. */
  label: string;
  /** Only when the registry holds exactly one party under that name. */
  nif: string | null;
  /** The report's own footnote, where a row has one (e.g. no breakdown given). */
  note?: string;
  public: PublicIncome;
  private: PrivateIncome;
}

export const PARTY_INCOME_SOURCE = income.source;
export const PARTY_INCOME_YEAR = income.year;
export const PARTY_INCOME_TOTALS: {
  public: PublicIncome;
  private: PrivateIncome;
} = income.totals;
export const PARTY_INCOME: FormationIncome[] = income.formations;

export function incomeByNif(nif: string): FormationIncome | undefined {
  return PARTY_INCOME.find((f) => f.nif === nif);
}

export interface IncomeYear {
  year: number;
  source: typeof income.source;
  totals: { public: PublicIncome; private: PrivateIncome };
  formations: FormationIncome[];
}

/** Every transcribed year, oldest first. */
export const PARTY_INCOME_YEARS: IncomeYear[] = [income2018, income2019, income].map((y) => ({
  year: y.year,
  source: y.source,
  totals: y.totals,
  formations: y.formations as FormationIncome[],
}));

/** One formation's row in each year that has one, oldest first. */
export function incomeHistoryByNif(nif: string): { year: number; income: FormationIncome }[] {
  return PARTY_INCOME_YEARS.flatMap((y) => {
    const f = y.formations.find((x) => x.nif === nif);
    return f ? [{ year: y.year, income: f }] : [];
  });
}

/** Public and private income together: the formation's ordinary income for the year. */
export function ordinaryIncome(f: {
  public: PublicIncome;
  private: PrivateIncome;
}): number {
  return f.public.total + f.private.total;
}
