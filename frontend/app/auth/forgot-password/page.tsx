"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Leaf, ArrowRight, Loader2, CheckCircle, ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resetLink, setResetLink] = useState("")

  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 60, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
      )
    })
    return () => ctx.revert()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        if (data.reset_link) {
          setResetLink(data.reset_link)
        }
        gsap.fromTo(".success-msg",
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" }
        )
      } else {
        setError(data.detail || "Une erreur est survenue")
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
            Mot de passe oublié ?
          </h1>
          <p style={{ fontSize: 14, color: "#9a9590" }}>
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {!success ? (
          <>
            {/* Message d'erreur */}
            {error && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 10, padding: "12px 16px",
                marginBottom: 20, color: "#C0392B",
                fontSize: 13, fontWeight: 500,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  display: "block", fontSize: 13, fontWeight: 600,
                  color: "#1C1A17", marginBottom: 8,
                }}>
                  Adresse email
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="vous@exemple.cm"
                    required
                    style={{
                      width: "100%", padding: "12px 16px 12px 44px",
                      border: "2px solid #e2ddd6", borderRadius: 12,
                      fontSize: 15, outline: "none",
                      transition: "border-color 0.2s",
                      fontFamily: "var(--font-sans)",
                    }}
                    onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
                    onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
                  />
                  <Mail size={18} color="#9a9590" style={{
                    position: "absolute", left: 14, top: "50%",
                    transform: "translateY(-50%)",
                  }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%", padding: "14px",
                  background: isLoading ? "#a0c4b0" : "linear-gradient(135deg, #1A6B3C, #2d8a52)",
                  color: "white", border: "none", borderRadius: 12,
                  fontSize: 16, fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.3s", boxShadow: "0 4px 16px rgba(26,107,60,0.3)",
                }}
              >
                {isLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> Envoi en cours...</>
                ) : (
                  <>Envoyer le lien <ArrowRight size={18} /></>
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
              Email envoyé !
            </h2>
            <p style={{
              fontSize: 14, color: "#5a5650", lineHeight: 1.6,
              textAlign: "center", marginBottom: 20,
            }}>
              Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques instants.
            </p>

            {/* En mode dev, afficher le lien direct */}
            {resetLink && (
              <div style={{
                background: "#fffbf0", border: "1px solid rgba(232,160,32,0.3)",
                borderRadius: 12, padding: "14px 16px", marginBottom: 20,
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#E8A020", marginBottom: 6 }}>
                  🧪 MODE DÉVELOPPEMENT
                </p>
                <p style={{ fontSize: 12, color: "#5a5650", marginBottom: 10 }}>
                  Lien de réinitialisation :
                </p>
                <button
                  onClick={() => router.push(resetLink)}
                  style={{
                    width: "100%", padding: "10px",
                    background: "#E8A020", color: "white",
                    border: "none", borderRadius: 8,
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Cliquez ici pour réinitialiser
                </button>
              </div>
            )}

            <button
              onClick={() => router.push("/auth/login")}
              style={{
                width: "100%", padding: "12px",
                background: "white", border: "2px solid #1A6B3C",
                color: "#1A6B3C", borderRadius: 12,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              Retour à la connexion
            </button>
          </div>
        )}

        {/* Retour */}
        {!success && (
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <Link href="/auth/login" style={{
              color: "#1A6B3C", fontSize: 14, fontWeight: 600,
              textDecoration: "none", display: "inline-flex",
              alignItems: "center", gap: 6,
            }}>
              <ArrowLeft size={14} /> Retour à la connexion
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
