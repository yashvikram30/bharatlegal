import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Tracker",
  description:
    "Organize and monitor Indian court proceedings, CNR numbers, next hearing dates, judicial milestones, and order timelines in a unified citizen dashboard.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
