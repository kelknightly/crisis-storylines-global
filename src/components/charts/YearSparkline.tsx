"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { year: number; count: number }[];
}

export default function YearSparkline({ data }: Props) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
        <defs>
          <linearGradient id="yearGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.52 0.1 258)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="oklch(0.52 0.1 258)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="year"
          tick={{ fontSize: 10, fill: "oklch(0.52 0.018 250)", fontFamily: "Inter" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip
          formatter={(v) => [Number(v).toLocaleString(), "Events"]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid oklch(0.91 0.007 80)",
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="oklch(0.52 0.1 258)"
          strokeWidth={2}
          fill="url(#yearGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "oklch(0.52 0.1 258)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
