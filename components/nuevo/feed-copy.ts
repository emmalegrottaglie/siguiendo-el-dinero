import type { Locale } from "@/lib/locales";

/** Strings of BlueskyFeed and NewsFeed beyond the shared `feed` dictionary. */
const es = {
  likes: "me gusta",
  reposts: "republicaciones",
  loading: "Cargando…",
  newsLoading: "Cargando titulares…",
  newsFailed: "No se pudieron cargar los titulares ahora mismo.",
};
type Copy = typeof es;

const en: Copy = {
  likes: "likes",
  reposts: "reposts",
  loading: "Loading…",
  newsLoading: "Loading headlines…",
  newsFailed: "The headlines could not be loaded right now.",
};

const ca: Copy = {
  likes: "m’agrada",
  reposts: "republicacions",
  loading: "Carregant…",
  newsLoading: "Carregant titulars…",
  newsFailed: "No s'han pogut carregar els titulars ara mateix.",
};

export const FEED_COPY: Record<Locale, Copy> = { es, en, ca };
