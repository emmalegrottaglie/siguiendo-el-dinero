"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/**
 * A horizontal scroll box for a wide table, reachable from the keyboard.
 *
 * The site's long tables carry a minimum width so their columns stay legible,
 * and below it they scroll inside their own box rather than widening the page.
 * A box that scrolls but cannot take focus is out of reach for a keyboard user
 * with no pointer: the arrow keys scroll only what has focus, and nothing
 * inside a plain table is focusable. So while the content overflows, the box
 * becomes a tab stop (`tabIndex={0}`) and a labelled region, which is what the
 * accessibility research asks of a scrolling container (RESEARCH-DATAVIZ/04).
 *
 * Only while it overflows: on a screen wide enough to show the whole table,
 * a tab stop that does nothing would be one more stop to pass on every page.
 * The check reruns on resize, which also covers a table inside a closed
 * `<details>` (zero by zero until it is opened).
 *
 * The label is the table's own caption, through `aria-labelledby`, unless a
 * `label` is given. The table itself is untouched: screen readers navigate it
 * with their table commands, cell by cell, and nothing here replaces that.
 */
export default function ScrollBox({
  label,
  className = "",
  children,
}: {
  /** Overrides the caption as the region's name. */
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const uid = useId();
  const [overflows, setOverflows] = useState(false);
  const [captionId, setCaptionId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    const table = el.querySelector("table");
    if (table) ro.observe(table);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (label || !box.current) return;
    const caption = box.current.querySelector("caption");
    if (!caption) return;
    // The caption is rendered by the caller, so its id is set here rather than
    // threaded through every table's props.
    if (!caption.id) caption.id = `${uid}-caption`;
    setCaptionId(caption.id);
  }, [label, uid]);

  return (
    <div
      ref={box}
      className={`overflow-x-auto ${className}`}
      tabIndex={overflows ? 0 : undefined}
      role={overflows ? "region" : undefined}
      aria-label={overflows && label ? label : undefined}
      aria-labelledby={overflows && !label ? captionId : undefined}
      data-scrollbox={overflows ? "scrolls" : undefined}
    >
      {children}
    </div>
  );
}
