import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

/** Notiz-Editor: Markdown-Notizen (Spec, Abschnitt 4). */
export const notes = pgTable(
  'notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Clerk-User-ID des Besitzers */
    userId: text('user_id').notNull(),
    title: text('title').notNull().default('Unbenannte Notiz'),
    /** Markdown-Inhalt */
    content: text('content').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('notes_user_id_idx').on(t.userId)],
)

export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert
