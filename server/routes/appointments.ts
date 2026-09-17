import { and, asc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../../src/db/client'
import { TASK_PRIORITIES, appointments } from '../../src/db/schema/index'

const appointmentInput = z
  .object({
    title: z.string().trim().min(1, 'Titel fehlt').max(300),
    description: z.string().max(10_000).default(''),
    location: z.string().trim().max(300).default(''),
    priority: z.enum(TASK_PRIORITIES).default('medium'),
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }),
  })
  .refine((v) => new Date(v.endsAt) > new Date(v.startsAt), {
    message: 'Ende muss nach dem Beginn liegen',
    path: ['endsAt'],
  })

export const appointmentsRoute = new Hono()

appointmentsRoute.get('/', async (c) => {
  const rows = await db
    .select()
    .from(appointments)
    .where(eq(appointments.userId, c.get('userId')))
    .orderBy(asc(appointments.startsAt))
  return c.json(rows)
})

appointmentsRoute.post('/', async (c) => {
  const parsed = appointmentInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }
  const { startsAt, endsAt, ...rest } = parsed.data
  const [row] = await db
    .insert(appointments)
    .values({
      ...rest,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      userId: c.get('userId'),
    })
    .returning()
  return c.json(row, 201)
})

appointmentsRoute.put('/:id', async (c) => {
  const parsed = appointmentInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }
  const { startsAt, endsAt, ...rest } = parsed.data
  const [row] = await db
    .update(appointments)
    .set({
      ...rest,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(appointments.id, c.req.param('id')),
        eq(appointments.userId, c.get('userId')),
      ),
    )
    .returning()
  if (!row) return c.json({ error: 'Termin nicht gefunden' }, 404)
  return c.json(row)
})

appointmentsRoute.delete('/:id', async (c) => {
  const [row] = await db
    .delete(appointments)
    .where(
      and(
        eq(appointments.id, c.req.param('id')),
        eq(appointments.userId, c.get('userId')),
      ),
    )
    .returning({ id: appointments.id })
  if (!row) return c.json({ error: 'Termin nicht gefunden' }, 404)
  return c.json({ ok: true })
})
