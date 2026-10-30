/**
 * One whole, split into its parts: a single bar and, under it, every part
 * named with its share in words.
 *
 * The parts take the route's colour at falling strength, so the bar reads as
 * one route, and the list under it carries each share as text: no part is
 * identified by colour alone. A gap of page ground separates neighbours.
 */
export default function ShareBar({
  parts,
  format,
  className = "",
}: {
  parts: { label: string; value: number; muted?: boolean }[];
  format: (value: number) => string;
  className?: string;
}) {
  const total = parts.reduce((s, p) => s + Math.max(0, p.value), 0);
  const strength = [100, 62, 38, 22];
  const fillFor = (i: number, muted?: boolean) =>
    muted
      ? "var(--n-rule-strong)"
      : `color-mix(in srgb, var(--route) ${strength[Math.min(i, strength.length - 1)]}%, var(--n-bg))`;

  return (
    <div className={className}>
      <div aria-hidden className="flex h-7 w-full gap-[2px] overflow-hidden rounded-[3px]">
        {parts.map((p, i) =>
          p.value > 0 ? (
            <span
              key={p.label}
              style={{
                flexGrow: p.value / total,
                flexBasis: 0,
                minWidth: 3,
                background: fillFor(i, p.muted),
              }}
            />
          ) : null,
        )}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[0.95rem]">
        {parts.map((p, i) => (
          <li key={p.label} className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-3 w-3 rounded-[2px]"
              style={{ background: fillFor(i, p.muted) }}
            />
            <span>
              {p.label} <span className="n-num font-bold">{format(p.value)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
