"use client"

import { useState, useEffect } from "react"
import { Bell, Shield } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { usePathname } from "next/navigation"
import NotificationsPopup from "./NotificationsPopup"

export default function TopBar() {
  const { user, token } = useAuth()
  const pathname = usePathname()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  // Charger le compteur de notifications
  const chargerNotifCount = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/non-lues/count`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setNotifCount(data.count)
      }
    } catch (e) { console.error(e) }
  }

  // Charger au montage et toutes les 30 secondes
  useEffect(() => {
    chargerNotifCount()
    const interval = setInterval(chargerNotifCount, 30000)
    return () => clearInterval(interval)
  }, [token])

  return (
    <>
      <div style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: 260, // largeur de la sidebar
        height: 64,
        background: "white",
        borderBottom: "1px solid #e2ddd6",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingRight: 24,
        gap: 12,
        zIndex: 50,
      }}>
        {/* Bouton Notification */}
        <button
          onClick={() => {
            chargerNotifCount()
            setShowNotifications(!showNotifications)
          }}
          style={{
            position: "relative",
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#F7F5F0",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#e2ddd6"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#F7F5F0"}
        >
          <Bell size={20} color="#1C1A17" />
          {notifCount > 0 && (
            <span style={{
              position: "absolute",
              top: 6,
              right: 6,
              background: "#C0392B",
              color: "white",
              fontSize: 9,
              fontWeight: 800,
              padding: "2px 5px",
              borderRadius: 10,
              minWidth: 18,
              textAlign: "center",
            }}>
              {notifCount > 99 ? "99+" : notifCount}
            </span>
          )}
        </button>

        {/* Bouton Admin (si admin) */}
        {user?.role === "admin" && (
          <Link href="/dashboard/admin" style={{ textDecoration: "none" }}>
            <button
              style={{
                height: 44,
                paddingLeft: 16,
                paddingRight: 16,
                borderRadius: 12,
                background: pathname.startsWith("/dashboard/admin")
                  ? "linear-gradient(135deg, #C0392B, #E74C3C)"
                  : "#F7F5F0",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: pathname.startsWith("/dashboard/admin")
                  ? "0 4px 16px rgba(192,57,43,0.3)"
                  : "none",
              }}
              onMouseEnter={e => {
                if (!pathname.startsWith("/dashboard/admin")) {
                  (e.currentTarget as HTMLElement).style.background = "#e2ddd6"
                }
              }}
              onMouseLeave={e => {
                if (!pathname.startsWith("/dashboard/admin")) {
                  (e.currentTarget as HTMLElement).style.background = "#F7F5F0"
                }
              }}
            >
              <Shield
                size={18}
                color={pathname.startsWith("/dashboard/admin") ? "white" : "#C0392B"}
              />
              <span style={{
                fontSize: 13,
                fontWeight: 700,
                color: pathname.startsWith("/dashboard/admin") ? "white" : "#C0392B",
              }}>
                Admin
              </span>
            </button>
          </Link>
        )}
      </div>

      {/* Popup Notifications */}
      <NotificationsPopup
        isOpen={showNotifications}
        onClose={() => {
          setShowNotifications(false)
          chargerNotifCount()
        }}
      />
    </>
  )
}
