import Anthropic from "@anthropic-ai/sdk";
import type { JobListing, ClaudeExtractionResult, TechStack } from "./types";

/*
  Ported from hurleywhite/arcticmind-tech-stack-analyzer.
  Claude Sonnet extracts every specific named technology from a set
  of job descriptions and categorizes into 14 buckets.
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
  const trimmedJobs = jobs.slice(0, MAX_JOBS);

  const formattedJobs = trimmedJobs
    .map((job, i) => {
      const desc =
        job.description.length > MAX_DESCRIPTION_CHARS
          ? job.description.slice(0, MAX_DESCRIPTION_CHARS) + "..."
          : job.description;
      return `--- Job ${i + 1}: ${job.title} ---\nLocation: ${job.location}\n${desc}`;
    })
    .join("\n\n");

  return `Analyze these ${trimmedJobs.length} job listings from ${companyName} and extract their tech stack:\n\n${formattedJobs}`;
}

const EXPECTED_CATEGORIES: (keyof TechStack)[] = [
  "cloud_infrastructure",
  "data_engineering",
  "backend",
  "frontend",
  "mobile",
  "devops_ci_cd",
  "databases",
  "marketing_sales",
  "design",
  "project_management",
  "ai_ml",
  "security",
  "communication",
  "other",
];

export async function extractTechStack(
  jobs: JobListing[],
  companyName: string
): Promise<ClaudeExtractionResult> {
  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "No API key found. Set ANTHROPIC_API_KEY in Vercel environment variables."
    );
  }

  const client = new Anthropic({ apiKey });
  const userMessage = formatJobsForPrompt(jobs, companyName);

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    const parsed: ClaudeExtractionResult = JSON.parse(textBlock.text);

    for (const cat of EXPECTED_CATEGORIES) {
      if (!Array.isArray(parsed.tech_stack[cat])) {
        parsed.tech_stack[cat] = [];
      }
    }

    return parsed;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.message.includes("rate_limit") ||
        error.message.includes("429"))
    ) {
      throw new Error(
        "Rate limit reached on the AI API. Please wait a minute and try again."
      );
    }
    throw error;
  }
}
