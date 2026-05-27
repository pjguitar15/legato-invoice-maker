import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import { connectToDatabase } from './db.js'
import eventsRouter from './routes/events.js'

const app = express()

app.use(cors({ origin: config.corsOrigin }))
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'legato-business-api' })
})

app.use('/api/events', eventsRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message,
  })
})

const start = async () => {
  await connectToDatabase()

  app.listen(config.port, () => {
    console.log(`Legato API listening on http://127.0.0.1:${config.port}`)
  })
}

start().catch((error) => {
  console.error(error)
  process.exit(1)
})
