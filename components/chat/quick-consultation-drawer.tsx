"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Send,
  Scale,
  Sparkles,
  ArrowUpRight,
  Maximize2,
  Copy,
  Check,
  RefreshCw,
  MessageSquare,
  Shield,
  FileText,
  Gavel,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuickConsultation } from "@/context/QuickConsultationContext";
import { toast } from "react-hot-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  {
    icon: Shield,
    title: "Police Arrest Rights",
    prompt: "What are my statutory rights if stopped or arrested by police under Section 35 & 47 of BNSS?",
  },
  {
    icon: FileText,
    title: "Security Deposit Refund",
    prompt: "Under Indian tenancy law, how long can a landlord withhold a security deposit, and what deductions are prohibited?",
  },
  {
    icon: Scale,
    title: "BNS Cheating vs IPC 420",
    prompt: "Explain the essential ingredients and penalty for cheating under BNS Section 318 compared to IPC 420.",
  },
];

export function QuickConsultationDrawer() {
  const { data: session } = useSession();
  const { isOpen, closeConsultation, contextData } = useQuickConsultation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastExecutedPromptRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  // Save active conversation state into sessionStorage for seamless zero-token handoff to /chat
  const saveTransferState = useCallback(
    (convoId: string | null, msgs: Message[]) => {
      if (typeof window !== "undefined" && msgs.length > 0) {
        sessionStorage.setItem(
          "bharatlegal_drawer_transfer",
          JSON.stringify({
            conversationId: convoId,
            messages: msgs,
            contextData,
            timestamp: Date.now(),
          })
        );
      }
    },
    [contextData]
  );

  const executeQuery = useCallback(
    async (queryText: string) => {
      const cleanQuery = queryText.trim();
      if (!cleanQuery || isStreaming) return;

      let currentConvoId = conversationId;

      // 1. If user is authenticated and conversation thread not yet created in MongoDB, persist one
      if (session?.user && !currentConvoId) {
        try {
          const convoTitle =
            contextData?.title ||
            (contextData?.subtitle ? `${contextData.subtitle} Consultation` : null) ||
            cleanQuery.slice(0, 45) ||
            "Quick Consultation";

          const createRes = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: convoTitle }),
          });

          if (createRes.ok) {
            const createData = await createRes.json();
            if (createData.success && createData.conversation?.id) {
              currentConvoId = createData.conversation.id;
              setConversationId(currentConvoId);
            }
          }
        } catch (dbErr) {
          console.warn("[QuickConsultation] MongoDB thread pre-creation error:", dbErr);
        }
      }

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: cleanQuery,
        timestamp: new Date(),
      };

      const assistantId = `assistant-${Date.now() + 1}`;
      const placeholderMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      const nextMessages = [...messages, userMessage, placeholderMessage];
      setMessages(nextMessages);
      setInput("");
      setIsStreaming(true);
      setTimeout(() => scrollToBottom("smooth"), 50);

      abortControllerRef.current = new AbortController();

      try {
        const historyPayload = messages
          .filter((m) => m.content.trim() !== "")
          .slice(-6)
          .map((m) => ({ role: m.role, content: m.content }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortControllerRef.current.signal,
          body: JSON.stringify({
            messages: [...historyPayload, { role: "user", content: cleanQuery }],
            conversationId: currentConvoId || undefined, // Persists user & assistant turn into MongoDB
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error("Failed to reach consultation assistant");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, content: accumulated } : msg
            )
          );
          scrollToBottom("instant");
        }

        // Save transfer state once complete
        const finalMsgs = [
          ...messages,
          userMessage,
          { ...placeholderMessage, content: accumulated },
        ];
        saveTransferState(currentConvoId, finalMsgs);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("[QuickConsultation Drawer Error]:", err);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? {
                    ...msg,
                    content:
                      "⚠️ *Unable to complete consultation. Please ensure network connectivity and try again, or switch to the full workspace.*",
                  }
                : msg
            )
          );
        }
      } finally {
        setIsStreaming(false);
        setTimeout(() => scrollToBottom("smooth"), 100);
      }
    },
    [conversationId, isStreaming, messages, saveTransferState, scrollToBottom, session?.user, contextData]
  );

  // When drawer opens with contextual prompt, trigger it automatically once
  useEffect(() => {
    if (isOpen && contextData?.prompt) {
      if (lastExecutedPromptRef.current !== contextData.prompt) {
        lastExecutedPromptRef.current = contextData.prompt;
        setMessages([]);
        setConversationId(null);
        executeQuery(contextData.prompt);
      }
    } else if (isOpen && messages.length === 0) {
      // Default initial welcome state
      setMessages([
        {
          id: "initial-welcome",
          role: "assistant",
          content:
            "Namaste. I am **BharatLegal AI**, your on-demand Indian legal intelligence assistant.\n\nAsk any question regarding new statutory codes (**BNS**, **BNSS**, **BSA**), citizen protections, tenancy contracts, or consumer rights.",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, contextData, executeQuery, messages.length]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied legal response");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isStreaming) {
        executeQuery(input);
      }
    }
  };

  const handleExpand = () => {
    saveTransferState(conversationId, messages);
    closeConsultation();
  };

  if (!isOpen) return null;

  const latestUserPrompt =
    [...messages].reverse().find((m) => m.role === "user")?.content ||
    contextData?.prompt ||
    "";

  const expandHref = conversationId
    ? `/chat?conversationId=${conversationId}`
    : latestUserPrompt
    ? `/chat?q=${encodeURIComponent(latestUserPrompt)}`
    : `/chat`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
      {/* Backdrop */}
      <div
        onClick={closeConsultation}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Slide-out Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg md:max-w-xl bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* 1. Drawer Header */}
          <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-forest-800 dark:bg-forest-900 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0 shadow-xs">
                <Scale className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-foreground font-heading truncate">
                    BharatLegal AI
                  </h3>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono text-gold-600 dark:text-gold-400 border-gold-500/30">
                    In-Context
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  Authoritative Statutory Grounding (IndiaCode & Precedents)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Full Workspace Deep-link with zero-token conversation transfer */}
              <Link
                href={expandHref}
                onClick={handleExpand}
                title="Expand to Full Chat Workspace (preserves current conversation)"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1 text-xs"
              >
                <Maximize2 className="w-3.5 h-3.5 text-gold-500" />
                <span className="hidden sm:inline text-[11px] font-medium">Expand</span>
              </Link>

              {/* Close Button */}
              <button
                onClick={closeConsultation}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Tag Banner (if context was passed) */}
          {(contextData?.title || contextData?.subtitle) && (
            <div className="px-4 py-2 bg-forest-50 dark:bg-forest-950/40 border-b border-forest-200 dark:border-forest-900 text-xs flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] uppercase font-bold text-forest-800 dark:text-gold-400 tracking-wider shrink-0">
                  Active Context:
                </span>
                <span className="font-semibold text-foreground truncate text-[11px]">
                  {contextData.title || contextData.subtitle}
                </span>
              </div>
              {contextData.subtitle && contextData.title && (
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                  {contextData.subtitle}
                </span>
              )}
            </div>
          )}

          {/* 2. Messages Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm"
          >
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-md bg-forest-800 text-gold-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Scale className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`${
                      isUser
                        ? "bg-forest-900 text-white dark:bg-forest-800 rounded-2xl rounded-br-xs px-3.5 py-2 max-w-[85%] shadow-xs"
                        : "flex-1 space-y-2 min-w-0 bg-card p-3.5 rounded-2xl border border-border"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    ) : (
                      <div className="space-y-2 text-foreground">
                        {message.content ? (
                          <div className="prose prose-xs dark:prose-invert max-w-none leading-relaxed prose-headings:font-heading prose-headings:text-foreground prose-table:text-xs">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground py-2 text-xs">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-gold-500" />
                            <span>Consulting Indian bare acts & judicial rulings...</span>
                          </div>
                        )}

                        {!isStreaming && message.content && (
                          <div className="flex items-center justify-end gap-1 pt-2 border-t border-border/40 text-muted-foreground text-[11px]">
                            <button
                              onClick={() => handleCopy(message.id, message.content)}
                              className="hover:text-foreground flex items-center gap-1 transition-colors"
                            >
                              {copiedId === message.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span className="text-emerald-500">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Quick Prompt Cards (if only initial welcome) */}
            {messages.length === 1 && (
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick Consultations:
                </p>
                <div className="space-y-1.5">
                  {QUICK_PROMPTS.map((qp, idx) => {
                    const Icon = qp.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => executeQuery(qp.prompt)}
                        className="w-full text-left p-2.5 rounded-xl border border-border bg-muted/20 hover:border-forest-500 hover:bg-forest-50 dark:hover:bg-forest-900/20 transition-all flex items-center gap-2.5 group"
                      >
                        <div className="p-1.5 rounded-lg bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 group-hover:scale-105 transition-transform shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {qp.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {qp.prompt}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Drawer Input Bar */}
          <div className="p-3 border-t border-border bg-muted/20 shrink-0 space-y-2">
            <div className="relative flex items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a follow-up about this step or statute..."
                rows={1}
                disabled={isStreaming}
                className="w-full resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-forest-600 disabled:opacity-50 min-h-[42px] max-h-28"
              />
              <button
                onClick={() => executeQuery(input)}
                disabled={!input.trim() || isStreaming}
                className="absolute right-2 p-1.5 rounded-lg bg-forest-800 text-white hover:bg-forest-900 dark:bg-gold-500 dark:text-forest-950 disabled:opacity-30 transition-all"
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {conversationId ? "Saved in Consultation Diary" : "Grounded in Indian Bare Acts"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
