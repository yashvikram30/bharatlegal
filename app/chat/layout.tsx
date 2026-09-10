import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Legal Chatbot",
  description:
    "Ask legal questions in plain language and receive explanations grounded in Indian statutes including Bharatiya Nyaya Sanhita (BNS), BNSS/CrPC, and Consumer Protection Act.",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
