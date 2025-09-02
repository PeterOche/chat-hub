"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useConversations } from "@/hooks/use-manager-api"
import { Bell, ExternalLink } from "lucide-react"
import Link from "next/link"

export function DashboardHeader() {
  const { user } = useAuth()
  const { data: conversations } = useConversations()
  const convoList: any[] = Array.isArray(conversations)
    ? conversations
    : Array.isArray((conversations as any)?.items)
      ? (conversations as any).items
      : []
  const unreadCount = convoList.reduce((total: number, conv: any) => total + (conv?.unreadCount || 0), 0)

  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
        </div>

        <div className="flex items-center gap-4">
          {/* Profile Link */}
          {user && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${user.email.split("@")[0]}`} target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Profile
              </Link>
            </Button>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
