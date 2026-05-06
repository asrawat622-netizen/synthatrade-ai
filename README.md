# SynthaTrade AI

> **Discover Your Trading Edge.**
> AI-powered trading journal for discretionary and prop firm traders.

SynthaTrade AI is a full-stack web application that lets traders log every trade, then analyzes the data to surface what's actually working — strategy combinations, time-of-day patterns, tilt detection, and prop firm rule tracking. An LLM-powered coach reads your full history and writes you specific, actionable feedback.

This is a **fully functional production-grade Next.js website**, not a prototype. Every feature listed below is wired to a real PostgreSQL database, real auth, and real analytics.

---

## ✨ Features

### Trade logging & management
- **Add Trade form** with auto-calculation of PnL (points + dollars), R-multiple, risk/reward, and Win/Loss/BE result based on entry/exit/stop
- **Live calc preview** updates as you type so you see the trade's stats before saving
- **Multi-tag system** with custom strategy tags (SMT, External DOL, FVG, Order Block, etc. seeded by default)
- **Inline tag creation** without leaving the form
- **Sortable / filterable trades table** — filter by date range, session, instrument, and any combination of tags
- **Trade detail page** with edit-in-place notes, post-trade emotion tracking, rule break flag, and delete

### Analytics engine
Every metric is computed from your real trade data:
- Win rate, avg win, avg loss, expectancy, profit factor, total PnL, total points
- Biggest win / biggest loss
- Max win streak / max loss streak
- Average R-multiple
- Rule break rate
- **Equity curve** (Recharts area chart)
- **PnL distribution** by bucket
- **PnL by day of week** (drops weekends if no activity)
- **PnL by session** (Asia, London, NY Open, NY Lunch, NY PM)
- **PnL by hour of day**
- **Tag performance table** — every tag's WR, avg PnL, total PnL
- **Tag combination analysis** — finds 2-to-4-tag combos with ≥3 trades, ranks best & worst
- **After-loss analysis** — how your win rate changes after 0, 1, 2, 3+ consecutive losses (early tilt detection)

### AI Insights
- Generates a coach-style breakdown: summary, strengths, weaknesses, best setups, worst setups, best time windows, common mistakes, psychology patterns, action items
- Calls **OpenAI** (default `gpt-4o-mini`) with your aggregated stats
- **Heuristic fallback** — if no API key is set, the page builds insights directly from your stats so the feature never returns empty
- "Regenerate" button to refresh anytime

### Prop Firm Mode
- Toggle on Prop Firm Mode in Settings to track:
  - Account size
  - Daily drawdown limit
  - Max drawdown limit
  - Profit target
- Dashboard shows live progress bars with **80% warning** and **100% critical alerts** for each rule

### Daily Journal
- Track sleep hours, stress level (1-10), focus level (1-10), and free-form notes per day
- Upserts on date — one entry per day
- 30-day history view

### Account & Settings
- Profile, preferred instruments, prop firm rules, tag management
- Export all trades as CSV
- Delete account (cascades to all trades, tags, and journals)

### Marketing site
- Public landing page at `/` with hero, features, AI insights preview, pricing tiers (Free / Pro / Elite), and email waitlist
- Fully responsive

---

## 🛠 Tech stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 App Router, React 18, TypeScript, Tailwind CSS |
| Backend | Next.js API routes (REST), Server Components |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth (credentials provider, JWT sessions, Prisma adapter) |
| Charts | Recharts |
| AI | OpenAI SDK (`gpt-4o-mini` default, configurable) |
| Validation | Zod |
| UI | lucide-react icons, react-hot-toast |

---

## 🚀 Getting started

### Prerequisites
- **Node.js 18+**
- **PostgreSQL 14+** running locally (or any Postgres connection string)
- An **OpenAI API key** — *optional;* the app falls back to heuristic insights without it

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Postgres connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/synthatrade"

