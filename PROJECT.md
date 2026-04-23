# ArcticMind — PROJECT.md

> **Design override:** Section 8 of this spec is superseded by [docs/design-system.md](docs/design-system.md). The canonical visual language for ArcticMind is the **editorial business document** system — Arial throughout, navy `#1F3A5F` + ice blue `#D5E8F0` + light gray-blue `#F3F6F9`, table-based layout grammar, tight spacing, no rounded corners above 2px, no gradients, no decorative icons. The cream + Instrument Serif system described in Section 8 and shown in `prototype/opportunity-canvas.html` is **not** the target. The prototype is preserved as a functional reference for Canvas interactions (screens, starring, quadrant logic, lens switching, roadmap modal, animations, card structure) — re-skin in the editorial language when porting.

## 0. How to use this document

This is the master spec for **ArcticMind** — ArcticBlue AI's continuous-enablement platform for enterprise teams. Phase 1 ships four core surfaces plus an admin CMS:

1. **The Opportunity Canvas** — an interactive, role/industry-specific map of where AI actually moves the needle. A working prototype exists at `prototype/opportunity-canvas.html`. This spec describes how to port it into the full product (re-skinned per the design override above).
2. **The Learning Hub** — a curated, admin-maintained library of modules that help teams build the skills to act on Canvas opportunities.
3. **Use Cases** — a library of anonymized case studies showing ArcticBlue's real engagements. Proof points that make the Learning Hub feel credible and that learners can reference as inspiration.
4. **Tools** — a practice environment: a chat-based sandbox, a curated prompt library, and reusable templates for common AI-assisted work. This is where learners apply what they learn.

Plus an **Admin CMS** for ArcticBlue facilitators to maintain all of the above, and a **News Feed** stub for Phase 2.

**Build order (Phase 1):**
- **Phase 1A** (~2 weeks): Portal shell + auth + Canvas port
- **Phase 1B** (~2 weeks): Learning Hub reader experience
- **Phase 1C** (~1 week): Use Cases library
- **Phase 1D** (~2 weeks): Tools — practice chat, prompt library, templates
- **Phase 1E** (~2 weeks): Admin CMS (all four content types)
- **Phase 1F** (~1 week): Connective tissue — "recommended for you" tying Canvas stars to modules, cases, prompts

Phase 2: News Feed, advanced search, certificates, learning paths, bookmarks, email notifications.

---

## 1. Project context

**ArcticBlue AI** de-risks enterprise AI adoption through experimentation. **ArcticMind** is their continuous-enablement product for client teams — positioned as *"Continuous AI enablement for your team."*

**Three-pillar product framework** (from internal strategy):
1. **Executive enablement** — ArcticBlue's existing advisory offering
2. **Staff training & readiness (Compass)** — the Learning Hub + Tools + Use Cases deliver this digitally
3. **Surface monitoring** — Phase 2+ via News Feed

**The hypothesis:** enterprise leaders and their teams need four things a generic LLM doesn't give them:
- (a) A specific, opinionated map of where AI matters for *their* role in *their* industry → **Canvas**
- (b) Curated learning grounded in ArcticBlue's methodology → **Learning Hub**
- (c) Proof points that show real enterprises succeeding at it → **Use Cases**
- (d) Focused environments to practice what they learn → **Tools**

The value is in the integration between these four, not in any single one. Any single surface could be rebuilt by a client's tech team in 30 minutes. The *integration* cannot — because it depends on ArcticBlue's curated content and the tagging that connects Canvas stars to everything else.

**What this is NOT:** a generic AI training platform. Every case study, every module, every prompt is selected and written by ArcticBlue facilitators with a specific point of view. The CMS is what keeps that curation current without requiring developer involvement.

**Reference materials:**
- `prototype/opportunity-canvas.html` — working Canvas prototype, source of truth for interaction design only (visuals to be re-skinned per design override)
- `docs/design-system.md` — canonical visual language
- Website: https://arcticblue.ai
- AI Practical Labs one-pager (attached to project)

---

## 2. Users and jobs-to-be-done

**Primary user: enterprise team member (learner).**
Works at a client company (Betterment, Autodesk, Turo, Zurich Insurance, etc.). 10–20 people per company are granted access as part of an engagement. Typically mid-senior — PMs, directors, VPs, individual contributors on AI-relevant teams.
Core job: *"Help me figure out where AI matters for my work, give me the shortest path to being good at it, show me it's been done before, and let me practice before trying it on a real deliverable."*

**Secondary user: enterprise executive (sponsor).**
Same company, 1–2 per engagement. Uses the product like any learner; reporting dashboards are Phase 2+.

**Admin user: ArcticBlue facilitator.**
Joe and team members who create and update all content. Not developers. Must manage content through forms and markdown, not code.

