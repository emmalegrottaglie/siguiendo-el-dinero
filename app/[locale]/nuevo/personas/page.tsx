import Link from "next/link";
import type { Metadata } from "next";
import {
  getBadges,
  getPeople,
  placeOf,
  queryPeople,
  type Person,
} from "@/lib/people";
import { getDict } from "@/lib/i18n";
import { integer } from "@/lib/format";
import { getDeclarations } from "@/lib/declarations";
import { getFoundations, partyNifByFoundation } from "@/lib/foundations";
import { officeTies } from "@/lib/officeholder-ties";
import { COPY } from "./copy";
import Declarations from "./Declarations";

/*
 * The prototype's people directory. Each person is a row and each row is a
 * short line of four stations, one per kind of record the site can hold about
 * someone: recorded votes, a transcribed asset declaration, published pay, a
 * seat on a party foundation's board. A filled station is on record, a hollow
 * one is not, and both are said in words for screen readers. The rows are in
 * alphabetical order and are never ranked by anything the records contain.
 */

// Search, filters and paging come from the query string.
export const dynamic = "force-dynamic";

const PER_PAGE = 50;
const STATIONS = ["votes", "declaration", "pay", "board"] as const;
type Station = (typeof STATIONS)[number];
const STATION_CLS: Record<Station, string> = {
  votes: "n-topic",
  declaration: "n-companies",
  pay: "n-state",
  board: "n-foundations",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = getDict((await params).locale);
  return { title: COPY[locale].metaTitle };
}

