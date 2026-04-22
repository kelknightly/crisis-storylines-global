"use client";

import { useEffect, useState } from "react";
import { fetchValidation } from "@/lib/data";
import type { ValidationSummary } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import AuditRadar from "@/components/charts/AuditRadar";
import CitationChip from "@/components/CitationChip";
import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function PrecisionBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 75
      ? "oklch(0.67 0.1 152)"
      : pct >= 50
      ? "oklch(0.78 0.12 70)"
      : "oklch(0.62 0.13 15)";
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-foreground min-w-[180px] truncate">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-sm font-mono text-muted-foreground w-10 text-right">{pct}%</span>
    </div>
  );
}

export default function AuditPage() {
  const [val, setVal] = useState<ValidationSummary | null>(null);

  useEffect(() => {
    fetchValidation().then(setVal);
  }, []);

  const byTypeEntries = val
    ? Object.entries(val.byDisasterType).sort((a, b) => b[1].count - a[1].count)
    : [];

  const barData = byTypeEntries.map(([type, stats]) => ({
    name: type.length > 14 ? type.slice(0, 14) + "…" : type,
    precision: Math.round(stats.precision * 100),
  }));

  return (
    <div>
      <PageHeader
        title="Hallucination Audit"
        description="Expert validation results from Ronco et al. (2026). Six independent disaster-management experts annotated 1,000 randomly sampled causal triplets. This page shows where the original LLM pipeline is most and least reliable."
      >
        <div className="text-right text-xs text-muted-foreground">
          <p>Ground truth: triplet_expert_val.xlsx</p>
          <a
            href="https://doi.org/10.5281/zenodo.18598183"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Zenodo 10.5281/zenodo.18598183
          </a>
        </div>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Summary cards */}
        {val && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-[oklch(0.55_0.1_152)]" />
                <h3 className="font-semibold text-foreground">Overall precision</h3>
              </div>
              <p className="text-4xl font-bold font-mono">
                {Math.round(val.overallPrecision * 100)}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Fraction of AI-generated triplets supported by the corresponding news storyline
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Annotators</h3>
              </div>
              <p className="text-4xl font-bold font-mono">{val.annotatorCount}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Independent expert annotators · {val.totalAnnotated.toLocaleString()} triplets labelled
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <h3 className="font-semibold text-foreground">Disputed triplets</h3>
              </div>
              <p className="text-4xl font-bold font-mono">
                {byTypeEntries.reduce((s, [, v]) => s + v.disputed, 0)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Triplets where experts scored precision &lt; 50%
              </p>
            </div>
          </div>
        )}

        {/* Radar + bar charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">
                Precision by disaster type
              </h2>
              <CitationChip />
            </div>
            {val ? (
              <AuditRadar validation={val} />
            ) : (
              <div className="h-80 bg-muted/30 rounded animate-pulse" />
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Higher = AI more reliably generates fact-supported triplets for that disaster type.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold text-foreground mb-4">
              Precision ranking (bar chart)
            </h2>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ left: 8, right: 32, top: 0, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fontFamily: "Inter" }}
                    tickFormatter={(v) => `${v}%`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 10, fontFamily: "Inter" }}
                    width={110}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v) => [`${v}%`, "Expert precision"]}
                    contentStyle={{ borderRadius: 8, fontSize: 12, fontFamily: "Inter" }}
                  />
                  <Bar dataKey="precision" radius={[0, 3, 3, 0]}>
                    {barData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.precision >= 75
                            ? "oklch(0.67 0.1 152)"
                            : entry.precision >= 50
                            ? "oklch(0.78 0.12 70)"
                            : "oklch(0.62 0.13 15)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 bg-muted/30 rounded animate-pulse" />
            )}
          </div>
        </div>

        {/* Relation-level precision */}
        {val && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold text-foreground mb-4">
              Precision by relation type
            </h2>
            <div className="space-y-4 max-w-lg">
              <PrecisionBar label={`"causes" relations (${val.byRelation.causes.count.toLocaleString()})`} value={val.byRelation.causes.precision} />
              <PrecisionBar label={`"prevents" relations (${val.byRelation.prevents.count.toLocaleString()})`} value={val.byRelation.prevents.precision} />
            </div>
          </div>
        )}

        {/* Disputed triplets table */}
        {val && val.topDisputedTriplets.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <h2 className="font-semibold text-foreground">Lowest-scoring triplets</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Triplets from the expert validation set with the lowest average expert agreement score.
              These represent cases where the AI&apos;s causal claims were least supported by the underlying news text.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Source factor</th>
                    <th className="py-2 pr-4 font-medium">Relation</th>
                    <th className="py-2 pr-4 font-medium">Target factor</th>
                    <th className="py-2 pr-4 font-medium">Disaster type</th>
                    <th className="py-2 font-medium">Expert score</th>
                  </tr>
                </thead>
                <tbody>
                  {val.topDisputedTriplets.map((t, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2 pr-4 font-mono text-foreground/80">{t.triplet[0]}</td>
                      <td className="py-2 pr-4 text-destructive font-medium">{t.triplet[1]}</td>
                      <td className="py-2 pr-4 font-mono text-foreground/80">{t.triplet[2]}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{t.disasterType}</td>
                      <td className="py-2">
                        <span className="inline-flex items-center gap-1 text-destructive font-mono font-medium">
                          <AlertCircle className="w-3 h-3" />
                          {Math.round(t.expertScore * 100)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
