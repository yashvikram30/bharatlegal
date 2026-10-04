"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { ArrowRight, FolderOpen, Plus, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, PageHeader, PageShell } from "@/components/page";

type Matter = { id: string; title: string; category: string; status: string; summary: string; nextAction: string; nextActionDue: string | null; updatedAt: string; counts?: { chat: number; document: number; draft: number; case: number } };

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const contents = (c?: Matter["counts"]) =>
  c
    ? [c.chat && plural(c.chat, "chat", "chats"), c.document && plural(c.document, "document checked", "documents checked"), c.draft && plural(c.draft, "draft", "drafts"), c.case && plural(c.case, "case", "cases")].filter(Boolean).join(" · ")
    : "";

export default function MattersPage() {
  const router = useRouter();
  const { status } = useSession();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [isLoadingMatters, setIsLoadingMatters] = useState(true);
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/matters")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMatters(data.matters);
        else toast.error("Couldn’t load your matters. Refresh to try again.");
      })
      .catch(() => toast.error("Couldn’t load your matters. Check your connection and refresh."))
      .finally(() => setIsLoadingMatters(false));
  }, [status]);

  const createMatter = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/matters", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
      const data = await res.json();
      if (data.success) {
        router.push(`/matters/${data.matter.id}`);
        return;
      }
      toast.error(data.error || "Couldn’t create the matter. Please try again.");
    } catch {
      toast.error("Couldn’t create the matter. Check your connection and try again.");
    }
    setIsSaving(false);
  };

  return (
    <PageShell>
      <PageHeader
        title="Keep every legal issue in one place"
        description="A matter keeps everything for one issue together: your AI chats, document checks, drafts, and court cases, plus the next step and a checklist."
      />

      {status === "loading" ? (
        <div className="h-40 animate-pulse rounded-2xl border border-border bg-card/60 motion-reduce:animate-none" aria-label="Loading" />
      ) : status === "unauthenticated" ? (
        <EmptyState
          icon={Scale}
          title="Save your legal work privately"
          description="Sign in to create matters and come back to your plans, notes, and next steps later."
          action={<Button onClick={() => signIn()}>Sign in to create a matter</Button>}
        />
      ) : (
        <>
          <form onSubmit={createMatter} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 sm:flex-row">
            <label htmlFor="matter-title" className="sr-only">
              Name of the legal issue
            </label>
            <Input
              id="matter-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={140}
              placeholder="Name a legal issue, e.g. Security-deposit refund"
              className="h-11 bg-background"
            />
            <Button type="submit" size="lg" disabled={!title.trim() || isSaving} className="shrink-0 gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" />
              {isSaving ? "Creating…" : "Create matter"}
            </Button>
          </form>

          {isLoadingMatters ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-card/60 motion-reduce:animate-none" />
              ))}
            </div>
          ) : matters.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="Start with one real issue"
              description="Create a matter for a contract, dispute, hearing, or any legal question you want to keep organized."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {matters.map((matter) => (
                <Link
                  key={matter.id}
                  href={`/matters/${matter.id}`}
                  className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-gold-500/60 hover:bg-forest-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 dark:hover:bg-forest-900/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        {matter.category} · {matter.status}
                      </p>
                      <h2 className="mt-1 font-display text-lg font-semibold text-foreground">{matter.title}</h2>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{contents(matter.counts) || "Nothing saved here yet"}</p>
                  <p className="mt-2 text-sm font-medium text-foreground">Next: {matter.nextAction}</p>
                  {matter.nextActionDue && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Due {new Date(matter.nextActionDue).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
