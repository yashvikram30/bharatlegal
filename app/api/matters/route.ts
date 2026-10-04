import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import MatterModel, { MatterCategory } from "@/model/Matter";
import { formatMatter } from "@/lib/matters";
import { LINK_MODELS, LINK_TYPES } from "@/lib/matter-links";

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

    // How much is saved in each matter, so the list can show it at a glance.
    const counts: Record<string, Record<string, number>> = {};
    await Promise.all(
      LINK_TYPES.map(async (type) => {
        const rows = await LINK_MODELS[type].aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
              matterId: { $ne: null },
              // The assistant's private thread isn't one of the user's chats.
              ...(type === "chat" ? { kind: { $ne: "matter-assistant" } } : {}),
            },
          },
          { $group: { _id: "$matterId", n: { $sum: 1 } } },
        ]);
        for (const row of rows) {
          const key = row._id.toString();
          counts[key] = { ...(counts[key] || {}), [type]: row.n };
        }
      })
    );

    return NextResponse.json({
      success: true,
      matters: matters.map((m: any) => ({
        ...formatMatter(m),
        counts: {
          chat: counts[m._id.toString()]?.chat || 0,
          document: counts[m._id.toString()]?.document || 0,
          draft: counts[m._id.toString()]?.draft || 0,
          case: counts[m._id.toString()]?.case || 0,
        },
      })),
      authenticated: true,
    });
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