export default async function PrototypePeople({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    party?: string;
    kind?: string;
    page?: string;
  }>;
}) {
  const { locale, bcp47, t: dict } = getDict((await params).locale);
  const t = COPY[locale];
  const { q, party, kind: kindParam, page: pageParam } = await searchParams;
  const kind =
    kindParam === "deputies" ||
    kindParam === "others" ||
    kindParam === "declarations"
      ? kindParam
      : "all";
  const L = (path: string) => `/${locale}${path}`;

  const [everyone, badges, declarations, foundations] = await Promise.all([
    getPeople(),
    getBadges(),
    getDeclarations(),
    getFoundations(),
  ]);
  const ties = await officeTies(partyNifByFoundation(foundations));
  const onBoard = new Set(
    [...ties.byPerson.values()].flatMap((list) => list.map((x) => x.slug)),
  );
  const declared = new Set(declarations.declarations.map((d) => d.cod));

  const has = (p: Person): Record<Station, boolean> => ({
    votes: badges.get(p.slug)?.hasRecord ?? false,
    declaration: p.deputy ? declared.has(p.deputy.cod) : false,
    pay: p.gross > 0,
    board: onBoard.has(p.slug),
  });

  // The finding is computed over everyone, before any filter.
  const deputies = everyone.filter((p) => p.deputy);
  const finding = t.finding(
    integer(everyone.length, bcp47),
    integer(deputies.length, bcp47),
    integer(deputies.filter((p) => declared.has(p.deputy!.cod)).length, bcp47),
    integer(everyone.filter((p) => onBoard.has(p.slug)).length, bcp47),
  );

  // The text filter is the current directory's. The kind filter comes next, and
  // the party counts are taken over that set, so the number beside each party
  // is what choosing it returns.
  const { results: matched } = await queryPeople({
    q,
    perPage: Number.MAX_SAFE_INTEGER,
  });
  const ofKind = matched.filter((p) =>
    kind === "all" ? true : kind === "others" ? !p.deputy : !!p.deputy,
  );
  const counts = new Map<string, number>();
  for (const p of ofKind)
    counts.set(p.partyShort, (counts.get(p.partyShort) ?? 0) + 1);
  const parties = [...counts.entries()]
    .map(([short, count]) => ({ short, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
  const list = (party ? ofKind.filter((p) => p.partyShort === party) : ofKind)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), pages);
  const rows = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const href = (next: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams();
    const merged: Record<string, string | number | undefined> = {
      q,
      party,
      kind,
      page,
      ...next,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (
        v === undefined ||
        v === "" ||
        (k === "page" && v === 1) ||
        (k === "kind" && v === "all")
      )
        continue;
      sp.set(k, String(v));
    }
    const qs = sp.toString();
    return L(`/nuevo/personas${qs ? `?${qs}` : ""}`);
  };

  return (
    <main>
      <div className="n-shell pb-10 pt-6">
        <h1 className="n-display">{t.title}</h1>
        <p className="n-body mt-6" style={{ fontSize: "1.15rem" }}>
          {t.intro}
        </p>
        <p className="n-finding mt-8">{finding}</p>
      </div>

      <section className="n-section">
        <div className="n-shell">
          <form
            action={L("/nuevo/personas")}
            method="get"
            role="search"
            className="n-search"
          >
            <label htmlFor="n-people-q" className="sr-only">
              {t.searchLabel}
            </label>
            <input
              id="n-people-q"
              name="q"
              type="search"
              defaultValue={q ?? ""}
              placeholder={t.searchPlaceholder}
              autoComplete="off"
            />
            {party && <input type="hidden" name="party" value={party} />}
            {kind !== "all" && <input type="hidden" name="kind" value={kind} />}
            <button type="submit" className="n-button">
              {t.searchButton}
            </button>
          </form>

          <div className="mt-6 grid gap-4">
            <nav
              aria-label={t.filterKind}
              className="flex flex-wrap items-baseline gap-x-4 gap-y-2"
            >
              <span className="n-label">{t.filterKind}</span>
              {(["all", "deputies", "others", "declarations"] as const).map(
                (k) => (
                  <Link
                    key={k}
                    href={href({ kind: k, page: 1 })}
                    aria-current={kind === k ? "page" : undefined}
                    className={kind === k ? "font-bold !no-underline" : ""}
                  >
                    {t.kinds[k]}
                  </Link>
                ),
              )}
            </nav>
            <nav
              aria-label={t.filterParty}
              className="flex flex-wrap items-baseline gap-x-4 gap-y-2"
            >
              <span className="n-label">{t.filterParty}</span>
              <Link
                href={href({ party: undefined, page: 1 })}
                aria-current={!party ? "page" : undefined}
                className={!party ? "font-bold !no-underline" : ""}
              >
                {t.allParties}
              </Link>
              {parties
                .filter((p) => p.short)
                .map((p) => (
                  <Link
                    key={p.short}
                    href={href({ party: p.short, page: 1 })}
                    aria-current={party === p.short ? "page" : undefined}
                    className={
                      party === p.short ? "font-bold !no-underline" : ""
                    }
                  >
                    {p.short}{" "}
                    <span className="n-meta">{integer(p.count, bcp47)}</span>
                  </Link>
                ))}
            </nav>
          </div>

          {kind === "declarations" ? (
            <Declarations
              deputies={list}
              data={declarations}
              t={dict}
              locale={locale}
              bcp47={bcp47}
            />
          ) : (
            <>
              <details open className="mt-8">
                <summary className="n-label cursor-pointer">
                  {t.legendTitle}
                </summary>
                <p className="n-body mt-3">{t.legend}</p>
                <ul className="mt-3 grid gap-1">
                  {STATIONS.map((s) => (
                    <li
                      key={s}
                      className={`${STATION_CLS[s]} flex items-baseline gap-2`}
                    >
                      <span
                        aria-hidden
                        className="inline-block h-3 w-3 shrink-0 rounded-full"
                        style={{ background: "var(--route)" }}
                      />
                      {t.legendItems[s]}
                    </li>
                  ))}
                </ul>
              </details>

              <p className="n-meta mt-8" aria-live="polite">
                {rows.length > 0 &&
                  t.count(
                    integer((page - 1) * PER_PAGE + 1, bcp47),
                    integer((page - 1) * PER_PAGE + rows.length, bcp47),
                    integer(list.length, bcp47),
                  )}
              </p>

              {rows.length === 0 ? (
                <p className="n-body mt-4">{t.none}</p>
              ) : (
                <ul className="mt-2">
                  {rows.map((p) => {
                    const on = has(p);
                    const post = p.deputy
                      ? p.deputy.role === "Diputada"
                        ? t.deputyF
                        : t.deputy
                      : p.role;
                    const where = placeOf(p);
                    return (
                      <li
                        key={p.slug}
                        className="grid gap-x-6 gap-y-2 border-t border-[var(--n-rule)] py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                      >
                        <div className="min-w-0">
                          <Link
                            href={L(`/nuevo/politico/${p.slug}`)}
                            className="font-bold"
                          >
                            {p.name}
                          </Link>
                          <p className="n-meta mt-0.5">
                            {[p.partyShort, post, where]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                        <ol
                          className="flex items-center"
                          aria-label={t.legendTitle}
                        >
                          {STATIONS.map((s, i) => (
                            <li
                              key={s}
                              className={`${STATION_CLS[s]} flex items-center`}
                            >
                              {i > 0 && (
                                <span
                                  aria-hidden
                                  className="block h-[3px] w-5"
                                  style={{
                                    background:
                                      on[s] && on[STATIONS[i - 1]]
                                        ? "var(--n-ink-3)"
                                        : "transparent",
                                    backgroundImage:
                                      on[s] && on[STATIONS[i - 1]]
                                        ? undefined
                                        : "repeating-linear-gradient(90deg, var(--n-ink-3) 0 3px, transparent 3px 6px)",
                                  }}
                                />
                              )}
                              <span
                                title={t.stations[s]}
                                className="block h-[15px] w-[15px] rounded-full border-[3px]"
                                style={{
                                  borderColor: on[s]
                                    ? "var(--route)"
                                    : "var(--n-ink-3)",
                                  background: on[s]
                                    ? "var(--route)"
                                    : "var(--n-bg)",
                                }}
                              />
                              <span className="sr-only">
                                {on[s]
                                  ? t.srOn(t.stations[s])
                                  : t.srOff(t.stations[s])}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </li>
                    );
                  })}
                </ul>
              )}

              {pages > 1 && (
                <nav
                  aria-label={t.pagesLabel}
                  className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2"
                >
                  {page > 1 && (
                    <Link href={href({ page: page - 1 })}>{t.prev}</Link>
                  )}
                  <span className="n-meta">
                    {t.page(integer(page, bcp47), integer(pages, bcp47))}
                  </span>
                  {page < pages && (
                    <Link href={href({ page: page + 1 })}>{t.next}</Link>
                  )}
                </nav>
              )}
            </>
          )}

          <p className="n-meta mt-10">
            {t.sourceNote} <Link href={L("/politicos")}>{t.oldDirectory}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
