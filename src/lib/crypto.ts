/**
 * Client-seitige Krypto-Primitive für den Passwort-Manager (Web Crypto API).
 *
 * Sicherheitsmodell: Der Schlüssel wird per PBKDF2 aus dem Master-Passwort
 * abgeleitet und verlässt den Browser nie – der Server sieht ausschließlich
 * Base64-Ciphertext (siehe server/routes/vault.ts).
 */

export const PBKDF2_ITERATIONS = 310_000

const encoder = new TextEncoder()
const decoder = new TextDecoder()

/** ArrayBuffer/Uint8Array -> Base64-String */
export function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

/** Base64-String -> Uint8Array (explizit ArrayBuffer-basiert für crypto.subtle) */
export function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/** Frisches PBKDF2-Salt (16 Bytes) als Base64 */
export function randomSaltB64(): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(16)))
}

/**
 * Master-Passwort -> AES-256-GCM-Schlüssel.
 * Nicht extrahierbar: selbst mit DevTools lässt sich das Schlüsselmaterial
 * nicht aus dem CryptoKey-Objekt auslesen.
 */
export async function deriveKey(
  masterPassword: string,
  saltB64: string,
): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterPassword),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: fromBase64(saltB64),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

/** Beliebiges JSON verschlüsseln; IV ist pro Aufruf frisch (12 Bytes, GCM). */
export async function encryptJson(
  key: CryptoKey,
  value: unknown,
): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(JSON.stringify(value)),
  )
  return { ciphertext: toBase64(new Uint8Array(ciphertext)), iv: toBase64(iv) }
}

/** Wirft bei falschem Schlüssel/manipulierten Daten (GCM-Auth-Tag). */
export async function decryptJson<T>(
  key: CryptoKey,
  ciphertextB64: string,
  ivB64: string,
): Promise<T> {
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(ivB64) },
    key,
    fromBase64(ciphertextB64),
  )
  return JSON.parse(decoder.decode(plaintext)) as T
}
