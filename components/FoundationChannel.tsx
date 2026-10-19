import Link from "next/link";
import {
  channelTotals,
  displayName,
  namedDeals,
  rankedEntities,
  registrationTally,
  FOUNDATIONS_LAW_URL,
  type FoundationsFile,
} from "@/lib/foundations";
import { governanceCoverage, governanceFor } from "@/lib/foundation-people";
import type { OfficeJoin } from "@/lib/officeholder-ties";
import { PARTIES } from "@/lib/parties";
import { CHANNEL_COLORS } from "@/lib/chart-colors";
import Bar, { BarLegend, type Segment } from "./chart/Bar";
import Avatar from "./Avatar";
import Caveat from "./Caveat";
import { euro, euroCompact, fill, formatDate, integer, percent } from "@/lib/format";
import type { Dict } from "@/lib/i18n";
import ScrollBox from "./chart/ScrollBox";

/**
 * The party-linked foundation channel.
 *
 * A reader arrives expecting corporate money, because that is the story the
 * legal asymmetry suggests: parties may take none, their foundations may. The
 * audited figures say otherwise, so party money leads and the corporate line
 * sits beside it at its real size. The named counterparties get their own table
 * because they are the only companies the report actually identifies, and the
 * compliance verdict travels with each one.
 */
export default function FoundationChannel({
  data,
  t,
  bcp47,
  locale,
  offices,
}: {
  data: FoundationsFile;
  t: Dict;
  bcp47: string;
  locale: string;
  /** The officeholder join's audit, so its coverage is stated not implied. */
  offices?: OfficeJoin["audit"];
}) {
  const F = t.foundations;
  const totals = channelTotals(data);
  const ranked = rankedEntities(data);
  const deals = namedDeals(data);
  const reg = registrationTally(data);
  const max = ranked[0] ? ranked[0].contributions + ranked[0].subsidies : 1;
  const gov = governanceCoverage(ranked.map((e) => e.name));

  // Computed once for all 70 entities, not once per card: governanceFor()
  // filters the full ROLES array, so doing it inside the render loop would be
  // O(n²) over a list that is already the full published board registry.
  const boardCounts = new Map(ranked.map((e) => [e.slug, governanceFor(e.name).people.length]));

  return (
    <section className="mx-auto mt-20 max-w-6xl">
      <h2 className="display section-tick text-2xl">{F.title}</h2>
      <p className="mt-6 max-w-3xl text-[var(--ink-2)]">{F.intro}</p>

      {/* Party money first: it is nine tenths of the total and the least
          expected, so putting the corporate figure here would mislead by
          prominence even while being accurate. */}
      <div className="mt-8 flex flex-wrap gap-x-10 gap-y-6">
        <div>
          <p className="label-mono mb-2">{F.fromParty}</p>
          <p className="mono text-2xl text-[var(--gold-deep)]">
            {euroCompact(totals.party, bcp47)}
          </p>
          <p className="label-mono mt-1 text-[var(--ink-3)]">
            {percent(totals.partyShare, bcp47)} {F.ofContributions}
          </p>
        </div>
        <div>
          <p className="label-mono mb-2">{F.fromCompanies}</p>
          <p className="mono text-2xl text-[var(--red)]">
            {euroCompact(totals.companies, bcp47)}
          </p>
          <p className="label-mono mt-1 text-[var(--ink-3)]">
            {percent(totals.companiesShare, bcp47)} {F.ofContributions}
          </p>
        </div>
        <div>
          <p className="label-mono mb-2">{F.fromIndividuals}</p>
          <p className="mono text-2xl text-[var(--ink)]">
            {euroCompact(totals.individuals, bcp47)}
          </p>
          <p className="label-mono mt-1 text-[var(--ink-3)]">
            {percent(totals.individualsShare, bcp47)} {F.ofContributions}
          </p>
        </div>
        <div>
          <p className="label-mono mb-2">{F.publicSubsidies}</p>
          <p className="mono text-2xl text-[var(--gold-deep)]">
            {euroCompact(totals.subsidies, bcp47)}
          </p>
          <p className="label-mono mt-1 max-w-xs text-[var(--ink-3)]">{F.publicNote}</p>
        </div>
      </div>

      {/* The only companies the report names, with the disclosure verdict. */}
      <h3 className="display mt-14 text-xl">{F.counterpartyTitle}</h3>
      <Caveat label={t.common.caveat} className="mt-3">
        {F.counterpartyNote}
      </Caveat>
      <ScrollBox className="mt-6">
        <table className="w-full min-w-[46rem] border-collapse text-sm">
          <caption className="sr-only">{F.counterpartyTitle}</caption>
          <thead>
            <tr className="label-mono text-left text-[var(--ink-3)]">
              <th scope="col" className="py-2 pr-4 font-normal">
                {F.counterparty}
              </th>
              <th scope="col" className="py-2 pr-4 font-normal">
                {F.entity}
              </th>
              <th scope="col" className="whitespace-nowrap py-2 pr-4 font-normal">
                {F.exercise}
              </th>
              <th scope="col" className="py-2 pr-4 font-normal">
                {F.consideration}
              </th>
              <th scope="col" className="whitespace-nowrap py-2 pr-4 text-right font-normal">
                {F.total}
              </th>
              <th scope="col" className="whitespace-nowrap py-2 font-normal">
                {F.duties}
              </th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d, i) => (
              <tr key={`${d.slug}-${d.exercise}-${i}`} className="border-t border-[var(--line)]">
                <th scope="row" className="py-3 pr-4 text-left font-normal text-[var(--ink)]">
                  {d.counterparties.join(" · ")}
                </th>
                <td className="py-3 pr-4 text-[var(--ink-2)]">
                  <Link className="hover:text-[var(--gold-deep)]" href={`/${locale}/fundacion/${d.slug}`}>
                    {displayName(d.entity)}
                  </Link>
                </td>
                <td className="mono py-3 pr-4 text-[var(--ink-3)]">{d.exercise}</td>
                <td className="py-3 pr-4 text-[var(--ink-3)]">{d.consideration ?? "—"}</td>
                <td className="mono py-3 pr-4 text-right text-[var(--ink)]">
                  {d.amount === null ? "—" : euro(d.amount, bcp47)}
                </td>
                <td
                  className="label-mono py-3"
                  style={{
                    color:
                      d.compliant === false
                        ? "var(--red)"
                        : d.compliant === true
                          ? "var(--ink-2)"
                          : "var(--ink-3)",
                  }}
                >
                  {d.compliant === false
                    ? F.dutiesFailed
                    : d.compliant === true
                      ? F.dutiesMet
                      : F.dutiesUnclear}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollBox>

      {/* Every audited entity, so the named deals above are not mistaken for
          the whole channel. One card per entity, ranked by the same total the
          bar inside it visualises — see rankedEntities() in lib/foundations.ts. */}
      <h3 className="display mt-14 text-xl">{F.tableTitle}</h3>
      <Caveat label={t.common.caveat} className="mt-3">
        {F.tableNote}
      </Caveat>
      <div
        className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label={F.tableTitle}
      >
        {ranked.map((e) => {
          const segments: Segment[] = [
            { value: e.party_, color: CHANNEL_COLORS.party, label: F.fromParty },
            { value: e.companies, color: CHANNEL_COLORS.companies, label: F.fromCompanies },
            {
              value: e.individuals,
              color: CHANNEL_COLORS.individuals,
              label: F.fromIndividuals,
            },
            { value: e.subsidies, color: CHANNEL_COLORS.subsidies, label: F.publicSubsidies },
          ];
          const boardCount = boardCounts.get(e.slug) ?? 0;
          return (
            <Link
              key={e.slug}
              href={`/${locale}/fundacion/${e.slug}`}
              role="listitem"
              className="panel group flex flex-col gap-3 p-5 transition-colors hover:border-[var(--line)]"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  name={displayName(e.name)}
                  color={e.partyNif ? PARTIES[e.partyNif]?.color : undefined}
                  size={44}
                />
                <div className="min-w-0">
                  <p className="truncate group-hover:text-[var(--gold-deep)]">
                    {displayName(e.name)}
                  </p>
                  <p className="label-mono mt-1 truncate text-[var(--ink-3)]">
                    {e.party ?? F.noPartyStated}
                  </p>
                </div>
              </div>

              <p className="mono text-lg" style={{ color: "var(--gold-deep)" }}>
                {euroCompact(e.contributions + e.subsidies, bcp47)}
              </p>

              <Bar segments={segments} total={max} scale="compare" size="sm" />

              {boardCount > 0 && (
                <p className="label-mono text-[var(--ink-3)]">
                  {fill(F.boardCount, { count: integer(boardCount, bcp47) })}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="panel p-6">
          <p className="label-mono mb-3 text-[var(--gold-deep)]">{F.registerTitle}</p>
          <p className="leading-relaxed text-[var(--ink-2)]">{F.registerBody}</p>
          <p className="label-mono mt-4 text-[var(--ink-3)]">
            {integer(reg.registered, bcp47)} / {integer(reg.total, bcp47)} {F.entities} ·{" "}
            {reg.exercise}
          </p>
        </div>
        <div className="panel p-6">
          <p className="label-mono mb-3 text-[var(--gold-deep)]">{F.repeatedTitle}</p>
          <p className="leading-relaxed text-[var(--ink-2)]">{F.repeatedBody}</p>
        </div>
      </div>

      {/* The people layer is per-entity, so the channel page states its
          coverage and sends the reader to a dossier rather than flattening
          forty boards into one list. */}
      <div className="panel mt-6 p-6">
        <p className="label-mono mb-3 text-[var(--gold-deep)]">{F.peopleCoverageTitle}</p>
        <p className="leading-relaxed text-[var(--ink-2)]">
          {F.peopleCoverage
            .replace("{documented}", integer(gov.documented, bcp47))
            .replace("{entities}", integer(gov.entities, bcp47))
            .replace("{people}", integer(gov.people, bcp47))
            .replace("{ties}", integer(gov.ties, bcp47))}
          {/* Stated only when there is any, so a zero does not read as a
              disclaimer about records that do not exist. */}
          {gov.fromPress > 0 &&
            ` ${F.peopleCoveragePress.replace("{press}", integer(gov.fromPress, bcp47))}`}
        </p>

        {/* The officeholder join, and what it refused to publish. A match
            rate on its own would read as a quality score; the two drop
            conditions are what make the rate mean anything. */}
        {offices && (
          <>
            <p className="mt-4 leading-relaxed text-[var(--ink-2)]">
              {F.officeJoin
                .replace("{matched}", integer(offices.matched, bcp47))
                .replace("{candidates}", integer(offices.candidates, bcp47))
                .replace(
                  "{updated}",
                  offices.registerUpdated ? formatDate(offices.registerUpdated, bcp47) : "—",
                )}
            </p>
            <p className="mt-2 leading-relaxed text-[var(--ink-3)]">
              {F.officeJoinDrops
                .replace("{unmatched}", integer(offices.unmatched, bcp47))
                .replace("{ambiguous}", integer(offices.ambiguous.length, bcp47))
                .replace(
                  "{mismatch}",
                  integer(offices.partyMismatch.length, bcp47),
                )}
            </p>
          </>
        )}
      </div>

      <div className="panel mt-6 p-6">
        <p className="label-mono mb-3 text-[var(--gold-deep)]">{F.legalTitle}</p>
        <p className="leading-relaxed text-[var(--ink-2)]">{F.legalBody}</p>
        <p className="label-mono mt-4">
          <a className="src" href={FOUNDATIONS_LAW_URL} target="_blank" rel="noopener noreferrer">
            {F.lawLink}
          </a>
        </p>
      </div>

      <div className="panel mt-6 p-6">
        <p className="label-mono mb-3 text-[var(--gold-deep)]">{F.gapTitle}</p>
        <p className="leading-relaxed text-[var(--ink-2)]">{F.gapBody}</p>
      </div>

      <p className="label-mono mt-8">
        <a className="src" href={data.source.url} target="_blank" rel="noopener noreferrer">
          {data.source.body} · {data.source.report} ↗
        </a>
      </p>
    </section>
  );
}
