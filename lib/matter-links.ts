import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import MatterModel from "@/model/Matter";
import ConversationModel from "@/model/Conversation";
import DocumentAnalysisModel from "@/model/DocumentAnalysis";
import LegalDraftModel from "@/model/LegalDraft";
import CaseModel from "@/model/Case";

/** Everything that can live inside a matter. */
export const LINK_TYPES = ["chat", "document", "draft", "case"] as const;
export type LinkType = (typeof LINK_TYPES)[number];

export const LINK_MODELS: Record<LinkType, any> = {
  chat: ConversationModel,
  document: DocumentAnalysisModel,
  draft: LegalDraftModel,
  case: CaseModel,
};

export async function getSessionUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?._id || (session?.user as any)?.id || null;
}

export class MatterLinkError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

/**
 * Validates a client-supplied matter id. Returns null for "no matter", the id for a matter the
 * user owns, and throws otherwise, so an item can never be attached to someone else's matter.
 */
export async function resolveOwnedMatterId(userId: string, matterId: unknown): Promise<string | null> {
  if (matterId === undefined || matterId === null || matterId === "") return null;
  if (typeof matterId !== "string" || !mongoose.Types.ObjectId.isValid(matterId)) {
    throw new MatterLinkError("That matter isn’t valid.");
  }
  await dbConnect();
  const owned = await MatterModel.exists({ _id: matterId, userId });
  if (!owned) throw new MatterLinkError("Matter not found.", 404);
  return matterId;
}

/**
 * Attaches an item to a matter, or detaches it. Both the matter and the item must belong to
 * `userId`; unlinking only affects an item that is actually in that matter.
 * Returns false when no matching item was found.
 */
export async function setItemMatter(
  userId: string,
  matterId: string,
  type: LinkType,
  itemId: string,
  action: "link" | "unlink"
): Promise<boolean> {
  await dbConnect();
  const matter = await MatterModel.findOne({ _id: matterId, userId }).select("_id");
  if (!matter) throw new MatterLinkError("Matter not found.", 404);

  const filter: Record<string, any> = { _id: itemId, userId };
  if (action === "unlink") filter.matterId = matter._id;
  const result = await LINK_MODELS[type].updateOne(filter, {
    $set: { matterId: action === "link" ? matter._id : null },
  });
  if (result.matchedCount === 0) return false;

  await MatterModel.updateOne({ _id: matter._id }, { $set: { updatedAt: new Date() } });
  return true;
}
