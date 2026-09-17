import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Rights Visualizer | BharatLegal",
  description:
    "Interactive procedural roadmaps, actionable citizen scripts, and 2024 statutory concordance (CrPC ➔ BNSS, IPC ➔ BNS) for real-world legal situations in India.",
};

export default function RightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
