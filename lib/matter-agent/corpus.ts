import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import MatterModel from "@/model/Matter";
import ConversationModel, { REGULAR_CHATS } from "@/model/Conversation";
import MessageModel from "@/model/Message";
import DocumentAnalysisModel from "@/model/DocumentAnalysis";
import LegalDraftModel from "@/model/LegalDraft";
import CaseModel from "@/model/Case";
import { DRAFT_TEMPLATES } from "@/lib/drafting/templates";
import { Chunk, ItemKind, chunkText } from "./retrieval";
import { itemTag } from "./tags";

/** One line per record, so the agent knows what exists before it searches. */
export interface ItemIndexEntry {
  kind: ItemKind;
  id: string;
  /** Short citation tag, e.g. "doc-02ee1". */
  tag: string;
  title: string;
  detail: string;
}

export interface MatterCorpus {
  matterId: string;
  matterTitle: string;
  /** The matter's own facts: category, status, summary, next action, checklist. */
  brief: string;
  items: ItemIndexEntry[];
  chunks: Chunk[];
  /** The whole readable text of each record, keyed `${kind}:${id}`, for the read_record tool. */
  records: Map<string, { title: string; text: string }>;
}

const MAX_PER_KIND = 12;
const MAX_CHARS_PER_MESSAGE = 3000;
const MAX_MESSAGES_PER_CHAT = 60;
const MAX_ORIGINAL_TEXT = 40_000;
const MAX_SIMPLIFIED_TEXT = 10_000;
const MAX_DRAFT_TEXT = 40_000;

const fmtDate = (value: unknown) => {
  if (!value) return "";
  const d = new Date(value as any);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
};

const clip = (value: unknown, max: number) => {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
};

