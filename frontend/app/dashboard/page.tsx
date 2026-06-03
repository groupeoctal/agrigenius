"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import {
  Microscope, Globe, BookOpen, ShoppingBag,
  TrendingUp, AlertTriangle, CheckCircle, Clock, ArrowRight, Sun, Loader2
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

const quickActions = [
  { icon: Microscope, label: "Nouveau diagnostic", sub: "Analyser une plante", href: "/dashboard/diagnostic/phyto", color: "#1A6B3C", bg: "#f0faf4" },
  { icon: Globe,      label: "Analyser mon sol",   sub: "Recommandation culture", href: "/dashboard/diagnostic/pedologie", color: "#4CAF50", bg: "#f5fdf5" },
  { icon: BookOpen,   label: "Mes formations",      sub: "Continuer l'apprentissage", href: "/dashboard/formation", color: "#E8A020", bg: "#fffbf0" },
  { icon: ShoppingBag,label: "Marketplace",         sub: "Vendre ou acheter", href: "/dashboard/marketplace", color: "#1A6B3C", bg: "#f0faf4" },
]

export default function DashboardPage() {
  const { user, token } = useAuth()
  const pageRef = useRef<HTMLDivElement>(null)

  const [stats, setStats] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir"

  useEffect(() => {
    chargerDonnees()
  }, [])

  const chargerDonnees = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/activite-recente`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (activityRes.ok) setRecentActivity(await activityRes.json())
    } catch (e) { console.error(e) }
    finally {
      setIsLoading(false)
      setTimeout(() => {
        const ctx = gsap.context(() => {
          gsap.fromTo(".dash-header",
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
          )
          gsap.fromTo(".stat-card",
            { opacity: 0, y: 30, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, delay: 0.2, ease: "back.out(1.3)" }
          )
          gsap.fromTo(".action-card",
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.4, ease: "power2.out" }
          )
          gsap.fromTo(".activity-item",
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, delay: 0.6, ease: "power2.out" }
          )
        }, pageRef)
      }, 100)
    }
  }

  const statsData = stats ? [
    { label: "Diagnostics effectués", value: String(stats.diagnostics.total), icon: Microscope, color: "#1A6B3C", trend: stats.diagnostics.trend },
    { label: "Cours complétés", value: String(stats.formation.cours_completes), icon: BookOpen, color: "#E8A020", trend: stats.formation.trend },
    { label: "Annonces actives", value: String(stats.marketplace.annonces_actives), icon: ShoppingBag, color: "#4CAF50", trend: stats.marketplace.trend },
    { label: "Score productivité", value: `${stats.productivite.score}%`, icon: TrendingUp, color: "#1A6B3C", trend: stats.productivite.trend },
  ] : []

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "diagnostic": return CheckCircle
      case "formation": return TrendingUp
      case "marketplace": return ShoppingBag
      default: return AlertTriangle
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "diagnostic": return "#1A6B3C"
      case "formation": return "#4CAF50"
      case "marketplace": return "#E8A020"
      default: return "#C0392B"
    }
  }

  return (
    <div ref={pageRef} style={{ padding: "32px 36px", maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div className="dash-header" style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 36,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Sun size={20} color="#E8A020" />
            <span style={{ fontSize: 13, color: "#9a9590", fontWeight: 500 }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 30, fontWeight: 800,
            color: "#1C1A17", marginBottom: 4,
          }}>
            {greeting}, {user?.prenom} 👋
          </h1>
          <p style={{ fontSize: 14, color: "#9a9590" }}>
            Voici un aperçu de votre activité agricole
          </p>
        </div>

        {/* Bouton diagnostic rapide */}
        <Link href="/dashboard/diagnostic/phyto"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, #1A6B3C, #2d8a52)",
            color: "white", textDecoration: "none",
            padding: "12px 24px", borderRadius: 14,
            fontWeight: 600, fontSize: 14,
            boxShadow: "0 4px 16px rgba(26,107,60,0.3)",
            transition: "transform 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}
        >
          <Microscope size={16} /> Diagnostic rapide
        </Link>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16, marginBottom: 32,
      }}>
        {isLoading ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40 }}>
            <Loader2 size={28} color="#1A6B3C" style={{ animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          </div>
        ) : statsData.map(({ label, value, icon: Icon, color, trend }) => (
          <div key={label} className="stat-card" style={{
            background: "white", borderRadius: 16, padding: "20px",
            border: "1px solid #e2ddd6",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: `${color}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={18} color={color} />
              </div>
              <span style={{ fontSize: 11, color: "#9a9590", background: "#F7F5F0", padding: "3px 8px", borderRadius: 20 }}>
                {trend}
              </span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#1C1A17", marginBottom: 4 }}>
              {value}
            </div>
            <div style={{ fontSize: 12, color: "#9a9590", fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Grid principal */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>

        {/* Actions rapides */}
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1C1A17", marginBottom: 16 }}>
            Accès rapide
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {quickActions.map(({ icon: Icon, label, sub, href, color, bg }) => (
              <Link key={href} href={href} className="action-card" style={{
                display: "flex", alignItems: "center", gap: 16,
                background: "white", borderRadius: 16, padding: "20px",
                border: "1px solid #e2ddd6", textDecoration: "none",
                transition: "all 0.3s", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = "translateY(-3px)"
                  el.style.boxShadow = `0 12px 32px ${color}20`
                  el.style.borderColor = `${color}40`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = "translateY(0)"
                  el.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"
                  el.style.borderColor = "#e2ddd6"
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: bg, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1.5px solid ${color}25`,
                }}>
                  <Icon size={22} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1C1A17", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, color: "#9a9590" }}>{sub}</div>
                </div>
                <ArrowRight size={14} color={color} style={{ flexShrink: 0 }} />
              </Link>
            ))}
          </div>

          {/* Alerte conseil */}
          <div style={{
            marginTop: 20, background: "linear-gradient(135deg, #fffbf0, #fff8e6)",
            border: "1px solid rgba(232,160,32,0.3)", borderRadius: 16, padding: "20px",
          }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "#E8A020", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <AlertTriangle size={18} color="white" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#1C1A17", marginBottom: 4 }}>
                  Conseil de saison — Région du Sud
                </p>
                <p style={{ fontSize: 12, color: "#5a5650", lineHeight: 1.6 }}>
                  La période actuelle est favorable à la plantation du cacao. Vérifiez l&apos;humidité de votre sol avant de commencer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1C1A17" }}>
              Activité récente
            </h2>
            <span style={{ fontSize: 12, color: "#1A6B3C", fontWeight: 600, cursor: "pointer" }}>Voir tout</span>
          </div>
          <div style={{
            background: "white", borderRadius: 16,
            border: "1px solid #e2ddd6", overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}>
            {recentActivity.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#9a9590", fontSize: 13 }}>
                Aucune activité récente
              </div>
            ) : recentActivity.map((activity, i) => {
              const Icon = getActivityIcon(activity.icon || activity.type)
              const color = getActivityColor(activity.icon || activity.type)
              return (
                <div key={i} className="activity-item" style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "16px 20px",
                  borderBottom: i < recentActivity.length - 1 ? "1px solid #f0ece6" : "none",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: `${color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginTop: 2,
                  }}>
                    <Icon size={14} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#1C1A17", marginBottom: 3, lineHeight: 1.4 }}>
                      {activity.text}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={10} color="#9a9590" />
                      <span style={{ fontSize: 11, color: "#9a9590" }}>{activity.time}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Progression formation */}
          <div style={{
            marginTop: 16, background: "white", borderRadius: 16,
            border: "1px solid #e2ddd6", padding: "20px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1C1A17" }}>Ma formation en cours</span>
              <span style={{ fontSize: 12, color: "#E8A020", fontWeight: 600 }}>60%</span>
            </div>
            <p style={{ fontSize: 12, color: "#9a9590", marginBottom: 10 }}>
              Culture du Cacao — Module 3/5
            </p>
            <div style={{ height: 6, background: "#F7F5F0", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: "60%",
                background: "linear-gradient(135deg, #E8A020, #f0c050)",
                borderRadius: 3,
                transition: "width 1s ease",
              }} />
            </div>
            <Link href="/dashboard/formation" style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              color: "#1A6B3C", fontSize: 12, fontWeight: 600,
              textDecoration: "none", marginTop: 12,
            }}>
              Continuer <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
