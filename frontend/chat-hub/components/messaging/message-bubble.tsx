"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Copy, MoreHorizontal, Reply, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  createdAt: string
  isFromManager: boolean
  senderName?: string
  senderAvatar?: string
  status?: "sending" | "sent" | "delivered" | "read"
  attachments?: Array<{
    id: string
    name: string
    url: string
    type: string
    size: number
  }>
}

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
  onCopy?: (content: string) => void
  onDelete?: (messageId: string) => void
  onReply?: (message: Message) => void
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  showTimestamp = true,
  onCopy,
  onDelete,
  onReply,
}: MessageBubbleProps) {
  const handleCopy = () => {
    if (onCopy) {
      onCopy(message.content)
    } else {
      navigator.clipboard.writeText(message.content)
    }
  }

  return (
    <div className={cn("flex gap-3 group", isOwn ? "justify-end" : "justify-start")}>
      {/* Avatar for other person's messages */}
      {!isOwn && showAvatar && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={message.senderAvatar || "/placeholder.svg"} />
          <AvatarFallback className="text-xs">
            {message.senderName
              ?.split(" ")
              .map((n) => n[0])
              .join("") || "?"}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col max-w-[70%]", isOwn && "items-end")}>
        {/* Message bubble */}
        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 shadow-sm",
            isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md",
          )}
        >
          {/* Message content */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border",
                    isOwn ? "bg-primary-foreground/10" : "bg-background/50",
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{attachment.name}</p>
                    <p className="text-xs opacity-70">{(attachment.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Message actions menu */}
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-background shadow-sm">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </DropdownMenuItem>
                {onReply && (
                  <DropdownMenuItem onClick={() => onReply(message)}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                )}
                {onDelete && isOwn && (
                  <DropdownMenuItem onClick={() => onDelete(message.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Timestamp and status */}
        {showTimestamp && (
          <div className={cn("flex items-center gap-2 mt-1 px-1", isOwn ? "justify-end" : "justify-start")}>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </span>
            {isOwn && message.status && (
              <Badge variant={message.status === "read" ? "default" : "secondary"} className="text-xs h-4 px-1">
                {message.status}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Spacer for own messages to maintain alignment */}
      {isOwn && showAvatar && <div className="w-8" />}
    </div>
  )
}
