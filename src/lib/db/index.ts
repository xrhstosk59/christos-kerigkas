// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Connection string from environment variable
const connectionString = process.env.DATABASE_URL || ''

// Create postgres client
const client = postgres(connectionString)

// Create drizzle client
export const db = drizzle(client, { schema })

// Contact messages repository
export const contactMessagesRepository = {
  async create(data: Omit<schema.NewContactMessage, 'id' | 'createdAt'>) {
    return db.insert(schema.contactMessages)
      .values(data)
      .returning()
  },
  
  async getAll() {
    return db.select()
      .from(schema.contactMessages)
      .orderBy(schema.contactMessages.createdAt)
  }
}