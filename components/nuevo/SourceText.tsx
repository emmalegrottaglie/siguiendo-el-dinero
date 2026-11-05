/**
 * The quiet line under a figure that says where it came from: publisher,
 * dataset as the publisher names it, and the period or fetch date the ingest
 * recorded. Takes the same shape `lib/chart-sources.ts` builds, so the period
 * is read from the data rather than typed by hand.
 */
export interface Source {
  publisher: string;
  name: string;
  period: string;
  url: string;
}

export default function SourceText({ sources, label }: { sources: Source[]; label: string }) {
  return (
    <p className="n-source">
      {label}:{" "}
      {sources.map((s, i) => (
        <span key={s.url + s.name}>
          {i > 0 && "; "}
          <a href={s.url}>{s.publisher}</a>, {s.name} ({s.period})
        </span>
      ))}
      .
    </p>
  );
}
