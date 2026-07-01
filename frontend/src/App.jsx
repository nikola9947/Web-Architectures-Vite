import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import StatisticsPage from './pages/StatisticsPage'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import JournalPage from './pages/JournalPage'
import SkillsPage from './pages/SkillsPage'
import CalendarPage from './pages/CalendarPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Header from './components/Header'

import { getCurrentUser } from './services/api'

import './App.css'

function ProtectedRoute({ user, loading, children }) {
  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await getCurrentUser()
        setUser(response.data.user)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadCurrentUser()
  }, [])

  return (
    <BrowserRouter>
      <div className="app">
        {user && <Header user={user} setUser={setUser} />}

        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                loading ? (
                  <div className="loading">Loading...</div>
                ) : user ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LandingPage />
                )
              }
            />

            <Route
              path="/login"
              element={
                loading ? (
                  <div className="loading">Loading...</div>
                ) : user ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LoginPage onLogin={setUser} />
                )
              }
            />

            <Route
              path="/register"
              element={
                loading ? (
                  <div className="loading">Loading...</div>
                ) : user ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <RegisterPage onLogin={setUser} />
                )
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <Dashboard user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/journal"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <JournalPage user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/skills"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <SkillsPage user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/calendar"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <CalendarPage user={user} />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/landing"
              element={<LandingPage />}
            />
            
            <Route
            path="/statistics"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <StatisticsPage user={user} />
              </ProtectedRoute>
            }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}