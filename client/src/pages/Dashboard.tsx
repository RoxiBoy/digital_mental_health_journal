"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  Box,
  Container,
  VStack,
  HStack,
  Button,
  Text,
  Heading,
  Spinner,
  useToast,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react"
import { FiPlus } from "react-icons/fi"
import type { JournalEntry, EngagementMetric } from "../types"
import Layout from "../components/Layout"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

export default function Dashboard() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [engagement, setEngagement] = useState<EngagementMetric | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const entriesResponse = await fetch(`http://localhost:5000/api/journal/${user?._id}`)
        if (entriesResponse.ok) {
          const entriesData = await entriesResponse.json()
          setEntries(Array.isArray(entriesData.entries) ? entriesData.entries : [])
        }
        console.log(entries)

        const analyticsResponse = await fetch(`http://localhost:5000/api/journal/analytics/${user?._id}`)
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json()
          setAnalytics(analyticsData)
        }

        const engagementResponse = await fetch(`http://localhost:5000/api/engagement/${user?._id}`)
        if (engagementResponse.ok) {
          const engagementData = await engagementResponse.json()
          setEngagement(engagementData.metrics)
        }
      } catch (error: any) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const getMoodEmoji = (rating: number) => {
    return ["😢", "😟", "😐", "🙂", "😊"][rating - 1] || "😐"
  }

  const moodData = entries
    .filter((e) => e.moodRating)
    .slice(-7)
    .map((e) => ({
      date: new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      mood: e.moodRating,
    })).reverse()

  const wordCountData = entries
    .filter((e) => e.wordCount)
    .slice(-7)
    .map((e) => ({
      date: new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      words: e.wordCount || 0,
    })).reverse()

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <Spinner size="lg" color="#4a9bbe" />
        </Box>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxW="6xl" py={8}>
        <VStack align="stretch" spacing={8}>
          {/* Welcome Section */}
          <Box bg="linear-gradient(135deg, #4a9bbe 0%, #3a8ba5 100%)" p={8} borderRadius="xl" color="white">
            <VStack align="start" spacing={3}>
              <Heading size="xl">Welcome back, {user?.displayName.split(" ")[0]}!</Heading>
              <Text opacity={0.9}>
                You're in the {user?.group === "adaptive" ? "adaptive feedback" : "standard journaling"} group
              </Text>
              <Button
                bg="white"
                color="#4a9bbe"
                mt={2}
                leftIcon={<FiPlus />}
                onClick={() => navigate("/journal/write")}
              >
                Write New Entry
              </Button>
            </VStack>
          </Box>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px solid #e5e7eb">
              <Text fontSize="sm" color="#999" mb={2}>
                Total Entries
              </Text>
              <Heading size="lg" color="#2d5a7b">
                {entries.length}
              </Heading>
              <Text fontSize="xs" color="#999" mt={1}>
                {engagement?.entriesWritten || 0} this period
              </Text>
            </Box>

            <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px solid #e5e7eb">
              <Text fontSize="sm" color="#999" mb={2}>
                Average Mood
              </Text>
              <Heading size="lg" color="#2d5a7b">
                {(entries.reduce((sum, e) => sum + (e.moodRating || 0), 0) / (entries.length || 1)).toFixed(1)}/5
              </Heading>
              <Text fontSize="2xl" mt={1}>
                {entries.length > 0
                  ? getMoodEmoji(
                      Math.round(entries.reduce((sum, e) => sum + (e.moodRating || 0), 0) / (entries.length || 1)),
                    )
                  : "😐"}
              </Text>
            </Box>

            <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px solid #e5e7eb">
              <Text fontSize="sm" color="#999" mb={2}>
                Total Words Written
              </Text>
              <Heading size="lg" color="#2d5a7b">
                {entries.reduce((sum, e) => sum + (e.wordCount || 0), 0).toLocaleString()}
              </Heading>
              <Text fontSize="xs" color="#999" mt={1}>
                {(entries.reduce((sum, e) => sum + (e.wordCount || 0), 0) / (entries.length || 1)).toFixed(0)} avg per
                entry
              </Text>
            </Box>
          </SimpleGrid>

          {/* Charts */}
          {(moodData.length > 0 || wordCountData.length > 0) && (
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {moodData.length > 0 && (
                <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px solid #e5e7eb">
                  <Heading size="md" mb={4} color="#2d5a7b">
                    Mood Trend (Last 7 Days)
                  </Heading>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={moodData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#999" style={{ fontSize: "12px" }} />
                      <YAxis domain={[1, 5]} stroke="#999" style={{ fontSize: "12px" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}
                        formatter={(value) => `${value}/5`}
                      />
                      <Line type="monotone" dataKey="mood" stroke="#4a9bbe" strokeWidth={2} dot={{ fill: "#4a9bbe" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}

              {wordCountData.length > 0 && (
                <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px solid #e5e7eb">
                  <Heading size="md" mb={4} color="#2d5a7b">
                    Writing Activity (Last 7 Days)
                  </Heading>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={wordCountData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#999" style={{ fontSize: "12px" }} />
                      <YAxis stroke="#999" style={{ fontSize: "12px" }} />
                      <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }} />
                      <Bar dataKey="words" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </SimpleGrid>
          )}

          {/* Recent Entries */}
          <Box>
            <HStack justify="space-between" mb={4}>
              <Heading size="md" color="#2d5a7b">
                Recent Entries
              </Heading>
              <Text fontSize="sm" color="#999">
                {entries.length} total
              </Text>
            </HStack>

            {entries.length === 0 ? (
              <Box bg="white" p={8} borderRadius="lg" textAlign="center">
                <Text color="#999" mb={4}>
                  No entries yet. Start journaling to track your mood and thoughts.
                </Text>
                <Button bg="#4a9bbe" color="white" leftIcon={<FiPlus />} onClick={() => navigate("/journal/write")}>
                  Write Your First Entry
                </Button>
              </Box>
            ) : (
              <VStack spacing={3}>
                {entries
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((entry) => (
                    <Box
                      key={entry._id}
                      bg="white"
                      p={4}
                      borderRadius="lg"
                      boxShadow="sm"
                      border="1px solid #e5e7eb"
                      cursor="pointer"
                      _hover={{ boxShadow: "md", borderColor: "#4a9bbe" }}
                      onClick={() => navigate(`/journal/${entry._id}`)}
                      transition="all 0.2s"
                    >
                      <HStack justify="space-between" align="start">
                        <VStack align="start" flex={1} spacing={2}>
                          <Text fontSize="sm" color="#999">
                            {new Date(entry.createdAt).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </Text>
                          <Text noOfLines={2} color="#333">
                            {entry.content.substring(0, 100)}...
                          </Text>
                          <HStack spacing={2}>
                            {entry.moodRating && (
                              <Badge bg="#e8f0f7" color="#2d5a7b" fontSize="xs">
                                {getMoodEmoji(entry.moodRating)} Mood: {entry.moodRating}/5
                              </Badge>
                            )}
                            {entry.wordCount && (
                              <Badge bg="#f0f4f8" color="#666" fontSize="xs">
                                {entry.wordCount} words
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
              </VStack>
            )}
          </Box>
        </VStack>
      </Container>
    </Layout>
  )
}

