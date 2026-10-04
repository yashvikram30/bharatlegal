import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import MatterModel from "@/model/Matter";
import DocumentAnalysisModel from "@/model/DocumentAnalysis";
import CaseModel from "@/model/Case";
import ConversationModel, { REGULAR_CHATS } from "@/model/Conversation";
import LegalDraftModel from "@/model/LegalDraft";
import MessageModel from "@/model/Message";
import { LINK_MODELS, LINK_TYPES } from "@/lib/matter-links";
import { formatMatter } from "@/lib/matters";

export const runtime = "nodejs";

async function findOwnedMatter(id: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?._id || (session?.user as any)?.id;
  if (!userId || !mongoose.Types.ObjectId.isValid(id)) return null;
  await dbConnect();
  return MatterModel.findOne({ _id: id, userId });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matter = await findOwnedMatter(id);
  if (!matter) return NextResponse.json({ success: false, error: "Matter not found" }, { status: 404 });
  const documents = await DocumentAnalysisModel.find({ userId: matter.userId, matterId: matter._id })
    .sort({ createdAt: -1 })
    .select("fileName documentCategory riskScore executiveSummary createdAt")
    .lean();
  const cases = await CaseModel.find({ userId: matter.userId, matterId: matter._id })
    .sort({ nextHearingDate: 1, updatedAt: -1 })
    .select("caseNumber title court stage status nextHearingDate updatedAt")
    .lean();
  const chats = await ConversationModel.find({ userId: matter.userId, matterId: matter._id, ...REGULAR_CHATS })
    .sort({ updatedAt: -1 })
    .select("title updatedAt")
    .lean();
  const drafts = await LegalDraftModel.find({ userId: matter.userId, matterId: matter._id })
    .sort({ updatedAt: -1 })
    .select("title draftType updatedAt")
    .lean();
  return NextResponse.json({
    success: true,
    matter: formatMatter(matter),
    chats: chats.map((chat: any) => ({
      id: chat._id.toString(),
      title: chat.title,
      updatedAt: chat.updatedAt,
    })),
    drafts: drafts.map((draft: any) => ({
      id: draft._id.toString(),
      title: draft.title,
      draftType: draft.draftType,
      updatedAt: draft.updatedAt,
    })),
    documents: documents.map((document: any) => ({
      id: document._id.toString(),
      fileName: document.fileName,
      documentCategory: document.documentCategory,
      riskScore: document.riskScore,
      executiveSummary: document.executiveSummary,
      createdAt: document.createdAt,
    })),
    cases: cases.map((caseItem: any) => ({
      id: caseItem._id.toString(),
      caseNumber: caseItem.caseNumber,
      title: caseItem.title,
      court: caseItem.court,
      stage: caseItem.stage,
      status: caseItem.status,
      nextHearing: caseItem.nextHearingDate ? new Date(caseItem.nextHearingDate).toISOString() : null,
      updatedAt: caseItem.updatedAt,
    })),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const matter = await findOwnedMatter(id);
    if (!matter) return NextResponse.json({ success: false, error: "Matter not found" }, { status: 404 });
    const body = await req.json().catch(() => ({}));

    if (typeof body.title === "string" && body.title.trim()) matter.title = body.title.trim();
    if (["Open", "Waiting", "Resolved"].includes(body.status)) matter.status = body.status;
    if (typeof body.summary === "string") matter.summary = body.summary.trim();
    if (typeof body.nextAction === "string" && body.nextAction.trim()) matter.nextAction = body.nextAction.trim();
    if (body.nextActionDue === null || typeof body.nextActionDue === "string") matter.nextActionDue = body.nextActionDue ? new Date(body.nextActionDue) : null;
    if (Array.isArray(body.checklist)) {
      matter.checklist = body.checklist
        .filter((item: any) => typeof item?.text === "string" && item.text.trim())
        .slice(0, 30)
        .map((item: any) => ({ text: item.text.trim(), completed: Boolean(item.completed) }));
    }
    await matter.save();
    return NextResponse.json({ success: true, matter: formatMatter(matter) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Could not update Matter" }, { status: 500 });
  }
}

/** Deleting a matter never deletes what's inside it: chats, documents, drafts and cases are just detached. */
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const matter = await findOwnedMatter(id);
    if (!matter) return NextResponse.json({ success: false, error: "Matter not found" }, { status: 404 });
    // The assistant's private thread only makes sense inside its matter, so it goes with it.
    const threads = await ConversationModel.find({ userId: matter.userId, matterId: matter._id, kind: "matter-assistant" }).select("_id").lean();
    if (threads.length) {
      await MessageModel.deleteMany({ conversationId: { $in: threads.map((t: any) => t._id) } });
      await ConversationModel.deleteMany({ _id: { $in: threads.map((t: any) => t._id) } });
    }
    await Promise.all(
      LINK_TYPES.map((type) =>
        LINK_MODELS[type].updateMany({ userId: matter.userId, matterId: matter._id }, { $set: { matterId: null } })
      )
    );
    await matter.deleteOne();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Could not delete Matter" }, { status: 500 });
  }
}
