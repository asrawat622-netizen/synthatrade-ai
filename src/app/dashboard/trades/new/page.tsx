import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { AddTradeForm } from "@/components/dashboard/add-trade-form";

export default async function AddTradePage() {
  const user = await requireUser();
  const tags = await prisma.tag.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Log a Trade</h1>
        <p className="text-ink-300 text-sm">PnL, R-multiple, and risk/reward auto-calculated.</p>
      </div>
      <AddTradeForm tags={tags} preferredInstruments={user.preferredInstruments} />
    </div>
  );
}
