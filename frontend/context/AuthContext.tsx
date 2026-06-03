"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type UserRole = "agriculteur" | "acheteur" | "expert" | "admin"

export interface User {
  id: number
  nom: string
  prenom: string
  email: string
  role: UserRole
  region?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

export interface RegisterData {
  nom: string
  prenom: string
  email: string
  password: string
  role: UserRole
  region?: string
  telephone?: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Vérifier si un token est stocké localement
    const storedToken = localStorage.getItem("agrigenius_token")
    const storedUser = localStorage.getItem("agrigenius_user")
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api"

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const err = await res.json()
        return { success: false, error: err.detail || "Erreur de connexion" }
      }
      const data = await res.json()
      setUser(data.user)
      setToken(data.access_token)
      localStorage.setItem("agrigenius_token", data.access_token)
      localStorage.setItem("agrigenius_user", JSON.stringify(data.user))
      return { success: true }
    } catch {
      return { success: false, error: "Impossible de joindre le serveur" }
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        return { success: false, error: err.detail || "Erreur lors de l'inscription" }
      }
      const result = await res.json()
      setUser(result.user)
      setToken(result.access_token)
      localStorage.setItem("agrigenius_token", result.access_token)
      localStorage.setItem("agrigenius_user", JSON.stringify(result.user))
      return { success: true }
    } catch {
      return { success: false, error: "Impossible de joindre le serveur" }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("agrigenius_token")
    localStorage.removeItem("agrigenius_user")
  }

  const refreshUser = async () => {
    if (!token) {
      console.log("❌ Pas de token, impossible de rafraîchir")
      return
    }
    try {
      console.log("🔄 Appel API pour rafraîchir l'utilisateur:", `${API}/users/me`)
      const res = await fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log("📥 Réponse refresh user:", res.status)
      if (res.ok) {
        const userData = await res.json()
        console.log("✅ Nouvelles données utilisateur:", userData)
        setUser(userData)
        localStorage.setItem("agrigenius_user", JSON.stringify(userData))
      } else {
        console.error("❌ Erreur refresh user:", res.status, res.statusText)
      }
    } catch (e) {
      console.error("❌ Erreur lors du rafraîchissement de l'utilisateur", e)
    }
  }

  return (
    <AuthContext.Provider value={{
      user, token, isLoading,
      login, register, logout, refreshUser,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider")
  return ctx
}
