
<p align="center">
<img src="public/logo.png" width="120" heigth="120" />
<p align="center" style="color: #60A5FA; font-size: 4rem; font-weight: bold;">BXZella<p>

BXZella is an **open-source** self-hosted platform that connects to your crypto exchange accounts and helps you track, analyze, and improve your trading performance. Sync your trades directly from the exchange, monitor key statistics, and keep your trading notes organized — all in one place.

## Features

- **Multi-Exchange Support:** Connect BingX and Bitunix accounts via API keys.
- **Dashboard:** Net PnL, Profit Factor, Win Rate, Avg Win/Loss, open positions, and recent trades at a glance.
- **Daily PnL Calendar:** Visual calendar with daily profit/loss, weekly summaries, and monthly stats.
- **Trade History:** Full trade history with entry/exit prices, leverage, PnL, and funding costs.
- **Notebooks:** Write and organize trading strategies and notes.
- **Multi-Account:** Manage multiple exchange accounts per coin.
- **Authentication:** Email/password + username via Better Auth.
- **Theming & i18n:** Light/dark/system themes and multi-language support.

## Supported Exchanges

| Exchange | Coins        |
| -------- | ------------ |
| Bitunix  | USDT         |
| BingX    | USDT, VST    |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm / yarn / pnpm / bun
- PostgreSQL instance (local or cloud-hosted)

### Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable           | Required | Default                    | Description                            |
| ------------------ | -------- | -------------------------- | -------------------------------------- |
| `DATABASE_URL`     | ✅       | —                          | PostgreSQL connection string           |
| `ENCRYPTION_KEY`   | ✅       | —                          | 32+ char secret for encrypting API keys |
| `BETTER_AUTH_URL`  | —        | `http://localhost:3000`    | Better Auth callback URL               |
| `SERVER_URL`       | —        | —                          | Public server URL                      |
| `LOG_LEVEL`        | —        | `info`                     | Log level (`debug`, `info`, `warn`, `error`) |
| `USDT_HOST`        | —        | `open-api.bingx.com`       | BingX USDT API host                    |
| `VST_HOST`         | —        | `open-api-vst.bingx.com`   | BingX VST API host                     |
| `BITUNIX_HOST`     | —        | `fapi.bitunix.com`         | Bitunix API host                       |

### Installation

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```
