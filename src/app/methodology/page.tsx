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

            {/* Triplet definition callout */}
            <div className="bg-primary/5 border-l-4 border-primary/40 rounded-r-lg px-4 py-3 space-y-1.5">
              <p className="font-semibold text-foreground text-xs uppercase tracking-wide">
                What is a causal triplet?
              </p>
              <p>
                A <span className="font-semibold">causal triplet</span> is a structured
                3-part statement{" "}
                <code className="font-mono bg-muted px-1 rounded">
                  [source → relation → target]
                </code>{" "}
                extracted by an LLM from each disaster news storyline. The{" "}
                <code className="font-mono bg-muted px-1 rounded">source</code> and{" "}
                <code className="font-mono bg-muted px-1 rounded">target</code> are causal
                factors (e.g., <em>deforestation</em>, <em>landslide</em>), and{" "}
                <code className="font-mono bg-muted px-1 rounded">relation</code> is
                constrained to either{" "}
                <code className="font-mono bg-muted px-1 rounded">causes</code> or{" "}
                <code className="font-mono bg-muted px-1 rounded">prevents</code>.
                Triplets form the edges of the causal knowledge graph and are the primary
                unit of analysis throughout this dashboard. Definition per{" "}
                <a
                  href="https://github.com/jrcf7/crisesStorylinesRAG"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Ronco et al. (crisesStorylinesRAG)
                </a>.
              </p>
              <p className="text-xs text-muted-foreground">
                Examples:{" "}
                <code className="font-mono bg-muted px-1 rounded">
                  deforestation → causes → landslide
                </code>
                {" · "}
                <code className="font-mono bg-muted px-1 rounded">
                  early warning system → prevents → loss of life
                </code>
              </p>
            </div>

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

        {/* 3. This Visualization's LLM Usage — RAG */}
        <section>
          <SectionHeading num="3" title="How the AI Insights Are Generated (RAG)" />
          <div className="space-y-5 text-sm text-foreground/90 leading-relaxed">

            {/* What RAG is */}
            <p>
              The Insights page uses{" "}
              <span className="font-semibold">Retrieval-Augmented Generation (RAG)</span> — a
              technique that constrains an LLM to reason only over a specific, curated body
              of evidence rather than drawing on its general training knowledge. In this
              implementation the body of evidence is exclusively the 24,954 causal triplets
              extracted by Ronco et al. from 10 years of disaster news. The LLM cannot
              introduce facts from outside that dataset.
            </p>

            {/* Step-by-step flow */}
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="bg-muted/30 px-4 py-2.5 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Three-step pipeline (runs once, offline)
                </p>
              </div>
              <ol className="divide-y divide-border">
                {[
                  {
                    step: "1",
                    title: "Embed & index the full triplet corpus",
                    detail:
                      "Every triplet in triplets_global.json is converted to a dense vector using sentence-transformers/all-MiniLM-L6-v2 and stored in an in-memory LanceDB table. This produces a searchable semantic index of the entire dataset.",
                  },
                  {
                    step: "2",
                    title: "Retrieve the top-20 most relevant triplets",
                    detail:
                      "Each analytical question is embedded with the same model. A cosine-similarity search returns the 20 triplets whose meaning is closest to the question. Optional filters (e.g. disaster type = \"Flood\", relation = \"causes\") narrow retrieval further before fallback to the full corpus if fewer than 5 matches are found.",
                  },
                  {
                    step: "3",
                    title: "Generate a narrative — from retrieved triplets only",
                    detail:
                      "The 20 retrieved triplets are formatted as a numbered evidence list and passed to Gemini 2.5 Flash alongside a strict system prompt. The model is instructed to answer using ONLY those triplets, to reference specific causal relationships, to be precise about geography and time period, and to explicitly state when the evidence is insufficient for a strong conclusion.",
                  },
                ].map(({ step, title, detail }) => (
                  <li key={step} className="flex gap-4 px-4 py-3.5">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                      {step}
                    </span>
                    <div>
                      <p className="font-semibold text-foreground text-xs mb-1">{title}</p>
                      <p className="text-muted-foreground text-xs leading-relaxed">{detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Why this reduces hallucination */}
            <div className="bg-secondary/40 border border-secondary rounded-lg px-4 py-3.5 space-y-2 text-xs">
              <p className="font-semibold text-foreground">Why this reduces hallucination and out-of-scope claims</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <span className="font-semibold text-foreground">Closed context window:</span>{" "}
                  The model receives no internet access and no free-form background knowledge
                  prompt. Its only input is the numbered list of retrieved triplets plus the
                  question. Any claim it makes must be traceable to a specific triplet in that list.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Explicit uncertainty instruction:</span>{" "}
                  The system prompt requires the model to state explicitly when the evidence
                  is insufficient rather than speculating. Vague or sparse evidence surfaces
                  as caveated language in the narrative.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Dataset scope is the bias boundary:</span>{" "}
                  The remaining risk of bias comes from the source data itself — EMM coverage
                  gaps, the original LLM extraction errors (precision ≈ 0.67 per expert
                  validation), and the 12 pre-defined question framings — not from the
                  synthesis model adding external world knowledge.
                </li>
                <li>
                  <span className="font-semibold text-foreground">No live inference:</span>{" "}
                  All 12 insights are generated once offline and committed to the repository
                  as static JSON. Users read fixed, auditable outputs, not live generations.
                  The run timestamp is shown on every insight card.
                </li>
              </ul>
            </div>

            {/* Technical config */}
            <div className="bg-muted/40 border border-border rounded-lg px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-foreground mb-2">Technical configuration</p>
              <div className="grid grid-cols-[160px_1fr] gap-1 text-xs">
                <span className="font-semibold text-muted-foreground">Model</span>
                <code className="font-mono">gemini-2.5-flash</code>
                <span className="font-semibold text-muted-foreground">Provider</span>
                <span>Google AI Studio (API)</span>
                <span className="font-semibold text-muted-foreground">Embedding model</span>
                <code className="font-mono">sentence-transformers/all-MiniLM-L6-v2</code>
                <span className="font-semibold text-muted-foreground">Vector store</span>
                <span>LanceDB (in-memory, offline only — not deployed)</span>
                <span className="font-semibold text-muted-foreground">Retrieval k</span>
                <span>Top-20 semantically similar triplets per question</span>
                <span className="font-semibold text-muted-foreground">Questions answered</span>
                <span>12 pre-defined analytical questions (see Insights page)</span>
                <span className="font-semibold text-muted-foreground">Run mode</span>
                <span>One-time offline script · outputs stored as static JSON</span>
              </div>
            </div>

            <CollapsibleCode
              label="View full system prompt (verbatim)"
              content={SYSTEM_PROMPT}
            />

            <p className="text-xs text-muted-foreground">
              Confidence scores on each insight card are cross-referenced from the expert
              validation precision scores in{" "}
              <code className="font-mono bg-muted px-1 rounded">triplet_expert_val.xlsx</code>
              {" "}by matching the disaster types of the retrieved triplets.
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
                  The AI-generated insights on the Insights page are constrained via RAG to the
                  retrieved triplets only. They cannot make claims beyond what the source data
                  contains (see section 3).
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

        {/* 7. Tech Stack */}
        <section>
          <SectionHeading num="7" title="This Site's Tech Stack" />
          <div className="space-y-4 text-sm text-foreground/90 leading-relaxed">
            <p>
              The visualization is a statically-exported Next.js application — all pages
              are pre-rendered and all data is served as static JSON files. There is no
              server-side logic at runtime, no database, and no live API calls to any
              external service when a user browses the site.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  category: "Framework & language",
                  items: ["Next.js 15 (App Router)", "TypeScript", "React 19"],
                },
                {
                  category: "Styling & UI",
                  items: ["Tailwind CSS", "shadcn/ui (Radix primitives)", "Lucide icons"],
                },
                {
                  category: "Charts & visualisation",
                  items: [
                    "Recharts — bar, donut, sparkline",
                    "React Force Graph 2D — knowledge graph",
                    "React-Leaflet — Leaflet world map",
                  ],
                },
                {
                  category: "Offline data pipeline (Python)",
                  items: [
                    "pandas, numpy — data processing",
                    "pycountry — ISO code resolution",
                    "sentence-transformers — triplet embeddings",
                    "LanceDB — vector search (in-memory)",
                    "google-generativeai — Gemini 2.5 Flash API",
                  ],
                },
                {
                  category: "Deployment",
                  items: ["Vercel (static hosting)", "GitHub (source + CI/CD)"],
                },
                {
                  category: "Data format",
                  items: [
                    "All runtime data served as static JSON from /public/data/",
                    "No server-side database or API",
                    "Pre-generated insights stored as insights.json",
                  ],
                },
              ].map(({ category, items }) => (
                <div key={category} className="bg-card border border-border rounded-lg px-4 py-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {category}
                  </p>
                  <ul className="space-y-1">
                    {items.map((item) => (
                      <li key={item} className="text-xs text-foreground/80 flex gap-1.5">
                        <span className="text-primary mt-px">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
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
