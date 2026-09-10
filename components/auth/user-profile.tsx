'use client'

import { useSession, signOut } from 'next-auth/react'
import { LogOut, UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function UserProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' }) // Redirect to home after sign-out
    router.refresh()
  }

  if (status === 'loading') {
    return (
      <Button variant="ghost" size="sm" disabled className="text-xs">
        <UserIcon className="h-4 w-4 mr-1.5 animate-pulse" />
        <span className="hidden sm:inline">Loading...</span>
      </Button>
    )
  }

  if (!session || !session.user) {
    return (
      <Button
        asChild
        size="sm"
        className="bg-forest-800 text-white hover:bg-forest-900 hover:text-white dark:bg-forest-800 dark:text-forest-50 dark:hover:bg-forest-700 dark:hover:text-forest-50 font-semibold text-xs sm:text-sm shadow-none"
      >
        <a href="/auth">Sign In</a>
      </Button>
    )
  }

  const username =
    session.user.username ||
    session.user.name ||
    session.user.email?.split('@')[0] ||
    'Citizen'
  const email = session.user.email || ''
  const image = session.user.image

  // Show up to 2-letter uppercase initials based on username
  const initials =
    username
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 2)
      .toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-forest-950 dark:text-forest-50 hover:bg-forest-100 hover:text-forest-950 dark:hover:bg-forest-800 dark:hover:text-forest-50 transition-colors px-2 py-1 h-9 focus-visible:ring-2 focus-visible:ring-gold-700"
          aria-label={`User menu for ${username}`}
        >
          <Avatar className="h-7 w-7 bg-forest-800 border border-gold-500/40">
            <AvatarImage src={image || ''} alt={username} />
            <AvatarFallback className="bg-forest-800 text-forest-50 text-[11px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs sm:text-sm font-semibold max-w-[130px] truncate hidden md:inline-block">
            {username}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-hover-card">
        <DropdownMenuLabel className="p-2 font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold text-foreground truncate">{username}</p>
            {email && (
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/dashboard" className="cursor-pointer font-medium text-xs py-2">
            Dashboard
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/profile" className="cursor-pointer font-medium text-xs py-2">
            Profile Settings
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive cursor-pointer font-semibold text-xs py-2"
        >
          <LogOut className="h-3.5 w-3.5 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
