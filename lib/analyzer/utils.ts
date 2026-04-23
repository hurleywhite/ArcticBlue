export function extractDomain(input: string): string {
  let domain = input.trim().replace(/^https?:\/\//, "").replace(/^www\./, "");
  domain = domain.split("/")[0].split("?")[0].split("#")[0];
  if (!domain.includes(".")) {
    domain = domain.toLowerCase().replace(/\s+/g, "") + ".com";
  }
  return domain.toLowerCase();
}

export function extractCompanyName(domain: string): string {
  const cleaned = domain.replace(/^https?:\/\//, "").replace(/^www\./, "");
  const host = cleaned.split("/")[0].split("?")[0].split("#")[0];
  const parts = host.split(".");
  if (parts.length > 2) return parts[parts.length - 2];
  return parts[0];
}

export function getConfidence(jobCount: number): "high" | "medium" | "low" {
  if (jobCount >= 15) return "high";
  if (jobCount >= 5) return "medium";
  return "low";
}
