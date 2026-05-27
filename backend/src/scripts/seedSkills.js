import { dbRun, dbGet } from '../utils/database.js'

const skills = [
  {
    name: 'Box Breathing',
    description: 'A short breathing exercise to calm your nervous system.',
    category: 'Breathing',
    for_moods: 'anxious,stressed,angry',
    instructions: 'Breathe in for 4 seconds, hold for 4 seconds, breathe out for 4 seconds, hold for 4 seconds. Repeat this cycle 4 times.'
  },
  {
    name: '5-4-3-2-1 Grounding',
    description: 'A grounding technique to bring your attention back to the present moment.',
    category: 'Grounding',
    for_moods: 'anxious,confused,stressed',
    instructions: 'Name 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell and 1 thing you taste.'
  },
  {
    name: 'Thought Dump',
    description: 'Write down all thoughts without judging or organizing them.',
    category: 'Journaling',
    for_moods: 'sad,anxious,angry,lonely',
    instructions: 'Set a timer for 5 minutes and write everything that comes to mind. Do not edit or correct yourself.'
  },
  {
    name: 'Gentle Walk',
    description: 'A short walk to regulate emotions and clear your head.',
    category: 'Movement',
    for_moods: 'sad,stressed,sluggish,angry',
    instructions: 'Go outside or walk around your room for 5–10 minutes. Focus on slow breathing and relaxed shoulders.'
  },
  {
    name: 'Name the Feeling',
    description: 'Label what you feel to make the emotion easier to handle.',
    category: 'Reflection',
    for_moods: 'confused,sad,angry,anxious',
    instructions: 'Say or write: “I notice that I feel ___ right now.” Try to be specific without judging the emotion.'
  },
  {
    name: 'Cold Water Reset',
    description: 'A quick sensory reset for intense emotions.',
    category: 'Grounding',
    for_moods: 'angry,stressed,anxious',
    instructions: 'Hold cold water on your hands or splash your face with cold water for a few seconds. Breathe slowly.'
  },
  {
    name: 'Tiny Task',
    description: 'Do one very small task to regain a sense of control.',
    category: 'Action',
    for_moods: 'sluggish,sad,overwhelmed',
    instructions: 'Pick one tiny task that takes less than 2 minutes, like putting one item away or opening a window.'
  },
  {
    name: 'Gratitude Note',
    description: 'Focus on one small positive thing from today.',
    category: 'Reflection',
    for_moods: 'sad,lonely,stressed',
    instructions: 'Write down one thing that was okay today, even if it was very small.'
  },
  {
    name: 'Music Reset',
    description: 'Use music to shift your mood gently.',
    category: 'Sensory',
    for_moods: 'sad,angry,sluggish,lonely',
    instructions: 'Play one song that matches your mood, then one song that moves slightly toward how you want to feel.'
  },
  {
    name: 'Stretch Break',
    description: 'Release physical tension with simple stretching.',
    category: 'Movement',
    for_moods: 'stressed,angry,sluggish',
    instructions: 'Stretch your neck, shoulders, arms and back slowly for 3 minutes. Avoid forcing any movement.'
  }
]

async function setup() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      for_moods TEXT,
      instructions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await dbRun(`
    CREATE TABLE IF NOT EXISTS user_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      practiced_count INTEGER DEFAULT 0,
      last_practiced DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, skill_id)
    )
  `)

  for (const skill of skills) {
    const existing = await dbGet(
      'SELECT id FROM skills WHERE name = ?',
      [skill.name]
    )

    if (!existing) {
      await dbRun(
        `
        INSERT INTO skills
          (name, description, category, for_moods, instructions)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          skill.name,
          skill.description,
          skill.category,
          skill.for_moods,
          skill.instructions
        ]
      )
    }
  }

  console.log('✅ Coping skills seeded successfully')
}

setup().catch((error) => {
  console.error('❌ Seeding skills failed:', error)
})