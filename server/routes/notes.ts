import { and, desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../../src/db/client'
import { notes } from '../../src/db/schema/index'

const noteInput = z.object({
  title: z.string().trim().min(1, 'Titel fehlt').max(300),
  content: z.string().max(100_000),
})

export const notesRoute = new Hono()

notesRoute.get('/', async (c) => {
  const rows = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, c.get('userId')))
    .orderBy(desc(notes.updatedAt))
  return c.json(rows)
})

// Neue Notiz mit Defaults – der Editor benennt sie danach um
notesRoute.post('/', async (c) => {
  const [row] = await db
    .insert(notes)
    .values({ userId: c.get('userId') })
    .returning()
  return c.json(row, 201)
})

notesRoute.put('/:id', async (c) => {
  const parsed = noteInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }
  const [row] = await db
    .update(notes)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(notes.id, c.req.param('id')), eq(notes.userId, c.get('userId'))))
    .returning()
  if (!row) return c.json({ error: 'Notiz nicht gefunden' }, 404)
  return c.json(row)
})

notesRoute.delete('/:id', async (c) => {
  const [row] = await db
    .delete(notes)
    .where(and(eq(notes.id, c.req.param('id')), eq(notes.userId, c.get('userId'))))
    .returning({ id: notes.id })
  if (!row) return c.json({ error: 'Notiz nicht gefunden' }, 404)
  return c.json({ ok: true })
})
