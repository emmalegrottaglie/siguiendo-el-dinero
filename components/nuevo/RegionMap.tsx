import type { RegionsFile } from "@/lib/regions";

/**
 * The comunidades autónomas, drawn plain: an outline per comunidad and nothing
 * encoded in its fill, so the map is a way to find a place, not a measurement.
 *
 * The geometry is the IGN's, projected at build time (lib/regions.ts). There is
 * no province geometry on this site, so a province is never drawn: a page about
 * one marks the comunidad it sits in, and says so in words beside the map.
 *
 * `hrefFor` makes each comunidad a link; `highlight` fills one in ink, for a
 * locator. Ceuta and Melilla are too small to see at this scale and are drawn
 * as a dot at their centre. The Canaries sit in an inset box, as on every map
 * of Spain at this size, and the box is drawn so it is not read as their place.
 */
export default function RegionMap({
  regions,
  title,
  desc,
  hrefFor,
  labelFor,
  highlight,
  id = "region-map",
  className = "",
}: {
  regions: RegionsFile;
  title: string;
  desc: string;
  /** Where a comunidad links, or null for no link. */
  hrefFor?: (id: string) => string | null;
  /** The link's accessible name. */
  labelFor?: (id: string) => string;
  highlight?: string;
  /** Prefix for the title and description ids, unique on the page. */
  id?: string;
  className?: string;
}) {
  const { width, height } = regions.viewBox;
  const box = regions.insetBox;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`block h-auto w-full ${className}`}
      // A map of links is a group of links, not a picture: role="img" would hide them.
      role={hrefFor ? "group" : "img"}
      aria-labelledby={`${id}-title ${id}-desc`}
    >
      <title id={`${id}-title`}>{title}</title>
      <desc id={`${id}-desc`}>{desc}</desc>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        fill="none"
        stroke="var(--n-ink-3)"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      {regions.regions.map((r) => {
        const on = highlight === r.id;
        const cls = on
          ? "fill-[var(--n-ink-2)]"
          : hrefFor
            ? "fill-[var(--n-card)] hover:fill-[var(--n-rule)]"
            : "fill-[var(--n-card)]";
        const shape = r.tiny ? (
          <circle
            cx={r.centroid[0]}
            cy={r.centroid[1]}
            r={7}
            className={cls}
            stroke="var(--n-ink-2)"
            strokeWidth={1.5}
          />
        ) : (
          <path d={r.d} className={cls} stroke="var(--n-rule-strong)" strokeWidth={1} strokeLinejoin="round" />
        );
        const href = hrefFor?.(r.id) ?? null;
        return href ? (
          <a key={r.id} href={href} aria-label={labelFor?.(r.id) ?? r.name}>
            {shape}
          </a>
        ) : (
          <g key={r.id}>{shape}</g>
        );
      })}
    </svg>
  );
}
