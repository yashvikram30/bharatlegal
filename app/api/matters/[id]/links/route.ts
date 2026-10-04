import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { LINK_TYPES, LinkType, MatterLinkError, getSessionUserId, setItemMatter } from "@/lib/matter-links";

export const runtime = "nodejs";

/**
 * POST /api/matters/[id]/links
 * body: { type: "chat" | "document" | "draft" | "case", itemId: string, action?: "link" | "unlink" }
 * Attaches an existing item to this matter, or detaches it. Both the matter and the item must
 * belong to the signed-in user.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Sign in first." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const type = body.type as LinkType;
    const action = body.action === "unlink" ? "unlink" : "link";
    if (!LINK_TYPES.includes(type)) {
      return NextResponse.json({ success: false, error: "Unknown item type." }, { status: 400 });
    }
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      typeof body.itemId !== "string" ||
      !mongoose.Types.ObjectId.isValid(body.itemId)
    ) {
      return NextResponse.json({ success: false, error: "Invalid id." }, { status: 400 });
    }

    const found = await setItemMatter(userId, id, type, body.itemId, action);
    if (!found) return NextResponse.json({ success: false, error: "Item not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof MatterLinkError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: error.message || "Could not update the link." }, { status: 500 });
  }
}
