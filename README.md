<p align="center">
  <img src="public/logo.png" width="120" height="120" alt="BXZella logo" />
</p>

# BXZella

An **open-source, self-hosted** crypto trading tracker. Connect your crypto exchange accounts, sync trades, analyze performance, and keep trading notebooks — all in one place, on your own infrastructure.

## Quick start

```bash
bun install       # install dependencies
cp .env.example .env   # then fill in DATABASE_URL and ENCRYPTION_KEY
bun run dev       # dev server on http://localhost:3000
```

> **Prerequisites:** Node.js / bun, and a PostgreSQL instance (local or cloud-hosted).

## Features

| Area | What you get |
|------|--------------|
| **Dashboard** | Net PnL, profit factor, win rate, avg win/loss, open positions, recent trades |
| **Daily PnL calendar** | Daily profit/loss with weekly summaries and monthly stats |
| **Trade history** | Entry/exit prices, leverage, PnL, and funding costs |
| **Notebooks** | Write and organize trading strategies and notes |
| **AI weekly analysis** | Auto-generated performance summaries for subscribed accounts |
| **Multi-account** | Multiple exchange accounts per coin |
| **Auth** | Email/password + username via Better Auth |
| **Theming & i18n** | Light/dark/system themes, multi-language |

## Supported exchanges

| Exchange | Coins   |
|----------|---------|
| Bitunix  | USDT    |
| BingX    | USDT, VST |

## Configuration

Copy `.env.example` to `.env` and set the required values. Required variables are marked **REQUIRED**; the rest are optional.

| Variable          | Required | Default                  | Description |
|-------------------|----------|--------------------------|-------------|
| `DATABASE_URL`    | **REQUIRED** | —                  | PostgreSQL connection string |
| `ENCRYPTION_KEY`  | **REQUIRED** | —                  | 32+ char secret for encrypting API keys |
| `BETTER_AUTH_URL` | —        | `http://localhost:3000`  | Better Auth callback URL |
| `SERVER_URL`      | —        | —                        | Public server URL |
| `LOG_LEVEL`       | —        | `info`                   | Log level (`debug`, `info`, `warn`, `error`) |
| `USDT_HOST`       | —        | `open-api.bingx.com`     | BingX USDT API host |
| `VST_HOST`        | —        | `open-api-vst.bingx.com` | BingX VST API host |
| `BITUNIX_HOST`    | —        | `fapi.bitunix.com`       | Bitunix API host |

## Tech stack

React 19 SPA on **TanStack Start** (Vite 8 + Nitro SSR), **PostgreSQL** via Drizzle, **Better Auth**, **Paraglide** i18n, deployed on Vercel.

## Next steps

- Open the app at `http://localhost:3000`, create an account, then add a BingX / Bitunix API key.
- See [`AGENTS.md`](./AGENTS.md) for repository conventions when contributing.