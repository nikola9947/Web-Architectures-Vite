import express from 'express'
import { dbRun, dbGet, dbAll } from '../utils/database.js'
import { sendEventToClients } from '../utils/events.js'
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router()
router.use(authenticateToken);
function resolveMoodValue(body) {
  const rawMood =
    body?.customMood?.trim() ||
    body?.mood?.trim() ||
    (typeof body?.mood_id === 'string' ? body.mood_id.trim() : '')

  return rawMood || null
}

// Get all journal entries
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id // Temporary: no auth

    const entries = await dbAll(
      `
      SELECT
        je.id,
        je.user_id,
        je.title,
        je.content,
        je.mood_text AS mood,
        je.created_at,
        je.updated_at
      FROM journal_entries je
      WHERE je.user_id = ?
      ORDER BY je.created_at DESC
      `,
      [userId]
    )

    res.json(entries)
  } catch (error) {
    console.error('GET /entries failed:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get specific journal entry
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id
    const entryId = req.params.id

    const entry = await dbGet(
      `
      SELECT
        je.id,
        je.user_id,
        je.title,
        je.content,
        je.mood_text AS mood,
        je.created_at,
        je.updated_at
      FROM journal_entries je
      WHERE je.id = ? AND je.user_id = ?
      `,
      [entryId, userId]
    )

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' })
    }

    res.json(entry)
  } catch (error) {
    console.error('GET /entries/:id failed:', error)
    res.status(500).json({ error: error.message })
  }
})

// Create journal entry
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id
    const { title, content } = req.body
    const mood = resolveMoodValue(req.body)

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'Title and content are required' })
    }

    const result = await dbRun(
      `
      INSERT INTO journal_entries (user_id, title, content, mood_text)
      VALUES (?, ?, ?, ?)
      `,
      [userId, title.trim(), content.trim(), mood]
    )

    const newEntry = await dbGet(
      `
      SELECT
        je.id,
        je.user_id,
        je.title,
        je.content,
        je.mood_text AS mood,
        je.created_at,
        je.updated_at
      FROM journal_entries je
      WHERE je.id = ?
      `,
      [result.id]
    )

    sendEventToClients('entries-updated', {
      type: 'created',
      entryId: newEntry.id
    })

    res.status(201).json(newEntry)
  } catch (error) {
    console.error('POST /entries failed:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update journal entry
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id
    const entryId = req.params.id
    const { title, content } = req.body
    const mood = resolveMoodValue(req.body)

    const entry = await dbGet(
      'SELECT * FROM journal_entries WHERE id = ? AND user_id = ?',
      [entryId, userId]
    )

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' })
    }

    await dbRun(
      `
      UPDATE journal_entries
      SET
        title = ?,
        content = ?,
        mood_text = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
      `,
      [
        title?.trim() || entry.title,
        content?.trim() || entry.content,
        mood !== null ? mood : entry.mood_text,
        entryId,
        userId
      ]
    )

    const updated = await dbGet(
      `
      SELECT
        je.id,
        je.user_id,
        je.title,
        je.content,
        je.mood_text AS mood,
        je.created_at,
        je.updated_at
      FROM journal_entries je
      WHERE je.id = ?
      `,
      [entryId]
    )

    sendEventToClients('entries-updated', {
      type: 'updated',
      entryId: updated.id
    })

    res.json(updated)
  } catch (error) {
    console.error('PUT /entries/:id failed:', error)
    res.status(500).json({ error: error.message })
  }
})

// Delete journal entry
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id
    const entryId = req.params.id

    const entry = await dbGet(
      'SELECT * FROM journal_entries WHERE id = ? AND user_id = ?',
      [entryId, userId]
    )

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' })
    }

    await dbRun(
      'DELETE FROM journal_entries WHERE id = ? AND user_id = ?',
      [entryId, userId]
    )

    sendEventToClients('entries-updated', {
      type: 'deleted',
      entryId
    })

    res.json({ message: 'Entry deleted' })
  } catch (error) {
    console.error('DELETE /entries/:id failed:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router