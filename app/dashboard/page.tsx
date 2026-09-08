"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Filter,
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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaseTimeline } from "@/components/case-timeline";

type CaseItem = {
  id: string;
  caseNumber: string;
  court: string;
  type: string;
  stage: "Filed" | "Hearing" | "Evidence" | "Arguments" | "Judgment" | "Closed";
  status: "Active" | "Pending" | "Delayed" | "Completed";
  progress: number;
  lastUpdated: string;
  nextHearing?: string;
  judgeName?: string;
  opponentName?: string;
};

export default function DashboardPage() {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);

  // Mock curated cases for Indian courts
  const cases: CaseItem[] = [
    {
      id: "1",
      caseNumber: "CNR: DLHC01-004521-2023",
      court: "Delhi High Court",
      type: "Civil Writ Petition",
      stage: "Hearing",
      status: "Active",
      progress: 45,
      lastUpdated: "2024-02-15",
      nextHearing: "2024-03-10",
      judgeName: "Hon'ble Justice S. K. Kaul",
      opponentName: "Municipal Corporation of Delhi",
    },
    {
      id: "2",
      caseNumber: "CNR: MHCC02-009182-2023",
      court: "District & Sessions Court, Mumbai",
      type: "Criminal Bail Application",
      stage: "Arguments",
      status: "Active",
      progress: 60,
      lastUpdated: "2024-02-20",
      nextHearing: "2024-03-04",
      judgeName: "Additional District Judge P. Verma",
      opponentName: "State of Maharashtra",
    },
    {
      id: "3",
      caseNumber: "CNR: KA03-CC-0129-2022",
      court: "District Consumer Disputes Redressal Commission, Bengaluru",
      type: "Consumer Dispute (Deficiency in Service)",
      stage: "Evidence",
      status: "Active",
      progress: 75,
      lastUpdated: "2024-01-28",
      nextHearing: "2024-03-18",
      judgeName: "President, Consumer Forum",
      opponentName: "Apex Electronics Pvt Ltd",
    },
    {
      id: "4",
      caseNumber: "CNR: NCLT-DEL-0891-2023",
      court: "National Company Law Tribunal (NCLT), New Delhi",
      type: "Insolvency & Bankruptcy (Sec 9 IBC)",
      stage: "Filed",
      status: "Pending",
      progress: 20,
      lastUpdated: "2024-02-05",
      nextHearing: "2024-03-25",
      judgeName: "Bench-II, NCLT",
      opponentName: "Delta Logistics Corp",
    },
    {
      id: "5",
      caseNumber: "CNR: TNCH01-002319-2022",
      court: "Family Court, Chennai",
      type: "Mutual Consent Petitions",
      stage: "Judgment",
      status: "Completed",
      progress: 100,
      lastUpdated: "2023-12-18",
      judgeName: "Principal Judge, Family Court",
      opponentName: "Respondent",
    },
  ];

  // Filter and sort cases
  const filteredCases = cases
    .filter(
      (c) =>
        (filterStatus === "all" || c.status === filterStatus) &&
        (searchQuery === "" ||
          c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.court.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.opponentName && c.opponentName.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    .sort((a, b) => {
      const dateA = new Date(a.lastUpdated).getTime();
      const dateB = new Date(b.lastUpdated).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20";
      case "Pending":
        return "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20";
      case "Delayed":
        return "bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/20";
      case "Completed":
        return "bg-forest-100 text-forest-800 dark:bg-forest-800 dark:text-forest-100 border-forest-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 max-w-6xl space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 border border-forest-500/20 mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Litigation Management</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground font-heading">
            Case Tracker Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track CNR numbers, court stages, upcoming hearings, and procedural timelines.
          </p>
        </div>

        <Button className="bg-forest-800 text-white hover:bg-forest-950 dark:bg-gold-500 dark:text-forest-950 dark:hover:bg-gold-500/90 font-medium flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-gold-700">
          <Plus className="w-4 h-4" /> Add Case
        </Button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Active Cases
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-forest-800 dark:text-forest-50 font-heading">
            3
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Hearings (Next 14 Days)
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-forest-800 dark:text-gold-500 font-heading">
            2
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Pending Filings
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-forest-800 dark:text-forest-50 font-heading">
            1
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Disposed / Completed
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-forest-800 dark:text-forest-50 font-heading">
            1
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by CNR number, court, case type, or parties..."
            className="pl-9 bg-card border-border focus-visible:ring-2 focus-visible:ring-gold-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="md:col-span-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active Hearing</SelectItem>
              <SelectItem value="Pending">Pending Notice</SelectItem>
              <SelectItem value="Delayed">Adjourned / Delayed</SelectItem>
              <SelectItem value="Completed">Disposed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3">
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
          >
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Sort by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Updated: Newest First</SelectItem>
              <SelectItem value="asc">Updated: Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Case Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCases.length > 0 ? (
          filteredCases.map((caseItem) => (
            <div
              key={caseItem.id}
              onClick={() => setSelectedCase(caseItem)}
              className={`cursor-pointer rounded-xl p-5 border transition-all duration-200 bg-card ${
                selectedCase?.id === caseItem.id
                  ? "border-forest-500 shadow-hover-card ring-1 ring-forest-500"
                  : "border-border hover:border-forest-500 hover:shadow-hover-card"
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-mono font-semibold text-muted-foreground">
                      {caseItem.caseNumber}
                    </p>
                    <h3 className="text-base font-bold text-foreground font-heading">
                      {caseItem.type}
                    </h3>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      caseItem.status
                    )}`}
                  >
                    {caseItem.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{caseItem.court}</span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>Stage: {caseItem.stage}</span>
                    <span>{caseItem.progress}%</span>
                  </div>
                  <div className="w-full bg-forest-100 dark:bg-forest-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-forest-800 dark:bg-gold-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${caseItem.progress}%` }}
                    />
                  </div>
                </div>

                {/* Next Hearing Date */}
                {caseItem.nextHearing && (
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-border">
                    <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <Calendar className="w-3.5 h-3.5 text-forest-800 dark:text-gold-500" />
                      Next Hearing:
                    </span>
                    <span className="font-semibold text-foreground">
                      {caseItem.nextHearing}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-card border border-border rounded-xl space-y-2">
            <p className="text-base font-semibold text-foreground">No cases found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search query or status filter.
            </p>
          </div>
        )}
      </div>

      {/* Selected Case Timeline & Details Modal Area */}
      {selectedCase && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm"
        >
          <div className="flex justify-between items-start border-b border-border pb-4">
            <div>
              <p className="text-xs font-mono font-semibold text-muted-foreground">
                {selectedCase.caseNumber}
              </p>
              <h2 className="text-2xl font-bold text-foreground font-heading">
                {selectedCase.type}
              </h2>
              <p className="text-sm text-muted-foreground">{selectedCase.court}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCase(null)}
              className="text-xs"
            >
              Close Details
            </Button>
          </div>

          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="bg-forest-100 dark:bg-forest-800 mb-6">
              <TabsTrigger value="timeline">Procedural Timeline</TabsTrigger>
              <TabsTrigger value="details">Case Metadata</TabsTrigger>
              <TabsTrigger value="documents">Filings & Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <CaseTimeline caseData={selectedCase} />
            </TabsContent>

            <TabsContent value="details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-lg bg-background border border-border space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Petitioner / Applicant
                  </p>
                  <p className="font-medium text-foreground">Authenticated User</p>
                </div>
                <div className="p-4 rounded-lg bg-background border border-border space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Respondent / Opponent
                  </p>
                  <p className="font-medium text-foreground">
                    {selectedCase.opponentName || "Not Listed"}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background border border-border space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Presiding Judge / Forum
                  </p>
                  <p className="font-medium text-foreground">
                    {selectedCase.judgeName || "District Court Judge"}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background border border-border space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Current Stage
                  </p>
                  <p className="font-medium text-foreground">{selectedCase.stage}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents">
              <div className="text-center py-10 border border-dashed border-border rounded-xl space-y-2">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm font-semibold text-foreground">No documents attached</p>
                <p className="text-xs text-muted-foreground">
                  Upload interim orders, petitions, or notices to link them with this case.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
}
