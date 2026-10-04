"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarClock,
  Check,
  ChevronDown,
  ClipboardList,
  FileSignature,
  FileText,
  FolderOpen,
  Gavel,
  Layers,
  MessageSquare,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { BackLink, EmptyState, PageShell } from "@/components/page";
import { DRAFT_TEMPLATES } from "@/lib/drafting/templates";
import { CitationSheet } from "@/components/chat/citation-sheet";
import { MatterAssistant } from "@/components/matters/matter-assistant";

type ChecklistItem = { text: string; completed: boolean };
type Status = "Open" | "Waiting" | "Resolved";
type Matter = { id: string; title: string; category: string; status: Status; summary: string; nextAction: string; nextActionDue: string | null; checklist: ChecklistItem[]; createdAt: string; updatedAt: string };
type Kind = "chat" | "document" | "draft" | "case";
type Tone = "neutral" | "good" | "warn" | "bad";
type Row = { kind: Kind; id: string; title: string; detail: string; href: string; date: string; badge?: { text: string; tone: Tone }; when?: string };
type Candidate = { id: string; title: string; detail: string };
type Candidates = Record<Kind, Candidate[]>;
type Tab = "all" | Kind;

const KINDS: { kind: Kind; plural: string; label: string; icon: LucideIcon; newLabel: string; addShort: string; dateLabel: string; emptyText: string }[] = [
  { kind: "chat", addShort: "Chat", dateLabel: "Active", plural: "Chats", label: "Chat", icon: MessageSquare, newLabel: "New chat", emptyText: "Start a chat about this issue and it will be kept here." },
  { kind: "document", addShort: "Document", dateLabel: "Checked", plural: "Documents", label: "Document check", icon: FileText, newLabel: "Check a document", emptyText: "Check a contract or notice and its risk review will be kept here." },
  { kind: "draft", addShort: "Draft", dateLabel: "Edited", plural: "Drafts", label: "Draft", icon: FileSignature, newLabel: "Draft a document", emptyText: "Draft a notice, agreement, or application and it will be kept here." },
  { kind: "case", addShort: "Case", dateLabel: "Updated", plural: "Cases", label: "Court case", icon: Gavel, newLabel: "Add a case", emptyText: "Add a court case to track its hearings alongside this matter." },
];
const META = Object.fromEntries(KINDS.map((k) => [k.kind, k])) as Record<Kind, (typeof KINDS)[number]>;

const startHref = (kind: Kind, matterId: string) =>
  ({
    chat: `/chat?matterId=${matterId}`,
    document: `/simplify?matterId=${matterId}`,
    draft: `/draft?matterId=${matterId}`,
    case: `/dashboard?matterId=${matterId}&add=1`,
  })[kind];

const STATUS_DOT: Record<Status, string> = { Open: "bg-emerald-500", Waiting: "bg-amber-500", Resolved: "bg-forest-400" };
const TONE: Record<Tone, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  good: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  warn: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  bad: "bg-rose-500/15 text-rose-800 dark:text-rose-300",
};

const fmt = (value: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  value ? new Date(value).toLocaleDateString("en-IN", opts) : "";

/** Whole days from today to a date (negative = in the past), ignoring time and timezone drift. */
function daysUntil(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - today) / 86_400_000);
}

function countdown(iso: string | null): { text: string; tone: Tone } | null {
  if (!iso) return null;
  const n = daysUntil(iso);
  if (n < 0) return { text: `Overdue by ${-n} day${n === -1 ? "" : "s"}`, tone: "bad" };
  if (n === 0) return { text: "Due today", tone: "warn" };
  if (n === 1) return { text: "Due tomorrow", tone: "warn" };
  if (n <= 7) return { text: `In ${n} days`, tone: "warn" };
  return { text: `In ${n} days`, tone: "neutral" };
}

