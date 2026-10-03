"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FormCardHeader, PageShell } from "@/components/page";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("The two passwords don’t match. Type them again.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "/api/auth/reset-password",
        { token, newPassword: password },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success("Password updated. Sign in with your new password.");
      router.push("/auth");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "We couldn’t reset your password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <PageShell width="form">
        <Card>
          <FormCardHeader
            title="This reset link isn’t valid"
            description="The link is missing or has expired. Request a new one and we’ll email it to you."
          />
          <CardContent>
            <Button asChild className="h-10 w-full font-medium">
              <Link href="/forgot-password">Request a new link</Link>
            </Button>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell width="form">
      <Card>
        <FormCardHeader title="Reset your password" description="Choose a new password for your account." />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold">
                New password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                aria-describedby="password-hint"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background"
                required
              />
              <p id="password-hint" className="text-xs text-muted-foreground">
                Use at least 8 characters.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                Confirm new password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="h-10 w-full font-medium">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
                  Resetting…
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  );
}
