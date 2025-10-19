
<p align="center">
<img src="public/logo.png" width="120" heigth="120" />
<p align="center" style="color: #60A5FA; font-size: 4rem; font-weight: bold;">BXZella<p>

BXzella is a platform designed to help traders analyze their performance by integrating with the BingX API. It allows users to view their transaction history, open positions, and track key trading statistics to make informed decisions and improve their strategies.

## Features

- **User Authentication:** Secure user login and management powered by Clerk.
- **Account Management:** Add, edit, and delete your BingX accounts.
- **BingX Integration:** Connect securely using your API keys to fetch trading data.
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
- npm, yarn, or pnpm
- MongoDB instance (local or cloud-hosted)
- Clerk account (for authentication)

### Installation
1. Config environment variables:
```bash
# MongoDB Connection URI
MONGODB_URI=your_mongodb_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Encryption Secret (for API keys)
ENCRYPTION_SECRET=a_strong_random_secret_key_at_least_32_chars_long

# BingX API Hosts
VST_HOST=open-api-vst.bingx.com # Example host, verify with BingX documentation
USDT_HOST=open-api.bingx.com   # Example host, verify with BingX documentation

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

## Project Structure

The project follows a typical Next.js application structure with a focus on organizing code by features. Here's a simplified view of the core directories:

```
bxzella/
├── src/
│   ├── app/                  # Next.js App Router pages and API routes
│   │   ├── (dashboard)/      # Protected dashboard routes
│   │   │   ├── accounts/     # Accounts page
│   │   │   ├── layout.tsx    # Dashboard layout
│   │   │   ├── page.tsx      # Dashboard homepage
│   │   │   └── trades/       # Trades page
│   │   ├── api/              # API endpoints (accounts, statistics, trades)
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   ├── providers.tsx     # React Query provider
│   │   └── sign-in/          # Clerk sign-in page
│   ├── components/           # Reusable UI components
│   │   ├── layout/           # Layout components (header, sidebar)
│   │   ├── ui/               # Shadcn UI components
│   │   └── ...
│   ├── context/              # React contexts
│   ├── db/                   # Database connection setup (MongoDB)
│   ├── features/             # Feature-based organization
│   │   ├── <feature>/        # Logic for each feature
│   │   │   ├── components/   # UI components
│   │   │   ├── context/      # React contexts
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── interfaces/   # TS Interfaces
│   │   │   ├── model/        # Mongoose model
│   │   │   ├── schemas/      # Validation schemas
│   │   │   ├── server/       # Server-side logic
│   │   │   │   ├── actions/  # Server actions
│   │   │   │   └── db/       # Db queries
│   │   │   ├── services/     # Apis calls for tanstack Query
│   │   │   └── utils/     # Apis calls for tanstack Query
│   ├── hooks/                # Custom React hooks
│   ├── i18n/                 # Internationalization setup
│   ├── lib/                  # Utility functions
│   ├── store/                # Zustand store for user configuration
│   └── utils/                # General utility functions
├── messages/                 # Translation files
└── ...                       # Other configuration files (tailwind, tsconfig, etc.)
```

### Resouces
- [Template used](https://github.com/satnaing/shadcn-admin)
