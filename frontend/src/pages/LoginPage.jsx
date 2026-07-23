import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, getCurrentUser } from '../services/api'
import { socket } from '../services/socket'
import './AuthPage.css'

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    try {
      await loginUser(email, password)

      // Session prüfen
      const userRes = await getCurrentUser()

      // Socket erst verbinden, nachdem der Login erfolgreich war
      if (!socket.connected) {
        socket.connect()
      }

      onLogin(userRes.data.user)

      navigate('/')
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Login fehlgeschlagen.'
      )
    }
  }

  return (
    <div className="auth-page">
      <form
        className="auth-card"
        onSubmit={handleSubmit}
      >
        <h1>Login</h1>

        <p className="auth-subtitle">
          Welcome back to your Mood Tracker
        </p>

        {error && (
          <p
            data-cy="error-message"
            className="auth-error"
          >
            {error}
          </p>
        )}

        <input
          data-cy="email-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          data-cy="password-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          data-cy="login-button"
          type="submit"
        >
          Login
        </button>

        <p className="auth-switch">
          Noch keinen Account?{' '}
          <Link to="/register">
            Registrieren
          </Link>
        </p>
      </form>
    </div>
  )
}