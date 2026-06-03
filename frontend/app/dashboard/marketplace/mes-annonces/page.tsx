"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import {
  ArrowLeft, Package, Plus, Eye, Trash2, Edit3,
  MapPin, Scale, Clock, CheckCircle, AlertTriangle,
  ShoppingCart, Loader2, ToggleLeft, ToggleRight
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"

const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: "Active",   color: "#1A6B3C", bg: "#f0faf4" },
  vendue:   { label: "Vendue",   color: "#4CAF50", bg: "#f5fdf5" },
  expiree:  { label: "Expirée", color: "#9a9590", bg: "#F7F5F0" },
  archivee: { label: "Archivée", color: "#C0392B", bg: "#fef2f2" },
}

const CULTURE_EMOJIS: Record<string, string> = {
  "Cacao": "🍫", "Café": "☕", "Banane plantain": "🍌", "Manioc": "🌿",
  "Maïs": "🌽", "Tomate": "🍅", "Arachide": "🥜", "Soja": "🫘",
  "Ananas": "🍍", "Palmier à huile": "🌴",
}

export default function MesAnnoncesPage() {
  const { token } = useAuth()
  const pageRef = useRef<HTMLDivElement>(null)

  const [annonces, setAnnonces] = useState<any[]>([])
  const [commandes, setCommandes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"annonces" | "commandes">("annonces")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".page-header", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6 })
    }, pageRef)
    chargerDonnees()
    return () => ctx.revert()
  }, [])

  const chargerDonnees = async () => {
    try {
      const [annRes, comRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/mes-annonces`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/commandes-recues`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ])
      if (annRes.ok) setAnnonces(await annRes.json())
      if (comRes.ok) setCommandes(await comRes.json())
    } catch (e) { console.error(e) }
    finally {
      setIsLoading(false)
      setTimeout(() => {
        gsap.fromTo(".annonce-row",
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" }
        )
      }, 100)
    }
  }

  const archiverAnnonce = async (id: number) => {
    setDeletingId(id)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/annonces/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        gsap.to(`#annonce-${id}`, {
          opacity: 0, height: 0, marginBottom: 0, duration: 0.4,
          onComplete: () => setAnnonces(a => a.filter(ann => ann.id !== id))
        })
      }
    } catch (e) { console.error(e) }
    finally { setDeletingId(null) }
  }

  const updateStatutCommande = async (commandeId: number, statut: string) => {
    const fd = new FormData()
    fd.append("statut", statut)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/commandes/${commandeId}/statut`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      setCommandes(c => c.map(cmd => cmd.id === commandeId ? { ...cmd, statut } : cmd))
    } catch (e) { console.error(e) }
  }

  const annoncesActives   = annonces.filter(a => a.statut === "active")
  const annoncesInactives = annonces.filter(a => a.statut !== "active")
  const commandesEnAttente = commandes.filter(c => c.statut === "en_attente")

  return (
    <div ref={pageRef} style={{ padding: "32px 36px", maxWidth: 1000, margin: "0 auto" }}>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 28 }}>
        <Link href="/dashboard/marketplace" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#9a9590", textDecoration: "none", fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
          <ArrowLeft size={14} /> Marketplace
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #1A6B3C, #4CAF50)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(26,107,60,0.3)" }}>
              <Package size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "#1C1A17" }}>Mes annonces</h1>
              <p style={{ fontSize: 13, color: "#9a9590" }}>Gérez vos annonces et commandes reçues</p>
            </div>
          </div>
          <Link href="/dashboard/marketplace/vendre" style={{
            display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
            background: "linear-gradient(135deg, #1A6B3C, #4CAF50)", borderRadius: 12,
            color: "white", textDecoration: "none", fontSize: 13, fontWeight: 700,
            boxShadow: "0 4px 16px rgba(26,107,60,0.3)",
          }}>
            <Plus size={16} /> Nouvelle annonce
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
          {[
            { label: "Annonces actives", value: annoncesActives.length, color: "#1A6B3C" },
            { label: "Total annonces", value: annonces.length, color: "#5a5650" },
            { label: "Commandes reçues", value: commandes.length, color: "#E8A020" },
            { label: "En attente", value: commandesEnAttente.length, color: "#C0392B" },
          ].map(s => (
            <div key={s.label} style={{ background: "white", borderRadius: 12, padding: "12px 20px", border: "1px solid #e2ddd6", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 11, color: "#9a9590", fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#F7F5F0", borderRadius: 12, padding: 4, marginBottom: 24, width: "fit-content" }}>
        {[
          { key: "annonces", label: `Mes annonces (${annonces.length})` },
          { key: "commandes", label: `Commandes reçues (${commandes.length})`, badge: commandesEnAttente.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
            padding: "9px 20px", borderRadius: 10, border: "none", cursor: "pointer",
            background: activeTab === tab.key ? "white" : "transparent",
            color: activeTab === tab.key ? "#1A6B3C" : "#9a9590",
            fontWeight: activeTab === tab.key ? 700 : 500, fontSize: 13,
            boxShadow: activeTab === tab.key ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8,
          }}>
            {tab.label}
            {tab.badge && tab.badge > 0 && (
              <span style={{ background: "#C0392B", color: "white", fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 10 }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <Loader2 size={28} color="#1A6B3C" style={{ animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (

        /* ─── ONGLET ANNONCES ─── */
        activeTab === "annonces" ? (
          annonces.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 20, border: "1px solid #e2ddd6" }}>
              <Package size={48} color="#e2ddd6" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#1C1A17", marginBottom: 8 }}>Aucune annonce publiée</h3>
              <p style={{ fontSize: 13, color: "#9a9590", marginBottom: 20 }}>Commencez à vendre votre récolte directement aux acheteurs.</p>
              <Link href="/dashboard/marketplace/vendre" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "linear-gradient(135deg, #1A6B3C, #4CAF50)", borderRadius: 12, color: "white", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
                <Plus size={16} /> Publier ma première annonce
              </Link>
            </div>
          ) : (
            <div>
              {annoncesActives.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1C1A17", marginBottom: 14 }}>
                    ✅ Annonces actives ({annoncesActives.length})
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {annoncesActives.map(a => (
                      <AnnonceRow key={a.id} annonce={a} onDelete={archiverAnnonce} deletingId={deletingId} />
                    ))}
                  </div>
                </div>
              )}
              {annoncesInactives.length > 0 && (
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#9a9590", marginBottom: 14 }}>
                    Annonces inactives ({annoncesInactives.length})
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: 0.7 }}>
                    {annoncesInactives.map(a => (
                      <AnnonceRow key={a.id} annonce={a} onDelete={archiverAnnonce} deletingId={deletingId} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        ) : (

          /* ─── ONGLET COMMANDES ─── */
          commandes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 20, border: "1px solid #e2ddd6" }}>
              <ShoppingCart size={48} color="#e2ddd6" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#1C1A17", marginBottom: 8 }}>Aucune commande reçue</h3>
              <p style={{ fontSize: 13, color: "#9a9590" }}>Les commandes des acheteurs apparaîtront ici.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {commandes.map(c => (
                <div key={c.id} className="annonce-row" style={{
                  background: "white", borderRadius: 16, padding: "20px 24px",
                  border: `1px solid ${c.statut === "en_attente" ? "#E8A02040" : "#e2ddd6"}`,
                  boxShadow: c.statut === "en_attente" ? "0 4px 16px rgba(232,160,32,0.08)" : "none",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20,
                          background: c.statut === "en_attente" ? "#fffbf0" : c.statut === "acceptee" ? "#f0faf4" : "#fef2f2",
                          color: c.statut === "en_attente" ? "#E8A020" : c.statut === "acceptee" ? "#1A6B3C" : "#C0392B",
                        }}>
                          {c.statut === "en_attente" ? "⏳ En attente" : c.statut === "acceptee" ? "✅ Acceptée" : "❌ Refusée"}
                        </span>
                        <span style={{ fontSize: 11, color: "#9a9590" }}>
                          {new Date(c.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#1C1A17" }}>
                        Commande #{c.id} — {c.quantite} unité(s)
                      </p>
                      {c.message && (
                        <p style={{ fontSize: 12, color: "#5a5650", marginTop: 4, fontStyle: "italic" }}>
                          💬 &quot;{c.message}&quot;
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "#1A6B3C" }}>
                        {new Intl.NumberFormat("fr-FR").format(c.prix_total)} FCFA
                      </div>
                    </div>
                  </div>

                  {c.statut === "en_attente" && (
                    <div style={{ display: "flex", gap: 10, paddingTop: 12, borderTop: "1px solid #e2ddd6" }}>
                      <button onClick={() => updateStatutCommande(c.id, "acceptee")} style={{
                        flex: 1, padding: "9px", borderRadius: 10, border: "none",
                        background: "linear-gradient(135deg, #1A6B3C, #4CAF50)",
                        color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}>
                        <CheckCircle size={14} /> Accepter
                      </button>
                      <button onClick={() => updateStatutCommande(c.id, "refusee")} style={{
                        flex: 1, padding: "9px", borderRadius: 10,
                        border: "1px solid #fecaca", background: "#fef2f2",
                        color: "#C0392B", fontWeight: 700, fontSize: 13, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}>
                        <AlertTriangle size={14} /> Refuser
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function AnnonceRow({ annonce: a, onDelete, deletingId }: {
  annonce: any
  onDelete: (id: number) => void
  deletingId: number | null
}) {
  const statutConfig = STATUT_CONFIG[a.statut] || STATUT_CONFIG.active

  return (
    <div id={`annonce-${a.id}`} className="annonce-row" style={{
      background: "white", borderRadius: 16, overflow: "hidden",
      border: "1px solid #e2ddd6", display: "flex",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "all 0.3s",
    }}>
      {/* Image/Emoji */}
      <div style={{ width: 90, background: "#f0faf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 32 }}>
        {a.image
          ? <div style={{ width: 90, height: "100%", position: "relative" }}><Image src={`http://127.0.0.1:9000${a.image}`} alt={a.titre} fill style={{ objectFit: "cover" }} /></div>
          : CULTURE_EMOJIS[a.culture] || "🌾"
        }
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                background: statutConfig.bg, color: statutConfig.color,
                border: `1px solid ${statutConfig.color}30`,
              }}>
                {statutConfig.label}
              </span>
              {a.nb_commandes > 0 && (
                <span style={{ fontSize: 10, color: "#E8A020", fontWeight: 700 }}>
                  🛒 {a.nb_commandes} commande{a.nb_commandes > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 14, color: "#1C1A17", marginBottom: 4 }}>{a.titre}</h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "#9a9590", display: "flex", alignItems: "center", gap: 3 }}>
                <Scale size={11} /> {a.quantite} {a.unite}
              </span>
              {a.region && <span style={{ fontSize: 11, color: "#9a9590", display: "flex", alignItems: "center", gap: 3 }}>
                <MapPin size={11} /> {a.region}
              </span>}
              <span style={{ fontSize: 11, color: "#9a9590", display: "flex", alignItems: "center", gap: 3 }}>
                <Clock size={11} /> {new Date(a.created_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "#1A6B3C" }}>
              {new Intl.NumberFormat("fr-FR").format(a.prix)}
            </div>
            <div style={{ fontSize: 10, color: "#9a9590" }}>FCFA/{a.unite}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "16px 16px 16px 0", justifyContent: "center" }}>
        <Link href={`/dashboard/marketplace/${a.id}`} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
          background: "#f0faf4", borderRadius: 8, textDecoration: "none",
          color: "#1A6B3C", fontSize: 12, fontWeight: 600,
        }}>
          <Eye size={13} /> Voir
        </Link>
        {a.statut === "active" && (
          <>
            <Link href={`/dashboard/marketplace/editer/${a.id}`} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
              background: "#fffbf0", borderRadius: 8, textDecoration: "none",
              color: "#E8A020", fontSize: 12, fontWeight: 600,
            }}>
              <Edit3 size={13} /> Éditer
            </Link>
            <button
              onClick={() => onDelete(a.id)}
              disabled={deletingId === a.id}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
                background: "#fef2f2", border: "none", borderRadius: 8,
                color: "#C0392B", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              {deletingId === a.id
                ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} />
                : <Trash2 size={13} />}
              Archiver
            </button>
          </>
        )}
      </div>
    </div>
  )
}
