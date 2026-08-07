import { useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'

/**
 * Authentifizierter Fetch für alle Modul-APIs: hängt automatisch das
 * Clerk-Session-Token an und wirft bei Fehlern eine Error mit der
 * Server-Fehlermeldung.
 */
export function useApiFetch() {
  const { getToken } = useAuth()

  return useCallback(
    async <T>(path: string, init?: RequestInit): Promise<T> => {
      const token = await getToken()
      const res = await fetch(path, {
        ...init,
        headers: {
          ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
          Authorization: `Bearer ${token}`,
          ...init?.headers,
        },
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(body?.error ?? `Anfrage fehlgeschlagen (${res.status})`)
      }
      return res.json() as Promise<T>
    },
    [getToken],
  )
}
