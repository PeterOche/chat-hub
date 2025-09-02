import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface Profile {
  id: string
  slug: string
  name: string
  title: string
  bio: string
  avatar: string
  isActive: boolean
}

interface ProfileHeaderProps {
  profile: Profile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const displayName = ((profile?.name && profile.name.trim()) || profile.slug || "").trim()
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2) || "?"

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={displayName || "Profile avatar"} />
              <AvatarFallback className="text-2xl font-semibold">{initials}</AvatarFallback>
            </Avatar>
            {profile.isActive && (
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-2 border-background rounded-full"></div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground font-[family-name:var(--font-playfair)]">
                {displayName || "Anonymous"}
              </h1>
              {profile.isActive && (
                <Badge variant="secondary" className="w-fit">
                  Available
                </Badge>
              )}
            </div>

            <p className="text-xl text-muted-foreground mb-4 font-medium">{profile.title || ""}</p>

            <p className="text-foreground leading-relaxed max-w-2xl text-pretty">{profile.bio || ""}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
