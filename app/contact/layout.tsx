import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Legal Research Feedback",
  description:
    "Reach out to the BharatLegal team with legal research feedback, statutory citation corrections, technical support, or partnership inquiries.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
