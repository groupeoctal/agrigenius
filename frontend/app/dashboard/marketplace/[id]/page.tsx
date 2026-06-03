"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import {
  ArrowLeft, MapPin, Scale, Clock, Phone, User,
  ShoppingCart, MessageSquare, CheckCircle, AlertTriangle,
  Loader2, Share2, Heart, ChevronRight, Package
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"
import { useParams, useRouter } from "next/navigation"

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  recolte:     { label: "Récolte disponible", color: "#1A6B3C", bg: "#f0faf4", emoji: "🌾" },
  pre_recolte: { label: "Pré-récolte",        color: "#E8A020", bg: "#fffbf0", emoji: "🕐" },
}

const CULTURE_EMOJIS: Record<string, string> = {
  "Cacao": "🍫", "Café": "☕", "Banane plantain": "🍌", "Manioc": "🌿",
  "Maïs": "🌽", "Tomate": "🍅", "Arachide": "🥜", "Soja": "🫘",
  "Ananas": "🍍", "Palmier à huile": "🌴", "Gombo": "🫛", "Piment": "🌶️",
}

export default function AnnonceDetailPage() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const router = useRouter()
  const pageRef = useRef<HTMLDivElement>(null)

  const [annonce, setAnnonce] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCommande, setShowCommande] = useState(false)
  const [quantite, setQuantite] = useState("")
  const [message, setMessage] = useState("")
  const [isOrdering, setIsOrdering] = useState(false)
  const [success, setSuccess] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    chargerAnnonce()
  }, [id])

  const chargerAnnonce = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/annonces/${id}`)
      if (res.ok) {
        const data = await res.json()
        setAnnonce(data)
      }
    } catch (e) { console.error(e) }
    finally {
      setIsLoading(false)
      setTimeout(() => {
        gsap.fromTo(".detail-content", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" })
      }, 100)
    }
  }

  const passerCommande = async () => {
    if (!quantite || parseFloat(quantite) <= 0) {
      setError("Veuillez saisir une quantité valide")
      return
    }
    setIsOrdering(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("annonce_id", String(id))
      fd.append("quantite", quantite)
      if (message) fd.append("message", message)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/commandes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Erreur lors de la commande")
      }
      const data = await res.json()
      setSuccess(data)
      setShowCommande(false)
      gsap.fromTo(".success-banner", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5 })
    } catch (err: any) {
      setError(err.message)
    } finally { setIsOrdering(false) }
  }

  if (isLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <Loader2 size={28} color="#1A6B3C" style={{ animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (!annonce) return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <p style={{ color: "#9a9590" }}>Annonce introuvable.</p>
      <Link href="/dashboard/marketplace" style={{ color: "#1A6B3C" }}>Retour</Link>
    </div>
  )

  const typeConfig = TYPE_LABELS[annonce.type_vente] || TYPE_LABELS.recolte
  const prixTotal = quantite ? new Intl.NumberFormat("fr-FR").format(parseFloat(quantite) * annonce.prix) : null
  const isOwner = user?.id === annonce.vendeur?.id

  return (
    <div ref={pageRef} style={{ padding: "32px 36px", maxWidth: 900, margin: "0 auto" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <Link href="/dashboard/marketplace" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#9a9590", textDecoration: "none", fontSize: 13, fontWeight: 500, marginBottom: 20 }}>
        <ArrowLeft size={14} /> Retour à la marketplace
      </Link>

      {/* Succès commande */}
      {success && (
        <div className="success-banner" style={{
          background: "linear-gradient(135deg, #1A6B3C, #4CAF50)",
          borderRadius: 16, padding: "20px 24px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 16,
          boxShadow: "0 8px 24px rgba(26,107,60,0.25)",
        }}>
          <CheckCircle size={28} color="white" />
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: "white", marginBottom: 4 }}>
              ✅ Demande envoyée au vendeur !
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
              Prix total : <strong>{new Intl.NumberFormat("fr-FR").format(success.prix_total)} FCFA</strong> — Le vendeur vous contactera prochainement.
            </p>
          </div>
          <Link href="/dashboard/marketplace" style={{ marginLeft: "auto", padding: "8px 16px", background: "rgba(255,255,255,0.2)", borderRadius: 10, color: "white", fontWeight: 700, fontSize: 12, textDecoration: "none", flexShrink: 0 }}>
            Voir d&apos;autres produits →
          </Link>
        </div>
      )}

      <div className="detail-content" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>

        {/* Contenu principal */}
        <div>
          {/* Image */}
          <div style={{ height: 320, borderRadius: 20, overflow: "hidden", background: "#f0faf4", marginBottom: 20, position: "relative" }}>
            {annonce.image ? (
              <Image src={`http://127.0.0.1:9000${annonce.image}`} alt={annonce.titre} fill style={{ objectFit: "cover" }} />
            ) : (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ fontSize: 64 }}>{CULTURE_EMOJIS[annonce.culture] || "🌾"}</span>
                <span style={{ fontSize: 14, color: "#9a9590", fontWeight: 500 }}>{annonce.culture}</span>
              </div>
            )}
            <div style={{ position: "absolute", top: 14, left: 14, background: typeConfig.bg, color: typeConfig.color, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, border: `1px solid ${typeConfig.color}30` }}>
              {typeConfig.emoji} {typeConfig.label}
            </div>
          </div>

          {/* Infos */}
          <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e2ddd6", marginBottom: 16 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#1C1A17", marginBottom: 12 }}>
              {annonce.titre}
            </h1>

            <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#9a9590", display: "flex", alignItems: "center", gap: 4 }}>
                <Scale size={13} /> {annonce.quantite} {annonce.unite} disponibles
              </span>
              {annonce.region && <span style={{ fontSize: 12, color: "#9a9590", display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={13} /> {annonce.region}{annonce.localite ? ` — ${annonce.localite}` : ""}
              </span>}
              <span style={{ fontSize: 12, color: "#9a9590", display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={13} /> Publié le {new Date(annonce.created_at).toLocaleDateString("fr-FR")}
              </span>
              {annonce.nb_commandes > 0 && (
                <span style={{ fontSize: 12, color: "#E8A020", fontWeight: 600 }}>
                  🔥 {annonce.nb_commandes} demande{annonce.nb_commandes > 1 ? "s" : ""} déjà reçue{annonce.nb_commandes > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {annonce.description && (
              <div style={{ borderTop: "1px solid #e2ddd6", paddingTop: 16 }}>
                <h3 style={{ fontWeight: 700, fontSize: 14, color: "#1C1A17", marginBottom: 8 }}>Description</h3>
                <p style={{ fontSize: 14, color: "#5a5650", lineHeight: 1.7 }}>{annonce.description}</p>
              </div>
            )}
          </div>

          {/* Formulaire commande (inline) */}
          {showCommande && !isOwner && (
            <div style={{ background: "white", borderRadius: 16, padding: 24, border: "2px solid #1A6B3C40", marginBottom: 16 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1C1A17", marginBottom: 20 }}>
                📦 Votre demande
              </h3>

              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#C0392B", fontSize: 13, display: "flex", gap: 8 }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} /> {error}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                  Quantité souhaitée ({annonce.unite}) <span style={{ color: "#C0392B" }}>*</span>
                  <span style={{ fontWeight: 400, color: "#9a9590", marginLeft: 8 }}>
                    Max : {annonce.quantite} {annonce.unite}
                  </span>
                </label>
                <input type="number" min="0.1" step="0.1" max={annonce.quantite} value={quantite}
                  onChange={e => setQuantite(e.target.value)}
                  placeholder={`Ex: ${Math.min(10, annonce.quantite)}`}
                  style={{ width: "100%", padding: "11px 14px", border: "2px solid #e2ddd6", borderRadius: 12, fontSize: 14, outline: "none", fontFamily: "var(--font-sans)", transition: "border-color 0.2s" }}
                  onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
                  onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                />
              </div>

              {prixTotal && (
                <div style={{ background: "#f0faf4", borderRadius: 10, padding: "10px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#5a5650" }}>Total estimé :</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "#1A6B3C" }}>{prixTotal} FCFA</span>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>Message au vendeur</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Ex: Bonjour, je souhaite acheter votre cacao. Êtes-vous disponible pour la livraison à Yaoundé ?"
                  rows={3}
                  style={{ width: "100%", padding: "11px 14px", border: "2px solid #e2ddd6", borderRadius: 12, fontSize: 14, outline: "none", fontFamily: "var(--font-sans)", resize: "vertical" }}
                  onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
                  onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setShowCommande(false)} style={{ flex: 1, padding: "12px", background: "white", border: "2px solid #e2ddd6", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#5a5650" }}>
                  Annuler
                </button>
                <button onClick={passerCommande} disabled={isOrdering} style={{
                  flex: 2, padding: "12px", background: "linear-gradient(135deg, #1A6B3C, #2d8a52)",
                  border: "none", borderRadius: 12, cursor: isOrdering ? "not-allowed" : "pointer",
                  fontSize: 13, fontWeight: 700, color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 16px rgba(26,107,60,0.3)",
                }}>
                  {isOrdering
                    ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Envoi...</>
                    : <><CheckCircle size={14} /> Envoyer ma demande</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ height: "fit-content", position: "sticky", top: 20 }}>

          {/* Prix */}
          <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e2ddd6", marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "#1A6B3C" }}>
                {new Intl.NumberFormat("fr-FR").format(annonce.prix)}
              </div>
              <div style={{ fontSize: 13, color: "#9a9590" }}>FCFA par {annonce.unite}</div>
            </div>

            <div style={{ borderTop: "1px solid #e2ddd6", paddingTop: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#5a5650" }}>Quantité disponible</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1C1A17" }}>{annonce.quantite} {annonce.unite}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#5a5650" }}>Valeur totale</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1A6B3C" }}>
                  {new Intl.NumberFormat("fr-FR").format(annonce.quantite * annonce.prix)} FCFA
                </span>
              </div>
            </div>

            {isOwner ? (
              <div style={{ background: "#f0faf4", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "#1A6B3C", fontWeight: 600, marginBottom: 8 }}>C&apos;est votre annonce</p>
                <Link href="/dashboard/marketplace/mes-annonces" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  color: "#1A6B3C", textDecoration: "none", fontSize: 13, fontWeight: 700,
                }}>
                  <Package size={14} /> Gérer mes annonces <ChevronRight size={12} />
                </Link>
              </div>
            ) : (
              <button onClick={() => setShowCommande(!showCommande)} style={{
                width: "100%", padding: "14px",
                background: showCommande ? "white" : "linear-gradient(135deg, #1A6B3C, #2d8a52)",
                border: showCommande ? "2px solid #1A6B3C" : "none",
                borderRadius: 14, cursor: "pointer",
                fontSize: 14, fontWeight: 700,
                color: showCommande ? "#1A6B3C" : "white",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: showCommande ? "none" : "0 4px 16px rgba(26,107,60,0.3)",
                transition: "all 0.3s",
              }}>
                <ShoppingCart size={16} /> {showCommande ? "Fermer" : "Faire une demande"}
              </button>
            )}
          </div>

          {/* Vendeur */}
          {annonce.vendeur && (
            <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #e2ddd6" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#9a9590", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14 }}>Vendeur</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "linear-gradient(135deg, #1A6B3C, #4CAF50)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 800, fontSize: 16,
                }}>
                  {annonce.vendeur.prenom?.charAt(0)}{annonce.vendeur.nom?.charAt(0)}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "#1C1A17" }}>
                    {annonce.vendeur.prenom} {annonce.vendeur.nom}
                  </p>
                  {annonce.vendeur.region && (
                    <p style={{ fontSize: 12, color: "#9a9590", display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={11} /> {annonce.vendeur.region}
                    </p>
                  )}
                </div>
              </div>
              {annonce.vendeur.telephone && (
                <a href={`tel:${annonce.vendeur.telephone}`} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                  background: "#f0faf4", borderRadius: 10, textDecoration: "none",
                  color: "#1A6B3C", fontSize: 13, fontWeight: 600, border: "1px solid rgba(26,107,60,0.2)",
                }}>
                  <Phone size={14} /> {annonce.vendeur.telephone}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
