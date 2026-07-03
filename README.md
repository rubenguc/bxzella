
<p align="center">
<img src="public/logo.png" width="120" heigth="120" />
<p align="center" style="color: #60A5FA; font-size: 4rem; font-weight: bold;">BXZella<p>

BXzella is a platform designed to help traders analyze their performance by integrating with the BingX and Bitunix APIs. It allows users to view their transaction history, open positions, and track key trading statistics to make informed decisions and improve their strategies.

## Features

- **User Authentication:** Secure user login and management powered by Clerk.
- **Account Management:** Add, edit, and delete your trading accounts.
- **Exchange Integration:** Connect securely using your API keys to fetch trading data from BingX or Bitunix.
- **Dashboard:**
    - View key statistics like Net PNL, Profit Factor, Trade Win Percentage, and Average Win/Lossxw ratio.
    - See your current open positions at a glance.
    - Display a list of your most recent closed trades.
- **Trades Overview:** A dedicated page to view your complete trade history with details on open/close times, symbols, positions, leverage, and PNL.
- **Notebooks:** Create, edit, and share trading strategies and notes.
- **Playbooks:** Organize and share trading playbooks with detailed strategies and notes.
- **Theming:** Switch between light, dark, and system themes.
- **Internationalization:** Support for multiple languages (currently English based on `i18n` config).

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, pnpm, or bun
- PostgreSQL instance (local or cloud-hosted)

### Installation
1. Config environment variables:
```bash
# Encryption Secret (for API keys)
ENCRYPTION_SECRET=a_strong_random_secret_key_at_least_32_chars_long
DATABASE_URL=your_db_url
```
2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun installl
```
3. Start server
```bash
npm run dev
# or
yarn run dev
# or
pnpm run dev
# or
bun run dev
```
