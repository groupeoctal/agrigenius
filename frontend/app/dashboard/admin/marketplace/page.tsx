"use client"

import { useEffect, useState } from "react"
import { gsap } from "gsap"
import {
  ShoppingBag, Search, Filter, Loader2, ArrowLeft,
  AlertCircle, CheckCircle, Eye, Trash2, Check, X, Package
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function AdminMarketplacePage() {
  const { user, token } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<"annonces" | "commandes">("annonces")
  const [annonces, setAnnonces] = useState<any[]>([])
  const [commandes, setCommandes] = useState<any[]>([])
  const [totalAnnonces, setTotalAnnonces] = useState(0)
  const [totalCommandes, setTotalCommandes] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statutFilter, setStatutFilter] = useState("")
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard")
      return
    }
    if (activeTab === "annonces") {
      chargerAnnonces()
    } else {
      chargerCommandes()
    }
  }, [user, router, activeTab, statutFilter])

  const chargerAnnonces = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (statutFilter) params.append("statut", statutFilter)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/marketplace/annonces?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setAnnonces(data.annonces)
        setTotalAnnonces(data.total)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const chargerCommandes = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/marketplace/commandes`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setCommandes(data.commandes)
        setTotalCommandes(data.total)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const modererAnnonce = async (annonceId: number, nouveauStatut: string, motif: string = "") => {
    try {
      const params = new URLSearchParams()
      params.append("nouveau_statut", nouveauStatut)
      if (motif) params.append("motif", motif)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/marketplace/annonces/${annonceId}/moderer?${params}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        setSuccess(`Annonce ${nouveauStatut}`)
        chargerAnnonces()
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (e: any) {
      setError("Erreur lors de la modération")
    }
  }

  const supprimerAnnonce = async (annonceId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/marketplace/annonces/${annonceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        setSuccess("Annonce supprimée")
        chargerAnnonces()
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (e: any) {
      setError("Erreur lors de la suppression")
    }
  }

  const filteredAnnonces = annonces.filter(a =>
    a.titre.toLowerCase().includes(search.toLowerCase()) ||
    a.culture.toLowerCase().includes(search.toLowerCase())
  )

  const statutColors: Record<string, { bg: string; color: string }> = {
    active: { bg: "#f0faf4", color: "#1A6B3C" },
    vendu: { bg: "#f5fdf5", color: "#4CAF50" },
    archivee: { bg: "#F7F5F0", color: "#9a9590" },
  }

  if (user?.role !== "admin") return null

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1300, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/dashboard/admin" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "#9a9590", textDecoration: "none", fontSize: 13,
          fontWeight: 500, marginBottom: 12,
        }}>
          <ArrowLeft size={14} /> Retour au dashboard admin
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: "linear-gradient(135deg, #1A6B3C, #4CAF50)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(26,107,60,0.3)",
          }}>
            <ShoppingBag size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#1C1A17" }}>
              Gestion Marketplace
            </h1>
            <p style={{ fontSize: 13, color: "#9a9590" }}>
              {activeTab === "annonces" ? `${totalAnnonces} annonce${totalAnnonces > 1 ? "s" : ""}` : `${totalCommandes} commande${totalCommandes > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div style={{ background: "#f0faf4", border: "1px solid #4CAF50", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#1A6B3C", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle size={16} /> {success}
          </div>
        )}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#C0392B", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#F7F5F0", borderRadius: 12, padding: 4, marginBottom: 20, width: "fit-content" }}>
          {[
            { key: "annonces", label: `Annonces (${totalAnnonces})`, icon: ShoppingBag },
            { key: "commandes", label: `Commandes (${totalCommandes})`, icon: Package },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
                padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer",
                background: activeTab === tab.key ? "white" : "transparent",
                color: activeTab === tab.key ? "#1A6B3C" : "#9a9590",
                fontWeight: activeTab === tab.key ? 700 : 500, fontSize: 13,
                boxShadow: activeTab === tab.key ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8,
              }}>
                <Icon size={14} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Filtres */}
        {activeTab === "annonces" && (
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une annonce..."
                style={{
                  width: "100%", padding: "11px 14px 11px 40px",
                  border: "2px solid #e2ddd6", borderRadius: 12,
                  fontSize: 14, outline: "none",
                }}
              />
              <Search size={16} color="#9a9590" style={{
                position: "absolute", left: 14, top: "50%",
                transform: "translateY(-50%)",
              }} />
            </div>

            <div style={{ position: "relative" }}>
              <select
                value={statutFilter}
                onChange={e => setStatutFilter(e.target.value)}
                style={{
                  padding: "11px 40px 11px 14px",
                  border: "2px solid #e2ddd6", borderRadius: 12,
                  fontSize: 14, background: "white", cursor: "pointer",
                  appearance: "none", outline: "none",
                }}
              >
                <option value="">Tous les statuts</option>
                <option value="active">Active</option>
                <option value="vendu">Vendu</option>
                <option value="archivee">Archivée</option>
              </select>
              <Filter size={16} color="#9a9590" style={{
                position: "absolute", right: 12, top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none",
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <Loader2 size={32} color="#1A6B3C" style={{ animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, color: "#9a9590" }}>Chargement...</p>
        </div>
      ) : activeTab === "annonces" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {filteredAnnonces.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, color: "#9a9590" }}>
              Aucune annonce trouvée
            </div>
          ) : (
            filteredAnnonces.map(a => {
              const statutConfig = statutColors[a.statut] || statutColors.active
              return (
                <div key={a.id} style={{
                  background: "white", borderRadius: 16, border: "1px solid #e2ddd6",
                  overflow: "hidden",
                }}>
                  {a.image && (
                    <div style={{
                      height: 140, background: `url(${a.image}) center/cover`,
                      backgroundColor: "#F7F5F0",
                    }} />
                  )}
                  <div style={{ padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                        color: "#1A6B3C", background: "#f0faf4",
                        padding: "3px 8px", borderRadius: 4,
                      }}>
                        {a.culture}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: statutConfig.color,
                        background: statutConfig.bg,
                        padding: "3px 8px", borderRadius: 4, textTransform: "capitalize",
                      }}>
                        {a.statut}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "#1C1A17", marginBottom: 4 }}>
                      {a.titre}
                    </h3>
                    <p style={{ fontSize: 12, color: "#9a9590", marginBottom: 8 }}>
                      {a.quantite} {a.unite} · {a.prix.toLocaleString()} FCFA/{a.unite}
                    </p>
                    <p style={{ fontSize: 11, color: "#5a5650", marginBottom: 12 }}>
                      📍 {a.localisation}
                    </p>

                    <div style={{ display: "flex", gap: 6 }}>
                      <Link href={`/dashboard/marketplace/${a.id}`} style={{
                        flex: 1, padding: "8px", borderRadius: 8,
                        border: "1px solid #e2ddd6", background: "white",
                        color: "#1C1A17", textDecoration: "none",
                        fontSize: 11, fontWeight: 600, textAlign: "center",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                      }}>
                        <Eye size={12} /> Voir
                      </Link>
                      <button onClick={() => modererAnnonce(a.id, "active")} disabled={a.statut === "active"} style={{
                        flex: 1, padding: "8px", borderRadius: 8,
                        border: "1px solid #4CAF50", background: "white",
                        color: "#4CAF50", cursor: a.statut === "active" ? "not-allowed" : "pointer",
                        fontSize: 11, fontWeight: 600, opacity: a.statut === "active" ? 0.4 : 1,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                      }}>
                        <Check size={12} /> Activer
                      </button>
                      <button onClick={() => modererAnnonce(a.id, "archivee", "Annonce modérée par admin")} style={{
                        flex: 1, padding: "8px", borderRadius: 8,
                        border: "1px solid #9a9590", background: "white",
                        color: "#9a9590", cursor: "pointer",
                        fontSize: 11, fontWeight: 600,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                      }}>
                        <X size={12} /> Archiver
                      </button>
                      <button onClick={() => supprimerAnnonce(a.id)} style={{
                        padding: "8px", borderRadius: 8,
                        border: "1px solid #fecaca", background: "white",
                        color: "#C0392B", cursor: "pointer",
                        fontSize: 11, fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2ddd6", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#F7F5F0", borderBottom: "2px solid #e2ddd6" }}>
              <tr>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9a9590", textTransform: "uppercase" }}>Annonce</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9a9590", textTransform: "uppercase" }}>Acheteur</th>
                <th style={{ padding: "14px 16px", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#9a9590", textTransform: "uppercase" }}>Quantité</th>
                <th style={{ padding: "14px 16px", textAlign: "right", fontSize: 11, fontWeight: 700, color: "#9a9590", textTransform: "uppercase" }}>Prix Total</th>
                <th style={{ padding: "14px 16px", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#9a9590", textTransform: "uppercase" }}>Statut</th>
                <th style={{ padding: "14px 16px", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#9a9590", textTransform: "uppercase" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {commandes.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#9a9590", fontSize: 13 }}>
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                commandes.map((c: any) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f0ece6" }}>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#1C1A17", fontWeight: 600 }}>
                      {c.annonce?.titre || "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1A17" }}>
                          {c.acheteur?.prenom} {c.acheteur?.nom}
                        </p>
                        <p style={{ fontSize: 11, color: "#9a9590" }}>{c.acheteur?.telephone}</p>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center", fontSize: 13, color: "#1C1A17" }}>
                      {c.quantite}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right", fontSize: 14, fontWeight: 700, color: "#1A6B3C" }}>
                      {c.prix_total?.toLocaleString()} FCFA
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, textTransform: "capitalize",
                        padding: "4px 10px", borderRadius: 6,
                        background: c.statut === "acceptee" ? "#f0faf4" : c.statut === "refusee" ? "#fef2f2" : "#fffbf0",
                        color: c.statut === "acceptee" ? "#1A6B3C" : c.statut === "refusee" ? "#C0392B" : "#E8A020",
                      }}>
                        {c.statut}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center", fontSize: 12, color: "#9a9590" }}>
                      {new Date(c.created_at).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
