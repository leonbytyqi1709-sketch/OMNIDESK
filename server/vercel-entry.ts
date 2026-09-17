import { handle } from 'hono/vercel'
import { createApp } from './app'

/**
 * Vercel-Entry: wird von `npm run bundle:api` (esbuild) zu api/index.js
 * gebuendelt. Der Bundle-Schritt loest ALLE lokalen Imports auf, sodass die
 * Serverless-Function keine relativen Pfade mehr zur Laufzeit aufloesen muss
 * (fruehere Ursache von 500 FUNCTION_INVOCATION_FAILED).
 *
 * Node-Runtime (nicht Edge): auth.ts nutzt Buffer, db/client den
 * Neon-HTTP-Treiber, Chat-/Uptime-Routen weitere Node-APIs.
 */
export const runtime = 'nodejs'
export const maxDuration = 60

export default handle(createApp())
