import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { Context, Next } from 'hono'

/**
 * Clerk-Session-Verifizierung über den öffentlichen JWKS-Endpunkt der
 * Clerk-Instanz. Die Instanz-Domain steckt Base64-kodiert im Publishable Key
 * (pk_test_<base64-domain>$) – es wird kein Secret Key benötigt.
 */
const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY
if (!publishableKey) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY fehlt – bitte in .env.local hinterlegen.')
}

const domain = Buffer.from(
  publishableKey.replace(/^pk_(test|live)_/, ''),
  'base64',
)
  .toString('utf-8')
  .replace(/\$$/, '')

const issuer = `https://${domain}`
const jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`))

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
