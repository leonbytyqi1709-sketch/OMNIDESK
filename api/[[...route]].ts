import { handle } from 'hono/vercel'
import { createApp } from '../server/app.ts'

/**
 * Vercel-Function für ALLE /api/*-Routen (Catch-All).
 * Env-Variablen kommen aus dem Vercel-Projekt (kein dotenv nötig):
 * DATABASE_URL, VITE_CLERK_PUBLISHABLE_KEY, TZ=Europe/Berlin (Booking!).
 */
export default handle(createApp())
