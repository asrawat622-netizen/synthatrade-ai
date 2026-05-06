import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai";
import {
  computeMetrics,
  bySession,
  byDayOfWeek,
  byHour,
  byTag,
  tagCombinations,
  afterLossAnalysis,
  bestWorst,
} from "@/lib/analytics";

const SYSTEM_PROMPT = `You are an expert trading coach analyzing a trader's journal data.
You speak directly, like a sharp mentor who has seen 10,000 traders. No fluff. No platitudes.
Cite specific numbers from the data. Use the trader's own tag names.
Return ONLY valid JSON matching this exact shape:
{
  "summary": "2-3 sentence overall read on the trader",
  "strengths": ["specific strength with number", "..."],
  "weaknesses": ["specific weakness with number", "..."],
  "bestSetups": [{"name": "tag combo or session", "stat": "85% WR over 23 trades"}],
  "worstSetups": [{"name": "...", "stat": "..."}],
  "bestTimeWindows": ["specific window with stats"],
  "commonMistakes": ["mistake 1", "mistake 2"],
  "psychologyPatterns": ["pattern 1 with evidence"],
  "actionItems": ["concrete next step", "..."]
}
Each array should have 2-5 items. Be specific. Numbers > vibes.`;

export async function POST() {
  try {
    const user = await requireUser();
    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      include: { tradeTags: { include: { tag: true } } },
      orderBy: { date: "asc" },
    });

    if (trades.length < 5) {
      return NextResponse.json({
        insights: {
          summary: "You need at least 5 logged trades before SynthaTrade can find your edge. Keep logging.",
          strengths: [], weaknesses: [],
          bestSetups: [], worstSetups: [],
          bestTimeWindows: [], commonMistakes: [], psychologyPatterns: [],
          actionItems: ["Log at least 5 more trades to unlock AI insights."],
        },
        usedAI: false,
      });
    }

    const metrics = computeMetrics(trades);
    const sessionStats = bySession(trades);
    const dayStats = byDayOfWeek(trades);
    const hourStats = byHour(trades);
    const tagStats = byTag(trades);
    const combos = tagCombinations(trades);
    const afterLoss = afterLossAnalysis(trades);
    const bw = bestWorst(trades);

    // Compact data payload (top items only) to keep the prompt cheap
    const payload = {
      metrics: {
        totalTrades: metrics.totalTrades,
        winRate: +(metrics.winRate * 100).toFixed(1),
        expectancy: +metrics.expectancy.toFixed(2),
        profitFactor: metrics.profitFactor === Infinity ? "∞" : +metrics.profitFactor.toFixed(2),
        totalPnl: +metrics.totalPnl.toFixed(2),
        avgWin: +metrics.avgWin.toFixed(2),
        avgLoss: +metrics.avgLoss.toFixed(2),
        maxWinStreak: metrics.maxWinStreak,
        maxLossStreak: metrics.maxLossStreak,
        ruleBreakRate: +(metrics.ruleBreakRate * 100).toFixed(1),
        avgRMultiple: +metrics.avgRMultiple.toFixed(2),
      },
      sessions: sessionStats.map((s) => ({
        session: s.session,
        trades: s.trades,
        winRate: +(s.winRate * 100).toFixed(1),
        pnl: +s.pnl.toFixed(2),
      })),
      days: dayStats.map((d) => ({
        day: d.day,
        trades: d.trades,
        winRate: +(d.winRate * 100).toFixed(1),
        pnl: +d.pnl.toFixed(2),
      })),
      hourBuckets: hourStats.slice(0, 12).map((h) => ({
        hour: h.hour,
        trades: h.trades,
        winRate: +(h.winRate * 100).toFixed(1),
        pnl: +h.pnl.toFixed(2),
      })),
      tags: tagStats.slice(0, 15).map((t) => ({
        tag: t.tag,
        trades: t.trades,
        winRate: +(t.winRate * 100).toFixed(1),
        pnl: +t.pnl.toFixed(2),
      })),
      topCombos: combos.slice(0, 10).map((c) => ({
        combo: c.combo,
        trades: c.trades,
        winRate: +(c.winRate * 100).toFixed(1),
        pnl: +c.pnl.toFixed(2),
      })),
      worstCombos: combos.slice(-5).map((c) => ({
        combo: c.combo,
        trades: c.trades,
        winRate: +(c.winRate * 100).toFixed(1),
        pnl: +c.pnl.toFixed(2),
      })),
      afterConsecutiveLosses: afterLoss,
      bestWorst: bw,
    };

    const openai = getOpenAI();
    if (!openai) {
      // Graceful local fallback: build heuristic insights so the page is never empty.
      const insights = buildFallback(payload);
      return NextResponse.json({ insights, usedAI: false });
    }

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Trader's data:\n${JSON.stringify(payload)}\n\nReturn JSON only.` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });
    const text = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(text);
    return NextResponse.json({ insights: parsed, usedAI: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}

function buildFallback(p: any) {
  const bestSession = p.sessions
    .filter((s: any) => s.trades >= 3)
    .sort((a: any, b: any) => b.pnl - a.pnl)[0];
  const worstSession = p.sessions
    .filter((s: any) => s.trades >= 3)
    .sort((a: any, b: any) => a.pnl - b.pnl)[0];
  const bestDay = p.days.filter((d: any) => d.trades >= 3).sort((a: any, b: any) => b.pnl - a.pnl)[0];
  const worstDay = p.days.filter((d: any) => d.trades >= 3).sort((a: any, b: any) => a.pnl - b.pnl)[0];
  const topCombo = p.topCombos[0];
  const worstCombo = p.worstCombos[p.worstCombos.length - 1];
  const tiltBucket = p.afterConsecutiveLosses.find((b: any) => b.consecutiveLosses === "2");
  const baseline = p.afterConsecutiveLosses.find((b: any) => b.consecutiveLosses === "0");

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  if (p.metrics.profitFactor !== "∞" && p.metrics.profitFactor >= 1.5)
    strengths.push(`Profit factor of ${p.metrics.profitFactor} — your winners outweigh losers handily.`);
  if (p.metrics.winRate >= 55) strengths.push(`${p.metrics.winRate}% overall win rate across ${p.metrics.totalTrades} trades.`);
  if (bestSession) strengths.push(`Strong on ${bestSession.session}: ${bestSession.winRate}% WR, $${bestSession.pnl} PnL.`);
  if (topCombo) strengths.push(`${topCombo.combo} is your A+ combo — ${topCombo.winRate}% WR over ${topCombo.trades} trades.`);

  if (p.metrics.ruleBreakRate >= 15) weaknesses.push(`Breaking rules on ${p.metrics.ruleBreakRate}% of trades — discipline leak.`);
  if (worstSession) weaknesses.push(`${worstSession.session} is bleeding: $${worstSession.pnl} across ${worstSession.trades} trades.`);
  if (worstDay) weaknesses.push(`Worst day is ${worstDay.day} ($${worstDay.pnl}).`);
  if (worstCombo) weaknesses.push(`${worstCombo.combo} keeps losing: ${worstCombo.winRate}% WR.`);

  const psychology: string[] = [];
  if (tiltBucket && baseline && baseline.winRate - tiltBucket.winRate > 15) {
    psychology.push(
      `Tilt detected: after 2 losses your WR drops from ${baseline.winRate}% to ${tiltBucket.winRate}%. Step away after back-to-back losers.`
    );
  }
  if (p.metrics.maxLossStreak >= 4) psychology.push(`Max loss streak of ${p.metrics.maxLossStreak} — review what happened on those days.`);

  return {
    summary:
      p.metrics.totalPnl >= 0
        ? `You're net positive ${p.metrics.totalPnl} across ${p.metrics.totalTrades} trades. Your edge is real but uneven — kill the leaks.`
        : `Net negative ${p.metrics.totalPnl} across ${p.metrics.totalTrades} trades. The data points to clear leaks. Fix them.`,
    strengths: strengths.length ? strengths : ["Consistent journaling — you have the data to improve."],
    weaknesses: weaknesses.length ? weaknesses : ["Sample size still small — keep logging."],
    bestSetups: [
      ...(topCombo ? [{ name: topCombo.combo, stat: `${topCombo.winRate}% WR over ${topCombo.trades} trades` }] : []),
      ...(bestSession ? [{ name: `${bestSession.session} session`, stat: `${bestSession.winRate}% WR` }] : []),
    ],
    worstSetups: [
      ...(worstCombo ? [{ name: worstCombo.combo, stat: `${worstCombo.winRate}% WR` }] : []),
      ...(worstSession ? [{ name: `${worstSession.session} session`, stat: `$${worstSession.pnl} PnL` }] : []),
    ],
    bestTimeWindows: [
      ...(bestDay ? [`${bestDay.day} (${bestDay.winRate}% WR, $${bestDay.pnl})`] : []),
      ...(bestSession ? [`${bestSession.session} session`] : []),
    ],
    commonMistakes: weaknesses.slice(0, 2).length ? weaknesses.slice(0, 2) : ["No glaring mistakes detected yet."],
    psychologyPatterns: psychology.length ? psychology : ["No clear tilt patterns yet."],
    actionItems: [
      bestSession ? `Trade more during ${bestSession.session} — that's where your edge lives.` : "Identify your best session.",
      worstSession ? `Skip ${worstSession.session} until further notice.` : "Log more trades to find weak spots.",
      tiltBucket && baseline && baseline.winRate - tiltBucket.winRate > 10
        ? "Hard rule: stop trading after 2 consecutive losses today."
        : "Set a daily max-loss circuit breaker.",
    ],
  };
}
