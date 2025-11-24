"use client"

import type React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Box, Spinner } from "@chakra-ui/react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Spinner size="lg" color="#4a9bbe" />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
