import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../../src/db/client.ts'
import { bookingSettings } from '../../src/db/schema/index.ts'

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

const dayAvailability = z.object({
  enabled: z.boolean(),
  from: z.string().regex(timePattern),
  to: z.string().regex(timePattern),
})

const settingsInput = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{3,50}$/, 'Slug: 3–50 Zeichen, nur a-z, 0-9 und Bindestrich'),
  active: z.boolean(),
  slotMinutes: z.number().int().min(10).max(240),
  availability: z.object({
    mon: dayAvailability,
    tue: dayAvailability,
    wed: dayAvailability,
    thu: dayAvailability,
    fri: dayAvailability,
    sat: dayAvailability,
    sun: dayAvailability,
  }),
})

/** Authentifizierte Verwaltung der eigenen Buchungsseite. */
export const bookingRoute = new Hono()

bookingRoute.get('/settings', async (c) => {
  const [row] = await db
    .select()
    .from(bookingSettings)
    .where(eq(bookingSettings.userId, c.get('userId')))
  return c.json(row ?? null)
})

bookingRoute.put('/settings', async (c) => {
  const parsed = settingsInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }
  const userId = c.get('userId')

  // Slug-Kollision mit anderem Benutzer?
  const [taken] = await db
    .select({ userId: bookingSettings.userId })
    .from(bookingSettings)
    .where(eq(bookingSettings.slug, parsed.data.slug))
  if (taken && taken.userId !== userId) {
    return c.json({ error: 'Dieser Slug ist bereits vergeben' }, 409)
  }

  const [row] = await db
    .insert(bookingSettings)
    .values({ ...parsed.data, userId })
    .onConflictDoUpdate({
      target: bookingSettings.userId,
      set: { ...parsed.data, updatedAt: new Date() },
    })
    .returning()
  return c.json(row)
})
