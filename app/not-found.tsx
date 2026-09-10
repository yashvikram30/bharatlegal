import Link from "next/link";
import { Scale, ArrowLeft, MessageSquare, Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-16">
      <div className="max-w-lg w-full text-center space-y-6">
        {/* Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-forest-100 dark:bg-forest-900 border border-gold-500/40 text-gold-700 dark:text-gold-500 flex items-center justify-center text-3xl mx-auto shadow-sm">
          ⚖
        </div>

        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 border border-forest-500/20">
          <Scale className="w-3.5 h-3.5" />
          <span>Error 404 — Section Not Found</span>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-heading">
            Page or Legal Resource Not Found
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            The legal reference, document, or page you requested does not exist or has been relocated within the BharatLegal portal.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full sm:w-auto border-border">
            <Link href="/chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI Chatbot</span>
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-6 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Popular Destinations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link
              href="/rights"
              className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              Rights Visualizer
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              Case Tracker
            </Link>
            <Link
              href="/simplify"
              className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              Document Simplifier
            </Link>
            <Link
              href="/help"
              className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              Free Legal Aid
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
