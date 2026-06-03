"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"
import {
  Globe, ArrowLeft, Loader2, RotateCcw, Download,
  ChevronDown, Info, AlertTriangle, CheckCircle, Leaf, History,
  HelpCircle, FlaskConical, ChevronRight, BookOpen, X
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { generateDiagnosticPDF } from "@/lib/generateReport"

gsap.registerPlugin(ScrollTrigger)

const TEXTURES = ["sableux", "sableux-limoneux", "limoneux", "argilo-sableux", "argilo-limoneux", "argileux"]
const HUMIDITES = ["faible", "modérée", "élevée"]
const DRAINAGES = ["excessif", "bon", "modéré", "mauvais"]
const REGIONS = ["Adamaoua","Centre","Est","Extrême-Nord","Littoral","Nord","Nord-Ouest","Ouest","Sud","Sud-Ouest"]

const EVAL_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  excellent: { color: "#1A6B3C", bg: "#f0faf4", icon: CheckCircle, label: "Sol excellent" },
  bon:       { color: "#4CAF50", bg: "#f5fdf5", icon: CheckCircle, label: "Bon sol" },
  moyen:     { color: "#E8A020", bg: "#fffbf0", icon: AlertTriangle, label: "Sol moyen" },
  faible:    { color: "#C0392B", bg: "#fef2f2", icon: AlertTriangle, label: "Sol faible" },
}

