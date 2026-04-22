"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Tableau 20 — the industry-standard data journalism palette
const BOLD_COLORS = [
  "#4e79a7", // steel blue
  "#f28e2c", // orange
  "#e15759", // red
  "#76b7b2", // teal
  "#59a14f", // green
  "#edc949", // yellow
  "#af7aa1", // mauve
  "#ff9da7", // pink
  "#9c755f", // brown
  "#bab0ab", // warm grey
  "#499894", // dark teal
  "#86bcb6", // light teal
  "#ffbe7d", // peach
  "#8cd17d", // light green
  "#b6992d", // gold
  "#f1ce63", // pale yellow
  "#d37295", // rose
  "#fabfd2", // blush
  "#b07aa1", // purple
  "#79706e", // taupe
  "#a0cbe8", // light blue
  "#d7b5a6", // salmon
  "#9d7660", // sienna
  "#499894", // seafoam
  "#e15759", // coral
  "#4e79a7", // navy
];

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
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={110}
          paddingAngle={2}
          dataKey="count"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={BOLD_COLORS[i % BOLD_COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          formatter={(v, name) => [Number(v).toLocaleString(), String(name)]}
          contentStyle={{
            borderRadius: 8,
            border: "2px solid #1e293b",
            background: "#0f172a",
            color: "#f8fafc",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            padding: "8px 12px",
          }}
          labelStyle={{ fontWeight: 700, color: "#f8fafc", marginBottom: 2 }}
          itemStyle={{ color: "#e2e8f0" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
