import type { CSSProperties, ReactNode } from "react";
import type { Locale } from "@/lib/locales";
import {
  INVESTITURES,
  investitureFor,
  type Investiture,
  type InvestitureFinding,
  type InvestitureStatus,
} from "@/lib/investitures";
import { formatDate, integer } from "@/lib/format";
import { INVESTITURE_COPY } from "./investiture-copy";

/**
 * One community's investiture record, as lib/investitures.ts holds it: the
 * seat arithmetic, the finding the old map computed from it, every recorded
 * round and the source.
 *
 * Two claims of different strength are kept apart, as on the old map. A
 * community whose recorded tally shows Vox supplying votes the winning total
 * needed (`vox-decisive`) is drawn as a filled station, because the vote is on
 * record; one where only the seat arithmetic is verified (`pp-short-alone`) is
 * drawn hollow and dashed, because the vote is not. Both also say so in words.
 * Nothing here says who sits in a government today: an investiture is a dated
 * vote, and that is all it is presented as.
 *
 * `highlight` names a party (as the record spells it, e.g. "PP") whose votes
 * in favour are set in bold in each round, for the party hub.
 */
export default function InvestitureRecord({
  finding,
  name,
  href,
  id,
  locale,
  bcp47,
  highlight,
  headingLevel = 3,
}: {
  finding: InvestitureFinding & { investiture: Investiture };
  /** The community's display name. */
  name: string;
  /** Where the name links, if anywhere. */
  href?: string;
  id?: string;
  locale: Locale;
  bcp47: string;
  highlight?: string;
  headingLevel?: 3 | 4;
}) {
  const t = INVESTITURE_COPY[locale];
  const inv = finding.investiture;
  const n = (x: number) => integer(x, bcp47);
  const plural = (x: number) => `${n(x)} ${x === 1 ? t.seat[0] : t.seat[1]}`;
  const others = inv.chamberSeats - inv.seatsPP - inv.seatsVox;
  const decisive = finding.status === "vox-decisive";
  const won = finding.decidingRound;
  const H = headingLevel === 3 ? "h3" : "h4";

  const sentence = decisive
    ? t.decisive({
        pp: n(inv.seatsPP),
        seats: n(inv.chamberSeats),
        majority: n(finding.majority),
        date: won ? formatDate(won.date, bcp47) : "",
        for: won ? n(won.votesFor) : "",
        against: won ? n(won.votesAgainst) : "",
        voxVotes: n(finding.voxVotesFor),
      })
    : t.short({
        pp: n(inv.seatsPP),
        seats: n(inv.chamberSeats),
        majority: n(finding.majority),
        vox: n(inv.seatsVox),
      });

  return (
    <article id={id} className="scroll-mt-6 border-t-[3px] border-[var(--n-ink)] pt-3">
      <H className="n-h3">{href ? <a href={href}>{name}</a> : name}</H>
      <p className="mt-1 inline-flex items-center gap-2 text-[0.95rem]">
        <StatusMark status={finding.status} />
        <span className="font-bold">{decisive ? t.hatchDecisive : t.hatchShort}</span>
      </p>

      {/* The chamber, PP then Vox then everyone else, with the majority line. */}
      <div aria-hidden className="relative mt-4">
        <div className="flex h-5 w-full gap-[2px] overflow-hidden rounded-[3px]">
          <span style={{ flexGrow: inv.seatsPP, flexBasis: 0, background: "var(--n-ink-2)" }} />
          <span style={{ flexGrow: inv.seatsVox, flexBasis: 0, background: "var(--n-ink-3)" }} />
          <span style={{ flexGrow: others, flexBasis: 0, background: "var(--n-rule)" }} />
        </div>
        <span
          className="absolute -bottom-1 -top-1 w-[2px]"
          style={{ left: `${(finding.majority / inv.chamberSeats) * 100}%`, background: "var(--n-ink)" }}
        />
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem]">
        <Key swatch={{ background: "var(--n-ink-2)" }}>
          PP <span className="n-num font-bold">{plural(inv.seatsPP)}</span>
        </Key>
        <Key swatch={{ background: "var(--n-ink-3)" }}>
          Vox <span className="n-num font-bold">{plural(inv.seatsVox)}</span>
        </Key>
        <Key swatch={{ background: "var(--n-rule)" }}>
          {t.rest} <span className="n-num font-bold">{plural(others)}</span>
        </Key>
        <li className="inline-flex items-center gap-2">
          <span aria-hidden className="inline-block h-3 w-[2px]" style={{ background: "var(--n-ink)" }} />
          {t.absMajority(n(finding.majority))}
        </li>
      </ul>
      <p className="n-meta mt-1">{t.seatsFrom(formatDate(inv.electionDate, bcp47))}</p>

      <p className="n-body mt-3 text-[0.95rem]">{sentence}</p>

      {inv.rounds.length > 0 ? (
        <>
          <p className="n-label mt-4">{t.roundsTitle}</p>
          <ul className="mt-1">
            {inv.rounds.map((r) => (
              <li key={r.date} className="border-t border-[var(--n-rule)] py-2 text-[0.95rem]">
                <span className="n-num">{formatDate(r.date, bcp47)}</span>
                {" · "}
                {t.round(r.round, r.majorityRequired)}
                {" · "}
                <span className="n-num">{t.tally(n(r.votesFor), n(r.votesAgainst))}</span>
                {r.abstentions > 0 && (
                  <>
                    {", "}
                    <span className="n-num">{t.abstentions(n(r.abstentions), r.abstentions)}</span>
                  </>
                )}
                {" · "}
                <span className="font-bold">{r.succeeded ? t.carried : t.failed}</span>
                <span className="n-meta block">
                  {t.forLabel}{" "}
                  {Object.entries(r.forBreakdown).map(([party, votes], i) => (
                    <span key={party}>
                      {i > 0 && ", "}
                      {party === highlight ? (
                        <b className="text-[var(--n-ink)]">
                          {party} <span className="n-num">{n(votes)}</span>
                        </b>
                      ) : (
                        <>
                          {party} <span className="n-num">{n(votes)}</span>
                        </>
                      )}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="n-meta mt-3">{t.noRounds}</p>
      )}

      <p className="n-source">
        {t.sourceLabel} <a href={inv.source.url}>{inv.source.publisher}, {inv.source.title}</a>.
      </p>
    </article>
  );
}

function Key({ swatch, children }: { swatch: CSSProperties; children: ReactNode }) {
  return (
    <li className="inline-flex items-center gap-2">
      <span aria-hidden className="inline-block h-3 w-3 rounded-[2px]" style={swatch} />
      {children}
    </li>
  );
}

/**
 * Filled for a finding that rests on a recorded vote, hollow and dashed for one
 * that rests on seat arithmetic alone. The words beside it always say which.
 */
export function StatusMark({ status }: { status: InvestitureStatus }) {
  const onRecord = status === "vox-decisive";
  return (
    <span
      aria-hidden
      className="inline-block h-[13px] w-[13px] shrink-0 rounded-full"
      style={
        onRecord
          ? { background: "var(--n-ink)", border: "2px solid var(--n-ink)" }
          : { background: "transparent", border: "2px dashed var(--n-ink-3)" }
      }
    />
  );
}

/** The findings the old map drew: every recorded community except an outright PP majority. */
export function shownInvestitures(): (InvestitureFinding & { investiture: Investiture })[] {
  return INVESTITURES.map((i) => investitureFor(i.id)).filter(
    (f): f is InvestitureFinding & { investiture: Investiture } =>
      f.investiture !== null && f.status !== "pp-majority",
  );
}

/**
 * The investitures a party appears in, as the record names it.
 *
 * `party` is the party's short name exactly as lib/parties.ts spells it, which
 * is also how lib/investitures.ts keys its votes in favour ("PP", "Vox"): an
 * exact match on a closed set, never a fuzzy one. `voted` holds communities
 * where a recorded round lists the party's votes in favour; `seatsOnly` those
 * where the record names the party only through its seats (the PP and Vox seat
 * counts) and holds no tally. The votes against are not broken down by party in
 * the record, so a party is never placed among them.
 */
export function investituresNaming(party: string) {
  const voted: (InvestitureFinding & { investiture: Investiture })[] = [];
  const seatsOnly: (InvestitureFinding & { investiture: Investiture })[] = [];
  for (const f of shownInvestitures()) {
    const inv = f.investiture;
    if (inv.rounds.some((r) => (r.forBreakdown[party] ?? 0) > 0)) voted.push(f);
    else if (inv.rounds.length === 0 && (party === "PP" || party === "Vox")) seatsOnly.push(f);
  }
  return { voted, seatsOnly };
}
