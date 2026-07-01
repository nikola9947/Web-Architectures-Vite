import { NavLink, useNavigate } from 'react-router-dom'
import { logoutUser } from '../services/api'
import './Header.css'

export default function Header({ user, setUser }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutUser()

      setUser(null)

      // Nach dem Logout zurück zur Landing Page
      navigate('/landing')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="header">
      <div className="header-content">

        {/* Logo */}
        <NavLink to="/landing" className="header-logo">
          MoodTracker
        </NavLink>

        {/* Navigation */}
        <nav className="header-nav">
          <NavLink to="/dashboard">
            Dashboard
          </NavLink>

          <NavLink to="/journal">
            Journal
          </NavLink>

          <NavLink to="/skills">
            Skills
          </NavLink>

          <NavLink to="/calendar">
            Calendar
          </NavLink>

          <NavLink to="/statistics">
            Statistics
          </NavLink>
        </nav>

        {/* User */}
        <div className="header-user">
          {user && (
            <span className="user-name">
              {user.username || user.email}
            </span>
          )}

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

      </div>
    </header>
  )
}