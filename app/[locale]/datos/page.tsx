import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { DATASETS, type DatasetDef, type DatasetSource } from "@/lib/datasets";
import { fill, formatDate, integer } from "@/lib/format";
import { COPY as METHOD } from "../metodologia/copy";
import { ROUTES, itemForTable } from "../metodologia/routes";
import { COPY } from "./copy";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = getDict((await params).locale);
  return { title: COPY[locale].metaTitle };
}

/** The column headers of a table: the first line of its CSV, which `lib/csv.ts` writes from fixed identifiers. */
async function columnsOf(def: DatasetDef): Promise<string[]> {
  const csv = await def.csv();
  const header = csv.replace(/^﻿/, "").split("\r\n", 1)[0] ?? "";
  return header ? header.split(",") : [];
}

/**
 * The prototype's data page: every table this site publishes, as a CSV.
 *
 * It replaces `/datos` and renders the same registry (`lib/datasets.ts`), so a
 * table added there appears here with nothing else changed. The downloads are
 * the existing endpoint, `/[locale]/datos/[table]`, untouched. Each table keeps
 * its id as its anchor, so a citation of `#salarios` still lands on it.
 *
 * What is new: tables are grouped by the routes of the front page's map, each
 * lists its columns, and each links to the methodology item that says how it
 * was obtained. Row counts are never added across tables: a row of votes and a
 * row of subsidies are not the same thing.
 */
