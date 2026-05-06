import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import JournalForm from "@/components/dashboard/journal-form";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login");
  }

  const entries = await prisma.dailyJournal.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 30,
  });

  const serialized = entries.map((e) => ({
    id: e.id,
    date: e.date.toISOString(),
    sleepHours: e.sleepHours,
    stressLevel: e.stressLevel,
    focusLevel: e.focusLevel,
    notes: e.notes,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Daily journal</h1>
        <p className="text-sm text-ink-400 mt-1">
          Log how you're feeling each day. Sleep, stress, and focus correlate
          with performance more than most traders realize.
        </p>
      </div>
      <JournalForm initialEntries={serialized} />
    </div>
  );
}
