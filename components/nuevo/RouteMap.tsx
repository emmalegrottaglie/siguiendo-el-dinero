/**
 * The routes money takes into Spanish politics, drawn as a transit map.
 *
 * Solid lines are money the record shows moving: state subsidies to parties,
 * private donations to parties and to their foundations, company money to
 * foundations, party money to its own foundations. Dashed lines are not money:
 * they mark where the same people appear on both sides of a record: an
 * officeholder who sits on a party foundation's board. The legend says so in
 * words, because the distinction is the point of the drawing: a line between
 * two stations is a record, not a motive.
 *
 * There is deliberately no line from the companies to the officeholders.
 * Deputies declare shares and bonds, but nothing on record says they are in
 * the companies that pay the foundations, and a line would say they are.
 *
 * Line weights are equal on purpose. The figures range from about 300 M€ to
 * under 400.000 €, so a weight scaled to money would make every route but one
 * vanish; the figure is printed on each line instead.
 *
 * Drawn in a 360-unit-wide box, close to a phone column, so the 13-unit labels
 * render at about 13px there; it scales up on wider screens.
 */
import type { Locale } from "@/lib/locales";

export interface RouteFigures {
  subsidies: string;
  donations: string;
  donationsYear: string;
  foundationsFromParty: string;
  foundationsFromCompanies: string;
  foundationsFromIndividuals: string;
  foundationYears: string;
  officeholdersOnBoards: string;
}

const STATIONS = [
  { id: "estado", x: 40, y: 48, anchor: "middle" as const, dx: 0, dy: -16 },
  { id: "particulares", x: 175, y: 48, anchor: "middle" as const, dx: 0, dy: -16 },
  { id: "empresas", x: 305, y: 48, anchor: "middle" as const, dx: 0, dy: -16 },
  { id: "partidos", x: 70, y: 262, anchor: "middle" as const, dx: 0, dy: 32 },
  { id: "fundaciones", x: 270, y: 262, anchor: "middle" as const, dx: 0, dy: 32 },
  { id: "personas", x: 175, y: 430, anchor: "middle" as const, dx: 0, dy: 34 },
] as const;

const es = {
  title: "Las rutas del dinero hacia la política",
  desc: (f: RouteFigures) =>
    `El Estado da ${f.subsidies} en subvenciones a los partidos. Particulares donaron ${f.donations} a los partidos en ${f.donationsYear}. Las fundaciones de los partidos recibieron, en ${f.foundationYears}, ${f.foundationsFromParty} de los propios partidos, ${f.foundationsFromCompanies} de empresas y ${f.foundationsFromIndividuals} de particulares. ${f.officeholdersOnBoards} personas con cargo público se sientan en sus patronatos.`,
  stations: {
    estado: "El Estado",
    particulares: "Particulares",
    empresas: "Empresas",
    partidos: "Partidos",
    fundaciones: "Fundaciones",
    personas: "Personas con cargo",
  },
  inSubsidies: "en subvenciones",
  donationsYear: (y: string) => `donaciones, ${y}`,
  fromIndividuals: "de particulares",
  fromCompanies: "de empresas",
  fromParty: "del propio partido",
  officeholders: (n: string) => `${n} cargos públicos`,
  onBoards: "en sus patronatos",
  legendMoney: "Dinero que consta en el registro",
  legendNotMoney: "Las mismas personas aparecen a los dos lados: no es dinero",
  foundationsYears: (y: string) => `Fundaciones: ${y}.`,
};
type Copy = typeof es;

const en: Copy = {
  title: "The routes money takes into politics",
  desc: (f) =>
    `The State gives ${f.subsidies} in subsidies to the parties. Individuals donated ${f.donations} to the parties in ${f.donationsYear}. The parties' foundations received, in ${f.foundationYears}, ${f.foundationsFromParty} from the parties themselves, ${f.foundationsFromCompanies} from companies and ${f.foundationsFromIndividuals} from individuals. ${f.officeholdersOnBoards} people holding public office sit on their boards.`,
  stations: {
    estado: "The State",
    particulares: "Individuals",
    empresas: "Companies",
    partidos: "Parties",
    fundaciones: "Foundations",
    personas: "Officeholders",
  },
  inSubsidies: "in subsidies",
  donationsYear: (y) => `donations, ${y}`,
  fromIndividuals: "from individuals",
  fromCompanies: "from companies",
  fromParty: "from the party itself",
  officeholders: (n) => `${n} officeholders`,
  onBoards: "on their boards",
  legendMoney: "Money on record",
  legendNotMoney: "The same people appear on both sides: not money",
  foundationsYears: (y) => `Foundations: ${y}.`,
};

const ca: Copy = {
  title: "Les rutes dels diners cap a la política",
  desc: (f) =>
    `L'Estat dona ${f.subsidies} en subvencions als partits. Els particulars van donar ${f.donations} als partits el ${f.donationsYear}. Les fundacions dels partits van rebre, en el període ${f.foundationYears}, ${f.foundationsFromParty} dels mateixos partits, ${f.foundationsFromCompanies} d'empreses i ${f.foundationsFromIndividuals} de particulars. ${f.officeholdersOnBoards} persones amb càrrec públic seuen als seus patronats.`,
  stations: {
    estado: "L'Estat",
    particulares: "Particulars",
    empresas: "Empreses",
    partidos: "Partits",
    fundaciones: "Fundacions",
    personas: "Persones amb càrrec",
  },
  inSubsidies: "en subvencions",
  donationsYear: (y) => `donacions, ${y}`,
  fromIndividuals: "de particulars",
  fromCompanies: "d'empreses",
  fromParty: "del mateix partit",
  officeholders: (n) => `${n} càrrecs públics`,
  onBoards: "als seus patronats",
  legendMoney: "Diners que consten al registre",
  legendNotMoney: "Les mateixes persones apareixen als dos costats: no són diners",
  foundationsYears: (y) => `Fundacions: ${y}.`,
};

