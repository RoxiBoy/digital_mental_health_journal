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
  useToast,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SimpleGrid,
} from "@chakra-ui/react"
import { FiArrowLeft } from "react-icons/fi"
import type { MoodSurvey as MoodSurveyType } from "../types"
import Layout from "../components/Layout"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function MoodSurvey() {
  const [surveys, setSurveys] = useState<MoodSurveyType[]>([])
  const [depression, setDepression] = useState(50)
  const [anxiety, setAnxiety] = useState(50)
  const [wellBeing, setWellBeing] = useState(50)
  const [emotionalRegulation, setEmotionalRegulation] = useState(50)
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/surveys/${user?._id}`)
        if (response.ok) {
          const data = await response.json()
          setSurveys(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error("Error fetching surveys:", error)
      } finally {
        setFetchingData(false)
      }
    }

    if (user) {
      fetchSurveys()
    }
  }, [user])

  const handleSubmitSurvey = async () => {
    setLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id,
          depressionScore: depression,
          anxietyScore: anxiety,
          wellBeingScore: wellBeing,
          emotionalRegulationScore: emotionalRegulation,
          period: new Date().toISOString().split("T")[0],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit survey")
      }

      toast({
        title: "Survey submitted!",
        description: "Thank you for completing the mood survey",
        status: "success",
        duration: 2,
        isClosable: true,
      })

      // Refresh surveys list
      const fetchResponse = await fetch(`http://localhost:5000/api/surveys/${user?._id}`)
      if (fetchResponse.ok) {
        const data = await fetchResponse.json()
        setSurveys(Array.isArray(data) ? data : [])
      }

      // Reset form
      setDepression(50)
      setAnxiety(50)
      setWellBeing(50)
      setEmotionalRegulation(50)
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

  const surveyData = surveys.slice(-7).map((survey) => ({
    date: new Date(survey.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    depression: survey.depressionScore || 0,
    anxiety: survey.anxietyScore || 0,
    wellBeing: survey.wellBeingScore || 0,
    emotional: survey.emotionalRegulationScore || 0,
  }))

  const getScaleLabel = (value: number) => {
    if (value < 25) return "Very Low"
    if (value < 50) return "Low"
    if (value < 75) return "Moderate"
    return "High"
  }

  return (
    <Layout>
      <Container maxW="4xl" py={8}>
        <VStack align="stretch" spacing={8}>
          <HStack justify="space-between">
            <Button
              leftIcon={<FiArrowLeft />}
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              _hover={{ bg: "#f0f4f8" }}
            >
              Back
            </Button>
            <Heading size="lg" color="#2d5a7b">
              Mood & Wellness Survey
            </Heading>
            <Box w="80px" />
          </HStack>

          <Box bg="white" p={8} borderRadius="xl" boxShadow="md">
            <VStack align="stretch" spacing={8}>
              <VStack align="start" spacing={2}>
                <Heading size="md" color="#2d5a7b">
                  Complete Your Weekly Survey
                </Heading>
                <Text color="#666" fontSize="sm">
                  Rate your current state on each dimension (0-100)
                </Text>
              </VStack>

              {/* Depression Scale */}
              <VStack align="start" spacing={3} w="full">
                <Box>
                  <Heading size="sm" color="#2d5a7b" mb={1}>
                    Depression Level
                  </Heading>
                  <Text fontSize="sm" color="#999">
                    {getScaleLabel(depression)}
                  </Text>
                </Box>
                <Box w="full">
                  <Slider value={depression} onChange={setDepression} min={0} max={100}>
                    <SliderTrack bg="#e5e7eb">
                      <SliderFilledTrack bg="#ef4444" />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                </Box>
                <Text fontSize="xs" color="#666" fontStyle="italic">
                  0 = No symptoms | 100 = Severe symptoms
                </Text>
              </VStack>

              {/* Anxiety Scale */}
              <VStack align="start" spacing={3} w="full">
                <Box>
                  <Heading size="sm" color="#2d5a7b" mb={1}>
                    Anxiety Level
                  </Heading>
                  <Text fontSize="sm" color="#999">
                    {getScaleLabel(anxiety)}
                  </Text>
                </Box>
                <Box w="full">
                  <Slider value={anxiety} onChange={setAnxiety} min={0} max={100}>
                    <SliderTrack bg="#e5e7eb">
                      <SliderFilledTrack bg="#f59e0b" />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                </Box>
                <Text fontSize="xs" color="#666" fontStyle="italic">
                  0 = Calm | 100 = Extremely anxious
                </Text>
              </VStack>

              {/* Well-Being Scale */}
              <VStack align="start" spacing={3} w="full">
                <Box>
                  <Heading size="sm" color="#2d5a7b" mb={1}>
                    Overall Well-Being
                  </Heading>
                  <Text fontSize="sm" color="#999">
                    {getScaleLabel(wellBeing)}
                  </Text>
                </Box>
                <Box w="full">
                  <Slider value={wellBeing} onChange={setWellBeing} min={0} max={100}>
                    <SliderTrack bg="#e5e7eb">
                      <SliderFilledTrack bg="#10b981" />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                </Box>
                <Text fontSize="xs" color="#666" fontStyle="italic">
                  0 = Poor | 100 = Excellent
                </Text>
              </VStack>

              {/* Emotional Regulation Scale */}
              <VStack align="start" spacing={3} w="full">
                <Box>
                  <Heading size="sm" color="#2d5a7b" mb={1}>
                    Emotional Regulation
                  </Heading>
                  <Text fontSize="sm" color="#999">
                    {getScaleLabel(emotionalRegulation)}
                  </Text>
                </Box>
                <Box w="full">
                  <Slider value={emotionalRegulation} onChange={setEmotionalRegulation} min={0} max={100}>
                    <SliderTrack bg="#e5e7eb">
                      <SliderFilledTrack bg="#8b5cf6" />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                </Box>
                <Text fontSize="xs" color="#666" fontStyle="italic">
                  0 = Difficulty controlling emotions | 100 = Full control
                </Text>
              </VStack>

              <Button
                w="full"
                bg="#4a9bbe"
                color="white"
                py={6}
                isLoading={loading}
                _hover={{ bg: "#3a8ba5" }}
                onClick={handleSubmitSurvey}
              >
                Submit Survey
              </Button>
            </VStack>
          </Box>

          {/* Survey History Chart */}
          {surveyData.length > 0 && (
            <Box bg="white" p={8} borderRadius="xl" boxShadow="md">
              <Heading size="md" mb={6} color="#2d5a7b">
                Survey History (Last 7 Days)
              </Heading>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={surveyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#999" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#999" style={{ fontSize: "12px" }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}
                    formatter={(value) => Math.round(value as number)}
                  />
                  <Legend />
                  <Bar dataKey="depression" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="anxiety" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="wellBeing" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="emotional" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}

          {/* Previous Surveys List */}
          {surveys.length > 0 && (
            <Box>
              <Heading size="md" mb={4} color="#2d5a7b">
                Previous Surveys
              </Heading>
              <VStack spacing={3}>
                {surveys
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((survey) => (
                    <Box
                      key={survey._id}
                      bg="white"
                      p={4}
                      borderRadius="lg"
                      boxShadow="sm"
                      border="1px solid #e5e7eb"
                      w="full"
                    >
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="600" color="#2d5a7b">
                          {new Date(survey.createdAt).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                      </HStack>
                      <SimpleGrid columns={4} spacing={3} w="full">
                        <Box>
                          <Text fontSize="xs" color="#999">
                            Depression
                          </Text>
                          <Text fontWeight="600" color="#ef4444">
                            {survey.depressionScore || 0}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="#999">
                            Anxiety
                          </Text>
                          <Text fontWeight="600" color="#f59e0b">
                            {survey.anxietyScore || 0}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="#999">
                            Well-Being
                          </Text>
                          <Text fontWeight="600" color="#10b981">
                            {survey.wellBeingScore || 0}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="#999">
                            Regulation
                          </Text>
                          <Text fontWeight="600" color="#8b5cf6">
                            {survey.emotionalRegulationScore || 0}
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </Box>
                  ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Layout>
  )
}

