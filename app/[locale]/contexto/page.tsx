import { getDict } from "@/lib/i18n";
import { getIndicators } from "@/lib/indicators";
import WageLadder from "@/components/WageLadder";
import SmiLadder from "@/components/SmiLadder";
import PovertyPanel from "@/components/PovertyPanel";

export const revalidate = 3600;

/**
 * The country the money is being spent in.
 *
 * Every other page here is about parties, officeholders and what they are paid.
 * None of those figures means anything without a scale, and the scale is not
 * this project's to invent: it is INE's, ingested by `scripts/fetch-ine.mjs`.
 *
 * What this page deliberately does not do is join the two. There is no line
 * drawn from a poverty rate to a vote, no correlation, no ordering of parties by
 * anything computed from these numbers. The rule this layer was designed under
 * is factual juxtaposition: the figures sit near each other and the reader does
 * the joining, because a line drawn here would be an assertion the data cannot
 * carry.
 */
export default async function ContextoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const indicators = await getIndicators();
  const { bcp47, t } = getDict(localeParam);
  const c = t.contexto;

  return (
    <main className="mx-auto max-w-4xl pb-16">
      <p className="eyebrow pt-8">{c.eyebrow}</p>
      <h1 className="display mt-3 text-4xl sm:text-5xl">{c.title}</h1>
      <p className="mt-6 text-lg leading-relaxed text-[var(--ink-2)]">{c.lead}</p>
      <p className="mt-4 leading-relaxed text-[var(--ink-3)]">{c.framing}</p>

      <WageLadder
        indicators={indicators}
        t={c}
        bcp47={bcp47}
        caveatLabel={t.common.caveat}
        charts={t.charts}
      />
      <SmiLadder
        indicators={indicators}
        t={c}
        bcp47={bcp47}
        caveatLabel={t.common.caveat}
        charts={t.charts}
      />
      <PovertyPanel
        indicators={indicators}
        t={c}
        bcp47={bcp47}
        caveatLabel={t.common.caveat}
        charts={t.charts}
      />
    </main>
  );
}
