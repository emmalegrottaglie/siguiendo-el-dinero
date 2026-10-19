"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { PARTIES } from "@/lib/parties";
import { fillEdge } from "@/lib/chart-colors";
import { GOVERNMENTS, GOVERNMENTS_SOURCE, shortName } from "@/lib/governments";
import { investitureFor, type InvestitureStatus } from "@/lib/investitures";
import type { HateTerritoryFile, RegionsFile } from "@/lib/regions";
import { formatDate, integer, rate } from "@/lib/format";
import Bar from "./chart/Bar";
import ChartReader from "./chart/ChartReader";
import ExportButton from "./chart/ExportButton";
import type { ChartSource } from "./chart/SourceLine";
import { readerProps, say } from "@/lib/chart-reader";
import {
  exportLabels,
  exportMeta,
  type ChartExport,
  type ExportHatch,
  type ExportLabel,
  type ExportShape,
} from "@/lib/chart-export";
import type { Dict } from "@/lib/i18n";

type LayerId = "gov" | "hate";

/** The table's sortable columns, keyed to what each one actually orders by. */
type SortKey = "name" | "president" | "recorded" | "rate" | "sogi";

/**
 * Numeric columns open descending and text columns ascending, because that is
 * the order a reader wants first from each: the largest figure, or the top of
 * the alphabet.
 */
const FIRST_DIRECTION: Record<SortKey, "asc" | "desc"> = {
  name: "asc",
  president: "asc",
  recorded: "desc",
  rate: "desc",
  sogi: "desc",
};

interface Cell {
  id: string;
  /** The fill for the active layer. */
  fill: string;
  /** What the tooltip and the table print for this territory. */
  value: string;
}

/** The two investiture hatches, as the page's SVG patterns draw them. */
const HATCH_DECISIVE: ExportHatch = { ink: "color-mix(in srgb, var(--ink) 34%, transparent)", line: 2, period: 6 };
const HATCH_SHORT: ExportHatch = { ink: "color-mix(in srgb, var(--ink) 22%, transparent)", line: 1.5, period: 10 };

/**
 * Rows for the ARIA grid over the map.
 *
 * A map has no rows, so they are made from the geography: territories are
 * taken north to south and a new row starts once a centroid lies more than
 * `BAND` units below the first one in the current row; inside a row they run
 * west to east. With the current projection that gives six rows — the
 * Cantabrian coast, the Ebro and the Duero, the centre with the Balearics, the
 * west and Valencia, the south, and the Canaries with Ceuta and Melilla — so
 * the arrow keys move roughly the way the eye does.
 */
const BAND = 60;

function gridOrder(regions: RegionsFile["regions"]): { ids: string[]; rows: number[] } {
  const byY = [...regions].sort((a, b) => a.centroid[1] - b.centroid[1]);
  const rows: (typeof regions)[] = [];
  for (const r of byY) {
    const row = rows[rows.length - 1];
    if (row && r.centroid[1] - row[0].centroid[1] <= BAND) row.push(r);
    else rows.push([r]);
  }
  const ids: string[] = [];
  const rowOf: number[] = [];
  rows.forEach((row, k) =>
    row
      .sort((a, b) => a.centroid[0] - b.centroid[0])
      .forEach((r) => {
        ids.push(r.id);
        rowOf.push(k);
      }),
  );
  return { ids, rows: rowOf };
}

/**
 * Where each party governs, and what the hate-crime record says there.
 *
 * Two layers, both sourced. The design specified five; the other three were
 * supplied with sample values and are not here — see lib/regions.ts for why a
 * plausible number on a map is worse than a missing layer.
 *
 * The geometry is projected at build time, so this component only colours paths
 * and handles selection. It is a client component for the hover and click
 * behaviour; without JavaScript the map still renders, in the layer that loads
 * first, with the table below carrying every value as text.
 *
 * The ramp is built with CSS `color-mix(in oklab, …)` rather than a colour
 * library. Mixing in a perceptual space is the whole reason d3.interpolateLab
 * was specified for it, and the browser does that natively now; sampling from
 * 0.16 rather than 0 keeps the lightest step reading as a fill instead of as
 * empty ground.
 */
