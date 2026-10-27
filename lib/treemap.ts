/**
 * A squarified treemap layout (Bruls, Huizing and van Wijk, 2000).
 *
 * Each value gets a rectangle whose area is proportional to it, laid out to
 * keep the rectangles as close to square as the values allow: a long thin
 * sliver is as hard to compare by area as it is to label. The input must be
 * sorted largest first, which is also the order the reader announces.
 *
 * Coordinates are in the caller's units (the subsidy treemap uses 0–100 on
 * both axes and stretches the box with CSS percentages), so the same layout
 * serves the page and the exported image.
 */

export interface TreemapCell<T> {
  item: T;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function squarify<T>(
  items: T[],
  value: (item: T) => number,
  width: number,
  height: number,
): TreemapCell<T>[] {
  const total = items.reduce((s, it) => s + Math.max(0, value(it)), 0);
  if (total <= 0 || width <= 0 || height <= 0) return [];

  // Areas in the box's own units, so the rectangles tile it exactly.
  const scale = (width * height) / total;
  const queue = items
    .map((item) => ({ item, area: Math.max(0, value(item)) * scale }))
    .filter((c) => c.area > 0);

  const out: TreemapCell<T>[] = [];
  let x = 0;
  let y = 0;
  let w = width;
  let h = height;
  let row: typeof queue = [];

  // The worst aspect ratio in a row laid along a side of length `side`.
  const worst = (r: typeof queue, side: number) => {
    const sum = r.reduce((s, c) => s + c.area, 0);
    const max = Math.max(...r.map((c) => c.area));
    const min = Math.min(...r.map((c) => c.area));
    return Math.max((side * side * max) / (sum * sum), (sum * sum) / (side * side * min));
  };

  const place = (r: typeof queue) => {
    const sum = r.reduce((s, c) => s + c.area, 0);
    if (w >= h) {
      // A column along the left edge.
      const cw = sum / h;
      let cy = y;
      for (const c of r) {
        const ch = c.area / cw;
        out.push({ item: c.item, x, y: cy, w: cw, h: ch });
        cy += ch;
      }
      x += cw;
      w -= cw;
    } else {
      // A row along the top edge.
      const rh = sum / w;
      let cx = x;
      for (const c of r) {
        const cw = c.area / rh;
        out.push({ item: c.item, x: cx, y, w: cw, h: rh });
        cx += cw;
      }
      y += rh;
      h -= rh;
    }
  };

  for (const c of queue) {
    const side = Math.min(w, h);
    if (row.length === 0 || worst([...row, c], side) <= worst(row, side)) {
      row.push(c);
    } else {
      place(row);
      row = [c];
    }
  }
  if (row.length) place(row);

  return out;
}
