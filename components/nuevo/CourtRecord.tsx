import { formatDate } from "@/lib/format";
import type { Locale } from "@/lib/locales";
import { COURT_RECORDS, recordsForParty, type CourtRecord as Rec, type CourtStatus } from "@/lib/court-records";
import { COURT_COPY } from "./court-copy";

/**
 * How each status's tag is drawn. Keyed by the typed status, so a status added
 * to lib/court-records.ts must be given a look here before the code compiles.
 * Only "nothing on record" is dashed, as everywhere on the site a dashed mark
 * means "not on record". The weight says how far a case has gone, never
 * anything about the person: an open case reads strongest because it is the
 * only one still undecided.
 */
const LOOK: Record<CourtStatus, { dashed: boolean; strong: boolean }> = {
  archived: { dashed: false, strong: false },
  "awaiting-trial": { dashed: false, strong: true },
  "advertising-infringement": { dashed: false, strong: false },
  "complaint-archived": { dashed: false, strong: false },
  "none-on-record": { dashed: true, strong: false },
};

/**
 * The judicial and electoral-board record, with each record's procedural stage.
 *
 * The status tag is the component, not decoration on it. The record's text is
 * translated, but the tag's words come from the typed status in
 * lib/court-records.ts and nowhere else, so no translation can turn an
 * archiving into an acquittal or an opening order into a verdict. Under each
 * record the chain of bodies and dates is drawn as a short line of stations, so
 * the stage can be checked rather than only asserted by the tag.
 *
 * A party with nothing on file gets an explicit card saying so, and saying what
 * that does and does not mean. Rendering nothing would read as a clean record;
 * rendering "0" would invite a comparison the four hand-verified records here
 * cannot support. No count is printed in either case.
 */
export default function CourtRecord({
  locale,
  bcp47,
  partyNif,
}: {
  locale: Locale;
  bcp47: string;
  /** Restrict to one party's officeholders; omit for every record. */
  partyNif?: string;
}) {
  const t = COURT_COPY[locale];
  const records = partyNif ? recordsForParty(partyNif) : COURT_RECORDS;

  return (
    <div className="n-neutral">
      {records.length === 0 ? (
        <div
          className="max-w-[48rem] rounded-[6px] border border-dashed p-5"
          style={{ borderColor: "var(--n-ink-3)" }}
        >
          <Tag status="none-on-record" text={t.status["none-on-record"]} lead={t.statusLabel} />
          <p className="n-finding mt-3">{t.noneBody}</p>
          <p className="n-meta mt-3">{t.noneNote}</p>
        </div>
      ) : (
        <ul className="grid gap-x-14 gap-y-10 lg:grid-cols-2">
          {records.map((r) => (
            <li key={r.id} className="border-t border-[var(--n-rule)] pt-4">
              <Item record={r} t={t} bcp47={bcp47} />
            </li>
          ))}
        </ul>
      )}
      <p className="n-meta mt-8 max-w-[48em]">{t.policy}</p>
    </div>
  );
}

function Tag({ status, text, lead }: { status: CourtStatus; text: string; lead: string }) {
  const look = LOOK[status];
  return (
    <p
      className={`n-label inline-block rounded-[3px] border px-2 py-0.5 ${look.dashed ? "border-dashed" : ""} ${look.strong ? "font-bold" : ""}`}
      style={{
        borderColor: look.strong ? "var(--n-ink)" : "var(--n-ink-3)",
        color: look.strong ? "var(--n-ink)" : "var(--n-ink-2)",
        borderWidth: look.strong ? 2 : 1,
      }}
    >
      <span className="sr-only">{lead}: </span>
      {text}
    </p>
  );
}

function Item({
  record,
  t,
  bcp47,
}: {
  record: Rec;
  t: (typeof COURT_COPY)["es"];
  bcp47: string;
}) {
  const copy = t.records[record.id as keyof typeof t.records];
  return (
    <>
      <Tag status={record.status} text={t.status[record.status]} lead={t.statusLabel} />
      {copy && <p className="n-body mt-3">{copy.text}</p>}
      <ol aria-label={t.chainLabel} className="mt-4 grid">
        {record.chain.map((step, i) => (
          <li key={`${step.body}-${step.date}`} className="relative flex gap-3 pb-3 last:pb-0">
            {/* The line between stations: solid, because each step is on record. */}
            {i < record.chain.length - 1 && (
              <span
                aria-hidden
                className="absolute left-[5px] top-[14px] bottom-0 w-[3px]"
                style={{ background: "var(--route)" }}
              />
            )}
            <span
              aria-hidden
              className="relative mt-[3px] inline-block h-[13px] w-[13px] shrink-0 rounded-full"
              style={{ background: "var(--route)" }}
            />
            <span className="min-w-0">
              <span className="n-num text-[0.9rem] font-bold">{formatDate(step.date, bcp47)}</span>
              <span className="n-meta">
                {" · "}
                {step.body}
                {" · "}
                <em>{step.outcome}</em>
              </span>
            </span>
          </li>
        ))}
      </ol>
      <p className="n-meta mt-3">
        {copy?.note}{" "}
        <a href={record.url} target="_blank" rel="noopener noreferrer">
          {t.sourceLink}
        </a>
      </p>
    </>
  );
}
