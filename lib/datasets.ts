import { getAggregation, SUBSIDIES_DATASET_NAME } from "./data";
import { getSalaries, SALARIES_SOURCE_URL } from "./salaries";
import { getVotes, voteDateISO } from "./votes";
import { getFoundations } from "./foundations";
import { ROLES, TIES } from "./foundation-people";
import { getSpending } from "./spending";
import { getHateTerritory } from "./regions";
import { getProvinces } from "./provinces";
import { getIndicators, sourceFor } from "./indicators";
import { GOVERNMENTS, GOVERNMENTS_SOURCE } from "./governments";
import { TERRITORIES } from "./territories";
import { DONATIONS_2020, DONATIONS_SOURCE } from "./donations";
import { PARTY_INCOME, PARTY_INCOME_SOURCE, PARTY_INCOME_YEAR } from "./party-income";
import { getDeclarations, getInterests } from "./declarations";
import { toCsv, type CsvColumn } from "./csv";

/**
 * Every dataset this site publishes, as one row-per-record table.
 *
 * Until now the numbers on this site could only be read the way a page chose
 * to show them — a bar, a sentence, a ranked list. A reader who wants to check
 * a figure, or use it in their own analysis, had nothing to take away. `/datos`
 * is the CSV of record for each one: the same figures every page already
 * renders, not a new extraction, so nothing here can drift from what is on the
 * site itself.
 *
 * Columns are fixed identifiers, not translated strings — see `lib/csv.ts`.
 * `count()` and `sources()` are cheap (the underlying loaders are already
 * module-cached); `csv()` builds the full text and is called only by the
 * download route, not by the index page.
 */

export interface DatasetSource {
  publisher: string;
  name: string;
  period: string;
  url: string;
}

export interface DatasetDef {
  id: string;
  count(): Promise<number>;
  sources(): Promise<DatasetSource[]>;
  csv(): Promise<string>;
  /** True for the two curated layers, where each row carries its own source
   *  rather than the table sharing one — the page renders these differently. */
  perRowSourced?: boolean;
}

function dataset<T>(opts: {
  id: string;
  rows(): Promise<T[]>;
  columns: CsvColumn<T>[];
  sources(): Promise<DatasetSource[]>;
  perRowSourced?: boolean;
}): DatasetDef {
  return {
    id: opts.id,
    perRowSourced: opts.perRowSourced,
    count: async () => (await opts.rows()).length,
    sources: opts.sources,
    csv: async () => toCsv(await opts.rows(), opts.columns),
  };
}

const subsidios = dataset({
  id: "subsidios",
  rows: async () => {
    const agg = await getAggregation();
    return agg.parties.flatMap((p) =>
      p.grants.map((g) => ({ ...g, partyDisplay: p.displayName, partyShort: p.shortName })),
    );
  },
  columns: [
    { header: "partido_nif", value: (r) => r.nif },
    { header: "partido", value: (r) => r.partyShort },
    { header: "beneficiario", value: (r) => r.rawName },
    { header: "importe_eur", value: (r) => r.amount },
    { header: "fecha", value: (r) => r.date },
    { header: "anio", value: (r) => r.year },
    { header: "tipo", value: (r) => r.kind },
    { header: "convocatoria", value: (r) => r.convocatoria },
    { header: "organo", value: (r) => r.organ },
    { header: "enlace_legal", value: (r) => r.legalUrl },
  ],
  sources: async () => {
    const agg = await getAggregation();
    return [
      {
        publisher: agg.source.system,
        name: SUBSIDIES_DATASET_NAME,
        period: `actualizado ${agg.generatedAt.slice(0, 10)}`,
        url: agg.source.url,
      },
    ];
  },
});

