import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  trend,
  icon: Icon,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  const trendClass =
    trend === "up"
      ? "text-teal-400"
      : trend === "down"
      ? "text-red-400"
      : "text-ink-300";

  return (
    <div className={cn("stat-card", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wide text-ink-300 font-medium">
          {label}
        </span>
        {Icon && <Icon className="w-4 h-4 text-ink-400" />}
      </div>
      <div className={cn("text-2xl font-bold", trendClass)}>{value}</div>
      {hint && <div className="text-xs text-ink-400 mt-1">{hint}</div>}
    </div>
  );
}
