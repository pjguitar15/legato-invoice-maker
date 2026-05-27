import { MongoClient } from 'mongodb'
import { assertMongoConfig, config } from './config.js'

let client
let db

export const connectToDatabase = async () => {
  assertMongoConfig()

  if (db) return db

  client = new MongoClient(config.mongoUri)
  await client.connect()
  db = client.db(config.mongoDbName)

  await db.collection(config.eventsCollectionName).createIndexes([
    { key: { id: 1 }, unique: true },
    { key: { eventDate: -1 } },
    { key: { clientName: 1 } },
    { key: { location: 1 } },
    { key: { pipelineStage: 1 } },
    { key: { bookingSource: 1 } },
  ])

  return db
}

export const getEventsCollection = async () => {
  const database = await connectToDatabase()
  return database.collection(config.eventsCollectionName)
}

export const closeDatabase = async () => {
  if (!client) return

  await client.close()
  client = undefined
  db = undefined
}
