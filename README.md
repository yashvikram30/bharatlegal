# BharatLegal (भारत लीगल)
### ⚖️ Demystifying the Indian Justice System for Every Citizen

BharatLegal is an open-source, AI-powered civic technology platform built to make Indian law accessible, intelligible, and actionable for all citizens. Grounded in contemporary Indian statutory frameworks — including the **Bharatiya Nyaya Sanhita (BNS)**, **BNSS / CrPC**, and the **Consumer Protection Act, 2019** — BharatLegal bridges the divide between archaic legal jargon and fundamental citizen awareness.

---

## ✨ Core Capabilities

### 1. 🤖 AI Legal Chatbot (`/chat`)
- Natural-language legal Q&A grounded specifically in the Indian judicial and statutory system.
- Powered by high-throughput LLaMA / GPT-OSS inference on **Groq Cloud**.
- Instant legal context with citation grounding across criminal, civil, consumer, and constitutional matters.

### 2. 📋 Case Tracker & Citizen Dashboard (`/dashboard`)
- Centralized tracking for ongoing litigation across District Courts, High Courts, and the Supreme Court.
- Monitor CNR numbers, court venues, hearing dates, and counsel notes.
- Secure, authenticated user records stored in MongoDB.

### 3. ⚖️ Legal Rights Visualizer (`/rights`)
- Interactive, plain-language breakdown of fundamental legal rights across 5 core civic categories:
  - **Arrest & Police Custody** (Articles 20-22, Section 50 CrPC, DK Basu Guidelines)
  - **Property & Tenancy** (Transfer of Property Act, Model Tenancy Act)
  - **Consumer Protection** (Consumer Protection Act, 2019 — refund, deficient service, unfair trade)
  - **Employment & Labor** (Industrial Disputes Act, Maternity Benefit Act)
  - **Family & Domestic Protection** (DV Act 2005, Maintenance under Section 125 CrPC)
- One-click provision copying and native mobile sharing.

### 4. 📄 Document Simplifier (`/simplify`)
- Upload legal contracts, lease deeds, employment terms, or notices (PDF, DOCX, TXT up to 10MB).
- In-memory parsing with zero raw-document retention commitments on servers.
- Generates plain-language summaries, identifies high-risk indemnity/arbitration clauses, and flags critical compliance deadlines.

### 5. 🏛️ Free Legal Aid & Helpline Directory (`/help`)
- Direct access to National Legal Services Authority (**NALSA**), State Legal Services Authorities (**SLSA**), and District Legal Services Authorities (**DLSA**).
- Verified toll-free legal emergency helplines: **15100** (NALSA Tele-Law), **1091** (Women Helpline), **1930** (Cyber Crime), and **1915** (National Consumer Helpline).

### 6. 📬 Citizen Contact & Feedback (`/contact`)
- Production-grade contact pipeline validated via Zod schemas.
- Saves incoming feedback to MongoDB (`ContactMessageModel`) and dispatches email notifications via Nodemailer SMTP.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language**: TypeScript (strict mode, full end-to-end type safety)
- **Styling**: Tailwind CSS with custom **Forest & Gold** design tokens (`#1A362B`, `#D4AF37`)
- **Typography**: Outfit (Headings) + Inter (Body)
- **Authentication**: NextAuth.js v4 (JWT session strategy, Google OAuth 2.0 + Credentials provider with bcryptjs password hashing)
- **Database**: MongoDB Atlas with Mongoose ODM (includes DNS SRV fallback for resilient connections)
- **AI Inference**: [Groq Cloud SDK](https://groq.com/) (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`)
- **Email Delivery**: Nodemailer with Gmail SMTP
- **Icons & Components**: Lucide React + Radix UI primitives

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** v18+ or **Bun** v1.0+ (recommended for blazing fast local execution)
- **MongoDB Atlas** cluster or a local MongoDB instance
- Free **Groq Cloud API Key** from [console.groq.com](https://console.groq.com/)
- (Optional) **Google Cloud OAuth Credentials** for Google Sign-In

### 1. Clone the Repository
```bash
git clone https://github.com/yashvikram30/bharatlegal.git
cd bharatlegal
```

### 2. Install Dependencies
Using Bun (recommended):
```bash
bun install
```
Or using npm:
```bash
npm install
```

### 3. Configure Environment Variables
Copy the template to `.env`:
```bash
cp .env.example .env
```
Fill in the necessary keys:
```env
# AI Inference
GROQ_API_KEY=gsk_your_groq_api_key

# NextAuth Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_32_character_random_secret

# Google OAuth (optional for credentials-only testing)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# Database
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/bharatlegal?retryWrites=true&w=majority

# Nodemailer Email (optional for contact form notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_16_char_app_password
```

### 4. Run the Development Server
```bash
bun run dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Repository Directory Structure

```
bharatlegal/
├── app/
│   ├── layout.tsx              # Root HTML layout with %s | BharatLegal metadata & font imports
│   ├── page.tsx                # High-conversion landing page & architectural story
│   ├── opengraph-image.tsx     # Dynamic Edge SVG OpenGraph preview image
│   ├── sitemap.ts & robots.ts  # SEO sitemap and crawler policies
│   ├── not-found.tsx           # Custom 404 handler with portal quick links
│   ├── loading.tsx             # Global loading state indicator
│   ├── (auth)/                 # Auth routes (login, register, forgot-password, reset-password)
│   ├── chat/                   # AI Legal Assistant route
│   ├── dashboard/              # Case tracker & user dashboard
│   ├── rights/                 # Legal Rights Visualizer
│   ├── simplify/               # Document Simplifier
│   ├── help/                   # Legal Aid Directory & helplines
│   ├── about/                  # Mission narrative, architecture, & roadmap
│   ├── contact/                # Feedback & support page
│   ├── privacy/ & terms/       # Legal disclosures & zero-retention privacy policy
│   └── api/                    # Route Handlers (/api/chat, /api/auth, /api/contact, /api/sign-up)
├── components/
│   ├── navbar.tsx              # Header with responsive navigation drawer & theme switcher
│   ├── footer.tsx              # Footer with statutory disclaimer & official links
│   ├── legal-resources-sidebar # Persistent drawer menu for portal tools
│   ├── ui/                     # Accessible UI components (buttons, dialogs, tabs, inputs)
│   └── auth/                   # Authentication forms and social login buttons
├── lib/
│   ├── dbConnect.ts            # Resilient Mongoose connection with public DNS fallbacks
│   └── utils.ts                # Tailwind class merge utilities (clsx + tailwind-merge)
└── model/
    ├── User.ts                 # User model (bcrypt password, Google provider IDs)
    ├── Case.ts                 # Case tracking schema
    ├── ContactMessage.ts       # Contact submissions schema
    └── DocumentAnalysis.ts     # Document simplification analysis schema
```

---

## ⚖️ Statutory Legal Disclaimer

> [!IMPORTANT]
> **BharatLegal is an educational and informational civic technology platform powered by Artificial Intelligence.**
>
> 1. Outputs, analyses, chatbot dialogues, and statutory summaries generated by BharatLegal do **not** constitute formal legal advice, an official legal opinion, or legal representation.
> 2. Use of this platform does **not** establish an advocate-client relationship under the *Advocates Act, 1961* or any State Bar Council regulation in the Republic of India.
> 3. For binding legal representation, case filings, or court appearances, citizens are advised to consult an enrolled advocate or reach out to the National Legal Services Authority (NALSA) at helpline **15100**.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
