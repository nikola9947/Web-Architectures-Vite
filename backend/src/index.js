import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'http'
import { Server } from 'socket.io'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { verifyCsrf } from "./middleware/csrf.js";
import authRoutes from './routes/auth.js'
import moodRoutes from './routes/moods.js'
import skillRoutes from './routes/skills.js'
import eventRoutes from './routes/events.js'
import journalRoutes from './modules/journal/journal.routes.js'
import jwt from 'jsonwebtoken'


dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable must be set and contain at least 32 characters."
  );
}

const APP_HOST = process.env.APP_HOST

if (process.env.NODE_ENV === 'production' && !APP_HOST) {
  throw new Error(
    'APP_HOST environment variable is required in production.'
  )
}

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
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: [
          "'self'"
        ],

        styleSrc: [
          "'self'",
          "'unsafe-inline'"
        ],

        imgSrc: [
          "'self'",
          'data:',
          'https:'
        ],

        connectSrc: [
          "'self'",
          'ws:',
          'wss:'
        ],

        objectSrc: ["'none'"],

        frameAncestors: ["'none'"],

        baseUri: ["'self'"],

        formAction: ["'self'"]
      }
    },

    crossOriginEmbedderPolicy: false
  })
)

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.secure) {
      return next();
    }

    const safePath = req.originalUrl.replace(/^\/+/g, "/");

    return res.redirect(
      301,
      `https://${APP_HOST}${safePath}`
    );
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use('/api/auth', authRoutes)

app.use('/api/moods', verifyCsrf, moodRoutes)
app.use('/api/entries', verifyCsrf, journalRoutes)
app.use('/api/skills', verifyCsrf, skillRoutes)
app.use('/api/events', verifyCsrf, eventRoutes)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? `https://${APP_HOST}`
      : 'http://localhost:5173',
    credentials: true
  }
})

io.use((socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || ''

    const cookies = Object.fromEntries(
      cookieHeader
        .split(';')
        .filter(Boolean)
        .map(c => {
          const [key, ...value] = c.trim().split('=')
          return [key, decodeURIComponent(value.join('='))]
        })
    )
    const token = cookies.token

    if (!token) {
      return next(new Error('Authentication required'))
    }

    const payload = jwt.verify(token, JWT_SECRET)

    socket.user = {
      id: payload.userId,
      email: payload.email
    }

    socket.join(`user:${payload.userId}`)

    next()
  } catch (err) {
    return next(new Error('Invalid authentication token'))
  }
})

io.on('connection', (socket) => {
  console.log(
    `Socket connected: ${socket.id} (User ${socket.user.id})`
  )

  socket.on('journal-entry-created', (data) => {
    io.to(`user:${socket.user.id}`)
      .emit('journal-entry-created', data)
  })

  socket.on('disconnect', () => {
    console.log(
      `Socket disconnected: ${socket.id}`
    )
  })
})
app.use(
  express.static(buildPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) {
        res.setHeader(
          'Cache-Control',
          'no-cache, no-store, must-revalidate'
        )
      } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader(
          'Cache-Control',
          'public, max-age=31536000, immutable'
        )
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