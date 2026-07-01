import { useEffect, useMemo, useState } from 'react'
import { getMoods, getEntries, getUserSkills } from '../services/api'
import './StatisticsPage.css'

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

export default function StatisticsPage() {
  const [moods, setMoods] = useState([])
  const [entries, setEntries] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [moodRes, entryRes, skillRes] = await Promise.all([
          getMoods(),
          getEntries(),
          getUserSkills()
        ])

        setMoods(moodRes.data || [])
        setEntries(entryRes.data || [])
        setSkills(skillRes.data || [])
      } catch (error) {
        console.error('Failed to load statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const stats = useMemo(() => {
    const moodCounts = moods.reduce((acc, item) => {
      acc[item.mood] = (acc[item.mood] || 0) + 1
      return acc
    }, {})

    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]

    const averageIntensity =
      moods.length > 0
        ? (
            moods.reduce((sum, item) => sum + Number(item.intensity || 0), 0) /
            moods.length
          ).toFixed(1)
        : '0.0'

    const practicedSkills = skills.reduce(
      (sum, item) => sum + Number(item.practiced_count || 0),
      0
    )

    return {
      moodCounts,
      topMood,
      averageIntensity,
      practicedSkills
    }
  }, [moods, skills])

  if (loading) {
    return (
      <div className="statistics-page">
        <div className="statistics-loading">Loading statistics...</div>
      </div>
    )
  }

  return (
    <div className="statistics-page">
      <section className="statistics-hero">
        <div>
          <p className="statistics-kicker">Your progress</p>
          <h1>Statistics</h1>
          <p>
            A clear overview of your mood history, journal activity and coping
            skill progress.
          </p>
        </div>
      </section>

      <section className="statistics-summary-grid">
        <article className="statistics-card highlight-card">
          <span>Total moods</span>
          <strong>{moods.length}</strong>
          <p>Tracked emotional check-ins</p>
        </article>

        <article className="statistics-card">
          <span>Journal entries</span>
          <strong>{entries.length}</strong>
          <p>Reflections written</p>
        </article>

        <article className="statistics-card">
          <span>Average intensity</span>
          <strong>{stats.averageIntensity}/10</strong>
          <p>Across all mood entries</p>
        </article>

        <article className="statistics-card">
          <span>Skills practiced</span>
          <strong>{stats.practicedSkills}</strong>
          <p>Total coping skill sessions</p>
        </article>
      </section>

      <section className="statistics-content-grid">
        <article className="statistics-panel">
          <div className="statistics-panel-header">
            <div>
              <p className="statistics-kicker">Mood distribution</p>
              <h2>Your most common moods</h2>
            </div>
          </div>

          {Object.keys(stats.moodCounts).length > 0 ? (
            <div className="mood-stat-list">
              {Object.entries(stats.moodCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([mood, count]) => {
                  const percentage = Math.round((count / moods.length) * 100)

                  return (
                    <div className="mood-stat-item" key={mood}>
                      <div className="mood-stat-label">
                        {MOOD_ICONS[mood] && (
                          <img src={MOOD_ICONS[mood]} alt="" aria-hidden="true" />
                        )}
                        <span>{mood}</span>
                      </div>

                      <div className="mood-stat-bar">
                        <div style={{ width: `${percentage}%` }} />
                      </div>

                      <strong>{count}</strong>
                    </div>
                  )
                })}
            </div>
          ) : (
            <div className="statistics-empty">
              No mood data yet. Track your first mood to see statistics.
            </div>
          )}
        </article>

        <article className="statistics-panel">
          <div className="statistics-panel-header">
            <div>
              <p className="statistics-kicker">Top mood</p>
              <h2>Current pattern</h2>
            </div>
          </div>

          {stats.topMood ? (
            <div className="top-mood-box">
              {MOOD_ICONS[stats.topMood[0]] && (
                <img
                  src={MOOD_ICONS[stats.topMood[0]]}
                  alt=""
                  aria-hidden="true"
                />
              )}

              <h3>{stats.topMood[0]}</h3>

              <p>
                This mood appears most often in your tracked entries with{' '}
                <strong>{stats.topMood[1]}</strong> check-ins.
              </p>
            </div>
          ) : (
            <div className="statistics-empty">
              Your most common mood will appear here.
            </div>
          )}
        </article>
      </section>

      <section className="statistics-panel full-width">
        <div className="statistics-panel-header">
          <div>
            <p className="statistics-kicker">Recent mood intensity</p>
            <h2>Last entries</h2>
          </div>
        </div>

        {moods.length > 0 ? (
          <div className="intensity-list">
            {moods.slice(0, 8).map((mood) => (
              <div className="intensity-item" key={mood.id}>
                <span>{mood.mood}</span>

                <div className="intensity-track">
                  <div style={{ width: `${Number(mood.intensity || 0) * 10}%` }} />
                </div>

                <strong>{mood.intensity}/10</strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="statistics-empty">
            No recent intensity data available.
          </div>
        )}
      </section>
    </div>
  )
}