export default async function PrototypeData({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const { locale, bcp47, t } = getDict(localeParam);
  const c = COPY[locale];
  const mc = METHOD[locale];
  const D = t.datos;
  const L = (p: string) => `/${locale}${p}`;
  const date = (iso: string) => formatDate(iso, bcp47);

  const loaded = await Promise.all(
    DATASETS.map(async (def) => ({
      def,
      count: await def.count(),
      sources: await def.sources(),
      columns: await columnsOf(def),
    })),
  );
  const byId = new Map(loaded.map((x) => [x.def.id, x]));

  // Tables grouped by route, in the map's order. A table the routes do not
  // name still appears, under "other tables", so nothing in the registry is
  // ever left off the page.
  const placed = new Set(ROUTES.flatMap((r) => r.items.flatMap((i) => i.tables)));
  const groups = [
    ...ROUTES.map((r) => ({
      id: `ruta-${r.id}`,
      cls: r.cls,
      title: mc.routes[r.id].title,
      tables: r.items.flatMap((i) => i.tables).flatMap((id) => byId.get(id) ?? []),
    })),
    {
      id: "otras",
      cls: "n-neutral",
      title: c.others,
      tables: loaded.filter((x) => !placed.has(x.def.id)),
    },
  ].filter((g) => g.tables.length > 0);
  const routeCount = groups.filter((g) => g.id !== "otras").length;

  /**
   * The registry writes a source's period in Spanish ("actualizado 2026-08-31",
   * "comprobado …", "vigente", or a report's approval date). The known shapes
   * are put in the page's language; anything else is shown as recorded.
   */
  const period = (p: string): string => {
    let x: RegExpMatchArray | null;
    if ((x = p.match(/^actualizado (\d{4}-\d{2}-\d{2})$/))) return fill(t.charts.updated, { date: date(x[1]) });
    if ((x = p.match(/^comprobado (\d{4}-\d{2}-\d{2})$/))) return c.checked(date(x[1]));
    if (p === "vigente") return c.current;
    if ((x = p.match(/^(\d{4}-\d{2}-\d{2})$/))) return fill(t.charts.approved, { date: date(x[1]) });
    if ((x = p.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)))
      return fill(t.charts.approved, { date: date(`${x[3]}-${x[2]}-${x[1]}`) });
    return p;
  };

  return (
    <main>
      <div className="n-shell pb-10 pt-6">
        <h1 className="n-display">{D.title}</h1>
        <p className="n-body mt-6" style={{ fontSize: "1.15rem" }}>
          {D.lead}
        </p>
        <p className="n-finding mt-6">
          {c.finding(integer(loaded.length, bcp47), integer(routeCount, bcp47))}
        </p>
        <p className="n-body mt-4">{D.columnsNote}</p>
        <p className="n-meta mt-2 max-w-[var(--n-w-read)]">{c.format}</p>

        <nav aria-label={mc.navLabel} className="mt-8">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {groups.map((g) => (
              <li key={g.id} className={`${g.cls} inline-flex items-center gap-2`}>
                <span
                  aria-hidden
                  className="inline-block h-3.5 w-3.5 shrink-0 rounded-full"
                  style={{ background: "var(--route)" }}
                />
                <a href={`#${g.id}`}>{g.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {groups.map((g) => (
        <Section key={g.id} id={g.id} title={g.title} cls={g.cls}>
          {g.tables.map(({ def, count, sources, columns }) => {
            const meta = D.tables[def.id as keyof typeof D.tables];
            const item = itemForTable(def.id);
            const file = `${def.id}.csv`;
            return (
              <article
                key={def.id}
                id={def.id}
                aria-labelledby={`${def.id}-t`}
                className="mt-8 border-t border-[var(--n-rule)] pt-6 first-of-type:mt-2"
                style={{ scrollMarginTop: "1.5rem" }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 id={`${def.id}-t`} className="n-h3">
                    <a href={`#${def.id}`} className="!no-underline hover:!underline" title={c.tableLink}>
                      {meta?.title ?? def.id}
                    </a>
                  </h3>
                  <p className="n-meta n-num">
                    {c.rows(integer(count, bcp47))} · {c.columns(integer(columns.length, bcp47))}
                  </p>
                </div>
                {meta?.description && <p className="n-body mt-2">{meta.description}</p>}

                <dl className="mt-4 flex flex-col gap-4">
                  <Row label={sources.length > 1 ? c.sources : c.source}>
                    {def.perRowSourced || sources.length === 0 ? (
                      <p>{c.perRowSourced}</p>
                    ) : (
                      <ul className="flex flex-col gap-1">
                        {sources.map((s: DatasetSource) => (
                          <li key={`${s.url}${s.name}`}>
                            <a href={s.url}>{[s.publisher, s.name].filter(Boolean).join(", ")}</a>
                            {s.period ? (
                              <span className="text-[var(--n-ink-3)]"> ({period(s.period)})</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Row>
                  <Row label={c.columns(integer(columns.length, bcp47))}>
                    <details open={columns.length <= 16}>
                      <summary className="cursor-pointer">{file}</summary>
                      <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1.5">
                        {columns.map((col) => (
                          <li key={col}>
                            <code
                              className="inline-block rounded-[3px] border border-[var(--n-rule)] px-1.5 text-[0.8125rem]"
                              style={{ background: "var(--n-card)" }}
                            >
                              {col}
                            </code>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </Row>
                </dl>

                <p className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {/* The existing download endpoint, exactly as the current /datos links it. */}
                  <Link
                    href={`/${locale}/datos/${def.id}`}
                    prefetch={false}
                    className="n-button inline-flex max-w-full items-center !no-underline"
                    style={{ color: "var(--n-bg)", overflowWrap: "anywhere" }}
                  >
                    {c.download(file)}
                  </Link>
                  {item && <Link href={L(`/metodologia#${item}`)}>{c.method}</Link>}
                </p>
              </article>
            );
          })}
        </Section>
      ))}
    </main>
  );
}

function Section({
  id,
  title,
  cls,
  children,
}: {
  id: string;
  title: string;
  cls: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`n-shell n-section ${cls}`} aria-labelledby={`${id}-t`}>
      <span aria-hidden className="mb-4 block h-[5px] w-16 rounded-[2px]" style={{ background: "var(--route)" }} />
      <h2 id={`${id}-t`} className="n-h2 mb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-6">
      <dt className="n-label">{label}</dt>
      <dd className="n-body min-w-0">{children}</dd>
    </div>
  );
}
