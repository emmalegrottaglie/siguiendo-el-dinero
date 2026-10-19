"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

/**
 * Keyboard reading for a chart, value by value.
 *
 * Most charts here print their figures beside the marks, and the ones that do
 * not have a data table. Neither lets a keyboard user point at one mark and be
 * told what it is with its context, which is what a sighted reader does with a
 * glance: "this bar is PSOE, 12,3 M€, 23 % of the total". This component adds
 * that, once, for every chart with discrete values (RESEARCH-DATAVIZ/04).
 *
 * How it works:
 *
 * - The wrapper is one tab stop with a descriptive `aria-label`: what the chart
 *   shows, its range, how many values, and which keys read it.
 * - Each mark the chart draws carries `data-chart-item={index}`. The chart
 *   itself stays whatever it was — a server component, an SVG, a list of links —
 *   and passes the matching announcement strings as `items`, so the text is
 *   built where the data is.
 * - Arrow keys move a cursor through the items; Home and End jump to the ends.
 *   The current item gets `data-chart-active`, which the stylesheet draws as an
 *   outline. Nothing in the chart re-renders: the cursor is an attribute set on
 *   the existing node, so the marks are never redrawn under a reader.
 * - A polite live region beside the chart announces the item under the cursor,
 *   with its position ("3 de 12"). While the chart has focus the same text shows
 *   as a small readout below it, for sighted keyboard users of charts whose
 *   marks have no text of their own (the ballot grid's cells).
 * - Pointer hover announces too, but only while the chart does not have
 *   keyboard focus, so a stray mouse never moves or talks over the keyboard
 *   cursor. A click puts the cursor on the clicked item.
 *
 * `rows` turns on the ARIA grid pattern: one row index per item, in reading
 * order. The wrapper becomes `role="grid"` with `aria-activedescendant`, the
 * chart's own markup supplies `role="row"` and `role="gridcell"`, and the keys
 * follow the grid convention — left and right within a row, up and down to the
 * same column of the next row, Home and End to the ends of the row, Control
 * with Home or End to the first and last cell.
 */
