import React, { useState, useEffect } from 'react'
import { getEntries, createEntry, updateEntry, deleteEntry, getMoods } from '../services/api'
import './JournalPage.css'

import journalIcon from '../assets/journal.svg'
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

const MOODS = [
  'happy',
  'sad',
  'anxious',
  'angry',
  'calm',
  'stressed',
  'excited',
  'confused',
  'lonely',
  'sluggish'
]

const MOOD_LABELS = {
  happy: 'Happy',
  sad: 'Sad',
  anxious: 'Anxious',
  angry: 'Angry',
  calm: 'Calm',
  stressed: 'Stressed',
  excited: 'Excited',
  confused: 'Confused',
  lonely: 'Lonely',
  sluggish: 'Sluggish'
}

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

export default function JournalPage() {
  const [entries, setEntries] = useState([])
  const [moods, setMoods] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [expandedEntryId, setExpandedEntryId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood_id: '',
    customMood: ''
  })
  const [loading, setLoading] = useState(true)


  const loadData = async () => {
    try {
      const [entriesResponse, moodsResponse] = await Promise.all([
        getEntries(),
        getMoods()
      ])

      setEntries(entriesResponse.data || [])
      setMoods(moodsResponse.data || [])
    } catch (error) {
      console.error('Failed to load data:', error.response?.data || error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      mood_id: '',
      customMood: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const openNewEntryForm = () => {
    if (showForm && !editingId) {
      setShowForm(false)
      return
    }

    setEditingId(null)
    setFormData({
      title: '',
      content: '',
      mood_id: '',
      customMood: ''
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Title and content are required')
      return
    }

    const selectedMoodValue =
      formData.customMood.trim() !== ''
        ? formData.customMood.trim().toLowerCase()
        : (formData.mood_id || null)

    try {
      if (editingId) {
        await updateEntry(
          editingId,
          formData.title.trim(),
          formData.content.trim(),
          selectedMoodValue
        )
      } else {
        const response = await createEntry(
          formData.title.trim(),
          formData.content.trim(),
          selectedMoodValue
        )

      }

      resetForm()
      await loadData()
    } catch (error) {
      console.error('Failed to save entry:', error.response?.data || error.message)
      alert('Failed to save entry')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Do you really want to delete this entry?')) return

    try {
      await deleteEntry(id)

      if (expandedEntryId === id) {
        setExpandedEntryId(null)
      }

      await loadData()
    } catch (error) {
      console.error('Failed to delete entry:', error.response?.data || error.message)
      alert('Failed to delete entry')
    }
  }

  const handleEdit = (entry) => {
    const knownMood = entry.mood && MOODS.includes(entry.mood)

    setFormData({
      title: entry.title,
      content: entry.content,
      mood_id: knownMood ? entry.mood : '',
      customMood: knownMood ? '' : (entry.mood || '')
    })

    setEditingId(entry.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleExpanded = (entryId) => {
    setExpandedEntryId((prev) => (prev === entryId ? null : entryId))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)

    return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })}`
  }

  const getMoodIcon = (mood) => {
    if (!mood) return null
    return MOOD_ICONS[mood.toLowerCase()] || null
  }

  const getMoodLabel = (mood) => {
    if (!mood) return ''
    return MOOD_LABELS[mood.toLowerCase()] || mood
  }

  if (loading) {
    return (
      <div className="journal-page">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="journal-page">
      <div className="journal-hero">
        <div>
          <p className="journal-kicker">Your personal space</p>

          <h1 className="journal-title">
            <img src={journalIcon} alt="Journal" className="journal-icon" />
            <span>Journal</span>
          </h1>

          <p className="journal-subtitle">
            Write down your thoughts and connect them with how you felt in that moment.
          </p>
        </div>

        <button
          data-cy="new-entry-button"
          className="new-entry-btn"
          onClick={openNewEntryForm}
        >
          {showForm && !editingId ? 'Close form' : 'New Entry'}
        </button>
      </div>

      {showForm && (
        <div className="entry-form-card">
          <div className="form-card-header">
            <h2>{editingId ? 'Edit entry' : 'Create a new entry'}</h2>
            <p>
              Add a title, choose a mood if you want, and write your thoughts.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                data-cy="entry-title-input"
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Example: Today felt lighter than expected"
                maxLength={120}
                required
              />
            </div>

            <div className="form-group">
              <label>Mood (optional)</label>

              <div className="journal-mood-grid">
                {MOODS.map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    data-cy={`mood-button-${mood}`}
                    className={`journal-mood-button ${formData.mood_id === mood ? 'selected' : ''}`}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        mood_id: formData.mood_id === mood ? '' : mood,
                        customMood: ''
                      })
                    }
                  >
                    <img
                      src={MOOD_ICONS[mood]}
                      alt={MOOD_LABELS[mood]}
                      className="journal-mood-icon"
                    />
                    <span className="journal-mood-name">{MOOD_LABELS[mood]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="customMood">Or type a custom mood (optional)</label>
              <input
                data-cy="custom-mood-input"
                id="customMood"
                type="text"
                value={formData.customMood}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customMood: e.target.value,
                    mood_id: ''
                  })
                }
                placeholder="Example: overwhelmed"
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Your thoughts</label>
              <textarea
                data-cy="entry-content-input"
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="What happened today? What are you feeling? What do you want to remember?"
                rows={10}
                required
              />
            </div>

            <div className="form-actions">
              <button
                data-cy="save-entry-button"
                type="submit"
                className="save-btn"
              >
                {editingId ? 'Save changes' : 'Save entry'}
              </button>

              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="entries-section">
        <div className="entries-section-header">
          <h2>Your entries</h2>
          <span className="entries-count">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <div className="entries-list">
          {entries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <img src={journalIcon} alt="Journal" className="empty-icon-img" />
              </div>
              <h3>No journal entries yet</h3>
              <p>Start with your first entry whenever you want — no mood entry required.</p>
            </div>
          ) : (
            entries.map((entry) => {
              const isExpanded = expandedEntryId === entry.id
              const previewText =
                entry.content.length > 220
                  ? `${entry.content.substring(0, 220)}...`
                  : entry.content

              const moodIcon = getMoodIcon(entry.mood)
              const moodLabel = getMoodLabel(entry.mood)

              return (
                <article
                  key={entry.id}
                  className="entry-card"
                  data-cy="journal-entry-card"
                >
                  <div className="entry-header">
                    <div className="entry-header-main">
                      <h3>{entry.title}</h3>
                      <p className="entry-date">{formatDate(entry.created_at)}</p>
                    </div>

                    <div className="entry-actions">
                      <button
                        type="button"
                        className="icon-btn edit-btn"
                        onClick={() => handleEdit(entry)}
                        title="Edit entry"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="icon-btn delete-btn"
                        onClick={() => handleDelete(entry.id)}
                        title="Delete entry"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {entry.mood && (
                    <div className="entry-mood-pill">
                      {moodIcon && (
                        <img
                          src={moodIcon}
                          alt={entry.mood}
                          className="entry-mood-icon"
                        />
                      )}
                      <span className="entry-mood-text">{moodLabel}</span>
                    </div>
                  )}

                  <p className="entry-content">
                    {isExpanded ? entry.content : previewText}
                  </p>

                  {entry.content.length > 220 && (
                    <button
                      type="button"
                      className="read-more-btn"
                      onClick={() => toggleExpanded(entry.id)}
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </article>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}