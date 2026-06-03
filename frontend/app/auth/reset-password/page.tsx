"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Leaf, Eye, EyeOff, ArrowRight, Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) {
      setError("Token de réinitialisation manquant ou invalide")
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 60, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
      )
    })
    return () => ctx.revert()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Vérifications côté client
    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (!token) {
      setError("Token invalide")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          new_password: newPassword,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        gsap.fromTo(".success-msg",
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" }
        )
        // Rediriger vers login après 3 secondes
        setTimeout(() => router.push("/auth/login"), 3000)
      } else {
        setError(data.detail || "Une erreur est survenue")
        gsap.fromTo(".error-msg",
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.3 }
        )
      }
    } catch (err) {
      setError("Erreur de connexion au serveur")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0d3d22 0%, #1A6B3C 60%, #2d8a52 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Fond décoratif */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.05,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div ref={cardRef} style={{
        background: "white", borderRadius: 24,
        padding: "48px 40px", width: "100%", maxWidth: 460,
        boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        position: "relative", zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: "linear-gradient(135deg, #1A6B3C, #4CAF50)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(26,107,60,0.35)",
            }}>
              <Leaf size={22} color="white" />
            </div>
            <span style={{
              fontFamily: "var(--font-display)", fontSize: 24,
              fontWeight: 700, color: "#1A6B3C",
            }}>
              Agri<span style={{ color: "#E8A020" }}>Genius</span>
            </span>
          </Link>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 26, fontWeight: 800,
            color: "#1C1A17", marginTop: 24, marginBottom: 6,
          }}>
            Nouveau mot de passe
          </h1>
          <p style={{ fontSize: 14, color: "#9a9590" }}>
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        {!success ? (
          <>
            {/* Message d'erreur */}
            {error && (
              <div className="error-msg" style={{
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 10, padding: "12px 16px",
                marginBottom: 20, color: "#C0392B",
                fontSize: 13, fontWeight: 500,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit}>
              {/* Nouveau mot de passe */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block", fontSize: 13, fontWeight: 600,
                  color: "#1C1A17", marginBottom: 8,
                }}>
                  Nouveau mot de passe
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: "100%", padding: "12px 48px 12px 16px",
                      border: "2px solid #e2ddd6", borderRadius: 12,
                      fontSize: 15, outline: "none",
                      transition: "border-color 0.2s",
                      fontFamily: "var(--font-sans)",
                    }}
                    onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
                    onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute", right: 14, top: "50%",
                      transform: "translateY(-50%)", background: "none",
                      border: "none", cursor: "pointer", color: "#9a9590",
                      display: "flex", alignItems: "center",
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "#9a9590", marginTop: 6 }}>
                  Au moins 6 caractères
                </p>
              </div>

              {/* Confirmer mot de passe */}
              <div style={{ marginBottom: 28 }}>
                <label style={{
                  display: "block", fontSize: 13, fontWeight: 600,
                  color: "#1C1A17", marginBottom: 8,
                }}>
                  Confirmer le mot de passe
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: "100%", padding: "12px 48px 12px 16px",
                      border: "2px solid #e2ddd6", borderRadius: 12,
                      fontSize: 15, outline: "none",
                      transition: "border-color 0.2s",
                      fontFamily: "var(--font-sans)",
                    }}
                    onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
                    onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{
                      position: "absolute", right: 14, top: "50%",
                      transform: "translateY(-50%)", background: "none",
                      border: "none", cursor: "pointer", color: "#9a9590",
                      display: "flex", alignItems: "center",
                    }}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !token}
                style={{
                  width: "100%", padding: "14px",
                  background: (isLoading || !token) ? "#a0c4b0" : "linear-gradient(135deg, #1A6B3C, #2d8a52)",
                  color: "white", border: "none", borderRadius: 12,
                  fontSize: 16, fontWeight: 700,
                  cursor: (isLoading || !token) ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.3s", boxShadow: "0 4px 16px rgba(26,107,60,0.3)",
                }}
              >
                {isLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> Réinitialisation...</>
                ) : (
                  <>Réinitialiser le mot de passe <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="success-msg">
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "#f0faf4", margin: "0 auto 24px",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "3px solid #1A6B3C",
            }}>
              <CheckCircle size={40} color="#1A6B3C" />
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: 20,
              fontWeight: 800, color: "#1C1A17", textAlign: "center",
              marginBottom: 12,
            }}>
              Mot de passe réinitialisé !
            </h2>
            <p style={{
              fontSize: 14, color: "#5a5650", lineHeight: 1.6,
              textAlign: "center", marginBottom: 20,
            }}>
              Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion...
            </p>
            <div style={{
              width: 40, height: 40, margin: "0 auto",
              border: "3px solid #e2ddd6",
              borderTop: "3px solid #1A6B3C",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }} />
          </div>
        )}

        {/* Retour */}
        {!success && (
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <Link href="/auth/login" style={{
              color: "#1A6B3C", fontSize: 14, fontWeight: 600,
              textDecoration: "none",
            }}>
              Retour à la connexion
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
