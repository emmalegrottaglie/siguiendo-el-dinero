import Link from "next/link";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n";
import { MIN_QUERY, search } from "@/lib/search";
import { integer } from "@/lib/format";
import { COPY } from "./copy";

// The query is a search param, so the page is rendered per request.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = getDict((await params).locale);
  return { title: COPY[locale].metaTitle };
}

/**
 * Search results: `lib/search.ts`, grouped by kind as it returns them. Each
 * result links to the page the search gives it, so the join to a record is the
 * one the search made and no name is matched again here.
 */
export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale: localeParam } = await params;
  const { q } = await searchParams;
  const { locale, bcp47 } = getDict(localeParam);
  const t = COPY[locale];
  const L = (path: string) => `/${locale}${path}`;

  const query = (q ?? "").trim();
  const outcome = await search(query, locale);

  return (
    <main>
      <div className="n-shell pb-10 pt-6">
        <h1 className="n-display">{t.title}</h1>
        <p className="n-body mt-6" style={{ fontSize: "1.15rem" }}>
          {t.intro}
        </p>
        <form action={L("/buscar")} method="get" role="search" className="n-search mt-8">
          <label htmlFor="n-q" className="sr-only">
            {t.searchLabel}
          </label>
          <input
            id="n-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder={t.searchPlaceholder}
            autoComplete="off"
            autoFocus={query.length === 0}
          />
          <button type="submit" className="n-button">
            {t.searchButton}
          </button>
        </form>

        {query.length === 0 ? null : query.length < MIN_QUERY ? (
          // The query was never run, so this is not "no results".
          <p className="n-finding mt-8" role="status">
            {t.tooShort(integer(MIN_QUERY, bcp47))}
          </p>
        ) : outcome.total === 0 ? (
          <>
            <p className="n-finding mt-8" role="status">
              {t.empty(query)}
            </p>
            <p className="n-body mt-3">{t.emptyHint}</p>
          </>
        ) : (
          <p className="n-finding mt-8" role="status">
            {outcome.total === 1 ? t.countOne(query) : t.count(integer(outcome.total, bcp47), query)}
          </p>
        )}
      </div>

      {outcome.groups.map((group) => (
        <section key={group.kind} className="n-section" aria-labelledby={`g-${group.kind}`}>
          <div className="n-shell">
            <h2 id={`g-${group.kind}`} className="n-h2">
              {t.kinds[group.kind as keyof typeof t.kinds]}
            </h2>
            <ul className="mt-4 flex flex-col">
              {group.results.map((r) => {
                return (
                  <li
                    key={r.href + r.title}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3"
                    style={{ borderBottom: "1px solid var(--n-rule)" }}
                  >
                    <Link href={r.href}>{r.title}</Link>
                    <span className="n-meta">{r.detail}</span>
                  </li>
                );
              })}
            </ul>
            {/* A truncated list says how much it truncated. */}
            {group.more > 0 && (
              <p className="n-meta mt-3">
                {t.more(integer(group.more, bcp47))}
                {group.kind === "person" && (
                  <>
                    {" · "}
                    <Link href={L(`/personas?q=${encodeURIComponent(query)}`)}>
                      {t.moreInPeople}
                    </Link>
                  </>
                )}
              </p>
            )}
          </div>
        </section>
      ))}

      <section className="n-section" aria-labelledby="gaps">
        <div className="n-shell">
          <h2 id="gaps" className="n-h2">
            {t.gapsTitle}
          </h2>
          <p className="n-body mt-3">{t.scope}</p>
        </div>
      </section>
    </main>
  );
}
