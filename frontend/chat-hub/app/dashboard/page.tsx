"use client"

import { ConversationsList } from "@/components/dashboard/conversations-list"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-playfair)]">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your conversations and track your engagement</p>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Conversations */}
      <Card>
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-playfair)]">Recent Conversations</CardTitle>
          <CardDescription>Your latest messages and ongoing conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <ConversationsList />
        </CardContent>
      </Card>
    </div>
  )
}
