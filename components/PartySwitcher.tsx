import Link from "next/link";
import { PARTIES } from "@/lib/parties";
import { fillEdge } from "@/lib/chart-colors";

/**
 * Jump between the parties that have something to compare.
 *
 * The design fixed five formations. This takes whichever parties the caller
 * says have a record on file, so the row cannot list a party whose page is
 * empty, and cannot omit one that appears once the next audit lands.
 *
 * The active tab is underlined in the party's own colour rather than in gold:
 * the reader is inside one party's dossier, and the accent should say which.
 */
export default function PartySwitcher({
  locale,
  nifs,
  current,
  label,
}: {
  locale: string;
  nifs: string[];
  current: string;
  label: string;
}) {
  const items = nifs
    .map((nif) => ({ nif, meta: PARTIES[nif] }))
    .filter((x): x is { nif: string; meta: (typeof PARTIES)[string] } => Boolean(x.meta));
  if (items.length < 2) return null;

  return (
    <nav
      aria-label={label}
      className="flex flex-wrap items-center border-b border-[var(--line)]"
    >
      <span className="label-mono px-1 py-2.5 pr-4">{label}</span>
      {items.map((it) => {
        const active = it.nif === current;
        return (
          <Link
            key={it.nif}
            href={`/${locale}/party/${it.nif}`}
            aria-current={active ? "page" : undefined}
            className="relative flex items-center gap-2 border-l border-[var(--line)] px-3.5 py-2.5 transition-colors hover:bg-[color-mix(in_srgb,var(--gold)_10%,transparent)]"
            style={{ fontSize: "13px" }}
          >
            <span
              className="dot"
              aria-hidden
              style={{ width: 9, height: 9, background: it.meta.color, ...fillEdge(it.meta.color) }}
            />
            {it.meta.shortName}
            {active && (
              <span
                aria-hidden
                className="absolute"
                style={{
                  left: 0,
                  right: 0,
                  bottom: -1,
                  height: 3,
                  background: it.meta.color,
                  ...fillEdge(it.meta.color),
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
