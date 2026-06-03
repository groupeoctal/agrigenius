"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"
import { ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

gsap.registerPlugin(ScrollTrigger)

const benefits = [
  "Accès gratuit à l'inscription",
  "Diagnostic IA disponible immédiatement",
  "Pas de frais cachés",
  "Support en français",
]

export default function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".cta-content",
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.9,
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" }
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} style={{ background: "var(--background)", padding: "80px 0" }}>
      <div className="container">
        <div className="cta-content" style={{
          background: "linear-gradient(135deg, #1A6B3C 0%, #2d8a52 100%)",
          borderRadius: 28, padding: "64px 48px",
          textAlign: "center",
          position: "relative", overflow: "hidden",
        }}>
          {/* Decoration */}
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 200, height: 200, borderRadius: "50%",
            background: "rgba(232,160,32,0.15)",
          }} />
          <div style={{
            position: "absolute", bottom: -40, left: -40,
            width: 150, height: 150, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 46px)",
              fontWeight: 800, color: "white",
              marginBottom: 16, letterSpacing: "-0.5px",
            }}>
              Prêt à transformer votre exploitation ?
            </h2>
            <p style={{
              fontSize: 17, color: "rgba(255,255,255,0.8)",
              marginBottom: 36, maxWidth: 520, margin: "0 auto 36px",
            }}>
              Rejoignez les agriculteurs camerounais qui utilisent déjà AGRI-GENIUS pour
              optimiser leur production et augmenter leurs revenus.
            </p>

            {/* Benefits */}
            <div style={{
              display: "flex", justifyContent: "center", gap: 32,
              flexWrap: "wrap", marginBottom: 40,
            }}>
              {benefits.map((b) => (
                <div key={b} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle size={18} color="#E8A020" />
                  <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: 500 }}>{b}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/auth/register" className="btn-accent" style={{
                textDecoration: "none", fontSize: 16, padding: "14px 36px",
              }}>
                Créer mon compte gratuit <ArrowRight size={18} />
              </Link>
              <Link href="#modules" style={{
                textDecoration: "none", fontSize: 16, padding: "14px 36px",
                border: "2px solid rgba(255,255,255,0.4)", borderRadius: 12,
                color: "white", fontWeight: 600, display: "inline-flex",
                alignItems: "center", gap: 8,
                transition: "all 0.3s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "transparent"
                }}
              >
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
