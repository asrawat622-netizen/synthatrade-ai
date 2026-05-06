// Analytics engine for SynthaTrade AI.
// Pure functions over an array of trades.

export type TradeWithTags = {
  id: string;
  date: Date | string;
  instrument: string;
  direction: string;
  pnlPoints: number;
  pnlDollars: number;
  result: string; // "Win" | "Loss" | "BE"
  session: string | null;
  rMultiple: number | null;
  riskReward: number | null;
  ruleBreak: boolean;
  tradeTags: { tag: { id: string; name: string } }[];
};

export type PerformanceMetrics = {
  totalTrades: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
  profitFactor: number;
  totalPnl: number;
  totalPoints: number;
  biggestWin: number;
  biggestLoss: number;
  maxWinStreak: number;
  maxLossStreak: number;
  currentStreak: { type: "Win" | "Loss" | "BE" | "None"; count: number };
  ruleBreakCount: number;
  ruleBreakRate: number;
  avgRMultiple: number;
};

export function computeMetrics(trades: TradeWithTags[]): PerformanceMetrics {
  const total = trades.length;
  const wins = trades.filter((t) => t.result === "Win");
  const losses = trades.filter((t) => t.result === "Loss");
  const be = trades.filter((t) => t.result === "BE");

  const winSum = wins.reduce((s, t) => s + t.pnlDollars, 0);
  const lossSum = losses.reduce((s, t) => s + Math.abs(t.pnlDollars), 0);

  const avgWin = wins.length ? winSum / wins.length : 0;
  const avgLoss = losses.length ? lossSum / losses.length : 0;
  const winRate = total ? wins.length / total : 0;

  const expectancy = total
    ? (winRate * avgWin) - ((1 - winRate) * avgLoss)
    : 0;

  const profitFactor = lossSum > 0 ? winSum / lossSum : winSum > 0 ? Infinity : 0;
  const totalPnl = trades.reduce((s, t) => s + t.pnlDollars, 0);
  const totalPoints = trades.reduce((s, t) => s + t.pnlPoints, 0);

  const biggestWin = wins.length ? Math.max(...wins.map((t) => t.pnlDollars)) : 0;
  const biggestLoss = losses.length ? Math.min(...losses.map((t) => t.pnlDollars)) : 0;

  // Streaks (date-sorted ascending)
  const sorted = [...trades].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let curWin = 0;
  let curLoss = 0;
  for (const t of sorted) {
    if (t.result === "Win") {
      curWin++;
      curLoss = 0;
      if (curWin > maxWinStreak) maxWinStreak = curWin;
    } else if (t.result === "Loss") {
      curLoss++;
      curWin = 0;
      if (curLoss > maxLossStreak) maxLossStreak = curLoss;
    } else {
      curWin = 0;
      curLoss = 0;
    }
  }
  let currentStreak: PerformanceMetrics["currentStreak"] = { type: "None", count: 0 };
  if (sorted.length) {
    const last = sorted[sorted.length - 1].result as "Win" | "Loss" | "BE";
    let count = 0;
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].result === last) count++;
      else break;
    }
    currentStreak = { type: last, count };
  }

  const ruleBreakCount = trades.filter((t) => t.ruleBreak).length;
  const ruleBreakRate = total ? ruleBreakCount / total : 0;
  const rMultiples = trades.map((t) => t.rMultiple).filter((v): v is number => v != null);
  const avgRMultiple = rMultiples.length
    ? rMultiples.reduce((s, v) => s + v, 0) / rMultiples.length
    : 0;

  return {
    totalTrades: total,
    wins: wins.length,
    losses: losses.length,
    breakeven: be.length,
    winRate,
    avgWin,
    avgLoss,
    expectancy,
    profitFactor,
    totalPnl,
    totalPoints,
    biggestWin,
    biggestLoss,
    maxWinStreak,
    maxLossStreak,
    currentStreak,
    ruleBreakCount,
    ruleBreakRate,
    avgRMultiple,
  };
}

export function equityCurve(trades: TradeWithTags[]) {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  let running = 0;
  return sorted.map((t, i) => {
    running += t.pnlDollars;
    return {
      idx: i + 1,
      date: new Date(t.date).toISOString().slice(0, 10),
      equity: Math.round(running * 100) / 100,
      pnl: t.pnlDollars,
    };
  });
}

export function pnlDistribution(trades: TradeWithTags[]) {
  const buckets: Record<string, number> = {};
  const ranges = [
    { label: "<-$500", min: -Infinity, max: -500 },
    { label: "-$500 to -$200", min: -500, max: -200 },
    { label: "-$200 to $0", min: -200, max: 0 },
    { label: "$0 to $200", min: 0, max: 200 },
    { label: "$200 to $500", min: 200, max: 500 },
    { label: ">$500", min: 500, max: Infinity },
  ];
  for (const r of ranges) buckets[r.label] = 0;
  for (const t of trades) {
    for (const r of ranges) {
      if (t.pnlDollars >= r.min && t.pnlDollars < r.max) {
        buckets[r.label]++;
        break;
      }
    }
  }
  return ranges.map((r) => ({ range: r.label, count: buckets[r.label] }));
}

export function byDayOfWeek(trades: TradeWithTags[]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const buckets: Record<string, TradeWithTags[]> = {};
  for (const d of days) buckets[d] = [];
  for (const t of trades) {
    const day = days[new Date(t.date).getDay()];
    buckets[day].push(t);
  }
  return days.map((d) => {
    const arr = buckets[d];
    const wins = arr.filter((t) => t.result === "Win").length;
    return {
      day: d,
      trades: arr.length,
      winRate: arr.length ? wins / arr.length : 0,
      pnl: arr.reduce((s, t) => s + t.pnlDollars, 0),
    };
  });
}

