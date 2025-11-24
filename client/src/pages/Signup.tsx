"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  Box,
  Container,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Heading,
  useToast,
  RadioGroup,
  Stack,
  Radio,
  Checkbox,
} from "@chakra-ui/react"
import { FiMail, FiLock, FiUser } from "react-icons/fi"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [group, setGroup] = useState<"adaptive" | "control">("adaptive")
  const [consentGiven, setConsentGiven] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!consentGiven) {
      toast({
        title: "Consent required",
        description: "Please agree to data collection to continue",
        status: "warning",
        duration: 3,
        isClosable: true,
      })
      return
    }

    setLoading(true)

    try {
      await signup(email, password, displayName, group)
      navigate("/dashboard")
      toast({
        title: "Welcome to MindFlow!",
        description: "Your account has been created successfully",
        status: "success",
        duration: 2,
        isClosable: true,
      })
    } catch (error: any) {
      toast({
        title: "Signup failed",
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
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #f0f4f8 0%, #e8f0f7 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={8}
    >
      <Container maxW="sm">
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" mb={2} color="#2d5a7b">
              Welcome to MindFlow
            </Heading>
            <Text color="#666" fontSize="sm">
              Create your account to begin your wellness journey
            </Text>
          </Box>

          <form onSubmit={handleSignup} style={{ width: "100%" }}>
            <VStack spacing={4}>
              <Box w="full">
                <HStack spacing={3} bg="white" px={4} py={3} borderRadius="lg" boxShadow="sm">
                  <FiUser color="#2d5a7b" />
                  <Input
                    placeholder="Full name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    border="none"
                    _focus={{ outline: "none" }}
                    required
                  />
                </HStack>
              </Box>

              <Box w="full">
                <HStack spacing={3} bg="white" px={4} py={3} borderRadius="lg" boxShadow="sm">
                  <FiMail color="#2d5a7b" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    border="none"
                    _focus={{ outline: "none" }}
                    required
                  />
                </HStack>
              </Box>

              <Box w="full">
                <HStack spacing={3} bg="white" px={4} py={3} borderRadius="lg" boxShadow="sm">
                  <FiLock color="#2d5a7b" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    border="none"
                    _focus={{ outline: "none" }}
                    required
                  />
                </HStack>
              </Box>

              <Box w="full" bg="white" p={4} borderRadius="lg" boxShadow="sm">
                <Text fontSize="sm" fontWeight="600" mb={3} color="#2d5a7b">
                  Study Group
                </Text>
                <RadioGroup value={group} onChange={(val) => setGroup(val as "adaptive" | "control")}>
                  <Stack spacing={2}>
                    <Radio value="adaptive" colorScheme="blue">
                      <Text fontSize="sm">Adaptive Feedback (AI-enhanced)</Text>
                    </Radio>
                    <Radio value="control" colorScheme="blue">
                      <Text fontSize="sm">Standard Journaling</Text>
                    </Radio>
                  </Stack>
                </RadioGroup>
              </Box>

              <Box w="full">
                <Checkbox
                  isChecked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  colorScheme="blue"
                >
                  <Text fontSize="xs" color="#666">
                    I agree to data collection for research purposes and understand my data will be securely stored and
                    analyzed
                  </Text>
                </Checkbox>
              </Box>

              <Button
                type="submit"
                w="full"
                bg="#4a9bbe"
                color="white"
                py={6}
                borderRadius="lg"
                isLoading={loading}
                _hover={{ bg: "#3a8ba5" }}
              >
                Create Account
              </Button>
            </VStack>
          </form>

          <Box textAlign="center">
            <Text color="#666" fontSize="sm">
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#4a9bbe", fontWeight: "600" }}>
                Sign in
              </Link>
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}

