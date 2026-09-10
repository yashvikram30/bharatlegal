import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import ConversationModel from "@/model/Conversation";
import MessageModel from "@/model/Message";
import mongoose from "mongoose";

export const runtime = "nodejs";

// Helper to resolve params in Next.js 15 / 14
async function getParams(params: Promise<{ id: string }> | { id: string }) {
  return await Promise.resolve(params);
}

// GET /api/conversations/[id] - Fetch single conversation and its chronological messages
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
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
  context: { params: Promise<{ id: string }> | { id: string } }
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

    const { title } = await req.json().catch(() => ({}));
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    await dbConnect();
    const updated = await ConversationModel.findOneAndUpdate(
      { _id: id, userId },
      { title: title.trim() },
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
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error: any) {
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
  context: { params: Promise<{ id: string }> | { id: string } }
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
