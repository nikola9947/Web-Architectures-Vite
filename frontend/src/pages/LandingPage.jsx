import { Link } from 'react-router-dom'
import './LandingPage.css'

import happyIcon from '../assets/happy.svg'
import calmIcon from '../assets/calm.svg'
import anxiousIcon from '../assets/anxious.svg'
import stressedIcon from '../assets/stressed.svg'
import confusedIcon from '../assets/confused.svg'

const previewMoods = [
  { icon: happyIcon, label: 'Happy' },
  { icon: calmIcon, label: 'Calm' },
  { icon: anxiousIcon, label: 'Anxious' },
  { icon: stressedIcon, label: 'Stressed' }
]

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-hero">
        <nav className="landing-nav">
          <Link to="/" className="landing-logo">
            MoodTracker
          </Link>

          <div className="landing-nav-actions">
            <Link to="/login" className="landing-login-link">
              Login
            </Link>

            <Link to="/register" className="landing-nav-button">
              Start for free
            </Link>
          </div>
        </nav>

        <section className="landing-hero-content">
          <div className="landing-copy">
            <p className="landing-eyebrow">Your personal mood companion</p>

            <h1>Understand your mood before it overwhelms you.</h1>

            <p className="landing-subtitle">
              Track how you feel, reflect through journaling, and find coping
              skills that actually match your current emotional state.
            </p>

            <div className="landing-actions">
              <Link to="/register" className="landing-primary-button">
                Start tracking
              </Link>

              <Link to="/login" className="landing-secondary-button">
                I already have an account
              </Link>
            </div>
          </div>

          <div className="landing-preview" aria-label="Mood Tracker preview">
            <div className="preview-card">
              <div className="preview-card-header">
                <span>Today&apos;s check-in</span>
                <strong>5/10</strong>
              </div>

              <h2>How are you feeling?</h2>

              <div className="preview-mood-grid">
                {previewMoods.map((mood) => (
                  <div className="preview-mood" key={mood.label}>
                    <img
                      src={mood.icon}
                      alt=""
                      className="preview-mood-icon"
                      aria-hidden="true"
                    />
                    <span>{mood.label}</span>
                  </div>
                ))}
              </div>

              <div className="preview-suggestion">
                <span>Suggested coping skill</span>
                <p>Take a short breathing break and write down one trigger.</p>
              </div>
            </div>
          </div>
        </section>
      </header>

      <section className="landing-benefits">
        <article>
          <img src={calmIcon} alt="" className="benefit-icon" aria-hidden="true" />
          <h3>Recognize patterns</h3>
          <p>
            Track your emotional state over time and notice recurring moods,
            triggers, and changes.
          </p>
        </article>

        <article>
          <img
            src={confusedIcon}
            alt=""
            className="benefit-icon"
            aria-hidden="true"
          />
          <h3>Reflect clearly</h3>
          <p>
            Use journal entries to sort your thoughts and understand what
            influenced your day.
          </p>
        </article>

        <article>
          <img src={happyIcon} alt="" className="benefit-icon" aria-hidden="true" />
          <h3>Find helpful skills</h3>
          <p>
            Get coping skills that fit your mood instead of scrolling through
            generic advice.
          </p>
        </article>
      </section>
    </div>
  )
}