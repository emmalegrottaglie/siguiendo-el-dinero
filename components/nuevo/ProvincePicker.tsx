"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { provinceForPostcode, type Province } from "@/lib/postcode";

/** The words this block needs, supplied by the page's copy so each locale stays in one file. */
export interface ProvincePickerCopy {
  title: string;
  intro: string;
  postcodeLabel: string;
  postcodePlaceholder: string;
  submit: string;
  provinceLabel: string;
  provincePlaceholder: string;
  notFound: string;
  privacy: string;
}

/**
 * Where you live: a postcode or a province, straight to that province's page.
 *
 * The postcode never leaves the browser. Its first two digits are the province
 * code, so resolving it is string arithmetic over the 52-row table handed down
 * as a prop: no lookup service, no request carrying it, nothing stored. The
 * block says so in writing.
 *
 * It navigates to the province URL, never a postcode URL: the province is the
 * real resolution of the answer, and a postcode in a shareable link is location
 * data a reader did not choose to publish.
 *
 * The province list has its own button rather than navigating on change: a
 * keyboard reader moving through the options with the arrow keys would
 * otherwise be sent to the first province they pass.
 */
export default function ProvincePicker({
  provinces,
  locale,
  t,
  className = "",
}: {
  provinces: Province[];
  locale: string;
  t: ProvincePickerCopy;
  className?: string;
}) {
  const router = useRouter();
  const id = useId();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [slug, setSlug] = useState("");

  const go = (slug: string) => router.push(`/${locale}/territorio/${slug}`);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const hit = provinceForPostcode(code, provinces);
    if (hit) {
      setError(false);
      go(hit.slug);
    } else {
      setError(true);
    }
  };

  // Alphabetical by the name a reader reads, not by INE's code order.
  const sorted = [...provinces].sort((a, b) => a.name.localeCompare(b.name, locale));

  const field =
    "min-h-[3rem] rounded-[6px] border border-[var(--n-ink-3)] bg-[var(--n-card)] px-4 text-[var(--n-ink)]";

  return (
    <div className={className}>
      <h2 className="n-h3">{t.title}</h2>
      <p className="n-body mt-2">{t.intro}</p>

      <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-4">
        <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1.5">
            <span className="n-label">{t.postcodeLabel}</span>
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 5));
                setError(false);
              }}
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder={t.postcodePlaceholder}
              aria-describedby={`${id}-privacy${error ? ` ${id}-error` : ""}`}
              aria-invalid={error}
              className={`${field} n-num w-[8rem]`}
            />
          </label>
          <button type="submit" className="n-button">
            {t.submit}
          </button>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (slug) go(slug);
          }}
          className="flex min-w-0 flex-wrap items-end gap-2"
        >
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="n-label">{t.provinceLabel}</span>
            <select
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={`${field} max-w-full sm:max-w-[18rem]`}
            >
              <option value="" disabled>
                {t.provincePlaceholder}
              </option>
              {sorted.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="n-button" disabled={!slug}>
            {t.submit}
          </button>
        </form>
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="n-body mt-3 font-bold">
          {t.notFound}
        </p>
      )}

      <p id={`${id}-privacy`} className="n-meta mt-3">
        {t.privacy}
      </p>
    </div>
  );
}
