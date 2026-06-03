"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import {
  ArrowLeft, ShoppingCart, Package, Clock, MapPin,
  Phone, Mail, Loader2, CheckCircle, XCircle, AlertCircle,
  Eye, MessageSquare, ChevronRight
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"

const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  en_attente: { label: "En attente", color: "#E8A020", bg: "#fffbf0", icon: Clock },
  acceptee:   { label: "Acceptée", color: "#1A6B3C", bg: "#f0faf4", icon: CheckCircle },
  refusee:    { label: "Refusée", color: "#C0392B", bg: "#fef2f2", icon: XCircle },
}

const CULTURE_EMOJIS: Record<string, string> = {
  "Cacao": "🍫", "Café": "☕", "Banane plantain": "🍌", "Manioc": "🌿",
  "Maïs": "🌽", "Tomate": "🍅", "Arachide": "🥜", "Soja": "🫘",
  "Ananas": "🍍", "Palmier à huile": "🌴",
}

export default function MesCommandesPage() {
  const { token } = useAuth()
  const pageRef = useRef<HTMLDivElement>(null)

  const [commandes, setCommandes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>("tous")

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".page-header", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6 })
    }, pageRef)
    chargerCommandes()
    return () => ctx.revert()
  }, [])

  const chargerCommandes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/mes-commandes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCommandes(data)
      }
    } catch (e) { console.error(e) }
    finally {
      setIsLoading(false)
      setTimeout(() => {
        gsap.fromTo(".commande-card",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" }
        )
      }, 100)
    }
  }

  const commandesFiltrees = filter === "tous"
    ? commandes
    : commandes.filter(c => c.statut === filter)

  const stats = {
    total: commandes.length,
    en_attente: commandes.filter(c => c.statut === "en_attente").length,
    acceptees: commandes.filter(c => c.statut === "acceptee").length,
    refusees: commandes.filter(c => c.statut === "refusee").length,
  }

  return (
    <div ref={pageRef} style={{ padding: "32px 36px", maxWidth: 1000, margin: "0 auto" }}>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 28 }}>
        <Link href="/dashboard/marketplace" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#9a9590", textDecoration: "none", fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
          <ArrowLeft size={14} /> Marketplace
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #E8A020, #F39C12)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(232,160,32,0.3)" }}>
              <ShoppingCart size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "#1C1A17" }}>Mes Commandes</h1>
              <p style={{ fontSize: 13, color: "#9a9590" }}>Suivez l&apos;état de vos demandes d&apos;achat</p>
            </div>
          </div>
          <Link href="/dashboard/marketplace" style={{
            display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
            background: "linear-gradient(135deg, #1A6B3C, #4CAF50)", borderRadius: 12,
            color: "white", textDecoration: "none", fontSize: 13, fontWeight: 700,
            boxShadow: "0 4px 16px rgba(26,107,60,0.3)",
          }}>
            <Package size={16} /> Parcourir les produits
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
          {[
            { label: "Total commandes", value: stats.total, color: "#5a5650" },
            { label: "En attente", value: stats.en_attente, color: "#E8A020" },
            { label: "Acceptées", value: stats.acceptees, color: "#1A6B3C" },
            { label: "Refusées", value: stats.refusees, color: "#C0392B" },
          ].map(s => (
            <div key={s.label} style={{ background: "white", borderRadius: 12, padding: "12px 20px", border: "1px solid #e2ddd6", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 11, color: "#9a9590", fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: 6, background: "#F7F5F0", borderRadius: 12, padding: 4, marginBottom: 24, width: "fit-content" }}>
        {[
          { key: "tous", label: `Toutes (${stats.total})` },
          { key: "en_attente", label: `En attente (${stats.en_attente})`, badge: stats.en_attente > 0 },
          { key: "acceptee", label: `Acceptées (${stats.acceptees})` },
          { key: "refusee", label: `Refusées (${stats.refusees})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
            padding: "9px 20px", borderRadius: 10, border: "none", cursor: "pointer",
            background: filter === tab.key ? "white" : "transparent",
            color: filter === tab.key ? "#1A6B3C" : "#9a9590",
            fontWeight: filter === tab.key ? 700 : 500, fontSize: 13,
            boxShadow: filter === tab.key ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8,
          }}>
            {tab.label}
            {tab.badge && (
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8A020" }} />
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <Loader2 size={28} color="#E8A020" style={{ animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : commandesFiltrees.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 20, border: "1px solid #e2ddd6" }}>
          <ShoppingCart size={48} color="#e2ddd6" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#1C1A17", marginBottom: 8 }}>
            {filter === "tous" ? "Aucune commande passée" : `Aucune commande ${STATUT_CONFIG[filter]?.label.toLowerCase() || ""}`}
          </h3>
          <p style={{ fontSize: 13, color: "#9a9590", marginBottom: 20 }}>
            {filter === "tous" ? "Parcourez les produits et passez votre première commande." : "Aucune commande avec ce statut pour le moment."}
          </p>
          {filter === "tous" && (
            <Link href="/dashboard/marketplace" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "linear-gradient(135deg, #1A6B3C, #4CAF50)", borderRadius: 12, color: "white", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
              <Package size={16} /> Parcourir les produits
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {commandesFiltrees.map(cmd => {
            const statutConfig = STATUT_CONFIG[cmd.statut] || STATUT_CONFIG.en_attente
            const Icon = statutConfig.icon
            const annonce = cmd.annonce
            const vendeur = annonce?.vendeur

            return (
              <div key={cmd.id} className="commande-card" style={{
                background: "white", borderRadius: 16, border: "1px solid #e2ddd6",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)", overflow: "hidden",
                transition: "all 0.3s",
              }}>
                <div style={{ display: "flex" }}>
                  {/* Image */}
                  <div style={{ width: 140, height: 140, background: "#f0faf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                    {annonce?.image ? (
                      <Image src={`http://127.0.0.1:9000${annonce.image}`} alt={annonce.titre} fill style={{ objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: 48 }}>{CULTURE_EMOJIS[annonce?.culture] || "🌾"}</span>
                    )}
                  </div>

                  {/* Contenu */}
                  <div style={{ flex: 1, padding: "20px 24px" }}>
                    {/* Header commande */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                            background: statutConfig.bg, color: statutConfig.color,
                            display: "flex", alignItems: "center", gap: 4,
                          }}>
                            <Icon size={12} /> {statutConfig.label}
                          </span>
                          <span style={{ fontSize: 11, color: "#9a9590" }}>
                            Commande #{cmd.id}
                          </span>
                          <span style={{ fontSize: 11, color: "#9a9590" }}>
                            {new Date(cmd.created_at).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1C1A17", marginBottom: 4 }}>
                          {annonce?.titre || "Annonce supprimée"}
                        </h3>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: "#9a9590" }}>
                            📦 {cmd.quantite} {annonce?.unite || "unité(s)"}
                          </span>
                          <span style={{ fontSize: 12, color: "#9a9590" }}>
                            @ {new Intl.NumberFormat("fr-FR").format(annonce?.prix || 0)} FCFA/{annonce?.unite || "unité"}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "#1A6B3C" }}>
                          {new Intl.NumberFormat("fr-FR").format(cmd.prix_total)} FCFA
                        </div>
                        <div style={{ fontSize: 11, color: "#9a9590" }}>Prix total</div>
                      </div>
                    </div>

                    {/* Message */}
                    {cmd.message && (
                      <div style={{ background: "#F7F5F0", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: "#9a9590", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          💬 Votre message
                        </div>
                        <p style={{ fontSize: 12, color: "#5a5650", fontStyle: "italic" }}>
                          &quot;{cmd.message}&quot;
                        </p>
                      </div>
                    )}

                    {/* Infos vendeur */}
                    {vendeur && (
                      <div style={{ borderTop: "1px solid #e2ddd6", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 10, color: "#9a9590", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Vendeur
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 10,
                              background: "linear-gradient(135deg, #1A6B3C, #4CAF50)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "white", fontWeight: 700, fontSize: 12,
                            }}>
                              {vendeur.prenom?.charAt(0)}{vendeur.nom?.charAt(0)}
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1A17" }}>
                                {vendeur.prenom} {vendeur.nom}
                              </p>
                              <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#9a9590" }}>
                                {vendeur.region && (
                                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                    <MapPin size={10} /> {vendeur.region}
                                  </span>
                                )}
                                {vendeur.telephone && (
                                  <a href={`tel:${vendeur.telephone}`} style={{ display: "flex", alignItems: "center", gap: 3, color: "#1A6B3C", textDecoration: "none", fontWeight: 600 }}>
                                    <Phone size={10} /> {vendeur.telephone}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {annonce && (
                          <Link href={`/dashboard/marketplace/${annonce.id}`} style={{
                            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                            background: "#f0faf4", borderRadius: 10, textDecoration: "none",
                            color: "#1A6B3C", fontSize: 12, fontWeight: 600,
                          }}>
                            <Eye size={13} /> Voir l&apos;annonce <ChevronRight size={12} />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
