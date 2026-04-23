import { anthropic, MODELS } from "@/lib/anthropic";
import type { ClaudeExtractionResult, JobListing } from "./types";
import { EMPTY_TECH_STACK } from "./types";

/*
  Tech-stack extraction — runs Claude Sonnet 4.6 over job descriptions
  to identify named technologies and categorize them. Ported from the
  existing arcticmind-tech-stack-analyzer repo, updated to use our
  shared lib/anthropic client and model constant.
*/

const SYSTEM_PROMPT = `You are a tech stack analyst. Given a set of job listings from a company, extract every specific technology, tool, platform, framework, programming language, and software product mentioned.

Categorize each into exactly one of these categories:
- cloud_infrastructure (AWS, GCP, Azure, Terraform, etc.)
- data_engineering (Snowflake, dbt, Airflow, Spark, etc.)
- backend (Python, Java, Go, Node.js, etc.)
- frontend (React, TypeScript, Next.js, Vue, etc.)
- mobile (Swift, Kotlin, React Native, Flutter, etc.)
- devops_ci_cd (Docker, Kubernetes, Jenkins, GitHub Actions, etc.)
- databases (PostgreSQL, MongoDB, Redis, DynamoDB, etc.)
- marketing_sales (HubSpot, Salesforce, Marketo, etc.)
- design (Figma, Sketch, Adobe XD, etc.)
- project_management (Jira, Asana, Linear, Notion, etc.)
- ai_ml (TensorFlow, PyTorch, LangChain, OpenAI, etc.)
- security (Okta, CrowdStrike, Snyk, etc.)
- communication (Slack, Teams, Zoom, etc.)
- other (anything that doesn't fit above)

Rules:
- Only extract SPECIFIC NAMED tools/technologies — not generic skills like "communication" or "teamwork"
- De-duplicate across all listings
- If a technology could fit multiple categories, pick the most specific one
- Return ONLY valid JSON, no markdown, no preamble

Respond with this exact JSON structure:
{
  "tech_stack": { ...categories with arrays of strings... },
  "summary": "2-3 sentence summary of this company's technical profile",
  "confidence": "high|medium|low"
}`;

const MAX_DESCRIPTION_CHARS = 1500;
const MAX_JOBS = 20;

function formatJobsForPrompt(jobs: JobListing[], companyName: string): string {
  const trimmed = jobs.slice(0, MAX_JOBS);
  const formatted = trimmed
    .map((job, i) => {
      const desc =
        job.description.length > MAX_DESCRIPTION_CHARS
          ? job.description.slice(0, MAX_DESCRIPTION_CHARS) + "..."
          : job.description;
      return `--- Job ${i + 1}: ${job.title} ---\nLocation: ${job.location}\n${desc}`;
    })
    .join("\n\n");
  return `Analyze these ${trimmed.length} job listings from ${companyName} and extract their tech stack:\n\n${formatted}`;
}

export async function extractTechStack(
  jobs: JobListing[],
  companyName: string
): Promise<ClaudeExtractionResult> {
  const client = anthropic();
  const user = formatJobsForPrompt(jobs, companyName);

  const response = await client.messages.create({
    model: MODELS.PRACTICE,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: user }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const parsed = JSON.parse(textBlock.text) as ClaudeExtractionResult;
  // Guarantee every category is an array
  const merged = { ...EMPTY_TECH_STACK, ...parsed.tech_stack };
  for (const k of Object.keys(EMPTY_TECH_STACK) as Array<keyof typeof EMPTY_TECH_STACK>) {
    if (!Array.isArray(merged[k])) merged[k] = [];
  }
  parsed.tech_stack = merged;
  return parsed;
}
