# AGENTS.md

Repo conventions for agent sessions in **BXZella** — an open-source, self-hosted crypto trading tracker (BingX / Bitunix sync, trading analytics, notebooks). React 19 SPA on **TanStack Start** (Vite 8 + Nitro SSR), **Postgres** via Drizzle, Better Auth, Paraglide i18n.

**The takeaway:** everything is feature-sliced under `src/features/`, commands run with **bun**, and three generated files live there too.

## Quick path — common edits

1. Edit code in `src/features/<name>/` or `src/routes/**` (server handler + client UI colocated).
2. After adding/renaming/moving a route, run `bun run generate-routes`.
3. Add new UI strings to `messages/*.json`, then use `m['key']()`.
4. Verify only the code you touched — the repo has a dirty baseline.

## Commands

| Task | Command | Note |
|------|---------|------|
| Dev server | `bun run dev` | Port **3000** |
| Regenerate routes | `bun run generate-routes` | **Required** after any file change under `src/routes/` — regenerates `src/routeTree.gen.ts` |
| Typecheck | `bunx tsc --noEmit` | No `typecheck` script exists |
| Lint / check | `bun run check` / `bun run lint` | Per-file: `bunx biome check <file>` |
| Tests | `bun test` | Vitest (jsdom); **zero test files/suites exist** |
| DB migrate | `bun run db:generate` → `db:migrate` / `db:push` | Studio: `db:studio`; `vercel-build` runs `db:push` |

Env lives in `.env`, validated at runtime in `src/env.ts` (`ENCRYPTION_KEY` ≥ 32 chars, `GEMINI_API_KEY` required, `DATABASE_URL`).

## Generated files — do not edit by hand

| File | Regenerate via |
|------|----------------|
| `src/routeTree.gen.ts` | `bun run generate-routes` |
| `src/paraglide/` | edit `messages/*.json` instead |
| `drizzle/` migrations | `bun run db:generate` |

## Architecture

- **Routes are fullstack** (TanStack Start): `src/routes/**` files hold client UI + server handlers. API routes use `apiHandler(...)` from `#/lib/api-error` and `authMiddleware`.
- **Features are feature-sliced**: each `src/features/<name>/` owns `schema.ts`, `validation.ts`, `repository.ts`, `service.ts`, `server-actions.ts`, `components/`. Cross-feature DB logic belongs with the owning feature.
- **DB client**: import the single `db` from `src/db/index.ts` (aggregates all feature schemas). `src/db.ts` is a separate Neon `getClient()` helper for raw queries — don't confuse them.
- **Import aliases**: `#/*` and `@/*` both → `./src/*`. Prefer `#/`.
- **Exchange abstraction**: `src/features/exchange-providers/` has a shared interface with `bingx/` + `bitunix/` implementations, resolved at runtime via `get-provider.ts`. Provider-specific coin subsets live in `coins.ts`.
- **AI weekly analysis**: `src/features/ai-summary-subscriptions/ai-agent/` — `index.ts` (logic + zod output schema), `prompts.ts` (system prompt, `VERSION`, `buildUserPrompt`). Runs via `chat()` + `geminiText` from `@tanstack/ai`.

## Rules that will save you

- **Coins are centralized**: `COINS = ['VST','USDT','USDC'] as const` in `src/features/exchange-providers/types.ts`, `type Coin` derived from it, `coinSchema` in `src/lib/zod-utils.ts`. Never inline the union or a `z.enum([...])` literal.
- **Biome wants tabs + double quotes**, but many files use 2-space/single-quote and are non-conformant. For small edits, match the surrounding file; don't reformat whole files unless asked.
- **`bunx tsc --noEmit` is dirty by default** (i18n message typing, unused vars, dashboard casts). Fix or judge only errors in code you touch.
- **i18n**: `messages/` has `en.json` + `es.json`, but `project.inlang/settings.json` declares locales `['en','de']` — reconcile before adding a locale.
- Don't commit `skills-lock.json` (personal agent-tooling artifact) unless asked.
- Commits are conventional (`feat` / `fix` / `refactor` / `chore`).