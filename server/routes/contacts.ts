import { and, asc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../../src/db/client'
import { contacts } from '../../src/db/schema/index'

const contactInput = z.object({
  firstName: z.string().trim().min(1, 'Vorname fehlt').max(100),
  lastName: z.string().trim().max(100).default(''),
  email: z.email('Ungültige E-Mail').or(z.literal('')).default(''),
  phone: z.string().trim().max(50).default(''),
  company: z.string().trim().max(200).default(''),
  notes: z.string().max(10_000).default(''),
})

export const contactsRoute = new Hono()

contactsRoute.get('/', async (c) => {
  const rows = await db
    .select()
    .from(contacts)
    .where(eq(contacts.userId, c.get('userId')))
    .orderBy(asc(contacts.firstName), asc(contacts.lastName))
  return c.json(rows)
})

contactsRoute.post('/', async (c) => {
  const parsed = contactInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }
  const [row] = await db
    .insert(contacts)
    .values({ ...parsed.data, userId: c.get('userId') })
    .returning()
  return c.json(row, 201)
})

contactsRoute.put('/:id', async (c) => {
  const parsed = contactInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }
  const [row] = await db
    .update(contacts)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(
      and(eq(contacts.id, c.req.param('id')), eq(contacts.userId, c.get('userId'))),
    )
    .returning()
  if (!row) return c.json({ error: 'Kontakt nicht gefunden' }, 404)
  return c.json(row)
})

contactsRoute.delete('/:id', async (c) => {
  const [row] = await db
    .delete(contacts)
    .where(
      and(eq(contacts.id, c.req.param('id')), eq(contacts.userId, c.get('userId'))),
    )
    .returning({ id: contacts.id })
  if (!row) return c.json({ error: 'Kontakt nicht gefunden' }, 404)
  return c.json({ ok: true })
})
