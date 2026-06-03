"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import {
  ArrowLeft, Plus, Upload, CheckCircle, Loader2,
  ChevronDown, Image as ImageIcon, Info, RotateCcw
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

const CULTURES = [
  "Cacao","Café","Banane plantain","Manioc","Maïs","Palmier à huile",
  "Tomate","Arachide","Soja","Ananas","Patate douce","Gombo","Piment",
  "Haricot","Niébé","Igname","Macabo","Aubergine","Concombre",
]
const REGIONS = ["Adamaoua","Centre","Est","Extrême-Nord","Littoral","Nord","Nord-Ouest","Ouest","Sud","Sud-Ouest"]
const UNITES = ["kg","tonne","sac (50kg)","sac (25kg)","régime","caisse","botte","unité"]

export default function VendrePage() {
  const { token } = useAuth()
  const router = useRouter()
  const pageRef = useRef<HTMLDivElement>(null)

  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    titre: "", culture: "", quantite: "",
    prix: "", unite: "kg", description: "",
    region: "", localite: "", type_vente: "recolte",
  })

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".form-section", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" })
    }, pageRef)
    return () => ctx.revert()
  }, [])

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Veuillez sélectionner une image"); return }
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
    setError("")
  }

  const prixTotal = form.quantite && form.prix
    ? new Intl.NumberFormat("fr-FR").format(parseFloat(form.quantite) * parseFloat(form.prix)) + " FCFA"
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titre || !form.culture || !form.quantite || !form.prix) {
      setError("Veuillez remplir tous les champs obligatoires")
      gsap.fromTo(".error-msg", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 })
      return
    }
    setIsSubmitting(true)
    setError("")
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (image) fd.append("image", image)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/annonces`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Erreur lors de la publication")
      }
      setSuccess(true)
      gsap.fromTo(".success-card", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" })
      setTimeout(() => router.push("/dashboard/marketplace"), 3000)
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

  if (success) return (
    <div style={{ padding: "60px 36px", maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
      <div className="success-card" style={{
        background: "white", borderRadius: 24, padding: 48, border: "2px solid #4CAF5040",
        boxShadow: "0 8px 40px rgba(26,107,60,0.1)",
      }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #1A6B3C, #4CAF50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(26,107,60,0.3)" }}>
          <CheckCircle size={36} color="white" />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#1C1A17", marginBottom: 8 }}>Annonce publiée !</h2>
        <p style={{ fontSize: 14, color: "#9a9590", marginBottom: 4 }}>Votre annonce est maintenant visible par tous les acheteurs.</p>
        <p style={{ fontSize: 12, color: "#9a9590" }}>Redirection dans 3 secondes...</p>
      </div>
    </div>
  )

  return (
    <div ref={pageRef} style={{ padding: "32px 36px", maxWidth: 800, margin: "0 auto" }}>
      <Link href="/dashboard/marketplace" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#9a9590", textDecoration: "none", fontSize: 13, fontWeight: 500, marginBottom: 20 }}>
        <ArrowLeft size={14} /> Retour à la marketplace
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #1A6B3C, #4CAF50)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(26,107,60,0.3)" }}>
          <Plus size={22} color="white" />
        </div>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "#1C1A17" }}>Publier une annonce</h1>
          <p style={{ fontSize: 13, color: "#9a9590" }}>Vendez votre récolte directement aux acheteurs, sans intermédiaire</p>
        </div>
      </div>

      {error && (
        <div className="error-msg" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", marginBottom: 20, color: "#C0392B", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* Type de vente */}
        <div className="form-section" style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e2ddd6", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "#1C1A17", marginBottom: 16 }}>Type de vente</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { value: "recolte", emoji: "🌾", titre: "Récolte disponible", desc: "Votre récolte est prête et disponible immédiatement pour livraison ou enlèvement." },
              { value: "pre_recolte", emoji: "🕐", titre: "Pré-récolte", desc: "Vendez votre récolte avant même de la récolter. Sécurisez vos revenus à l'avance." },
            ].map(t => (
              <button key={t.value} type="button" onClick={() => update("type_vente", t.value)} style={{
                padding: "16px", borderRadius: 14, cursor: "pointer", textAlign: "left",
                border: `2px solid ${form.type_vente === t.value ? "#1A6B3C" : "#e2ddd6"}`,
                background: form.type_vente === t.value ? "#f0faf4" : "white",
                transition: "all 0.2s",
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{t.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: form.type_vente === t.value ? "#1A6B3C" : "#1C1A17", marginBottom: 4 }}>{t.titre}</div>
                <div style={{ fontSize: 11, color: "#9a9590", lineHeight: 1.5 }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

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
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>Culture <span style={{ color: "#C0392B" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <select value={form.culture} onChange={e => update("culture", e.target.value)} style={selectStyle}
                  onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
                  onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                >
                  <option value="">Sélectionner...</option>
                  {CULTURES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#9a9590", pointerEvents: "none" }} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>Unité</label>
              <div style={{ position: "relative" }}>
                <select value={form.unite} onChange={e => update("unite", e.target.value)} style={selectStyle}>
                  {UNITES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#9a9590", pointerEvents: "none" }} />
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

        {/* Localisation */}
        <div className="form-section" style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e2ddd6", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "#1C1A17", marginBottom: 20 }}>📍 Localisation</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>Région</label>
              <div style={{ position: "relative" }}>
                <select value={form.region} onChange={e => update("region", e.target.value)} style={selectStyle}>
                  <option value="">Sélectionner...</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#9a9590", pointerEvents: "none" }} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>Ville / Localité</label>
              <input value={form.localite} onChange={e => update("localite", e.target.value)} placeholder="Ex: Sangmélima, Ebolowa..."
                style={{ width: "100%", padding: "11px 14px", border: "2px solid #e2ddd6", borderRadius: 12, fontSize: 14, outline: "none", fontFamily: "var(--font-sans)" }}
                onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
                onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
              />
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="form-section" style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e2ddd6", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "#1C1A17", marginBottom: 8 }}>📸 Photo du produit</h3>
          <p style={{ fontSize: 12, color: "#9a9590", marginBottom: 16 }}>Une bonne photo augmente les chances de vente. Photographiez votre récolte en pleine lumière.</p>

          <div
            onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => !imagePreview && document.getElementById("img-input")?.click()}
            style={{
              border: `2px dashed ${isDragging ? "#1A6B3C" : imagePreview ? "#4CAF50" : "#e2ddd6"}`,
              borderRadius: 16, overflow: "hidden",
              minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: imagePreview ? "default" : "pointer",
              background: isDragging ? "#f0faf4" : imagePreview ? "#f5fdf5" : "#fafaf8",
              transition: "all 0.3s", position: "relative",
            }}
          >
            {imagePreview ? (
              <>
                <Image src={imagePreview} alt="Aperçu" fill style={{ objectFit: "cover" }} />
                <button type="button" onClick={e => { e.stopPropagation(); setImage(null); setImagePreview(null) }}
                  style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#C0392B", display: "flex", alignItems: "center", gap: 4 }}>
                  <RotateCcw size={12} /> Changer
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: 24 }}>
                <ImageIcon size={32} color={isDragging ? "#1A6B3C" : "#9a9590"} style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: "#5a5650", marginBottom: 4 }}>Glissez une photo ici</p>
                <p style={{ fontSize: 12, color: "#9a9590" }}>ou cliquez pour sélectionner</p>
              </div>
            )}
          </div>
          <input id="img-input" type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>

        {/* Conseil */}
        <div style={{ background: "#f0faf4", border: "1px solid rgba(26,107,60,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10 }}>
          <Info size={16} color="#1A6B3C" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: "#5a5650", lineHeight: 1.7 }}>
            <strong style={{ color: "#1A6B3C" }}>Astuce :</strong> Les annonces avec photo reçoivent 3x plus de demandes. Précisez bien la qualité, l&apos;état et les conditions de livraison pour rassurer les acheteurs.
          </p>
        </div>

        {/* Submit */}
        <button type="submit" disabled={isSubmitting} style={{
          width: "100%", padding: "15px",
          background: isSubmitting ? "#a0c4b0" : "linear-gradient(135deg, #1A6B3C, #2d8a52)",
          color: "white", border: "none", borderRadius: 14,
          fontSize: 16, fontWeight: 700, cursor: isSubmitting ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: "0 4px 16px rgba(26,107,60,0.3)", transition: "all 0.3s",
        }}>
          {isSubmitting
            ? <><Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} /> Publication en cours...</>
            : <><CheckCircle size={18} /> Publier mon annonce</>}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>
    </div>
  )
}
