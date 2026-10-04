import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import MatterModel from "@/model/Matter";
import ConversationModel, { REGULAR_CHATS } from "@/model/Conversation";
import DocumentAnalysisModel from "@/model/DocumentAnalysis";
import LegalDraftModel from "@/model/LegalDraft";
import CaseModel from "@/model/Case";
import { getSessionUserId } from "@/lib/matter-links";

export const runtime = "nodejs";

/**
 * GET /api/matters/[id]/candidates
 * The user's recent chats, documents, drafts, and cases that aren't in any matter yet,
 * so they can be added with one tap.
 */
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    if (!userId || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
    }
    await dbConnect();
    if (!(await MatterModel.exists({ _id: id, userId }))) {
      return NextResponse.json({ success: false, error: "Matter not found." }, { status: 404 });
    }

    const unlinked = { userId, matterId: null };
    const [chats, documents, drafts, cases] = await Promise.all([
      ConversationModel.find({ ...unlinked, ...REGULAR_CHATS }).sort({ updatedAt: -1 }).limit(20).select("title updatedAt").lean(),
      DocumentAnalysisModel.find(unlinked).sort({ createdAt: -1 }).limit(20).select("fileName documentCategory createdAt").lean(),
      LegalDraftModel.find(unlinked).sort({ updatedAt: -1 }).limit(20).select("title draftType updatedAt").lean(),
      CaseModel.find(unlinked).sort({ updatedAt: -1 }).limit(20).select("caseNumber title court updatedAt").lean(),
    ]);

    return NextResponse.json({
      success: true,
      chat: chats.map((c: any) => ({ id: c._id.toString(), title: c.title, detail: "" })),
      document: documents.map((d: any) => ({ id: d._id.toString(), title: d.fileName, detail: d.documentCategory })),
      draft: drafts.map((d: any) => ({ id: d._id.toString(), title: d.title, detail: d.draftType })),
      case: cases.map((c: any) => ({ id: c._id.toString(), title: c.title, detail: `${c.caseNumber} · ${c.court}` })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Could not load items." }, { status: 500 });
  }
}
