import { and, asc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../../src/db/client'
import { commands } from '../../src/db/schema/index'

const commandInput = z.object({
  title: z.string().trim().min(1, 'Beschreibung fehlt').max(300),
  command: z.string().trim().min(1, 'Befehl fehlt').max(5000),
  category: z.string().trim().min(1).max(100),
})

export const commandsRoute = new Hono()

commandsRoute.get('/', async (c) => {
  const rows = await db
    .select()
    .from(commands)
    .where(eq(commands.userId, c.get('userId')))
    .orderBy(asc(commands.category), asc(commands.title))
  return c.json(rows)
})

commandsRoute.post('/', async (c) => {
  const parsed = commandInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }
  const [row] = await db
    .insert(commands)
    .values({ ...parsed.data, userId: c.get('userId') })
    .returning()
  return c.json(row, 201)
})

/** Mehrere Befehle auf einmal (Starter-Bibliothek, Import). */
commandsRoute.post('/bulk', async (c) => {
  const parsed = z.array(commandInput).max(200).safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }
  if (parsed.data.length === 0) return c.json([])
  const rows = await db
    .insert(commands)
    .values(parsed.data.map((d) => ({ ...d, userId: c.get('userId') })))
    .returning()
  return c.json(rows, 201)
})

commandsRoute.put('/:id', async (c) => {
  const parsed = commandInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }
  const [row] = await db
    .update(commands)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(
      and(eq(commands.id, c.req.param('id')), eq(commands.userId, c.get('userId'))),
    )
    .returning()
  if (!row) return c.json({ error: 'Befehl nicht gefunden' }, 404)
  return c.json(row)
})

commandsRoute.delete('/:id', async (c) => {
  const [row] = await db
    .delete(commands)
    .where(
      and(eq(commands.id, c.req.param('id')), eq(commands.userId, c.get('userId'))),
    )
    .returning({ id: commands.id })
  if (!row) return c.json({ error: 'Befehl nicht gefunden' }, 404)
  return c.json({ ok: true })
})
