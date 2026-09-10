"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Square,
  Scale,
  RefreshCw,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Shield,
  BookOpen,
  ArrowUpRight,
  Gavel,
  FileText,
  ChevronDown,
  PanelLeft,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { CitationSheet } from "@/components/chat/citation-sheet";
import { ChatSidebar, ConversationItem } from "@/components/chat/chat-sidebar";
import { useStreamDripper } from "@/hooks/useStreamDripper";
import { useThrottledValue } from "@/hooks/useThrottledValue";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const PROMPT_SUGGESTIONS = [
  {
    icon: Scale,
    title: "BNS §318 vs IPC §420",
    description: "Compare penalties & legal ingredients for cheating under the new criminal code",
    prompt: "What is the penalty for cheating under BNS Section 318 compared to Section 420 IPC?",
  },
  {
    icon: Shield,
    title: "Arrest Rights (BNSS §35)",
    description: "Statutory protections when stopped or detained by police officers",
    prompt: "What are my statutory rights if stopped or arrested by police under BNSS Section 35?",
  },
  {
    icon: FileText,
    title: "Security Deposit Dispute",
    description: "Legal recourse when a landlord refuses to refund rental security deposit",
    prompt: "Can a landlord legally deduct rental deposit without written notice under Rent Control & Consumer laws?",
  },
  {
    icon: Gavel,
    title: "Cheque Bounce (NI Act §138)",
    description: "Mandatory statutory timeline and ingredients to issue a demand notice",
    prompt: "What is the mandatory procedure and timeline to issue a statutory notice under Section 138 of the Negotiable Instruments Act?",
  },
];

/**
 * Memoized single message renderer.
 * Prevents completed messages from re-parsing markdown AST when active message streams.
 */
