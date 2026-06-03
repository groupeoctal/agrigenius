"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import {
  User, Mail, Phone, MapPin, Lock, Save, AlertCircle,
  CheckCircle, Loader2, Eye, EyeOff, Camera, Shield
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function SettingsPage() {
  const { user, token, refreshUser } = useAuth()
  const pageRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  // Formulaire profil
  const [profile, setProfile] = useState({
    nom: user?.nom || "",
    prenom: user?.prenom || "",
    telephone: user?.telephone || "",
    region: user?.region || "",
  })

  // Formulaire mot de passe
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".settings-header", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6 })
      gsap.fromTo(".settings-content", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.2 })
    }, pageRef)
    return () => ctx.revert()
  }, [])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      })
      if (!res.ok) throw new Error("Erreur lors de la mise à jour")
      setSuccess("Profil mis à jour avec succès !")
      setIsEditing(false)
      gsap.fromTo(".success-msg", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 })
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      setError("Les mots de passe ne correspondent pas")
      return
    }
    if (passwords.new.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }
    setIsSaving(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/password`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: passwords.current,
          new_password: passwords.new,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Erreur lors du changement de mot de passe")
      }

      setSuccess("Mot de passe modifié avec succès !")
      setPasswords({ current: "", new: "", confirm: "" })
      gsap.fromTo(".success-msg", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 })
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.message)
      gsap.fromTo(".error-msg", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log("📸 Fichier sélectionné:", file.name, file.type, file.size)

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image valide")
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5MB")
      return
    }

    setIsUploadingPhoto(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      console.log("📤 Envoi de la photo vers:", `${process.env.NEXT_PUBLIC_API_URL}/users/me/photo`)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/photo`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      })

      console.log("📥 Réponse du serveur:", res.status, res.statusText)

      if (!res.ok) {
        const errorData = await res.json()
        console.error("❌ Erreur serveur:", errorData)
        throw new Error(errorData.detail || "Erreur lors de l'upload de la photo")
      }

      const data = await res.json()
      console.log("✅ Upload réussi:", data)

      setSuccess("Photo de profil mise à jour avec succès !")
      gsap.fromTo(".success-msg", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 })

      // Rafraîchir les données utilisateur
      console.log("🔄 Rafraîchissement des données utilisateur...")
      await refreshUser()
      console.log("✅ Données utilisateur rafraîchies")

      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      console.error("❌ Erreur lors de l'upload:", err)
      setError(err.message)
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const REGIONS = ["Adamaoua","Centre","Est","Extrême-Nord","Littoral","Nord","Nord-Ouest","Ouest","Sud","Sud-Ouest"]

  const roleColors: Record<string, { bg: string; color: string }> = {
    agriculteur: { bg: "#f0faf4", color: "#1A6B3C" },
    acheteur: { bg: "#fffbf0", color: "#E8A020" },
    expert: { bg: "#f5fdf5", color: "#4CAF50" },
    admin: { bg: "#fef2f2", color: "#C0392B" },
  }

  const roleConfig = roleColors[user?.role || "agriculteur"]

  return (
    <div ref={pageRef} style={{ padding: "32px 36px", maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div className="settings-header" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #1A6B3C, #4CAF50)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(26,107,60,0.3)" }}>
            <User size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#1C1A17" }}>Paramètres</h1>
            <p style={{ fontSize: 13, color: "#9a9590" }}>Gérez votre profil et vos préférences</p>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="success-msg" style={{ background: "#f0faf4", border: "1px solid #4CAF50", borderRadius: 12, padding: "12px 16px", marginBottom: 20, color: "#1A6B3C", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle size={16} /> {success}
          </div>
        )}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", marginBottom: 20, color: "#C0392B", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#F7F5F0", borderRadius: 12, padding: 4, marginBottom: 24, width: "fit-content" }}>
        {[
          { key: "profile", label: "Mon Profil", icon: User },
          { key: "security", label: "Sécurité", icon: Shield },
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
              padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer",
              background: activeTab === tab.key ? "white" : "transparent",
              color: activeTab === tab.key ? "#1A6B3C" : "#9a9590",
              fontWeight: activeTab === tab.key ? 700 : 500, fontSize: 13,
              boxShadow: activeTab === tab.key ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8,
            }}>
              <Icon size={14} /> {tab.label}
            </button>
          )
        })}
      </div>

      <div className="settings-content">
        {activeTab === "profile" ? (
          /* ─── PROFIL ─── */
          <div style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #e2ddd6" }}>

            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid #e2ddd6" }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 16,
                  background: user?.avatar
                    ? `url(${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${user.avatar}) center/cover`
                    : `linear-gradient(135deg, ${roleConfig.color}, rgba(255,255,255,0.3))`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, fontWeight: 800, color: "white",
                  overflow: "hidden",
                }}>
                  {!user?.avatar && (
                    <>{user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}</>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: "none" }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  style={{
                    position: "absolute", bottom: -4, right: -4,
                    width: 32, height: 32, borderRadius: 8,
                    background: isUploadingPhoto ? "#9a9590" : "#1A6B3C",
                    border: "3px solid white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: isUploadingPhoto ? "not-allowed" : "pointer",
                  }}
                >
                  {isUploadingPhoto ? (
                    <Loader2 size={14} color="white" style={{ animation: "spin 0.8s linear infinite" }} />
                  ) : (
                    <Camera size={14} color="white" />
                  )}
                </button>
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1C1A17", marginBottom: 4 }}>
                  {user?.prenom} {user?.nom}
                </h3>
                <p style={{ fontSize: 13, color: "#9a9590", marginBottom: 6 }}>{user?.email}</p>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                  background: roleConfig.bg, color: roleConfig.color, textTransform: "capitalize"
                }}>
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Formulaire */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                  Prénom
                </label>
                <input
                  value={profile.prenom}
                  onChange={e => setProfile({ ...profile, prenom: e.target.value })}
                  disabled={!isEditing}
                  style={{
                    width: "100%", padding: "11px 14px", border: "2px solid #e2ddd6",
                    borderRadius: 12, fontSize: 14, outline: "none",
                    background: isEditing ? "white" : "#F7F5F0",
                    color: isEditing ? "#1C1A17" : "#9a9590",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                  Nom
                </label>
                <input
                  value={profile.nom}
                  onChange={e => setProfile({ ...profile, nom: e.target.value })}
                  disabled={!isEditing}
                  style={{
                    width: "100%", padding: "11px 14px", border: "2px solid #e2ddd6",
                    borderRadius: 12, fontSize: 14, outline: "none",
                    background: isEditing ? "white" : "#F7F5F0",
                    color: isEditing ? "#1C1A17" : "#9a9590",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                  <Phone size={13} style={{ display: "inline", marginRight: 4 }} />
                  Téléphone
                </label>
                <input
                  value={profile.telephone}
                  onChange={e => setProfile({ ...profile, telephone: e.target.value })}
                  disabled={!isEditing}
                  style={{
                    width: "100%", padding: "11px 14px", border: "2px solid #e2ddd6",
                    borderRadius: 12, fontSize: 14, outline: "none",
                    background: isEditing ? "white" : "#F7F5F0",
                    color: isEditing ? "#1C1A17" : "#9a9590",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                  <MapPin size={13} style={{ display: "inline", marginRight: 4 }} />
                  Région
                </label>
                <select
                  value={profile.region}
                  onChange={e => setProfile({ ...profile, region: e.target.value })}
                  disabled={!isEditing}
                  style={{
                    width: "100%", padding: "11px 14px", border: "2px solid #e2ddd6",
                    borderRadius: 12, fontSize: 14, outline: "none",
                    background: isEditing ? "white" : "#F7F5F0",
                    color: isEditing ? "#1C1A17" : "#9a9590",
                    cursor: isEditing ? "pointer" : "not-allowed",
                  }}
                >
                  <option value="">Sélectionner...</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                <Mail size={13} style={{ display: "inline", marginRight: 4 }} />
                Email
              </label>
              <input
                value={user?.email}
                disabled
                style={{
                  width: "100%", padding: "11px 14px", border: "2px solid #e2ddd6",
                  borderRadius: 12, fontSize: 14, outline: "none",
                  background: "#F7F5F0", color: "#9a9590", cursor: "not-allowed"
                }}
              />
              <p style={{ fontSize: 11, color: "#9a9590", marginTop: 4, fontStyle: "italic" }}>
                L&apos;email ne peut pas être modifié
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12 }}>
              {isEditing ? (
                <>
                  <button onClick={() => setIsEditing(false)} style={{
                    flex: 1, padding: "12px", background: "white", border: "2px solid #e2ddd6",
                    borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#5a5650"
                  }}>
                    Annuler
                  </button>
                  <button onClick={handleSaveProfile} disabled={isSaving} style={{
                    flex: 2, padding: "12px", background: "linear-gradient(135deg, #1A6B3C, #2d8a52)",
                    border: "none", borderRadius: 12, cursor: isSaving ? "not-allowed" : "pointer",
                    fontSize: 13, fontWeight: 700, color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: "0 4px 16px rgba(26,107,60,0.3)",
                  }}>
                    {isSaving ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Enregistrement...</> : <><Save size={14} /> Enregistrer les modifications</>}
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} style={{
                  width: "100%", padding: "12px", background: "linear-gradient(135deg, #1A6B3C, #2d8a52)",
                  border: "none", borderRadius: 12, cursor: "pointer",
                  fontSize: 13, fontWeight: 700, color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 16px rgba(26,107,60,0.3)",
                }}>
                  Modifier mon profil
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ─── SÉCURITÉ ─── */
          <div style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #e2ddd6" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1C1A17", marginBottom: 20 }}>
              <Lock size={16} style={{ display: "inline", marginRight: 6 }} />
              Changer le mot de passe
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                Mot de passe actuel
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwords.current}
                  onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                  style={{
                    width: "100%", padding: "11px 40px 11px 14px", border: "2px solid #e2ddd6",
                    borderRadius: 12, fontSize: 14, outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", padding: 4
                  }}
                >
                  {showPasswords.current ? <EyeOff size={16} color="#9a9590" /> : <Eye size={16} color="#9a9590" />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                Nouveau mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwords.new}
                  onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                  style={{
                    width: "100%", padding: "11px 40px 11px 14px", border: "2px solid #e2ddd6",
                    borderRadius: 12, fontSize: 14, outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", padding: 4
                  }}
                >
                  {showPasswords.new ? <EyeOff size={16} color="#9a9590" /> : <Eye size={16} color="#9a9590" />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                Confirmer le mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                  style={{
                    width: "100%", padding: "11px 40px 11px 14px", border: "2px solid #e2ddd6",
                    borderRadius: 12, fontSize: 14, outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", padding: 4
                  }}
                >
                  {showPasswords.confirm ? <EyeOff size={16} color="#9a9590" /> : <Eye size={16} color="#9a9590" />}
                </button>
              </div>
            </div>

            <button onClick={handleChangePassword} disabled={isSaving || !passwords.current || !passwords.new || !passwords.confirm} style={{
              width: "100%", padding: "12px", background: "linear-gradient(135deg, #1A6B3C, #2d8a52)",
              border: "none", borderRadius: 12, cursor: "pointer",
              fontSize: 13, fontWeight: 700, color: "white",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 16px rgba(26,107,60,0.3)",
              opacity: (!passwords.current || !passwords.new || !passwords.confirm) ? 0.5 : 1,
            }}>
              {isSaving ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Modification...</> : <><Lock size={14} /> Changer le mot de passe</>}
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
