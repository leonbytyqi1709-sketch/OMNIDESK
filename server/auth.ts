/**
 * Clerk-Session-Verifizierung über den öffentlichen JWKS-Endpunkt der
 * Clerk-Instanz. Die Instanz-Domain steckt Base64-kodiert im Publishable Key
 * (pk_test_<base64-domain>$) – es wird kein Secret Key benötigt.
 *
 * WICHTIG (Serverless): Der Key wird FAUL zur Laufzeit gelesen, nicht beim
 * Modulstart geprüft. Sonst würde ein fehlender Key die GESAMTE Function
 * beim Kaltstart crashen (500 FUNCTION_INVOCATION_FAILED auch auf /health).
 */
import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { Context, Next } from 'hono'

let cachedIssuer: string | null = null
let cachedJwks: ReturnType<typeof createRemoteJWKSet> | null = null

function getClerkConfig(): { issuer: string; jwks: ReturnType<typeof createRemoteJWKSet> } {
  if (cachedIssuer && cachedJwks) return { issuer: cachedIssuer, jwks: cachedJwks }

  const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY
  if (!publishableKey) {
    throw new Error('ENV_FEHLT: VITE_CLERK_PUBLISHABLE_KEY ist auf Vercel nicht gesetzt')
  }

  const domain = Buffer.from(
    publishableKey.replace(/^pk_(test|live)_/, ''),
    'base64',
  )
    .toString('utf-8')
    .replace(/\$$/, '')

  const issuer = `https://${domain}`
  cachedIssuer = issuer
  cachedJwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`))
  return { issuer, jwks: cachedJwks }
}

declare module 'hono' {
  interface ContextVariableMap {
    /** Clerk-User-ID des authentifizierten Benutzers */
    userId: string
  }
}

/** Hono-Middleware: verlangt einen gültigen Clerk-JWT im Authorization-Header. */
export async function requireAuth(c: Context, next: Next) {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Nicht authentifiziert' }, 401)
  }

  try {
    const { issuer, jwks } = getClerkConfig()
    const { payload } = await jwtVerify(header.slice('Bearer '.length), jwks, {
      issuer,
    })
    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      return c.json({ error: 'Ungültiges Token' }, 401)
    }
    c.set('userId', payload.sub)
    return await next()
  } catch {
    return c.json({ error: 'Ungültiges oder abgelaufenes Token' }, 401)
  }
}
