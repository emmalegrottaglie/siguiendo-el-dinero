import { getDict } from "@/lib/i18n";
import { getHateTerritory, getRegions } from "@/lib/regions";
import RightsMap from "@/components/RightsMap";

export const revalidate = 3600;

/**
 * Where each party governs, and what the hate-crime record says there.
 *
 * The two facts sit on the same map and are never joined. A reader can switch
 * between them; nothing on the page correlates them, ranks anyone by them, or
 * suggests one explains the other — the same rule the money and the votes are
 * published under everywhere else on this site.
 */
export default async function MapaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const { bcp47, t } = getDict(localeParam);
  const [regions, hate] = await Promise.all([getRegions(), getHateTerritory()]);
  const M = t.map;

  return (
    <main>
      {/* Two-up, so the map gets the height rather than the heading. */}
      <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3 pb-6 pt-8">
        <div>
          <p className="eyebrow" style={{ color: "var(--verd-text)" }}>
            {M.eyebrow}
          </p>
          <h1
            className="display mt-3 font-normal"
            style={{ fontSize: "clamp(28px,3.4vw,40px)", maxWidth: "24ch" }}
          >
            {M.title}
          </h1>
        </div>
        <p
          className="max-w-[34ch]"
          style={{ fontSize: "13px", lineHeight: 1.55, color: "var(--ink-3)" }}
        >
          {M.standfirst}
        </p>
      </header>

      <RightsMap regions={regions} hate={hate} M={M} C={t.charts} bcp47={bcp47} />
    </main>
  );
}
