import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import CaseModel, { CaseStage, CaseStatus } from "@/model/Case";
import mongoose from "mongoose";

export const runtime = "nodejs";

const STAGE_PROGRESS: Record<CaseStage, number> = {
  Filed: 15,
  Hearing: 45,
  Evidence: 60,
  Arguments: 80,
  Judgment: 95,
  Closed: 100,
};

async function getParams(params: Promise<{ id: string }> | { id: string }) {
  return await Promise.resolve(params);
}

function formatCaseDoc(c: any) {
  const stage = (c.stage || "Hearing") as CaseStage;
  const progress = STAGE_PROGRESS[stage] ?? 45;

  return {
    id: c._id.toString(),
    caseNumber: c.caseNumber,
    cnrNumber: c.cnrNumber || null,
    title: c.title,
    court: c.court,
    caseType: c.caseType || "Other",
    stage,
    status: c.status || "Active",
    progress,
    filingDate: c.filingDate ? new Date(c.filingDate).toISOString().split("T")[0] : null,
    nextHearing: c.nextHearingDate
      ? new Date(c.nextHearingDate).toISOString().split("T")[0]
      : null,
    petitioner: c.petitioner || null,
    opponentName: c.opponentName || null,
    judgeName: c.judgeName || null,
    lastOrderUrl: c.lastOrderUrl || null,
    isLiveSynced: Boolean(c.isLiveSynced),
    notes: c.notes || "",
    timeline: (c.timeline || []).map((t: any) => ({
      date: t.date ? new Date(t.date).toISOString().split("T")[0] : "",
      title: t.title,
      description: t.description,
      status: t.status || "completed",
      documentUrl: t.documentUrl || null,
    })),
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
  };
}

// GET /api/cases/[id]
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await getParams(context.params);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid case ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?._id || (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const caseDoc = await CaseModel.findOne({ _id: id, userId }).lean();

    if (!caseDoc) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      case: formatCaseDoc(caseDoc),
    });
  } catch (error: any) {
    console.error("[Case GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch case" },
      { status: 500 }
    );
  }
}

// PATCH /api/cases/[id] - Update case stage, next hearing date, or metadata
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await getParams(context.params);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid case ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?._id || (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const updateFields: any = {};

    if (body.title) updateFields.title = body.title.trim();
    if (body.court) updateFields.court = body.court.trim();
    if (body.stage) updateFields.stage = body.stage;
    if (body.status) updateFields.status = body.status;
    if (body.opponentName !== undefined) updateFields.opponentName = body.opponentName;
    if (body.judgeName !== undefined) updateFields.judgeName = body.judgeName;
    if (body.notes !== undefined) updateFields.notes = body.notes;
    if (body.lastOrderUrl !== undefined) updateFields.lastOrderUrl = body.lastOrderUrl;

    if (body.nextHearingDate !== undefined) {
      updateFields.nextHearingDate = body.nextHearingDate
        ? new Date(body.nextHearingDate)
        : null;
    }

    await dbConnect();

    // If stage changed, optionally append a procedural milestone to timeline
    const existing = await CaseModel.findOne({ _id: id, userId });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }

    if (body.stage && body.stage !== existing.stage) {
      existing.timeline.push({
        date: new Date(),
        title: `Transitioned to ${body.stage} Stage`,
        description: `Matter marked as ${body.stage} in judicial proceeding.`,
        status: "current",
      });
      updateFields.timeline = existing.timeline;
    }

    const updated = await CaseModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateFields },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      case: formatCaseDoc(updated),
      message: "Case details updated successfully",
    });
  } catch (error: any) {
    console.error("[Case PATCH Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update case" },
      { status: 500 }
    );
  }
}

// DELETE /api/cases/[id]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await getParams(context.params);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid case ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?._id || (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const deleted = await CaseModel.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Case successfully removed from your diary",
    });
  } catch (error: any) {
    console.error("[Case DELETE Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete case" },
      { status: 500 }
    );
  }
}
