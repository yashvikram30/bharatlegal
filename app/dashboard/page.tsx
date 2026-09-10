"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import {
  Calendar,
  Search,
  Plus,
  Scale,
  Clock,
  CheckCircle2,
  FileText,
  Building,
  ExternalLink,
  Trash2,
  LogIn,
  Check,
  X,
  RefreshCw,
  Download,
  Eye,
  FileCheck,
  LayoutGrid,
  List,
  ChevronRight,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
    court: "Delhi High Court",
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
      "https://indian-high-court-judgments.s3.ap-south-1.amazonaws.com/data/pdf/year=2023/court=7_26/bench=dhcdb/DLHC010045212023_1_2023-02-14.pdf",
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

type FilterTab = "all" | "active" | "upcoming" | "arguments" | "closed";

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession();

  const [cases, setCases] = useState<TrackedCaseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCase, setSelectedCase] = useState<TrackedCaseDTO | null>(null);

  // Layout View: Grid or List
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  // Order modal state
  const [isFetchingOrder, setIsFetchingOrder] = useState(false);
  const [orderModalData, setOrderModalData] = useState<{
    cnrDetails: any;
    orderPdfUrl: string | null;
    isPdfLive: boolean;
    officialOrderUrl: string;
  } | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Add Case modal state
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

  // Live CNR detection from search input
  const detectedCnrInSearch = useMemo(() => {
    const raw = searchQuery.trim();
    if (raw.length >= 14) {
      return parseCNR(raw);
    }
    return null;
  }, [searchQuery]);

  // Modal CNR parsing
  const modalCnrDetails = useMemo(() => parseCNR(cnrInput), [cnrInput]);

  useEffect(() => {
    if (modalCnrDetails) {
      if (!courtInput) setCourtInput(modalCnrDetails.courtName);
      if (!titleInput) {
        setTitleInput(
          `${modalCnrDetails.courtType} Matter (${modalCnrDetails.filingNumber}/${modalCnrDetails.filingYear})`
        );
      }
    }
  }, [modalCnrDetails, courtInput, titleInput]);

  // Fetch cases
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
            setCases(DEMO_CASES);
          }
        }
      }
      if (showToast) toast.success("Refreshed case diary");
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

  // Quick Action: Fetch Court Order
  const handleQuickFetchOrder = async (targetCnr?: string) => {
    const raw = (targetCnr || searchQuery).trim();
    if (!raw) return;

    setIsFetchingOrder(true);
    try {
      const res = await fetch(`/api/cases/order?cnr=${encodeURIComponent(raw)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setOrderModalData(data);
        setIsOrderModalOpen(true);
      } else {
        toast.error(data.error || "Could not resolve court order for this CNR");
      }
    } catch (err) {
      toast.error("Failed to connect to order resolver");
    } finally {
      setIsFetchingOrder(false);
    }
  };

  // Quick Action: Track from Search
  const handleQuickTrackFromSearch = (targetCnr?: string) => {
    const raw = (targetCnr || searchQuery).trim();
    const parsed = parseCNR(raw);
    setCnrInput(parsed ? parsed.formatted : raw);
    if (parsed) {
      setCourtInput(parsed.courtName);
      setTitleInput(`${parsed.courtType} Matter (${parsed.filingNumber}/${parsed.filingYear})`);
    }
    setIsAddModalOpen(true);
  };

  // Create Case
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cnrInput.trim() && !titleInput.trim()) {
      toast.error("Please provide either a CNR number or a Case Title");
      return;
    }

    if (authStatus !== "authenticated") {
      toast.error("Please sign in to save persistent cases to your diary");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseNumber: cnrInput.trim() || titleInput.trim(),
          title:
            titleInput.trim() ||
            (modalCnrDetails
              ? `${modalCnrDetails.courtType} Matter (${modalCnrDetails.filingNumber}/${modalCnrDetails.filingYear})`
              : cnrInput.trim()),
          court: courtInput.trim() || (modalCnrDetails ? modalCnrDetails.courtName : "District Court"),
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
      toast.error("Failed to save case");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Case
  const handleDeleteCase = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (id.startsWith("demo-")) {
      setCases((prev) => prev.filter((c) => c.id !== id));
      if (selectedCase?.id === id) setSelectedCase(null);
      toast.success("Case removed");
      return;
    }

    try {
      const res = await fetch(`/api/cases/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCases((prev) => prev.filter((c) => c.id !== id));
        if (selectedCase?.id === id) setSelectedCase(null);
        toast.success("Case removed from diary");
      }
    } catch (err) {
      toast.error("Error deleting case");
    }
  };

  // Update Stage
  const handleStageChange = async (id: string, newStage: CaseStage) => {
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
          toast.success(`Stage updated to ${newStage}`);
        }
      }
    } catch (err) {
      toast.error("Failed to update case stage");
    }
  };

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Tab filter
      if (activeTab === "active" && c.status.toLowerCase() !== "active") return false;
      if (activeTab === "upcoming" && !c.nextHearing) return false;
      if (activeTab === "arguments" && c.stage !== "Arguments" && c.stage !== "Judgment")
        return false;
      if (
        activeTab === "closed" &&
        c.stage !== "Closed" &&
        c.status.toLowerCase() !== "completed"
      )
        return false;

      // Text search
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        c.caseNumber.toLowerCase().includes(q) ||
        (c.cnrNumber && c.cnrNumber.toLowerCase().includes(q)) ||
        c.title.toLowerCase().includes(q) ||
        c.court.toLowerCase().includes(q) ||
        (c.opponentName && c.opponentName.toLowerCase().includes(q)) ||
        (c.judgeName && c.judgeName.toLowerCase().includes(q))
      );
    });
  }, [cases, activeTab, searchQuery]);

  // Counts for tabs
  const activeCount = cases.filter((c) => c.status.toLowerCase() === "active").length;
  const upcomingCount = cases.filter((c) => c.nextHearing).length;
  const argumentsCount = cases.filter(
    (c) => c.stage === "Arguments" || c.stage === "Judgment"
  ).length;
  const closedCount = cases.filter(
    (c) => c.stage === "Closed" || c.status.toLowerCase() === "completed"
  ).length;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-5xl space-y-6">
      {/* 1. Slim Guest Notice (Only if guest) */}
      {authStatus !== "authenticated" && (
        <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-muted/40 border border-border/50 text-muted-foreground">
          <span>
            Viewing demo court cases. Sign in to save persistent litigation records.
          </span>
          <button
            onClick={() => signIn()}
            className="font-medium text-foreground hover:underline ml-2 shrink-0"
          >
            Sign In →
          </button>
        </div>
      )}

      {/* 2. Clean Header Row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground font-heading tracking-tight flex items-center gap-2">
            <span>Case Tracker</span>
            <span className="text-xs font-normal text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-full">
              {cases.length}
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage hearings, procedural milestones, and certified judgment copies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchCases(true)}
            disabled={isRefreshing}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Refresh cases"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="h-8 bg-forest-800 hover:bg-forest-700 text-white dark:text-gold-300 text-xs font-semibold rounded-lg px-3 flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Case</span>
          </Button>
        </div>
      </div>

      {/* 3. Unified Navigation & Search Bar (Single Clean Strip) */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                activeTab === "active"
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Active</span>
              <span className="text-[10px] opacity-70">({activeCount})</span>
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                activeTab === "upcoming"
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Upcoming</span>
              <span className="text-[10px] opacity-70">({upcomingCount})</span>
            </button>
            <button
              onClick={() => setActiveTab("arguments")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                activeTab === "arguments"
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Arguments</span>
              <span className="text-[10px] opacity-70">({argumentsCount})</span>
            </button>
            <button
              onClick={() => setActiveTab("closed")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                activeTab === "closed"
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Closed</span>
              <span className="text-[10px] opacity-70">({closedCount})</span>
            </button>
          </div>

          {/* Search + View Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or enter CNR..."
                className="h-8 pl-8 pr-7 text-xs bg-card border-border/70 rounded-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-border/70 rounded-lg p-0.5 bg-card">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Inline CNR Recognition Ribbon (Only shown if a 16-char CNR is typed) */}
        {detectedCnrInSearch && (
          <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-forest-50/60 dark:bg-forest-950/40 border border-gold-500/30">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0" />
              <span className="truncate">
                CNR Recognized: <strong>{detectedCnrInSearch.courtName}</strong> (
                {detectedCnrInSearch.filingYear})
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleQuickFetchOrder(searchQuery)}
                disabled={isFetchingOrder}
                className="text-xs font-semibold text-forest-800 dark:text-gold-400 hover:underline flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                <span>{isFetchingOrder ? "Resolving..." : "Fetch Certified Order"}</span>
              </button>
              <span className="text-border">|</span>
              <button
                onClick={() => handleQuickTrackFromSearch(searchQuery)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Track</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Case Listings (Grid or List) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl border border-border/50 bg-card/60 animate-pulse p-4 space-y-3"
            >
              <div className="h-3 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border/70 space-y-3">
          <p className="text-sm font-semibold text-foreground">No cases found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `No matters match "${searchQuery}". Clear your search to see all.`
              : "Add your first case or enter a 16-character CNR number above."}
          </p>
          {searchQuery ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="h-8 text-xs"
            >
              Clear Search
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="h-8 text-xs bg-forest-800 hover:bg-forest-700 text-white dark:text-gold-300"
            >
              + Add Case
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* MINIMAL GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredCases.map((c) => {
            const isSelected = selectedCase?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`group p-4 rounded-xl border bg-card transition-all cursor-pointer flex flex-col justify-between hover:border-gold-500/40 hover:shadow-2xs ${
                  isSelected
                    ? "border-forest-500 ring-1 ring-forest-500/30 dark:border-gold-500/70"
                    : "border-border/70"
                }`}
              >
                <div className="space-y-2">
                  {/* Top row: Stage pill & Next hearing */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-foreground/80 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest-600 dark:bg-gold-400" />
                      <span>{c.stage}</span>
                    </span>
                    <span className="text-muted-foreground">
                      {c.nextHearing || "Listing pending"}
                    </span>
                  </div>

                  {/* Title & Court */}
                  <div>
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-forest-800 dark:group-hover:text-gold-300 transition-colors line-clamp-2 leading-snug">
                      {c.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {c.court}
                    </p>
                  </div>
                </div>

                {/* Bottom row: CNR & Order Badge */}
                <div className="mt-4 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-muted-foreground/70 text-[10px] truncate max-w-[140px]">
                    {c.cnrNumber || c.caseNumber}
                  </span>

                  <div className="flex items-center gap-2">
                    {c.lastOrderUrl ? (
                      <a
                        href={c.lastOrderUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                        title="View certified court order"
                      >
                        <FileCheck className="w-3 h-3" />
                        <span>Order PDF</span>
                      </a>
                    ) : (
                      <span className="text-muted-foreground/50 group-hover:text-foreground transition-colors flex items-center gap-0.5">
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleDeleteCase(c.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-rose-600 transition-opacity"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* MINIMAL LIST VIEW */
        <div className="border border-border/70 rounded-xl overflow-hidden bg-card">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/30 border-b border-border/60 text-muted-foreground text-[11px] font-semibold">
              <tr>
                <th className="py-2.5 px-3.5">Matter</th>
                <th className="py-2.5 px-3.5">Stage</th>
                <th className="py-2.5 px-3.5">Next Hearing</th>
                <th className="py-2.5 px-3.5">CNR / Order</th>
                <th className="py-2.5 px-3.5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredCases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`cursor-pointer transition-colors hover:bg-muted/30 ${
                      isSelected ? "bg-muted/50" : ""
                    }`}
                  >
                    <td className="py-3 px-3.5 max-w-sm">
                      <p className="font-semibold text-foreground truncate hover:text-forest-800 dark:hover:text-gold-300">
                        {c.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {c.court}
                      </p>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="font-medium text-foreground/80">{c.stage}</span>
                    </td>
                    <td className="py-3 px-3.5 text-muted-foreground">
                      {c.nextHearing || "—"}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {c.cnrNumber || c.caseNumber}
                        </span>
                        {c.lastOrderUrl && (
                          <a
                            href={c.lastOrderUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                          >
                            <FileCheck className="w-3 h-3" />
                            <span>PDF</span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCase(c.id, e)}
                        className="p-1 text-muted-foreground/50 hover:text-rose-600 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Slide-Over Sheet (Right-side Drawer for Details & Milestones) */}
      <Sheet
        open={Boolean(selectedCase)}
        onOpenChange={(open) => !open && setSelectedCase(null)}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto p-6 space-y-6 bg-card border-l border-border/80"
        >
          {selectedCase && (
            <>
              <SheetHeader className="space-y-1.5 border-b border-border/50 pb-4 text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-muted-foreground">
                    {selectedCase.cnrNumber || selectedCase.caseNumber}
                  </span>

                  {/* Stage Switcher */}
                  <Select
                    value={selectedCase.stage}
                    onValueChange={(stage: CaseStage) =>
                      handleStageChange(selectedCase.id, stage)
                    }
                  >
                    <SelectTrigger className="h-7 text-xs w-[120px] rounded-lg">
                      <SelectValue />
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
                </div>

                <SheetTitle className="text-lg font-bold font-heading text-foreground pt-1">
                  {selectedCase.title}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building className="w-3 h-3 shrink-0" />
                  <span>{selectedCase.court}</span>
                </SheetDescription>
              </SheetHeader>

              {/* Drawer Tabs */}
              <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="bg-muted/50 mb-4 grid grid-cols-3">
                  <TabsTrigger value="timeline" className="text-xs">
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="details" className="text-xs">
                    Metadata
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs">
                    Judicial Order
                  </TabsTrigger>
                </TabsList>

                {/* Timeline */}
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

                {/* Metadata & Strategy Notes */}
                <TabsContent value="details" className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Petitioner
                      </span>
                      <p className="font-medium text-foreground mt-0.5">
                        {selectedCase.petitioner || "Self / Complainant"}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Respondent
                      </span>
                      <p className="font-medium text-foreground mt-0.5">
                        {selectedCase.opponentName || "Not Listed"}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Bench
                      </span>
                      <p className="font-medium text-foreground mt-0.5">
                        {selectedCase.judgeName || "Roster Bench"}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Next Hearing
                      </span>
                      <p className="font-medium text-forest-700 dark:text-gold-400 mt-0.5">
                        {selectedCase.nextHearing || "Awaiting Listing"}
                      </p>
                    </div>

                    {selectedCase.notes && (
                      <div className="col-span-2 p-3 rounded-lg bg-muted/40 border border-border/50">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                          Notes & Strategy
                        </span>
                        <p className="text-foreground mt-1 whitespace-pre-wrap leading-relaxed">
                          {selectedCase.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCase(selectedCase.id)}
                      className="h-7 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      <span>Remove Case</span>
                    </Button>
                  </div>
                </TabsContent>

                {/* Orders */}
                <TabsContent value="documents">
                  <div className="p-6 rounded-xl border border-dashed border-border/70 text-center space-y-3">
                    <FileText className="w-8 h-8 mx-auto text-muted-foreground/60" />
                    {selectedCase.lastOrderUrl ? (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">
                          Certified Judgment Order Available
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Verified through open judicial archives (AWS Open Data).
                        </p>
                        <div className="pt-1 flex gap-2 justify-center">
                          <a
                            href={selectedCase.lastOrderUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-800 text-white dark:text-gold-300 text-xs font-medium"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download PDF</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-foreground">
                          No judgment order attached yet
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Orders are indexed automatically once published by the court registry.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleQuickFetchOrder(selectedCase.cnrNumber || selectedCase.caseNumber)
                          }
                          className="h-7 text-xs mt-2"
                        >
                          Check AWS S3 Archive
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* 6. Instant Court Order Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-base flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-gold-500" />
              <span>Certified Court Order</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Direct verification against open judicial archives.
            </DialogDescription>
          </DialogHeader>

          {orderModalData && (
            <div className="space-y-3 pt-1 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                <span className="font-mono font-bold text-foreground">
                  {orderModalData.cnrDetails.formatted}
                </span>
                <p className="font-semibold text-foreground">
                  {orderModalData.cnrDetails.courtName}
                </p>
              </div>

              {orderModalData.orderPdfUrl && orderModalData.isPdfLive ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                  <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                    Certified Judgment PDF Available
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    AWS Open Data Judicial Archive (115 KB)
                  </p>
                  <div className="flex gap-2 justify-center pt-1">
                    <a
                      href={orderModalData.orderPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-800 text-white dark:text-gold-300 text-xs font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                  <p className="font-semibold text-foreground">Direct S3 PDF Not Yet Indexed</p>
                  <p className="text-[11px] text-muted-foreground">
                    Available through official eCourts registry portal.
                  </p>
                  <a
                    href={orderModalData.officialOrderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-forest-700 dark:text-gold-400 underline pt-1"
                  >
                    <span>Open Official Court Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-2 flex justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOrderModalOpen(false)}
              className="h-8 text-xs"
            >
              Close
            </Button>
            <Button
              type="button"
              size="sm"
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
              className="h-8 text-xs bg-forest-800 hover:bg-forest-700 text-white dark:text-gold-300"
            >
              + Track in Diary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 7. Add Case Modal Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-base">
              Track New Case
            </DialogTitle>
            <DialogDescription className="text-xs">
              Enter a 16-character CNR to auto-fill court details, or enter manually.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCase} className="space-y-3 pt-1 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-medium">CNR Number (Optional)</Label>
              <Input
                value={cnrInput}
                onChange={(e) => setCnrInput(e.target.value)}
                placeholder="e.g. DLHC01-004521-2023"
                className="h-8 text-xs uppercase font-mono"
              />
              {modalCnrDetails && (
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                  <Check className="w-3 h-3" />
                  <span>{modalCnrDetails.courtName}</span>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Case / Petition Title</Label>
              <Input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="e.g. Injunction Suit or Property Dispute"
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Court / Forum</Label>
                <Input
                  value={courtInput}
                  onChange={(e) => setCourtInput(e.target.value)}
                  placeholder="e.g. Delhi High Court"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Stage</Label>
                <Select
                  value={stageInput}
                  onValueChange={(val: CaseStage) => setStageInput(val)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
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
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Next Hearing Date</Label>
                <Input
                  type="date"
                  value={nextHearingInput}
                  onChange={(e) => setNextHearingInput(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Opponent / Respondent</Label>
                <Input
                  value={opponentInput}
                  onChange={(e) => setOpponentInput(e.target.value)}
                  placeholder="e.g. Municipal Corp"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Strategy Notes</Label>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Filing notes, counsel instructions..."
                rows={2}
                className="w-full p-2 rounded-lg border border-border bg-background text-xs"
              />
            </div>

            <DialogFooter className="pt-2 flex justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-8 text-xs bg-forest-800 hover:bg-forest-700 text-white dark:text-gold-300"
              >
                {isSubmitting ? "Saving..." : "Save to Diary"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
