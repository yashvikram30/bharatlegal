"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  FileCheck,
  Scale,
  Sparkles,
  Copy,
  Check,
  Download,
  Printer,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Save,
  RefreshCw,
  History,
  Trash2,
  ShieldCheck,
  Building,
  CreditCard,
  ShoppingBag,
  Send,
  HelpCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import {
  DRAFT_TEMPLATES,
  DocumentTemplate,
  TemplateField,
} from "@/lib/drafting/templates";
import { useQuickConsultation } from "@/context/QuickConsultationContext";

export default function LegalDraftPage() {
  const { data: session } = useSession();
  const { openConsultation } = useQuickConsultation();

  // Wizard state: 1: Select Template | 2: Questionnaire Form | 3: Live Document Studio
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(
    DRAFT_TEMPLATES[0]
  );
  const [formData, setFormData] = useState<Record<string, any>>(
    DRAFT_TEMPLATES[0].sampleData
  );
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
    setFormData(tmpl.sampleData);
    setStep(2);
  };

  const handleInputChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFillSample = () => {
    setFormData(selectedTemplate.sampleData);
    toast.success("Loaded verified sample legal data");
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
    }
  }, [session]);

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
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to generate draft");
      }

      setGeneratedDraft(data.draft.generatedContent);
      setDraftTitle(data.draft.title);
      if (data.draft.id) {
        setSavedDraftId(data.draft.id);
      }
      setStep(3);
      toast.success(
        data.draft.source === "groq-llm"
          ? "Legal draft tailored by AI counsel"
          : "Statutory draft generated via verified Indian legal engine"
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to generate draft");
    } finally {
      setIsGenerating(false);
    }
  };

  // Save changes to existing draft
  const handleSaveDraft = async () => {
    if (!session) {
      toast.error("Please sign in to save drafts to your permanent vault");
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
          toast.success("Saved updates to your draft");
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
          }),
        });
        const data = await res.json();
        if (data.success && data.draft?.id) {
          setSavedDraftId(data.draft.id);
          toast.success("Draft saved to your vault");
          fetchDraftHistory();
        }
      }
    } catch (err) {
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  // Restore draft from history
  const handleRestoreDraft = (d: any) => {
    const tmpl = DRAFT_TEMPLATES.find((t) => t.id === d.draftType) || DRAFT_TEMPLATES[0];
    setSelectedTemplate(tmpl);
    setFormData(d.formData || tmpl.sampleData);
    setGeneratedDraft(d.generatedContent);
    setDraftTitle(d.title);
    setSavedDraftId(d._id);
    setStep(3);
    setHistoryOpen(false);
    toast.success(`Restored "${d.title}"`);
  };

  // Delete draft from history
  const handleDeleteDraft = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this saved draft?")) return;
    try {
      const res = await fetch(`/api/draft/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Draft removed from vault");
        setSavedDrafts((prev) => prev.filter((item) => item._id !== id));
        if (savedDraftId === id) {
          setSavedDraftId(null);
        }
      }
    } catch (err) {
      toast.error("Failed to delete draft");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    toast.success("Copied legal document to clipboard");
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

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl space-y-6">
      {/* 1. Header & Vault Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="space-y-1 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 border border-forest-500/20">
            <Scale className="w-3.5 h-3.5 text-gold-500" />
            <span>Statutory Legal Document Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
            Legal Drafter Studio
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Generate legally enforceable lease deeds, Section 138 notices, consumer complaints, and RTI petitions grounded in Indian statutory law.
          </p>
        </div>

        {/* Vault / History Button */}
        <div className="flex items-center gap-2">
          {session ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchDraftHistory();
                setHistoryOpen(true);
              }}
              className="text-xs flex items-center gap-1.5 border-border bg-card hover:border-forest-500/50"
            >
              <History className="w-3.5 h-3.5 text-gold-500" />
              <span>My Draft Vault</span>
              {savedDrafts.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-forest-800 text-white dark:bg-gold-500 dark:text-forest-950 font-mono text-[10px] font-bold">
                  {savedDrafts.length}
                </span>
              )}
            </Button>
          ) : (
            <span className="text-[11px] text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
              Sign in to auto-save drafts
            </span>
          )}
        </div>
      </div>

      {/* 2. Step Progress Bar */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-muted/40 border border-border/60 text-xs print:hidden">
        <button
          onClick={() => setStep(1)}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            step === 1
              ? "bg-card text-foreground font-bold shadow-xs border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 text-[10px] font-mono flex items-center justify-center font-bold">
            1
          </span>
          <span>Select Template</span>
        </button>

        <button
          onClick={() => setStep(2)}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            step === 2
              ? "bg-card text-foreground font-bold shadow-xs border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 text-[10px] font-mono flex items-center justify-center font-bold">
            2
          </span>
          <span>Questionnaire</span>
        </button>

        <button
          onClick={() => generatedDraft && setStep(3)}
          disabled={!generatedDraft}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
            step === 3
              ? "bg-card text-foreground font-bold shadow-xs border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 text-[10px] font-mono flex items-center justify-center font-bold">
            3
          </span>
          <span>Document Studio</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* STEP 1: SELECT TEMPLATE */}
      {/* =================================================================== */}
      {step === 1 && (
        <div className="space-y-4 print:hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground font-heading">
              Choose a Legal Document to Draft
            </h2>
            <span className="text-xs text-muted-foreground">
              4 Indian statutory templates available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DRAFT_TEMPLATES.map((tmpl) => {
              const Icon = getTemplateIcon(tmpl.id);
              const isCurrent = selectedTemplate.id === tmpl.id;

              return (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 bg-card relative group hover:shadow-md ${
                    isCurrent
                      ? "border-forest-600 dark:border-gold-500/80 ring-1 ring-forest-500/30 dark:ring-gold-500/30"
                      : "border-border hover:border-forest-500/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest-100 dark:bg-forest-900/60 border border-forest-500/20 flex items-center justify-center text-forest-800 dark:text-gold-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-medium bg-forest-50 dark:bg-forest-900/30 text-forest-700 dark:text-gold-400 border border-forest-500/20"
                    >
                      {tmpl.badge}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground font-heading group-hover:text-forest-800 dark:group-hover:text-gold-400 transition-colors">
                      {tmpl.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-mono">{tmpl.statutoryBasis}</span>
                    <span className="font-semibold text-forest-700 dark:text-gold-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Start Draft</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* STEP 2: QUESTIONNAIRE FORM */}
      {/* =================================================================== */}
      {step === 2 && (
        <div className="space-y-6 print:hidden">
          {/* Template Header & Sample Data Loader */}
          <div className="p-4 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-gold-400 border border-forest-500/20">
                  {selectedTemplate.category}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {selectedTemplate.statutoryBasis}
                </span>
              </div>
              <h2 className="font-bold text-lg text-foreground font-heading">
                {selectedTemplate.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFillSample}
                className="text-xs flex items-center gap-1.5 border-border hover:border-gold-500/50"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                <span>Fill Sample Data</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="text-xs text-muted-foreground"
              >
                Change Template
              </Button>
            </div>
          </div>

          {/* Dynamic Form Sections */}
          <div className="space-y-6 bg-card p-5 sm:p-6 rounded-2xl border border-border">
            {/* Section 1: Parties */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <ShieldCheck className="w-4 h-4 text-forest-700 dark:text-gold-400" />
                <h3 className="font-bold text-sm text-foreground uppercase tracking-wide">
                  1. Parties & Identification
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedTemplate.fields
                  .filter((f) => f.section === "parties")
                  .map((field) => (
                    <div
                      key={field.id}
                      className={field.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}
                    >
                      <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </span>
                      </label>
                      {field.type === "textarea" ? (
                        <Textarea
                          value={formData[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          rows={2}
                          className="text-xs bg-background border-border resize-none"
                        />
                      ) : (
                        <Input
                          value={formData[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          className="text-xs bg-background border-border h-9"
                        />
                      )}
                      {field.helperText && (
                        <p className="text-[11px] text-muted-foreground">{field.helperText}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Section 2: Details & Particulars */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <FileText className="w-4 h-4 text-forest-700 dark:text-gold-400" />
                <h3 className="font-bold text-sm text-foreground uppercase tracking-wide">
                  2. Transaction Particulars & Subject Matter
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedTemplate.fields
                  .filter((f) => f.section === "details")
                  .map((field) => (
                    <div
                      key={field.id}
                      className={field.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}
                    >
                      <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </span>
                      </label>
                      {field.type === "textarea" ? (
                        <Textarea
                          value={formData[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          rows={2}
                          className="text-xs bg-background border-border resize-none"
                        />
                      ) : field.type === "select" ? (
                        <select
                          value={formData[field.id] || field.defaultValue}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500"
                        >
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          type={field.type}
                          value={formData[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          className="text-xs bg-background border-border h-9"
                        />
                      )}
                      {field.helperText && (
                        <p className="text-[11px] text-muted-foreground">{field.helperText}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Section 3: Financials */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <CreditCard className="w-4 h-4 text-forest-700 dark:text-gold-400" />
                <h3 className="font-bold text-sm text-foreground uppercase tracking-wide">
                  3. Consideration & Financial Terms
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedTemplate.fields
                  .filter((f) => f.section === "financials")
                  .map((field) => (
                    <div
                      key={field.id}
                      className={field.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}
                    >
                      <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </span>
                      </label>
                      {field.type === "select" ? (
                        <select
                          value={formData[field.id] || field.defaultValue}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500"
                        >
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          type={field.type}
                          value={formData[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          className="text-xs bg-background border-border h-9"
                        />
                      )}
                      {field.helperText && (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                          {field.helperText}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Section 4: Terms & Conditions */}
            {selectedTemplate.fields.some((f) => f.section === "terms") && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <Scale className="w-4 h-4 text-forest-700 dark:text-gold-400" />
                  <h3 className="font-bold text-sm text-foreground uppercase tracking-wide">
                    4. Statutory Terms, Facts & Relief
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedTemplate.fields
                    .filter((f) => f.section === "terms")
                    .map((field) => (
                      <div
                        key={field.id}
                        className={field.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}
                      >
                        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                          <span>
                            {field.label} {field.required && <span className="text-rose-500">*</span>}
                          </span>
                        </label>
                        {field.type === "textarea" ? (
                          <Textarea
                            value={formData[field.id] || ""}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            rows={3}
                            className="text-xs bg-background border-border resize-none"
                          />
                        ) : field.type === "select" ? (
                          <select
                            value={formData[field.id] || field.defaultValue}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500"
                          >
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            type={field.type}
                            value={formData[field.id] || ""}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            className="text-xs bg-background border-border h-9"
                          />
                        )}
                        {field.helperText && (
                          <p className="text-[11px] text-muted-foreground">{field.helperText}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Optional Custom Instructions */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                <span>Special Clauses or Custom Directives (Optional)</span>
              </label>
              <Textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Include clause stating tenant has 1 covered four-wheeler parking slot; or include specific clause regarding pet policy..."
                rows={2}
                className="text-xs bg-background border-border resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="text-xs text-muted-foreground"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back to Templates
              </Button>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-forest-800 text-white dark:bg-gold-500 dark:text-forest-950 font-bold hover:opacity-90 text-xs px-5 h-9"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                    <span>Drafting Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                    <span>Generate Final Legal Draft</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* STEP 3: LIVE DOCUMENT STUDIO */}
      {/* =================================================================== */}
      {step === 3 && (
        <div className="space-y-4">
          {/* Studio Action Toolbar */}
          <div className="p-3.5 rounded-2xl bg-card border border-border flex flex-wrap items-center justify-between gap-2.5 print:hidden">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono text-forest-700 dark:text-gold-400 border-forest-500/30"
                >
                  {selectedTemplate.badge}
                </Badge>
                {savedDraftId && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Saved to Vault
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-foreground font-heading">
                {draftTitle || selectedTemplate.title}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {/* Edit Mode Switch */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
                className={`text-xs h-8 px-2.5 border-border ${
                  isEditMode ? "bg-forest-100 dark:bg-forest-800 text-foreground font-bold" : ""
                }`}
              >
                <Edit3 className="w-3 h-3 mr-1.5" />
                <span>{isEditMode ? "Preview Mode" : "Direct Edit"}</span>
              </Button>

              {/* Copy */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="text-xs h-8 px-2.5 border-border"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1.5 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </Button>

              {/* Download */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="text-xs h-8 px-2.5 border-border"
              >
                <Download className="w-3 h-3 mr-1.5" />
                <span>Download .txt</span>
              </Button>

              {/* Print / PDF */}
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="text-xs h-8 px-2.5 border-border"
              >
                <Printer className="w-3 h-3 mr-1.5" />
                <span>Print / Save PDF</span>
              </Button>

              {/* Save Draft */}
              {session && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="text-xs h-8 px-2.5 border-border bg-muted/40 hover:bg-muted"
                >
                  <Save className="w-3 h-3 mr-1.5 text-gold-500" />
                  <span>{isSaving ? "Saving..." : "Save Draft"}</span>
                </Button>
              )}

              {/* Ask AI to Refine Drawer Trigger */}
              <Button
                size="sm"
                onClick={() =>
                  openConsultation({
                    title: `Refining: ${selectedTemplate.shortTitle}`,
                    subtitle: selectedTemplate.statutoryBasis,
                    prompt: `I am finalizing this ${selectedTemplate.title} under ${selectedTemplate.statutoryBasis}. Please review the statutory covenants and advise if any clauses need tighter wording or specific legal safeguards under Indian Law:\n\n${generatedDraft.slice(0, 1200)}...`,
                    act: selectedTemplate.statutoryBasis,
                  })
                }
                className="bg-forest-800 text-white dark:bg-gold-500 dark:text-forest-950 font-bold text-xs h-8 px-3"
              >
                <Sparkles className="w-3 h-3 mr-1.5" />
                <span>Ask AI to Refine</span>
              </Button>
            </div>
          </div>

          {/* Document Content Viewport */}
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-10 shadow-xs print:p-0 print:border-none print:shadow-none">
            {isEditMode ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-1">
                  <span>Direct Editing Active • Changes reflect immediately in export and print</span>
                  <span>{generatedDraft.split(/\s+/).filter(Boolean).length} words</span>
                </div>
                <Textarea
                  value={generatedDraft}
                  onChange={(e) => setGeneratedDraft(e.target.value)}
                  rows={28}
                  className="font-mono text-xs leading-relaxed bg-background border-border p-4 rounded-xl resize-y"
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Visual Letterhead Strip */}
                <div className="border-b-2 border-forest-800 dark:border-gold-500/80 pb-4 text-center space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                    <Scale className="w-3.5 h-3.5 text-gold-500" />
                    <span>Statutory Instrument • Indian Jurisdiction</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground uppercase tracking-tight">
                    {selectedTemplate.title}
                  </h1>
                  <p className="text-xs text-muted-foreground font-mono">
                    Constituted under {selectedTemplate.statutoryBasis}
                  </p>
                </div>

                {/* Preformatted Legal Instrument Body */}
                <pre className="font-mono text-xs sm:text-[13px] text-foreground whitespace-pre-wrap leading-relaxed select-text font-normal">
                  {generatedDraft}
                </pre>
              </div>
            )}
          </div>

          {/* Bottom Back Navigation */}
          <div className="flex items-center justify-between pt-2 print:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(2)}
              className="text-xs text-muted-foreground"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Edit Questionnaire Answers</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(1)}
              className="text-xs"
            >
              <span>Draft Another Document</span>
            </Button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SAVED DRAFTS VAULT SHEET */}
      {/* =================================================================== */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-6 space-y-4">
          <SheetHeader className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-gold-500" />
              <SheetTitle className="text-lg font-bold font-heading">
                My Legal Draft Vault
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted-foreground">
              Your saved deeds, statutory notices, and applications stored privately in MongoDB.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-3 pt-2 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
            {loadingHistory ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
                <span>Loading your saved drafts...</span>
              </div>
            ) : savedDrafts.length === 0 ? (
              <div className="py-12 text-center space-y-2 border border-dashed rounded-xl p-4">
                <FileText className="w-6 h-6 text-muted-foreground/40 mx-auto" />
                <p className="text-xs font-semibold text-foreground">No saved drafts yet</p>
                <p className="text-[11px] text-muted-foreground">
                  Draft a document in the studio and click "Save Draft" to persist it here.
                </p>
              </div>
            ) : (
              savedDrafts.map((d) => (
                <div
                  key={d._id}
                  onClick={() => handleRestoreDraft(d)}
                  className="p-3.5 rounded-xl border border-border bg-card hover:border-forest-500/50 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {d.draftType}
                    </span>
                    <button
                      onClick={(e) => handleDeleteDraft(d._id, e)}
                      className="text-muted-foreground hover:text-rose-500 p-1"
                      title="Delete draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="font-bold text-xs text-foreground font-heading group-hover:text-forest-800 dark:group-hover:text-gold-400">
                    {d.title}
                  </h4>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                    <span>
                      {new Date(d.updatedAt || d.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="font-semibold text-forest-700 dark:text-gold-400 flex items-center gap-1">
                      <span>Open in Studio</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
