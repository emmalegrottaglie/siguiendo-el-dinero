import type { ReactNode } from "react";

/**
 * The design system's one motif: a line with stations on it.
 *
 * The front page's route map draws money as lines between stations. The same
 * grammar carries everything else that is a sequence or a path: the years an
 * audit covers, a topic's votes in date order, the organisations a person
 * appears with. A solid segment is something on record; a dashed one is a
 * stretch the record does not cover yet. A filled station is on record; a
 * hollow one is not. Both are stated in words beside the line, so neither
 * relies on the eye telling solid from dashed.
 *
 * The line's colour comes from the class on the element (`n-state`,
 * `n-topic`, …), which sets `--route`.
 */
export interface Stop {
  key: string;
  /** Under the station: a year, a date, a name. */
  label: ReactNode;
  /** Under the label, smaller. */
  note?: ReactNode;
  /** On record (filled, joined by a solid line) or not (hollow, dashed). */
  on: boolean;
}

export default function Line({
  stops,
  cls,
  className = "",
}: {
  stops: Stop[];
  cls: string;
  className?: string;
}) {
  return (
    <ol
      className={`${cls} grid ${className}`}
      style={{ gridTemplateColumns: `repeat(${stops.length}, minmax(0, 1fr))` }}
    >
      {stops.map((s, i) => {
        const next = stops[i + 1];
        return (
          <li key={s.key} className="relative flex flex-col items-center text-center">
            {next && (
              <span
                aria-hidden
                className="absolute left-1/2 top-[9px] h-[5px] w-full"
                style={
                  next.on && s.on
                    ? { background: "var(--route)" }
                    : {
                        backgroundImage:
                          "repeating-linear-gradient(90deg, var(--n-ink-3) 0 5px, transparent 5px 10px)",
                        height: 2,
                        top: 10,
                      }
                }
              />
            )}
            <span
              aria-hidden
              className="relative z-[1] h-[23px] w-[23px] rounded-full border-[3px]"
              style={{
                borderColor: s.on ? "var(--route)" : "var(--n-ink-3)",
                background: s.on ? "var(--route)" : "var(--n-bg)",
              }}
            />
            <span className="mt-2 text-[0.95rem] font-bold leading-tight">{s.label}</span>
            {s.note && <span className="n-meta mt-0.5 px-1">{s.note}</span>}
          </li>
        );
      })}
    </ol>
  );
}