---

## 3. The product thesis — one spine across surfaces

**The Opportunity Canvas is the spine.** Every other surface references what the user starred there:

- **Learning Hub** surfaces modules tagged to starred opportunities (Phase 1)
- **Use Cases** surfaces case studies relevant to starred opportunities (Phase 1)
- **Tools** pre-seeds practice prompts with context from starred opportunities (Phase 1)
- **News Feed** filters by starred opportunities (Phase 2)

This integration is the moat. The tagging schema (Section 6) is what makes it work. Tag every piece of content carefully or the product falls back to a generic library.

---

## 4. Guiding principles

1. **Curated, opinionated content is the moat.** The tech is commodity. The moat is that every Canvas card, every module, every case study, every prompt is written by ArcticBlue facilitators with a specific POV.
2. **The Canvas is the entry point.** New users land on the Canvas. First-time UX walks them through generating a Canvas, starring opportunities, then landing on a dashboard with personalized modules + cases + prompts tied to those stars.
3. **Admin experience is first-class.** If Joe can't update a module, case study, or prompt in under 5 minutes without a developer, the product premise fails.
4. **Design consistency with `docs/design-system.md` is non-negotiable.** Editorial business document aesthetic. No SaaS marketing polish.
5. **Progressive disclosure.** New users see one path; returning users see their saved state.
6. **Polish is a feature.** Fortune 500 clients are the users. The aesthetic is The Economist / McKinsey-grade, not Notion / Linear.
7. **Same design language applies to learner-facing and admin-facing surfaces.** No separate "admin dashboard" aesthetic.

---

## 5. Tech stack (opinionated — do not re-litigate)

- **Framework:** Next.js 15 (App Router) + TypeScript
- **UI:** Tailwind CSS + shadcn/ui + Radix primitives (primitives only; visuals re-themed to editorial system)
- **Fonts:** Arial (system). Fallback stack: `Arial, Helvetica, "Helvetica Neue", sans-serif`
- **Icons:** None in the core design language. If a semantic icon is unavoidable (e.g., a star on a Canvas card), use Lucide React at 1.5px stroke. No emoji, no decorative glyphs.
- **Auth:** Clerk — invite-only, organizations feature for client companies
- **DB:** Supabase (Postgres + Row Level Security)
- **File storage:** Supabase Storage (PDFs, decks, thumbnails, prompt exports)
- **Video hosting:** Mux
- **Content authoring:** MDX for reading modules with custom components (Callout, CodeBlock, EmbeddedVideo, ExerciseCard); Tiptap with minimal toolbar for admin
- **AI calls:** Anthropic API
  - Claude Sonnet 4.6 for Canvas fallback generation, Tools practice chat
  - Claude Opus 4.7 for Phase 1F recommendations reasoning
  - Stream all generated content
- **Deployment:** Vercel
- **Analytics:** PostHog
- **Monorepo:** No. Single Next.js app.

---

## 6. Data model

Design the schema so Phase 2/3 additions slot in without breaking changes. The `content_tags` table is the critical matching layer that enables personalization.

See [supabase/schema.sql](supabase/schema.sql) for the full DDL.

**Tables:**
- `organizations`, `users` — Clerk sync
- `canvas_templates`, `canvas_opportunities`, `canvas_sessions`, `canvas_stars`
- `modules`, `module_progress`, `collections`, `collection_modules`
- `use_cases`
- `prompts`, `templates`, `practice_sessions`, `practice_messages`
- `content_tags` (polymorphic, tag_type ∈ {role, industry, opportunity_category, skill_level, topic})
- `user_events`

**Row Level Security:**
- Users only read/write their own `canvas_sessions`, `canvas_stars`, `module_progress`, `practice_sessions`, `practice_messages`, `user_events`.
- Published content tables readable by any authenticated user in an active organization.
- Only `users.is_admin_arcticblue = true` writes to content tables.

---

## 7. Features

### 7.1 Portal shell + auth (Phase 1A)
- Clerk-gated, invite-only via organization.
- Top nav: **Canvas · Learning · Use Cases · Tools · News** — News shows "Coming soon" in Phase 1, others are live.
- Admin users see additional **Admin** link.
- Account dropdown: profile, saved canvases, progress, sign out.
- Dashboard home: see 7.3.
- Visual language per `docs/design-system.md`.

### 7.2 Opportunity Canvas (Phase 1A — port from prototype)
Port all screens (input, loading, canvas, expanded card modal, roadmap modal) and interaction logic from `prototype/opportunity-canvas.html`. Re-skin in the editorial design system — navy header band, Arial, ice-blue callout accents, no cream background, no Instrument Serif.

