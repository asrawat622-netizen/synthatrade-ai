"use client";

import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Target,
  XCircle,
  Clock,
  Brain,
  CheckCircle2,
  Loader2,
  Wand2,
} from "lucide-react";
import toast from "react-hot-toast";

type Insights = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  bestSetups: { name: string; stat: string }[];
  worstSetups: { name: string; stat: string }[];
  bestTimeWindows: string[];
  commonMistakes: string[];
  psychologyPatterns: string[];
  actionItems: string[];
};

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [usedAI, setUsedAI] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const r = await fetch("/api/ai-insights", { method: "POST" });
      const j = await r.json();
      if (!r.ok) {
        toast.error(j.error || "Failed to generate insights");
        return;
      }
      setInsights(j.insights);
      setUsedAI(j.usedAI);
      setGenerated(true);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-400" />
            AI Insights
          </h1>
          <p className="text-sm text-ink-400 mt-1">
            Your trading coach reads every trade and tells you what's working —
            and what's leaking money.
          </p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="btn-primary inline-flex items-center justify-center gap-2 self-start"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing your trades…
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              {generated ? "Regenerate insights" : "Generate insights"}
            </>
          )}
        </button>
      </div>

      {!generated && !loading && (
        <div className="card text-center py-16 bg-brand-gradient/5 border-brand-500/30">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-brand-400" />
          <h2 className="text-lg font-semibold mb-2">
            Ready when you are.
          </h2>
          <p className="text-ink-400 max-w-md mx-auto mb-6">
            Click <span className="text-white">Generate insights</span> and
            SynthaTrade will read your full trading history, find your edge, flag
            your tilt patterns, and tell you what to fix this week.
          </p>
        </div>
      )}

      {insights && (
        <div className="space-y-6">
          {!usedAI && (
            <div className="card border-amber-500/30 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-amber-300 mb-1">
                    Using local analysis
                  </div>
                  <p className="text-ink-300">
                    Insights below are computed from your statistics directly —
                    they're real, just not narrated by an LLM. Add an{" "}
                    <code className="text-amber-200 bg-amber-500/10 px-1 rounded">
                      OPENAI_API_KEY
                    </code>{" "}
                    to your <code className="text-amber-200 bg-amber-500/10 px-1 rounded">.env</code> for
                    full AI-coached output.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="card bg-brand-gradient/10 border-brand-500/30">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-brand-300 uppercase tracking-wider mb-1">
                  The read
                </div>
                <p className="text-base leading-relaxed">{insights.summary}</p>
              </div>
            </div>
          </div>

          {/* Strengths & weaknesses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Section
              title="Strengths"
              icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
              accent="emerald"
              items={insights.strengths}
              empty="Once you log more trades, your edge will start showing here."
            />
            <Section
              title="Weaknesses"
              icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
              accent="red"
              items={insights.weaknesses}
              empty="No major leaks detected yet. Keep journaling."
            />
          </div>

          {/* Best & worst setups */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                Best setups
              </h2>
              {insights.bestSetups.length === 0 ? (
                <p className="text-sm text-ink-500">
                  No high-confidence setups yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {insights.bestSetups.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-3 py-2 border-b border-ink-800 last:border-0"
                    >
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-sm text-emerald-300 shrink-0">
                        {s.stat}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                Worst setups
              </h2>
              {insights.worstSetups.length === 0 ? (
                <p className="text-sm text-ink-500">
                  No problem setups identified yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {insights.worstSetups.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-3 py-2 border-b border-ink-800 last:border-0"
                    >
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-sm text-red-300 shrink-0">{s.stat}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Time + mistakes + psychology */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Section
              title="Best time windows"
              icon={<Clock className="w-5 h-5 text-brand-400" />}
              items={insights.bestTimeWindows}
              empty="Not enough time-of-day data."
            />
            <Section
              title="Common mistakes"
              icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
              items={insights.commonMistakes}
              empty="No recurring mistakes flagged."
            />
            <Section
              title="Psychology patterns"
              icon={<Brain className="w-5 h-5 text-purple-400" />}
              items={insights.psychologyPatterns}
              empty="No tilt patterns detected — clean play."
            />
          </div>

          {/* Action items */}
          {insights.actionItems.length > 0 && (
            <div className="card border-brand-500/30 bg-brand-gradient/5">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-400" />
                Action items for this week
              </h2>
              <ul className="space-y-3">
                {insights.actionItems.map((a, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm leading-relaxed">{a}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  items,
  empty,
  accent,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  empty: string;
  accent?: "emerald" | "red";
}) {
  return (
    <div className="card">
      <h2 className="font-semibold mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-ink-500">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span
                className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                  accent === "emerald"
                    ? "bg-emerald-400"
                    : accent === "red"
                    ? "bg-red-400"
                    : "bg-brand-400"
                }`}
              />
              <span className="leading-relaxed">{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
