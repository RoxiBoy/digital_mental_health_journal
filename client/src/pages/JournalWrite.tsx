"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  Box,
  Container,
  VStack,
  HStack,
  Button,
  Textarea,
  Text,
  Heading,
  useToast,
  Flex,
  Select,
} from "@chakra-ui/react"
import { FiArrowLeft, FiSave } from "react-icons/fi"
import Layout from "../components/Layout"

export default function JournalWrite() {
  const [content, setContent] = useState("")
  const [moodRating, setMoodRating] = useState("5")
  const [loading, setLoading] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [startTime] = useState(Date.now())
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setContent(text)
    setWordCount(
      text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length,
    )
  }

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "Empty entry",
        description: "Please write something before saving",
        status: "warning",
        duration: 2,
        isClosable: true,
      })
      return
    }

    setLoading(true)

    try {
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      const typingSpeed = wordCount > 0 ? Math.round((wordCount / timeSpent) * 60) : 0

      const response = await fetch("http://localhost:5000/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id,
          content,
          moodRating: Number.parseInt(moodRating),
          wordCount,
          typingSpeed,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save journal entry")
      }

      toast({
        title: "Entry saved!",
        description: "Your journal entry has been saved successfully",
        status: "success",
        duration: 2,
        isClosable: true,
      })

      navigate("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
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
              New Journal Entry
            </Heading>
            <Box w="80px" />
          </HStack>

          <Box bg="white" p={6} borderRadius="xl" boxShadow="md">
            <VStack align="stretch" spacing={4}>
              <VStack align="start" spacing={2}>
                <Text fontWeight="600" color="#2d5a7b">
                  How are you feeling right now?
                </Text>
                <Flex justify="space-between" w="full" align="center">
                  <Select
                    value={moodRating}
                    onChange={(e) => setMoodRating(e.target.value)}
                    w="150px"
                    borderColor="#ddd"
                    _focus={{ borderColor: "#4a9bbe" }}
                  >
                    <option value="1">😢 Very sad (1)</option>
                    <option value="2">😟 Sad (2)</option>
                    <option value="3">😐 Neutral (3)</option>
                    <option value="4">🙂 Good (4)</option>
                    <option value="5">😊 Very good (5)</option>
                  </Select>
                  <Text fontSize="3xl">{["😢", "😟", "😐", "🙂", "😊"][Number.parseInt(moodRating) - 1]}</Text>
                </Flex>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="600" color="#2d5a7b">
                  Your thoughts & reflections
                </Text>
                <Textarea
                  placeholder="Write freely about your day, thoughts, and feelings..."
                  value={content}
                  onChange={handleContentChange}
                  minH="400px"
                  p={4}
                  borderColor="#ddd"
                  _focus={{ borderColor: "#4a9bbe", boxShadow: "0 0 0 3px rgba(74, 158, 190, 0.1)" }}
                  resize="vertical"
                  fontFamily="system-ui"
                />
                <Text fontSize="xs" color="#999">
                  {wordCount} words
                </Text>
              </VStack>

              <Flex gap={3}>
                <Button
                  flex={1}
                  bg="#4a9bbe"
                  color="white"
                  py={6}
                  leftIcon={<FiSave />}
                  isLoading={loading}
                  _hover={{ bg: "#3a8ba5" }}
                  onClick={handleSave}
                >
                  Save Entry
                </Button>
              </Flex>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Layout>
  )
}

