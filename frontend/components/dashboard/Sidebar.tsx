"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import {
  LayoutDashboard, Microscope, Globe, BookOpen,
  ShoppingBag, Settings, LogOut, ChevronLeft, ChevronRight, User
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

const navItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", href: "/dashboard" },
  { icon: Microscope,      label: "Diagnostic Phyto", href: "/dashboard/diagnostic/phyto", badge: "IA" },
  { icon: Globe,           label: "Diagnostic Sol",   href: "/dashboard/diagnostic/pedologie", badge: "IA" },
  { icon: BookOpen,        label: "Formation",        href: "/dashboard/formation" },
  { icon: ShoppingBag,     label: "Marketplace",      href: "/dashboard/marketplace" },
  { icon: Settings,        label: "Paramètres",       href: "/dashboard/settings" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    gsap.fromTo(sidebarRef.current,
      { x: -80, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
    )
    gsap.fromTo(".nav-item",
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.07, delay: 0.3, ease: "power2.out" }
    )
  }, [])

  const handleCollapse = () => {
    gsap.to(sidebarRef.current, {
      width: collapsed ? 260 : 72,
      duration: 0.35, ease: "power2.inOut",
    })
    setCollapsed(!collapsed)
  }

  const handleLogout = () => {
    gsap.to(sidebarRef.current, {
      opacity: 0, x: -20, duration: 0.3,
      onComplete: () => { logout(); router.push("/") }
    })
  }

  const roleColors: Record<string, string> = {
    agriculteur: "#1A6B3C",
    acheteur: "#E8A020",
    expert: "#4CAF50",
    admin: "#C0392B",
  }

  return (
    <div ref={sidebarRef} style={{
      width: collapsed ? 72 : 260,
      minHeight: "100vh",
      background: "#1C1A17",
      display: "flex", flexDirection: "column",
      position: "fixed", left: 0, top: 0, bottom: 0,
      zIndex: 100, transition: "width 0.35s ease",
      overflow: "hidden",
      boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? "20px 16px" : "24px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
      }}>
        {!collapsed && (
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
              background: "white",
            }}>
              <Image
                src="/logo.png"
                alt="AgriGenius Logo"
                width={40}
                height={40}
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "white", whiteSpace: "nowrap" }}>
              Agri<span style={{ color: "#E8A020" }}>Genius</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            background: "white",
          }}>
            <Image
              src="/logo.png"
              alt="AgriGenius Logo"
              width={40}
              height={40}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        )}
        <button onClick={handleCollapse} style={{
          background: "rgba(255,255,255,0.08)", border: "none",
          borderRadius: 8, width: 28, height: 28,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "rgba(255,255,255,0.6)",
          flexShrink: 0, marginLeft: collapsed ? 0 : 0,
        }}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Profil utilisateur */}
      {!collapsed && user && (
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: user.avatar
                ? `url(${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${user.avatar}) center/cover`
                : `linear-gradient(135deg, ${roleColors[user.role] || "#1A6B3C"}, rgba(255,255,255,0.2))`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}>
              {!user.avatar && <User size={18} color="white" />}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "white", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.prenom} {user.nom}
              </div>
              <div style={{
                fontSize: 11, fontWeight: 600, textTransform: "capitalize",
                color: roleColors[user.role] || "#4CAF50",
              }}>
                {user.role}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {!collapsed && (
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", padding: "8px 10px 4px" }}>
            Navigation
          </p>
        )}
        {navItems.map(({ icon: Icon, label, href, badge }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className="nav-item" style={{
              display: "flex", alignItems: "center",
              gap: collapsed ? 0 : 12,
              padding: collapsed ? "12px" : "10px 12px",
              borderRadius: 10, marginBottom: 4,
              textDecoration: "none",
              justifyContent: collapsed ? "center" : "flex-start",
              background: active ? "rgba(26,107,60,0.4)" : "transparent",
              border: active ? "1px solid rgba(26,107,60,0.5)" : "1px solid transparent",
              transition: "all 0.2s",
              position: "relative",
            }}
              title={collapsed ? label : ""}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"
              }}
            >
              <Icon size={18} color={active ? "#4CAF50" : "rgba(255,255,255,0.6)"} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <>
                  <span style={{
                    fontSize: 13, fontWeight: active ? 600 : 500,
                    color: active ? "white" : "rgba(255,255,255,0.65)",
                    flex: 1, whiteSpace: "nowrap",
                  }}>
                    {label}
                  </span>
                  {badge && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, background: "#1A6B3C",
                      color: "white", padding: "2px 6px", borderRadius: 4,
                      letterSpacing: "0.5px",
                    }}>
                      {badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}

      </nav>

      {/* Logout */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: collapsed ? 0 : 12,
          width: "100%", padding: collapsed ? "12px" : "10px 12px",
          background: "transparent", border: "none", borderRadius: 10,
          cursor: "pointer", justifyContent: collapsed ? "center" : "flex-start",
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(192,57,43,0.15)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
        >
          <LogOut size={18} color="#C0392B" />
          {!collapsed && <span style={{ fontSize: 13, color: "#C0392B", fontWeight: 500 }}>Déconnexion</span>}
        </button>
      </div>
    </div>
  )
}
