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
 * Drawn in a 340-unit-wide box so that on a 343px phone column one unit is one
 * pixel and the 13-unit labels render at 13px; it scales up on wider screens.
 */
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
  { id: "estado", x: 40, y: 48, label: "El Estado", anchor: "start" as const, dx: -10, dy: -16 },
  { id: "particulares", x: 175, y: 48, label: "Particulares", anchor: "middle" as const, dx: 0, dy: -16 },
  { id: "empresas", x: 305, y: 48, label: "Empresas", anchor: "end" as const, dx: 10, dy: -16 },
  { id: "partidos", x: 70, y: 262, label: "Partidos", anchor: "start" as const, dx: -30, dy: 32 },
  { id: "fundaciones", x: 270, y: 262, label: "Fundaciones", anchor: "end" as const, dx: 34, dy: 32 },
  { id: "personas", x: 175, y: 430, label: "Personas con cargo", anchor: "middle" as const, dx: 0, dy: 34 },
];

export default function RouteMap({ f }: { f: RouteFigures }) {
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
        viewBox="0 0 340 490"
        className="block h-auto w-full max-w-[34rem]"
        role="img"
        aria-labelledby="route-map-title route-map-desc"
      >
        <title id="route-map-title">Las rutas del dinero hacia la política</title>
        <desc id="route-map-desc">
          {`El Estado da ${f.subsidies} en subvenciones a los partidos. Particulares donaron ${f.donations} a los partidos en ${f.donationsYear}. Las fundaciones de los partidos recibieron, en ${f.foundationYears}, ${f.foundationsFromParty} de los propios partidos, ${f.foundationsFromCompanies} de empresas y ${f.foundationsFromIndividuals} de particulares. ${f.officeholdersOnBoards} personas con cargo público se sientan en sus patronatos.`}
        </desc>

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
              {s.label}
            </text>
          </g>
        ))}

        {/* Figures on the lines. */}
        <LineLabel x={52} y={150} cls="n-state" figure={f.subsidies} note="en subvenciones" />
        <LineLabel x={158} y={92} cls="n-donors" figure={f.donations} note={`donaciones, ${f.donationsYear}`} anchor="end" />
        <LineLabel x={192} y={92} cls="n-donors" figure={f.foundationsFromIndividuals} note="de particulares" />
        <LineLabel x={295} y={150} cls="n-companies" figure={f.foundationsFromCompanies} note="de empresas" anchor="end" />
        <LineLabel x={170} y={226} cls="n-foundations" figure={f.foundationsFromParty} note="del propio partido" anchor="middle" />
        <text x={260} y={340} textAnchor="end" fill="var(--n-ink-2)" style={{ fontSize: 13, ...HALO }}>
          <tspan x={260}>{f.officeholdersOnBoards} cargos públicos</tspan>
          <tspan x={260} dy={16}>en sus patronatos</tspan>
        </text>
      </svg>
      <figcaption className="n-meta mt-3 flex flex-wrap gap-x-5 gap-y-1">
        <span className="inline-flex items-center gap-2">
          <svg width="28" height="8" aria-hidden>
            <path d="M2 4 H26" stroke="var(--n-ink)" strokeWidth={5} strokeLinecap="round" />
          </svg>
          Dinero que consta en el registro
        </span>
        <span className="inline-flex items-center gap-2">
          <svg width="28" height="8" aria-hidden>
            <path d="M2 4 H26" stroke="var(--n-ink-3)" strokeWidth={2} strokeDasharray="4 5" strokeLinecap="round" />
          </svg>
          Las mismas personas aparecen a los dos lados: no es dinero
        </span>
        <span>Fundaciones: {f.foundationYears}.</span>
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
