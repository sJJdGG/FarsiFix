# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains all application code.
- `src/App.tsx` wires the UI, worker, and download flow.
- `src/components/` holds UI components (PascalCase files).
- `src/content/` stores UI copy/data (`status.ts`, `features.ts`).
- `src/hooks/` contains reusable UI logic (e.g., `useExcelWorker.ts`, `useFarsiFix.ts`, `useTheme.ts`).
- `src/lib/` contains pure logic (e.g., `persianNormalizer.ts`, `xmlTextNormalizer.ts`).
- `src/workers/` contains worker code (`excel.worker.ts`) and testable core logic (`excelCore.ts`).
- `e2e/` holds Playwright specs (`*.spec.ts`).
- `fixtures/` includes `farsifix-fixture.xlsx` for manual smoke tests and e2e coverage.
- `public/` contains static assets (e.g., `favicon.svg`).
- `scripts/` includes local tooling such as `view.mjs` (headed Playwright view).

## Build, Test, and Development Commands
- `npm run dev`: Start Vite dev server.
- `npm run view`: Open headed Playwright session pointing at the dev server.
- `npm run build`: Typecheck and build production assets.
- `npm run typecheck`: Strict TypeScript check only.
- `npm run test`: Run unit tests (Vitest) in `src/**/*.test.ts`.
- `npm run e2e`: Run Playwright end-to-end tests.
- `npm run lint`: Biome lint/format checks.
- `npm run lint:ox`: Oxlint type-aware checks.
- `npm run lint:all`: Run both Biome and Oxlint.
- `npm run check:theme`: Validate built CSS uses class-based dark mode (no prefers-color-scheme).

## Verification Policy (Risk-Based Mandatory)
Use a two-stage verification flow that scales with change risk. Do not run the full suite by default for trivial edits.

### 1) In-Task Checkpoints (Mandatory)
Run targeted checks immediately after meaningful changes (do not wait until the end):
- Run `npm run test` after logic/rule changes (normalizer, XML processing, worker logic).
- Run the relevant Playwright spec(s) after UI/download-flow/Excel-output changes.
- If a checkpoint fails, fix first, then continue.

### 2) Pre-Handoff Gate (Mandatory, Smart Selection)
Pick one gate level based on scope:

- **Level A — Docs/text-only or non-runtime edits** (`README`, comments, copy-only content):
  - No mandatory command gate.
  - If unsure, run `npm run lint`.

- **Level B — Scoped code changes with clear blast radius** (single component/hook/lib, no global behavior shift):
  - `npm run lint:all`
  - `npm run build`
  - Plus targeted tests for touched behavior (`npm run test` and/or specific `npm run e2e` specs).

- **Level C — High-risk or cross-cutting changes** (worker/contracts, Excel/XML processing, shared state flow, routing, global CSS/theme system, dependency/tooling upgrades, CI/perf scripts):
  - `npm run lint:all`
  - `npm run build`
  - `npm run test`
  - `npm run e2e`
  - `npm run check:theme`

When in doubt between levels, choose the higher level.

## Coding Style & Naming Conventions
- TypeScript strict mode; prefer explicit types at boundaries (worker APIs, helpers).
- Indentation: 2 spaces; format with Biome (`biome.json`).
- Components: PascalCase names and files (e.g., `FileDropZone.tsx`).
- Functions/variables: camelCase.
- Tests: unit tests `*.test.ts`, e2e tests `*.spec.ts`.
- Avoid DOM parsing for Excel XML; use regex-based string surgery in `xmlTextNormalizer.ts`.

## Testing Guidelines
- Unit tests use Vitest; keep tests close to logic.
- Worker logic is tested via `src/workers/excelCore.test.ts`.
- E2E tests use Playwright, asserting download filename and contents (including XML entity preservation).
- `fixtures/farsifix-fixture.xlsx` is used in e2e tests and for manual Excel validation.
- Add tests when modifying normalization rules or XML processing.

## Manual Smoke Checklist (Excel)
- Upload `fixtures/farsifix-fixture.xlsx` and open the output in Excel.
- Verify Persian normalization in sheet1 (e.g., Arabic yeh/kaf, ZWNJ, digits).
- Verify inline strings in sheet2 are normalized and `&amp;`/`&lt;`/`&gt;` remain encoded.
- Confirm formulas still exist (`SUM`, `CONCAT`, `IF`) and that formatting (bold headers, date) is intact.

## Commit & Pull Request Guidelines
- Commit history is lightweight; recent commits use `feat:` prefixes but it is not enforced.
- Use short, descriptive commit messages (e.g., `feat: add worker cancel support`).
- PRs should include a brief summary, test commands run, and screenshots for UI changes.

## Configuration & Security Notes
- `.env` supports `VITE_MAX_FILE_SIZE_MB` for upload limits.
- All processing is client-side; do not introduce server-side data transfer.
- Keep XML entities encoded; never decode and re-encode XML text.
- See `XML_INVARIANTS.md` for the full XML rules and guardrails.

## Operator Notes (Learned)
- Tailwind v4 dark variant defaults to `@media (prefers-color-scheme: dark)`; if class-based theming is required, define `@custom-variant dark` in `src/index.css` to avoid mixed system/manual behavior.
- When visual verification is requested, run `npm run dev` inside `tmux` and use the Playwright skill to capture `output/playwright/*` screenshots for light/dark checks.
- When asked to validate setup against docs, browse the official Tailwind/Vite installation docs before changing configuration.