/** Loads everything the signed-in user has saved in one matter. Returns null if it isn't theirs. */
export async function loadMatterCorpus(userId: string, matterId: string): Promise<MatterCorpus | null> {
  if (!mongoose.Types.ObjectId.isValid(matterId)) return null;
  await dbConnect();
  const matter: any = await MatterModel.findOne({ _id: matterId, userId }).lean();
  if (!matter) return null;

  const [chats, documents, drafts, cases] = await Promise.all([
    ConversationModel.find({ userId, matterId: matter._id, ...REGULAR_CHATS }).sort({ updatedAt: -1 }).limit(MAX_PER_KIND).lean(),
    DocumentAnalysisModel.find({ userId, matterId: matter._id }).sort({ createdAt: -1 }).limit(MAX_PER_KIND).lean(),
    LegalDraftModel.find({ userId, matterId: matter._id }).sort({ updatedAt: -1 }).limit(MAX_PER_KIND).lean(),
    CaseModel.find({ userId, matterId: matter._id }).sort({ updatedAt: -1 }).limit(MAX_PER_KIND).lean(),
  ]);

  const items: ItemIndexEntry[] = [];
  const chunks: Chunk[] = [];
  const records = new Map<string, { title: string; text: string }>();

  const addRecord = (kind: ItemKind, id: string, title: string, text: string, sections?: string[]) => {
    records.set(`${kind}:${id}`, { title, text });
    // Each logical section becomes its own chunk(s) so a clause or a ruling stays together.
    const parts = sections && sections.length ? sections : [text];
    let n = 0;
    for (const part of parts) {
      for (const piece of chunkText(part)) {
        chunks.push({ id: `${kind}:${id}#${n++}`, kind, itemId: id, title, text: piece });
      }
    }
  };

  // ---- The matter itself
  const open = (matter.checklist || []).filter((c: any) => !c.completed);
  const done = (matter.checklist || []).filter((c: any) => c.completed);
  const brief = [
    `Matter: ${matter.title}`,
    `Category: ${matter.category}. Status: ${matter.status}.`,
    matter.summary ? `Summary: ${clip(matter.summary, 1500)}` : "Summary: (none written yet)",
    `Next action: ${matter.nextAction || "not set"}${matter.nextActionDue ? ` (due ${fmtDate(matter.nextActionDue)})` : ""}`,
    open.length ? `Open checklist items: ${open.map((c: any) => c.text).join("; ")}` : "Open checklist items: none",
    done.length ? `Completed checklist items: ${done.map((c: any) => c.text).join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  addRecord("matter", matter._id.toString(), "Matter notes", brief);

  // ---- Chats
  for (const chat of chats as any[]) {
    const id = chat._id.toString();
    const messages: any[] = await MessageModel.find({ conversationId: chat._id }).sort({ createdAt: 1 }).lean();
    const recent = messages.slice(-MAX_MESSAGES_PER_CHAT);
    const transcript = recent
      .map((m) => `${m.role === "user" ? "User" : "AI"}: ${clip(m.content, MAX_CHARS_PER_MESSAGE)}`)
      .join("\n\n");
    items.push({ kind: "chat", id, tag: itemTag("chat", id), title: chat.title, detail: `${messages.length} messages, last active ${fmtDate(chat.updatedAt)}` });
    addRecord("chat", id, chat.title, `AI chat: ${chat.title}\n\n${transcript || "(no messages yet)"}`);
  }

  // ---- Document reviews
  for (const doc of documents as any[]) {
    const id = doc._id.toString();
    const title = doc.fileName;
    items.push({ kind: "document", id, tag: itemTag("document", id), title, detail: `${doc.documentCategory}, risk ${doc.riskScore}/100, checked ${fmtDate(doc.createdAt)}` });

    const sections: string[] = [
      [
        `Document: ${title} (${doc.documentCategory}). Risk score: ${doc.riskScore}/100.`,
        doc.parties?.length ? `Parties: ${doc.parties.join(", ")}.` : "",
        `Summary: ${doc.executiveSummary}`,
      ]
        .filter(Boolean)
        .join("\n"),
    ];
    if (doc.keyObligations?.length) sections.push(`Key obligations in ${title}:\n${doc.keyObligations.map((o: string) => `- ${o}`).join("\n")}`);
    for (const c of doc.riskyClauses || []) {
      sections.push(
        [
          `Risky clause in ${title}: ${c.clauseTitle} (${c.riskLevel} risk).`,
          `The document says: "${c.clauseText}"`,
          `Why it is risky: ${c.explanation}`,
          c.recommendation ? `Recommended safeguard: ${c.recommendation}` : "",
          c.statutoryReference ? `Law: ${c.statutoryReference}` : "",
        ]
          .filter(Boolean)
          .join("\n")
      );
    }
    if (doc.actionChecklist?.length) sections.push(`Before-signing checklist for ${title}:\n${doc.actionChecklist.map((a: string) => `- ${a}`).join("\n")}`);
    if (doc.statutoryReferences?.length) {
      sections.push(
        `Laws that apply to ${title}:\n${doc.statutoryReferences.map((s: any) => `- ${s.act} Section ${s.section} (${s.title}): ${s.relevance}`).join("\n")}`
      );
    }
    const original = clip(doc.originalText, MAX_ORIGINAL_TEXT);
    if (original) sections.push(`Full text of ${title}:\n${original}`);
    const simplified = clip(doc.simplifiedText, MAX_SIMPLIFIED_TEXT);
    if (simplified) sections.push(`Simplified overview of ${title}:\n${simplified}`);

    // The readable record is the analysis plus the original text; the chunks cover the same material.
    addRecord("document", id, title, sections.join("\n\n"), sections);
  }

  // ---- Drafts
  for (const draft of drafts as any[]) {
    const id = draft._id.toString();
    const template = DRAFT_TEMPLATES.find((t) => t.id === draft.draftType);
    const kindLabel = template?.shortTitle ?? draft.draftType;
    items.push({ kind: "draft", id, tag: itemTag("draft", id), title: draft.title, detail: `${kindLabel}, updated ${fmtDate(draft.updatedAt)}` });

    const answers = Object.entries(draft.formData || {})
      .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
      .map(([k, v]) => `${k}: ${v}`)
      .join("; ");
    const sections: string[] = [`Drafted document: ${draft.title} (${kindLabel}). Answers the user gave: ${clip(answers, 2000) || "n/a"}`];
    const body = clip(draft.generatedContent, MAX_DRAFT_TEXT);
    if (body) sections.push(`Text of the draft "${draft.title}":\n${body}`);
    addRecord("draft", id, draft.title, sections.join("\n\n"), sections);
  }

  // ---- Court cases
  for (const c of cases as any[]) {
    const id = c._id.toString();
    items.push({ kind: "case", id, tag: itemTag("case", id), title: c.title, detail: `${c.caseNumber}, ${c.court}, ${c.stage}${c.nextHearingDate ? `, next hearing ${fmtDate(c.nextHearingDate)}` : ""}` });
    const lines = [
      `Court case: ${c.title}`,
      `Case number: ${c.caseNumber}${c.cnrNumber ? ` (CNR ${c.cnrNumber})` : ""}`,
      `Court: ${c.court}. Type: ${c.caseType}. Stage: ${c.stage}. Status: ${c.status}.`,
      c.petitioner || c.opponentName ? `Parties: ${c.petitioner || "?"} versus ${c.opponentName || "?"}.` : "",
      c.judgeName ? `Judge: ${c.judgeName}.` : "",
      c.filingDate ? `Filed: ${fmtDate(c.filingDate)}.` : "",
      c.nextHearingDate ? `Next hearing: ${fmtDate(c.nextHearingDate)}.` : "No next hearing date recorded.",
      c.notes ? `Notes: ${clip(c.notes, 2000)}` : "",
      (c.timeline || []).length
        ? `Timeline:\n${(c.timeline as any[]).map((e) => `- ${fmtDate(e.date)}: ${e.title}. ${e.description}`).join("\n")}`
        : "",
    ].filter(Boolean);
    addRecord("case", id, c.title, lines.join("\n"));
  }

  return { matterId: matter._id.toString(), matterTitle: matter.title, brief, items, chunks, records };
}
