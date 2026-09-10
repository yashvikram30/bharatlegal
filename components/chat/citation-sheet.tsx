"use client";

import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Scale, BookOpen, ExternalLink, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { StatuteSectionDetail } from "@/lib/legal-api/indiacode";

interface CitationSheetProps {
  citation: { act: string; section: string } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CitationSheet({ citation, isOpen, onClose }: CitationSheetProps) {
  const [data, setData] = useState<StatuteSectionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!citation || !isOpen) {
      setData(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/statute?act=${encodeURIComponent(citation.act)}&section=${encodeURIComponent(citation.section)}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Section ${citation.section} not found in ${citation.act.toUpperCase()}`);
        }
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          setData(json.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load statutory provision");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [citation, isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-6 bg-background border-l border-border">
        <SheetHeader className="space-y-3 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-forest-800 dark:bg-forest-900 text-gold-400 flex items-center justify-center border border-gold-500/30">
              <Scale className="w-4 h-4 text-gold-500" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Statutory Provision Reference
            </span>
          </div>

          <div>
            <SheetTitle className="text-xl font-heading font-bold text-foreground">
              {loading ? (
                <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              ) : data ? (
                `${data.act.short_title}, Section ${data.section.number}`
              ) : (
                `${citation?.act.toUpperCase()} Section ${citation?.section}`
              )}
            </SheetTitle>
            <SheetDescription className="text-sm text-foreground/80 mt-1 font-medium">
              {data?.section.title}
            </SheetDescription>
          </div>

          {data && (
            <div className="flex flex-wrap gap-2 pt-1">
              {data.section.cognizable !== null && data.section.cognizable !== undefined && (
                <Badge
                  variant="outline"
                  className={
                    data.section.cognizable
                      ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  }
                >
                  {data.section.cognizable ? "Cognizable (Arrest without warrant)" : "Non-Cognizable"}
                </Badge>
              )}
              {data.section.bailable !== null && data.section.bailable !== undefined && (
                <Badge
                  variant="outline"
                  className={
                    data.section.bailable
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                  }
                >
                  {data.section.bailable ? "Bailable" : "Non-Bailable"}
                </Badge>
              )}
              {data.section.court_triable && (
                <Badge variant="secondary" className="bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-forest-200">
                  Triable: {data.section.court_triable}
                </Badge>
              )}
            </div>
          )}
        </SheetHeader>

        {loading && (
          <div className="space-y-4 py-8">
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-24 bg-muted animate-pulse rounded w-full" />
            <div className="h-32 bg-muted animate-pulse rounded w-full" />
          </div>
        )}

        {error && (
          <div className="py-8 text-center space-y-2">
            <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-medium text-foreground">{error}</p>
            <p className="text-xs text-muted-foreground">
              Please check the Act slug and section number, or consult the Bare Act directory.
            </p>
          </div>
        )}

        {data && (
          <div className="space-y-6 py-6 text-sm">
            {/* Old ↔ New Concordance Banner */}
            {data.corresponds_to && data.corresponds_to.length > 0 && (
              <div className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-forest-900 dark:text-gold-400 uppercase tracking-wide">
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Criminal Code Concordance (Old ↔ New Law)</span>
                </div>
                {data.corresponds_to.map((c, idx) => (
                  <div key={idx} className="text-xs text-foreground/90 space-y-1">
                    <p className="font-semibold text-forest-800 dark:text-gold-300">
                      {c.direction === "predecessor" ? "Historical Predecessor:" : "Modern Successor:"}{" "}
                      <span className="underline">{c.act.toUpperCase()} Section {c.section}</span> ({c.relation})
                    </p>
                    {c.notes && <p className="text-muted-foreground">{c.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Verbatim Bare Act Text */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Bare Act Provision Text</span>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border text-foreground/90 font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap selection:bg-gold-500/20">
                {data.section.text || "Official statutory text currently being indexed."}
              </div>
            </div>

            {/* Landmark Precedents / Ratio Decidendi */}
            {data.judgments && data.judgments.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 dark:text-gold-500" />
                  <span>Landmark Judicial Precedents ({data.judgments.length})</span>
                </div>

                <div className="space-y-3">
                  {data.judgments.slice(0, 3).map((j, i) => (
                    <div
                      key={j.cnr || i}
                      className="p-3.5 rounded-xl border border-border bg-card/60 space-y-2 hover:border-gold-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-xs text-foreground">{j.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {j.court_name} • {j.date}
                          </p>
                        </div>
                        {j.precedential_value && (
                          <Badge variant="outline" className="text-[10px] shrink-0 border-gold-500/30 text-gold-500">
                            {j.precedential_value}
                          </Badge>
                        )}
                      </div>

                      {j.ratio_decidendi && (
                        <div className="text-xs text-muted-foreground leading-relaxed pl-2 border-l-2 border-forest-500/40">
                          <span className="font-medium text-foreground">Ratio Decidendi: </span>
                          {j.ratio_decidendi}
                        </div>
                      )}

                      {j.url && (
                        <a
                          href={j.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-forest-700 dark:text-gold-400 hover:underline pt-1 font-medium"
                        >
                          <span>View eCourts Judgment Order</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source Footer */}
            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Source: IndiaCode / eCourts Open Data</span>
              {data.url && (
                <a
                  href={data.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground flex items-center gap-1 underline"
                >
                  <span>Verify on IndiaCode</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
