import type { ChartSource } from "@/components/chart/SourceLine";
import type { BarScale, Stripe } from "@/components/chart/Bar";
import { fill, formatDate } from "./format";
import type { Dict } from "./i18n";

/**
 * What a chart hands to its "Descargar imagen" button.
 *
 * Most charts on this site are HTML — rows of `Bar` with the figures printed
 * beside them — so they cannot be exported by serialising an SVG the way
 * RESEARCH-DATAVIZ/03 describes. Instead each chart describes itself as data,
 * in one of three shapes, and `components/chart/renderChartImage.ts` draws that
 * description onto a canvas, inside a frame that always carries the title, the
 * caption, the data date, the sources and the site address. The two charts that
 * are drawn from SVG path data (the flow diagram and the map) pass those paths,
 * which the canvas draws natively with `Path2D`.
 *
 * Everything here is plain data so a server component can build it and pass it
 * to the client button. Colours are CSS colours and may be `var(--token)`: they
 * are resolved against the page when the image is made, so the image takes the
 * reader's current theme.
 *
 * The honesty rules apply to the image as much as to the page. The builder
 * below always fills `asOf` and `sources`, the renderer never drops them to
 * make room, an unknown value is passed as "—", and a chart passes its rows in
 * the order the page shows them: the image draws no ranking or comparison the
 * page does not.
 */

export interface ExportSegment {
  value: number;
  color: string;
  striped?: Stripe;
}

/** One labelled bar, as `Bar` draws it, with the figure the page prints beside it. */
export interface ExportBarRow {
  label: string;
  /** Printed at the right, exactly as on the page. "—" when unknown. */
  value: string;
  segments: ExportSegment[];
  total: number;
  scale: BarScale;
  /** Drawn with an accent rule and a heavier label: the row the page marks. */
  marked?: boolean;
}

/** One row of coloured cells and its label, as the ballot grid draws it. */
export interface ExportGridRow {
  label: string;
  /**
   * `color: null` is an empty, outlined cell. With `text` on the cells the
   * image lists one cell per line with its text beside it, so each cell can be
   * read without the page's list below the grid.
   */
  cells: { color: string | null; striped?: Stripe; text?: string }[];
}

/** A hatch drawn over a shape: line colour, line width and period in px. */
export interface ExportHatch {
  ink: string;
  line: number;
  period: number;
}

export interface ExportShape {
  /** SVG path data in the body's coordinate space. */
  d: string;
  /** A CSS colour, or "none". */
  fill: string;
  opacity?: number;
  hatch?: ExportHatch;
  stroke?: string;
  strokeWidth?: number;
}

export interface ExportLabel {
  /** Position in the body's coordinate space. */
  x: number;
  y: number;
  text: string;
  align?: "left" | "right" | "center";
  /** Size in image px, not scaled with the shapes, so it stays legible. */
  size?: number;
  tone?: "ink" | "ink-2" | "ink-3";
  weight?: 400 | 600;
  face?: "heading" | "body";
  /** Wrap width in the body's coordinate space. */
  maxWidth?: number;
}

export interface ExportAside {
  title?: string;
  rows: { label: string; value: string; color?: string }[];
}

export type ExportBody =
  | { kind: "bars"; rows: ExportBarRow[]; axis?: string }
  | { kind: "grid"; rows: ExportGridRow[] }
  | {
      kind: "shapes";
      width: number;
      height: number;
      /** Stretch each axis to fill the plot, as `preserveAspectRatio="none"` does. */
      stretch?: boolean;
      shapes: ExportShape[];
      labels: ExportLabel[];
      /** Every value as text beside the drawing, for a map whose marks carry none. */
      aside?: ExportAside;
    };

export interface ExportLegendItem {
  label: string;
  color: string | null;
  striped?: Stripe;
  hatch?: ExportHatch;
}

export interface ChartExport {
  title: string;
  /** One sentence; wraps to at most three lines, and is never cut. */
  caption: string;
  /** "Datos a 12 oct 2026", built by `exportMeta`. */
  asOf: string;
  sources: ChartSource[];
  /** "Fuente". */
  sourceLabel: string;
  /** Slug for the file name. */
  file: string;
  legend?: ExportLegendItem[];
  body: ExportBody;
}

/**
 * "Datos a 12 oct 2026", from the sources' own data dates.
 *
 * One date when the sources agree. When they do not — the flow diagram sets a
 * 2020 donations report beside a 2026 division — each date is named with its
 * publisher, so the newer date cannot be read as describing the older data.
 * A source with no date of its own (the INE indicators) contributes its period.
 */
export function dataAsOf(sources: ChartSource[], c: Dict["charts"], bcp47: string): string {
  const parts = sources.map((s) => ({
    publisher: s.publisher,
    when: s.asOf ? formatDate(s.asOf, bcp47) : s.period,
  }));
  const distinct = [...new Set(parts.map((p) => p.when))];
  const date =
    distinct.length <= 1
      ? (distinct[0] ?? "—")
      : parts
          .filter((p, i) => parts.findIndex((q) => q.when === p.when) === i)
          .map((p) => `${p.when} (${p.publisher})`)
          .join(" · ");
  return fill(c.dataAsOf, { date });
}

/** The frame every exported image carries, so no chart can leave a part out. */
export function exportMeta(
  c: Dict["charts"],
  bcp47: string,
  meta: {
    title: string;
    caption: string;
    sources: ChartSource[];
    file: string;
    /**
     * The sources whose date is the chart's data date, where that is not all
     * of them: the map's layer is dated by its register, not by the boundary
     * file it is drawn on or each investiture record behind a hatch. Every
     * source is still listed, with its own period, in the source line.
     */
    datedBy?: ChartSource[];
  },
): Pick<ChartExport, "title" | "caption" | "asOf" | "sources" | "sourceLabel" | "file"> {
  return {
    title: meta.title,
    caption: meta.caption,
    asOf: dataAsOf(meta.datedBy?.length ? meta.datedBy : meta.sources, c, bcp47),
    sources: meta.sources,
    sourceLabel: c.source,
    file: meta.file,
  };
}

/** The button's four strings, for one chart. */
export function exportLabels(
  c: Dict["charts"],
  title: string,
): { label: string; busyLabel: string; failedLabel: string; ariaLabel: string } {
  return {
    label: c.download,
    busyLabel: c.downloadBusy,
    failedLabel: c.downloadFailed,
    // Starts with the visible text, so a voice-control user can say what
    // they see (WCAG 2.5.3), then names the chart.
    ariaLabel: fill(c.downloadLabel, { title }),
  };
}
