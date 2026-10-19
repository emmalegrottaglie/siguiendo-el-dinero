import {
  advertising,
  financial,
  rankedBySpending,
  spendingTotals,
  type SpendingFile,
} from "@/lib/spending";
import { euroExact, integer, percent } from "@/lib/format";
import { formationColor } from "@/lib/spending";
import { SPEND_COLORS } from "@/lib/chart-colors";
import Bar, { BarLegend, type Segment } from "./chart/Bar";
import Caveat from "./Caveat";
import type { Dict } from "@/lib/i18n";
import SpendShares, { type ShareRow } from "./SpendShares";
import { spendingSource } from "@/lib/chart-sources";
import { readerProps, say } from "@/lib/chart-reader";
import { exportLabels, exportMeta, type ChartExport } from "@/lib/chart-export";
import ChartReader from "./chart/ChartReader";
import ExportButton from "./chart/ExportButton";
import SourceLine from "./chart/SourceLine";
import ScrollBox from "./chart/ScrollBox";

/**
 * What an election's money was declared to have bought.
 *
 * The site could show which parties received public money and never what it
 * purchased. This is the first answer, and the answer is partly that the record
 * does not say: over half of declared ordinary spending sits in a single
 * residual line the report does not break down. The layout gives that residual
 * the same weight as the categories that are itemised, rather than burying it.
 *
 * The three spending lines partition declared ordinary spending exactly —
 * advertising plus financial plus residual reconciles to the declared total —
 * so their percentages add to 100 %. Mailings do not belong to that total at
 * all; they are accounted separately, outside the general spending limit, which
 * is why the fourth row runs full width against a note rather than taking a
 * share of a denominator it is not part of.
 */
