"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Leaf, Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth, UserRole } from "@/context/AuthContext"

const roles: { value: UserRole; label: string; desc: string; emoji: string }[] = [
  { value: "agriculteur", label: "Agriculteur", desc: "Je produis et cultive", emoji: "🌾" },
  { value: "acheteur",    label: "Acheteur",    desc: "J'achète des produits", emoji: "🛒" },
  { value: "expert",      label: "Expert",      desc: "Je conseille les agriculteurs", emoji: "🔬" },
]

const regions = [
  "Adamaoua","Centre","Est","Extrême-Nord","Littoral",
  "Nord","Nord-Ouest","Ouest","Sud","Sud-Ouest",
]

const steps = ["Profil", "Compte", "Confirmation"]

export default function RegisterPage() {
  const router = useRouter()
  const { register, isAuthenticated } = useAuth()

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    nom: "", prenom: "", telephone: "", region: "",
    role: "" as UserRole | "",
    email: "", password: "", confirmPassword: "",
  })

  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard")
  }, [isAuthenticated, router])

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 60, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
    )
  }, [])

  const animateStep = (dir: "next" | "prev") => {
    gsap.to(".step-content", {
      opacity: 0, x: dir === "next" ? -30 : 30, duration: 0.25,
      onComplete: () => {
        setStep(s => dir === "next" ? s + 1 : s - 1)
        gsap.fromTo(".step-content",
          { opacity: 0, x: dir === "next" ? 30 : -30 },
          { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
        )
      }
    })
  }

  const nextStep = () => {
    setError("")
    if (step === 1) {
      if (!form.nom || !form.prenom || !form.role) {
        setError("Veuillez remplir tous les champs obligatoires")
        return
      }
    }
    if (step === 2) {
      if (!form.email || !form.password || !form.confirmPassword) {
        setError("Veuillez remplir tous les champs")
        return
      }
      if (form.password !== form.confirmPassword) {
        setError("Les mots de passe ne correspondent pas")
        return
      }
      if (form.password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères")
        return
      }
    }
    animateStep("next")
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError("")
    const result = await register({
      nom: form.nom, prenom: form.prenom,
      email: form.email, password: form.password,
      role: form.role as UserRole,
      region: form.region, telephone: form.telephone,
    })
    if (result.success) {
      gsap.to(cardRef.current, {
        scale: 1.02, opacity: 0, duration: 0.4,
        onComplete: () => router.push("/dashboard"),
      })
    } else {
      setError(result.error || "Erreur lors de l'inscription")
    }
    setIsLoading(false)
  }

  const update = (field: string, value: string) =>
    setForm(f => ({ ...f, [field]: value }))

  const inputStyle = {
    width: "100%", padding: "12px 16px",
    border: "2px solid #e2ddd6", borderRadius: 12,
    fontSize: 15, outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "var(--font-sans)",
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0d3d22 0%, #1A6B3C 60%, #2d8a52 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -100, right: -100,
        width: 400, height: 400, borderRadius: "50%",
        background: "rgba(232,160,32,0.08)",
      }} />

      <div ref={cardRef} style={{
        background: "white", borderRadius: 24,
        padding: "48px 40px", width: "100%", maxWidth: 520,
        boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        position: "relative", zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: "linear-gradient(135deg, #1A6B3C, #4CAF50)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(26,107,60,0.35)",
            }}>
              <Leaf size={22} color="white" />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "#1A6B3C" }}>
              Agri<span style={{ color: "#E8A020" }}>Genius</span>
            </span>
          </Link>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "#1C1A17", marginTop: 20, marginBottom: 4 }}>
            Créer mon compte
          </h1>
          <p style={{ fontSize: 13, color: "#9a9590" }}>Rejoignez la communauté agricole camerounaise</p>
        </div>

        {/* Steps indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
          {steps.map((s, i) => {
            const n = i + 1
            const active = step === n
            const done = step > n
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: done ? "#1A6B3C" : active ? "#1A6B3C" : "#e2ddd6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s",
                  }}>
                    {done
                      ? <CheckCircle size={16} color="white" />
                      : <span style={{ color: active ? "white" : "#9a9590", fontSize: 13, fontWeight: 700 }}>{n}</span>
                    }
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: active ? "#1A6B3C" : "#9a9590" }}>{s}</span>
                </div>
                {i < 2 && (
                  <div style={{
                    flex: 1, height: 2, margin: "0 8px", marginBottom: 16,
                    background: step > n ? "#1A6B3C" : "#e2ddd6",
                    transition: "background 0.3s",
                  }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Erreur */}
        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 10, padding: "12px 16px", marginBottom: 20,
            color: "#C0392B", fontSize: 13, fontWeight: 500,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Contenu steps */}
        <div className="step-content">

          {/* STEP 1 — Profil */}
          {step === 1 && (
            <div>
              {/* Rôle */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 10 }}>
                  Je suis... <span style={{ color: "#C0392B" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  {roles.map(r => (
                    <button key={r.value} type="button"
                      onClick={() => update("role", r.value)}
                      style={{
                        flex: 1, padding: "12px 8px", borderRadius: 12, cursor: "pointer",
                        border: `2px solid ${form.role === r.value ? "#1A6B3C" : "#e2ddd6"}`,
                        background: form.role === r.value ? "#f0faf4" : "white",
                        transition: "all 0.2s", textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 4 }}>{r.emoji}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: form.role === r.value ? "#1A6B3C" : "#1C1A17" }}>{r.label}</div>
                      <div style={{ fontSize: 10, color: "#9a9590", marginTop: 2 }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nom / Prénom */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                    Nom <span style={{ color: "#C0392B" }}>*</span>
                  </label>
                  <input value={form.nom} onChange={e => update("nom", e.target.value)}
                    placeholder="Evina" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
                    onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                    Prénom <span style={{ color: "#C0392B" }}>*</span>
                  </label>
                  <input value={form.prenom} onChange={e => update("prenom", e.target.value)}
                    placeholder="Nathulie" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
                    onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                  />
                </div>
              </div>

              {/* Région */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                  Région
                </label>
                <select value={form.region} onChange={e => update("region", e.target.value)}
                  style={{ ...inputStyle, background: "white", cursor: "pointer" }}
                  onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
                  onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                >
                  <option value="">Sélectionner une région</option>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Téléphone */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                  Téléphone
                </label>
                <input value={form.telephone} onChange={e => update("telephone", e.target.value)}
                  placeholder="+237 6XX XXX XXX" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
                  onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                />
              </div>
            </div>
          )}

          {/* STEP 2 — Compte */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                  Adresse email <span style={{ color: "#C0392B" }}>*</span>
                </label>
                <input type="email" value={form.email} onChange={e => update("email", e.target.value)}
                  placeholder="vous@exemple.cm" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
                  onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                  Mot de passe <span style={{ color: "#C0392B" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"}
                    value={form.password} onChange={e => update("password", e.target.value)}
                    placeholder="Minimum 6 caractères"
                    style={{ ...inputStyle, paddingRight: 48 }}
                    onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
                    onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute", right: 14, top: "50%",
                      transform: "translateY(-50%)", background: "none",
                      border: "none", cursor: "pointer", color: "#9a9590",
                    }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Force mot de passe */}
                {form.password && (
                  <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: form.password.length >= i * 3
                          ? i <= 1 ? "#C0392B" : i <= 2 ? "#E8A020" : i <= 3 ? "#4CAF50" : "#1A6B3C"
                          : "#e2ddd6",
                        transition: "background 0.3s",
                      }} />
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1A17", marginBottom: 8 }}>
                  Confirmer le mot de passe <span style={{ color: "#C0392B" }}>*</span>
                </label>
                <input type="password" value={form.confirmPassword}
                  onChange={e => update("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  style={{
                    ...inputStyle,
                    borderColor: form.confirmPassword && form.password !== form.confirmPassword ? "#C0392B" : "#e2ddd6",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
                  onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                />
              </div>
            </div>
          )}

          {/* STEP 3 — Confirmation */}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg, #1A6B3C, #4CAF50)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 8px 24px rgba(26,107,60,0.3)",
              }}>
                <CheckCircle size={36} color="white" />
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#1C1A17", marginBottom: 8 }}>
                Tout est prêt !
              </h3>
              <p style={{ fontSize: 14, color: "#5a5650", marginBottom: 24, lineHeight: 1.6 }}>
                Vérifiez vos informations avant de créer votre compte.
              </p>
              {/* Récap */}
              <div style={{ background: "#f0faf4", borderRadius: 12, padding: "16px 20px", textAlign: "left", marginBottom: 28 }}>
                {[
                  { label: "Nom complet", value: `${form.prenom} ${form.nom}` },
                  { label: "Rôle", value: roles.find(r => r.value === form.role)?.label },
                  { label: "Email", value: form.email },
                  { label: "Région", value: form.region || "Non renseignée" },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: 13, marginBottom: 8,
                  }}>
                    <span style={{ color: "#5a5650" }}>{label}</span>
                    <span style={{ fontWeight: 600, color: "#1C1A17" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: 12 }}>
          {step > 1 && (
            <button type="button" onClick={() => animateStep("prev")}
              style={{
                flex: 1, padding: "13px", background: "white",
                border: "2px solid #e2ddd6", borderRadius: 12,
                fontSize: 15, fontWeight: 600, color: "#5a5650", cursor: "pointer",
              }}>
              ← Retour
            </button>
          )}
          {step < 3 ? (
            <button type="button" onClick={nextStep}
              style={{
                flex: 2, padding: "13px",
                background: "linear-gradient(135deg, #1A6B3C, #2d8a52)",
                color: "white", border: "none", borderRadius: 12,
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 16px rgba(26,107,60,0.3)",
              }}>
              Suivant <ArrowRight size={18} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={isLoading}
              style={{
                flex: 2, padding: "13px",
                background: isLoading ? "#a0c4b0" : "linear-gradient(135deg, #E8A020, #c4871a)",
                color: "white", border: "none", borderRadius: 12,
                fontSize: 15, fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 16px rgba(232,160,32,0.3)",
              }}>
              {isLoading
                ? <><Loader2 size={18} /> Création...</>
                : <>Créer mon compte ✓</>
              }
            </button>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "#9a9590", marginTop: 20 }}>
          Déjà un compte ?{" "}
          <Link href="/auth/login" style={{ color: "#1A6B3C", fontWeight: 700, textDecoration: "none" }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
