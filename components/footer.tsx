import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-forest-950 text-forest-50 border-t border-forest-900 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {/* Exactly 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 1. Brand Column */}
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-heading font-extrabold text-xl text-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded"
            >
              <span className="w-8 h-8 rounded-lg bg-forest-800 text-white flex items-center justify-center text-sm font-bold border border-gold-500/60 shadow-sm">
                ⚖
              </span>
              <span className="tracking-tight">
                Bharat<span className="text-gold-500">Legal</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-forest-100/75 leading-relaxed">
              Demystifying Indian law with plain-language AI, verified statutory citations, and court timeline tracking.
            </p>
            <p className="text-[11px] text-forest-100/60 leading-normal pt-1 border-t border-forest-900/80">
              Educational legal resource only; not formal legal counsel under the Advocates Act, 1961.
            </p>
          </div>

          {/* 2. Product Column (5 core features) */}
          <div>
            <h3 className="text-xs font-bold text-forest-50 font-heading mb-3 tracking-wider uppercase">
              Product
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/chat"
                  className="text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  AI Legal Chatbot
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  Case Tracker
                </Link>
              </li>
              <li>
                <Link
                  href="/rights"
                  className="text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  Rights Visualizer
                </Link>
              </li>
              <li>
                <Link
                  href="/simplify"
                  className="text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  Document Simplifier
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  Find Legal Help
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Company Column */}
          <div>
            <h3 className="text-xs font-bold text-forest-50 font-heading mb-3 tracking-wider uppercase">
              Company
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-forest-100/75 hover:text-gold-500 transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Resources Column (Government portals + GitHub) */}
          <div>
            <h3 className="text-xs font-bold text-forest-50 font-heading mb-3 tracking-wider uppercase">
              Resources
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a
                  href="https://nalsa.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-forest-100/75 hover:text-gold-500 transition-colors inline-flex items-center gap-1"
                >
                  NALSA <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="https://ecourts.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-forest-100/75 hover:text-gold-500 transition-colors inline-flex items-center gap-1"
                >
                  eCourts <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="https://rtionline.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-forest-100/75 hover:text-gold-500 transition-colors inline-flex items-center gap-1"
                >
                  RTI Online <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="https://consumerhelpline.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-forest-100/75 hover:text-gold-500 transition-colors inline-flex items-center gap-1"
                >
                  Consumer Helpline <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/yashvikram30/bharatlegal"
                  target="_blank"
                  rel="noreferrer"
                  className="text-forest-100/75 hover:text-gold-500 transition-colors inline-flex items-center gap-1"
                >
                  GitHub Repository <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 5. Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-forest-900 space-y-2 text-center sm:text-left">
          <p className="text-xs text-forest-100/70">
            © {new Date().getFullYear()} BharatLegal. Built for Indian Legal Literacy & Empowerment.
          </p>
          <p className="text-[11px] text-forest-100/50 leading-relaxed max-w-4xl">
            BharatLegal is an independent educational initiative and does not provide formal legal counsel or create an advocate-client relationship under the Advocates Act, 1961. Consult an enrolled advocate or your District Legal Services Authority (DLSA) for actionable legal representation.
          </p>
        </div>
      </div>
    </footer>
  );
}
