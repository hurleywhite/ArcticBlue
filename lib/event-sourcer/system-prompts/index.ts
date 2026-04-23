import { BASE_SYSTEM_PROMPT } from "../system-prompt";
import { ANURAAG_PROMPT } from "./anuraag";
import { SCOTT_PROMPT } from "./scott";
import { JEROME_PROMPT } from "./jerome";
import { JOE_PROMPT } from "./joe";

/*
  Prompt lookup for per-partner baked-in system prompts.

  Thor (and any Blank / custom run) continues to use the generic
  BASE_SYSTEM_PROMPT with the full RUNTIME INPUTS numbering pattern.

  Anuraag, Scott, Jerome, and Joe each use a partner-specific prompt
  where the profile (audience, themes, sector lens, regional scope,
  sourcing queries, exclusions) is hardcoded. The operator only
  supplies runtime inputs the prompt expects (TIME WINDOW, HOME BASE,
  SESSION SIZE, and for Joe ACTIVE CLIENT CONTEXT).
*/

export type PromptKey =
  | "generic"
  | "anuraag"
  | "scott"
  | "jerome"
  | "joe";

export function getSystemPrompt(key: PromptKey): string {
  switch (key) {
    case "anuraag":
      return ANURAAG_PROMPT;
    case "scott":
      return SCOTT_PROMPT;
    case "jerome":
      return JEROME_PROMPT;
    case "joe":
      return JOE_PROMPT;
    case "generic":
    default:
      return BASE_SYSTEM_PROMPT;
  }
}

export { ANURAAG_PROMPT, SCOTT_PROMPT, JEROME_PROMPT, JOE_PROMPT };
