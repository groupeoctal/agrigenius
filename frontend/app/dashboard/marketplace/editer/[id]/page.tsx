"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import {
  ArrowLeft, Save, Loader2, CheckCircle, AlertTriangle,
  ChevronDown, Image as ImageIcon, Info, RotateCcw
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

const CULTURES = [
  "Cacao","Café","Banane plantain","Manioc","Maïs","Palmier à huile",
  "Tomate","Arachide","Soja","Ananas","Patate douce","Gombo","Piment",
  "Haricot","Niébé","Igname","Macabo","Aubergine","Concombre",
]
const REGIONS = ["Adamaoua","Centre","Est","Extrême-Nord","Littoral","Nord","Nord-Ouest","Ouest","Sud","Sud-Ouest"]
const UNITES = ["kg","tonne","sac (50kg)","sac (25kg)","régime","caisse","botte","unité"]

const STATUT_OPTIONS = [
  { value: "active", label: "Active", color: "#1A6B3C" },
  { value: "vendue", label: "Vendue", color: "#4CAF50" },
  { value: "expiree", label: "Expirée", color: "#9a9590" },
  { value: "archivee", label: "Archivée", color: "#C0392B" },
]

export default function EditerAnnoncePage() {
  const { id } = useParams()
  const { token } = useAuth()
  const router = useRouter()
  const pageRef = useRef<HTMLDivElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    titre: "", culture: "", quantite: "",
    prix: "", unite: "kg", description: "",
    region: "", localite: "", statut: "active",
  })

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".form-section", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" })
    }, pageRef)
    chargerAnnonce()
    return () => ctx.revert()
  }, [id])

  const chargerAnnonce = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/annonces/${id}`)
      if (res.ok) {
        const data = await res.json()
        setForm({
          titre: data.titre || "",
          culture: data.culture || "",
          quantite: data.quantite?.toString() || "",
          prix: data.prix?.toString() || "",
          unite: data.unite || "kg",
          description: data.description || "",
          region: data.region || "",
          localite: data.localite || "",
          statut: data.statut || "active",
        })
      } else {
        setError("Annonce introuvable")
      }
    } catch (e) {
      console.error(e)
      setError("Erreur lors du chargement")
    } finally {
      setIsLoading(false)
    }
  }

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  const prixTotal = form.quantite && form.prix
    ? new Intl.NumberFormat("fr-FR").format(parseFloat(form.quantite) * parseFloat(form.prix)) + " FCFA"
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titre || !form.quantite || !form.prix) {
      setError("Veuillez remplir tous les champs obligatoires")
      gsap.fromTo(".error-msg", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 })
      return
    }
    setIsSubmitting(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("titre", form.titre)
      fd.append("quantite", form.quantite)
      fd.append("prix", form.prix)
      fd.append("description", form.description)
      fd.append("statut", form.statut)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/annonces/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Erreur lors de la mise à jour")
      }
      setSuccess(true)
      gsap.fromTo(".success-card", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" })
      setTimeout(() => router.push("/dashboard/marketplace/mes-annonces"), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally { setIsSubmitting(false) }
  }

  const selectStyle = {
    width: "100%", padding: "11px 36px 11px 14px",
    border: "2px solid #e2ddd6", borderRadius: 12, fontSize: 14,
    appearance: "none" as const, outline: "none", background: "white",
    fontFamily: "var(--font-sans)", transition: "border-color 0.2s", cursor: "pointer",
  }

  if (isLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <Loader2 size={28} color="#1A6B3C" style={{ animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (success) return (
    <div style={{ padding: "60px 36px", maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
      <div className="success-card" style={{
        background: "white", borderRadius: 24, padding: 48, border: "2px solid #4CAF5040",
        boxShadow: "0 8px 40px rgba(26,107,60,0.1)",
      }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #1A6B3C, #4CAF50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(26,107,60,0.3)" }}>
          <CheckCircle size={36} color="white" />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#1C1A17", marginBottom: 8 }}>Annonce mise à jour !</h2>
        <p style={{ fontSize: 14, color: "#9a9590", marginBottom: 4 }}>Vos modifications ont été enregistrées avec succès.</p>
        <p style={{ fontSize: 12, color: "#9a9590" }}>Redirection dans 2 secondes...</p>
      </div>
    </div>
  )

  return (
    <div ref={pageRef} style={{ padding: "32px 36px", maxWidth: 800, margin: "0 auto" }}>
      <Link href="/dashboard/marketplace/mes-annonces" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#9a9590", textDecoration: "none", fontSize: 13, fontWeight: 500, marginBottom: 20 }}>
        <ArrowLeft size={14} /> Retour à mes annonces
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #1A6B3C, #4CAF50)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(26,107,60,0.3)" }}>
          <Save size={22} color="white" />
        </div>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "#1C1A17" }}>Modifier l&apos;annonce</h1>
          <p style={{ fontSize: 13, color: "#9a9590" }}>Mettez à jour les informations de votre annonce</p>
        </div>
      </div>

      {error && (
        <div className="error-msg" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", marginBottom: 20, color: "#C0392B", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* Informations produit */}
        <div className="form-section" style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e2ddd6", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "#1C1A17", marginBottom: 20 }}>Informations sur le produit</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>Titre de l&apos;annonce <span style={{ color: "#C0392B" }}>*</span></label>
            <input value={form.titre} onChange={e => update("titre", e.target.value)} placeholder="Ex: Cacao sec de qualité supérieure — Récolte 2025"
              style={{ width: "100%", padding: "11px 14px", border: "2px solid #e2ddd6", borderRadius: 12, fontSize: 14, outline: "none", fontFamily: "var(--font-sans)", transition: "border-color 0.2s" }}
              onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
              onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>Culture</label>
              <div style={{ position: "relative" }}>
                <input value={form.culture} disabled
                  style={{ ...selectStyle, background: "#F7F5F0", cursor: "not-allowed", color: "#9a9590" }}
                />
              </div>
              <p style={{ fontSize: 11, color: "#9a9590", marginTop: 4, fontStyle: "italic" }}>
                La culture ne peut pas être modifiée
              </p>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>Unité</label>
              <div style={{ position: "relative" }}>
                <input value={form.unite} disabled
                  style={{ ...selectStyle, background: "#F7F5F0", cursor: "not-allowed", color: "#9a9590" }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>Quantité disponible <span style={{ color: "#C0392B" }}>*</span></label>
              <input type="number" min="0" step="0.1" value={form.quantite} onChange={e => update("quantite", e.target.value)} placeholder="Ex: 500"
                style={{ width: "100%", padding: "11px 14px", border: "2px solid #e2ddd6", borderRadius: 12, fontSize: 14, outline: "none", fontFamily: "var(--font-sans)" }}
                onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
                onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>Prix par {form.unite} (FCFA) <span style={{ color: "#C0392B" }}>*</span></label>
              <input type="number" min="0" value={form.prix} onChange={e => update("prix", e.target.value)} placeholder="Ex: 1500"
                style={{ width: "100%", padding: "11px 14px", border: "2px solid #e2ddd6", borderRadius: 12, fontSize: 14, outline: "none", fontFamily: "var(--font-sans)" }}
                onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
                onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
              />
            </div>
          </div>

          {/* Total estimé */}
          {prixTotal && (
            <div style={{ background: "#f0faf4", borderRadius: 10, padding: "10px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#5a5650" }}>Valeur totale estimée :</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "#1A6B3C" }}>{prixTotal}</span>
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>Description</label>
            <textarea value={form.description} onChange={e => update("description", e.target.value)}
              placeholder="Décrivez votre produit : qualité, conditionnement, conditions de livraison, etc."
              rows={4}
              style={{ width: "100%", padding: "11px 14px", border: "2px solid #e2ddd6", borderRadius: 12, fontSize: 14, outline: "none", fontFamily: "var(--font-sans)", resize: "vertical", transition: "border-color 0.2s" }}
              onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
              onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
            />
          </div>
        </div>

        {/* Statut */}
        <div className="form-section" style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e2ddd6", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "#1C1A17", marginBottom: 16 }}>Statut de l&apos;annonce</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {STATUT_OPTIONS.map(opt => (
              <button key={opt.value} type="button" onClick={() => update("statut", opt.value)} style={{
                padding: "12px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                border: `2px solid ${form.statut === opt.value ? opt.color : "#e2ddd6"}`,
                background: form.statut === opt.value ? `${opt.color}10` : "white",
                transition: "all 0.2s",
              }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: form.statut === opt.value ? opt.color : "#5a5650" }}>
                  {opt.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info localisation */}
        <div className="form-section" style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e2ddd6", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "#1C1A17", marginBottom: 8 }}>📍 Localisation</h3>
          <p style={{ fontSize: 12, color: "#9a9590", marginBottom: 16, fontStyle: "italic" }}>
            La localisation ne peut pas être modifiée après la création de l&apos;annonce
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>Région</label>
              <input value={form.region || "Non spécifiée"} disabled
                style={{ ...selectStyle, background: "#F7F5F0", cursor: "not-allowed", color: "#9a9590" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>Ville / Localité</label>
              <input value={form.localite || "Non spécifiée"} disabled
                style={{ ...selectStyle, background: "#F7F5F0", cursor: "not-allowed", color: "#9a9590" }}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/dashboard/marketplace/mes-annonces" style={{
            flex: 1, padding: "15px", textAlign: "center",
            background: "white", border: "2px solid #e2ddd6", borderRadius: 14,
            color: "#5a5650", textDecoration: "none", fontSize: 16, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            Annuler
          </Link>
          <button type="submit" disabled={isSubmitting} style={{
            flex: 2, padding: "15px",
            background: isSubmitting ? "#a0c4b0" : "linear-gradient(135deg, #1A6B3C, #2d8a52)",
            color: "white", border: "none", borderRadius: 14,
            fontSize: 16, fontWeight: 700, cursor: isSubmitting ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 4px 16px rgba(26,107,60,0.3)", transition: "all 0.3s",
          }}>
            {isSubmitting
              ? <><Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} /> Enregistrement...</>
              : <><Save size={18} /> Enregistrer les modifications</>}
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>
    </div>
  )
}
