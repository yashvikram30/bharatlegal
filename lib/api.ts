import { getSupabaseBrowserClient } from "./supabase";

const supabase = getSupabaseBrowserClient();

type ChatHistoryItem = {
  id: string;
  title: string;
  preview: string;
  created_at: string;
};

async function getChatHistory(userId: string): Promise<ChatHistoryItem[]> {
  const { data, error } = await supabase
    .from("chats")
    .select("id, title, created_at")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }

  const chatsWithPreview = await Promise.all(
    (data || []).map(async (chat: { id: string; title: string; created_at: string }) => {
      const { data: messages, error: messageError } = await supabase
        .from("messages")
        .select("content")
        .eq("chat_id", chat.id)
        .order("timestamp", { ascending: false })
        .limit(1);

      if (messageError) {
        console.error("Error fetching messages:", messageError);
        return { ...chat, preview: "" };
      }

      const preview = messages && messages.length > 0 ? messages[0].content : "";
      return { ...chat, preview };
    })
  );

  return chatsWithPreview;
}

export async function createChat(userId: string) {
  const { data, error } = await supabase
    .from("chats")
    .insert([{ user_id: userId, title: "Untitled Chat" }])
    .select();

  if (error) throw error;
  return data?.[0];
}

export { getChatHistory };