const COPY: Record<Locale, Copy> = { es, en, ca };

export default function RouteMap({ f, locale = "es" }: { f: RouteFigures; locale?: Locale }) {
  const t = COPY[locale];
  const routes = [
    // Estado → partidos
    { d: "M40 48 V222 L70 252", cls: "n-state", len: 210, delay: 0 },
    // Particulares → partidos
    { d: "M168 48 V150 L78 240", cls: "n-donors", len: 230, delay: 0.15 },
    // Particulares → fundaciones
    { d: "M182 48 V150 L262 230", cls: "n-donors", len: 230, delay: 0.25 },
    // Empresas → fundaciones
    { d: "M305 48 V222 L278 250", cls: "n-companies", len: 210, delay: 0.35 },
    // Partidos → fundaciones
    { d: "M80 268 H260", cls: "n-foundations", len: 180, delay: 0.5 },
  ];
  // Fundaciones … personas: officeholders on the foundations' boards.
  const ties = ["M270 272 V403 L243 430 H186"];

  return (
    <figure className="m-0">
      <svg
        viewBox="0 0 360 490"
        className="block h-auto w-full max-w-[34rem]"
        role="img"
        aria-labelledby="route-map-title route-map-desc"
      >
        <title id="route-map-title">{t.title}</title>
        <desc id="route-map-desc">
          {t.desc(f)}
        </desc>
        {/* Shifted 10 units in so every station name can sit centred on its dot. */}
        <g transform="translate(10 0)">

        {ties.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="var(--n-ink-3)"
            strokeWidth={2}
            strokeDasharray="4 5"
            strokeLinecap="round"
          />
        ))}

        {routes.map((r) => (
          <path
            key={r.d}
            d={r.d}
            className={`${r.cls} n-route-draw`}
            fill="none"
            stroke="var(--route)"
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ ["--len" as string]: r.len, ["--delay" as string]: `${r.delay}s` }}
          />
        ))}

        {STATIONS.map((s) => (
          <g key={s.id}>
            <circle cx={s.x} cy={s.y} r={9} fill="var(--n-card)" stroke="var(--n-ink)" strokeWidth={3} />
            <text
              x={s.x + s.dx}
              y={s.y + s.dy}
              textAnchor={s.anchor}
              fill="var(--n-ink)"
              style={{ fontFamily: "var(--n-serif)", fontSize: 17, fontWeight: 600, ...HALO }}
            >
              {t.stations[s.id]}
            </text>
          </g>
        ))}

        {/* Figures on the lines. */}
        <LineLabel x={52} y={150} cls="n-state" figure={f.subsidies} note={t.inSubsidies} />
        <LineLabel x={158} y={92} cls="n-donors" figure={f.donations} note={t.donationsYear(f.donationsYear)} anchor="end" />
        <LineLabel x={192} y={92} cls="n-donors" figure={f.foundationsFromIndividuals} note={t.fromIndividuals} />
        <LineLabel x={295} y={150} cls="n-companies" figure={f.foundationsFromCompanies} note={t.fromCompanies} anchor="end" />
        <LineLabel x={170} y={226} cls="n-foundations" figure={f.foundationsFromParty} note={t.fromParty} anchor="middle" />
        <text x={260} y={340} textAnchor="end" fill="var(--n-ink-2)" style={{ fontSize: 13, ...HALO }}>
          <tspan x={260}>{t.officeholders(f.officeholdersOnBoards)}</tspan>
          <tspan x={260} dy={16}>{t.onBoards}</tspan>
        </text>
        </g>
      </svg>
      <figcaption className="n-meta mt-3 flex flex-wrap gap-x-5 gap-y-1">
        <span className="inline-flex items-center gap-2">
          <svg width="28" height="8" aria-hidden>
            <path d="M2 4 H26" stroke="var(--n-ink)" strokeWidth={5} strokeLinecap="round" />
          </svg>
          {t.legendMoney}
        </span>
        <span className="inline-flex items-center gap-2">
          <svg width="28" height="8" aria-hidden>
            <path d="M2 4 H26" stroke="var(--n-ink-3)" strokeWidth={2} strokeDasharray="4 5" strokeLinecap="round" />
          </svg>
          {t.legendNotMoney}
        </span>
        <span>{t.foundationsYears(f.foundationYears)}</span>
      </figcaption>
    </figure>
  );
}

/** A halo of page ground behind text, so a label stays legible where it meets a line. */
const HALO = {
  paintOrder: "stroke",
  stroke: "var(--n-bg)",
  strokeWidth: 5,
  strokeLinejoin: "round",
} as const;

function LineLabel({
  x,
  y,
  cls,
  figure,
  note,
  anchor = "start",
}: {
  x: number;
  y: number;
  cls: string;
  figure: string;
  note: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} className={cls} style={HALO}>
      <tspan x={x} fill="var(--route)" style={{ fontSize: 15, fontWeight: 700 }}>
        {figure}
      </tspan>
      <tspan x={x} dy={16} fill="var(--n-ink-2)" style={{ fontSize: 13 }}>
        {note}
      </tspan>
    </text>
  );
}
