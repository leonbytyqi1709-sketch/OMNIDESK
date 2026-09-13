import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const MONITOR_TYPES = ['http', 'tcp'] as const
export type MonitorType = (typeof MONITOR_TYPES)[number]

export const CHECK_STATUSES = ['up', 'down'] as const
export type CheckStatus = (typeof CHECK_STATUSES)[number]

/**
 * Uptime-Monitore: Webseiten, APIs oder TCP-Ports zur Verfügbarkeitsprüfung.
 */
export const uptimeMonitors = pgTable(
  'uptime_monitors',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    name: text('name').notNull(),
    type: text('type').$type<MonitorType>().notNull().default('http'),
    url: text('url').notNull(),
    port: integer('port'),
    expectedStatus: integer('expected_status').notNull().default(200),
    timeoutMs: integer('timeout_ms').notNull().default(10000),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('uptime_monitors_user_id_idx').on(t.userId)],
)

/**
 * Uptime-Checks: Historie der einzelnen Statusprüfungen.
 */
export const uptimeChecks = pgTable(
  'uptime_checks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    monitorId: uuid('monitor_id')
      .notNull()
      .references(() => uptimeMonitors.id, { onDelete: 'cascade' }),
    status: text('status').$type<CheckStatus>().notNull(),
    responseTimeMs: integer('response_time_ms'),
    statusCode: integer('status_code'),
    sslDaysLeft: integer('ssl_days_left'),
    error: text('error'),
    checkedAt: timestamp('checked_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('uptime_checks_monitor_id_idx').on(t.monitorId),
    index('uptime_checks_monitor_checked_idx').on(t.monitorId, t.checkedAt),
  ],
)

export type UptimeMonitor = typeof uptimeMonitors.$inferSelect
export type NewUptimeMonitor = typeof uptimeMonitors.$inferInsert
export type UptimeCheck = typeof uptimeChecks.$inferSelect
export type NewUptimeCheck = typeof uptimeChecks.$inferInsert
