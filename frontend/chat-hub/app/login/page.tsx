import { AuthGuard } from "@/components/auth-guard"
import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export const metadata = {
  title: "Login - Chat Hub",
  description: "Sign in to your Chat Hub manager account",
}

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold text-primary font-[family-name:var(--font-playfair)]">Chat Hub</h1>
            </Link>
            <p className="text-muted-foreground mt-2">Welcome back to your dashboard</p>
          </div>

          {/* Login Card */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-[family-name:var(--font-playfair)]">Sign In</CardTitle>
              <CardDescription>Enter your credentials to access your manager dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-primary hover:underline font-medium">
                    Sign up here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
