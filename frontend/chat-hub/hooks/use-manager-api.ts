"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/auth-context"
import apiClient from "@/lib/api-client"

// Fetch all conversations for the manager
export function useConversations() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ["conversations", user?.userId],
    queryFn: async () => {
      const response = await apiClient.get("/messages/conversations")
      return response.data
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Fetch a specific conversation
export function useConversation(convoId: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ["conversation", user?.userId, convoId],
    queryFn: async () => {
      const response = await apiClient.get(`/messages/conversations/${convoId}`)
      return response.data
    },
    enabled: !!user && !!convoId && convoId !== "undefined" && convoId !== "null",
  })
}

// Send reply as manager
export function useManagerReply() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: { convoId: string; message: string }) => {
      const response = await apiClient.post(`/messages/reply/${data.convoId}`, {
        content: data.message,
      })
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch conversation data
      queryClient.invalidateQueries({
        queryKey: ["conversation", user?.userId, variables.convoId],
      })
      queryClient.invalidateQueries({
        queryKey: ["conversations", user?.userId],
      })
    },
  })
}

// Update manager profile
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name?: string
      title?: string
      bio?: string
      avatar?: string
      theme?: Record<string, string>
    }) => {
      const response = await apiClient.patch("/users/me", data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })
}
