import express from 'express'
import { getEventsCollection } from '../db.js'
import { normalizeEventForStorage, serializeEvent } from '../eventModel.js'

const router = express.Router()

const buildEventFilter = (query) => {
  const filter = {}

  if (query.year && query.year !== 'All') {
    filter.eventDate = { $regex: `^${String(query.year)}` }
  }

  if (query.status && query.status !== 'All') {
    filter.status = String(query.status)
  }

  if (query.pipelineStage && query.pipelineStage !== 'All') {
    filter.pipelineStage = String(query.pipelineStage)
  }

  if (query.scheduled === 'true') {
    filter.eventDate = { ...(filter.eventDate || {}), $ne: '' }
    filter.eventTime = { $ne: '' }
  }

  if (query.q) {
    const pattern = new RegExp(String(query.q).trim(), 'i')
    filter.$or = [
      { name: pattern },
      { clientName: pattern },
      { location: pattern },
      { eventType: pattern },
      { packageName: pattern },
      { bookingSource: pattern },
      { status: pattern },
      { pipelineStage: pattern },
      { notes: pattern },
    ]
  }

  return filter
}

router.get('/', async (req, res, next) => {
  try {
    const collection = await getEventsCollection()
    const limit = Math.min(Math.max(Number(req.query.limit || 500), 1), 2000)
    const skip = Math.max(Number(req.query.skip || 0), 0)
    const filter = buildEventFilter(req.query)
    const events = await collection
      .find(filter)
      .sort({ eventDate: -1, eventTime: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
    const total = await collection.countDocuments(filter)

    res.json({
      data: events.map(serializeEvent),
      meta: { total, limit, skip },
    })
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const collection = await getEventsCollection()
    const event = await collection.findOne({ id: req.params.id })

    if (!event) {
      res.status(404).json({ error: 'Event not found' })
      return
    }

    res.json({ data: serializeEvent(event) })
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const collection = await getEventsCollection()
    const event = normalizeEventForStorage(req.body)

    await collection.insertOne(event)
    res.status(201).json({ data: serializeEvent(event) })
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'Event id already exists' })
      return
    }

    next(error)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const collection = await getEventsCollection()
    const existing = await collection.findOne({ id: req.params.id })

    if (!existing) {
      res.status(404).json({ error: 'Event not found' })
      return
    }

    const event = normalizeEventForStorage({
      ...existing,
      ...req.body,
      id: existing.id,
      createdAt: existing.createdAt,
    })

    await collection.updateOne({ id: req.params.id }, { $set: event })
    res.json({ data: serializeEvent(event) })
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const collection = await getEventsCollection()
    const result = await collection.deleteOne({ id: req.params.id })

    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'Event not found' })
      return
    }

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

export default router
