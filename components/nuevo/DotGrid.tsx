/**
 * One dot per item, so a count reads as the people it stands for.
 *
 * Used where the whole is small enough to draw one by one (the 349 asset
 * declarations): a reader sees at a glance how much of it is done, which a
 * pair of numbers does not show. Each group is named with its count in the
 * legend, so no group is told apart by colour alone; the hollow group is also
 * hollow, not only lighter.
 */
export interface DotGroup {
  key: string;
  count: number;
  label: string;
  /** "filled" in the route colour, "ink" filled in ink, "hollow" an outline. */
  look: "filled" | "ink" | "hollow";
  /** The route class whose colour a "filled" group takes. */
  cls?: string;
}

const LOOK = {
  filled: { background: "var(--route)", border: "2px solid var(--route)" },
  ink: { background: "var(--n-ink-2)", border: "2px solid var(--n-ink-2)" },
  hollow: { background: "transparent", border: "2px solid var(--n-ink-3)" },
} as const;

export default function DotGrid({ groups, className = "" }: { groups: DotGroup[]; className?: string }) {
  return (
    <div className={className}>
      <div aria-hidden className="flex flex-wrap gap-[4px]">
        {groups.flatMap((g) =>
          Array.from({ length: g.count }, (_, i) => (
            <span
              key={`${g.key}-${i}`}
              className={`${g.cls ?? ""} inline-block h-[11px] w-[11px] rounded-full`}
              style={LOOK[g.look]}
            />
          )),
        )}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem]">
        {groups.map((g) => (
          <li key={g.key} className={`${g.cls ?? ""} inline-flex items-center gap-2`}>
            <span aria-hidden className="inline-block h-[13px] w-[13px] rounded-full" style={LOOK[g.look]} />
            <span>
              <span className="n-num font-bold">{g.count}</span> {g.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
