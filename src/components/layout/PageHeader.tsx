import CitationChip from "@/components/CitationChip";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  showCitation?: boolean;
}

export default function PageHeader({
  title,
  description,
  children,
  className,
  showCitation = true,
}: PageHeaderProps) {
  return (
    <div className={cn("pb-8 pt-10 border-b border-border", className)}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-base text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
            {showCitation && (
              <div className="mt-3">
                <CitationChip />
              </div>
            )}
          </div>
          {children && <div className="shrink-0">{children}</div>}
        </div>
      </div>
    </div>
  );
}
