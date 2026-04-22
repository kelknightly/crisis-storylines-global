import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface CitationChipProps {
  className?: string;
}

export default function CitationChip({ className }: CitationChipProps) {
  return (
    <a
      href="https://doi.org/10.5281/zenodo.18598183"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border",
        className
      )}
    >
      Data: Ronco et al. (2026)
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}
