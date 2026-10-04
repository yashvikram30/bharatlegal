"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn } from "next-auth/react";
import {
  FileText,
  Upload,
  X,
  Copy,
  Download,
  Check,
  ShieldCheck,
  Sparkles,
  Scale,
  RefreshCw,
  Briefcase,
  Building,
  ShoppingBag,
  History,
  Trash2,
  Clock,
  Calendar,
  LogIn,
  Search,
  ArrowRight,
  FolderOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, PageShell } from "@/components/page";
import { useQuickConsultation } from "@/context/QuickConsultationContext";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

export interface RiskyClause {
  clauseTitle: string;
  clauseText: string;
  riskLevel: "critical" | "high" | "medium" | "low";
  explanation: string;
  recommendation: string;
  statutoryReference?: string;
  actSlug?: string;
  section?: string;
}

export interface StatutoryReference {
  act: string;
  section: string;
  title: string;
  relevance: string;
  actSlug?: string;
}

export interface StructuredAnalysis {
  documentCategory: string;
  parties: string[];
  riskScore: number;
  executiveSummary: string;
  keyObligations: string[];
  riskyClauses: RiskyClause[];
  statutoryReferences: StatutoryReference[];
  actionChecklist: string[];
  simplifiedText: string;
}

export interface SavedDocumentSummary {
  id: string;
  fileName: string;
  fileType: "PDF" | "DOCX" | "TXT" | "OTHER";
  fileSize: number;
  documentCategory: string;
  parties: string[];
  riskScore: number;
  executiveSummary: string;
  riskyClausesCount: number;
  statutoryReferencesCount: number;
  createdAt: string;
  updatedAt: string;
}

type MatterOption = { id: string; title: string; status: string };

const sampleRentAgreement = `RESIDENTIAL LEASE AGREEMENT
This Agreement is entered into on 1st day of January 2025 between Mr. Rajesh Sharma (Lessor/Landlord) and Ms. Ananya Sen (Lessee/Tenant).
1. PREMISES & TERM: The Landlord leases Flat No. 402, Greenview Heights, Bengaluru for a term of 11 months commencing 01/01/2025.
2. RENT & DEPOSIT: Monthly rent shall be ₹28,000 payable on or before the 5th of every month. The Tenant has deposited an interest-free security deposit of ₹1,50,000.
3. LOCK-IN PERIOD & FORFEITURE: Either party may terminate with 1 month notice. However, if Tenant vacates within the first 6 months lock-in period, the entire security deposit of ₹1,50,000 shall be forfeited unconditionally by the Landlord.
4. UNRESTRICTED LANDLORD ACCESS: The Landlord reserves the unrestricted right to enter and inspect the premises at any time of day or night without prior notice.
5. MAINTENANCE & REPAIRS: All structural repairs, plumbing leakage, seepage rectification, and wiring exceeding ₹500 shall be borne solely and exclusively by the Tenant.
6. DISPUTE RESOLUTION: All disputes shall be subject to exclusive jurisdiction of Bengaluru courts.`;

const sampleEmploymentAgreement = `EMPLOYMENT CONTRACT & NON-DISCLOSURE
This Agreement is made by and between Apex Global Solutions Private Limited ("Company") and Devendra Patel ("Employee").
1. APPOINTMENT & DUTIES: The Company appoints Employee as Senior Software Architect with effect from 15th January 2025.
2. PROBATION & NOTICE: The Employee shall serve 6 months probation with 15 days notice. Post confirmation, notice period is 3 months written notice or payment of gross salary in lieu thereof.
3. 2-YEAR POST-EXIT NON-COMPETE RESTRICTION: The Employee expressly covenants that for a period of 24 months post-termination for any reason, they shall not directly or indirectly engage in, consult for, or establish any business or accept employment with any competing software entity anywhere in India.
4. LIQUIDATED DAMAGES FOR EARLY EXIT: In the event of early resignation without serving full notice, Employee shall pay liquidated damages equal to 6 months gross CTC to the Company.
5. INTELLECTUAL PROPERTY: All works, inventions, designs, and patents authored during employment vest exclusively in the Company.`;

const sampleConsumerTerms = `E-COMMERCE MERCHANT SERVICES AGREEMENT
1. ACCOUNT OPENING & CHARGES: Merchant agrees to list consumer products on Platform subject to monthly marketplace fee of ₹4,500.
2. CANCELLATION & PENALTY: Platform reserves the unilateral right to cancel any buyer order or suspend merchant payouts at sole discretion. Merchant shall pay 25% order value as non-refundable cancellation fee on any customer return.
3. UNILATERAL INDEMNIFICATION: Merchant shall defend, indemnify, and hold harmless Platform against any and all customer grievances, defective goods claims, and legal notices without limitation.
4. FORCED ARBITRATION: All disputes shall be settled by private arbitration in Singapore under SIAC rules. The consumer's right to approach District Consumer Commissions under Consumer Protection Act is hereby waived.`;

