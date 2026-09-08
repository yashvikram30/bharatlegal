"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Send, Scale, RefreshCw, Copy, CheckCheck, MapPin } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "react-hot-toast";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Namaste! I am your **LegalEase AI Assistant**, grounded in Indian law including the *Bharatiya Nyaya Sanhita (BNS)*, *BNSS / CrPC*, and *Consumer Protection Act, 2019*.\n\nHow can I assist you with your legal query today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile");
  const [showPrompts, setShowPrompts] = useState(true);
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const starterPrompts = useMemo(
    () => [
      "Tenant rights regarding security deposit refund under Model Tenancy Act",
      "Steps to file a complaint in Consumer Forum for defective products",
      "Police arrest and bail guidelines under BNSS / CrPC",
      "How to file an RTI application to municipal authorities",
    ],
    []
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(
    async (e?: React.FormEvent, customInput?: string) => {
      e?.preventDefault();
      const messageContent = customInput || input.trim();
      if (!messageContent || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        content: messageContent,
        role: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(({ role, content }) => ({
              role,
              content,
            })),
            model: selectedModel,
          }),
        });

        if (!res.ok || !res.body) {
          toast.error("Failed to connect to AI engine. Please verify your connection.");
          setIsLoading(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "",
          role: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value);
          assistantMessage.content += chunkValue;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: assistantMessage.content }
                : m
            )
          );
        }
      } catch (err) {
        console.error("Chat error:", err);
        toast.error("An error occurred during response streaming.");
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, selectedModel]
  );

  const modelOptions = useMemo(
    () => [
      { value: "llama-3.3-70b-versatile", label: "LLaMA 3.3 70B (Recommended)" },
      { value: "llama-3.1-8b-instant", label: "LLaMA 3.1 8B (Fast)" },
      { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B (Deep Analysis)" },
    ],
    []
  );

  const selectedModelLabel = useMemo(
    () =>
      modelOptions.find((m) => m.value === selectedModel)?.label ??
      "LLaMA 3.3 70B (Recommended)",
    [modelOptions, selectedModel]
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied response to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "1",
        content:
          "Conversation cleared. What Indian statutory matter would you like to explore?",
        role: "assistant",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      {/* Top Utility Header Bar */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-border bg-background text-foreground text-xs flex items-center gap-2 font-medium"
              >
                <span>{selectedModelLabel}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-1.5 rounded-lg">
              <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Select Model
              </p>
              {modelOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setSelectedModel(opt.value)}
                  className="flex items-center justify-between text-xs py-2 rounded cursor-pointer"
                >
                  <span>{opt.label}</span>
                  {selectedModel === opt.value && (
                    <Check className="h-3.5 w-3.5 text-forest-800 dark:text-gold-500" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 text-[11px] font-medium border border-forest-500/20">
            <Scale className="w-3 h-3 text-forest-800 dark:text-gold-500" />
            <span>Indian Jurisprudence Grounded</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearChat}
          className="h-8 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </Button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4 sm:px-6 py-6">
          <div className="w-full max-w-3xl mx-auto space-y-6 pb-8">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-forest-800 dark:bg-forest-950 text-white flex items-center justify-center text-xs font-bold border border-gold-500/40 shrink-0 mt-0.5">
                      ⚖
                    </div>
                  )}

                  <div
                    className={`group relative max-w-[85%] sm:max-w-[78%] rounded-xl px-4 py-3.5 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-forest-800 text-white dark:bg-forest-800 dark:text-forest-50 rounded-br-none"
                        : "bg-card border border-border text-foreground rounded-bl-none shadow-rest-card"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-heading prose-headings:text-foreground prose-strong:text-foreground prose-code:text-forest-800 dark:prose-code:text-gold-500">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}

                    <div className="flex items-center justify-between gap-4 mt-2 pt-1 border-t border-border/30 text-[11px] opacity-70">
                      <span>{format(message.timestamp, "h:mm a")}</span>
                      {message.role === "assistant" && (
                        <button
                          onClick={() => handleCopy(message.id, message.content)}
                          className="hover:opacity-100 flex items-center gap-1 transition-opacity"
                          title="Copy response"
                        >
                          {copiedId === message.id ? (
                            <CheckCheck className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Copy</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 rounded-lg bg-forest-800 text-white flex items-center justify-center text-xs font-bold border border-gold-500/40 shrink-0 mt-0.5">
                    ⚖
                  </div>
                  <div className="rounded-xl px-4 py-3 bg-card border border-border space-y-2 max-w-xs">
                    <div className="flex space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-forest-500 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-forest-500 animate-bounce delay-100" />
                      <span className="w-2 h-2 rounded-full bg-forest-500 animate-bounce delay-200" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Synthesizing Indian statutory guidance...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Sticky Bottom Input Composer */}
      <div className="border-t border-border bg-card p-4 sm:p-5">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Indian Law Starter Prompt Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <button
                onClick={() => setShowPrompts(!showPrompts)}
                className="hover:text-foreground font-medium flex items-center gap-1"
              >
                {showPrompts ? "▼ Hide suggested topics" : "▲ Show suggested topics"}
              </button>

              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Jurisdiction (e.g. Delhi, Maharashtra)"
                  className="text-xs px-2 py-1 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-gold-700 w-48"
                />
              </div>
            </div>

            {showPrompts && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      const finalInput = location
                        ? `Under the laws of ${location}, ${prompt}`
                        : prompt;
                      setInput(finalInput);
                      setShowPrompts(false);
                      handleSend(undefined, finalInput);
                    }}
                    className="text-left p-2.5 text-xs rounded-lg border border-border bg-background hover:bg-forest-100 dark:hover:bg-forest-800/60 hover:border-forest-500 transition-all text-muted-foreground hover:text-foreground truncate"
                  >
                    ⚖ {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleSend} className="flex gap-2 items-center">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask any legal question in plain language..."
              className="flex-1 bg-background border-border focus-visible:ring-2 focus-visible:ring-gold-700"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-forest-800 text-white hover:bg-forest-950 dark:bg-gold-500 dark:text-forest-950 dark:hover:bg-gold-500/90 h-10 px-4 shrink-0 focus-visible:ring-2 focus-visible:ring-gold-700"
            >
              <Send className="h-4 w-4 mr-1.5" />
              <span>Send</span>
            </Button>
          </form>

          <p className="text-[11px] text-muted-foreground text-center">
            LegalEase provides educational information and statutory citations, not formal attorney representation under the Advocates Act, 1961.
          </p>
        </div>
      </div>
    </div>
  );
}
