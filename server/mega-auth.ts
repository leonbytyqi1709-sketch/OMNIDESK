import { Storage } from 'megajs'

export interface MegaAccountInfo {
  sessionJson: string
  spaceUsed: string
  spaceTotal: string
  filesCount: number
}

/**
 * Verbindet ein MEGA-Konto mit E-Mail und Passwort, liest Speicherdaten aus
 * und gibt die wiederverwendbare Sitzung zurück (keine Speicherung des Klartext-Passworts).
 */
export async function connectMegaAccount(email: string, password: string): Promise<MegaAccountInfo> {
  try {
    const storage = await new Storage({
      email,
      password,
      keepalive: false,
    }).ready

    const info = await storage.getAccountInfo()
    const sessionData = storage.toJSON()
    const filesCount = storage.root?.children ? storage.root.children.length : 0

    storage.close()

    return {
      sessionJson: JSON.stringify(sessionData),
      spaceUsed: (info.spaceUsed ?? 0).toString(),
      spaceTotal: (info.spaceTotal ?? 20 * 1024 * 1024 * 1024).toString(),
      filesCount,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'MEGA-Authentifizierung fehlgeschlagen'
    throw new Error(`MEGA-Login fehlgeschlagen: ${msg}`)
  }
}

/**
 * Synchronisiert ein MEGA-Konto anhand der gespeicherten Sitzung.
 */
export async function syncMegaAccount(
  sessionJson: string,
): Promise<{ spaceUsed: string; spaceTotal: string; filesCount: number }> {
  try {
    const sessionData = JSON.parse(sessionJson)
    const storage = Storage.fromJSON(sessionData)
    await storage.ready

    const info = await storage.getAccountInfo()
    const filesCount = storage.root?.children ? storage.root.children.length : 0

    storage.close()

    return {
      spaceUsed: (info.spaceUsed ?? 0).toString(),
      spaceTotal: (info.spaceTotal ?? 20 * 1024 * 1024 * 1024).toString(),
      filesCount,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'MEGA-Synchronisation fehlgeschlagen'
    throw new Error(`MEGA-Sync fehlgeschlagen: ${msg}`)
  }
}
