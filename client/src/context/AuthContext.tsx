"use client"

import React, { createContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "../types"
import { href } from "react-router-dom"

interface AuthContextType {
  user: User | null
  loading: boolean
  signup: (email: string, password: string, displayName: string, group: "adaptive" | "control") => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const API_BASE_URL = "http://localhost:5000/api"

  useEffect(() => {
    const storedUser = localStorage.getItem("user")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
   setLoading(false)
  }, [])

  const signup = async (email: string, password: string, displayName: string, group: "adaptive" | "control") => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName, group }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Signup failed")
      }

      const data = await response.json()
      setUser(data)
      localStorage.setItem("user", JSON.stringify(data))
    } catch (error) {
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      console.log({email, password})

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Login failed")
      }

      const data = await response.json()
      setUser(data)
      console.log(data)
      localStorage.setItem("user", JSON.stringify(data))
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
