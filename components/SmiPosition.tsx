import { euro, fill, percent } from "@/lib/format";
import { trancheFor, type SmiTranche } from "@/lib/indicators";
import type { SmiYear } from "@/lib/smi";
import Bar from "./chart/Bar";
import SourceLine, { type ChartSource } from "./chart/SourceLine";
import type { Dict } from "@/lib/i18n";

/**
 * One person's pay against the whole country's, in multiples of the minimum
 * wage.
 *
 * `SalaryDistributionChart` on this same page answers "how does this pay
 * compare with other public posts". This answers a different question: how
 * does it compare with an ordinary wage. The axis is `/contexto`'s own SMI
 * ladder — the same nine tranches, the same INE table (28182) — so this is
 * the register overlay onto an existing chart, not a second one invented for
 * this page. The row containing this person's multiple is marked; the other
 * eight are shown for the same reason `SalaryDistributionChart` draws the
 * whole histogram rather than just a rank: a single number ("24.8×") means
 * little without the shape of the thing it is a multiple of.
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
  sources: ChartSource[];
  sourceLabel: string;
  bcp47: string;
}) {
  if (gross === null || !(gross > 0)) {
    return <p className="mt-6 text-sm leading-relaxed text-[var(--ink-3)]">{t.noFigure}</p>;
  }

  const multiple = gross / smi.annual;
  const tranche = trancheFor(multiple, tranches);
  const top = Math.max(...tranches.map((r) => r.percent ?? 0));

  return (
    <figure className="mt-6">
      <h3 className="display text-lg">{t.title}</h3>

      <ul className="mt-4 flex flex-col gap-2.5">
        {tranches.map((r) => {
          const active = r === tranche;
          return (
            <li
              key={r.tranche}
              style={active ? { borderLeft: "2px solid var(--gold-deep)", paddingLeft: "10px" } : undefined}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <span style={{ fontSize: "13px", fontWeight: active ? 600 : 400 }}>
                  {r.tranche}
                </span>
                <span className="mono whitespace-nowrap" style={{ fontSize: "12.5px" }}>
                  {percent((r.percent ?? 0) / 100, bcp47, 2)}
                </span>
              </div>
              <Bar
                className="mt-1"
                segments={[
                  {
                    value: r.percent ?? 0,
                    color: active ? "var(--gold-deep)" : "var(--verd)",
                    label: r.tranche,
                  },
                ]}
                total={top}
                scale="compare"
                size="sm"
              />
            </li>
          );
        })}
      </ul>

      <figcaption className="mt-3 text-sm leading-relaxed text-[var(--ink-2)]">
        {fill(t.sentence, {
          pay: euro(gross, bcp47),
          multiple: multiple.toLocaleString(bcp47, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
          year: String(smi.year),
          smi: euro(smi.annual, bcp47),
          tranche: tranche?.tranche ?? "—",
          share: tranche ? percent((tranche.percent ?? 0) / 100, bcp47, 2) : "—",
        })}{" "}
        <a className="src" href={smi.boe.url} target="_blank" rel="noopener noreferrer">
          {fill(t.boeLink, { rd: smi.boe.title.match(/Real Decreto (\d+\/\d+)/)?.[1] ?? smi.boe.id })}
        </a>
      </figcaption>

      <p className="mt-2 text-sm leading-relaxed text-[var(--ink-3)]">{t.caveat}</p>
      <SourceLine sources={sources} label={sourceLabel} />
    </figure>
  );
}
