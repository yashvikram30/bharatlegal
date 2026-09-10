import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Know Your Rights",
  description:
    "Explore your statutory rights across arrest and detention, tenancy, consumer disputes, and employment law with clear Indian legal citations.",
};

export default function RightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
