"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Sidebar from "@/components/dashboard/Sidebar"
import TopBar from "@/components/dashboard/TopBar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "var(--background)",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "3px solid #e2ddd6",
          borderTopColor: "#1A6B3C",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F7F5F0" }}>
      <Sidebar />
      <TopBar />
      {/* Main content — décalé selon sidebar et topbar */}
      <main style={{
        flex: 1,
        marginLeft: 260,
        marginTop: 64, // hauteur du topbar
        minHeight: "calc(100vh - 64px)",
        transition: "margin-left 0.35s ease",
      }}>
        {children}
      </main>
    </div>
  )
}
