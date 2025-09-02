import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary font-[family-name:var(--font-playfair)]">Chat Hub</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 font-[family-name:var(--font-playfair)] text-balance">
            Connect with Managers Seamlessly
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Professional messaging platform that enables visitors to reach out to managers through personalized profile
            pages. Clean, secure, and customizable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Start Managing Messages</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">View Demo Profile</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-playfair)]">Personalized Profiles</CardTitle>
              <CardDescription>Create custom profile pages with your branding and theme</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Each manager gets a unique URL with customizable themes, bio, and professional presentation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-playfair)]">Clean Messaging</CardTitle>
              <CardDescription>Streamlined chat interface for effective communication</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Intuitive messaging system with thread management, notifications, and conversation history.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-playfair)]">Manager Dashboard</CardTitle>
              <CardDescription>Comprehensive dashboard to manage all conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track messages, manage conversations, customize settings, and analyze engagement metrics.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
