import { CheckCircle2, Clock, FileText } from "lucide-react";

type CaseData = {
  id: string;
  caseNumber: string;
  court: string;
  type: string;
  stage: "Filed" | "Hearing" | "Evidence" | "Arguments" | "Judgment" | "Closed";
  status: "Active" | "Pending" | "Delayed" | "Completed";
  progress: number;
  lastUpdated: string;
  nextHearing?: string;
};

type TimelineEvent = {
  date: string;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
};

export function CaseTimeline({ caseData }: { caseData: CaseData }) {
  const generateTimelineEvents = (data: CaseData): TimelineEvent[] => {
    const events: TimelineEvent[] = [
      {
        date: "2023-01-15",
        title: "Petition Registered",
        description: "Initial petition verified and CNR registered with the court registry.",
        status: "completed",
      },
      {
        date: "2023-03-20",
        title: "Notice Issued & Service Complete",
        description: "Summons and notice issued to the respondent party.",
        status: "completed",
      },
    ];

    if (data.stage === "Filed") {
      events.push({
        date: data.nextHearing || "Pending",
        title: "First Admission Hearing",
        description: "Scheduled before the roster bench for preliminary hearing.",
        status: "current",
      });
    } else if (data.stage === "Hearing" || data.stage === "Evidence") {
      events.push({
        date: "2023-08-10",
        title: "Pleadings & Affidavits Filed",
        description: "Written statement and replication taken on judicial record.",
        status: "completed",
      });
      events.push({
        date: data.nextHearing || "2024-03-10",
        title: "Witness Examination & Evidence",
        description: "Cross-examination of witnesses listed for current proceedings.",
        status: "current",
      });
    } else if (data.stage === "Arguments") {
      events.push({
        date: "2023-08-10",
        title: "Evidence Concluded",
        description: "Affidavits in evidence and cross-examinations marked complete.",
        status: "completed",
      });
      events.push({
        date: data.nextHearing || "2024-03-04",
        title: "Final Arguments",
        description: "Senior advocates to present concluding oral and written submissions.",
        status: "current",
      });
    } else if (data.stage === "Judgment") {
      events.push({
        date: "2023-11-15",
        title: "Arguments Concluded",
        description: "Final arguments concluded by both parties.",
        status: "completed",
      });
      events.push({
        date: data.nextHearing || "2024-03-15",
        title: "Judgment Reserved",
        description: "Court has reserved order for formal pronouncement.",
        status: "current",
      });
    } else if (data.stage === "Closed") {
      events.push({
        date: "2023-10-15",
        title: "Arguments Concluded",
        description: "Final arguments concluded.",
        status: "completed",
      });
      events.push({
        date: "2023-12-18",
        title: "Final Judgment Delivered",
        description: "Certified copy of decree and judgment prepared.",
        status: "completed",
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
        {timelineEvents.map((event, index) => (
          <div key={index} className="relative flex items-start gap-4">
            <div className="w-16 text-right shrink-0 pt-0.5">
              <span className="text-xs font-semibold text-muted-foreground block">
                {event.date !== "Pending"
                  ? new Date(event.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })
                  : "Pending"}
              </span>
              <span className="text-[10px] text-muted-foreground/60 block">
                {event.date !== "Pending" ? new Date(event.date).getFullYear() : ""}
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
                  ? "bg-card border-forest-500 shadow-rest-card"
                  : "bg-muted/40 border-border"
              }`}
            >
              <h3 className="text-sm font-bold text-foreground font-heading">
                {event.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
