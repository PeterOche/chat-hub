import { AuthGuard } from "@/components/auth-guard"
import { SignupForm } from "@/components/auth/signup-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export const metadata = {
  title: "Sign Up - Chat Hub",
  description: "Create your Chat Hub manager account",
}

export default function SignupPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold text-primary font-[family-name:var(--font-playfair)]">Chat Hub</h1>
            </Link>
            <p className="text-muted-foreground mt-2">Start managing your messages today</p>
          </div>

          {/* Signup Card */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-[family-name:var(--font-playfair)]">Create Account</CardTitle>
              <CardDescription>Set up your manager profile and start receiving messages</CardDescription>
            </CardHeader>
            <CardContent>
              <SignupForm />

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in here
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
