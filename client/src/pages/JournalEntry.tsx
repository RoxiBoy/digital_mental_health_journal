"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  Box,
  Container,
  VStack,
  HStack,
  Button,
  Text,
  Heading,
  useToast,
  Spinner,
  Tag,
  Divider,
} from "@chakra-ui/react"
import { FiArrowLeft, FiTrash2 } from "react-icons/fi"
import type { JournalEntry as JournalEntryType, Feedback } from "../types"
import Layout from "../components/Layout"

export default function JournalEntry() {
  const { id } = useParams<{ id: string }>()
  const [entry, setEntry] = useState<JournalEntryType | null>(null)
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/journal/entry/${id}`)
        if (!response.ok) throw new Error("Failed to fetch entry")
        const data = await response.json()
        setEntry(data)

        // Fetch feedback for this entry
        const feedbackResponse = await fetch(`http://localhost:5000/api/feedback/${id}`)
        if (feedbackResponse.ok) {
          const feedbackData = await feedbackResponse.json()
          setFeedback(Array.isArray(feedbackData) ? feedbackData : [])
        }
      } catch (error: any) {
        toast({
          title: "Error loading entry",
          description: error.message,
          status: "error",
          duration: 3,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEntry()
  }, [id, toast])

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return

    setDeleting(true)
    try {
      const response = await fetch(`http://localhost:5000/api/journal/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete entry")

      toast({
        title: "Entry deleted",
        status: "success",
        duration: 2,
        isClosable: true,
      })

      navigate("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error deleting entry",
        description: error.message,
        status: "error",
        duration: 3,
        isClosable: true,
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <Spinner size="lg" color="#4a9bbe" />
        </Box>
      </Layout>
    )
  }

  if (!entry) {
    return (
      <Layout>
        <Box p={4}>
          <Text>Entry not found</Text>
        </Box>
      </Layout>
    )
  }

  const sentimentColors: Record<string, string> = {
    positive: "#10b981",
    negative: "#ef4444",
    neutral: "#6b7280",
  }

  return (
    <Layout>
      <Container maxW="2xl" py={8}>
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between" align="center">
            <Button
              leftIcon={<FiArrowLeft />}
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              _hover={{ bg: "#f0f4f8" }}
            >
              Back
            </Button>
            <Heading size="lg" color="#2d5a7b">
              Journal Entry
            </Heading>
            <Button
              leftIcon={<FiTrash2 />}
              colorScheme="red"
              variant="ghost"
              isLoading={deleting}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </HStack>

          <Box bg="white" p={6} borderRadius="xl" boxShadow="md">
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontSize="sm" color="#999">
                  {new Date(entry.createdAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
                <Text fontSize="sm" color="#999">
                  {new Date(entry.createdAt).toLocaleTimeString()}
                </Text>
              </Box>

              <HStack spacing={4} wrap="wrap">
                {entry.moodRating && (
                  <Tag size="lg" bg="#e8f0f7" color="#2d5a7b">
                    Mood: {["😢", "😟", "😐", "🙂", "😊"][entry.moodRating - 1]} ({entry.moodRating}/5)
                  </Tag>
                )}
                {entry.sentiment && (
                  <Tag size="lg" bg={sentimentColors[entry.sentiment.toLowerCase()] || "#6b7280"} color="white">
                    {entry.sentiment}
                  </Tag>
                )}
                {entry.emotion && (
                  <Tag size="lg" bg="#f3e8ff" color="#6d28d9">
                    {entry.emotion}
                  </Tag>
                )}
              </HStack>

              <Divider />

              <Box bg="#fafafa" p={4} borderRadius="lg" lineHeight="1.8">
                <Text whiteSpace="pre-wrap" color="#333">
                  {entry.content}
                </Text>
              </Box>

              <HStack justify="space-between" fontSize="sm" color="#999">
                <Text>{entry.wordCount || 0} words</Text>
                {entry.typingSpeed && <Text>Typing speed: {entry.typingSpeed} wpm</Text>}
              </HStack>

              {feedback.length > 0 && (
                <>
                  <Divider />
                  <VStack align="stretch" spacing={3}>
                    <Heading size="md" color="#2d5a7b">
                      Adaptive Feedback
                    </Heading>
                    {feedback.map((fb) => (
                      <Box key={fb._id} bg="#f0fdf4" p={4} borderRadius="lg" borderLeft="4px solid #10b981">
                        <VStack align="start" spacing={2}>
                          {fb.feedbackType && (
                            <Tag size="sm" bg="#10b981" color="white">
                              {fb.feedbackType}
                            </Tag>
                          )}
                          <Text color="#333">{fb.feedbackText}</Text>
                          <Text fontSize="xs" color="#999">
                            {new Date(fb.createdAt).toLocaleDateString()}
                          </Text>
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </>
              )}
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Layout>
  )
}

