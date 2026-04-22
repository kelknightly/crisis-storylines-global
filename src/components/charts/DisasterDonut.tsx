"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  data: { name: string; count: number; color: string }[];
}

export default function DisasterDonut({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        No data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="48%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="count"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          formatter={(v, name) => [Number(v).toLocaleString(), String(name)]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid oklch(0.91 0.007 80)",
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, fontFamily: "Inter, sans-serif" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
