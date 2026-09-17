import { and, desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../../src/db/client'
import { links } from '../../src/db/schema/index'

const linkInput = z.object({
  title: z.string().trim().min(1, 'Titel fehlt').max(200),
  url: z.url('Ungültige URL').max(2048),
  category: z.string().trim().max(100).nullish(),
  icon: z.string().trim().max(2048).nullish(),
})

export const linksRoute = new Hono()

linksRoute.get('/', async (c) => {
  const rows = await db
    .select()
    .from(links)
    .where(eq(links.userId, c.get('userId')))
    .orderBy(desc(links.createdAt))
  return c.json(rows)
})

linksRoute.post('/', async (c) => {
  const parsed = linkInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }
  const [row] = await db
    .insert(links)
    .values({ ...parsed.data, userId: c.get('userId') })
    .returning()
  return c.json(row, 201)
})

linksRoute.put('/:id', async (c) => {
  const parsed = linkInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }
  const [row] = await db
    .update(links)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(links.id, c.req.param('id')), eq(links.userId, c.get('userId'))))
    .returning()
  if (!row) return c.json({ error: 'Link nicht gefunden' }, 404)
  return c.json(row)
})

linksRoute.delete('/:id', async (c) => {
  const [row] = await db
    .delete(links)
    .where(and(eq(links.id, c.req.param('id')), eq(links.userId, c.get('userId'))))
    .returning({ id: links.id })
  if (!row) return c.json({ error: 'Link nicht gefunden' }, 404)
  return c.json({ ok: true })
})
