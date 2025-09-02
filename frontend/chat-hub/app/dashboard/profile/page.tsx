"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useConversations } from "@/hooks/use-manager-api"
import { User, ExternalLink, MessageSquare, Clock, Star, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { user } = useAuth()
  const { data: conversations } = useConversations()

  const convoList: any[] = Array.isArray(conversations)
    ? conversations
    : Array.isArray((conversations as any)?.items)
      ? (conversations as any).items
      : []

  const displayName = ((user as any)?.name as string | undefined) || user?.email?.split("@")[0] || "Sarah Johnson"

  const profileData = {
    name: displayName,
    title: "Senior Product Manager",
    bio: "Passionate about building products that make a difference. I love connecting with people and exploring new opportunities.",
    avatar: "/professional-woman-headshot.png",
    slug: user?.email?.split("@")[0] || "sarah-johnson",
    isActive: true,
  }

  const stats = {
    totalMessages: convoList.reduce((total: number, conv: any) => total + (conv?.messageCount || 0), 0),
    totalConversations: convoList.length,
    responseTime: "2.5 hours",
    rating: 4.9,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6" />
          <h1 className="text-3xl font-bold font-[family-name:var(--font-playfair)]">My Profile</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/${profileData.slug}`} target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Public Profile
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/settings">Edit Profile</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileData.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {profileData.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {profileData.isActive && (
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-2 border-background rounded-full"></div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)]">{profileData.name}</h2>
                  {profileData.isActive && <Badge variant="secondary">Available</Badge>}
                </div>
                <p className="text-lg text-muted-foreground mb-3">{profileData.title}</p>
                <p className="text-foreground leading-relaxed">{profileData.bio}</p>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Your Profile URL:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-background px-2 py-1 rounded">chathub.com/{profileData.slug}</code>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${profileData.slug}`} target="_blank">
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{stats.totalMessages}</p>
                <p className="text-sm text-muted-foreground">Total Messages</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="font-semibold">{stats.totalConversations}</p>
                <p className="text-sm text-muted-foreground">Conversations</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold">{stats.responseTime}</p>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold">{stats.rating}/5.0</p>
                <p className="text-sm text-muted-foreground">Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {convoList.slice(0, 5).map((conv: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {conv.visitorName
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "V"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{conv.visitorName || "Anonymous Visitor"}</p>
                    <p className="text-xs text-muted-foreground">{conv.lastMessage || "New conversation"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{conv.updatedAt || "Just now"}</p>
                  {(Number(conv.unreadCount) || 0) > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            )) || <p className="text-center text-muted-foreground py-8">No recent conversations</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
