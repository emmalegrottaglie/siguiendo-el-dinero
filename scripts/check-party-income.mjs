// Guards data/party-income-2020.json, the parties' ordinary income in 2020 as the Tribunal de
// Cuentas reports it (Informe nº 1.573, Anexos IV and V).
//
// Usage: npm run check:party-income
//
// Checks that every row sums to its printed total, that every column sums to the report's TOTAL
// row, that every NIF is one the party registry (lib/parties.ts) knows, and that each party's
// donations equal the figure lib/donations.ts already publishes from the same report's donations
// chart. The last check ties two independent transcriptions of one report together. Fails rather
// than warns.

import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync("data/party-income-2020.json", "utf8"));
const parties = readFileSync("lib/parties.ts", "utf8");
const donations = readFileSync("lib/donations.ts", "utf8");
const same = (a, b) => Math.abs(a - b) < 0.005;
const failures = [];

for (const side of ["public", "private"]) {
  const keys = Object.keys(data.totals[side]).filter((k) => k !== "total");
  for (const f of data.formations) {
    const row = f[side];
    const sum = keys.reduce((s, k) => s + row[k], 0);
    if (!same(sum, row.total))
      failures.push(
        `${f.label}: ${side} lines sum to ${sum.toFixed(2)}, total is ${row.total}`,
      );
  }
  for (const k of [...keys, "total"]) {
    const sum = data.formations.reduce((s, f) => s + f[side][k], 0);
    if (!same(sum, data.totals[side][k])) {
      failures.push(
        `${side}.${k}: formations sum to ${sum.toFixed(2)}, TOTAL row is ${data.totals[side][k]}`,
      );
    }
  }
}

for (const f of data.formations) {
  if (f.nif && !new RegExp(`\\b${f.nif}:`).test(parties))
    failures.push(`${f.label}: NIF ${f.nif} is not in lib/parties.ts`);
}

// Rows of DONATIONS_2020 as written in lib/donations.ts: an optional NIF, the label, and the
// total amount, which is the last "amount" on the line.
const donationRows = [
  ...donations.matchAll(
    /^\s*\{\s*(?:nif: "(\w+)", )?label: "([^"]+)".*amount: ([\d.]+) \} \},?$/gm,
  ),
];
if (donationRows.length === 0)
  failures.push("no DONATIONS_2020 rows found in lib/donations.ts");
for (const [, nif, label, amount] of donationRows) {
  const f = data.formations.find((x) =>
    nif ? x.nif === nif : x.label === label,
  );
  if (!f)
    failures.push(
      `donations row ${label} has no formation in the income table`,
    );
  else if (!same(f.private.donations, Number(amount))) {
    failures.push(
      `${label}: donations ${f.private.donations} here, ${amount} in lib/donations.ts`,
    );
  }
}
const grand = Number(donations.match(/grandTotal: ([\d.]+)/)?.[1]);
if (!same(grand, data.totals.private.donations)) {
  failures.push(
    `donations TOTAL ${data.totals.private.donations} here, grandTotal ${grand} in lib/donations.ts`,
  );
}

if (failures.length) {
  console.error(`check:party-income failed (${failures.length}):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(
  `check:party-income ok: ${data.formations.length} formations, ${donationRows.length} donation rows agree with lib/donations.ts`,
);
