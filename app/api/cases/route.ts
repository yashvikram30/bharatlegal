import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import CaseModel, { CaseStage, CaseStatus } from "@/model/Case";
import { parseCNR } from "@/lib/courts/cnr";

export const runtime = "nodejs";

const STAGE_PROGRESS: Record<CaseStage, number> = {
  Filed: 15,
  Hearing: 45,
  Evidence: 60,
  Arguments: 80,
  Judgment: 95,
  Closed: 100,
};

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

// GET /api/cases - List all cases for authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?._id || (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { success: true, cases: [], authenticated: false },
        { status: 200 }
      );
    }

    await dbConnect();
    const cases = await CaseModel.find({ userId })
      .sort({ nextHearingDate: 1, updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      cases: cases.map(formatCaseDoc),
      authenticated: true,
    });
  } catch (error: any) {
    console.error("[Cases GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch cases" },
      { status: 500 }
    );
  }
}

// POST /api/cases - Add a new tracked case
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?._id || (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required to track cases" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      caseNumber,
      title,
      court,
      caseType = "Civil",
      stage = "Hearing",
      status = "Active",
      nextHearingDate,
      filingDate,
      petitioner,
      opponentName,
      judgeName,
      notes = "",
    } = body;

    if (!caseNumber || typeof caseNumber !== "string" || !caseNumber.trim()) {
      return NextResponse.json(
        { success: false, error: "Case number or CNR is required" },
        { status: 400 }
      );
    }

    // Try parsing as 16-char CNR
    const cnrParsed = parseCNR(caseNumber);
    const finalCnr = cnrParsed ? cnrParsed.formatted : null;
    const finalCourt = court?.trim() || (cnrParsed ? cnrParsed.courtName : "Indian Court");
    const finalTitle =
      title?.trim() ||
      (cnrParsed
        ? `${cnrParsed.courtType} Matter (${cnrParsed.filingNumber}/${cnrParsed.filingYear})`
        : `Matter ${caseNumber.trim()}`);
    const finalOrderUrl = cnrParsed?.orderPdfUrl || null;

    // Standard initial timeline milestones
    const today = new Date();
    const timeline = [
      {
        date: filingDate ? new Date(filingDate) : today,
        title: "Petition Registered",
        description: `Verified and indexed under ${finalCnr || caseNumber.trim()}.`,
        status: "completed",
      },
      {
        date: today,
        title: "Pleadings & Procedural Record",
        description: `Court matter listed at ${finalCourt}.`,
        status: stage === "Filed" ? "current" : "completed",
      },
    ];

    if (nextHearingDate) {
      timeline.push({
        date: new Date(nextHearingDate),
        title: `${stage} Hearing`,
        description: `Scheduled proceeding before ${judgeName || "presiding roster bench"}.`,
        status: "upcoming",
      });
    }

    await dbConnect();

    const createdCase = await CaseModel.create({
      userId,
      caseNumber: caseNumber.trim(),
      cnrNumber: finalCnr,
      title: finalTitle,
      court: finalCourt,
      caseType,
      stage,
      status,
      filingDate: filingDate ? new Date(filingDate) : today,
      nextHearingDate: nextHearingDate ? new Date(nextHearingDate) : null,
      petitioner: petitioner?.trim() || null,
      opponentName: opponentName?.trim() || null,
      judgeName: judgeName?.trim() || null,
      lastOrderUrl: finalOrderUrl,
      isLiveSynced: false,
      timeline,
      notes: notes?.trim() || "",
    });

    return NextResponse.json({
      success: true,
      case: formatCaseDoc(createdCase),
      message: "Case added successfully to your litigation diary",
    });
  } catch (error: any) {
    console.error("[Cases POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create case" },
      { status: 500 }
    );
  }
}
