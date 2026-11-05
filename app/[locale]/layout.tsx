import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Atkinson_Hyperlegible_Next, Literata } from "next/font/google";
import { getDict, LOCALES, isLocale } from "@/lib/i18n";
import LocaleToggle from "@/components/LocaleToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { COPY } from "./copy";
import "../globals.css";
import "./site.css";

/*
 * The site's frame.
 *
 * Literata carries what the site says: headlines, findings, names. It was drawn
 * for long reading on screens and its figures are sturdy at display sizes.
 * Atkinson Hyperlegible Next carries what a reader looks up: labels, tables,
 * figures in running text. It was drawn for legibility, with letterforms that
 * cannot be mistaken for one another (1 l I, 0 O), which is the job a table of
 * declared amounts has to do.
 *
 * Each page's words live in a copy.ts beside it (es, en, ca); the frame's and
 * the front page's are in ./copy.ts.
 */
const literata = Literata({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-literata",
  display: "swap",
});
const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  display: "swap",
  // next/font has no fallback metrics for this family and logs an error on
  // every compile without this; the system sans fallback is used unadjusted.
  adjustFontFallback: false,
});

/* The front page and the indexes are re-rendered on the same hourly cadence as
   the data pages inside them. */
export const revalidate = 3600;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { t } = getDict((await params).locale);
  return { title: t.meta.title, description: t.meta.description };
}

/* Applies a stored theme choice before first paint, so a reader who chose dark
   never sees a light frame first. With nothing stored it does nothing and the
   stylesheet follows prefers-color-scheme. The key and the values must match
   components/ThemeToggle.tsx. Wrapped in try/catch because localStorage throws
   when storage is blocked; the system theme is the right fallback. */
const THEME_SCRIPT = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

const NAV = [
  { href: "/financiacion", key: "money" },
  { href: "/partidos", key: "parties" },
  { href: "/fundaciones", key: "foundations" },
  { href: "/personas", key: "people" },
  { href: "/territorios", key: "territories" },
  { href: "/temas", key: "topics" },
  { href: "/contexto", key: "context" },
  { href: "/metodologia", key: "method" },
] as const;

export default async function SiteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const { locale, t: dict } = getDict(localeParam);
  const t = COPY[locale];
  return (
    // suppressHydrationWarning on <html> only: the theme script sets data-theme
    // on it before React hydrates. It does not reach children.
    <html lang={locale} className={`${literata.variable} ${atkinson.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="n-root">
        <a href="#main" className="n-skip">
          {dict.nav.skipToContent}
        </a>
        <header className="n-shell py-5">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <Link
              href={`/${locale}`}
              className="!no-underline"
              style={{ fontFamily: "var(--n-serif)", fontSize: "1.45rem", fontWeight: 600, letterSpacing: "-0.01em" }}
            >
              {t.siteName}
            </Link>
            <div className="flex flex-wrap items-center gap-x-4">
              <LocaleToggle current={locale} />
              <ThemeToggle t={dict.masthead} />
            </div>
          </div>
          <nav aria-label={t.navLabel} className="mt-3">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={`/${locale}${n.href}`} className="!no-underline hover:!underline">
                    {t.nav[n.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <div id="main" tabIndex={-1} className="outline-none">
          {children}
        </div>
        <footer className="n-shell n-section n-meta grid gap-3 sm:grid-cols-2">
          <p>{t.footerSources}</p>
          <p>
            {t.footerJuxta} <Link href={`/${locale}/metodologia`}>{t.footerLink}</Link>
          </p>
        </footer>
      </body>
    </html>
  );
}
