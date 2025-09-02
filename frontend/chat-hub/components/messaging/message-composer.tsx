"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Paperclip, Smile, X, File, ImageIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Attachment {
  id: string
  file: File
  preview?: string
  type: "image" | "file"
}

interface MessageComposerProps {
  onSend: (message: string, attachments?: File[]) => void
  placeholder?: string
  disabled?: boolean
  showAttachments?: boolean
  maxLength?: number
  className?: string
}

export function MessageComposer({
  onSend,
  placeholder = "Type your message...",
  disabled = false,
  showAttachments = true,
  maxLength = 1000,
  className,
}: MessageComposerProps) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && attachments.length === 0) return

    const files = attachments.map((att) => att.file)
    onSend(message.trim(), files.length > 0 ? files : undefined)

    // Reset form
    setMessage("")
    setAttachments([])
    setIsTyping(false)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessage(value)
    setIsTyping(value.length > 0)

    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach((file) => {
      const attachment: Attachment = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: file.type.startsWith("image/") ? "image" : "file",
      }

      // Create preview for images
      if (attachment.type === "image") {
        const reader = new FileReader()
        reader.onload = (e) => {
          attachment.preview = e.target?.result as string
          setAttachments((prev) => [...prev, attachment])
        }
        reader.readAsDataURL(file)
      } else {
        setAttachments((prev) => [...prev, attachment])
      }
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id))
  }

  const canSend = (message.trim().length > 0 || attachments.length > 0) && !disabled

  return (
    <Card className={cn("border-0 shadow-none", className)}>
      <CardContent className="p-4 space-y-3">
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="relative group">
                <div className="flex items-center gap-2 bg-muted rounded-lg p-2 pr-8">
                  {attachment.type === "image" ? (
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      {attachment.preview && (
                        <img
                          src={attachment.preview || "/placeholder.svg"}
                          alt="Preview"
                          className="h-8 w-8 object-cover rounded"
                        />
                      )}
                    </div>
                  ) : (
                    <File className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm truncate max-w-[100px]">{attachment.file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeAttachment(attachment.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Message input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              className="min-h-[44px] max-h-[120px] resize-none pr-12"
              rows={1}
            />

            {/* Character count */}
            {maxLength && (
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {message.length}/{maxLength}
              </div>
            )}
          </div>

          {/* Actions bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* File attachment */}
              {showAttachments && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Emoji picker placeholder */}
              <Button type="button" variant="ghost" size="sm" disabled={disabled}>
                <Smile className="h-4 w-4" />
              </Button>
            </div>

            {/* Send button */}
            <Button type="submit" size="sm" disabled={!canSend}>
              {disabled ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
