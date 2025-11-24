"use client"

import { useEffect } from "react"
import { useAuth } from "../context/AuthContext"

export const useEngagement = () => {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Track app open
    const trackEngagement = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/engagement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            appOpens: 1,
          }),
        })

        if (!response.ok) {
          console.error("Failed to track engagement")
        }
      } catch (error) {
        console.error("Error tracking engagement:", error)
      }
    }

    trackEngagement()
  }, [user])
}
