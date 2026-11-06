import Image from "next/image";
import type { Portrait as PortraitData } from "@/lib/photos";

/**
 * A person's portrait, with the credit its licence requires beside it.
 *
 * A portrait exists only when a freely licensed image's Wikipedia article
 * title matched the person's name exactly (`lib/photos.ts`), so it is never a
 * guess. Most of the register has none, and then the initials stand in: never
 * a placeholder photo of someone else. The initials are decorative, since the
 * name is the page's heading.
 *
 * The party colour, when given, only tints the ring. It is the party's own
 * identity and is not set on text, where some party colours fall under 4.5:1.
 */
export default function Portrait({
  name,
  portrait,
  color,
  size = 112,
  photoLabel,
}: {
  name: string;
  portrait: PortraitData | null;
  color?: string;
  size?: number;
  /** "Foto" in the page's language. */
  photoLabel: string;
}) {
  const ring = color
    ? `color-mix(in srgb, ${color} 45%, var(--n-rule-strong))`
    : "var(--n-rule-strong)";

  if (!portrait) {
    const parts = name.split(/\s+/).filter(Boolean);
    const initials = ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
    return (
      <span
        aria-hidden
        className="flex shrink-0 items-center justify-center rounded-full bg-[var(--n-card)] font-[family-name:var(--n-serif)] text-[var(--n-ink-2)]"
        style={{ width: size, height: size, fontSize: size * 0.34, border: `2px solid ${ring}` }}
      >
        {initials}
      </span>
    );
  }

  return (
    <figure className="shrink-0" style={{ width: size }}>
      <Image
        src={portrait.url}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size, border: `2px solid ${ring}` }}
        unoptimized
      />
      <figcaption className="n-meta mt-2 [overflow-wrap:anywhere]">
        {photoLabel}:{" "}
        <a href={portrait.fileUrl} target="_blank" rel="noopener noreferrer">
          {portrait.author ?? "Wikimedia Commons"}
        </a>
        , {portrait.licence}
      </figcaption>
    </figure>
  );
}
