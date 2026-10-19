import Link from "next/link";

/**
 * The two views of the Politicians section: the directory of everyone with a profile, and what
 * the sitting deputies declared. Underlined tabs rather than pills, so they never read as one
 * more party filter.
 */
export default function PeopleTabs({
  locale,
  current,
  labels,
}: {
  locale: string;
  current: "directory" | "declarations";
  labels: { label: string; directory: string; declarations: string };
}) {
  const tabs = [
    { key: "directory", href: `/${locale}/politicos`, label: labels.directory },
    { key: "declarations", href: `/${locale}/politicos/declaraciones`, label: labels.declarations },
  ] as const;

  return (
    <nav aria-label={labels.label} className="mt-8 flex gap-6 border-b border-[var(--line)]">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={current === tab.key ? "page" : undefined}
          className={`label-mono -mb-px inline-flex min-h-11 items-center border-b-2 transition-colors ${
            current === tab.key
              ? "border-[var(--gold)] text-[var(--ink)]"
              : "border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
