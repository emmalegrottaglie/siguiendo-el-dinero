"use client";

import { useEffect, useState } from "react";
import type { NewsItem } from "@/lib/news";
import { DICTS, relativeTime, type Locale } from "@/lib/i18n";
import { FEED_COPY } from "./feed-copy";

/**
 * Recent headlines in which a name appears, from a Google News search through
 * `/api/news`. Headlines are the publishers' and are shown as written.
 *
 * Thumbnails go through `/api/news-image`, so a reader's browser never calls
 * a publisher's host directly. An organisation's own statement is a different
 * kind of item from a newspaper's report, and is labelled as such. A failed
 * request says so, rather than leaving an empty space that would read as "no
 * news".
 */
export default function NewsFeed({ query, locale }: { query: string; locale: Locale }) {
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  const f = DICTS[locale].feed;
  const c = FEED_COPY[locale];

  useEffect(() => {
    let alive = true;
    fetch(`/api/news?q=${encodeURIComponent(query)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { items: NewsItem[] }) => alive && setItems(d.items ?? []))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [query]);

  if (failed) return <p className="n-body mt-6" role="status">{c.newsFailed}</p>;
  if (items === null) return <p className="n-meta mt-6" aria-live="polite">{c.newsLoading}</p>;
  if (items.length === 0) return <p className="n-meta mt-6">{f.noRecent}</p>;

  return (
    <ul className="mt-6 max-w-[46rem]">
      {items.map((n, i) => (
        <li key={n.link + i} className="flex gap-4 border-t border-[var(--n-rule)] py-4">
          {n.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/news-image?url=${encodeURIComponent(n.image)}`}
              alt=""
              loading="lazy"
              decoding="async"
              className="mt-0.5 hidden aspect-video w-24 shrink-0 rounded-[3px] object-cover sm:block"
            />
          )}
          <div className="min-w-0 flex-1">
            <a href={n.link} target="_blank" rel="noopener noreferrer" className="[overflow-wrap:anywhere]">
              {n.title}
            </a>
            <p className="n-meta mt-1 flex flex-wrap gap-x-3">
              <span className="font-bold">{n.source}</span>
              <span>{relativeTime(n.date, locale)}</span>
              {n.sourceKind === "org" && <span>{f.fromOrg}</span>}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
