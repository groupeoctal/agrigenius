"use client"

import { useEffect, useState } from "react"
import {
  ArrowLeft, Plus, Edit, Trash2, Save, X, Loader2,
  CheckCircle, AlertCircle, FileText, Video
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useRouter, useParams } from "next/navigation"
import { gsap } from "gsap"

export default function AdminCoursModulesPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const params = useParams()
  const coursId = params.id as string

  const [cours, setCours] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingModule, setEditingModule] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [form, setForm] = useState({
    titre: "",
    contenu: "",
    video_url: "",
    ordre: 0,
  })

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard")
      return
    }
    chargerCours()
    chargerModules()
  }, [user, router, coursId])

  const chargerCours = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/formation/cours/${coursId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCours(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const chargerModules = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/formation/cours/${coursId}/modules`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setModules(data.sort((a: any, b: any) => a.ordre - b.ordre))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const openModal = (moduleToEdit: any = null) => {
    if (moduleToEdit) {
      setEditingModule(moduleToEdit)
      setForm({
        titre: moduleToEdit.titre,
        contenu: moduleToEdit.contenu || "",
        video_url: moduleToEdit.video_url || "",
        ordre: moduleToEdit.ordre,
      })
    } else {
      setEditingModule(null)
      setForm({
        titre: "",
        contenu: "",
        video_url: "",
        ordre: modules.length + 1,
      })
    }
    setShowModal(true)
    setTimeout(() => {
      gsap.fromTo(".modal-content", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3 })
    }, 50)
  }

  const closeModal = () => {
    gsap.to(".modal-content", {
      opacity: 0, scale: 0.9, duration: 0.2,
      onComplete: () => setShowModal(false)
    })
  }

  const saveModule = async () => {
    if (!form.titre) {
      setError("Le titre est obligatoire")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const url = editingModule
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/cours/${coursId}/modules/${editingModule.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/cours/${coursId}/modules`

      const res = await fetch(url, {
        method: editingModule ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setSuccess(editingModule ? "Module modifié avec succès" : "Module créé avec succès")
        chargerModules()
        closeModal()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await res.json()
        setError(data.detail || "Erreur lors de l'enregistrement")
      }
    } catch (e: any) {
      setError("Erreur de connexion")
    } finally {
      setIsSaving(false)
    }
  }

  const deleteModule = async (moduleId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce module ?")) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/cours/${coursId}/modules/${moduleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        setSuccess("Module supprimé")
        chargerModules()
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (e: any) {
      setError("Erreur lors de la suppression")
    }
  }

  if (user?.role !== "admin") return null

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/dashboard/admin/cours" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "#9a9590", textDecoration: "none", fontSize: 13,
          fontWeight: 500, marginBottom: 12,
        }}>
          <ArrowLeft size={14} /> Retour aux cours
        </Link>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#1C1A17", marginBottom: 4 }}>
              Modules du cours
            </h1>
            <p style={{ fontSize: 14, color: "#9a9590" }}>
              {cours?.titre || "Chargement..."}
            </p>
          </div>

          <button onClick={() => openModal()} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 20px", borderRadius: 12,
            background: "linear-gradient(135deg, #1A6B3C, #2d8a52)",
            color: "white", border: "none", cursor: "pointer",
            fontSize: 14, fontWeight: 700,
            boxShadow: "0 4px 16px rgba(26,107,60,0.3)",
          }}>
            <Plus size={16} /> Ajouter un module
          </button>
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
      </div>

      {/* Liste des modules */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <Loader2 size={32} color="#1A6B3C" style={{ animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, color: "#9a9590" }}>Chargement...</p>
        </div>
      ) : modules.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "white", borderRadius: 16, border: "1px solid #e2ddd6" }}>
          <FileText size={48} color="#9a9590" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1C1A17", marginBottom: 8 }}>
            Aucun module pour l'instant
          </h3>
          <p style={{ fontSize: 13, color: "#9a9590", marginBottom: 20 }}>
            Commencez par ajouter le premier module de contenu pour ce cours
          </p>
          <button onClick={() => openModal()} style={{
            padding: "10px 20px", borderRadius: 10,
            background: "linear-gradient(135deg, #1A6B3C, #2d8a52)",
            color: "white", border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600,
          }}>
            <Plus size={14} style={{ display: "inline", marginRight: 6 }} />
            Ajouter le premier module
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {modules.map((mod, index) => (
            <div key={mod.id} style={{
              background: "white", borderRadius: 16, padding: 20,
              border: "1px solid #e2ddd6",
              display: "flex", gap: 16, alignItems: "flex-start",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "linear-gradient(135deg, #1A6B3C, #2d8a52)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 800, color: "white",
                flexShrink: 0,
              }}>
                {index + 1}
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1C1A17", marginBottom: 6 }}>
                  {mod.titre}
                </h3>
                {mod.contenu && (
                  <p style={{ fontSize: 13, color: "#9a9590", lineHeight: 1.6, marginBottom: 8 }}>
                    {mod.contenu.substring(0, 150)}...
                  </p>
                )}
                {mod.video_url && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#1A6B3C" }}>
                    <Video size={14} /> Vidéo disponible
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => openModal(mod)} style={{
                  padding: "8px 12px", borderRadius: 8,
                  border: "1px solid #1A6B3C", background: "white",
                  color: "#1A6B3C", cursor: "pointer",
                  fontSize: 12, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <Edit size={12} /> Modifier
                </button>
                <button onClick={() => deleteModule(mod.id)} style={{
                  padding: "8px 12px", borderRadius: 8,
                  border: "1px solid #fecaca", background: "white",
                  color: "#C0392B", cursor: "pointer",
                  fontSize: 12, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Créer/Modifier Module */}
      {showModal && (
        <>
          <div onClick={closeModal} style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(0,0,0,0.5)",
          }} />

          <div className="modal-content" style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%", maxWidth: 700,
            maxHeight: "90vh", overflowY: "auto",
            background: "white", borderRadius: 20,
            boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
            zIndex: 1000, padding: 32,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "#1C1A17" }}>
                {editingModule ? "Modifier le module" : "Nouveau module"}
              </h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} color="#9a9590" />
              </button>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                  Titre du module <span style={{ color: "#C0392B" }}>*</span>
                </label>
                <input
                  value={form.titre}
                  onChange={e => setForm({ ...form, titre: e.target.value })}
                  placeholder="Ex: Introduction à la culture du cacao"
                  style={{
                    width: "100%", padding: "11px 14px",
                    border: "2px solid #e2ddd6", borderRadius: 12,
                    fontSize: 14, outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                  Contenu du module
                </label>
                <textarea
                  value={form.contenu}
                  onChange={e => setForm({ ...form, contenu: e.target.value })}
                  rows={10}
                  placeholder="Rédigez le contenu du module (texte formaté, instructions, etc.)"
                  style={{
                    width: "100%", padding: "11px 14px",
                    border: "2px solid #e2ddd6", borderRadius: 12,
                    fontSize: 14, outline: "none", fontFamily: "inherit",
                    lineHeight: 1.6,
                  }}
                />
                <p style={{ fontSize: 11, color: "#9a9590", marginTop: 4, fontStyle: "italic" }}>
                  Vous pouvez ajouter du texte, des listes, des instructions, etc.
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                  URL Vidéo (optionnelle)
                </label>
                <input
                  value={form.video_url}
                  onChange={e => setForm({ ...form, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  style={{
                    width: "100%", padding: "11px 14px",
                    border: "2px solid #e2ddd6", borderRadius: 12,
                    fontSize: 14, outline: "none",
                  }}
                />
                <p style={{ fontSize: 11, color: "#9a9590", marginTop: 4, fontStyle: "italic" }}>
                  Lien YouTube, Vimeo ou autre plateforme vidéo
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  value={form.ordre}
                  onChange={e => setForm({ ...form, ordre: parseInt(e.target.value) || 1 })}
                  style={{
                    width: "100%", padding: "11px 14px",
                    border: "2px solid #e2ddd6", borderRadius: 12,
                    fontSize: 14, outline: "none",
                  }}
                />
                <p style={{ fontSize: 11, color: "#9a9590", marginTop: 4, fontStyle: "italic" }}>
                  Position du module dans le cours (1 = premier module)
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={closeModal} style={{
                flex: 1, padding: "12px", borderRadius: 12,
                border: "2px solid #e2ddd6", background: "white",
                color: "#5a5650", fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>
                Annuler
              </button>
              <button onClick={saveModule} disabled={isSaving} style={{
                flex: 2, padding: "12px", borderRadius: 12,
                border: "none", background: "linear-gradient(135deg, #1A6B3C, #2d8a52)",
                color: "white", fontSize: 14, fontWeight: 700,
                cursor: isSaving ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {isSaving ? <><Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Enregistrement...</> : <><Save size={16} /> Enregistrer</>}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
