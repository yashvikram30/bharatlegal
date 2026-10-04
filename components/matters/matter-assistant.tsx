"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUp, FileSignature, FileText, Gavel, Loader2, MessageSquare, Scale, Sparkles, Trash2, type LucideIcon } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CitableKind, linkifyTags } from "@/lib/matter-agent/tags";

export type RecordRow = { id: string; title: string; detail: string; href: string };
export type RecordsByKind = Record<CitableKind, RecordRow[]>;

type Source = { kind: CitableKind; itemId: string; title: string };
type Msg = { id: string; role: "user" | "assistant"; content: string; sources?: Source[] };

const KIND_ICON: Record<CitableKind, LucideIcon> = { chat: MessageSquare, document: FileText, draft: FileSignature, case: Gavel };

function suggestionsFor(records: RecordsByKind): string[] {
  const out = ["Where does this matter stand, and what should I do next?"];
  if (records.document.length) out.push("What are the biggest risks in my documents?");
  if (records.case.length) out.push("When is my next hearing, and what should I prepare?");
  if (records.draft.length) out.push("Summarise the documents I’ve drafted.");
  if (records.chat.length) out.push("What have I already asked the AI about this?");
  if (out.length === 1) out.push("What should I add to this matter to get better answers?");
  return out.slice(0, 4);
}

