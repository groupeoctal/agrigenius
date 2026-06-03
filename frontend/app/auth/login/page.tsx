"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Leaf, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const cardRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard")
  }, [isAuthenticated, router])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 60, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
      )
      gsap.fromTo(".form-field",
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, delay: 0.4, ease: "power2.out" }
      )
    })
    return () => ctx.revert()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Animation bouton
    gsap.to(".submit-btn", { scale: 0.97, duration: 0.1 })

    const result = await login(email, password)

    if (result.success) {
      gsap.to(cardRef.current, {
        scale: 1.02, opacity: 0, duration: 0.4,
        onComplete: () => router.push("/dashboard"),
      })
    } else {
      setError(result.error || "Erreur de connexion")
      gsap.to(".submit-btn", { scale: 1, duration: 0.2 })
      gsap.fromTo(".error-msg",
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3 }
      )
    }
    setIsLoading(false)
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
      <div style={{
        position: "absolute", top: -100, right: -100,
        width: 400, height: 400, borderRadius: "50%",
        background: "rgba(232,160,32,0.08)",
      }} />
      <div style={{
        position: "absolute", bottom: -80, left: -80,
        width: 300, height: 300, borderRadius: "50%",
        background: "rgba(255,255,255,0.04)",
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
            Bon retour !
          </h1>
          <p style={{ fontSize: 14, color: "#9a9590" }}>
            Connectez-vous à votre espace agricole
          </p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="error-msg" style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 10, padding: "12px 16px",
            marginBottom: 20, color: "#C0392B",
            fontSize: 13, fontWeight: 500,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Formulaire */}
        <form ref={formRef} onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-field" style={{ marginBottom: 20 }}>
            <label style={{
              display: "block", fontSize: 13, fontWeight: 600,
              color: "#1C1A17", marginBottom: 8,
            }}>
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.cm"
              required
              style={{
                width: "100%", padding: "12px 16px",
                border: "2px solid #e2ddd6", borderRadius: 12,
                fontSize: 15, outline: "none",
                transition: "border-color 0.2s",
                fontFamily: "var(--font-sans)",
              }}
              onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
              onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
            />
          </div>

          {/* Mot de passe */}
          <div className="form-field" style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#1C1A17" }}>
                Mot de passe
              </label>
              <Link href="/auth/forgot-password" style={{
                fontSize: 12, color: "#1A6B3C", textDecoration: "none", fontWeight: 500,
              }}>
                Mot de passe oublié ?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
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
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={isLoading}
            className="submit-btn"
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
              <><Loader2 size={18} className="animate-spin" /> Connexion...</>
            ) : (
              <>Se connecter <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        {/* Séparateur */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          margin: "24px 0",
        }}>
          <div style={{ flex: 1, height: 1, background: "#e2ddd6" }} />
          <span style={{ fontSize: 12, color: "#9a9590" }}>ou</span>
          <div style={{ flex: 1, height: 1, background: "#e2ddd6" }} />
        </div>

        {/* Lien inscription */}
        <p style={{ textAlign: "center", fontSize: 14, color: "#5a5650" }}>
          Pas encore de compte ?{" "}
          <Link href="/auth/register" style={{
            color: "#1A6B3C", fontWeight: 700, textDecoration: "none",
          }}>
            S&apos;inscrire gratuitement
          </Link>
        </p>

        {/* Aide test */}
        <div style={{
          marginTop: 20, padding: "12px 16px",
          background: "#f0faf4", borderRadius: 10,
          border: "1px solid rgba(26,107,60,0.15)",
        }}>
          <p style={{ fontSize: 11, color: "#1A6B3C", fontWeight: 600, marginBottom: 4 }}>
            🧪 Compte de test
          </p>
          <p style={{ fontSize: 11, color: "#5a5650" }}>
            Email : test@agrigenius.cm · Mot de passe : password
          </p>
        </div>
      </div>
    </div>
  )
}
