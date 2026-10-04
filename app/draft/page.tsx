"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LogIn,
  FileText,
  Scale,
  Sparkles,
  Copy,
  Check,
  Download,
  Printer,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Eye,
  Save,
  RefreshCw,
  History,
  Trash2,
  ShieldCheck,
  Building,
  CreditCard,
  ShoppingBag,
  Send,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import toast from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import {
  DRAFT_TEMPLATES,
  DocumentTemplate,
  TemplateField,
} from "@/lib/drafting/templates";
import { useQuickConsultation } from "@/context/QuickConsultationContext";
import { EmptyState, PageHeader, PageShell } from "@/components/page";

type GroupId = TemplateField["section"];

const GROUP_ORDER: GroupId[] = ["parties", "details", "financials", "terms"];

const GROUP_META: Record<GroupId, { title: string; hint: string; icon: React.ElementType }> = {
  parties: { title: "Who’s involved", hint: "Names and addresses of everyone named in the document.", icon: ShieldCheck },
  details: { title: "The details", hint: "What the document is about.", icon: FileText },
  financials: { title: "The money", hint: "Amounts, dates, and payment terms.", icon: CreditCard },
  terms: { title: "Terms and what you’re asking for", hint: "Conditions and facts. You can add special clauses at the end.", icon: Scale },
};

/** Empty answers, except for fields that have a sensible default (dropdowns, mostly). */
function emptyFormData(tmpl: DocumentTemplate): Record<string, any> {
  const data: Record<string, any> = {};
  for (const f of tmpl.fields) {
    if (f.defaultValue !== undefined) data[f.id] = f.defaultValue;
  }
  return data;
}