export function byHour(trades: TradeWithTags[]) {
  const buckets: Record<number, TradeWithTags[]> = {};
  for (const t of trades) {
    const h = new Date(t.date).getHours();
    buckets[h] = buckets[h] ?? [];
    buckets[h].push(t);
  }
  return Object.keys(buckets)
    .map((k) => parseInt(k))
    .sort((a, b) => a - b)
    .map((h) => {
      const arr = buckets[h];
      const wins = arr.filter((t) => t.result === "Win").length;
      return {
        hour: `${h.toString().padStart(2, "0")}:00`,
        trades: arr.length,
        winRate: arr.length ? wins / arr.length : 0,
        pnl: arr.reduce((s, t) => s + t.pnlDollars, 0),
      };
    });
}

export function bySession(trades: TradeWithTags[]) {
  const sessions = ["Asia", "London", "NY Open", "NY Lunch", "NY PM"];
  return sessions.map((s) => {
    const arr = trades.filter((t) => t.session === s);
    const wins = arr.filter((t) => t.result === "Win").length;
    return {
      session: s,
      trades: arr.length,
      winRate: arr.length ? wins / arr.length : 0,
      pnl: arr.reduce((s2, t) => s2 + t.pnlDollars, 0),
    };
  });
}

export function byTag(trades: TradeWithTags[]) {
  const map: Record<string, TradeWithTags[]> = {};
  for (const t of trades) {
    for (const tt of t.tradeTags) {
      const name = tt.tag.name;
      map[name] = map[name] ?? [];
      map[name].push(t);
    }
  }
  return Object.entries(map)
    .map(([name, arr]) => {
      const wins = arr.filter((t) => t.result === "Win").length;
      return {
        tag: name,
        trades: arr.length,
        winRate: arr.length ? wins / arr.length : 0,
        pnl: arr.reduce((s, t) => s + t.pnlDollars, 0),
        avgPnl: arr.length ? arr.reduce((s, t) => s + t.pnlDollars, 0) / arr.length : 0,
      };
    })
    .sort((a, b) => b.pnl - a.pnl);
}

// Combinations of 2-4 tags
export function tagCombinations(trades: TradeWithTags[], minTrades = 3) {
  const combos: Record<string, TradeWithTags[]> = {};
  const combosKeys: Record<string, string[]> = {};

  function combine<T>(arr: T[], k: number): T[][] {
    if (k === 0) return [[]];
    if (arr.length < k) return [];
    const [first, ...rest] = arr;
    const withFirst = combine(rest, k - 1).map((c) => [first, ...c]);
    const withoutFirst = combine(rest, k);
    return [...withFirst, ...withoutFirst];
  }

  for (const t of trades) {
    const tagNames = t.tradeTags.map((tt) => tt.tag.name).sort();
    if (tagNames.length < 2) continue;
    for (let k = 2; k <= Math.min(4, tagNames.length); k++) {
      for (const combo of combine(tagNames, k)) {
        const key = combo.join(" + ");
        combos[key] = combos[key] ?? [];
        combos[key].push(t);
        combosKeys[key] = combo;
      }
    }
  }

  return Object.entries(combos)
    .filter(([_, arr]) => arr.length >= minTrades)
    .map(([key, arr]) => {
      const wins = arr.filter((t) => t.result === "Win").length;
      return {
        combo: key,
        size: combosKeys[key].length,
        trades: arr.length,
        winRate: arr.length ? wins / arr.length : 0,
        pnl: arr.reduce((s, t) => s + t.pnlDollars, 0),
        avgPnl: arr.length ? arr.reduce((s, t) => s + t.pnlDollars, 0) / arr.length : 0,
      };
    })
    .sort((a, b) => b.winRate * b.trades - a.winRate * a.trades);
}

// After-loss analysis: how does win rate change after N losses
export function afterLossAnalysis(trades: TradeWithTags[]) {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const buckets: Record<number, { wins: number; total: number }> = {
    0: { wins: 0, total: 0 },
    1: { wins: 0, total: 0 },
    2: { wins: 0, total: 0 },
    3: { wins: 0, total: 0 },
  };
  let consecutiveLosses = 0;
  for (const t of sorted) {
    const bucket = Math.min(consecutiveLosses, 3);
    buckets[bucket].total++;
    if (t.result === "Win") buckets[bucket].wins++;
    if (t.result === "Loss") consecutiveLosses++;
    else if (t.result === "Win") consecutiveLosses = 0;
  }
  return Object.entries(buckets).map(([k, v]) => ({
    consecutiveLosses: k === "3" ? "3+" : k,
    trades: v.total,
    winRate: v.total ? v.wins / v.total : 0,
  }));
}

export function bestWorst(trades: TradeWithTags[]) {
  const tagStats = byTag(trades).filter((t) => t.trades >= 3);
  const sessionStats = bySession(trades).filter((s) => s.trades >= 3);
  const dayStats = byDayOfWeek(trades).filter((d) => d.trades >= 3);

  return {
    bestTag: tagStats.slice().sort((a, b) => b.pnl - a.pnl)[0] ?? null,
    worstTag: tagStats.slice().sort((a, b) => a.pnl - b.pnl)[0] ?? null,
    bestSession: sessionStats.slice().sort((a, b) => b.pnl - a.pnl)[0] ?? null,
    worstSession: sessionStats.slice().sort((a, b) => a.pnl - b.pnl)[0] ?? null,
    bestDay: dayStats.slice().sort((a, b) => b.pnl - a.pnl)[0] ?? null,
    worstDay: dayStats.slice().sort((a, b) => a.pnl - b.pnl)[0] ?? null,
  };
}
