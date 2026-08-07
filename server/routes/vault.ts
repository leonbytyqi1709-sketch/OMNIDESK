import { and, desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../../src/db/client.ts'
import { VAULT_CATEGORIES, vaultEntries, vaults } from '../../src/db/schema/index.ts'

/**
 * Der Server kennt weder Master-Passwort noch Klartext – er verwaltet nur
 * Base64-Blobs. Entschlüsselung passiert ausschließlich im Browser.
 */
const base64 = z
  .string()
  .min(1)
  .max(100_000)
  .regex(/^[A-Za-z0-9+/=]+$/, 'Kein gültiges Base64')

const metaInput = z.object({
  salt: base64,
  verifier: base64,
})

const entryInput = z.object({
  category: z.enum(VAULT_CATEGORIES),
  ciphertext: base64,
  iv: base64,
})

export const vaultRoute = new Hono()

/** Vault-Metadaten (Salt + Verifier) – null, wenn noch kein Vault existiert. */
vaultRoute.get('/meta', async (c) => {
  const [row] = await db
    .select()
    .from(vaults)
    .where(eq(vaults.userId, c.get('userId')))
  return c.json(row ?? null)
})

/** Vault einmalig anlegen. Ein Reset würde alle Einträge unbrauchbar machen. */
vaultRoute.post('/meta', async (c) => {
  const parsed = metaInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }
  const userId = c.get('userId')
  const [existing] = await db
    .select({ userId: vaults.userId })
    .from(vaults)
    .where(eq(vaults.userId, userId))
  if (existing) {
    return c.json({ error: 'Vault existiert bereits' }, 409)
  }
  const [row] = await db
    .insert(vaults)
    .values({ ...parsed.data, userId })
    .returning()
  return c.json(row, 201)
})

vaultRoute.get('/entries', async (c) => {
  const rows = await db
    .select()
    .from(vaultEntries)
    .where(eq(vaultEntries.userId, c.get('userId')))
    .orderBy(desc(vaultEntries.updatedAt))
  return c.json(rows)
})

vaultRoute.post('/entries', async (c) => {
  const parsed = entryInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }
  const [row] = await db
    .insert(vaultEntries)
    .values({ ...parsed.data, userId: c.get('userId') })
    .returning()
  return c.json(row, 201)
})

vaultRoute.put('/entries/:id', async (c) => {
  const parsed = entryInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }
  const [row] = await db
    .update(vaultEntries)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(
      and(
        eq(vaultEntries.id, c.req.param('id')),
        eq(vaultEntries.userId, c.get('userId')),
      ),
    )
    .returning()
  if (!row) return c.json({ error: 'Eintrag nicht gefunden' }, 404)
  return c.json(row)
})

vaultRoute.delete('/entries/:id', async (c) => {
  const [row] = await db
    .delete(vaultEntries)
    .where(
      and(
        eq(vaultEntries.id, c.req.param('id')),
        eq(vaultEntries.userId, c.get('userId')),
      ),
    )
    .returning({ id: vaultEntries.id })
  if (!row) return c.json({ error: 'Eintrag nicht gefunden' }, 404)
  return c.json({ ok: true })
})
