import type {
  ChartExport,
  ExportAside,
  ExportBarRow,
  ExportGridRow,
  ExportHatch,
  ExportLabel,
  ExportLegendItem,
} from "@/lib/chart-export";
import { stripeInk, type Stripe } from "./Bar";
import { needsDarkEdge } from "@/lib/chart-colors";

/**
 * Draws a chart's export description (`lib/chart-export.ts`) to a PNG.
 *
 * 1200 × 675, the 16:9 a feed shows uncropped, drawn at 2× so text stays sharp
 * when the image is zoomed. The frame is laid out from the bottom up: the
 * footer — data date, sources, site address — is measured and placed first, and
 * the chart gets whatever height is left. So a long title or a chart with many
 * rows can only ever squeeze the chart, never push the source or the date off
 * the image. Text is wrapped and, if it must, set smaller; it is never cut.
 *
 * Colours and faces are read from the page at the moment of export, so the
 * image takes the reader's theme and the site's own fonts. The faces are the
 * ones next/font has already loaded for the page; `document.fonts.load` waits
 * for them, and if one is unavailable the canvas falls back through the same
 * stack the page declares (Garamond, then Georgia and the generic serif), which
 * is a deliberate, legible fallback rather than a system sans.
 */

export const IMAGE_WIDTH = 1200;
export const IMAGE_HEIGHT = 675;
export const IMAGE_SCALE = 2;

const PAD_X = 56;
const PAD_TOP = 46;
const PAD_BOTTOM = 30;
const CONTENT_W = IMAGE_WIDTH - PAD_X * 2;

interface Theme {
  bg: string;
  ink: string;
  ink2: string;
  ink3: string;
  line: string;
  track: string;
  accent: string;
  heading: string;
  body: string;
  color: (css: string) => string;
}

type Ctx = CanvasRenderingContext2D;
type Box = { x: number; y: number; w: number; h: number };

export async function renderChartImage(spec: ChartExport, address: string): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = IMAGE_WIDTH * IMAGE_SCALE;
  canvas.height = IMAGE_HEIGHT * IMAGE_SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2D canvas context");

  const probe = document.createElement("span");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden";
  document.body.appendChild(probe);
  try {
    const theme = readTheme(probe);
    await loadFonts(theme);
    ctx.setTransform(IMAGE_SCALE, 0, 0, IMAGE_SCALE, 0, 0);
    draw(ctx, theme, spec, address);
  } finally {
    probe.remove();
  }

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("canvas.toBlob returned nothing"))),
      "image/png",
    ),
  );
}

/* ------------------------------------------------------------------ theme */

function readTheme(probe: HTMLElement): Theme {
  const cache = new Map<string, string>();
  const color = (css: string) => {
    const hit = cache.get(css);
    if (hit) return hit;
    probe.style.color = "";
    probe.style.color = css;
    // An unparseable value leaves style.color empty; keep the input so the
    // canvas at least tries it, rather than silently painting black.
    const out = probe.style.color ? getComputedStyle(probe).color : css;
    cache.set(css, out);
    return out;
  };
  const family = (css: string, fallback: string) => {
    probe.style.fontFamily = css;
    return getComputedStyle(probe).fontFamily || fallback;
  };
  return {
    bg: color("var(--bg)"),
    ink: color("var(--ink)"),
    ink2: color("var(--ink-2)"),
    ink3: color("var(--ink-3)"),
    line: color("var(--line)"),
    track: color("var(--track)"),
    accent: color("var(--gold-deep)"),
    heading: family("var(--font-heading)", 'Garamond, Georgia, serif'),
    body: family("var(--font-body)", "Georgia, serif"),
    color,
  };
}

async function loadFonts(t: Theme) {
  if (!("fonts" in document)) return;
  const wanted = [400, 600].flatMap((w) => [`${w} 20px ${t.heading}`, `${w} 20px ${t.body}`]);
  // A face that fails to load leaves the stack's fallback in place; the image
  // is still made.
  await Promise.all(wanted.map((f) => document.fonts.load(f).catch(() => []))).catch(() => {});
}

/* ------------------------------------------------------------------- text */

function setFont(ctx: Ctx, t: Theme, size: number, weight = 400, face: "heading" | "body" = "body") {
  ctx.font = `${weight} ${size}px ${face === "heading" ? t.heading : t.body}`;
}

/** Greedy word wrap. A word longer than the line keeps a line of its own. */
function wrap(ctx: Ctx, text: string, width: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > width) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

/**
 * The largest of `sizes` at which `text` wraps into `maxLines`; failing that,
 * the smallest, with as many lines as it needs. Never truncates.
 */
