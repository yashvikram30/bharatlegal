import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import DocumentAnalysisModel from "@/model/DocumentAnalysis";
import mongoose from "mongoose";

export const runtime = "nodejs";

// GET /api/simplify/[id] - Fetch complete saved document analysis with original text
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid document ID" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?._id || (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();
    const doc = await DocumentAnalysisModel.findOne({ _id: id, userId }).lean();

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Document audit not found" },
        { status: 404 }
      );
    }

    const formatted = {
      id: doc._id.toString(),
      matterId: doc.matterId?.toString() || null,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      documentCategory: doc.documentCategory,
      parties: doc.parties || [],
      riskScore: doc.riskScore,
      executiveSummary: doc.executiveSummary,
      keyObligations: doc.keyObligations || [],
      actionChecklist: doc.actionChecklist || [],
      riskyClauses: doc.riskyClauses || [],
      statutoryReferences: doc.statutoryReferences || [],
      simplifiedText: doc.simplifiedText,
      originalText: doc.originalText || "",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    return NextResponse.json({
      success: true,
      document: formatted,
    });
  } catch (error: any) {
    console.error("[Simplify API GET ID Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load document analysis" },
      { status: 500 }
    );
  }
}

// DELETE /api/simplify/[id] - Delete a saved document analysis
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid document ID" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?._id || (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();
    const deleted = await DocumentAnalysisModel.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Document audit not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Document audit deleted successfully",
    });
  } catch (error: any) {
    console.error("[Simplify API DELETE ID Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete document audit" },
      { status: 500 }
    );
  }
}