**Production changes:**
- Content from `canvas_templates` + `canvas_opportunities` tables.
- Auth-gated. Sessions persist to `canvas_sessions`. Stars to `canvas_stars`.
- "New canvas" header button creates a new session.
- For uncurated role/industry combos: "Not yet curated — try: [list]." If admin enables live generation, call Claude Sonnet 4.6, save as draft template.
- "Export brief" button generates a branded PDF (react-pdf or Puppeteer).
- After starring 3+ opportunities and closing the roadmap, prominent CTA: **"See what's next for these opportunities →"** opens a page with tabs for Learning modules, Use Cases, Practice prompts — filtered by star tags.

### 7.3 User Dashboard (Phase 1A/1B)
Home page for returning users. Greeting, Your Canvas card, Recommended for you (mixed modules/cases/prompts), Continue learning, Recent in Practice, New from ArcticBlue.

### 7.4 Learning Hub (Phase 1B)
Three entry paths: My Path, Browse by topic, Collections. Library view with filter chips. Module detail pages render by type (video/reading/exercise/live_workshop/curated_external).

### 7.5 Use Cases (Phase 1C)
Library and detail pages with three form factors: Story (narrative markdown), One-pager (PDF), Slides (optional). Anonymization non-negotiable; per-record override flag for explicit permission. Seed with 7 case studies.

### 7.6 Tools (Phase 1D)
- **Practice** — chat sandbox, seeded from Canvas opportunity / module exercise / prompt / blank
- **Prompt Library** — 12 seeded prompts with variable filling
- **Templates** — 6 seeded structured templates

### 7.7 Admin CMS (Phase 1E)
First-class product. Same design language. Editors for modules, use cases, prompts, templates, canvas templates, collections. List views with filters and inline actions.

### 7.8 Phase 2+ stubs (Phase 1A)
News Feed nav link → "Coming soon" placeholder page.

---

## 8. Design system

**The canonical reference is [docs/design-system.md](docs/design-system.md).** Read it before any UI work. In short: editorial business document — Arial, navy `#1F3A5F`, ice blue `#D5E8F0`, light gray-blue `#F3F6F9`, near-black body `#1A1A1A`, tight spacing, table-based layouts, no gradients / shadows / icons / rounded corners above 2px.

---

## 9. Personalization — the Canvas spine in practice

Given a user's set of starred Canvas opportunities, return ranked content across modules, use cases, prompts, templates.

**Phase 1 scoring:**
- Direct tag match on starred opportunity `category`, user's `role`, user's `industry`: +2 each
- User's skill level matching content skill level: +1
- Published in last 30 days: +0.5
- User's role_category match: +1
- Already-completed module penalty: −5

Return top N per type. Dashboard "Recommended for you" mixes: 2 modules + 2 use cases + 2 prompts.

**Phase 1F:** Claude Opus 4.7 reasons over star pattern and re-ranks top 20 with natural-language justification.

---

## 10. Content seeding (Phase 1 launch)
- Canvas templates — 10 (3 already in prototype)
- Learning Hub modules — 25 (mixed formats)
- Use Cases — 7 anonymized
- Prompts — 12
- Templates — 6
- Collections — 3–5

Content production runs in parallel with engineering.

---

## 11. Anti-goals — what NOT to build

- No AI maturity assessment.
- No general-purpose AI playground. Every practice session is seeded.
- No quiz certifications in Phase 1.
- No social features.
- No custom video hosting — use Mux.
- No complex permissions. Two user types.
- No learner-facing full-text search in Phase 1. Tag filtering is enough.
- No AI-generated library content. Humans write, AI ranks and recommends.
- No named clients in Use Cases without permission flag.
- No mobile-first design. Laptops first, responsive yes.
- No email notifications in Phase 1.
- No Notion-style block editor. Tiptap minimal toolbar is the ceiling.
- No file upload in practice chat (Phase 1).

---

## 12. Success criteria for Phase 1

- A new user, invited by an ArcticBlue admin, signs in, builds their first Canvas in under 3 minutes, stars opportunities, and sees personalized recommendations immediately on their dashboard.
- A user can complete video + reading + exercise modules, progress persisted.
- A user can read a use case in three formats, see related modules, click through to practice prompts.
- A user can start a practice session from three entry points (Canvas opportunity, module exercise, prompt library) with context pre-seeded.
- A user can copy a prompt with filled variables and paste into any AI tool.
- An admin (Joe) can create a new module/use case/prompt/template, tag it, publish it, see it live in under 30 seconds, without a developer.
- PostHog shows which content gets used and which Canvas stars drive downstream behavior.
- A client executive would say *"this is worth paying for"* — because the integration between Canvas, Learning, Use Cases, and Tools feels coherent and tailored.
