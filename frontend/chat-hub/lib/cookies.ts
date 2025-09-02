"use client"

// Utility functions for managing visitor cookies
export function getVisitorId(): string | null {
  if (typeof document === "undefined") return null

  const cookies = document.cookie.split(";")
  const visitorCookie = cookies.find((cookie) => cookie.trim().startsWith("visitorId="))

  return visitorCookie ? visitorCookie.split("=")[1] : null
}

export function setVisitorId(visitorId: string): void {
  if (typeof document === "undefined") return

  // Set cookie for 30 days
  const expires = new Date()
  expires.setDate(expires.getDate() + 30)

  document.cookie = `visitorId=${visitorId}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`
}

export function generateVisitorId(): string {
  return "visitor_" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}
