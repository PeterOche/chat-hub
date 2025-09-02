"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useSendMessage } from "@/hooks/use-messages"
import { Loader2, Send, CheckCircle } from "lucide-react"

interface MessageFormProps {
  managerSlug: string
}

export function MessageForm({ managerSlug }: MessageFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [resumeUrl, setResumeUrl] = useState("")
  const [errorMsg, setErrorMsg] = useState<string>("")

  const { mutate: sendMessage, isPending } = useSendMessage()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    const slug = (managerSlug || "").trim()
    if (!slug || slug === "undefined" || slug === "null") {
      setErrorMsg("Missing or invalid manager identifier. Please use a valid profile link.")
      return
    }
    sendMessage(
      {
        managerSlug: slug,
        ...formData,
      },
      {
        onSuccess: (data) => {
          setSubmitted(true)
          setResumeUrl(data.resumeUrl)
          setFormData({ name: "", email: "", message: "" })
        },
        onError: (err: any) => {
          const msg = err?.message || "Failed to send message. Please try again."
          setErrorMsg(msg)
        },
      },
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">Message Sent Successfully!</h3>
          <p className="text-green-700 mb-4">
            Your message has been delivered. You can continue the conversation using the link below.
          </p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
              Continue Conversation
            </a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const slugValid = !!((managerSlug || "").trim()) && !["undefined", "null"].includes((managerSlug || "").trim())

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Your Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
            disabled={isPending || !slugValid}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            required
            disabled={isPending || !slugValid}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Your Message</Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Write your message here..."
          rows={5}
          required
          disabled={isPending || !slugValid}
          className="resize-none"
        />
      </div>

      {(errorMsg || !slugValid) && (
        <p className="text-sm text-red-600">
          {errorMsg || "Invalid profile link. Unable to send message."}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isPending || !slugValid}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending Message...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </>
        )}
      </Button>
    </form>
  )
}
