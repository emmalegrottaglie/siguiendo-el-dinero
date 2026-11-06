"use client";

import { useEffect, useState } from "react";
import type { BlueskyPost } from "@/lib/bluesky";
import { DICTS, relativeTime, type Locale } from "@/lib/i18n";
import { FEED_COPY } from "./feed-copy";

/**
 * A person's latest Bluesky posts, read through `/api/bluesky`.
 *
 * Only rendered for a handle in the curated registry (`lib/politicians.ts`),
 * each verified by hand, because Bluesky's own identity checks are weak and a
 * squatted handle would put someone else's words on this person's page. The
 * posts are theirs and are shown as written, never translated.
 */
export default function BlueskyFeed({ actor, locale }: { actor: string; locale: Locale }) {
  const [posts, setPosts] = useState<BlueskyPost[] | null>(null);
  const f = DICTS[locale].feed;
  const c = FEED_COPY[locale];
  const bcp47 = locale === "en" ? "en-GB" : locale === "ca" ? "ca-ES" : "es-ES";

  useEffect(() => {
    let alive = true;
    fetch(`/api/bluesky?actor=${encodeURIComponent(actor)}`)
      .then((r) => r.json())
      .then((d: { posts: BlueskyPost[] }) => alive && setPosts(d.posts ?? []))
      .catch(() => alive && setPosts([]));
    return () => {
      alive = false;
    };
  }, [actor]);

  if (posts === null) return <p className="n-meta mt-6" aria-live="polite">{c.loading}</p>;
  if (posts.length === 0) return <p className="n-meta mt-6">{f.cannotLoad}</p>;

  return (
    <ul className="mt-6 grid max-w-[46rem] gap-3">
      {posts.map((p, i) => (
        <li key={p.url + i} className="rounded-[6px] border border-[var(--n-rule)] bg-[var(--n-card)] p-4">
          {p.isRepost && <p className="n-meta mb-1">{f.reposted}</p>}
          <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{p.text}</p>
          <p className="n-meta n-num mt-3 flex flex-wrap gap-x-4">
            <a href={p.url} target="_blank" rel="noopener noreferrer">
              {relativeTime(p.createdAt, locale)}
            </a>
            <span>
              {p.likes.toLocaleString(bcp47)} {c.likes}
            </span>
            <span>
              {p.reposts.toLocaleString(bcp47)} {c.reposts}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}
