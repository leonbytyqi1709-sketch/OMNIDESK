import { decryptJson, encryptJson } from '@/lib/crypto'

/**
 * Der Verifier ist ein bekannter Prüfwert, verschlüsselt mit dem Vault-Schlüssel.
 * Lässt er sich entschlüsseln, war das Master-Passwort korrekt – so prüfen wir
 * das Passwort, ohne je einen Hash davon zu speichern.
 *
 * Gespeichert wird EIN Base64-Blob (JSON aus ciphertext+iv), passend zur
 * Base64-Validierung der Server-Route.
 */
const VERIFIER_PLAINTEXT = { check: 'omnidesk' }

export async function createVerifier(key: CryptoKey): Promise<string> {
  const blob = await encryptJson(key, VERIFIER_PLAINTEXT)
  return btoa(JSON.stringify(blob))
}

export async function verifyKey(
  key: CryptoKey,
  verifierB64: string,
): Promise<boolean> {
  try {
    const { ciphertext, iv } = JSON.parse(atob(verifierB64)) as {
      ciphertext: string
      iv: string
    }
    const value = await decryptJson<{ check?: string }>(key, ciphertext, iv)
    return value.check === VERIFIER_PLAINTEXT.check
  } catch {
    return false
  }
}
