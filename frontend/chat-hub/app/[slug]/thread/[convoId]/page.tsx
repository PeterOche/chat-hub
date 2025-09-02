import { ThreadView } from "@/components/thread-view"
import { notFound } from "next/navigation"

// Fetch manager profile for display (thread access is handled client-side)
async function getManagerProfile(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  const res = await fetch(`${baseUrl}/users/${slug}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  })

  if (!res.ok) return null
  return res.json()
}

interface PageProps {
  params: { slug: string; convoId: string }
  searchParams: { token?: string }
}

export default async function ThreadPage({ params, searchParams }: PageProps) {
  const profile = await getManagerProfile(params.slug)
  if (!profile) notFound()

  const conversation = {
    id: params.convoId,
    managerSlug: params.slug,
    managerName: profile.name || params.slug,
    createdAt: profile.createdAt || new Date().toISOString(),
  }

  return (
    <div className="min-h-screen bg-background">
      <ThreadView
        conversation={conversation}
        managerSlug={params.slug}
        convoId={params.convoId}
        resumeToken={searchParams.token}
      />
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const profile = await getManagerProfile(params.slug)

  return {
    title: profile ? `Conversation with ${profile.name} | Chat Hub` : "Conversation Not Found",
  }
}
