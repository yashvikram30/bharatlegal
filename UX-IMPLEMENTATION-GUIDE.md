# BharatLegal UI/UX Implementation Guide

## Product north star

**BharatLegal helps a person under legal stress understand their position and take the safest useful next step in under five minutes.**

This is not a cosmetic redesign. The interface should turn fragmented information (a notice, a hearing date, a contract clause, or a worrying event) into an understandable, saved, actionable plan.

### Experience principles

1. **Start with the problem, not the tool.** A visitor thinks “my landlord has not returned my deposit,” not “I need a document simplifier.”
2. **Always state the next action.** Legal information without an action, deadline, evidence list, or escalation route is incomplete.
3. **Use calm clarity.** Reserve urgency colours and motion for actual deadlines, danger, and changes in case status.
4. **Earn trust visibly.** Identify sources, jurisdiction/state limitations, uncertainty, and the boundary between information and legal representation.
5. **Design for a phone in a stressful moment.** Critical flows must work one-handed, in plain language, and with no account required until saving is useful.

---

## Priority roadmap

| Priority | Change | User outcome | Primary surfaces |
| --- | --- | --- | --- |
| P0 | Guided issue intake and action-plan answers | A user knows where to begin and what to do | Home, chat, floating assistant |
| P0 | Legal answer/action card format | Answers become usable, not just informative | Chat, quick consultation drawer |
| P0 | Correct sample/stale state and trust copy | The product feels current and credible | Dashboard, claims, legal-aid content |
| P1 | Unified Matter workspace | Documents, conversations, case events, and tasks stay together | New `/matters/[id]`, dashboard |
| P1 | Clause-anchored document review | Users can see exactly what is risky and what to change | Simplifier |
| P1 | Next-action-first case tracker | Users prepare for hearings instead of merely viewing history | Dashboard |
| P2 | Emergency and multilingual rights guide | A person can use their rights in a live situation | Rights |
| P2 | Eligibility-led legal-aid journey | Users reach appropriate help with less searching | Help |
| P2 | Visual-system consolidation | More hierarchy, less repeated card chrome | All routes |

---

## P0 — Build first

### 1. Guided issue intake

Replace the homepage’s feature-first entry with a clear prompt: **“What happened?”**

Use six primary issue cards:

- I received a notice or legal message
- Police contacted or stopped me
- My landlord/employer/merchant is refusing something
- I need to understand a contract before signing
- I have a court case or hearing
- I need free legal help

After selection, ask a maximum of three plain-language questions: issue type, state/city where relevant, and time sensitivity. End by generating an initial Action Plan and opening a focused chat with the context attached.

**Do not require sign-in.** Ask a user to sign in only when they choose to save the plan, document, or Matter.

**Implementation**

- Add `components/intake/issue-intake.tsx` and a short data-driven question schema.
- Add `components/action-plan/action-plan-card.tsx` for a reusable result across chat, rights, documents, and cases.
- Route the selected intent and answers into `/chat` via query/session state.
- Retain the existing services as secondary “Explore tools” navigation below the main fold.

**Acceptance criteria**

- A first-time mobile visitor can reach a relevant action plan in three taps before typing.
- Every intake route has an escalation route for imminent harm or deadlines.
- The home page has one unambiguous primary CTA.

### 2. Action-plan answer format

Change the chat result UI to render structured output, even if the model still streams Markdown underneath.

Every legal response should show, in this order:

1. **Short answer** — maximum two sentences in plain language.
2. **Do this next** — three ordered steps with a completion state.
3. **Time sensitivity** — a deadline, “no known statutory deadline,” or “seek help now.”
4. **Keep these records** — documents, messages, photos, receipts, names, or case papers.
5. **Law and limits** — citation chips linked to the existing citation sheet, plus jurisdiction/state applicability.
6. **Get help / continue** — relevant legal-aid, drafting, document-review, or case-tracking action.

Add visible uncertainty language where it matters: “This can vary by state,” “Based on the facts you shared,” or “Confirm with an enrolled advocate before filing.”

**Implementation**

- Define a shared `LegalActionPlan` TypeScript type.
- Update the chat response contract to request predictable sections; retain a graceful Markdown fallback.
- Build buttons for `Save to Matter`, `Draft a message`, `Create a checklist`, and `Find legal aid`.
- Make the citation sheet accessible from all structured citation references.

