export type LegalActionPlan = {
  summary?: string;
  nextSteps: string[];
  timeSensitivity?: string;
  recordsToKeep: string[];
};

const cleanMarkdown = (value: string) =>
  value
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/^\s*(?:[-*]|\d+[.)])\s+/, "")
    .trim();

const sectionBody = (markdown: string, heading: string) => {
  const match = markdown.match(
    new RegExp(`^##\\s+${heading}\\s*\\n([\\s\\S]*?)(?=^##\\s+|\\n---\\s*$|$)`, "im")
  );
  return match?.[1]?.trim() || "";
};

const listItems = (section: string) =>
  section
    .split("\n")
    .filter((line) => /^\s*(?:[-*]|\d+[.)])\s+/.test(line))
    .map(cleanMarkdown)
    .filter(Boolean);

/**
 * Extracts the concise, repeatable sections requested from the chat model.
 * Older conversations simply return no plan, allowing the standard Markdown
 * renderer to remain the graceful fallback.
 */
export function extractLegalActionPlan(markdown: string): LegalActionPlan | null {
  const summary = cleanMarkdown(sectionBody(markdown, "📌 Executive Summary"));
  const nextSteps = listItems(sectionBody(markdown, "✅ What To Do Next"));
  const timeSensitivity = cleanMarkdown(sectionBody(markdown, "⏱️ Time Sensitivity"));
  const recordsToKeep = listItems(sectionBody(markdown, "📁 Keep These Records"));

  if (!nextSteps.length) return null;

  return {
    summary: summary || undefined,
    nextSteps: nextSteps.slice(0, 3),
    timeSensitivity: timeSensitivity || undefined,
    recordsToKeep: recordsToKeep.slice(0, 4),
  };
}
