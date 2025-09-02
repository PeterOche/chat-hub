"use client"

import { ManagerThreadView } from "@/components/dashboard/manager-thread-view"
import { useParams } from "next/navigation"

export default function ManagerThreadPage() {
  const params = useParams()
  const convoId = params.convoId as string

  return <ManagerThreadView convoId={convoId} />
}
