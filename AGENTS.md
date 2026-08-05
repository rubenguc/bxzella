# AGENTS.md

Open-source, self-hosted crypto trading tracker. Connect BingX / Bitunix accounts, sync trades, analyze performance, and keep trading notebooks. React 19 SPA on TanStack Start (Vite 8 + Nitro SSR), Postgres via Drizzle, Better Auth, Paraglide i18n.

## Commands

- `bun run dev` — dev server on port **3000** (Vite + TanStack Start)
- `bun run generate-routes` — **required after adding/renaming/moving any file under `src/routes/`.** Regenerates `src/routeTree.gen.ts`
- `bunx tsc --noEmit` — typecheck. There is **no `typecheck` script**
- `bun run check` / `bun run lint` — Biome. `bunx biome check <file>` for one file
- `bun test` — Vitest (jsdom). **There are currently zero test files/suites in the repo**
- DB: `bun run db:generate` → `db:migrate` / `db:push`; `db:studio`. `vercel-build` runs `db:push` automatically
- Env lives in `.env`; schema validated at runtime in `src/env.ts` (`ENCRYPTION_KEY` min 32 chars, `GEMINI_API_KEY` required, `DATABASE_URL`)

## Generated files — never edit by hand

- `src/routeTree.gen.ts` — TanStack Router. Regenerate via `generate-routes`
- `src/paraglide/` — compiled i18n modules. Edit source `messages/*.json` instead
- `drizzle/` migrations are produced by `db:generate`

## Architecture & conventions

- **Routes are fullstack** (TanStack Start): `src/routes/**` files contain client UI and server handlers. API routes use the `apiHandler(...)` wrapper from `#/lib/api-error` and `authMiddleware`.
- **Features are feature-sliced**: each `src/features/<name>/` colocated owns `schema.ts` (Drizzle), `validation.ts` (zod), `repository.ts` (DB access), `service.ts` (client fetch), `server-actions.ts`, `components/`. Cross-feature DB logic belongs with the owning feature, not a shared file.
- **DB client** is `src/db/index.ts` (`drizzle(process.env.DATABASE_URL!)`) and aggregates all feature schemas — import this single `db`. `src/db.ts` is a separate Neon `getClient()` helper for raw queries; don't confuse the two.
- **Import aliases**: `#/*` and `@/*` both map to `./src/*`. The codebase prefers `#/`.
- **Exchange abstraction**: `src/features/exchange-providers/` defines a common interface with `bingx/` and `bitunix/` implementations; resolve at runtime via `get-provider.ts`. Provider-specific coin subsets live in `coins.ts`.

## Domain facts

- **Coins are centralized**: the canonical values are `COINS = ['VST','USDT','USDC'] as const` in `src/features/exchange-providers/types.ts`, with `type Coin` derived from it and `coinSchema` (zod) in `src/lib/zod-utils.ts`. Use these — never inline a `'USDT' | 'VST' | 'USDC'` union or `z.enum([...])` literal.
- **AI weekly analysis**: `src/features/ai-summary-subscriptions/ai-agent/` — `index.ts` (logic + zod output schema) and `prompts.ts` (system prompt, `VERSION`, `buildUserPrompt`). Runs via `chat()` + `geminiText` from `@tanstack/ai`, model from `env.GEMINI_MODEL`.

## Gotchas

- **Biome config enforces tabs + double quotes** (`biome.json`) but **many existing files use 2-space/single-quote and are non-conformant.** Match the surrounding file's style for small edits; do not reformat whole files unless asked.
- **`bunx tsc --noEmit` reports many pre-existing errors** (i18n message typing, unused vars, dashboard casts). Only fix or judge errors in code you actually touch — the baseline is dirty.
- **i18n**: UI strings compile to `m['key']()` from `#/paraglide/messages`. Add any new key to `messages/*.json`. Note: `messages/` currently has `en.json` + `es.json`, but `project.inlang/settings.json` declares locales `['en','de']` — reconcile before adding a locale.
- Do not commit `skills-lock.json` (personal agent-tooling artifact) unless explicitly asked.
- Conventional commits (`feat` / `fix` / `refactor` / `chore`) are used throughout; match that style.