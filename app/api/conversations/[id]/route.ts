import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import ConversationModel from "@/model/Conversation";
import MessageModel from "@/model/Message";
import mongoose from "mongoose";
import { MatterLinkError, resolveOwnedMatterId } from "@/lib/matter-links";

export const runtime = "nodejs";

// Helper to resolve params in Next.js 15 / 14
async function getParams(params: Promise<{ id: string }> | { id: string }) {
  return await Promise.resolve(params);
}

// GET /api/conversations/[id] - Fetch single conversation and its chronological messages
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await getParams(context.params);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid conversation ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?._id || (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const conversation = await ConversationModel.findOne({ _id: id, userId }).lean();

    if (!conversation) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    }

    const messages = await MessageModel.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .lean();

    const formattedMessages = messages.map((m: any) => ({
      id: m._id.toString(),
      role: m.role,
      content: m.content,
      sources: m.sources || [],
      createdAt: m.createdAt,
    }));

    return NextResponse.json({
      success: true,
      conversation: {
        id: (conversation._id as any).toString(),
        title: (conversation as any).title,
        matterId: (conversation as any).matterId ? (conversation as any).matterId.toString() : null,
        createdAt: (conversation as any).createdAt,
        updatedAt: (conversation as any).updatedAt,
      },
      messages: formattedMessages,
    });
  } catch (error: any) {
    console.error("[Conversation GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// PATCH /api/conversations/[id] - Rename conversation title
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await getParams(context.params);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid conversation ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?._id || (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const update: Record<string, any> = {};
    if (typeof body.title === "string" && body.title.trim()) update.title = body.title.trim();
    // `matterId: null` detaches the chat from its matter.
    if ("matterId" in body) {
      await dbConnect();
      update.matterId = await resolveOwnedMatterId(userId, body.matterId);
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, error: "Nothing to update" }, { status: 400 });
    }

    await dbConnect();
    const updated = await ConversationModel.findOneAndUpdate(
      { _id: id, userId },
      update,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: updated._id.toString(),
        title: updated.title,
        matterId: updated.matterId ? updated.matterId.toString() : null,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error: any) {
    if (error instanceof MatterLinkError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error("[Conversation PATCH Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update conversation" },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id] - Delete conversation and its messages
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await getParams(context.params);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid conversation ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?._id || (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const deletedConvo = await ConversationModel.findOneAndDelete({ _id: id, userId });

    if (!deletedConvo) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    }

    // Cascade delete associated messages
    await MessageModel.deleteMany({ conversationId: id });

    return NextResponse.json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error: any) {
    console.error("[Conversation DELETE Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
