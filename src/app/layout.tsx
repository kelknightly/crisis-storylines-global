import type { Metadata } from "next";
import { Inter, Lora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/layout/TopNav";
import CitationBanner from "@/components/CitationBanner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "crisesStorylines Global — Causal Intelligence Dashboard",
  description:
    "An interactive visualization of 10 years of global disaster causal knowledge graphs. " +
    "Built on data from Ronco et al. (2026) — CC-BY-4.0.",
  openGraph: {
    title: "crisesStorylines Global",
    description:
      "Visualizing 1,424 disaster storylines and causal knowledge graphs across 2014–2024.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${lora.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <TooltipProvider>
          <TopNav />
          <main className="flex-1">{children}</main>
          <CitationBanner />
        </TooltipProvider>
      </body>
    </html>
  );
}
