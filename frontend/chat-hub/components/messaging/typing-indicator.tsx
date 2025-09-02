"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TypingIndicatorProps {
  senderName: string
  senderAvatar?: string
}

export function TypingIndicator({ senderName, senderAvatar }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <Avatar className="h-6 w-6">
        <AvatarImage src={senderAvatar || "/placeholder.svg"} />
        <AvatarFallback className="text-xs">
          {senderName
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>

      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <span>{senderName} is typing</span>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  )
}
