import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const TASK_PRIORITIES = ['high', 'medium', 'low'] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export interface Subtask {
  id: string
  title: string
  done: boolean
}

/** Task-Tool: Aufgaben mit Priorität, Status, Fälligkeit, Tags und Subtasks. */
export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    priority: text('priority').$type<TaskPriority>().notNull().default('medium'),
    status: text('status').$type<TaskStatus>().notNull().default('todo'),
    dueDate: timestamp('due_date', { withTimezone: true }),
    tags: jsonb('tags').$type<string[]>().default([]),
    subtasks: jsonb('subtasks').$type<Subtask[]>().default([]),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('tasks_user_id_idx').on(t.userId)],
)

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
