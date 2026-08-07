import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const VAULT_CATEGORIES = ['privat', 'familie', 'kunden'] as const
export type VaultCategory = (typeof VAULT_CATEGORIES)[number]

/**
 * Passwort-Manager (Spec, Abschnitt 4).
 * Der Server speichert AUSSCHLIESSLICH Ciphertext: Verschlüsselung und
 * Entschlüsselung passieren mit AES-256-GCM im Browser; der Schlüssel wird
 * per PBKDF2 aus dem Master-Passwort abgeleitet und verlässt den Client nie.
 */
export const vaults = pgTable('vaults', {
  /** Clerk-User-ID – ein Vault pro Benutzer */
  userId: text('user_id').primaryKey(),
  /** PBKDF2-Salt (Base64) */
  salt: text('salt').notNull(),
  /** Verschlüsselter Prüfwert zum Validieren des Master-Passworts (JSON: iv+ct, Base64) */
  verifier: text('verifier').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const vaultEntries = pgTable(
  'vault_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    category: text('category').$type<VaultCategory>().notNull().default('privat'),
    /** AES-256-GCM-Ciphertext (Base64) über das JSON des Eintrags */
    ciphertext: text('ciphertext').notNull(),
    /** GCM-IV (Base64), pro Eintrag einmalig */
    iv: text('iv').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('vault_entries_user_id_idx').on(t.userId)],
)

export type VaultEntryRow = typeof vaultEntries.$inferSelect
