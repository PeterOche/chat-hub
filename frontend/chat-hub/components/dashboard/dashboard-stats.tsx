"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useConversations } from "@/hooks/use-manager-api"
import { MessageSquare, Users, TrendingUp, Clock } from "lucide-react"

export function DashboardStats() {
  const { data: conversations, isLoading } = useConversations()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const convoList: any[] = Array.isArray(conversations)
    ? conversations
    : Array.isArray((conversations as any)?.items)
      ? (conversations as any).items
      : []
  const totalConversations = convoList.length
  const unreadCount = convoList.reduce((total: number, conv: any) => total + (conv?.unreadCount || 0), 0)
  const activeToday = convoList.filter((conv: any) => {
    const today = new Date().toDateString()
    return new Date(conv.lastMessageAt).toDateString() === today
  }).length

  const stats = [
    {
      title: "Total Conversations",
      value: totalConversations,
      icon: MessageSquare,
      description: "All time conversations",
    },
    {
      title: "Unread Messages",
      value: unreadCount,
      icon: Users,
      description: "Pending responses",
    },
    {
      title: "Active Today",
      value: activeToday,
      icon: TrendingUp,
      description: "Conversations today",
    },
    {
      title: "Response Time",
      value: "< 2h",
      icon: Clock,
      description: "Average response",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
