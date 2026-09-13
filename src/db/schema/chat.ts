import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const CHAT_ROLES = ['user', 'assistant', 'system'] as const
export type ChatRole = (typeof CHAT_ROLES)[number]

/**
 * Chat-Sitzungen des KI-Assistenten.
 */
export const chatSessions = pgTable(
  'chat_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    title: text('title').notNull().default('Neuer Chat'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('chat_sessions_user_id_idx').on(t.userId)],
)

/**
 * Einzelne Chat-Nachrichten einer Sitzung.
 */
export const chatMessages = pgTable(
  'chat_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => chatSessions.id, { onDelete: 'cascade' }),
    role: text('role').$type<ChatRole>().notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('chat_messages_session_id_idx').on(t.sessionId)],
)

export type ChatSession = typeof chatSessions.$inferSelect
export type NewChatSession = typeof chatSessions.$inferInsert
export type ChatMessage = typeof chatMessages.$inferSelect
export type NewChatMessage = typeof chatMessages.$inferInsert
