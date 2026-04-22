"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, TrendingUp, Globe, Network, Calendar, HelpCircle } from "lucide-react";
import { fetchStats } from "@/lib/data";
import type { Stats } from "@/types";
import WorldMapViz from "@/components/charts/WorldMapViz";
import DisasterDonut from "@/components/charts/DisasterDonut";
import YearSparkline from "@/components/charts/YearSparkline";
import CitationChip from "@/components/CitationChip";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tooltip,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  tooltip?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger className="inline-flex items-center focus:outline-none">
                <HelpCircle className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="bottom">{tooltip}</TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground font-mono tracking-tight">
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchStats().then(setStats).catch(() => setError(true));
  }, []);

  const loading = !stats && !error;

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="max-w-3xl">
            <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">
              Global Synthesis Layer
            </p>
            <h1 className="text-4xl font-bold text-foreground leading-tight mb-4">
              crisesStorylines{" "}
              <span className="text-primary">Global</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              An interactive visualization of 10 years of global disaster causal knowledge
              graphs, aggregated from 3,158 disaster events across 2014–2024. Built on the
              open dataset of Ronco et al. (2026).
            </p>

            {/* Attribution callout */}
            <div className="bg-secondary/50 border border-secondary rounded-lg px-4 py-3 mb-6">
              <p className="text-sm text-secondary-foreground">
                <span className="font-semibold">Data source: </span>
                Ronco, M. et al. (2026).{" "}
                <em>
                  Disaster storylines and knowledge graphs from global news with large
                  language models and retrieval-augmented generation.
                </em>{" "}
                Zenodo.{" "}
                <a
                  href="https://doi.org/10.5281/zenodo.18598183"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  10.5281/zenodo.18598183
                  <ExternalLink className="w-3 h-3" />
                </a>
                {" · "}
                <Link href="/about" className="text-primary hover:underline">
                  About this visualization →
                </Link>
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/trends"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Explore Causal Trends
              </Link>
              <Link
                href="/insights"
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                View AI Insights
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Disaster events"
            value={loading ? "—" : (stats?.totalEvents ?? 0).toLocaleString()}
            sub="2014–2024"
            icon={Globe}
          />
          <StatCard
            label="Causal triplets"
            value={loading ? "—" : (stats?.totalTriplets ?? 0).toLocaleString()}
            sub="causes + prevents"
            icon={Network}
            tooltip="A causal triplet is a 3-part statement [source → relation → target] extracted by an LLM from disaster news. The relation is 'causes' or 'prevents' — e.g., deforestation → causes → landslide. See Methodology for the full definition."
          />
          <StatCard
            label="Countries covered"
            value={loading ? "—" : (stats?.totalCountries ?? 0).toLocaleString()}
            sub="EM-DAT seed data"
            icon={TrendingUp}
          />
          <StatCard
            label="Years of data"
            value={
              loading
                ? "—"
                : stats
                ? `${stats.yearRange[1] - stats.yearRange[0] + 1}`
                : "0"
            }
            sub={stats ? `${stats.yearRange[0]}–${stats.yearRange[1]}` : ""}
            icon={Calendar}
          />
        </div>

        {/* Map + charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Events by country</h2>
              <CitationChip />
            </div>
            {stats ? (
              <WorldMapViz countries={stats.byCountry} height={400} />
            ) : (
              <div className="h-[400px] bg-muted/30 rounded-lg animate-pulse" />
            )}
            <p className="text-xs text-muted-foreground mt-3">
              Circle size proportional to event count. Scroll to zoom; click a marker to explore events for that country.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="bg-card border border-border rounded-xl p-5 flex-1">
              <h2 className="font-semibold text-foreground mb-3">Events by disaster type</h2>
              {stats ? (
                <DisasterDonut data={stats.disasterTypes} />
              ) : (
                <div className="h-64 bg-muted/30 rounded animate-pulse" />
              )}
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-foreground mb-1 text-sm">Events per year</h2>
              {stats ? (
                <YearSparkline data={stats.byYear} />
              ) : (
                <div className="h-28 bg-muted/30 rounded animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              href: "/trends",
              title: "Causal Trends",
              desc: "Heatmap of disaster types vs. top causal drivers. Interactive force-directed causal network.",
              colorClass: "bg-[oklch(0.94_0.025_258)]",
            },
            {
              href: "/audit",
              title: "Hallucination Audit",
              desc: "Where does the original LLM pipeline struggle? Expert-validated accuracy by category.",
              colorClass: "bg-[oklch(0.93_0.04_152)]",
            },
            {
              href: "/insights",
              title: "AI Insights",
              desc: "Pre-generated synthesis answering 12 key disaster intelligence questions from the dataset.",
              colorClass: "bg-[oklch(0.96_0.03_70)]",
            },
          ].map(({ href, title, desc, colorClass }) => (
            <Link
              key={href}
              href={href}
              className="group bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors"
            >
              <div
                className={`w-9 h-9 rounded-lg ${colorClass} mb-3 flex items-center justify-center group-hover:scale-105 transition-transform`}
              >
                <div className="w-3 h-3 rounded-full bg-primary/40" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