export function MatterAssistant({
  matterId,
  open,
  onOpenChange,
  records,
  seedQuestion,
  onSeedUsed,
  onOpenCitation,
}: {
  matterId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  records: RecordsByKind;
  /** A question to send as soon as the assistant opens (from the suggestion chips on the page). */
  seedQuestion: string | null;
  onSeedUsed: () => void;
  onOpenCitation: (act: string, section: string) => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const loadedFor = useRef<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const find = useCallback(
    (kind: CitableKind, id: string) => records[kind].find((r) => r.id === id),
    [records]
  );

  // Load the saved conversation the first time the assistant opens.
  useEffect(() => {
    if (!open || loadedFor.current === matterId) return;
    loadedFor.current = matterId;
    setIsLoadingHistory(true);
    fetch(`/api/matters/${matterId}/assistant`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessages((data.messages || []).map((m: any) => ({ id: m.id, role: m.role, content: m.content, sources: m.sources })));
        }
      })
      .catch(() => toast.error("Couldn’t load your earlier questions."))
      .finally(() => setIsLoadingHistory(false));
  }, [open, matterId]);

  // Keep the newest text in view while an answer streams in.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoadingHistory]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || isStreaming) return;
      const userMsgId = `u-${Date.now()}`;
      const assistantId = `a-${Date.now()}`;
      setMessages((prev) => [...prev, { id: userMsgId, role: "user", content: question }, { id: assistantId, role: "assistant", content: "" }]);
      setInput("");
      setIsStreaming(true);

      try {
        const res = await fetch(`/api/matters/${matterId}/assistant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: question }),
        });
        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "The assistant couldn’t answer that. Please try again.");
        }

        let sources: Source[] = [];
        try {
          const header = res.headers.get("X-Matter-Sources");
          if (header) sources = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(header), (c) => c.charCodeAt(0))));
        } catch {
          /* sources are a nicety; the answer still works without them */
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)));
        }
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: acc, sources } : m)));
      } catch (err: any) {
        // Take the failed exchange out and put the question back so retrying is one keypress.
        setMessages((prev) => prev.filter((m) => m.id !== assistantId && m.id !== userMsgId));
        setInput((current) => current || question);
        toast.error(err.message || "The assistant couldn’t answer that. Please try again.");
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, matterId]
  );

  // A suggestion chosen on the page: send it once the saved conversation has loaded.
  useEffect(() => {
    if (open && seedQuestion && !isLoadingHistory && loadedFor.current === matterId && !isStreaming) {
      onSeedUsed();
      send(seedQuestion);
    }
  }, [open, seedQuestion, isLoadingHistory, isStreaming, matterId, onSeedUsed, send]);

  const clearConversation = async () => {
    if (!window.confirm("Clear this conversation? Your matter and its records are not affected.")) return;
    try {
      const res = await fetch(`/api/matters/${matterId}/assistant`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMessages([]);
      toast.success("Conversation cleared");
    } catch {
      toast.error("Couldn’t clear the conversation. Please try again.");
    }
  };

  const markdownComponents = useMemo(
    () => ({
      p: ({ children }: any) => <p className="mb-3 text-sm leading-relaxed text-foreground last:mb-0 sm:text-[15px]">{children}</p>,
      ul: ({ children }: any) => <ul className="mb-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed marker:text-gold-600 last:mb-0 sm:text-[15px]">{children}</ul>,
      ol: ({ children }: any) => <ol className="mb-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed marker:font-semibold marker:text-gold-600 last:mb-0 sm:text-[15px]">{children}</ol>,
      strong: ({ children }: any) => <strong className="font-semibold text-foreground">{children}</strong>,
      h1: ({ children }: any) => <h3 className="mb-1.5 mt-3 font-display text-base font-semibold text-foreground">{children}</h3>,
      h2: ({ children }: any) => <h3 className="mb-1.5 mt-3 font-display text-base font-semibold text-foreground">{children}</h3>,
      h3: ({ children }: any) => <h3 className="mb-1.5 mt-3 font-display text-base font-semibold text-foreground">{children}</h3>,
      table: ({ children }: any) => (
        <div className="my-3 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[420px] border-collapse text-left text-sm">{children}</table>
        </div>
      ),
      th: ({ children }: any) => <th className="border-b border-border bg-muted/60 px-3 py-2 font-semibold">{children}</th>,
      td: ({ children }: any) => <td className="border-b border-border/60 px-3 py-2 align-top">{children}</td>,
      a: ({ href, children }: any) => {
        if (href?.startsWith("#item:")) {
          const [, kind, id] = href.split(":");
          const record = find(kind as CitableKind, id);
          return record ? (
            <Link
              href={record.href}
              className="mx-0.5 inline-flex items-center rounded-md border border-forest-500/30 bg-forest-100 px-2 py-0.5 text-xs font-semibold text-forest-900 hover:border-gold-500 dark:bg-forest-800 dark:text-gold-300"
            >
              {children}
            </Link>
          ) : (
            <span>{children}</span>
          );
        }
        if (href?.startsWith("#citation:")) {
          const [, act, section] = href.split(":");
          return (
            <button
              type="button"
              onClick={() => onOpenCitation(act || "", section || "")}
              className="mx-0.5 inline-flex items-center gap-1 rounded-md border border-forest-500/30 bg-forest-100 px-2 py-0.5 text-xs font-semibold text-forest-900 hover:border-gold-500 dark:bg-forest-800 dark:text-gold-300"
            >
              <Scale className="h-3 w-3 text-gold-600" aria-hidden="true" />
              {children}
            </button>
          );
        }
        return (
          <a href={href} target="_blank" rel="noreferrer" className="font-medium text-forest-700 underline underline-offset-2 dark:text-gold-400">
            {children}
          </a>
        );
      },
    }),
    [find, onOpenCitation]
  );

  const resolveTag = useCallback((kind: CitableKind, suffix: string) => records[kind].find((r) => r.id.endsWith(suffix)), [records]);
  const empty = !isLoadingHistory && messages.length === 0;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="space-y-1 border-b border-border px-5 py-4 text-left">
          <div className="flex items-center justify-between gap-3 pr-8">
            <SheetTitle className="flex items-center gap-2 font-display text-xl font-semibold">
              <Sparkles className="h-5 w-5 text-gold-600" aria-hidden="true" />
              Ask about this matter
            </SheetTitle>
            {messages.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={clearConversation} className="gap-1.5 text-muted-foreground">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Clear
              </Button>
            )}
          </div>
          <SheetDescription className="text-sm">
            It has read your summary, checklist, chats, document checks, drafts, and cases. Ask anything.
          </SheetDescription>
        </SheetHeader>

        <div ref={logRef} role="log" aria-live="polite" className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {isLoadingHistory && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              Loading your earlier questions…
            </p>
          )}

          {empty && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Try one of these, or type your own question below.</p>
              <div className="flex flex-col gap-2">
                {suggestionsFor(records).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    disabled={isStreaming}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-gold-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-forest-900 px-4 py-2.5 text-sm leading-relaxed text-forest-50 dark:bg-forest-800">
                  {m.content}
                </p>
              </div>
            ) : (
              <div key={m.id} className="space-y-2">
                {m.content ? (
                  <div className="rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {linkifyTags(m.content, resolveTag)}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    Reading your records…
                  </p>
                )}
                {m.sources && m.sources.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 px-1 text-xs text-muted-foreground">
                    <span>Based on</span>
                    {m.sources.map((s) => {
                      const record = find(s.kind, s.itemId);
                      const Icon = KIND_ICON[s.kind];
                      return record ? (
                        <Link
                          key={`${s.kind}:${s.itemId}`}
                          href={record.href}
                          className="inline-flex max-w-[12rem] items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 font-medium text-foreground hover:border-gold-500/60"
                        >
                          <Icon className="h-3 w-3 shrink-0 text-forest-700 dark:text-gold-400" aria-hidden="true" />
                          <span className="truncate">{record.title}</span>
                        </Link>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )
          )}
        </div>

        <form onSubmit={onSubmit} className="border-t border-border bg-background px-5 py-4">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 focus-within:border-gold-500/60 focus-within:ring-2 focus-within:ring-gold-500/20">
            <label htmlFor="matter-question" className="sr-only">
              Your question about this matter
            </label>
            <textarea
              id="matter-question"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder="Ask about this matter…"
              className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-base leading-relaxed placeholder:text-muted-foreground focus:outline-none sm:text-sm"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isStreaming} aria-label="Send question" className="h-10 w-10 shrink-0 rounded-xl">
              {isStreaming ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <ArrowUp className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">General information, not legal advice. Check important details in your records.</p>
        </form>
      </SheetContent>
    </Sheet>
  );
}
