import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import MatterModel, { MatterCategory } from "@/model/Matter";
import { formatMatter } from "@/lib/matters";

export const runtime = "nodejs";

const categories: MatterCategory[] = ["General", "Housing", "Employment", "Consumer", "Criminal", "Court Case", "Family", "Other"];

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?._id || (session?.user as any)?.id || null;
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: true, matters: [], authenticated: false });

    await dbConnect();
    const matters = await MatterModel.find({ userId }).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ success: true, matters: matters.map(formatMatter), authenticated: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Could not load matters" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Sign in to create a Matter" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return NextResponse.json({ success: false, error: "Give this Matter a title" }, { status: 400 });

    const category = categories.includes(body.category) ? body.category : "General";
    await dbConnect();
    const matter = await MatterModel.create({
      userId,
      title,
      category,
      summary: typeof body.summary === "string" ? body.summary.trim() : "",
      nextAction: typeof body.nextAction === "string" && body.nextAction.trim() ? body.nextAction.trim() : "Decide your next step",
      nextActionDue: body.nextActionDue ? new Date(body.nextActionDue) : null,
      checklist: [],
    });
    return NextResponse.json({ success: true, matter: formatMatter(matter) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Could not create Matter" }, { status: 500 });
  }
}