const ChatMessageItem = React.memo(function ChatMessageItem({
  message,
  isStreaming = false,
  onCopy,
  copiedId,
  feedback,
  onFeedback,
  onOpenCitation,
}: {
  message: Message;
  isStreaming?: boolean;
  onCopy: (id: string, text: string) => void;
  copiedId: string | null;
  feedback: Record<string, "up" | "down">;
  onFeedback: (id: string, type: "up" | "down") => void;
  onOpenCitation: (act: string, section: string) => void;
}) {
  const isUser = message.role === "user";

  const sanitizedContent = useMemo(() => {
    if (!message.content) return "";
    let clean = message.content.trim();
    if (clean.startsWith("```markdown\n") && clean.endsWith("```")) {
      clean = clean.slice(12, -3).trim();
    } else if (clean.startsWith("```md\n") && clean.endsWith("```")) {
      clean = clean.slice(6, -3).trim();
    } else if (clean.startsWith("```\n") && clean.endsWith("```") && clean.includes("## ")) {
      clean = clean.slice(4, -3).trim();
    }
    return clean;
  }, [message.content]);

  const markdownComponents = useMemo(
    () => ({
      h1: ({ children }: any) => (
        <h1 className="text-lg sm:text-xl font-heading font-bold text-foreground mt-6 mb-3 pb-2 border-b border-border/60">
          {children}
        </h1>
      ),
      h2: ({ children }: any) => (
        <h2 className="text-sm sm:text-base font-heading font-bold text-foreground mt-6 mb-2.5 pb-1 border-b border-border/50 flex items-center gap-2 tracking-tight">
          {children}
        </h2>
      ),
      h3: ({ children }: any) => (
        <h3 className="text-xs sm:text-sm font-heading font-semibold text-foreground/95 mt-4 mb-1.5 flex items-center gap-1.5">
          {children}
        </h3>
      ),
      h4: ({ children }: any) => (
        <h4 className="text-xs font-heading font-semibold text-foreground/90 mt-3 mb-1">
          {children}
        </h4>
      ),
      p: ({ children }: any) => (
        <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 mb-3 last:mb-0">
          {children}
        </p>
      ),
      ul: ({ children }: any) => (
        <ul className="my-3 space-y-1.5 list-disc list-outside pl-5 text-xs sm:text-sm text-foreground/90 marker:text-gold-600 dark:marker:text-gold-400">
          {children}
        </ul>
      ),
      ol: ({ children }: any) => (
        <ol className="my-3 space-y-1.5 list-decimal list-outside pl-5 text-xs sm:text-sm text-foreground/90 marker:text-gold-600 dark:marker:text-gold-400 marker:font-semibold">
          {children}
        </ol>
      ),
      li: ({ children }: any) => (
        <li className="leading-relaxed pl-1 text-xs sm:text-sm text-foreground/90">
          {children}
        </li>
      ),
      hr: () => <hr className="my-5 border-t border-border/60" />,
      strong: ({ children }: any) => (
        <strong className="font-semibold text-foreground">{children}</strong>
      ),
      em: ({ children }: any) => (
        <em className="italic text-foreground/85">{children}</em>
      ),
      blockquote: ({ children }: any) => (
        <blockquote className="my-3 border-l-4 border-gold-500/90 bg-forest-950/5 dark:bg-forest-950/40 px-4 py-3 rounded-r-xl text-foreground/90 text-xs sm:text-sm shadow-2xs font-sans not-italic">
          {children}
        </blockquote>
      ),
      code: ({ inline, className, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || "");
        const isInline = inline || !match;
        if (isInline) {
          return (
            <code
              className="px-1.5 py-0.5 rounded-md bg-muted/80 text-forest-900 dark:text-gold-300 font-mono text-xs border border-border/50 font-medium"
              {...props}
            >
              {children}
            </code>
          );
        }
        return (
          <div className="my-3 rounded-xl overflow-hidden border border-border/80 bg-forest-950 text-forest-50 text-xs font-mono shadow-xs">
            <div className="px-3.5 py-1.5 bg-forest-900/90 text-forest-300 border-b border-forest-800 text-[11px] font-sans flex items-center justify-between">
              <span>{match[1] || "code"}</span>
            </div>
            <pre className="p-3.5 overflow-x-auto leading-relaxed">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          </div>
        );
      },
      pre: ({ children }: any) => <>{children}</>,
      table: ({ children }: any) => (
        <div className="my-4 overflow-x-auto rounded-xl border border-border/80 shadow-2xs bg-card/70 backdrop-blur-xs">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
            {children}
          </table>
        </div>
      ),
      thead: ({ children }: any) => (
        <thead className="bg-muted/80 text-foreground border-b border-border/80 font-heading">
          {children}
        </thead>
      ),
      th: ({ children }: any) => (
        <th className="px-3.5 py-2.5 font-semibold text-[11px] sm:text-xs tracking-wider uppercase text-foreground/90 border-r border-border/40 last:border-r-0 whitespace-nowrap">
          {children}
        </th>
      ),
      tbody: ({ children }: any) => (
        <tbody className="divide-y divide-border/40 bg-card/40">{children}</tbody>
      ),
      tr: ({ children }: any) => (
        <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
      ),
      td: ({ children }: any) => (
        <td className="px-3.5 py-2.5 border-b border-border/30 text-foreground/85 leading-relaxed align-top border-r border-border/30 last:border-r-0 text-xs sm:text-sm">
          {children}
        </td>
      ),
      a: ({ href, children, ...props }: any) => {
        if (href?.startsWith("#citation:")) {
          const parts = href.replace("#citation:", "").split(":");
          const act = parts[0] || "";
          const section = parts[1] || "";
          return (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onOpenCitation(act, section);
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 my-0.5 mx-0.5 rounded-md bg-forest-100 dark:bg-forest-900/80 text-forest-900 dark:text-gold-300 font-semibold text-xs border border-forest-500/30 hover:border-gold-500/60 hover:bg-forest-200 dark:hover:bg-forest-800 transition-all shadow-2xs cursor-pointer align-baseline"
              title={`View statutory bare act text for ${act.toUpperCase()} §${section}`}
            >
              <Scale className="w-3 h-3 text-gold-500 shrink-0 inline" />
              <span>{children}</span>
            </button>
          );
        }
        return (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-forest-700 dark:text-gold-400 underline hover:text-foreground font-medium transition-colors"
            {...props}
          >
            {children}
          </a>
        );
      },
    }),
    [onOpenCitation]
  );

  return (
    <div className={`flex gap-3 sm:gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-forest-800 dark:bg-forest-900 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0 mt-1 shadow-2xs">
          <Scale className="w-3.5 h-3.5" />
        </div>
      )}

      <div
        className={`${
          isUser
            ? "bg-forest-900 text-forest-50 dark:bg-forest-800 dark:text-forest-100 rounded-2xl rounded-br-xs px-4 py-2.5 max-w-[85%] sm:max-w-[75%] text-xs sm:text-sm leading-relaxed shadow-xs"
            : "flex-1 space-y-3 min-w-0 pr-1"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="space-y-3 text-foreground">
            {isStreaming && message.content.length === 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-xs font-medium text-forest-900 dark:text-gold-300 animate-pulse">
                <Scale className="w-3.5 h-3.5 text-gold-500 animate-spin" />
                <span>Grounding with IndiaCode & Judicial Precedents...</span>
              </div>
            )}

            <div className="text-foreground leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {sanitizedContent}
              </ReactMarkdown>

              {isStreaming && message.content.length > 0 && (
                <span className="inline-block w-1.5 h-3.5 ml-1 bg-gold-500 animate-pulse align-middle" />
              )}
            </div>

            {!isStreaming && message.content.length > 0 && (
              <div className="flex items-center gap-1 pt-1.5 text-muted-foreground text-xs border-t border-border/30">
                <button
                  type="button"
                  onClick={() => onCopy(message.id, message.content)}
                  className="p-1 rounded-md hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1"
                  title="Copy response"
                >
                  {copiedId === message.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onFeedback(message.id, "up")}
                  className={`p-1 rounded-md hover:bg-muted transition-colors ${
                    feedback[message.id] === "up" ? "text-emerald-500" : "hover:text-foreground"
                  }`}
                  title="Helpful response"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={() => onFeedback(message.id, "down")}
                  className={`p-1 rounded-md hover:bg-muted transition-colors ${
                    feedback[message.id] === "down" ? "text-red-500" : "hover:text-foreground"
                  }`}
                  title="Needs correction"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>

                <div className="ml-auto text-[10px] opacity-60">
                  {new Intl.DateTimeFormat("en-IN", {
                    hour: "numeric",
                    minute: "numeric",
                  }).format(message.timestamp)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default function ChatPage() {
  const { data: session, status: authStatus } = useSession();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isConversationsLoading, setIsConversationsLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content:
        "Namaste. I am **BharatLegal AI**, an authoritative Indian legal research assistant grounded in statutory law and Supreme Court jurisprudence.\n\nAsk any question regarding new criminal codes (**BNS**, **BNSS**, **BSA**), commercial statutes (**NI Act**, **Contract Act**), or citizen rights (**Consumer Protection**, **RERA**).",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});
  const [selectedCitation, setSelectedCitation] = useState<{ act: string; section: string } | null>(null);
  const [isCitationOpen, setIsCitationOpen] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isAutoScrollEnabled = useRef(true);


  // Fetch list of conversations for the authenticated user
  const fetchConversations = useCallback(async () => {
    if (authStatus !== "authenticated") return;
    setIsConversationsLoading(true);
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
        }
      }
    } catch (err) {
      console.error("[Fetch Conversations Error]:", err);
    } finally {
      setIsConversationsLoading(false);
    }
  }, [authStatus]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 1. Smoothing & drip buffer hook: smooths bursty tokens into steady 60fps drips
  const { displayedText, appendChunk, endStream, reset, isDripping } = useStreamDripper({
    charsPerTick: 3,
    tickMs: 18,
    onComplete: (finalText) => {
      // Commit completed streamed text to persistent messages array
      if (streamingMessageId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === streamingMessageId ? { ...m, content: finalText } : m))
        );
      }
      setStreamingMessageId(null);
      // Auto-refresh conversation list after titling
      if (session?.user) {
        setTimeout(() => fetchConversations(), 2500);
      }
    },
  });

  // 2. Throttled markdown text: updates Markdown AST at most every 75ms during streaming,
  // preventing constant re-parsing on every 18ms character drip!
  const throttledMarkdown = useThrottledValue(displayedText, 75, !isDripping && !isLoading);

  // Scroll handler: monitors whether user has scrolled up to read
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom > 120) {
      isAutoScrollEnabled.current = false;
      setShowScrollBottom(true);
    } else {
      isAutoScrollEnabled.current = true;
      setShowScrollBottom(false);
    }
  }, []);

  const scrollToBottom = (behavior: ScrollBehavior = "instant") => {
    if (scrollContainerRef.current) {
      if (behavior === "instant") {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      } else {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }
    isAutoScrollEnabled.current = true;
    setShowScrollBottom(false);
  };

  // Instant scroll per-chunk: ONLY if user is already near bottom (no smooth scroll spam)
  useEffect(() => {
    if (isAutoScrollEnabled.current && scrollContainerRef.current && (isDripping || isLoading)) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [displayedText, isDripping, isLoading]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleOpenCitation = useCallback((act: string, section: string) => {
    setSelectedCitation({ act, section });
    setIsCitationOpen(true);
  }, []);

  const handleCopy = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleFeedback = useCallback((id: string, type: "up" | "down") => {
    setFeedback((prev) => ({ ...prev, [id]: type }));
    toast.success(type === "up" ? "Helpful response recorded" : "Feedback recorded for model tuning");
  }, []);

  const handleSelectConversation = useCallback(
    async (id: string) => {
      if (id === activeConversationId || isLoading || isDripping) return;
      setActiveConversationId(id);
      reset();
      setStreamingMessageId(null);

      try {
        const res = await fetch(`/api/conversations/${id}`);
        if (!res.ok) throw new Error("Failed to load conversation");
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          if (data.messages.length === 0) {
            setMessages([
              {
                id: "welcome-msg",
                role: "assistant",
                content:
                  "Namaste. I am **BharatLegal AI**, an authoritative Indian legal research assistant grounded in statutory law and Supreme Court jurisprudence.\n\nAsk any question regarding new criminal codes (**BNS**, **BNSS**, **BSA**), commercial statutes (**NI Act**, **Contract Act**), or citizen rights (**Consumer Protection**, **RERA**).",
                timestamp: new Date(),
              },
            ]);
          } else {
            setMessages(
              data.messages.map((m: any) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: new Date(m.createdAt),
              }))
            );
          }
          setTimeout(() => scrollToBottom("instant"), 50);
        }
      } catch (err) {
        console.error("[Load Conversation Error]:", err);
        toast.error("Could not load consultation history");
      }
    },
    [activeConversationId, isLoading, isDripping, reset]
  );

  const handleNewChat = useCallback(() => {
    if (isLoading || isDripping) return;
    setActiveConversationId(null);
    reset();
    setStreamingMessageId(null);
    setMessages([
      {
        id: "welcome-msg",
        role: "assistant",
        content:
          "Namaste. I am **BharatLegal AI**, an authoritative Indian legal research assistant grounded in statutory law and Supreme Court jurisprudence.\n\nAsk any question regarding new criminal codes (**BNS**, **BNSS**, **BSA**), commercial statutes (**NI Act**, **Contract Act**), or citizen rights (**Consumer Protection**, **RERA**).",
        timestamp: new Date(),
      },
    ]);
  }, [isLoading, isDripping, reset]);

  const handleRenameConversation = useCallback(async (id: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
        );
        toast.success("Consultation renamed");
      }
    } catch (err) {
      toast.error("Failed to rename consultation");
    }
  }, []);

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/conversations/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setConversations((prev) => prev.filter((c) => c.id !== id));
          if (activeConversationId === id) {
            handleNewChat();
          }
          toast.success("Consultation deleted");
        }
      } catch (err) {
        toast.error("Failed to delete consultation");
      }
    },
    [activeConversationId, handleNewChat]
  );

  const handleSend = useCallback(
    async (customPrompt?: string) => {
      const messageContent = (customPrompt || input).trim();
      if (!messageContent || isLoading || isDripping) return;

      let currentConvoId = activeConversationId;

      // If user is authenticated and hasn't started a conversation thread yet, auto-create one
      if (session?.user && !currentConvoId) {
        try {
          const createRes = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "New consultation" }),
          });
          if (createRes.ok) {
            const createData = await createRes.json();
            if (createData.success && createData.conversation) {
              currentConvoId = createData.conversation.id;
              setActiveConversationId(currentConvoId);
              setConversations((prev) => [createData.conversation, ...prev]);
            }
          }
        } catch (createErr) {
          console.warn("[Auto-create Conversation Warning]:", createErr);
        }
      }

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: messageContent,
        timestamp: new Date(),
      };

      const assistantId = `assistant-${Date.now() + 1}`;
      const placeholderAssistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg, placeholderAssistantMsg]);
      setInput("");
      setIsLoading(true);
      setStreamingMessageId(assistantId);
      reset();
      isAutoScrollEnabled.current = true;

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      // Initial smooth jump to reveal user's question
      setTimeout(() => scrollToBottom("smooth"), 50);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortControllerRef.current.signal,
          body: JSON.stringify({
            conversationId: currentConvoId,
            messages: [...messages, userMsg].map(({ role, content }) => ({
              role,
              content,
            })),
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error("Failed to receive stream from BharatLegal AI engine");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            // Signal stream ended: flush remaining buffered text immediately
            endStream(true);
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          appendChunk(chunk);
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          toast("Generation stopped", { icon: "⏹️" });
          endStream(true);
        } else {
          console.error("[Chat Stream Error]:", err);
          toast.error("Failed to generate response. Please retry.");
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content:
                      "⚠️ An error occurred while synthesizing statutory data. Please verify your connection or click retry below.",
                  }
                : m
            )
          );
          setStreamingMessageId(null);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [input, isLoading, isDripping, messages, activeConversationId, session, reset, appendChunk, endStream]
  );

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const isInitialState = messages.length <= 1;

  return (
    <div className="relative flex h-full w-full bg-background text-foreground overflow-hidden">
      {/* 1. Left Collapsible Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeId={activeConversationId}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        onRename={handleRenameConversation}
        onDelete={handleDeleteConversation}
        isLoading={isConversationsLoading}
      />

      {/* 2. Main Chat Panel */}
      <div className="relative flex flex-col flex-1 h-full min-w-0 bg-background overflow-hidden">
        {/* Floating Sidebar Toggle when sidebar is closed */}
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-3 left-3 z-20 p-2 rounded-xl border border-border/70 bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground shadow-xs backdrop-blur-md transition-colors"
            title="Open history sidebar"
          >
            <PanelLeft className="w-4 h-4 text-forest-700 dark:text-gold-400" />
          </button>
        )}

        {/* Main Chat Scrollable Stream Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth overscroll-contain"
        >
        <div className="max-w-3xl lg:max-w-4xl mx-auto space-y-8 pb-32">
          {/* Welcome Hero State */}
          {isInitialState && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="py-6 sm:py-12 space-y-6 text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-forest-800 dark:bg-forest-900 border border-gold-500/30 flex items-center justify-center text-gold-400 shadow-sm">
                <Scale className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground">
                  Where would you like to begin?
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Search across 2,246 Acts, resolve BNS ↔ IPC criminal laws, or verify Supreme Court ratio decidendi.
                </p>
              </div>

              {/* 4 Clickable Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
                {PROMPT_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(item.prompt)}
                    className="p-3.5 rounded-xl border border-border/80 bg-card hover:border-gold-500/40 hover:bg-forest-50/50 dark:hover:bg-forest-950/40 transition-all text-left group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-1.5 rounded-lg bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-gold-400 border border-forest-500/20">
                        <item.icon className="w-3.5 h-3.5" />
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="font-semibold text-xs sm:text-sm text-foreground mt-2 font-heading">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages Flow */}
          <div className="space-y-6">
            {messages.map((message) => {
              if (message.id === "welcome-msg" && isInitialState) return null;

              const isStreamingThis = streamingMessageId === message.id;
              // Use throttled markdown during streaming, or finalized message content
              const displayContent = isStreamingThis ? throttledMarkdown : message.content;

              return (
                <ChatMessageItem
                  key={message.id}
                  message={{ ...message, content: displayContent }}
                  isStreaming={isStreamingThis}
                  onCopy={handleCopy}
                  copiedId={copiedId}
                  feedback={feedback}
                  onFeedback={handleFeedback}
                  onOpenCitation={handleOpenCitation}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom("smooth")}
          className="absolute bottom-28 right-6 z-20 p-2 rounded-full bg-card border border-border shadow-md hover:bg-muted text-foreground transition-all animate-fade-in"
          title="Scroll to bottom"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      )}

      {/* Floating Bottom Composer (Claude / ChatGPT Style) */}
      <footer className="absolute bottom-0 inset-x-0 z-20 px-4 sm:px-6 pb-4 pt-2 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
        <div className="max-w-3xl lg:max-w-4xl mx-auto pointer-events-auto space-y-1.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex flex-col rounded-2xl sm:rounded-3xl border border-border/80 bg-card/95 backdrop-blur-lg shadow-lg focus-within:border-gold-500/60 focus-within:ring-2 focus-within:ring-gold-500/20 transition-all"
          >
            {/* Multi-line auto-growing textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder="Ask any legal question... (e.g. BNS 318 cheating, rent deposit, police arrest rights)"
              className="w-full resize-none bg-transparent px-4 sm:px-5 pt-3.5 pb-2 text-xs sm:text-sm placeholder:text-muted-foreground/70 focus:outline-none max-h-40 leading-relaxed"
              disabled={isLoading || isDripping}
            />

            {/* Bottom Actions inside the composer */}
            <div className="flex items-center justify-between px-3 sm:px-4 pb-2 pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground hidden sm:inline-flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-gold-500" />
                  <span>2,246 Acts Grounded</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isLoading || isDripping ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleStop}
                    className="h-7 w-7 rounded-full bg-red-600 hover:bg-red-700 text-white p-0 flex items-center justify-center transition-transform hover:scale-105"
                    title="Stop generating"
                  >
                    <Square className="w-3 h-3 fill-current" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!input.trim()}
                    size="sm"
                    className="h-7 w-7 rounded-full bg-forest-800 text-white hover:bg-forest-900 dark:bg-gold-500 dark:text-forest-950 dark:hover:bg-gold-400 p-0 flex items-center justify-center disabled:opacity-30 transition-transform hover:scale-105"
                    title="Send message"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </form>

          {/* Discreet Footer Disclaimer */}
          <p className="text-[10px] text-muted-foreground/80 text-center">
            BharatLegal provides educational statutory intelligence; not a substitute for licensed legal counsel.
          </p>
        </div>
      </footer>

      {/* Slide-out Bare Act & Precedent Citation Drawer */}
      <CitationSheet
        citation={selectedCitation}
        isOpen={isCitationOpen}
        onClose={() => setIsCitationOpen(false)}
      />
      </div>
    </div>
  );
}
