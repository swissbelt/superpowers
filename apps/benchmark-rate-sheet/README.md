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
(Excel export), `jspdf` + `jspdf-autotable` (PDF export), `pdfjs-dist` +
`mammoth` (PDF/DOCX text extraction for scope-of-work import). All estimate
data, scenarios, bid history, settings, and the productivity library persist
to `localStorage`.

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
- **Scope of Work import** — upload a PDF, DOCX, or TXT (RFP/solicitation/
  SOW); text is extracted entirely client-side and matched against two
  tiers of fields:
  - *Fields to apply* — customer/contact info, agency, contract number/type,
    building name/address/type, square footage, floors, frequency, term,
    start date, required employee count, supplies provider (government vs.
    contractor), and detected specialty services (carpet, floor care,
    pressure washing, etc. with their stated frequency). Each has a
    confidence badge (green = clearly labeled, yellow = please confirm) and
    a checkbox — nothing is written to the estimate until you review and
    click **Generate Bid Estimate**.
  - *Detected requirements & context* — solicitation number, period of
    performance, bid due date, staffing/certifications, background
    check/security clearance/insurance/bond requirements, scope task
    checklist. Shown for awareness only, never auto-applied to pricing.

  Generating an estimate also auto-saves it as an "AI Recommended" scenario
  (Scenarios tab) so later manual adjustments can be compared against the
  as-imported numbers, and populates two cards in the Estimator: a plain-
  language **Job Summary** (what the job actually involves — building,
  frequency, specialty services with their detected frequency, supplies
  responsibility, staffing, contract type/term, plus any scope/staffing/
  hours context from the import) and a **Bid Analysis Summary** (labor
  hours/week, monthly cost, recommended bid, margin, risk factors). The Job
  Summary is always available (built from the current inputs, whether from
  an import or manual entry) and its scope-of-service content is also
  folded into the Professional PDF Quote; the Bid Analysis Summary's risk
  factors are folded into the Internal Cost Breakdown PDF.

  This is plain text/regex matching, not an LLM call (the app has no
  backend and needs none — there's nothing to call out to), so it works
  best on text-based documents with reasonably conventional labeling and
  will find nothing useful on a scanned image without selectable text.
- **Pricing insights** — Bid History now tracks building type per bid and
  surfaces descriptive stats (not a prediction/ML model) per building type:
  win rate, average realized margin, and won price/sq ft range. The
  Estimator shows a live comparison when your current building type has won
  history to compare against.
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
