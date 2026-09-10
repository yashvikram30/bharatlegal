import { CheckCircle2, Clock, FileText, ExternalLink } from "lucide-react";

export type CaseData = {
  id: string;
  caseNumber: string;
  cnrNumber?: string | null;
  title?: string;
  court: string;
  type: string;
  stage: "Filed" | "Hearing" | "Evidence" | "Arguments" | "Judgment" | "Closed";
  status: "Active" | "Pending" | "Delayed" | "Completed" | string;
  progress: number;
  lastUpdated?: string;
  filingDate?: string | null;
  nextHearing?: string | null;
  lastOrderUrl?: string | null;
  timeline?: TimelineEvent[];
};

export type TimelineEvent = {
  date: string;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  documentUrl?: string | null;
};

export function CaseTimeline({ caseData }: { caseData: CaseData }) {
  const generateTimelineEvents = (data: CaseData): TimelineEvent[] => {
    // If case has custom saved timeline events, use them
    if (data.timeline && data.timeline.length > 0) {
      return data.timeline;
    }

    const filingYear = data.filingDate
      ? new Date(data.filingDate).getFullYear()
      : new Date().getFullYear();
    const filingDateStr = data.filingDate || `${filingYear}-01-15`;

    const events: TimelineEvent[] = [
      {
        date: filingDateStr,
        title: "Petition Registered",
        description: `Verified and registered with court registry under ${
          data.cnrNumber || data.caseNumber
        }.`,
        status: "completed",
      },
      {
        date: data.stage === "Filed" ? "Pending" : `${filingYear}-03-20`,
        title: "Notice Issued & Service Complete",
        description: "Summons and notice issued to the respondent party.",
        status: data.stage === "Filed" ? "current" : "completed",
      },
    ];

    if (data.stage === "Hearing" || data.stage === "Evidence") {
      events.push({
        date: `${filingYear}-08-10`,
        title: "Pleadings & Affidavits Filed",
        description: "Written statement and replication taken on judicial record.",
        status: "completed",
      });
      events.push({
        date: data.nextHearing || "Scheduled",
        title: "Witness Examination & Hearing",
        description: "Listed for witness examination and oral submissions.",
        status: "current",
        documentUrl: data.lastOrderUrl,
      });
    } else if (data.stage === "Arguments") {
      events.push({
        date: `${filingYear}-09-15`,
        title: "Evidence Concluded",
        description: "Affidavits in evidence and cross-examinations marked complete.",
        status: "completed",
      });
      events.push({
        date: data.nextHearing || "Scheduled",
        title: "Final Arguments",
        description: "Advocates presenting concluding arguments before the bench.",
        status: "current",
        documentUrl: data.lastOrderUrl,
      });
    } else if (data.stage === "Judgment") {
      events.push({
        date: `${filingYear}-11-20`,
        title: "Arguments Concluded",
        description: "Final oral and written submissions concluded by both parties.",
        status: "completed",
      });
      events.push({
        date: data.nextHearing || "Pronouncement",
        title: "Judgment Reserved",
        description: "Court has reserved order for formal delivery.",
        status: "current",
        documentUrl: data.lastOrderUrl,
      });
    } else if (data.stage === "Closed") {
      events.push({
        date: `${filingYear}-12-10`,
        title: "Final Judgment Delivered",
        description: "Certified copy of decree and judgment prepared.",
        status: "completed",
        documentUrl: data.lastOrderUrl,
      });
    }

    return events;
  };

  const timelineEvents = generateTimelineEvents(caseData);

  return (
    <div className="relative pl-2">
      {/* Vertical line */}
      <div className="absolute left-[3.25rem] top-4 bottom-4 w-0.5 bg-border" />

      <div className="space-y-6">
        {timelineEvents.map((event, index) => {
          const isPending =
            !event.date || event.date === "Pending" || event.date === "Scheduled" || event.date === "Pronouncement";

          const parsedDate = !isPending ? new Date(event.date) : null;
          const isValidDate = parsedDate && !isNaN(parsedDate.getTime());

          return (
            <div key={index} className="relative flex items-start gap-4">
              <div className="w-16 text-right shrink-0 pt-0.5">
                <span className="text-xs font-semibold text-muted-foreground block">
                  {isValidDate
                    ? parsedDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    : event.date || "Next"}
                </span>
                <span className="text-[10px] text-muted-foreground/60 block">
                  {isValidDate ? parsedDate.getFullYear() : ""}
                </span>
              </div>

              <div
                className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border shrink-0 ${
                  event.status === "completed"
                    ? "bg-forest-100 text-forest-800 dark:bg-forest-800 dark:text-forest-100 border-forest-500"
                    : event.status === "current"
                    ? "bg-gold-500/15 text-gold-700 dark:text-gold-500 border-gold-500"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {event.status === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-forest-800 dark:text-forest-100" />
                ) : event.status === "current" ? (
                  <Clock className="h-4 w-4 text-gold-700 dark:text-gold-500" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              <div
                className={`flex-1 rounded-xl border p-4 transition-colors ${
                  event.status === "completed"
                    ? "bg-card border-border"
                    : event.status === "current"
                    ? "bg-card border-forest-500/70 shadow-2xs"
                    : "bg-muted/40 border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-foreground font-heading">
                    {event.title}
                  </h3>
                  {event.documentUrl && (
                    <a
                      href={event.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-forest-700 dark:text-gold-400 hover:underline shrink-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Order Copy</span>
                    </a>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
