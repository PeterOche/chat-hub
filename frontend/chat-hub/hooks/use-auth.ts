"use client"

import { useMutation } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { AxiosError } from "axios"

interface LoginData {
  email: string
  password: string
}

interface SignupData {
  name: string
  email: string
  password: string
  title?: string
  bio?: string
  slug: string
}

interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    slug: string
  }
}

export function useLogin() {
  return useMutation<AuthResponse, Error, LoginData>({
    mutationFn: async (data) => {
      try {
        const response = await apiClient.post("/auth/login", data)
        return response.data
      } catch (e) {
        const err = e as AxiosError<any>
        const msg = (err.response?.data as any)?.message || err.message || "Login failed. Please try again."
        throw new Error(msg)
      }
    },
  })
}

export function useSignup() {
  return useMutation<AuthResponse, Error, SignupData>({
    mutationFn: async (data) => {
      try {
        const response = await apiClient.post("/auth/signup", data)
        return response.data
      } catch (e) {
        const err = e as AxiosError<any>
        const msg = (err.response?.data as any)?.message || err.message || "Signup failed. Please try again."
        throw new Error(msg)
      }
    },
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      // In a real app, you might want to call a logout endpoint
      // to invalidate the token on the server
      return Promise.resolve()
    },
  })
}
