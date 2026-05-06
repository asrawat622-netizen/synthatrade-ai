import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import SettingsForm from "@/components/dashboard/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login");
  }

  const [fullUser, tags] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id } }),
    prisma.tag.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!fullUser) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-ink-400 mt-1">
          Configure your account, prop firm rules, tags, and data.
        </p>
      </div>
      <SettingsForm
        user={{
          id: fullUser.id,
          name: fullUser.name,
          email: fullUser.email,
          preferredInstruments: fullUser.preferredInstruments,
          propFirmMode: fullUser.propFirmMode,
          accountSize: fullUser.accountSize,
          dailyDrawdownLimit: fullUser.dailyDrawdownLimit,
          maxDrawdownLimit: fullUser.maxDrawdownLimit,
          profitTarget: fullUser.profitTarget,
          plan: fullUser.plan,
        }}
        initialTags={tags.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}
