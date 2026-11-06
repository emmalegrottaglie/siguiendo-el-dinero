import type { CSSProperties, ReactNode } from "react";
import type { Locale } from "@/lib/locales";

/**
 * A line of stations stood on end: a ladder.
 *
 * The line runs down the left. Each station on it is a boundary (0, 1, 2 …
 * minimum wages), and between one station and the next is a rung: the
 * interval those two stations enclose, with its value written out and drawn
 * as a bar to the right of the line. The bars share one scale, set by `max`,
 * so their lengths compare with each other; every rung also prints its exact
 * figure, so no value is read off a length alone.
 *
 * Every station here is on record and is drawn filled. A rung whose value the
 * source leaves empty prints "—" and draws no bar: unknown is not zero.
 *
 * The line takes its colour from `--route`, set by the class on the element
 * or by `style`, as everywhere else in the design.
 */
export interface Rung {
  key: string;
  /** The boundary at the top of this rung, beside its station. */
  station?: ReactNode;
  /** Smaller, after the station's label. */
  stationNote?: ReactNode;
  /** The interval itself, as the source names it. */
  label: ReactNode;
  /** Said after the label, smaller: a stated weakness of the figure. */
  flag?: ReactNode;
  value: number | null;
  /** The value as printed: "18,32 %", or "—" when the value is null. */
  text: string;
}

export default function Ladder({
  rungs,
  max,
  cls = "",
  style,
  className = "",
}: {
  rungs: Rung[];
  max: number;
  cls?: string;
  style?: CSSProperties;
  className?: string;
  /** Accepted for uniformity; the ladder carries no words of its own. */
  locale?: Locale;
}) {
  return (
    <ol className={`${cls} ${className}`} style={style}>
      {rungs.map((r, i) => {
        const last = i === rungs.length - 1;
        return (
          <li key={r.key} className="relative grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3">
            {/* The line, through the whole rung; it stops short on the last one. */}
            <span
              aria-hidden
              className="absolute top-[11px] w-[5px]"
              style={{
                left: "calc(0.875rem - 2.5px)",
                background: "var(--route)",
                bottom: last ? "0.6rem" : 0,
                borderRadius: last ? "0 0 3px 3px" : undefined,
              }}
            />
            <span
              aria-hidden
              className="relative z-[1] h-[23px] w-[23px] justify-self-center rounded-full border-[3px]"
              style={{ borderColor: "var(--route)", background: "var(--route)" }}
            />
            <p className="min-h-[23px] self-center leading-tight">
              {r.station && <span className="text-[0.95rem] font-bold">{r.station}</span>}
              {r.stationNote && <span className="n-meta ml-2 n-num">{r.stationNote}</span>}
            </p>
            <span aria-hidden />
            <div className="pb-5 pt-2">
              <p className="flex flex-wrap items-baseline justify-between gap-x-4">
                <span>
                  {r.label}
                  {r.flag && <span className="n-meta ml-2">{r.flag}</span>}
                </span>
                <span className="n-num font-bold whitespace-nowrap">{r.text}</span>
              </p>
              <div aria-hidden className="mt-1.5 h-3 w-full">
                {r.value !== null && r.value > 0 && (
                  <span
                    className="block h-3 rounded-[2px]"
                    style={{
                      width: `${Math.max((r.value / max) * 100, 0.6).toFixed(2)}%`,
                      background: "var(--route)",
                    }}
                  />
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
