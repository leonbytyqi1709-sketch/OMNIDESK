import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema/index.ts'

/**
 * NUR SERVERSEITIG verwenden (API-Funktionen)!
 * Der Connection String enthält das Datenbank-Passwort und darf niemals
 * ins Frontend-Bundle gelangen. Frontend-Module sprechen ausschließlich
 * über die API-Endpunkte mit der Datenbank.
 */
if ('window' in globalThis) {
  throw new Error('db/client.ts darf nicht im Browser importiert werden.')
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL fehlt – bitte in .env.local hinterlegen.')
}

const sql = neon(databaseUrl)

export const db = drizzle(sql, { schema })
