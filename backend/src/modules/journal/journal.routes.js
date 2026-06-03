import express from 'express'
import * as journalService from './journal.service.js'

const router = express.Router()

const getUserId = (req) => {
  return req.user?.userId || 1
}

const handleError = (res, error) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  if (error.name === 'NotFoundError') {
    return res.status(404).json({ error: error.message })
  }

  console.error(error)
  return res.status(500).json({ error: 'Internal error' })
}

router.get('/', async (req, res) => {
  try {
    const entries = await journalService.getEntries(getUserId(req))
    res.json(entries)
  } catch (error) {
    handleError(res, error)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const entry = await journalService.getEntryById(
      req.params.id,
      getUserId(req)
    )

    res.json(entry)
  } catch (error) {
    handleError(res, error)
  }
})

router.post('/', async (req, res) => {
  try {
    const entry = await journalService.createEntry(
      req.body,
      getUserId(req)
    )

    res.status(201).json(entry)
  } catch (error) {
    handleError(res, error)
  }
})

router.put('/:id', async (req, res) => {
  try {
    const entry = await journalService.updateEntry(
      req.params.id,
      req.body,
      getUserId(req)
    )

    res.json(entry)
  } catch (error) {
    handleError(res, error)
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const result = await journalService.deleteEntry(
      req.params.id,
      getUserId(req)
    )

    res.json(result)
  } catch (error) {
    handleError(res, error)
  }
})

export default router