export default function DiagnosticPedologiePage() {
  const { token } = useAuth()
  const pageRef = useRef<HTMLDivElement>(null)

  const [step, setStep] = useState<"form" | "analyzing" | "result">("form")
  const [error, setError] = useState("")
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [historique, setHistorique] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [resultat, setResultat] = useState<any>(null)

  const [showGuide, setShowGuide] = useState(false)
  const [guideSection, setGuideSection] = useState<string | null>(null)

  const [form, setForm] = useState({
    ph: "", texture: "", humidite: "", drainage: "",
    region: "", parcelle: "",
  })

  const update = (field: string, val: string) => setForm(f => ({ ...f, [field]: val }))

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".page-header", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6 })
      gsap.fromTo(".form-card", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power3.out" })
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
        setHistorique(data.filter((d: any) => d.type === "pedologique").slice(0, 5))
      }
    } catch { }
  }

  const analyser = async () => {
    const { ph, texture, humidite, drainage } = form
    if (!ph || !texture || !humidite || !drainage) {
      setError("Veuillez remplir tous les champs obligatoires")
      return
    }
    const phNum = parseFloat(ph)
    if (phNum < 0 || phNum > 14) {
      setError("Le pH doit être entre 0 et 14")
      return
    }
    setError("")
    setStep("analyzing")

    gsap.fromTo(".analyzing-card", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" })

    try {
      const fd = new FormData()
      fd.append("ph", ph)
      fd.append("texture", texture)
      fd.append("humidite", humidite)
      fd.append("drainage", drainage)
      if (form.region) fd.append("region", form.region)
      if (form.parcelle) fd.append("parcelle", form.parcelle)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/diagnostics/pedologie`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Erreur analyse")
      }

      const data = await res.json()
      setResultat(data)
      setStep("result")

      setTimeout(() => {
        gsap.fromTo(".result-header", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 })
        gsap.fromTo(".culture-card", { opacity: 0, y: 40, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.12, delay: 0.3, ease: "back.out(1.3)" }
        )
        // Barre de score animée
        gsap.fromTo(".score-bar-fill", { width: 0 },
          { width: "var(--target-width)", duration: 1.2, ease: "power2.out", delay: 0.5 }
        )
      }, 100)

      chargerHistorique()
    } catch (err: any) {
      setError(err.message || "Erreur de connexion")
      setStep("form")
    }
  }

  const recommandationsObj = resultat?.recommandations
    ? (() => { try { return JSON.parse(resultat.recommandations) } catch { return null } })()
    : null

  const evalConfig = recommandationsObj?.evaluation
    ? (EVAL_CONFIG[recommandationsObj.evaluation] || EVAL_CONFIG.moyen)
    : EVAL_CONFIG.moyen

  const selectStyle = {
    width: "100%", padding: "11px 40px 11px 14px",
    border: "2px solid #e2ddd6", borderRadius: 12,
    fontSize: 14, background: "white", cursor: "pointer",
    appearance: "none" as const, outline: "none",
    fontFamily: "var(--font-sans)", transition: "border-color 0.2s",
  }

  return (
    <div ref={pageRef} style={{ padding: "32px 36px", maxWidth: 1000, margin: "0 auto" }}>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 32 }}>
        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#9a9590", textDecoration: "none", fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
          <ArrowLeft size={14} /> Tableau de bord
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: "linear-gradient(135deg, #4CAF50, #1A6B3C)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(76,175,80,0.3)",
            }}>
              <Globe size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#1C1A17" }}>
                Diagnostic Pédologique
              </h1>
              <p style={{ fontSize: 13, color: "#9a9590" }}>
                Analysez votre sol et obtenez des recommandations culturales personnalisées
              </p>
            </div>
          </div>
          <button onClick={() => setShowHistory(!showHistory)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
            borderRadius: 12, border: "2px solid #e2ddd6", background: "white",
            cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#5a5650",
          }}>
            <History size={16} /> Historique ({historique.length})
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12,
          padding: "12px 16px", marginBottom: 20, color: "#C0392B",
          fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8,
        }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: showHistory ? "1fr 300px" : "1fr", gap: 24 }}>
        <div>

          {/* GUIDE D'AIDE */}
          {showGuide && (
            <div style={{
              background: "white", borderRadius: 20, padding: 28,
              border: "2px solid #1A6B3C", marginBottom: 20,
              boxShadow: "0 8px 32px rgba(26,107,60,0.1)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "#1A6B3C" }}>
                  📚 Guide — Comment remplir ce formulaire ?
                </h3>
                <button onClick={() => setShowGuide(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9a9590" }}>
                  <X size={20} />
                </button>
              </div>

              {/* Sections du guide */}
              {[
                {
                  id: "ph",
                  titre: "🧪 C'est quoi le pH du sol ?",
                  contenu: [
                    { q: "C'est quoi le pH ?", r: "Le pH mesure si votre terre est acide, neutre ou basique (alcaline). C'est un chiffre entre 0 et 14. La valeur 7 = neutre. En dessous de 7 = acide. Au-dessus de 7 = basique." },
                    { q: "Comment mesurer le pH ?", r: "Achetez un kit de test de pH en boutique agricole (coûte moins de 2000 FCFA). Prenez un peu de terre humide, suivez les instructions du kit. Vous obtiendrez une couleur à comparer à un tableau. Ou demandez à l'IRAD ou votre délégué agricole de tester votre sol." },
                    { q: "Je n'ai pas de kit, que faire ?", r: "Vous pouvez estimer grossièrement : si votre terre est rouge-orangée (sol ferrallitique, courant au Cameroun) → pH entre 4,5 et 5,5. Si votre terre est brun foncé → pH entre 5,5 et 6,5. Si vous voyez des mousses et fougères pousser naturellement → sol acide." },
                    { q: "Valeur recommandée à entrer si vous ne savez pas", r: "Entrez 5.5 (valeur typique des sols du Sud Cameroun)." },
                  ],
                },
                {
                  id: "texture",
                  titre: "👐 Comment connaître la texture de mon sol ?",
                  contenu: [
                    { q: "Test simple avec les mains (Test du boudin)", r: "Prenez une poignée de terre humide (pas trop détrempée). Essayez de former un boudin (comme de la pâte à modeler) en le roulant entre vos paumes." },
                    { q: "Sableux", r: "Le boudin ne tient pas, la terre s'effrite immédiatement. Elle crisse entre les doigts. Couleur souvent beige/grise claire. Fréquent sur les côtes et les zones sahéliennes." },
                    { q: "Sableux-limoneux", r: "Le boudin tient un peu mais se fissure vite. Texture légèrement douce au toucher. Sol courant dans de nombreuses zones agricoles du Cameroun." },
                    { q: "Limoneux", r: "Le boudin se forme bien mais se casse si on le plie. La terre est douce et soyeuse au toucher, pas collante. C'est souvent le meilleur sol pour l'agriculture." },
                    { q: "Argilo-sableux", r: "Le boudin se forme et peut se plier légèrement. La terre est un peu collante. Mélange de sable et d'argile." },
                    { q: "Argilo-limoneux", r: "Le boudin se forme bien et se plie sans se casser. La terre colle aux doigts. Sol foncé, souvent brun-rouge." },
                    { q: "Argileux", r: "Le boudin est très solide, brillant, colle beaucoup aux doigts. La terre garde l'empreinte des doigts. Sol très lourd, souvent gris ou brun-rouge foncé." },
                  ],
                },
                {
                  id: "humidite",
                  titre: "💧 Comment évaluer l'humidité de mon sol ?",
                  contenu: [
                    { q: "Faible (sol sec)", r: "La terre est sèche, poudreuse. Même après une pluie elle sèche très vite (moins d'un jour). Vous devrez arroser souvent si vous cultivez." },
                    { q: "Modérée (sol normal)", r: "La terre garde l'humidité 2 à 3 jours après une pluie. Elle n'est ni sèche ni détrempée. C'est la situation idéale pour la plupart des cultures." },
                    { q: "Élevée (sol humide)", r: "L'eau reste dans le sol plus de 3 jours. Votre champ est souvent mou ou boueux. Il peut y avoir de l'herbe aquatique qui pousse. Attention à la pourriture des racines." },
                  ],
                },
                {
                  id: "drainage",
                  titre: "🌊 Comment évaluer le drainage ?",
                  contenu: [
                    { q: "Test simple du drainage", r: "Creusez un trou de 30 cm de profondeur. Remplissez-le d'eau. Observez combien de temps l'eau met à s'infiltrer." },
                    { q: "Excessif (eau s'écoule trop vite)", r: "L'eau disparaît en moins de 30 minutes. Sol sableux. Les cultures souffriront de sécheresse même après la pluie. Besoin de paillage et matière organique." },
                    { q: "Bon (eau s'écoule bien)", r: "L'eau disparaît en 1 à 3 heures. Idéal pour la plupart des cultures. Sol bien équilibré." },
                    { q: "Modéré (légère rétention)", r: "L'eau met 3 à 12 heures pour s'infiltrer. Convient à certaines cultures qui aiment l'humidité (bananier, taro)." },
                    { q: "Mauvais (eau stagnante)", r: "L'eau reste plus de 12 heures ou ne part pas. Sol imperméable ou terrain bas. Risque de pourriture des racines. Nécessite des drains creusés." },
                  ],
                },
              ].map(section => (
                <div key={section.id} style={{ marginBottom: 12 }}>
                  <button
                    onClick={() => setGuideSection(guideSection === section.id ? null : section.id)}
                    style={{
                      width: "100%", padding: "14px 18px",
                      background: guideSection === section.id ? "#f0faf4" : "#F7F5F0",
                      border: `1px solid ${guideSection === section.id ? "#1A6B3C40" : "#e2ddd6"}`,
                      borderRadius: 12, cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#1C1A17" }}>{section.titre}</span>
                    <ChevronDown size={16} style={{
                      color: "#1A6B3C", transform: guideSection === section.id ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.3s",
                    }} />
                  </button>

                  {guideSection === section.id && (
                    <div style={{ padding: "16px 18px", borderRadius: "0 0 12px 12px", background: "#fafaf8", border: "1px solid #e2ddd6", borderTop: "none" }}>
                      {section.contenu.map((item, i) => (
                        <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < section.contenu.length - 1 ? "1px dashed #e2ddd6" : "none" }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#1A6B3C", marginBottom: 4 }}>❓ {item.q}</p>
                          <p style={{ fontSize: 13, color: "#1C1A17", lineHeight: 1.7 }}>➡️ {item.r}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div style={{
                marginTop: 16, padding: "12px 16px", background: "#f0f4ff",
                borderRadius: 10, border: "1px solid #c7d2fe",
                display: "flex", gap: 8, alignItems: "center",
              }}>
                <BookOpen size={16} color="#4f46e5" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: "#4f46e5", lineHeight: 1.6 }}>
                  Pour aller plus loin, consultez le module <strong>Formation → Comprendre son sol</strong> disponible dans l&apos;espace formation.
                  <Link href="/dashboard/formation" style={{ color: "#4f46e5", fontWeight: 700, marginLeft: 4 }}>
                    Accéder à la formation →
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* FORMULAIRE */}
          {step === "form" && (
            <div className="form-card" style={{ background: "white", borderRadius: 20, padding: 32, border: "1px solid #e2ddd6" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1C1A17" }}>
                  🌍 Paramètres de votre sol
                </h3>
                <button
                  onClick={() => setShowGuide(!showGuide)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", borderRadius: 10, cursor: "pointer",
                    background: showGuide ? "#1A6B3C" : "#f0faf4",
                    border: "1px solid #1A6B3C30",
                    color: showGuide ? "white" : "#1A6B3C",
                    fontSize: 12, fontWeight: 700, transition: "all 0.2s",
                  }}
                >
                  <HelpCircle size={14} />
                  {showGuide ? "Fermer le guide" : "Je ne sais pas quoi mettre ?"}
                </button>
              </div>
              <p style={{ fontSize: 13, color: "#9a9590", marginBottom: 28 }}>
                Renseignez les caractéristiques de votre terrain pour obtenir les cultures les mieux adaptées
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

                {/* pH */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                    pH du sol <span style={{ color: "#C0392B" }}>*</span>
                    <span style={{ fontWeight: 400, color: "#9a9590", marginLeft: 8 }}>
                      (entre 0 et 14 — valeur neutre : 7)
                    </span>
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <input
                      type="number" step="0.1" min="0" max="14"
                      value={form.ph} onChange={e => update("ph", e.target.value)}
                      placeholder="Ex: 6.5"
                      style={{
                        width: 120, padding: "11px 14px",
                        border: "2px solid #e2ddd6", borderRadius: 12,
                        fontSize: 18, fontWeight: 700, outline: "none",
                        fontFamily: "var(--font-sans)", textAlign: "center",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={e => (e.target.style.borderColor = "#4CAF50")}
                      onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                    />
                    {/* Indicateur visuel pH */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9a9590", marginBottom: 4 }}>
                        <span>Très acide (0)</span>
                        <span>Neutre (7)</span>
                        <span>Alcalin (14)</span>
                      </div>
                      <div style={{
                        height: 12, borderRadius: 6, overflow: "hidden",
                        background: "linear-gradient(to right, #e74c3c, #e67e22, #f1c40f, #2ecc71, #3498db, #9b59b6)",
                      }}>
                        {form.ph && (
                          <div style={{
                            position: "relative", height: "100%",
                          }}>
                            <div style={{
                              position: "absolute", top: -3,
                              left: `${(parseFloat(form.ph) / 14) * 100}%`,
                              transform: "translateX(-50%)",
                              width: 18, height: 18, borderRadius: "50%",
                              background: "white", border: "3px solid #1C1A17",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                            }} />
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9a9590", marginTop: 4 }}>
                        <span style={{ color: "#e74c3c" }}>🌿 Cacao, Café, Ananas</span>
                        <span style={{ color: "#2ecc71" }}>🌽 Maïs, Tomate, Soja</span>
                        <span style={{ color: "#9b59b6" }}>⚠️ Peu de cultures</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Texture */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                    Texture du sol <span style={{ color: "#C0392B" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <select value={form.texture} onChange={e => update("texture", e.target.value)}
                      style={selectStyle}
                      onFocus={e => (e.target.style.borderColor = "#4CAF50")}
                      onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                    >
                      <option value="">Sélectionner...</option>
                      {TEXTURES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={16} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#9a9590", pointerEvents: "none" }} />
                  </div>
                  <p style={{ fontSize: 11, color: "#9a9590", marginTop: 4 }}>
                    💡 Si vous ne savez pas : prenez une poignée de terre humide et serrez. Si elle forme une boule qui tient = argileux. Si elle s'effrite = sableux.
                  </p>
                </div>

                {/* Humidité */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                    Humidité naturelle <span style={{ color: "#C0392B" }}>*</span>
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {HUMIDITES.map(h => (
                      <button key={h} type="button" onClick={() => update("humidite", h)}
                        style={{
                          padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                          border: `2px solid ${form.humidite === h ? "#4CAF50" : "#e2ddd6"}`,
                          background: form.humidite === h ? "#f5fdf5" : "white",
                          textAlign: "left", transition: "all 0.2s",
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: form.humidite === h ? 700 : 500, color: form.humidite === h ? "#1A6B3C" : "#1C1A17" }}>
                          {h === "faible" ? "🏜️ Faible" : h === "modérée" ? "🌤️ Modérée" : "💧 Élevée"}
                        </span>
                        <span style={{ fontSize: 11, color: "#9a9590" }}>
                          {h === "faible" ? "Sol sec, aride" : h === "modérée" ? "Sol normal" : "Sol humide, marécageux"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drainage */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                    Drainage <span style={{ color: "#C0392B" }}>*</span>
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {DRAINAGES.map(d => (
                      <button key={d} type="button" onClick={() => update("drainage", d)}
                        style={{
                          padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                          border: `2px solid ${form.drainage === d ? "#4CAF50" : "#e2ddd6"}`,
                          background: form.drainage === d ? "#f5fdf5" : "white",
                          textAlign: "left", transition: "all 0.2s",
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: form.drainage === d ? 700 : 500, color: form.drainage === d ? "#1A6B3C" : "#1C1A17" }}>
                          {d === "excessif" ? "🏃 Excessif" : d === "bon" ? "✅ Bon" : d === "modéré" ? "🔄 Modéré" : "⚠️ Mauvais"}
                        </span>
                        <span style={{ fontSize: 11, color: "#9a9590" }}>
                          {d === "excessif" ? "Eau s'écoule trop vite" : d === "bon" ? "Eau s'écoule bien" : d === "modéré" ? "Légère rétention d'eau" : "Eau stagnante"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Région */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                    Région
                  </label>
                  <div style={{ position: "relative" }}>
                    <select value={form.region} onChange={e => update("region", e.target.value)} style={selectStyle}
                      onFocus={e => (e.target.style.borderColor = "#4CAF50")}
                      onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                    >
                      <option value="">Sélectionner...</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <ChevronDown size={16} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#9a9590", pointerEvents: "none" }} />
                  </div>
                </div>

                {/* Parcelle */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                    Nom de la parcelle
                  </label>
                  <input value={form.parcelle} onChange={e => update("parcelle", e.target.value)}
                    placeholder="Ex: Champ Nord — 2 ha"
                    style={{
                      width: "100%", padding: "11px 14px", border: "2px solid #e2ddd6",
                      borderRadius: 12, fontSize: 14, outline: "none",
                      fontFamily: "var(--font-sans)", transition: "border-color 0.2s",
                    }}
                    onFocus={e => (e.target.style.borderColor = "#4CAF50")}
                    onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                  />
                </div>
              </div>

              <button onClick={analyser}
                disabled={!form.ph || !form.texture || !form.humidite || !form.drainage}
                style={{
                  width: "100%", padding: "14px",
                  background: (!form.ph || !form.texture || !form.humidite || !form.drainage)
                    ? "#e2ddd6"
                    : "linear-gradient(135deg, #4CAF50, #1A6B3C)",
                  color: (!form.ph || !form.texture || !form.humidite || !form.drainage) ? "#9a9590" : "white",
                  border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700,
                  cursor: (!form.ph || !form.texture || !form.humidite || !form.drainage) ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 16px rgba(26,107,60,0.3)", transition: "all 0.3s",
                }}
              >
                <Globe size={18} /> Analyser mon sol
              </button>
            </div>
          )}

          {/* ANALYZING */}
          {step === "analyzing" && (
            <div className="analyzing-card" style={{
              background: "white", borderRadius: 24, padding: 48,
              textAlign: "center", border: "1px solid #e2ddd6",
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "linear-gradient(135deg, #4CAF50, #1A6B3C)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px",
                boxShadow: "0 8px 32px rgba(26,107,60,0.3)",
                animation: "pulse 1.5s ease infinite",
              }}>
                <Globe size={36} color="white" />
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#1C1A17", marginBottom: 8 }}>
                Analyse du sol en cours...
              </h2>
              <p style={{ fontSize: 14, color: "#9a9590", marginBottom: 32 }}>
                Notre modèle IA évalue la compatibilité de votre sol avec les cultures camerounaises
              </p>
              {["Traitement des paramètres pH, texture, humidité", "Calcul des scores de compatibilité", "Sélection des cultures optimales", "Génération des conseils personnalisés"].map((s, i) => (
                <div key={s} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 20px",
                  marginBottom: 8, background: "#f0faf4", borderRadius: 10,
                  fontSize: 13, color: "#1A6B3C", fontWeight: 500,
                  animation: `fadeIn 0.5s ease ${i * 0.4}s both`,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF50", animation: "pulse 1s ease infinite" }} />
                  {s}
                </div>
              ))}
              <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(0.97); } }
              `}</style>
            </div>
          )}

          {/* RÉSULTAT */}
          {step === "result" && resultat && recommandationsObj && (
            <div>
              {/* Évaluation globale */}
              <div className="result-header" style={{
                background: `linear-gradient(135deg, ${evalConfig.color}12, ${evalConfig.color}06)`,
                border: `2px solid ${evalConfig.color}30`,
                borderRadius: 20, padding: 24, marginBottom: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: evalConfig.color, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 4px 16px ${evalConfig.color}40`,
                  }}>
                    <evalConfig.icon size={28} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700, color: evalConfig.color,
                        background: evalConfig.bg, padding: "3px 12px", borderRadius: 20,
                        border: `1px solid ${evalConfig.color}30`,
                      }}>
                        {recommandationsObj.evaluation_label}
                      </span>
                      <span style={{ fontSize: 12, color: "#9a9590" }}>
                        {recommandationsObj.nb_cultures_compatibles} cultures compatibles
                      </span>
                    </div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "#1C1A17", marginBottom: 4 }}>
                      pH {resultat.ph} · {form.texture} · {form.humidite}
                    </h2>
                    <p style={{ fontSize: 13, color: "#5a5650", lineHeight: 1.6 }}>
                      {recommandationsObj.conseil_simple}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cultures recommandées */}
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1C1A17", marginBottom: 16 }}>
                🌱 Cultures recommandées pour votre sol
              </h3>

              {recommandationsObj.cultures_recommandees?.map((cult: any, i: number) => (
                <div key={cult.culture} className="culture-card" style={{
                  background: "white", borderRadius: 16, marginBottom: 16,
                  border: `1px solid ${i === 0 ? "#4CAF5040" : "#e2ddd6"}`,
                  boxShadow: i === 0 ? "0 4px 20px rgba(76,175,80,0.1)" : "0 2px 8px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                }}>
                  {/* Header culture */}
                  <div style={{
                    padding: "16px 20px",
                    background: i === 0 ? "#f5fdf5" : "white",
                    borderBottom: "1px solid #e2ddd6",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <span style={{ fontSize: 28 }}>{cult.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <h4 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1C1A17" }}>
                          {cult.culture}
                        </h4>
                        {i === 0 && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, background: "#1A6B3C",
                            color: "white", padding: "2px 8px", borderRadius: 20,
                          }}>
                            ⭐ MEILLEUR CHOIX
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: "#5a5650" }}>{cult.description}</p>
                    </div>
                    {/* Score */}
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <div style={{
                        fontFamily: "var(--font-display)", fontSize: 22,
                        fontWeight: 800, color: cult.score >= 80 ? "#1A6B3C" : cult.score >= 65 ? "#E8A020" : "#9a9590",
                      }}>
                        {cult.score}%
                      </div>
                      <div style={{ fontSize: 10, color: "#9a9590", fontWeight: 600 }}>COMPATIBILITÉ</div>
                      {/* Barre */}
                      <div style={{ width: 60, height: 4, background: "#e2ddd6", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
                        <div
                          className="score-bar-fill"
                          style={{
                            height: "100%", borderRadius: 2,
                            background: cult.score >= 80 ? "#1A6B3C" : cult.score >= 65 ? "#E8A020" : "#9a9590",
                            "--target-width": `${cult.score}%`,
                          } as React.CSSProperties}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Infos + Conseils */}
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
                      <div>
                        <span style={{ fontSize: 11, color: "#9a9590", fontWeight: 600 }}>RENDEMENT ESTIMÉ</span>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1A17" }}>{cult.rendement_estime}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: "#9a9590", fontWeight: 600 }}>PÉRIODE DE PLANTATION</span>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1A17" }}>{cult.periode_plantation}</p>
                      </div>
                    </div>

                    {/* Conseils */}
                    {cult.conseils?.map((c: any, j: number) => (
                      <div key={j} style={{ borderRadius: 10, marginBottom: 8, overflow: "hidden", border: "1px solid #e2ddd6" }}>
                        <div style={{
                          display: "flex", gap: 10, padding: "10px 14px",
                          background: j % 2 === 0 ? "#f0faf4" : "#fafaf8",
                        }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: "50%", background: "#4CAF50",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontSize: 10, fontWeight: 700, flexShrink: 0,
                          }}>
                            {j + 1}
                          </div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1A17" }}>{c.conseil}</p>
                        </div>
                        {c.explication && (
                          <div style={{ padding: "8px 14px 10px 46px", background: "white", borderTop: "1px dashed #e2ddd6" }}>
                            <p style={{ fontSize: 12, color: "#5a5650", lineHeight: 1.6, fontStyle: "italic" }}>
                              💡 {c.explication}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Amendements */}
                    <div style={{
                      marginTop: 12, padding: "10px 14px",
                      background: "#fffbf0", borderRadius: 10,
                      border: "1px solid rgba(232,160,32,0.25)",
                      display: "flex", gap: 8,
                    }}>
                      <Leaf size={14} color="#E8A020" style={{ flexShrink: 0, marginTop: 2 }} />
                      <p style={{ fontSize: 12, color: "#5a5650", lineHeight: 1.6 }}>
                        <strong style={{ color: "#E8A020" }}>Amendements conseillés :</strong> {cult.amendements}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Avertissement */}
              <div style={{
                background: "#f0f4ff", border: "1px solid #c7d2fe",
                borderRadius: 12, padding: "12px 16px", marginBottom: 20,
                display: "flex", gap: 8,
              }}>
                <Info size={16} color="#4f46e5" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: "#4f46e5", lineHeight: 1.6 }}>
                  Ces recommandations sont basées sur les paramètres renseignés. Pour une analyse complète de votre sol (analyses NPK, micronutriments), contactez l&apos;IRAD ou le MINADER de votre région.
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => { setStep("form"); setResultat(null) }} style={{
                  flex: 1, padding: "13px", background: "white",
                  border: "2px solid #e2ddd6", borderRadius: 14,
                  fontSize: 14, fontWeight: 600, color: "#5a5650", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <RotateCcw size={16} /> Nouvelle analyse
                </button>
                <button
                  onClick={async () => {
                    if (!recommandationsObj) return
                    setIsGeneratingPDF(true)
                    const cultures = recommandationsObj.cultures_recommandees?.map((c: any) => c.culture) || []
                    generateDiagnosticPDF({
                      type: "pedologique",
                      parcelle: form.parcelle,
                      region: form.region,
                      ph: parseFloat(form.ph),
                      texture: form.texture,
                      humidite: form.humidite,
                      drainage: form.drainage,
                      cultures_recommandees: cultures,
                      conseil: recommandationsObj.conseil_simple,
                      userName: "Nathulie Evina",
                    })
                    setIsGeneratingPDF(false)
                  }}
                  disabled={isGeneratingPDF}
                  style={{
                    flex: 1, padding: "13px",
                    background: "linear-gradient(135deg, #4CAF50, #1A6B3C)",
                    border: "none", borderRadius: 14,
                    fontSize: 14, fontWeight: 700, color: "white",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: "0 4px 16px rgba(26,107,60,0.3)",
                  }}
                >
                  <Download size={16} /> Télécharger le rapport PDF
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Historique */}
        {showHistory && (
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1C1A17", marginBottom: 16 }}>
              Analyses récentes
            </h3>
            {historique.length === 0 ? (
              <div style={{ background: "white", borderRadius: 16, padding: 24, textAlign: "center", border: "1px solid #e2ddd6", color: "#9a9590", fontSize: 13 }}>
                Aucune analyse effectuée
              </div>
            ) : (
              historique.map((h: any) => (
                <div key={h.id} style={{ background: "white", borderRadius: 14, padding: 16, border: "1px solid #e2ddd6", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#4CAF50" }}>pH {h.ph}</span>
                    <span style={{ fontSize: 11, color: "#9a9590" }}>{new Date(h.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#5a5650" }}>{h.texture} · {h.humidite} · {h.region || "—"}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
