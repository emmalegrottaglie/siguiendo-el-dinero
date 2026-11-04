import Link from "next/link";
import { relativeTime } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";
import type { DroppedSource, NewsItem } from "@/lib/news";

/** The words this block needs, supplied by the page's copy so each locale stays in one file. */
export interface OrgVoicesCopy {
  orgIntro: string;
  orgJuxta: string;
  orgsTitle: string;
  orgsNote: string;
  mediaTitle: string;
  mediaNote: string;
  directoryTitle: string;
  directoryNote: string;
  kindOrg: string;
  kindMedia: string;
  empty: string;
  droppedNote: string;
  caveatLabel: string;
  caveat: string;
  methodLink: string;
  orgSource: string;
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  lang: string;
}

/**
 * What the LGBTI rights organisations publish, in their own voice.
 *
 * It sits beside the votes and says nothing about them: no sentence here joins
 * a piece to a division, a group or a person. The organisations come first, each
 * piece under its organisation's name, and the press follows apart from them so
 * a reader can tell at a glance who is speaking. Rendered on the server so the
 * block needs no JavaScript to appear. Headlines, dates and links are shown as
 * the feeds publish them, never edited or summarised.
 */
export default function OrgVoices({
  t,
  locale,
  items,
  dropped,
  orgs,
  media,
  methodHref,
}: {
  t: OrgVoicesCopy;
  locale: Locale;
  items: NewsItem[];
  dropped: DroppedSource[];
  orgs: FeedSource[];
  media: FeedSource[];
  methodHref: string;
}) {
  const orgItems = items.filter((i) => i.sourceKind === "org");
  const mediaItems = items.filter((i) => i.sourceKind !== "org");

  return (
    <div className="n-neutral">
      <p className="n-body">{t.orgIntro}</p>
      <p className="n-meta mt-3 max-w-[46em]">{t.orgJuxta}</p>

      <h3 className="n-h3 mt-10">{t.orgsTitle}</h3>
      <p className="n-body mt-2 max-w-[46em]">{t.orgsNote}</p>
      {orgItems.length === 0 ? (
        <p className="n-body mt-6" role="status">
          {t.empty}
        </p>
      ) : (
        <Pieces items={orgItems} locale={locale} kind={t.kindOrg} />
      )}

      {mediaItems.length > 0 && (
        <>
          <h3 className="n-h3 mt-12">{t.mediaTitle}</h3>
          <p className="n-body mt-2 max-w-[46em]">{t.mediaNote}</p>
          <Pieces items={mediaItems} locale={locale} kind={t.kindMedia} />
        </>
      )}

      <h3 className="n-h3 mt-12">{t.directoryTitle}</h3>
      <p className="n-body mt-2 max-w-[46em]">{t.directoryNote}</p>
      <div className="mt-6 grid gap-x-12 gap-y-8 sm:grid-cols-2">
        <Directory label={t.kindOrg} sources={orgs} />
        <Directory label={t.kindMedia} sources={media} />
      </div>

      {/* A feed that failed is named: it broke on this load. */}
      {dropped.length > 0 && (
        <p className="n-meta mt-8">
          {t.droppedNote} {dropped.map((d) => d.name).join(" · ")}
        </p>
      )}

      <div className="mt-10 max-w-[46em]">
        <p className="n-label">{t.caveatLabel}</p>
        <p className="n-meta mt-1">{t.caveat}</p>
      </div>

      <p className="n-source">
        {t.orgSource}{" "}
        <Link href={methodHref}>{t.methodLink}</Link>.
      </p>
    </div>
  );
}

function Pieces({ items, locale, kind }: { items: NewsItem[]; locale: Locale; kind: string }) {
  return (
    <ul className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.link} className="border-t border-[var(--n-rule)] pt-3">
          {item.image && (
            // Empty alt: the headline below is the accessible name. The image goes through
            // /api/news-image so the publisher's server never sees the reader's IP address.
            // A plain <img>: the publishers' CDNs change too often for next/image's host list.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/news-image?url=${encodeURIComponent(item.image)}`}
              alt=""
              loading="lazy"
              decoding="async"
              className="mb-3 aspect-[16/9] w-full object-cover"
            />
          )}
          <p className="n-label">
            <span className="font-bold">{item.source}</span>
            <span className="n-meta font-normal">
              {" · "}
              {kind}
              {item.lang && item.lang !== "es" ? ` · ${item.lang.toUpperCase()}` : ""}
            </span>
          </p>
          <p className="mt-1 font-[family-name:var(--n-serif)] text-lg leading-snug">
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              {item.title}
            </a>
          </p>
          <p className="n-meta mt-2">{relativeTime(item.date, locale)}</p>
        </li>
      ))}
    </ul>
  );
}

function Directory({ label, sources }: { label: string; sources: FeedSource[] }) {
  return (
    <div>
      <p className="n-label">{label}</p>
      <ul className="mt-3 grid gap-2">
        {sources.map((s) => (
          <li key={s.id}>
            <a href={new URL(s.url).origin} target="_blank" rel="noopener noreferrer">
              {s.name} ↗
            </a>
            {s.lang !== "es" && <span className="n-meta ml-2">{s.lang.toUpperCase()}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
