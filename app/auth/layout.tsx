import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Sign In & Sign Up",
  description:
    "Sign in or register your citizen account on BharatLegal to track cases and manage legal document simplification history.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
