
**1. Branding & meta fixes** [COMPLETED]
- [x] Remove/replace v0.dev generator meta tag
- [x] Custom favicon, OG image, proper meta description/title (per-route layouts for /chat, /dashboard, /rights, /simplify, /help, /contact)
- [x] Real Privacy Policy, Terms, About, Contact pages (with live /api/contact delivery & DB persistence)
- [x] Fix or remove dead social links (verified government portals: NALSA, eCourts, RTI, Consumer Helpline)

**2. UI/UX overhaul** [COMPLETED]
- [x] Move off default v0/shadcn look — distinct visual identity (Deep Forest & Gold palette, Inter + Outfit typography)
- [x] Consistent design system across all pages (spacing, components, branded 404 not-found.tsx, error.tsx, loading.tsx, empty & loading states)
- [x] Mobile responsiveness pass (hamburger navigation drawer, responsive grids)
- [x] Replace placeholder testimonials with real project narrative ("Why We Built BharatLegal") and deleted orphaned testimonial-card.tsx

**3. Core feature rebuild (Powered by IndiaCode API & AWS Court Data)**
*(See detailed architecture specification in [docs/phase-3-legal-data-architecture.md](file:///Users/yash/Desktop/legalease/docs/phase-3-legal-data-architecture.md))*
- **Legal RAG Chatbot**
  - [x] Build `lib/legal-api/indiacode.ts` wrapper (2,246 Acts, live bare-acts, IPC ↔ BNS concordance, cached, core-acts fallback)
  - [x] Add LLM Tool-Calling in `/api/chat` (`lookup_statute`, `convert_penal_provision`, `retrieve_precedents`)
  - [x] Citations UI with verified bare act excerpts + `ratio_decidendi` cards (`CitationSheet` drawer)
  - [ ] Landmark Supreme Court precedent queries via DuckDB / AWS Open Data Parquet index
- **Case Tracker & CNR Intelligence**
  - [x] 16-character eCourts CNR schema validation & state/court routing (`lib/courts/cnr.ts`)
  - [x] DB-backed User Case Diary (CRUD, stages, notes, hearing dates, timeline)
  - [x] AWS Open Data PDF resolver for published High Court & Supreme Court orders
  - [x] Provider Adapter interface (`CaseDocketProvider`) with default Diary provider + optional live partner sync stub
- **Document Simplifier**
  - [ ] Real LLM-based structured output (plain summary, risky clauses, recommended actions)
  - [ ] Auto-extract legal sections and link to live IndiaCode bare act provisions + BNS cross-references
  - [ ] Support PDF/TXT/DOCX file upload pipeline
- **Rights Visualizer**
  - [ ] Scenario-to-statute search ("landlord withholding deposit" → Rent Control / Consumer Protection)
  - [ ] Direct statutory citations backed by verified IndiaCode provisions
- **Find Legal Help**
  - [ ] Curated, verified legal aid directory (DLSA/SLSA, NALSA front offices, consumer forums)

**4. New feature (pick 1–2, not all)**
- Legal document generator (rent agreement, complaint draft) from structured form + LLM
- Background jobs (hearing reminders, case status checks) via queue
- Multi-language support (Hindi/English)
- Audit trail — every AI answer shows its source

**5. Infra/engineering maturity**
- Real README (architecture, setup, env vars, what's mocked vs real)
- Mermaid architecture diagram
- Basic tests (API routes at minimum)
- CI via GitHub Actions (lint/test/build on push)
- Proper error handling everywhere (no silent failures)
- Env var consistency (single source of truth, matches .env.example)

**6. Auth & data**
- Confirm NextAuth flows work end-to-end (Google + credentials)
- File storage → S3/R2 instead of in-memory processing
- DB schema cleanup (Case Tracker, Document history, User)

Want to turn this into a phased roadmap (what to build week-by-week), or start scoping one section (e.g. RAG chatbot or the DB schema) in detail?