-- ArcticMind · Postgres schema
-- Run this against a fresh Supabase project. RLS policies at the bottom.
-- Reference: PROJECT.md section 6.

-- ═══ extensions ══════════════════════════════════════════════════════════════
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ═══ orgs & users ════════════════════════════════════════════════════════════

create table if not exists organizations (
  id              uuid primary key default gen_random_uuid(),
  clerk_org_id    text unique not null,
  name            text not null,
  industry_default text,
  engagement_start date,
  engagement_end   date,
  status          text not null default 'active' check (status in ('active','paused','ended')),
  created_at      timestamptz not null default now()
);

create table if not exists users (
  id                   uuid primary key default gen_random_uuid(),
  clerk_user_id        text unique not null,
  email                text not null,
  name                 text,
  role_title           text,
  role_category        text,
  organization_id      uuid references organizations(id) on delete set null,
  is_admin_arcticblue  boolean not null default false,
  created_at           timestamptz not null default now(),
  last_active_at       timestamptz
);
create index if not exists users_org_idx on users(organization_id);

-- ═══ canvas ══════════════════════════════════════════════════════════════════

create table if not exists canvas_templates (
  id               uuid primary key default gen_random_uuid(),
  role             text not null,
  industry         text not null,
  published        boolean not null default false,
  last_updated_by  uuid references users(id),
  last_updated_at  timestamptz not null default now(),
  unique (role, industry)
);

create table if not exists canvas_opportunities (
  id               uuid primary key default gen_random_uuid(),
  template_id      uuid not null references canvas_templates(id) on delete cascade,
  slug             text not null,
  title            text not null,
  tagline          text,
  detail           text,
  experiment       text,
  risk             text,
  category         text,
  time_to_value     int check (time_to_value between 0 and 10),
  strategic_impact  int check (strategic_impact between 0 and 10),
  cost_to_implement int check (cost_to_implement between 0 and 10),
  expected_roi      int check (expected_roi between 0 and 10),
  tech_maturity     int check (tech_maturity between 0 and 10),
  org_readiness     int check (org_readiness between 0 and 10),
  display_order    int not null default 0,
  created_at       timestamptz not null default now(),
  unique (template_id, slug)
);

create table if not exists canvas_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  template_id      uuid not null references canvas_templates(id),
  role_override    text,
  industry_override text,
  created_at       timestamptz not null default now(),
  last_opened_at   timestamptz not null default now()
);
create index if not exists canvas_sessions_user_idx on canvas_sessions(user_id);

create table if not exists canvas_stars (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references canvas_sessions(id) on delete cascade,
  opportunity_id   uuid not null references canvas_opportunities(id) on delete cascade,
  starred_at       timestamptz not null default now(),
  unique (session_id, opportunity_id)
);

-- ═══ learning hub ════════════════════════════════════════════════════════════

create type module_type as enum ('video','reading','exercise','live_workshop','curated_external');
create type progress_state as enum ('not_started','in_progress','completed');

create table if not exists modules (
  id                 uuid primary key default gen_random_uuid(),
  slug               text unique not null,
  title              text not null,
  subtitle           text,
  description_markdown text,
  module_type        module_type not null,
  estimated_minutes  int,
  video_mux_playback_id text,
  body_mdx           text,
  external_url       text,
  exercise_prompt    text,
  author_name        text,
  author_role        text,
  thumbnail_url      text,
  is_published       boolean not null default false,
  published_at       timestamptz,
  created_by         uuid references users(id),
  created_at         timestamptz not null default now(),
  last_updated_by    uuid references users(id),
  last_updated_at    timestamptz not null default now()
);

create table if not exists module_progress (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references users(id) on delete cascade,
  module_id         uuid not null references modules(id) on delete cascade,
  state             progress_state not null default 'not_started',
  progress_seconds  int not null default 0,
  completed_at      timestamptz,
  first_opened_at   timestamptz,
  last_opened_at    timestamptz,
  unique (user_id, module_id)
);

create table if not exists collections (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  title            text not null,
  description      text,
  cover_image_url  text,
  is_published     boolean not null default false,
  created_at       timestamptz not null default now(),
  last_updated_at  timestamptz not null default now()
);

create table if not exists collection_modules (
  collection_id   uuid not null references collections(id) on delete cascade,
  module_id       uuid not null references modules(id) on delete cascade,
  display_order   int not null default 0,
  primary key (collection_id, module_id)
);

