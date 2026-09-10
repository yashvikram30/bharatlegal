import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Document Simplifier",
  description:
    "Upload rent agreements, employment contracts, and legal notices to generate plain-language summaries and detect risky clauses with zero raw data retention.",
};

export default function SimplifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
