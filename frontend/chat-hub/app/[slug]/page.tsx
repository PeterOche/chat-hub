import { notFound } from "next/navigation"
import ProfileClientPage from "./ProfileClientPage"

// Server-side fetch for manager profile
async function getManagerProfile(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  const res = await fetch(`${baseUrl}/users/${slug}`, {
    // Avoid caching to reflect latest theme/profile
    cache: "no-store",
    headers: {
      "Accept": "application/json",
    },
  })

  if (!res.ok) {
    return null
  }

  const data = await res.json()
  // Map backend fields to the shape expected by ProfileClientPage/ProfileHeader
  return {
    id: data.id ?? "",
    slug: data.slug,
    name: (data.name as string | undefined) || data.slug || "",
    title: (data.title as string | undefined) || "",
    bio: (data.bio as string | undefined) || "",
    avatar: (data.photoUrl as string | undefined) || "",
    theme: {
      primary: (data.theme?.primary as string | undefined) || "oklch(0.588 0.15 162.145)",
      secondary: (data.theme?.secondary as string | undefined) || "oklch(0.708 0.15 162.145)",
      background: (data.theme?.background as string | undefined) || "oklch(1 0 0)",
      foreground: (data.theme?.foreground as string | undefined) || "oklch(0.556 0.014 258.338)",
    },
    isActive: true,
  }
}

interface PageProps {
  params: { slug: string }
}

export default async function ProfilePage({ params }: PageProps) {
  const profile = await getManagerProfile(params.slug)

  if (!profile) {
    notFound()
  }

  return <ProfileClientPage params={params} profile={profile} />
}

export async function generateMetadata({ params }: PageProps) {
  const profile = await getManagerProfile(params.slug)

  if (!profile) {
    return {
      title: "Profile Not Found",
    }
  }

  return {
    title: `${profile.name || profile.slug} | Chat Hub`,
    description: profile.bio || `Connect with ${profile.name || profile.slug}`,
  }
}
