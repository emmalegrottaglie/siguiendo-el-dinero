import income from "@/data/party-income-2020.json";

/**
 * The parties' ordinary income in 2020, as the Tribunal de Cuentas reports it.
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

/** Public and private income together: the formation's ordinary income for the year. */
export function ordinaryIncome(f: {
  public: PublicIncome;
  private: PrivateIncome;
}): number {
  return f.public.total + f.private.total;
}
