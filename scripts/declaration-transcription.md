# Transcribing a Declaración de Bienes y Rentas

Instructions given to every reader that transcribes a deputy's asset declaration
(`data/_declaraciones/<code>.pdf`) for `npm run build:declarations`. Kept in the repository so the
method behind `data/declarations.json` can be read and repeated.

The records are published under each deputy's name, so exactness matters more than speed.

## Task

For each code you are given:

1. Read `C:\politician tracking app\data\_declaraciones\<code>.pdf` with the Read tool, pages
   "1-5". If the PDF has more than 5 pages, read the rest too.
2. Write `C:\politician tracking app\data\_transcriptions\<code>.<reading>.json`, where
   `<reading>` is the letter you were given ("a" for a first reading, "b" for a second). Use
   exactly this shape:

```json
{
  "reason": "toma",
  "income": [{ "group": "salary", "concept": "…", "amount": 62000.96 }],
  "irpf": 10080.66,
  "realEstate": [{ "kind": "urban", "description": "…", "location": "…", "acquired": "…", "title": "…" }],
  "deposits": [{ "description": "…", "amount": 177963 }],
  "otherAssets": [{ "kind": "securities", "description": "…", "amount": 853.17 }],
  "holdingsOver5pct": null,
  "vehicles": [{ "acquired": "2021", "description": "…" }],
  "loans": [{ "description": "…", "granted": "…", "amount": 150000, "pending": 140927 }],
  "otherDebts": null,
  "observations": null,
  "illegible": [],
  "notes": []
}
```

The allowed values are:

- `reason`: "toma", "cese", "otra" or null.
- `group`: "salary", "dividends", "interest" or "other".
- `kind` in `realEstate`: "urban", "rustic" or "company".
- `kind` in `otherAssets`: "securities" or "other".

## Where each part of the form goes

The form is identical for every deputy.

### Page 1

- **"RENTAS PERCIBIDAS POR EL PARLAMENTARIO"**: one `income` entry per filled row.
  - `group` comes from the left column:
    - "Percepciones netas de tipo salarial, sueldos, honorarios, aranceles…" is "salary";
    - "Dividendos y participación en beneficios…" is "dividends";
    - "Intereses o rendimientos de cuentas, depósitos y activos financieros" is "interest";
    - "OTRAS rentas o percepciones de cualquier clase" is "other".
  - `concept` is the CONCEPTO cell, and `amount` is the EUROS cell.
- **"CANTIDAD PAGADA POR IRPF"**: the box is `irpf`.

### Page 2

- **"BIENES PATRIMONIALES DEL PARLAMENTARIO"**: one `realEstate` entry per filled row.
  - `kind` follows the block:
    - "Bienes Inmuebles de naturaleza urbana" is "urban";
    - "…de naturaleza rústica" is "rustic";
    - "Bienes inmuebles propiedad de una sociedad…" is "company".
  - `description` is "Clase y características", and `location` is "Situación".
  - `acquired` is "Fecha de adquisición", exactly as written.
  - `title` is "Derecho sobre el bien y Título de adquisición".
- **"DEPÓSITOS EN CUENTAS CORRIENTES O DE AHORRO…"**: one `deposits` entry per filled row.
  `description` is the left cell, and `amount` is SALDO.

### Page 3

- **"OTROS BIENES O DERECHOS"**: this is the block for deuda pública, obligaciones and bonos, and
  for acciones y participaciones. Write one `otherAssets` entry per filled row, with `kind`
  "securities". `description` is the DESCRIPCIÓN cell, and `amount` is VALOR.
- **"Sociedades participadas en más de un 5%…"**: its free text is `holdingsOver5pct`, or null if
  blank.
- **"VEHÍCULOS, EMBARCACIONES Y AERONAVES"**: one `vehicles` entry per filled row.
- **"OTROS BIENES, RENTAS O DERECHOS DE CONTENIDO ECONÓMICO NO DECLARADOS EN APARTADOS
  ANTERIORES"**: one `otherAssets` entry per filled row, with `kind` "other".

