"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { gsap } from "gsap"
import {
  Upload, Camera, Microscope, AlertTriangle, CheckCircle,
  Loader2, ArrowLeft, Info, Leaf, ChevronDown, RotateCcw, History, Download
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { generateDiagnosticPDF } from "@/lib/generateReport"
import { useAuth } from "@/context/AuthContext"

const CULTURES = [
  "Manioc", "Cacao", "Tomate", "Maïs", "Palmier à huile",
  "Banane plantain", "Café", "Arachide", "Soja", "Niébé",
  "Patate douce", "Igname", "Ananas", "Poivre", "Gombo",
]

const GRAVITE_CONFIG = {
  "très élevée": { color: "#C0392B", bg: "#fef2f2", label: "⚠️ Critique" },
  "élevée":      { color: "#E8A020", bg: "#fffbf0", label: "🔴 Élevée" },
  "moyenne":     { color: "#E8A020", bg: "#fffbf0", label: "🟡 Modérée" },
  "inconnue":    { color: "#9a9590", bg: "#F7F5F0", label: "❓ Inconnue" },
}

interface ResultatIA {
  id: number
  maladie: string
  confiance: number
  culture: string
  image_path: string
  recommandations: string
  created_at: string
}

export default function DiagnosticPhytoPage() {
  const { token } = useAuth()
  const pageRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const [step, setStep] = useState<"upload" | "analyzing" | "result">("upload")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [culture, setCulture] = useState("")
  const [parcelle, setParcelle] = useState("")
  const [region, setRegion] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [resultat, setResultat] = useState<ResultatIA | null>(null)
  const [error, setError] = useState("")
  const [historique, setHistorique] = useState<ResultatIA[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".page-header",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      )
      gsap.fromTo(".upload-zone",
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.7, delay: 0.2, ease: "back.out(1.3)" }
      )
    }, pageRef)
    chargerHistorique()
    return () => ctx.revert()
  }, [])

  const chargerHistorique = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/diagnostics/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setHistorique(data.filter((d: any) => d.type === "phytosanitaire").slice(0, 5))
      }
    } catch { /* silencieux */ }
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image (JPG, PNG, WEBP)")
      return
    }
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
    setError("")
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const analyser = async () => {
    if (!image || !culture) {
      setError("Veuillez sélectionner une image et une culture")
      gsap.fromTo(".error-banner", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 })
      return
    }
    setError("")
    setStep("analyzing")

    // Animation scanning
    gsap.to(".scan-line", {
      y: "100%", duration: 2, ease: "none",
      repeat: -1, yoyo: false,
    })
    gsap.fromTo(".analyzing-card",
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" }
    )

    try {
      const formData = new FormData()
      formData.append("image", image)
      formData.append("culture", culture)
      if (parcelle) formData.append("parcelle", parcelle)
      if (region) formData.append("region", region)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/diagnostics/phyto`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Erreur lors de l'analyse")
      }

      const data = await res.json()
      setResultat(data)
      setStep("result")

      // Animation résultat
      setTimeout(() => {
        gsap.fromTo(".result-card",
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
        )
        gsap.fromTo(".result-item",
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, delay: 0.3 }
        )
        // Compteur confiance
        const counter = { val: 0 }
        const target = data.confiance
        gsap.to(counter, {
          val: target, duration: 1.5, ease: "power2.out", delay: 0.5,
          onUpdate: () => {
            const el = document.querySelector(".confiance-value")
            if (el) el.textContent = Math.round(counter.val) + "%"
          }
        })
      }, 100)

      chargerHistorique()
    } catch (err: any) {
      setError(err.message || "Erreur de connexion au serveur")
      setStep("upload")
      gsap.fromTo(".error-banner", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 })
    }
  }

  const recommandationsObj = resultat?.recommandations
    ? (() => { try { return JSON.parse(resultat.recommandations) } catch { return null } })()
    : null

  const graviteConfig = recommandationsObj?.gravite
    ? (GRAVITE_CONFIG[recommandationsObj.gravite as keyof typeof GRAVITE_CONFIG] || GRAVITE_CONFIG["inconnue"])
    : GRAVITE_CONFIG["inconnue"]

  const reset = () => {
    setStep("upload")
    setImage(null)
    setImagePreview(null)
    setCulture("")
    setParcelle("")
    setResultat(null)
    setError("")
  }

  return (
    <div ref={pageRef} style={{ padding: "32px 36px", maxWidth: 1000, margin: "0 auto" }}>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 32 }}>
        <Link href="/dashboard" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "#9a9590", textDecoration: "none", fontSize: 13,
          fontWeight: 500, marginBottom: 12,
        }}>
          <ArrowLeft size={14} /> Tableau de bord
        </Link>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: "linear-gradient(135deg, #1A6B3C, #4CAF50)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(26,107,60,0.3)",
              }}>
                <Microscope size={22} color="white" />
              </div>
              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#1C1A17" }}>
                  Diagnostic Phytosanitaire
                </h1>
                <p style={{ fontSize: 13, color: "#9a9590" }}>
                  Analysez vos plantes par IA — Détection de maladies en quelques secondes
                </p>
              </div>
            </div>
          </div>
          <button onClick={() => setShowHistory(!showHistory)} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 18px", borderRadius: 12,
            border: "2px solid #e2ddd6", background: "white",
            cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#5a5650",
          }}>
            <History size={16} /> Historique ({historique.length})
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="error-banner" style={{
          background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: 12, padding: "12px 16px", marginBottom: 20,
          color: "#C0392B", fontSize: 13, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: showHistory ? "1fr 320px" : "1fr", gap: 24 }}>

        {/* Zone principale */}
        <div>
          {/* STEP : UPLOAD */}
          {step === "upload" && (
            <div className="upload-zone">
              {/* Zone de dépôt */}
              <div
                ref={dropRef}
                onDrop={onDrop}
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                style={{
                  border: `2px dashed ${isDragging ? "#1A6B3C" : imagePreview ? "#4CAF50" : "#e2ddd6"}`,
                  borderRadius: 20,
                  background: isDragging ? "#f0faf4" : imagePreview ? "#f5fdf5" : "white",
                  padding: imagePreview ? 0 : "48px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  overflow: "hidden",
                  position: "relative",
                  marginBottom: 24,
                  minHeight: 280,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                onClick={() => !imagePreview && document.getElementById("file-input")?.click()}
              >
                {imagePreview ? (
                  <div style={{ position: "relative", width: "100%", height: 320 }}>
                    <Image src={imagePreview} alt="Plante" fill style={{ objectFit: "cover" }} />
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                    }} />
                    <button
                      onClick={e => { e.stopPropagation(); setImage(null); setImagePreview(null) }}
                      style={{
                        position: "absolute", top: 12, right: 12,
                        background: "rgba(255,255,255,0.9)", border: "none",
                        borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                        fontSize: 12, fontWeight: 600, color: "#C0392B",
                        display: "flex", alignItems: "center", gap: 4,
                      }}
                    >
                      <RotateCcw size={12} /> Changer
                    </button>
                    <div style={{
                      position: "absolute", bottom: 16, left: 16,
                      color: "white", fontSize: 13, fontWeight: 600,
                    }}>
                      ✅ Image chargée — {image?.name}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      width: 80, height: 80, borderRadius: "50%",
                      background: isDragging ? "#1A6B3C" : "#f0faf4",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 20px",
                      border: `2px solid ${isDragging ? "#4CAF50" : "#e2ddd6"}`,
                      transition: "all 0.3s",
                    }}>
                      {isDragging
                        ? <Leaf size={36} color="white" />
                        : <Upload size={36} color="#1A6B3C" />
                      }
                    </div>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "#1C1A17", marginBottom: 8 }}>
                      {isDragging ? "Déposez l'image ici" : "Glissez une photo de votre plante"}
                    </p>
                    <p style={{ fontSize: 14, color: "#9a9590", marginBottom: 20 }}>
                      ou cliquez pour sélectionner depuis votre appareil
                    </p>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      {["JPG", "PNG", "WEBP"].map(f => (
                        <span key={f} style={{
                          fontSize: 11, background: "#F7F5F0",
                          padding: "3px 10px", borderRadius: 20, color: "#9a9590", fontWeight: 600,
                        }}>{f}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <input id="file-input" type="file" accept="image/*"
                style={{ display: "none" }}
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              {/* Formulaire */}
              <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1px solid #e2ddd6" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1C1A17", marginBottom: 20 }}>
                  Informations sur la plante
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  {/* Culture */}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                      Culture <span style={{ color: "#C0392B" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <select value={culture} onChange={e => setCulture(e.target.value)}
                        style={{
                          width: "100%", padding: "11px 40px 11px 14px",
                          border: "2px solid #e2ddd6", borderRadius: 12,
                          fontSize: 14, background: "white", cursor: "pointer",
                          appearance: "none", outline: "none",
                          fontFamily: "var(--font-sans)",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
                        onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                      >
                        <option value="">Sélectionner...</option>
                        {CULTURES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={16} style={{
                        position: "absolute", right: 12, top: "50%",
                        transform: "translateY(-50%)", color: "#9a9590", pointerEvents: "none",
                      }} />
                    </div>
                  </div>

                  {/* Parcelle */}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                      Nom de la parcelle
                    </label>
                    <input value={parcelle} onChange={e => setParcelle(e.target.value)}
                      placeholder="Ex: Parcelle A - Champ nord"
                      style={{
                        width: "100%", padding: "11px 14px",
                        border: "2px solid #e2ddd6", borderRadius: 12,
                        fontSize: 14, outline: "none", fontFamily: "var(--font-sans)",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
                      onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                    />
                  </div>
                </div>

                {/* Bouton analyser */}
                <button onClick={analyser}
                  disabled={!image || !culture}
                  style={{
                    width: "100%", padding: "14px",
                    background: (!image || !culture)
                      ? "#e2ddd6"
                      : "linear-gradient(135deg, #1A6B3C, #2d8a52)",
                    color: (!image || !culture) ? "#9a9590" : "white",
                    border: "none", borderRadius: 14,
                    fontSize: 16, fontWeight: 700,
                    cursor: (!image || !culture) ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: (!image || !culture) ? "none" : "0 4px 16px rgba(26,107,60,0.3)",
                    transition: "all 0.3s",
                  }}
                >
                  <Microscope size={18} /> Lancer le diagnostic IA
                </button>

                {/* Conseil photo */}
                <div style={{
                  marginTop: 16, padding: "12px 16px",
                  background: "#f0faf4", borderRadius: 10,
                  border: "1px solid rgba(26,107,60,0.15)",
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <Camera size={16} color="#1A6B3C" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 12, color: "#5a5650", lineHeight: 1.6 }}>
                    <strong>Conseil photo :</strong> Photographiez la feuille malade en gros plan,
                    sur fond clair, avec une bonne luminosité. Évitez les photos floues ou surexposées.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP : ANALYZING */}
          {step === "analyzing" && (
            <div className="analyzing-card" style={{
              background: "white", borderRadius: 24, padding: 48,
              textAlign: "center", border: "1px solid #e2ddd6",
              boxShadow: "0 8px 32px rgba(26,107,60,0.08)",
            }}>
              {/* Image avec scan */}
              {imagePreview && (
                <div style={{
                  position: "relative", width: 200, height: 200,
                  borderRadius: 20, overflow: "hidden",
                  margin: "0 auto 32px",
                  border: "3px solid #4CAF50",
                  boxShadow: "0 0 0 6px rgba(76,175,80,0.15)",
                }}>
                  <Image src={imagePreview} alt="Analyse" fill style={{ objectFit: "cover" }} />
                  {/* Ligne de scan */}
                  <div className="scan-line" style={{
                    position: "absolute", left: 0, right: 0, height: 3,
                    background: "linear-gradient(90deg, transparent, #4CAF50, transparent)",
                    top: 0,
                    boxShadow: "0 0 12px #4CAF50",
                  }} />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, rgba(76,175,80,0.1), transparent)",
                  }} />
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <Loader2 size={32} color="#1A6B3C" className="animate-spin" style={{ margin: "0 auto 16px" }} />
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#1C1A17", marginBottom: 8 }}>
                  Analyse en cours...
                </h2>
                <p style={{ fontSize: 14, color: "#9a9590" }}>
                  Notre IA examine votre plante. Cela prend quelques secondes.
                </p>
              </div>

              {/* Étapes animées */}
              {["Prétraitement de l'image", "Extraction des caractéristiques", "Classification CNN", "Génération des recommandations"].map((step, i) => (
                <div key={step} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 20px", marginBottom: 6,
                  background: "#f0faf4", borderRadius: 10,
                  fontSize: 13, color: "#1A6B3C", fontWeight: 500,
                  animation: `fadeIn 0.5s ease ${i * 0.4}s both`,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#4CAF50",
                    animation: "pulse 1s ease infinite",
                  }} />
                  {step}
                </div>
              ))}

              <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
              `}</style>
            </div>
          )}

          {/* STEP : RESULT */}
          {step === "result" && resultat && recommandationsObj && (
            <div className="result-card">
              {/* Header résultat */}
              <div style={{
                background: `linear-gradient(135deg, ${graviteConfig.color}15, ${graviteConfig.color}08)`,
                border: `2px solid ${graviteConfig.color}30`,
                borderRadius: 20, padding: 28, marginBottom: 20,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                  {imagePreview && (
                    <div style={{
                      width: 100, height: 100, borderRadius: 16, overflow: "hidden",
                      flexShrink: 0, border: `3px solid ${graviteConfig.color}40`,
                    }}>
                      <Image src={imagePreview} alt="Plante" width={100} height={100} style={{ objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700, letterSpacing: "0.5px",
                        background: graviteConfig.bg, color: graviteConfig.color,
                        padding: "4px 12px", borderRadius: 20,
                        border: `1px solid ${graviteConfig.color}40`,
                      }}>
                        {graviteConfig.label}
                      </span>
                      <span style={{ fontSize: 12, color: "#9a9590" }}>Culture : {resultat.culture}</span>
                    </div>
                    <h2 style={{
                      fontFamily: "var(--font-display)", fontSize: 22,
                      fontWeight: 800, color: "#1C1A17", marginBottom: 8,
                    }}>
                      {recommandationsObj.maladie}
                    </h2>
                    <p style={{ fontSize: 13, color: "#5a5650", lineHeight: 1.6 }}>
                      {recommandationsObj.description}
                    </p>
                  </div>
                  {/* Score confiance */}
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{
                      width: 80, height: 80, borderRadius: "50%",
                      background: `conic-gradient(${graviteConfig.color} ${resultat.confiance * 3.6}deg, #e2ddd6 0deg)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative",
                    }}>
                      <div style={{
                        width: 60, height: 60, borderRadius: "50%",
                        background: "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexDirection: "column",
                      }}>
                        <span className="confiance-value" style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 16, fontWeight: 800, color: graviteConfig.color,
                        }}>
                          0%
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: 10, color: "#9a9590", marginTop: 4, fontWeight: 600 }}>CONFIANCE IA</p>
                  </div>
                </div>
              </div>

              {/* Recommandations */}
              <div className="result-item" style={{
                background: "white", borderRadius: 16, padding: 24,
                border: "1px solid #e2ddd6", marginBottom: 16,
              }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1C1A17", marginBottom: 4 }}>
                  🌿 Recommandations de traitement
                </h3>
                <p style={{ fontSize: 12, color: "#9a9590", marginBottom: 16 }}>
                  Chaque recommandation est accompagnée d&apos;une explication simple
                </p>
                {recommandationsObj.recommandations?.map((rec: any, i: number) => {
                  // Supporte l'ancien format (string) et le nouveau format ({action, explication})
                  const action = typeof rec === "string" ? rec : rec.action
                  const explication = typeof rec === "object" ? rec.explication : null
                  return (
                    <div key={i} className="result-item" style={{
                      borderRadius: 12, marginBottom: 10, overflow: "hidden",
                      border: "1px solid #e2ddd6",
                    }}>
                      {/* Action principale */}
                      <div style={{
                        display: "flex", gap: 12, padding: "12px 16px",
                        background: i % 2 === 0 ? "#f0faf4" : "#fafaf8",
                        alignItems: "flex-start",
                      }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: "50%",
                          background: "#1A6B3C", color: "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
                        }}>
                          {i + 1}
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1A17", lineHeight: 1.5 }}>
                          {action}
                        </p>
                      </div>
                      {/* Explication simple */}
                      {explication && (
                        <div style={{
                          padding: "10px 16px 12px 54px",
                          background: "white",
                          borderTop: "1px dashed #e2ddd6",
                          display: "flex", gap: 8, alignItems: "flex-start",
                        }}>
                          <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
                          <p style={{
                            fontSize: 12, color: "#5a5650",
                            lineHeight: 1.7, fontStyle: "italic",
                          }}>
                            {explication}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Traitement local */}
              {recommandationsObj.traitement_local && (
                <div className="result-item" style={{
                  background: "#fffbf0", border: "1px solid rgba(232,160,32,0.3)",
                  borderRadius: 16, padding: 20, marginBottom: 16,
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: "#E8A020", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Leaf size={18} color="white" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13, color: "#1C1A17", marginBottom: 4 }}>
                        🌍 Traitement local disponible
                      </p>
                      <p style={{ fontSize: 13, color: "#5a5650", lineHeight: 1.6 }}>
                        {recommandationsObj.traitement_local}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Avertissement */}
              <div className="result-item" style={{
                background: "#f0f4ff", border: "1px solid #c7d2fe",
                borderRadius: 12, padding: "12px 16px", marginBottom: 20,
                display: "flex", gap: 8, alignItems: "flex-start",
              }}>
                <Info size={16} color="#4f46e5" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: "#4f46e5", lineHeight: 1.6 }}>
                  Ce diagnostic est fourni à titre indicatif. Pour les cas critiques,
                  consultez un agent de vulgarisation de l&apos;IRAD ou du MINADER.
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={reset} style={{
                  flex: 1, padding: "13px",
                  background: "white", border: "2px solid #e2ddd6",
                  borderRadius: 14, fontSize: 14, fontWeight: 600,
                  color: "#5a5650", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <RotateCcw size={16} /> Nouveau diagnostic
                </button>
                <button
                  onClick={async () => {
                    if (!resultat || !recommandationsObj) return
                    setIsGeneratingPDF(true)

                    // Convertir l'image en base64 si disponible
                    let imageBase64: string | undefined
                    if (imagePreview) {
                      try {
                        const response = await fetch(imagePreview)
                        const blob = await response.blob()
                        imageBase64 = await new Promise<string>((resolve) => {
                          const reader = new FileReader()
                          reader.onloadend = () => resolve(reader.result as string)
                          reader.readAsDataURL(blob)
                        })
                      } catch { /* image optionnelle */ }
                    }

                    generateDiagnosticPDF({
                      type: "phytosanitaire",
                      culture: resultat.culture,
                      parcelle,
                      region,
                      maladie: recommandationsObj.maladie,
                      confiance: resultat.confiance,
                      gravite: recommandationsObj.gravite,
                      description: recommandationsObj.description,
                      recommandations: recommandationsObj.recommandations,
                      traitement_local: recommandationsObj.traitement_local,
                      imageBase64,
                      userName: "Nathulie Evina",
                      date: new Date().toLocaleDateString("fr-FR", {
                        weekday: "long", day: "numeric", month: "long", year: "numeric"
                      }),
                    })
                    setIsGeneratingPDF(false)
                  }}
                  disabled={isGeneratingPDF}
                  style={{
                    flex: 1, padding: "13px",
                    background: isGeneratingPDF
                      ? "#a0c4b0"
                      : "linear-gradient(135deg, #1A6B3C, #2d8a52)",
                    border: "none", borderRadius: 14,
                    fontSize: 14, fontWeight: 700, color: "white",
                    cursor: isGeneratingPDF ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: "0 4px 16px rgba(26,107,60,0.3)",
                    transition: "all 0.3s",
                  }}
                >
                  {isGeneratingPDF
                    ? <><Loader2 size={16} className="animate-spin" /> Génération...</>
                    : <><Download size={16} /> Télécharger le rapport PDF</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Historique */}
        {showHistory && (
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1C1A17", marginBottom: 16 }}>
              Diagnostics récents
            </h3>
            {historique.length === 0 ? (
              <div style={{
                background: "white", borderRadius: 16, padding: 24,
                textAlign: "center", border: "1px solid #e2ddd6",
                color: "#9a9590", fontSize: 13,
              }}>
                Aucun diagnostic effectué
              </div>
            ) : (
              historique.map((h: any) => {
                const rec = (() => { try { return JSON.parse(h.recommandations) } catch { return null } })()
                return (
                  <div key={h.id} style={{
                    background: "white", borderRadius: 14, padding: 16,
                    border: "1px solid #e2ddd6", marginBottom: 12,
                    cursor: "pointer",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#1A6B3C" }}>{h.culture}</span>
                      <span style={{ fontSize: 11, color: "#9a9590" }}>
                        {new Date(h.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 4 }}>
                      {h.maladie}
                    </p>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 11, color: "#1A6B3C",
                      background: "#f0faf4", padding: "2px 8px", borderRadius: 20,
                    }}>
                      Confiance : {h.confiance}%
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
