import Tokens from 'csrf'

const tokens = new Tokens()

export const generateCsrfToken = (req, res, next) => {
  const secret = tokens.secretSync()

  res.cookie('csrf-secret', secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })

  res.json({
    csrfToken: tokens.create(secret)
  })
}

export const verifyCsrfToken = (req, res, next) => {
  const secret = req.cookies['csrf-secret']
  const token = req.headers['x-csrf-token']

  if (!secret || !token || !tokens.verify(secret, token)) {
    return res.status(403).json({
      error: 'Invalid CSRF token'
    })
  }

  next()
}