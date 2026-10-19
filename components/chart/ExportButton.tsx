"use client";

import { useState } from "react";
import type { ChartExport } from "@/lib/chart-export";
import { renderChartImage } from "./renderChartImage";

/**
 * "Descargar imagen": the chart as a 1200 × 675 PNG with its title, caption,
 * data date, sources and the site address drawn into it.
 *
 * A chart that gets shared travels without its page. The image therefore
 * carries everything a reader needs to check it — the publisher and the date
 * above all — baked into the pixels, where cropping the post does not remove
 * them from the file.
 *
 * The renderer is loaded with the button rather than on demand: it is a few
 * kilobytes of canvas code with no dependency, and a dynamic import would add
 * a round trip between the click and the download.
 */

/** The address printed on every image: the public site, and the page's path. */
const SITE_HOST = process.env.NEXT_PUBLIC_SITE_HOST ?? "seguir-el-dinero.vercel.app";

export default function ExportButton({
  spec,
  label,
  busyLabel,
  failedLabel,
  ariaLabel,
  className = "",
}: {
  spec: ChartExport;
  /** "Descargar imagen". */
  label: string;
  busyLabel: string;
  failedLabel: string;
  /** Names the chart: "Descargar «…» como imagen PNG de 1200 × 675". */
  ariaLabel: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "busy" | "failed">("idle");

  const run = async () => {
    setState("busy");
    try {
      const blob = await renderChartImage(spec, `${SITE_HOST}${window.location.pathname}`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `siguiendo-el-dinero-${spec.file}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Revoked on the next tick, after the browser has taken the download.
      setTimeout(() => URL.revokeObjectURL(url), 0);
      setState("idle");
    } catch (err) {
      console.error(err);
      setState("failed");
    }
  };

  return (
    <span className={`chart-export ${className}`}>
      <button
        type="button"
        className="chart-export-btn"
        onClick={run}
        disabled={state === "busy"}
        aria-label={ariaLabel}
        data-chart-export={spec.file}
      >
        <svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12">
          <path d="M6 1v6.5M3 5l3 3 3-3M1.5 10.5h9" fill="none" stroke="currentColor" strokeWidth="1.3" />
        </svg>
        {state === "busy" ? busyLabel : label}
      </button>
      <span role="status" className="chart-export-status">
        {state === "failed" ? failedLabel : ""}
      </span>
    </span>
  );
}