**Acceptance criteria**

- No substantive answer ends without a next step or a clear reason why no action is needed.
- Citation labels work as controls, not only decorative text.
- A user can save an answer without copying it manually.

### 3. Trust and freshness pass

Fix credibility issues before increasing acquisition.

- Mark demo cases as **Sample data**, or update/remove past hearing dates. Current dashboard samples use 2024 hearing dates.
- Make zero-retention language precise: distinguish raw-file retention from saved analysis/history.
- Replace language that implies representation (for example, “Instant Legal Counsel”) with “Legal information” or “Legal guidance.”
- Display state/jurisdiction applicability on tenancy, rent, labour, and court process guidance.
- Create a content-verification owner/process for helpline numbers, authority details, laws, and date-sensitive service listings.

**Acceptance criteria**

- Users can identify sample data immediately.
- Privacy claims match actual data handling.
- High-stakes responses include the informational-service boundary and escalation option.

---

## P1 — Make the product cohesive

### 4. Matter workspace

A **Matter** represents one real-world problem, such as “Deposit recovery for Greenview apartment” or “Consumer refund from merchant.” It is the system’s primary organizing object.

#### Matter overview layout

```
Matter title + status                         [Ask AI] [Add document]
Next best action: Send deposit demand         Due in 6 days
────────────────────────────────────────────────────────────────────────
Action checklist        Timeline             Evidence
□ Send notice           • 10 Sep: keys...    4 files • 2 photos
□ Save handover proof   • 14 Sep: reply...   [Add evidence]
□ Contact DLSA
────────────────────────────────────────────────────────────────────────
AI guidance             Documents            People / legal aid
```

Each Matter holds:

- action checklist and deadlines
- chat conversations and saved answers
- documents/analysis and clause issues
- case or court timeline entries
- evidence and notes
- counterparties, authorities, and legal-aid contacts

**Implementation**

- Add Matter schema/model and API routes.
- Add `matterId` relations to conversations, analyses, and cases gradually; do not force a migration before launch.
- Use the existing dashboard as the initial “My matters” index, with Cases as one filtered view.
- Provide “Save to Matter” in chat, Rights, Simplifier, and Help.

**Acceptance criteria**

- A user can find every relevant artifact for one issue from one screen.
- Adding an artifact never makes a user re-enter known context.
- A Matter always has a current status and next action.

### 5. Document simplifier: clause review room

Convert the result from a report into an annotated review experience.

#### Desktop

- Left: document text/PDF with highlighted clause anchors.
- Right: severity-filtered issue rail.
- Selecting an issue scrolls to and highlights its source clause.
- A detail panel explains: **meaning**, **real-life impact**, **enforceability/caveat**, **safer wording**, and **what to ask for**.

#### Mobile

- Present issue cards first, then open the source clause in a bottom sheet.
- Keep a persistent “3 issues need attention” summary; never make a user pan two columns.

Add output actions: `Prepare negotiation points`, `Draft a message to the other party`, `Save to Matter`, and `Share summary`.

**Acceptance criteria**

- Clicking a risk always reveals the underlying exact wording.
- “Risk score” never appears without a human-readable explanation and recommended action.
- An analysis creates a reusable plan rather than a dead-end report.

### 6. Case tracker: lead with preparation

The dashboard’s default top section should be **Next 7 days**, not a generic case grid.

For each active case show:

- hearing countdown and exact local date/time
- what happened last (order summary / status)
- what to prepare next
- documents or steps outstanding
- a clear status: on track, attention needed, or delayed

The existing timeline can remain as the detailed history. Do not synthesize court history as factual unless it is labelled as a user-created estimate or is sourced from official case data.

**Acceptance criteria**

- A returning user can identify the most urgent case action in under ten seconds.
- Sample and official data are visually distinct.
- A hearing has a preparation checklist, not just a date.

---

## P2 — Differentiate BharatLegal

### 7. Rights Visualizer: field guide mode

Add an emergency-friendly mode for police interaction, eviction/lockout, domestic safety, and workplace concerns.