### Page 4

- **"DEUDAS Y OBLIGACIONES PATRIMONIALES"**: one `loans` entry per filled loan row.
  - `description` is "PRESTAMOS (DESCRIPCIÓN Y ACREEDOR)".
  - `granted` is "FECHA CONCESIÓN", as written.
  - `amount` is "IMPORTE CONCEDIDO", and `pending` is "SALDO PENDIENTE".
- **"Otras deudas y obligaciones…"**: its free text is `otherDebts`.
  - When the deputy runs out of loan rows and continues the loan table in this box, with rows that
    give a description, a date, an amount granted and a pending balance like the table's own rows,
    transcribe each such row as a further `loans` entry, in order, and keep only the remaining
    text, if any, in `otherDebts`.
- **"OBSERVACIONES"**: this box, together with any text in the large unlabelled box on page 5, is
  `observations`. Join the two with "\n" if both have text.

### Page 5

- **"La presente declaración se realiza por"**: the ticked box is `reason`.
  - "Toma de posesión" is "toma", "Cese" is "cese", and "Otra causa" is "otra".
  - Use null if no box is ticked.

## Rules

- **Copy text exactly as typed.**
  - Keep the same words, spelling, capitalisation, abbreviations and accents, including evident
    typos.
  - Do not translate, expand, correct, summarise or reorder.
  - Join a cell's wrapped lines with a single space.
- **Amounts become JSON numbers.**
  - Spanish format uses "." for thousands and "," for decimals: "62.000,96" is 62000.96, "20.000"
    is 20000, "177.963" is 177963, "853,17" is 853.17, and "1.234.567" is 1234567.
  - Drop "€" or "euros".
  - Euro amounts never carry more than two decimals, so a comma followed by exactly three digits
    is a thousands separator, not a decimal mark: "71,000" is 71000, and "1,234,567" is 1234567.
  - An apostrophe is a decimal mark: "52.964'81" is 52964.81.
  - Read every digit carefully: a misplaced separator changes a value a thousandfold.
- **Empty amounts.** An empty amount cell is null. A written "0" is 0.
- **Rows and blocks.**
  - A row whose cells are all empty is not a row: skip it.
  - An empty block is `[]`, or null for the free-text fields.
  - Keep a row that has text in its first cell even if its other cells are empty, with null in
    those cells.
  - Keep a row whose amount is filled even if its first cell is empty, with null in that cell.
- **Never infer, compute or fill in** anything that is not written on the form.
  - If a cell is genuinely illegible, write null and add its path (for example `loans[0].pending`)
    to `illegible`.
  - Never guess a digit.
- **Note every amount not written in Spanish format**, such as a comma used for thousands or an
  apostrophe used for decimals. Transcribe it by the rules above, and add a note to `notes` that
  copies the cell exactly as written: `{ "path": "loans[1].pending", "written": "71,000" }`.
  - `path` names the amount, counting rows from 0: `irpf`, `income[i].amount`,
    `deposits[i].amount`, `otherAssets[i].amount`, `loans[i].amount` or `loans[i].pending`.
  - The page shows the written form beneath the figure, so copy it character for character.
  - If the rules above do not settle what a figure is, it is illegible: write null and list its
    path in `illegible`.
- **SALDO is one total.** The deposits block asks for a single balance covering every account
  (footnote 11 on the form). When several account lines share one figure, give the figure to the
  line it is printed beside and null to the others, without a note.
- **Leave out** the name, marital status, matrimonial regime, election and credential dates,
  signature, and place of signing.
- **Use only the scan.**
  - Do not look anything up elsewhere.
  - Do not read any other file in `data\_transcriptions`, and in particular never another reading
    of the same declaration: a second reading is only a check if it is independent.

## Reply

When every file is written, reply with one line per code and nothing else: either `<code> ok`, or
`<code> illegible: <paths>`.
