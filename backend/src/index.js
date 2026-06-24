import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'http'
import { Server } from 'socket.io'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth.js'
import moodRoutes from './routes/moods.js'
import skillRoutes from './routes/skills.js'
import eventRoutes from './routes/events.js'
import journalRoutes from './modules/journal/journal.routes.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const backendRoot = path.resolve(__dirname, '..')
const projectRoot = path.resolve(backendRoot, '..')

const publicPath = path.join(backendRoot, 'public')
const frontendDistPath = path.join(projectRoot, 'frontend', 'dist')

const buildPath = publicPath

app.set('trust proxy', 1)
app.disable('x-powered-by')

app.use(
  helmet({
    contentSecurityPolicy: false
  })
)

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.secure) return next()
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`)
  })
}

app.use(express.json())
app.use(cookieParser())

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
})

app.use('/api', apiLimiter)

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Mood Tracker API läuft',
    environment: process.env.NODE_ENV || 'development'
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/moods', moodRoutes)
app.use('/api/entries', journalRoutes)
app.use('/api/skills', skillRoutes)
app.use('/api/events', eventRoutes)

const io = new Server(httpServer)

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id)

  socket.on('journal-entry-created', (data) => {
    socket.broadcast.emit('journal-entry-created', data)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id)
  })
})

app.use(
  express.static(buildPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      }
    }
  })
)

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'))
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`✅ Server läuft auf Port ${PORT}`)
  console.log(`✅ API erreichbar unter: http://localhost:${PORT}/api/health`)
  console.log(`✅ Frontend erreichbar unter: http://localhost:${PORT}`)
  console.log(`✅ React Build Ordner: ${buildPath}`)
})