'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SidebarContent } from './Sidebar'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/session': 'Session',
  '/progress': 'Progress',
  '/profile': 'Profile',
  '/admin': 'Analytics',
  '/admin/poses': 'Manage Poses',
}

export function Navbar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const title =
    Object.entries(pageTitles).find(([path]) => pathname.startsWith(path))?.[1] ??
    'YogaTracker'

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'YT'

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b-2 border-primary/20 bg-white px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        <h1 className="text-lg font-extrabold tracking-tight text-text-brand md:text-2xl">
          <span className="md:hidden font-extrabold text-primary">YogaTracker</span>
          <span className="hidden md:inline">{title}</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5 text-text-muted" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.avatar_url ?? undefined} alt={user?.name} />
          <AvatarFallback className="bg-primary-pale text-primary text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
