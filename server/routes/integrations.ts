import { and, desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../../src/db/client.ts'
import { connectedAccounts } from '../../src/db/schema/index.ts'

const createAccountInput = z.object({
  provider: z.enum(['google', 'mega']),
  email: z.string().trim().email('Ungültige E-Mail-Adresse').max(255),
  label: z.string().trim().max(100).optional(),
  accessToken: z.string().trim().optional(),
  refreshToken: z.string().trim().optional(),
  storageUsedBytes: z.string().optional(),
  storageTotalBytes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

const updateAccountInput = z.object({
  label: z.string().trim().max(100).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const integrationsRoute = new Hono()

/** Liste aller verbundenen Konten des Nutzers (Tokens werden nicht an den Client geschickt). */
integrationsRoute.get('/accounts', async (c) => {
  const rows = await db
    .select({
      id: connectedAccounts.id,
      userId: connectedAccounts.userId,
      provider: connectedAccounts.provider,
      email: connectedAccounts.email,
      label: connectedAccounts.label,
      avatarUrl: connectedAccounts.avatarUrl,
      storageUsedBytes: connectedAccounts.storageUsedBytes,
      storageTotalBytes: connectedAccounts.storageTotalBytes,
      metadata: connectedAccounts.metadata,
      hasRefreshToken: connectedAccounts.refreshToken,
      createdAt: connectedAccounts.createdAt,
      updatedAt: connectedAccounts.updatedAt,
    })
    .from(connectedAccounts)
    .where(eq(connectedAccounts.userId, c.get('userId')))
    .orderBy(desc(connectedAccounts.createdAt))

  const sanitized = rows.map((r) => ({
    ...r,
    hasRefreshToken: Boolean(r.hasRefreshToken),
  }))

  return c.json(sanitized)
})

/** Neues externes Konto verknüpfen (Google oder MEGA). */
integrationsRoute.post('/accounts', async (c) => {
  const parsed = createAccountInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }

  const { provider, email, label, accessToken, refreshToken, storageUsedBytes, storageTotalBytes, metadata } =
    parsed.data

  // Standard-Werte für Kapazitäten (z. B. Google Drive 15 GB, MEGA 20 GB)
  const defaultTotal =
    provider === 'google'
      ? (15 * 1024 * 1024 * 1024).toString() // 15 GB
      : (20 * 1024 * 1024 * 1024).toString() // 20 GB

  // Bei Demo / ohne Token erzeugen wir einen realistischen Start-Verbrauch
  const defaultUsed =
    provider === 'google'
      ? (Math.floor(Math.random() * 8 + 3) * 1024 * 1024 * 1024).toString()
      : (Math.floor(Math.random() * 10 + 2) * 1024 * 1024 * 1024).toString()

  const [row] = await db
    .insert(connectedAccounts)
    .values({
      userId: c.get('userId'),
      provider,
      email,
      label: label || (provider === 'google' ? 'Google Drive & Mail' : 'MEGA Cloud'),
      accessToken: accessToken ?? null,
      refreshToken: refreshToken ?? null,
      storageUsedBytes: storageUsedBytes ?? defaultUsed,
      storageTotalBytes: storageTotalBytes ?? defaultTotal,
      metadata: metadata ?? {},
    })
    .returning({
      id: connectedAccounts.id,
      userId: connectedAccounts.userId,
      provider: connectedAccounts.provider,
      email: connectedAccounts.email,
      label: connectedAccounts.label,
      avatarUrl: connectedAccounts.avatarUrl,
      storageUsedBytes: connectedAccounts.storageUsedBytes,
      storageTotalBytes: connectedAccounts.storageTotalBytes,
      metadata: connectedAccounts.metadata,
      createdAt: connectedAccounts.createdAt,
      updatedAt: connectedAccounts.updatedAt,
    })

  return c.json(row, 201)
})

/** Konto bearbeiten (z. B. Label). */
integrationsRoute.put('/accounts/:id', async (c) => {
  const parsed = updateAccountInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }

  const [row] = await db
    .update(connectedAccounts)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(connectedAccounts.id, c.req.param('id')),
        eq(connectedAccounts.userId, c.get('userId')),
      ),
    )
    .returning({
      id: connectedAccounts.id,
      provider: connectedAccounts.provider,
      email: connectedAccounts.email,
      label: connectedAccounts.label,
      avatarUrl: connectedAccounts.avatarUrl,
      storageUsedBytes: connectedAccounts.storageUsedBytes,
      storageTotalBytes: connectedAccounts.storageTotalBytes,
      metadata: connectedAccounts.metadata,
      updatedAt: connectedAccounts.updatedAt,
    })

  if (!row) return c.json({ error: 'Konto nicht gefunden' }, 404)
  return c.json(row)
})

/** Konto trennen / entfernen. */
integrationsRoute.delete('/accounts/:id', async (c) => {
  const [row] = await db
    .delete(connectedAccounts)
    .where(
      and(
        eq(connectedAccounts.id, c.req.param('id')),
        eq(connectedAccounts.userId, c.get('userId')),
      ),
    )
    .returning({ id: connectedAccounts.id })

  if (!row) return c.json({ error: 'Konto nicht gefunden' }, 404)
  return c.json({ ok: true })
})

/** Quota synchronisieren (Live-API falls Token vorhanden, sonst Status-Update). */
integrationsRoute.post('/accounts/:id/sync', async (c) => {
  const [account] = await db
    .select()
    .from(connectedAccounts)
    .where(
      and(
        eq(connectedAccounts.id, c.req.param('id')),
        eq(connectedAccounts.userId, c.get('userId')),
      ),
    )

  if (!account) return c.json({ error: 'Konto nicht gefunden' }, 404)

  // Wenn ein Google-Access-Token vorhanden ist, fragen wir die offizielle Google Drive API an
  if (account.provider === 'google' && account.accessToken) {
    try {
      const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota,user', {
        headers: { Authorization: `Bearer ${account.accessToken}` },
      })
      if (res.ok) {
        const data = (await res.json()) as {
          storageQuota?: { limit?: string; usage?: string; usageInDrive?: string; usageInDriveTrash?: string }
          user?: { photoLink?: string }
        }
        if (data.storageQuota) {
          const used = data.storageQuota.usage ?? account.storageUsedBytes
          const total = data.storageQuota.limit ?? account.storageTotalBytes
          const [updated] = await db
            .update(connectedAccounts)
            .set({
              storageUsedBytes: used,
              storageTotalBytes: total,
              avatarUrl: data.user?.photoLink ?? account.avatarUrl,
              metadata: {
                ...((account.metadata as Record<string, unknown>) ?? {}),
                driveUsage: data.storageQuota.usageInDrive,
                trashUsage: data.storageQuota.usageInDriveTrash,
                lastSyncedAt: new Date().toISOString(),
              },
              updatedAt: new Date(),
            })
            .where(eq(connectedAccounts.id, account.id))
            .returning()
          return c.json(updated)
        }
      }
    } catch {
      // Fallback bei Netzwerkfehlern
    }
  }

  // Fallback: Aktualisiere Timestamp
  const [updated] = await db
    .update(connectedAccounts)
    .set({
      metadata: {
        ...((account.metadata as Record<string, unknown>) ?? {}),
        lastSyncedAt: new Date().toISOString(),
      },
      updatedAt: new Date(),
    })
    .where(eq(connectedAccounts.id, account.id))
    .returning()

  return c.json(updated)
})
