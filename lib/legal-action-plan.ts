/**
 * Splits a chat answer into the parts the UI shows in a structured way (short answer, next steps,
 * deadline, records) and the remaining sections, which are shown collapsed. Accepts both the
 * current headings and the older emoji headings so saved conversations keep working.
 */

export type AnswerSection = { heading: string; body: string };

export type ParsedAnswer = {
  summary: string;
  steps: string[];
  deadline: string;
  records: string[];
  /** Everything else, in order: The law, Court decisions, Other options, etc. */
  sections: AnswerSection[];
};

// Heading text with any leading emoji or symbols removed, lowercased.
const normalise = (heading: string) =>
  heading
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .trim()
    .toLowerCase();

const SUMMARY = ["short answer", "executive summary"];
const STEPS = ["what to do next"];
const DEADLINE = ["deadlines", "deadline", "time sensitivity"];
const RECORDS = ["keep these records"];

const stripRules = (text: string) => text.replace(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/gm, "").trim();

/** List items with their markdown intact (so citation links keep working), markers removed. */
const listItems = (body: string): string[] => {
  const items: string[] = [];
  for (const line of body.split("\n")) {
    const marker = line.match(/^\s*(?:[-*]|\d+[.)])\s+(.*)$/);
    if (marker) items.push(marker[1].trim());
    else if (line.trim() && items.length) items[items.length - 1] += ` ${line.trim()}`;
  }
  return items.filter(Boolean);
};

export function parseAnswer(markdown: string, isStreaming = false): ParsedAnswer {
  let text = markdown.replace(/\r\n/g, "\n");

  // While streaming, a heading with no newline after it yet is still being typed; hold it back
  // so a half-written heading never flashes as a bogus section.
  if (isStreaming && !text.endsWith("\n")) {
    const lastBreak = text.lastIndexOf("\n");
    if (/^#{1,6}/.test(text.slice(lastBreak + 1))) text = text.slice(0, lastBreak + 1);
  }

  const lines = text.split("\n");
  const sections: AnswerSection[] = [];
  let current: AnswerSection | null = null;
  let inFence = false;

  for (const line of lines) {
    if (/^```/.test(line)) inFence = !inFence;
    const heading = !inFence ? line.match(/^##\s+(.+?)\s*$/) : null;
    if (heading) {
      current = { heading: heading[1], body: "" };
      sections.push(current);
    } else if (current) {
      current.body += `${line}\n`;
    }
    // Lines before the first "##" (the "# Title:" line) are intentionally dropped.
  }

  const parsed: ParsedAnswer = { summary: "", steps: [], deadline: "", records: [], sections: [] };
  for (const section of sections) {
    const key = normalise(section.heading);
    const body = stripRules(section.body);
    if (SUMMARY.includes(key)) parsed.summary = body;
    else if (STEPS.includes(key)) parsed.steps = listItems(body);
    else if (DEADLINE.includes(key)) parsed.deadline = body;
    else if (RECORDS.includes(key)) parsed.records = listItems(body);
    else if (body || isStreaming) parsed.sections.push({ heading: section.heading.replace(/^[^\p{L}\p{N}]+/u, "").trim(), body });
  }
  return parsed;
}

/** True when the answer has enough structure for the structured view. */
export const hasStructure = (parsed: ParsedAnswer) => Boolean(parsed.summary || parsed.steps.length);
