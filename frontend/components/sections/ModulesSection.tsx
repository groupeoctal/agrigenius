"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"
import { Microscope, Leaf, BookOpen, ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"

gsap.registerPlugin(ScrollTrigger)

const modules = [
  {
    icon: Microscope,
    number: "01",
    title: "Diagnostic Phytosanitaire",
    subtitle: "Intelligence Artificielle",
    description:
      "Photographiez votre plante malade et obtenez en quelques secondes un diagnostic précis basé sur notre modèle CNN entraîné sur des milliers de cas. Recommandations curatives adaptées au contexte camerounais.",
    features: ["Identification des maladies par image", "Recommandations de traitement", "Historique par parcelle", "Mode hors-ligne"],
    color: "#1A6B3C",
    bgColor: "#f0faf4",
    href: "/diagnostic/phyto",
    tag: "IA Embarquée",
  },
  {
    icon: Leaf,
    number: "02",
    title: "Diagnostic Pédologique",
    subtitle: "Analyse du Sol",
    description:
      "Renseignez les caractéristiques de votre sol (pH, texture, humidité) et recevez des recommandations précises sur les cultures les mieux adaptées à votre terrain et à votre région.",
    features: ["Analyse par paramètres sol", "Cultures recommandées", "Conseils d'amendement", "Carte des zones agricoles"],
    color: "#4CAF50",
    bgColor: "#f5fdf5",
    href: "/diagnostic/pedologie",
    tag: "Recommandation IA",
  },
  {
    icon: BookOpen,
    number: "03",
    title: "Espace de Formation",
    subtitle: "Centre de Ressources",
    description:
      "Accédez à des centaines de cours structurés par filière agricole. De la préparation du sol à la récolte, maîtrisez chaque étape avec des contenus adaptés au contexte du Sud Cameroun.",
    features: ["Cours par filière", "Vidéos & infographies", "Quiz de validation", "Progression & badges"],
    color: "#E8A020",
    bgColor: "#fffbf0",
    href: "/formation",
    tag: "E-Learning",
  },
  {
    icon: ShoppingBag,
    number: "04",
    title: "Marketplace Agricole",
    subtitle: "Commerce Direct",
    description:
      "Vendez vos récoltes directement aux acheteurs sans intermédiaire. Créez des annonces, gérez vos commandes et profitez d'un système de pré-récolte pour sécuriser vos revenus.",
    features: ["Annonces de récolte", "Vente en pré-récolte", "Messagerie intégrée", "Tableau de bord vendeur"],
    color: "#1A6B3C",
    bgColor: "#f0faf4",
    href: "/marketplace",
    tag: "E-Commerce",
  },
]

export default function ModulesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Titre de section
      gsap.fromTo(".modules-title",
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.8,
          scrollTrigger: { trigger: ".modules-title", start: "top 85%", toggleActions: "play none none reverse" }
        }
      )

      // Cards en cascade
      gsap.fromTo(".module-card",
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: ".modules-grid", start: "top 80%", toggleActions: "play none none reverse" }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="modules" className="section" style={{ background: "var(--background)" }}>
      <div className="container">
        {/* Header */}
        <div className="modules-title" style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(26,107,60,0.08)", border: "1px solid rgba(26,107,60,0.2)",
            borderRadius: 50, padding: "6px 16px", marginBottom: 16,
          }}>
            <span style={{ color: "var(--primary)", fontWeight: 600, fontSize: 13 }}>
              4 modules intégrés
            </span>
          </div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: 16,
            letterSpacing: "-0.5px",
          }}>
            Tout ce dont l&apos;agriculteur a besoin,{" "}
            <span className="text-gradient">en un seul endroit</span>
          </h2>
          <p style={{
            fontSize: 17, color: "var(--text-secondary)",
            maxWidth: 560, margin: "0 auto", lineHeight: 1.7,
          }}>
            AGRI-GENIUS couvre l&apos;intégralité du cycle agricole,
            du diagnostic agronomique à la commercialisation.
          </p>
        </div>

        {/* Grid */}
        <div className="modules-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(520px, 1fr))",
          gap: 24,
        }}>
          {modules.map((mod) => {
            const Icon = mod.icon
            return (
              <div key={mod.number} className="module-card card" style={{ padding: 36 }}>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  {/* Icon */}
                  <div style={{
                    width: 60, height: 60, borderRadius: 16, flexShrink: 0,
                    background: mod.bgColor, border: `2px solid ${mod.color}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={28} color={mod.color} />
                  </div>

                  <div style={{ flex: 1 }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: "1px",
                        color: mod.color, textTransform: "uppercase",
                      }}>
                        {mod.tag}
                      </span>
                      <span style={{
                        fontSize: 11, color: "var(--text-muted)",
                        background: "var(--background)", padding: "2px 10px",
                        borderRadius: 20, border: "1px solid var(--border)",
                      }}>
                        Module {mod.number}
                      </span>
                    </div>

                    <h3 style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 22, fontWeight: 700,
                      color: "var(--text-primary)", marginBottom: 4,
                    }}>
                      {mod.title}
                    </h3>
                    <p style={{ fontSize: 13, color: mod.color, fontWeight: 500, marginBottom: 12 }}>
                      {mod.subtitle}
                    </p>
                    <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 20 }}>
                      {mod.description}
                    </p>

                    {/* Features */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                      {mod.features.map((f) => (
                        <span key={f} style={{
                          fontSize: 12, fontWeight: 500,
                          background: mod.bgColor,
                          color: mod.color,
                          padding: "4px 12px", borderRadius: 20,
                          border: `1px solid ${mod.color}25`,
                        }}>
                          ✓ {f}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link href={mod.href} style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      color: mod.color, fontWeight: 600, fontSize: 14,
                      textDecoration: "none",
                      transition: "gap 0.2s",
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.gap = "10px"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.gap = "6px"}
                    >
                      Accéder au module <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
