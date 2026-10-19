import Caveat from "@/components/Caveat";

/**
 * The line under a chart that says where its numbers came from.
 *
 * Every figure on this site cites the body that produced it, and until now each
 * chart wrote that line by hand, which meant the wording drifted and one chart
 * carried a period the data no longer matched. Taking the source record itself
 * removes both failures: the period and the table number are whatever the
 * ingest recorded, not whatever was typed.
 *
 * `note` is for what the reader must know to read the chart correctly — a
 * definition that differs from the obvious one, a population the figure
 * excludes. It renders collapsed, one click below the citation, via `Caveat`:
 * the sentence used to sit here fully expanded on every chart on the site,
 * which read as noise on the pages that had several. Nothing in `note` is
 * shortened for this — the full sentence is still there, just not forced on
 * every reader who already trusts the number.
 *
 * It belongs inside the chart's own frame — the `<figure>` or the panel the
 * chart is drawn in — and not somewhere further down the page. Charts get
 * screenshotted and shared without their page, and a cropped chart with no
 * publisher and no date is a chart nobody can check. `period` is the data date:
 * the period the figures cover, or for a live source the date it was fetched.
 */
export interface ChartSource {
  /** The producing body, e.g. "INE" or "Tribunal de Cuentas". */
  publisher: string;
  /** The series or report as its publisher names it. */
  name: string;
  /** Period the figures cover, as the source states it. */
  period: string;
  url: string;
  /**
   * The data date as ISO (YYYY-MM-DD), where the source has one: the fetch,
   * the register's own update or the report's approval. The exported image
   * prints it as "Datos a …"; a source without one prints its `period`.
   */
  asOf?: string;
}

export default function SourceLine({
  sources,
  label,
  note,
  caveatLabel,
  className = "",
}: {
  sources: ChartSource[];
  /** Printed before the citation, e.g. "Fuente". */
  label?: string;
  note?: string;
  /** Label for the collapsed note's toggle. Required when `note` is set. */
  caveatLabel?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="label-mono mt-3 text-[var(--ink-3)]">
        {label && <>{label}: </>}
        {sources.map((s, i) => (
          <span key={s.url + s.name}>
            {i > 0 && " · "}
            <a className="src" href={s.url} target="_blank" rel="noopener noreferrer">
              {s.publisher}
            </a>
            {" "}
            {s.name} ({s.period})
          </span>
        ))}
      </p>
      {note && caveatLabel && (
        <Caveat label={caveatLabel} className="mt-1.5">
          {note}
        </Caveat>
      )}
    </div>
  );
}
