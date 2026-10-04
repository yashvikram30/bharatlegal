import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import ConversationModel from "@/model/Conversation";
import MessageModel, { IMatterSource } from "@/model/Message";
import { getSessionUserId } from "@/lib/matter-links";
import { loadMatterCorpus } from "@/lib/matter-agent/corpus";
import { runMatterAgent } from "@/lib/matter-agent/agent";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_QUESTION_LENGTH = 2000;

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/** The one private thread per matter that the assistant keeps. */
async function findThread(userId: string, matterId: string, create: boolean) {
  const filter = { userId, matterId, kind: "matter-assistant" as const };
  const existing = await ConversationModel.findOne(filter);
  if (existing || !create) return existing;
  return ConversationModel.create({ ...filter, title: "Matter assistant" });
}

async function authorise(params: Promise<{ id: string }>) {
  const { id } = await params;
  const userId = await getSessionUserId();
  if (!userId) return { error: NextResponse.json({ success: false, error: "Sign in first." }, { status: 401 }) } as const;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: NextResponse.json({ success: false, error: "Matter not found." }, { status: 404 }) } as const;
  }
  return { id, userId } as const;
}

// GET /api/matters/[id]/assistant: the saved conversation with this matter's assistant
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorise(params);
  if ("error" in auth) return auth.error;
  try {
    await dbConnect();
    const thread = await findThread(auth.userId, auth.id, false);
    if (!thread) return NextResponse.json({ success: true, messages: [] });
    const messages = await MessageModel.find({ conversationId: thread._id }).sort({ createdAt: 1 }).lean();
    return NextResponse.json({
      success: true,
      messages: messages.map((m: any) => ({
        id: m._id.toString(),
        role: m.role,
        content: m.content,
        sources: (m.matterSources || []).map((s: IMatterSource) => ({ kind: s.kind, itemId: s.itemId, title: s.title })),
        createdAt: m.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Could not load the conversation." }, { status: 500 });
  }
}

// DELETE /api/matters/[id]/assistant: start the conversation over
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorise(params);
  if ("error" in auth) return auth.error;
  try {
    await dbConnect();
    const thread = await findThread(auth.userId, auth.id, false);
    if (thread) await MessageModel.deleteMany({ conversationId: thread._id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Could not clear the conversation." }, { status: 500 });
  }
}

// POST /api/matters/[id]/assistant: ask a question. Streams the answer as plain text; the records it
// used are listed in the base64-encoded JSON `X-Matter-Sources` header.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorise(params);
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json().catch(() => ({}));
    const question = typeof body.message === "string" ? body.message.trim() : "";
    if (!question) return NextResponse.json({ success: false, error: "Type a question first." }, { status: 400 });
    if (question.length > MAX_QUESTION_LENGTH) {
      return NextResponse.json({ success: false, error: "That question is too long. Please shorten it." }, { status: 400 });
    }

    await dbConnect();
    const corpus = await loadMatterCorpus(auth.userId, auth.id);
    if (!corpus) return NextResponse.json({ success: false, error: "Matter not found." }, { status: 404 });

    const thread = await findThread(auth.userId, auth.id, true);
    const previous = await MessageModel.find({ conversationId: thread!._id }).sort({ createdAt: -1 }).limit(10).lean();
    const history = previous.reverse().map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content as string }));

    await MessageModel.create({ conversationId: thread!._id, role: "user", content: question });

    const { stream, sources } = await runMatterAgent({ client, corpus, history, question });

    const encoder = new TextEncoder();
    let fullText = "";
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const piece = chunk.choices[0]?.delta?.content || "";
            if (!piece) continue;
            fullText += piece;
            try {
              controller.enqueue(encoder.encode(piece));
            } catch {
              break; // the client closed the connection
            }
          }
          try {
            controller.close();
          } catch {
            /* already closed */
          }
          if (fullText.trim()) {
            await MessageModel.create({
              conversationId: thread!._id,
              role: "assistant",
              content: fullText,
              matterSources: sources.map((s) => ({ kind: s.kind, itemId: s.itemId, title: s.title })),
            });
            await ConversationModel.updateOne({ _id: thread!._id }, { $set: { updatedAt: new Date() } });
          }
        } catch (err) {
          console.error("[Matter Assistant] Stream error:", err);
          try {
            if (!fullText) controller.enqueue(encoder.encode("I couldn’t finish that answer. Please ask again in a moment."));
            controller.close();
          } catch {
            /* already closed */
          }
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        "X-Matter-Sources": Buffer.from(JSON.stringify(sources), "utf8").toString("base64"),
      },
    });
  } catch (error: any) {
    console.error("[Matter Assistant] Error:", error);
    const rateLimited = error?.status === 429;
    return NextResponse.json(
      {
        success: false,
        error: rateLimited
          ? "The assistant is busy right now. Please try again in a few seconds."
          : "The assistant couldn’t answer that. Please try again.",
      },
      { status: rateLimited ? 429 : 500 }
    );
  }
}