# A long random string — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional — leave blank to use heuristic-only insights
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"
```

### 3. Initialize the database

```bash
npx prisma migrate dev --name init
```

This creates all tables (User, Trade, Tag, TradeTag, DailyJournal, plus NextAuth's Account/Session/VerificationToken).

### 4. Seed demo data (recommended)

```bash
npm run db:seed
```

This creates a demo user with ~120 randomized trades spread across 90 days, 13 default tags, and 30 daily journal entries — enough to see analytics, tag combos, and AI insights light up immediately.

**Demo login:**
- Email: `demo@synthatrade.ai`
- Password: `demo1234`

### 5. Run the dev server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

You can either:
- Sign in with the demo account above
- Sign up at `/signup` to create a fresh account (which is seeded with 9 default tags but no trades)

---

## 📁 Project structure

```
synthatrade-ai/
├── prisma/
│   ├── schema.prisma           # Full DB schema
│   └── seed.ts                 # Demo user + ~120 randomized trades
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/          # Sign in page
│   │   │   └── signup/         # Sign up page
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   │   ├── auth/register/        # POST — new user
│   │   │   ├── trades/               # GET (with filters) + POST
│   │   │   ├── trades/[id]/          # GET / PATCH / DELETE
│   │   │   ├── tags/                 # GET / POST / DELETE
│   │   │   ├── analytics/            # GET — full analytics bundle
│   │   │   ├── ai-insights/          # POST — OpenAI or heuristic
│   │   │   ├── settings/             # GET / PATCH / DELETE
│   │   │   ├── export/               # GET — trades.csv
│   │   │   └── journal/              # GET / POST (upsert)
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Overview / home
│   │   │   ├── layout.tsx            # Sidebar + topbar shell
│   │   │   ├── trades/
│   │   │   │   ├── page.tsx          # Trades table
│   │   │   │   ├── new/page.tsx      # Add trade form
│   │   │   │   └── [id]/page.tsx     # Trade detail
│   │   │   ├── analytics/page.tsx    # Full analytics
│   │   │   ├── insights/page.tsx     # AI Insights
│   │   │   ├── journal/page.tsx      # Daily journal
│   │   │   └── settings/page.tsx     # Settings
│   │   ├── page.tsx                  # Landing / marketing site
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Tailwind + custom utilities
│   ├── components/
│   │   ├── charts/                   # Recharts components
│   │   ├── dashboard/                # Sidebar, topbar, forms, tables
│   │   ├── landing/                  # Hero subcomponents
│   │   └── ui/                       # Reusable primitives (StatCard)
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma singleton
│   │   ├── auth.ts                   # NextAuth config
│   │   ├── session.ts                # Server-side auth helpers
│   │   ├── analytics.ts              # ★ All analytics — pure functions
│   │   ├── openai.ts                 # OpenAI client wrapper
│   │   └── utils.ts                  # cn(), formatters
│   └── types/
│       └── next-auth.d.ts            # Session type augmentation
├── .env.example
├── tailwind.config.ts
├── next.config.js
└── package.json
```

The **`src/lib/analytics.ts`** file is the heart of this app — every metric, equity curve point, tag-combination, and after-loss bucket is computed there as a pure function over a list of trades. This makes it trivial to test, reuse, and reason about.

---

## 🧠 How the AI insights work

1. The `/api/ai-insights` endpoint pulls every trade for the user, runs the analytics suite, and produces a compact JSON payload of stats.
2. If `OPENAI_API_KEY` is configured (and not the placeholder), the payload is sent to OpenAI with a coach-style system prompt instructing it to return strict JSON with `summary`, `strengths`, `weaknesses`, `bestSetups`, `worstSetups`, `bestTimeWindows`, `commonMistakes`, `psychologyPatterns`, and `actionItems`.
3. If the API key is missing, an **identical-shape** payload is built deterministically from the stats (so the page never breaks). Strengths, weaknesses, action items, etc. all populate from real numbers like profit factor, win rate, best/worst session, top tag combos, and after-loss win rate degradation.

---

## 📊 Database schema overview

- **User** — with `preferredInstruments[]`, `propFirmMode`, `accountSize`, `dailyDrawdownLimit`, `maxDrawdownLimit`, `profitTarget`, `plan`
- **Trade** — date, instrument, direction, prices, position size, computed PnL, R-multiple, RR, session, timeframe, notes, emotion ratings, ruleBreak flag
- **Tag** — per-user (unique per `[userId, name]`)
- **TradeTag** — many-to-many between Trade and Tag
- **DailyJournal** — sleep, stress, focus, notes (one entry per user per day)

Plus the standard NextAuth tables (`Account`, `Session`, `VerificationToken`).

---

## 💡 Useful scripts

```bash
npm run dev          # Dev server with hot reload
npm run build        # Production build
npm start            # Start production server
npm run db:migrate   # Run Prisma migrations
npm run db:push      # Push schema changes without migration
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio (DB GUI)
```

---

## 🧪 Tips when exploring

- After seeding, log in as the demo user and visit **AI Insights** → click **Generate insights**. You'll see real coach-style feedback within seconds.
- Visit **Analytics** to see the equity curve, the PnL-by-day chart, and the **Top combinations** panel — that's the headline feature ("SMT + External DOL = 85% WR").
- Toggle **Prop Firm Mode** in Settings to see the dashboard's drawdown progress bars come alive.
- Use the **Add Trade** form's live calc banner — type entry/exit prices and watch the PnL/R/RR update in real time.

---

## 📄 License

MIT — do whatever you want, just don't claim you wrote it from scratch.

---

Built with ❤️ for traders who want to know *why* they win.
