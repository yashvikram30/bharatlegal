"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Search,
  SortAsc,
  SortDesc,
  Plus,
  Scale,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  ExternalLink,
  Trash2,
  LogIn,
  Check,
  X,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Download,
  Eye,
  FileCheck,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CaseTimeline } from "@/components/case-timeline";
import { parseCNR } from "@/lib/courts/cnr";
import { CaseStage, TrackedCaseDTO } from "@/lib/courts/types";

// Curated demo cases for guest preview
const DEMO_CASES: TrackedCaseDTO[] = [
  {
    id: "demo-1",
    caseNumber: "DLHC01-004521-2023",
    cnrNumber: "DLHC01-004521-2023",
    title: "Civil Writ Petition (Injunction & Property Dispute)",
    court: "Delhi High Court (Principal Bench)",
    caseType: "Civil",
    stage: "Hearing",
    status: "Active",
    progress: 45,
    filingDate: "2023-04-10",
    nextHearing: "2024-11-20",
    judgeName: "Hon'ble Justice S. K. Kaul",
    petitioner: "Yash Vikram (Authenticated Petitioner)",
    opponentName: "Municipal Corporation of Delhi",
    lastOrderUrl:
      "https://indian-high-court-judgments.s3.ap-south-1.amazonaws.com/delhi/2023/004521.pdf",
    notes: "Interim stay granted on demolition. Notice issued to respondent.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-2",
    caseNumber: "MHCC02-009182-2023",
    cnrNumber: "MHCC02-009182-2023",
    title: "Commercial Contract Breach Suit",
    court: "District & Sessions Court, Mumbai",
    caseType: "Corporate",
    stage: "Arguments",
    status: "Active",
    progress: 80,
    filingDate: "2023-06-15",
    nextHearing: "2024-12-05",
    judgeName: "Additional District Judge P. Verma",
    petitioner: "Applicant Commercial Entity",
    opponentName: "Tech Logistics Pvt. Ltd.",
    lastOrderUrl: null,
    notes: "Affidavits in evidence completed. Final arguments listed.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-3",
    caseNumber: "KA03FC-001290-2022",
    cnrNumber: "KA03FC-001290-2022",
    title: "Consumer Dispute (Deficiency in Banking Service)",
    court: "District Consumer Commission, Bengaluru",
    caseType: "Consumer",
    stage: "Evidence",
    status: "Active",
    progress: 60,
    filingDate: "2022-09-01",
    nextHearing: "2024-11-28",
    judgeName: "President, DCDRC Bench 1",
    opponentName: "Nationalized Commercial Bank",
    lastOrderUrl: null,
    notes: "Bank submitted reply. Rejoinder to be filed on next hearing date.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession();

  const [cases, setCases] = useState<TrackedCaseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCase, setSelectedCase] = useState<TrackedCaseDTO | null>(null);

  // Quick Action CNR Bar state
  const [quickCnr, setQuickCnr] = useState("");
  const [isFetchingOrder, setIsFetchingOrder] = useState(false);
  const [orderModalData, setOrderModalData] = useState<{
    cnrDetails: any;
    orderPdfUrl: string | null;
    isPdfLive: boolean;
    officialOrderUrl: string;
  } | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Filters & sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Add Case Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cnrInput, setCnrInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [courtInput, setCourtInput] = useState("");
  const [caseTypeInput, setCaseTypeInput] = useState("Civil");
  const [stageInput, setStageInput] = useState<CaseStage>("Hearing");
  const [nextHearingInput, setNextHearingInput] = useState("");
  const [opponentInput, setOpponentInput] = useState("");
  const [judgeInput, setJudgeInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  // Live CNR parsing when typing in modal
  const cnrDetails = useMemo(() => parseCNR(cnrInput), [cnrInput]);
  const quickCnrInfo = useMemo(() => parseCNR(quickCnr), [quickCnr]);

  // Automatically prefill court name if valid CNR detected
  useEffect(() => {
    if (cnrDetails) {
      if (!courtInput) {
        setCourtInput(cnrDetails.courtName);
      }
      if (!titleInput) {
        setTitleInput(
          `${cnrDetails.courtType} Matter (${cnrDetails.filingNumber}/${cnrDetails.filingYear})`
        );
      }
    }
  }, [cnrDetails, courtInput, titleInput]);

  // Fetch cases from live API
  const fetchCases = useCallback(async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const res = await fetch("/api/cases");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.cases)) {
          if (data.authenticated && data.cases.length > 0) {
            setCases(data.cases);
          } else if (data.authenticated && data.cases.length === 0) {
            setCases([]);
          } else {
            // Unauthenticated guest preview
            setCases(DEMO_CASES);
          }
        }
      }
      if (showToast) toast.success("Case diary refreshed");
    } catch (err) {
      console.error("[Fetch Cases Error]:", err);
      setCases(DEMO_CASES);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases, authStatus]);

  // Quick Action 1: Instant Court Order Lookup (without saving to diary)
  const handleQuickFetchOrder = async () => {
    const raw = quickCnr.trim();
    if (!raw) {
      toast.error("Please enter a 16-character eCourts CNR number");
      return;
    }

    const parsed = parseCNR(raw);
    if (!parsed) {
      toast.error(
        "Invalid CNR format. Expected: 2-char State + 2-char Court + 2-char Bench + 6-digit Number + 4-digit Year (e.g. DLHC01-004521-2023)"
      );
      return;
    }

    setIsFetchingOrder(true);
    try {
      const res = await fetch(`/api/cases/order?cnr=${encodeURIComponent(raw)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setOrderModalData(data);
        setIsOrderModalOpen(true);
        if (data.orderPdfUrl) {
          toast.success("Court order resolved! Opening details...");
        } else {
          toast("Court metadata found. Check order portal links.", { icon: "ℹ️" });
        }
      } else {
        toast.error(data.error || "Could not resolve court order for this CNR");
      }
    } catch (err) {
      console.error("[Order Lookup Error]:", err);
      toast.error("Failed to connect to order resolver");
    } finally {
      setIsFetchingOrder(false);
    }
  };

  // Quick Action 2: Track this case directly
  const handleQuickTrack = () => {
    const raw = quickCnr.trim();
    if (!raw) {
      toast.error("Please enter a CNR number first");
      return;
    }

    const parsed = parseCNR(raw);
    setCnrInput(parsed ? parsed.formatted : raw);
    if (parsed) {
      setCourtInput(parsed.courtName);
      setTitleInput(`${parsed.courtType} Matter (${parsed.filingNumber}/${parsed.filingYear})`);
    }
    setIsAddModalOpen(true);
  };

  // Handle Add Case Form submission
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cnrInput.trim() && !titleInput.trim()) {
      toast.error("Please provide either a CNR number or a Case Title");
      return;
    }

    if (authStatus !== "authenticated") {
      toast.error("Please sign in to save persistent cases to your litigation diary");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseNumber: cnrInput.trim() || titleInput.trim(),
          title: titleInput.trim() || (cnrDetails ? `${cnrDetails.courtType} Matter (${cnrDetails.filingNumber}/${cnrDetails.filingYear})` : cnrInput.trim()),
          court: courtInput.trim() || (cnrDetails ? cnrDetails.courtName : "District Court"),
          caseType: caseTypeInput,
          stage: stageInput,
          status: "Active",
          nextHearingDate: nextHearingInput || null,
          opponentName: opponentInput.trim() || null,
          judgeName: judgeInput.trim() || null,
          notes: notesInput.trim() || "",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.case) {
        setCases((prev) => [data.case, ...prev.filter((c) => !c.id.startsWith("demo-"))]);
        toast.success("Case added to your litigation diary!");
        setIsAddModalOpen(false);
        // Reset inputs
        setCnrInput("");
        setTitleInput("");
        setCourtInput("");
        setNextHearingInput("");
        setOpponentInput("");
        setJudgeInput("");
        setNotesInput("");
      } else {
        toast.error(data.error || "Failed to add case");
      }
    } catch (err) {
      console.error("[Add Case Error]:", err);
      toast.error("Failed to connect to database");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle case deletion
  const handleDeleteCase = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id.startsWith("demo-")) {
      setCases((prev) => prev.filter((c) => c.id !== id));
      if (selectedCase?.id === id) setSelectedCase(null);
      toast.success("Demo case removed");
      return;
    }

    try {
      const res = await fetch(`/api/cases/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCases((prev) => prev.filter((c) => c.id !== id));
        if (selectedCase?.id === id) setSelectedCase(null);
        toast.success("Case removed from diary");
      } else {
        toast.error("Failed to delete case");
      }
    } catch (err) {
      toast.error("Error deleting case");
    }
  };

  // Quick Stage Update
  const handleStageChange = async (id: string, newStage: CaseStage, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id.startsWith("demo-")) {
      setCases((prev) =>
        prev.map((c) => (c.id === id ? { ...c, stage: newStage } : c))
      );
      if (selectedCase?.id === id) {
        setSelectedCase((prev) => (prev ? { ...prev, stage: newStage } : null));
      }
      toast.success(`Stage updated to ${newStage}`);
      return;
    }

    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.case) {
          setCases((prev) => prev.map((c) => (c.id === id ? data.case : c)));
          if (selectedCase?.id === id) setSelectedCase(data.case);
          toast.success(`Stage transitioned to ${newStage}`);
        }
      }
    } catch (err) {
      toast.error("Failed to update case stage");
    }
  };

  // Filter and sort cases
  const filteredCases = useMemo(() => {
    return cases
      .filter((c) => {
        const matchesStatus = filterStatus === "all" || c.status.toLowerCase() === filterStatus.toLowerCase();
        const matchesStage = filterStage === "all" || c.stage === filterStage;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          !q ||
          c.caseNumber.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.court.toLowerCase().includes(q) ||
          c.caseType.toLowerCase().includes(q) ||
          (c.opponentName && c.opponentName.toLowerCase().includes(q)) ||
          (c.judgeName && c.judgeName.toLowerCase().includes(q));

        return matchesStatus && matchesStage && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.nextHearing || a.updatedAt).getTime();
        const dateB = new Date(b.nextHearing || b.updatedAt).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [cases, filterStatus, filterStage, searchQuery, sortOrder]);

  const getStageBadge = (stage: CaseStage) => {
    switch (stage) {
      case "Filed":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30";
      case "Hearing":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
      case "Evidence":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30";
      case "Arguments":
        return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30";
      case "Judgment":
        return "bg-gold-500/15 text-gold-800 dark:text-gold-300 border-gold-500/30 font-semibold";
      case "Closed":
        return "bg-muted text-muted-foreground border-border";
    }
  };

  // Dynamic KPI Metrics
  const totalActive = cases.filter((c) => c.status.toLowerCase() === "active").length;
  const totalUpcoming = cases.filter((c) => c.nextHearing).length;
  const inArgumentsOrJudgment = cases.filter(
    (c) => c.stage === "Arguments" || c.stage === "Judgment"
  ).length;
  const totalCompleted = cases.filter((c) => c.stage === "Closed" || c.status.toLowerCase() === "completed").length;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 max-w-6xl space-y-8">
      {/* 1. Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-gold-400 border border-gold-500/30 mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>eCourts CNR Intelligence & Case Diary</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading">
            Litigation Case Tracker
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Instantly fetch certified court order copies or track upcoming hearings and procedural timelines.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCases(true)}
            disabled={isRefreshing}
            className="h-9 px-3 rounded-xl border-border/70 hover:bg-muted text-xs flex items-center gap-1.5"
            title="Refresh case diary"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-initial h-9 bg-forest-800 hover:bg-forest-700 text-forest-50 dark:text-gold-300 font-heading font-semibold text-xs rounded-xl border border-gold-500/40 shadow-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 text-gold-500" />
            <span>Add New Case</span>
          </Button>
        </div>
      </div>

      {/* 2. Instant CNR Intelligence & Dual-Action Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 dark:border-border shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-gold-400 border border-gold-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-foreground font-heading">
                Instant CNR Lookup — Fetch Order or Track
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Paste any 16-character eCourts CNR to download the certified judicial order or add it to your litigation diary.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Input
              value={quickCnr}
              onChange={(e) => setQuickCnr(e.target.value)}
              placeholder="e.g. DLHC01-004521-2023 or MHCC02-009182-2023"
              className="h-10 text-xs font-mono uppercase bg-background border-border/70 rounded-xl"
            />
            {quickCnr && (
              <button
                type="button"
                onClick={() => setQuickCnr("")}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Action A: Fetch Court Order */}
            <Button
              type="button"
              onClick={handleQuickFetchOrder}
              disabled={isFetchingOrder || !quickCnr.trim()}
              className="flex-1 sm:flex-initial h-10 bg-forest-800 hover:bg-forest-700 text-white dark:text-gold-300 text-xs font-semibold rounded-xl px-4 flex items-center justify-center gap-1.5 shadow-2xs shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-gold-400" />
              <span>{isFetchingOrder ? "Resolving Order..." : "Fetch Court Order"}</span>
            </Button>

            {/* Action B: Track in Diary */}
            <Button
              type="button"
              variant="outline"
              onClick={handleQuickTrack}
              disabled={!quickCnr.trim()}
              className="flex-1 sm:flex-initial h-10 text-xs font-semibold rounded-xl px-3.5 border-border/80 hover:bg-muted shrink-0 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-forest-700 dark:text-gold-400" />
              <span>Track in Diary</span>
            </Button>
          </div>
        </div>

        {quickCnrInfo && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                Valid eCourts CNR: <strong>{quickCnrInfo.courtName}</strong> (Filing Year: {quickCnrInfo.filingYear})
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase text-muted-foreground shrink-0">
              {quickCnrInfo.formatted}
            </span>
          </div>
        )}
      </div>

      {/* 3. Guest Mode Notice if unauthenticated */}
      {authStatus !== "authenticated" && (
        <div className="p-4 rounded-xl bg-forest-50/80 dark:bg-forest-900/40 border border-gold-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                You are currently viewing demo court matters in Guest Mode
              </p>
              <p className="text-xs text-muted-foreground">
                Sign in to save persistent litigation matters, track CNR hearings, and attach official judgment copies.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => signIn()}
            className="h-8 bg-forest-800 hover:bg-forest-700 text-white dark:text-gold-300 text-xs rounded-lg px-3 shrink-0 flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Save</span>
          </Button>
        </div>
      )}

      {/* 4. Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 space-y-1 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Active Litigation
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading">
            {totalActive}
          </p>
          <p className="text-[11px] text-muted-foreground">Matters currently pending</p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 space-y-1 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Upcoming Hearings
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-forest-800 dark:text-gold-400 font-heading">
            {totalUpcoming}
          </p>
          <p className="text-[11px] text-muted-foreground">Scheduled on roster</p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 space-y-1 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Arguments / Judgment
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading">
            {inArgumentsOrJudgment}
          </p>
          <p className="text-[11px] text-muted-foreground">Advanced procedural stage</p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 space-y-1 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Closed / Disposed
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading">
            {totalCompleted}
          </p>
          <p className="text-[11px] text-muted-foreground">Concluded matters</p>
        </div>
      </div>

      {/* 5. Filter, Search & Sorting Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by CNR, Title, Court, Opponent, or Judge..."
            className="h-10 pl-9 pr-3 text-xs bg-card border-border/80 rounded-xl"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Stage filter */}
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="h-9 text-xs w-[130px] rounded-xl bg-card border-border/80">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="Filed">Filed</SelectItem>
              <SelectItem value="Hearing">Hearing</SelectItem>
              <SelectItem value="Evidence">Evidence</SelectItem>
              <SelectItem value="Arguments">Arguments</SelectItem>
              <SelectItem value="Judgment">Judgment</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 text-xs w-[120px] rounded-xl bg-card border-border/80">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Delayed">Delayed</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort order toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
            className="h-9 w-9 rounded-xl border-border/80 hover:bg-muted shrink-0"
            title={`Sort ${sortOrder === "asc" ? "Latest first" : "Earliest first"}`}
          >
            {sortOrder === "asc" ? (
              <SortAsc className="w-4 h-4 text-muted-foreground" />
            ) : (
              <SortDesc className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {/* 6. Case Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-border bg-card space-y-3 animate-pulse"
            >
              <div className="h-4 bg-muted/80 rounded w-1/3" />
              <div className="h-6 bg-muted/60 rounded w-3/4" />
              <div className="h-4 bg-muted/40 rounded w-1/2" />
              <div className="h-10 bg-muted/20 rounded mt-4" />
            </div>
          ))
        ) : filteredCases.length > 0 ? (
          filteredCases.map((c) => {
            const isSelected = selectedCase?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`group relative p-5 rounded-2xl border bg-card transition-all cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-sm ${
                  isSelected
                    ? "border-forest-500/80 ring-2 ring-forest-500/20 dark:border-gold-500/60 dark:ring-gold-500/20"
                    : "border-border/80 hover:border-gold-500/40"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-muted-foreground px-2 py-0.5 rounded-md bg-muted/70 truncate border border-border/40">
                      {c.cnrNumber || c.caseNumber}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getStageBadge(
                          c.stage
                        )}`}
                      >
                        {c.stage}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCase(c.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                        title="Delete from diary"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Court */}
                  <div>
                    <h3 className="font-heading font-bold text-sm sm:text-base text-foreground group-hover:text-forest-800 dark:group-hover:text-gold-300 transition-colors line-clamp-2">
                      {c.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Building className="w-3 h-3 shrink-0 text-muted-foreground/70" />
                      <span className="truncate">{c.court}</span>
                    </p>
                  </div>

                  {/* Opponent & Judge Info */}
                  {(c.opponentName || c.judgeName) && (
                    <div className="text-[11px] text-muted-foreground/80 space-y-0.5 pt-1">
                      {c.opponentName && (
                        <p className="truncate">
                          <span className="font-medium text-foreground/80">vs:</span>{" "}
                          {c.opponentName}
                        </p>
                      )}
                      {c.judgeName && (
                        <p className="truncate">
                          <span className="font-medium text-foreground/80">Bench:</span>{" "}
                          {c.judgeName}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Footer: Next Hearing & Stage Progress */}
                <div className="mt-4 pt-3 border-t border-border/60 space-y-2.5">
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Procedural Progress</span>
                      <span className="font-semibold text-foreground">{c.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-forest-700 dark:bg-gold-500 rounded-full transition-all duration-300"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Next Hearing & Order URL Link */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-forest-700 dark:text-gold-500" />
                      <span className="text-[11px]">
                        {c.nextHearing ? `Next: ${c.nextHearing}` : "Hearing: To be listed"}
                      </span>
                    </div>

                    {c.lastOrderUrl ? (
                      <a
                        href={c.lastOrderUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-700 dark:text-gold-400 hover:underline"
                        title="View published judgment order from AWS Open Data"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Order Copy</span>
                      </a>
                    ) : (
                      <span className="text-[11px] font-medium text-muted-foreground/60 flex items-center gap-0.5 group-hover:text-forest-700 dark:group-hover:text-gold-400 transition-colors">
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16 px-4 bg-card border border-dashed border-border/80 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-100 dark:bg-forest-900 border border-gold-500/30 text-gold-500 flex items-center justify-center mx-auto text-xl font-bold">
              ⚖
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <p className="text-base font-bold text-foreground font-heading">
                No Tracked Cases Found
              </p>
              <p className="text-xs text-muted-foreground">
                {searchQuery
                  ? `No cases match "${searchQuery}". Try clearing search or resetting filters.`
                  : "Add your first Indian court case or enter a 16-character CNR number to monitor proceedings."}
              </p>
            </div>
            <Button
              onClick={() => {
                if (searchQuery) {
                  setSearchQuery("");
                  setFilterStage("all");
                  setFilterStatus("all");
                } else {
                  setIsAddModalOpen(true);
                }
              }}
              className="bg-forest-800 text-white hover:bg-forest-700 dark:bg-gold-500 dark:text-forest-950 text-xs rounded-xl"
            >
              {searchQuery ? "Reset Filters" : "+ Add Case to Diary"}
            </Button>
          </div>
        )}
      </div>

      {/* 7. Selected Case Modal / Expand Area */}
      <AnimatePresence>
        {selectedCase && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-card border border-border/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-forest-700 dark:text-gold-400">
                    {selectedCase.cnrNumber || selectedCase.caseNumber}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getStageBadge(
                      selectedCase.stage
                    )}`}
                  >
                    {selectedCase.stage}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground font-heading">
                  {selectedCase.title}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {selectedCase.court}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Stage switcher */}
                <Select
                  value={selectedCase.stage}
                  onValueChange={(stage: CaseStage) =>
                    handleStageChange(selectedCase.id, stage, {
                      stopPropagation: () => {},
                    } as any)
                  }
                >
                  <SelectTrigger className="h-8 text-xs w-[130px] rounded-lg">
                    <SelectValue placeholder="Change Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Filed">Filed</SelectItem>
                    <SelectItem value="Hearing">Hearing</SelectItem>
                    <SelectItem value="Evidence">Evidence</SelectItem>
                    <SelectItem value="Arguments">Arguments</SelectItem>
                    <SelectItem value="Judgment">Judgment</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCase(null)}
                  className="h-8 text-xs rounded-lg"
                >
                  Close
                </Button>
              </div>
            </div>

            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="bg-muted/70 mb-6">
                <TabsTrigger value="timeline">Procedural Timeline</TabsTrigger>
                <TabsTrigger value="details">Case Metadata</TabsTrigger>
                <TabsTrigger value="documents">Filings & Judgments</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline">
                <CaseTimeline
                  caseData={{
                    id: selectedCase.id,
                    caseNumber: selectedCase.caseNumber,
                    cnrNumber: selectedCase.cnrNumber,
                    title: selectedCase.title,
                    court: selectedCase.court,
                    type: selectedCase.caseType,
                    stage: selectedCase.stage,
                    status: selectedCase.status,
                    progress: selectedCase.progress,
                    filingDate: selectedCase.filingDate,
                    nextHearing: selectedCase.nextHearing,
                    lastOrderUrl: selectedCase.lastOrderUrl,
                    timeline: selectedCase.timeline as any,
                  }}
                />
              </TabsContent>

              <TabsContent value="details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="p-4 rounded-xl bg-background border border-border/60 space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Petitioner / Complainant
                    </p>
                    <p className="font-medium text-foreground">
                      {selectedCase.petitioner || "Self / Complainant"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-background border border-border/60 space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Respondent / Opponent
                    </p>
                    <p className="font-medium text-foreground">
                      {selectedCase.opponentName || "Not Listed"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-background border border-border/60 space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Presiding Judge / Bench
                    </p>
                    <p className="font-medium text-foreground">
                      {selectedCase.judgeName || "Roster Bench"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-background border border-border/60 space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Next Scheduled Hearing
                    </p>
                    <p className="font-medium text-forest-700 dark:text-gold-400">
                      {selectedCase.nextHearing || "Awaiting Listing"}
                    </p>
                  </div>
                  {selectedCase.notes && (
                    <div className="col-span-full p-4 rounded-xl bg-background border border-border/60 space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Case Notes & Procedural Strategy
                      </p>
                      <p className="text-xs text-foreground leading-relaxed">
                        {selectedCase.notes}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="documents">
                <div className="p-6 rounded-xl border border-dashed border-border/80 text-center space-y-3">
                  <FileText className="w-8 h-8 mx-auto text-muted-foreground/60" />
                  {selectedCase.lastOrderUrl ? (
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-foreground font-heading">
                        AWS Open Data Judgment Copy Available
                      </p>
                      <p className="text-xs text-muted-foreground max-w-md mx-auto">
                        Official order indexed under open judicial archives (CC-BY-4.0).
                      </p>
                      <a
                        href={selectedCase.lastOrderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white dark:text-gold-300"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Download Certified Order PDF</span>
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        No published order attached yet
                      </p>
                      <p className="text-xs text-muted-foreground">
                        High Court & Supreme Court matters automatically resolve public orders once delivered.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. Dedicated Court Order Modal (Instant Lookup) */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-gold-400 border border-gold-500/20">
                <FileCheck className="w-4 h-4" />
              </div>
              <DialogTitle className="font-heading font-bold text-base">
                Certified Court Order Resolver
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Direct verification against open judicial archives and official registries.
            </DialogDescription>
          </DialogHeader>

          {orderModalData && (
            <div className="space-y-4 pt-2">
              <div className="p-3.5 rounded-xl bg-muted/60 border border-border/70 space-y-2">
                <div className="flex justify-between items-start text-xs">
                  <span className="font-mono text-[11px] font-bold text-foreground">
                    {orderModalData.cnrDetails.formatted}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-forest-700 dark:text-gold-400 bg-forest-100 dark:bg-forest-950 px-2 py-0.5 rounded border border-gold-500/30">
                    {orderModalData.cnrDetails.courtType}
                  </span>
                </div>
                <p className="text-xs font-semibold text-foreground">
                  {orderModalData.cnrDetails.courtName}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <p>
                    Filing #: <strong>{orderModalData.cnrDetails.filingNumber}</strong>
                  </p>
                  <p>
                    Filing Year: <strong>{orderModalData.cnrDetails.filingYear}</strong>
                  </p>
                </div>
              </div>

              {orderModalData.orderPdfUrl ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-center">
                  <div className="inline-flex p-2 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 mx-auto">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-foreground">
                      Certified Judgment Order Available
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Hosted under public AWS Open Data repository (CC-BY-4.0).
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    <a
                      href={orderModalData.orderPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white dark:text-gold-300 text-xs font-semibold shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Order PDF</span>
                    </a>
                    <a
                      href={orderModalData.orderPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border/80 hover:bg-muted text-xs font-medium text-foreground"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View in Browser</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-center">
                  <p className="text-xs font-semibold text-foreground">
                    Direct S3 PDF Not Yet Indexed
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    This district or interim proceeding can be accessed via the official court portal.
                  </p>
                  <a
                    href={orderModalData.officialOrderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-forest-800 text-white text-xs font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Official Court Portal</span>
                  </a>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-2 flex sm:justify-between items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOrderModalOpen(false)}
              className="text-xs"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsOrderModalOpen(false);
                if (orderModalData?.cnrDetails) {
                  setCnrInput(orderModalData.cnrDetails.formatted);
                  setCourtInput(orderModalData.cnrDetails.courtName);
                  setTitleInput(
                    `${orderModalData.cnrDetails.courtType} Matter (${orderModalData.cnrDetails.filingNumber}/${orderModalData.cnrDetails.filingYear})`
                  );
                  setIsAddModalOpen(true);
                }
              }}
              className="bg-forest-800 hover:bg-forest-700 text-white dark:text-gold-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Also Track in Diary</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 9. Add Case Modal Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-lg">
              Track New Court Case
            </DialogTitle>
            <DialogDescription className="text-xs">
              Enter your CNR number to auto-detect court details, or enter matter details manually.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCase} className="space-y-4 pt-2">
            {/* 16-char CNR Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                16-Character eCourts CNR Number
              </Label>
              <Input
                value={cnrInput}
                onChange={(e) => setCnrInput(e.target.value)}
                placeholder="e.g. DLHC01-004521-2023 or MHDC02-001234-2022"
                className="text-xs uppercase font-mono"
              />
              {/* CNR Validation Badge */}
              {cnrDetails ? (
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Valid eCourts CNR: <strong>{cnrDetails.courtName}</strong> ({cnrDetails.filingYear})
                    </span>
                  </div>
                  {cnrDetails.orderPdfUrl && (
                    <a
                      href={cnrDetails.orderPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-forest-700 dark:text-gold-400 hover:underline shrink-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Order PDF</span>
                    </a>
                  )}
                </div>
              ) : cnrInput.length > 3 ? (
                <p className="text-[10px] text-muted-foreground">
                  Format: 2-char State + 2-char Court + 2-char Bench + 6-digit Case + 4-digit Year
                </p>
              ) : null}
            </div>

            {/* Title & Court Name (Auto-filled from CNR) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Matter / Petition Title</Label>
                <Input
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g. Commercial Injunction Suit"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Court / Forum</Label>
                <Input
                  value={courtInput}
                  onChange={(e) => setCourtInput(e.target.value)}
                  placeholder="e.g. Delhi High Court"
                  className="text-xs"
                />
              </div>
            </div>

            {/* Case Type & Stage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Case Type</Label>
                <Select value={caseTypeInput} onValueChange={setCaseTypeInput}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Civil">Civil</SelectItem>
                    <SelectItem value="Criminal">Criminal</SelectItem>
                    <SelectItem value="Consumer">Consumer</SelectItem>
                    <SelectItem value="Labour">Labour</SelectItem>
                    <SelectItem value="Family">Family</SelectItem>
                    <SelectItem value="Tenancy">Tenancy</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                    <SelectItem value="Insolvency">Insolvency</SelectItem>
                    <SelectItem value="Intellectual Property">Intellectual Property</SelectItem>
                    <SelectItem value="Constitutional">Constitutional</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Judicial Stage</Label>
                <Select
                  value={stageInput}
                  onValueChange={(val: CaseStage) => setStageInput(val)}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Filed">Filed (Initial Registration)</SelectItem>
                    <SelectItem value="Hearing">Hearing (Pleadings)</SelectItem>
                    <SelectItem value="Evidence">Evidence (Witness Examination)</SelectItem>
                    <SelectItem value="Arguments">Arguments (Final Oral Hearing)</SelectItem>
                    <SelectItem value="Judgment">Judgment (Order Reserved)</SelectItem>
                    <SelectItem value="Closed">Closed (Disposed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Next Hearing & Opponent */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Next Scheduled Hearing</Label>
                <Input
                  type="date"
                  value={nextHearingInput}
                  onChange={(e) => setNextHearingInput(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Opponent / Respondent</Label>
                <Input
                  value={opponentInput}
                  onChange={(e) => setOpponentInput(e.target.value)}
                  placeholder="e.g. State of NCT or Private Corp"
                  className="text-xs"
                />
              </div>
            </div>

            {/* Presiding Judge & Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Presiding Judge / Bench</Label>
              <Input
                value={judgeInput}
                onChange={(e) => setJudgeInput(e.target.value)}
                placeholder="e.g. Hon'ble Justice S. K. Kaul"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Procedural Notes / Diary</Label>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Document filing notes, legal notice dispatch date, or counsel instructions..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-border bg-background text-xs placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>

            <DialogFooter className="pt-2 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-forest-800 hover:bg-forest-700 text-white dark:text-gold-300 text-xs font-semibold"
              >
                {isSubmitting ? "Saving..." : "Add to Litigation Diary"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