const donaciones = dataset({
  id: "donaciones",
  rows: async () => DONATIONS_2020,
  columns: [
    { header: "partido", value: (r) => r.label },
    { header: "partido_nif", value: (r) => r.nif ?? "" },
    { header: "donantes_bajo_1000", value: (r) => r.small.donors },
    { header: "importe_bajo_1000_eur", value: (r) => r.small.amount },
    { header: "donantes_1000_a_10000", value: (r) => r.mid.donors },
    { header: "importe_1000_a_10000_eur", value: (r) => r.mid.amount },
    { header: "donantes_sobre_10000", value: (r) => r.large.donors },
    { header: "importe_sobre_10000_eur", value: (r) => r.large.amount },
    { header: "donantes_total", value: (r) => r.total.donors },
    { header: "importe_total_eur", value: (r) => r.total.amount },
  ],
  sources: async () => [
    {
      publisher: DONATIONS_SOURCE.body,
      name: DONATIONS_SOURCE.report,
      period: String(DONATIONS_SOURCE.year),
      url: DONATIONS_SOURCE.url,
    },
  ],
});

const ingresosPartidos = dataset({
  id: "ingresos_partidos",
  rows: async () => PARTY_INCOME,
  columns: [
    { header: "partido", value: (r) => r.label },
    { header: "partido_nif", value: (r) => r.nif ?? "" },
    { header: "publico_estado_eur", value: (r) => r.public.state },
    { header: "publico_gobiernos_autonomicos_eur", value: (r) => r.public.regionalGovernments },
    { header: "publico_cortes_generales_eur", value: (r) => r.public.cortes },
    { header: "publico_parlamentos_autonomicos_eur", value: (r) => r.public.regionalParliaments },
    { header: "publico_entidades_locales_eur", value: (r) => r.public.local },
    { header: "publico_otras_eur", value: (r) => r.public.other },
    { header: "publico_total_eur", value: (r) => r.public.total },
    { header: "privado_cuotas_afiliados_eur", value: (r) => r.private.memberFees },
    { header: "privado_cargos_publicos_eur", value: (r) => r.private.officeholders },
    { header: "privado_donaciones_eur", value: (r) => r.private.donations },
    { header: "privado_otros_eur", value: (r) => r.private.other },
    { header: "privado_total_eur", value: (r) => r.private.total },
  ],
  sources: async () => [
    {
      publisher: PARTY_INCOME_SOURCE.body,
      name: `${PARTY_INCOME_SOURCE.report}, anexos IV y V`,
      period: String(PARTY_INCOME_YEAR),
      url: PARTY_INCOME_SOURCE.url,
    },
  ],
});

const fundaciones = dataset({
  id: "fundaciones",
  rows: async () => (await getFoundations()).dossiers,
  columns: [
    { header: "entidad", value: (r) => r.name },
    { header: "seccion_informe", value: (r) => r.section },
    { header: "ejercicio", value: (r) => r.exercise },
    { header: "partido_vinculado", value: (r) => r.partyLinked },
    { header: "supervisor", value: (r) => r.supervisor },
    { header: "anio_constitucion", value: (r) => r.yearConstituted },
    { header: "fecha_registro", value: (r) => r.registryDate },
    { header: "registrado", value: (r) => (r.registered === null ? "" : r.registered) },
    { header: "aportaciones_particulares_num", value: (r) => r.contributions.individuals.count },
    { header: "aportaciones_particulares_eur", value: (r) => r.contributions.individuals.amount },
    { header: "aportaciones_empresas_num", value: (r) => r.contributions.companies.count },
    { header: "aportaciones_empresas_eur", value: (r) => r.contributions.companies.amount },
    { header: "aportaciones_partido_num", value: (r) => r.contributions.party.count },
    { header: "aportaciones_partido_eur", value: (r) => r.contributions.party.amount },
    { header: "aportaciones_total_eur", value: (r) => r.contributions.total.amount },
    { header: "subvenciones_total_eur", value: (r) => r.subsidies.total },
    { header: "patrimonio_neto_eur", value: (r) => r.accounts.netEquity },
    { header: "ingresos_totales_eur", value: (r) => r.accounts.totalIncome },
    { header: "gastos_totales_eur", value: (r) => r.accounts.totalExpense },
    { header: "resultado_eur", value: (r) => r.accounts.result },
    { header: "num_hallazgos", value: (r) => r.findings.length },
  ],
  sources: async () => {
    const data = await getFoundations();
    return [
      {
        publisher: data.source.body,
        name: data.source.report,
        period: data.source.approved,
        url: data.source.url,
      },
    ];
  },
});

