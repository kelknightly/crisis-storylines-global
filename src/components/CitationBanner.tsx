import { ExternalLink } from "lucide-react";

const CITATION =
  "Ronco, M., Bandelli, L., Bertolini, L., Consoli, S., Delforge, D., Spadaro, A., Verile, M., & Corbane, C. (2026). " +
  "Disaster storylines and knowledge graphs from global news with large language models and retrieval-augmented generation. " +
  "Zenodo.";

const DOI = "https://doi.org/10.5281/zenodo.18598183";
const ORIGINAL_REPO = "https://github.com/jrcf7/crisesStorylinesRAG";
const HF_SPACE = "https://huggingface.co/spaces/roncmic/crisesStorylinesRAG";
const THIS_REPO = "https://github.com/kelknightly/crisis-storylines-global";

export default function CitationBanner() {
  return (
    <footer className="border-t border-border bg-muted/40 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          {/* Citation block */}
          <div className="flex-1 max-w-2xl">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Data citation
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              {CITATION}{" "}
              <a
                href={DOI}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                {DOI}
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              Data licensed under{" "}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                CC-BY-4.0
              </a>
              . This dashboard is a visualization layer built on the above dataset.
              It is not affiliated with or endorsed by the original authors.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2 text-xs md:items-end shrink-0">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="font-medium">Original pipeline:</span>
              <a
                href={ORIGINAL_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                jrcf7/crisesStorylinesRAG
              </a>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="font-medium">HuggingFace demo:</span>
              <a
                href={HF_SPACE}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                roncmic/crisesStorylinesRAG
              </a>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="font-medium">This visualization:</span>
              <a
                href={THIS_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                kelknightly/crisis-storylines-global
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
