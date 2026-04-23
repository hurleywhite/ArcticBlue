/*
  Shared types for the seeded content library.
  These mirror the Supabase schema in supabase/schema.sql — when DB
  wiring lands, drop these in favor of generated types from Supabase.
*/

export type ModuleType =
  | "video"
  | "reading"
  | "exercise"
  | "live_workshop"
  | "curated_external";

export type SkillLevel = "intro" | "intermediate" | "advanced";

export type ContentTags = {
  roles?: string[];
  industries?: string[];
  categories?: string[]; // opportunity categories — Growth, Ops, Research, etc.
  topics?: string[];
  skill_level?: SkillLevel;
};

export type Module = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  module_type: ModuleType;
  estimated_minutes: number;
  author_name: string;
  author_role?: string;
  // type-specific
  video_mux_playback_id?: string;
  body_markdown?: string; // for reading modules
  external_url?: string;
  exercise_prompt?: string;
  workshop_date?: string;
  workshop_registration_url?: string;
  tags: ContentTags;
  published_at: string; // ISO date
};

export type UseCase = {
  id: string;
  slug: string;
  title: string;
  anonymized_client_label: string;
  headline_metric: string;
  summary: string;
  challenge_markdown: string;
  approach_markdown: string;
  outcome_markdown: string;
  pitch_30sec: string;
  one_pager_available: boolean;
  slides_available: boolean;
  tags: ContentTags;
  published_at: string;
};

export type PromptVariable = {
  name: string;
  label: string;
  placeholder?: string;
  type: "text" | "textarea" | "select";
  options?: string[];
};

export type Prompt = {
  id: string;
  slug: string;
  title: string;
  description: string;
  prompt_body: string; // supports {{variable_name}}
  variables: PromptVariable[];
  author_name?: string;
  tags: ContentTags;
  published_at: string;
};

export type TemplateKind = "email" | "brief" | "analysis" | "plan" | "other";

export type Template = {
  id: string;
  slug: string;
  title: string;
  description: string;
  template_type: TemplateKind;
  body_markdown: string; // supports {{variable_name}}
  variables: PromptVariable[];
  tags: ContentTags;
  published_at: string;
};

export type Collection = {
  id: string;
  slug: string;
  title: string;
  description: string;
  module_slugs: string[]; // ordered
  tags: ContentTags;
  published_at: string;
};