const SAMPLES = [
  {
    text: sampleRentAgreement,
    name: "Residential_Lease_Agreement.txt",
    icon: Building,
    title: "Residential lease",
    tag: "Lock-in forfeiture",
    tone: "text-rose-700 dark:text-rose-400",
    description: "11-month rent, 6-month lock-in penalty, and surprise visits",
  },
  {
    text: sampleEmploymentAgreement,
    name: "Employment_Non_Compete_Agreement.txt",
    icon: Briefcase,
    title: "Employment contract",
    tag: "Void non-compete",
    tone: "text-rose-700 dark:text-rose-400",
    description: "A 2-year post-exit restriction and a 6-month CTC penalty",
  },
  {
    text: sampleConsumerTerms,
    name: "E-Commerce_Merchant_Agreement.txt",
    icon: ShoppingBag,
    title: "E-commerce vendor terms",
    tag: "Forced arbitration",
    tone: "text-amber-700 dark:text-amber-400",
    description: "One-sided cancellation fees and a SIAC arbitration clause",
  },
] as const;

const riskPill = (level: string) =>
  `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize`;

function SimplifyPageContent() {
  const { openConsultation } = useQuickConsultation();
  const searchParams = useSearchParams();
  const matterParam = searchParams.get("matterId") || "";
  const docParam = searchParams.get("doc");
  const openedDocFromUrl = useRef(false);
  const { data: session, status: authStatus } = useSession();

  const [file, setFile] = useState<File | null>(null);
  const [originalContent, setOriginalContent] = useState<string>("");
  const [analysis, setAnalysis] = useState<StructuredAnalysis | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>("all");
  const [copiedSummary, setCopiedSummary] = useState(false);

  // History state
  const [history, setHistory] = useState<SavedDocumentSummary[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [matters, setMatters] = useState<MatterOption[]>([]);
  const [selectedMatterId, setSelectedMatterId] = useState(matterParam);
  // The matter the open audit is filed under ("" = none).
  const [docMatterId, setDocMatterId] = useState("");

  const fetchHistory = useCallback(async () => {
    if (authStatus !== "authenticated") {
      setHistory([]);
      return;
    }
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/simplify");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.documents)) {
          setHistory(data.documents);
        }
      }
    } catch (err) {
      console.error("Failed to fetch document history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [authStatus]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Open the audit named in ?doc=ID (used by links from a matter) once signed in.
  useEffect(() => {
    if (!docParam || openedDocFromUrl.current || authStatus !== "authenticated") return;
    openedDocFromUrl.current = true;
    handleLoadHistoryItem(docParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docParam, authStatus]);

  useEffect(() => {
    if (authStatus === "loading") return; // keep a matter chosen via ?matterId= while the session loads
    if (authStatus !== "authenticated") {
      setMatters([]);
      setSelectedMatterId("");
      return;
    }
    fetch("/api/matters")
      .then((res) => res.json())
      .then((data) => data.success && setMatters(data.matters || []))
      .catch(() => {});
  }, [authStatus]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile: File) => {
    const validExtensions = [".pdf", ".docx", ".doc", ".txt"];
    const fileExt = "." + selectedFile.name.split(".").pop()?.toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      toast.error("Please upload a PDF (.pdf), Word document (.docx), or plain text (.txt) file.");
      return;
    }

    if (selectedFile.size > 12 * 1024 * 1024) {
      toast.error("File exceeds 12MB size limit.");
      return;
    }

    setFile(selectedFile);
    setAnalysis(null);
    setActiveDocId(null);
    setIsExtracting(true);
    setProgress(20);

    try {
      if (selectedFile.name.endsWith(".txt") || selectedFile.type === "text/plain") {
        const text = await selectedFile.text();
        setOriginalContent(text);
        setProgress(100);
        toast.success("Document loaded. Choose “Check this document” when you’re ready.");
      } else {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch("/api/extract-pdf", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to extract text from document");
        }

        const data = await response.json();
        setOriginalContent(data.text || "");
        setProgress(100);
        toast.success(`Read ${selectedFile.name}. Choose “Check this document” when you’re ready.`);
      }
    } catch (error: any) {
      console.error("Extraction error:", error);
      toast.error(error.message || "We couldn’t read that file. Check that it’s a PDF, Word, or text file.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleLoadSample = (sampleText: string, name: string) => {
    const dummyFile = new File([sampleText], name, { type: "text/plain" });
    setFile(dummyFile);
    setOriginalContent(sampleText);
    setAnalysis(null);
    setActiveDocId(null);
    toast.success(`Loaded the example: ${name.replace(/_/g, " ").replace(".txt", "")}`);
  };

  const handleLoadHistoryItem = async (docId: string) => {
    setIsLoadingDoc(true);
    try {
      const res = await fetch(`/api/simplify/${docId}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "We couldn’t open that saved audit.");
      }
      const data = await res.json();
      if (!data.success || !data.document) {
        throw new Error("Invalid document data");
      }

      const doc = data.document;
      const mockFile = new File([doc.originalText || ""], doc.fileName, {
        type: doc.fileType === "PDF" ? "application/pdf" : "text/plain",
      });
      setFile(mockFile);
      setOriginalContent(doc.originalText || "");
      setAnalysis({
        documentCategory: doc.documentCategory,
        parties: doc.parties || [],
        riskScore: doc.riskScore,
        executiveSummary: doc.executiveSummary,
        keyObligations: doc.keyObligations || [],
        riskyClauses: doc.riskyClauses || [],
        statutoryReferences: doc.statutoryReferences || [],
        actionChecklist: doc.actionChecklist || [],
        simplifiedText: doc.simplifiedText,
      });
      setActiveDocId(doc.id);
      setDocMatterId(doc.matterId || "");
      setChecked({});
      setIsHistorySheetOpen(false);
      toast.success(`Opened "${doc.fileName}" from your saved audits`);

      setTimeout(() => {
        document.getElementById("analysis-results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      toast.error(err.message || "We couldn’t open that saved audit.");
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const handleDeleteHistoryItem = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this saved audit? This can’t be undone.")) {
      return;
    }
    setDeletingId(docId);
    try {
      const res = await fetch(`/api/simplify/${docId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete audit");
      }
      setHistory((prev) => prev.filter((item) => item.id !== docId));
      if (activeDocId === docId) {
        setActiveDocId(null);
      }
      toast.success("Audit deleted");
    } catch (err: any) {
      toast.error(err.message || "We couldn’t delete that audit. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // File the open audit under a matter, moving it out of the previous one if needed.
  const handleMoveDocToMatter = async (nextMatterId: string) => {
    if (!activeDocId) return;
    const previous = docMatterId;
    setDocMatterId(nextMatterId);
    try {
      if (previous) {
        await fetch(`/api/matters/${previous}/links`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "document", itemId: activeDocId, action: "unlink" }),
        });
      }
      if (nextMatterId) {
        const res = await fetch(`/api/matters/${nextMatterId}/links`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "document", itemId: activeDocId, action: "link" }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Couldn’t add it to the matter.");
      }
      toast.success(nextMatterId ? "Added to the matter" : "Removed from the matter");
    } catch (err: any) {
      setDocMatterId(previous);
      toast.error(err.message || "Couldn’t update the matter. Please try again.");
    }
  };

  const handleAnalyze = async () => {
    if (!originalContent.trim()) {
      toast.error("Add a document first, by uploading a file or trying an example.");
      return;
    }

    setIsAnalyzing(true);
    setProgress(15);
    setAnalysisStep("Reading the document…");

    const stepTimer1 = setTimeout(() => {
      setProgress(45);
      setAnalysisStep("Checking it against Indian law…");
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setProgress(75);
      setAnalysisStep("Flagging one-sided terms and writing recommendations…");
    }, 2800);

    try {
      const response = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: originalContent,
          fileName: file?.name || "Legal_Document.txt",
          fileSize: file?.size || originalContent.length,
          matterId: selectedMatterId || undefined,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || "Failed to analyze document");
      }

      const result = await response.json();
      setProgress(100);
      setAnalysis(result.data);
      if (result.analysisId) {
        setActiveDocId(result.analysisId);
        setDocMatterId(selectedMatterId);
      }
      setChecked({});
      toast.success("Your document check is ready.");
      if (authStatus === "authenticated") {
        fetchHistory();
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "We couldn’t check this document. Please try again.");
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  const removeFile = () => {
    setFile(null);
    setOriginalContent("");
    setAnalysis(null);
    setProgress(0);
    setActiveDocId(null);
    setDocMatterId("");
    setChecked({});
  };

  const copyToClipboard = (text: string, label = "Summary") => {
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    toast.success(`Copied ${label.toLowerCase()}`);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const downloadReport = () => {
    if (!analysis) return;

    let report = `# LEGAL CONTRACT AUDIT & SIMPLIFIED REPORT\n`;
    report += `Generated by BharatLegal AI (Contract Intelligence)\n`;
    report += `Date: ${new Date().toLocaleDateString("en-IN")}\n`;
    report += `Document Name: ${file?.name || "Uploaded Document"}\n`;
    report += `Document Classification: ${analysis.documentCategory}\n`;
    report += `Overall Citizen Risk Score: ${analysis.riskScore}/100\n`;
    report += `\n==================================================\n\n`;

    report += `## 1. EXECUTIVE SUMMARY\n${analysis.executiveSummary}\n\n`;

    if (analysis.parties && analysis.parties.length > 0) {
      report += `## 2. PARTIES IDENTIFIED\n`;
      analysis.parties.forEach((p) => (report += `- ${p}\n`));
      report += `\n`;
    }

    if (analysis.keyObligations && analysis.keyObligations.length > 0) {
      report += `## 3. KEY OBLIGATIONS & TIMELINES\n`;
      analysis.keyObligations.forEach((o, i) => (report += `${i + 1}. ${o}\n`));
      report += `\n`;
    }

    report += `## 4. RISKY CLAUSES RADAR\n`;
    analysis.riskyClauses.forEach((c, idx) => {
      report += `### [${c.riskLevel.toUpperCase()} RISK] ${c.clauseTitle}\n`;
      report += `Quote: "${c.clauseText}"\n`;
      report += `Legal Reason: ${c.explanation}\n`;
      report += `Citizen Safeguard / Recommendation: ${c.recommendation}\n`;
      if (c.statutoryReference) {
        report += `Statutory Authority: ${c.statutoryReference}\n`;
      }
      report += `\n`;
    });

    if (analysis.statutoryReferences && analysis.statutoryReferences.length > 0) {
      report += `## 5. RELEVANT STATUTES UNDER INDIAN LAW\n`;
      analysis.statutoryReferences.forEach((s) => {
        report += `- ${s.act} Section ${s.section} (${s.title}): ${s.relevance}\n`;
      });
      report += `\n`;
    }

    if (analysis.actionChecklist && analysis.actionChecklist.length > 0) {
      report += `## 6. PRE-SIGNING CITIZEN ACTION CHECKLIST\n`;
      analysis.actionChecklist.forEach((item, i) => (report += `[ ] ${item}\n`));
      report += `\n`;
    }

    report += `\n---\nDisclaimer: BharatLegal provides educational statutory intelligence and contract simplification; it does not constitute formal legal counsel.\n`;

    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${file?.name?.split(".")[0] || "Contract"}_Audit_Report.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report downloaded");
  };

  // Worst clauses first, optionally narrowed to one severity.
  const SEVERITY_ORDER = ["critical", "high", "medium", "low"];
  const filteredClauses = (analysis?.riskyClauses ?? [])
    .filter((c) => selectedRiskFilter === "all" || c.riskLevel.toLowerCase() === selectedRiskFilter)
    .slice()
    .sort((a, b) => SEVERITY_ORDER.indexOf(a.riskLevel.toLowerCase()) - SEVERITY_ORDER.indexOf(b.riskLevel.toLowerCase()));

  const getRiskBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "critical":
        return "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30";
      case "high":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
      case "medium":
        return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getRiskScoreDetails = (score: number) => {
    if (score >= 70) {
      return {
        label: "High risk",
        color: "text-rose-600 dark:text-rose-400",
        barColor: "bg-rose-500",
        badge: "Severe liability or one-sided clauses",
      };
    } else if (score >= 40) {
      return {
        label: "Moderate risk",
        color: "text-amber-600 dark:text-amber-400",
        barColor: "bg-amber-500",
        badge: "Review before you sign",
      };
    } else {
      return {
        label: "Low risk",
        color: "text-emerald-600 dark:text-emerald-400",
        barColor: "bg-emerald-500",
        badge: "The terms look fairly balanced",
      };
    }
  };

  const filteredHistory = history.filter((item) => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return (
      item.fileName.toLowerCase().includes(q) ||
      item.documentCategory.toLowerCase().includes(q)
    );
  });

  const risk = analysis ? getRiskScoreDetails(analysis.riskScore) : null;

  return (
    <PageShell>
      <PageHeader
        title="Understand any contract before you sign it"
        description="Upload a lease, employment contract, NDA, or court notice. You’ll get a plain-language summary and the risky clauses flagged, with the Indian law that applies."
        actions={
          authStatus === "authenticated" ? (
            <Button variant="outline" onClick={() => setIsHistorySheetOpen(true)} className="gap-2">
              <History className="h-4 w-4 text-forest-600 dark:text-gold-400" aria-hidden="true" />
              Saved audits
              <span className="rounded-full bg-forest-100 px-1.5 text-xs font-bold text-forest-800 dark:bg-forest-800 dark:text-gold-400">
                {history.length}
              </span>
            </Button>
          ) : (
            <Button variant="outline" onClick={() => signIn()} className="gap-2">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Sign in to save audits
            </Button>
          )
        }
      />

      {/* ============ STEP 1: ADD A DOCUMENT ============ */}
      {!analysis && (
        <>
          <section className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-7" aria-labelledby="upload-heading">
            <div>
              <h2 id="upload-heading" className="font-display text-xl font-semibold text-foreground">
                Upload your document
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">PDF, Word (.docx), or text files up to 12MB.</p>
            </div>

            {!file ? (
              <>
                <label
                  className={`block cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all focus-within:ring-2 focus-within:ring-gold-500 focus-within:ring-offset-2 focus-within:ring-offset-background sm:p-10 ${
                    isDragging
                      ? "border-forest-500 bg-forest-50 dark:bg-forest-900/30"
                      : "border-border hover:border-forest-500/70 hover:bg-muted/20"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input type="file" className="sr-only" accept=".pdf,.docx,.doc,.txt" onChange={handleFileChange} />
                  <span className="flex flex-col items-center justify-center space-y-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-100 text-forest-800 dark:bg-forest-800 dark:text-gold-400">
                      <Upload className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="block text-base font-semibold text-foreground">
                      Drop your file here, or{" "}
                      <span className="font-bold text-forest-700 underline underline-offset-2 dark:text-gold-400">choose a file</span>
                    </span>
                  </span>
                </label>
                <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-600 dark:text-gold-400" aria-hidden="true" />
                  Your document is processed to create the analysis. It’s saved to your history only if you’re signed in.
                </p>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 rounded-lg bg-forest-100 p-2 text-forest-800 dark:bg-forest-800 dark:text-gold-400">
                      <FileText className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB · {originalContent ? "Ready to check" : "Reading…"}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={removeFile} aria-label="Remove file">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {authStatus === "authenticated" && (
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <label htmlFor="matter-select" className="block text-sm font-semibold text-foreground">
                      Save this review to a matter (optional)
                    </label>
                    <div className="mt-2 flex items-center gap-3">
                      <select
                        id="matter-select"
                        value={selectedMatterId}
                        onChange={(event) => setSelectedMatterId(event.target.value)}
                        className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500/40 sm:text-sm"
                      >
                        <option value="">Document history only</option>
                        {matters.map((matter) => (
                          <option key={matter.id} value={matter.id}>
                            {matter.title} · {matter.status}
                          </option>
                        ))}
                      </select>
                      <Link href="/matters" className="text-sm font-semibold text-forest-700 hover:underline dark:text-gold-400">
                        Manage
                      </Link>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      The analysis stays in your private history and also appears in the selected matter.
                    </p>
                  </div>
                )}

                <Button
                  size="lg"
                  className="h-12 w-full gap-2 text-base font-semibold"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || isExtracting || !originalContent}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                      Checking your document…
                    </>
                  ) : isExtracting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                      Reading your document…
                    </>
                  ) : (
                    <>
                      <Scale className="h-4 w-4" aria-hidden="true" />
                      Check this document for risks
                    </>
                  )}
                </Button>
              </div>
            )}

            {(isAnalyzing || isExtracting) && (
              <div className="space-y-2" role="status" aria-live="polite">
                <Progress value={progress} className="h-2 bg-muted" />
                <p className="text-center text-sm text-muted-foreground">{analysisStep || "Reading your document…"}</p>
              </div>
            )}
          </section>

          {!file && (
            <section aria-labelledby="examples-heading" className="space-y-3">
              <h2 id="examples-heading" className="font-display text-xl font-semibold text-foreground">
                No document handy? Try an example
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {SAMPLES.map((sample) => {
                  const Icon = sample.icon;
                  return (
                    <button
                      key={sample.name}
                      type="button"
                      onClick={() => handleLoadSample(sample.text, sample.name)}
                      className="group flex flex-col rounded-2xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-px hover:border-gold-500/60 hover:shadow-hover-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 motion-reduce:transition-colors motion-reduce:hover:translate-y-0"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-forest-100 text-forest-800 dark:bg-forest-800 dark:text-gold-400">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="mt-3 block font-display text-lg font-semibold text-foreground">{sample.title}</span>
                      <span className={`mt-0.5 block text-sm font-medium ${sample.tone}`}>{sample.tag}</span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">{sample.description}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

      {/* ============ STEP 2: RESULTS ============ */}
      <AnimatePresence>
        {analysis && risk && (
          <motion.div
            id="analysis-results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {activeDocId && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <Clock className="h-4 w-4 text-gold-600" aria-hidden="true" />
                  You’re viewing a saved audit.
                </span>
                <Button variant="outline" size="sm" onClick={() => setIsHistorySheetOpen(true)} className="gap-1.5">
                  <History className="h-4 w-4" aria-hidden="true" />
                  Saved audits
                </Button>
              </div>
            )}

            {/* The verdict: everything a busy person needs, first */}
            <section className="space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8" aria-labelledby="verdict-heading">
              <p className="text-sm text-muted-foreground">
                {analysis.documentCategory} · {file?.name || "Your document"}
              </p>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="shrink-0">
                  <p className={`font-display text-5xl font-semibold leading-none ${risk.color}`}>
                    {analysis.riskScore}
                    <span className="text-xl font-normal text-muted-foreground">/100</span>
                  </p>
                  <div className="mt-3 h-2 w-40 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                    <div className={`h-full rounded-full ${risk.barColor}`} style={{ width: `${Math.min(100, analysis.riskScore)}%` }} />
                  </div>
                </div>
                <div>
                  <h2 id="verdict-heading" className={`font-display text-2xl font-semibold ${risk.color}`}>
                    {risk.label}
                  </h2>
                  <p className="mt-1 text-base text-foreground/80">{risk.badge}</p>
                  {analysis.riskyClauses?.length > 0 && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {analysis.riskyClauses.length} clause{analysis.riskyClauses.length === 1 ? "" : "s"} flagged below.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-forest-100/70 p-4 dark:bg-forest-800/50 sm:p-5">
                <p className="text-sm font-semibold text-foreground">In plain English</p>
                <p className="mt-1.5 text-base leading-relaxed text-foreground">{analysis.executiveSummary}</p>
              </div>

              {analysis.parties && analysis.parties.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Between:</span> {analysis.parties.join(", ")}
                </p>
              )}

              {authStatus === "authenticated" && activeDocId && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/40 p-3 text-sm">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <label htmlFor="audit-matter" className="font-medium text-foreground">
                    Keep this in a matter
                  </label>
                  <select
                    id="audit-matter"
                    value={docMatterId}
                    onChange={(e) => handleMoveDocToMatter(e.target.value)}
                    className="h-9 max-w-[16rem] rounded-lg border border-border bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                  >
                    <option value="">Not in a matter</option>
                    {matters.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                  {docMatterId && (
                    <Link href={`/matters/${docMatterId}`} className="font-semibold text-forest-700 hover:underline dark:text-gold-400">
                      Open matter
                    </Link>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 border-t border-border pt-5">
                <Button onClick={downloadReport} className="gap-2">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download report
                </Button>
                <Button variant="outline" onClick={() => copyToClipboard(analysis.executiveSummary, "Summary")} className="gap-2">
                  {copiedSummary ? <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  Copy summary
                </Button>
                <Button variant="ghost" onClick={removeFile}>
                  Check another document
                </Button>
              </div>
            </section>

            {/* The details, in the order a person would act on them */}
            <Accordion type="multiple" defaultValue={["clauses", "checklist"]} className="space-y-3">
              {/* 1. Risky clauses */}
              <AccordionItem value="clauses" className="rounded-2xl border border-border bg-card px-4 sm:px-6">
                <AccordionTrigger className="py-5 text-left hover:no-underline">
                  <span className="font-display text-xl font-semibold text-foreground">
                    Clauses to push back on{" "}
                    <span className="text-base font-normal text-muted-foreground">({analysis.riskyClauses?.length || 0})</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-6 pt-1">
                  {(analysis.riskyClauses?.length || 0) > 3 && (
                    <div role="group" aria-label="Filter by severity" className="flex flex-wrap items-center gap-1 text-sm">
                      <span className="mr-1 text-muted-foreground">Show</span>
                      {["all", "critical", "high", "medium", "low"].map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          aria-pressed={selectedRiskFilter === filter}
                          onClick={() => setSelectedRiskFilter(filter)}
                          className={`rounded-lg px-3 py-1 font-medium capitalize transition-colors ${
                            selectedRiskFilter === filter
                              ? "bg-forest-800 text-white dark:bg-gold-500 dark:text-forest-950"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredClauses.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      {analysis.riskyClauses?.length ? `No ${selectedRiskFilter}-severity clauses.` : "No risky clauses were flagged."}
                    </p>
                  ) : (
                    <Accordion type="single" collapsible defaultValue="clause-0" className="space-y-2">
                      {filteredClauses.map((clause, idx) => (
                        <AccordionItem key={idx} value={`clause-${idx}`} className="rounded-xl border border-border bg-background px-4">
                          <AccordionTrigger className="gap-3 py-4 text-left hover:no-underline">
                            <span className="flex min-w-0 flex-wrap items-center gap-2.5">
                              <span className={`${riskPill(clause.riskLevel)} ${getRiskBadgeColor(clause.riskLevel)}`}>{clause.riskLevel}</span>
                              <span className="text-base font-semibold text-foreground">{clause.clauseTitle}</span>
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pb-5 pt-0">
                            <blockquote className="rounded-lg border-l-2 border-forest-600 bg-muted/50 p-3 text-sm italic leading-relaxed text-foreground dark:border-gold-400">
                              “{clause.clauseText}”
                            </blockquote>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-1 rounded-xl border border-rose-200/70 bg-rose-50/50 p-4 dark:border-rose-900/60 dark:bg-rose-950/20">
                                <p className="text-sm font-semibold text-rose-800 dark:text-rose-400">Why it’s risky</p>
                                <p className="text-sm leading-relaxed text-foreground">{clause.explanation}</p>
                              </div>
                              <div className="space-y-1 rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">What to ask for instead</p>
                                <p className="text-sm leading-relaxed text-foreground">{clause.recommendation}</p>
                              </div>
                            </div>
                            {clause.statutoryReference && (
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">The law:</span> {clause.statutoryReference}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() =>
                                  openConsultation({
                                    title: `Contract Clause • ${clause.clauseTitle}`,
                                    subtitle: clause.statutoryReference || "Contract Law",
                                    prompt: `Under Indian law, is the following contract clause legally valid or enforceable: "${clause.clauseText}"? What specific counter-clauses or statutory grounds (e.g., unconscionability, void agreements) can I raise to negotiate it? Draft a short counter-proposal.`,
                                    act: clause.statutoryReference,
                                    section: clause.section,
                                  })
                                }
                              >
                                <Sparkles className="h-4 w-4 text-gold-600" aria-hidden="true" />
                                Ask AI for a counter-proposal
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() =>
                                  copyToClipboard(
                                    `Proposed Amendment to ${clause.clauseTitle}:\n${clause.recommendation}`,
                                    "Counter-term"
                                  )
                                }
                              >
                                <Copy className="h-4 w-4" aria-hidden="true" />
                                Copy counter-term
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* 2. Before you sign */}
              <AccordionItem value="checklist" className="rounded-2xl border border-border bg-card px-4 sm:px-6">
                <AccordionTrigger className="py-5 text-left hover:no-underline">
                  <span className="font-display text-xl font-semibold text-foreground">Before you sign</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-6 pt-1">
                  <p className="text-sm text-muted-foreground">Practical steps to protect yourself. Tick them off as you go.</p>
                  {analysis.actionChecklist && analysis.actionChecklist.length > 0 ? (
                    <ul className="space-y-2">
                      {analysis.actionChecklist.map((item, idx) => (
                        <li key={idx}>
                          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-3.5 text-sm transition-colors hover:bg-muted/40 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold-500">
                            <input
                              type="checkbox"
                              checked={!!checked[idx]}
                              onChange={(e) => setChecked((prev) => ({ ...prev, [idx]: e.target.checked }))}
                              className="mt-0.5 h-4 w-4 shrink-0 accent-forest-800"
                            />
                            <span className={`leading-relaxed ${checked[idx] ? "text-muted-foreground line-through" : "text-foreground"}`}>
                              {item}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific checklist was generated for this document.</p>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* 3. What you're agreeing to */}
              <AccordionItem value="obligations" className="rounded-2xl border border-border bg-card px-4 sm:px-6">
                <AccordionTrigger className="py-5 text-left hover:no-underline">
                  <span className="font-display text-xl font-semibold text-foreground">
                    What you’re agreeing to{" "}
                    <span className="text-base font-normal text-muted-foreground">({analysis.keyObligations?.length || 0})</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-1">
                  {analysis.keyObligations && analysis.keyObligations.length > 0 ? (
                    <ul className="space-y-2.5">
                      {analysis.keyObligations.map((obligation, idx) => (
                        <li key={idx} className="flex items-start gap-3 rounded-xl border border-border/70 bg-background p-3.5 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-700 dark:text-gold-400" aria-hidden="true" />
                          <span className="leading-relaxed text-foreground">{obligation}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No key obligations were identified.</p>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* 4. The law */}
              <AccordionItem value="law" className="rounded-2xl border border-border bg-card px-4 sm:px-6">
                <AccordionTrigger className="py-5 text-left hover:no-underline">
                  <span className="font-display text-xl font-semibold text-foreground">
                    The law behind this{" "}
                    <span className="text-base font-normal text-muted-foreground">({analysis.statutoryReferences?.length || 0})</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-6 pt-1">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    These Indian laws govern the terms in this agreement. Clauses that contradict them are often void or unenforceable in court.
                  </p>
                  {analysis.statutoryReferences && analysis.statutoryReferences.length > 0 ? (
                    <ul className="space-y-3">
                      {analysis.statutoryReferences.map((statute, idx) => (
                        <li key={idx} className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center">
                          <div className="space-y-1">
                            <p className="text-base font-semibold text-foreground">
                              {statute.act}, Section {statute.section}
                            </p>
                            <p className="text-sm font-medium text-foreground/90">{statute.title}</p>
                            <p className="text-sm leading-relaxed text-muted-foreground">{statute.relevance}</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0 gap-1.5"
                            onClick={() =>
                              openConsultation({
                                title: `${statute.act} Section ${statute.section}`,
                                subtitle: statute.title,
                                prompt: `What does ${statute.act} Section ${statute.section} mandate regarding ${statute.title}? How does this statutory rule apply to my contract?`,
                                act: statute.act,
                                section: statute.section,
                              })
                            }
                          >
                            Ask AI about this
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific laws were linked.</p>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* 5. Full text */}
              <AccordionItem value="text" className="rounded-2xl border border-border bg-card px-4 sm:px-6">
                <AccordionTrigger className="py-5 text-left hover:no-underline">
                  <span className="font-display text-xl font-semibold text-foreground">Read the full text</span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-1">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="max-h-[500px] space-y-2 overflow-y-auto rounded-xl border border-border bg-background p-4">
                      <p className="border-b border-border pb-2 text-sm font-semibold text-foreground">Simplified overview</p>
                      <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">{analysis.simplifiedText}</div>
                    </div>
                    <div className="max-h-[500px] space-y-2 overflow-y-auto rounded-xl border border-border bg-background p-4">
                      <p className="border-b border-border pb-2 text-sm font-semibold text-foreground">Original document text</p>
                      <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">{originalContent}</pre>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ SAVED AUDITS ============ */}
      <Sheet open={isHistorySheetOpen} onOpenChange={setIsHistorySheetOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-4 overflow-y-auto p-6 sm:max-w-md">
          <SheetHeader className="pb-1 text-left">
            <SheetTitle className="font-display text-xl font-semibold">Saved audits</SheetTitle>
            <SheetDescription className="text-sm">Reopen a document you’ve already checked. Only you can see these.</SheetDescription>
          </SheetHeader>

          {authStatus === "authenticated" && history.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                aria-label="Search saved audits"
                placeholder="Search by file name or type"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="h-10 pl-9 text-base sm:text-sm"
              />
            </div>
          )}

          {authStatus !== "authenticated" ? (
            <EmptyState
              icon={LogIn}
              title="Sign in to save your audits"
              description="Signed-in users can reopen past document checks from any device."
              action={<Button onClick={() => signIn()}>Sign in or register</Button>}
              className="my-auto px-4 py-10"
            />
          ) : isLoadingHistory ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center text-sm text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin text-forest-600 motion-reduce:animate-none dark:text-gold-400" aria-hidden="true" />
              Loading your saved audits…
            </div>
          ) : filteredHistory.length === 0 ? (
            <EmptyState
              icon={Clock}
              title={historySearch ? "No audits match your search" : "No saved audits yet"}
              description={historySearch ? "Try a different file name." : "Check a document and it will appear here."}
              className="px-4 py-10"
            />
          ) : (
            <div className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground">
                {filteredHistory.length} {filteredHistory.length === 1 ? "audit" : "audits"}
              </p>
              {filteredHistory.map((doc) => (
                <div
                  key={doc.id}
                  className={`relative rounded-2xl border transition-colors ${
                    activeDocId === doc.id ? "border-forest-500 bg-forest-50/70 dark:bg-forest-900/30" : "border-border bg-card hover:border-gold-500/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleLoadHistoryItem(doc.id)}
                    className="block w-full space-y-2 rounded-2xl p-4 pr-12 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                  >
                    <span className="block truncate text-base font-semibold text-foreground">{doc.fileName}</span>
                    <span className="block text-sm text-muted-foreground">{doc.documentCategory}</span>
                    {doc.executiveSummary && (
                      <span className="line-clamp-2 block text-sm leading-relaxed text-muted-foreground">{doc.executiveSummary}</span>
                    )}
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-sm">
                      <span
                        className={`${riskPill("")} ${getRiskBadgeColor(doc.riskScore >= 70 ? "critical" : doc.riskScore >= 40 ? "medium" : "low")}`}
                      >
                        Risk {doc.riskScore}/100
                      </span>
                      {doc.riskyClausesCount > 0 && (
                        <span className="font-medium text-rose-700 dark:text-rose-400">{doc.riskyClausesCount} clauses flagged</span>
                      )}
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                        {new Date(doc.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === doc.id}
                    onClick={(e) => handleDeleteHistoryItem(doc.id, e)}
                    className="absolute right-3 top-3 rounded-md p-2 text-muted-foreground hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                    aria-label={`Delete ${doc.fileName}`}
                  >
                    {deletingId === doc.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}

export default function SimplifyPage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <div className="h-64 animate-pulse rounded-2xl border border-border bg-card/60 motion-reduce:animate-none" aria-label="Loading" />
        </PageShell>
      }
    >
      <SimplifyPageContent />
    </Suspense>
  );
}
