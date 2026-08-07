import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

/** Wochentags-Verfügbarkeit: mon..sun mit Zeitfenster. */
export interface DayAvailability {
  enabled: boolean
  /** "09:00" */
  from: string
  /** "17:00" */
  to: string
}

export type WeekAvailability = Record<
  'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun',
  DayAvailability
>

/** Booking-System: öffentliche Terminbuchung (Eigenbau-Calendly, Spec Abschnitt 4). */
export const bookingSettings = pgTable(
  'booking_settings',
  {
    /** Clerk-User-ID – eine Booking-Konfiguration pro Benutzer */
    userId: text('user_id').primaryKey(),
    /** Öffentlicher URL-Teil: /book/<slug> */
    slug: text('slug').notNull(),
    /** Buchungsseite aktiv? */
    active: boolean('active').notNull().default(false),
    /** Slot-Länge in Minuten */
    slotMinutes: integer('slot_minutes').notNull().default(30),
    availability: jsonb('availability').$type<WeekAvailability>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex('booking_settings_slug_idx').on(t.slug)],
)

export type BookingSettings = typeof bookingSettings.$inferSelect
