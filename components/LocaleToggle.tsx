"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, LOCALE_LABELS, LOCALE_COOKIE, type Locale } from "@/lib/locales";

export default function LocaleToggle({ current }: { current: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const change = (code: Locale) => {
    if (code === current) return;
    // Swap the leading /<locale> segment (or prepend it if somehow absent).
    const rest = pathname.replace(new RegExp(`^/(${LOCALES.join("|")})(?=/|$)`), "");
    const next = `/${code}${rest}`;
    // Remember the choice so the middleware honours it on non-prefixed visits.
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.push(next));
  };

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label="Idioma / Language"
      aria-busy={pending}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          onClick={() => change(code)}
          aria-pressed={code === current}
          title={LOCALE_LABELS[code]}
          className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded text-[0.9rem] transition-colors ${
            code === current
              ? "font-bold text-[var(--n-ink)]"
              : "text-[var(--n-ink-3)] hover:text-[var(--n-ink)]"
          }`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
