"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import {
  Bell, X, Check, Trash2, Microscope, BookOpen,
  ShoppingBag, AlertTriangle, Info, Package, Clock
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

interface Notification {
  id: number
  type: string
  titre: string
  message: string
  lien: string | null
  lu: boolean
  created_at: string
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  diagnostic: { icon: Microscope, color: "#1A6B3C", bg: "#f0faf4" },
  formation: { icon: BookOpen, color: "#E8A020", bg: "#fffbf0" },
  marketplace: { icon: ShoppingBag, color: "#4CAF50", bg: "#f5fdf5" },
  commande: { icon: Package, color: "#E8A020", bg: "#fffbf0" },
  alerte: { icon: AlertTriangle, color: "#C0392B", bg: "#fef2f2" },
  systeme: { icon: Info, color: "#5a5650", bg: "#F7F5F0" },
}

export default function NotificationsPopup({ isOpen, onClose }: {
  isOpen: boolean
  onClose: () => void
}) {
  const { token } = useAuth()
  const popupRef = useRef<HTMLDivElement>(null)

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"toutes" | "non-lues">("toutes")

  useEffect(() => {
    if (isOpen) {
      chargerNotifications()
      gsap.fromTo(popupRef.current,
        { opacity: 0, scale: 0.95, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.5)" }
      )
    }
  }, [isOpen])

  const chargerNotifications = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }

  const marquerCommeLue = async (notifId: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${notifId}/lire`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(notifs => notifs.map(n =>
        n.id === notifId ? { ...n, lu: true } : n
      ))
    } catch (e) { console.error(e) }
  }

  const toutMarquerCommeLu = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/tout-lire`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(notifs => notifs.map(n => ({ ...n, lu: true })))
    } catch (e) { console.error(e) }
  }

  const supprimerNotification = async (notifId: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${notifId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      gsap.to(`#notif-${notifId}`, {
        opacity: 0, height: 0, marginBottom: 0, duration: 0.3,
        onComplete: () => setNotifications(notifs => notifs.filter(n => n.id !== notifId))
      })
    } catch (e) { console.error(e) }
  }

  const notifsFiltrees = filter === "non-lues"
    ? notifications.filter(n => !n.lu)
    : notifications

  const nbNonLues = notifications.filter(n => !n.lu).length

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,0.3)",
        }}
      />

      {/* Popup */}
      <div ref={popupRef} style={{
        position: "fixed",
        top: 80, right: 20,
        width: 420,
        maxHeight: "calc(100vh - 120px)",
        background: "white",
        borderRadius: 16,
        boxShadow: "0 24px 48px rgba(0,0,0,0.25)",
        border: "1px solid #e2ddd6",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2ddd6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Bell size={18} color="#1A6B3C" />
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1C1A17" }}>
                Notifications
              </h3>
              {nbNonLues > 0 && (
                <span style={{
                  background: "#C0392B", color: "white",
                  fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 10
                }}>
                  {nbNonLues}
                </span>
              )}
            </div>
            <button onClick={onClose} style={{
              background: "none", border: "none", cursor: "pointer", padding: 4
            }}>
              <X size={18} color="#9a9590" />
            </button>
          </div>

          {/* Filtres */}
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { key: "toutes", label: `Toutes (${notifications.length})` },
              { key: "non-lues", label: `Non lues (${nbNonLues})` },
            ].map(tab => (
              <button key={tab.key} onClick={() => setFilter(tab.key as any)} style={{
                padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                background: filter === tab.key ? "#1A6B3C" : "#F7F5F0",
                color: filter === tab.key ? "white" : "#9a9590",
                fontWeight: filter === tab.key ? 600 : 500, fontSize: 11,
                transition: "all 0.2s",
              }}>
                {tab.label}
              </button>
            ))}
            {nbNonLues > 0 && (
              <button onClick={toutMarquerCommeLu} style={{
                marginLeft: "auto", padding: "6px 12px", borderRadius: 8,
                border: "1px solid #4CAF50", background: "white",
                color: "#4CAF50", fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}>
                <Check size={12} style={{ display: "inline", marginRight: 3 }} />
                Tout lire
              </button>
            )}
          </div>
        </div>

        {/* Liste */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {isLoading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9a9590" }}>
              Chargement...
            </div>
          ) : notifsFiltrees.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <Bell size={40} color="#e2ddd6" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: 13, color: "#9a9590" }}>
                {filter === "non-lues" ? "Aucune notification non lue" : "Aucune notification"}
              </p>
            </div>
          ) : (
            notifsFiltrees.map(notif => {
              const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.systeme
              const Icon = config.icon
              return (
                <div key={notif.id} id={`notif-${notif.id}`} style={{
                  padding: "14px 24px 14px 20px",
                  borderBottom: "1px solid #f0ece6",
                  background: notif.lu ? "white" : "#fafaf8",
                  display: "flex", gap: 12, alignItems: "flex-start",
                  position: "relative",
                  transition: "background 0.2s",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F7F5F0"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = notif.lu ? "white" : "#fafaf8"}
                >
                  {!notif.lu && (
                    <div style={{
                      position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                      width: 6, height: 6, borderRadius: "50%", background: "#1A6B3C"
                    }} />
                  )}

                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: config.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={16} color={config.color} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#1C1A17", marginBottom: 3, lineHeight: 1.4 }}>
                      {notif.titre}
                    </p>
                    <p style={{ fontSize: 11, color: "#5a5650", lineHeight: 1.5, marginBottom: 6 }}>
                      {notif.message}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Clock size={9} color="#9a9590" />
                        <span style={{ fontSize: 10, color: "#9a9590" }}>
                          {new Date(notif.created_at).toLocaleString("fr-FR", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                          })}
                        </span>
                      </div>
                      {notif.lien && (
                        <Link href={notif.lien} onClick={onClose} style={{
                          fontSize: 10, color: "#1A6B3C", fontWeight: 600, textDecoration: "none"
                        }}>
                          Voir →
                        </Link>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    {!notif.lu && (
                      <button onClick={() => marquerCommeLue(notif.id)} title="Marquer comme lue" style={{
                        background: "none", border: "none", cursor: "pointer", padding: 4,
                        opacity: 0.5,
                      }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0.5"}
                      >
                        <Check size={14} color="#4CAF50" />
                      </button>
                    )}
                    <button onClick={() => supprimerNotification(notif.id)} title="Supprimer" style={{
                      background: "none", border: "none", cursor: "pointer", padding: 4,
                      opacity: 0.5,
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0.5"}
                    >
                      <Trash2 size={14} color="#C0392B" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
