"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Plus } from "lucide-react"

interface Template {
  id: string
  title: string
  content: string
  category: string
  usage: number
}

interface MessageTemplatesProps {
  onSelectTemplate: (content: string) => void
  className?: string
}

const defaultTemplates: Template[] = [
  {
    id: "1",
    title: "Thank you for reaching out",
    content: "Thank you for reaching out! I've received your message and will get back to you within 24 hours.",
    category: "Acknowledgment",
    usage: 45,
  },
  {
    id: "2",
    title: "Schedule a meeting",
    content:
      "I'd be happy to discuss this further. Would you be available for a 30-minute call this week? Please let me know your preferred time.",
    category: "Scheduling",
    usage: 32,
  },
  {
    id: "3",
    title: "Request more information",
    content:
      "To better assist you, could you please provide more details about your specific requirements or timeline?",
    category: "Information",
    usage: 28,
  },
  {
    id: "4",
    title: "Follow up",
    content:
      "I wanted to follow up on our previous conversation. Do you have any questions or need any additional information?",
    category: "Follow-up",
    usage: 21,
  },
]

export function MessageTemplates({ onSelectTemplate, className }: MessageTemplatesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(defaultTemplates.map((t) => t.category)))
  const filteredTemplates = selectedCategory
    ? defaultTemplates.filter((t) => t.category === selectedCategory)
    : defaultTemplates

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between bg-transparent">
          Quick Templates
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Message Templates</CardTitle>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-1">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="h-6 text-xs"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="h-6 text-xs"
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-2 max-h-60 overflow-y-auto">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => {
                  onSelectTemplate(template.content)
                  setIsOpen(false)
                }}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm">{template.title}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {template.usage}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{template.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}
