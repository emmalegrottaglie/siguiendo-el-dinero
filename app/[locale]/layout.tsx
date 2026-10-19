import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import { notFound } from "next/navigation";
import { getDict, LOCALES, isLocale } from "@/lib/i18n";
import Masthead from "@/components/Masthead";
import "../globals.css";

/* Two faces only. Cormorant Garamond carries every heading, kicker, tab and
   display figure; Lora carries body, meta and table amounts. The previous
   system loaded three (Fraunces, Archivo, IBM Plex Mono) and the mono face
   existed only to get tabular figures, which both of these provide. */

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  // 600 is the ceiling: the design system caps headings there, and the large
  // display sizes take the 400 cut.
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

/* The masthead dateline is rendered from the request's date, so the shell
   re-renders on the same hourly cadence as the pages inside it. Without this
   a statically prerendered locale would carry the build date indefinitely. */
export const revalidate = 3600;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { t } = getDict(locale);
  return { title: t.meta.title, description: t.meta.description };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { bcp47, t } = getDict(locale);

  // Formatted on the server: a client-side date would either mismatch at
  // hydration or leave the dateline absent from the HTML.
  const dateline = new Intl.DateTimeFormat(bcp47, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Madrid",
  }).format(new Date());

  return (
    // suppressHydrationWarning: browser extensions (e.g. Dark Reader) inject
    // attributes onto <html> before React hydrates; that mismatch is benign.
    //
    // The font variables go on <html>, not <body>. `--font-heading` and
    // `--font-body` are declared on :root and refer to them, and a custom
    // property is resolved where it is declared: with the variables on <body>
    // both resolved as invalid at :root, and every page fell back to the
    // system sans stack instead of Cormorant Garamond and Lora.
    <html
      lang={locale}
      className={`${cormorant.variable} ${lora.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Skip link: the nav repeats eight links before the content on every
            page, so a keyboard or screen-reader user had to pass all of them
            each time.

            Deliberately not sr-only/focus:not-sr-only. That pair left the link
            2px tall when focused, because sr-only's `height: 1px` and `clip`
            survived the reset. Translating it out of view instead is
            deterministic: the element keeps its real size at all times, stays
            focusable and in the accessibility tree, and simply slides in. */}
        <a
          href="#main"
          className="label-mono absolute left-0 top-0 z-50 inline-flex min-h-11 -translate-y-full items-center border border-[var(--gold)] bg-[var(--surface)] px-4 text-[var(--gold-deep)] transition-transform focus:translate-y-0"
        >
          {t.nav.skipToContent}
        </a>

        {/* The 6px ink bar that opens the page. */}
        <div aria-hidden style={{ height: 6, background: "var(--ink)" }} />

        <Masthead
          locale={locale}
          nav={t.nav}
          masthead={t.masthead}
          // Three strings, not the whole block: the masthead is a client
          // component, so anything handed to it ships with every page.
          search={{
            label: t.search.label,
            placeholder: t.search.placeholder,
            submit: t.search.submit,
          }}
          dateline={dateline}
        />

        {/* tabIndex -1 so the skip link actually moves focus here, not just
            the scroll position. */}
        <div
          id="main"
          tabIndex={-1}
          className="mx-auto max-w-[1280px] px-[22px] pb-16 outline-none"
        >
          {children}

          <footer className="mt-8 flex flex-wrap justify-between gap-x-8 gap-y-2 border-t border-[var(--ink)] pt-3.5">
            <span className="label-mono" style={{ letterSpacing: "0.1em" }}>
              {t.footer.source}
            </span>
            <span className="label-mono" style={{ letterSpacing: "0.1em" }}>
              {t.footer.caveat}
            </span>
          </footer>
        </div>
      </body>
    </html>
  );
}
