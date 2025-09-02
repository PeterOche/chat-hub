import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export interface ThemeSettings {
  primary: string
  secondary: string
  background: string
  foreground: string
  accent?: string
  muted?: string
}

export interface ThemePreset {
  id: string
  name: string
  description: string
  theme: ThemeSettings
}

// Predefined theme presets
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "emerald",
    name: "Emerald Professional",
    description: "Clean and professional with emerald accents",
    theme: {
      primary: "oklch(0.588 0.15 162.145)",
      secondary: "oklch(0.708 0.15 162.145)",
      background: "oklch(1 0 0)",
      foreground: "oklch(0.556 0.014 258.338)",
    },
  },
  {
    id: "blue",
    name: "Ocean Blue",
    description: "Trustworthy and calming blue theme",
    theme: {
      primary: "oklch(0.588 0.15 220)",
      secondary: "oklch(0.708 0.15 220)",
      background: "oklch(1 0 0)",
      foreground: "oklch(0.556 0.014 258.338)",
    },
  },
  {
    id: "purple",
    name: "Royal Purple",
    description: "Creative and sophisticated purple theme",
    theme: {
      primary: "oklch(0.588 0.15 280)",
      secondary: "oklch(0.708 0.15 280)",
      background: "oklch(1 0 0)",
      foreground: "oklch(0.556 0.014 258.338)",
    },
  },
  {
    id: "orange",
    name: "Warm Orange",
    description: "Energetic and friendly orange theme",
    theme: {
      primary: "oklch(0.588 0.15 40)",
      secondary: "oklch(0.708 0.15 40)",
      background: "oklch(1 0 0)",
      foreground: "oklch(0.556 0.014 258.338)",
    },
  },
]

export function useManagerTheme() {
  return useQuery({
    queryKey: ["manager-theme"],
    queryFn: async () => {
      const response = await apiClient.get("/api/manager/theme")
      return response.data as ThemeSettings
    },
  })
}

export function useUpdateTheme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (theme: ThemeSettings) => {
      const response = await apiClient.put("/api/manager/theme", theme)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-theme"] })
      queryClient.invalidateQueries({ queryKey: ["manager-profile"] })
    },
  })
}

export function usePreviewTheme() {
  const applyTheme = (theme: ThemeSettings) => {
    const root = document.documentElement
    root.style.setProperty("--primary", theme.primary)
    root.style.setProperty("--secondary", theme.secondary)
    root.style.setProperty("--background", theme.background)
    root.style.setProperty("--foreground", theme.foreground)
    root.style.setProperty("--accent", theme.accent || theme.primary)
    root.style.setProperty("--muted", theme.muted || theme.secondary)
  }

  const resetTheme = () => {
    const root = document.documentElement
    root.style.removeProperty("--primary")
    root.style.removeProperty("--secondary")
    root.style.removeProperty("--background")
    root.style.removeProperty("--foreground")
    root.style.removeProperty("--accent")
    root.style.removeProperty("--muted")
  }

  return { applyTheme, resetTheme }
}