export default function ElectoralSpending({
  data,
  t,
  bcp47,
}: {
  data: SpendingFile;
  t: Dict;
  bcp47: string;
}) {
  const s = t.spending;
  const totals = spendingTotals(data);
  const ranked = rankedBySpending(data);

  const rows: ShareRow[] = ranked.map((f) => ({
    name: f.name,
    value: f.ordinary.declared,
    // The report's formation names are coalition labels, so they resolve
    // through the explicit map in lib/spending.ts rather than by token
    // matching, and fall back to a neutral grey rather than to nothing.
    color: formationColor(f.name),
  }));

  const lines = [
    {
      label: s.lineAdvertising,
      value: totals.advertising,
      share: totals.advertising / totals.declared,
      // A bar fill, not text: 3.02:1 clears the 3:1 WCAG 1.4.11 asks of a
      // graphic, and the figure beside it carries the value in ink.
      color: SPEND_COLORS.advertising,
      note: s.lineAdvertisingNote,
    },
    {
      label: s.lineResidual,
      value: totals.other,
      share: totals.otherShare,
      color: SPEND_COLORS.residual,
      note: s.lineResidualNote,
    },
    {
      label: s.lineFinancial,
      value: totals.financial,
      share: totals.financial / totals.declared,
      color: SPEND_COLORS.financial,
      note: s.lineFinancialNote,
    },
  ];

  const source = spendingSource(data, t.charts, bcp47);
  const mailingsNote = s.lineMailingsNote.replace("{count}", integer(totals.mailingCount, bcp47));

  // The four lines as the reader and the image read them. Mailings have no
  // share: they sit outside the declared total, so the share is "—".
  const lineItems = [
    ...lines.map((l) =>
      say(l.label, euroExact(l.value, bcp47), `${percent(l.share, bcp47)} ${s.ofDeclared}`),
    ),
    say(s.lineMailings, euroExact(totals.mailings, bcp47), mailingsNote),
  ];

  const linesImage: ChartExport = {
    ...exportMeta(t.charts, bcp47, {
      title: s.linesTitle,
      caption: `${s.lineResidualNote} ${mailingsNote}`,
      sources: [source],
      file: "gasto-electoral-por-concepto",
    }),
    body: {
      kind: "bars",
      rows: [
        ...lines.map((l) => ({
          label: l.label,
          value: `${euroExact(l.value, bcp47)} · ${percent(l.share, bcp47)}`,
          segments: [{ value: l.value, color: l.color }],
          total: totals.declared,
          scale: "share" as const,
        })),
        {
          label: s.lineMailings,
          value: `${euroExact(totals.mailings, bcp47)} · —`,
          segments: [{ value: totals.mailings, color: SPEND_COLORS.mailings }],
          total: totals.mailings,
          scale: "share" as const,
        },
      ],
    },
  };

  return (
    <section className="pt-10">
      <p className="eyebrow">{s.eyebrow}</p>
      <h2
        className="display mt-3 font-normal"
        style={{ fontSize: "clamp(32px,4.6vw,54px)", maxWidth: "22ch" }}
      >
        {s.title}
      </h2>
      <p
        className="mt-5"
        style={{ fontSize: "15px", lineHeight: 1.68, color: "var(--ink-2)", maxWidth: "70ch" }}
      >
        {s.intro}
      </p>

      <div className="mt-9 border-t border-[var(--line)] pt-8">
        <SpendShares
          rows={rows}
          total={totals.declared}
          totalLabel={s.sharesTotal}
          caption={s.sharesCaption}
          scaleNote={s.sharesNote}
          source={source}
          charts={t.charts}
          bcp47={bcp47}
        />
      </div>

      {/* Where the money went, as the report's own categories */}
      <div className="mt-10 border-t border-[var(--line)] pt-7">
        <h3 className="display text-[22px] font-semibold" style={{ letterSpacing: "-0.015em" }}>
          {s.linesTitle}
        </h3>
        <ChartReader
          className="mt-5"
          items={lineItems}
          {...readerProps(t.charts, bcp47, { title: s.linesTitle, count: lineItems.length })}
        >
          <ul className="flex flex-col gap-5">
            {lines.map((l, i) => (
              <li key={l.label} data-chart-item={i}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <span style={{ fontSize: "14px" }}>{l.label}</span>
                  <span className="mono whitespace-nowrap" style={{ fontSize: "13px" }}>
                    {euroExact(l.value, bcp47)} ·{" "}
                    <span style={{ color: "var(--ink-3)" }}>{percent(l.share, bcp47)}</span>
                  </span>
                </div>
                <Bar
                  className="mt-1.5"
                  segments={[{ value: l.value, color: l.color, label: l.label }]}
                  total={totals.declared}
                  scale="share"
                  size="sm"
                />
                <p className="mt-1.5" style={{ fontSize: "11.5px", color: "var(--ink-3)" }}>
                  {l.note}
                </p>
              </li>
            ))}

            {/* A different denominator, shown full width on purpose. */}
            <li data-chart-item={lines.length}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <span style={{ fontSize: "14px" }}>{s.lineMailings}</span>
                <span className="mono whitespace-nowrap" style={{ fontSize: "13px" }}>
                  {euroExact(totals.mailings, bcp47)} · <span style={{ color: "var(--ink-3)" }}>—</span>
                </span>
              </div>
              {/* A different denominator, so the bar is its own whole. */}
              <Bar
                className="mt-1.5"
                segments={[
                  {
                    value: totals.mailings,
                    color: SPEND_COLORS.mailings,
                    label: s.lineMailings,
                  },
                ]}
                total={totals.mailings}
                scale="share"
                size="sm"
              />
              <p className="mt-1.5" style={{ fontSize: "11.5px", color: "var(--ink-3)" }}>
                {mailingsNote}
              </p>
            </li>
          </ul>
        </ChartReader>
        <SourceLine sources={[source]} label={t.charts.source} />
        <ExportButton
          className="mt-3"
          spec={linesImage}
          {...exportLabels(t.charts, s.linesTitle)}
        />
      </div>

      {/* Per formation */}
      <ScrollBox className="mt-10 border-t border-[var(--line)] pt-7">
        <table className="w-full min-w-[44rem] border-collapse text-sm">
          <caption
            className="pb-4 text-left"
            style={{ fontSize: "12px", lineHeight: 1.55, color: "var(--ink-2)", maxWidth: "88ch" }}
          >
            {s.caption}
          </caption>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              <th scope="col" className="label-mono py-2 pr-4 text-left">
                {s.formation}
              </th>
              <th scope="col" className="label-mono w-1/4 py-2 pr-4 text-left">
                {s.split}
              </th>
              <th scope="col" className="label-mono whitespace-nowrap py-2 pr-3 text-right">
                {s.advertising}
              </th>
              <th scope="col" className="label-mono whitespace-nowrap py-2 pr-3 text-right">
                {s.unexplained}
              </th>
              <th scope="col" className="label-mono whitespace-nowrap py-2 text-right">
                {s.declared}
              </th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((f) => {
              const ads = advertising(f);
              const fin = financial(f);
              const segments: Segment[] = [
                { value: ads, color: SPEND_COLORS.advertising, label: s.advertising },
                { value: fin, color: SPEND_COLORS.financial, label: s.lineFinancial },
                {
                  value: f.ordinary.otherOrdinary,
                  color: SPEND_COLORS.residual,
                  label: s.unexplained,
                },
              ];
              return (
                <tr key={f.name} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                  <th scope="row" className="py-3 pr-4 text-left font-normal">
                    {f.name}
                  </th>
                  <td className="py-3 pr-4">
                    <Bar
                      segments={segments}
                      total={ranked[0]?.ordinary.declared || 1}
                      scale="compare"
                      size="md"
                    />
                  </td>
                  <td
                    className="mono whitespace-nowrap py-3 pr-3 text-right"
                    style={{ color: "var(--gold-deep)" }}
                  >
                    {ads > 0 ? euroExact(ads, bcp47) : "—"}
                  </td>
                  <td
                    className="mono whitespace-nowrap py-3 pr-3 text-right"
                    style={{ color: "var(--red)" }}
                  >
                    {f.ordinary.otherOrdinary > 0 ? euroExact(f.ordinary.otherOrdinary, bcp47) : "—"}
                  </td>
                  <td className="mono whitespace-nowrap py-3 text-right">
                    {euroExact(f.ordinary.declared, bcp47)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollBox>

      <BarLegend
        className="mt-4"
        segments={[
          { value: 1, color: SPEND_COLORS.advertising, label: s.advertising },
          { value: 1, color: SPEND_COLORS.financial, label: s.lineFinancial },
          { value: 1, color: SPEND_COLORS.residual, label: s.unexplained },
        ]}
      />
      <Caveat label={t.common.caveat} className="mt-2">
        {s.barNote}
      </Caveat>

      <div className="panel mt-8 p-5">
        <p className="eyebrow mb-2.5">{s.gapTitle}</p>
        <p style={{ fontSize: "14px", lineHeight: 1.65, color: "var(--ink-2)" }}>{s.gapBody}</p>
      </div>

      <p className="label-mono mt-6">
        <a className="src" href={data.source.url} target="_blank" rel="noopener noreferrer">
          {data.source.body} · {data.source.report} ↗
        </a>
      </p>
    </section>
  );
}
