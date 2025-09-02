"use client"

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

// Send initial message to manager
export function useSendMessage() {
  return useMutation({
    mutationFn: async (data: {
      managerSlug: string
      name: string
      email: string
      message: string
    }) => {
      const slug = (data.managerSlug || "").trim()
      if (!slug || slug === "undefined" || slug === "null") {
        throw new Error("Missing or invalid manager identifier. Please reload the page and try again.")
      }
      const response = await apiClient.post(`/messages/${slug}`, {
        content: data.message,
        name: data.name,
        email: data.email,
      })
      return response.data
    },
  })
}

// Fetch thread messages for visitors
export function useThread(managerSlug: string, convoId: string, resumeToken?: string) {
  return useInfiniteQuery({
    queryKey: ["thread", managerSlug, convoId, resumeToken ?? null],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      if (resumeToken) params.append("token", resumeToken)
      if (pageParam) params.append("cursor", String(pageParam))
      if (!params.has("limit")) params.append("limit", "25")

      const response = await apiClient.get(`/messages/${managerSlug}/thread/${convoId}?${params.toString()}`)
      return response.data
    },
    initialPageParam: null as unknown as string | number | null,
    getNextPageParam: (lastPage) => {
      // Support multiple cursor shapes from backend
      const lp = lastPage as unknown as Record<string, unknown>
      const nextCursor = lp && (lp["nextCursor"] || lp["next_before"] || lp["nextBefore"]) as string | number | undefined
      return nextCursor || undefined
    },
    enabled: !!managerSlug && !!convoId,
  })
}

// Send reply as visitor
export function useVisitorReply() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { managerSlug: string; convoId: string; message: string; resumeToken?: string }) => {
      const params = new URLSearchParams()
      if (data.resumeToken) params.append("token", data.resumeToken)
      const response = await apiClient.post(
        `/messages/${data.managerSlug}/thread/${data.convoId}/reply?${params.toString()}`,
        { content: data.message },
      )
      return response.data
    },
    onMutate: async (variables) => {
      const key = ["thread", variables.managerSlug, variables.convoId, variables.resumeToken ?? null]
      await queryClient.cancelQueries({ queryKey: key })

      const previous = queryClient.getQueryData(key) as any

      // Build optimistic message
      const optimistic = {
        id: `temp-${Date.now()}`,
        content: variables.message,
        createdAt: new Date().toISOString(),
        isFromManager: false,
        status: "sending" as const,
      }

      // Update cache: append to last page's messages
      queryClient.setQueryData(key, (old: any) => {
        if (!old) {
          return { pages: [[optimistic]], pageParams: [null] }
        }
        const pages = Array.isArray(old.pages) ? [...old.pages] : []
        if (pages.length === 0) return { pages: [[optimistic]], pageParams: [null] }
        const last = pages[pages.length - 1]
        if (Array.isArray(last)) {
          pages[pages.length - 1] = [...last, optimistic]
        } else if (last && Array.isArray(last.messages)) {
          pages[pages.length - 1] = { ...last, messages: [...last.messages, optimistic] }
        } else {
          pages[pages.length - 1] = [optimistic]
        }
        return { ...old, pages }
      })

      return { previous, key }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous && context?.key) {
        queryClient.setQueryData(context.key, context.previous)
      }
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch to get server-truth
      queryClient.invalidateQueries({
        queryKey: ["thread", variables.managerSlug, variables.convoId, variables.resumeToken ?? null],
      })
    },
  })
}

// Fetch manager profile (public)
export function useManagerProfile(slug: string) {
  return useQuery({
    queryKey: ["profile", slug],
    queryFn: async () => {
      const response = await apiClient.get(`/users/${slug}`)
      return response.data
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
