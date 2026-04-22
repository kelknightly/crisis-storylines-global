"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/trends", label: "Trends" },
  { href: "/audit", label: "Audit" },
  { href: "/insights", label: "Insights" },
  { href: "/methodology", label: "Methodology" },
  { href: "/about", label: "About" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-sm tracking-tight">
            <span className="text-foreground">crisesStorylines</span>
            <span className="text-muted-foreground font-normal"> Global</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 flex-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* GitHub links */}
        <div className="flex items-center gap-1">
          <a
            href="https://github.com/kelknightly/crisis-storylines-global"
            target="_blank"
            rel="noopener noreferrer"
            title="This visualization (kelknightly/crisis-storylines-global)"
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="sr-only">Source code on GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
