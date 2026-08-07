import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import type { TaskPriority } from './tasks.ts'

/** Kalender & Booking: Termine mit Uhrzeiten und Prioritätsfarben (Spec, Abschnitt 4). */
export const appointments = pgTable(
  'appointments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    location: text('location').notNull().default(''),
    priority: text('priority').$type<TaskPriority>().notNull().default('medium'),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('appointments_user_id_idx').on(t.userId)],
)

export type Appointment = typeof appointments.$inferSelect
export type NewAppointment = typeof appointments.$inferInsert
