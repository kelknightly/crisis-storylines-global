import { Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiGeneratedBadgeProps {
  model?: string;
  runDate?: string;
  className?: string;
}

export default function AiGeneratedBadge({
  model = "claude-3-5-sonnet",
  runDate,
  className,
}: AiGeneratedBadgeProps) {
  const displayDate = runDate
    ? new Date(runDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs bg-secondary text-secondary-foreground border border-border",
        className
      )}
      title="This narrative was synthesised by an AI model from retrieved causal triplets. See Methodology for full details."
    >
      <Cpu className="w-3 h-3 shrink-0" />
      AI synthesised · {model}
      {displayDate && (
        <span className="text-muted-foreground">· {displayDate}</span>
      )}
    </span>
  );
}
