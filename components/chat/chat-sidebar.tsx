"use client";

import React, { useState, useMemo } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Plus,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  LogOut,
  LogIn,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ConversationItem {
  id: string;
  title: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ChatSidebarProps {
  conversations: ConversationItem[];
  activeId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onRename: (id: string, newTitle: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function ChatSidebar({
  conversations,
  activeId,
  isOpen,
  onToggle,
  onSelect,
  onNewChat,
  onRename,
  onDelete,
  isLoading = false,
}: ChatSidebarProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  const grouped = useMemo(() => {
    const groups: { label: string; items: ConversationItem[] }[] = [
      { label: "Today", items: [] },
      { label: "Yesterday", items: [] },
      { label: "Previous 7 Days", items: [] },
      { label: "Older", items: [] },
    ];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
    const startOf7Days = new Date(startOfToday.getTime() - 7 * 86400000);

    filteredConversations.forEach((convo) => {
      const date = new Date(convo.updatedAt || convo.createdAt);
      if (date >= startOfToday) {
        groups[0].items.push(convo);
      } else if (date >= startOfYesterday) {
        groups[1].items.push(convo);
      } else if (date >= startOf7Days) {
        groups[2].items.push(convo);
      } else {
        groups[3].items.push(convo);
      }
    });

    return groups.filter((g) => g.items.length > 0);
  }, [filteredConversations]);

  const handleStartRename = (convo: ConversationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(convo.id);
    setEditTitle(convo.title);
  };

  const handleSaveRename = async (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      await onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await onDelete(id);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col border-r border-border/60 bg-card/95 backdrop-blur-md transition-all duration-200 ease-in-out select-none ${
          isOpen
            ? "w-72 sm:w-80 translate-x-0"
            : "w-0 -translate-x-full md:w-0 md:translate-x-0 overflow-hidden border-none"
        }`}
      >
        {/* Top Header Actions */}
        <div className="p-3 space-y-2.5 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-2">
            {/* New Chat Primary CTA */}
            <Button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) onToggle();
              }}
              className="flex-1 h-9 bg-forest-800 hover:bg-forest-700 text-forest-50 dark:text-gold-300 font-heading font-semibold text-xs rounded-xl border border-gold-500/40 shadow-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 text-gold-500" />
              <span>New Consultation</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0 rounded-xl border border-border/60 hover:bg-muted transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          </div>

          {/* Search bar */}
          {conversations.length > 3 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="h-8 pl-8 pr-2.5 text-xs bg-muted/40 border-border/60 rounded-lg placeholder:text-muted-foreground/70"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Conversation List */}
        <ScrollArea className="flex-1 px-2 py-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              <div className="h-8 bg-muted/60 animate-pulse rounded-lg" />
              <div className="h-8 bg-muted/40 animate-pulse rounded-lg" />
              <div className="h-8 bg-muted/30 animate-pulse rounded-lg" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <MessageSquare className="w-7 h-7 mx-auto text-muted-foreground/50 stroke-1" />
              <p className="text-xs text-muted-foreground">No saved consultations yet.</p>
              <p className="text-[11px] text-muted-foreground/70">
                Your chats with BharatLegal AI will appear here.
              </p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No threads match &quot;{searchQuery}&quot;
            </div>
          ) : (
            <div className="space-y-4">
              {grouped.map((group) => (
                <div key={group.label} className="space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                    {group.label}
                  </div>

                  {group.items.map((convo) => {
                    const isActive = activeId === convo.id;
                    const isEditing = editingId === convo.id;

                    if (isEditing) {
                      return (
                        <form
                          key={convo.id}
                          onSubmit={(e) => handleSaveRename(convo.id, e)}
                          className="flex items-center gap-1 px-2 py-1 bg-muted/80 rounded-lg"
                        >
                          <Input
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleSaveRename(convo.id)}
                            className="h-7 text-xs bg-background py-0 px-2"
                          />
                          <button
                            type="submit"
                            className="p-1 text-emerald-600 hover:text-emerald-500"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      );
                    }

                    return (
                      <div
                        key={convo.id}
                        onClick={() => {
                          onSelect(convo.id);
                          if (window.innerWidth < 768) onToggle();
                        }}
                        className={`group relative flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                          isActive
                            ? "bg-forest-100/90 dark:bg-forest-900/80 text-foreground font-semibold border border-gold-500/40 shadow-2xs"
                            : "hover:bg-muted/60 text-foreground/80 hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <MessageSquare
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? "text-gold-500" : "text-muted-foreground"
                            }`}
                          />
                          <span className="truncate">{convo.title || "Untitled consultation"}</span>
                        </div>

                        {/* Actions Menu */}
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 rounded-md hover:bg-background/80 text-muted-foreground hover:text-foreground"
                              >
                                <MoreVertical className="w-3 h-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32 text-xs">
                              <DropdownMenuItem
                                onClick={(e) => handleStartRename(convo, e)}
                                className="gap-2 cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3 text-muted-foreground" />
                                <span>Rename</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => handleDelete(convo.id, e)}
                                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Bottom User / Session Section */}
        <div className="p-3 border-t border-border/40 shrink-0 bg-card/60">
          {session?.user ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-forest-800 text-gold-300 flex items-center justify-center font-bold text-xs shrink-0 border border-gold-500/30">
                  {session.user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {session.user.name || "Legal Citizen"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/chat" })}
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] text-muted-foreground leading-tight">
                Sign in to sync your legal consultations across devices.
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signIn(undefined, { callbackUrl: "/chat" })}
                className="w-full h-7 text-xs border-forest-500/30 hover:bg-forest-100 dark:hover:bg-forest-900 flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3 h-3 text-gold-500" />
                <span>Sign In</span>
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Floating Expand Button (when sidebar is collapsed) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute top-2.5 left-4 z-20 p-1.5 rounded-lg bg-card/90 border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted shadow-2xs transition-all"
          title="Open consultations sidebar"
        >
          <PanelLeft className="w-4 h-4 text-forest-700 dark:text-gold-400" />
        </button>
      )}
    </>
  );
}
