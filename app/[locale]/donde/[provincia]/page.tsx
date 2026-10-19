import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getProvinces, provinceBySlug } from "@/lib/provinces";
import { getLocalView } from "@/lib/local";
import { shortName } from "@/lib/governments";
import { euro, fill, integer, percent, rate, formatDate } from "@/lib/format";
import Bar from "@/components/chart/Bar";
import ChartReader from "@/components/chart/ChartReader";
import { readerProps, say } from "@/lib/chart-reader";
import SourceLine from "@/components/chart/SourceLine";
import Caveat from "@/components/Caveat";

export const revalidate = 3600;

export async function generateStaticParams() {
  const { provinces } = await getProvinces();
  return provinces.map((p) => ({ provincia: p.slug }));
}

/**
 * What this site holds about where one reader lives.
 *
 * Nine national pages, assembled from the reader's end instead of the state's.
 * Nothing new is measured here and nothing is apportioned: every figure is one
 * that already exists at the comunidad autónoma level, shown beside its national
 * counterpart so a local number is never read without a reference.
 *
 * The distinction the page has to keep making, and does, in the first sentence:
 * **a province is not a comunidad autónoma.** The reader arrives by province
 * because that is what a postcode resolves to, and every figure below is
 * measured for the comunidad their province sits in. Dividing a regional figure
 * down to a province would be invention, so none of it is divided.
 */