function FieldInput({
  field,
  value,
  invalid,
  onChange,
}: {
  field: TemplateField;
  value: any;
  invalid: boolean;
  onChange: (value: any) => void;
}) {
  const id = `field-${field.id}`;
  const base = `bg-background text-base sm:text-sm ${invalid ? "border-rose-500 focus-visible:ring-rose-500" : "border-border"}`;
  return (
    <div className={`space-y-1.5 ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {field.label}
        {field.required && (
          <span className="text-rose-600" aria-hidden="true">
            {" "}
            *
          </span>
        )}
        {field.required && <span className="sr-only"> (required)</span>}
      </label>
      {field.type === "textarea" ? (
        <Textarea
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          aria-invalid={invalid}
          className={`${base} resize-none`}
        />
      ) : field.type === "select" ? (
        <select
          id={id}
          value={value ?? field.defaultValue ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`h-10 w-full rounded-md border px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${base}`}
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          id={id}
          type={field.type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          aria-invalid={invalid}
          className={base}
        />
      )}
      {invalid ? (
        <p className="text-sm font-medium text-rose-700 dark:text-rose-400">This answer is needed to write the document.</p>
      ) : (
        field.helperText && <p className="text-sm text-muted-foreground">{field.helperText}</p>
      )}
    </div>
  );
}

/**
 * The AI sometimes answers in markdown (**bold**, ### headings, --- rules). A legal document
 * should read as plain text, so strip the markup before showing, copying, or downloading it.
 */
function tidyDraft(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/gm, "______________________________");
}

const STEPS = ["Choose a document", "Answer a few questions", "Review and download"] as const;

function LegalDraftPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const matterParam = searchParams.get("matterId") || "";
  const draftParam = searchParams.get("draft");
  const openedDraftFromUrl = useRef(false);

  // The matter this draft is filed under ("" = none). Starts from ?matterId= when you arrive from a matter.
  const [matters, setMatters] = useState<{ id: string; title: string }[]>([]);
  const [draftMatterId, setDraftMatterId] = useState(matterParam);
  const { openConsultation } = useQuickConsultation();

  // Wizard state: 1: Choose a document | 2: Answer questions | 3: Review and download
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(
    DRAFT_TEMPLATES[0]
  );
  const [formData, setFormData] = useState<Record<string, any>>(() =>
    emptyFormData(DRAFT_TEMPLATES[0])
  );
  // The questionnaire shows one group of questions at a time.
  const [groupIndex, setGroupIndex] = useState(0);
  const [missing, setMissing] = useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = useState("");

  // Studio / Generated Draft state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string>("");
  const [draftTitle, setDraftTitle] = useState<string>("");
  const [savedDraftId, setSavedDraftId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // History state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Initialize form data when template changes
  const handleSelectTemplate = (tmpl: DocumentTemplate) => {
    setSelectedTemplate(tmpl);
    setFormData(emptyFormData(tmpl));
    setGroupIndex(0);
    setMissing([]);
    setStep(2);
  };

  const handleInputChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    setMissing((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : prev));
  };

  const handleFillSample = () => {
    setFormData(selectedTemplate.sampleData);
    setMissing([]);
    toast.success("Filled with an example. Replace it with your own details.");
  };

  // The question groups this template actually uses, in order.
  const groups = GROUP_ORDER.filter((g) => selectedTemplate.fields.some((f) => f.section === g));
  const currentGroup = groups[Math.min(groupIndex, groups.length - 1)];
  const isLastGroup = groupIndex >= groups.length - 1;

  const goNext = () => {
    const missingHere = selectedTemplate.fields
      .filter((f) => f.section === currentGroup && f.required)
      .filter((f) => String(formData[f.id] ?? "").trim() === "")
      .map((f) => f.id);
    if (missingHere.length > 0) {
      setMissing(missingHere);
      toast.error("Please fill in the highlighted questions.");
      // Take the user to the first question that needs an answer.
      requestAnimationFrame(() => document.getElementById(`field-${missingHere[0]}`)?.focus());
      return;
    }
    setMissing([]);
    if (isLastGroup) handleGenerate();
    else {
      setGroupIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    setMissing([]);
    if (groupIndex === 0) setStep(1);
    else setGroupIndex((i) => i - 1);
  };

  // Fetch saved drafts from MongoDB
  const fetchDraftHistory = async () => {
    if (!session) return;
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/draft");
      const data = await res.json();
      if (data.success && data.drafts) {
        setSavedDrafts(data.drafts);
      }
    } catch (err) {
      console.error("Failed to load drafts:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDraftHistory();
      fetch("/api/matters")
        .then((res) => res.json())
        .then((data) => data.success && setMatters(data.matters || []))
        .catch(() => {});
    }
  }, [session]);

  // Open the draft named in ?draft=ID (used by links from a matter) once the saved drafts have loaded.
  useEffect(() => {
    if (!draftParam || openedDraftFromUrl.current || savedDrafts.length === 0) return;
    const target = savedDrafts.find((d) => d._id === draftParam);
    if (target) {
      openedDraftFromUrl.current = true;
      handleRestoreDraft(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftParam, savedDrafts]);

  // Generate legal draft
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftType: selectedTemplate.id,
          formData,
          customInstructions,
          saveToDb: !!session,
          existingDraftId: savedDraftId || undefined,
          matterId: session ? draftMatterId : undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to generate draft");
      }

      setGeneratedDraft(tidyDraft(data.draft.generatedContent));
      setDraftTitle(data.draft.title);
      if (data.draft.id) {
        setSavedDraftId(data.draft.id);
      }
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success("Your draft is ready. Read it through before you use it.");
    } catch (err: any) {
      toast.error(err.message || "We couldn’t create your draft. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Save changes to existing draft
  const handleSaveDraft = async () => {
    if (!session) {
      toast.error("Sign in to save drafts to your account.");
      return;
    }
    setIsSaving(true);
    try {
      if (savedDraftId) {
        const res = await fetch(`/api/draft/${savedDraftId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: draftTitle,
            generatedContent: generatedDraft,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Changes saved");
          fetchDraftHistory();
        }
      } else {
        const res = await fetch("/api/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            draftType: selectedTemplate.id,
            formData,
            customInstructions,
            saveToDb: true,
            matterId: draftMatterId,
          }),
        });
        const data = await res.json();
        if (data.success && data.draft?.id) {
          setSavedDraftId(data.draft.id);
          toast.success("Draft saved to your account");
          fetchDraftHistory();
        }
      }
    } catch (err) {
      toast.error("Couldn’t save your draft. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Restore draft from history
  const handleRestoreDraft = (d: any) => {
    const tmpl = DRAFT_TEMPLATES.find((t) => t.id === d.draftType) || DRAFT_TEMPLATES[0];
    setSelectedTemplate(tmpl);
    setFormData(d.formData || tmpl.sampleData);
    setGeneratedDraft(tidyDraft(d.generatedContent));
    setDraftTitle(d.title);
    setSavedDraftId(d._id);
    setDraftMatterId(d.matterId ? String(d.matterId) : "");
    setGroupIndex(0);
    setStep(3);
    setHistoryOpen(false);
    toast.success(`Restored "${d.title}"`);
  };

  // Delete draft from history
  const handleDeleteDraft = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this saved draft? This can’t be undone.")) return;
    try {
      const res = await fetch(`/api/draft/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Draft deleted");
        setSavedDrafts((prev) => prev.filter((item) => item._id !== id));
        if (savedDraftId === id) {
          setSavedDraftId(null);
        }
      }
    } catch (err) {
      toast.error("Couldn’t delete that draft. Please try again.");
    }
  };

  // File this draft under a matter (or take it out of one).
  const handleChangeDraftMatter = async (nextMatterId: string) => {
    const previous = draftMatterId;
    setDraftMatterId(nextMatterId);
    if (!savedDraftId) return; // it will be filed when the draft is saved
    try {
      const res = await fetch(`/api/draft/${savedDraftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matterId: nextMatterId || null }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Couldn’t update the matter.");
      toast.success(nextMatterId ? "Draft added to the matter" : "Draft removed from the matter");
      fetchDraftHistory();
    } catch (err: any) {
      setDraftMatterId(previous);
      toast.error(err.message || "Couldn’t update the matter. Please try again.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    toast.success("Copied. You can paste it into any document.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedDraft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${draftTitle.replace(/[^a-zA-Z0-9_-]/g, "_") || "legal_document"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Document downloaded");
  };

  const handlePrint = () => {
    window.print();
  };

  // Template icon helper
  const getTemplateIcon = (id: string) => {
    switch (id) {
      case "residential-rent-agreement":
        return Building;
      case "cheque-bounce-notice":
        return CreditCard;
      case "consumer-grievance-notice":
        return ShoppingBag;
      case "rti-application":
        return Send;
      default:
        return FileText;
    }
  };

  const stepLabel = STEPS[step - 1];

  return (
    <PageShell>
      <PageHeader
        title="Draft a legal document"
        description="Answer a few questions and get a draft lease, cheque-bounce notice, consumer complaint, or RTI application based on Indian law. Have an advocate review it before you sign or send it."
        actions={
          session ? (
            <Button
              variant="outline"
              onClick={() => {
                fetchDraftHistory();
                setHistoryOpen(true);
              }}
              className="gap-2"
            >
              <History className="h-4 w-4 text-forest-600 dark:text-gold-400" aria-hidden="true" />
              Saved drafts
              {savedDrafts.length > 0 && (
                <span className="rounded-full bg-forest-100 px-1.5 text-xs font-bold text-forest-800 dark:bg-forest-800 dark:text-gold-400">
                  {savedDrafts.length}
                </span>
              )}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => signIn()} className="gap-2">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Sign in to save drafts
            </Button>
          )
        }
      />

      {/* Where you are */}
      <nav aria-label="Progress" className="print:hidden">
        <p className="text-sm font-semibold text-foreground">
          Step {step} of 3: {stepLabel}
        </p>
        <ol className="mt-2 flex gap-2" aria-hidden="true">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i + 1 <= step ? "bg-forest-800 dark:bg-gold-500" : "bg-border"
              }`}
            />
          ))}
        </ol>
      </nav>

      {/* ============ STEP 1: CHOOSE ============ */}
      {step === 1 && (
        <div className="grid gap-4 sm:grid-cols-2 print:hidden">
          {DRAFT_TEMPLATES.map((tmpl) => {
            const Icon = getTemplateIcon(tmpl.id);
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tmpl)}
                className="group flex flex-col rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-px hover:border-gold-500/60 hover:shadow-hover-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 motion-reduce:transition-colors motion-reduce:hover:translate-y-0 sm:p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-100 text-forest-800 transition-colors group-hover:bg-forest-800 group-hover:text-gold-300 dark:bg-forest-800 dark:text-gold-400 dark:group-hover:bg-gold-500 dark:group-hover:text-forest-950">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="mt-4 block font-display text-xl font-semibold text-foreground">{tmpl.title}</span>
                <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{tmpl.description}</span>
                <span className="mt-4 block border-t border-border pt-4 text-sm text-muted-foreground">
                  <span className="block font-medium text-foreground">
                    About {tmpl.estMinutes} minutes, {tmpl.fields.length} questions
                  </span>
                  <span className="mt-0.5 block">{tmpl.badge}. Based on {tmpl.statutoryBasis}.</span>
                </span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-800 dark:text-gold-400">
                  Start this draft
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ============ STEP 2: QUESTIONS ============ */}
      {step === 2 && (
        <div className="space-y-6 print:hidden">
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <h2 className="font-display text-xl font-semibold text-foreground">{selectedTemplate.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">Based on {selectedTemplate.statutoryBasis}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleFillSample} className="gap-1.5">
                <Sparkles className="h-4 w-4 text-gold-600" aria-hidden="true" />
                Fill with an example
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                Change document
              </Button>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              goNext();
            }}
            noValidate
            className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-7"
          >
            {(() => {
              const meta = GROUP_META[currentGroup];
              const Icon = meta.icon;
              return (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Part {groupIndex + 1} of {groups.length}
                  </p>
                  <h2 className="mt-1 flex items-center gap-2.5 font-display text-2xl font-semibold text-foreground">
                    <Icon className="h-5 w-5 text-forest-700 dark:text-gold-400" aria-hidden="true" />
                    {meta.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{meta.hint}</p>
                </div>
              );
            })()}

            <div className="grid gap-5 sm:grid-cols-2">
              {selectedTemplate.fields
                .filter((f) => f.section === currentGroup)
                .map((field) => (
                  <FieldInput
                    key={field.id}
                    field={field}
                    value={formData[field.id]}
                    invalid={missing.includes(field.id)}
                    onChange={(v) => handleInputChange(field.id, v)}
                  />
                ))}
            </div>

            {isLastGroup && (
              <div className="space-y-1.5 border-t border-border pt-5">
                <label htmlFor="custom-instructions" className="text-sm font-semibold text-foreground">
                  Special clauses (optional)
                </label>
                <Textarea
                  id="custom-instructions"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="For example: the tenant gets one covered parking slot, or no pets are allowed."
                  rows={3}
                  className="resize-none bg-background text-base sm:text-sm"
                />
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-5">
              <Button type="button" variant="ghost" onClick={goBack} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {groupIndex === 0 ? "Change document" : "Back"}
              </Button>
              <Button type="submit" size="lg" disabled={isGenerating} className="gap-2 font-semibold">
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    Writing your draft…
                  </>
                ) : isLastGroup ? (
                  <>
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Create my draft
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ============ STEP 3: REVIEW ============ */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="space-y-4 print:hidden">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  {draftTitle || selectedTemplate.title}
                </h2>
                {savedDraftId && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    <Check className="h-4 w-4" aria-hidden="true" /> Saved to your account
                  </p>
                )}
              </div>
              <div role="group" aria-label="View" className="flex items-center gap-1 rounded-xl border border-border bg-muted/60 p-1 text-sm">
                {([false, true] as const).map((edit) => (
                  <button
                    key={String(edit)}
                    type="button"
                    aria-pressed={isEditMode === edit}
                    onClick={() => setIsEditMode(edit)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                      isEditMode === edit
                        ? "border border-border/70 bg-card text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {edit ? <Edit3 className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    {edit ? "Edit text" : "Preview"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" aria-hidden="true" />
                Download
              </Button>
              <Button variant="outline" onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" aria-hidden="true" />
                Print or save as PDF
              </Button>
              <Button variant="outline" onClick={handleCopy} className="gap-2">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    Copy text
                  </>
                )}
              </Button>
              {session && (
                <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4 text-gold-600" aria-hidden="true" />
                  {isSaving ? "Saving…" : "Save draft"}
                </Button>
              )}
            </div>

            {session && (
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-muted/40 p-3 text-sm">
                <FolderOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <label htmlFor="draft-matter" className="font-medium text-foreground">
                  Keep this in a matter
                </label>
                <select
                  id="draft-matter"
                  value={draftMatterId}
                  onChange={(e) => handleChangeDraftMatter(e.target.value)}
                  className="h-9 max-w-[16rem] rounded-lg border border-border bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                >
                  <option value="">Not in a matter</option>
                  {matters.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
                {draftMatterId && (
                  <Link href={`/matters/${draftMatterId}`} className="font-semibold text-forest-700 hover:underline dark:text-gold-400">
                    Open matter
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 print:rounded-none print:border-none print:p-0 print:shadow-none">
            {isEditMode ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1 text-sm text-muted-foreground">
                  <span>You’re editing. Your changes appear in downloads and prints.</span>
                  <span>{generatedDraft.split(/\s+/).filter(Boolean).length} words</span>
                </div>
                <Textarea
                  value={generatedDraft}
                  onChange={(e) => setGeneratedDraft(e.target.value)}
                  rows={28}
                  aria-label="Edit your document"
                  className="resize-y rounded-xl border-border bg-background p-4 font-mono text-sm leading-relaxed"
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-1 border-b-2 border-forest-800 pb-4 text-center dark:border-gold-500/80">
                  <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    <Scale className="h-3.5 w-3.5 text-gold-500" aria-hidden="true" />
                    <span>Statutory Instrument • Indian Jurisdiction</span>
                  </div>
                  <h2 className="text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
                    {selectedTemplate.title}
                  </h2>
                  <p className="font-mono text-xs text-muted-foreground">Constituted under {selectedTemplate.statutoryBasis}</p>
                </div>
                <pre className="select-text whitespace-pre-wrap font-mono text-sm font-normal leading-relaxed text-foreground">
                  {generatedDraft}
                </pre>
              </div>
            )}
          </div>

          <div className="space-y-4 print:hidden">
            <div className="flex flex-col gap-3 rounded-2xl border border-gold-500/40 bg-gold-100/50 p-5 dark:bg-gold-500/10 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-lg font-semibold text-foreground">Before you use this</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This is a draft, not legal advice. Have an advocate read it before you sign or send it, or ask the AI to check the wording.
                </p>
              </div>
              <Button
                onClick={() =>
                  openConsultation({
                    title: `Refining: ${selectedTemplate.shortTitle}`,
                    subtitle: selectedTemplate.statutoryBasis,
                    prompt: `I am finalizing this ${selectedTemplate.title} under ${selectedTemplate.statutoryBasis}. Please review the statutory covenants and advise if any clauses need tighter wording or specific legal safeguards under Indian Law:\n\n${generatedDraft.slice(0, 1200)}...`,
                    act: selectedTemplate.statutoryBasis,
                  })
                }
                className="shrink-0 gap-2"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Ask AI to check it
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  setGroupIndex(0);
                  setStep(2);
                }}
                className="gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Edit my answers
              </Button>
              <Button variant="outline" onClick={() => setStep(1)}>
                Draft another document
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============ SAVED DRAFTS ============ */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="right" className="w-full space-y-4 p-6 sm:max-w-md">
          <SheetHeader className="space-y-1 text-left">
            <SheetTitle className="font-display text-xl font-semibold">Saved drafts</SheetTitle>
            <SheetDescription className="text-sm">
              Your saved deeds, notices, and applications. Only you can see them.
            </SheetDescription>
          </SheetHeader>

          <div className="max-h-[calc(100vh-140px)] space-y-3 overflow-y-auto pr-1 pt-2">
            {loadingHistory ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <RefreshCw className="mx-auto mb-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                Loading your saved drafts…
              </div>
            ) : savedDrafts.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No saved drafts yet"
                description="Create a document, then choose Save draft to keep it here."
                className="px-4 py-10"
              />
            ) : (
              savedDrafts.map((d) => (
                <div key={d._id} className="relative rounded-2xl border border-border bg-card transition-colors hover:border-gold-500/60">
                  <button
                    type="button"
                    onClick={() => handleRestoreDraft(d)}
                    className="block w-full rounded-2xl p-4 pr-12 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                  >
                    <span className="block text-xs font-medium text-muted-foreground">
                      {DRAFT_TEMPLATES.find((t) => t.id === d.draftType)?.shortTitle ?? d.draftType}
                    </span>
                    <span className="mt-1 block font-display text-base font-semibold text-foreground">{d.title}</span>
                    <span className="mt-2 block text-sm text-muted-foreground">
                      {new Date(d.updatedAt || d.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteDraft(d._id, e)}
                    className="absolute right-3 top-3 rounded-md p-2 text-muted-foreground hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                    aria-label={`Delete ${d.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}

export default function LegalDraftPage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <div className="h-64 animate-pulse rounded-2xl border border-border bg-card/60 motion-reduce:animate-none" aria-label="Loading" />
        </PageShell>
      }
    >
      <LegalDraftPageContent />
    </Suspense>
  );
}
