"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { ArrowRight, FolderOpen, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Matter = { id: string; title: string; category: string; status: string; summary: string; nextAction: string; nextActionDue: string | null; updatedAt: string };

export default function MattersPage() {
  const { status } = useSession();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/matters").then((res) => res.json()).then((data) => data.success && setMatters(data.matters)).catch(() => {});
  }, [status]);

  const createMatter = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || isSaving) return;
    setIsSaving(true);
    const res = await fetch("/api/matters", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
    const data = await res.json();
    if (data.success) window.location.assign(`/matters/${data.matter.id}`);
    setIsSaving(false);
  };

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-forest-500/20 bg-forest-100 px-3 py-1 text-xs font-semibold text-forest-800 dark:bg-forest-800 dark:text-forest-100"><FolderOpen className="h-3.5 w-3.5" /> My Matters</div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Keep every legal issue in one place.</h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">A Matter holds the next action, notes, and—soon—its related chats, documents, and case activity.</p>
        </div>
      </div>

      {status === "unauthenticated" ? (
        <div className="mt-10 rounded-2xl border border-border bg-card p-7 text-center shadow-sm"><Sparkles className="mx-auto h-6 w-6 text-gold-500" /><h2 className="mt-3 font-heading text-lg font-bold">Save your legal work privately</h2><p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Sign in to create Matters and return to your plans, notes, and next steps later.</p><Button onClick={() => signIn()} className="mt-5">Sign in to create a Matter</Button></div>
      ) : (
        <>
          <form onSubmit={createMatter} className="mt-10 flex flex-col gap-2 rounded-2xl border border-forest-500/25 bg-forest-50/70 p-4 dark:bg-forest-900/40 sm:flex-row">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={140} placeholder="Name a legal issue, e.g. Security-deposit refund" className="h-11 bg-background" />
            <Button type="submit" disabled={!title.trim() || isSaving} className="h-11 shrink-0 gap-2"><Plus className="h-4 w-4" /> Create Matter</Button>
          </form>

          {matters.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center"><FolderOpen className="mx-auto h-7 w-7 text-muted-foreground" /><h2 className="mt-3 font-heading font-bold">Start with one real issue</h2><p className="mt-1 text-sm text-muted-foreground">Create a Matter for a contract, dispute, hearing, or any legal question you want to organize.</p></div> : <div className="mt-6 grid gap-3 sm:grid-cols-2">{matters.map((matter) => <Link key={matter.id} href={`/matters/${matter.id}`} className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-gold-500/60 hover:bg-forest-50/50 dark:hover:bg-forest-900/50"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wide text-forest-700 dark:text-gold-400">{matter.category} · {matter.status}</p><h2 className="mt-1 font-heading text-lg font-bold text-foreground">{matter.title}</h2></div><ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" /></div><p className="mt-4 text-xs font-semibold text-foreground">Next: {matter.nextAction}</p>{matter.nextActionDue && <p className="mt-1 text-xs text-muted-foreground">Due {new Date(matter.nextActionDue).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>}</Link>)}</div>}
        </>
      )}
    </main>
  );
}