const fundacionesCargos = dataset({
  id: "fundaciones_cargos",
  rows: async () => ROLES,
  columns: [
    { header: "fundacion", value: (r) => r.foundation },
    { header: "persona", value: (r) => r.person },
    { header: "cargo", value: (r) => r.role },
    { header: "desde", value: (r) => r.since },
    { header: "hasta", value: (r) => r.until },
    { header: "fuente_publicador", value: (r) => r.source.publisher },
    { header: "fuente_titulo", value: (r) => r.source.title },
    { header: "fuente_fecha", value: (r) => r.source.date },
    { header: "fuente_tipo", value: (r) => r.source.kind },
    { header: "fuente_url", value: (r) => r.source.url },
  ],
  sources: async () => [],
  perRowSourced: true,
});

const fundacionesVinculos = dataset({
  id: "fundaciones_vinculos",
  rows: async () => TIES,
  columns: [
    { header: "persona", value: (r) => r.person },
    { header: "organizacion", value: (r) => r.organisation },
    { header: "cargo", value: (r) => r.role },
    { header: "tipo", value: (r) => r.kind },
    { header: "anterior", value: (r) => Boolean(r.former) },
    { header: "fuente_publicador", value: (r) => r.source.publisher },
    { header: "fuente_titulo", value: (r) => r.source.title },
    { header: "fuente_fecha", value: (r) => r.source.date },
    { header: "fuente_tipo", value: (r) => r.source.kind },
    { header: "fuente_url", value: (r) => r.source.url },
  ],
  sources: async () => [],
  perRowSourced: true,
});

const gastoElectoral = dataset({
  id: "gasto_electoral",
  rows: async () => (await getSpending()).formations,
  columns: [
    { header: "formacion", value: (r) => r.name },
    { header: "recursos_total_eur", value: (r) => r.resources.total },
    { header: "recursos_privados_eur", value: (r) => r.resources.private },
    { header: "recursos_prestamos_eur", value: (r) => r.resources.borrowing },
    { header: "recursos_anticipo_subvencion_eur", value: (r) => r.resources.subsidyAdvances },
    { header: "recursos_del_partido_eur", value: (r) => r.resources.fromParty },
    { header: "recursos_otros_eur", value: (r) => r.resources.other },
    { header: "gasto_ordinario_declarado_eur", value: (r) => r.ordinary.declared },
    { header: "publicidad_exterior_eur", value: (r) => r.ordinary.outdoorAdvertising },
    { header: "publicidad_prensa_radio_eur", value: (r) => r.ordinary.pressRadioAdvertising },
    { header: "gasto_ordinario_justificado_eur", value: (r) => r.ordinary.totalJustified },
    { header: "envios_declarado_eur", value: (r) => r.mailings.declared },
    { header: "envios_justificado_eur", value: (r) => r.mailings.totalJustified },
    { header: "supera_limite_maximo", value: (r) => r.limits.exceededMaximum },
    { header: "supera_limite_publicidad_exterior", value: (r) => r.limits.exceededOutdoorAdvertising },
  ],
  sources: async () => {
    const data = await getSpending();
    return [
      {
        publisher: data.source.body,
        name: data.source.report,
        period: data.source.approved,
        url: data.source.url,
      },
    ];
  },
});

const salarios = dataset({
  id: "salarios",
  rows: async () => (await getSalaries()).people,
  columns: [
    { header: "nombre", value: (r) => r.name },
    { header: "cargo", value: (r) => r.role },
    { header: "partido", value: (r) => r.partyLabel },
    { header: "partido_siglas", value: (r) => r.partyShort },
    { header: "partido_nif", value: (r) => r.partyNif },
    { header: "comunidad", value: (r) => r.region },
    { header: "municipio", value: (r) => r.municipality },
    { header: "retribucion_bruta_anual_eur", value: (r) => r.gross },
    { header: "retribucion_mensual_eur", value: (r) => r.monthly },
  ],
  sources: async () => {
    const data = await getSalaries();
    return [
      {
        publisher: data.source.name,
        name: data.source.via,
        period: data.source.updated ?? "",
        url: SALARIES_SOURCE_URL,
      },
    ];
  },
});

