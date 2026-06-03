"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"
import {
  ShoppingBag, Plus, Search, Filter, MapPin, Scale,
  ArrowLeft, Tag, Clock, ChevronDown, Star, Package, ShoppingCart
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"

gsap.registerPlugin(ScrollTrigger)

const REGIONS = ["Toutes","Adamaoua","Centre","Est","Extrême-Nord","Littoral","Nord","Nord-Ouest","Ouest","Sud","Sud-Ouest"]
const CULTURES_FILTER = ["Tous","Cacao","Café","Banane plantain","Manioc","Maïs","Tomate","Arachide","Soja","Ananas","Palmier à huile"]

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  recolte:     { label: "Récolte disponible", color: "#1A6B3C", bg: "#f0faf4" },
  pre_recolte: { label: "Pré-récolte",        color: "#E8A020", bg: "#fffbf0" },
}

export default function MarketplacePage() {
  const { token } = useAuth()
  const pageRef = useRef<HTMLDivElement>(null)

  const [annonces, setAnnonces] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [region, setRegion] = useState("Toutes")
  const [culture, setCulture] = useState("Tous")
  const [typeVente, setTypeVente] = useState("tous")
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".page-header", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6 })
    }, pageRef)
    chargerAnnonces()
    chargerStats()
    return () => ctx.revert()
  }, [])

  const chargerAnnonces = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (culture !== "Tous") params.append("culture", culture)
      if (region !== "Toutes") params.append("region", region)
      if (typeVente !== "tous") params.append("type_vente", typeVente)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/annonces?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAnnonces(data)
        setTimeout(() => {
          gsap.fromTo(".annonce-card",
            { opacity: 0, y: 30, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }
          )
        }, 100)
      }
    } catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }

  const chargerStats = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) setStats(await res.json())
    } catch { }
  }

  useEffect(() => { chargerAnnonces() }, [culture, region, typeVente])

  const annoncesFiltrees = annonces.filter(a =>
    !search || a.titre.toLowerCase().includes(search.toLowerCase()) ||
    a.culture.toLowerCase().includes(search.toLowerCase())
  )

  const formatPrix = (prix: number) =>
    new Intl.NumberFormat("fr-FR").format(prix) + " FCFA"

  return (
    <div ref={pageRef} style={{ padding: "32px 36px", maxWidth: 1200, margin: "0 auto" }}>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 28 }}>
        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#9a9590", textDecoration: "none", fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
          <ArrowLeft size={14} /> Tableau de bord
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: "linear-gradient(135deg, #1A6B3C, #4CAF50)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(26,107,60,0.3)",
            }}>
              <ShoppingBag size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#1C1A17" }}>Marketplace Agricole</h1>
              <p style={{ fontSize: 13, color: "#9a9590" }}>Achetez et vendez directement entre producteurs et acheteurs</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/dashboard/marketplace/mes-commandes" style={{
              display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
              borderRadius: 12, border: "2px solid #E8A020", background: "white",
              color: "#E8A020", textDecoration: "none", fontSize: 13, fontWeight: 700,
            }}>
              <ShoppingCart size={16} /> Mes commandes
            </Link>
            <Link href="/dashboard/marketplace/mes-annonces" style={{
              display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
              borderRadius: 12, border: "2px solid #1A6B3C", background: "white",
              color: "#1A6B3C", textDecoration: "none", fontSize: 13, fontWeight: 700,
            }}>
              <Package size={16} /> Mes annonces
            </Link>
            <Link href="/dashboard/marketplace/vendre" style={{
              display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
              borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #1A6B3C, #4CAF50)",
              color: "white", textDecoration: "none", fontSize: 13, fontWeight: 700,
              boxShadow: "0 4px 16px rgba(26,107,60,0.3)",
            }}>
              <Plus size={16} /> Vendre ma récolte
            </Link>
          </div>
        </div>

        {/* Stats vendeur */}
        {stats && (
          <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
            {[
              { label: "Mes annonces actives", value: stats.nb_annonces_actives, color: "#1A6B3C" },
              { label: "Commandes reçues", value: stats.nb_commandes_recues, color: "#E8A020" },
              { label: "En attente", value: stats.nb_commandes_en_attente, color: "#C0392B" },
              { label: "CA réalisé (FCFA)", value: new Intl.NumberFormat("fr-FR").format(stats.ca_total), color: "#4CAF50" },
            ].map(s => (
              <div key={s.label} style={{
                background: "white", borderRadius: 12, padding: "12px 20px",
                border: "1px solid #e2ddd6", display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: 11, color: "#9a9590", fontWeight: 500, maxWidth: 80 }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filtres */}
      <div style={{ background: "white", borderRadius: 16, padding: "16px 20px", border: "1px solid #e2ddd6", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>

          {/* Recherche */}
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9a9590" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              style={{
                width: "100%", padding: "9px 14px 9px 36px",
                border: "2px solid #e2ddd6", borderRadius: 10, fontSize: 13,
                outline: "none", fontFamily: "var(--font-sans)", transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
              onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
            />
          </div>

          {/* Culture */}
          <div style={{ position: "relative" }}>
            <select value={culture} onChange={e => setCulture(e.target.value)} style={{
              padding: "9px 32px 9px 12px", border: "2px solid #e2ddd6", borderRadius: 10,
              fontSize: 13, appearance: "none", outline: "none", background: "white",
              fontFamily: "var(--font-sans)", cursor: "pointer", transition: "border-color 0.2s",
            }}
              onFocus={e => (e.target.style.borderColor = "#1A6B3C")}
              onBlur={e => (e.target.style.borderColor = "#e2ddd6")}
            >
              {CULTURES_FILTER.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9a9590", pointerEvents: "none" }} />
          </div>

          {/* Région */}
          <div style={{ position: "relative" }}>
            <select value={region} onChange={e => setRegion(e.target.value)} style={{
              padding: "9px 32px 9px 12px", border: "2px solid #e2ddd6", borderRadius: 10,
              fontSize: 13, appearance: "none", outline: "none", background: "white",
              fontFamily: "var(--font-sans)", cursor: "pointer",
            }}>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9a9590", pointerEvents: "none" }} />
          </div>

          {/* Type vente */}
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { value: "tous", label: "Tous" },
              { value: "recolte", label: "🌾 Disponible" },
              { value: "pre_recolte", label: "🕐 Pré-récolte" },
            ].map(t => (
              <button key={t.value} onClick={() => setTypeVente(t.value)} style={{
                padding: "8px 14px", borderRadius: 20, cursor: "pointer",
                border: `2px solid ${typeVente === t.value ? "#1A6B3C" : "#e2ddd6"}`,
                background: typeVente === t.value ? "#1A6B3C" : "white",
                color: typeVente === t.value ? "white" : "#5a5650",
                fontSize: 12, fontWeight: 600, transition: "all 0.2s",
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: 14, color: "#5a5650", fontWeight: 500 }}>
          {annoncesFiltrees.length} produit{annoncesFiltrees.length > 1 ? "s" : ""} disponible{annoncesFiltrees.length > 1 ? "s" : ""}
        </p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #e2ddd6", borderTopColor: "#1A6B3C", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : annoncesFiltrees.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 20, border: "1px solid #e2ddd6" }}>
          <ShoppingBag size={48} color="#e2ddd6" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#1C1A17", marginBottom: 8 }}>Aucun produit trouvé</h3>
          <p style={{ fontSize: 13, color: "#9a9590", marginBottom: 20 }}>Soyez le premier à vendre votre récolte !</p>
          <Link href="/dashboard/marketplace/vendre" style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px",
            background: "linear-gradient(135deg, #1A6B3C, #4CAF50)", borderRadius: 12,
            color: "white", textDecoration: "none", fontWeight: 700, fontSize: 14,
          }}>
            <Plus size={16} /> Publier une annonce
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {annoncesFiltrees.map(a => {
            const typeConfig = TYPE_LABELS[a.type_vente] || TYPE_LABELS.recolte
            return (
              <Link key={a.id} href={`/dashboard/marketplace/${a.id}`} style={{ textDecoration: "none" }}>
                <div className="annonce-card" style={{
                  background: "white", borderRadius: 20, overflow: "hidden",
                  border: "1px solid #e2ddd6", transition: "all 0.3s", cursor: "pointer",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(-5px)"
                    el.style.boxShadow = "0 16px 40px rgba(26,107,60,0.12)"
                    el.style.borderColor = "#1A6B3C40"
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = "translateY(0)"
                    el.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)"
                    el.style.borderColor = "#e2ddd6"
                  }}
                >
                  {/* Image */}
                  <div style={{ height: 160, background: "#f0faf4", position: "relative", overflow: "hidden" }}>
                    {a.image ? (
                      <Image src={`http://127.0.0.1:9000${a.image}`} alt={a.titre} fill style={{ objectFit: "cover" }} />
                    ) : (
                      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <span style={{ fontSize: 40 }}>
                          {a.culture === "Cacao" ? "🍫" : a.culture === "Tomate" ? "🍅" : a.culture === "Maïs" ? "🌽" : a.culture === "Manioc" ? "🌿" : a.culture === "Banane plantain" ? "🍌" : "🌾"}
                        </span>
                        <span style={{ fontSize: 11, color: "#9a9590" }}>{a.culture}</span>
                      </div>
                    )}
                    {/* Badge type */}
                    <div style={{
                      position: "absolute", top: 10, left: 10,
                      background: typeConfig.bg, color: typeConfig.color,
                      fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      border: `1px solid ${typeConfig.color}30`,
                    }}>
                      {typeConfig.label}
                    </div>
                    {a.nb_commandes > 0 && (
                      <div style={{
                        position: "absolute", top: 10, right: 10,
                        background: "rgba(0,0,0,0.6)", color: "white",
                        fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                      }}>
                        {a.nb_commandes} offre{a.nb_commandes > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "16px 18px" }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "#1C1A17", marginBottom: 6, lineHeight: 1.3 }}>
                      {a.titre}
                    </h3>

                    <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: "#9a9590", display: "flex", alignItems: "center", gap: 4 }}>
                        <Scale size={12} /> {a.quantite} {a.unite}
                      </span>
                      {a.region && (
                        <span style={{ fontSize: 12, color: "#9a9590", display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={12} /> {a.region}
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: "#9a9590", display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={12} /> {new Date(a.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "#1A6B3C" }}>
                          {new Intl.NumberFormat("fr-FR").format(a.prix)}
                        </span>
                        <span style={{ fontSize: 11, color: "#9a9590", marginLeft: 3 }}>FCFA/{a.unite}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#9a9590", fontWeight: 600 }}>
                        {a.vendeur?.prenom} {a.vendeur?.nom?.charAt(0)}.
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
