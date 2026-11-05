import { euro, fill, percent } from "@/lib/format";
import { trancheFor, type SmiTranche } from "@/lib/indicators";
import type { SmiYear } from "@/lib/smi";
import type { Dict } from "@/lib/i18n";
import SourceText, { type Source } from "./SourceText";

/**
 * One person's published pay in multiples of the minimum wage, on the same
 * nine tranches `/contexto` draws from the INE's wage survey (EAES).
 *
 * The salary distribution above it answers "how does this compare with other
 * public posts"; this answers "how does it compare with an ordinary wage". The
 * whole ladder is shown, not just the one tranche, because "24.8 times the
 * SMI" means little without the shape of what it is a multiple of.
 *
 * The tranche the pay falls in is marked three ways: a rule beside it, its bar
 * in the State route's colour, and the words "aquí cae esta retribución". The
 * other bars share one scale, so their lengths compare; every row also prints
 * its exact share. A share the source leaves empty prints "—".
 */
export default function SmiPosition({
  gross,
  tranches,
  smi,
  t,
  sources,
  sourceLabel,
  bcp47,
}: {
  gross: number | null;
  tranches: SmiTranche[];
  smi: SmiYear;
  t: Dict["smiPosition"];
  /** The INE table the tranches come from, and the decree fixing the SMI. */
  sources: Source[];
  sourceLabel: string;
  bcp47: string;
}) {
  if (gross === null || !(gross > 0)) {
    return <p className="n-body mt-8">{t.noFigure}</p>;
  }

  const multiple = gross / smi.annual;
  const tranche = trancheFor(multiple, tranches);
  const top = Math.max(...tranches.map((r) => r.percent ?? 0));
  const share = (r: SmiTranche) => (r.percent == null ? "—" : percent(r.percent / 100, bcp47, 2));

  return (
    <figure className="n-state mt-12 max-w-[44rem]">
      <h3 className="n-h3">{t.title}</h3>
      <p className="n-finding mt-3">
        {fill(t.sentence, {
          pay: euro(gross, bcp47),
          multiple: multiple.toLocaleString(bcp47, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
          year: String(smi.year),
          smi: euro(smi.annual, bcp47),
          tranche: tranche?.tranche ?? "—",
          share: tranche ? share(tranche) : "—",
        })}
      </p>
      <ul className="mt-6">
        {tranches.map((r) => {
          const active = r === tranche;
          return (
            <li
              key={r.tranche}
              className="border-l-[4px] py-1.5 pl-3"
              style={{ borderColor: active ? "var(--route)" : "transparent" }}
            >
              <p className="flex flex-wrap items-baseline justify-between gap-x-4">
                <span className={active ? "font-bold" : undefined}>
                  {r.tranche}
                  {active && <span className="n-meta ml-2">{t.readerHere}</span>}
                </span>
                <span className="n-num whitespace-nowrap">{share(r)}</span>
              </p>
              <div aria-hidden className="mt-1 h-2.5 w-full">
                {r.percent != null && r.percent > 0 && (
                  <span
                    className="block h-2.5 rounded-[2px]"
                    style={{
                      width: `${Math.max((r.percent / top) * 100, 0.6).toFixed(2)}%`,
                      background: active ? "var(--route)" : "var(--n-rule-strong)",
                    }}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="n-meta mt-4 max-w-[var(--n-w-read)]">{t.caveat}</p>
      <SourceText sources={sources} label={sourceLabel} />
    </figure>
  );
}
