"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { REGION_COUNTRY_LISTS, REGION_RATIONALE } from "@/lib/regions";

const SYSTEM_PROMPT =
  "You are an expert in Disaster Risk Management and global hazard analysis. " +
  "You are analysing data from the crisesStorylinesRAG dataset (Ronco et al., 2026), " +
  "which contains causal knowledge graph triplets extracted from 10 years (2014–2024) " +
  "of global disaster news using large language models.\n\n" +
  "Your task is to answer the question using ONLY the retrieved triplets and evidence " +
  "provided in the context. Do not make claims that are not supported by the data. " +
  "If the evidence is insufficient for a strong conclusion, say so explicitly.\n\n" +
  "Structure your response as 2–3 clear paragraphs of clear, precise prose. " +
  "Reference specific causal relationships from the triplets where relevant. " +
  "Be precise about geographic scope, disaster type, and time period. " +
  "Do not hallucinate beyond what the data shows.";

function SectionHeading({
  num,
  title,
}: {
  num: string;
  title: string;
}) {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      <span className="text-2xl font-bold text-primary font-mono">{num}</span>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
    </div>
  );
}

function CollapsibleCode({ label, content }: { label: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-muted-foreground hover:bg-muted/40 transition-colors bg-muted/20"
      >
        <span>{label}</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <pre className="px-5 py-4 text-xs font-mono text-foreground/90 bg-white overflow-x-auto leading-relaxed whitespace-pre-wrap">
          {content}
        </pre>
      )}
    </div>
  );
}

