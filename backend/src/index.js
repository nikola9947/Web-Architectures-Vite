import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { Server } from 'socket.io'

import authRoutes from './routes/auth.js'
import moodRoutes from './routes/moods.js'
import skillRoutes from './routes/skills.js'
import eventRoutes from './routes/events.js'

// NEU: Journal Modul statt alter entries.js
import journalRoutes from './modules/journal/journal.routes.js'

dotenv.config()

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177'
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/moods', moodRoutes)
app.use('/api/entries', journalRoutes)
app.use('/api/skills', skillRoutes)
app.use('/api/events', eventRoutes)

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
})

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id)

  socket.on('journal-entry-created', (data) => {
    socket.broadcast.emit('journal-entry-created', data)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`✅ Server läuft auf http://localhost:${PORT}`)
})