export default function ChartReader({
  label,
  items,
  rows,
  positionLabel,
  onActiveChange,
  start = 0,
  className = "",
  children,
}: {
  /** The accessible name: what it shows, the range, and the keys. */
  label: string;
  /** One announcement per `data-chart-item`, in index order. */
  items: string[];
  /** Grid mode: the row of each item, ascending. Omit for a list. */
  rows?: number[];
  /** "{i} de {n}", appended to each announcement. */
  positionLabel: string;
  /** Called when the keyboard or a click moves the cursor. Client callers only. */
  onActiveChange?: (index: number) => void;
  /** Where the first arrow key lands: the item already selected, if any. */
  start?: number;
  className?: string;
  children: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const uid = useId();
  const [active, setActive] = useState(-1);
  const [spoken, setSpoken] = useState("");
  // Tracked from focus events rather than read from `:focus`, which stops
  // matching whenever the window itself loses focus — the cursor and the
  // readout should stay where they are while the reader glances elsewhere.
  const [focused, setFocused] = useState(false);
  const grid = rows !== undefined && rows.length === items.length;

  const idFor = (i: number) => `${uid}-item-${i}`;

  const node = useCallback(
    (i: number) =>
      box.current?.querySelector<HTMLElement | SVGElement>(`[data-chart-item="${i}"]`) ?? null,
    [],
  );

  const announce = useCallback(
    (i: number) =>
      `${items[i]} · ${positionLabel
        .replace("{i}", String(i + 1))
        .replace("{n}", String(items.length))}`,
    [items, positionLabel],
  );

  // Grid cells need ids for aria-activedescendant. They are set on the existing
  // nodes rather than passed down, so a server-rendered chart needs no client
  // code of its own.
  useEffect(() => {
    if (!grid || !box.current) return;
    box.current.querySelectorAll<HTMLElement>("[data-chart-item]").forEach((el) => {
      const i = Number(el.dataset.chartItem);
      if (!el.id) el.id = idFor(i);
    });
    // idFor depends only on uid.
  }, [grid, items.length, uid]);

  // A chart whose items change (the subsidy ranking under a filter) keeps the
  // cursor inside the new range rather than pointing past its end.
  useEffect(() => {
    if (active >= items.length) setActive(items.length - 1);
  }, [active, items.length]);

  // The cursor is drawn by an attribute on the node itself, so moving it is a
  // style change and not a render of the chart.
  useEffect(() => {
    if (!box.current) return;
    box.current
      .querySelectorAll("[data-chart-active]")
      .forEach((el) => el.removeAttribute("data-chart-active"));
    if (active < 0) return;
    const el = node(active);
    if (!el) return;
    el.setAttribute("data-chart-active", "");
  }, [active, node, items]);

  // Only when the cursor moves, not when the chart re-renders around it (the
  // map re-renders on every pointer move for its tooltip). Inside a scrolling
  // box (the flow diagram) this brings the item into view; on the page it
  // moves only as far as needed.
  useEffect(() => {
    if (active < 0 || !focused) return;
    node(active)?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    // Only on a cursor move, not when focus returns.
  }, [active, node]);

  const move = (i: number) => {
    if (items.length === 0) return;
    const next = Math.max(0, Math.min(items.length - 1, i));
    setActive(next);
    setSpoken(announce(next));
    onActiveChange?.(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Keys pressed on a link or button inside the chart are theirs.
    if (e.target !== e.currentTarget) return;
    // A key arriving here means the chart has focus, even where no focus event
    // fired (a window that was in the background when focus moved).
    if (!focused) setFocused(true);
    if (items.length === 0) return;
    const last = items.length - 1;
    const at = active < 0 ? -1 : active;
    let next: number | null = null;

    if (!grid) {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          next = at < 0 ? start : at + 1;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          next = at < 0 ? start : at - 1;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = last;
          break;
      }
    } else {
      const r = rows!;
      const rowOf = (i: number) => r[i];
      const startOf = (row: number) => r.indexOf(row);
      const endOf = (row: number) => r.lastIndexOf(row);
      const rowIds = [...new Set(r)];
      if (at < 0) {
        if (e.key.startsWith("Arrow")) next = start;
        if (e.key === "Home") next = e.ctrlKey ? 0 : startOf(rowOf(start));
        if (e.key === "End") next = e.ctrlKey ? last : endOf(rowOf(start));
      } else {
        const row = rowOf(at);
        const col = at - startOf(row);
        const step = (dir: 1 | -1) => {
          const k = rowIds.indexOf(row) + dir;
          if (k < 0 || k >= rowIds.length) return at;
          const target = rowIds[k];
          return Math.min(startOf(target) + col, endOf(target));
        };
        switch (e.key) {
          case "ArrowRight":
            next = Math.min(at + 1, endOf(row));
            break;
          case "ArrowLeft":
            next = Math.max(at - 1, startOf(row));
            break;
          case "ArrowDown":
            next = step(1);
            break;
          case "ArrowUp":
            next = step(-1);
            break;
          case "Home":
            next = e.ctrlKey ? 0 : startOf(row);
            break;
          case "End":
            next = e.ctrlKey ? last : endOf(row);
            break;
        }
      }
    }

    if (next !== null) {
      e.preventDefault();
      move(next);
      return;
    }

    // Enter follows the link a row carries, where it carries one (the subsidy
    // ranking's rows are links to each party).
    if (e.key === "Enter" && active >= 0) {
      const el = node(active);
      const link = el?.matches("a[href]") ? el : el?.querySelector("a[href]");
      if (link instanceof HTMLElement) {
        e.preventDefault();
        link.click();
      }
    }
  };

  const itemAt = (target: EventTarget) => {
    const el = (target as Element).closest?.("[data-chart-item]");
    if (!el || !box.current?.contains(el)) return -1;
    return Number((el as HTMLElement).dataset.chartItem);
  };

  const onMouseOver = (e: MouseEvent<HTMLDivElement>) => {
    if (document.activeElement === box.current) return;
    const i = itemAt(e.target);
    if (i >= 0 && i < items.length) setSpoken(announce(i));
  };

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const i = itemAt(e.target);
    if (i >= 0 && i < items.length) move(i);
  };

  return (
    <div className="chart-reader-wrap">
      <div
        ref={box}
        tabIndex={0}
        role={grid ? "grid" : "group"}
        aria-label={label}
        aria-activedescendant={grid && active >= 0 ? idFor(active) : undefined}
        aria-readonly={grid ? true : undefined}
        className={`chart-reader ${className}`}
        data-focused={focused ? "" : undefined}
        onFocus={(e) => e.target === e.currentTarget && setFocused(true)}
        onBlur={(e) => e.target === e.currentTarget && setFocused(false)}
        onKeyDown={onKeyDown}
        onMouseOver={onMouseOver}
        onClick={onClick}
      >
        {children}
      </div>
      <p className="chart-readout" aria-live="polite" aria-atomic="true">
        {spoken}
      </p>
    </div>
  );
}

