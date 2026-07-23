import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import {
  generateCsrfToken,
  verifyCsrfToken
} from '../middleware/csrf.js'

const router = express.Router()

const createToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "24h"
  })
}

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  let token = null

  // Try to get token from Authorization header first (Bearer token)
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  } else if (req.cookies?.token) {
    // Fall back to cookie
    token = req.cookies.token
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication token fehlt.' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = {
      id: payload.userId,
      email: payload.email
    }
    next()
  } catch (error) {
    console.error('Token verification failed:', error)
    res.status(401).json({ error: 'Ungültiges Authentifizierungs-Token.' })
  }
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000
}

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Alle Felder sind erforderlich.' })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(409).json({ error: 'E-Mail bereits vergeben.' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true
      }
    })

    const token = createToken(user)

    res.cookie('token', token, cookieOptions)

    res.status(201).json({ user })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Registrierung fehlgeschlagen.' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'E-Mail und Passwort sind erforderlich.' })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ error: 'E-Mail oder Passwort ungültig.' })
    }

    const passwordValid = await bcrypt.compare(password, user.password)

    if (!passwordValid) {
      return res.status(401).json({ error: 'E-Mail oder Passwort ungültig.' })
    }

    const token = createToken(user)

    res.cookie('token', token, cookieOptions)

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login fehlgeschlagen.' })
  }
})

export default router
router.get('/csrf', generateCsrfToken)