export default async function DondePage({
  params,
}: {
  params: Promise<{ locale: string; provincia: string }>;
}) {
  const { locale: localeParam, provincia } = await params;
  const province = await provinceBySlug(provincia);
  if (!province) notFound();

  const view = await getLocalView(province.territoryId);
  if (!view) notFound();

  const { locale, bcp47, t } = getDict(localeParam);
  const W = t.where;
  const { territory, government, investiture, officeholders, hate, poverty, wages } = view;

  // The geometry carries the full legal names — "Comunidad Foral de Navarra" —
  // which belong in a dossier but read as officialese in a sentence about where
  // someone lives. `shortName` is the map's own display list.
  const territoryName = shortName(territory.id, territory.mapName);

  // The province and the comunidad share a name in seven cases (Madrid, Murcia,
  // Cantabria, Asturias, Navarra, La Rioja, and the two autonomous cities).
  // Repeating "Madrid, in Madrid" reads as a fault, so the line is only drawn
  // where the two names actually differ.
  const sameName = province.name === territoryName;

  return (
    <main className="mx-auto max-w-4xl pb-16">
      <Link
        href={`/${locale}`}
        className="label-mono inline-block py-4 hover:text-[var(--gold-deep)]"
      >
        {W.backHome}
      </Link>

      <p className="eyebrow">{W.eyebrow}</p>
      <h1 className="display mt-3 text-4xl sm:text-5xl">{province.name}</h1>

      <p className="mt-5 max-w-[68ch] text-lg leading-relaxed text-[var(--ink-2)]">
        {sameName
          ? fill(W.leadSame, { territory: territoryName })
          : fill(W.lead, { province: province.name, territory: territoryName })}
      </p>

      {/* Who governs it */}
      <section className="mt-12">
        <h2 className="display section-tick text-2xl">{W.governmentTitle}</h2>
        {government ? (
          <>
            <dl className="mt-6 flex flex-col">
              {[
                [W.president, government.president],
                [W.party, government.partyLabel],
                [W.since, formatDate(government.since, bcp47)],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 py-2.5"
                  style={{ borderBottom: "1px solid var(--line-soft)" }}
                >
                  <dt className="label-mono text-[var(--ink-3)]">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>

            {investiture.investiture && investiture.status !== "pp-majority" && (
              <p className="mt-5 max-w-[68ch] leading-relaxed text-[var(--ink-2)]">
                {fill(
                  investiture.status === "vox-decisive"
                    ? W.investitureDecisive
                    : W.investitureShort,
                  {
                    pp: integer(investiture.investiture.seatsPP, bcp47),
                    seats: integer(investiture.investiture.chamberSeats, bcp47),
                    vox: integer(investiture.investiture.seatsVox, bcp47),
                  },
                )}
              </p>
            )}

            <SourceLine
              sources={[
                {
                  publisher: "Wikipedia",
                  name: view.governmentSource.body,
                  period: formatDate(view.governmentSource.checked, bcp47),
                  url: view.governmentSource.url,
                },
              ]}
              note={W.governmentNote}
              caveatLabel={t.common.caveat}
            />
          </>
        ) : (
          <p className="mt-6 text-[var(--ink-2)]">{W.noGovernment}</p>
        )}
      </section>

      {/* Officeholders */}
      <section className="mt-16">
        <h2 className="display section-tick text-2xl">{W.officeholdersTitle}</h2>
        <p className="mt-6 max-w-[68ch] leading-relaxed text-[var(--ink-2)]">
          {fill(W.officeholders, {
            count: integer(officeholders.count, bcp47),
            territory: territoryName,
            withSalary: integer(officeholders.withSalary, bcp47),
            median:
              officeholders.medianGross === null
                ? W.noFigure
                : euro(officeholders.medianGross, bcp47),
          })}
        </p>
        <Caveat label={t.common.caveat} className="mt-3">
          {fill(W.officeholdersGap, {
            missing: integer(view.registerWithoutTerritory, bcp47),
            total: integer(view.registerTotal, bcp47),
          })}
        </Caveat>
        <Link
          href={`/${locale}/politicos?q=${encodeURIComponent(territory.registerName)}`}
          className="src mt-4 inline-block"
        >
          {W.seeOfficeholders}
        </Link>
      </section>

      {/* Wages */}
      <section className="mt-16">
        <h2 className="display section-tick text-2xl">{W.wagesTitle}</h2>
        {wages ? (
          <>
            <p className="mt-6 max-w-[68ch] leading-relaxed text-[var(--ink-2)]">
              {fill(W.wages, {
                territory: territoryName,
                median: euro(wages.median, bcp47),
                national: euro(wages.nationalMedian, bcp47),
                p10: euro(wages.p10, bcp47),
                p90: euro(wages.p90, bcp47),
              })}
            </p>
            <SourceLine
              sources={[
                {
                  publisher: "INE",
                  name: "Encuesta Anual de Estructura Salarial",
                  period: wages.period,
                  url: wages.sourceUrl,
                },
              ]}
            />
          </>
        ) : (
          // EAES publishes percentiles for the seventeen comunidades and not for
          // Ceuta or Melilla. Saying so beats an empty block, and beats quietly
          // showing the national figure under a local heading.
          <p className="mt-6 max-w-[68ch] leading-relaxed text-[var(--ink-2)]">
            {fill(W.noWages, { territory: territoryName })}
          </p>
        )}
        <Link href={`/${locale}/contexto`} className="src mt-4 inline-block">
          {W.seeContext}
        </Link>
      </section>

      {/* Poverty */}
      <section className="mt-16">
        <h2 className="display section-tick text-2xl">{W.povertyTitle}</h2>
        {poverty ? (
          <>
            <ChartReader
              className="mt-6"
              items={[
                say(territoryName, percent(poverty.percent / 100, bcp47)),
                say(W.national, percent(poverty.nationalPercent / 100, bcp47)),
              ]}
              {...readerProps(t.charts, bcp47, { title: W.povertyTitle, count: 2 })}
            >
              <div className="flex flex-col gap-5">
                {[
                  { id: "local", label: territoryName, value: poverty.percent, color: "var(--red)" },
                  { id: "national", label: W.national, value: poverty.nationalPercent, color: "var(--grey-500)" },
                ].map((row, i) => (
                  <div key={row.id} data-chart-item={i}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <span style={{ fontSize: "14px" }}>{row.label}</span>
                      <span className="mono whitespace-nowrap" style={{ fontSize: "13px" }}>
                        {percent(row.value / 100, bcp47)}
                      </span>
                    </div>
                    <Bar
                      className="mt-1.5"
                      segments={[{ value: row.value, color: row.color, label: row.label }]}
                      total={100}
                      scale="share"
                      size="md"
                    />
                  </div>
                ))}
              </div>
            </ChartReader>
            <SourceLine
              sources={[
                {
                  publisher: "INE",
                  name: "Encuesta de Condiciones de Vida",
                  period: poverty.period,
                  url: poverty.sourceUrl,
                },
              ]}
              note={fill(W.povertyNote, { base: poverty.base })}
              caveatLabel={t.common.caveat}
            />
          </>
        ) : (
          <p className="mt-6 text-[var(--ink-2)]">{W.noPoverty}</p>
        )}
      </section>

      {/* Recorded hate crime */}
      <section className="mt-16">
        <h2 className="display section-tick text-2xl">{W.hateTitle}</h2>
        {hate ? (
          <>
            <p className="mt-6 max-w-[68ch] leading-relaxed text-[var(--ink-2)]">
              {fill(W.hate, {
                total: integer(hate.total, bcp47),
                territory: territoryName,
                year: hate.year,
                rate: rate(hate.ratePer100k, bcp47),
                national: rate(hate.nationalRatePer100k, bcp47),
                sogi: integer(hate.sexualOrientationGenderIdentity, bcp47),
              })}
            </p>
            <SourceLine
              sources={[
                {
                  publisher: hate.source.body,
                  name: hate.source.report,
                  period: hate.year,
                  url: hate.source.url,
                },
              ]}
              note={W.hateNote}
              caveatLabel={t.common.caveat}
            />
          </>
        ) : (
          <p className="mt-6 text-[var(--ink-2)]">{W.noHate}</p>
        )}
        <Link href={`/${locale}/mapa`} className="src mt-4 inline-block">
          {W.seeMap}
        </Link>
      </section>

      <Caveat label={t.common.caveat} className="mt-16">
        {fill(W.closing, { territory: territoryName })}
      </Caveat>
    </main>
  );
}