const votaciones = dataset({
  id: "votaciones",
  rows: async () => {
    const data = await getVotes();
    return data.votes.flatMap((v) =>
      v.votes.map((dv) => ({
        divisionId: v.id,
        law: v.law,
        title: v.title,
        topicLabel: v.topicLabel,
        date: v.date,
        ...dv,
      })),
    );
  },
  columns: [
    { header: "division_id", value: (r) => r.divisionId },
    { header: "ley", value: (r) => r.law },
    { header: "titulo", value: (r) => r.title },
    { header: "tema", value: (r) => r.topicLabel },
    { header: "fecha", value: (r) => r.date },
    { header: "diputado", value: (r) => r.deputy },
    { header: "grupo", value: (r) => r.group },
    { header: "voto", value: (r) => r.vote },
  ],
  sources: async () => {
    const data = await getVotes();
    const years = data.votes.map((v) => Number(voteDateISO(v).slice(0, 4)));
    const period = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "";
    return [{ publisher: data.source.name, name: "Votaciones nominales", period, url: data.source.url }];
  },
});

/** One row per item a deputy declared, in the form's order, so the table reads like the form. */
interface DeclaredItem {
  deputy: string;
  filed: string;
  part: string;
  description: string | null;
  location?: string | null;
  date?: string | null;
  title?: string | null;
  amount?: number | null;
  pending?: number | null;
  /** Any amount on the row written other than in Spanish format, as it appears on the scan. */
  written?: string | null;
  method: string;
  url: string;
}

const declaracionesBienes = dataset<DeclaredItem>({
  id: "declaraciones_bienes",
  rows: async () => {
    const { declarations } = await getDeclarations();
    return declarations.flatMap((d) => {
      const base = { deputy: d.deputy, filed: d.filed, method: d.verified.method, url: d.url };
      const noted = new Map(d.notes.map((n) => [n.path, n.written]));
      const written = (...cells: [path: string, column: string][]) =>
        cells
          .filter(([path]) => noted.has(path))
          .map(([path, column]) => `${column}: ${noted.get(path)}`)
          .join("; ") || null;
      const text = (part: string, description: string | null) =>
        description ? [{ ...base, part, description }] : [];
      return [
        ...d.income.map((l, i) => ({
          ...base,
          part: `rentas_${l.group}`,
          description: l.concept,
          amount: l.amount,
          written: written([`income[${i}].amount`, "importe"]),
        })),
        ...(d.irpf !== null
          ? [{ ...base, part: "irpf", description: null, amount: d.irpf, written: written(["irpf", "importe"]) }]
          : []),
        ...d.realEstate.map((p) => ({
          ...base,
          part: `inmueble_${p.kind}`,
          description: p.description,
          location: p.location,
          date: p.acquired,
          title: p.title,
        })),
        ...d.deposits.map((x, i) => ({
          ...base,
          part: "deposito",
          description: x.description,
          amount: x.amount,
          written: written([`deposits[${i}].amount`, "importe"]),
        })),
        ...d.otherAssets.map((a, i) => ({
          ...base,
          part: a.kind === "securities" ? "valores" : "otros_bienes",
          description: a.description,
          amount: a.amount,
          written: written([`otherAssets[${i}].amount`, "importe"]),
        })),
        ...text("participadas_mas_5", d.holdingsOver5pct),
        ...d.vehicles.map((v) => ({ ...base, part: "vehiculo", description: v.description, date: v.acquired })),
        ...d.loans.map((l, i) => ({
          ...base,
          part: "prestamo",
          description: l.description,
          date: l.granted,
          amount: l.amount,
          pending: l.pending,
          written: written([`loans[${i}].amount`, "importe"], [`loans[${i}].pending`, "saldo_pendiente"]),
        })),
        ...text("otras_deudas", d.otherDebts),
        ...text("observaciones", d.observations),
      ];
    });
  },
  columns: [
    { header: "diputado", value: (r) => r.deputy },
    { header: "fecha_declaracion", value: (r) => r.filed },
    { header: "apartado", value: (r) => r.part },
    { header: "descripcion", value: (r) => r.description },
    { header: "situacion", value: (r) => r.location },
    { header: "fecha", value: (r) => r.date },
    { header: "derecho_y_titulo", value: (r) => r.title },
    { header: "importe", value: (r) => r.amount },
    { header: "saldo_pendiente", value: (r) => r.pending },
    { header: "cifra_tal_como_figura", value: (r) => r.written },
    { header: "verificacion", value: (r) => r.method },
    { header: "fuente_url", value: (r) => r.url },
  ],
  sources: async () => [],
  perRowSourced: true,
});

