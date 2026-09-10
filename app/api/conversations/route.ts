import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import ConversationModel from "@/model/Conversation";

export const runtime = "nodejs";

// GET /api/conversations - List all conversations for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?._id || (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { success: true, conversations: [], authenticated: false },
        { status: 200 }
      );
    }

    await dbConnect();
    const conversations = await ConversationModel.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();

    const formatted = conversations.map((c: any) => ({
      id: c._id.toString(),
      title: c.title,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      conversations: formatted,
      authenticated: true,
    });
  } catch (error: any) {
    console.error("[Conversations GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create a new conversation thread
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?._id || (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required to create persistent conversations" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : "New consultation";

    await dbConnect();
    const conversation = await ConversationModel.create({
      userId,
      title,
    });

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("[Conversations POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create conversation" },
      { status: 500 }
    );
  }
}
