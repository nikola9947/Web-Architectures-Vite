import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMoods, createMood, getSkillsForMood, addUserSkill } from '../services/api'
import MoodTracker from '../components/MoodTracker'
import './Dashboard.css'

import happyIcon from '../assets/happy.svg'
import sadIcon from '../assets/sad.svg'
import anxiousIcon from '../assets/anxious.svg'
import angryIcon from '../assets/angry.svg'
import calmIcon from '../assets/calm.svg'
import stressedIcon from '../assets/stressed.svg'
import excitedIcon from '../assets/excited.svg'
import confusedIcon from '../assets/confused.svg'
import lonelyIcon from '../assets/lonely.svg'
import sluggishIcon from '../assets/sluggish.svg'
import leaveIcon from '../assets/leave.svg'

const MOOD_ICONS = {
  happy: happyIcon,
  sad: sadIcon,
  anxious: anxiousIcon,
  angry: angryIcon,
  calm: calmIcon,
  stressed: stressedIcon,
  excited: excitedIcon,
  confused: confusedIcon,
  lonely: lonelyIcon,
  sluggish: sluggishIcon
}

export default function Dashboard({ user }) {
  const [moods, setMoods] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [lastMood, setLastMood] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addingSkillId, setAddingSkillId] = useState(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const moodResponse = await getMoods()
      const moodList = moodResponse.data || []

      setMoods(moodList)

      if (moodList.length > 0) {
        const newestMood = moodList[0]
        setLastMood(newestMood)

        const skillResponse = await getSkillsForMood(newestMood.mood)
        setRecommendations(skillResponse.data || [])
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMoodSubmit = async (moodData) => {
    try {
      await createMood(moodData.mood, moodData.intensity, moodData.notes)

      const skillResponse = await getSkillsForMood(moodData.mood)
      setRecommendations(skillResponse.data || [])

      await loadDashboard()
    } catch (error) {
      console.error('Failed to create mood:', error)
    }
  }

  const handleAddSkill = async (skillId) => {
    try {
      setAddingSkillId(skillId)
      await addUserSkill(skillId)
    } catch (error) {
      console.error('Failed to add skill:', error)
    } finally {
      setAddingSkillId(null)
    }
  }

  const getMoodToneClass = (mood) => {
    const map = {
      happy: 'tone-happy',
      sad: 'tone-sad',
      anxious: 'tone-anxious',
      angry: 'tone-angry',
      calm: 'tone-calm',
      stressed: 'tone-stressed',
      excited: 'tone-excited',
      confused: 'tone-confused',
      lonely: 'tone-lonely',
      sluggish: 'tone-sluggish'
    }

    return map[mood] || 'tone-default'
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <p className="dashboard-kicker">Mood overview</p>
          <h1>Welcome back{user?.username ? `, ${user.username}` : ''}</h1>
          <p className="dashboard-subtitle">
            Track how you feel, reflect on recent entries, and build a calmer routine with helpful skills.
          </p>
        </div>

        <div className="dashboard-hero-badge">
          <span className="badge-label">Entries tracked</span>
          <span className="badge-value">{moods.length}</span>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="card dashboard-main-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Check in</p>
              <h2>Track your mood</h2>
            </div>
          </div>

          <MoodTracker onMoodSubmit={handleMoodSubmit} />
        </div>

        <div className="dashboard-side-column">
          <div className="card compact-card">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Latest mood</p>
                <h3>Your current snapshot</h3>
              </div>
            </div>

            {lastMood ? (
              <div className={`latest-mood-card ${getMoodToneClass(lastMood.mood)}`}>
                <div className="latest-mood-icon">
                  <img
                    src={MOOD_ICONS[lastMood.mood]}
                    alt={lastMood.mood}
                    className="mood-icon-large"
                  />
                </div>

                <div className="latest-mood-info">
                  <p className="latest-mood-name">{lastMood.mood}</p>
                  <p className="latest-mood-intensity">
                    Intensity <span>{lastMood.intensity}/10</span>
                  </p>
                  <p className="latest-mood-time">
                    {new Date(lastMood.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="empty-mini-state">
                <p>No mood tracked yet.</p>
              </div>
            )}
          </div>

          <div className="card compact-card">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Quick summary</p>
                <h3>Your recent activity</h3>
              </div>
            </div>

            <div className="summary-grid">
              <div className="summary-tile">
                <span className="summary-label">Total moods</span>
                <span className="summary-value">{moods.length}</span>
              </div>

              <div className="summary-tile">
                <span className="summary-label">Suggestions</span>
                <span className="summary-value">{recommendations.length}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Helpful next steps</p>
            <h2>
              {lastMood
                ? `Recommended skills for ${lastMood.mood}`
                : 'Recommended coping skills'}
            </h2>
          </div>

          <Link to="/skills" className="action-btn">
            View all skills
          </Link>
        </div>

        {recommendations.length > 0 ? (
          <div className="recommendation-list">
            {recommendations.slice(0, 4).map((skill) => (
              <div key={skill.id} className="recommendation-item">
                <div className="recommendation-text">
                  <h4>{skill.name}</h4>
                  <p>{skill.description}</p>
                </div>

                <button
                  className="action-btn"
                  onClick={() => handleAddSkill(skill.id)}
                  disabled={addingSkillId === skill.id}
                >
                  {addingSkillId === skill.id ? 'Adding...' : 'Add skill'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-mini-state">
            <p>
              Track a mood first and matching coping skills will appear here.
            </p>
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Recent history</p>
            <h2>Last mood entries</h2>
          </div>
        </div>

        {moods.length > 0 ? (
          <div className="history-list">
            {moods.slice(0, 6).map((mood) => (
              <div
                key={mood.id}
                className={`history-item ${getMoodToneClass(mood.mood)}`}
              >
                <div className="history-emoji">
                  <img
                    src={MOOD_ICONS[mood.mood]}
                    alt={mood.mood}
                    className="history-icon"
                  />
                </div>

                <div className="history-content">
                  <p className="history-name">{mood.mood}</p>
                  <p className="history-meta">Intensity: {mood.intensity}/10</p>
                </div>

                <div className="history-date">
                  {new Date(mood.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <img src={leaveIcon} alt="Leaf icon" className="empty-icon-img" />
            </div>
            <h3>No mood history yet</h3>
            <p>Your recent entries will appear here once you start tracking.</p>
          </div>
        )}
      </section>
    </div>
  )
}