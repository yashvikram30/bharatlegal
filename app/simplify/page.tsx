"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import {
  FileText,
  Upload,
  X,
  Copy,
  Download,
  Check,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Scale,
  RefreshCw,
  Eye,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Building,
  ShoppingBag,
  History,
  Trash2,
  Clock,
  Calendar,
  LogIn,
  ChevronRight,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useQuickConsultation } from "@/context/QuickConsultationContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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

export default function SimplifyPage() {
  const { openConsultation } = useQuickConsultation();
  const { data: session, status: authStatus } = useSession();

  const [file, setFile] = useState<File | null>(null);
  const [originalContent, setOriginalContent] = useState<string>("");
  const [analysis, setAnalysis] = useState<StructuredAnalysis | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>("all");
  const [copiedSummary, setCopiedSummary] = useState(false);

  // History state
  const [history, setHistory] = useState<SavedDocumentSummary[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  const [leftNavTab, setLeftNavTab] = useState<"samples" | "history">("samples");
  const [historySearch, setHistorySearch] = useState("");

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
        toast.success("Text document loaded. Click 'Analyze Contract' to proceed.");
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
        toast.success(`Extracted ${data.wordCount || ""} words from ${selectedFile.name}`);
      }
    } catch (error: any) {
      console.error("Extraction error:", error);
      toast.error(error.message || "Error reading file. Please check format.");
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
    toast.success(`Loaded sample: ${name.replace(/_/g, " ").replace(".txt", "")}`);
  };

  const handleLoadHistoryItem = async (docId: string) => {
    setIsLoadingDoc(true);
    try {
      const res = await fetch(`/api/simplify/${docId}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to load document audit");
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
      setActiveTab("overview");
      setIsHistorySheetOpen(false);
      toast.success(`Loaded "${doc.fileName}" from history (0 AI tokens used)`);

      setTimeout(() => {
        document.getElementById("analysis-results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      toast.error(err.message || "Failed to load audit from history");
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const handleDeleteHistoryItem = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this saved document audit?")) {
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
      toast.success("Document audit removed from history");
    } catch (err: any) {
      toast.error(err.message || "Could not delete document audit");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAnalyze = async () => {
    if (!originalContent.trim()) {
      toast.error("Please provide or upload document text first.");
      return;
    }

    setIsAnalyzing(true);
    setProgress(15);
    setAnalysisStep("Parsing document structure & contractual clauses...");

    const stepTimer1 = setTimeout(() => {
      setProgress(45);
      setAnalysisStep("Evaluating against Indian statutory law (BNS, Contract Act, Model Tenancy Act)...");
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setProgress(75);
      setAnalysisStep("Flagging one-sided terms and generating citizen recommendations...");
    }, 2800);

    try {
      const response = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: originalContent,
          fileName: file?.name || "Legal_Document.txt",
          fileSize: file?.size || originalContent.length,
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
      }
      setActiveTab("overview");
      toast.success("Document intelligence analysis complete!");
      if (authStatus === "authenticated") {
        fetchHistory();
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to complete AI analysis.");
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
  };

  const copyToClipboard = (text: string, label = "Summary") => {
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    toast.success(`Copied ${label} to clipboard`);
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
    toast.success("Downloaded detailed contract audit report!");
  };

  // Filter risky clauses by risk level
  const filteredClauses = analysis?.riskyClauses?.filter((c) => {
    if (selectedRiskFilter === "all") return true;
    return c.riskLevel.toLowerCase() === selectedRiskFilter;
  }) || [];

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
        label: "High Risk Document",
        color: "text-rose-600 dark:text-rose-400",
        barColor: "bg-rose-500",
        badge: "Severe Liability / One-Sided Clauses",
      };
    } else if (score >= 40) {
      return {
        label: "Moderate Risk Document",
        color: "text-amber-600 dark:text-amber-400",
        barColor: "bg-amber-500",
        badge: "Review Required Before Signing",
      };
    } else {
      return {
        label: "Low Risk Document",
        color: "text-emerald-600 dark:text-emerald-400",
        barColor: "bg-emerald-500",
        badge: "Relatively Balanced Terms",
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

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl space-y-8">
      {/* 1. Page Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* User History Button */}
          {authStatus === "authenticated" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistorySheetOpen(true)}
              className="h-7 px-3 text-xs gap-1.5 border-border rounded-full hover:border-forest-500 bg-background/80 shadow-xs"
            >
              <History className="w-3.5 h-3.5 text-forest-600 dark:text-gold-400" />
              <span>Saved Audits</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 text-[10px] font-mono font-bold">
                {history.length}
              </span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signIn()}
              className="h-7 px-2.5 text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign in to save audits</span>
            </Button>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground font-heading tracking-tight">
          Legal Document Simplifier
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Upload residential leases, employment contracts, commercial NDAs, or court notices. Extract plain-language summaries, flag high-risk clauses under Indian law, and verify statutory protections.
        </p>
      </div>

      {/* 2. Upload Zone & Sample Contract Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sample Loaders & User Saved Audits */}
        <div className="md:col-span-5 space-y-4">
          <Card className="border-border bg-card shadow-xs overflow-hidden">
            {/* Tab Switcher: Samples vs Saved History */}
            <div className="p-1.5 bg-muted/40 border-b border-border flex items-center gap-1">
              <button
                type="button"
                onClick={() => setLeftNavTab("samples")}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  leftNavTab === "samples"
                    ? "bg-card text-foreground shadow-xs border border-border/70"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Samples</span>
              </button>
              <button
                type="button"
                onClick={() => setLeftNavTab("history")}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  leftNavTab === "history"
                    ? "bg-card text-foreground shadow-xs border border-border/70"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Your Audits</span>
                {history.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 text-[10px] font-mono font-bold">
                    {history.length}
                  </span>
                )}
              </button>
            </div>

            {leftNavTab === "samples" ? (
              <>
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-sm font-heading">Curated Sample Contracts</CardTitle>
                  <CardDescription className="text-xs">
                    Inspect real Indian agreements with hidden liabilities:
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-1">
                  <button
                    onClick={() =>
                      handleLoadSample(sampleRentAgreement, "Residential_Lease_Agreement.txt")
                    }
                    className="w-full text-left p-3 rounded-xl border border-border bg-muted/30 hover:border-forest-500 hover:bg-forest-50 dark:hover:bg-forest-900/20 transition-all flex items-start gap-3 group"
                  >
                    <div className="p-2 rounded-lg bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 group-hover:scale-105 transition-transform shrink-0">
                      <Building className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-foreground truncate">
                          Residential Lease Deed
                        </p>
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono font-medium">
                          Lock-in Forfeiture
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        11-month rent, 6-month lock-in penalty & surprise visits
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      handleLoadSample(
                        sampleEmploymentAgreement,
                        "Employment_Non_Compete_Agreement.txt"
                      )
                    }
                    className="w-full text-left p-3 rounded-xl border border-border bg-muted/30 hover:border-forest-500 hover:bg-forest-50 dark:hover:bg-forest-900/20 transition-all flex items-start gap-3 group"
                  >
                    <div className="p-2 rounded-lg bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 group-hover:scale-105 transition-transform shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-foreground truncate">
                          Employment Contract
                        </p>
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono font-medium">
                          Void Non-Compete
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        2-year post-exit restriction & 6 months CTC penalty
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      handleLoadSample(sampleConsumerTerms, "E-Commerce_Merchant_Agreement.txt")
                    }
                    className="w-full text-left p-3 rounded-xl border border-border bg-muted/30 hover:border-forest-500 hover:bg-forest-50 dark:hover:bg-forest-900/20 transition-all flex items-start gap-3 group"
                  >
                    <div className="p-2 rounded-lg bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 group-hover:scale-105 transition-transform shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-foreground truncate">
                          E-Commerce Vendor Terms
                        </p>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-medium">
                          Forced Arbitration
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        Unilateral cancellation fees & SIAC arbitration clause
                      </p>
                    </div>
                  </button>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="pb-2 pt-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-heading">Your Saved Audits</CardTitle>
                    <CardDescription className="text-xs">
                      Past documents audited under your account
                    </CardDescription>
                  </div>
                  {history.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsHistorySheetOpen(true)}
                      className="h-6 text-[11px] gap-1 px-2 text-forest-700 dark:text-gold-400 hover:underline"
                    >
                      <span>Full Archive</span>
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 pt-1 max-h-[350px] overflow-y-auto">
                  {authStatus !== "authenticated" ? (
                    <div className="p-4 rounded-xl bg-muted/30 border border-dashed border-border text-center space-y-3">
                      <div className="w-9 h-9 rounded-full bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 mx-auto flex items-center justify-center shadow-xs">
                        <LogIn className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-foreground">Sign In to Save Documents</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Your contract evaluations will automatically save to your private account for zero-token retrieval anytime.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => signIn()}
                        className="w-full text-xs h-8 bg-forest-800 text-white hover:bg-forest-900 dark:bg-gold-500 dark:text-forest-950 font-semibold"
                      >
                        Sign In / Register
                      </Button>
                    </div>
                  ) : isLoadingHistory ? (
                    <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-forest-600 dark:text-gold-400" />
                      <span>Loading your saved document audits...</span>
                    </div>
                  ) : history.length === 0 ? (
                    <div className="p-5 rounded-xl border border-dashed border-border text-center space-y-2">
                      <Clock className="w-6 h-6 text-muted-foreground/50 mx-auto" />
                      <p className="text-xs font-semibold text-foreground">No Saved Documents Yet</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Analyze any document on the right to store its plain-language evaluation and risk score here.
                      </p>
                    </div>
                  ) : (
                    history.slice(0, 4).map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => handleLoadHistoryItem(doc.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 group ${
                          activeDocId === doc.id
                            ? "border-forest-500 bg-forest-50/70 dark:bg-forest-900/30"
                            : "border-border bg-card hover:border-forest-500/50 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div className="p-1.5 rounded-lg bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-foreground truncate">
                                {doc.fileName}
                              </p>
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-muted text-muted-foreground shrink-0">
                                {doc.fileType}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                              {doc.documentCategory}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${getRiskBadgeColor(doc.riskScore >= 70 ? "critical" : doc.riskScore >= 40 ? "medium" : "low")}`}>
                                Risk: {doc.riskScore}/100
                              </span>
                              <span className="text-[9px] text-muted-foreground">
                                {new Date(doc.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isLoadingDoc}
                            className="h-7 px-2 text-[11px] text-forest-700 dark:text-gold-400 hover:bg-forest-100/50 font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoadHistoryItem(doc.id);
                            }}
                          >
                            {isLoadingDoc && activeDocId === doc.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              "Load"
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={deletingId === doc.id}
                            onClick={(e) => handleDeleteHistoryItem(doc.id, e)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            title="Delete audit"
                          >
                            {deletingId === doc.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </>
            )}
          </Card>
        </div>

        {/* Right Column: Upload Box & Analysis Actions */}
        <div className="md:col-span-7">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading">Document Upload</CardTitle>
              <CardDescription className="text-xs">
                Accepts PDF (.pdf), Microsoft Word (.docx), or Plain Text (.txt) up to 12MB.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    isDragging
                      ? "border-forest-500 bg-forest-50 dark:bg-forest-900/30"
                      : "border-border hover:border-forest-500/70 hover:bg-muted/20"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 flex items-center justify-center shadow-xs">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        Drag and drop your contract, or{" "}
                        <label className="text-forest-700 dark:text-gold-400 hover:underline cursor-pointer font-bold">
                          browse files
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.docx,.doc,.txt"
                            onChange={handleFileChange}
                          />
                        </label>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOCX, or TXT (Max 12MB)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Info Strip */}
                  <div className="flex items-center justify-between p-3.5 bg-muted/40 border border-border rounded-xl">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="p-2 rounded-lg bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB • {originalContent ? "Text Ready" : "Reading..."}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full bg-forest-800 text-white hover:bg-forest-900 dark:bg-gold-500 dark:text-forest-950 dark:hover:bg-gold-400 font-semibold h-11 text-sm shadow-xs transition-all"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || isExtracting || !originalContent}
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Auditing Contract Provisions...
                      </span>
                    ) : isExtracting ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Extracting Document Text...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        Analyze Contract & Flag Risks
                      </span>
                    )}
                  </Button>
                </div>
              )}

              {/* Dynamic Step Progress */}
              {(isAnalyzing || isExtracting) && (
                <div className="space-y-2 pt-2">
                  <Progress value={progress} className="h-2 bg-muted" />
                  <p className="text-xs text-center text-muted-foreground animate-pulse">
                    {analysisStep || "Extracting statutory text..."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. Analysis Results Section */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            id="analysis-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="space-y-6 pt-4"
          >
            {/* Historical Audit Banner */}
            {activeDocId && (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-forest-50/80 dark:bg-forest-900/30 border border-forest-500/20 text-xs shadow-xs">
                <div className="flex items-center gap-2 text-forest-800 dark:text-gold-400 font-semibold">
                  <Clock className="w-4 h-4 text-gold-500" />
                  <span>Viewing saved contract audit from history • 0 AI tokens spent</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsHistorySheetOpen(true)}
                    className="h-7 text-xs gap-1 border-forest-500/30 bg-background/50"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Audit Archive</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  >
                    New Document
                  </Button>
                </div>
              </div>
            )}

            {/* Analysis Header Card */}
            <Card className="border-border bg-card shadow-xs overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono font-medium border-border">
                      {analysis.documentCategory}
                    </Badge>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {file?.name || "Contract"}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground font-heading">
                    Document Risk Audit & Executive Summary
                  </h2>
                </div>

                {/* Risk Score Pill & Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Aggregated Score Pill */}
                  <div className="px-3.5 py-2 rounded-xl bg-card border border-border flex items-center gap-3 shadow-xs">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                        Risk Score
                      </p>
                      <p className={`text-lg font-extrabold font-mono ${getRiskScoreDetails(analysis.riskScore).color}`}>
                        {analysis.riskScore}
                        <span className="text-xs font-normal text-muted-foreground">/100</span>
                      </p>
                    </div>
                    <div className="text-left border-l border-border pl-3">
                      <p className="text-xs font-semibold text-foreground">
                        {getRiskScoreDetails(analysis.riskScore).label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {getRiskScoreDetails(analysis.riskScore).badge}
                      </p>
                    </div>
                  </div>

                  {/* Export and Copy Toolbar */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(analysis.executiveSummary, "Executive Summary")}
                      className="text-xs h-9 gap-1.5 border-border"
                    >
                      {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Summary</span>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={downloadReport}
                      className="text-xs h-9 gap-1.5 bg-forest-800 text-white hover:bg-forest-900 dark:bg-gold-500 dark:text-forest-950 dark:hover:bg-gold-400"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Report (.md)</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="p-5 sm:p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="bg-muted/70 p-1 rounded-xl flex flex-wrap h-auto gap-1 border border-border">
                    <TabsTrigger value="overview" className="text-xs px-3.5 py-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">
                      Executive Overview
                    </TabsTrigger>
                    <TabsTrigger value="radar" className="text-xs px-3.5 py-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                      <span>Risky Clauses</span>
                      <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono">
                        {analysis.riskyClauses?.length || 0}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="statutes" className="text-xs px-3.5 py-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-gold-500" />
                      <span>Indian Law Matrix</span>
                      <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-mono">
                        {analysis.statutoryReferences?.length || 0}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="checklist" className="text-xs px-3.5 py-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Pre-Signing Checklist</span>
                    </TabsTrigger>
                    <TabsTrigger value="text" className="text-xs px-3.5 py-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">
                      Full Text View
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab 1: Executive Overview */}
                  <TabsContent value="overview" className="space-y-6 pt-1">
                    {/* Executive Summary Callout */}
                    <div className="p-4 sm:p-5 rounded-xl bg-forest-50 dark:bg-forest-900/20 border border-forest-200 dark:border-forest-800 space-y-2">
                      <div className="flex items-center gap-2 text-forest-800 dark:text-gold-400 text-xs font-semibold uppercase tracking-wider">
                        <FileCheck className="w-4 h-4" />
                        <span>Plain-English Executive Summary</span>
                      </div>
                      <p className="text-sm sm:text-base text-foreground leading-relaxed font-medium">
                        {analysis.executiveSummary}
                      </p>
                    </div>

                    {/* Parties and Obligations Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Identified Parties */}
                      <div className="space-y-3 p-4 rounded-xl border border-border bg-card">
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <span>Parties Involved</span>
                        </p>
                        {analysis.parties && analysis.parties.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {analysis.parties.map((party, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-medium border border-border"
                              >
                                {party}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No specific individual parties explicitly named.</p>
                        )}
                      </div>

                      {/* Immediate Risk Alert Box */}
                      <div className="space-y-3 p-4 rounded-xl border border-border bg-card">
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Flagged Risky Provisions</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Identified <strong className="text-foreground">{analysis.riskyClauses?.length || 0} critical/high risk clauses</strong> that require amendment or statutory pushback under Indian law.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("radar")}
                          className="text-xs h-8 text-forest-700 dark:text-gold-400 hover:underline"
                        >
                          View Flagged Clauses Radar →
                        </Button>
                      </div>
                    </div>

                    {/* Key Obligations */}
                    {analysis.keyObligations && analysis.keyObligations.length > 0 && (
                      <div className="space-y-3 p-5 rounded-xl border border-border bg-card">
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                          Key Obligations & Timelines
                        </h3>
                        <div className="grid grid-cols-1 gap-2.5">
                          {analysis.keyObligations.map((obligation, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/60 text-xs">
                              <div className="w-5 h-5 rounded-full bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                                {idx + 1}
                              </div>
                              <p className="text-foreground leading-relaxed">{obligation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Tab 2: Risky Clauses Radar */}
                  <TabsContent value="radar" className="space-y-4 pt-1">
                    {/* Severity Filter Strip */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                      <span className="text-muted-foreground font-medium text-[11px] mr-1">Filter:</span>
                      {["all", "critical", "high", "medium", "low"].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setSelectedRiskFilter(filter)}
                          className={`px-3 py-1 rounded-lg font-medium capitalize transition-colors ${
                            selectedRiskFilter === filter
                              ? "bg-forest-800 text-white dark:bg-gold-500 dark:text-forest-950 font-semibold"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>

                    {filteredClauses.length === 0 ? (
                      <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                        No clauses match the selected risk filter "{selectedRiskFilter}".
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredClauses.map((clause, idx) => (
                          <div
                            key={idx}
                            className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3.5 hover:border-forest-500/50 transition-colors"
                          >
                            {/* Card Header: Title and Severity Badge */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getRiskBadgeColor(clause.riskLevel)}`}>
                                  {clause.riskLevel} Risk
                                </span>
                                <h4 className="text-base font-bold text-foreground font-heading">
                                  {clause.clauseTitle}
                                </h4>
                              </div>

                              {clause.statutoryReference && (
                                <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/50">
                                  {clause.statutoryReference}
                                </span>
                              )}
                            </div>

                            {/* Exact Excerpt Quote */}
                            <div className="p-3 rounded-lg bg-muted/50 border-l-2 border-forest-600 dark:border-gold-400 text-xs italic text-foreground leading-relaxed">
                              "{clause.clauseText}"
                            </div>

                            {/* Explanation and Citizen Safeguard */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                              <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/60 space-y-1">
                                <p className="font-semibold text-rose-700 dark:text-rose-400 text-[11px] uppercase tracking-wider">
                                  Why This Is Risky Under Indian Law:
                                </p>
                                <p className="text-foreground leading-relaxed">{clause.explanation}</p>
                              </div>

                              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/60 space-y-1">
                                <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-[11px] uppercase tracking-wider">
                                  Recommended Citizen Safeguard:
                                </p>
                                <p className="text-foreground leading-relaxed">{clause.recommendation}</p>
                              </div>
                            </div>

                            {/* Ask AI Assistant In-Context Trigger */}
                            <div className="pt-1 flex items-center justify-between">
                              <button
                                onClick={() =>
                                  openConsultation({
                                    title: `Contract Clause • ${clause.clauseTitle}`,
                                    subtitle: clause.statutoryReference || "Contract Law",
                                    prompt: `Under Indian law, is the following contract clause legally valid or enforceable: "${clause.clauseText}"? What specific counter-clauses or statutory grounds (e.g., under ${clause.statutoryReference || "the Indian Contract Act"}) protect me?`,
                                    act: clause.statutoryReference,
                                    section: clause.section,
                                  })
                                }
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 dark:text-gold-400 hover:underline cursor-pointer group"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-gold-500 group-hover:rotate-12 transition-transform" />
                                <span>Ask AI to draft a counter-proposal</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    `Proposed Amendment to ${clause.clauseTitle}:\n${clause.recommendation}`,
                                    "Counter-Proposal"
                                  )
                                }
                                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copy Counter-Term</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Tab 3: Statutory References */}
                  <TabsContent value="statutes" className="space-y-4 pt-1">
                    <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground">
                      These Indian statutes directly govern and restrict the provisions found in this agreement. Clauses contradicting these statutory provisions are often void or unenforceable in courts.
                    </div>

                    <div className="grid grid-cols-1 gap-3.5">
                      {analysis.statutoryReferences && analysis.statutoryReferences.length > 0 ? (
                        analysis.statutoryReferences.map((statute, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-foreground font-heading">
                                  {statute.act}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 font-bold">
                                  Section {statute.section}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-foreground/90">{statute.title}</p>
                              <p className="text-xs text-muted-foreground leading-relaxed">{statute.relevance}</p>
                            </div>

                            <button
                              onClick={() =>
                                openConsultation({
                                  title: `${statute.act} Section ${statute.section}`,
                                  subtitle: statute.title,
                                  prompt: `What does ${statute.act} Section ${statute.section} mandate regarding ${statute.title}? How does this statutory rule apply to my contract?`,
                                  act: statute.act,
                                  section: statute.section,
                                })
                              }
                              className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-forest-700 dark:text-gold-400 hover:underline cursor-pointer"
                            >
                              <span>Explore Provision →</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-6">
                          No specific statutory links generated.
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  {/* Tab 4: Action Checklist */}
                  <TabsContent value="checklist" className="space-y-4 pt-1">
                    <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-foreground font-heading">
                          Action Checklist Before Signing
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Practical protective steps to take before executing this contract:
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        {analysis.actionChecklist && analysis.actionChecklist.length > 0 ? (
                          analysis.actionChecklist.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/70 text-xs"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="text-foreground leading-relaxed">{item}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">No specific checklist generated.</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab 5: Full Text View */}
                  <TabsContent value="text" className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Simplified Markdown */}
                      <div className="p-4 rounded-xl border border-border bg-background max-h-[500px] overflow-y-auto space-y-2">
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wider border-b border-border pb-2">
                          Simplified Overview
                        </p>
                        <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                          {analysis.simplifiedText}
                        </div>
                      </div>

                      {/* Raw Original Text */}
                      <div className="p-4 rounded-xl border border-border bg-background max-h-[500px] overflow-y-auto space-y-2">
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wider border-b border-border pb-2">
                          Original Document Text
                        </p>
                        <pre className="text-[11px] whitespace-pre-wrap font-mono text-muted-foreground">
                          {originalContent}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Slide-Out History Sheet */}
      <Sheet open={isHistorySheetOpen} onOpenChange={setIsHistorySheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-6 flex flex-col gap-4 overflow-y-auto">
          <SheetHeader className="pb-1 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <SheetTitle className="text-lg font-bold font-heading">
                  Document Audit Archive
                </SheetTitle>
                <SheetDescription className="text-xs">
                  Access previously analyzed contracts with zero token re-spend.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Search Box */}
          {authStatus === "authenticated" && history.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Filter by document title or category..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
          )}

          {/* Body Content */}
          {authStatus !== "authenticated" ? (
            <div className="p-6 rounded-2xl bg-muted/30 border border-dashed border-border text-center space-y-4 my-auto">
              <div className="w-12 h-12 rounded-full bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 mx-auto flex items-center justify-center">
                <LogIn className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-foreground">Sign In to Save Documents</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  BharatLegal encrypts and retains your contract reviews privately so you can compare clauses, verify statutory compliance, and share reports across devices.
                </p>
              </div>
              <Button
                onClick={() => signIn()}
                className="w-full text-xs h-9 bg-forest-800 text-white hover:bg-forest-900 dark:bg-gold-500 dark:text-forest-950 font-semibold"
              >
                Sign In / Register
              </Button>
            </div>
          ) : isLoadingHistory ? (
            <div className="py-16 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-forest-600 dark:text-gold-400" />
              <span>Fetching your private document archive...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-16 text-center space-y-2 border border-dashed rounded-2xl p-6">
              <Clock className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs font-bold text-foreground">
                {historySearch ? "No matching documents found" : "No Audits Saved Yet"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {historySearch
                  ? "Try searching for a different keyword or file title."
                  : "Upload a contract deed or lease to generate your first audit."}
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
                <span>{filteredHistory.length} {filteredHistory.length === 1 ? "audit" : "audits"} found</span>
                <span className="text-[10px] text-forest-700 dark:text-gold-400 font-medium">100% In-Memory / Secure</span>
              </div>

              {filteredHistory.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleLoadHistoryItem(doc.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 group ${
                    activeDocId === doc.id
                      ? "border-forest-500 bg-forest-50/70 dark:bg-forest-900/30 shadow-xs"
                      : "border-border bg-card hover:border-forest-500/50 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="p-2 rounded-xl bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-foreground truncate">
                            {doc.fileName}
                          </p>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground shrink-0">
                            {doc.fileType}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {doc.documentCategory}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deletingId === doc.id}
                      onClick={(e) => handleDeleteHistoryItem(doc.id, e)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Delete audit"
                    >
                      {deletingId === doc.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>

                  {/* Summary Snippet */}
                  {doc.executiveSummary && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {doc.executiveSummary}
                    </p>
                  )}

                  {/* Bottom Meta Row */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full border ${getRiskBadgeColor(
                          doc.riskScore >= 70 ? "critical" : doc.riskScore >= 40 ? "medium" : "low"
                        )}`}
                      >
                        Risk: {doc.riskScore}/100
                      </span>
                      {doc.riskyClausesCount > 0 && (
                        <span className="text-rose-600 dark:text-rose-400 font-medium">
                          {doc.riskyClausesCount} clauses flagged
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(doc.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
