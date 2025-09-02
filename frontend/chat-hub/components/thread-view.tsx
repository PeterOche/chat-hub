"use client"
import { useThread, useVisitorReply } from "@/hooks/use-messages"
import { Loader2 } from "lucide-react"
import { EnhancedThreadView } from "./messaging/enhanced-thread-view"
import { Button } from "@/components/ui/button"

interface Conversation {
  id: string
  managerSlug: string
  managerName: string
  createdAt: string
}

interface ThreadViewProps {
  conversation: Conversation
  managerSlug: string
  convoId: string
  resumeToken?: string
}

export function ThreadView({ conversation, managerSlug, convoId, resumeToken }: ThreadViewProps) {
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useThread(managerSlug, convoId, resumeToken)
  const { mutate: sendReply, isPending } = useVisitorReply()

  const handleSendMessage = (message: string, attachments?: File[]) => {
    sendReply({
      managerSlug,
      convoId,
      message,
      resumeToken,
    })
  }

  const handleBack = () => {
    window.history.back()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    )
  }

  // Flatten paginated data into a single messages array (backend shape: { messages: [{ sender, content, timestamp }] })
  const pages = data?.pages ?? []
  const rawMessages: any[] = pages.flatMap((page: any) => (Array.isArray(page) ? page : page?.messages ?? []))

  // Map to UI message shape with stable keys and ISO timestamps
  const mappedMessages = rawMessages.map((m: any, idx: number) => {
    const ts = m?.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString()
    const isMgr = m?.sender === "manager"
    return {
      id: String(m?._id || `${ts}-${idx}`),
      content: String(m?.content ?? ""),
      createdAt: ts,
      isFromManager: isMgr,
      senderName: isMgr ? conversation.managerName : "You",
      senderAvatar: undefined,
      status: undefined,
      attachments: [],
    }
  })

  // Transform data for EnhancedThreadView
  const enhancedConversation = {
    id: convoId,
    visitorName: "You",
    visitorEmail: "",
    managerName: conversation.managerName,
    createdAt: conversation.createdAt,
    unreadCount: 0,
    messages: mappedMessages || [],
  }

  return (
    <div className="container mx-auto px-4 py-6 h-screen">
      {hasNextPage && (
        <div className="flex justify-center mb-3">
          <Button variant="outline" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? (
              <span className="inline-flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading…</span>
            ) : (
              "Load older messages"
            )}
          </Button>
        </div>
      )}
      <EnhancedThreadView
        conversation={enhancedConversation}
        currentUserId="visitor"
        isManager={false}
        onSendMessage={handleSendMessage}
        onBack={handleBack}
        isLoading={isPending}
      />
    </div>
  )
}
