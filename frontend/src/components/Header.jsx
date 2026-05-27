import { NavLink, useNavigate } from 'react-router-dom'
import { logoutUser } from '../services/api'
import './Header.css'

export default function Header({ user, setUser }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutUser()

      setUser(null)

      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="header">
      <div className="header-content">

        {/* LOGO */}
        <NavLink to="/" className="header-logo">
          MoodTracker
        </NavLink>

        {/* NAVIGATION */}
        <nav className="header-nav">
          <NavLink to="/">
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
        </nav>

        {/* USER */}
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