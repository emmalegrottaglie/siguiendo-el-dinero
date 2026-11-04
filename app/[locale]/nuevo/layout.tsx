import type { ReactNode } from "react";
import Link from "next/link";
import { Atkinson_Hyperlegible_Next, Literata } from "next/font/google";
import { getDict } from "@/lib/i18n";
import { COPY } from "./copy";
import "./nuevo.css";

/*
 * The redesign prototype's frame.
 *
 * Literata carries what the site says: headlines, findings, names. It was drawn
 * for long reading on screens and its figures are sturdy at display sizes.
 * Atkinson Hyperlegible Next carries what a reader looks up: labels, tables,
 * figures in running text. It was drawn for legibility, with letterforms that
 * cannot be mistaken for one another (1 l I, 0 O), which is the job a table of
 * declared amounts has to do.
 *
 * The words live in ./copy.ts (es, en, ca) while it is a prototype; they move
 * to lib/i18n.ts when a design is chosen.
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

const NAV = [
  { href: "/nuevo/partidos", key: "parties" },
  { href: "/nuevo/personas", key: "people" },
  { href: "/nuevo/territorios", key: "territories" },
  { href: "/nuevo/temas", key: "topics" },
  { href: "/nuevo/metodologia", key: "method" },
] as const;

export default async function PrototypeLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const { locale } = getDict(localeParam);
  const t = COPY[locale];
  return (
    <div className={`n-root ${literata.variable} ${atkinson.variable}`}>
      <p className="n-meta border-b border-[var(--n-rule)] px-4 py-2 text-center">
        {t.banner} <Link href={`/${locale}`}>{t.bannerLink}</Link>
      </p>
      <header className="n-shell flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-5">
        <Link
          href={`/${locale}/nuevo`}
          className="!no-underline"
          style={{ fontFamily: "var(--n-serif)", fontSize: "1.45rem", fontWeight: 600, letterSpacing: "-0.01em" }}
        >
          {t.siteName}
        </Link>
        <nav aria-label={t.navLabel}>
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
      {children}
      <footer className="n-shell n-section n-meta grid gap-3 sm:grid-cols-2">
        <p>{t.footerSources}</p>
        <p>
          {t.footerJuxta} <Link href={`/${locale}/nuevo/metodologia`}>{t.footerLink}</Link>
        </p>
      </footer>
    </div>
  );
}
