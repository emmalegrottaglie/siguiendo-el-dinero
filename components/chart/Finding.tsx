import type { ReactNode } from "react";

/**
 * The sentence a chart is there to show, set above it as the chart's lead.
 *
 * A heading that names the chart ("Reparto por partido") leaves the reader to
 * find the point; a finding states it, and the chart becomes the evidence
 * (RESEARCH-DATAVIZ/03, "Lead with the finding"). Every finding on this site is
 * computed from the same data the chart draws, from a template in lib/i18n.ts,
 * so it cannot drift from the marks when the data or a filter changes. It
 * states a size or a share and never a reason: why the figure is what it is
 * is not in the data.
 */
export default function Finding({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`display ${className}`}
      style={{
        fontSize: "clamp(19px, 2.2vw, 24px)",
        lineHeight: 1.3,
        maxWidth: "46ch",
        color: "var(--ink)",
      }}
    >
      {children}
    </p>
  );
}
