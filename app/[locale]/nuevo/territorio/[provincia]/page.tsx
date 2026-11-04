import type { ReactNode } from "react";
import { roleLabel } from "@/components/nuevo/roles";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getProvinces, provinceBySlug } from "@/lib/provinces";
import { getLocalView } from "@/lib/local";
import { absoluteMajority } from "@/lib/investitures";
import { getRegions } from "@/lib/regions";
import { getPeople, type Person } from "@/lib/people";
import { getDeclarations } from "@/lib/declarations";
import { getSalaries, SALARIES_SOURCE_URL } from "@/lib/salaries";
import { getAggregation } from "@/lib/data";
import {
  getFoundations,
  partyNifByFoundation,
  displayName,
  entitySlug,
} from "@/lib/foundations";
import { officeTies } from "@/lib/officeholder-ties";
import { ROLES } from "@/lib/foundation-people";
import { nameKey } from "@/lib/name-key.mjs";
import { formationOf } from "@/lib/deputy-join.mjs";
import {
  caName,
  deputiesByProvince,
  declarationState,
  type DeclarationState,
} from "@/lib/constituencies";
import type { Deputy } from "@/lib/deputies";
import {
  euroExact,
  euroM,
  formatDate,
  integer,
  percent,
  rate,
} from "@/lib/format";
import ShareBar from "@/components/nuevo/ShareBar";
import DotGrid from "@/components/nuevo/DotGrid";
import RegionMap from "@/components/nuevo/RegionMap";
import { COPY } from "./copy";

export const revalidate = 3600;

export async function generateStaticParams() {
  const { provinces } = await getProvinces();
  return provinces.map((p) => ({ provincia: p.slug }));
}

/**
 * The redesign prototype's place page: one province, as a hub.
 *
 * It answers, in order: who represents this province in the Congreso, what the
 * public register says they are paid, what they declare owning, what public
 * money their parties receive, and what is measured for the comunidad the
 * province sits in.
 *
 * Two boundaries hold throughout. The deputies are the province's own: Congreso
 * elects them by province. Everything else is measured for the comunidad
 * autónoma, or for a party across all of Spain, and each section says which; a
 * regional or national figure is never divided down to a province. And nothing
 * here joins one record to another: the deputies' pay, their declarations and
 * their parties' subsidies sit side by side, none offered as the reason for any
 * other. People are listed by surname, never ordered by what they earn or own.
 */

