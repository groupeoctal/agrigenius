"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import {
  Users, Search, Filter, UserCheck, UserX, Shield, Loader2,
  ChevronDown, Trash2, AlertCircle, CheckCircle, ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export default function AdminUsersPage() {
  const { user, token } = useAuth()
  const router = useRouter()

  const [users, setUsers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard")
      return
    }
    chargerUtilisateurs()
  }, [user, router, search, roleFilter])

  const chargerUtilisateurs = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (roleFilter) params.append("role", roleFilter)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setTotal(data.total)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleActive = async (userId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/toggle-active`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        setSuccess("Statut de l'utilisateur modifié")
        chargerUtilisateurs()
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (e: any) {
      setError("Erreur lors de la modification")
    }
  }

  const changeRole = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/change-role?new_role=${newRole}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        setSuccess("Rôle modifié avec succès")
        chargerUtilisateurs()
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (e: any) {
      setError("Erreur lors du changement de rôle")
    }
  }

  const deleteUser = async (userId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        setSuccess("Utilisateur supprimé")
        chargerUtilisateurs()
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (e: any) {
      setError("Erreur lors de la suppression")
    }
  }

  const roleColors: Record<string, { bg: string; color: string }> = {
    agriculteur: { bg: "#f0faf4", color: "#1A6B3C" },
    acheteur: { bg: "#fffbf0", color: "#E8A020" },
    expert: { bg: "#f5fdf5", color: "#4CAF50" },
    admin: { bg: "#fef2f2", color: "#C0392B" },
  }

  if (user?.role !== "admin") {
    return null
  }

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1300, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/dashboard/admin" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "#9a9590", textDecoration: "none", fontSize: 13,
          fontWeight: 500, marginBottom: 12,
        }}>
          <ArrowLeft size={14} /> Retour au dashboard admin
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: "linear-gradient(135deg, #3498db, #2980b9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(52,152,219,0.3)",
          }}>
            <Users size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#1C1A17" }}>
              Gestion des Utilisateurs
            </h1>
            <p style={{ fontSize: 13, color: "#9a9590" }}>
              {total} utilisateur{total > 1 ? "s" : ""} enregistré{total > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div style={{ background: "#f0faf4", border: "1px solid #4CAF50", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#1A6B3C", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle size={16} /> {success}
          </div>
        )}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#C0392B", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Filtres */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom, prénom ou email..."
              style={{
                width: "100%", padding: "11px 14px 11px 40px",
                border: "2px solid #e2ddd6", borderRadius: 12,
                fontSize: 14, outline: "none",
              }}
            />
            <Search size={16} color="#9a9590" style={{
              position: "absolute", left: 14, top: "50%",
              transform: "translateY(-50%)",
            }} />
          </div>

          <div style={{ position: "relative" }}>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              style={{
                padding: "11px 40px 11px 14px",
                border: "2px solid #e2ddd6", borderRadius: 12,
                fontSize: 14, background: "white", cursor: "pointer",
                appearance: "none", outline: "none",
              }}
            >
              <option value="">Tous les rôles</option>
              <option value="agriculteur">Agriculteur</option>
              <option value="acheteur">Acheteur</option>
              <option value="expert">Expert</option>
              <option value="admin">Admin</option>
            </select>
            <Filter size={16} color="#9a9590" style={{
              position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)", pointerEvents: "none",
            }} />
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <Loader2 size={32} color="#3498db" style={{ animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, color: "#9a9590" }}>Chargement...</p>
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2ddd6", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#F7F5F0", borderBottom: "2px solid #e2ddd6" }}>
              <tr>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9a9590", textTransform: "uppercase" }}>Utilisateur</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9a9590", textTransform: "uppercase" }}>Email</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9a9590", textTransform: "uppercase" }}>Rôle</th>
                <th style={{ padding: "14px 16px", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#9a9590", textTransform: "uppercase" }}>Statut</th>
                <th style={{ padding: "14px 16px", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#9a9590", textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#9a9590", fontSize: 13 }}>
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const roleConfig = roleColors[u.role] || roleColors.agriculteur
                  return (
                    <tr key={u.id} style={{ borderBottom: "1px solid #f0ece6" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: `linear-gradient(135deg, ${roleConfig.color}, rgba(255,255,255,0.3))`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 700, color: "white",
                          }}>
                            {u.prenom?.charAt(0)}{u.nom?.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1A17" }}>
                              {u.prenom} {u.nom}
                            </p>
                            <p style={{ fontSize: 11, color: "#9a9590" }}>{u.telephone || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#1C1A17" }}>
                        {u.email}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <select
                          value={u.role}
                          onChange={e => changeRole(u.id, e.target.value)}
                          disabled={u.role === "admin"}
                          style={{
                            padding: "4px 8px", borderRadius: 6,
                            fontSize: 11, fontWeight: 700,
                            background: roleConfig.bg,
                            color: roleConfig.color,
                            border: `1px solid ${roleConfig.color}30`,
                            cursor: u.role === "admin" ? "not-allowed" : "pointer",
                            textTransform: "capitalize",
                          }}
                        >
                          <option value="agriculteur">Agriculteur</option>
                          <option value="acheteur">Acheteur</option>
                          <option value="expert">Expert</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <button
                          onClick={() => toggleActive(u.id)}
                          disabled={u.role === "admin"}
                          style={{
                            padding: "6px 12px", borderRadius: 8,
                            border: "none", cursor: u.role === "admin" ? "not-allowed" : "pointer",
                            fontSize: 11, fontWeight: 700,
                            background: u.is_active ? "#f0faf4" : "#fef2f2",
                            color: u.is_active ? "#1A6B3C" : "#C0392B",
                            display: "inline-flex", alignItems: "center", gap: 4,
                          }}
                        >
                          {u.is_active ? <><UserCheck size={12} /> Actif</> : <><UserX size={12} /> Inactif</>}
                        </button>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        {u.role !== "admin" && (
                          <button
                            onClick={() => deleteUser(u.id)}
                            style={{
                              padding: "6px 12px", borderRadius: 8,
                              border: "1px solid #fecaca", background: "white",
                              color: "#C0392B", cursor: "pointer",
                              fontSize: 11, fontWeight: 600,
                              display: "inline-flex", alignItems: "center", gap: 4,
                            }}
                          >
                            <Trash2 size={12} /> Supprimer
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
