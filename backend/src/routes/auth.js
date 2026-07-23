import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '../lib/prisma.js'
import { sendRegisterSuccessEmail } from '../utils/sendEmail.js'

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is missing.')
}

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: '24h'
    }
  )
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',

  // Schutz gegen CSRF
  sameSite: 'strict',

  maxAge: 24 * 60 * 60 * 1000,

  path: '/'
}

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Alle Felder sind erforderlich.'
      })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(409).json({
        error: 'E-Mail bereits vergeben.'
      })
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

    sendRegisterSuccessEmail({
      to: user.email,
      username: user.username
    }).catch((err) => {
      console.error('Mail error:', err.message)
    })

    return res.status(201).json({
      user
    })

  } catch (err) {

    console.error('Register failed:', err.message)

    return res.status(500).json({
      error: 'Registrierung fehlgeschlagen.'
    })
  }
})

router.post('/login', async (req, res) => {

  try {

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: 'E-Mail und Passwort sind erforderlich.'
      })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        error: 'E-Mail oder Passwort ungültig.'
      })
    }

    const passwordValid = await bcrypt.compare(password, user.password)

    if (!passwordValid) {
      return res.status(401).json({
        error: 'E-Mail oder Passwort ungültig.'
      })
    }

    const token = createToken(user)

    res.cookie('token', token, cookieOptions)

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })

  } catch (err) {

    console.error('Login failed:', err.message)

    return res.status(500).json({
      error: 'Login fehlgeschlagen.'
    })
  }
})

router.post('/logout', (req, res) => {

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  })

  return res.status(200).json({
    message: 'Logout erfolgreich.'
  })

})

router.get('/me', async (req, res) => {

  try {

    const token = req.cookies?.token

    if (!token) {
      return res.status(401).json({
        error: 'Nicht eingeloggt.'
      })
    }

    const decoded = jwt.verify(
      token,
      JWT_SECRET,
      {
        algorithms: ['HS256']
      }
    )

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId
      },
      select: {
        id: true,
        username: true,
        email: true
      }
    })

    if (!user) {
      return res.status(401).json({
        error: 'Nicht eingeloggt.'
      })
    }

    return res.json({
      user
    })

  } catch {

    return res.status(401).json({
      error: 'Nicht eingloggt.'
    })

  }

})

export default router