function fit(
  ctx: Ctx,
  t: Theme,
  text: string,
  width: number,
  maxLines: number,
  sizes: number[],
  weight = 400,
  face: "heading" | "body" = "body",
): { size: number; lines: string[] } {
  for (const size of sizes) {
    setFont(ctx, t, size, weight, face);
    const lines = wrap(ctx, text, width);
    if (lines.length <= maxLines) return { size, lines };
  }
  const size = sizes[sizes.length - 1];
  setFont(ctx, t, size, weight, face);
  return { size, lines: wrap(ctx, text, width) };
}

function host(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/* ------------------------------------------------------------------ frame */

function draw(ctx: Ctx, t: Theme, spec: ChartExport, address: string) {
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
  ctx.textBaseline = "top";

  // The newsprint rule the site opens its sections with.
  ctx.fillStyle = t.ink;
  ctx.fillRect(PAD_X, 26, CONTENT_W, 2);

  let y = PAD_TOP;

  const title = fit(ctx, t, spec.title, CONTENT_W, 2, [34, 31, 28, 25], 600, "heading");
  setFont(ctx, t, title.size, 600, "heading");
  ctx.fillStyle = t.ink;
  for (const l of title.lines) {
    ctx.fillText(l, PAD_X, y);
    y += title.size * 1.12;
  }
  y += 6;

  const caption = fit(ctx, t, spec.caption, CONTENT_W, 3, [17, 16, 15, 14]);
  setFont(ctx, t, caption.size);
  ctx.fillStyle = t.ink2;
  for (const l of caption.lines) {
    ctx.fillText(l, PAD_X, y);
    y += caption.size * 1.4;
  }
  y += 12;

  // Footer, measured before anything is drawn in the middle.
  const sourceText = `${spec.sourceLabel}: ${spec.sources
    .map((s) => {
      const h = host(s.url);
      return `${s.publisher} ${s.name} (${s.period})${h ? ` — ${h}` : ""}`;
    })
    .join(" · ")}`;
  const sources = fit(ctx, t, sourceText, CONTENT_W, 3, [13, 12, 11]);
  const sourceLineH = sources.size * 1.4;

  // The data date wraps like everything else; the address sits beside it when
  // there is room and on its own line when there is not.
  setFont(ctx, t, 14);
  const addressW = ctx.measureText(address).width;
  let asOf = fit(ctx, t, spec.asOf, CONTENT_W - addressW - 24, 1, [14, 13], 600);
  const sameLine = asOf.lines.length === 1;
  if (!sameLine) asOf = fit(ctx, t, spec.asOf, CONTENT_W, 2, [14, 13, 12], 600);
  const asOfLineH = asOf.size * 1.4;
  const metaH = asOf.lines.length * asOfLineH + (sameLine ? 0 : 20);

  const footerH = 12 + metaH + 4 + sources.lines.length * sourceLineH;
  const footerTop = IMAGE_HEIGHT - PAD_BOTTOM - footerH;

  ctx.fillStyle = t.line;
  ctx.fillRect(PAD_X, footerTop, CONTENT_W, 1);
  let fy = footerTop + 12;
  setFont(ctx, t, asOf.size, 600);
  ctx.fillStyle = t.ink;
  asOf.lines.forEach((l, k) => ctx.fillText(l, PAD_X, fy + k * asOfLineH));
  setFont(ctx, t, 14);
  ctx.fillStyle = t.ink2;
  if (sameLine) {
    ctx.textAlign = "right";
    ctx.fillText(address, PAD_X + CONTENT_W, fy);
    ctx.textAlign = "left";
  } else {
    ctx.fillText(address, PAD_X, fy + asOf.lines.length * asOfLineH);
  }
  fy += metaH + 4;
  setFont(ctx, t, sources.size);
  ctx.fillStyle = t.ink3;
  for (const l of sources.lines) {
    ctx.fillText(l, PAD_X, fy);
    fy += sourceLineH;
  }

  if (spec.legend?.length) y = drawLegend(ctx, t, spec.legend, y) + 10;

  const box: Box = { x: PAD_X, y, w: CONTENT_W, h: Math.max(40, footerTop - 16 - y) };
  const body = spec.body;
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x - 4, box.y - 4, box.w + 8, box.h + 8);
  ctx.clip();
  if (body.kind === "bars") drawBars(ctx, t, body.rows, body.axis, box);
  else if (body.kind === "grid") drawGrid(ctx, t, body.rows, box);
  else drawShapes(ctx, t, body, box);
  ctx.restore();
}

/**
 * The 1px inner edge `fillEdge()` draws on the page around a party colour
 * that is under 3:1 against the dark grounds. `--fill-edge` is transparent in
 * the light theme, so this draws nothing there, exactly as on the page.
 */
