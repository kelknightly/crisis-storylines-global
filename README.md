# Crisis Storylines — Global Visualiser

> **Disclaimer:** This is a personal passion project. It is **not affiliated with, endorsed by, or connected to** the original researchers or their institutions in any way. This project has no academic affiliation. I simply came across their dataset, found it fascinating, and wanted to explore new ways to visualise and interact with it.

---
## Live site

**[https://crisis-storylines-global.vercel.app](https://crisis-storylines-global.vercel.app)**

No login or account needed — open to everyone, just click and explore.

---
## What is this?

This is an interactive web dashboard for exploring global disaster data — maps, timelines, causal graphs, and AI-generated storylines — built entirely for personal curiosity and learning.

The data and underlying research come from the **crisesStorylinesRAG** project by researchers at the European Commission Joint Research Centre (JRC) and collaborating institutions. All credit for the data and methodology belongs entirely to them.

---

## The original project (all credit goes here)

The data powering this visualiser was produced by the **crisesStorylinesRAG** pipeline, which uses Large Language Models and Retrieval-Augmented Generation on news data to generate structured disaster storylines and causal knowledge graphs.

- **Original GitHub repo:** [https://github.com/jrcf7/crisesStorylinesRAG](https://github.com/jrcf7/crisesStorylinesRAG)
- **Live demo (original):** [https://huggingface.co/spaces/roncmic/crisesStorylinesRAG](https://huggingface.co/spaces/roncmic/crisesStorylinesRAG)
- **Dataset (direct download):** [DisasterStory.csv](https://jeodpp.jrc.ec.europa.eu/ftp/jrc-opendata/ETOHA/storylines/DisasterStory.csv) via the JRC Open Data repository

### Where the underlying data comes from

The original pipeline draws on two external sources:

- **EM-DAT** — a global database of historical disaster events: [https://www.emdat.be/](https://www.emdat.be/)
- **European Media Monitor (EMM)** — large-scale real-time global news monitoring: [https://emm.newsbrief.eu/NewsBrief/alertedition/en/ECnews.html](https://emm.newsbrief.eu/NewsBrief/alertedition/en/ECnews.html)

### Please cite the original authors

If you use the underlying data or research in any meaningful way, please cite the original paper:

> *Disaster Storylines and Knowledge Graphs from Global News with Large Language Models and Retrieval-Augmented Generation*
> Michele Ronco, Luca Bandelli, Lorenzo Bertolini, Sergio Consoli, Damien Delforge, Alessio Spadaro, Marco Verile, Christina Corbane
> European Commission, Joint Research Centre (JRC) · Manuscript under review

---

## Why I built this

I came across the crisesStorylinesRAG dataset and was immediately struck by the richness of what the researchers had created — structured causal storylines for thousands of real-world disasters, spanning a decade of global events. I wanted to dig into it visually: maps, timelines, network graphs, patterns across regions and hazard types. This dashboard is the result of that curiosity.

It is a personal side project only. No funding and no institution.

---

## What this app includes

- **World map** — disaster events plotted geographically with filters by year, region, and disaster type
- **Event explorer** — browse individual events with their full AI-generated storyline and causal knowledge graph
- **Trends** — charts showing patterns over time and across disaster categories
- **Insights** — thematic summaries drawn from the data
- **Methodology & Audit** — transparency pages explaining what the data is and how it was processed

---

## Running it locally

You'll need [Node.js](https://nodejs.org/) installed.

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tech stack

- [Next.js](https://nextjs.org/) — React framework
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [shadcn/ui](https://ui.shadcn.com/) — UI components
- [Recharts](https://recharts.org/) — charts
- [React Leaflet](https://react-leaflet.js.org/) — maps
- [react-force-graph-2d](https://github.com/vasturiano/react-force-graph) — knowledge graph visualisation
- Deployed on [Vercel](https://vercel.com/)

