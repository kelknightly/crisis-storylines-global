"use client";

import { useMemo } from "react";
import type { HeatmapCell } from "@/types";

interface Props {
  data: HeatmapCell[];
  title?: string;
}

// Pastel palette steps from white → primary
const STEPS = [
  "oklch(0.99 0 0)",
  "oklch(0.94 0.025 258)",
  "oklch(0.86 0.055 258)",
  "oklch(0.77 0.085 258)",
  "oklch(0.65 0.1 258)",
  "oklch(0.52 0.1 258)",
];

function cellColor(value: number, max: number): string {
  if (max === 0 || value === 0) return STEPS[0];
  const idx = Math.ceil((value / max) * (STEPS.length - 1));
  return STEPS[Math.min(idx, STEPS.length - 1)];
}

function cellTextColor(value: number, max: number): string {
  if (max === 0 || value === 0) return "oklch(0.6 0 0)";
  const ratio = value / max;
  return ratio > 0.5 ? "oklch(0.99 0 0)" : "oklch(0.2 0.015 250)";
}

export default function CausalHeatmap({ data, title }: Props) {
  const { disasterTypes, factors, lookup, maxCount } = useMemo(() => {
    const types = [...new Set(data.map((d) => d.disasterType))].sort();
    const factors = [...new Set(data.map((d) => d.factor))].slice(0, 20);
    const lookup = new Map(data.map((d) => [`${d.disasterType}||${d.factor}`, d.count]));
    const maxCount = Math.max(...data.map((d) => d.count), 1);
    return { disasterTypes: types, factors, lookup, maxCount };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No data available — run the preprocessing script first.
      </div>
    );
  }

  const CELL_W = 120;
  const CELL_H = 32;
  const LABEL_W = 160;
  const HEADER_H = 120;
  const svgWidth = LABEL_W + factors.length * CELL_W;
  const svgHeight = HEADER_H + disasterTypes.length * CELL_H;

  return (
    <div className="overflow-auto">
      {title && (
        <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      )}
      <svg width={svgWidth} height={svgHeight} className="block">
        {/* Column headers (rotated) */}
        {factors.map((factor, fi) => (
          <g key={factor} transform={`translate(${LABEL_W + fi * CELL_W + CELL_W / 2}, ${HEADER_H - 8})`}>
            <text
              transform="rotate(-45)"
              textAnchor="end"
              className="text-xs"
              style={{
                fontSize: 10,
                fill: "oklch(0.45 0.015 250)",
                fontFamily: "var(--font-inter)",
              }}
            >
              {factor.length > 22 ? factor.slice(0, 22) + "…" : factor}
            </text>
          </g>
        ))}

        {/* Row labels + cells */}
        {disasterTypes.map((dtype, ri) => (
          <g key={dtype} transform={`translate(0, ${HEADER_H + ri * CELL_H})`}>
            {/* Row label */}
            <text
              x={LABEL_W - 8}
              y={CELL_H / 2}
              dominantBaseline="middle"
              textAnchor="end"
              style={{
                fontSize: 11,
                fill: "oklch(0.3 0.015 250)",
                fontFamily: "var(--font-inter)",
              }}
            >
              {dtype.length > 18 ? dtype.slice(0, 18) + "…" : dtype}
            </text>

            {/* Cells */}
            {factors.map((factor, fi) => {
              const count = lookup.get(`${dtype}||${factor}`) ?? 0;
              const bg = cellColor(count, maxCount);
              const fg = cellTextColor(count, maxCount);
              return (
                <g key={factor}>
                  <rect
                    x={LABEL_W + fi * CELL_W + 1}
                    y={1}
                    width={CELL_W - 2}
                    height={CELL_H - 2}
                    rx={3}
                    fill={bg}
                    stroke="oklch(0.91 0.007 80)"
                    strokeWidth={0.5}
                  />
                  {count > 0 && (
                    <text
                      x={LABEL_W + fi * CELL_W + CELL_W / 2}
                      y={CELL_H / 2}
                      dominantBaseline="middle"
                      textAnchor="middle"
                      style={{
                        fontSize: 10,
                        fill: fg,
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontWeight: 500,
                      }}
                    >
                      {count}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span>Low</span>
        <div className="flex gap-0.5">
          {STEPS.map((color, i) => (
            <div
              key={i}
              className="w-5 h-3 rounded-sm border border-border/50"
              style={{ background: color }}
            />
          ))}
        </div>
        <span>High (frequency of causal factor)</span>
      </div>
    </div>
  );
}
