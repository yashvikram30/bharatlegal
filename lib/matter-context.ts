import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import MatterModel from "@/model/Matter";
import ConversationModel from "@/model/Conversation";
import DocumentAnalysisModel from "@/model/DocumentAnalysis";
import LegalDraftModel from "@/model/LegalDraft";
import CaseModel from "@/model/Case";

const clip = (value: unknown, max: number) => {
  const text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

/**
 * If this chat belongs to one of the user's matters, describe the matter (and what's saved in it)
 * so the model can tailor its answer. Returns "" when the chat isn't in a matter.
 */
export async function buildMatterContext(conversationId: string, userId: string): Promise<string> {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) return "";
  await dbConnect();
  const convo: any = await ConversationModel.findOne({ _id: conversationId, userId }).select("matterId").lean();
  if (!convo?.matterId) return "";
  const matter: any = await MatterModel.findOne({ _id: convo.matterId, userId }).lean();
  if (!matter) return "";

  const [documents, drafts, cases] = await Promise.all([
    DocumentAnalysisModel.find({ userId, matterId: matter._id }).sort({ createdAt: -1 }).limit(4).select("fileName documentCategory riskScore executiveSummary").lean(),
    LegalDraftModel.find({ userId, matterId: matter._id }).sort({ updatedAt: -1 }).limit(4).select("title draftType").lean(),
    CaseModel.find({ userId, matterId: matter._id }).sort({ updatedAt: -1 }).limit(4).select("caseNumber title court stage nextHearingDate").lean(),
  ]);

  const lines: string[] = [
    "MATTER CONTEXT: the user keeps this chat inside a matter in BharatLegal. Use it to tailor your answer to their real situation. Do not recite it back to them.",
    `- Matter: ${clip(matter.title, 140)} (${matter.category}, ${matter.status})`,
  ];
  if (matter.summary) lines.push(`- Summary: ${clip(matter.summary, 500)}`);
  if (matter.nextAction) {
    const due = matter.nextActionDue ? `, due ${new Date(matter.nextActionDue).toLocaleDateString("en-IN")}` : "";
    lines.push(`- Planned next action: ${clip(matter.nextAction, 200)}${due}`);
  }
  const open = (matter.checklist || []).filter((item: any) => !item.completed).slice(0, 5);
  if (open.length) lines.push(`- Open checklist items: ${open.map((i: any) => clip(i.text, 100)).join("; ")}`);
  for (const d of documents as any[]) {
    lines.push(`- Reviewed document: ${clip(d.fileName, 80)} (${d.documentCategory}, risk ${d.riskScore}/100). ${clip(d.executiveSummary, 220)}`);
  }
  for (const d of drafts as any[]) lines.push(`- Drafted document: ${clip(d.title, 100)}`);
  for (const c of cases as any[]) {
    const hearing = c.nextHearingDate ? `, next hearing ${new Date(c.nextHearingDate).toLocaleDateString("en-IN")}` : "";
    lines.push(`- Court case: ${clip(c.title, 100)} (${c.caseNumber}, ${clip(c.court, 60)}, stage: ${c.stage}${hearing})`);
  }
  return lines.join("\n");
}
