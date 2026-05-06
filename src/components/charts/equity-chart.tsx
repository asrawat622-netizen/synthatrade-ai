"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function EquityChart({
  data,
}: {
  data: { idx: number; date: string; equity: number }[];
}) {
  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-ink-400 text-sm">
        Log some trades to see your equity curve.
      </div>
    );
  }
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b62ff" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3b62ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="idx" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(v: number) => [`$${v.toLocaleString()}`, "Equity"]}
            labelFormatter={(l) => `Trade #${l}`}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke="#3b62ff"
            strokeWidth={2}
            fill="url(#equityFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
