import Link from "next/link";
import { Scale, Github, Twitter, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-heading font-extrabold text-xl text-foreground">
              <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold border border-amber-500/40">
                ⚖
              </span>
              <span>
                Legal<span className="text-amber-600 dark:text-amber-400">Ease</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Demystifying the Indian justice system through AI-powered plain language assistance, statutory grounding, and case management.
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <Link
                href="https://github.com/yashvikram30/legalease"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label="Email Contact"
              >
                <Mail className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Features Col */}
          <div>
            <h3 className="text-sm font-semibold text-foreground font-heading mb-4">
              Core Platform
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/chat"
                  className="text-sm text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  AI Legal Assistant
                </Link>
              </li>
              <li>
                <Link
                  href="/simplify"
                  className="text-sm text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Document Simplifier
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Case Tracker
                </Link>
              </li>
              <li>
                <Link
                  href="/rights"
                  className="text-sm text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Rights Visualizer
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-sm text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Find Legal Aid (DLSA)
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Resources Col */}
          <div>
            <h3 className="text-sm font-semibold text-foreground font-heading mb-4">
              Indian Legal Resources
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="https://nalsa.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  NALSA Free Legal Aid ↗
                </Link>
              </li>
              <li>
                <Link
                  href="https://consumerhelpline.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  National Consumer Helpline ↗
                </Link>
              </li>
              <li>
                <Link
                  href="https://ecourts.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  eCourts India Portal ↗
                </Link>
              </li>
              <li>
                <Link
                  href="https://rtionline.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  RTI Online Portal ↗
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal Col */}
          <div>
            <h3 className="text-sm font-semibold text-foreground font-heading mb-4">
              LegalEase
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Contact & Feedback
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Terms & Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} LegalEase. Built for Indian Legal Empowerment.
          </p>
          <p className="text-xs text-muted-foreground/80 max-w-3xl mx-auto leading-relaxed">
            Good-Faith Disclaimer: LegalEase is an educational and informational platform powered by AI. It does not provide formal legal advice, attorney representation, or create an advocate-client relationship under the Advocates Act, 1961.
          </p>
        </div>
      </div>
    </footer>
  );
}
