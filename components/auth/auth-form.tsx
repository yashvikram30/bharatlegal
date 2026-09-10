"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, Scale } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiResponse } from "@/types/ApiResponse";
import Image from "next/image";

export function AuthForm() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: emailOrUsername,
        password,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          toast.error("Invalid credentials. Please verify your email and password.");
        } else {
          toast.error(result.error || "Authentication failed.");
        }
      } else if (result?.ok) {
        toast.success("Welcome back to BharatLegal!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("SignIn error:", err);
      toast.error("There was a problem signing in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post<ApiResponse>("/api/sign-up", {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      toast.success(response.data.message || "Account created successfully!");

      // Automatically sign in the newly registered user
      const signInResult = await signIn("credentials", {
        redirect: false,
        identifier: email.trim().toLowerCase(),
        password,
        callbackUrl: "/dashboard",
      });

      if (signInResult?.ok) {
        toast.success("Welcome to BharatLegal!");
        router.push("/dashboard");
        router.refresh();
      } else {
        // Fallback: switch to sign in tab
        setActiveTab("signin");
        setEmailOrUsername(email);
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;
      toast.error(errorMessage ?? "There was a problem creating your account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-border bg-card shadow-rest-card">
      <CardHeader className="text-center space-y-2 pb-4">
        <div className="w-10 h-10 rounded-xl bg-forest-800 dark:bg-forest-950 text-white flex items-center justify-center text-lg font-bold border border-gold-500/50 mx-auto">
          ⚖
        </div>
        <CardTitle className="text-2xl font-extrabold text-foreground font-heading">
          Welcome to BharatLegal
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
          Sign in to track court cases, analyze documents, and save legal notes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "signin" | "signup")}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-forest-100 dark:bg-forest-800">
            <TabsTrigger value="signin" className="text-xs font-semibold">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="text-xs font-semibold">
              Create Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="emailOrUsername" className="text-xs font-semibold">
                  Email or Username
                </Label>
                <Input
                  id="emailOrUsername"
                  type="text"
                  placeholder="your.email@example.com or username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="bg-background border-border focus-visible:ring-2 focus-visible:ring-gold-700"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password" className="text-xs font-semibold">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-gold-700 dark:text-gold-500 hover:underline font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background border-border focus-visible:ring-2 focus-visible:ring-gold-700 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="py-2 text-xs">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-forest-800 text-white hover:bg-forest-950 dark:bg-gold-500 dark:text-forest-950 dark:hover:bg-gold-500/90 font-medium h-10 focus-visible:ring-2 focus-visible:ring-gold-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <span className="relative bg-card px-2 text-[11px] text-muted-foreground uppercase">
                  Or Continue With
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-10 flex items-center justify-center gap-2 border-border bg-background hover:bg-forest-100/50 dark:hover:bg-forest-800/40 text-xs font-semibold"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              >
                <Image src="/google.svg" alt="Google" width={16} height={16} />
                Google Authentication
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signup-username" className="text-xs font-semibold">
                  Username
                </Label>
                <Input
                  id="signup-username"
                  type="text"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background border-border focus-visible:ring-2 focus-visible:ring-gold-700"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border focus-visible:ring-2 focus-visible:ring-gold-700"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-password" className="text-xs font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background border-border focus-visible:ring-2 focus-visible:ring-gold-700 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="py-2 text-xs">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-forest-800 text-white hover:bg-forest-950 dark:bg-gold-500 dark:text-forest-950 dark:hover:bg-gold-500/90 font-medium h-10 focus-visible:ring-2 focus-visible:ring-gold-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Free Account"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-center text-muted-foreground justify-center border-t border-border pt-3 pb-4">
        <span>
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-gold-700 dark:text-gold-500 hover:underline font-medium">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-gold-700 dark:text-gold-500 hover:underline font-medium">
            Privacy Policy
          </Link>
          .
        </span>
      </CardFooter>
    </Card>
  );
}