export default function RightsMap({
  regions,
  hate,
  M,
  C,
  bcp47,
}: {
  regions: RegionsFile;
  hate: HateTerritoryFile;
  /* Only this block, not the whole dictionary. `Dict` carries functions —
     news.hoursAgo among them — and a function cannot cross the server-to-client
     boundary, so passing `t` fails at prerender rather than at type-check. */
  M: Dict["map"];
  /** The chart strings, plain text like `M`. */
  C: Dict["charts"];
  bcp47: string;
}) {
  const [layer, setLayer] = useState<LayerId>("gov");
  const [selected, setSelected] = useState("13");
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const frame = useRef<HTMLDivElement>(null);

  const maxRate = useMemo(
    () => Math.max(...Object.values(hate.territories).map((h) => h.ratePer100k)),
    [hate],
  );

  const cells: Record<string, Cell> = useMemo(() => {
    const out: Record<string, Cell> = {};
    for (const r of regions.regions) {
      if (layer === "gov") {
        const g = GOVERNMENTS.find((x) => x.id === r.id);
        const colour = g?.partyNif ? PARTIES[g.partyNif]?.color : undefined;
        out[r.id] = {
          id: r.id,
          fill: colour ?? "var(--grey-300)",
          value: g ? g.partyLabel : M.noData,
        };
      } else {
        const h = hate.territories[r.id];
        // 0.16 → 1.0 of the ramp, so even the lowest territory reads as filled.
        const k = h ? 0.16 + (h.ratePer100k / maxRate) * 0.84 : 0;
        out[r.id] = {
          id: r.id,
          fill: h
            ? `color-mix(in oklab, var(--gold) ${(k * 100).toFixed(1)}%, var(--ramp-low))`
            : "var(--grey-300)",
          value: h ? rate(h.ratePer100k, bcp47) : M.noData,
        };
      }
    }
    return out;
  }, [regions, hate, layer, maxRate, M.noData, bcp47]);

  const nameOf = useCallback(
    (id: string) => {
      const r = regions.regions.find((x) => x.id === id);
      return r ? shortName(id, r.name) : id;
    },
    [regions],
  );

  const onMove = (id: string) => (e: React.MouseEvent) => {
    const box = frame.current?.getBoundingClientRect();
    if (!box) return;
    setHover({ id, x: e.clientX - box.left, y: e.clientY - box.top });
  };

  // Null until the reader picks a column, and the layer's own order applies
  // until then. A chosen sort survives a layer switch: it is an explicit
  // instruction, and the caption says which order is in force.
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" } | null>(null);

  const toggleSort = (key: SortKey) =>
    setSort((prev) =>
      prev?.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: FIRST_DIRECTION[key] },
    );

  const sel = regions.regions.find((r) => r.id === selected);
  const selInv = investitureFor(selected);
  const selGov = GOVERNMENTS.find((g) => g.id === selected);
  const selHate = hate.territories[selected];

  const layers: { id: LayerId; label: string; note: string }[] = [
    { id: "gov", label: M.layerGov, note: M.layerGovNote },
    { id: "hate", label: M.layerHate, note: M.layerHateNote },
  ];
  const activeNote = layers.find((l) => l.id === layer)!.note;

  // Ranked for the table. Without a chosen sort this follows the active layer —
  // by party on the government layer, by rate on the hate-crime layer — which is
  // the order each layer is actually read in. A chosen column overrides that.
  const ranked = useMemo(() => {
    const rows = regions.regions.map((r) => ({
      id: r.id,
      name: shortName(r.id, r.name),
      cell: cells[r.id],
      hate: hate.territories[r.id],
      gov: GOVERNMENTS.find((g) => g.id === r.id),
    }));

    if (!sort) {
      return layer === "hate"
        ? rows.sort((a, b) => (b.hate?.ratePer100k ?? 0) - (a.hate?.ratePer100k ?? 0))
        : rows.sort(
            (a, b) =>
              (a.gov?.partyLabel ?? "").localeCompare(b.gov?.partyLabel ?? "") ||
              a.name.localeCompare(b.name),
          );
    }

    type Row = (typeof rows)[number];
    // A territory with no record in the report has no value in three of these
    // columns, and `null` is not zero: sorting it as zero would place it below
    // every real figure descending and above every one ascending, in both cases
    // making an absence look like a measurement. It sorts last either way.
    const numeric: Record<string, (r: Row) => number | null> = {
      recorded: (r) => r.hate?.total ?? null,
      rate: (r) => r.hate?.ratePer100k ?? null,
      sogi: (r) => r.hate?.sexualOrientationGenderIdentity ?? null,
    };
    const text: Record<string, (r: Row) => string> = {
      name: (r) => r.name,
      president: (r) => r.gov?.president ?? "",
    };

    const flip = sort.dir === "asc" ? 1 : -1;
    return rows.sort((a, b) => {
      const num = numeric[sort.key];
      if (num) {
        const x = num(a);
        const y = num(b);
        if (x === null && y === null) return a.name.localeCompare(b.name);
        if (x === null) return 1;
        if (y === null) return -1;
        return (x - y) * flip || a.name.localeCompare(b.name);
      }
      const get = text[sort.key];
      return get(a).localeCompare(get(b), bcp47) * flip || a.name.localeCompare(b.name);
    });
  }, [regions, cells, hate, layer, sort, bcp47]);

  const order = useMemo(() => gridOrder(regions.regions), [regions]);
  const regionById = useMemo(
    () => new Map(regions.regions.map((r) => [r.id, r])),
    [regions],
  );

  // What the cursor announces for a territory, on the active layer.
  const items = order.ids.map((id) => {
    if (layer === "gov") {
      const g = GOVERNMENTS.find((x) => x.id === id);
      const inv = investitureFor(id);
      return say(
        nameOf(id),
        g ? g.partyLabel : M.noData,
        g && `${M.rowPresident}: ${g.president}`,
        inv.status === "vox-decisive" && M.hatchDecisive,
        inv.status === "pp-short-alone" && M.hatchShort,
      );
    }
    const h = hate.territories[id];
    return say(
      nameOf(id),
      h ? `${rate(h.ratePer100k, bcp47)} ${M.perHundredThousand}` : M.noData,
      h && `${M.rowRecorded}: ${integer(h.total, bcp47)}`,
    );
  });

  const sources: ChartSource[] = useMemo(() => {
    const geometry: ChartSource = {
      publisher: regions.source.body,
      name: regions.source.licence,
      period: formatDate(regions.source.retrieved.slice(0, 10), bcp47),
      url: regions.source.url,
      asOf: regions.source.retrieved.slice(0, 10),
    };
    if (layer === "hate") {
      return [
        {
          publisher: hate.source.body,
          name: `${hate.source.report} (${M.tablesLabel} ${hate.source.tables.join(", ")})`,
          period: String(hate.year),
          url: hate.source.url,
        },
        geometry,
      ];
    }
    // The hatches rest on dated investiture records, each with its own source.
    const hatched = regions.regions
      .map((r) => investitureFor(r.id))
      .filter((f) => f.status === "vox-decisive" || f.status === "pp-short-alone");
    const records = hatched
      .filter((f, i) => hatched.findIndex((g) => g.investiture?.source.url === f.investiture?.source.url) === i)
      .map((f): ChartSource => {
        const inv = f.investiture!;
        const date = f.decidingRound?.date ?? inv.electionDate;
        return {
          publisher: inv.source.publisher,
          name: inv.source.title,
          period: formatDate(date, bcp47),
          url: inv.source.url,
          asOf: date,
        };
      });
    return [
      {
        publisher: "Wikipedia (es)",
        name: GOVERNMENTS_SOURCE.body,
        period: `${M.checkedLabel} ${formatDate(GOVERNMENTS_SOURCE.checked, bcp47)}`,
        url: GOVERNMENTS_SOURCE.url,
        asOf: GOVERNMENTS_SOURCE.checked,
      },
      ...records,
      geometry,
    ];
  }, [layer, regions, hate, M, bcp47]);

  const layerLabel = layer === "gov" ? M.layerGov : M.layerHate;

  // The image: the map as drawn, and every territory's value beside it, in the
  // order the table below is in — the image ranks nothing the page does not.
  const image: ChartExport = (() => {
    const shapes: ExportShape[] = [
      {
        d: `M${regions.insetBox.x} ${regions.insetBox.y}h${regions.insetBox.w}v${regions.insetBox.h}h${-regions.insetBox.w}Z`,
        fill: "none",
        stroke: "var(--line)",
        strokeWidth: 1,
      },
    ];
    const S = 11;
    const square = (r: RegionsFile["regions"][number]) =>
      `M${r.centroid[0] - S / 2} ${r.centroid[1] - S / 2}h${S}v${S}h${-S}Z`;
    for (const r of regions.regions) {
      shapes.push({
        d: r.tiny ? square(r) : r.d,
        fill: cells[r.id].fill,
        stroke: "var(--map-edge)",
        strokeWidth: 0.8,
      });
    }
    if (layer === "gov") {
      for (const r of regions.regions) {
        const f = investitureFor(r.id);
        if (f.status !== "vox-decisive" && f.status !== "pp-short-alone") continue;
        shapes.push({
          d: r.tiny ? square(r) : r.d,
          fill: "none",
          hatch: f.status === "vox-decisive" ? HATCH_DECISIVE : HATCH_SHORT,
        });
      }
    }
    const labels: ExportLabel[] = [
      {
        x: regions.insetBox.x,
        y: regions.insetBox.y - 18,
        text: "CANARIAS",
        size: 11,
        weight: 600,
        face: "heading",
        tone: "ink-3",
      },
      ...regions.regions
        .filter((r) => r.tiny)
        .map((r): ExportLabel => {
          const below = r.centroid[1] + S + 10 < regions.viewBox.height;
          return {
            x: r.centroid[0],
            y: below ? r.centroid[1] + S / 2 + 2 : r.centroid[1] - S / 2 - 16,
            text: nameOf(r.id),
            align: "center",
            size: 11,
            weight: 600,
            face: "heading",
            tone: "ink-3",
          };
        }),
    ];

    const legend =
      layer === "gov"
        ? [
            ...[...new Map(
              GOVERNMENTS.filter((g) => g.partyNif && PARTIES[g.partyNif]).map((g) => [
                g.partyLabel,
                PARTIES[g.partyNif!]!.color,
              ]),
            )].map(([label, color]) => ({ label, color })),
            { label: M.hatchDecisive, color: null, hatch: HATCH_DECISIVE },
            { label: M.hatchShort, color: null, hatch: HATCH_SHORT },
          ]
        : (() => {
            const rated = Object.values(hate.territories).map((h) => h.ratePer100k);
            const lo = Math.min(...rated);
            return [
              { label: `${rate(lo, bcp47)} ${M.perHundredThousand}`, color: `color-mix(in oklab, var(--gold) ${((0.16 + (lo / maxRate) * 0.84) * 100).toFixed(1)}%, var(--ramp-low))` },
              { label: `${rate(maxRate, bcp47)} ${M.perHundredThousand}`, color: "var(--gold)" },
              ...(regions.regions.some((r) => !hate.territories[r.id])
                ? [{ label: M.noData, color: "var(--grey-300)" }]
                : []),
            ];
          })();

    return {
      ...exportMeta(C, bcp47, {
        title: `${M.title}: ${layerLabel.toLowerCase()}`,
        caption: activeNote,
        sources,
        datedBy: sources.slice(0, 1),
        file: layer === "gov" ? "mapa-gobiernos-autonomicos" : "mapa-delitos-de-odio",
      }),
      legend,
      body: {
        kind: "shapes",
        width: regions.viewBox.width,
        height: regions.viewBox.height,
        shapes,
        labels,
        aside: {
          title: layer === "gov" ? M.rowParty : M.colRate,
          rows: ranked.map((row) => ({
            label: row.name,
            value:
              layer === "gov"
                ? (row.gov?.partyLabel ?? M.noData)
                : row.hate
                  ? rate(row.hate.ratePer100k, bcp47)
                  : M.noData,
            color: row.cell.fill,
          })),
        },
      },
    };
  })();

  const region = (id: string, index: number) => {
    const r = regionById.get(id)!;
    const c = cells[r.id];
    const isSel = r.id === selected;
    const shared = {
      fill: c.fill,
      stroke: isSel ? "var(--ink)" : "var(--map-edge)",
      strokeWidth: isSel ? 1.8 : 0.8,
      className: "region",
      role: "gridcell",
      "aria-selected": isSel,
      "aria-label": nameOf(r.id),
      "data-chart-item": index,
      onClick: () => setSelected(r.id),
      onMouseMove: onMove(r.id),
      onMouseLeave: () => setHover(null),
    };

    // Ceuta and Melilla project to a couple of pixels. Drawing the real
    // outline would leave two territories on the map that cannot be seen,
    // hovered or clicked, so they get a square at their centroid instead -
    // offset below the coast so the two do not overlap Andalucia's edge - with
    // an initial beside it. Everything else about them behaves identically.
    if (r.tiny) {
      const [cx, cy] = r.centroid;
      const S = 11;
      // Melilla's centroid sits 8 units from the bottom of the viewBox, so a
      // label below its marker rendered outside the frame and was clipped
      // away entirely. Flip it above when there is no room beneath.
      const below = cy + S + 10 < regions.viewBox.height;
      const labelY = below ? cy + S + 8 : cy - S / 2 - 5;
      return (
        <g key={r.id}>
          <rect x={cx - S / 2} y={cy - S / 2} width={S} height={S} {...shared} />
          <text
            x={cx}
            y={labelY}
            textAnchor="middle"
            aria-hidden
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: 9.5,
              fill: "var(--ink-3)",
              pointerEvents: "none",
            }}
          >
            {nameOf(r.id)}
          </text>
        </g>
      );
    }

    return <path key={r.id} d={r.d} {...shared} />;
  };

  const rowIds = [...new Set(order.rows)];

  return (
    <div>
      {/* Layer switch */}
      <div className="flex flex-wrap gap-1.5">
        {layers.map((l) => (
          <button
            key={l.id}
            type="button"
            aria-pressed={layer === l.id}
            onClick={() => setLayer(l.id)}
            className="layer-btn"
          >
            {l.label}
          </button>
        ))}
      </div>
      <p
        className="mt-2"
        style={{ fontSize: "11.5px", lineHeight: 1.45, color: "var(--ink-3)", maxWidth: "66ch" }}
      >
        {activeNote}
      </p>

      {/* The overlay's own legend. Two densities, two different strengths
          of claim, so the difference is stated rather than left to be
          inferred from how dark a shape looks. */}
      {layer === "gov" && (
        <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5">
          {[
            {
              label: M.hatchDecisive,
              bg:
                "repeating-linear-gradient(45deg, color-mix(in srgb, var(--ink) 34%, transparent) 0 2px, transparent 2px 6px)",
            },
            {
              label: M.hatchShort,
              bg:
                "repeating-linear-gradient(45deg, color-mix(in srgb, var(--ink) 22%, transparent) 0 1.5px, transparent 1.5px 10px)",
            },
          ].map((h) => (
            <li key={h.label} className="flex items-center gap-2">
              <span
                aria-hidden
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 1,
                  flex: "none",
                  border: "1px solid var(--line)",
                  backgroundImage: h.bg,
                }}
              />
              <span className="label-mono">{h.label}</span>
            </li>
          ))}
        </ul>
      )}

      <div
        className="mt-3 grid border border-[var(--line)]"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0, 306px)" }}
      >
        {/* Map */}
        <div ref={frame} className="relative min-w-0 p-3">
          {/* The ARIA grid pattern: one tab stop for the whole map, arrow keys
              between territories (rows from gridOrder above), and the
              selection follows the cursor as it used to follow focus. */}
          <ChartReader
            items={items}
            rows={order.rows}
            start={Math.max(0, order.ids.indexOf(selected))}
            onActiveChange={(i) => setSelected(order.ids[i])}
            {...readerProps(C, bcp47, {
              title: `${M.svgLabel}: ${layerLabel}`,
              count: order.ids.length,
              grid: true,
            })}
          >
            <svg
              viewBox={`0 0 ${regions.viewBox.width} ${regions.viewBox.height}`}
              className="block h-auto w-full"
              role="none"
            >
              <defs>
                {/* Two densities on purpose. The solid hatch marks an
                    investiture whose recorded tally shows Vox supplied votes
                    the winning total needed; the sparse one marks a community
                    where only the seat arithmetic is verified here. Drawing
                    both the same would present the weaker claim as the
                    stronger one. */}
                <pattern id="hatch-decisive" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                  <rect width="2" height="6" fill="var(--ink)" opacity="0.34" />
                </pattern>
                <pattern id="hatch-short" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                  <rect width="1.5" height="10" fill="var(--ink)" opacity="0.22" />
                </pattern>
              </defs>

              {/* The Canaries are drawn to their own scale, so the box says so
                  rather than letting them read as part of the same projection. */}
              <rect
                x={regions.insetBox.x}
                y={regions.insetBox.y}
                width={regions.insetBox.w}
                height={regions.insetBox.h}
                fill="none"
                stroke="var(--line)"
              />
              <text
                x={regions.insetBox.x}
                y={regions.insetBox.y - 6}
                aria-hidden
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: 9.5,
                  letterSpacing: 1.4,
                  fill: "var(--ink-3)",
                }}
              >
                CANARIAS
              </text>

              {rowIds.map((row) => (
                <g key={row} role="row">
                  {order.ids.map((id, i) => (order.rows[i] === row ? region(id, i) : null))}
                </g>
              ))}

              {/* Drawn after every region so it sits above their fills, and
                  only on the government layer — the hate-crime ramp is a
                  different question and an overlay there would imply a link
                  between the two that nothing here supports.

                  pointerEvents none so the region underneath stays hoverable
                  and clickable: the overlay is a mark, not a target. */}
              {layer === "gov" &&
                regions.regions.map((r) => {
                  const f = investitureFor(r.id);
                  if (f.status !== "vox-decisive" && f.status !== "pp-short-alone") {
                    return null;
                  }
                  const fill =
                    f.status === "vox-decisive"
                      ? "url(#hatch-decisive)"
                      : "url(#hatch-short)";
                  const [cx, cy] = r.centroid;
                  const S = 11;
                  return r.tiny ? (
                    <rect
                      key={`ov-${r.id}`}
                      x={cx - S / 2}
                      y={cy - S / 2}
                      width={S}
                      height={S}
                      fill={fill}
                      pointerEvents="none"
                    />
                  ) : (
                    <path
                      key={`ov-${r.id}`}
                      d={r.d}
                      fill={fill}
                      pointerEvents="none"
                    />
                  );
                })}
            </svg>
          </ChartReader>

          {hover && (
            <div
              role="presentation"
              className="pointer-events-none absolute z-10"
              style={{
                // Clamped to the frame so a territory at the right edge does
                // not push the tooltip out of the panel.
                left: Math.min(hover.x + 12, (frame.current?.clientWidth ?? 0) - 240),
                top: Math.max(hover.y - 12, 0),
                maxWidth: 230,
                background: "var(--ink)",
                color: "var(--bg)",
                borderRadius: 2,
                padding: "7px 10px",
                fontSize: 12,
                lineHeight: 1.35,
              }}
            >
              <b
                className="block"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 13.5 }}
              >
                {nameOf(hover.id)}
              </b>
              <span className="mono">
                {layer === "gov"
                  ? cells[hover.id].value
                  : `${cells[hover.id].value} ${M.perHundredThousand}`}
              </span>
            </div>
          )}
        </div>

        {/* Drill-down */}
        <aside
          className="border-l border-[var(--line)] bg-[var(--surface)] px-4 pb-5 pt-3.5"
        >
          <h3 className="display text-[19px] font-semibold" style={{ letterSpacing: "-0.01em" }}>
            {sel ? shortName(sel.id, sel.name) : "—"}
          </h3>
          <p className="label-mono mt-1">{M.panelKicker}</p>
          {/* The legal name, which the short label above drops. */}
          <p className="mt-2" style={{ fontSize: "11.5px", color: "var(--ink-3)" }}>
            {sel?.name}
          </p>

          <dl className="mt-3">
            {[
              { k: M.rowPresident, v: selGov?.president ?? M.noData },
              { k: M.rowParty, v: selGov?.partyLabel ?? M.noData },
              {
                k: M.rowSince,
                v: selGov ? formatDate(selGov.since, bcp47) : M.noData,
              },
              {
                k: M.rowRecorded,
                v: selHate ? integer(selHate.total, bcp47) : M.noData,
              },
              {
                k: M.rowRate,
                v: selHate ? rate(selHate.ratePer100k, bcp47) : M.noData,
              },
            ].map((row) => (
              <div
                key={row.k}
                className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] py-[7px]"
                style={{ fontSize: "13px" }}
              >
                <dt style={{ color: "var(--ink-3)" }}>{row.k}</dt>
                <dd className="mono text-right">{row.v}</dd>
              </div>
            ))}
          </dl>

          {/* The investiture, where this layer has a finding. Placed with
              the government rows because that is the layer it marks, and
              stated as a fact about a dated vote rather than about who sits
              in a cabinet now. */}
          {selInv.investiture && selInv.status !== "pp-majority" && (
            <div className="mt-4 border-t border-[var(--line)] pt-3">
              <p className="label-mono">{M.investitureTitle}</p>
              <p className="mt-2" style={{ fontSize: "12.5px", lineHeight: 1.55 }}>
                {(selInv.status === "vox-decisive"
                  ? M.investitureDecisive
                  : M.investitureShort
                )
                  .replace("{pp}", integer(selInv.investiture.seatsPP, bcp47))
                  .replace("{seats}", integer(selInv.investiture.chamberSeats, bcp47))
                  .replace("{majority}", integer(selInv.majority, bcp47))
                  .replace("{vox}", integer(selInv.investiture.seatsVox, bcp47))
                  .replace(
                    "{voxVotes}",
                    integer(selInv.voxVotesFor, bcp47),
                  )
                  .replace(
                    "{date}",
                    selInv.decidingRound
                      ? formatDate(selInv.decidingRound.date, bcp47)
                      : "",
                  )
                  .replace(
                    "{for}",
                    selInv.decidingRound
                      ? integer(selInv.decidingRound.votesFor, bcp47)
                      : "",
                  )
                  .replace(
                    "{against}",
                    selInv.decidingRound
                      ? integer(selInv.decidingRound.votesAgainst, bcp47)
                      : "",
                  )}
              </p>
              {/* Every failed round too, because Murcia's two rejections
                  are the substance of its record. */}
              {selInv.investiture.rounds.length > 1 && (
                <ul className="mt-2 flex flex-col gap-0.5">
                  {selInv.investiture.rounds.map((r) => (
                    <li
                      key={r.date}
                      style={{ fontSize: "11px", color: "var(--ink-3)" }}
                    >
                      <span className="mono">{formatDate(r.date, bcp47)}</span> ·{" "}
                      <span className="mono">
                        {integer(r.votesFor, bcp47)}–{integer(r.votesAgainst, bcp47)}
                      </span>{" "}
                      · {r.succeeded ? M.investitureCarried : M.investitureFailed}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2" style={{ fontSize: "10.5px", lineHeight: 1.45, color: "var(--ink-3)" }}>
                <a
                  className="src"
                  href={selInv.investiture.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {selInv.investiture.source.title} ↗
                </a>
              </p>
            </div>
          )}

          {selHate && (
            <div className="mt-4">
              {[
                {
                  label: M.barSogi,
                  n: selHate.sexualOrientationGenderIdentity,
                  colour: "var(--verd)",
                },
                { label: M.barRacism, n: selHate.racism, colour: "var(--gold)" },
              ].map((b) => (
                <div key={b.label} className="mt-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span style={{ fontSize: "11.5px", color: "var(--ink-3)" }}>{b.label}</span>
                    <span className="mono" style={{ fontSize: "11.5px" }}>
                      {integer(b.n, bcp47)}
                    </span>
                  </div>
                  <Bar
                    className="mt-1"
                    segments={[{ value: b.n, color: b.colour, label: b.label }]}
                    total={Math.max(1, selHate.total)}
                    scale="share"
                    size="sm"
                  />
                </div>
              ))}
              <p className="mt-2" style={{ fontSize: "10.5px", lineHeight: 1.45, color: "var(--ink-3)" }}>
                {M.barsNote}
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Every value as text, in the order the active layer is read in. This is
          not a fallback for the map: a choropleth cannot be read to the
          precision of a number, and nineteen figures are worth having. */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <caption
            className="pb-3 text-left"
            style={{ fontSize: "12px", lineHeight: 1.55, color: "var(--ink-2)", maxWidth: "88ch" }}
          >
            {sort ? M.tableCaptionSorted : M.tableCaption}
          </caption>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              <SortHeader
                sortKey="name"
                label={M.colTerritory}
                sort={sort}
                onSort={toggleSort}
                className="py-2 pr-3 text-left"
                align="left"
                hint={M.sortHint}
              />
              <SortHeader
                sortKey="president"
                label={M.rowPresident}
                sort={sort}
                onSort={toggleSort}
                className="py-2 pr-3 text-left"
                align="left"
                hint={M.sortHint}
              />
              <SortHeader
                sortKey="recorded"
                label={M.rowRecorded}
                sort={sort}
                onSort={toggleSort}
                className="whitespace-nowrap py-2 pl-4 text-right"
                align="right"
                hint={M.sortHint}
              />
              <SortHeader
                sortKey="rate"
                label={M.colRate}
                sort={sort}
                onSort={toggleSort}
                className="whitespace-nowrap py-2 pl-4 text-right"
                align="right"
                hint={M.sortHint}
              />
              <SortHeader
                sortKey="sogi"
                label={M.barSogi}
                sort={sort}
                onSort={toggleSort}
                className="whitespace-nowrap py-2 pl-4 text-right"
                align="right"
                hint={M.sortHint}
              />
            </tr>
          </thead>
          <tbody>
            {ranked.map((row) => (
              <tr
                key={row.id}
                style={{
                  borderBottom: "1px solid var(--line-soft)",
                  background: row.id === selected ? "var(--surface)" : undefined,
                }}
              >
                <th scope="row" className="py-2 pr-3 text-left font-normal">
                  <span className="flex items-center gap-2">
                    <span
                      className="dot"
                      aria-hidden
                      style={{ width: 9, height: 9, background: row.cell.fill, ...fillEdge(row.cell.fill) }}
                    />
                    {row.name}
                  </span>
                </th>
                <td className="py-2 pr-3" style={{ color: "var(--ink-2)" }}>
                  {row.gov ? `${row.gov.president} · ${row.gov.partyLabel}` : M.noData}
                </td>
                <td className="mono py-2 text-right">
                  {row.hate ? integer(row.hate.total, bcp47) : M.noData}
                </td>
                <td className="mono py-2 text-right">
                  {row.hate ? rate(row.hate.ratePer100k, bcp47) : M.noData}
                </td>
                <td className="mono py-2 text-right" style={{ color: "var(--verd-text)" }}>
                  {row.hate ? integer(row.hate.sexualOrientationGenderIdentity, bcp47) : M.noData}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ExportButton className="mt-4" spec={image} {...exportLabels(C, layerLabel)} />

      {/* Sources and limits */}
      <div className="mt-6 border-t border-[var(--line)] pt-4">
        <p className="label-mono">{M.sourcesTitle}</p>
        <ul className="mt-2 flex flex-col gap-1.5" style={{ fontSize: "12px", lineHeight: 1.55 }}>
          <li>
            <a className="src" href={hate.source.url} target="_blank" rel="noopener noreferrer">
              {hate.source.body} · {hate.source.report} ↗
            </a>{" "}
            <span style={{ color: "var(--ink-3)" }}>
              {M.tablesLabel} {hate.source.tables.join(", ")}
            </span>
          </li>
          <li>
            <a
              className="src"
              href={GOVERNMENTS_SOURCE.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {GOVERNMENTS_SOURCE.body} ↗
            </a>{" "}
            <span style={{ color: "var(--ink-3)" }}>
              {M.checkedLabel} {formatDate(GOVERNMENTS_SOURCE.checked, bcp47)}
            </span>
          </li>
          <li>
            <a className="src" href={regions.source.url} target="_blank" rel="noopener noreferrer">
              {regions.source.body} ↗
            </a>{" "}
            <span style={{ color: "var(--ink-3)" }}>{regions.source.licence}</span>
          </li>
        </ul>
        <p
          className="mt-3"
          style={{ fontSize: "12px", lineHeight: 1.6, color: "var(--ink-2)", maxWidth: "88ch" }}
        >
          {M.limits}
        </p>
        <p
          className="mt-2"
          style={{ fontSize: "12px", lineHeight: 1.6, color: "var(--ink-3)", maxWidth: "88ch" }}
        >
          {M.missingLayers}
        </p>
      </div>
    </div>
  );
}

/**
 * One sortable column heading.
 *
 * `aria-sort` on the cell is what a screen reader announces, and the button
 * inside it is what makes the heading operable by keyboard — a `<th>` with a
 * click handler is neither. The caret is `aria-hidden` because `aria-sort`
 * already carries the same fact in a form assistive technology understands.
 */
function SortHeader({
  sortKey,
  label,
  sort,
  onSort,
  className,
  align,
  hint,
}: {
  sortKey: SortKey;
  label: string;
  sort: { key: SortKey; dir: "asc" | "desc" } | null;
  onSort: (key: SortKey) => void;
  className: string;
  align: "left" | "right";
  /** Names the action for a mouse user, who gets no `aria-sort`. */
  hint: string;
}) {
  const active = sort?.key === sortKey;
  return (
    <th
      scope="col"
      className={`label-mono ${className}`}
      aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        title={hint.replace("{column}", label)}
        className={`label-mono flex w-full items-center gap-1.5 hover:text-[var(--gold-deep)] ${
          align === "right" ? "justify-end" : ""
        }`}
        style={{ color: active ? "var(--gold-deep)" : undefined }}
      >
        {label}
        <span aria-hidden style={{ opacity: active ? 1 : 0.7, fontSize: "10px" }}>
          {active && sort!.dir === "asc" ? "\u25b2" : "\u25bc"}
        </span>
      </button>
    </th>
  );
}
