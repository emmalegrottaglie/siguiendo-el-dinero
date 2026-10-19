import type { ReactNode } from "react";

/**
 * A chart's numbers as a real table, one click below the chart.
 *
 * Most charts here are `aria-hidden`, because the figures beside them say the
 * same thing in text. Where they do not — a histogram, a ribbon diagram, a grid
 * of coloured cells — a screen reader user was told nothing the chart drew, and
 * a sighted reader who wanted the exact figure had to estimate it from a bar.
 * This lists every number the chart draws, with a caption saying what the rows
 * are, column headers and row headers, so it can be read cell by cell.
 *
 * A native `<details>`, like `Caveat`: no JavaScript, closed by default so it
 * costs a reader nothing until they ask for it, and it works the same inside a
 * server component and a client one. The table scrolls inside its own box on a
 * narrow screen rather than widening the page.
 *
 * The first column is the row header (`<th scope="row">`), so it should be the
 * thing each row is about: the party, the formation, the salary band.
 */
export interface DataColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  /** Right-aligned, tabular figures. */
  numeric?: boolean;
}

export default function DataTable<T>({
  summary,
  caption,
  columns,
  rows,
  rowKey,
  className = "",
}: {
  /** The toggle's text: "Ver los datos en una tabla". */
  summary: string;
  /** What the rows are, and anything needed to read them. */
  caption: string;
  columns: DataColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  className?: string;
}) {
  return (
    <details className={`data-table mt-3 ${className}`}>
      <summary>{summary}</summary>
      <div className="mt-2 max-w-full overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="pb-2 text-left text-xs leading-relaxed text-[var(--ink-2)]">
            {caption}
          </caption>
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.header}
                  scope="col"
                  className={`label-mono font-normal ${c.numeric ? "text-right" : "text-left"}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={rowKey(r, i)}>
                {columns.map((c, j) =>
                  j === 0 ? (
                    <th key={c.header} scope="row" className="text-left font-normal">
                      {c.cell(r)}
                    </th>
                  ) : (
                    <td
                      key={c.header}
                      className={c.numeric ? "mono whitespace-nowrap text-right" : ""}
                    >
                      {c.cell(r)}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
