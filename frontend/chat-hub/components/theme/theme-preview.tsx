"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Send, Star } from "lucide-react"

export function ThemePreview() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/professional-woman-headshot.png" />
            <AvatarFallback>SJ</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg font-[family-name:var(--font-playfair)]">Sarah Johnson</CardTitle>
            <p className="text-sm text-muted-foreground">Senior Product Manager</p>
          </div>
          <Badge variant="secondary">Available</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sample message thread */}
        <div className="space-y-3">
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-lg px-3 py-2 max-w-[80%]">
              <p className="text-sm">Hi! I'd love to discuss a potential collaboration.</p>
              <p className="text-xs text-muted-foreground mt-1">2:30 PM</p>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-[80%]">
              <p className="text-sm">Thanks for reaching out! I'd be happy to chat.</p>
              <p className="text-xs opacity-70 mt-1">2:32 PM</p>
            </div>
          </div>
        </div>

        {/* Sample input */}
        <div className="flex gap-2">
          <Input placeholder="Type your message..." className="flex-1" />
          <Button size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Sample stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary">
              <MessageSquare className="h-4 w-4" />
              <span className="font-semibold">24</span>
            </div>
            <p className="text-xs text-muted-foreground">Messages</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-secondary">
              <Star className="h-4 w-4" />
              <span className="font-semibold">4.9</span>
            </div>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
