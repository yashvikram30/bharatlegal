import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Free Legal Help",
  description:
    "Directory of verified State and District Legal Services Authorities (SLSA / DLSA), Supreme Court committees, and consumer forums providing free legal aid across India.",
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
