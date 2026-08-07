import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// Lädt DATABASE_URL aus .env.local (liegt nicht im Repository)
config({ path: '.env.local' })

export default defineConfig({
  schema: './src/db/schema',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