const interesesEconomicos = dataset({
  id: "intereses_economicos",
  rows: async () => (await getInterests()).rows,
  columns: [
    { header: "diputado", value: (r) => r.name },
    { header: "fecha_registro", value: (r) => r.registered },
    { header: "declaracion", value: (r) => r.declaration },
    { header: "tipo", value: (r) => r.type },
    { header: "periodo", value: (r) => r.period },
    { header: "empleador", value: (r) => r.employer },
    { header: "sector", value: (r) => r.sector },
    { header: "descripcion", value: (r) => r.description },
    { header: "destinatario", value: (r) => r.recipient },
    { header: "benefactor", value: (r) => r.benefactor },
    { header: "observaciones", value: (r) => r.observations },
  ],
  sources: async () => {
    const data = await getInterests();
    return [
      {
        publisher: "Congreso de los Diputados",
        name: "Datos abiertos, declaraciones de intereses económicos",
        period: `actualizado ${data.generatedAt.slice(0, 10)}`,
        url: data.source.url,
      },
    ];
  },
});

const delitosOdio = dataset({
  id: "delitos_odio",
  rows: async () => {
    const data = await getHateTerritory();
    return Object.entries(data.territories).map(([id, row]) => {
      const t = TERRITORIES.find((t) => t.id === id);
      return { id, display: t?.mapName ?? row.reportName, ...row };
    });
  },
  columns: [
    { header: "comunidad_id", value: (r) => r.id },
    { header: "comunidad", value: (r) => r.display },
    { header: "nombre_informe", value: (r) => r.reportName },
    { header: "total", value: (r) => r.total },
    { header: "tasa_por_100k", value: (r) => r.ratePer100k },
    { header: "motivacion_administrativa", value: (r) => r.administrative },
    { header: "orientacion_identidad_genero", value: (r) => r.sexualOrientationGenderIdentity },
    { header: "racismo_xenofobia", value: (r) => r.racism },
    { header: "ideologia", value: (r) => r.ideology },
  ],
  sources: async () => {
    const data = await getHateTerritory();
    return [{ publisher: data.source.body, name: data.source.report, period: String(data.year), url: data.source.url }];
  },
});

const gobiernos = dataset({
  id: "gobiernos",
  rows: async () => GOVERNMENTS,
  columns: [
    { header: "comunidad_id", value: (r) => r.id },
    { header: "presidente", value: (r) => r.president },
    { header: "partido", value: (r) => r.partyLabel },
    { header: "partido_nif", value: (r) => r.partyNif },
    { header: "desde", value: (r) => r.since },
  ],
  sources: async () => [
    {
      publisher: GOVERNMENTS_SOURCE.body,
      name: "Presidencias autonómicas",
      period: `comprobado ${GOVERNMENTS_SOURCE.checked}`,
      url: GOVERNMENTS_SOURCE.url,
    },
  ],
});

