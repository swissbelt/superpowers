# Benchmark Contract Services — Rate Sheet

An interactive pricing engine for a commercial cleaning contractor: build an
estimate on the left, watch labor, travel, supplies, insurance, background
check, eVA fee, overhead, and margin recalculate live on the right, then save
scenarios, log bid outcomes, and export professional quotes.

This app is self-contained and lives under `apps/benchmark-rate-sheet/` in
the `superpowers` repo. It is unrelated to the Claude Code skills/plugin in
the rest of the repo — treat it as an independent project with its own
`package.json`, dependencies, and build.

## Stack

React + TypeScript + Vite, Tailwind CSS v4, Recharts (charts), SheetJS/`xlsx`
(Excel export), `jspdf` + `jspdf-autotable` (PDF export), `pdfjs-dist` (PDF
text extraction for scope-of-work import). All estimate data, scenarios, bid
history, settings, and the productivity library persist to `localStorage`.

## Features

- **Estimator** — customer/contract/building info, cleaning frequency,
  square footage, labor rate, productivity, travel time, mileage, supplies,
  specialty services, insurance allocation, background checks, eVA fees,
  target margin, and price floor on the left; live cost breakdown, margin
  gauge, and recommended price on the right.
- **Scenarios** — save named estimates, compare them in a table and chart,
  reload one back into the estimator.
- **Bid History** — log won/lost/pending bids and see win rate, average
  margin, average price/sq ft, and revenue by customer.
- **Productivity Library** — editable sq ft/hour rates per building type
  that feed every future estimate.
- **Settings** — labor burden, workers' comp, payroll tax, insurance, fuel,
  mileage reimbursement, overhead, eVA fee cap, SWaM status, default margin.
- **Export** — Excel workbook, professional PDF quote, internal cost
  breakdown PDF, printable proposal summary, and settings/full-backup JSON
  import/export.
- **Scope of Work import** — upload a PDF (RFP/solicitation/SOW); the app
  extracts its text client-side and heuristically matches customer, agency,
  contract number/type, building name/address/type, square footage,
  frequency, term, and start date. Every match is shown with the exact text
  it was pulled from and a checkbox — nothing is written to the estimate
  until you review and apply it. This is plain text/regex matching, not an
  LLM call (the app has no backend), so it works best on text-based PDFs
  with reasonably conventional labeling and will find nothing useful on a
  scanned image without selectable text.
- Light/dark mode, responsive layout.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build     # type-check + production build
npm run lint      # oxlint
```

## Known trade-offs

- `xlsx` (SheetJS) has published advisories affecting its *parsing* path
  (prototype pollution / ReDoS). This app only uses it to *write* workbooks
  from in-memory data — no untrusted `.xlsx` files are ever parsed — so the
  affected code path is not exercised.
