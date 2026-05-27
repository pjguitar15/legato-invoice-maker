import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { closeDatabase, getEventsCollection } from './db.js'
import { normalizeEventForStorage } from './eventModel.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const eventsJsonPath = path.resolve(__dirname, '../src/data/events.json')

const readSeedEvents = async () => {
  const file = await readFile(eventsJsonPath, 'utf8')
  return JSON.parse(file.replace(/^\uFEFF/, ''))
}

const seedEvents = async () => {
  const collection = await getEventsCollection()
  const rawEvents = await readSeedEvents()
  const events = rawEvents.map((event, index) =>
    normalizeEventForStorage(
      {
        ...event,
        id: event.id || `evt-${String(index + 1).padStart(4, '0')}`,
      },
      { preserveUpdatedAt: true },
    ),
  )

  if (events.length === 0) {
    console.log('No seed events found.')
    return
  }

  const operations = events.map((event) => ({
    updateOne: {
      filter: { id: event.id },
      update: (() => {
        const { createdAt, ...eventUpdate } = event
        return {
          $set: {
            ...eventUpdate,
            updatedAt: new Date().toISOString(),
          },
          $setOnInsert: {
            createdAt: createdAt || new Date().toISOString(),
          },
        }
      })(),
      upsert: true,
    },
  }))

  const result = await collection.bulkWrite(operations, { ordered: false })

  console.log(
    [
      `Seed complete from ${eventsJsonPath}`,
      `Matched: ${result.matchedCount}`,
      `Inserted: ${result.upsertedCount}`,
      `Modified: ${result.modifiedCount}`,
      `Total seed records: ${events.length}`,
    ].join('\n'),
  )
}

seedEvents()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await closeDatabase()
  })
