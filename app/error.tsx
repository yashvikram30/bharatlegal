"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-16">
      <div className="max-w-lg w-full text-center space-y-6">
        {/* Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
          <span>Application Exception</span>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-heading">
            Something Went Wrong
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            An unexpected error occurred while rendering this legal view. Your session data remains safe.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground/80 pt-1">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </Button>

          <Button asChild variant="outline" className="w-full sm:w-auto border-border">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
