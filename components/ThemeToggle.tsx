"use client";

import { useSyncExternalStore } from "react";

/**
 * Light, dark, or whatever the system says.
 *
 * The page follows `prefers-color-scheme` until the reader picks a theme here.
 * A pick is stored in localStorage under `theme` and written to <html> as
 * `data-theme`; "system" removes both, so the media query in app/globals.css
 * takes over again and follows the system live. The inline script in
 * app/[locale]/layout.tsx applies a stored pick before first paint, so this
 * component only ever changes the theme in response to a click — it never has
 * to correct one after the page has drawn.
 *
 * Three buttons with `aria-pressed` rather than one button that cycles: each
 * choice is one press away, and which one is in force can be read without
 * pressing anything. Same pattern as the locale toggle beside it.
 */

export type ThemeChoice = "light" | "dark" | "system";

/** Must match the key the inline script in app/[locale]/layout.tsx reads. */
export const THEME_KEY = "theme";

const listeners = new Set<() => void>();

function read(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    // Storage blocked (private mode, a sandboxed frame): the system decides.
    return "system";
  }
}

function apply(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", choice);
}

function choose(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {
    // Not persisted, but still applied to this page.
  }
  apply(choice);
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // A choice made in another tab of the site applies here too.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_KEY) return;
    apply(read());
    onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export interface ThemeToggleStrings {
  theme: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
}

const ICON = {
  light: (
    <>
      <circle cx="10" cy="10" r="3.6" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a} x1="10" y1="2.2" x2="10" y2="4.2" transform={`rotate(${a} 10 10)`} />
      ))}
    </>
  ),
  dark: <path d="M15.5 12.5A6.5 6.5 0 1 1 7.5 4.5a6 6 0 0 0 8 8Z" />,
  system: (
    <>
      <circle cx="10" cy="10" r="6.2" />
      <path d="M10 3.8a6.2 6.2 0 0 1 0 12.4Z" fill="currentColor" />
    </>
  ),
} as const;

export default function ThemeToggle({ t }: { t: ThemeToggleStrings }) {
  // null on the server and during hydration: the server cannot know the
  // reader's choice, so no button claims to be pressed until the client does.
  const current = useSyncExternalStore<ThemeChoice | null>(subscribe, read, () => null);

  const options: { id: ThemeChoice; label: string }[] = [
    { id: "light", label: t.themeLight },
    { id: "dark", label: t.themeDark },
    { id: "system", label: t.themeSystem },
  ];

  return (
    <div className="flex items-center gap-1" role="group" aria-label={t.theme}>
      {options.map((o) => {
        const pressed = current === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => choose(o.id)}
            aria-pressed={pressed}
            aria-label={o.label}
            title={o.label}
            // The pressed state is a border as well as a colour, so it does
            // not rest on colour alone.
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded border transition-colors ${
              pressed
                ? "border-[var(--gold)] bg-[color-mix(in_srgb,var(--gold)_12%,transparent)] text-[var(--gold-deep)]"
                : "border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]"
            }`}
          >
            <svg
              aria-hidden
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            >
              {ICON[o.id]}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
