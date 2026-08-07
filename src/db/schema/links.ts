import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

/**
 * Nginx-Link-Manager: gespeicherte Web-Interfaces (Atera, Proxmox, …)
 * mit sprechenden Namen, Kategorie und Icon (Spec, Abschnitt 4).
 */
export const links = pgTable(
  'links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Clerk-User-ID des Besitzers */
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    url: text('url').notNull(),
    category: text('category'),
    /** Icon-Name (Lucide) oder Favicon-URL */
    icon: text('icon'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('links_user_id_idx').on(t.userId)],
)

export type Link = typeof links.$inferSelect
export type NewLink = typeof links.$inferInsert
