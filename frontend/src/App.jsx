import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import JournalPage from './pages/JournalPage'
import SkillsPage from './pages/SkillsPage'
import CalendarPage from './pages/CalendarPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Header from './components/Header'

import './App.css'

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default function App() {
  const [user, setUser] = useState(null)

  return (
    <BrowserRouter>
      <div className="app">
        {user && <Header user={user} setUser={setUser} />}

        <main className="main-content">
          <Routes>
            <Route
              path="/login"
              element={
                user ? <Navigate to="/" replace /> : <LoginPage onLogin={setUser} />
              }
            />

            <Route
              path="/register"
              element={
                user ? <Navigate to="/" replace /> : <RegisterPage onLogin={setUser} />
              }
            />

            <Route
              path="/"
              element={
                <ProtectedRoute user={user}>
                  <Dashboard user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/journal"
              element={
                <ProtectedRoute user={user}>
                  <JournalPage user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/skills"
              element={
                <ProtectedRoute user={user}>
                  <SkillsPage user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/calendar"
              element={
                <ProtectedRoute user={user}>
                  <CalendarPage user={user} />
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