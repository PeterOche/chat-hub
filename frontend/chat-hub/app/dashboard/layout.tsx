import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export const metadata = {
  title: "Dashboard - Chat Hub",
  description: "Manage your conversations and messages",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Sidebar */}
          <DashboardSidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-screen">
            <DashboardHeader />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
