import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import { sendRegisterSuccessEmail } from '../utils/sendEmail.js'

const router = express.Router()

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000
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
    }).catch((error) => {
      console.error('Register email failed:', error)
    })

    return res.status(201).json({
      user
    })
  } catch (error) {
    console.error('Register error:', error)

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
  } catch (error) {
    console.error('Login error:', error)

    return res.status(500).json({
      error: 'Login fehlgeschlagen.'
    })
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

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
  } catch (error) {
    return res.status(401).json({
      error: 'Nicht eingeloggt.'
    })
  }
})

export default router