export default async function PrototypePlace({
  params,
}: {
  params: Promise<{ locale: string; provincia: string }>;
}) {
  const { locale: localeParam, provincia } = await params;
  const province = await provinceBySlug(provincia);
  if (!province) notFound();
  const view = await getLocalView(province.territoryId);
  if (!view) notFound();

  const { locale, bcp47 } = getDict(localeParam);
  const t = COPY[locale];
  const [join, decl, people, salaries, agg, foundations, regions] =
    await Promise.all([
      deputiesByProvince(),
      getDeclarations(),
      getPeople(),
      getSalaries(),
      getAggregation(),
      getFoundations(),
      getRegions(),
    ]);
  const ties = await officeTies(partyNifByFoundation(foundations));

  const L = (path: string) => `/${locale}${path}`;
  const n = (x: number) => integer(x, bcp47);
  const pct = (x: number) => percent(x, bcp47, 1);
  const listFmt = new Intl.ListFormat(bcp47, { type: "conjunction" });
  const plural = (x: number, forms: [string, string]) =>
    `${n(x)} ${x === 1 ? forms[0] : forms[1]}`;

  const {
    territory,
    government,
    investiture,
    officeholders,
    hate,
    poverty,
    wages,
  } = view;
  const ca = caName(territory.id, territory.mapName);
  const sameName =
    province.name === ca || province.name === territory.registerName;
  const name = province.name;

  // ---------- The deputies, by surname, with what each record holds ----------
  const personByCod = new Map<number, Person>();
  for (const p of people) if (p.deputy) personByCod.set(p.deputy.cod, p);
  const deputies = [...(join.byProvince.get(province.slug) ?? [])].sort(
    (a, b) => a.name.localeCompare(b.name, "es"),
  );
  const rows = deputies.map((d) => {
    const person = personByCod.get(d.cod) ?? null;
    const formation = formationOf(d.formation);
    return {
      deputy: d,
      slug: person?.slug ?? d.slug,
      // A deputy the register does not list has no figure, never a zero.
      gross:
        person && person.inRegister && person.gross > 0 ? person.gross : null,
      registerRole: person?.inRegister ? person.role : null,
      short: formation?.short ?? d.formation,
      nif: formation?.nif ?? null,
      state: declarationState(d, decl.declarations),
    };
  });
  const N = rows.length;
  const paid = rows.filter((r) => r.gross !== null).length;

  // Seats by list, largest first.
  const lists = [
    ...rows.reduce(
      (m, r) => m.set(r.short, [...(m.get(r.short) ?? []), r]),
      new Map<string, typeof rows>(),
    ),
  ]
    .map(([short, list]) => ({
      short,
      nif: list[0].nif,
      label: list[0].deputy.formation,
      seats: list.length,
    }))
    .sort((a, b) => b.seats - a.seats || a.short.localeCompare(b.short, "es"));

  const repFinding =
    N === 0
      ? t.repNone(name)
      : N === 1
        ? t.repOne(name, lists[0].short)
        : t.repMany(
            name,
            n(N),
            listFmt.format(lists.map((l) => t.seatsOf(n(l.seats), l.short))),
          );

  // Officeholders of this province on a party foundation's board, by both join conditions.
  const slugs = new Set(rows.map((r) => r.slug));
  const boards = [...ties.byPerson.entries()]
    .filter(([, list]) => list.some((t) => slugs.has(t.slug)))
    .flatMap(([key, list]) => {
      const row = rows.find((r) => list.some((t) => t.slug === r.slug))!;
      return ROLES.filter((r) => nameKey(r.person) === key).map((r) => ({
        row,
        role: r.role,
        foundation: r.foundation,
      }));
    });
  const boardPeople = new Set(boards.map((b) => b.row.slug)).size;

  // ---------- Pay ----------
  const payFinding =
    N === 0
      ? null
      : N === 1
        ? paid
          ? t.payOneYes
          : t.payOneNo
        : paid === N
          ? t.payAll(n(N), name)
          : paid === 0
            ? t.payNone(n(N), name)
            : t.paySome(n(paid), n(N), name, n(N - paid));

  // ---------- Declarations ----------
  const count = (k: DeclarationState) =>
    rows.filter((r) => r.state === k).length;
  const sec = count("securities");
  const read = sec + count("transcribed");
  const filed = N - count("none");
  const declFinding =
    filed === 0
      ? t.declNone(name)
      : read === 0
        ? filed === 1
          ? t.declUnreadOne
          : t.declUnreadMany(n(filed), name)
        : read === 1
          ? sec
            ? t.declReadOneSec(name)
            : t.declReadOneNoSec(name)
          : sec === 0
            ? t.declReadNoSec(n(read), name)
            : sec === read
              ? t.declReadAllSec(n(read), name)
              : t.declReadSome(sec, n(sec), n(read), name);
  const allDecl = decl.declarations;
  const allSec = allDecl.filter((d) =>
    d.otherAssets.some((a) => a.kind === "securities"),
  ).length;

  // ---------- Party subsidies: the latest year, for all of Spain ----------
  const year = Math.max(...agg.years);
  const money = lists.map((l) => {
    const party = l.nif
      ? (agg.parties.find((p) => p.nif === l.nif) ?? null)
      : null;
    return { ...l, party, amount: party ? (party.byYear[year] ?? 0) : null };
  });
  const funded = money
    .filter((m) => (m.amount ?? 0) > 0)
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
  const unfunded = money.filter((m) => !((m.amount ?? 0) > 0));
  const maxAmount = Math.max(1, ...funded.map((m) => m.amount ?? 0));
  const moneyFinding =
    lists.length === 0
      ? null
      : funded.length === 0
        ? t.moneyNone(name, year)
        : lists.length === 1
          ? t.moneyOne(year, euroM(funded[0].amount!, bcp47, 1), funded[0].short, name)
          : t.moneyMany(
              n(lists.length),
              name,
              funded.length === lists.length,
              n(funded.length),
              year,
              euroM(funded[0].amount!, bcp47, 1),
              funded[0].short,
            );

  // ---------- The comunidad ----------
  const registerFinding =
    officeholders.count === 0
      ? t.registerNone(ca)
      : officeholders.withSalary === 0 || officeholders.medianGross === null
        ? t.registerNoSalary(n(officeholders.count), ca)
        : t.registerSome(
            n(officeholders.count),
            ca,
            n(officeholders.withSalary),
            euroExact(officeholders.medianGross, bcp47),
          );

  return (
    <main>
      {/* ---------- The place, and what is on record ---------- */}
      <div className="n-shell grid gap-x-12 gap-y-8 pb-10 pt-6 lg:grid-cols-[1fr_16rem]">
        <div>
          <p className="n-meta">
            <Link href={L("/nuevo/territorios")}>{t.breadcrumb}</Link>
          </p>
          <h1 className="n-display mt-3">{name}</h1>
          <p className="mt-4 max-w-[42em] text-[1.1rem] text-[var(--n-ink-2)]">
            {sameName ? t.heroSame(name) : t.heroOther(name, ca)}
          </p>
        </div>
        <figure className="m-0 self-end">
          <RegionMap
            locale={locale}
            regions={regions}
            highlight={territory.id}
            title={t.mapTitle(ca)}
            desc={t.mapDesc(ca)}
            className="max-w-[16rem]"
          />
          <figcaption className="n-meta mt-1">
            {t.mapCaption(ca)}
          </figcaption>
        </figure>

        <dl className="grid gap-px overflow-hidden rounded-[6px] border border-[var(--n-rule)] bg-[var(--n-rule)] sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4">
          {[
            {
              label: t.statDeputies,
              value: n(N),
              note: t.statDeputiesNote,
            },
            {
              label: t.statPaid,
              value: N ? t.xOfY(n(paid), n(N)) : "—",
              note: t.statPaidNote,
            },
            {
              label: t.statDecl,
              value: filed ? t.xOfY(n(read), n(filed)) : "—",
              note: t.statDeclNote,
            },
            {
              label: t.statPresides(ca),
              value: government ? government.president : t.statNoRecord,
              note: government
                ? t.statPresidesNote(
                    government.partyLabel,
                    formatDate(government.since, bcp47),
                  )
                : t.statNoPresidency,
              small: true,
            },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--n-card)] p-5">
              <dt className="n-label">{s.label}</dt>
              <dd
                className="n-figure mt-3"
                style={{
                  fontSize: s.small ? "1.35rem" : "1.9rem",
                  lineHeight: 1.15,
                }}
              >
                {s.value}
              </dd>
              <dd className="n-meta mt-2">{s.note}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ---------- Who represents it ---------- */}
      <Section id="representan" title={t.repTitle}>
        <p className="n-finding">{repFinding}</p>
        {N > 0 && (
          <>
            <div className="n-neutral mt-6 max-w-[48rem]">
              <ShareBar
                locale={locale}
                parts={lists.map((l) => ({ label: l.short, value: l.seats }))}
                format={(v) => plural(v, t.seat)}
              />
            </div>
            <ul className="mt-8 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((r) => (
                <li
                  key={r.deputy.cod}
                  className="border-t border-[var(--n-rule)] py-3"
                >
                  <Link
                    href={L(`/nuevo/politico/${r.slug}`)}
                    className="font-bold"
                  >
                    {r.deputy.fullName}
                  </Link>
                  <p className="n-meta mt-0.5">
                    {r.nif ? (
                      <Link href={L(`/nuevo/partido/${r.nif}`)}>{r.short}</Link>
                    ) : (
                      r.short
                    )}
                    {`, ${r.deputy.group}`}
                  </p>
                </li>
              ))}
            </ul>

            {/* Who of them also sits on a party foundation's board. */}
            <div className="mt-8 max-w-[46rem]">
              <p className="text-[var(--n-ink-2)]">
                {boardPeople === 0
                  ? N === 1
                    ? t.boardNoneOne
                    : t.boardNoneMany
                  : t.boardSome(N, boardPeople, n(boardPeople))}
              </p>
              {boards.length > 0 && (
                <ol className="mt-5">
                  {boards.map((b) => (
                    <li
                      key={b.row.slug + b.foundation + b.role}
                      className="n-foundations relative pb-5 pl-9 last:pb-0"
                    >
                      <span
                        aria-hidden
                        className="absolute bottom-0 left-[9px] top-0 w-[4px]"
                        style={{ background: "var(--route)" }}
                      />
                      <span
                        aria-hidden
                        className="absolute left-0 top-[3px] h-[22px] w-[22px] rounded-full border-[3px] bg-[var(--n-card)]"
                        style={{ borderColor: "var(--route)" }}
                      />
                      <p className="n-label">
                        <Link href={L(`/nuevo/politico/${b.row.slug}`)}>
                          {b.row.deputy.fullName}
                        </Link>
                        {t.roleAt(roleLabel(b.role.toLowerCase(), locale))}
                      </p>
                      <Link href={L(`/nuevo/fundacion/${entitySlug(b.foundation)}`)}>
                        {displayName(b.foundation)}
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </>
        )}
        <p className="n-source">
          {t.repSource}
        </p>
      </Section>

      {/* ---------- What they are paid ---------- */}
      {N > 0 && (
        <Section id="sueldos" title={t.payTitle}>
          {payFinding && <p className="n-finding">{payFinding}</p>}
          <div className="mt-6 max-w-[48rem]">
            <div
              aria-hidden
              className="flex h-7 w-full gap-[2px] overflow-hidden rounded-[3px]"
            >
              {paid > 0 && (
                <span
                  style={{
                    flexGrow: paid,
                    flexBasis: 0,
                    background: "var(--n-ink-2)",
                  }}
                />
              )}
              {N - paid > 0 && (
                <span
                  style={{
                    flexGrow: N - paid,
                    flexBasis: 0,
                    outline: "1px solid var(--n-ink-3)",
                    outlineOffset: -1,
                  }}
                />
              )}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[0.95rem]">
              {paid > 0 && (
                <li className="inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3 rounded-[2px]"
                    style={{ background: "var(--n-ink-2)" }}
                  />
                  {t.legendPublished}{" "}
                  <span className="n-num font-bold">{n(paid)}</span>
                </li>
              )}
              {N - paid > 0 && (
                <li className="inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3 rounded-[2px]"
                    style={{
                      outline: "1px solid var(--n-ink-3)",
                      outlineOffset: -1,
                    }}
                  />
                  {t.legendNotInRegister}{" "}
                  <span className="n-num font-bold">{n(N - paid)}</span>
                </li>
              )}
            </ul>
          </div>
          {/* A long table starts folded, so the sections after it stay within reach. */}
          <details className="mt-8" open={rows.length <= 16}>
            <summary className="cursor-pointer font-bold">
              {t.seeEach}
            </summary>
            <div className="relative mt-4 overflow-x-auto">
              <table className="n-table min-w-[30rem] max-w-[52rem]">
                <caption className="sr-only">
                  {t.payCaption(name)}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">{t.colDeputy}</th>
                    <th scope="col">{t.colRole}</th>
                    <th scope="col" className="n-r">
                      {t.colGross}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.deputy.cod}>
                      <th scope="row" className="font-normal">
                        <Link href={L(`/nuevo/politico/${r.slug}`)}>
                          {r.deputy.fullName}
                        </Link>
                      </th>
                      <td className="text-[var(--n-ink-2)]">
                        {r.registerRole ?? t.notInRegister}
                      </td>
                      <td className="n-r">
                        {r.gross !== null ? (
                          euroExact(r.gross, bcp47)
                        ) : (
                          <span className="text-[var(--n-ink-3)]">
                            <span aria-hidden>—</span>
                            <span className="sr-only">{t.srNoRecord}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <p className="n-source">
            {t.sourceLabel} <a href={SALARIES_SOURCE_URL}>{salaries.source.name}</a>
            {salaries.source.updated
              ? t.updated(formatDate(salaries.source.updated, bcp47))
              : ""}
            {t.paySourceTail}
          </p>
        </Section>
      )}

      {/* ---------- What they declare ---------- */}
      {N > 0 && (
        <Section id="declaran" title={t.declTitle}>
          <div className="grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,24rem)_1fr]">
            <div>
              <p className="n-finding">{declFinding}</p>
              <p className="n-meta mt-3">
                {t.declCongress(n(allSec), n(allDecl.length))}
              </p>
            </div>
            <div>
              <DotGrid
                locale={locale}
                groups={
                  [
                    {
                      key: "valores",
                      count: sec,
                      label: t.dotSecurities(sec),
                      look: "filled",
                      cls: "n-companies",
                    },
                    {
                      key: "otros",
                      count: count("transcribed"),
                      label: t.dotTranscribed,
                      look: "ink",
                    },
                    {
                      key: "pendientes",
                      count: count("pending"),
                      label: t.dotPending,
                      look: "hollow",
                    },
                  ].filter((g) => g.count > 0) as Parameters<
                    typeof DotGrid
                  >[0]["groups"]
                }
              />
              {count("none") > 0 && (
                <p className="n-meta mt-3">
                  {t.declNoLink(count("none"), n(count("none")))}
                </p>
              )}
            </div>
          </div>
          <div className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                "securities",
                "transcribed",
                "pending",
                "none",
              ] as DeclarationState[]
            )
              .map((k) => ({ k, list: rows.filter((r) => r.state === k) }))
              .filter((g) => g.list.length > 0)
              .map((g) => (
                <div
                  key={g.k}
                  className={g.k === "securities" ? "n-companies" : undefined}
                >
                  <h3 className="n-label">
                    {t.stateLabel[g.k][g.list.length === 1 ? 0 : 1]}
                  </h3>
                  <ul className="mt-2">
                    {g.list.map((r) => (
                      <li
                        key={r.deputy.cod}
                        className="border-t border-[var(--n-rule)] py-2"
                      >
                        <Link href={L(`/nuevo/politico/${r.slug}`)}>
                          {r.deputy.fullName}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
          <p className="n-source">
            {t.declSource}{" "}
            <Link href={L("/nuevo/personas?kind=declarations")}>
              {t.allDeclarations}
            </Link>
          </p>
        </Section>
      )}

      {/* ---------- Public money to their parties ---------- */}
      {lists.length > 0 && (
        <Section id="partidos" title={t.moneyTitle}>
          {moneyFinding && <p className="n-finding">{moneyFinding}</p>}
          <p className="n-body mt-3">
            {t.moneyBody(name)}
          </p>
          {funded.length > 0 && (
            <ul className="n-state mt-8 grid max-w-[52rem] gap-4">
              {funded.map((m) => (
                <li
                  key={m.short}
                  className="grid gap-x-4 gap-y-1 sm:grid-cols-[9rem_1fr_10rem] sm:items-center"
                >
                  <Link
                    href={L(`/nuevo/partido/${m.nif}`)}
                    className="font-bold"
                  >
                    {m.short}
                  </Link>
                  <span aria-hidden className="flex h-3">
                    <span
                      className="h-3 rounded-[2px]"
                      style={{
                        width: `${((m.amount ?? 0) / maxAmount) * 100}%`,
                        minWidth: 3,
                        background: "var(--route)",
                      }}
                    />
                  </span>
                  <span className="n-num whitespace-nowrap sm:text-right">
                    {euroExact(m.amount ?? 0, bcp47)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {unfunded.length > 0 && (
            <ul className="mt-6 grid max-w-[52rem] gap-2 text-[var(--n-ink-2)]">
              {unfunded.map((m) => (
                <li key={m.short}>
                  <span className="font-bold text-[var(--n-ink)]">
                    {m.short}
                  </span>
                  {": "}
                  {m.nif
                    ? t.unfundedNif(year)
                    : formationOf(m.label)?.family === "psoe"
                      ? t.unfundedPsoe
                      : t.unfundedCoalition}
                </li>
              ))}
            </ul>
          )}
          <p className="n-source">
            {t.moneySource(year)}
          </p>
        </Section>
      )}

      {/* ---------- The comunidad ---------- */}
      <Section
        id="comunidad"
        title={
          sameName
            ? territory.id === "18" || territory.id === "19"
              ? t.communityCity
              : t.communitySame
            : t.communityOther(ca)
        }
      >
        <p className="n-body">
          {sameName ? t.communityBodySame(ca) : t.communityBodyOther(ca, name)}
        </p>

        <div className="mt-10 grid gap-x-14 gap-y-14 lg:grid-cols-2">
          {/* Who presides */}
          <article>
            <h3 className="n-h3">{t.whoPresides}</h3>
            {government ? (
              <>
                <p className="n-finding mt-3">
                  {t.presidentFinding(
                    government.president,
                    government.partyLabel,
                    ca,
                    formatDate(government.since, bcp47),
                  )}
                </p>
                {investiture.investiture &&
                  investiture.status !== "pp-majority" &&
                  (() => {
                    const inv = investiture.investiture;
                    const others =
                      inv.chamberSeats - inv.seatsPP - inv.seatsVox;
                    const majority = absoluteMajority(inv.chamberSeats);
                    return (
                      <>
                        <div aria-hidden className="relative mt-5">
                          <div className="flex h-5 w-full gap-[2px] overflow-hidden rounded-[3px]">
                            <span
                              style={{
                                flexGrow: inv.seatsPP,
                                flexBasis: 0,
                                background: "var(--n-ink-2)",
                              }}
                            />
                            <span
                              className="n-hatch"
                              style={{
                                flexGrow: inv.seatsVox,
                                flexBasis: 0,
                                outline: "1px solid var(--n-ink-3)",
                                outlineOffset: -1,
                              }}
                            />
                            <span
                              style={{
                                flexGrow: others,
                                flexBasis: 0,
                                background: "var(--n-rule)",
                              }}
                            />
                          </div>
                          <span
                            className="absolute -bottom-1 -top-1 w-[2px]"
                            style={{
                              left: `${(majority / inv.chamberSeats) * 100}%`,
                              background: "var(--n-ink)",
                            }}
                          />
                        </div>
                        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem]">
                          <li className="inline-flex items-center gap-2">
                            <span
                              aria-hidden
                              className="inline-block h-3 w-3 rounded-[2px]"
                              style={{ background: "var(--n-ink-2)" }}
                            />
                            PP{" "}
                            <span className="n-num font-bold">
                              {plural(inv.seatsPP, t.seat)}
                            </span>
                          </li>
                          <li className="inline-flex items-center gap-2">
                            <span
                              aria-hidden
                              className="n-hatch inline-block h-3 w-3 rounded-[2px]"
                              style={{
                                outline: "1px solid var(--n-ink-3)",
                                outlineOffset: -1,
                              }}
                            />
                            Vox{" "}
                            <span className="n-num font-bold">
                              {plural(inv.seatsVox, t.seat)}
                            </span>
                          </li>
                          <li className="inline-flex items-center gap-2">
                            <span
                              aria-hidden
                              className="inline-block h-3 w-3 rounded-[2px]"
                              style={{ background: "var(--n-rule)" }}
                            />
                            {t.rest}{" "}
                            <span className="n-num font-bold">
                              {plural(others, t.seat)}
                            </span>
                          </li>
                          <li className="inline-flex items-center gap-2">
                            <span
                              aria-hidden
                              className="inline-block h-3 w-[2px]"
                              style={{ background: "var(--n-ink)" }}
                            />
                            {t.absMajority(n(majority))}
                          </li>
                        </ul>
                        <p className="n-body mt-3 text-[0.95rem]">
                          {investiture.status === "vox-decisive"
                            ? t.investVox(n(inv.seatsPP), n(inv.chamberSeats))
                            : t.investShort(n(inv.seatsPP), n(inv.chamberSeats))}
                        </p>
                      </>
                    );
                  })()}
                <p className="n-source">
                  {t.sourceLabel}{" "}
                  <a href={view.governmentSource.url}>
                    {t.wikiPrefix}
                    {view.governmentSource.body}
                  </a>
                  {t.checkedTail(
                    formatDate(view.governmentSource.checked, bcp47),
                  )}
                </p>
              </>
            ) : (
              <p className="mt-3 text-[var(--n-ink-2)]">
                {t.noPresidency}
              </p>
            )}
          </article>

          {/* Officeholders in the register */}
          <article>
            <h3 className="n-h3">{t.registerTitle}</h3>
            <p className="n-finding mt-3">{registerFinding}</p>
            {officeholders.count > 0 && (
              <>
                <div
                  aria-hidden
                  className="mt-5 flex h-5 w-full gap-[2px] overflow-hidden rounded-[3px]"
                >
                  {officeholders.withSalary > 0 && (
                    <span
                      style={{
                        flexGrow: officeholders.withSalary,
                        flexBasis: 0,
                        background: "var(--n-ink-2)",
                      }}
                    />
                  )}
                  {officeholders.count - officeholders.withSalary > 0 && (
                    <span
                      style={{
                        flexGrow:
                          officeholders.count - officeholders.withSalary,
                        flexBasis: 0,
                        outline: "1px solid var(--n-ink-3)",
                        outlineOffset: -1,
                      }}
                    />
                  )}
                </div>
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem]">
                  {officeholders.withSalary > 0 && (
                    <li className="inline-flex items-center gap-2">
                      <span
                        aria-hidden
                        className="inline-block h-3 w-3 rounded-[2px]"
                        style={{ background: "var(--n-ink-2)" }}
                      />
                      {t.withSalary}{" "}
                      <span className="n-num font-bold">
                        {n(officeholders.withSalary)}
                      </span>
                    </li>
                  )}
                  {officeholders.count - officeholders.withSalary > 0 && (
                    <li className="inline-flex items-center gap-2">
                      <span
                        aria-hidden
                        className="inline-block h-3 w-3 rounded-[2px]"
                        style={{
                          outline: "1px solid var(--n-ink-3)",
                          outlineOffset: -1,
                        }}
                      />
                      {t.withoutSalary}{" "}
                      <span className="n-num font-bold">
                        {n(officeholders.count - officeholders.withSalary)}
                      </span>
                    </li>
                  )}
                </ul>
              </>
            )}
            <p className="n-meta mt-3">
              {t.registerGap(n(view.registerWithoutTerritory), n(view.registerTotal))}
              <Link
                href={L(
                  `/nuevo/personas?q=${encodeURIComponent(territory.registerName)}`,
                )}
              >
                {t.seePosts}
              </Link>
              {t.orCompare}
              <Link href={L("/nuevo/territorios#registro")}>
                {t.compareOthers}
              </Link>
              .
            </p>
            <p className="n-source">
              {t.sourceLabel} <a href={SALARIES_SOURCE_URL}>{salaries.source.name}</a>
              {t.registerSourceTail}
            </p>
          </article>

          {/* Wages */}
          <article>
            <h3 className="n-h3">{t.wagesTitle(ca)}</h3>
            {wages ? (
              <>
                <p className="n-finding mt-3">
                  {t.wagesFinding(
                    ca,
                    euroExact(wages.median, bcp47),
                    euroExact(wages.nationalMedian, bcp47),
                  )}
                </p>
                <WageScale
                  wages={wages}
                  fmt={(v) => euroExact(v, bcp47)}
                  labels={{
                    p10: t.wageP10,
                    median: t.wageMedian,
                    p90: t.wageP90,
                    national: t.wageNational,
                  }}
                />
                <p className="n-source">
                  {t.sourceLabel}{" "}
                  <a href={wages.sourceUrl}>{t.wagesSource}</a>
                  {t.wagesSourceTail(wages.period)}
                </p>
              </>
            ) : (
              <p className="mt-3 text-[var(--n-ink-2)]">
                {t.noWages(ca)}
              </p>
            )}
          </article>

          {/* Poverty */}
          <article>
            <h3 className="n-h3">{t.povertyTitle}</h3>
            {poverty ? (
              <>
                <p className="n-finding mt-3">
                  {t.povertyFinding(
                    ca,
                    pct(poverty.percent / 100),
                    pct(poverty.nationalPercent / 100),
                  )}
                </p>
                <Compare
                  rows={[
                    {
                      label: ca,
                      value: poverty.percent,
                      text: pct(poverty.percent / 100),
                      strong: true,
                    },
                    {
                      label: t.spain,
                      value: poverty.nationalPercent,
                      text: pct(poverty.nationalPercent / 100),
                    },
                  ]}
                  max={100}
                />
                <p className="n-source">
                  {t.sourceLabel}{" "}
                  <a href={poverty.sourceUrl}>{t.povertySource}</a>
                  {t.povertySourceTail(poverty.period, poverty.base)}
                </p>
              </>
            ) : (
              <p className="mt-3 text-[var(--n-ink-2)]">
                {t.noPoverty}
              </p>
            )}
          </article>

          {/* Hate crime */}
          <article className="lg:col-span-2">
            <h3 className="n-h3">{t.hateTitle}</h3>
            {hate ? (
              <div className="grid gap-x-14 lg:grid-cols-2">
                <div>
                  <p className="n-finding mt-3">
                    {t.hateFinding(
                      ca,
                      n(hate.total),
                      hate.year,
                      rate(hate.ratePer100k, bcp47),
                      rate(hate.nationalRatePer100k, bcp47),
                    )}
                  </p>
                  <p className="n-body mt-3 text-[0.95rem]">
                    {t.hateBody(n(hate.sexualOrientationGenderIdentity))}
                  </p>
                </div>
                <div className="lg:pt-4">
                  <Compare
                    rows={[
                      {
                        label: ca,
                        value: hate.ratePer100k,
                        text: t.per100k(rate(hate.ratePer100k, bcp47)),
                        strong: true,
                      },
                      {
                        label: t.spain,
                        value: hate.nationalRatePer100k,
                        text: t.per100k(rate(hate.nationalRatePer100k, bcp47)),
                      },
                    ]}
                    max={Math.max(hate.ratePer100k, hate.nationalRatePer100k)}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-3 text-[var(--n-ink-2)]">
                {t.noHate}
              </p>
            )}
            {hate && (
              <p className="n-source">
                {t.sourceLabel}{" "}
                <a href={hate.source.url}>
                  {hate.source.body.replace(/\s*·\s*/g, ", ")},{" "}
                  {hate.source.report}
                </a>
                .
              </p>
            )}
          </article>
        </div>

        <p className="n-body mt-14 text-[0.95rem]">
          {t.closing(ca)}
        </p>
      </Section>
    </main>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="n-shell n-section" aria-labelledby={`${id}-t`}>
      <h2 id={`${id}-t`} className="n-h2 mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Two figures on one scale: the place in ink, the national reference lighter. */
function Compare({
  rows,
  max,
}: {
  rows: { label: string; value: number; text: string; strong?: boolean }[];
  max: number;
}) {
  return (
    <ul className="mt-5 grid gap-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 text-[0.95rem]">
            <span className={r.strong ? "font-bold" : "text-[var(--n-ink-2)]"}>
              {r.label}
            </span>
            <span className="n-num">{r.text}</span>
          </div>
          <div
            aria-hidden
            className="mt-1 h-3 w-full rounded-[2px] bg-[var(--n-rule)]/40"
          >
            <span
              className="block h-3 rounded-[2px]"
              style={{
                width: `${Math.min(100, (r.value / max) * 100)}%`,
                background: r.strong
                  ? "var(--n-ink-2)"
                  : "var(--n-rule-strong)",
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * The comunidad's wages as a line with three stations: the 10th percentile,
 * the median and the 90th, placed on one euro scale, with the national median
 * marked above it as a hollow station so the local one is never read alone.
 */
function WageScale({
  wages,
  fmt,
  labels,
}: {
  wages: { median: number; p10: number; p90: number; nationalMedian: number };
  fmt: (v: number) => string;
  labels: {
    p10: string;
    median: string;
    p90: string;
    national: (value: string) => string;
  };
}) {
  const top = Math.max(wages.p90, wages.nationalMedian) * 1.08;
  const x = (v: number) => `${(v / top) * 100}%`;
  const stations = [
    {
      v: wages.p10,
      label: labels.p10,
      align: "start",
    },
    { v: wages.median, label: labels.median, align: "middle" },
    {
      v: wages.p90,
      label: labels.p90,
      align: "end",
    },
  ] as const;
  return (
    <div className="mt-6">
      <div className="relative h-[4.5rem]">
        {/* National median, above the line. */}
        <div
          className="absolute top-0 -translate-x-1/2 text-center"
          style={{ left: x(wages.nationalMedian) }}
        >
          <p className="n-meta whitespace-nowrap">
            {labels.national(fmt(wages.nationalMedian))}
          </p>
          <span
            aria-hidden
            className="mx-auto mt-1 block h-[15px] w-[15px] rounded-full border-[3px] bg-[var(--n-bg)]"
            style={{ borderColor: "var(--n-ink-3)" }}
          />
        </div>
        {/* The line from p10 to p90, on record. */}
        <span
          aria-hidden
          className="absolute top-[3.15rem] h-[5px] rounded-full"
          style={{
            left: x(wages.p10),
            width: `calc(${x(wages.p90)} - ${x(wages.p10)})`,
            background: "var(--n-ink-2)",
          }}
        />
        {stations.map((s) => (
          <span
            key={s.label}
            aria-hidden
            className="absolute top-[2.65rem] h-[23px] w-[23px] -translate-x-1/2 rounded-full border-[3px]"
            style={{
              left: x(s.v),
              borderColor: "var(--n-ink-2)",
              background:
                s.align === "middle" ? "var(--n-ink-2)" : "var(--n-card)",
            }}
          />
        ))}
      </div>
      <ul className="mt-3 grid gap-x-4 gap-y-2 text-[0.95rem] sm:grid-cols-3">
        {stations.map((s) => (
          <li
            key={s.label}
            className={
              s.align === "middle"
                ? "sm:text-center"
                : s.align === "end"
                  ? "sm:text-right"
                  : undefined
            }
          >
            <span className="n-meta block">{s.label}</span>
            <span className="n-num font-bold">{fmt(s.v)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
