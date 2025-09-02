"use client"

import { useRouter } from "next/navigation"
import { useConversation, useManagerReply } from "@/hooks/use-manager-api"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { EnhancedThreadView } from "../messaging/enhanced-thread-view"

interface ManagerThreadViewProps {
  convoId: string
}

export function ManagerThreadView({ convoId }: ManagerThreadViewProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { data: conversation, isLoading } = useConversation(convoId)
  const { mutate: sendReply, isPending } = useManagerReply()

  const handleSendMessage = (message: string, attachments?: File[]) => {
    sendReply({
      convoId,
      message,
    })
  }

  const handleBack = () => {
    router.push("/dashboard")
  }

  const handleArchive = () => {
    // TODO: Implement archive functionality
    console.log("Archive conversation:", convoId)
  }

  const handleCopyLink = () => {
    const resumeUrl = `${window.location.origin}/${conversation?.managerSlug}/thread/${convoId}`
    navigator.clipboard.writeText(resumeUrl)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-foreground mb-2">Conversation not found</h3>
        <button onClick={handleBack} className="text-primary hover:underline">
          Go Back
        </button>
      </div>
    )
  }

  // Adapt backend payload to EnhancedThreadView shape
  const uiConversation = {
    id: conversation?.convoId || convoId,
    visitorName: conversation?.visitorInfo?.name || "Anonymous",
    visitorEmail: conversation?.visitorInfo?.email || "",
    visitorAvatar: conversation?.visitorInfo?.avatar || undefined,
    managerName: (user as any)?.name || user?.email || "Manager",
    managerAvatar: undefined,
    createdAt:
      (conversation?.messages && conversation.messages[0]?.timestamp
        ? new Date(conversation.messages[0].timestamp).toISOString()
        : new Date().toISOString()),
    unreadCount: Number(conversation?.unreadCount || 0),
    messages: (conversation?.messages || []).map((m: any, idx: number) => {
      const ts = m?.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString()
      const isMgr = m?.sender === "manager"
      return {
        id: String(m?._id || `${ts}-${idx}`),
        content: String(m?.content ?? ""),
        createdAt: ts,
        isFromManager: isMgr,
        senderName: isMgr ? ((user as any)?.name || user?.email || "Manager") : (conversation?.visitorInfo?.name || "Visitor"),
        senderAvatar: isMgr ? undefined : (conversation?.visitorInfo?.avatar || undefined),
        status: undefined,
        attachments: [],
      }
    }),
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      <EnhancedThreadView
        conversation={uiConversation}
        currentUserId={user?.userId || ""}
        isManager={true}
        onSendMessage={handleSendMessage}
        onBack={handleBack}
        onArchive={handleArchive}
        onCopyLink={handleCopyLink}
        isLoading={isPending}
      />
    </div>
  )
}
