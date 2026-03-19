# Opolis Frontend

Next.js frontend for **Opolis** — a member-owned employment cooperative. UI and content match the reference design (opollis_vibe). Built for **SEO** and **Generative Engine Optimization (GEO)** with proper metadata, canonical URLs, structured data, and AI-friendly content.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **React 19**
- No Tailwind — global CSS matching opollis_vibe (Barlow Condensed, Instrument Serif, DM Sans)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, Nav, Footer, org/website JSON-LD
│   ├── page.tsx             # Home
│   ├── globals.css          # Opolis design system (from opollis_vibe)
│   ├── sitemap.ts           # Dynamic sitemap
│   ├── robots.ts            # robots.txt (crawlers + AI bots)
│   ├── the-cooperative/     # How it works
│   ├── eligibility/        # Eligibility + state salary floors
│   ├── benefits/            # Benefits package
│   ├── resources/           # FAQs + JSON-LD FAQPage
│   ├── join/                # Join flow (eligibility check)
│   ├── about/               # About Opolis
│   ├── ai-reference/        # Machine-readable reference for AI/GEO
│   └── contact/             # Contact (hello, membership, support)
├── components/
│   ├── Nav.tsx
│   └── Footer.tsx
└── lib/
    ├── constants.ts         # C (colors), STATE_FLOORS, US_STATES, ROUTES
    └── seo.ts               # buildMetadata, JSON-LD helpers
```

## SEO & GEO

- **Per-page metadata**: `title`, `description`, `canonical` (via `alternates.canonical`), Open Graph, Twitter Card.
- **Structured data**: Root layout includes Organization + WebSite JSON-LD; Resources page includes FAQPage JSON-LD.
- **AI reference**: `/ai-reference` is a minimal, machine-readable page for AI assistants and crawlers (GEO).
- **Sitemap**: `/sitemap.xml` generated from route list.
- **Robots**: `/robots.txt` allows crawlers and common AI bots (GPTBot, ChatGPT-User, Google-Extended, Anthropic-AI), disallows only `/api/`.

## Environment

Optional:

- `NEXT_PUBLIC_SITE_URL` — base URL for canonicals, sitemap, OG (default: `https://opolis.co`).

Copy `.env.example` to `.env.local` and set if needed.

## Commands

```bash
npm install
npm run dev    # http://localhost:3000
npm run build
npm run start
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Home |
| `/the-cooperative` | How it works, tiers, workflow |
| `/eligibility` | Community vs Employee, state minimums |
| `/benefits` | Benefits package |
| `/resources` | FAQs (accordion + FAQPage JSON-LD) |
| `/join` | Join flow with eligibility check |
| `/about` | About Opolis |
| `/ai-reference` | AI/developer machine-readable reference |
| `/contact` | Contact (general, membership, support) |
