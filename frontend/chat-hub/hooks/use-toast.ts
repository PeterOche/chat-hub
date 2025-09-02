"use client"

export type ToastVariant = "default" | "destructive"

export interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
}

// Minimal toast utility to avoid build errors and provide a simple event-based API.
// Consumers can listen to the `app:toast` event to render a UI toast component.
// Example:
//   useEffect(() => {
//     const handler = (e: any) => console.log(e.detail)
//     window.addEventListener("app:toast" as any, handler)
//     return () => window.removeEventListener("app:toast" as any, handler)
//   }, [])
export function toast({ title, description, variant = "default" }: ToastOptions) {
  if (typeof window !== "undefined") {
    try {
      const ev = new CustomEvent("app:toast", {
        detail: { title, description, variant },
      })
      window.dispatchEvent(ev)
    } catch {
      // ignore
    }

    // Dev-friendly console output
    const msg = [title, description].filter(Boolean).join(" — ")
    if (process.env.NODE_ENV !== "production" && msg) {
      if (variant === "destructive") console.error(`[Toast] ${msg}`)
      else console.log(`[Toast] ${msg}`)
    }
  }
}
