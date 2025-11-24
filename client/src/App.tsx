import { ChakraProvider } from "@chakra-ui/react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import JournalWrite from "./pages/JournalWrite"
import JournalEntry from "./pages/JournalEntry"
import MoodSurvey from "./pages/MoodSurvey"
import Profile from "./pages/Profile"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <ChakraProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journal/write"
              element={
                <ProtectedRoute>
                  <JournalWrite />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journal/:id"
              element={
                <ProtectedRoute>
                  <JournalEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/survey"
              element={
                <ProtectedRoute>
                  <MoodSurvey />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  )
}

export default App