export default function MethodologyPage() {
  return (
    <div>
      <PageHeader
        title="Methodology"
        description="A transparent account of the data sources, LLM models, retrieval approach, region definitions, and limitations of this visualization."
        showCitation={false}
      />

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-12">

        {/* 1. Data Provenance */}
        <section>
          <SectionHeading num="1" title="Data Provenance" />
          <div className="space-y-4 text-sm text-foreground/90 leading-relaxed">
            <p>
              All data displayed in this dashboard originates from the crisesStorylinesRAG
              dataset published by Ronco et al. (2026) on Zenodo under a{" "}
              <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Creative Commons Attribution 4.0 International (CC-BY-4.0)
              </a>{" "}
              licence. This visualization project adds no new factual claims about
              disasters — it re-presents and aggregates the original data.
            </p>
            <div className="bg-muted/40 border border-border rounded-lg px-4 py-3">
              <p className="font-semibold mb-2 text-foreground">Zenodo record</p>
              <p>
                DOI:{" "}
                <a
                  href="https://doi.org/10.5281/zenodo.18598183"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-mono"
                >
                  10.5281/zenodo.18598183
                </a>
              </p>
              <p className="mt-1">
                Files used:{" "}
                <code className="font-mono bg-muted px-1 rounded">DisasterStory.csv</code>,{" "}
                <code className="font-mono bg-muted px-1 rounded">triplet_expert_val.xlsx</code>,{" "}
                <code className="font-mono bg-muted px-1 rounded">input_emdat_1424.xlsx</code>
              </p>
            </div>
          </div>
        </section>

        {/* 2. Original Pipeline */}
        <section>
          <SectionHeading num="2" title="Original Pipeline Summary (Ronco et al.)" />
          <div className="space-y-4 text-sm text-foreground/90 leading-relaxed">
            <p>
              The crisesStorylinesRAG pipeline operates in four stages. First,
              it queries the European Media Monitor (EMM) semantic search system
              using metadata from the EM-DAT disaster registry to retrieve relevant
              news documents for each event. Second, a large language model synthesises
              these documents into a structured narrative storyline with seven sections
              (key information, severity, drivers, impacts, multi-hazard risks, best
              practices, and recovery recommendations). Third, the same LLM extracts
              a causal knowledge graph as a list of triplets in the form{" "}
              <code className="font-mono bg-muted px-1 rounded">[source, relation, target]</code>
              {" "}where relation is either{" "}
              <code className="font-mono bg-muted px-1 rounded">causes</code> or{" "}
              <code className="font-mono bg-muted px-1 rounded">prevents</code>.
            </p>
            <div className="bg-muted/40 border border-border rounded-lg px-4 py-3 space-y-1">
              <p>
                <span className="font-semibold">Original LLM (storylines + triplets):</span>{" "}
                <code className="font-mono bg-muted px-1 rounded">llama-3.3-70b-instruct</code>{" "}
                via GPT@JRC API (European Commission)
              </p>
              <p>
                <span className="font-semibold">Expert validation:</span>{" "}
                6 independent annotators · 1,000 randomly sampled triplets ·
                Krippendorff&apos;s α and Cohen&apos;s κ reported
              </p>
              <p>
                <span className="font-semibold">Coverage:</span>{" "}
                1,424 events · 2014–2024 · global scope
              </p>
            </div>
          </div>
        </section>

        {/* 3. This Visualization's LLM Usage */}
        <section>
          <SectionHeading num="3" title="This Visualization's LLM Usage" />
          <div className="space-y-4 text-sm text-foreground/90 leading-relaxed">
            <p>
              This dashboard uses an LLM in a single, bounded way: to synthesise
              pre-defined analytical questions against the existing triplet dataset.
              The LLM does{" "}
              <span className="font-semibold">not generate new knowledge</span> — it
              summarises patterns already present in the retrieved triplets. All outputs
              are generated offline once and stored as static JSON; no LLM calls occur
              when users browse the site.
            </p>
            <div className="bg-muted/40 border border-border rounded-lg px-4 py-3 space-y-2">
              <div className="grid grid-cols-[140px_1fr] gap-1 text-xs">
                <span className="font-semibold text-muted-foreground">Model</span>
                <code className="font-mono">claude-3-5-sonnet-20241022</code>
                <span className="font-semibold text-muted-foreground">Provider</span>
                <span>Anthropic (API)</span>
                <span className="font-semibold text-muted-foreground">Run mode</span>
                <span>One-time offline run · outputs committed to repository</span>
                <span className="font-semibold text-muted-foreground">Embedding model</span>
                <code className="font-mono">sentence-transformers/all-MiniLM-L6-v2</code>
                <span className="font-semibold text-muted-foreground">Vector store</span>
                <span>LanceDB (in-memory, offline only)</span>
                <span className="font-semibold text-muted-foreground">Retrieval k</span>
                <span>Top-20 semantically similar triplets per question</span>
                <span className="font-semibold text-muted-foreground">Questions answered</span>
                <span>12 pre-defined analytical questions (see Insights page)</span>
                <span className="font-semibold text-muted-foreground">Run timestamp</span>
                <span>Disclosed per insight card (stored in insights.json)</span>
              </div>
            </div>
            <CollapsibleCode
              label="View full system prompt (verbatim)"
              content={SYSTEM_PROMPT}
            />
            <p className="text-xs text-muted-foreground">
              Confidence scores on each insight card are computed by cross-referencing
              the disaster types of retrieved triplets against the expert validation
              precision scores from{" "}
              <code className="font-mono bg-muted px-1 rounded">triplet_expert_val.xlsx</code>.
            </p>
          </div>
        </section>

        {/* 4. Region Groupings */}
        <section>
          <SectionHeading num="4" title="Region Groupings" />
          <div className="space-y-4 text-sm text-foreground/90 leading-relaxed">
            <p>{REGION_RATIONALE}</p>
            <div className="space-y-3">
              {Object.entries(REGION_COUNTRY_LISTS).map(([region, countries]) => (
                <details key={region} className="border border-border rounded-lg overflow-hidden">
                  <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-foreground hover:bg-muted/40 transition-colors bg-muted/20 list-none flex items-center justify-between">
                    <span>{region}</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {countries.length} countries
                    </span>
                  </summary>
                  <div className="px-4 py-3 bg-white text-xs text-muted-foreground">
                    {countries.join(", ")}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Data Processing */}
        <section>
          <SectionHeading num="5" title="Data Processing Decisions" />
          <div className="space-y-3 text-sm text-foreground/90 leading-relaxed">
            <ul className="space-y-3 list-none">
              {[
                {
                  title: "Node normalisation",
                  desc: 'Triplet node labels are lowercased, whitespace-stripped, and lightly singularised (e.g. "floodings" → "flooding"). This reduces fragmentation without losing meaning.',
                },
                {
                  title: "Duplicate handling",
                  desc: "Identical [source, relation, target] triplets from different events are collapsed; the count tracks frequency across all events. This frequency drives node sizes in the force graph.",
                },
                {
                  title: "Triplet parsing",
                  desc: "The causal graph column in DisasterStory.csv is stored as a Python-literal string. It is parsed with ast.literal_eval with a regex fallback. Events with unparseable causal graphs are logged and excluded from triplet analysis (their event metadata is still included).",
                },
                {
                  title: "Missing coordinates",
                  desc: "Country centroids are taken from a built-in lookup of ~150 common disaster-affected countries. Countries not in the lookup appear in statistics but not on the map.",
                },
                {
                  title: "Economic losses",
                  desc: "Economic loss values are kept in their original currency (as reported in EM-DAT) and are not converted or normalised. Cross-country comparison of this figure is not recommended.",
                },
                {
                  title: "Graph size",
                  desc: "The force-directed graph is limited to the top 200 nodes by global frequency to maintain performance in the browser. All triplets are available in the underlying JSON.",
                },
              ].map(({ title, desc }) => (
                <li key={title} className="bg-card border border-border rounded-lg px-4 py-3">
                  <p className="font-semibold text-foreground mb-1">{title}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 6. Limitations */}
        <section>
          <SectionHeading num="6" title="Limitations & Caveats" />
          <div className="space-y-3 text-sm text-foreground/90 leading-relaxed">
            <div className="bg-destructive/8 border border-destructive/20 rounded-lg px-5 py-4">
              <p className="font-semibold text-foreground mb-3">Please read before drawing conclusions</p>
              <ul className="space-y-3 text-muted-foreground text-xs">
                <li>
                  <span className="font-semibold text-foreground">News-source bias:</span>{" "}
                  The dataset reflects events covered in the European Media Monitor (EMM). Events
                  in regions with lower English/European-language media coverage are likely
                  under-represented.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Language bias:</span>{" "}
                  EMM primarily indexes European-language news sources. Disaster events in
                  under-reported regions may appear with fewer causal triplets even where
                  extensive local reporting exists.
                </li>
                <li>
                  <span className="font-semibold text-foreground">LLM hallucination:</span>{" "}
                  The original LLM pipeline (llama-3.3-70b-instruct) has a documented error rate
                  visible in the Audit page. The overall expert-validated precision score is the
                  best available estimate of reliability.
                </li>
                <li>
                  <span className="font-semibold text-foreground">AI synthesis scope:</span>{" "}
                  The Claude-generated insights on the Insights page are constrained to the
                  retrieved triplets only. They cannot make claims beyond what the source data
                  contains.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Static snapshots:</span>{" "}
                  Pre-generated insights reflect the dataset and model state at the time the
                  script was run. The run timestamp is shown on each insight card.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Not an operational tool:</span>{" "}
                  This is a research visualization. It should not be used for operational
                  disaster-response decision-making.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer links */}
        <div className="border-t border-border pt-6 text-xs text-muted-foreground space-y-1">
          <p>
            Source code for this visualization:{" "}
            <a
              href="https://github.com/kelknightly/crisis-storylines-global"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              github.com/kelknightly/crisis-storylines-global
            </a>
          </p>
          <p>
            Original pipeline code:{" "}
            <a
              href="https://github.com/jrcf7/crisesStorylinesRAG"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              github.com/jrcf7/crisesStorylinesRAG
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}
