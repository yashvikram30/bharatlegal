import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import LegalDraftModel from "@/model/LegalDraft";
import UserModel from "@/model/User";
import mongoose from "mongoose";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid draft ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await UserModel.findOne({ email: session.user.email }).select("_id");
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const draft = await LegalDraftModel.findOne({ _id: id, userId: user._id }).lean();
    if (!draft) {
      return NextResponse.json({ success: false, error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    console.error("[Draft Single API] GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid draft ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await UserModel.findOne({ email: session.user.email }).select("_id");
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, generatedContent } = body;

    const updateFields: Record<string, any> = {};
    if (typeof title === "string" && title.trim()) updateFields.title = title.trim();
    if (typeof generatedContent === "string") updateFields.generatedContent = generatedContent;

    const updated = await LegalDraftModel.findOneAndUpdate(
      { _id: id, userId: user._id },
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Draft not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, draft: updated });
  } catch (error: any) {
    console.error("[Draft Single API] PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid draft ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await UserModel.findOne({ email: session.user.email }).select("_id");
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const deleted = await LegalDraftModel.findOneAndDelete({ _id: id, userId: user._id });
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Draft not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Draft deleted successfully" });
  } catch (error: any) {
    console.error("[Draft Single API] DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
