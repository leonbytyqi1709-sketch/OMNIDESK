import { useEffect } from 'react'
import { useNavigate } from 'react-router'

/**
 * Schnellaktionen aus der Command-Palette sollen nicht nur zum Modul
 * navigieren, sondern dort gleich die passende "Neu"-Aktion ausführen.
 * Da die Palette in einem anderen Modul-Tree läuft, wird die Absicht
 * kurz in localStorage zwischengespeichert und vom Ziel-Modul konsumiert.
 */
export type QuickAction =
  | 'create-note'
  | 'create-task'
  | 'create-project'
  | 'open-note'

const KEY = 'omnidesk:quick-action'

interface StoredQuickAction {
  action: QuickAction
  /** Optionale Zusatzinfo, z. B. die Notiz-ID bei 'open-note'. */
  payload?: string
}

export function setQuickAction(action: QuickAction, payload?: string) {
  const stored: StoredQuickAction = { action, payload }
  localStorage.setItem(KEY, JSON.stringify(stored))
}

/** Liest eine anstehende Schnellaktion (für `action`) samt Payload und löscht sie. */
export function consumeQuickAction(
  action: QuickAction,
): boolean {
  return consumeQuickActionPayload(action) !== null
}

/**
 * Wie consumeQuickAction, liefert aber den Payload zurück
 * (null, wenn keine passende Aktion ansteht).
 */
export function consumeQuickActionPayload(
  action: QuickAction,
): string | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    // Altes Format (reiner Action-String) weiterhin unterstützen
    if (raw === action) {
      localStorage.removeItem(KEY)
      return null
    }
    const stored = JSON.parse(raw) as StoredQuickAction
    if (stored.action !== action) return null
    localStorage.removeItem(KEY)
    return stored.payload ?? null
  } catch {
    return null
  }
}

export function useQuickAction(action: QuickAction, run: () => void) {
  const navigate = useNavigate()
  useEffect(() => {
    if (consumeQuickAction(action)) {
      navigate(location.pathname, { replace: true })
      run()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
