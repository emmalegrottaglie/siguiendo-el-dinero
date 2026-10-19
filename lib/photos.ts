import { promises as fs } from "node:fs";
import path from "node:path";
import { nameKey } from "./name-key.mjs";

export interface Portrait {
  name: string;
  url: string;
  width: number;
  height: number;
  licence: string;
  author: string | null;
  articleUrl: string;
  fileUrl: string;
}

interface PhotosFile {
  generatedAt: string;
  source: { name: string; url: string };
  count: number;
  photos: Record<string, Portrait>;
}

const FILE = path.join(process.cwd(), "data", "photos.json");
let cache: PhotosFile | null = null;

const EMPTY: PhotosFile = {
  generatedAt: "",
  source: { name: "", url: "" },
  count: 0,
  photos: {},
};

// A read failure is never cached: the file may be briefly missing during a
// deploy, and caching the empty result would drop portraits for the lifetime of
// the instance.
async function load(): Promise<PhotosFile> {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf-8")) as PhotosFile;
    cache = parsed;
    return parsed;
  } catch {
    return EMPTY;
  }
}

// A portrait only exists when the Wikipedia article title matched the person's
// name exactly, so a hit here is not a guess. Returns null when unknown.
export async function portraitFor(name: string): Promise<Portrait | null> {
  const data = await load();
  return data.photos[nameKey(name)] ?? null;
}

// Null when the portrait file could not be read, so callers can omit the credit
// line instead of rendering an empty link.
/** Keys that have a portrait — lets callers test many names without awaiting each. */
export async function portraitKeys(): Promise<Set<string>> {
  const data = await load();
  return new Set(Object.keys(data.photos));
}

/** When the portrait build last ran, as ISO; empty when there is no build. */
export async function photoBuildDate(): Promise<string> {
  return (await load()).generatedAt;
}

export async function photoSource(): Promise<PhotosFile["source"] | null> {
  const { source } = await load();
  return source.name && source.url ? source : null;
}
