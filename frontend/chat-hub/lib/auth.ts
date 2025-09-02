import { jwtDecode } from "jwt-decode"

interface JWTPayload {
  userId: string
  email: string
  exp: number
}

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") return
  localStorage.setItem("auth_token", token)
}

export const removeAuthToken = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_token")
}

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwtDecode<JWTPayload>(token)
  } catch {
    return null
  }
}

export const isTokenValid = (token: string): boolean => {
  const decoded = decodeToken(token)
  if (!decoded) return false

  const currentTime = Date.now() / 1000
  return decoded.exp > currentTime
}

export const getCurrentUser = (): JWTPayload | null => {
  const token = getAuthToken()
  if (!token || !isTokenValid(token)) return null
  return decodeToken(token)
}
