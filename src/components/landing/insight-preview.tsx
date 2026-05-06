import { TrendingUp, TrendingDown, AlertCircle, Target } from "lucide-react";

const examples = [
  {
    icon: TrendingUp,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    label: "EDGE FOUND",
    text: "When you enter with SMT + External DOL, you have an 85% win rate averaging 38 points per trade.",
  },
  {
    icon: AlertCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    label: "WEAKNESS",
    text: "Your worst day is Friday after 12 PM. You're -$1,840 across 14 trades with a 28% win rate.",
  },
  {
    icon: TrendingDown,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    label: "TILT PATTERN",
    text: "After 2 consecutive losses, your win rate drops by 40%. Consider stepping away after back-to-back losers.",
  },
  {
    icon: Target,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    label: "BEST SESSION",
    text: "Your best session is NY Open with a 71% win rate and 2.8R average. Trade more of these.",
  },
];

export function InsightPreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {examples.map((e, i) => (
        <div
          key={i}
          className={`card ${e.border} ${e.bg} hover:scale-[1.01] transition`}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg ${e.bg} ${e.border} border flex items-center justify-center flex-shrink-0`}>
              <e.icon className={`w-5 h-5 ${e.color}`} />
            </div>
            <div>
              <div className={`text-[10px] font-bold tracking-wider mb-1 ${e.color}`}>
                {e.label}
              </div>
              <p className="text-sm text-ink-100 leading-relaxed">{e.text}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
