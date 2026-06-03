"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { value: "43%", label: "de la population active" },
  { value: "4", label: "modules intégrés" },
  { value: "IA", label: "embarquée localement" },
  { value: "100%", label: "adapté au Cameroun" },
]

const floatingCards = [
  { src: "/photo/ag.jpg",     label: "Agriculture camerounaise" },
  { src: "/photo/ag1.jpg",    label: "Cultures & Filières" },
  { src: "/photo/ag2.jpg",    label: "Sols & Récoltes" },
  { src: "/photo/agrico.jpg", label: "Producteurs locaux" },
]

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      // Background reveal
      tl.fromTo(bgRef.current,
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2 }
      )

      // Title - word by word
      tl.fromTo(titleRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.9 },
        "-=0.6"
      )

      // Subtitle
      tl.fromTo(subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7 },
        "-=0.4"
      )

      // CTA buttons
      tl.fromTo(".hero-btn",
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15 },
        "-=0.3"
      )

      // Stats
      tl.fromTo(".stat-item",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
        "-=0.2"
      )

      // Floating cards
      tl.fromTo(".float-card",
        { opacity: 0, scale: 0.5, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.15, ease: "back.out(1.5)" },
        "-=0.5"
      )

      // Floating animation continue
      gsap.to(".float-card", {
        y: "-=12",
        duration: 2.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.4, from: "start" },
        delay: 2,
      })

      // Parallax au scroll
      gsap.to(bgRef.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={heroRef} style={{
      minHeight: "100vh",
      position: "relative",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
    }}>
      {/* Background */}
      <div ref={bgRef} style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, #0d3d22 0%, #1A6B3C 50%, #2d8a52 100%)",
        zIndex: 0,
      }}>
        {/* Pattern overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.06,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        {/* Gradient overlay bottom */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
          background: "linear-gradient(to top, rgba(247,245,240,0.15), transparent)",
        }} />
      </div>

      <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: 100, paddingBottom: 80 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 60,
          alignItems: "center",
        }}>
          {/* Left content */}
          <div>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(232,160,32,0.2)", border: "1px solid rgba(232,160,32,0.4)",
              borderRadius: 50, padding: "6px 16px", marginBottom: 24,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E8A020" }} />
              <span style={{ color: "#E8A020", fontWeight: 600, fontSize: 13, letterSpacing: "0.5px" }}>
                AgriTech · Cameroun · IA Locale
              </span>
            </div>

            <h1 ref={titleRef} style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(36px, 5vw, 58px)",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.15,
              marginBottom: 24,
              letterSpacing: "-1px",
            }}>
              L&apos;agriculture camerounaise{" "}
              <span style={{
                background: "linear-gradient(135deg, #E8A020, #f0c050)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                intelligente
              </span>{" "}
              commence ici
            </h1>

            <p ref={subtitleRef} style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.7,
              marginBottom: 36,
              maxWidth: 500,
            }}>
              AGRI-GENIUS accompagne les producteurs camerounais du diagnostic agronomique à la commercialisation,
              grâce à l&apos;intelligence artificielle et à une marketplace agricole intégrée.
            </p>

            {/* CTA */}
            <div ref={ctaRef} style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Link href="/auth/register" className="hero-btn btn-accent" style={{
                textDecoration: "none", fontSize: 16, padding: "14px 32px",
              }}>
                Commencer gratuitement <ArrowRight size={18} />
              </Link>
              <Link href="#modules" className="hero-btn btn-outline" style={{
                textDecoration: "none", fontSize: 16, padding: "14px 32px",
                borderColor: "rgba(255,255,255,0.5)", color: "white",
              }}>
                Découvrir les modules
              </Link>
            </div>

            {/* Stats */}
            <div ref={statsRef} style={{
              display: "flex", gap: 32, marginTop: 52, flexWrap: "wrap",
            }}>
              {stats.map((stat) => (
                <div key={stat.label} className="stat-item">
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 28, fontWeight: 800, color: "#E8A020",
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Image cards */}
          <div ref={cardsRef} style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            padding: "20px 0",
          }}>
            {floatingCards.map(({ src, label }, i) => (
              <div key={label} className="float-card" style={{
                borderRadius: 20,
                overflow: "hidden",
                position: "relative",
                height: i % 2 === 0 ? 220 : 180,
                cursor: "default",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                border: "2px solid rgba(255,255,255,0.15)",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"
                  ;(e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.4)"
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1)"
                  ;(e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.25)"
                }}
              >
                <Image
                  src={src}
                  alt={label}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 300px"
                />
                {/* Label overlay */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                  padding: "20px 14px 12px",
                }}>
                  <span style={{ color: "white", fontWeight: 600, fontSize: 13 }}>{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave bottom */}
      <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, zIndex: 2 }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ width: "100%", height: 80 }}>
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#F7F5F0" />
        </svg>
      </div>
    </div>
  )
}
