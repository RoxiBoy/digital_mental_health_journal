"use client"

import type React from "react"
import {
  Box,
  HStack,
  Heading,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
} from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { FiHome, FiEdit3, FiBarChart2, FiSettings, FiLogOut, FiMoon, FiSun } from "react-icons/fi"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { colorMode, toggleColorMode } = useColorMode()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <Box minH="100vh" bg={colorMode === "dark" ? "#1a1a1a" : "#f8fafb"}>
      {/* Header */}
      <Box bg="white" boxShadow="sm" borderBottom="1px solid #e5e7eb" py={4} px={6}>
        <HStack justify="space-between" maxW="7xl" mx="auto">
          <Heading size="md" color="#2d5a7b" cursor="pointer" onClick={() => navigate("/dashboard")}>
            MindFlow
          </Heading>

          <HStack spacing={6}>
            <Button
              variant="ghost"
              leftIcon={<FiHome />}
              onClick={() => navigate("/dashboard")}
              _hover={{ bg: "#f0f4f8" }}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              leftIcon={<FiEdit3 />}
              onClick={() => navigate("/journal/write")}
              _hover={{ bg: "#f0f4f8" }}
            >
              Write
            </Button>
            <Button
              variant="ghost"
              leftIcon={<FiBarChart2 />}
              onClick={() => navigate("/survey")}
              _hover={{ bg: "#f0f4f8" }}
            >
              Survey
            </Button>

            <Box w="1px" h="6" bg="#e5e7eb" />

            <Menu>
              <MenuButton as={Button} variant="ghost" rounded="full">
                <Avatar size="sm" name={user?.displayName} bg="#4a9bbe" color="white" />
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => navigate("/profile")} icon={<FiSettings />}>
                  Profile
                </MenuItem>
                <MenuItem icon={colorMode === "dark" ? <FiSun /> : <FiMoon />} onClick={toggleColorMode}>
                  {colorMode === "dark" ? "Light Mode" : "Dark Mode"}
                </MenuItem>
                <MenuItem icon={<FiLogOut />} onClick={handleLogout} color="red.500">
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </HStack>
      </Box>

      {/* Main Content */}
      <Box>{children}</Box>
    </Box>
  )
}

