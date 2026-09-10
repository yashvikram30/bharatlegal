'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"
import axios from "axios"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post("/api/auth/forgot-password", { email })
      toast.success(response.data.message)
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="my-24 flex items-center justify-center px-4 sm:px-6 lg:px-8 ">
      <Card className="w-full max-w-md flex flex-col gap-6">
        <CardHeader className="flex flex-col items-center ">
          <CardTitle className="text-2xl">Forgot your password?</CardTitle>
          <CardDescription>Enter your email and we'll send you a reset link.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
              <CardFooter className="text-xs flex items-right justify-center text-muted-foreground">
                Don’t have an account?{' '}
                <Link href="/auth" className="text-forest-800 dark:text-gold-500 font-semibold ml-1 hover:underline">
                  Create one
                </Link>
              </CardFooter>
            </div>

          </form>
        </CardContent>


      </Card>
    </div>
  )
}
