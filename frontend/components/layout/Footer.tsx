import { Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer style={{
      background: "#1C1A17",
      color: "white",
      padding: "60px 0 24px",
    }}>
      <div className="container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1.5fr",
          gap: 48, marginBottom: 48,
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
                background: "white",
              }}>
                <Image
                  src="/logo.png"
                  alt="AgriGenius Logo"
                  width={36}
                  height={36}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <span style={{
                fontFamily: "var(--font-display)", fontSize: 20,
                fontWeight: 700, color: "white",
              }}>
                Agri<span style={{ color: "#E8A020" }}>Genius</span>
              </span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>
              La plateforme intelligente de digitalisation agricole au Cameroun.
              De la graine à la vente.
            </p>
          </div>

          {/* Modules */}
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: 16, color: "rgba(255,255,255,0.9)" }}>Modules</h4>
            {[
              { label: "Diagnostic Phyto", href: "/diagnostic/phyto" },
              { label: "Diagnostic Sol", href: "/diagnostic/pedologie" },
              { label: "Formation", href: "/formation" },
              { label: "Marketplace", href: "/marketplace" },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{
                display: "block", color: "rgba(255,255,255,0.5)",
                textDecoration: "none", fontSize: 14,
                marginBottom: 8, transition: "color 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#E8A020"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Liens */}
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: 16, color: "rgba(255,255,255,0.9)" }}>Liens</h4>
            {[
              { label: "À propos", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "Connexion", href: "/auth/login" },
              { label: "S'inscrire", href: "/auth/register" },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{
                display: "block", color: "rgba(255,255,255,0.5)",
                textDecoration: "none", fontSize: 14,
                marginBottom: 8, transition: "color 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#E8A020"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: 16, color: "rgba(255,255,255,0.9)" }}>Contact</h4>
            {[
              { icon: MapPin, text: "Sangmélima, Région du Sud, Cameroun" },
              { icon: Mail, text: "contact@agrigenius.cm" },
              { icon: Phone, text: "+237 6XX XXX XXX" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{
                display: "flex", gap: 10, marginBottom: 12,
                color: "rgba(255,255,255,0.5)", fontSize: 13,
              }}>
                <Icon size={15} color="#E8A020" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 24,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12,
        }}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
            © 2025–2026 AgriGenius · UIECC Sangmélima · Tous droits réservés
          </p>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
            Développé par <span style={{ color: "#E8A020" }}>Evina Marceline Nathulie Traguer</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
