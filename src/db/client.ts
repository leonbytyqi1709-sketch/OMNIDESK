import { neon } from '@neondatabase/serverless'
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http'
import * as schema from './schema/index.ts'

/**
 * NUR SERVERSEITIG verwenden (API-Funktionen)!
 * Der Connection String enthält das Datenbank-Passwort und darf niemals
 * ins Frontend-Bundle gelangen. Frontend-Module sprechen ausschließlich
 * über die API-Endpunkte mit der Datenbank.
 *
 * WICHTIG (Serverless): Die Verbindung wird FAUL beim ersten Zugriff
 * aufgebaut, nicht beim Modulstart. Sonst würde eine fehlende DATABASE_URL
 * die GESAMTE Vercel-Function beim Kaltstart crashen (auch /health).
 */
if ('window' in globalThis) {
  throw new Error('db/client.ts darf nicht im Browser importiert werden.')
}

let cachedDb: NeonHttpDatabase<typeof schema> | null = null

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (cachedDb) return cachedDb

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('ENV_FEHLT: DATABASE_URL ist auf Vercel nicht gesetzt')
  }

  cachedDb = drizzle(neon(databaseUrl), { schema })
  return cachedDb
}

/**
 * Faules db-Handle (Proxy): import { db } funktioniert wie bisher, aber die
 * echte Verbindung (und der DATABASE_URL-Check) passiert erst beim ersten
 * echten Query-Aufruf – nicht beim Modulimport.
 */
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver)
  },
})
