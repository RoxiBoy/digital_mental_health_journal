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
  Icon,
} from "@chakra-ui/react"
import { FiArrowLeft, FiTrash2, FiCpu } from "react-icons/fi"
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
    const fetchEntryAndFeedback = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/journal/entry/${id}`)
        if (!response.ok) throw new Error("Failed to fetch entry")
        const entryData = await response.json()
        setEntry(entryData)

        const feedbackResponse = await fetch(`http://localhost:5000/api/feedback/${id}`)
        if (feedbackResponse.ok) {
          const feedbackData = await feedbackResponse.json()
          setFeedback(feedbackData.feedbacks || [])
        }
      } catch (error: any) {
        toast({
          title: "Connection Error",
          description: "Could not load data. Ensure your backend is running.",
          status: "error",
          duration: 3,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchEntryAndFeedback()
  }, [id, toast])

  const handleDelete = async () => {
    if (!window.confirm("Are you sure? This will remove the entry and its AI feedback.")) return
    setDeleting(true)
    try {
      const response = await fetch(`http://localhost:5000/api/journal/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete")
      toast({ title: "Deleted successfully", status: "success" })
      navigate("/dashboard")
    } catch (error: any) {
      toast({ title: "Error", description: error.message, status: "error" })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minH="400px">
          <Spinner size="xl" color="#4a9bbe" thickness="4px" />
          <Text mt={4} color="#2d5a7b" fontWeight="medium">Reading your journal...</Text>
        </Box>
      </Layout>
    )
  }

  if (!entry) return <Layout><Box p={4}><Text>Entry not found</Text></Box></Layout>

  const sentimentColors: Record<string, string> = {
    positive: "#10b981",
    negative: "#ef4444",
    neutral: "#6b7280",
  }

  return (
    <Layout>
      <Container maxW="2xl" py={8}>
        <VStack align="stretch" spacing={6}>
          {/* Header Section */}
          <HStack justify="space-between" align="center">
            <Button leftIcon={<FiArrowLeft />} variant="ghost" onClick={() => navigate("/dashboard")}>
              Back
            </Button>
            <Heading size="lg" color="#2d5a7b">Reflections</Heading>
            <Button leftIcon={<FiTrash2 />} colorScheme="red" variant="ghost" isLoading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </HStack>

          {/* Journal Content Card */}
          <Box bg="white" p={8} borderRadius="2xl" boxShadow="xl" border="1px solid" borderColor="gray.100">
            <VStack align="stretch" spacing={5}>
              <Box>
                <Text fontSize="md" fontWeight="bold" color="#2d5a7b">
                  {new Date(entry.createdAt).toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
                <Text fontSize="sm" color="gray.400">{new Date(entry.createdAt).toLocaleTimeString()}</Text>
              </Box>

              <HStack spacing={3} wrap="wrap">
                {entry.moodRating && (
                  <Tag size="lg" variant="subtle" colorScheme="blue">
                    Mood: {["😢", "😟", "😐", "🙂", "😊"][entry.moodRating - 1]}
                  </Tag>
                )}
                {entry.emotion && (
                  <Tag size="lg" colorScheme="purple" textTransform="capitalize">
                    {entry.emotion}
                  </Tag>
                )}
                {entry.sentiment && (
                  <Tag size="lg" bg={sentimentColors[entry.sentiment.toLowerCase()]} color="white">
                    {entry.sentiment}
                  </Tag>
                )}
              </HStack>

              <Divider />

              <Box py={2}>
                <Text whiteSpace="pre-wrap" fontSize="lg" color="gray.700" lineHeight="tall">
                  {entry.content}
                </Text>
              </Box>

              {/* Feedback Section */}
              {feedback.length > 0 ? (
                <Box mt={4} pt={6} borderTop="2px dashed" borderColor="gray.100">
                  <VStack align="stretch" spacing={4}>
                    <HStack color="#2d5a7b">
                      <Icon as={FiCpu} />
                      <Heading size="sm">AI Companion Insight</Heading>
                    </HStack>
                    
                    {feedback.map((fb) => (
                      <Box 
                        key={fb._id} 
                        bg="#f8fbff" 
                        p={5} 
                        borderRadius="xl" 
                        borderLeft="5px solid" 
                        borderColor="#4a9bbe"
                        boxShadow="sm"
                      >
                        <Text color="gray.800" fontSize="md" fontStyle="italic">
                          "{fb.feedbackText}"
                        </Text>
                        <Text mt={3} fontSize="xs" color="gray.400" fontWeight="bold">
                          ANALYSIS: {fb.feedbackType?.toUpperCase()}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              ) : (
                <Box mt={4} p={4} bg="gray.50" borderRadius="md" textAlign="center">
                  <Text fontSize="sm" color="gray.500">No AI insight generated for this entry.</Text>
                </Box>
              )}
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Layout>
  )
}
