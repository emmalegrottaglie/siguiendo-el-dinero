import type { Aggregation } from "./types";
import { aggregate } from "./normalize";
import { readSnapshot } from "./store";

// Short in-memory cache. Serverless instances are ephemeral, so a small TTL is
// enough to avoid re-reading/re-aggregating on every request within one instance.
const TTL_MS = 60_000;
let cache: { at: number; agg: Aggregation } | null = null;

/** BDNS's own name for the party-subsidy listing this snapshot is read from. */
export const SUBSIDIES_DATASET_NAME = "Concesiones a partidos políticos";

export async function getAggregation(): Promise<Aggregation> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return cache.agg;

  const snapshot = await readSnapshot();
  const agg = aggregate(snapshot);
  cache = { at: now, agg };
  return agg;
}

// Called by the refresh route after a successful write so the next read is fresh.
export function invalidate(): void {
  cache = null;
}
