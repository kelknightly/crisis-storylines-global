import { ExternalLink } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Link from "next/link";

const AUTHORS = [
  { name: "Michele Ronco", affiliation: "European Commission JRC", email: "michele.ronco@ec.europa.eu" },
  { name: "L. Bandelli", affiliation: "Engineering Ingegneria Informatica, Roma" },
  { name: "L. Bertolini", affiliation: "European Commission JRC" },
  { name: "S. Consoli", affiliation: "European Commission JRC" },
  { name: "D. Delforge", affiliation: "UCLouvain, Belgium" },
  { name: "A. Spadaro", affiliation: "Engineering Ingegneria Informatica, Roma" },
  { name: "M. Verile", affiliation: "Engineering Ingegneria Informatica, Roma" },
  { name: "C. Corbane", affiliation: "European Commission JRC" },
];

export default function AboutPage() {
  return (
    <div>
      <PageHeader
        title="About this visualization"
        description="Provenance, attribution, and the relationship between this dashboard and the original research."
        showCitation={false}
      />

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* Primary statement */}
        <section className="bg-secondary/40 border border-secondary rounded-xl px-6 py-5">
          <p className="text-sm text-foreground leading-relaxed">
            <span className="font-semibold">
              This dashboard is a visualization layer.
            </span>{" "}
            All underlying data — the disaster storylines, causal knowledge graph triplets,
            and expert validation annotations — were created entirely by Ronco et al. and
            are reproduced here under the{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Creative Commons Attribution 4.0 International (CC-BY-4.0)
            </a>{" "}
            licence. This project is not affiliated with or endorsed by the original
            authors or the European Commission JRC.
          </p>
        </section>

        {/* Citation */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Full citation</h2>
          <div className="bg-muted border border-border rounded-lg px-5 py-4 font-mono text-sm leading-relaxed text-foreground/90">
            <p>
              Ronco, M., Bandelli, L., Bertolini, L., Consoli, S., Delforge, D.,
              Spadaro, A., Verile, M., &amp; Corbane, C. (2026).{" "}
              <em className="font-serif not-italic">
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
                https://doi.org/10.5281/zenodo.18598183
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </section>

        {/* Authors */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Original authors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AUTHORS.map((author) => (
              <div
                key={author.name}
                className="bg-card border border-border rounded-lg px-4 py-3"
              >
                <p className="font-medium text-sm text-foreground">{author.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{author.affiliation}</p>
                {author.email && (
                  <a
                    href={`mailto:${author.email}`}
                    className="text-xs text-primary hover:underline mt-0.5 block"
                  >
                    {author.email}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Data files */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Data files used</h2>
          <div className="space-y-3">
            {[
              {
                file: "DisasterStory.csv",
                desc: "1,424 disaster events (2014–2024) with AI-generated narrative storylines and causal knowledge graph triplets.",
                size: "5.2 MB",
              },
              {
                file: "triplet_expert_val.xlsx",
                desc: "1,000 randomly sampled triplets annotated by 6 independent disaster-management experts. Used for validation and confidence scoring.",
                size: "431 kB",
              },
              {
                file: "input_emdat_1424.xlsx",
                desc: "EM-DAT disaster registry seed data: disaster type, country, ISO codes, and dates used to guide news retrieval.",
                size: "2.3 MB",
              },
            ].map(({ file, desc, size }) => (
              <div key={file} className="bg-card border border-border rounded-lg px-4 py-3 flex gap-3">
                <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded self-start mt-0.5 shrink-0">
                  {file}
                </code>
                <div>
                  <p className="text-sm text-foreground">{desc}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{size}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Links */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Links</h2>
          <div className="space-y-2">
            {[
              {
                label: "Original dataset (Zenodo)",
                href: "https://zenodo.org/records/18598183",
                desc: "DOI: 10.5281/zenodo.18598183 · CC-BY-4.0",
              },
              {
                label: "Original pipeline code (GitHub)",
                href: "https://github.com/jrcf7/crisesStorylinesRAG",
                desc: "jrcf7/crisesStorylinesRAG — Python pipeline, Gradio app, analysis notebooks",
              },
              {
                label: "Original live demo (HuggingFace)",
                href: "https://huggingface.co/spaces/roncmic/crisesStorylinesRAG",
                desc: "Interactive event-level explorer by the original authors",
              },
              {
                label: "This visualization (GitHub)",
                href: "https://github.com/kelknightly/crisis-storylines-global",
                desc: "kelknightly/crisis-storylines-global — Next.js global synthesis layer",
              },
            ].map(({ label, href, desc }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 bg-card border border-border rounded-lg px-4 py-3 hover:border-primary/50 transition-colors group"
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {label}
                    <ExternalLink className="w-3 h-3 inline ml-1 opacity-50" />
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Methodology link */}
        <div className="bg-muted/40 border border-border rounded-xl px-5 py-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            For a detailed explanation of the LLM models used, region groupings, data
            processing decisions, and limitations of this visualization:
          </p>
          <Link
            href="/methodology"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Read the Methodology →
          </Link>
        </div>

      </div>
    </div>
  );
}
