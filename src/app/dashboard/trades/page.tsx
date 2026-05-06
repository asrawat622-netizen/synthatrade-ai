import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { TradesTable } from "@/components/dashboard/trades-table";

export default async function TradesPage() {
  const user = await requireUser();
  const [trades, tags] = await Promise.all([
    prisma.trade.findMany({
      where: { userId: user.id },
      include: { tradeTags: { include: { tag: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.tag.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
  ]);

  // Serialize Date to string for client component
  const serialized = trades.map((t) => ({
    ...t,
    date: t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">All Trades</h1>
        <p className="text-ink-300 text-sm">
          {trades.length} total · click any row for details
        </p>
      </div>
      <TradesTable trades={serialized as any} tags={tags} />
    </div>
  );
}
