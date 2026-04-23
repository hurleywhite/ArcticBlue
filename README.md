# ArcticBlue / ArcticMind

Continuous AI enablement platform for enterprise teams. Built by [ArcticBlue AI](https://arcticblue.ai).

## What's in this repo

- [PROJECT.md](PROJECT.md) — master product spec. Start here.
- [docs/design-system.md](docs/design-system.md) — canonical visual language. Editorial business document aesthetic. Read before writing UI.
- [prototype/opportunity-canvas.html](prototype/opportunity-canvas.html) — working Canvas prototype. **Functional reference only** — the visual styling uses an earlier cream + Instrument Serif system that has been superseded by the editorial Arial system in `docs/design-system.md`. Use the prototype for interaction logic (screens, starring, lens switching, roadmap, animations) and re-skin per the design system.
- [supabase/schema.sql](supabase/schema.sql) — full database schema for Phase 1.
- [app/](app/) — Next.js 15 App Router source.

## Phase 1 build order

1A — Portal shell + Clerk auth + Canvas port
1B — Learning Hub reader
1C — Use Cases library
1D — Tools (practice chat, prompt library, templates)
1E — Admin CMS
1F — Personalization layer tying Canvas stars to everything

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in keys
npm run dev
```

Required env vars:
- `ANTHROPIC_API_KEY` — Claude Sonnet 4.6 + Opus 4.7 (required for Practice, Analyzer, Dashboard justifications)
- `SERPAPI_KEY` — enables Company Analyzer job-listing extraction. Without it, the Analyzer falls back to web-search enrichment only.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` — auth (optional until production rollout)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — persistence (optional; UI uses localStorage until wired)
- `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET` — video module playback (Phase 1B+)
- `NEXT_PUBLIC_POSTHOG_KEY` — analytics (optional)

## Design rules at a glance

- Arial everywhere. No Inter, Poppins, Instrument Serif, IBM Plex.
- Two blues do the work: navy `#1F3A5F`, ice blue `#D5E8F0`.
- Near-black body text `#1A1A1A`, muted `#555555`, border `#CCCCCC`.
- Tables are the layout grammar. No floating cards with drop shadows.
- No gradients, no shadows, no rounded corners above 2px, no icons where a word will do.
- Em dashes with spaces — like this — and smart quotes, never straight.
