import Anthropic from "@anthropic-ai/sdk";

/*
  Anthropic client. Used from server routes only — never expose the API
  key to the browser. Two models in rotation:
    - claude-sonnet-4-6  → Canvas fallback + Tools practice chat
    - claude-opus-4-7    → Phase 1F recommendations reasoning

  Streaming is the default for user-facing generation per PROJECT.md:
  first content under 15 seconds.
*/

export const MODELS = {
  CANVAS: "claude-sonnet-4-6",
  PRACTICE: "claude-sonnet-4-6",
  RECOMMEND: "claude-opus-4-7",
} as const;

export function anthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY missing. Set it in .env.local.");
  }
  return new Anthropic({ apiKey });
}
