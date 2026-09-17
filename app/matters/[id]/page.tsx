"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, CalendarClock, Check, Circle, ClipboardList, FileText, FolderOpen, Gavel, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChecklistItem = { text: string; completed: boolean };
type Matter = { id: string; title: string; category: string; status: "Open" | "Waiting" | "Resolved"; summary: string; nextAction: string; nextActionDue: string | null; checklist: ChecklistItem[]; updatedAt: string };
type LinkedDocument = { id: string; fileName: string; documentCategory: string; riskScore: number; executiveSummary: string; createdAt: string };
type LinkedCase = { id: string; caseNumber: string; title: string; court: string; stage: string; status: string; nextHearing: string | null };

export default function MatterDetailPage() {
  const params = useParams<{ id: string }>();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [documents, setDocuments] = useState<LinkedDocument[]>([]);
  const [cases, setCases] = useState<LinkedCase[]>([]);

  useEffect(() => {
    fetch(`/api/matters/${params.id}`).then((res) => res.json()).then((data) => {
      if (data.success) {
        setMatter(data.matter);
        setDocuments(data.documents || []);
        setCases(data.cases || []);
      }
    }).finally(() => setIsLoading(false));
  }, [params.id]);

  const updateMatter = async (patch: Partial<Matter>) => {
    if (!matter || isSaving) return;
    setIsSaving(true);
    const res = await fetch(`/api/matters/${matter.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    const data = await res.json();
    if (data.success) setMatter(data.matter);
    setIsSaving(false);
  };

  const addChecklistItem = (event: FormEvent) => {
    event.preventDefault();
    if (!matter || !newItem.trim()) return;
    const checklist = [...matter.checklist, { text: newItem.trim(), completed: false }];
    setNewItem("");
    updateMatter({ checklist });
  };

  if (isLoading) return <main className="container mx-auto max-w-5xl px-4 py-12 text-sm text-muted-foreground">Loading Matter…</main>;
  if (!matter) return <main className="container mx-auto max-w-5xl px-4 py-12"><Link href="/matters" className="text-sm font-semibold text-forest-700 hover:underline dark:text-gold-400">← Back to My Matters</Link><h1 className="mt-5 font-heading text-2xl font-bold">Matter not found</h1></main>;

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/matters" className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:underline dark:text-gold-400"><ArrowLeft className="h-3.5 w-3.5" /> My Matters</Link>
      <div className="mt-5 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-forest-700 dark:text-gold-400"><span>{matter.category}</span><span className="text-muted-foreground">·</span><select aria-label="Matter status" value={matter.status} onChange={(event) => updateMatter({ status: event.target.value as Matter["status"] })} className="cursor-pointer bg-transparent text-[10px] font-bold uppercase tracking-wide outline-none"><option>Open</option><option>Waiting</option><option>Resolved</option></select></div>
            <h1 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{matter.title}</h1>
            <textarea aria-label="Matter summary" defaultValue={matter.summary} onBlur={(event) => event.target.value !== matter.summary && updateMatter({ summary: event.target.value })} placeholder="Add a short summary of this issue…" className="mt-4 min-h-24 w-full resize-y rounded-xl border border-border bg-background p-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold-500/40" />
          </div>

          <div className="rounded-2xl border border-forest-500/30 bg-forest-50/70 p-5 dark:bg-forest-900/40 sm:p-6">
            <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-forest-700 dark:text-gold-400" /><h2 className="font-heading font-bold">Next best action</h2></div>
            <Input defaultValue={matter.nextAction} onBlur={(event) => event.target.value.trim() && event.target.value !== matter.nextAction && updateMatter({ nextAction: event.target.value })} className="mt-3 bg-background font-semibold" aria-label="Next action" />
            <label className="mt-3 block text-xs font-semibold text-muted-foreground">Due date<input type="date" defaultValue={matter.nextActionDue?.slice(0, 10) || ""} onChange={(event) => updateMatter({ nextActionDue: event.target.value || null })} className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500/40" /></label>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-forest-700 dark:text-gold-400" /><h2 className="font-heading font-bold">Action checklist</h2></div>
            <div className="mt-4 space-y-2">{matter.checklist.length === 0 ? <p className="text-sm text-muted-foreground">Add the small actions that will move this Matter forward.</p> : matter.checklist.map((item, index) => <button key={`${item.text}-${index}`} type="button" onClick={() => updateMatter({ checklist: matter.checklist.map((current, currentIndex) => currentIndex === index ? { ...current, completed: !current.completed } : current) })} className="flex w-full items-start gap-2.5 rounded-lg p-2 text-left text-sm hover:bg-muted/60"><span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${item.completed ? "border-forest-700 bg-forest-700 text-white dark:border-gold-500 dark:bg-gold-500 dark:text-forest-950" : "border-muted-foreground"}`}>{item.completed && <Check className="h-3 w-3" />}</span><span className={item.completed ? "text-muted-foreground line-through" : "text-foreground"}>{item.text}</span></button>)}</div>
            <form onSubmit={addChecklistItem} className="mt-4 flex gap-2"><Input value={newItem} onChange={(event) => setNewItem(event.target.value)} placeholder="Add an action" /><Button type="submit" size="icon" disabled={!newItem.trim() || isSaving} aria-label="Add action"><Plus className="h-4 w-4" /></Button></form>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2"><Gavel className="h-4 w-4 text-forest-700 dark:text-gold-400" /><h2 className="font-heading font-bold">Linked cases</h2></div>
            {cases.length === 0 ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">No court case is linked yet. Choose this Matter when you add a case in Case Tracker.</p> : <div className="mt-4 space-y-2">{cases.map((caseItem) => <Link key={caseItem.id} href="/dashboard" className="block rounded-xl border border-border p-3 transition-colors hover:border-gold-500/60 hover:bg-muted/30"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-foreground">{caseItem.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{caseItem.court} · {caseItem.stage}</p></div><span className="rounded-full bg-forest-100 px-2 py-1 text-[10px] font-bold text-forest-800 dark:bg-forest-800 dark:text-gold-400">{caseItem.status}</span></div><p className="mt-2 text-xs font-semibold text-foreground">{caseItem.nextHearing ? `Next hearing: ${new Date(caseItem.nextHearing).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : "Next hearing awaiting listing"}</p></Link>)}</div>}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-forest-700 dark:text-gold-400" /><h2 className="font-heading font-bold">Document reviews</h2></div>
            {documents.length === 0 ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">No document reviews are linked yet. Select this Matter before you analyze a document in the Simplifier.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {documents.map((document) => (
                  <Link key={document.id} href="/simplify" className="block rounded-xl border border-border p-3 transition-colors hover:border-gold-500/60 hover:bg-muted/30">
                    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-foreground">{document.fileName}</p><p className="mt-0.5 text-xs text-muted-foreground">{document.documentCategory}</p></div><span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${document.riskScore >= 70 ? "bg-rose-500/15 text-rose-700 dark:text-rose-400" : "bg-amber-500/15 text-amber-700 dark:text-amber-400"}`}>{document.riskScore >= 70 && <AlertTriangle className="h-3 w-3" />} Risk {document.riskScore}/100</span></div>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{document.executiveSummary}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="rounded-2xl border border-dashed border-border p-5 sm:p-6">
          <FolderOpen className="h-5 w-5 text-forest-700 dark:text-gold-400" />
          <h2 className="mt-3 font-heading font-bold">Your workspace is ready</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Document reviews and linked cases now connect here. Chat guidance and evidence will follow in separate build steps.</p>
          <div className="mt-5 space-y-2 text-xs text-muted-foreground"><p className="flex items-center gap-2"><Circle className="h-2.5 w-2.5" /> Chat guidance</p><p className="flex items-center gap-2"><Check className="h-3 w-3 text-forest-700 dark:text-gold-400" /> Documents and clause reviews</p><p className="flex items-center gap-2"><Check className="h-3 w-3 text-forest-700 dark:text-gold-400" /> Cases and hearing preparation</p></div>
        </aside>
      </div>
    </main>
  );
}
