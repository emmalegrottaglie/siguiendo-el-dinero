import { fill, integer } from "./format";
import type { Dict } from "./i18n";

/**
 * The props `ChartReader` needs that every chart builds the same way, kept out
 * of the client component so a server component can call it.
 *
 * The accessible name says what the chart shows, its range where it has one,
 * how many values it holds and which keys read them, in that order: a screen
 * reader user tabbing past learns whether to stop before hearing the keys.
 */
export function readerProps(
  c: Dict["charts"],
  bcp47: string,
  {
    title,
    count,
    range,
    grid = false,
  }: {
    title: string;
    count: number;
    /** The lowest and highest value, already formatted, where a range means something. */
    range?: { min: string; max: string };
    grid?: boolean;
  },
): { label: string; positionLabel: string } {
  const label = [
    title,
    range ? fill(c.readerRange, range) : undefined,
    fill(c.readerCount, { n: integer(count, bcp47) }),
    grid ? c.readerGridKeys : c.readerKeys,
  ]
    .filter(Boolean)
    .join(". ");
  return { label, positionLabel: c.readerPosition };
}

/** "PSOE · 12,3 M€ · 23 % del total": the parts that exist, joined. */
export function say(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" · ");
}
