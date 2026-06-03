import { dbRun, dbGet, dbAll } from '../../utils/database.js'

function createValidationError(message) {
  const error = new Error(message)
  error.name = 'ValidationError'
  return error
}

function resolveMoodValue(body) {
  const rawMood =
    body?.customMood?.trim() ||
    body?.mood?.trim() ||
    (typeof body?.mood_id === 'string' ? body.mood_id.trim() : '')

  return rawMood || null
}

export async function getEntries(userId) {
  return dbAll(
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
}

export async function getEntryById(entryId, userId) {
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
    const error = new Error('Entry not found')
    error.name = 'NotFoundError'
    throw error
  }

  return entry
}

export async function createEntry(body, userId) {
  const { title, content } = body
  const mood = resolveMoodValue(body)

  if (!title?.trim() || !content?.trim()) {
    throw createValidationError('Title and content are required')
  }

  const result = await dbRun(
    `
    INSERT INTO journal_entries (user_id, title, content, mood_text)
    VALUES (?, ?, ?, ?)
    `,
    [userId, title.trim(), content.trim(), mood]
  )

  return getEntryById(result.id, userId)
}

export async function updateEntry(entryId, body, userId) {
  const existing = await dbGet(
    'SELECT * FROM journal_entries WHERE id = ? AND user_id = ?',
    [entryId, userId]
  )

  if (!existing) {
    const error = new Error('Entry not found')
    error.name = 'NotFoundError'
    throw error
  }

  const { title, content } = body
  const mood = resolveMoodValue(body)

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
      title?.trim() || existing.title,
      content?.trim() || existing.content,
      mood !== null ? mood : existing.mood_text,
      entryId,
      userId
    ]
  )

  return getEntryById(entryId, userId)
}

export async function deleteEntry(entryId, userId) {
  const existing = await dbGet(
    'SELECT * FROM journal_entries WHERE id = ? AND user_id = ?',
    [entryId, userId]
  )

  if (!existing) {
    const error = new Error('Entry not found')
    error.name = 'NotFoundError'
    throw error
  }

  await dbRun(
    'DELETE FROM journal_entries WHERE id = ? AND user_id = ?',
    [entryId, userId]
  )

  return { message: 'Entry deleted' }
}