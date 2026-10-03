"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormCardHeader, PageShell } from "@/components/page";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <PageShell width="form">
        <div className="h-48 animate-pulse rounded-2xl border border-border bg-card/60 motion-reduce:animate-none" aria-label="Loading your profile" />
      </PageShell>
    );
  }

  if (!session?.user) {
    return (
      <PageShell width="form">
        <Card>
          <FormCardHeader title="You’re not signed in" description="Sign in to see your profile." />
          <CardContent>
            <Button asChild className="h-10 w-full font-medium">
              <Link href="/auth">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell width="form">
      <Card>
        <FormCardHeader title="Your profile" description="The details on your account." />
        <CardContent>
          <dl className="divide-y divide-border text-sm">
            <div className="flex justify-between gap-4 py-3">
              <dt className="font-semibold text-muted-foreground">Username</dt>
              <dd className="font-medium text-foreground">{session.user.username || session.user.name || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="font-semibold text-muted-foreground">Email</dt>
              <dd className="break-all font-medium text-foreground">{session.user.email || "-"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </PageShell>
  );
}
