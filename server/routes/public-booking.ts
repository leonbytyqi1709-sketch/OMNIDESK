import { and, eq, gte, lt } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../../src/db/client.ts'
import {
  appointments,
  bookingSettings,
  type WeekAvailability,
} from '../../src/db/schema/index.ts'
import { nextDate, weekdayOfDate, zonedDateTime } from '../timezone.ts'

const WEEKDAY_KEYS: (keyof WeekAvailability)[] = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
]

const datePattern = /^\d{4}-\d{2}-\d{2}$/

async function activeSettingsBySlug(slug: string) {
  const [settings] = await db
    .select()
    .from(bookingSettings)
    .where(eq(bookingSettings.slug, slug))
  if (!settings || !settings.active) return null
  return settings
}

/** Alle Slot-Startzeiten (Minuten seit Mitternacht, Europe/Berlin) laut Verfügbarkeit. */
function daySlots(
  availability: WeekAvailability,
  slotMinutes: number,
  dateStr: string,
): number[] {
  const day = availability[WEEKDAY_KEYS[weekdayOfDate(dateStr)]]
  if (!day.enabled) return []
  const [fromH, fromM] = day.from.split(':').map(Number)
  const [toH, toM] = day.to.split(':').map(Number)
  const from = fromH * 60 + fromM
  const to = toH * 60 + toM
  const slots: number[] = []
  for (let t = from; t + slotMinutes <= to; t += slotMinutes) {
    slots.push(t)
  }
  return slots
}

function minutesToTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

/**
 * Öffentliche Buchungs-API (Eigenbau-Calendly) – bewusst OHNE Auth.
 * Gibt nur preis, was für die Buchung nötig ist: freie Slots, nie Termindetails.
 */
export const publicBookingRoute = new Hono()

publicBookingRoute.get('/:slug', async (c) => {
  const settings = await activeSettingsBySlug(c.req.param('slug'))
  if (!settings) return c.json({ error: 'Buchungsseite nicht gefunden' }, 404)
  return c.json({
    slug: settings.slug,
    slotMinutes: settings.slotMinutes,
    availability: settings.availability,
  })
})

publicBookingRoute.get('/:slug/slots', async (c) => {
  const settings = await activeSettingsBySlug(c.req.param('slug'))
  if (!settings) return c.json({ error: 'Buchungsseite nicht gefunden' }, 404)

  const dateStr = c.req.query('date')
  if (!dateStr || !datePattern.test(dateStr)) {
    return c.json({ error: 'Parameter date (YYYY-MM-DD) fehlt' }, 400)
  }
  // Tagesgrenzen explizit in Europe/Berlin (Vercel läuft auf UTC!)
  const dayStart = zonedDateTime(dateStr, 0)
  const dayEnd = zonedDateTime(nextDate(dateStr), 0)

  // Bestehende Termine des Besitzers an diesem Tag (nur Zeiten, keine Inhalte)
  const busy = await db
    .select({ startsAt: appointments.startsAt, endsAt: appointments.endsAt })
    .from(appointments)
    .where(
      and(
        eq(appointments.userId, settings.userId),
        gte(appointments.startsAt, dayStart),
        lt(appointments.startsAt, dayEnd),
      ),
    )

  const now = new Date()
  const free = daySlots(
    settings.availability,
    settings.slotMinutes,
    dateStr,
  ).filter((minutes) => {
    const slotStart = zonedDateTime(dateStr, minutes)
    const slotEnd = new Date(slotStart.getTime() + settings.slotMinutes * 60_000)
    if (slotStart <= now) return false
    return !busy.some((b) => slotStart < b.endsAt && slotEnd > b.startsAt)
  })

  return c.json({ date: dateStr, slots: free.map(minutesToTime) })
})

const bookInput = z.object({
  date: z.string().regex(datePattern),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  name: z.string().trim().min(1, 'Name fehlt').max(200),
  email: z.email('Ungültige E-Mail'),
  topic: z.string().trim().max(1000).optional().default(''),
})

publicBookingRoute.post('/:slug/book', async (c) => {
  const settings = await activeSettingsBySlug(c.req.param('slug'))
  if (!settings) return c.json({ error: 'Buchungsseite nicht gefunden' }, 404)

  const parsed = bookInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }
  const { date, time, name, email, topic } = parsed.data

  const [h, m] = time.split(':').map(Number)
  const startsAt = zonedDateTime(date, h * 60 + m)
  const endsAt = new Date(startsAt.getTime() + settings.slotMinutes * 60_000)

  // Slot muss laut Verfügbarkeit existieren …
  const dayStart = zonedDateTime(date, 0)
  const validSlot = daySlots(
    settings.availability,
    settings.slotMinutes,
    date,
  ).includes(h * 60 + m)
  if (!validSlot || startsAt <= new Date()) {
    return c.json({ error: 'Dieser Slot ist nicht buchbar' }, 400)
  }

  // … und noch frei sein (Kollisionsprüfung direkt vor dem Insert)
  const busy = await db
    .select({ startsAt: appointments.startsAt, endsAt: appointments.endsAt })
    .from(appointments)
    .where(
      and(
        eq(appointments.userId, settings.userId),
        gte(appointments.startsAt, dayStart),
        lt(appointments.startsAt, zonedDateTime(nextDate(date), 0)),
      ),
    )
  if (busy.some((b) => startsAt < b.endsAt && endsAt > b.startsAt)) {
    return c.json({ error: 'Dieser Slot wurde gerade vergeben' }, 409)
  }

  await db.insert(appointments).values({
    userId: settings.userId,
    title: `Buchung: ${name}`,
    description: `Extern gebucht über /book/${settings.slug}\nE-Mail: ${email}${topic ? `\nAnliegen: ${topic}` : ''}`,
    location: '',
    priority: 'medium',
    startsAt,
    endsAt,
  })

  return c.json({ ok: true, date, time }, 201)
})
