"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormCardHeader, PageShell } from "@/components/page";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("/api/auth/forgot-password", { email });
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "We couldn’t send the reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell width="form">
      <Card>
        <FormCardHeader title="Forgot your password?" description="Enter your email and we’ll send you a reset link." />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="h-10 w-full font-medium">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
                  Sending…
                </>
              ) : (
                "Send reset link"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Remembered it?{" "}
              <Link href="/auth" className="font-semibold text-forest-800 hover:underline dark:text-gold-500">
                Back to sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  );
}