function fillEdge(ctx: Ctx, t: Theme, color: string | null | undefined, x: number, y: number, w: number, h: number) {
  if (!color || !needsDarkEdge(color) || w < 2 || h < 2) return;
  ctx.save();
  ctx.strokeStyle = t.color("var(--fill-edge)");
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.restore();
}

function swatch(ctx: Ctx, t: Theme, item: ExportLegendItem, x: number, y: number, s: number) {
  if (item.color) {
    ctx.fillStyle = t.color(item.color);
    ctx.fillRect(x, y, s, s);
    fillEdge(ctx, t, item.color, x, y, s, s);
  }
  const hatch = item.hatch ?? stripeHatch(item.striped, 4);
  if (hatch) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, s, s);
    ctx.clip();
    drawHatch(ctx, t, hatch, x, y, s, s);
    ctx.restore();
  }
  if (!item.color || item.hatch) {
    ctx.strokeStyle = t.ink3;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
  }
}

function drawLegend(ctx: Ctx, t: Theme, items: ExportLegendItem[], top: number): number {
  const S = 12;
  setFont(ctx, t, 13);
  let x = PAD_X;
  let y = top;
  for (const item of items) {
    const w = S + 7 + ctx.measureText(item.label).width;
    if (x > PAD_X && x + w > PAD_X + CONTENT_W) {
      x = PAD_X;
      y += 20;
    }
    swatch(ctx, t, item, x, y + 2, S);
    ctx.fillStyle = t.ink2;
    ctx.fillText(item.label, x + S + 7, y);
    x += w + 20;
  }
  return y + 18;
}

/* ---------------------------------------------------------------- hatches */

function stripeHatch(striped: Stripe | undefined, period = 6): ExportHatch | undefined {
  return striped ? { ink: stripeInk(striped), line: period / 2, period } : undefined;
}

/** 45° lines across a box; the caller has clipped to the shape. */
function drawHatch(ctx: Ctx, t: Theme, h: ExportHatch, x: number, y: number, w: number, hh: number) {
  ctx.save();
  ctx.strokeStyle = t.color(h.ink);
  ctx.lineWidth = h.line;
  ctx.beginPath();
  const step = h.period * Math.SQRT2;
  for (let k = -hh; k < w + step; k += step) {
    ctx.moveTo(x + k, y + hh);
    ctx.lineTo(x + k + hh, y);
  }
  ctx.stroke();
  ctx.restore();
}

/* ------------------------------------------------------------------- bars */

function drawBars(ctx: Ctx, t: Theme, rows: ExportBarRow[], axis: string | undefined, box: Box) {
  let top = box.y;
  if (axis) {
    setFont(ctx, t, 12, 600, "heading");
    ctx.fillStyle = t.ink3;
    ctx.fillText(axis.toUpperCase(), box.x, top);
    top += 22;
  }
  const avail = box.y + box.h - top;
  const COL_GAP = 40;

  // One column at the largest size that fits; then two, then three. Every row
  // is drawn: a row that does not fit is never dropped, because a chart with
  // its tail cut off is a different chart.
  type Layout = {
    cols: number;
    size: number;
    perCol: number;
    colW: number;
    labelW: number;
    valueW: number;
    labels: string[][];
    heights: number[];
  };
  const measure = (cols: number, s: number): Layout => {
    const colW = (box.w - COL_GAP * (cols - 1)) / cols;
    const labelW = Math.round(colW * (cols === 1 ? 0.36 : 0.42));
    setFont(ctx, t, s);
    const valueW = Math.min(colW * 0.32, Math.max(...rows.map((r) => ctx.measureText(r.value).width)));
    const lineH = s * 1.25;
    const barH = Math.max(6, Math.min(14, Math.round(s * 0.75)));
    const gap = Math.max(3, s * 0.5);
    const labels = rows.map((r) => {
      setFont(ctx, t, s, r.marked ? 600 : 400);
      return wrap(ctx, r.label, labelW);
    });
    const heights = labels.map((l) => Math.max(l.length * lineH, barH) + gap);
    return { cols, size: s, perCol: Math.ceil(rows.length / cols), colW, labelW, valueW, labels, heights };
  };
  const fits = (l: Layout) => {
    for (let c = 0; c < l.cols; c++) {
      const h = l.heights.slice(c * l.perCol, (c + 1) * l.perCol).reduce((n, x) => n + x, 0);
      if (h > avail) return false;
    }
    return true;
  };
  let layout: Layout | null = null;
  for (const [cols, sizes] of [
    [1, [16, 15, 14, 13, 12, 11]],
    [2, [14, 13, 12, 11, 10]],
    [3, [12, 11, 10, 9]],
  ] as const) {
    for (const s of sizes) {
      const l = measure(cols, s);
      if (fits(l)) {
        layout = l;
        break;
      }
    }
    if (layout) break;
  }
  layout ??= measure(3, 9);

  const { size, labels, heights, colW, labelW, valueW, perCol } = layout;
  const lineH = size * 1.25;
  const barH = Math.max(6, Math.min(14, Math.round(size * 0.75)));

  let y = top;
  rows.forEach((r, i) => {
    const col = Math.floor(i / perCol);
    if (i % perCol === 0) y = top;
    const x = box.x + col * (colW + COL_GAP);
    const barX = x + labelW + 14;
    const barW = Math.max(30, x + colW - valueW - 14 - barX);

    if (r.marked) {
      ctx.fillStyle = t.accent;
      ctx.fillRect(x - 10, y, 3, labels[i].length * lineH);
    }
    setFont(ctx, t, size, r.marked ? 600 : 400);
    ctx.fillStyle = t.ink;
    labels[i].forEach((l, k) => ctx.fillText(l, x, y + k * lineH));

    drawBar(ctx, t, barX, y + (lineH - barH) / 2, barW, barH, r);

    setFont(ctx, t, size);
    ctx.fillStyle = t.ink;
    ctx.textAlign = "right";
    ctx.fillText(r.value, x + colW, y);
    ctx.textAlign = "left";
    y += heights[i];
  });
}

