"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "@/contexts/theme-context"
import { Palette, RotateCcw, Save, Eye } from "lucide-react"

interface ColorInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  description?: string
}

function ColorInput({ label, value, onChange, description }: ColorInputProps) {
  const [inputValue, setInputValue] = useState(value)

  const handleChange = (newValue: string) => {
    setInputValue(newValue)
    onChange(newValue)
  }

  // Convert OKLCH to hex for color picker (simplified)
  const getHexFromOklch = (oklch: string): string => {
    // This is a simplified conversion - in a real app you'd use a proper color library
    if (oklch.includes("162.145")) return "#059669" // emerald
    if (oklch.includes("220.145")) return "#0ea5e9" // blue
    if (oklch.includes("45.145")) return "#f97316" // orange
    if (oklch.includes("280.145")) return "#8b5cf6" // purple
    return "#059669" // default
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id={label}
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="oklch(0.588 0.15 162.145)"
            className="pr-12"
          />
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-border"
            style={{ backgroundColor: getHexFromOklch(inputValue) }}
          />
        </div>
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}

interface ThemeEditorProps {
  onSave?: (theme: any) => void
  showPreview?: boolean
}

export function ThemeEditor({ onSave, showPreview = true }: ThemeEditorProps) {
  const { theme, setTheme, resetTheme, presets, currentPreset, setCurrentPreset, isCustomTheme } = useTheme()
  const [localTheme, setLocalTheme] = useState(theme)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const handleColorChange = (key: string, value: string) => {
    const newTheme = { ...localTheme, [key]: value }
    setLocalTheme(newTheme)

    if (isPreviewMode) {
      setTheme(newTheme)
    }
  }

  const handlePresetSelect = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId)
    if (preset) {
      setLocalTheme(preset.theme)
      setCurrentPreset(presetId)
      if (isPreviewMode) {
        setTheme(preset.theme)
      }
    }
  }

  const handleApply = () => {
    setTheme(localTheme)
    setIsPreviewMode(false)
  }

  const handleSave = () => {
    setTheme(localTheme)
    if (onSave) {
      onSave(localTheme)
    }
  }

  const handleReset = () => {
    resetTheme()
    setLocalTheme(theme)
    setIsPreviewMode(false)
  }

  const togglePreview = () => {
    if (isPreviewMode) {
      // Stop preview - revert to saved theme
      setTheme(theme)
    } else {
      // Start preview - apply local theme
      setTheme(localTheme)
    }
    setIsPreviewMode(!isPreviewMode)
  }

  const presetsByCategory = presets.reduce(
    (acc, preset) => {
      if (!acc[preset.category]) acc[preset.category] = []
      acc[preset.category].push(preset)
      return acc
    },
    {} as Record<string, typeof presets>,
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Theme Customization</CardTitle>
            {isCustomTheme && <Badge variant="secondary">Custom</Badge>}
          </div>

          <div className="flex items-center gap-2">
            {showPreview && (
              <Button variant="outline" size="sm" onClick={togglePreview}>
                <Eye className="h-4 w-4 mr-2" />
                {isPreviewMode ? "Stop Preview" : "Live Preview"}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="presets" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="custom">Custom Colors</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            {Object.entries(presetsByCategory).map(([category, categoryPresets]) => (
              <div key={category} className="space-y-3">
                <h4 className="font-medium text-sm capitalize">{category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryPresets.map((preset) => (
                    <Card
                      key={preset.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        currentPreset === preset.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handlePresetSelect(preset.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <div
                              className="w-4 h-4 rounded-full border border-border"
                              style={{
                                backgroundColor:
                                  preset.theme.primary?.replace("oklch", "").replace("(", "").replace(")", "") ||
                                  "#059669",
                              }}
                            />
                            <div
                              className="w-4 h-4 rounded-full border border-border"
                              style={{
                                backgroundColor:
                                  preset.theme.secondary?.replace("oklch", "").replace("(", "").replace(")", "") ||
                                  "#10b981",
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{preset.name}</h5>
                            <p className="text-xs text-muted-foreground">{preset.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="grid gap-4">
              <ColorInput
                label="Primary Color"
                value={localTheme.primary || ""}
                onChange={(value) => handleColorChange("primary", value)}
                description="Main brand color for buttons and highlights"
              />

              <ColorInput
                label="Secondary Color"
                value={localTheme.secondary || ""}
                onChange={(value) => handleColorChange("secondary", value)}
                description="Secondary accent color"
              />

              <ColorInput
                label="Background"
                value={localTheme.background || ""}
                onChange={(value) => handleColorChange("background", value)}
                description="Main background color"
              />

              <ColorInput
                label="Text Color"
                value={localTheme.foreground || ""}
                onChange={(value) => handleColorChange("foreground", value)}
                description="Primary text color"
              />

              <ColorInput
                label="Card Background"
                value={localTheme.card || ""}
                onChange={(value) => handleColorChange("card", value)}
                description="Background for cards and panels"
              />

              <ColorInput
                label="Border Color"
                value={localTheme.border || ""}
                onChange={(value) => handleColorChange("border", value)}
                description="Color for borders and dividers"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
          {!isPreviewMode && (
            <Button variant="outline" onClick={handleApply}>
              Apply Changes
            </Button>
          )}
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Theme
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
