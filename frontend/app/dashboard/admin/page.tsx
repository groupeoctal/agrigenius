"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import {
  Users, Microscope, BookOpen, ShoppingBag, TrendingUp,
  AlertCircle, Loader2, UserCheck, UserX, BarChart3, Shield
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export default function AdminDashboardPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const pageRef = useRef<HTMLDivElement>(null)

  const [stats, setStats] = useState<any>(null)
  const [activite, setActivite] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Vérifier que l'utilisateur est admin
    if (user && user.role !== "admin") {
      router.push("/dashboard")
      return
    }

    chargerDonnees()
  }, [user, router])

  const chargerDonnees = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/activite-recente?limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (activityRes.ok) setActivite(await activityRes.json())
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        const ctx = gsap.context(() => {
          gsap.fromTo(".admin-header",
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
          )
          gsap.fromTo(".stat-card",
            { opacity: 0, y: 30, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, delay: 0.2, ease: "back.out(1.3)" }
          )
        }, pageRef)
      }, 100)
    }
  }

  if (user?.role !== "admin") {
    return (
      <div style={{ padding: "32px 36px", textAlign: "center" }}>
        <AlertCircle size={48} color="#C0392B" style={{ margin: "20px auto" }} />
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#1C1A17", marginBottom: 8 }}>
          Accès refusé
        </h2>
        <p style={{ fontSize: 14, color: "#9a9590" }}>
          Cette section est réservée aux administrateurs
        </p>
      </div>
    )
  }

  return (
    <div ref={pageRef} style={{ padding: "32px 36px", maxWidth: 1300, margin: "0 auto" }}>

      {/* Header */}
      <div className="admin-header" style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #C0392B, #E74C3C)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(192,57,43,0.3)",
          }}>
            <Shield size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "#1C1A17" }}>
              Administration
            </h1>
            <p style={{ fontSize: 14, color: "#9a9590" }}>
              Gestion complète de la plateforme AgriGenius
            </p>
          </div>
        </div>

        {/* Navigation rapide */}
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          {[
            { label: "Utilisateurs", href: "/dashboard/admin/users", icon: Users, color: "#3498db" },
            { label: "Cours", href: "/dashboard/admin/cours", icon: BookOpen, color: "#E8A020" },
            { label: "Marketplace", href: "/dashboard/admin/marketplace", icon: ShoppingBag, color: "#1A6B3C" },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 12,
              background: "white", border: "2px solid #e2ddd6",
              textDecoration: "none", fontSize: 13, fontWeight: 600,
              color: "#1C1A17", transition: "all 0.2s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = item.color
                ;(e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${item.color}20`
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "#e2ddd6"
                ;(e.currentTarget as HTMLElement).style.boxShadow = "none"
              }}
            >
              <item.icon size={16} color={item.color} /> {item.label}
            </Link>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <Loader2 size={40} color="#C0392B" style={{ animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontSize: 14, color: "#9a9590" }}>Chargement des statistiques...</p>
        </div>
      ) : (
        <>
          {/* Stats principales */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
            {[
              { label: "Utilisateurs", value: stats?.utilisateurs?.total || 0, icon: Users, color: "#3498db", detail: `${stats?.utilisateurs?.actifs} actifs` },
              { label: "Diagnostics", value: stats?.diagnostics?.total || 0, icon: Microscope, color: "#1A6B3C", detail: `${stats?.diagnostics?.ce_mois} ce mois` },
              { label: "Cours", value: stats?.formation?.total_cours || 0, icon: BookOpen, color: "#E8A020", detail: `${stats?.formation?.cours_actifs} publiés` },
              { label: "Commandes", value: stats?.marketplace?.total_commandes || 0, icon: ShoppingBag, color: "#9b59b6", detail: `${stats?.marketplace?.commandes_ce_mois} ce mois` },
            ].map(({ label, value, icon: Icon, color, detail }, i) => (
              <div key={label} className="stat-card" style={{
                background: "white", borderRadius: 16, padding: "22px",
                border: "1px solid #e2ddd6",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${color}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={22} color={color} />
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "#1C1A17", marginBottom: 4 }}>
                  {value}
                </div>
                <div style={{ fontSize: 13, color: "#1C1A17", fontWeight: 600, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 11, color: "#9a9590" }}>{detail}</div>
              </div>
            ))}
          </div>

          {/* Grid 2 colonnes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* Stats détaillées */}
            <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e2ddd6" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1C1A17", marginBottom: 20 }}>
                Statistiques détaillées
              </h3>

              {/* Utilisateurs par rôle */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#9a9590", marginBottom: 10 }}>UTILISATEURS PAR RÔLE</p>
                {stats?.utilisateurs?.par_role && Object.entries(stats.utilisateurs.par_role).map(([role, count]: [string, any]) => (
                  <div key={role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "#1C1A17", textTransform: "capitalize" }}>{role}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1A6B3C" }}>{count}</span>
                  </div>
                ))}
              </div>

              {/* Formation */}
              <div style={{ marginBottom: 20, paddingTop: 16, borderTop: "1px solid #e2ddd6" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#9a9590", marginBottom: 10 }}>FORMATION</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#1C1A17" }}>Total inscriptions</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1A6B3C" }}>{stats?.formation?.total_inscriptions}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#1C1A17" }}>Cours complétés</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1A6B3C" }}>{stats?.formation?.cours_completes}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#1C1A17" }}>Taux de complétion</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1A6B3C" }}>{stats?.formation?.taux_completion}%</span>
                </div>
              </div>

              {/* Marketplace */}
              <div style={{ paddingTop: 16, borderTop: "1px solid #e2ddd6" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#9a9590", marginBottom: 10 }}>MARKETPLACE</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#1C1A17" }}>Annonces actives</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1A6B3C" }}>{stats?.marketplace?.annonces_actives}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#1C1A17" }}>CA total estimé</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1A6B3C" }}>{stats?.marketplace?.ca_total?.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>

            {/* Activité récente */}
            <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e2ddd6" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1C1A17", marginBottom: 16 }}>
                Activité récente
              </h3>
              <div style={{ maxHeight: 400, overflowY: "auto" }}>
                {activite.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#9a9590", textAlign: "center", padding: 20 }}>
                    Aucune activité récente
                  </p>
                ) : (
                  activite.map((act, i) => (
                    <div key={i} style={{
                      padding: "12px 0",
                      borderBottom: i < activite.length - 1 ? "1px solid #f0ece6" : "none",
                    }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 3 }}>
                        {act.text}
                      </p>
                      <p style={{ fontSize: 11, color: "#9a9590", marginBottom: 4 }}>
                        {act.details}
                      </p>
                      <p style={{ fontSize: 10, color: "#9a9590" }}>
                        {new Date(act.timestamp).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
