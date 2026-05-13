import express from 'express'
import { addClient } from '../utils/events.js'

const router = express.Router()

router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  res.flushHeaders?.()

  const removeClient = addClient(res)

  req.on('close', () => {
    removeClient()
  })
})

export default router