
**1. Branding & meta fixes**
- Remove/replace v0.dev generator meta tag
- Custom favicon, OG image, proper meta description/title
- Real Privacy Policy, Terms, About, Contact pages (even if brief)
- Fix or remove dead social links

**2. UI/UX overhaul**
- Move off default v0/shadcn look — distinct visual identity (custom color palette, typography, not generic AI-SaaS template)
- Consistent design system across all pages (spacing, components, empty/loading/error states)
- Mobile responsiveness pass
- Replace placeholder testimonials with real project narrative (e.g. "why I built this") instead of fake social proof

**3. Core feature rebuild**
- **Chatbot** → add RAG over real IPC/CrPC/consumer law docs, with citations; add tool-calling to query case status
- **Document Simplifier** → real LLM-based structured output (summary, risky clauses, plain-language rewrite), support PDF/TXT/DOCX
- **Case Tracker** → real DB-backed CRUD tied to authenticated user, status states, timestamps
- **Rights Visualizer** → keep (already solid), maybe add search-by-scenario ("landlord not returning deposit" → relevant rights)
- **Find Legal Help** → real data source if feasible (scraped/curated directory) or clearly labeled as a curated static directory

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