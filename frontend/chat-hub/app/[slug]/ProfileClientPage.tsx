"use client"

import { ProfileHeader } from "@/components/profile-header"
import { MessageForm } from "@/components/message-form"
import { Card } from "@/components/ui/card"
import { useEffect } from "react"

interface Profile {
  id: string
  slug: string
  name: string
  title: string
  bio: string
  avatar: string
  theme: {
    primary: string
    secondary: string
    background: string
    foreground: string
  }
  isActive: boolean
}

interface PageProps {
  params: { slug: string }
  profile: Profile
}

export default function ProfileClientPage({ params, profile }: PageProps) {
  useEffect(() => {
    if (profile?.theme) {
      const root = document.documentElement
      root.style.setProperty("--primary", profile.theme.primary || "oklch(0.588 0.15 162.145)")
      root.style.setProperty("--secondary", profile.theme.secondary || "oklch(0.708 0.15 162.145)")
      root.style.setProperty("--background", profile.theme.background || "oklch(1 0 0)")
      root.style.setProperty("--foreground", profile.theme.foreground || "oklch(0.556 0.014 258.338)")

      // Additional theme properties for better customization
      root.style.setProperty("--accent", profile.theme.primary || "oklch(0.588 0.15 162.145)")
      root.style.setProperty("--muted", profile.theme.secondary || "oklch(0.708 0.15 162.145)")
    }

    // Cleanup function to reset theme on unmount
    return () => {
      const root = document.documentElement
      root.style.removeProperty("--primary")
      root.style.removeProperty("--secondary")
      root.style.removeProperty("--background")
      root.style.removeProperty("--foreground")
      root.style.removeProperty("--accent")
      root.style.removeProperty("--muted")
    }
  }, [profile?.theme])

  if (!profile) {
    return <div>Profile not found</div>
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <ProfileHeader profile={profile} />

        {/* Message Form Section */}
        <div className="mt-12">
          <Card className="p-8 border-primary/20 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2 font-[family-name:var(--font-playfair)]">
                Send a Message
              </h2>
              <p className="text-muted-foreground">
                Get in touch with {profile.name} directly. You'll receive a link to continue the conversation.
              </p>
            </div>

            <MessageForm managerSlug={profile.slug} />
          </Card>
        </div>
      </div>
    </div>
  )
}