function drawBar(ctx: Ctx, t: Theme, x: number, y: number, w: number, h: number, r: ExportBarRow) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 2);
  ctx.fillStyle = t.track;
  ctx.fill();
  ctx.clip();
  // The same arithmetic as `Bar`: in `compare` the row's length is its share
  // of the largest row and the segments divide it; in `share` each segment is
  // its part of `total`. A non-zero segment is at least 2px, as on the page.
  const sum = r.segments.reduce((n, s) => n + s.value, 0);
  const rowShare = r.scale === "compare" ? (r.total > 0 ? sum / r.total : 0) : 1;
  const denominator = r.scale === "compare" ? sum : r.total;
  let cx = x;
  for (const s of r.segments) {
    if (!(s.value > 0)) continue;
    const sw = Math.max(2, denominator > 0 ? (s.value / denominator) * rowShare * w : 0);
    ctx.fillStyle = t.color(s.color);
    ctx.fillRect(cx, y, sw, h);
    fillEdge(ctx, t, s.color, cx, y, sw, h);
    const hatch = stripeHatch(s.striped);
    if (hatch) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx, y, sw, h);
      ctx.clip();
      drawHatch(ctx, t, hatch, cx, y, sw, h);
      ctx.restore();
    }
    cx += sw;
  }
  ctx.restore();
}

/* ------------------------------------------------------------------- grid */

function cell(ctx: Ctx, t: Theme, c: ExportGridRow["cells"][number], x: number, y: number, s: number) {
  if (c.color) {
    ctx.fillStyle = t.color(c.color);
    ctx.fillRect(x, y, s, s);
  }
  const hatch = stripeHatch(c.striped, 4);
  if (hatch) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, s, s);
    ctx.clip();
    drawHatch(ctx, t, hatch, x, y, s, s);
    ctx.restore();
  }
  // Every cell is outlined, filled or not, as on the page: an empty cell is a
  // recorded absence and has to be seen as a cell.
  ctx.strokeStyle = t.ink3;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
}

/** One line per cell, grouped under each row's label. */
function drawGridList(ctx: Ctx, t: Theme, rows: ExportGridRow[], box: Box) {
  const cells = rows.reduce((n, r) => n + r.cells.length, 0);
  let size = 10;
  for (const s of [17, 16, 15, 14, 13, 12, 11, 10]) {
    size = s;
    if (rows.length * (s * 1.2 + 8) + cells * s * 1.5 <= box.h) break;
  }
  const S = Math.round(size * 0.95);
  let y = box.y;
  for (const r of rows) {
    setFont(ctx, t, Math.max(11, size - 3), 600, "heading");
    ctx.fillStyle = t.ink3;
    ctx.fillText(r.label.toUpperCase(), box.x, y);
    y += size * 1.2 + 4;
    for (const c of r.cells) {
      cell(ctx, t, c, box.x, y + (size * 1.25 - S) / 2, S);
      setFont(ctx, t, size);
      ctx.fillStyle = t.ink;
      ctx.fillText(c.text ?? "", box.x + S + 10, y);
      y += size * 1.5;
    }
    y += 4;
  }
}

