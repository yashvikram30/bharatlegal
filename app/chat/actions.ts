import { createServerClient } from "@/lib/supabase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1", // Required for Groq
});

export async function addMessage(
  chatId: string,
  content: string,
  role: "user" | "assistant",
  model: string
) {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const { data: chat, error: chatError } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .eq("user_id", session.user.id)
    .single();

  if (chatError || !chat) {
    throw new Error("Conversation not found or access denied");
  }

  // Insert user message
  const { data: userMessage, error: userMessageError } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      content,
      role,
    })
    .select()
    .single();

  if (userMessageError) {
    throw new Error(userMessageError.message);
  }

  // If the message is from the user, get the conversation history and get the AI response
  if (role === "user") {
    const { data: previousMessages } = await supabase
      .from("messages")
      .select("role, content")
      .eq("chat_id", chatId)
      .order("timestamp", { ascending: true });

    const formattedMessages =
      previousMessages?.map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })) ?? [];

    // Get AI response (using Groq / OpenAI compatible endpoint)
    const chatResponse = await openai.chat.completions.create({
      model,
      messages: formattedMessages,
    });

    const aiMessage = chatResponse.choices[0]?.message?.content || "";

    // Store the assistant reply
    await supabase.from("messages").insert({
      chat_id: chatId,
      content: aiMessage,
      role: "assistant",
    });
  }

  // Update conversation timestamp
  await supabase
    .from("chats")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", chatId);

  return { success: true };
}
