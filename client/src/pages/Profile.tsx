"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Box, Container, VStack, HStack, Button, Text, Heading, Input, useToast, Avatar, Badge } from "@chakra-ui/react"
import { FiArrowLeft, FiLogOut } from "react-icons/fi"
import Layout from "../components/Layout"

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [isEditing, setIsEditing] = useState(false)

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "See you next time!",
      status: "success",
      duration: 2,
      isClosable: true,
    })
    navigate("/login")
  }

  const handleSaveProfile = () => {
    // In a real app, you'd send this to the backend
    toast({
      title: "Profile updated",
      description: "Your profile has been saved",
      status: "success",
      duration: 2,
      isClosable: true,
    })
    setIsEditing(false)
  }

  const accountCreatedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown"

  return (
    <Layout>
      <Container maxW="2xl" py={8}>
        <VStack align="stretch" spacing={8}>
          <Button
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            alignSelf="flex-start"
            onClick={() => navigate("/dashboard")}
            _hover={{ bg: "#f0f4f8" }}
          >
            Back to Dashboard
          </Button>

          {/* Profile Header */}
          <Box bg="linear-gradient(135deg, #4a9bbe 0%, #3a8ba5 100%)" p={8} borderRadius="xl" color="white">
            <VStack spacing={4} align="start">
              <HStack spacing={4} align="flex-start">
                <Avatar size="xl" name={user?.displayName} bg="#fff" color="#4a9bbe" fontSize="2xl" />
                <VStack align="start" spacing={1} flex={1}>
                  <Heading size="lg">{user?.displayName}</Heading>
                  <Text opacity={0.9} fontSize="sm">
                    {user?.email}
                  </Text>
                  <Badge colorScheme={user?.group === "adaptive" ? "green" : "blue"} mt={2}>
                    {user?.group === "adaptive" ? "Adaptive Feedback Group" : "Standard Journaling Group"}
                  </Badge>
                </VStack>
              </HStack>
            </VStack>
          </Box>

          {/* Account Information */}
          <Box bg="white" p={8} borderRadius="xl" boxShadow="md">
            <VStack align="stretch" spacing={6}>
              <Heading size="md" color="#2d5a7b">
                Account Information
              </Heading>

              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="600" color="#2d5a7b" mb={2}>
                    Email
                  </Text>
                  <Input value={user?.email} isReadOnly bg="#f0f4f8" borderColor="#ddd" />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="600" color="#2d5a7b" mb={2}>
                    Display Name
                  </Text>
                  <HStack spacing={2}>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      isReadOnly={!isEditing}
                      bg={isEditing ? "white" : "#f0f4f8"}
                      borderColor={isEditing ? "#4a9bbe" : "#ddd"}
                    />
                    {!isEditing ? (
                      <Button colorScheme="blue" variant="outline" onClick={() => setIsEditing(true)}>
                        Edit
                      </Button>
                    ) : (
                      <>
                        <Button bg="#4a9bbe" color="white" onClick={handleSaveProfile}>
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </>
                    )}
                  </HStack>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="600" color="#2d5a7b" mb={2}>
                    Research Group
                  </Text>
                  <Badge
                    colorScheme={user?.group === "adaptive" ? "green" : "blue"}
                    p={2}
                    fontSize="sm"
                    display="inline-block"
                  >
                    {user?.group === "adaptive" ? "Adaptive Feedback (AI-Enhanced)" : "Standard Journaling (Control)"}
                  </Badge>
                  <Text fontSize="xs" color="#666" mt={2}>
                    {user?.group === "adaptive"
                      ? "You are in the adaptive feedback group and will receive personalized AI-generated insights"
                      : "You are in the standard journaling group (control group)"}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="600" color="#2d5a7b" mb={2}>
                    Consent Status
                  </Text>
                  <Badge
                    colorScheme={user?.consentGiven ? "green" : "yellow"}
                    p={2}
                    fontSize="sm"
                    display="inline-block"
                  >
                    {user?.consentGiven ? "✓ Consent Given" : "Pending Consent"}
                  </Badge>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="600" color="#2d5a7b" mb={2}>
                    Account Created
                  </Text>
                  <Text color="#666">{accountCreatedDate}</Text>
                </Box>
              </VStack>
            </VStack>
          </Box>

          {/* Privacy & Data */}
          <Box bg="white" p={8} borderRadius="xl" boxShadow="md">
            <VStack align="stretch" spacing={4}>
              <Heading size="md" color="#2d5a7b">
                Privacy & Data
              </Heading>
              <Text color="#666" fontSize="sm" lineHeight={1.6}>
                Your journal entries and survey responses are encrypted and stored securely. We collect:
              </Text>
              <Box bg="#f0f4f8" p={4} borderRadius="lg">
                <VStack align="start" spacing={2} fontSize="sm" color="#333">
                  <Text>✓ Journal content and emotions</Text>
                  <Text>✓ Mood ratings and survey responses</Text>
                  <Text>✓ Writing metrics (word count, typing speed)</Text>
                  <Text>✓ Engagement patterns (app opens, session duration)</Text>
                </VStack>
              </Box>
              <Text color="#666" fontSize="sm" lineHeight={1.6}>
                All data is anonymized for research purposes and protected by institutional review. You can request data
                export or deletion at any time.
              </Text>
            </VStack>
          </Box>

          {/* Danger Zone */}
          <Box bg="white" p={8} borderRadius="xl" boxShadow="md" borderLeft="4px solid #ef4444">
            <VStack align="stretch" spacing={4}>
              <Heading size="md" color="#ef4444">
                Account Actions
              </Heading>

              <Button
                w="full"
                bg="#ef4444"
                color="white"
                leftIcon={<FiLogOut />}
                py={6}
                _hover={{ bg: "#dc2626" }}
                onClick={handleLogout}
              >
                Logout
              </Button>

              <Button w="full" variant="outline" colorScheme="red" py={6} isDisabled>
                Delete Account (Contact Support)
              </Button>
            </VStack>
          </Box>

          {/* Support Info */}
          <Box bg="#f0fdf4" p={6} borderRadius="lg" borderLeft="4px solid #10b981">
            <VStack align="start" spacing={2}>
              <Heading size="sm" color="#166534">
                Need Help?
              </Heading>
              <Text fontSize="sm" color="#4b5563">
                If you have questions about the app, your data, or need support, please contact us at{" "}
                <Text as="span" fontWeight="600">
                  support@mindflow.app
                </Text>
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Layout>
  )
}

