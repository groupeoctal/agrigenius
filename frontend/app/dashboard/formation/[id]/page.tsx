"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import {
  ArrowLeft, BookOpen, Clock, ChevronRight, ChevronLeft,
  CheckCircle, Play, Award, Loader2, Download, Star,
  Video, Image as ImageIcon, HelpCircle, X, Trophy
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"
import { useParams } from "next/navigation"
import { generateCertificatPDF } from "@/lib/generateCertificat"

const FILIERE_COLORS: Record<string, string> = {
  "Général": "#1A6B3C", "Cacao": "#8B4513", "Maraîchage": "#E8A020",
  "Manioc": "#4CAF50", "Maïs": "#F4A400", "Palmier": "#2E7D32",
}

export default function CoursDetailPage() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const pageRef = useRef<HTMLDivElement>(null)

  const [cours, setCours] = useState<any>(null)
  const [moduleActuel, setModuleActuel] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [view, setView] = useState<"cours" | "quiz" | "resultat">("cours")

  // Quiz
  const [questions, setQuestions] = useState<any[]>([])
  const [reponses, setReponses] = useState<Record<number, string>>({})
  const [quizResultat, setQuizResultat] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quizPrecedent, setQuizPrecedent] = useState<any>(null)

  useEffect(() => { chargerCours() }, [id])

  const chargerCours = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/formation/cours/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCours(data)
        setModuleActuel(data.progression?.module_actuel || 0)
        setCompleted(data.progression?.completed || false)
        setQuizPrecedent(data.quiz_resultat)
      }
    } catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }

  const chargerQuiz = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/formation/cours/${id}/quiz`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setQuestions(data)
        setReponses({})
        setView("quiz")
        gsap.fromTo(".quiz-card", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" })
      }
    } catch (e) { console.error(e) }
  }

  const soumettreQuiz = async () => {
    if (Object.keys(reponses).length < questions.length) {
      gsap.fromTo(".quiz-warning", { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3 })
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/formation/cours/${id}/quiz/soumettre`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(reponses),
      })
      if (res.ok) {
        const data = await res.json()
        setQuizResultat(data)
        setView("resultat")
        setTimeout(() => {
          gsap.fromTo(".resultat-card", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" })
          gsap.fromTo(".correction-item", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, delay: 0.3 })
          if (data.passed) {
            gsap.to(".score-circle", { scale: [1.2, 1], duration: 0.5, delay: 0.4, ease: "back.out" })
          }
        }, 100)
      }
    } catch (e) { console.error(e) }
    finally { setIsSubmitting(false) }
  }

  useEffect(() => {
    if (!cours || view !== "cours") return
    const ctx = gsap.context(() => {
      gsap.fromTo(".module-content", { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" })
    }, pageRef)
    return () => ctx.revert()
  }, [moduleActuel, cours, view])

  const sauvegarderProgression = async (index: number) => {
    setIsSaving(true)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/formation/cours/${id}/progression?module_actuel=${index}`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }
      })
    } catch { }
    setIsSaving(false)
  }

  const allerAuModule = async (index: number) => {
    setModuleActuel(index)
    setView("cours")
    if (index > (cours?.progression?.module_actuel || 0)) {
      await sauvegarderProgression(index)
      setCours((prev: any) => ({
        ...prev,
        progression: { ...prev.progression, module_actuel: index, pourcentage: Math.round((index / prev.modules.length) * 100) }
      }))
    }
  }

  const moduleTerminer = async () => {
    if (!cours) return
    const nextIndex = moduleActuel + 1
    if (nextIndex >= cours.modules.length) {
      await sauvegarderProgression(cours.modules.length)
      setCompleted(true)
      // Proposer le quiz si disponible
      if (cours.nb_questions > 0) {
        gsap.fromTo(".quiz-prompt", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.5)" })
      }
    } else {
      allerAuModule(nextIndex)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const renderContenu = (texte: string) => {
    return texte.split('\n').map((line: string, i: number) => {
      if (!line.trim()) return <div key={i} style={{ height: 8 }} />
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} style={{ fontWeight: 700, fontSize: 15, color: "#1C1A17", margin: "16px 0 6px" }}>{line.replace(/\*\*/g, '')}</p>
      }
      const isEmojiBullet = /^(🌿|🍂|💧|🌬️|🦠|🪨|📅|🗓️|🔧|🌱|🚿|💧|🐛|🦗|🐌|🐄|🧂|✅|⚠️|❌|🟡|🟤|🔴|🌀|⬛|🟠|🌡️|🌍|☀️|🛒|🌟|🏜️)/.test(line)
      if (isEmojiBullet) {
        return <div key={i} style={{ padding: "10px 14px", background: "#f0faf4", borderRadius: 10, margin: "5px 0", fontSize: 13, color: "#1C1A17", lineHeight: 1.7 }}>{line}</div>
      }
      if (line.startsWith('| ') && line.includes(' | ')) {
        const cells = line.split('|').filter(c => c.trim())
        const isHeader = texte.split('\n')[texte.split('\n').indexOf(line) + 1]?.match(/^[\|\s\-]+$/)
        if (isHeader) {
          return <tr key={i} style={{ background: "#1A6B3C" }}>{cells.map((c, j) => <th key={j} style={{ padding: "8px 12px", color: "white", fontSize: 12, textAlign: "left", fontWeight: 700 }}>{c.trim()}</th>)}</tr>
        }
        return <tr key={i} style={{ background: i % 2 === 0 ? "#f0faf4" : "white" }}>{cells.map((c, j) => <td key={j} style={{ padding: "7px 12px", fontSize: 12, color: "#1C1A17", borderBottom: "1px solid #e2ddd6" }}>{c.trim()}</td>)}</tr>
      }
      if (line.match(/^[\|\s\-]+$/)) return null
      return <p key={i} style={{ fontSize: 14, color: "#1C1A17", lineHeight: 1.8, margin: "3px 0" }}>{line}</p>
    }).filter(Boolean)
  }

  if (isLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 }}>
      <Loader2 size={28} color="#1A6B3C" style={{ animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
  if (!cours) return <div style={{ padding: 40, textAlign: "center" }}>Cours introuvable. <Link href="/dashboard/formation">Retour</Link></div>

  const filiereColor = FILIERE_COLORS[cours.filiere] || "#1A6B3C"
  const progression = cours.progression?.pourcentage || 0
  const moduleData = cours.modules[moduleActuel]
  const isLastModule = moduleActuel === cours.modules.length - 1

  return (
    <div ref={pageRef} style={{ padding: "32px 36px", maxWidth: 1050, margin: "0 auto" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes confetti { 0%{transform:translateY(0) rotate(0)} 100%{transform:translateY(-20px) rotate(360deg)} }`}</style>

      {/* Retour */}
      <Link href="/dashboard/formation" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#9a9590", textDecoration: "none", fontSize: 13, fontWeight: 500, marginBottom: 20 }}>
        <ArrowLeft size={14} /> Retour au catalogue
      </Link>

      {/* Header cours */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: `${filiereColor}15`, color: filiereColor }}>{cours.filiere}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "#F7F5F0", color: "#9a9590", textTransform: "capitalize" }}>{cours.niveau}</span>
            {quizPrecedent?.passed && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#f0faf4", color: "#1A6B3C" }}>✅ Quiz validé — {quizPrecedent.score}%</span>}
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#1C1A17", marginBottom: 6 }}>{cours.titre}</h1>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#9a9590", display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {cours.duree} min</span>
            <span style={{ fontSize: 12, color: "#9a9590", display: "flex", alignItems: "center", gap: 4 }}><BookOpen size={12} /> {cours.modules.length} modules</span>
            {cours.nb_questions > 0 && <span style={{ fontSize: 12, color: "#9a9590", display: "flex", alignItems: "center", gap: 4 }}><HelpCircle size={12} /> {cours.nb_questions} questions</span>}
          </div>
        </div>
        <div style={{ textAlign: "center", minWidth: 80 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: filiereColor }}>{Math.round(progression)}%</div>
          <div style={{ fontSize: 10, color: "#9a9590", fontWeight: 600, marginBottom: 4 }}>PROGRESSION</div>
          <div style={{ width: 80, height: 5, background: "#e2ddd6", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progression}%`, background: filiereColor, transition: "width 0.8s" }} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 24 }}>

        {/* Sidebar */}
        <div style={{ height: "fit-content", position: "sticky", top: 20 }}>
          <div style={{ background: "white", borderRadius: 16, padding: 16, border: "1px solid #e2ddd6", marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9a9590", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Modules</p>
            {cours.modules.map((mod: any, i: number) => {
              const isDone = i < (cours.progression?.module_actuel || 0)
              const isCurrent = i === moduleActuel && view === "cours"
              return (
                <button key={mod.id} onClick={() => allerAuModule(i)} style={{
                  width: "100%", padding: "9px 12px", borderRadius: 10, marginBottom: 4,
                  cursor: "pointer", textAlign: "left",
                  border: `1px solid ${isCurrent ? filiereColor + "40" : "transparent"}`,
                  background: isCurrent ? `${filiereColor}10` : "transparent",
                  display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s",
                }}
                  onMouseEnter={e => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = "#F7F5F0" }}
                  onMouseLeave={e => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = "transparent" }}
                >
                  <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: isDone ? "#4CAF50" : isCurrent ? filiereColor : "#e2ddd6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isDone ? <CheckCircle size={12} color="white" /> : <span style={{ fontSize: 9, fontWeight: 700, color: isCurrent ? "white" : "#9a9590" }}>{i + 1}</span>}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? filiereColor : "#1C1A17", lineHeight: 1.3 }}>{mod.titre}</span>
                </button>
              )
            })}
          </div>

          {/* Bouton Quiz */}
          {cours.nb_questions > 0 && (
            <button onClick={chargerQuiz} style={{
              width: "100%", padding: "12px", borderRadius: 14, cursor: "pointer",
              background: view === "quiz" || view === "resultat" ? filiereColor : "white",
              border: `2px solid ${filiereColor}`,
              color: view === "quiz" || view === "resultat" ? "white" : filiereColor,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontSize: 13, fontWeight: 700, transition: "all 0.2s",
            }}>
              <HelpCircle size={16} /> Quiz ({cours.nb_questions} questions)
            </button>
          )}

          {/* Certificat */}
          {quizPrecedent?.passed && (
            <button
              onClick={() => generateCertificatPDF({
                userName: user ? `${user.prenom} ${user.nom}` : "Agriculteur",
                coursTitre: cours.titre,
                coursFiliere: cours.filiere,
                score: quizPrecedent.score,
                date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
              })}
              style={{
                width: "100%", padding: "12px", borderRadius: 14, cursor: "pointer",
                background: "linear-gradient(135deg, #E8A020, #c4871a)",
                border: "none", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontSize: 13, fontWeight: 700, marginTop: 8,
                boxShadow: "0 4px 16px rgba(232,160,32,0.3)",
              }}>
              <Download size={16} /> Télécharger mon certificat
            </button>
          )}
        </div>

        {/* Zone principale */}
        <div>

          {/* ─── CONTENU DU MODULE ─── */}
          {view === "cours" && moduleData && (
            <div className="module-content" style={{ background: "white", borderRadius: 16, border: "1px solid #e2ddd6" }}>

              {/* Image placeholder */}
              <div style={{
                height: 140, background: `linear-gradient(135deg, ${filiereColor}20, ${filiereColor}08)`,
                borderRadius: "16px 16px 0 0", display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 8, border: `2px dashed ${filiereColor}30`,
                position: "relative", overflow: "hidden",
              }}>
                {moduleData.video_url ? (
                  <div style={{ position: "relative", width: "100%", height: "100%" }}>
                    <video controls style={{ width: "100%", height: "100%", objectFit: "cover" }}>
                      <source src={moduleData.video_url} />
                    </video>
                  </div>
                ) : (
                  <>
                    <ImageIcon size={32} color={`${filiereColor}60`} />
                    <p style={{ fontSize: 12, color: `${filiereColor}80`, fontWeight: 600 }}>
                      Image / Vidéo — À ajouter via le module Admin
                    </p>
                    <div style={{
                      position: "absolute", top: 10, right: 10,
                      background: `${filiereColor}15`, borderRadius: 8,
                      padding: "4px 10px", fontSize: 10, color: filiereColor, fontWeight: 700,
                    }}>
                      Module Admin → Gérer les cours
                    </div>
                  </>
                )}
              </div>

              <div style={{ padding: "24px 28px" }}>
                {/* Titre module */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #e2ddd6" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: `${filiereColor}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Play size={16} color={filiereColor} />
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: "#9a9590", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Module {moduleActuel + 1} / {cours.modules.length}
                    </p>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "#1C1A17" }}>
                      {moduleData.titre}
                    </h2>
                  </div>
                </div>

                {/* Contenu */}
                <div style={{ lineHeight: 1.8, minHeight: 200 }}>
                  {renderContenu(moduleData.contenu)}
                </div>

                {/* Prompt quiz après dernier module */}
                {completed && cours.nb_questions > 0 && !quizPrecedent && (
                  <div className="quiz-prompt" style={{
                    marginTop: 24, background: "linear-gradient(135deg, #f0faf4, #e8f5e9)",
                    border: "2px solid #1A6B3C40", borderRadius: 16, padding: "20px 24px",
                    display: "flex", alignItems: "center", gap: 16,
                  }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#1A6B3C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Trophy size={24} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: "#1C1A17", marginBottom: 4 }}>
                        🎉 Vous avez terminé tous les modules !
                      </p>
                      <p style={{ fontSize: 12, color: "#5a5650" }}>
                        Validez vos connaissances avec le quiz pour obtenir votre certificat.
                      </p>
                    </div>
                    <button onClick={chargerQuiz} style={{
                      padding: "10px 20px", background: "#1A6B3C", border: "none",
                      borderRadius: 12, color: "white", fontWeight: 700, fontSize: 13,
                      cursor: "pointer", flexShrink: 0,
                    }}>
                      Passer le quiz →
                    </button>
                  </div>
                )}

                {/* Navigation */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 16, borderTop: "1px solid #e2ddd6" }}>
                  <button onClick={() => allerAuModule(moduleActuel - 1)} disabled={moduleActuel === 0} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
                    borderRadius: 12, background: "white", border: "2px solid #e2ddd6",
                    cursor: moduleActuel === 0 ? "not-allowed" : "pointer",
                    opacity: moduleActuel === 0 ? 0.4 : 1, fontSize: 13, fontWeight: 600, color: "#5a5650",
                  }}>
                    <ChevronLeft size={16} /> Précédent
                  </button>
                  {!completed && (
                    <button onClick={moduleTerminer} disabled={isSaving} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "10px 24px",
                      borderRadius: 12, background: `linear-gradient(135deg, ${filiereColor}, ${filiereColor}90)`,
                      border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "white",
                      boxShadow: `0 4px 16px ${filiereColor}40`,
                    }}>
                      {isSaving ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Sauvegarde...</>
                        : isLastModule ? <><CheckCircle size={14} /> Terminer le cours</>
                          : <>Suivant <ChevronRight size={14} /></>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── QUIZ ─── */}
          {view === "quiz" && (
            <div className="quiz-card" style={{ background: "white", borderRadius: 16, padding: 32, border: "1px solid #e2ddd6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #e2ddd6" }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${filiereColor}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <HelpCircle size={22} color={filiereColor} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "#1C1A17" }}>
                    Quiz de validation
                  </h2>
                  <p style={{ fontSize: 12, color: "#9a9590" }}>
                    {questions.length} questions • Score minimum requis : 70% • Certificat obtenu si réussi
                  </p>
                </div>
              </div>

              {questions.map((q, qi) => (
                <div key={q.id} style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1C1A17", marginBottom: 12, lineHeight: 1.5 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 24, height: 24, borderRadius: "50%", background: filiereColor,
                      color: "white", fontSize: 11, fontWeight: 800, marginRight: 10, flexShrink: 0,
                    }}>{qi + 1}</span>
                    {q.question}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {["a", "b", "c", "d"].filter(opt => q[`option_${opt}`]).map(opt => {
                      const selected = reponses[q.id] === opt
                      return (
                        <button key={opt} onClick={() => setReponses(r => ({ ...r, [q.id]: opt }))} style={{
                          padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                          textAlign: "left", border: `2px solid ${selected ? filiereColor : "#e2ddd6"}`,
                          background: selected ? `${filiereColor}10` : "white",
                          transition: "all 0.2s", display: "flex", gap: 10, alignItems: "center",
                        }}>
                          <span style={{
                            width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                            background: selected ? filiereColor : "#F7F5F0",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 800, color: selected ? "white" : "#9a9590",
                            border: `1px solid ${selected ? filiereColor : "#e2ddd6"}`,
                          }}>
                            {opt.toUpperCase()}
                          </span>
                          <span style={{ fontSize: 13, color: "#1C1A17", fontWeight: selected ? 600 : 400 }}>
                            {q[`option_${opt}`]}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Avertissement questions manquantes */}
              {Object.keys(reponses).length < questions.length && (
                <div className="quiz-warning" style={{
                  background: "#fef2f2", border: "1px solid #fecaca",
                  borderRadius: 10, padding: "10px 14px", marginBottom: 16,
                  fontSize: 12, color: "#C0392B", opacity: 0,
                }}>
                  ⚠️ Veuillez répondre à toutes les questions avant de soumettre.
                </div>
              )}

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button onClick={() => setView("cours")} style={{
                  padding: "11px 20px", borderRadius: 12, border: "2px solid #e2ddd6",
                  background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#5a5650",
                }}>
                  ← Retour au cours
                </button>
                <button onClick={soumettreQuiz} disabled={isSubmitting} style={{
                  padding: "11px 28px", borderRadius: 12, border: "none",
                  background: `linear-gradient(135deg, ${filiereColor}, ${filiereColor}90)`,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: 13, fontWeight: 700, color: "white",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: `0 4px 16px ${filiereColor}30`,
                }}>
                  {isSubmitting
                    ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Correction...</>
                    : <><CheckCircle size={14} /> Soumettre le quiz</>}
                </button>
              </div>
            </div>
          )}

          {/* ─── RÉSULTAT QUIZ ─── */}
          {view === "resultat" && quizResultat && (
            <div className="resultat-card">
              {/* Score principal */}
              <div style={{
                background: quizResultat.passed
                  ? "linear-gradient(135deg, #1A6B3C, #4CAF50)"
                  : "linear-gradient(135deg, #C0392B, #e74c3c)",
                borderRadius: 20, padding: "32px 28px", marginBottom: 20,
                display: "flex", alignItems: "center", gap: 24,
                boxShadow: `0 8px 32px ${quizResultat.passed ? "rgba(26,107,60,0.25)" : "rgba(192,57,43,0.25)"}`,
              }}>
                {/* Score circulaire */}
                <div className="score-circle" style={{
                  width: 90, height: 90, borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexDirection: "column", border: "3px solid rgba(255,255,255,0.4)",
                }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "white" }}>
                    {quizResultat.score}%
                  </span>
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "white", marginBottom: 6 }}>
                    {quizResultat.passed ? "🎉 Quiz réussi !" : "😔 Quiz non validé"}
                  </h2>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 8 }}>
                    {quizResultat.nb_correct} / {quizResultat.nb_total} bonnes réponses
                    {quizResultat.passed ? " — Score minimum atteint !" : " — Il faut 70% minimum"}
                  </p>
                  {quizResultat.badge && (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: "rgba(255,255,255,0.2)", borderRadius: 20,
                      padding: "4px 14px", fontSize: 12, fontWeight: 700, color: "white",
                    }}>
                      {quizResultat.badge.emoji} Badge obtenu : {quizResultat.badge.titre}
                    </div>
                  )}
                </div>
                {quizResultat.passed && (
                  <button
                    onClick={() => generateCertificatPDF({
                      userName: user ? `${user.prenom} ${user.nom}` : "Agriculteur",
                      coursTitre: cours.titre,
                      coursFiliere: cours.filiere,
                      score: quizResultat.score,
                      date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
                    })}
                    style={{
                      marginLeft: "auto", display: "flex", alignItems: "center", gap: 8,
                      padding: "12px 20px", background: "#E8A020", border: "none",
                      borderRadius: 12, color: "white", fontWeight: 700, fontSize: 13,
                      cursor: "pointer", flexShrink: 0,
                      boxShadow: "0 4px 16px rgba(232,160,32,0.4)",
                    }}
                  >
                    <Download size={16} /> Certificat PDF
                  </button>
                )}
              </div>

              {/* Corrections */}
              <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e2ddd6" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1C1A17", marginBottom: 16 }}>
                  Correction détaillée
                </h3>
                {quizResultat.corrections?.map((c: any, i: number) => (
                  <div key={i} className="correction-item" style={{
                    borderRadius: 12, marginBottom: 12, overflow: "hidden",
                    border: `1px solid ${c.correct ? "#4CAF5030" : "#C0392B30"}`,
                  }}>
                    <div style={{
                      padding: "12px 16px",
                      background: c.correct ? "#f0faf4" : "#fef2f2",
                      display: "flex", gap: 10,
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                        background: c.correct ? "#4CAF50" : "#C0392B",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {c.correct
                          ? <CheckCircle size={14} color="white" />
                          : <X size={14} color="white" />}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1A17" }}>{c.question}</p>
                    </div>
                    {!c.correct && (
                      <div style={{ padding: "10px 16px 12px 50px", background: "white", borderTop: "1px dashed #e2ddd6" }}>
                        <p style={{ fontSize: 12, color: "#C0392B", marginBottom: 4 }}>
                          Votre réponse : option {c.reponse_user?.toUpperCase() || "—"}
                        </p>
                        <p style={{ fontSize: 12, color: "#1A6B3C", fontWeight: 600, marginBottom: 6 }}>
                          ✅ Bonne réponse : option {c.bonne_reponse?.toUpperCase()}
                        </p>
                        {c.explication && (
                          <p style={{ fontSize: 12, color: "#5a5650", lineHeight: 1.6, fontStyle: "italic" }}>
                            💡 {c.explication}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button onClick={chargerQuiz} style={{
                  flex: 1, padding: "12px", border: `2px solid ${filiereColor}`,
                  borderRadius: 12, background: "white", cursor: "pointer",
                  fontSize: 13, fontWeight: 700, color: filiereColor,
                }}>
                  🔄 Recommencer le quiz
                </button>
                <Link href="/dashboard/formation" style={{
                  flex: 1, padding: "12px", borderRadius: 12, textAlign: "center",
                  background: `linear-gradient(135deg, ${filiereColor}, ${filiereColor}90)`,
                  color: "white", textDecoration: "none", fontWeight: 700, fontSize: 13,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  Autres cours →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
