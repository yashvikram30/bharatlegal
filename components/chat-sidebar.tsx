"use client";

import { format } from "date-fns";
import { Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type ChatHistory = {
  id: string;
  title: string;
  preview: string;
  date: Date;
};

export function ChatSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const fetchChats = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        console.log("No user found");
        return;
      }

      try {
        // Fetch chat details from the 'chats' table
        const { data: chats, error: chatError } = await supabase
          .from("chats")
          .select("id, title, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (chatError) throw new Error(chatError.message);

        const formattedChats = await Promise.all(
          (chats || []).map(async (chat: { id: string; title: string; created_at: string }) => {
            const { data: lastMessage, error: messageError } = await supabase
              .from("messages")
              .select("content")
              .eq("chat_id", chat.id)
              .order("timestamp", { ascending: false })
              .limit(1)
              .single();

            if (messageError) {
              console.log("Error fetching messages:", messageError.message);
            }

            return {
              id: chat.id,
              title: chat.title || "Untitled Chat",
              preview: lastMessage?.content || "No messages yet",
              date: new Date(chat.created_at),
            };
          })
        );

        setChatHistory(formattedChats);
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    };

    fetchChats();
  }, [supabase]);

  const filteredHistory = chatHistory.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar className="w-[300px] border-r dark:border-slate-700 overflow-hidden">
        <SidebarHeader className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Chat History</h2>
              <div className="flex items-center space-x-1">
                <SidebarTrigger className="text-slate-500 md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-accent" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 md:hidden"
                ></Button>
                <Button variant="ghost" size="icon" className="text-slate-500">
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">New Chat</span>
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search conversations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {filteredHistory.length > 0 ? (
              <div className="space-y-1 p-2">
                {filteredHistory.map((chat) => (
                  <Button
                    key={chat.id}
                    variant="ghost"
                    className="w-full h-auto p-2 flex flex-col items-start space-y-0.5 text-left"
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="font-medium text-sm leading-snug">
                        {chat.title}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                        {format(chat.date, "MMM d")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                      {chat.preview}
                    </p>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                No conversations found
              </div>
            )}
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <div className="space-y-4">
            <Separator className="dark:bg-slate-700" />
            <Button
              variant="outline"
              className="w-full justify-start text-slate-600 dark:text-slate-300"
              size="sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear History
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
