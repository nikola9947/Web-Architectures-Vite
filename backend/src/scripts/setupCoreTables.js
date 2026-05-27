import { dbRun } from '../utils/database.js'

async function setup() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      mood_id INTEGER,
      mood_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await dbRun(`
    CREATE TABLE IF NOT EXISTS mood_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mood TEXT NOT NULL,
      intensity INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  console.log('✅ Journal und Mood Tabellen wurden erstellt')
}

setup().catch((error) => {
  console.error('❌ Setup failed:', error)
})