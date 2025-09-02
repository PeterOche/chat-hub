"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface ThemeConfig {
  primary?: string
  secondary?: string
  background?: string
  foreground?: string
  card?: string
  cardForeground?: string
  muted?: string
  mutedForeground?: string
  accent?: string
  accentForeground?: string
  border?: string
  input?: string
  [key: string]: string | undefined
}

interface ThemePreset {
  id: string
  name: string
  description: string
  theme: ThemeConfig
  category: "professional" | "creative" | "minimal" | "vibrant"
}

interface ThemeContextType {
  theme: ThemeConfig
  setTheme: (theme: ThemeConfig) => void
  applyTheme: (theme: ThemeConfig) => void
  resetTheme: () => void
  presets: ThemePreset[]
  currentPreset: string | null
  setCurrentPreset: (presetId: string | null) => void
  isCustomTheme: boolean
}

const defaultTheme: ThemeConfig = {
  primary: "oklch(0.588 0.15 162.145)",
  secondary: "oklch(0.708 0.15 162.145)",
  background: "oklch(1 0 0)",
  foreground: "oklch(0.556 0.014 258.338)",
  card: "oklch(0.976 0.006 247.858)",
  cardForeground: "oklch(0.556 0.014 258.338)",
  muted: "oklch(0.985 0.002 247.858)",
  mutedForeground: "oklch(0.556 0.014 258.338)",
  accent: "oklch(0.708 0.15 162.145)",
  accentForeground: "oklch(1 0 0)",
  border: "oklch(0.922 0.013 258.338)",
  input: "oklch(0.976 0.006 247.858)",
}

const themePresets: ThemePreset[] = [
  {
    id: "emerald",
    name: "Emerald Professional",
    description: "Clean emerald theme for professional communication",
    category: "professional",
    theme: defaultTheme,
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    description: "Calming blue tones for a trustworthy presence",
    category: "professional",
    theme: {
      primary: "oklch(0.588 0.15 220.145)",
      secondary: "oklch(0.708 0.15 220.145)",
      background: "oklch(1 0 0)",
      foreground: "oklch(0.556 0.014 258.338)",
      card: "oklch(0.976 0.006 247.858)",
      cardForeground: "oklch(0.556 0.014 258.338)",
      muted: "oklch(0.985 0.002 247.858)",
      mutedForeground: "oklch(0.556 0.014 258.338)",
      accent: "oklch(0.708 0.15 220.145)",
      accentForeground: "oklch(1 0 0)",
      border: "oklch(0.922 0.013 258.338)",
      input: "oklch(0.976 0.006 247.858)",
    },
  },
  {
    id: "sunset",
    name: "Sunset Orange",
    description: "Warm and energetic orange theme",
    category: "vibrant",
    theme: {
      primary: "oklch(0.688 0.2 45.145)",
      secondary: "oklch(0.788 0.15 45.145)",
      background: "oklch(1 0 0)",
      foreground: "oklch(0.556 0.014 258.338)",
      card: "oklch(0.976 0.006 247.858)",
      cardForeground: "oklch(0.556 0.014 258.338)",
      muted: "oklch(0.985 0.002 247.858)",
      mutedForeground: "oklch(0.556 0.014 258.338)",
      accent: "oklch(0.788 0.15 45.145)",
      accentForeground: "oklch(1 0 0)",
      border: "oklch(0.922 0.013 258.338)",
      input: "oklch(0.976 0.006 247.858)",
    },
  },
  {
    id: "purple",
    name: "Royal Purple",
    description: "Elegant purple theme for creative professionals",
    category: "creative",
    theme: {
      primary: "oklch(0.588 0.15 280.145)",
      secondary: "oklch(0.708 0.15 280.145)",
      background: "oklch(1 0 0)",
      foreground: "oklch(0.556 0.014 258.338)",
      card: "oklch(0.976 0.006 247.858)",
      cardForeground: "oklch(0.556 0.014 258.338)",
      muted: "oklch(0.985 0.002 247.858)",
      mutedForeground: "oklch(0.556 0.014 258.338)",
      accent: "oklch(0.708 0.15 280.145)",
      accentForeground: "oklch(1 0 0)",
      border: "oklch(0.922 0.013 258.338)",
      input: "oklch(0.976 0.006 247.858)",
    },
  },
  {
    id: "minimal",
    name: "Minimal Gray",
    description: "Clean and minimal grayscale theme",
    category: "minimal",
    theme: {
      primary: "oklch(0.3 0 0)",
      secondary: "oklch(0.5 0 0)",
      background: "oklch(1 0 0)",
      foreground: "oklch(0.2 0 0)",
      card: "oklch(0.98 0 0)",
      cardForeground: "oklch(0.2 0 0)",
      muted: "oklch(0.96 0 0)",
      mutedForeground: "oklch(0.5 0 0)",
      accent: "oklch(0.4 0 0)",
      accentForeground: "oklch(1 0 0)",
      border: "oklch(0.9 0 0)",
      input: "oklch(0.98 0 0)",
    },
  },
]

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(defaultTheme)
  const [currentPreset, setCurrentPreset] = useState<string | null>("emerald")
  const [isCustomTheme, setIsCustomTheme] = useState(false)

  const applyTheme = (newTheme: ThemeConfig) => {
    const root = document.documentElement

    Object.entries(newTheme).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--${key}`, value)
      }
    })
  }

  const setTheme = (newTheme: ThemeConfig) => {
    const mergedTheme = { ...defaultTheme, ...newTheme }
    setThemeState(mergedTheme)
    applyTheme(mergedTheme)

    // Check if this matches any preset
    const matchingPreset = themePresets.find((preset) => JSON.stringify(preset.theme) === JSON.stringify(mergedTheme))

    if (matchingPreset) {
      setCurrentPreset(matchingPreset.id)
      setIsCustomTheme(false)
    } else {
      setCurrentPreset(null)
      setIsCustomTheme(true)
    }
  }

  const resetTheme = () => {
    setTheme(defaultTheme)
    setCurrentPreset("emerald")
    setIsCustomTheme(false)
  }

  const handleSetCurrentPreset = (presetId: string | null) => {
    if (presetId) {
      const preset = themePresets.find((p) => p.id === presetId)
      if (preset) {
        setTheme(preset.theme)
      }
    }
    setCurrentPreset(presetId)
    setIsCustomTheme(false)
  }

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        applyTheme,
        resetTheme,
        presets: themePresets,
        currentPreset,
        setCurrentPreset: handleSetCurrentPreset,
        isCustomTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