function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[tone]}`}>{children}</span>;
}

export default function MatterDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [summaryState, setSummaryState] = useState<"idle" | "saving" | "saved">("idle");
  const [rows, setRows] = useState<Row[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [candidates, setCandidates] = useState<Candidates | null>(null);
  const [adding, setAdding] = useState(false);
  const [busyItem, setBusyItem] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantSeed, setAssistantSeed] = useState<string | null>(null);
  const [citation, setCitation] = useState<{ act: string; section: string } | null>(null);
  const titleInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/matters/${params.id}`);
    const data = await res.json();
    if (!data.success) return;
    setMatter(data.matter);
    const riskTone = (score: number): Tone => (score >= 70 ? "bad" : score >= 40 ? "warn" : "good");
    setRows([
      ...(data.chats || []).map((c: any): Row => ({ kind: "chat", id: c.id, title: c.title, detail: "AI conversation", href: `/chat?conversationId=${c.id}`, date: c.updatedAt })),
      ...(data.documents || []).map((d: any): Row => ({
        kind: "document",
        id: d.id,
        title: d.fileName,
        detail: d.documentCategory,
        href: `/simplify?doc=${d.id}`,
        date: d.createdAt,
        badge: { text: `Risk ${d.riskScore}/100`, tone: riskTone(d.riskScore) },
      })),
      ...(data.drafts || []).map((d: any): Row => ({
        kind: "draft",
        id: d.id,
        title: d.title,
        detail: DRAFT_TEMPLATES.find((t) => t.id === d.draftType)?.shortTitle ?? "Draft",
        href: `/draft?draft=${d.id}`,
        date: d.updatedAt,
      })),
      ...(data.cases || []).map((c: any): Row => ({
        kind: "case",
        id: c.id,
        title: c.title,
        detail: `${c.caseNumber} · ${c.court}`,
        href: "/dashboard",
        date: c.updatedAt || c.nextHearing || "",
        when: c.nextHearing || undefined,
        badge: { text: c.stage, tone: "neutral" },
      })),
    ]);
  }, [params.id]);

  useEffect(() => {
    load()
      .catch(() => toast.error("Couldn’t load this matter. Check your connection and refresh."))
      .finally(() => setIsLoading(false));
  }, [load]);

  const byKind = useMemo(
    () => ({
      chat: rows.filter((r) => r.kind === "chat"),
      document: rows.filter((r) => r.kind === "document"),
      draft: rows.filter((r) => r.kind === "draft"),
      case: rows.filter((r) => r.kind === "case"),
    }),
    [rows]
  );

  const visible = useMemo(
    () => (tab === "all" ? [...rows].sort((a, b) => +new Date(b.date) - +new Date(a.date)) : byKind[tab]),
    [rows, byKind, tab]
  );

  const nextHearing = useMemo(() => {
    const upcoming = byKind.case
      .filter((c) => c.when && daysUntil(c.when) >= 0)
      .sort((a, b) => +new Date(a.when!) - +new Date(b.when!));
    return upcoming[0] ?? null;
  }, [byKind.case]);

  const loadCandidates = useCallback(async () => {
    try {
      const res = await fetch(`/api/matters/${params.id}/candidates`);
      const data = await res.json();
      if (data.success) setCandidates({ chat: data.chat, document: data.document, draft: data.draft, case: data.case });
    } catch {
      toast.error("Couldn’t load your other items. Please try again.");
    }
  }, [params.id]);

  const toggleAdding = () => {
    setAdding((v) => !v);
    loadCandidates();
  };

  const changeLink = async (kind: Kind, itemId: string, action: "link" | "unlink") => {
    setBusyItem(itemId);
    try {
      const res = await fetch(`/api/matters/${params.id}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: kind, itemId, action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Couldn’t update the matter.");
      toast.success(action === "link" ? "Added to this matter" : "Removed from this matter");
      await load();
      if (adding) await loadCandidates();
    } catch (err: any) {
      toast.error(err.message || "Couldn’t update the matter. Please try again.");
    }
    setBusyItem(null);
  };

  const updateMatter = async (patch: Partial<Matter>): Promise<boolean> => {
    if (!matter || isSaving) return false;
    setIsSaving(true);
    let ok = false;
    try {
      const res = await fetch(`/api/matters/${matter.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      const data = await res.json();
      if (data.success) {
        setMatter(data.matter);
        ok = true;
      } else toast.error(data.error || "Couldn’t save that change. Please try again.");
    } catch {
      toast.error("Couldn’t save that change. Check your connection and try again.");
    }
    setIsSaving(false);
    return ok;
  };

  const saveSummary = async (value: string) => {
    if (!matter || value === matter.summary) return;
    setSummaryState("saving");
    const ok = await updateMatter({ summary: value });
    setSummaryState(ok ? "saved" : "idle");
    if (ok) setTimeout(() => setSummaryState("idle"), 2500);
  };

  const saveTitle = async (value: string) => {
    setEditingTitle(false);
    const next = value.trim();
    if (!matter || !next || next === matter.title) return;
    await updateMatter({ title: next });
  };

  const addChecklistItem = (event: FormEvent) => {
    event.preventDefault();
    if (!matter || !newItem.trim()) return;
    const checklist = [...matter.checklist, { text: newItem.trim(), completed: false }];
    setNewItem("");
    updateMatter({ checklist });
  };

  const deleteMatter = async () => {
    if (!matter) return;
    if (!window.confirm("Delete this matter? Its chats, documents, drafts, and cases are kept. They just won’t be grouped together any more.")) return;
    try {
      const res = await fetch(`/api/matters/${matter.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Couldn’t delete the matter.");
      toast.success("Matter deleted");
      router.push("/matters");
    } catch (err: any) {
      toast.error(err.message || "Couldn’t delete the matter. Please try again.");
    }
  };

  useEffect(() => {
    if (editingTitle) titleInput.current?.select();
  }, [editingTitle]);

  const onTitleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") saveTitle(e.currentTarget.value);
    if (e.key === "Escape") setEditingTitle(false);
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-card/60 motion-reduce:animate-none" aria-label="Loading matter" />
      </PageShell>
    );
  }
  if (!matter) {
    return (
      <PageShell>
        <BackLink href="/matters">My matters</BackLink>
        <EmptyState
          icon={FolderOpen}
          title="We couldn’t find that matter"
          description="It may have been deleted, or it belongs to a different account."
          action={
            <Button asChild>
              <Link href="/matters">Go to my matters</Link>
            </Button>
          }
        />
      </PageShell>
    );
  }

  const due = countdown(matter.nextActionDue);
  const done = matter.checklist.filter((c) => c.completed).length;
  const total = matter.checklist.length;
  const hearingDays = nextHearing?.when ? daysUntil(nextHearing.when) : null;
  const activeKind = tab === "all" ? null : META[tab];

  return (
    <PageShell>
      <BackLink href="/matters">My matters</BackLink>

      {/* ============ The issue ============ */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-forest-100 px-3 py-1 font-medium text-forest-800 dark:bg-forest-800 dark:text-gold-400">{matter.category}</span>
          <span className="relative inline-flex items-center">
            <span className={`pointer-events-none absolute left-3 h-2 w-2 rounded-full ${STATUS_DOT[matter.status]}`} aria-hidden="true" />
            <label htmlFor="matter-status" className="sr-only">
              Status
            </label>
            <select
              id="matter-status"
              value={matter.status}
              onChange={(event) => updateMatter({ status: event.target.value as Status })}
              className="cursor-pointer rounded-full border border-border bg-card py-1 pl-7 pr-3 font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              <option>Open</option>
              <option>Waiting</option>
              <option>Resolved</option>
            </select>
          </span>
          <span className="text-muted-foreground">Updated {fmt(matter.updatedAt)}</span>
        </div>

        {editingTitle ? (
          <input
            ref={titleInput}
            defaultValue={matter.title}
            maxLength={140}
            aria-label="Matter title"
            onBlur={(e) => saveTitle(e.target.value)}
            onKeyDown={onTitleKey}
            className="w-full rounded-xl border border-gold-500/60 bg-card px-3 py-1 font-display text-3xl font-semibold tracking-tight text-foreground outline-none ring-2 ring-gold-500/20 sm:text-4xl"
          />
        ) : (
          <h1 className="group flex items-start gap-3 text-balance font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            <span>{matter.title}</span>
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              aria-label="Rename this matter"
              title="Rename"
              className="mt-2 rounded-md p-1.5 text-muted-foreground opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 group-hover:opacity-100"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </h1>
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <label htmlFor="matter-summary" className="font-medium text-foreground">
              What this is about
            </label>
            <span className="text-muted-foreground" aria-live="polite">
              {summaryState === "saving" ? "Saving…" : summaryState === "saved" ? "Saved" : "The assistant reads this"}
            </span>
          </div>
          <textarea
            id="matter-summary"
            defaultValue={matter.summary}
            onBlur={(event) => saveSummary(event.target.value)}
            placeholder="Describe the issue in a few sentences: who is involved, what happened, what you want."
            className="min-h-24 w-full resize-y rounded-xl border border-border bg-card p-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold-500/40 sm:text-sm"
          />
        </div>
      </header>

      {/* ============ At a glance ============ */}
      <section aria-label="At a glance" className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-forest-500/30 bg-forest-50/70 p-5 dark:bg-forest-900/40">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            Next step
          </h2>
          <label htmlFor="next-action" className="sr-only">
            Next action
          </label>
          <Input
            id="next-action"
            defaultValue={matter.nextAction}
            onBlur={(event) => event.target.value.trim() && event.target.value !== matter.nextAction && updateMatter({ nextAction: event.target.value })}
            className="mt-2 h-auto border-transparent bg-transparent px-0 font-display text-xl font-semibold shadow-none focus-visible:border-input focus-visible:bg-background focus-visible:px-3"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label htmlFor="next-due" className="sr-only">
              Due date
            </label>
            <input
              id="next-due"
              type="date"
              defaultValue={matter.nextActionDue?.slice(0, 10) || ""}
              onChange={(event) => updateMatter({ nextActionDue: event.target.value || null })}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500/40"
            />
            {due ? <Pill tone={due.tone}>{due.text}</Pill> : <span className="text-sm text-muted-foreground">No due date</span>}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Gavel className="h-4 w-4" aria-hidden="true" />
            Next hearing
          </h2>
          {nextHearing?.when ? (
            <>
              <p className="mt-2 font-display text-xl font-semibold text-foreground">{fmt(nextHearing.when, { day: "numeric", month: "short", year: "numeric" })}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {hearingDays === 0 ? "Today" : hearingDays === 1 ? "Tomorrow" : `In ${hearingDays} days`} · {nextHearing.title}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 font-display text-xl font-semibold text-foreground">None scheduled</p>
              <Link href={startHref("case", matter.id)} className="mt-1 inline-block text-sm font-semibold text-forest-700 hover:underline dark:text-gold-400">
                Add a court case
              </Link>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Layers className="h-4 w-4" aria-hidden="true" />
            Saved here
          </h2>
          <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {KINDS.map(({ kind, plural, icon: Icon }) => (
              <li key={kind}>
                <button
                  type="button"
                  onClick={() => {
                    setTab(kind);
                    setAdding(false);
                    document.getElementById("records")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-sm hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                >
                  <Icon className="h-4 w-4 text-forest-700 dark:text-gold-400" aria-hidden="true" />
                  <span className="font-display text-lg font-semibold text-foreground">{byKind[kind].length}</span>
                  <span className="text-muted-foreground">{plural}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)]">
        <div className="min-w-0 space-y-6">
          {/* ============ Assistant ============ */}
          <section aria-labelledby="assistant-heading" className="rounded-2xl border border-gold-500/40 bg-gold-100/40 p-5 dark:bg-gold-500/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 id="assistant-heading" className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                  <Sparkles className="h-5 w-5 text-gold-600" aria-hidden="true" />
                  Ask about this matter
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">It has read everything saved here. Ask what to do next, what a clause means, or when to be in court.</p>
              </div>
              <Button type="button" onClick={() => setAssistantOpen(true)} className="shrink-0 gap-2">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Open assistant
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "Where does this matter stand, and what should I do next?",
                ...(byKind.document.length ? ["What are the biggest risks in my documents?"] : []),
                ...(byKind.case.length ? ["When is my next hearing, and what should I prepare?"] : []),
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setAssistantSeed(q);
                    setAssistantOpen(true);
                  }}
                  className="rounded-full border border-border bg-background px-3 py-1 text-left text-sm font-medium text-foreground transition-colors hover:border-gold-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                >
                  {q}
                </button>
              ))}
            </div>
          </section>

          {/* ============ Everything saved in this matter ============ */}
          <section id="records" aria-labelledby="records-heading" className="scroll-mt-24 space-y-4">
            <h2 id="records-heading" className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              Everything in this matter
            </h2>

            {rows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5 sm:p-6">
                <p className="text-sm text-muted-foreground">Nothing is saved here yet. Start with one of these and it will be kept in this matter automatically.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {KINDS.map(({ kind, icon: Icon, newLabel }) => (
                    <Link
                      key={kind}
                      href={startHref(kind, matter.id)}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-gold-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-forest-100 text-forest-800 dark:bg-forest-800 dark:text-gold-400">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="font-semibold text-foreground">{newLabel}</span>
                      <Plus className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:rotate-90" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card">
                <div role="tablist" aria-label="Kinds of record" className="flex gap-1 overflow-x-auto border-b border-border p-2 scrollbar-none scroll-fade-x">
                  {([{ id: "all" as Tab, label: "All", count: rows.length }, ...KINDS.map((k) => ({ id: k.kind as Tab, label: k.plural, count: byKind[k.kind].length }))]).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      id={`tab-${t.id}`}
                      aria-selected={tab === t.id}
                      aria-controls="records-panel"
                      onClick={() => {
                        setTab(t.id);
                        setAdding(false);
                      }}
                      className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
                        tab === t.id ? "bg-forest-800 text-white dark:bg-gold-500 dark:text-forest-950" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      {t.label} <span className={tab === t.id ? "opacity-80" : "opacity-60"}>{t.count}</span>
                    </button>
                  ))}
                </div>

                <div id="records-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="space-y-4 p-4 sm:p-5">
                  {/* what you can add */}
                  <div className="flex flex-wrap items-center gap-2">
                    {activeKind ? (
                      <>
                        <Button asChild size="sm" className="gap-1.5">
                          <Link href={startHref(activeKind.kind, matter.id)}>
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            {activeKind.newLabel}
                          </Link>
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={toggleAdding} aria-expanded={adding}>
                          {adding ? "Done adding" : "Add existing"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-muted-foreground">Add:</span>
                        {KINDS.map(({ kind, icon: Icon, addShort, newLabel }) => (
                          <Button key={kind} asChild size="sm" variant="outline" className="gap-1.5">
                            <Link href={startHref(kind, matter.id)} aria-label={newLabel}>
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                              <Icon className="h-4 w-4 text-forest-700 dark:text-gold-400" aria-hidden="true" />
                              {addShort}
                            </Link>
                          </Button>
                        ))}
                      </>
                    )}
                  </div>

                  {/* the records */}
                  {visible.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border p-5 text-sm leading-relaxed text-muted-foreground">{activeKind?.emptyText}</p>
                  ) : (
                    <ul className="space-y-2">
                      {visible.map((item) => {
                        const Icon = META[item.kind].icon;
                        return (
                          <li key={`${item.kind}-${item.id}`} className="flex items-center gap-1 rounded-xl border border-border bg-background pr-2 transition-colors hover:border-gold-500/60">
                            <Link href={item.href} className="flex min-w-0 flex-1 items-center gap-3.5 rounded-xl p-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-forest-100 text-forest-800 dark:bg-forest-800 dark:text-gold-400">
                                <Icon className="h-5 w-5" aria-hidden="true" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="line-clamp-2 break-words text-base font-semibold text-foreground sm:line-clamp-1">{item.title}</span>
                                <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                                  {tab === "all" && <span className="font-medium text-foreground/80">{META[item.kind].label}</span>}
                                  <span className="break-words">{item.detail}</span>
                                  {item.badge && (
                                    <span className="sm:hidden">
                                      <Pill tone={item.badge.tone}>{item.badge.text}</Pill>
                                    </span>
                                  )}
                                  {item.date && (
                                    <span>
                                      {META[item.kind].dateLabel} {fmt(item.date, { day: "numeric", month: "short" })}
                                    </span>
                                  )}
                                </span>
                              </span>
                              {item.badge && (
                                <span className="hidden shrink-0 sm:inline-flex">
                                  <Pill tone={item.badge.tone}>{item.badge.text}</Pill>
                                </span>
                              )}
                            </Link>
                            <button
                              type="button"
                              disabled={busyItem === item.id}
                              onClick={() => changeLink(item.kind, item.id, "unlink")}
                              aria-label={`Remove ${item.title} from this matter`}
                              title="Remove from this matter"
                              className="shrink-0 rounded-md p-2 text-muted-foreground hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:opacity-50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* add something you already made */}
                  {adding && activeKind && (
                    <div className="space-y-2 rounded-xl border border-dashed border-border bg-muted/30 p-4">
                      <p className="text-sm font-semibold text-foreground">Not in any matter yet</p>
                      {candidates === null ? (
                        <p className="text-sm text-muted-foreground">Loading…</p>
                      ) : candidates[activeKind.kind].length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nothing to add. Everything of this kind is already in a matter.</p>
                      ) : (
                        <ul className="space-y-2">
                          {candidates[activeKind.kind].map((c) => (
                            <li key={c.id} className="flex items-center justify-between gap-3 rounded-lg bg-background p-3">
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold text-foreground">{c.title}</span>
                                {c.detail && <span className="block truncate text-sm text-muted-foreground">{c.detail}</span>}
                              </span>
                              <Button type="button" size="sm" variant="outline" disabled={busyItem === c.id} onClick={() => changeLink(activeKind.kind, c.id, "link")}>
                                Add
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ============ Checklist ============ */}
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                <ClipboardList className="h-5 w-5 text-forest-700 dark:text-gold-400" aria-hidden="true" />
                Checklist
              </h2>
              {total > 0 && (
                <span className="text-sm font-medium text-muted-foreground">
                  {done} of {total} done
                </span>
              )}
            </div>
            {total > 0 && (
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={done}
                aria-label="Checklist progress"
              >
                <div className="h-full rounded-full bg-forest-700 transition-all dark:bg-gold-500" style={{ width: `${(done / total) * 100}%` }} />
              </div>
            )}
            <div className="mt-3 space-y-1">
              {total === 0 ? (
                <p className="text-sm text-muted-foreground">Add the small actions that will move this matter forward.</p>
              ) : (
                matter.checklist.map((item, index) => (
                  <button
                    key={`${item.text}-${index}`}
                    type="button"
                    aria-pressed={item.completed}
                    onClick={() =>
                      updateMatter({
                        checklist: matter.checklist.map((current, currentIndex) => (currentIndex === index ? { ...current, completed: !current.completed } : current)),
                      })
                    }
                    className="flex w-full items-start gap-3 rounded-lg p-2 text-left text-sm hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        item.completed ? "border-forest-700 bg-forest-700 text-white dark:border-gold-500 dark:bg-gold-500 dark:text-forest-950" : "border-muted-foreground"
                      }`}
                    >
                      {item.completed && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                    </span>
                    <span className={item.completed ? "text-muted-foreground line-through" : "text-foreground"}>{item.text}</span>
                  </button>
                ))
              )}
            </div>
            <form onSubmit={addChecklistItem} className="mt-4 flex gap-2">
              <label htmlFor="new-action" className="sr-only">
                New action
              </label>
              <Input id="new-action" value={newItem} onChange={(event) => setNewItem(event.target.value)} placeholder="Add an action" className="text-base sm:text-sm" />
              <Button type="submit" size="icon" disabled={!newItem.trim() || isSaving} aria-label="Add action">
                <Plus className="h-4 w-4" />
              </Button>
            </form>
          </section>

          <details className="group rounded-2xl border border-border bg-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 [&::-webkit-details-marker]:hidden">
              Matter settings
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="border-t border-border px-5 py-4">
              <button
                type="button"
                onClick={deleteMatter}
                className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-rose-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 dark:text-rose-400"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete this matter
              </button>
              <p className="mt-1.5 text-sm text-muted-foreground">Its chats, documents, drafts, and cases are kept. They just stop being grouped together.</p>
            </div>
          </details>
        </aside>
      </div>

      <MatterAssistant
        matterId={matter.id}
        open={assistantOpen}
        onOpenChange={setAssistantOpen}
        records={byKind}
        seedQuestion={assistantSeed}
        onSeedUsed={() => setAssistantSeed(null)}
        onOpenCitation={(act, section) => setCitation({ act, section })}
      />
      <CitationSheet citation={citation} isOpen={!!citation} onClose={() => setCitation(null)} />
    </PageShell>
  );
}
