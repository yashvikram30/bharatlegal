import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Citizen Profile",
  description:
    "View your BharatLegal citizen account credentials, connected authentication providers, and tracked legal matters.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
