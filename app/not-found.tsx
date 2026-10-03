import Link from "next/link";
import { MessageSquare, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-16">
      <div className="max-w-lg w-full text-center space-y-6">
        {/* Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-forest-100 dark:bg-forest-900 border border-gold-500/40 text-gold-700 dark:text-gold-500 flex items-center justify-center text-3xl mx-auto shadow-sm">
          ⚖
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground font-display">
            We couldn’t find that page
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            The link may be broken or the page may have moved. Head home, or ask the chatbot what you were looking for.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span>Go to the home page</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full sm:w-auto border-border">
            <Link href="/chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Ask the chatbot</span>
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-6 border-t border-border">
          <p className="text-sm font-semibold text-foreground mb-3">
            Or jump to a tool
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
              Find Legal Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