- Prominent `I need help now` entry.
- A single-screen **Say this / Do this / Do not do this** card.
- Language toggle at the top (Hindi first, then supported regional languages).
- Large tap targets, high contrast, and copy/share/save controls.
- Offer an offline-safe printable card only after legal copy is verified.

### 8. Legal-aid journey

Make Help an eligibility and handoff workflow instead of a searchable directory alone.

1. Ask state, issue, urgency, and eligibility indicators.
2. Explain likely eligibility in simple terms, with a statutory source.
3. Return the most relevant official service, phone/website, what to carry, and office hours.
4. Let users save the contact/action to a Matter.

Use a map only if its data coverage is comprehensive and maintained; a precise list is more trustworthy than a sparse map.

---

## Visual system rules

Keep the existing forest/gold identity, but use it with more discipline.

| Token/use | Rule |
| --- | --- |
| Forest | Primary navigation, trusted primary action, completed/progress states |
| Gold | Statutory authority, focus, and high-value decisions; never every CTA |
| Amber/red | Actual deadline, safety concern, or potentially harmful clause only |
| Neutral/cream | Reading, ordinary information, and background surfaces |
| Cards | Use only to group a decision or coherent task; avoid card-per-paragraph layouts |
| Motion | Confirm a change or guide spatial transition; no ambient/pulsing motion except active urgent state |

### Page hierarchy

- One primary action per viewport.
- Replace repeated eyebrow badge + huge heading + paragraph patterns with content-specific hierarchy.
- Prefer labels that describe a user outcome (“Prepare for hearing”) over internal feature labels (“Case Tracker”).
- Keep body text at comfortable reading size and line length; legal excerpts should be collapsible, never the default visual focus.
- Make the floating AI trigger contextual. It should suggest a specific action on relevant pages and stay visually quiet otherwise.

---

## Reusable components to create

- `IssueIntake` — intent cards and branching questions
- `ActionPlanCard` — summary, steps, deadline, evidence, citations, actions
- `MatterPicker` — create/select a Matter without a full-page detour
- `UrgencyBadge` — calm, attention, urgent; never inferred solely from model prose
- `SourceCitation` — compact linked citation with act, section, last-verified date
- `EvidenceChecklist` — attached files/notes and proof prompts
- `NextActionPanel` — case/Matter readiness and countdown
- `ClauseIssueCard` — source anchor, impact, risk, recommendation, draft action
- `OfficialServiceCard` — verified authority metadata, handoff, and verification date

All components must work in light/dark mode, at 320px width, by keyboard, and with visible focus states.

---

## Measurement plan

Instrument only privacy-respecting product events. Track outcomes, not legal-content text.

| Metric | Target signal |
| --- | --- |
| Time from landing to first useful action | Decreases after intake launch |
| Intake completion rate | Visitors understand where to start |
| Action-plan save/completion rate | Guidance translates into progress |
| Document issue click-through | Users inspect source clauses |
| Matter creation and return rate | Product has ongoing utility |
| Legal-aid handoff click rate | People can reach real support |
| “Was this helpful?” by response type | Quality feedback without collecting sensitive case details |

Avoid recording raw legal questions, uploaded content, or personally identifying case facts in analytics.

---

## QA checklist before shipping a flow

- Does the first screen tell the person what they can do right now?
- Does every recommendation state the deadline, evidence, and escalation path when applicable?
- Is this applicable throughout India, or does it depend on a state/court/factual condition?
- Can a user complete the key flow on a narrow mobile screen without hover?
- Can keyboard and screen-reader users operate it?
- Is a model-generated claim visibly separated from an official source or known fact?
- Is the legal-information disclaimer present without interrupting the user’s immediate action?
- Is sample, estimated, or stale data unmistakably labelled?

## Suggested implementation sequence

1. Ship trust/freshness fixes and the structured Action Plan response component.
2. Build the homepage Issue Intake and connect it to chat.
3. Add Matter creation and “Save to Matter” integrations.
4. Rework Simplifier into anchored clause review.
5. Reorient Dashboard around next actions and hearing preparation.
6. Add Rights field-guide mode and legal-aid eligibility flow.

This order delivers an immediate quality leap while each later step builds on a shared action-plan and Matter model.
