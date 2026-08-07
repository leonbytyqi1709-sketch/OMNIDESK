/**
 * Kategorien müssen mit VAULT_CATEGORIES in src/db/schema/vault.ts
 * übereinstimmen (dort validiert die API). Hier bewusst dupliziert,
 * damit kein Drizzle-Code im Browser-Bundle landet.
 */
export const VAULT_CATEGORIES = ['privat', 'familie', 'kunden'] as const
export type VaultCategory = (typeof VAULT_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<VaultCategory, string> = {
  privat: 'Privat',
  familie: 'Familie',
  kunden: 'Kunden',
}

/** Klartext-Struktur eines Eintrags (wird verschlüsselt gespeichert). */
export interface VaultEntryData {
  title: string
  username: string
  password: string
  url: string
  notes: string
}
