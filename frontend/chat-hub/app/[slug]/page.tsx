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
  return data
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
    title: `${profile.slug} | Chat Hub`,
    description: profile.bio || `Connect with ${profile.slug}`,
  }
}