-- ═══ use cases ═══════════════════════════════════════════════════════════════

create table if not exists use_cases (
  id                       uuid primary key default gen_random_uuid(),
  slug                     text unique not null,
  title                    text not null,
  anonymized_client_label  text not null,
  named_client_permission  boolean not null default false,
  named_client_label       text,
  headline_metric          text,
  summary_markdown         text,
  challenge_markdown       text,
  approach_markdown        text,
  outcome_markdown         text,
  pitch_30sec_text         text,
  one_pager_pdf_url        text,
  slides_embed_url         text,
  cover_image_url          text,
  is_published             boolean not null default false,
  published_at             timestamptz,
  created_by               uuid references users(id),
  created_at               timestamptz not null default now(),
  last_updated_by          uuid references users(id),
  last_updated_at          timestamptz not null default now()
);

-- ═══ tools ═══════════════════════════════════════════════════════════════════

create table if not exists prompts (
  id                     uuid primary key default gen_random_uuid(),
  slug                   text unique not null,
  title                  text not null,
  description_markdown   text,
  prompt_body_markdown   text not null,
  variable_definitions   jsonb not null default '[]'::jsonb,
  author_name            text,
  thumbnail_url          text,
  is_published           boolean not null default false,
  published_at           timestamptz,
  created_by             uuid references users(id),
  created_at             timestamptz not null default now(),
  last_updated_by        uuid references users(id),
  last_updated_at        timestamptz not null default now()
);

create type template_kind as enum ('email','brief','analysis','plan','other');

create table if not exists templates (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text unique not null,
  title                text not null,
  description_markdown text,
  template_type        template_kind not null,
  body_mdx             text not null,
  variable_definitions jsonb not null default '[]'::jsonb,
  is_published         boolean not null default false,
  published_at         timestamptz,
  created_by           uuid references users(id),
  created_at           timestamptz not null default now(),
  last_updated_by      uuid references users(id),
  last_updated_at      timestamptz not null default now()
);

create type practice_seed_type as enum ('canvas_opportunity','module_exercise','prompt','blank');

create table if not exists practice_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  title            text,
  seed_type        practice_seed_type not null,
  seed_entity_id   uuid,
  system_prompt    text,
  created_at       timestamptz not null default now(),
  last_message_at  timestamptz
);
create index if not exists practice_sessions_user_idx on practice_sessions(user_id);

create table if not exists practice_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references practice_sessions(id) on delete cascade,
  role        text not null check (role in ('user','assistant')),
  content     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists practice_messages_session_idx on practice_messages(session_id);

-- ═══ tagging (the matching layer) ════════════════════════════════════════════

create type tag_entity_type as enum ('module','use_case','prompt','template');
create type tag_kind as enum ('role','industry','opportunity_category','skill_level','topic');

create table if not exists content_tags (
  id           uuid primary key default gen_random_uuid(),
  entity_type  tag_entity_type not null,
  entity_id    uuid not null,
  tag_type     tag_kind not null,
  tag_value    text not null,
  unique (entity_type, entity_id, tag_type, tag_value)
);
create index if not exists content_tags_lookup_idx on content_tags(tag_type, tag_value);
create index if not exists content_tags_entity_idx on content_tags(entity_type, entity_id);

-- ═══ events (analytics + personalization inputs) ═════════════════════════════

create table if not exists user_events (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references users(id) on delete set null,
  event_type    text not null,
  entity_type   text,
  entity_id     uuid,
  metadata      jsonb,
  timestamp     timestamptz not null default now()
);
create index if not exists user_events_user_idx on user_events(user_id, timestamp desc);
create index if not exists user_events_type_idx on user_events(event_type, timestamp desc);

-- ═══ row level security ══════════════════════════════════════════════════════
-- All RLS below assumes Supabase auth.uid() returns the Clerk user id OR a
-- users.id mapping. Implementation approach documented in lib/supabase/README.md.

alter table users enable row level security;
alter table organizations enable row level security;
alter table canvas_templates enable row level security;
alter table canvas_opportunities enable row level security;
alter table canvas_sessions enable row level security;
alter table canvas_stars enable row level security;
alter table modules enable row level security;
alter table module_progress enable row level security;
alter table collections enable row level security;
alter table collection_modules enable row level security;
alter table use_cases enable row level security;
alter table prompts enable row level security;
alter table templates enable row level security;
alter table practice_sessions enable row level security;
alter table practice_messages enable row level security;
alter table content_tags enable row level security;
alter table user_events enable row level security;

