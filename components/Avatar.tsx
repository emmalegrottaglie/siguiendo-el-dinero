import Image from "next/image";
import type { Portrait } from "@/lib/photos";

// Initials fall back when no freely-licensed portrait exists, which is the case
// for most of the register. Never a placeholder photo of someone else.
function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function Avatar({
  name,
  portrait,
  color = "var(--ink-3)",
  size = 56,
}: {
  name: string;
  portrait?: Portrait | null;
  color?: string;
  size?: number;
}) {
  if (portrait) {
    return (
      <Image
        src={portrait.url}
        alt={name}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{
          width: size,
          height: size,
          // Mixed towards --ring-base, which is transparent in the light theme
          // (so this is the party colour at 40%) and a mid grey in the dark
          // one, where a 40% party colour alone can vanish into the ground.
          border: `1px solid color-mix(in srgb, ${color} 40%, var(--ring-base))`,
        }}
        unoptimized
      />
    );
  }
  // The party's colour identifies the tile through its ring and a tinted field;
  // the initials themselves are --ink. Setting them in the brand colour put
  // three parties under 4.5:1 against --ink-3 (#8b5cc4 at 3.61, #d64545 at 3.92,
  // #c7527f at 4.04). Lightening those colours was not an option — they are the
  // parties' own identities — so the colour moved off the text instead.
  return (
    <span
      aria-hidden="true"
      className="mono flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        color: "var(--ink)",
        background: `linear-gradient(160deg, color-mix(in srgb, ${color} 15%, transparent), var(--surface) 70%)`,
        border: `1px solid color-mix(in srgb, ${color} 50%, var(--ring-base))`,
      }}
    >
      {initials(name)}
    </span>
  );
}