const provincias = dataset({
  id: "provincias",
  rows: async () => (await getProvinces()).provinces,
  columns: [
    { header: "codigo", value: (r) => r.code },
    { header: "provincia", value: (r) => r.name },
    { header: "slug", value: (r) => r.slug },
    { header: "comunidad_id", value: (r) => r.territoryId },
  ],
  sources: async () => {
    const data = await getProvinces();
    return [{ publisher: data.source.body, name: data.source.name, period: "vigente", url: data.source.url }];
  },
});

interface WageRow {
  serie: string;
  categoria: string;
  sexo: string;
  valor: number | null;
  baja_muestra: boolean;
}

const salariosIne = dataset<WageRow>({
  id: "salarios_ine",
  rows: async () => {
    const ind = await getIndicators();
    const rows: WageRow[] = [];
    for (const r of ind.wages.sector)
      rows.push({ serie: "sector", categoria: r.sector, sexo: r.sex, valor: r.value, baja_muestra: r.lowSample });
    for (const r of ind.wages.jornada)
      rows.push({ serie: "jornada", categoria: r.jornada, sexo: r.sex, valor: r.value, baja_muestra: r.lowSample });
    for (const r of ind.wages.percentiles)
      rows.push({
        serie: "percentil",
        categoria: `${r.region} · ${r.measure}`,
        sexo: r.sex,
        valor: r.value,
        baja_muestra: r.lowSample,
      });
    for (const r of ind.wages.smiTranches)
      rows.push({
        serie: "tramo_smi",
        categoria: `${r.tranche} · ${r.jornada}`,
        sexo: r.sex,
        valor: r.percent,
        baja_muestra: r.lowSample,
      });
    return rows;
  },
  columns: [
    { header: "serie", value: (r) => r.serie },
    { header: "categoria", value: (r) => r.categoria },
    { header: "sexo", value: (r) => r.sexo },
    { header: "valor", value: (r) => r.valor },
    { header: "baja_muestra", value: (r) => r.baja_muestra },
  ],
  sources: async () => {
    const ind = await getIndicators();
    return (["sector", "jornada", "percentiles", "smiTranches"] as const).map((id) => {
      const s = sourceFor(ind, id);
      return { publisher: "INE", name: `${s.name} (tabla ${s.table})`, period: s.period, url: s.url };
    });
  },
});

interface PovertyRowOut {
  ambito: string;
  region: string;
  grupo: string;
  indicador: string;
  base: string;
  valor: number | null;
}

const pobrezaIne = dataset<PovertyRowOut>({
  id: "pobreza_ine",
  rows: async () => {
    const ind = await getIndicators();
    const rows: PovertyRowOut[] = [];
    for (const r of ind.poverty.national)
      rows.push({ ambito: "nacional", region: "", grupo: r.ageGroup, indicador: r.indicator, base: r.base, valor: r.percent });
    for (const r of ind.poverty.regional)
      rows.push({ ambito: "regional", region: r.region, grupo: r.group, indicador: r.indicator, base: r.base, valor: r.percent });
    return rows;
  },
  columns: [
    { header: "ambito", value: (r) => r.ambito },
    { header: "region", value: (r) => r.region },
    { header: "grupo", value: (r) => r.grupo },
    { header: "indicador", value: (r) => r.indicador },
    { header: "base", value: (r) => r.base },
    { header: "valor", value: (r) => r.valor },
  ],
  sources: async () => {
    const ind = await getIndicators();
    return (["povertyNational", "povertyRegional"] as const).map((id) => {
      const s = sourceFor(ind, id);
      return { publisher: "INE", name: `${s.name} (tabla ${s.table})`, period: s.period, url: s.url };
    });
  },
});

export const DATASETS: DatasetDef[] = [
  subsidios,
  donaciones,
  ingresosPartidos,
  fundaciones,
  fundacionesCargos,
  fundacionesVinculos,
  gastoElectoral,
  salarios,
  votaciones,
  declaracionesBienes,
  interesesEconomicos,
  delitosOdio,
  gobiernos,
  provincias,
  salariosIne,
  pobrezaIne,
];

export function datasetById(id: string): DatasetDef | undefined {
  return DATASETS.find((d) => d.id === id);
}
