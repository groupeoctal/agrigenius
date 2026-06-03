"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Menu, X, ChevronDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const navLinks = [
  { label: "Accueil", href: "/" },
  {
    label: "Modules",
    href: "#modules",
    children: [
      { label: "🌿 Diagnostic Phytosanitaire", href: "/diagnostic/phyto" },
      { label: "🌍 Diagnostic Pédologique", href: "/diagnostic/pedologie" },
      { label: "📚 Formation", href: "/formation" },
      { label: "🛒 Marketplace", href: "/marketplace" },
    ],
  },
  { label: "À propos", href: "/about" },
  { label: "Contact", href: "/contact" },
]

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    // Animation d'entrée navbar
    const ctx = gsap.context(() => {
      gsap.fromTo(
        logoRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power3.out", delay: 0.2 }
      )
      gsap.fromTo(
        ".nav-link",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.1, delay: 0.4 }
      )
      gsap.fromTo(
        ".nav-cta",
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)", delay: 0.8 }
      )
    }, navRef)

    // Scroll effect
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)

    return () => {
      ctx.revert()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <nav
      ref={navRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: "all 0.4s ease",
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(26,107,60,0.1)" : "none",
        padding: scrolled ? "12px 0" : "20px 0",
        boxShadow: scrolled ? "0 4px 24px rgba(26,107,60,0.08)" : "none",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <Link href="/">
          <div ref={logoRef} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <div style={{
              width: 50, height: 50, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(26,107,60,0.2)"
            }}>
              <Image
                src="/logo.png"
                alt="AgriGenius Logo"
                width={50}
                height={50}
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--primary)",
              letterSpacing: "-0.5px"
            }}>
              Agri<span style={{ color: "var(--accent)" }}>Genius</span>
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div ref={linksRef} style={{ display: "flex", alignItems: "center", gap: 8 }} className="desktop-nav">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label} style={{ position: "relative" }}>
                <button
                  className="nav-link"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "8px 16px", borderRadius: 10, border: "none",
                    background: "transparent", cursor: "pointer",
                    color: scrolled ? "var(--text-primary)" : "white",
                    fontWeight: 500, fontSize: 15,
                    transition: "all 0.2s",
                  }}
                >
                  {link.label}
                  <ChevronDown size={16} style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)", transition: "0.3s" }} />
                </button>
                {dropdownOpen && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0,
                    background: "white", borderRadius: 16, padding: 8,
                    boxShadow: "0 20px 60px rgba(26,107,60,0.15)",
                    border: "1px solid var(--border)",
                    minWidth: 260, marginTop: 8,
                  }}>
                    {link.children.map((child) => (
                      <Link key={child.href} href={child.href}
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: "block", padding: "10px 16px",
                          borderRadius: 10, color: "var(--text-primary)",
                          textDecoration: "none", fontSize: 14, fontWeight: 500,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = "#f0faf4"
                          ;(e.currentTarget as HTMLElement).style.color = "var(--primary)"
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = "transparent"
                          ;(e.currentTarget as HTMLElement).style.color = "var(--text-primary)"
                        }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link key={link.href} href={link.href}
                className="nav-link"
                style={{
                  padding: "8px 16px", borderRadius: 10,
                  color: scrolled ? "var(--text-primary)" : "white",
                  textDecoration: "none", fontWeight: 500, fontSize: 15,
                  transition: "all 0.2s",
                }}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }} className="desktop-nav">
          <Link href="/auth/login"
            style={{
              padding: "9px 20px", borderRadius: 10,
              color: scrolled ? "var(--primary)" : "white",
              textDecoration: "none", fontWeight: 600, fontSize: 14,
              border: scrolled ? "2px solid var(--primary)" : "2px solid rgba(255,255,255,0.6)",
              transition: "all 0.3s",
            }}
            className="nav-cta"
          >
            Connexion
          </Link>
          <Link href="/auth/register"
            className="nav-cta btn-accent"
            style={{ textDecoration: "none", padding: "9px 20px", fontSize: 14 }}
          >
            S&apos;inscrire
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: scrolled ? "var(--primary)" : "white", display: "none",
          }}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: "white", padding: "20px 24px",
          borderTop: "1px solid var(--border)",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href || "#"}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: "12px 16px", borderRadius: 10,
                color: "var(--text-primary)", textDecoration: "none",
                fontWeight: 500, fontSize: 16,
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/auth/login" style={{
              padding: "12px 16px", borderRadius: 10,
              border: "2px solid var(--primary)", color: "var(--primary)",
              textDecoration: "none", fontWeight: 600, textAlign: "center",
            }}>Connexion</Link>
            <Link href="/auth/register" className="btn-accent" style={{
              textDecoration: "none", textAlign: "center",
            }}>S&apos;inscrire</Link>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