function drawGrid(ctx: Ctx, t: Theme, rows: ExportGridRow[], box: Box) {
  if (rows.some((r) => r.cells.some((c) => c.text))) return drawGridList(ctx, t, rows, box);
  const most = Math.max(1, ...rows.map((r) => r.cells.length));
  const s = Math.max(12, Math.min(28, box.h / (rows.length * 1.5), (box.w * 0.45) / (most * 1.2)));
  const gap = Math.round(s * 0.2);
  const rowH = s + Math.max(8, s * 0.45);
  const top = box.y + Math.max(0, (box.h - rows.length * rowH) / 2);
  const labelX = box.x + most * (s + gap) + 16;

  rows.forEach((r, i) => {
    const y = top + i * rowH;
    r.cells.forEach((c, k) => {
      cell(ctx, t, c, box.x + k * (s + gap), y, s);
    });
    const size = Math.max(12, Math.min(17, s * 0.7));
    setFont(ctx, t, size);
    ctx.fillStyle = t.ink2;
    ctx.fillText(r.label, labelX, y + (s - size) / 2);
  });
}

/* ----------------------------------------------------------------- shapes */

function drawShapes(
  ctx: Ctx,
  t: Theme,
  body: Extract<ChartExport["body"], { kind: "shapes" }>,
  box: Box,
) {
  const plotW = body.aside ? box.w * 0.6 : box.w;
  const sx = body.stretch ? plotW / body.width : Math.min(plotW / body.width, box.h / body.height);
  const sy = body.stretch ? box.h / body.height : sx;
  const ox = box.x;
  const oy = box.y;
  const S = IMAGE_SCALE;

  for (const shape of body.shapes) {
    const path = new Path2D(shape.d);
    ctx.save();
    ctx.setTransform(S * sx, 0, 0, S * sy, S * ox, S * oy);
    if (shape.fill !== "none") {
      ctx.globalAlpha = shape.opacity ?? 1;
      ctx.fillStyle = t.color(shape.fill);
      ctx.fill(path);
      ctx.globalAlpha = 1;
    }
    if (shape.stroke) {
      ctx.strokeStyle = t.color(shape.stroke);
      ctx.lineWidth = shape.strokeWidth ?? 1;
      ctx.stroke(path);
    }
    if (shape.hatch) {
      ctx.clip(path);
      ctx.setTransform(S, 0, 0, S, 0, 0);
      drawHatch(ctx, t, shape.hatch, ox, oy, body.width * sx, body.height * sy);
    }
    ctx.restore();
  }

  for (const l of body.labels) drawLabel(ctx, t, l, ox + l.x * sx, oy + l.y * sy, sx);

  if (body.aside) {
    const ax = box.x + plotW + 28;
    drawAside(ctx, t, body.aside, { x: ax, y: box.y, w: box.x + box.w - ax, h: box.h });
  }
}

function drawLabel(ctx: Ctx, t: Theme, l: ExportLabel, x: number, y: number, sx: number) {
  const size = l.size ?? 13;
  setFont(ctx, t, size, l.weight ?? 400, l.face ?? "body");
  ctx.fillStyle = l.tone === "ink-3" ? t.ink3 : l.tone === "ink-2" ? t.ink2 : t.ink;
  ctx.textAlign = l.align ?? "left";
  const lines = l.maxWidth ? wrap(ctx, l.text, l.maxWidth * sx) : [l.text];
  lines.forEach((line, k) => ctx.fillText(line, x, y + k * size * 1.15));
  ctx.textAlign = "left";
}

function drawAside(ctx: Ctx, t: Theme, aside: ExportAside, box: Box) {
  let y = box.y;
  if (aside.title) {
    setFont(ctx, t, 12, 600, "heading");
    ctx.fillStyle = t.ink3;
    ctx.fillText(aside.title.toUpperCase(), box.x, y);
    y += 20;
  }
  let size = 10;
  for (const s of [15, 14, 13, 12, 11, 10]) {
    size = s;
    if (aside.rows.length * s * 1.45 <= box.y + box.h - y) break;
  }
  const rowH = size * 1.45;
  for (const r of aside.rows) {
    if (r.color) {
      ctx.fillStyle = t.color(r.color);
      ctx.beginPath();
      ctx.arc(box.x + 5, y + size * 0.55, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    setFont(ctx, t, size);
    ctx.fillStyle = t.ink;
    ctx.fillText(r.label, box.x + 16, y);
    ctx.textAlign = "right";
    ctx.fillText(r.value, box.x + box.w, y);
    ctx.textAlign = "left";
    y += rowH;
  }
}
