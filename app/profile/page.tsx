'use client'

import { useSession } from 'next-auth/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    console.log('Session data:', session?.user)
  }, [session])

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <span className="text-muted-foreground">Loading profile...</span>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="my-24 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md flex flex-col gap-6 text-center border-border bg-card">
          <CardHeader className="flex flex-col items-center">
            <CardTitle className="text-2xl font-heading font-bold text-foreground">You are not signed in</CardTitle>
            <CardDescription className="text-muted-foreground">Please sign in to view your profile.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 w-full">
              <Link href="/auth">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="my-24 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md flex flex-col gap-6 border-border bg-card shadow-rest-card">
        <CardHeader>
          <CardTitle className="text-2xl font-heading font-bold text-foreground">Your Profile</CardTitle>
          <CardDescription className="text-muted-foreground">View your account details</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-sm sm:text-base">
          <div className="flex gap-2">
            <span className="font-semibold text-muted-foreground">Username: </span>
            <span className="text-foreground font-medium">{session.user.name || '-'}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-muted-foreground">Email: </span>
            <span className="text-foreground font-medium">{session.user.email || '-'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
