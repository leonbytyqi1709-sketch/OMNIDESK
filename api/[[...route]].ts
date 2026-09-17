import { handle } from 'hono/vercel'
import { createApp } from '../server/app.ts'

/**
 * Vercel-Function für ALLE /api/*-Routen (Catch-All).
 * Env-Variablen kommen aus dem Vercel-Projekt (kein dotenv nötig):
 * DATABASE_URL, VITE_CLERK_PUBLISHABLE_KEY, TZ=Europe/Berlin (Booking!).
 *
 * Node-Runtime (nicht Edge): auth.ts nutzt Buffer, db/client den
 * Neon-HTTP-Treiber, Chat-/Uptime-Routen weitere Node-APIs.
 * maxDuration=60 erlaubt auch längere KI-Antworten / Uptime-Checks.
 */
export const runtime = 'nodejs'
export const maxDuration = 60

export default handle(createApp())

