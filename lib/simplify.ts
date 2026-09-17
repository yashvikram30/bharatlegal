/**
 * Client and server-compatible legal contract simplification utilities
 */

export interface RiskyClause {
  clauseTitle: string;
  clauseText: string;
  riskLevel: "critical" | "high" | "medium" | "low";
  explanation: string;
  recommendation: string;
  statutoryReference?: string;
  actSlug?: string;
  section?: string;
}

export interface StatutoryReference {
  act: string;
  section: string;
  title: string;
  relevance: string;
  actSlug?: string;
}

export interface StructuredAnalysis {
  documentCategory: string;
  parties: string[];
  riskScore: number;
  executiveSummary: string;
  keyObligations: string[];
  riskyClauses: RiskyClause[];
  statutoryReferences: StatutoryReference[];
  actionChecklist: string[];
  simplifiedText: string;
}

/**
 * Format a structured contract analysis into clean Markdown
 */
export function formatAnalysisToMarkdown(analysis: StructuredAnalysis, fileName = "Document"): string {
  let md = `# Legal Contract Audit: ${fileName}\n\n`;
  md += `**Classification:** ${analysis.documentCategory}\n`;
  md += `**Risk Score:** ${analysis.riskScore}/100\n\n`;

  md += `## 📌 Executive Summary\n${analysis.executiveSummary}\n\n`;

  if (analysis.parties?.length) {
    md += `## 👥 Parties Identified\n`;
    analysis.parties.forEach((p) => {
      md += `- ${p}\n`;
    });
    md += `\n`;
  }

  if (analysis.keyObligations?.length) {
    md += `## 📋 Key Obligations & Timelines\n`;
    analysis.keyObligations.forEach((o, i) => {
      md += `${i + 1}. ${o}\n`;
    });
    md += `\n`;
  }

  if (analysis.riskyClauses?.length) {
    md += `## ⚠️ Flagged Risky Clauses\n`;
    analysis.riskyClauses.forEach((c) => {
      md += `### [${c.riskLevel.toUpperCase()} RISK] ${c.clauseTitle}\n`;
      md += `> "${c.clauseText}"\n\n`;
      md += `- **Why It's Risky:** ${c.explanation}\n`;
      md += `- **Recommended Safeguard:** ${c.recommendation}\n`;
      if (c.statutoryReference) {
        md += `- **Governing Statute:** ${c.statutoryReference}\n`;
      }
      md += `\n`;
    });
  }

  if (analysis.statutoryReferences?.length) {
    md += `## ⚖️ Indian Statutory Cross-References\n`;
    analysis.statutoryReferences.forEach((s) => {
      md += `- **${s.act} Section ${s.section}** (${s.title}): ${s.relevance}\n`;
    });
    md += `\n`;
  }

  if (analysis.actionChecklist?.length) {
    md += `## ✅ Pre-Signing Action Checklist\n`;
    analysis.actionChecklist.forEach((item) => {
      md += `- [ ] ${item}\n`;
    });
    md += `\n`;
  }

  md += `---\n*BharatLegal provides educational statutory intelligence and contract simplification; it does not constitute formal legal counsel.*\n`;

  return md;
}

/**
 * Backwards-compatible local text simplification
 */
export async function simplifyTextLocally(originalText: string): Promise<string> {
  if (!originalText || originalText.trim().length === 0) {
    return "No content was found in the document to simplify.";
  }

  const isLease = /lease|tenant|rent|lessor/i.test(originalText);
  const isEmployment = /employment|employee|non-compete|probation/i.test(originalText);

  if (isLease) {
    return `# Residential Lease Agreement Summary

## Document Classification
**Category:** Real Estate Law
**Type:** Residential Tenancy Agreement

## Overview
This document specifies terms for residential leasing, rent payments, security deposits, and maintenance liabilities.

## Key Provisions & Warnings
- **Unconditional Deposit Forfeiture:** Check early lock-in penalties. Under Section 74 Indian Contract Act, punitive forfeitures exceeding actual damages are unlawful.
- **Landlord Access:** Model Tenancy Act mandates 24 hours prior written notice before landlord inspections.
- **Repairs:** Major structural and water seepage repairs are landlord obligations under Transfer of Property Act Section 108.`;
  }

  if (isEmployment) {
    return `# Employment Agreement Summary

## Document Classification
**Category:** Contract & Labor Law
**Type:** Employment Agreement

## Overview
This document outlines job responsibilities, compensation, notice periods, and post-employment restrictions.

## Key Provisions & Warnings
- **Post-Employment Non-Compete:** Restricting an employee from joining a competitor post-exit is void in India under Section 27, Indian Contract Act, 1872.
- **Notice Period Buyout:** Cannot demand excessive punitive damages beyond actual unserved notice duration.
- **Gratuity:** Statutory right after 5 continuous years under Payment of Gratuity Act, 1972.`;
  }

  return `# Legal Document Summary

## Overview
General legal agreement detailing mutual covenants, liabilities, and dispute resolution.

## Recommendation
Review indemnity clauses, dispute resolution venue, and termination notice requirements prior to signing.`;
}