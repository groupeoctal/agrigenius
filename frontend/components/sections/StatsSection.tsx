"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { value: 43, suffix: "%", label: "de la population active camerounaise travaille dans l'agriculture" },
  { value: 14, suffix: "%", label: "de contribution au PIB national" },
  { value: 40, suffix: "%", label: "de pertes agricoles dues aux maladies (FAO)" },
  { value: 85, suffix: "%", label: "de pénétration du mobile au Cameroun" },
]

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Compteurs animés
      gsap.utils.toArray<HTMLElement>(".stat-number").forEach((el) => {
        const target = parseInt(el.dataset.target || "0")
        const suffix = el.dataset.suffix || ""
        const counter = { val: 0 }
        gsap.to(counter, {
          val: target,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = Math.round(counter.val) + suffix
          },
        })
      })

      gsap.fromTo(".stat-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.12,
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} style={{
      background: "linear-gradient(135deg, #1A6B3C 0%, #134d2b 100%)",
      padding: "80px 0",
    }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(24px, 3.5vw, 38px)",
            fontWeight: 800, color: "white", marginBottom: 12,
          }}>
            L&apos;agriculture camerounaise en chiffres
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>
            Des réalités qui justifient l&apos;urgence d&apos;une digitalisation agricole
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 24,
        }}>
          {stats.map((stat, i) => (
            <div key={i} className="stat-card" style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 20, padding: "36px 28px",
              textAlign: "center",
              backdropFilter: "blur(8px)",
            }}>
              <div
                className="stat-number"
                data-target={stat.value}
                data-suffix={stat.suffix}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 52, fontWeight: 800,
                  color: "#E8A020", lineHeight: 1,
                  marginBottom: 12,
                }}
              >
                0{stat.suffix}
              </div>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.6 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
