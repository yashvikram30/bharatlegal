export type CaseStage =
  | "Filed"
  | "Hearing"
  | "Evidence"
  | "Arguments"
  | "Judgment"
  | "Closed";

export type CaseStatus = "Active" | "Pending" | "Delayed" | "Completed";

export interface CNRDetails {
  raw: string;
  formatted: string;
  stateCode: string;
  stateName: string;
  courtCode: string;
  courtType: string;
  benchCode: string;
  benchName: string;
  courtName: string;
  filingNumber: string;
  filingYear: number;
  isHighCourt: boolean;
  isSupremeCourt: boolean;
  orderPdfUrl?: string | null;
}

export interface CaseTimelineItem {
  date: string;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  documentUrl?: string | null;
}

export interface TrackedCaseDTO {
  id: string;
  cnrNumber?: string;
  caseNumber: string;
  title: string;
  court: string;
  caseType: string;
  stage: CaseStage;
  status: CaseStatus;
  progress: number;
  filingDate?: string | null;
  nextHearing?: string | null;
  petitioner?: string | null;
  opponentName?: string | null;
  judgeName?: string | null;
  lastOrderUrl?: string | null;
  isLiveSynced?: boolean;
  notes?: string;
  timeline?: CaseTimelineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CaseDocketProvider {
  fetchCaseDetails(cnr: string): Promise<{
    stage: CaseStage;
    status: CaseStatus;
    courtName: string;
    nextHearing?: string;
    judgeName?: string;
    opponentName?: string;
    petitioner?: string;
    orders: Array<{ date: string; title: string; pdfUrl?: string }>;
  }>;
}
