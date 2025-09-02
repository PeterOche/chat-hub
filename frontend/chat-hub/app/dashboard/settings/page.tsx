"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeEditor } from "@/components/theme/theme-editor"
import { ThemePreview } from "@/components/theme/theme-preview"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useUpdateTheme } from "@/hooks/use-theme-api"
import { Settings, User, Palette, Bell, Shield, ExternalLink } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user } = useAuth()
  const updateTheme = useUpdateTheme()
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    title: "Senior Product Manager",
    bio: "Passionate about building products that make a difference. I love connecting with people and exploring new opportunities.",
    avatar: "/professional-woman-headshot.png",
    slug: user?.email?.split("@")[0] || "",
    isActive: true,
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    messageAlerts: true,
    weeklyDigest: false,
  })

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showLastSeen: true,
    allowDirectMessages: true,
  })

  const handleProfileSave = () => {
    // API call would go here
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    })
  }

  const handleThemeSave = (theme: any) => {
    updateTheme.mutate(theme, {
      onSuccess: () => {
        toast({
          title: "Theme saved",
          description: "Your custom theme has been applied to your profile.",
        })
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to save theme. Please try again.",
          variant: "destructive",
        })
      },
    })
  }

  const handleNotificationsSave = () => {
    // API call would go here
    toast({
      title: "Preferences saved",
      description: "Your notification preferences have been updated.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold font-[family-name:var(--font-playfair)]">Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profileData.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {profileData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      Change Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG up to 2MB</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="title">Professional Title</Label>
                    <Input
                      id="title"
                      value={profileData.title}
                      onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Profile URL</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">chathub.com/</span>
                      <Input
                        id="slug"
                        value={profileData.slug}
                        onChange={(e) => setProfileData({ ...profileData, slug: e.target.value })}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="active">Available for Messages</Label>
                      <p className="text-sm text-muted-foreground">Show as available to receive new messages</p>
                    </div>
                    <Switch
                      id="active"
                      checked={profileData.isActive}
                      onCheckedChange={(checked) => setProfileData({ ...profileData, isActive: checked })}
                    />
                  </div>
                </div>

                <Button onClick={handleProfileSave} className="w-full">
                  Save Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profileData.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {profileData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold font-[family-name:var(--font-playfair)]">{profileData.name}</h3>
                      <p className="text-muted-foreground">{profileData.title}</p>
                      {profileData.isActive && <Badge variant="secondary">Available</Badge>}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{profileData.bio}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="theme" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ThemeEditor onSave={handleThemeSave} />
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <ThemePreview />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email alerts for new messages</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get instant notifications on your device</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="message-alerts">Message Alerts</Label>
                    <p className="text-sm text-muted-foreground">Sound alerts for new messages</p>
                  </div>
                  <Switch
                    id="message-alerts"
                    checked={notifications.messageAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, messageAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-digest">Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">Weekly summary of your conversations</p>
                  </div>
                  <Switch
                    id="weekly-digest"
                    checked={notifications.weeklyDigest}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyDigest: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleNotificationsSave} className="w-full">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profile-visible">Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">Make your profile visible to visitors</p>
                  </div>
                  <Switch
                    id="profile-visible"
                    checked={privacy.profileVisible}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, profileVisible: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-last-seen">Show Last Seen</Label>
                    <p className="text-sm text-muted-foreground">Display when you were last active</p>
                  </div>
                  <Switch
                    id="show-last-seen"
                    checked={privacy.showLastSeen}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, showLastSeen: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow-direct-messages">Allow Direct Messages</Label>
                    <p className="text-sm text-muted-foreground">Let visitors send you messages directly</p>
                  </div>
                  <Switch
                    id="allow-direct-messages"
                    checked={privacy.allowDirectMessages}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, allowDirectMessages: checked })}
                  />
                </div>
              </div>

              <Button className="w-full">Save Privacy Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
