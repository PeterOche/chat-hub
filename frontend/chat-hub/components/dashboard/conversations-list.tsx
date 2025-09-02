"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useConversations } from "@/hooks/use-manager-api"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, MoreHorizontal, Archive, ExternalLink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ConversationsList() {
  const { data: conversations, isLoading } = useConversations()
  const convoList: any[] = Array.isArray(conversations)
    ? conversations
    : Array.isArray((conversations as any)?.items)
      ? (conversations as any).items
      : []
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
            <div className="animate-pulse">
              <div className="h-10 w-10 bg-muted rounded-full"></div>
            </div>
            <div className="flex-1 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (convoList.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No conversations yet</h3>
        <p className="text-muted-foreground mb-4">When visitors send you messages, they'll appear here.</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/settings">
            <ExternalLink className="h-4 w-4 mr-2" />
            Share Your Profile
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {convoList.map((conversation: any, i: number) => {
        const conversationId =
          conversation?.convoId ??
          conversation?.id ??
          conversation?.conversationId ??
          conversation?._id ??
          conversation?.slug ??
          conversation?.visitorId ??
          null
        return (
        <div
          key={String(
            conversation?.convoId ??
              conversation?.id ??
              conversation?.conversationId ??
              conversation?._id ??
              conversation?.slug ??
              conversation?.visitorId ??
              `${conversation?.visitorEmail ?? "item"}-${i}`,
          )}
          className={`flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors ${
            conversation.unreadCount > 0 ? "bg-accent/10 border-accent/20" : ""
          }`}
        >
          {/* Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.visitorInfo?.avatar || conversation.visitorAvatar || "/placeholder.svg"} />
            <AvatarFallback>
              {(conversation.visitorInfo?.name || conversation.visitorName || "?")
                .split(" ")
                .map((n: string) => n[0])
                .join("") || "?"}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground truncate">{conversation.visitorInfo?.name || conversation.visitorName || "Anonymous"}</h4>
                {conversation.unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {conversation.lastMessageAt ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true }) : ""}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">{conversation.lastSnippet || conversation.lastMessage}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {conversationId ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/thread/${conversationId}`}>View</Link>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" disabled title="Missing conversation id">
                View
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        )
      })}
    </div>
  )
}
