import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import MatterModel from "@/model/Matter";
import DocumentAnalysisModel from "@/model/DocumentAnalysis";
import CaseModel from "@/model/Case";
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
    .select("caseNumber title court stage status nextHearingDate")
    .lean();
  return NextResponse.json({
    success: true,
    matter: formatMatter(matter),
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
