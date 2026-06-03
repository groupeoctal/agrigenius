"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"
import {
  BookOpen, ArrowLeft, Clock, ChevronRight,
  Search, Filter, Star, Play, CheckCircle
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

gsap.registerPlugin(ScrollTrigger)

const FILIERES = ["Tous", "Général", "Cacao", "Maraîchage", "Manioc", "Maïs", "Palmier"]
const NIVEAUX = ["Tous", "débutant", "intermédiaire", "avancé"]

const FILIERE_COLORS: Record<string, { color: string; bg: string }> = {
  "Général":    { color: "#1A6B3C", bg: "#f0faf4" },
  "Cacao":      { color: "#8B4513", bg: "#fdf5f0" },
  "Maraîchage": { color: "#E8A020", bg: "#fffbf0" },
  "Manioc":     { color: "#4CAF50", bg: "#f5fdf5" },
  "Maïs":       { color: "#F4A400", bg: "#fffbf0" },
  "Palmier":    { color: "#2E7D32", bg: "#f1f8e9" },
}

const FILIERE_EMOJIS: Record<string, string> = {
  "Général": "🌍", "Cacao": "🍫", "Maraîchage": "🍅",
  "Manioc": "🌿", "Maïs": "🌽", "Palmier": "🌴",
}

export default function FormationPage() {
  const { token } = useAuth()
  const pageRef = useRef<HTMLDivElement>(null)

  const [cours, setCours] = useState<any[]>([])
  const [progressions, setProgressions] = useState<Record<number, any>>({})
  const [filiere, setFiliere] = useState("Tous")
  const [niveau, setNiveau] = useState("Tous")
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".page-header", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6 })
    }, pageRef)
    chargerCours()
    return () => ctx.revert()
  }, [])

  const chargerCours = async () => {
    try {
      const [coursRes, progRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/formation/cours`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/formation/mes-progressions`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      const coursData = await coursRes.json()
      setCours(coursData)

      if (progRes.ok) {
        const progData = await progRes.json()
        const progMap: Record<number, any> = {}
        progData.forEach((p: any) => { progMap[p.cours_id] = p })
        setProgressions(progMap)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        gsap.fromTo(".cours-card",
          { opacity: 0, y: 30, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
        )
      }, 100)
    }
  }

  const coursFiltres = cours.filter(c => {
    if (filiere !== "Tous" && c.filiere !== filiere) return false
    if (niveau !== "Tous" && c.niveau !== niveau) return false
    if (search && !c.titre.toLowerCase().includes(search.toLowerCase()) &&
        !c.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalCours = cours.length
  const coursTermines = Object.values(progressions).filter((p: any) => p.completed).length
  const coursEnCours = Object.values(progressions).filter((p: any) => !p.completed && p.pourcentage > 0).length

  return (
    <div ref={pageRef} style={{ padding: "32px 36px", maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 32 }}>
        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#9a9590", textDecoration: "none", fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
          <ArrowLeft size={14} /> Tableau de bord
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: "linear-gradient(135deg, #E8A020, #c4871a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(232,160,32,0.3)",
          }}>
            <BookOpen size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#1C1A17" }}>
              Espace Formation
            </h1>
            <p style={{ fontSize: 13, color: "#9a9590" }}>
              {totalCours} cours disponibles • Apprenez à votre rythme
            </p>
          </div>
        </div>

        {/* Stats rapides */}
        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          {[
            { label: "Cours disponibles", value: totalCours, color: "#1A6B3C" },
            { label: "En cours", value: coursEnCours, color: "#E8A020" },
            { label: "Terminés", value: coursTermines, color: "#4CAF50" },
          ].map(s => (
            <div key={s.label} style={{
              background: "white", borderRadius: 12, padding: "12px 20px",
              border: "1px solid #e2ddd6", display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 12, color: "#9a9590", fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres */}
      <div style={{
        background: "white", borderRadius: 16, padding: "20px 24px",
        border: "1px solid #e2ddd6", marginBottom: 24,
        display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap",
      }}>
        {/* Recherche */}
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9a9590" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un cours..."
            style={{
              width: "100%", padding: "10px 14px 10px 38px",
              border: "2px solid #e2ddd6", borderRadius: 10, fontSize: 14,
              outline: "none", fontFamily: "var(--font-sans)", transition: "border-color 0.2s",
            }}
            onFocus={e => (e.target.style.borderColor = "#E8A020")}
            onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
          />
        </div>

        {/* Filière */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILIERES.map(f => (
            <button key={f} onClick={() => setFiliere(f)} style={{
              padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: `2px solid ${filiere === f ? "#E8A020" : "#e2ddd6"}`,
              background: filiere === f ? "#E8A020" : "white",
              color: filiere === f ? "white" : "#5a5650",
              cursor: "pointer", transition: "all 0.2s",
            }}>
              {FILIERE_EMOJIS[f] || ""} {f}
            </button>
          ))}
        </div>

        {/* Niveau */}
        <div style={{ display: "flex", gap: 6 }}>
          {NIVEAUX.map(n => (
            <button key={n} onClick={() => setNiveau(n)} style={{
              padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: `2px solid ${niveau === n ? "#1A6B3C" : "#e2ddd6"}`,
              background: niveau === n ? "#1A6B3C" : "white",
              color: niveau === n ? "white" : "#5a5650",
              cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize",
            }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Cours en cours */}
      {coursEnCours > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1C1A17", marginBottom: 16 }}>
            ▶️ Continuer l&apos;apprentissage
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {cours.filter(c => progressions[c.id] && !progressions[c.id].completed && progressions[c.id].pourcentage > 0)
              .map(c => {
                const prog = progressions[c.id]
                const fc = FILIERE_COLORS[c.filiere] || FILIERE_COLORS["Général"]
                return (
                  <Link key={c.id} href={`/dashboard/formation/${c.id}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      background: "white", borderRadius: 16, overflow: "hidden",
                      border: `2px solid ${fc.color}40`,
                      boxShadow: `0 4px 20px ${fc.color}15`,
                      transition: "all 0.3s", cursor: "pointer",
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)" }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)" }}
                    >
                      <div style={{ height: 6, background: "#e2ddd6", position: "relative" }}>
                        <div style={{
                          position: "absolute", left: 0, top: 0, height: "100%",
                          width: `${prog.pourcentage}%`,
                          background: `linear-gradient(90deg, ${fc.color}, ${fc.color}90)`,
                          transition: "width 1s ease",
                        }} />
                      </div>
                      <div style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 24 }}>{FILIERE_EMOJIS[c.filiere] || "📚"}</span>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1C1A17", marginBottom: 2 }}>{c.titre}</h3>
                            <span style={{ fontSize: 11, color: fc.color, fontWeight: 600 }}>{prog.pourcentage}% complété</span>
                          </div>
                          <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: fc.color, display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <Play size={14} color="white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
          </div>
        </div>
      )}

      {/* Catalogue */}
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1C1A17", marginBottom: 16 }}>
        📚 Catalogue des cours ({coursFiltres.length})
      </h2>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9a9590" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", border: "3px solid #e2ddd6",
            borderTopColor: "#E8A020", animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          <p>Chargement des cours...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {coursFiltres.map(c => {
            const prog = progressions[c.id]
            const fc = FILIERE_COLORS[c.filiere] || FILIERE_COLORS["Général"]
            const isCompleted = prog?.completed
            const isStarted = prog && prog.pourcentage > 0

            return (
              <Link key={c.id} href={`/dashboard/formation/${c.id}`} style={{ textDecoration: "none" }}>
                <div className="cours-card" style={{
                  background: "white", borderRadius: 20, overflow: "hidden",
                  border: `1px solid ${isCompleted ? "#4CAF5040" : "#e2ddd6"}`,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  transition: "all 0.3s", cursor: "pointer",
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(-4px)"
                    el.style.boxShadow = `0 12px 32px ${fc.color}20`
                    el.style.borderColor = `${fc.color}40`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(0)"
                    el.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"
                    el.style.borderColor = isCompleted ? "#4CAF5040" : "#e2ddd6"
                  }}
                >
                  {/* Barre de progression */}
                  {isStarted && (
                    <div style={{ height: 4, background: "#e2ddd6" }}>
                      <div style={{
                        height: "100%", width: `${prog.pourcentage}%`,
                        background: isCompleted
                          ? "linear-gradient(90deg, #4CAF50, #1A6B3C)"
                          : `linear-gradient(90deg, ${fc.color}, ${fc.color}90)`,
                      }} />
                    </div>
                  )}

                  {/* Bannière couleur */}
                  <div style={{
                    height: 80, background: fc.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                  }}>
                    <span style={{ fontSize: 40 }}>{FILIERE_EMOJIS[c.filiere] || "📚"}</span>
                    {isCompleted && (
                      <div style={{
                        position: "absolute", top: 10, right: 10,
                        background: "#4CAF50", borderRadius: "50%",
                        width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <CheckCircle size={16} color="white" />
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "16px 20px" }}>
                    {/* Tags */}
                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20,
                        background: fc.bg, color: fc.color, border: `1px solid ${fc.color}30`,
                      }}>
                        {c.filiere}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "2px 10px", borderRadius: 20,
                        background: "#F7F5F0", color: "#9a9590", textTransform: "capitalize",
                      }}>
                        {c.niveau}
                      </span>
                    </div>

                    <h3 style={{
                      fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700,
                      color: "#1C1A17", marginBottom: 8, lineHeight: 1.4,
                    }}>
                      {c.titre}
                    </h3>
                    <p style={{ fontSize: 12, color: "#9a9590", lineHeight: 1.6, marginBottom: 14 }}>
                      {c.description.slice(0, 90)}...
                    </p>

                    {/* Infos bas */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 12 }}>
                        <span style={{ fontSize: 11, color: "#9a9590", display: "flex", alignItems: "center", gap: 3 }}>
                          <Clock size={12} /> {c.duree} min
                        </span>
                        <span style={{ fontSize: 11, color: "#9a9590", display: "flex", alignItems: "center", gap: 3 }}>
                          <BookOpen size={12} /> {c.nb_modules} modules
                        </span>
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 4,
                        background: fc.bg, padding: "5px 12px", borderRadius: 20,
                        fontSize: 11, fontWeight: 700, color: fc.color,
                      }}>
                        {isCompleted ? "✅ Terminé" : isStarted ? `${prog.pourcentage}%` : "Commencer"}
                        <ChevronRight size={12} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {!isLoading && coursFiltres.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "#9a9590" }}>
          <BookOpen size={48} color="#e2ddd6" style={{ margin: "0 auto 16px" }} />
          <p style={{ fontSize: 16, fontWeight: 600 }}>Aucun cours trouvé</p>
          <p style={{ fontSize: 13 }}>Essayez d&apos;autres filtres</p>
        </div>
      )}
    </div>
  )
}
