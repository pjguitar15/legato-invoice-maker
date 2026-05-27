import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || '',
  mongoDbName: process.env.MONGODB_DB_NAME || 'legato_business_tracker',
  eventsCollectionName: process.env.MONGODB_EVENTS_COLLECTION || 'events',
  corsOrigin: process.env.CORS_ORIGIN || 'http://127.0.0.1:5173',
}

export const assertMongoConfig = () => {
  if (!config.mongoUri) {
    throw new Error('Missing MONGODB_URI. Add it to .env before starting the API.')
  }
}
