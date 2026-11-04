import type { Locale } from "@/lib/locales";

/**
 * English and Catalan for the common foundation-board roles in
 * lib/foundation-people.ts. Only the plain titles are listed; a role written
 * out in full by its source ("embajador en Estados Unidos, ...") has no entry
 * and is shown as the source wrote it.
 */
const ROLE_WORDS: Record<string, { en: string; ca: string }> = {
  patrono: { en: "trustee", ca: "patró" },
  patrona: { en: "trustee", ca: "patrona" },
  presidente: { en: "chair", ca: "president" },
  presidenta: { en: "chair", ca: "presidenta" },
  vicepresidente: { en: "vice-chair", ca: "vicepresident" },
  vicepresidenta: { en: "vice-chair", ca: "vicepresidenta" },
  secretario: { en: "secretary", ca: "secretari" },
  secretaria: { en: "secretary", ca: "secretària" },
  tesorero: { en: "treasurer", ca: "tresorer" },
  tesorera: { en: "treasurer", ca: "tresorera" },
  vocal: { en: "board member", ca: "vocal" },
  "consejo asesor": { en: "advisory board", ca: "consell assessor" },
  consejero: { en: "board member", ca: "conseller" },
  consejera: { en: "board member", ca: "consellera" },
  "consejera delegada": { en: "managing director", ca: "consellera delegada" },
  director: { en: "director", ca: "director" },
  directora: { en: "director", ca: "directora" },
};

export function roleLabel(role: string, locale: Locale = "es"): string {
  if (locale === "es") return role;
  return ROLE_WORDS[role.toLowerCase()]?.[locale] ?? role;
}
