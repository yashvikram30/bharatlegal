import Link from "next/link";
import { Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-forest-950 text-forest-50 border-t border-forest-900 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-heading font-extrabold text-xl text-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded"
            >
              <span className="w-8 h-8 rounded-lg bg-forest-800 text-white flex items-center justify-center text-sm font-bold border border-gold-500/60">
                ⚖
              </span>
              <span>
                Legal<span className="text-gold-500">Ease</span>
              </span>
            </Link>
            <p className="text-sm text-forest-100/70 leading-relaxed">
              Demystifying the Indian justice system through AI-powered plain language assistance, statutory grounding, and case tracking.
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <Link
                href="https://github.com/yashvikram30/legalease"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-md bg-forest-800/80 hover:bg-forest-800 flex items-center justify-center text-forest-100 hover:text-gold-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                aria-label="GitHub Repository"
              >
                <Github className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="w-8 h-8 rounded-md bg-forest-800/80 hover:bg-forest-800 flex items-center justify-center text-forest-100 hover:text-gold-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                aria-label="Email Contact"
              >
                <Mail className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Features Col */}
          <div>
            <h3 className="text-sm font-semibold text-forest-50 font-heading mb-4 tracking-wider uppercase">
              Core Platform
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/chat"
                  className="text-sm text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  AI Legal Assistant
                </Link>
              </li>
              <li>
                <Link
                  href="/simplify"
                  className="text-sm text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  Document Simplifier
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  Case Tracker
                </Link>
              </li>
              <li>
                <Link
                  href="/rights"
                  className="text-sm text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  Rights Visualizer
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-sm text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  Find Legal Aid (DLSA)
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Resources Col */}
          <div>
            <h3 className="text-sm font-semibold text-forest-50 font-heading mb-4 tracking-wider uppercase">
              Indian Legal Portals
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="https://nalsa.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  NALSA Free Legal Aid ↗
                </Link>
              </li>
              <li>
                <Link
                  href="https://consumerhelpline.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  National Consumer Helpline ↗
                </Link>
              </li>
              <li>
                <Link
                  href="https://ecourts.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  eCourts India Portal ↗
                </Link>
              </li>
              <li>
                <Link
                  href="https://rtionline.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  RTI Online Portal ↗
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal Col */}
          <div>
            <h3 className="text-sm font-semibold text-forest-50 font-heading mb-4 tracking-wider uppercase">
              LegalEase
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  Contact & Feedback
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  Terms & Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-forest-900 text-center space-y-2">
          <p className="text-xs sm:text-sm text-forest-100/70">
            © {new Date().getFullYear()} LegalEase. Built for Indian Legal Literacy & Empowerment.
          </p>
          <p className="text-xs text-forest-100/50 max-w-3xl mx-auto leading-relaxed">
            Good-Faith Disclaimer: LegalEase is an educational and informational platform powered by AI. It does not provide formal legal advice or create an advocate-client relationship under the Advocates Act, 1961.
          </p>
        </div>
      </div>
    </footer>
  );
}
