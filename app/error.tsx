"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
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

        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground font-display">
            Something went wrong on our end
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            This page failed to load. Try again, and if it keeps happening, go back home and reopen it. Anything you already saved to your account is unaffected.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground/80 pt-1">
              Reference for support: {error.digest}
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
            <span>Try again</span>
          </Button>

          <Button asChild variant="outline" className="w-full sm:w-auto border-border">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span>Go to the home page</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
