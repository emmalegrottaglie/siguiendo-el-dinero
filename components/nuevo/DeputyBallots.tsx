import Link from "next/link";
import { getPeople } from "@/lib/people";
import { groupLabel } from "@/lib/groups";
import { nameKey, type Ballot, type KeyVote } from "@/lib/votes";

/**
 * Find how one deputy voted: a name search over the roll calls of the given
 * divisions, one row per person, one column per division.
 *
 * Only the ballot on record is shown. A deputy who was not in the chamber for
 * a division gets "no consta" for it, never their group's position.
 *
 * A name links to the person page only when its roll-call name resolves to
 * exactly one person on the site; an ambiguous match is shown unlinked rather
 * than guessed, since a wrong link would hand one person another's record.
 */
const BALLOT: Record<string, string> = {
  Sí: "A favor",
  No: "En contra",
  Abstención: "Abstención",
};

export default async function DeputyBallots({
  votes,
  q,
  action,
  locale,
  columnLabel,
}: {
  votes: KeyVote[];
  q: string | undefined;
  /** Where the form submits: the page it sits on. */
  action: string;
  locale: string;
  /** The heading of each division's column. */
  columnLabel: (vote: KeyVote) => string;
}) {
  const query = q?.trim() ?? "";
  type Cast = { ballot: Ballot; group: string };
  let found: { key: string; name: string; ballots: Record<string, Cast> }[] = [];
  const slugFor = new Map<string, string | null>();

  if (query) {
    const needle = nameKey(query).split(" ").filter(Boolean);
    const people = new Map<string, { key: string; name: string; ballots: Record<string, Cast> }>();
    for (const vote of votes) {
      for (const dv of vote.votes) {
        const key = nameKey(dv.deputy);
        if (!needle.every((n) => key.includes(n))) continue;
        const rec = people.get(key) ?? { key, name: dv.deputy, ballots: {} };
        rec.ballots[vote.id] = { ballot: dv.vote, group: dv.group };
        people.set(key, rec);
      }
    }
    found = [...people.values()].sort((a, b) => a.name.localeCompare(b.name, "es")).slice(0, 40);

    if (found.length) {
      const wanted = new Set(found.map((f) => f.key));
      for (const p of await getPeople()) {
        const keys = new Set([nameKey(p.name), ...(p.deputy ? [nameKey(p.deputy.name)] : [])]);
        for (const k of keys) {
          if (!wanted.has(k)) continue;
          // A second person under the same key makes the match ambiguous: drop it.
          slugFor.set(k, slugFor.has(k) && slugFor.get(k) !== p.slug ? null : p.slug);
        }
      }
    }
  }

  return (
    <div>
      <form action={action} method="get" role="search" className="n-search">
        <label htmlFor="n-dq" className="sr-only">
          Apellido o nombre del diputado
        </label>
        <input
          id="n-dq"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Apellido o nombre"
          autoComplete="off"
        />
        <button type="submit" className="n-button">
          Buscar
        </button>
      </form>

      {query &&
        (found.length === 0 ? (
          <p className="mt-5 text-[var(--n-ink-2)]">
            Ningún diputado con ese nombre consta en estas votaciones.
          </p>
        ) : (
          <>
            <p className="n-meta mt-5">
              {found.length === 1 ? "1 diputado" : `${found.length} diputados`} con ese nombre
              {found.length === 40 ? " (se muestran los 40 primeros)" : ""}.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="n-table">
                <caption className="sr-only">Voto de cada diputado encontrado en cada votación</caption>
                <thead>
                  <tr>
                    <th scope="col">Diputado, como figura en el acta</th>
                    {votes.map((v) => (
                      <th key={v.id} scope="col">
                        {columnLabel(v)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {found.map((p) => {
                    const slug = slugFor.get(p.key);
                    return (
                      <tr key={p.key}>
                        <th scope="row" className="font-bold">
                          {slug ? <Link href={`/${locale}/nuevo/politico/${slug}`}>{p.name}</Link> : p.name}
                        </th>
                        {votes.map((v) => {
                          const cast = p.ballots[v.id];
                          return (
                            <td key={v.id}>
                              {cast ? (
                                <>
                                  {BALLOT[cast.ballot] ?? "No votó"}
                                  <span className="n-meta block">{groupLabel(v.legislature, cast.group)}</span>
                                </>
                              ) : (
                                <span className="text-[var(--n-ink-3)]">No consta</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="n-source">
              Un nombre enlaza a su ficha solo cuando identifica a una sola persona. «No consta»: su
              nombre no figura en el acta de esa votación.
            </p>
          </>
        ))}
    </div>
  );
}
