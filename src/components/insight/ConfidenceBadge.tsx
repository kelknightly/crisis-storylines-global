import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

type Label = "Expert Verified" | "Mixed" | "Model Generated";

interface Props {
  label: Label;
  score?: number;
  className?: string;
}

const CONFIG: Record<
  Label,
  { icon: React.ElementType; bg: string; text: string; border: string }
> = {
  "Expert Verified": {
    icon: CheckCircle2,
    bg: "bg-accent",
    text: "text-accent-foreground",
    border: "border-[oklch(0.67_0.1_152)]",
  },
  Mixed: {
    icon: HelpCircle,
    bg: "bg-secondary",
    text: "text-secondary-foreground",
    border: "border-border",
  },
  "Model Generated": {
    icon: AlertCircle,
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive/30",
  },
};

export default function ConfidenceBadge({ label, score, className }: Props) {
  const config = CONFIG[label];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border font-medium",
        config.bg,
        config.text,
        config.border,
        className
      )}
      title={`Expert validation score: ${score != null ? (score * 100).toFixed(0) + "%" : "n/a"}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {label}
      {score != null && (
        <span className="opacity-70 font-mono">
          {(score * 100).toFixed(0)}%
        </span>
      )}
    </span>
  );
}
