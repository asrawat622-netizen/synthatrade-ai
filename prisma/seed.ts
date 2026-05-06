import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_TAGS = [
  "SMT",
  "External DOL",
  "Internal DOL",
  "FVG",
  "Liquidity Sweep",
  "Breaker",
  "MSS",
  "Order Block",
  "BPR",
  "Equal Highs",
  "Equal Lows",
  "Silver Bullet",
  "Power of 3",
];

const SESSIONS = ["Asia", "London", "NY Open", "NY Lunch", "NY PM"];
const INSTRUMENTS = ["NQ", "ES", "YM", "EURUSD", "GBPUSD"];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("🌱 Seeding database…");

  // Demo user
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@synthatrade.ai" },
    update: {},
    create: {
      email: "demo@synthatrade.ai",
      name: "Demo Trader",
      passwordHash,
      preferredInstruments: ["NQ", "ES"],
      propFirmMode: true,
      accountSize: 50000,
      dailyDrawdownLimit: 1000,
      maxDrawdownLimit: 2500,
      profitTarget: 3000,
      plan: "pro",
    },
  });

  // Tags
  const tags = await Promise.all(
    DEFAULT_TAGS.map((name) =>
      prisma.tag.upsert({
        where: { userId_name: { userId: user.id, name } },
        update: {},
        create: { name, userId: user.id },
      })
    )
  );

  // Wipe existing trades for re-seed
  await prisma.tradeTag.deleteMany({ where: { trade: { userId: user.id } } });
  await prisma.trade.deleteMany({ where: { userId: user.id } });

  // Generate ~120 trades over the past 90 days
  const now = new Date();
  for (let i = 0; i < 120; i++) {
    const daysAgo = Math.floor(rand(0, 90));
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(rand(7, 16)), Math.floor(rand(0, 59)), 0, 0);

    const instrument = pick(INSTRUMENTS);
    const direction = pick(["Long", "Short"]);
    const session = pick(SESSIONS);

    // Weighted win probability based on certain tags & sessions
    let winProb = 0.5;
    const numTags = Math.floor(rand(1, 4));
    const tradeTagSet = new Set<string>();
    while (tradeTagSet.size < numTags) {
      tradeTagSet.add(pick(tags).id);
    }
    const tradeTagIds = [...tradeTagSet];
    const tradeTagNames = tags
      .filter((t) => tradeTagIds.includes(t.id))
      .map((t) => t.name);

    if (tradeTagNames.includes("SMT") && tradeTagNames.includes("External DOL")) winProb = 0.85;
    if (tradeTagNames.includes("Silver Bullet")) winProb += 0.1;
    if (session === "NY Open") winProb += 0.05;
    if (session === "NY Lunch") winProb -= 0.15;
    winProb = Math.max(0.1, Math.min(0.95, winProb));

    const isWin = Math.random() < winProb;
    const points = isWin ? rand(8, 50) : -rand(5, 25);
    const tickValue = instrument === "NQ" ? 5 : instrument === "ES" ? 12.5 : 10;
    const size = Math.floor(rand(1, 4));
    const pnlDollars = points * tickValue * size;

    const entryPrice = rand(15000, 18000);
    const exitPrice = direction === "Long" ? entryPrice + points : entryPrice - points;
    const stopLoss = direction === "Long" ? entryPrice - rand(10, 20) : entryPrice + rand(10, 20);
    const takeProfit = direction === "Long" ? entryPrice + rand(20, 60) : entryPrice - rand(20, 60);

    const result = points === 0 ? "BE" : isWin ? "Win" : "Loss";
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(exitPrice - entryPrice);
    const rMultiple = isWin ? reward / risk : -1;

    const trade = await prisma.trade.create({
      data: {
        userId: user.id,
        date,
        instrument,
        direction,
        entryPrice,
        exitPrice,
        stopLoss,
        takeProfit,
        positionSize: size,
        pnlPoints: points,
        pnlDollars,
        result,
        session,
        timeframe: pick(["1m", "5m", "15m", "1h"]),
        notes: isWin
          ? "Clean entry, followed plan."
          : Math.random() > 0.5
          ? "Got chopped, exited early."
          : "Entered too early, no confirmation.",
        emotionBefore: Math.floor(rand(4, 9)),
        emotionAfter: isWin ? Math.floor(rand(6, 10)) : Math.floor(rand(2, 6)),
        confidence: Math.floor(rand(5, 10)),
        ruleBreak: !isWin && Math.random() < 0.2,
        riskReward: reward / risk,
        rMultiple,
      },
    });

    await prisma.tradeTag.createMany({
      data: tradeTagIds.map((tagId) => ({ tradeId: trade.id, tagId })),
      skipDuplicates: true,
    });
  }

  // Some daily journals
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    await prisma.dailyJournal.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: {},
      create: {
        userId: user.id,
        date,
        sleepHours: rand(5, 9),
        stressLevel: Math.floor(rand(2, 9)),
        focusLevel: Math.floor(rand(4, 10)),
        notes: i % 3 === 0 ? "Felt sharp today, traded my A+ setups only." : null,
      },
    });
  }

  console.log("✅ Seed complete.");
  console.log("→ Login: demo@synthatrade.ai / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
