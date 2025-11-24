"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Box, Container, VStack, HStack, Input, Button, Text, Heading, useToast } from "@chakra-ui/react"
import { FiMail, FiLock } from "react-icons/fi"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log({email,password})
      await login(email, password)
      navigate("/dashboard")
      toast({
        title: "Welcome back!",
        status: "success",
        duration: 2,
        isClosable: true,
      })
    } catch (error: any) {
      toast({
        title: "Login failed",
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
    >
      <Container maxW="sm" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" mb={2} color="#2d5a7b">
              MindFlow
            </Heading>
            <Text color="#666" fontSize="sm">
              Your safe space for emotional wellness
            </Text>
          </Box>

          <form onSubmit={handleLogin} style={{ width: "100%" }}>
            <VStack spacing={4}>
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
                  />
                </HStack>
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
                Sign In
              </Button>
            </VStack>
          </form>

          <Box textAlign="center">
            <Text color="#666" fontSize="sm">
              Don't have an account?{" "}
              <Link to="/signup" style={{ color: "#4a9bbe", fontWeight: "600" }}>
                Sign up
              </Link>
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}

