"use client";

import { useEffect, useState } from "react";
import { fetchStats, fetchGraphData } from "@/lib/data";
import type { Stats, GraphData } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import CausalHeatmap from "@/components/charts/CausalHeatmap";
import dynamic from "next/dynamic";

const ForceGraphViz = dynamic(
  () => import("@/components/charts/ForceGraphViz"),
  { ssr: false, loading: () => <div className="h-[560px] bg-muted/30 rounded-lg animate-pulse" /> }
);

const DISASTER_TYPES = ["All", "Flood", "Earthquake", "Drought", "Wildfire", "Storm", "Epidemic"];

export default function TrendsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [activeType, setActiveType] = useState("All");
  const [view, setView] = useState<"causes" | "prevents">("causes");

  useEffect(() => {
    fetchStats().then(setStats);
    fetchGraphData().then(setGraph);
  }, []);

  const heatmapData = stats
    ? view === "causes"
      ? stats.heatmapCauses.filter((d) => activeType === "All" || d.disasterType === activeType)
      : stats.heatmapPrevents.filter((d) => activeType === "All" || d.disasterType === activeType)
    : [];

  const filteredGraph: GraphData | null = graph
    ? activeType === "All"
      ? graph
      : {
          nodes: graph.nodes.filter((n) => n.disasterTypes.includes(activeType)),
          edges: graph.edges.filter((e) => e.disasterTypes.includes(activeType)),
        }
    : null;

  return (
    <div>
      <PageHeader
        title="Causal Trends"
        description="Aggregate view of causal drivers and prevention factors across all 1,424 disaster events. The heatmap shows frequency of causal factors by disaster type; the network shows the full global causal web."
      />

      <div className="w-full px-6 py-8 space-y-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground mr-1">Disaster type:</span>
          {DISASTER_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                activeType === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {t}
            </button>
          ))}

          <span className="text-sm text-muted-foreground ml-4 mr-1">Relation:</span>
          {(["causes", "prevents"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setView(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                view === r
                  ? r === "causes"
                    ? "bg-[oklch(0.52_0.1_258)] text-white border-transparent"
                    : "bg-[oklch(0.55_0.1_152)] text-white border-transparent"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Heatmap */}
        <div className="bg-card border border-border rounded-xl p-6" style={{ overflow: "visible" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-foreground">
                Causal Factor Heatmap
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Disaster type (rows) × top causal{" "}
                {view === "causes" ? "drivers" : "prevention factors"} (columns) — cell = frequency
              </p>
            </div>
          </div>
          {stats ? (
            <CausalHeatmap data={heatmapData} />
          ) : (
            <div className="h-64 bg-muted/30 rounded animate-pulse" />
          )}
        </div>

        {/* Force graph */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="mb-4">
            <h2 className="font-semibold text-foreground">Global Causal Network</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Force-directed graph of all causal relationships. Node size = global frequency across the
              dataset. Scroll to zoom; drag to pan; click nodes for details.
            </p>
          </div>
          {filteredGraph ? (
            <ForceGraphViz data={filteredGraph} width={1100} height={560} />
          ) : (
            <div className="h-[560px] bg-muted/30 rounded-lg animate-pulse" />
          )}
        </div>

        {/* Top drivers table */}
        {stats && stats.topDrivers.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {(["topDrivers", "topImpacts"] as const).map((key) => (
              <div key={key} className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-4">
                  {key === "topDrivers" ? "Top causal drivers (causes →)" : "Top impacted factors (→ target)"}
                </h3>
                <ol className="space-y-2">
                  {stats[key].slice(0, 12).map((d, i) => (
                    <li key={d.name} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-foreground truncate">{d.name}</span>
                          <span className="text-xs font-mono text-muted-foreground shrink-0">
                            {d.count}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/60"
                            style={{ width: `${(d.count / stats[key][0].count) * 100}%` }}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