-- Helper: is_admin — true when the calling user has is_admin_arcticblue = true.
-- The service role bypasses RLS automatically; this is for the anon/authenticated path.
create or replace function is_admin_arcticblue()
returns boolean language sql stable as $$
  select coalesce(
    (select is_admin_arcticblue from users where clerk_user_id = auth.jwt() ->> 'sub'),
    false
  );
$$;

-- Helper: current_user_id — maps Clerk sub → users.id
create or replace function current_user_id()
returns uuid language sql stable as $$
  select id from users where clerk_user_id = auth.jwt() ->> 'sub';
$$;

-- Published content: readable by any authenticated user
create policy "published modules readable"
  on modules for select using (is_published = true or is_admin_arcticblue());
create policy "published use_cases readable"
  on use_cases for select using (is_published = true or is_admin_arcticblue());
create policy "published prompts readable"
  on prompts for select using (is_published = true or is_admin_arcticblue());
create policy "published templates readable"
  on templates for select using (is_published = true or is_admin_arcticblue());
create policy "published canvas_templates readable"
  on canvas_templates for select using (published = true or is_admin_arcticblue());
create policy "canvas_opportunities readable via published template"
  on canvas_opportunities for select using (
    exists (select 1 from canvas_templates t where t.id = template_id and (t.published or is_admin_arcticblue()))
  );
create policy "content_tags readable"
  on content_tags for select using (true);

-- Admin writes on content tables
create policy "admin writes modules" on modules for all using (is_admin_arcticblue()) with check (is_admin_arcticblue());
create policy "admin writes use_cases" on use_cases for all using (is_admin_arcticblue()) with check (is_admin_arcticblue());
create policy "admin writes prompts" on prompts for all using (is_admin_arcticblue()) with check (is_admin_arcticblue());
create policy "admin writes templates" on templates for all using (is_admin_arcticblue()) with check (is_admin_arcticblue());
create policy "admin writes canvas_templates" on canvas_templates for all using (is_admin_arcticblue()) with check (is_admin_arcticblue());
create policy "admin writes canvas_opportunities" on canvas_opportunities for all using (is_admin_arcticblue()) with check (is_admin_arcticblue());
create policy "admin writes collections" on collections for all using (is_admin_arcticblue()) with check (is_admin_arcticblue());
create policy "admin writes collection_modules" on collection_modules for all using (is_admin_arcticblue()) with check (is_admin_arcticblue());
create policy "admin writes content_tags" on content_tags for all using (is_admin_arcticblue()) with check (is_admin_arcticblue());

-- User-scoped rows: own only
create policy "own canvas sessions"
  on canvas_sessions for all
  using (user_id = current_user_id())
  with check (user_id = current_user_id());

create policy "own canvas stars"
  on canvas_stars for all
  using (exists (select 1 from canvas_sessions s where s.id = session_id and s.user_id = current_user_id()))
  with check (exists (select 1 from canvas_sessions s where s.id = session_id and s.user_id = current_user_id()));

create policy "own module progress"
  on module_progress for all
  using (user_id = current_user_id())
  with check (user_id = current_user_id());

create policy "own practice sessions"
  on practice_sessions for all
  using (user_id = current_user_id())
  with check (user_id = current_user_id());

create policy "own practice messages"
  on practice_messages for all
  using (exists (select 1 from practice_sessions s where s.id = session_id and s.user_id = current_user_id()))
  with check (exists (select 1 from practice_sessions s where s.id = session_id and s.user_id = current_user_id()));

create policy "own user events"
  on user_events for all
  using (user_id = current_user_id())
  with check (user_id = current_user_id());

-- Users row: read own + admins read all
create policy "read own user row"
  on users for select using (clerk_user_id = auth.jwt() ->> 'sub' or is_admin_arcticblue());

-- Organizations: read own + admins read all
create policy "read own org"
  on organizations for select using (
    id = (select organization_id from users where clerk_user_id = auth.jwt() ->> 'sub')
    or is_admin_arcticblue()
  );

-- Collections + collection_modules readable to all authenticated users
create policy "collections readable"
  on collections for select using (is_published = true or is_admin_arcticblue());
create policy "collection_modules readable"
  on collection_modules for select using (true);
