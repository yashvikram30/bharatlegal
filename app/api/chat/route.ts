
import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1", // Groq's endpoint
});

export async function POST(req: NextRequest) {
  const { messages, model } = await req.json();

  const chosenModel =
    model && (model.startsWith("openai/") || model.startsWith("qwen/"))
      ? model
      : "openai/gpt-oss-120b";

  const stream = await openai.chat.completions.create({
    model: chosenModel,
    stream: true,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        controller.enqueue(encoder.encode(content));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
