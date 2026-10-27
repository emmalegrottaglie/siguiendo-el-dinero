import Link from "next/link";
import type { Dict, Locale } from "@/lib/i18n";
import { DONATIONS_SOURCE } from "@/lib/donations";
import { FOUNDATIONS_LAW_URL } from "@/lib/foundations";
import { euroExact, euroM, fill, integer, percent } from "@/lib/format";

/**
 * How money reaches a party, route by route, with the rules the law sets on
 * each and the audited or registered figure this site holds for it.
 *
 * Modelled on the "What is a super PAC?" panel in Al Jazeera's "Tracking the
 * money" (27 Oct 2026): numbered routes, each drawn as source, rule, recipient.
 * The rules are the ones in Ley Orgánica 8/2007 as consolidated in the BOE:
 * art. 2 for public money, arts. 4.2 and 5.Uno for donations to a party, and
 * disposición adicional séptima for the party's foundations, which is what
 * lifts the company ban and the €50,000 cap there. They were checked against
 * the consolidated text on 2026-10-27; the site states the same rules in
 * prose on /fundaciones and under the donations table.
 *
 * The figures are not comparable with one another and the panel does not add
 * them: they come from three sources with three different dates.
 */
export default function MoneyRoutes({
  m,
  bcp47,
  locale,
  subsidies,
  foundations,
}: {
  m: Dict["money"];
  bcp47: string;
  locale: Locale;
  /** The BDNS total, as the stat strip above prints it. */
  subsidies: number;
  /** The foundation channel's audited totals, all exercises. */
  foundations: { companies: number; partyShare: number; years: string };
}) {
  const routes = [
    {
      from: m.routeStateFrom,
      to: m.routePartyTo,
      title: m.routeStateTitle,
      rules: m.routeStateRules,
      figure: euroM(subsidies, bcp47, 1),
      figureNote: m.routeStateFigure,
      href: "#reparto",
      linkText: m.routeStateLink,
    },
    {
      from: m.routeDonorFrom,
      to: m.routePartyTo,
      title: m.routeDonorTitle,
      rules: m.routeDonorRules,
      figure: euroExact(DONATIONS_SOURCE.grandTotal, bcp47),
      figureNote: fill(m.routeDonorFigure, {
        donors: integer(DONATIONS_SOURCE.grandDonors, bcp47),
        year: String(DONATIONS_SOURCE.year),
      }),
      href: "#donaciones",
      linkText: m.routeDonorLink,
    },
    {
      from: m.routeFoundationFrom,
      to: m.routeFoundationTo,
      title: m.routeFoundationTitle,
      rules: m.routeFoundationRules,
      figure: euroExact(foundations.companies, bcp47),
      figureNote: fill(m.routeFoundationFigure, {
        years: foundations.years,
        share: percent(foundations.partyShare, bcp47, 0),
      }),
      href: `/${locale}/fundaciones`,
      linkText: m.routeFoundationLink,
    },
  ];

  return (
    <section className="mx-auto mt-14 max-w-6xl" aria-labelledby="cauces-title">
      <h2 id="cauces-title" className="display section-tick text-2xl">
        {m.routesTitle}
      </h2>
      <p className="mt-6 max-w-3xl text-[var(--ink-2)]">{m.routesIntro}</p>

      <ol className="mt-8 flex flex-col gap-3">
        {routes.map((r, i) => (
          <li
            key={r.title}
            className="panel grid grid-cols-[2.25rem_1fr] gap-x-4 gap-y-4 p-5 lg:grid-cols-[2.25rem_8.5rem_1fr_8.5rem_13rem] lg:items-center"
          >
            <span
              aria-hidden
              className="mono flex h-9 w-9 items-center justify-center rounded-full text-sm"
              style={{ border: "1px solid var(--line)", color: "var(--ink-2)" }}
            >
              {i + 1}
            </span>

            {/* Source, route and recipient read as one sentence to a screen
                reader ("De … a …"); the arrows are for the eye only. */}
            <p className="col-start-2 lg:col-start-auto">
              <span className="label-mono block text-[var(--ink-3)]">{m.from}</span>
              <span className="font-medium">{r.from}</span>
            </p>

            <div className="col-start-2 lg:col-start-auto">
              <div aria-hidden className="mb-3 hidden items-center lg:flex">
                <span className="h-px flex-1" style={{ background: "var(--ink-3)" }} />
                <span style={{ color: "var(--ink-3)", lineHeight: 1 }}>▶</span>
              </div>
              <p className="display text-lg">{r.title}</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {r.rules.map((rule) => (
                  <li
                    key={rule}
                    className="rounded-full px-2.5 py-1 text-[12.5px] leading-snug"
                    style={{ border: "1px solid var(--line)", color: "var(--ink-2)" }}
                  >
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <p className="col-start-2 lg:col-start-auto">
              <span className="label-mono block text-[var(--ink-3)]">{m.to}</span>
              <span className="font-medium">{r.to}</span>
            </p>

            <div className="col-start-2 border-t border-[var(--line)] pt-4 lg:col-start-auto lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
              <p className="figure" style={{ fontSize: 26, color: "var(--ink)" }}>
                {r.figure}
              </p>
              <p className="mt-1" style={{ fontSize: "12px", lineHeight: 1.45, color: "var(--ink-3)" }}>
                {r.figureNote}
              </p>
              {r.href.startsWith("#") ? (
                <a href={r.href} className="src label-mono mt-2 inline-block">
                  {r.linkText}
                </a>
              ) : (
                <Link href={r.href} className="src label-mono mt-2 inline-block">
                  {r.linkText}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-5" style={{ fontSize: "12px", lineHeight: 1.55, color: "var(--ink-3)", maxWidth: "88ch" }}>
        {m.routesGap}{" "}
        <a className="src" href={FOUNDATIONS_LAW_URL} target="_blank" rel="noopener noreferrer">
          {m.routesLaw}
        </a>
      </p>
    </section>
  );
}
