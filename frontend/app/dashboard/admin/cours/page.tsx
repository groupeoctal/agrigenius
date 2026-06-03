"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import {
  BookOpen, Search, Plus, Edit, Trash2, Loader2,
  ArrowLeft, AlertCircle, CheckCircle, X, Save, Eye, FileText, Upload
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export default function AdminCoursPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [cours, setCours] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingCours, setEditingCours] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const [form, setForm] = useState({
    titre: "",
    description: "",
    filiere: "",
    niveau: "débutant",
    duree: 60, // en minutes
    image: "",
    is_active: true,
  })

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard")
      return
    }
    chargerCours()
  }, [user, router])

  const chargerCours = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/formation/cours`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCours(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const openModal = (coursToEdit: any = null) => {
    if (coursToEdit) {
      setEditingCours(coursToEdit)
      setForm({
        titre: coursToEdit.titre,
        description: coursToEdit.description || "",
        filiere: coursToEdit.filiere,
        niveau: coursToEdit.niveau,
        duree: coursToEdit.duree || 60,
        image: coursToEdit.image || "",
        is_active: coursToEdit.is_active,
      })
    } else {
      setEditingCours(null)
      setForm({
        titre: "",
        description: "",
        filiere: "",
        niveau: "débutant",
        duree: 60,
        image: "",
        is_active: true,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image valide")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5MB")
      return
    }

    setIsUploadingImage(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      // TODO: Créer un endpoint pour uploader les images de cours
      // Pour l'instant, on utilise une URL temporaire
      setError("Fonctionnalité d'upload d'image à venir. Utilisez une URL pour l'instant.")

    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const saveCours = async () => {
    if (!form.titre || !form.filiere) {
      setError("Veuillez remplir tous les champs obligatoires")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const url = editingCours
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/cours/${editingCours.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/cours`

      const res = await fetch(url, {
        method: editingCours ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setSuccess(editingCours ? "Cours modifié avec succès" : "Cours créé avec succès")
        chargerCours()
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

  const deleteCours = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.")) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/cours/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        setSuccess("Cours supprimé")
        chargerCours()
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (e: any) {
      setError("Erreur lors de la suppression")
    }
  }

  const filteredCours = cours.filter(c =>
    c.titre.toLowerCase().includes(search.toLowerCase()) ||
    c.filiere.toLowerCase().includes(search.toLowerCase())
  )

  const filieres = ["Cacao", "Café", "Manioc", "Maïs", "Palmier à huile", "Maraîchage", "Élevage", "Agroforesterie"]

  if (user?.role !== "admin") return null

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1300, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/dashboard/admin" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "#9a9590", textDecoration: "none", fontSize: 13,
          fontWeight: 500, marginBottom: 12,
        }}>
          <ArrowLeft size={14} /> Retour au dashboard admin
        </Link>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: "linear-gradient(135deg, #E8A020, #f0c050)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(232,160,32,0.3)",
            }}>
              <BookOpen size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#1C1A17" }}>
                Gestion des Cours
              </h1>
              <p style={{ fontSize: 13, color: "#9a9590" }}>
                {cours.length} cours disponible{cours.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <button onClick={() => openModal()} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 20px", borderRadius: 12,
            background: "linear-gradient(135deg, #E8A020, #f0c050)",
            color: "white", border: "none", cursor: "pointer",
            fontSize: 14, fontWeight: 700,
            boxShadow: "0 4px 16px rgba(232,160,32,0.3)",
          }}>
            <Plus size={16} /> Nouveau cours
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

        {/* Recherche */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un cours..."
            style={{
              width: "100%", padding: "11px 14px 11px 40px",
              border: "2px solid #e2ddd6", borderRadius: 12,
              fontSize: 14, outline: "none",
            }}
          />
          <Search size={16} color="#9a9590" style={{
            position: "absolute", left: 14, top: "50%",
            transform: "translateY(-50%)",
          }} />
        </div>
      </div>

      {/* Liste des cours */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <Loader2 size={32} color="#E8A020" style={{ animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, color: "#9a9590" }}>Chargement...</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {filteredCours.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, color: "#9a9590" }}>
              Aucun cours trouvé
            </div>
          ) : (
            filteredCours.map(c => (
              <div key={c.id} style={{
                background: "white", borderRadius: 16, border: "1px solid #e2ddd6",
                overflow: "hidden", transition: "all 0.3s",
              }}>
                {c.image && (
                  <div style={{
                    height: 140, background: `url(${c.image}) center/cover`,
                    backgroundColor: "#F7F5F0",
                  }} />
                )}
                <div style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                      color: "#E8A020", background: "#fffbf0",
                      padding: "3px 8px", borderRadius: 4,
                    }}>
                      {c.filiere}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      color: c.is_active ? "#1A6B3C" : "#9a9590",
                      background: c.is_active ? "#f0faf4" : "#F7F5F0",
                      padding: "3px 8px", borderRadius: 4,
                    }}>
                      {c.is_active ? "Publié" : "Brouillon"}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1C1A17", marginBottom: 6 }}>
                    {c.titre}
                  </h3>
                  <p style={{ fontSize: 12, color: "#9a9590", lineHeight: 1.5, marginBottom: 12 }}>
                    {c.description?.substring(0, 80)}...
                  </p>
                  <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#9a9590", marginBottom: 16 }}>
                    <span>🎓 {c.niveau}</span>
                    <span>⏱️ {Math.floor(c.duree / 60)}h{c.duree % 60 > 0 ? ` ${c.duree % 60}min` : ""}</span>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href={`/dashboard/admin/cours/${c.id}/modules`} style={{
                      flex: 1, padding: "8px", borderRadius: 8,
                      border: "1px solid #1A6B3C", background: "white",
                      color: "#1A6B3C", textDecoration: "none",
                      fontSize: 12, fontWeight: 600, textAlign: "center",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                    }}>
                      <FileText size={12} /> Modules
                    </Link>
                    <button onClick={() => openModal(c)} style={{
                      flex: 1, padding: "8px", borderRadius: 8,
                      border: "1px solid #E8A020", background: "white",
                      color: "#E8A020", cursor: "pointer",
                      fontSize: 12, fontWeight: 600,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                    }}>
                      <Edit size={12} /> Modifier
                    </button>
                    <button onClick={() => deleteCours(c.id)} style={{
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
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Créer/Modifier */}
      {showModal && (
        <>
          <div onClick={closeModal} style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(0,0,0,0.5)",
          }} />

          <div className="modal-content" style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%", maxWidth: 600,
            maxHeight: "90vh", overflowY: "auto",
            background: "white", borderRadius: 20,
            boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
            zIndex: 1000, padding: 32,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "#1C1A17" }}>
                {editingCours ? "Modifier le cours" : "Nouveau cours"}
              </h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} color="#9a9590" />
              </button>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                  Titre du cours <span style={{ color: "#C0392B" }}>*</span>
                </label>
                <input
                  value={form.titre}
                  onChange={e => setForm({ ...form, titre: e.target.value })}
                  style={{
                    width: "100%", padding: "11px 14px",
                    border: "2px solid #e2ddd6", borderRadius: 12,
                    fontSize: 14, outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  style={{
                    width: "100%", padding: "11px 14px",
                    border: "2px solid #e2ddd6", borderRadius: 12,
                    fontSize: 14, outline: "none", fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                    Filière <span style={{ color: "#C0392B" }}>*</span>
                  </label>
                  <select
                    value={form.filiere}
                    onChange={e => setForm({ ...form, filiere: e.target.value })}
                    style={{
                      width: "100%", padding: "11px 14px",
                      border: "2px solid #e2ddd6", borderRadius: 12,
                      fontSize: 14, outline: "none", background: "white",
                    }}
                  >
                    <option value="">Sélectionner...</option>
                    {filieres.map(fil => <option key={fil} value={fil.toLowerCase()}>{fil}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                    Niveau
                  </label>
                  <select
                    value={form.niveau}
                    onChange={e => setForm({ ...form, niveau: e.target.value })}
                    style={{
                      width: "100%", padding: "11px 14px",
                      border: "2px solid #e2ddd6", borderRadius: 12,
                      fontSize: 14, outline: "none", background: "white",
                    }}
                  >
                    <option value="débutant">Débutant</option>
                    <option value="intermédiaire">Intermédiaire</option>
                    <option value="avancé">Avancé</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                    Durée (minutes)
                  </label>
                  <input
                    type="number"
                    value={form.duree}
                    onChange={e => setForm({ ...form, duree: parseInt(e.target.value) || 0 })}
                    style={{
                      width: "100%", padding: "11px 14px",
                      border: "2px solid #e2ddd6", borderRadius: 12,
                      fontSize: 14, outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                    Statut
                  </label>
                  <select
                    value={form.is_active ? "publié" : "brouillon"}
                    onChange={e => setForm({ ...form, is_active: e.target.value === "publié" })}
                    style={{
                      width: "100%", padding: "11px 14px",
                      border: "2px solid #e2ddd6", borderRadius: 12,
                      fontSize: 14, outline: "none", background: "white",
                    }}
                  >
                    <option value="brouillon">Brouillon</option>
                    <option value="publié">Publié</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                  URL Image
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={form.image}
                    onChange={e => setForm({ ...form, image: e.target.value })}
                    placeholder="https://..."
                    style={{
                      flex: 1, padding: "11px 14px",
                      border: "2px solid #e2ddd6", borderRadius: 12,
                      fontSize: 14, outline: "none",
                    }}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    style={{
                      padding: "11px 14px", borderRadius: 12,
                      border: "2px solid #e2ddd6", background: "white",
                      color: "#1C1A17", cursor: isUploadingImage ? "not-allowed" : "pointer",
                      fontSize: 12, fontWeight: 600,
                      display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    {isUploadingImage ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <Upload size={14} />}
                    {isUploadingImage ? "..." : "Upload"}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "#9a9590", marginTop: 4, fontStyle: "italic" }}>
                  Entrez une URL ou uploadez une image (max 5MB)
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
              <button onClick={saveCours} disabled={isSaving} style={{
                flex: 2, padding: "12px", borderRadius: 12,
                border: "none", background: "linear-gradient(135deg, #E8A020, #f0c050)",
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
