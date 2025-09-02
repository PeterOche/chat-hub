"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { getCurrentUser, getAuthToken, removeAuthToken, setAuthToken } from "@/lib/auth"

interface User {
  userId: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = () => {
      const storedToken = getAuthToken()
      const currentUser = getCurrentUser()

      if (storedToken && currentUser) {
        setTokenState(storedToken)
        setUser({
          userId: currentUser.userId,
          email: currentUser.email,
        })
      }

      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = (newToken: string) => {
    setAuthToken(newToken)
    setTokenState(newToken)

    const userData = getCurrentUser()
    if (userData) {
      setUser({
        userId: userData.userId,
        email: userData.email,
      })
    }
  }

  const logout = () => {
    removeAuthToken()
    setTokenState(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
