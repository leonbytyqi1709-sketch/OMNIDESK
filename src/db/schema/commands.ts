import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

/** Terminal-Befehlsbibliothek: CLI-Cheat-Sheet mit Kategorien (Spec, Abschnitt 4). */
export const commands = pgTable(
  'commands',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    /** Kurzbeschreibung, z.B. "Alle offenen Ports anzeigen" */
    title: text('title').notNull(),
    /** Der eigentliche Befehl */
    command: text('command').notNull(),
    /** Kategorie, z.B. Linux, PowerShell, Cisco, Docker */
    category: text('category').notNull().default('Allgemein'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('commands_user_id_idx').on(t.userId)],
)

export type Command = typeof commands.$inferSelect
export type NewCommand = typeof commands.$inferInsert
