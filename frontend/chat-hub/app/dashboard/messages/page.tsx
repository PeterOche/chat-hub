"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConversationsList } from "@/components/dashboard/conversations-list"
import { MessageSquare } from "lucide-react"

export default function MessagesPage() {
  // Reuse the shared ConversationsList component so data mapping and UI stay consistent

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6" />
        <h1 className="text-3xl font-bold font-[family-name:var(--font-playfair)]">Messages</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <ConversationsList />
        </CardContent>
      </Card>
    </div>
  )
}
