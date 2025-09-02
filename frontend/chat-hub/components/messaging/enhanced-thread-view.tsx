"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageBubble } from "./message-bubble"
import { MessageComposer } from "./message-composer"
import { TypingIndicator } from "./typing-indicator"
import { MessageTemplates } from "./message-templates"
import { ArrowLeft, Search, MoreHorizontal, Archive, ExternalLink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

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

interface Conversation {
  id: string
  visitorName: string
  visitorEmail: string
  visitorAvatar?: string
  managerName: string
  managerAvatar?: string
  createdAt: string
  unreadCount: number
  messages: Message[]
}

interface EnhancedThreadViewProps {
  conversation: Conversation
  currentUserId: string
  isManager: boolean
  onSendMessage: (message: string, attachments?: File[]) => void
  onBack: () => void
  onArchive?: () => void
  onCopyLink?: () => void
  isLoading?: boolean
}

export function EnhancedThreadView({
  conversation,
  currentUserId,
  isManager,
  onSendMessage,
  onBack,
  onArchive,
  onCopyLink,
  isLoading = false,
}: EnhancedThreadViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [composerMessage, setComposerMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation.messages])

  // Simulate typing indicator (in real app, this would come from WebSocket)
  useEffect(() => {
    if (!isManager && composerMessage.length > 0) {
      setIsTyping(true)
      const timer = setTimeout(() => setIsTyping(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [composerMessage, isManager])

  const handleSendMessage = (message: string, attachments?: File[]) => {
    onSendMessage(message, attachments)
    setComposerMessage("")
  }

  const handleSelectTemplate = (content: string) => {
    setComposerMessage(content)
  }

  const filteredMessages = searchQuery
    ? conversation.messages.filter((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversation.messages

  const otherPerson = isManager
    ? { name: conversation.visitorName, avatar: conversation.visitorAvatar }
    : { name: conversation.managerName, avatar: conversation.managerAvatar }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <Card className="rounded-b-none border-b-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{otherPerson.name}</CardTitle>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive">{conversation.unreadCount} unread</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isManager ? conversation.visitorEmail : "Manager"} • Started{" "}
                    {new Date(conversation.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowSearch(!showSearch)}>
                <Search className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onCopyLink && (
                    <DropdownMenuItem onClick={onCopyLink}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                  )}
                  {onArchive && (
                    <DropdownMenuItem onClick={onArchive}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search bar */}
          {showSearch && (
            <div className="mt-4">
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="flex-1 rounded-none border-y-0 overflow-hidden">
        <CardContent className="p-0 h-full flex flex-col">
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredMessages.map((message, index) => {
              const isOwn = isManager ? message.isFromManager : !message.isFromManager
              const showAvatar = index === 0 || filteredMessages[index - 1]?.isFromManager !== message.isFromManager

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  showTimestamp={true}
                />
              )
            })}

            {/* Typing indicator */}
            {isTyping && !isManager && (
              <TypingIndicator senderName={conversation.visitorName} senderAvatar={conversation.visitorAvatar} />
            )}

            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Composer */}
      <Card className="rounded-t-none border-t-0">
        <CardContent className="p-4 space-y-3">
          {/* Templates for managers */}
          {isManager && <MessageTemplates onSelectTemplate={handleSelectTemplate} />}

          <MessageComposer
            onSend={handleSendMessage}
            disabled={isLoading}
            placeholder={`Message ${otherPerson.name}...`}
            showAttachments={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
