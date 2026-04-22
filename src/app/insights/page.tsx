"use client";

import { useEffect, useState } from "react";
import { fetchInsights } from "@/lib/data";
import type { InsightsData } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import InsightCard from "@/components/insight/InsightCard";
import AiGeneratedBadge from "@/components/AiGeneratedBadge";
import { Cpu, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);

  useEffect(() => {
    fetchInsights().then(setData);
  }, []);

  const insights = data?.insights ?? [];
  const hasData = insights.length > 0 && insights[0].narrative.length > 30;

  return (
    <div>
      <PageHeader
        title="AI Insights"
        description="Pre-generated synthesis of 12 key disaster intelligence questions. Each insight was produced once offline using an LLM with retrieval-augmented generation (RAG) over the full triplet dataset. No live AI calls are made in this application."
      >
        {data && (
          <AiGeneratedBadge
            model={data.model.split("-20")[0]}
            runDate={data.generatedAt}
          />
        )}
      </PageHeader>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Method banner */}
        <div className="bg-secondary/40 border border-secondary rounded-xl px-5 py-4 flex gap-4 items-start">
          <Cpu className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              How these insights were generated
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each question was answered by embedding the query with{" "}
              <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                {data?.embeddingModel ?? "all-MiniLM-L6-v2"}
              </code>
              , retrieving the top {data?.topK ?? 20} semantically relevant causal triplets
              from the dataset via LanceDB, then synthesising a response with{" "}
              <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                {data?.model ?? "gemini-2.5-flash"}
              </code>
              . Confidence scores are cross-referenced against the expert validation
              dataset (triplet_expert_val.xlsx).{" "}
              <Link href="/methodology" className="text-primary hover:underline inline-flex items-center gap-0.5">
                Full methodology <ExternalLink className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>

        {!hasData ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
            <Cpu className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              Insights not yet generated
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              Run the data pipeline to generate AI insights from the dataset:
            </p>
            <ol className="text-sm text-left inline-block space-y-1 font-mono bg-muted px-5 py-3 rounded-lg">
              <li>1. python scripts/01_download_data.py</li>
              <li>2. python scripts/02_preprocess.py</li>
              <li>3. GEMINI_API_KEY=... python scripts/03_generate_insights.py</li>
            </ol>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {insights.map((insight, i) => (
              <InsightCard key={insight.id} insight={insight} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
